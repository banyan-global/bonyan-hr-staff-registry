/* ============================================================
   Bonyan HR — الكرة الأرضية التفاعلية (Canvas)
   على نمط خريطة إثيوبيا: يابسة فاتحة مصمتة فوق محيط كحلي غامق،
   ودوائر ذهبية لكل دولة فيها عدد المنسوبين، وشارة بعدد الجنسيات.
   - المقر الرئيسي في جدة فقط، تخرج منه أقواس ذهبية متحركة إلى الدول
   - دولة المنسوب الحالي تظهر فورًا أثناء التعبئة وتدور الكرة إليها
   - الأرقام مجمّعة فقط، بلا أي بيانات شخصية
   ============================================================ */
(function () {
  'use strict';
  var RAD = Math.PI / 180;

  function vec(lat, lon) { var p = lat * RAD, l = lon * RAD; return [Math.cos(p) * Math.sin(l), Math.sin(p), Math.cos(p) * Math.cos(l)]; }
  /* قناع اليابسة (٠٫٥°) يُقرأ كصورة ويُرسم على الكرة بكسلًا بكسلًا بحواف ناعمة */
  function decodeMask(mask) {
    var bin = atob(mask.b64), n = mask.w * mask.h, a = new Uint8Array(n);
    for (var i = 0; i < n; i++) a[i] = (bin.charCodeAt(i >> 3) >> (7 - (i & 7))) & 1;
    return { a: a, w: mask.w, h: mask.h, step: mask.step };
  }
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
  var GRID = (function () {
    var lines = [], k, j, pts;
    for (k = -60; k <= 60; k += 30) { pts = []; for (j = -180; j <= 180; j += 4) pts.push(vec(k, j)); lines.push(pts); }
    for (j = -180; j < 180; j += 30) { pts = []; for (k = -84; k <= 84; k += 4) pts.push(vec(k, j)); lines.push(pts); }
    return lines;
  })();
  var CENT = function (cc) { var c = (window.COUNTRY_CENTROIDS || {})[cc]; return c ? { lat: c[0], lon: c[1] } : null; };
  var FONT = '"Tajawal", "Geeza Pro", system-ui, sans-serif';
  function ease(x) { return x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x); }

  window.BonyanGlobe = function (canvas, opts) {
    var ctx = canvas.getContext('2d');
    var M = decodeMask(window.LAND_MASK);
    var off = document.createElement('canvas'), octx = off.getContext('2d'), N = 0, img = null, PX, PY, PZ, PI_ = null;
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var hq = opts.hq, HQ = vec(hq.lat, hq.lon);
    var compact = !!opts.compact, rtl = document.documentElement.dir === 'rtl';
    var points = [], user = null, focus = null;
    var rotL = (opts.centerLon != null ? opts.centerLon : 40) * RAD, tilt = (opts.tilt || 16) * RAD, baseTilt = tilt;
    var drag = null, vel = 0, t0 = performance.now(), running = true, raf = 0, idleAt = 0;
    var W = 0, H = 0, R = 0, baseR = 0, dpr = 1, cx = 0, cy = 0, zoom = 1, zoomT = 1, gridT = 0, ptrs = {}, pinch = null;
    var ZMIN = 1, ZMAX = compact ? 1 : 3.2;
    var hover = null, hoverHQ = false, tip = opts.tip;
    var PIN = { r: compact ? 7 : 12 };

    function size() {
      var r = canvas.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      baseR = Math.min(W, H) * (compact ? 0.45 : 0.44); R = baseR * zoom; cx = W / 2; cy = H / 2;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildGrid();
    }
    function buildGrid() {
      /* شبكة البكسلات للكرة (تُحسب لكل مقاس ودرجة تكبير) */
      var want = Math.max(120, Math.round(Math.min(compact ? 220 : (zoomT > 1.05 ? (W < 520 ? 440 : 600) : (W < 520 ? 260 : 340)), 2 * baseR * zoomT * dpr * 0.75)));
      if (want === N && img) return;
      N = want; landN = -1;
      off.width = off.height = N; img = octx.createImageData(N, N);
      var xs = [], ys = [], zs = [], ids = [];
      for (var j = 0; j < N; j++) for (var i = 0; i < N; i++) {
        var x = (i + 0.5) / N * 2 - 1, y = 1 - (j + 0.5) / N * 2, d = x * x + y * y;
        if (d >= 1) continue;
        xs.push(x); ys.push(y); zs.push(Math.sqrt(1 - d)); ids.push((j * N + i) * 4);
      }
      PX = new Float32Array(xs); PY = new Float32Array(ys); PZ = new Float32Array(zs); PI_ = new Int32Array(ids);
    }
    function sample(lat, lon) {
      var u = (lon + 180) / M.step - 0.5, v = (90 - lat) / M.step - 0.5;
      var i0 = Math.floor(u), j0 = Math.floor(v), fu = u - i0, fv = v - j0;
      if (j0 < 0) { j0 = 0; fv = 0; } if (j0 >= M.h - 1) { j0 = M.h - 2; fv = 1; }
      var i1 = i0 + 1; i0 = (i0 % M.w + M.w) % M.w; i1 = (i1 % M.w + M.w) % M.w;
      var r0 = j0 * M.w, r1 = r0 + M.w, a = M.a;
      return (a[r0 + i0] * (1 - fu) + a[r0 + i1] * fu) * (1 - fv) + (a[r1 + i0] * (1 - fu) + a[r1 + i1] * fu) * fv;
    }
    /* رسم اليابسة: فاتحة في الوسط، أغمق نحو الحافة، وخط ساحل ذهبي خفيف */
    var landN = -1, landRot = 1e9, landTilt = 1e9;
    function drawLand() {
      /* تُعاد رسم اليابسة فقط عند تغيّر الدوران أو الميل فعليًا */
      if (landN === N && Math.abs(rotL - landRot) < 0.0025 && Math.abs(tilt - landTilt) < 0.0025) { ctx.drawImage(off, cx - R, cy - R, R * 2, R * 2); return; }
      landN = N; landRot = rotL; landTilt = tilt;
      var d = img.data, cl = Math.cos(rotL), sl = Math.sin(rotL), ct = Math.cos(tilt), st = Math.sin(tilt), DEG = 180 / Math.PI;
      d.fill(0);
      for (var k = 0; k < PX.length; k++) {
        var x = PX[k], y2 = PY[k], z2 = PZ[k];
        var sxp0 = cx + R * x, syp0 = cy - R * y2;
        if (sxp0 < -2 || sxp0 > W + 2 || syp0 < -2 || syp0 > H + 2) continue;
        var y = y2 * ct + z2 * st, z = -y2 * st + z2 * ct;
        var v0 = x * cl + z * sl, v2 = -x * sl + z * cl;
        var s = sample(Math.asin(y > 1 ? 1 : y < -1 ? -1 : y) * DEG, Math.atan2(v0, v2) * DEG);
        if (s <= 0.28) continue;
        var a = s >= 0.72 ? 1 : (s - 0.28) / 0.44; a = a * a * (3 - 2 * a);
        var edge = 1 - Math.abs(2 * s - 1), sh = 0.62 + 0.38 * z2, o = PI_[k];
        d[o] = (214 * sh + 41 * edge) | 0; d[o + 1] = (226 * sh + 20 * edge) | 0; d[o + 2] = (242 * sh - 30 * edge) | 0;
        d[o + 3] = (a * (150 + 100 * z2)) | 0;
      }
      octx.putImageData(img, 0, 0);
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(off, cx - R, cy - R, R * 2, R * 2);
    }
    function proj(v) {
      var cl = Math.cos(rotL), sl = Math.sin(rotL);
      var x = v[0] * cl - v[2] * sl, z = v[0] * sl + v[2] * cl, y = v[1];
      var ct = Math.cos(tilt), st = Math.sin(tilt);
      var y2 = y * ct - z * st, z2 = y * st + z * ct;
      return [cx + R * x, cy - R * y2, z2];
    }
    function roundRect(x, y, w, h, r) {
      ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
    }
    function strokeArc(pts, t, phase, alphaBase) {
      var n = pts.length - 1;
      ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(227,196,133,' + alphaBase + ')';
      ctx.beginPath(); var on = false;
      for (var k = 0; k <= n; k++) { var q = proj(pts[k]); if (q[2] > -0.1) { on ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); on = true; } else on = false; }
      ctx.stroke();
      if (reduce) return;
      var head = Math.min(1, ((t * 0.3 + phase) % 1.5) / 1.1);
      var k0 = Math.floor(Math.max(0, head - 0.3) * n), k1 = Math.floor(head * n);
      ctx.lineWidth = 2.2; ctx.lineCap = 'round';
      for (var j = k0; j < k1; j++) {
        var p1 = proj(pts[j]), p2 = proj(pts[j + 1]);
        if (p1[2] < -0.1) continue;
        ctx.strokeStyle = 'rgba(243,220,166,' + (0.1 + 0.9 * (j - k0) / Math.max(1, k1 - k0)).toFixed(3) + ')';
        ctx.beginPath(); ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.stroke();
      }
    }
    function pill(text, x, y, opt) {
      ctx.font = '800 ' + opt.fs + 'px ' + FONT;
      var w = ctx.measureText(text).width + opt.px * 2, h = opt.fs + 10;
      var lx = opt.align === 'center' ? x - w / 2 : (opt.align === 'end' ? x - w : x);
      lx = Math.max(3, Math.min(W - w - 3, lx));
      var ly = y - h / 2;
      roundRect(lx, ly, w, h, h / 2);
      ctx.fillStyle = opt.bg; ctx.fill();
      if (opt.border) { ctx.strokeStyle = opt.border; ctx.lineWidth = 1; ctx.stroke(); }
      ctx.fillStyle = opt.color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(text, lx + w / 2, ly + h / 2 + 1);
      return [lx, ly, w, h];
    }
    function overlaps(r, list) {
      for (var i = 0; i < list.length; i++) { var o = list[i]; if (r[0] < o[0] + o[2] && r[0] + r[2] > o[0] && r[1] < o[1] + o[3] && r[1] + r[3] > o[1]) return true; }
      return false;
    }
    function bubbleR(n) { return compact ? Math.max(10, Math.min(20, 9 + 3.2 * Math.log2(1 + n))) : Math.max(19, Math.min(36, 15 + 5.6 * Math.log2(1 + n))); } /* دوائر أكبر وأوضح */

    function frame(now) {
      var t = (now - t0) / 1000;
      if (Math.abs(zoomT - zoom) > 0.001) { zoom += (zoomT - zoom) * 0.2; R = baseR * zoom; }
      else if (zoom !== zoomT) { zoom = zoomT; R = baseR * zoom; }
      /* الحركة: دوران هادئ مستمر، أو التوجه إلى دولة المنسوب أو الدولة المختارة */
      if (!drag) {
        if (Math.abs(vel) > 0.0001) { rotL += vel; vel *= 0.94; idleAt = now; }
        else if (now - idleAt > 2200) {
          var tgt = focus && now < focus.until ? focus : user;
          if (tgt) {
            var dl = tgt.lon * RAD - rotL;
            while (dl > Math.PI) dl -= 2 * Math.PI;
            while (dl < -Math.PI) dl += 2 * Math.PI;
            rotL += dl * 0.05;
            tilt += (Math.max(-40, Math.min(40, tgt.lat)) * RAD * 0.85 - tilt) * 0.05;
          } else {
            if (!reduce) rotL += 0.0016;
            tilt += (baseTilt - tilt) * 0.02;
          }
        }
      }
      ctx.clearRect(0, 0, W, H);

      /* هالة ذهبية خارجية */
      var halo = ctx.createRadialGradient(cx, cy, R * 0.92, cx, cy, R * 1.22);
      halo.addColorStop(0, 'rgba(227,196,133,.20)'); halo.addColorStop(1, 'rgba(227,196,133,0)');
      ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(cx, cy, R * 1.22, 0, Math.PI * 2); ctx.fill();

      /* المحيط: كحلي غامق */
      var g = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.05, cx, cy, R);
      g.addColorStop(0, '#2a4d7c'); g.addColorStop(0.6, '#152b4b'); g.addColorStop(1, '#0a1628');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();

      /* شبكة خطوط الطول والعرض */
      ctx.strokeStyle = 'rgba(160,190,230,.10)'; ctx.lineWidth = 1;
      GRID.forEach(function (line) {
        ctx.beginPath(); var on = false;
        for (var k = 0; k < line.length; k++) { var q = proj(line[k]); if (q[2] > 0) { on ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); on = true; } else on = false; }
        ctx.stroke();
      });

      drawLand();
      /* لمعة وظل على الكرة */
      var sh = ctx.createRadialGradient(cx - R * 0.4, cy - R * 0.45, R * 0.1, cx, cy, R * 1.02);
      sh.addColorStop(0, 'rgba(255,255,255,.10)'); sh.addColorStop(0.55, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(5,12,26,.45)');
      ctx.fillStyle = sh; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(227,196,133,.5)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();

      /* أقواس من المقر إلى الدول */
      points.forEach(function (pt, i) { if (pt.cc !== hq.cc) strokeArc(pt.arc, t, i * 0.21, compact ? 0.16 : 0.22); });
      if (user && user.cc !== hq.cc) strokeArc(user.arc, t * 1.25, 0, 0.5);

      /* دوائر الدول: عدد المنسوبين + شارة الجنسيات */
      var labels = [];
      var vis = points.map(function (pt) { pt.screen = proj(pt.v); return pt; }).filter(function (pt) { return pt.screen[2] > 0.04; })
        .sort(function (a, b) { return a.screen[2] - b.screen[2]; });
      var bScale = compact ? 1 : Math.max(0.85, Math.min(1.1, baseR / 160));
      vis.forEach(function (pt) {
        var grow = Math.min(1, (now - pt.at) / 700);
        pt.r = bubbleR(pt.n) * bScale * (pt === hover ? 1.08 : 1) * (0.4 + 0.6 * ease(grow));
        pt.px = pt.screen[0]; pt.py = pt.screen[1];
      });
      /* تباعد الدوائر المتقاربة حتى لا تتراكب، مع خط يشير إلى موقعها الحقيقي */
      var hqS = proj(HQ), gap = compact ? 2 : 4, hqGeo = null, obst = [];
      if (hqS[2] > 0.05) {
        /* موضع الدبوس واسم المقر فوقه — تُبعَد عنهما الدوائر */
        var htxt = opts.hqText ? opts.hqText(compact) : '';
        ctx.font = '900 ' + (compact ? 10.5 : 13) + 'px ' + FONT;
        var hlw = htxt ? ctx.measureText(htxt).width + (compact ? 16 : 24) : 0, hlh = compact ? 19 : 26;
        var hcy = hqS[1] - PIN.r * 2.1, hlx = Math.max(3, Math.min(W - hlw - 3, hqS[0] - hlw / 2)), hly = hcy - PIN.r - (compact ? 5 : 8) - hlh;
        hqGeo = { txt: htxt, lw: hlw, lh: hlh, lx: hlx, ly: hly };
        obst.push([hqS[0], hcy, PIN.r + (compact ? 4 : 7)], [hqS[0], hqS[1], compact ? 6 : 10]);
        if (opts.sites && opts.sites.length) obst.push([hqS[0] + PIN.r * 1.45, hqS[1] - PIN.r * 0.68 * 2.1, PIN.r * 0.68 + (compact ? 3 : 6)]);
        if (htxt) for (var ox = hlx + hlh / 2; ox <= hlx + hlw - hlh / 2 + 0.1; ox += hlh * 0.6) obst.push([ox, hly + hlh / 2, hlh / 2 + (compact ? 2 : 4)]);
      }
      for (var it = 0; it < 10; it++) {
        for (var i1 = 0; i1 < vis.length; i1++) {
          var A = vis[i1];
          if (obst.length) {
            obst.forEach(function (o) {
              var hx = A.px - o[0], hy = A.py - o[1], hd = Math.hypot(hx, hy) || 0.01, hm = A.r + o[2];
              if (hd < hm) { A.px += hx / hd * (hm - hd); A.py += hy / hd * (hm - hd); }
            });
          }
          for (var j1 = i1 + 1; j1 < vis.length; j1++) {
            var B = vis[j1], dx = B.px - A.px, dy = B.py - A.py, dd = Math.hypot(dx, dy) || 0.01, mn = A.r + B.r + gap;
            if (dd >= mn) continue;
            var push = (mn - dd), wa = B.r / (A.r + B.r), wb = A.r / (A.r + B.r);
            A.px -= dx / dd * push * wa; A.py -= dy / dd * push * wa;
            B.px += dx / dd * push * wb; B.py += dy / dd * push * wb;
          }
        }
        /* إبقاء الدوائر (مع هالتها وشارة الجنسيات) داخل حدود اللوحة */
        vis.forEach(function (pt) {
          var m = pt.r * 1.4 + 3, mt = pt.nat ? pt.r * 1.5 + 4 : m;
          pt.px = Math.max(m, Math.min(W - m, pt.px)); pt.py = Math.max(mt, Math.min(H - m, pt.py));
        });
      }
      vis.forEach(function (pt) {
        var q = pt.screen, moved = Math.hypot(pt.px - q[0], pt.py - q[1]);
        if (moved < 3) return;
        ctx.globalAlpha = ease((q[2] - 0.04) / 0.25);
        ctx.strokeStyle = 'rgba(227,196,133,.85)'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.lineTo(pt.px, pt.py); ctx.stroke();
        ctx.fillStyle = '#e3c485'; ctx.beginPath(); ctx.arc(q[0], q[1], compact ? 1.8 : 2.6, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      });
      vis.forEach(function (pt, i) {
        var q = [pt.px, pt.py, pt.screen[2]], a = ease((q[2] - 0.04) / 0.25), r = pt.r;
        ctx.globalAlpha = a;
        var br = reduce ? 0.5 : 0.5 + 0.5 * Math.sin(t * 1.6 + i);
        ctx.fillStyle = 'rgba(227,196,133,' + (0.16 + 0.12 * br).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(q[0], q[1], r * (1.35 + 0.12 * br), 0, Math.PI * 2); ctx.fill();
        var bg = ctx.createRadialGradient(q[0] - r * 0.35, q[1] - r * 0.4, r * 0.1, q[0], q[1], r);
        bg.addColorStop(0, '#fbecc6'); bg.addColorStop(0.7, '#e3c485'); bg.addColorStop(1, '#c9a35e');
        ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(q[0], q[1], r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#10253f'; ctx.lineWidth = compact ? 1.5 : 2.5; ctx.stroke();
        ctx.fillStyle = '#0b1a2e'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        var fs = Math.round(Math.max(compact ? 10 : 13, Math.min(22, r * (String(pt.nLabel).length > 2 ? 0.62 : 0.8))));
        ctx.font = '900 ' + fs + 'px ' + FONT;
        if (!compact || r >= 9) ctx.fillText(pt.nLabel, q[0], q[1] + 1);
        if (pt.nat) {
          var bR = compact ? 7.5 : Math.max(11, Math.min(15, r * 0.42)), ang = rtl ? -2.35 : -0.8;
          var bx = q[0] + Math.cos(ang) * r * 0.98, by = q[1] + Math.sin(ang) * r * 0.98;
          ctx.fillStyle = '#7fd8e6'; ctx.beginPath(); ctx.arc(bx, by, bR, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = '#10253f'; ctx.lineWidth = compact ? 1.2 : 2; ctx.stroke();
          if (!compact) { ctx.fillStyle = '#0b1a2e'; ctx.font = '900 ' + Math.round(bR * 1.05) + 'px ' + FONT; ctx.fillText(pt.natLabel, bx, by + 1); }
        }
        ctx.globalAlpha = 1;
      });
      /* أسماء الدول (للأكبر أولًا، دون تداخل) */
      if (!compact) {
        vis.forEach(function (pt) { labels.push([pt.px - pt.r, pt.py - pt.r, pt.r * 2, pt.r * 2]); });
        if (hqGeo) { labels.push([hqS[0] - PIN.r - 2, hqS[1] - PIN.r * 3.2, PIN.r * 2 + 4, PIN.r * 3.3]); if (hqGeo.txt) labels.push([hqGeo.lx - 4, hqGeo.ly - 4, hqGeo.lw + 8, hqGeo.lh + 8]); }
        vis.slice().sort(function (a, b) { return b.n - a.n; }).forEach(function (pt) {
          var q = [pt.px, pt.py, pt.screen[2]]; if (q[2] < 0.35) return;
          ctx.font = '800 12px ' + FONT;
          var w = ctx.measureText(pt.name).width + 20, h = 22;
          var ym = q[1] - h / 2, xa = q[0] - pt.r - 6 - w, xb = q[0] + pt.r + 6, xc = q[0] - w / 2;
          var cands = (rtl ? [[xa, ym], [xb, ym]] : [[xb, ym], [xa, ym]]).concat([[xc, q[1] - pt.r - 5 - h], [xc, q[1] + pt.r + 5]]), x = null, y = ym;
          for (var ci = 0; ci < cands.length && x === null; ci++) {
            var rc = [cands[ci][0], cands[ci][1], w, h];
            if (rc[0] >= 2 && rc[0] + w <= W - 2 && rc[1] >= 2 && rc[1] + h <= H - 2 && !overlaps(rc, labels)) { x = rc[0]; y = rc[1]; }
          }
          if (x === null) return;
          labels.push([x, y, w, h]);
          ctx.globalAlpha = ease((q[2] - 0.35) / 0.2);
          pill(pt.name, x, y + h / 2, { fs: 12, px: 10, bg: 'rgba(10,22,40,.82)', color: '#f4f8fd', border: 'rgba(227,196,133,.35)', align: 'start' });
          ctx.globalAlpha = 1;
        });
      }

      /* دولة المنسوب الحالي */
      if (user) {
        var u = proj(user.v); user.screen = u;
        if (u[2] > 0) {
          var age = Math.min(1, (now - user.at) / 700), up = reduce ? 0.4 : (t * 0.8) % 1;
          ctx.strokeStyle = 'rgba(255,255,255,' + (0.85 * (1 - up)).toFixed(3) + ')';
          ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(u[0], u[1], 8 + up * (compact ? 16 : 24), 0, Math.PI * 2); ctx.stroke();
          var s = (compact ? 6 : 8) * (age < 1 ? 1 + (1 - age) * 1.5 : 1);
          ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(u[0], u[1], s, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#e3c485'; ctx.beginPath(); ctx.arc(u[0], u[1], s * 0.55, 0, Math.PI * 2); ctx.fill();
          if (user.label) {
            ctx.globalAlpha = age;
            pill(user.label, u[0], u[1] - (compact ? 26 : 38), { fs: compact ? 11 : 13, px: 11, bg: 'rgba(255,255,255,.97)', color: '#10253f', align: 'center' });
            ctx.globalAlpha = 1;
          }
        }
      }

      /* المقر الرئيسي · جدة: دبوس ذهبي واضح بنبض مزدوج واسم ثابت */
      var hp2 = proj(HQ);
      if (hp2[2] > 0.05) {
        var ha = ease((hp2[2] - 0.05) / 0.2), x0 = hp2[0], y0 = hp2[1], pr = PIN.r;
        var drop = reduce ? 1 : ease(Math.min(1, (now - t0) / 900)), bob = reduce ? 0 : Math.sin(t * 2.2) * (compact ? 1 : 1.6);
        var yT = y0 - (1 - drop) * 40;
        ctx.globalAlpha = ha;
        /* نبضات عند موقع المقر */
        for (var pk = 0; pk < 2; pk++) {
          var pp = reduce ? 0.3 + pk * 0.3 : ((t * 0.55 + pk * 0.5) % 1);
          ctx.strokeStyle = pk ? 'rgba(255,255,255,' + (0.7 * (1 - pp)).toFixed(3) + ')' : 'rgba(243,220,166,' + (0.95 * (1 - pp)).toFixed(3) + ')';
          ctx.lineWidth = compact ? 1.4 : 2;
          ctx.beginPath(); ctx.ellipse(x0, y0, (compact ? 4 : 6) + pp * (compact ? 16 : 28), ((compact ? 4 : 6) + pp * (compact ? 16 : 28)) * 0.55, 0, 0, Math.PI * 2); ctx.stroke();
        }
        /* ظل الدبوس */
        ctx.fillStyle = 'rgba(5,12,26,.45)';
        ctx.beginPath(); ctx.ellipse(x0, y0, pr * 0.7, pr * 0.28, 0, 0, Math.PI * 2); ctx.fill();
        /* دبوس ثانٍ أصغر: مقر مكة المكرمة (قريب جدًا من جدة) */
        var yy = yT + bob - (compact ? 0 : 1), cyH = yy - pr * 2.1;
        if (opts.sites && opts.sites.length) {
          var sr = pr * 0.68, sxp = x0 + pr * 1.45, syy = yy + 1, scy = syy - sr * 2.1;
          ctx.beginPath(); ctx.moveTo(sxp, syy);
          ctx.bezierCurveTo(sxp - sr * 0.55, syy - sr * 0.8, sxp - sr, scy + sr * 0.75, sxp - sr, scy);
          ctx.arc(sxp, scy, sr, Math.PI, 0, false);
          ctx.bezierCurveTo(sxp + sr, scy + sr * 0.75, sxp + sr * 0.55, syy - sr * 0.8, sxp, syy); ctx.closePath();
          ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.strokeStyle = '#0b1a2e'; ctx.lineWidth = compact ? 1.4 : 2; ctx.stroke();
          ctx.fillStyle = '#c9a35e'; ctx.beginPath(); ctx.arc(sxp, scy, sr * 0.42, 0, Math.PI * 2); ctx.fill();
        }
        /* الدبوس */
        ctx.beginPath(); ctx.moveTo(x0, yy);
        ctx.bezierCurveTo(x0 - pr * 0.55, yy - pr * 0.8, x0 - pr, cyH + pr * 0.75, x0 - pr, cyH);
        ctx.arc(x0, cyH, pr, Math.PI, 0, false);
        ctx.bezierCurveTo(x0 + pr, cyH + pr * 0.75, x0 + pr * 0.55, yy - pr * 0.8, x0, yy);
        ctx.closePath();
        var pg = ctx.createLinearGradient(x0 - pr, cyH - pr, x0 + pr, yy);
        pg.addColorStop(0, '#fbecc6'); pg.addColorStop(0.55, '#e3c485'); pg.addColorStop(1, '#b8914d');
        ctx.fillStyle = pg; ctx.fill();
        ctx.strokeStyle = '#0b1a2e'; ctx.lineWidth = compact ? 1.8 : 2.6; ctx.stroke();
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x0, cyH, pr * 0.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#10253f'; ctx.beginPath(); ctx.arc(x0, cyH, pr * 0.24, 0, Math.PI * 2); ctx.fill();
        /* اسم المقر ثابتًا فوق الدبوس */
        if (hqGeo && hqGeo.txt && drop > 0.6) {
          var lx = hqGeo.lx, ly = hqGeo.ly + bob, lw = hqGeo.lw, lh = hqGeo.lh;
          ctx.globalAlpha = ha * ease((drop - 0.6) / 0.4);
          ctx.font = '900 ' + (compact ? 10.5 : 13) + 'px ' + FONT;
          ctx.shadowColor = 'rgba(5,12,26,.5)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 3;
          roundRect(lx, ly, lw, lh, lh / 2);
          var lg = ctx.createLinearGradient(lx, ly, lx + lw, ly + lh); lg.addColorStop(0, '#f3dca6'); lg.addColorStop(1, '#e3c485');
          ctx.fillStyle = lg; ctx.fill();
          ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
          ctx.strokeStyle = '#0b1a2e'; ctx.lineWidth = 1.4; ctx.stroke();
          /* سهم صغير يصل الاسم بالدبوس */
          ctx.fillStyle = '#e3c485'; ctx.beginPath(); ctx.moveTo(x0 - 5, ly + lh - 1); ctx.lineTo(x0 + 5, ly + lh - 1); ctx.lineTo(x0, ly + lh + 5); ctx.closePath(); ctx.fill();
          ctx.fillStyle = '#0b1a2e'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(hqGeo.txt, lx + lw / 2, ly + lh / 2 + 1);
        }
        ctx.globalAlpha = 1;
      }

      /* التلميح عند المرور */
      if (tip) {
        var tg = null, txt = '';
        var html = '';
        if (hover && hover.screen && hover.screen[2] > 0) { tg = [hover.px, hover.py - (hover.r || 10), (hover.r || 10) * 2]; txt = hover.tip; html = hover.tipHTML || ''; }
        else if (hoverHQ && hp2[2] > 0) { tg = [hp2[0], hp2[1] - PIN.r * 3.2, PIN.r * 3.4]; txt = opts.label(hq); html = opts.hqTip ? opts.hqTip() : ''; }
        if (tg) { tip.hidden = false; if (html) { if (tip._h !== html) { tip.innerHTML = html; tip._h = html; } } else { tip.textContent = txt; tip._h = ''; } tip.classList.toggle('rich', !!html);
          var tw = tip.offsetWidth, th = tip.offsetHeight, below = tg[2] || 24;
          var tx = Math.max(4, Math.min(W - tw - 4, tg[0] - tw / 2)), ty = tg[1] - 8 - th;
          if (ty < 2) ty = Math.min(H - th - 2, tg[1] + below + 8);
          tip.style.transform = 'translate(' + Math.round(tx) + 'px,' + Math.round(ty) + 'px)'; }
        else tip.hidden = true;
      }
      if (running) raf = requestAnimationFrame(frame);
    }

    function pos(e) { var r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
    function pick(p) {
      var best = null, bd = 1e9;
      points.forEach(function (a) {
        if (!(a.screen && a.screen[2] > 0.04 && a.px != null)) return;
        var dd = Math.hypot(a.px - p[0], a.py - p[1]);
        if (dd < Math.max(14, (a.r || 8) + 4) && dd < bd) { bd = dd; best = a; }
      });
      return best;
    }
    function setZoom(z) {
      zoomT = Math.max(ZMIN, Math.min(ZMAX, z)); idleAt = performance.now();
      clearTimeout(gridT); gridT = setTimeout(buildGrid, 260);
      if (opts.onZoom) opts.onZoom(zoomT);
    }
    canvas.addEventListener('pointerdown', function (e) {
      var p = pos(e);
      ptrs[e.pointerId] = p;
      var ids = Object.keys(ptrs);
      if (ids.length === 2) { var a = ptrs[ids[0]], b = ptrs[ids[1]]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, z: zoomT }; drag = null; return; }
      drag = { x: p[0], y: p[1], l: rotL, t: tilt, moved: false, th: e.pointerType === 'touch' ? 10 : 4 }; vel = 0;
      canvas.setPointerCapture(e.pointerId); canvas.classList.add('grab');
    });
    canvas.addEventListener('pointermove', function (e) {
      var p = pos(e);
      if (ptrs[e.pointerId]) ptrs[e.pointerId] = p;
      if (pinch) {
        var ids = Object.keys(ptrs); if (ids.length < 2) return;
        var a = ptrs[ids[0]], b = ptrs[ids[1]];
        setZoom(pinch.z * (Math.hypot(a[0] - b[0], a[1] - b[1]) || 1) / pinch.d); return;
      }
      if (drag) {
        if (!drag.moved && Math.abs(p[0] - drag.x) + Math.abs(p[1] - drag.y) <= drag.th) return;
        drag.moved = true;
        var nl = drag.l - (p[0] - drag.x) / R; vel = nl - rotL; rotL = nl;
        tilt = Math.max(-1, Math.min(1, drag.t + (p[1] - drag.y) / R * 0.7));
        idleAt = performance.now(); focus = null; return;
      }
      if (e.pointerType === 'touch') return;
      hover = pick(p);
      var h = proj(HQ);
      hoverHQ = !hover && h[2] > 0 && Math.hypot(h[0] - p[0], h[1] - PIN.r * 1.4 - p[1]) < PIN.r * 2;
      canvas.style.cursor = hover || hoverHQ ? 'pointer' : 'grab';
    });
    function end(e) {
      if (e && e.pointerId != null) delete ptrs[e.pointerId];
      if (pinch) { if (Object.keys(ptrs).length < 2) pinch = null; drag = null; return; }
      if (drag && !drag.moved && e && e.type === 'pointerup') {
        var hit = pick(pos(e));
        if (hit) { focus = { lat: hit.lat, lon: hit.lon, until: performance.now() + 6000 }; idleAt = 0; hover = hit; hoverHQ = false; }
        else if (e.pointerType === 'touch') { var hh = proj(HQ), pp2 = pos(e); hover = null; hoverHQ = hh[2] > 0 && Math.hypot(hh[0] - pp2[0], hh[1] - PIN.r * 1.4 - pp2[1]) < PIN.r * 2.4; }
      }
      drag = null; canvas.classList.remove('grab');
    }
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('pointerleave', function (e) { if (!drag && e.pointerType !== 'touch') { hover = null; hoverHQ = false; } });
    function onScroll() { if (hover || hoverHQ) { hover = null; hoverHQ = false; } }
    window.addEventListener('scroll', onScroll, { passive: true });
    canvas.addEventListener('dblclick', function () { setZoom(zoomT > 2 ? 1 : zoomT * 1.6); });
    canvas.addEventListener('wheel', function (e) {
      if (compact || !(e.ctrlKey || canvas.closest('.is-full'))) return;
      e.preventDefault(); setZoom(zoomT * (e.deltaY < 0 ? 1.15 : 1 / 1.15));
    }, { passive: false });

    size();
    var ro = window.ResizeObserver ? new ResizeObserver(size) : null;
    if (ro) ro.observe(canvas);
    var io = window.IntersectionObserver ? new IntersectionObserver(function (en) {
      var v = en[0].isIntersecting;
      if (v && !running) { running = true; raf = requestAnimationFrame(frame); }
      if (!v) { running = false; cancelAnimationFrame(raf); }
    }) : null;
    if (io) io.observe(canvas);
    raf = requestAnimationFrame(frame);

    return {
      setUser: function (cc, label) {
        var c = cc && CENT(cc);
        if (!c) { user = null; return; }
        if (user && user.cc === cc) { user.label = label; return; }
        var v = vec(c.lat, c.lon);
        user = { cc: cc, lat: c.lat, lon: c.lon, v: v, label: label, arc: arcPts(HQ, v, 0.28), at: performance.now() };
        idleAt = 0;
      },
      /* map: { SA: { n: 12, nat: 3 }, ... } — fmt(cc, d) يعيد { name, tip, n, nat } نصوصًا جاهزة */
      setPoints: function (map, fmt) {
        var old = {};
        points.forEach(function (p) { old[p.cc] = p; });
        points = Object.keys(map || {}).map(function (cc) {
          var c = CENT(cc); if (!c) return null;
          var d = typeof map[cc] === 'number' ? { n: map[cc], nat: 0 } : map[cc];
          if (!d || !d.n) return null;
          var f = fmt ? fmt(cc, d) : { name: cc, tip: cc, n: d.n, nat: d.nat };
          var v = vec(c.lat, c.lon), was = old[cc];
          return { cc: cc, lat: c.lat, lon: c.lon, v: v, arc: arcPts(HQ, v, 0.22), n: d.n, nat: d.nat || 0, name: f.name, tip: f.tip, tipHTML: f.tipHTML || '', nLabel: f.n, natLabel: f.nat, at: was && was.n === d.n ? was.at : performance.now() };
        }).filter(Boolean);
      },
      focusOn: function (cc) { var c = CENT(cc); if (c) { focus = { lat: c.lat, lon: c.lon, until: performance.now() + 6000 }; idleAt = 0; } },
      zoomBy: function (f) { setZoom(zoomT * f); },
      setZoom: setZoom,
      getZoom: function () { return zoomT; },
      destroy: function () { running = false; cancelAnimationFrame(raf); if (io) io.disconnect(); if (ro) ro.disconnect(); clearTimeout(gridT); window.removeEventListener('scroll', onScroll); if (tip) tip.hidden = true; }
    };
  };
})();
