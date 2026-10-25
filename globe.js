/* ============================================================
   Bonyan HR — الكرة الأرضية التفاعلية (Canvas)
   - نقاط اليابسة، المقر الرئيسي، المكاتب بأقواس ذهبية متحركة
   - دول المنسوبين المسجلين (نقاط فقط، بلا أي تفاصيل شخصية)
   - دولة المنسوب الحالي تظهر فورًا أثناء التعبئة وتدور الكرة إليها
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
          pts.push(vec(lat, lon));
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
  function arcPts(A, B, lift) {
    var pts = [];
    for (var k = 0; k <= 48; k++) {
      var t = k / 48, v = slerp(A, B, t), h = 1 + lift * Math.sin(Math.PI * t);
      pts.push([v[0] * h, v[1] * h, v[2] * h]);
    }
    return pts;
  }
  var CENT = function (cc) { var c = (window.COUNTRY_CENTROIDS || {})[cc]; return c ? { lat: c[0], lon: c[1] } : null; };

  window.BonyanGlobe = function (canvas, opts) {
    var ctx = canvas.getContext('2d');
    var land = decodeLand(window.LAND_MASK);
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var hq = opts.hq, HQ = vec(hq.lat, hq.lon);
    var compact = !!opts.compact;
    var arcs = (opts.offices || []).map(function (o, i) {
      var B = vec(o.lat, o.lon);
      return { o: o, v: B, pts: arcPts(HQ, B, 0.22), phase: i * 0.23 };
    });
    var points = [];
    var user = null;
    var centerLon = (opts.centerLon || 50) * RAD, centerTilt = (opts.tilt || 14) * RAD;
    var rotL = centerLon, tilt = centerTilt;
    var drag = null, vel = 0, t0 = performance.now(), running = true, raf = 0, userDrag = 0;
    var W = 0, H = 0, R = 0, dpr = 1, cx = 0, cy = 0;
    var hover = null, tip = opts.tip;

    function size() {
      var r = canvas.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      R = Math.min(W, H) * (compact ? 0.44 : 0.43); cx = W / 2; cy = H / 2;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function proj(v) {
      var cl = Math.cos(rotL), sl = Math.sin(rotL);
      var x = v[0] * cl - v[2] * sl, z = v[0] * sl + v[2] * cl, y = v[1];
      var ct = Math.cos(tilt), st = Math.sin(tilt);
      var y2 = y * ct - z * st, z2 = y * st + z * ct;
      return [cx + R * x, cy - R * y2, z2];
    }
    function strokeArc(pts, t, phase, alphaBase) {
      var n = pts.length - 1;
      ctx.lineWidth = 1.1; ctx.strokeStyle = 'rgba(217,182,127,' + alphaBase + ')';
      ctx.beginPath(); var on = false;
      for (var k = 0; k <= n; k++) { var q = proj(pts[k]); if (q[2] > -0.12) { on ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); on = true; } else on = false; }
      ctx.stroke();
      if (reduce) return;
      var head = Math.min(1, ((t * 0.32 + phase) % 1.4) / 1.1);
      var k0 = Math.floor(Math.max(0, head - 0.35) * n), k1 = Math.floor(head * n);
      ctx.lineWidth = 2; ctx.lineCap = 'round';
      for (var j = k0; j < k1; j++) {
        var p1 = proj(pts[j]), p2 = proj(pts[j + 1]);
        if (p1[2] < -0.12) continue;
        ctx.strokeStyle = 'rgba(240,214,166,' + (0.15 + 0.85 * (j - k0) / Math.max(1, k1 - k0)).toFixed(3) + ')';
        ctx.beginPath(); ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.stroke();
      }
    }
    function frame(now) {
      var t = (now - t0) / 1000;
      if (!drag) {
        if (Math.abs(vel) > 0.0001) { rotL += vel; vel *= 0.95; userDrag = now; }
        else if (now - userDrag > 2500) {
          var targetL = (user ? user.lon * RAD : centerLon) + (reduce || user ? 0 : Math.sin(t * 0.12) * 0.24);
          var targetT = user ? Math.max(-35, Math.min(35, user.lat)) * RAD * 0.8 : centerTilt;
          var dl = targetL - rotL;
          while (dl > Math.PI) dl -= 2 * Math.PI;
          while (dl < -Math.PI) dl += 2 * Math.PI;
          rotL += dl * (user ? 0.045 : 0.012);
          tilt += (targetT - tilt) * 0.04;
        }
      }
      ctx.clearRect(0, 0, W, H);
      var halo = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.25);
      halo.addColorStop(0, 'rgba(217,182,127,.16)'); halo.addColorStop(1, 'rgba(217,182,127,0)');
      ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(cx, cy, R * 1.25, 0, Math.PI * 2); ctx.fill();
      var g = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.45, R * 0.05, cx, cy, R);
      g.addColorStop(0, '#3D4A82'); g.addColorStop(0.55, '#2B3155'); g.addColorStop(1, '#1A1E3A');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(217,182,127,.45)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
      var ds = Math.max(1.1, R / 165);
      for (var i = 0; i < land.length; i++) {
        var p = proj(land[i]);
        if (p[2] <= 0) continue;
        ctx.fillStyle = 'rgba(226,232,250,' + (0.22 + p[2] * 0.7).toFixed(3) + ')';
        ctx.fillRect(p[0] - ds / 2, p[1] - ds / 2, ds, ds);
      }
      arcs.forEach(function (a) {
        strokeArc(a.pts, t, a.phase, 0.25);
        a.screen = proj(a.v);
        if (a.screen[2] > 0) {
          var pulse = reduce ? 0 : ((t * 0.9 + a.phase * 3) % 1);
          ctx.strokeStyle = 'rgba(217,182,127,' + (0.7 * (1 - pulse)).toFixed(3) + ')';
          ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(a.screen[0], a.screen[1], 3 + pulse * 10, 0, Math.PI * 2); ctx.stroke();
          ctx.fillStyle = hover === a ? '#FFFFFF' : '#D9B67F';
          ctx.fillRect(a.screen[0] - 3.2, a.screen[1] - 3.2, 6.4, 6.4);
        }
      });
      points.forEach(function (pt, i) {
        var q = proj(pt.v); pt.screen = q;
        if (q[2] <= 0) return;
        var r0 = 2 + Math.min(5, Math.log2(1 + pt.n) * 1.4);
        var tw = reduce ? 1 : 0.65 + 0.35 * Math.sin(t * 2 + i);
        ctx.fillStyle = 'rgba(240,214,166,' + (0.25 * tw).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(q[0], q[1], r0 * 2.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#F0D6A6'; ctx.beginPath(); ctx.arc(q[0], q[1], r0 * 0.7, 0, Math.PI * 2); ctx.fill();
      });
      if (user) {
        strokeArc(user.pts, t * 1.3, 0, 0.5);
        var u = proj(user.v); user.screen = u;
        if (u[2] > 0) {
          var age = Math.min(1, (now - user.at) / 700), up = reduce ? 0.4 : (t * 0.8) % 1;
          ctx.strokeStyle = 'rgba(255,255,255,' + (0.8 * (1 - up)).toFixed(3) + ')';
          ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(u[0], u[1], 6 + up * 20, 0, Math.PI * 2); ctx.stroke();
          var s = 7 * (age < 1 ? 1 + (1 - age) * 1.5 : 1);
          ctx.fillStyle = '#D9B67F'; ctx.beginPath(); ctx.arc(u[0], u[1], s, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(u[0], u[1], s * 0.45, 0, Math.PI * 2); ctx.fill();
          if (user.label) {
            ctx.font = '600 ' + (compact ? 12 : 13) + 'px "Alexandria", "IBM Plex Sans Arabic", sans-serif';
            var tw2 = ctx.measureText(user.label).width + 18, lx = Math.max(4, Math.min(W - tw2 - 4, u[0] - tw2 / 2)), ly = u[1] - 38;
            ctx.globalAlpha = age;
            ctx.fillStyle = 'rgba(255,255,255,.96)';
            roundRect(lx, ly, tw2, 24, 12); ctx.fill();
            ctx.fillStyle = '#2B3155'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(user.label, lx + tw2 / 2, ly + 12.5);
            ctx.globalAlpha = 1;
          }
        }
      }
      var h = proj(HQ);
      if (h[2] > 0) {
        var hp = reduce ? 0 : (t * 0.7) % 1;
        ctx.strokeStyle = 'rgba(255,255,255,' + (0.7 * (1 - hp)).toFixed(3) + ')';
        ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(h[0], h[1], 5 + hp * 16, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(h[0] - 5, h[1] - 5, 10, 10);
        ctx.fillStyle = '#D9B67F'; ctx.fillRect(h[0] - 2.5, h[1] - 2.5, 5, 5);
      }
      if (tip) {
        var tgt = null, txt = '';
        if (hover && hover.screen && hover.screen[2] > 0) { tgt = hover.screen; txt = hover.label || opts.label(hover.o || hover); }
        else if (hoverHQ && h[2] > 0) { tgt = h; txt = opts.label(hq); }
        if (tgt) { tip.hidden = false; tip.textContent = txt; tip.style.transform = 'translate(' + Math.round(tgt[0]) + 'px,' + Math.round(tgt[1] - 14) + 'px) translate(-50%,-100%)'; }
        else tip.hidden = true;
      }
      if (running) raf = requestAnimationFrame(frame);
    }
    function roundRect(x, y, w, h, r) {
      ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
    }
    var hoverHQ = false;
    function pos(e) { var r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
    canvas.addEventListener('pointerdown', function (e) { drag = { x: pos(e)[0], y: pos(e)[1], l: rotL, t: tilt }; vel = 0; canvas.setPointerCapture(e.pointerId); canvas.classList.add('grab'); });
    canvas.addEventListener('pointermove', function (e) {
      var p = pos(e);
      if (drag) {
        var nl = drag.l - (p[0] - drag.x) / R; vel = nl - rotL; rotL = nl;
        tilt = Math.max(-0.9, Math.min(0.9, drag.t + (p[1] - drag.y) / R * 0.6));
        userDrag = performance.now(); return;
      }
      hover = null; hoverHQ = false;
      arcs.concat(points).forEach(function (a) { if (a.screen && a.screen[2] > 0 && Math.hypot(a.screen[0] - p[0], a.screen[1] - p[1]) < 12) hover = a; });
      if (!hover) { var h = proj(HQ); hoverHQ = h[2] > 0 && Math.hypot(h[0] - p[0], h[1] - p[1]) < 12; }
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

    return {
      setUser: function (cc, label) {
        var c = cc && CENT(cc);
        if (!c) { user = null; return; }
        if (user && user.cc === cc) { user.label = label; return; }
        var v = vec(c.lat, c.lon);
        user = { cc: cc, lat: c.lat, lon: c.lon, v: v, label: label, pts: arcPts(HQ, v, 0.3), at: performance.now() };
        userDrag = 0;
      },
      setPoints: function (map, labelFn) {
        points = Object.keys(map || {}).map(function (cc) {
          var c = CENT(cc); if (!c) return null;
          return { cc: cc, n: map[cc], v: vec(c.lat, c.lon), label: labelFn ? labelFn(cc, map[cc]) : cc };
        }).filter(Boolean);
      },
      destroy: function () { running = false; cancelAnimationFrame(raf); if (io) io.disconnect(); }
    };
  };
})();
