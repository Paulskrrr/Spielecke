// © 2026 Paul Spieker — All rights reserved. Proprietary; do not copy or redistribute.
/*
 * games/shapefit.js — the geometry behind Perfect Shape
 *
 * Turns "how close is this freehand scribble to a real pentagon?" into one
 * number. Kept apart from the game's screens because it's pure maths with no
 * DOM in it — you can call it from the console on a set of strokes and get the
 * same answer the ranking shows.
 *
 * THE IDEA
 *   1. GENERATE the ideal shape as an outline (GENERATORS below).
 *   2. NORMALISE both the ideal shape and the attempt: resample to evenly
 *      spaced points, move the centroid to 0, scale so the RMS radius is 1.
 *      That's what makes position and size irrelevant — only form is left.
 *   3. FIT the attempt onto the ideal one by searching rotation, a little extra
 *      scale and a little extra shift (coarse grid, then two refinements).
 *   4. MEASURE the two-way average distance between the curves (a symmetric
 *      chamfer distance): every point of the attempt to the nearest bit of the
 *      ideal outline AND back again. The way back is what stops half a circle,
 *      or a scribble that merely covers the shape, from scoring well.
 *   5. MAP that error onto 0–100 %.
 *
 * Rotation is deliberately NOT free: a square rotated 45° is a diamond, and the
 * game asks for one or the other. Only shapes where orientation is meaningless
 * (the circle, the straight line) may spin freely.
 *
 * Coordinates are flat number arrays — [x0, y0, x1, y1, …] — everywhere, in
 * canvas space (y grows downwards), which is also how the game records strokes.
 */
(function (global) {
  "use strict";

  var DRAW_N = 48;   // points an attempt is resampled to
  var TPL_N = 96;    // points the ideal outline is resampled to
  var MIN_LEN = 20;  // px of ink below which an attempt doesn't count as a try
  var ROT_TOL = 16;  // degrees of rotation forgiven on orientation-bound shapes

  // How the error (in units of RMS radius) becomes a percentage:
  //   score = 100 · e^−(err / ERR_SCALE)^ERR_POW
  // Calibrated against simulated attempts of every shape (PARTY-APP-SPEC §3.29):
  // a near-traced outline lands around 97, a careful freehand one in the high
  // 80s, a wobbly one near 70, an attempt that's clearly a different shape (a
  // square where a circle was asked) around 50, and one that shares nothing
  // with the target in single digits. 100 % is unreachable in practice, which
  // is the point.
  var ERR_SCALE = 0.125;
  var ERR_POW = 1.13;

  // --- Outline generators ---------------------------------------------------
  // Each returns subpaths [{ pts: flat coords, closed: bool }] in any convenient
  // size — normalisation takes care of scale. y points down (canvas space), so
  // negative y is "up".
  var GENERATORS = {
    circle: function () { return [{ pts: arc(0, 0, 1, 1, 0, 2 * Math.PI, 72), closed: true }]; },
    oval: function () { return [{ pts: arc(0, 0, 1, 0.5, 0, 2 * Math.PI, 72), closed: true }]; },
    square: function () { return [{ pts: [-1, -1, 1, -1, 1, 1, -1, 1], closed: true }]; },
    rect: function () { return [{ pts: [-1, -0.5, 1, -0.5, 1, 0.5, -1, 0.5], closed: true }]; },
    diamond: function () { return [{ pts: [0, -1, 1, 0, 0, 1, -1, 0], closed: true }]; },
    line: function () { return [{ pts: [-1, 0, 1, 0], closed: false }]; },
    // Two strokes, like anybody actually draws a plus sign.
    cross: function () {
      return [{ pts: [-1, 0, 1, 0], closed: false }, { pts: [0, -1, 0, 1], closed: false }];
    },
    polygon: function (s) {
      var n = Math.max(3, s.n || 5), pts = [];
      for (var i = 0; i < n; i++) {
        var a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
        pts.push(Math.cos(a), Math.sin(a));
      }
      return [{ pts: pts, closed: true }];
    },
    star: function (s) {
      var n = Math.max(3, s.n || 5), inner = 0.382, pts = [];
      for (var i = 0; i < n * 2; i++) {
        var r = i % 2 === 0 ? 1 : inner;
        var a = -Math.PI / 2 + (i * Math.PI) / n;
        pts.push(r * Math.cos(a), r * Math.sin(a));
      }
      return [{ pts: pts, closed: true }];
    },
    // Dome on top, flat edge along the bottom.
    semicircle: function () { return [{ pts: arc(0, 0, 1, 1, Math.PI, 2 * Math.PI, 40), closed: true }]; },
    heart: function () {
      var pts = [];
      for (var i = 0; i <= 80; i++) {
        var a = (i / 80) * 2 * Math.PI;
        var x = 16 * Math.pow(Math.sin(a), 3);
        var y = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a);
        pts.push(x / 16, -y / 16);
      }
      return [{ pts: pts, closed: true }];
    },
    // Archimedean, starting just off the centre so the first turn is drawable.
    spiral: function (s) {
      var turns = s.turns || 3, steps = Math.round(turns * 40), pts = [];
      for (var i = 0; i <= steps; i++) {
        var f = i / steps;
        var a = f * turns * 2 * Math.PI;
        var r = 0.08 + 0.92 * f;
        pts.push(r * Math.cos(a), r * Math.sin(a));
      }
      return [{ pts: pts, closed: false }];
    },
    // Lemniscate of Gerono — a clean figure eight, twice as wide as it is tall.
    infinity: function () {
      var pts = [];
      for (var i = 0; i <= 80; i++) {
        var a = (i / 80) * 2 * Math.PI;
        pts.push(Math.cos(a), Math.sin(a) * Math.cos(a));
      }
      return [{ pts: pts, closed: true }];
    },
    wave: function (s) {
      var waves = s.waves || 2, steps = 80, pts = [];
      for (var i = 0; i <= steps; i++) {
        var x = -1 + (2 * i) / steps;
        pts.push(x, 0.3 * Math.sin(waves * Math.PI * (x + 1)));
      }
      return [{ pts: pts, closed: false }];
    },
    zigzag: function (s) {
      var n = Math.max(2, s.n || 5), pts = [];
      for (var i = 0; i <= n; i++) {
        pts.push(-1 + (2 * i) / n, i % 2 === 0 ? -0.5 : 0.5);
      }
      return [{ pts: pts, closed: false }];
    },
    arrow: function () {
      return [{ pts: [-1, -0.25, 0.2, -0.25, 0.2, -0.62, 1, 0, 0.2, 0.62, 0.2, 0.25, -1, 0.25], closed: true }];
    },
    // Outer circle minus a smaller one shoved to the right; the two arcs meet
    // at the horns.
    crescent: function () {
      var R = 1, r = 0.85, d = 0.45;
      var xi = (R * R - r * r + d * d) / (2 * d);         // x of the horns
      var yi = Math.sqrt(Math.max(0, R * R - xi * xi));
      var ao = Math.atan2(yi, xi);                        // horn angle, outer circle
      var ai = Math.atan2(yi, xi - d);                    // horn angle, inner circle
      var outer = arc(0, 0, R, R, ao, 2 * Math.PI - ao, 44);
      var inner = arc(d, 0, r, r, -ai, -(2 * Math.PI - ai), 40);
      return [{ pts: outer.concat(inner), closed: true }];
    },
  };

  // Sample an (elliptical) arc from a0 to a1 — a1 may be smaller for a
  // clockwise sweep.
  function arc(cx, cy, rx, ry, a0, a1, steps) {
    var pts = [];
    for (var i = 0; i <= steps; i++) {
      var a = a0 + ((a1 - a0) * i) / steps;
      pts.push(cx + rx * Math.cos(a), cy + ry * Math.sin(a));
    }
    return pts;
  }

  // --- Polyline plumbing ----------------------------------------------------
  function pathLength(pts, closed) {
    var L = 0;
    for (var i = 2; i < pts.length; i += 2) L += Math.hypot(pts[i] - pts[i - 2], pts[i + 1] - pts[i - 1]);
    if (closed && pts.length >= 4) L += Math.hypot(pts[0] - pts[pts.length - 2], pts[1] - pts[pts.length - 1]);
    return L;
  }

  // n evenly spaced points along a polyline (walking its arc length).
  function resample(pts, closed, n) {
    var src = pts.slice();
    if (closed && pts.length >= 4) src.push(pts[0], pts[1]);
    var out = [];
    if (src.length < 4) {
      for (var k = 0; k < n; k++) out.push(src[0] || 0, src[1] || 0);
      return out;
    }
    var L = pathLength(src, false);
    if (L === 0) {
      for (var m = 0; m < n; m++) out.push(src[0], src[1]);
      return out;
    }
    var stepLen = L / (n - 1);
    out.push(src[0], src[1]);
    var i = 2, walked = 0, px = src[0], py = src[1];
    for (var j = 1; j < n - 1; j++) {
      var target = j * stepLen;
      while (i < src.length) {
        var d = Math.hypot(src[i] - px, src[i + 1] - py);
        if (walked + d >= target || i + 2 >= src.length) {
          var f = d === 0 ? 0 : (target - walked) / d;
          if (f > 1) f = 1;
          out.push(px + (src[i] - px) * f, py + (src[i + 1] - py) * f);
          break;
        }
        walked += d; px = src[i]; py = src[i + 1]; i += 2;
      }
      if (i >= src.length) out.push(src[src.length - 2], src[src.length - 1]);
    }
    out.push(src[src.length - 2], src[src.length - 1]);
    return out;
  }

  // Resample a set of subpaths to `total` points, split by their share of the
  // overall length. Returns the flat points plus the index spans that say which
  // points belong to the same stroke (so segments never bridge two strokes).
  function sampleAll(subs, total) {
    var lens = subs.map(function (s) { return pathLength(s.pts, s.closed); });
    var sum = lens.reduce(function (a, b) { return a + b; }, 0);
    var pts = [], spans = [];
    subs.forEach(function (sub, i) {
      var n = sum > 0 ? Math.round((total * lens[i]) / sum) : Math.floor(total / subs.length);
      if (n < 2) n = 2;
      var r = resample(sub.pts, sub.closed, n);
      spans.push([pts.length / 2, n]);
      pts = pts.concat(r);
    });
    return { pts: pts, spans: spans };
  }

  function segsFrom(pts, spans) {
    var segs = [];
    spans.forEach(function (sp) {
      var start = sp[0], n = sp[1];
      if (n < 2) { // a lone point still needs to be reachable: a zero-length segment
        segs.push(pts[start * 2], pts[start * 2 + 1], pts[start * 2], pts[start * 2 + 1]);
        return;
      }
      for (var i = 0; i < n - 1; i++) {
        var a = (start + i) * 2, b = (start + i + 1) * 2;
        segs.push(pts[a], pts[a + 1], pts[b], pts[b + 1]);
      }
    });
    return segs;
  }

  function distSqToSeg(px, py, ax, ay, bx, by) {
    var vx = bx - ax, vy = by - ay;
    var len2 = vx * vx + vy * vy;
    var tt = len2 > 0 ? ((px - ax) * vx + (py - ay) * vy) / len2 : 0;
    if (tt < 0) tt = 0; else if (tt > 1) tt = 1;
    var dx = px - (ax + tt * vx), dy = py - (ay + tt * vy);
    return dx * dx + dy * dy;
  }

  // Average distance from each point to the nearest of the segments.
  function meanDist(pts, segs, count) {
    var n = count === undefined ? pts.length / 2 : count;
    if (!n || !segs.length) return Infinity;
    var sum = 0;
    for (var i = 0; i < n; i++) {
      var px = pts[i * 2], py = pts[i * 2 + 1], best = Infinity;
      for (var j = 0; j < segs.length; j += 4) {
        var d = distSqToSeg(px, py, segs[j], segs[j + 1], segs[j + 2], segs[j + 3]);
        if (d < best) best = d;
      }
      sum += Math.sqrt(best);
    }
    return sum / n;
  }

  // Two-way average distance between the attempt and the ideal outline.
  function chamfer(aPts, aSegs, aN, bPts, bSegs, bN) {
    return 0.5 * (meanDist(aPts, bSegs, aN) + meanDist(bPts, aSegs, bN));
  }

  // --- Normalisation & fitting ---------------------------------------------
  // Centroid to the origin, RMS radius to 1. Returns null for something with no
  // extent at all (a single tap), which can't be scored.
  function normalise(pts) {
    var n = pts.length / 2, i, cx = 0, cy = 0;
    if (!n) return null;
    for (i = 0; i < n; i++) { cx += pts[i * 2]; cy += pts[i * 2 + 1]; }
    cx /= n; cy /= n;
    var s2 = 0;
    for (i = 0; i < n; i++) {
      var dx = pts[i * 2] - cx, dy = pts[i * 2 + 1] - cy;
      s2 += dx * dx + dy * dy;
    }
    var r = Math.sqrt(s2 / n);
    if (!(r > 1e-6)) return null;
    var out = new Array(pts.length);
    for (i = 0; i < n; i++) {
      out[i * 2] = (pts[i * 2] - cx) / r;
      out[i * 2 + 1] = (pts[i * 2 + 1] - cy) / r;
    }
    return { pts: out, cx: cx, cy: cy, r: r };
  }

  function template(shape) {
    var gen = GENERATORS[shape.gen] || GENERATORS.circle;
    var subs = gen(shape);
    var sampled = sampleAll(subs, TPL_N);
    var norm = normalise(sampled.pts);
    var maxX = 0, maxY = 0, i;
    for (i = 0; i < norm.pts.length; i += 2) {
      maxX = Math.max(maxX, Math.abs(norm.pts[i]));
      maxY = Math.max(maxY, Math.abs(norm.pts[i + 1]));
    }
    // The outline as drawn on screen, through the same normalisation, so the
    // ghost shape and the fitted attempts share one coordinate space.
    var drawSubs = subs.map(function (sub) {
      var p = new Array(sub.pts.length);
      for (var k = 0; k < sub.pts.length; k += 2) {
        p[k] = (sub.pts[k] - norm.cx) / norm.r;
        p[k + 1] = (sub.pts[k + 1] - norm.cy) / norm.r;
      }
      return { pts: p, closed: sub.closed };
    });
    return {
      key: shape.key,
      subs: drawSubs,
      pts: norm.pts,
      spans: sampled.spans,
      segs: segsFrom(norm.pts, sampled.spans),
      n: norm.pts.length / 2,
      maxX: maxX || 1,
      maxY: maxY || 1,
    };
  }

  // Search rotation / extra scale / extra shift for the placement that puts the
  // attempt closest to the ideal outline. Coarse grid first, then two shrinking
  // refinements around the best hit so far.
  function fit(dpts, dspans, tpl, freeRot) {
    var n = dpts.length / 2;
    var tmp = new Array(dpts.length);
    var best = { err: Infinity, a: 0, s: 1, dx: 0, dy: 0 };

    function evaluate(a, s, dx, dy) {
      var ca = Math.cos(a) * s, sa = Math.sin(a) * s;
      for (var i = 0; i < n; i++) {
        var x = dpts[i * 2], y = dpts[i * 2 + 1];
        tmp[i * 2] = x * ca - y * sa + dx;
        tmp[i * 2 + 1] = x * sa + y * ca + dy;
      }
      var segs = segsFrom(tmp, dspans);
      var err = chamfer(tmp, segs, n, tpl.pts, tpl.segs, tpl.n);
      if (err < best.err) { best.err = err; best.a = a; best.s = s; best.dx = dx; best.dy = dy; }
    }

    function sweep(angles, scales, dxs, dys) {
      for (var i = 0; i < angles.length; i++)
        for (var j = 0; j < scales.length; j++)
          for (var k = 0; k < dxs.length; k++)
            for (var m = 0; m < dys.length; m++) evaluate(angles[i], scales[j], dxs[k], dys[m]);
    }

    var rad = Math.PI / 180;
    var coarseStep = freeRot ? 10 : 4;
    var angles = [];
    if (freeRot) { for (var a = -180; a < 180; a += coarseStep) angles.push(a * rad); }
    else { for (var b = -ROT_TOL; b <= ROT_TOL; b += coarseStep) angles.push(b * rad); }
    sweep(angles, [0.9, 1, 1.1], [0], [0]);

    var around = function (c, step) { return [c - step, c - step / 2, c, c + step / 2, c + step]; };
    sweep(around(best.a, coarseStep * rad), around(best.s, 0.06).map(clampScale),
      [best.dx - 0.06, best.dx, best.dx + 0.06], [best.dy - 0.06, best.dy, best.dy + 0.06]);
    sweep(around(best.a, coarseStep * 0.3 * rad), around(best.s, 0.02).map(clampScale),
      [best.dx - 0.02, best.dx, best.dx + 0.02], [best.dy - 0.02, best.dy, best.dy + 0.02]);
    return best;
  }

  function clampScale(s) { return Math.max(0.6, Math.min(1.6, s)); }

  function errToScore(err) {
    var v = 100 * Math.exp(-Math.pow(Math.max(0, err) / ERR_SCALE, ERR_POW));
    if (!isFinite(v) || v < 0) return 0;
    return Math.min(100, v);
  }

  // Score a set of raw strokes (flat [x, y, …] each, canvas px) against a
  // template. Returns null when there's not enough ink to judge.
  function score(strokes, tpl, freeRot) {
    if (!strokes || !strokes.length) return null;
    var subs = strokes
      .filter(function (s) { return s && s.length >= 2; })
      .map(function (s) { return { pts: s, closed: false }; });
    if (!subs.length) return null;
    var ink = subs.reduce(function (acc, s) { return acc + pathLength(s.pts, false); }, 0);
    if (ink < MIN_LEN) return null;

    var sampled = sampleAll(subs, DRAW_N);
    var norm = normalise(sampled.pts);
    if (!norm) return null;

    var best = fit(norm.pts, sampled.spans, tpl, freeRot);
    return {
      score: errToScore(best.err),
      err: best.err,
      // Everything needed to replay the raw strokes in the template's space.
      fit: { a: best.a, s: best.s, dx: best.dx, dy: best.dy, cx: norm.cx, cy: norm.cy, r: norm.r },
    };
  }

  // Put a raw canvas point into the template's normalised space.
  function place(x, y, f) {
    var nx = (x - f.cx) / f.r, ny = (y - f.cy) / f.r;
    var ca = Math.cos(f.a) * f.s, sa = Math.sin(f.a) * f.s;
    return [nx * ca - ny * sa + f.dx, nx * sa + ny * ca + f.dy];
  }

  // Orientation is meaningless for these two, so let them spin.
  function freeRotation(shape) {
    return shape.gen === "circle" || shape.gen === "line";
  }

  global.Spielecke = global.Spielecke || {};
  global.Spielecke.ShapeFit = {
    template: template,
    score: score,
    place: place,
    freeRotation: freeRotation,
    errToScore: errToScore,
    GENERATORS: GENERATORS,
  };
})(window);
