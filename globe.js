/* ============================================================
   Bonyan HR — كرة أرضية نقطية تفاعلية (Canvas)
   تُظهر المقر الرئيسي والمكاتب بأقواس متحركة، وتدور بالسحب.
   ============================================================ */
(function () {
  'use strict';
  var RAD = Math.PI / 180;

  function decodeLand(mask) {
    var bin = atob(mask.b64), pts = [];
    for (var r = 0; r < mask.h; r++) {
      var lat = 90 - mask.step / 2 - r * mask.step;
      if (lat < -58) continue;
      var thin = Math.max(1, Math.round(1 / Math.max(0.2, Math.cos(lat * RAD))));
      for (var c = 0; c < mask.w; c++) {
        if (c % thin) continue;
        var i = r * mask.w + c;
        if (bin.charCodeAt(i >> 3) & (1 << (7 - (i & 7)))) {
          var lon = -180 + mask.step / 2 + c * mask.step;
          var p = lat * RAD, l = lon * RAD;
          pts.push([Math.cos(p) * Math.sin(l), Math.sin(p), Math.cos(p) * Math.cos(l)]);
        }
      }
    }
    return pts;
  }
  function vec(lat, lon) { var p = lat * RAD, l = lon * RAD; return [Math.cos(p) * Math.sin(l), Math.sin(p), Math.cos(p) * Math.cos(l)]; }
  function slerp(a, b, t) {
    var d = Math.acos(Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])));
    if (d < 1e-6) return a.slice();
    var s = Math.sin(d), k1 = Math.sin((1 - t) * d) / s, k2 = Math.sin(t * d) / s;
    return [a[0] * k1 + b[0] * k2, a[1] * k1 + b[1] * k2, a[2] * k1 + b[2] * k2];
  }

  window.BonyanGlobe = function (canvas, opts) {
    var ctx = canvas.getContext('2d');
    var land = decodeLand(window.LAND_MASK);
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var hq = opts.hq, offices = opts.offices || [];
    var HQ = vec(hq.lat, hq.lon);
    var arcs = offices.map(function (o, i) {
      var B = vec(o.lat, o.lon), pts = [];
      for (var k = 0; k <= 48; k++) {
        var t = k / 48, v = slerp(HQ, B, t), h = 1 + 0.22 * Math.sin(Math.PI * t);
        pts.push([v[0] * h, v[1] * h, v[2] * h]);
      }
      return { o: o, v: B, pts: pts, phase: i * 0.21 };
    });
    var rotL = (opts.centerLon || 60) * RAD, tilt = -(opts.tilt || 12) * RAD;
    var baseL = rotL, drag = null, vel = 0, t0 = performance.now(), running = true, raf = 0;
    var W = 0, H = 0, R = 0, dpr = 1, cx = 0, cy = 0;
    var hover = null;
    var tip = opts.tip;

    function size() {
      var r = canvas.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      R = Math.min(W, H) * 0.43; cx = W / 2; cy = H / 2;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function proj(v) {
      var cl = Math.cos(rotL), sl = Math.sin(rotL);
      var x = v[0] * cl - v[2] * sl, z = v[0] * sl + v[2] * cl, y = v[1];
      var ct = Math.cos(tilt), st = Math.sin(tilt);
      var y2 = y * ct - z * st, z2 = y * st + z * ct;
      return [cx + R * x, cy - R * y2, z2];
    }
    function frame(now) {
      var t = (now - t0) / 1000;
      if (!drag) {
        if (Math.abs(vel) > 0.0001) { rotL += vel; vel *= 0.95; baseL = rotL; }
        else if (!reduce) { var target = (opts.centerLon || 60) * RAD + Math.sin(t * 0.12) * 0.26; baseL += (target - baseL) * 0.012; rotL = baseL; }
      }
      ctx.clearRect(0, 0, W, H);
      var g = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R * 1.05);
      g.addColorStop(0, 'rgba(70,120,175,.35)'); g.addColorStop(1, 'rgba(12,35,62,.05)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(213,176,108,.28)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, R + 0.5, 0, Math.PI * 2); ctx.stroke();
      var ds = Math.max(1, R / 170);
      for (var i = 0; i < land.length; i++) {
        var p = proj(land[i]);
        if (p[2] <= 0) continue;
        ctx.fillStyle = 'rgba(200,222,245,' + (0.28 + p[2] * 0.68).toFixed(3) + ')';
        ctx.fillRect(p[0] - ds / 2, p[1] - ds / 2, ds * 1.1, ds * 1.1);
      }
      arcs.forEach(function (a) {
        var cyc = reduce ? 1 : ((t * 0.32 + a.phase) % 1.4) / 1.1;
        var head = Math.min(1, cyc), n = a.pts.length - 1;
        ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(213,176,108,.22)';
        ctx.beginPath(); var on = false;
        for (var k = 0; k <= n; k++) { var q = proj(a.pts[k]); if (q[2] > -0.15) { on ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); on = true; } else on = false; }
        ctx.stroke();
        var from = Math.max(0, head - 0.35), k0 = Math.floor(from * n), k1 = Math.floor(head * n);
        ctx.lineWidth = 2; ctx.lineCap = 'round';
        for (var j = k0; j < k1; j++) {
          var p1 = proj(a.pts[j]), p2 = proj(a.pts[j + 1]);
          if (p1[2] < -0.15) continue;
          ctx.strokeStyle = 'rgba(232,196,128,' + (0.15 + 0.85 * (j - k0) / Math.max(1, k1 - k0)).toFixed(3) + ')';
          ctx.beginPath(); ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.stroke();
        }
        a.screen = proj(a.v);
        if (a.screen[2] > 0) {
          var pulse = reduce ? 0 : ((t * 0.9 + a.phase * 3) % 1);
          ctx.strokeStyle = 'rgba(232,196,128,' + (0.6 * (1 - pulse)).toFixed(3) + ')';
          ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(a.screen[0], a.screen[1], 3 + pulse * 10, 0, Math.PI * 2); ctx.stroke();
          ctx.fillStyle = hover === a ? '#FFFFFF' : '#E8C480';
          ctx.beginPath(); ctx.arc(a.screen[0], a.screen[1], hover === a ? 4.5 : 3.2, 0, Math.PI * 2); ctx.fill();
        }
      });
      var h = proj(HQ);
      if (h[2] > 0) {
        var hp = reduce ? 0 : (t * 0.7) % 1;
        ctx.strokeStyle = 'rgba(255,255,255,' + (0.7 * (1 - hp)).toFixed(3) + ')';
        ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(h[0], h[1], 5 + hp * 16, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(h[0], h[1], 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#9C7432'; ctx.beginPath(); ctx.arc(h[0], h[1], 2.4, 0, Math.PI * 2); ctx.fill();
      }
      if (tip && hover && hover.screen && hover.screen[2] > 0) {
        tip.hidden = false;
        tip.textContent = opts.label(hover.o);
        tip.style.transform = 'translate(' + Math.round(hover.screen[0]) + 'px,' + Math.round(hover.screen[1] - 14) + 'px) translate(-50%,-100%)';
      } else if (tip && hoverHQ && h[2] > 0) {
        tip.hidden = false;
        tip.textContent = opts.label(hq);
        tip.style.transform = 'translate(' + Math.round(h[0]) + 'px,' + Math.round(h[1] - 16) + 'px) translate(-50%,-100%)';
      } else if (tip) tip.hidden = true;
      if (running) raf = requestAnimationFrame(frame);
    }
    var hoverHQ = false;
    function pos(e) { var r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
    canvas.addEventListener('pointerdown', function (e) { drag = { x: pos(e)[0], l: rotL }; vel = 0; canvas.setPointerCapture(e.pointerId); canvas.classList.add('grab'); });
    canvas.addEventListener('pointermove', function (e) {
      var p = pos(e);
      if (drag) { var nl = drag.l - (p[0] - drag.x) / R; vel = nl - rotL; rotL = nl; baseL = rotL; return; }
      hover = null; hoverHQ = false;
      arcs.forEach(function (a) { if (a.screen && a.screen[2] > 0 && Math.hypot(a.screen[0] - p[0], a.screen[1] - p[1]) < 14) hover = a; });
      if (!hover) { var h = proj(HQ); hoverHQ = h[2] > 0 && Math.hypot(h[0] - p[0], h[1] - p[1]) < 14; }
      canvas.style.cursor = hover || hoverHQ ? 'pointer' : 'grab';
    });
    function end() { drag = null; canvas.classList.remove('grab'); }
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('pointerleave', function () { hover = null; hoverHQ = false; });

    size();
    if (window.ResizeObserver) new ResizeObserver(size).observe(canvas);
    var io = window.IntersectionObserver ? new IntersectionObserver(function (en) {
      var vis = en[0].isIntersecting;
      if (vis && !running) { running = true; raf = requestAnimationFrame(frame); }
      if (!vis) { running = false; cancelAnimationFrame(raf); }
    }) : null;
    if (io) io.observe(canvas);
    raf = requestAnimationFrame(frame);
    return { destroy: function () { running = false; cancelAnimationFrame(raf); if (io) io.disconnect(); } };
  };
})();
