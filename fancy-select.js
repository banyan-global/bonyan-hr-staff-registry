/* قوائم منسدلة موحّدة لكل صفحات المنصة: تحوّل أي <select> إلى قائمة أنيقة بنفس هوية الصفحة،
   مع البحث (للقوائم الطويلة) والتنقل بالأسهم وEnter وEsc والكتابة للقفز إلى خيار.
   القائمة الأصلية تبقى مخفية في مكانها وتُحدَّث قيمتها ويُطلق حدث change، فلا يتغير شيء في منطق الصفحات. */
(function () {
  'use strict';
  if (window.__fancySelect) return; window.__fancySelect = 1;
  var OPEN = null, SEQ = 0;
  (function () { var st = document.createElement('style'); st.id = 'fs-css'; st.textContent = ".fs-native{position:absolute!important;width:1px!important;height:1px!important;opacity:0!important;pointer-events:none!important;overflow:hidden!important;clip:rect(0 0 0 0)!important;margin:0!important;padding:0!important;border:0!important}\n.fs-btn{appearance:none;-webkit-appearance:none;display:flex;align-items:center;gap:10px;width:100%;min-width:0;min-height:44px;padding:0 12px 0 10px;padding-inline:14px 8px;border-radius:13px;border:1px solid rgba(120,135,160,.35);background:rgba(127,140,160,.07);color:inherit;font:inherit;font-size:14px;cursor:pointer;text-align:start;transition:border-color .15s,box-shadow .15s,background .15s;background-image:none!important}\n.fs-btn:hover:not(:disabled){border-color:rgba(185,143,69,.6)}\n.fs-btn:focus-visible,.fs-btn.fs-open{outline:none;border-color:#c9a35e;box-shadow:0 0 0 4px rgba(227,196,133,.28)}\n.fs-btn:disabled{opacity:.55;cursor:not-allowed}\n.fs-btn .fs-v{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:700}\n.fs-btn.fs-ph .fs-v{font-weight:600;opacity:.6}\n.fs-btn .fs-c{flex:none;width:26px;height:26px;border-radius:8px;display:grid;place-items:center;background:rgba(185,143,69,.12);color:#b38a3e;transition:transform .2s,background .2s}\n.fs-btn .fs-c svg{width:15px;height:15px}\n.fs-btn.fs-open .fs-c{transform:rotate(180deg);background:rgba(185,143,69,.22)}\n.fs-pop{position:fixed;z-index:2147483000;display:flex;flex-direction:column;min-width:200px;padding:6px;border-radius:16px;background:#fff;color:#172036;border:1px solid rgba(20,35,64,.12);box-shadow:0 24px 54px -14px rgba(10,22,44,.4),0 2px 6px rgba(10,22,44,.08);font-family:inherit;font-size:14px;animation:fsIn .14s ease-out;overflow:hidden}\n.fs-pop.up{animation-name:fsUp}\n@keyframes fsIn{from{opacity:0;transform:translateY(-4px) scale(.98)}to{opacity:1;transform:none}}\n@keyframes fsUp{from{opacity:0;transform:translateY(4px) scale(.98)}to{opacity:1;transform:none}}\n.fs-pop.fs-dark{background:#17233a;color:#eef3fb;border-color:rgba(227,196,133,.28);box-shadow:0 24px 54px -14px rgba(0,0,0,.6)}\n.fs-q{padding:2px 2px 6px}\n.fs-q input{width:100%;height:38px;border-radius:11px;border:1px solid rgba(120,135,160,.3);background:rgba(127,140,160,.08);color:inherit;font:inherit;font-size:13.5px;padding:0 12px;outline:none}\n.fs-q input:focus{border-color:#c9a35e;box-shadow:0 0 0 3px rgba(227,196,133,.25)}\n.fs-list{overflow:auto;display:grid;gap:2px;overscroll-behavior:contain}\n.fs-o{display:flex;align-items:center;gap:10px;min-height:40px;padding:8px 12px;border-radius:10px;cursor:pointer;line-height:1.4}\n.fs-o span{flex:1;min-width:0}\n.fs-o i{flex:none;width:18px;height:18px;display:grid;place-items:center;color:#b38a3e;opacity:0}\n.fs-o i svg{width:16px;height:16px}\n.fs-o.act{background:rgba(127,140,160,.12)}\n.fs-o.on{background:rgba(227,196,133,.2);font-weight:800}\n.fs-pop.fs-dark .fs-o.on{background:rgba(227,196,133,.16);color:#f3dca6}\n.fs-o.on i{opacity:1}\n.fs-o.ph{opacity:.65}\n.fs-o.off{opacity:.4;cursor:not-allowed}\n.fs-none{padding:16px;text-align:center;opacity:.6;font-weight:700}\n.fd-btn .fs-c svg{width:16px;height:16px}\n.fd-btn.fs-open .fs-c{transform:none}\n.fd-btn .fs-v{font-variant-numeric:tabular-nums}\n.fd-btn[aria-invalid=true]{border-color:#d0574b!important}\n.fd-pop{width:330px;padding:12px;gap:10px;user-select:none;-webkit-user-select:none;max-height:calc(100vh - 16px);overflow:auto}\n.fd-hd{display:flex;align-items:center;gap:6px}\n.fd-ttl{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;height:40px;border:0;border-radius:12px;background:transparent;color:inherit;font:inherit;font-weight:800;font-size:15.5px;cursor:pointer;font-variant-numeric:tabular-nums}\n.fd-ttl svg{width:15px;height:15px;opacity:.55}\n.fd-nav{flex:none;width:40px;height:40px;display:grid;place-items:center;border:0;border-radius:12px;background:rgba(127,140,160,.08);color:inherit;cursor:pointer}\n.fd-nav svg{width:18px;height:18px}\n.fd-nav.nx svg{transform:scaleX(-1)}\n.fd-pop[dir=ltr] .fd-nav svg{transform:scaleX(-1)}\n.fd-pop[dir=ltr] .fd-nav.nx svg{transform:none}\n.fd-ttl:hover,.fd-nav:hover{background:rgba(185,143,69,.14)}\n.fd-g{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:3px 2px}\n.fd-wd{text-align:center;font-size:11px;font-weight:800;opacity:.55;padding:2px 0 6px;white-space:nowrap;overflow:hidden}\n.fd-wd.we{color:#b38a3e;opacity:.85}\n.fd-d{position:relative;height:40px;padding:0;border:0;border-radius:12px;background:transparent;color:inherit;font:inherit;font-size:14.5px;font-weight:700;cursor:pointer;font-variant-numeric:tabular-nums;transition:background .12s}\n.fd-d:hover{background:rgba(127,140,160,.15)}\n.fd-d.out{opacity:.32}\n.fd-d.we{color:#a87d33}\n.fs-dark .fd-d.we{color:#e3c485}\n.fd-d.td{box-shadow:inset 0 0 0 1.6px rgba(201,163,94,.75)}\n.fd-d.td::after{content:\"\";position:absolute;bottom:4px;left:50%;width:4px;height:4px;margin-left:-2px;border-radius:50%;background:#c9a35e}\n.fd-d.rg{background:rgba(227,196,133,.2);border-radius:0}\n.fd-d.rg.rs{border-start-start-radius:12px;border-end-start-radius:12px}\n.fd-d.rg.re{border-start-end-radius:12px;border-end-end-radius:12px}\n.fd-d.on{background:linear-gradient(140deg,#ecd29a,#c9a35e);color:#16294a!important;border-radius:12px;box-shadow:0 8px 16px -8px rgba(185,143,69,.9);opacity:1}\n.fd-d.on::after{background:#16294a}\n.fd-d.dis{opacity:.2;cursor:not-allowed;background:transparent!important}\n.fd-pop button:focus-visible{outline:2px solid #c9a35e;outline-offset:1px}\n.fd-ms{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}\n.fd-ys{grid-template-columns:repeat(4,minmax(0,1fr))}\n.fd-c{height:46px;border:0;border-radius:12px;background:rgba(127,140,160,.08);color:inherit;font:inherit;font-size:14px;font-weight:700;cursor:pointer;font-variant-numeric:tabular-nums}\n.fd-c:hover{background:rgba(185,143,69,.16)}\n.fd-c.td{box-shadow:inset 0 0 0 1.6px rgba(201,163,94,.75)}\n.fd-c.on{background:linear-gradient(140deg,#ecd29a,#c9a35e);color:#16294a}\n.fd-c.dis{opacity:.25;cursor:not-allowed}\n.fd-ft{display:flex;align-items:center;gap:6px;border-top:1px solid rgba(127,140,160,.2);padding-top:10px}\n.fd-hj{flex:1;min-width:0;font-size:12px;font-weight:700;opacity:.65;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.fd-a{flex:none;height:32px;padding:0 13px;border-radius:10px;border:1px solid rgba(201,163,94,.55);background:rgba(227,196,133,.16);color:#8f6a28;font:inherit;font-size:12.5px;font-weight:800;cursor:pointer}\n.fs-dark .fd-a{color:#f3dca6}\n.fd-a:hover{background:rgba(227,196,133,.3)}\n.fd-a.cl{border-color:rgba(127,140,160,.35);background:transparent;color:inherit;opacity:.85}\n.fd-pop.sheet{left:10px!important;right:10px;top:auto!important;bottom:10px;width:auto!important;min-width:0;border-radius:22px;padding:14px 14px 16px;box-shadow:0 0 0 100vmax rgba(8,16,30,.42),0 -12px 40px rgba(0,0,0,.25);animation-name:fdSheet}\n.fd-pop.sheet .fd-d{height:44px}\n@keyframes fdSheet{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}\n@media (prefers-reduced-motion:reduce){.fs-pop{animation:none}}"; (document.head || document.documentElement).appendChild(st); })();
  var CHEV = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var TICK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function norm(s) { return String(s || '').toLowerCase().replace(/[ً-ٟـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').trim(); }
  function txt(sel) { var o = sel.options[sel.selectedIndex]; return o ? o.text : ''; }

  function enhance(sel) {
    if (sel.__fs || sel.multiple || sel.size > 1 || sel.hasAttribute('data-native') || !sel.parentNode) return;
    sel.__fs = 1;
    var b = document.createElement('button'); b.type = 'button';
    b.className = 'fs-btn ' + (sel.className || '');
    var id = 'fs' + (++SEQ); b.id = id + 'b';
    b.setAttribute('role', 'combobox'); b.setAttribute('aria-haspopup', 'listbox'); b.setAttribute('aria-expanded', 'false');
    var lab = sel.getAttribute('aria-label') || (sel.id && document.querySelector('label[for="' + sel.id + '"]') ? document.querySelector('label[for="' + sel.id + '"]').textContent.trim() : '');
    if (lab) b.setAttribute('aria-label', lab);
    var cs = getComputedStyle(sel);
    if (cs.flexGrow !== '0' || cs.flexBasis !== 'auto') b.style.flex = cs.flex;
    if (sel.style.width) b.style.width = sel.style.width;
    b.innerHTML = '<span class="fs-v"></span><span class="fs-c">' + CHEV + '</span>';
    sel.parentNode.insertBefore(b, sel.nextSibling);
    sel.classList.add('fs-native'); sel.tabIndex = -1; sel.setAttribute('aria-hidden', 'true');
    sel.__fsb = b; b.__fss = sel;
    var sync = function () { var v = b.querySelector('.fs-v'), t = txt(sel), empty = !sel.value; v.textContent = t || '—'; b.classList.toggle('fs-ph', empty); b.disabled = sel.disabled; };
    sync();
    sel.addEventListener('change', sync);
    new MutationObserver(sync).observe(sel, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled'] });
    sel.addEventListener('focus', function () { b.focus(); });
    b.addEventListener('click', function () { if (OPEN && OPEN.b === b) close(); else open(b); });
    b.addEventListener('keydown', function (e) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].indexOf(e.key) > -1 && !(OPEN && OPEN.b === b)) { e.preventDefault(); open(b); }
    });
  }

  function open(b) {
    close(); var sel = b.__fss; if (!sel || sel.disabled) return;
    var r = b.getBoundingClientRect(), cs = getComputedStyle(b), opts = [].slice.call(sel.options);
    var pop = document.createElement('div'); pop.className = 'fs-pop'; pop.setAttribute('role', 'listbox');
    pop.dir = getComputedStyle(sel).direction || document.documentElement.dir || 'rtl';
    var dark = (function (c) { var m = c.match(/\d+/g); if (!m) return false; return (0.299 * m[0] + 0.587 * m[1] + 0.114 * m[2]) < 140; })(cs.color) === false;
    pop.classList.toggle('fs-dark', dark);
    var many = opts.length > 8;
    pop.innerHTML = (many ? '<div class="fs-q"><input type="search" placeholder="ابحث في الخيارات" aria-label="بحث في الخيارات" autocomplete="off"></div>' : '') + '<div class="fs-list"></div>';
    document.body.appendChild(pop);
    var list = pop.querySelector('.fs-list'), q = pop.querySelector('.fs-q input'), act = -1, shown = [];
    var draw = function (filter) {
      var f = norm(filter); shown = [];
      list.innerHTML = opts.map(function (o, i) {
        if (o.hidden) return '';
        if (f && norm(o.text).indexOf(f) < 0) return '';
        shown.push(i); var on = i === sel.selectedIndex;
        return '<div class="fs-o' + (on ? ' on' : '') + (o.disabled ? ' off' : '') + (o.value === '' ? ' ph' : '') + '" role="option" aria-selected="' + on + '" data-i="' + i + '"><span>' + o.text.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }) + '</span><i>' + TICK + '</i></div>';
      }).join('') || '<div class="fs-none">لا خيار بهذا البحث</div>';
      act = shown.indexOf(sel.selectedIndex); mark();
    };
    var mark = function () { [].forEach.call(list.querySelectorAll('.fs-o'), function (el) { var on = +el.dataset.i === shown[act]; el.classList.toggle('act', on); if (on) el.scrollIntoView({ block: 'nearest' }); }); };
    var pick = function (i) { var o = opts[i]; if (!o || o.disabled) return; if (sel.selectedIndex !== i) { sel.selectedIndex = i; sel.dispatchEvent(new Event('input', { bubbles: true })); sel.dispatchEvent(new Event('change', { bubbles: true })); } close(); b.focus(); };
    draw('');
    var place = function () {
      var r2 = b.getBoundingClientRect(), w = Math.max(r2.width, 220), vh = window.innerHeight, below = vh - r2.bottom - 12, above = r2.top - 12;
      pop.style.width = Math.min(w, window.innerWidth - 16) + 'px';
      var left = pop.dir === 'rtl' ? r2.right - pop.offsetWidth : r2.left; left = Math.max(8, Math.min(left, window.innerWidth - pop.offsetWidth - 8)); pop.style.left = left + 'px';
      var h = Math.min(pop.scrollHeight, 360), up = below < Math.min(h, 240) && above > below;
      pop.style.maxHeight = Math.max(160, Math.min(360, up ? above : below)) + 'px';
      pop.style.top = (up ? r2.top - Math.min(pop.offsetHeight, up ? above : below) - 6 : r2.bottom + 6) + 'px';
      pop.classList.toggle('up', up);
    };
    place();
    b.setAttribute('aria-expanded', 'true'); b.classList.add('fs-open');
    list.addEventListener('mousedown', function (e) { e.preventDefault(); });
    list.addEventListener('click', function (e) { var o = e.target.closest('.fs-o'); if (o) pick(+o.dataset.i); });
    list.addEventListener('mousemove', function (e) { var o = e.target.closest('.fs-o'); if (o) { var k = shown.indexOf(+o.dataset.i); if (k !== act) { act = k; [].forEach.call(list.querySelectorAll('.fs-o'), function (el) { el.classList.toggle('act', +el.dataset.i === shown[act]); }); } } });
    var buf = '', bt = 0;
    var key = function (e) {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); b.focus(); return; }
      if (e.key === 'Tab') { close(); return; }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (!shown.length) return; act = (act + (e.key === 'ArrowDown' ? 1 : -1) + shown.length) % shown.length; mark(); return; }
      if (e.key === 'Home' || e.key === 'End') { if (e.target === q) return; e.preventDefault(); act = e.key === 'Home' ? 0 : shown.length - 1; mark(); return; }
      if (e.key === 'Enter') { e.preventDefault(); if (act > -1) pick(shown[act]); return; }
      if (!q && e.key.length === 1) { clearTimeout(bt); buf += e.key; bt = setTimeout(function () { buf = ''; }, 700); var f = norm(buf), k = shown.findIndex(function (i) { return norm(opts[i].text).indexOf(f) === 0; }); if (k > -1) { act = k; mark(); } }
    };
    if (q) { q.addEventListener('input', function () { draw(q.value); }); q.addEventListener('keydown', key); setTimeout(function () { q.focus(); }, 10); }
    else b.addEventListener('keydown', key);
    OPEN = { b: b, pop: pop, key: key, place: place };
  }
  function close() {
    if (!OPEN) return; var o = OPEN; OPEN = null;
    o.b.removeEventListener('keydown', o.key); o.b.setAttribute('aria-expanded', 'false'); o.b.classList.remove('fs-open');
    if (o.pop.parentNode) o.pop.parentNode.removeChild(o.pop);
  }
  document.addEventListener('mousedown', function (e) { if (OPEN && !OPEN.pop.contains(e.target) && !OPEN.b.contains(e.target)) close(); }, true);
  window.addEventListener('resize', function () { if (OPEN && !OPEN.pop.classList.contains('sheet')) close(); });
  document.addEventListener('scroll', function (e) { if (OPEN && !OPEN.pop.contains(e.target) && !OPEN.pop.classList.contains('sheet')) close(); }, true);


  /* ============ منتقي التاريخ: يحل محل حقل التاريخ الأصلي (input type=date) بنفس الطريقة ============
     الحقل الأصلي يبقى مخفيًا وقيمته بصيغة YYYY-MM-DD كما هي، فلا يتغير شيء في منطق الصفحات. */
  var NIN = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
  var CAL = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="3.2" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="M3.5 10h17M8 3v4M16 3v4" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><rect x="7.2" y="13" width="3.4" height="3.4" rx="1" fill="currentColor"/></svg>';
  var ARR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function isEn() { return (document.documentElement.lang || '').slice(0, 2) === 'en'; }
  function iso(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function pd(v) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(v || ''); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; }
  function fmt(d, o) { try { return d.toLocaleDateString(isEn() ? 'en-GB' : 'ar-SA-u-ca-gregory-nu-latn', o); } catch (e) { return iso(d); } }
  function hij(d) { try { return d.toLocaleDateString(isEn() ? 'en-u-ca-islamic-umalqura' : 'ar-SA-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return ''; } }
  function addM(d, n) { var t = new Date(d.getFullYear(), d.getMonth() + n, 1), last = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate(); t.setDate(Math.min(d.getDate(), last)); return t; }
  var LONG = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  /* حقل «من» وحقل «إلى» المقابل له (rw_from ↔ rw_to، trFrom ↔ trTo …) لإبراز المدة ومنع نهاية قبل البداية */
  function mate(inp, want) {
    var id = inp.id || '', re = want === 'to' ? /from$/i : /to$/i;
    if (!re.test(id)) return null;
    var o = document.getElementById(id.replace(re, function (s) { var w = want === 'to' ? 'to' : 'from'; return s[0] === s[0].toUpperCase() ? w[0].toUpperCase() + w.slice(1) : w; }));
    return o && o.type === 'date' && o !== inp ? o : null;
  }
  function setVal(inp, v) {
    if (NIN.get.call(inp) === v) return;
    NIN.set.call(inp, v);
    inp.dispatchEvent(new Event('input', { bubbles: true })); inp.dispatchEvent(new Event('change', { bubbles: true }));
    if (inp.__fdSync) inp.__fdSync();
  }

  function enhanceDate(inp) {
    if (inp.__fs || inp.hasAttribute('data-native') || !inp.parentNode) return;
    inp.__fs = 1;
    var b = document.createElement('button'); b.type = 'button';
    b.className = 'fs-btn fd-btn ' + (inp.className || '');
    b.setAttribute('aria-haspopup', 'dialog'); b.setAttribute('aria-expanded', 'false');
    var lbl = inp.id && document.querySelector('label[for="' + inp.id + '"]');
    var lab = inp.getAttribute('aria-label') || (lbl ? lbl.textContent.replace(/\*/g, '').trim() : '');
    if (inp.style.width) b.style.width = inp.style.width;
    b.innerHTML = '<span class="fs-v"></span><span class="fs-c">' + CAL + '</span>';
    inp.parentNode.insertBefore(b, inp.nextSibling);
    inp.classList.add('fs-native'); inp.tabIndex = -1; inp.setAttribute('aria-hidden', 'true');
    inp.__fsb = b; b.__fss = inp;
    var sync = function () {
      var d = pd(NIN.get.call(inp)), v = b.querySelector('.fs-v');
      v.textContent = d ? fmt(d, LONG) : (inp.placeholder || (isEn() ? 'Choose a date' : 'اختر التاريخ'));
      b.classList.toggle('fs-ph', !d); b.disabled = inp.disabled;
      b.setAttribute('aria-label', (lab ? lab + ': ' : '') + (d ? fmt(d, LONG) : (isEn() ? 'no date' : 'لم يُحدَّد')));
      var bad = inp.getAttribute('aria-invalid'); if (bad) b.setAttribute('aria-invalid', bad); else b.removeAttribute('aria-invalid');
      b.title = d ? hij(d) : '';
    };
    try { Object.defineProperty(inp, 'value', { configurable: true, get: function () { return NIN.get.call(this); }, set: function (x) { NIN.set.call(this, x); sync(); } }); } catch (e) { }
    inp.__fdSync = sync; sync();
    inp.addEventListener('change', sync); inp.addEventListener('input', sync);
    new MutationObserver(sync).observe(inp, { attributes: true, attributeFilter: ['disabled', 'aria-invalid', 'value', 'placeholder'] });
    inp.addEventListener('focus', function () { b.focus(); });
    b.addEventListener('click', function () { if (OPEN && OPEN.b === b) close(); else openDate(b); });
    b.addEventListener('keydown', function (e) {
      if (OPEN && OPEN.b === b) return;
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].indexOf(e.key) > -1) { e.preventDefault(); openDate(b); }
      else if ((e.key === 'Delete' || e.key === 'Backspace') && !inp.required && NIN.get.call(inp)) { e.preventDefault(); setVal(inp, ''); }
    });
  }

  function openDate(b) {
    close(); var inp = b.__fss; if (!inp || inp.disabled) return;
    var en = isEn(), cs = getComputedStyle(b);
    var pop = document.createElement('div'); pop.className = 'fs-pop fd-pop'; pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-label', en ? 'Choose a date' : 'اختيار التاريخ');
    pop.dir = getComputedStyle(b.parentNode).direction || 'rtl';
    var dark = (function (c) { var m = c.match(/\d+/g); if (!m) return false; return (0.299 * m[0] + 0.587 * m[1] + 0.114 * m[2]) < 140; })(cs.color) === false;
    pop.classList.toggle('fs-dark', dark);
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var sel = pd(NIN.get.call(inp)), mn = pd(inp.min), mx = pd(inp.max);
    var fromI = mate(inp, 'from'), toI = mate(inp, 'to');
    var lo = fromI ? pd(NIN.get.call(fromI)) : null, hi = toI ? pd(NIN.get.call(toI)) : null;
    if (lo && (!mn || lo > mn)) mn = lo;
    var ok = function (d) { return !(mn && d < mn) && !(mx && d > mx); };
    var act = new Date(sel || (lo && lo > today ? lo : null) || (mn && mn > today ? mn : null) || (mx && mx < today ? mx : null) || today);
    var mode = 'd', hov = null;
    var wd = en ? ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] : ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
    var MN = function (m, o) { return fmt(new Date(2000, m, 1), { month: o || 'long' }); };
    var foot = function () {
      var x = hov || sel || today, h = hij(x);
      var t = (+x === +today && !hov && !sel ? (en ? 'Today · ' : 'اليوم · ') : '') + (h ? (en ? h + ' AH' : 'يوافق ' + h) : '');
      var el = pop.querySelector('.fd-hj'); if (el) el.textContent = t;
    };
    var draw = function (focus) {
      var y = act.getFullYear(), m = act.getMonth(), ys = Math.floor(y / 20) * 20, h = '';
      var title = mode === 'd' ? MN(m) + ' ' + y : mode === 'm' ? String(y) : ys + ' – ' + (ys + 19);
      h += '<div class="fd-hd"><button type="button" class="fd-nav" data-nav="-1" aria-label="' + (en ? 'Previous' : 'السابق') + '">' + ARR + '</button>' +
        '<button type="button" class="fd-ttl" data-ttl aria-label="' + (mode === 'y' ? title : (en ? 'Choose ' : 'اختر ') + (mode === 'd' ? (en ? 'month and year' : 'الشهر والسنة') : (en ? 'year' : 'السنة'))) + '">' + title + (mode === 'y' ? '' : CHEV) + '</button>' +
        '<button type="button" class="fd-nav nx" data-nav="1" aria-label="' + (en ? 'Next' : 'التالي') + '">' + ARR + '</button></div>';
      if (mode === 'd') {
        h += '<div class="fd-g" role="grid">' + wd.map(function (w, i) { return '<span class="fd-wd' + (i > 4 ? ' we' : '') + '" aria-hidden="true">' + w + '</span>'; }).join('');
        var first = new Date(y, m, 1), start = new Date(y, m, 1 - first.getDay());
        var rA = fromI ? lo : sel, rB = fromI ? sel : hi;
        for (var i = 0; i < 42; i++) {
          var d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i), c = 'fd-d', dw = d.getDay();
          if (d.getMonth() !== m) c += ' out';
          if (+d === +today) c += ' td';
          if (dw === 5 || dw === 6) c += ' we';
          if (rA && rB && rA <= rB && d >= rA && d <= rB) { c += ' rg'; if (+d === +rA) c += ' rs'; if (+d === +rB) c += ' re'; }
          if (sel && +d === +sel) c += ' on';
          var dis = !ok(d); if (dis) c += ' dis';
          h += '<button type="button" class="' + c + '" data-d="' + iso(d) + '" tabindex="' + (+d === +act ? 0 : -1) + '"' + (dis ? ' aria-disabled="true"' : '') + (sel && +d === +sel ? ' aria-pressed="true"' : '') + ' aria-label="' + fmt(d, LONG) + '">' + d.getDate() + '</button>';
        }
        h += '</div>';
      } else if (mode === 'm') {
        h += '<div class="fd-ms">';
        for (var k = 0; k < 12; k++) {
          var on = sel && sel.getFullYear() === y && sel.getMonth() === k, tdm = today.getFullYear() === y && today.getMonth() === k;
          var mdis = (mn && new Date(y, k + 1, 0) < mn) || (mx && new Date(y, k, 1) > mx);
          h += '<button type="button" class="fd-c' + (on ? ' on' : '') + (tdm ? ' td' : '') + (mdis ? ' dis' : '') + '" data-m="' + k + '" tabindex="' + (k === m ? 0 : -1) + '">' + MN(k) + '</button>';
        }
        h += '</div>';
      } else {
        h += '<div class="fd-ms fd-ys">';
        for (var j = ys; j < ys + 20; j++) {
          var yon = sel && sel.getFullYear() === j, ydis = (mn && j < mn.getFullYear()) || (mx && j > mx.getFullYear());
          h += '<button type="button" class="fd-c' + (yon ? ' on' : '') + (today.getFullYear() === j ? ' td' : '') + (ydis ? ' dis' : '') + '" data-y="' + j + '" tabindex="' + (j === y ? 0 : -1) + '">' + j + '</button>';
        }
        h += '</div>';
      }
      var canToday = ok(today), canClear = !inp.required && !!sel;
      h += '<div class="fd-ft"><span class="fd-hj"></span>' + (canClear ? '<button type="button" class="fd-a cl" data-clear>' + (en ? 'Clear' : 'مسح') + '</button>' : '') + (canToday ? '<button type="button" class="fd-a" data-today>' + (en ? 'Today' : 'اليوم') + '</button>' : '') + '</div>';
      pop.innerHTML = h; foot();
      if (focus) { var f = pop.querySelector('.fd-g [tabindex="0"], .fd-ms [tabindex="0"]'); if (f) f.focus({ preventScroll: true }); }
    };
    var pick = function (v) { var d = pd(v); if (!d || !ok(d)) return; close(); setVal(inp, v); b.focus(); };
    document.body.appendChild(pop);
    draw(false);
    var place = function () {
      var r = b.getBoundingClientRect(), vw = window.innerWidth, vh = window.innerHeight;
      if (vw < 560) { pop.classList.add('sheet'); pop.style.left = ''; pop.style.top = ''; pop.style.width = ''; return; }
      pop.classList.remove('sheet');
      var w = Math.min(330, vw - 16); pop.style.width = w + 'px';
      var left = pop.dir === 'rtl' ? r.right - w : r.left; pop.style.left = Math.max(8, Math.min(left, vw - w - 8)) + 'px';
      var h = pop.offsetHeight, below = vh - r.bottom - 10, above = r.top - 10, up = below < h && above > below;
      pop.style.top = Math.max(8, up ? r.top - h - 6 : Math.min(r.bottom + 6, vh - h - 8)) + 'px';
      pop.classList.toggle('up', up);
    };
    place();
    b.setAttribute('aria-expanded', 'true'); b.classList.add('fs-open');
    pop.addEventListener('mousedown', function (e) { e.preventDefault(); });
    pop.addEventListener('click', function (e) {
      var t = e.target.closest('button'); if (!t) return;
      if (t.dataset.d) { pick(t.dataset.d); return; }
      if (t.hasAttribute('data-today')) { pick(iso(today)); return; }
      if (t.hasAttribute('data-clear')) { close(); setVal(inp, ''); b.focus(); return; }
      if (t.dataset.nav) { var n = +t.dataset.nav; act = mode === 'd' ? addM(act, n) : new Date(act.getFullYear() + n * (mode === 'y' ? 20 : 1), act.getMonth(), 1); draw(true); place(); return; }
      if (t.hasAttribute('data-ttl')) { if (mode !== 'y') { mode = 'y'; draw(true); place(); } return; }
      if (t.dataset.y && !t.classList.contains('dis')) { act = new Date(+t.dataset.y, act.getMonth(), 1); mode = 'm'; draw(true); place(); return; }
      if (t.dataset.m && !t.classList.contains('dis')) { act = new Date(act.getFullYear(), +t.dataset.m, Math.min(act.getDate(), new Date(act.getFullYear(), +t.dataset.m + 1, 0).getDate())); mode = 'd'; draw(true); place(); }
    });
    pop.addEventListener('mouseover', function (e) { var t = e.target.closest('.fd-d'); var d = t ? pd(t.dataset.d) : null; if (+d !== +hov) { hov = d; foot(); } });
    pop.addEventListener('mouseleave', function () { if (hov) { hov = null; foot(); } });
    pop.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); if (mode !== 'd') { mode = 'd'; draw(true); place(); } else { close(); b.focus(); } return; }
      var t = e.target, rtl = pop.dir === 'rtl', k = e.key;
      if (t.classList.contains('fd-d')) {
        var delta = 0;
        if (k === 'ArrowLeft') delta = rtl ? 1 : -1; else if (k === 'ArrowRight') delta = rtl ? -1 : 1;
        else if (k === 'ArrowUp') delta = -7; else if (k === 'ArrowDown') delta = 7;
        else if (k === 'Home') delta = -act.getDay(); else if (k === 'End') delta = 6 - act.getDay();
        else if (k === 'PageUp' || k === 'PageDown') { e.preventDefault(); act = addM(act, (k === 'PageUp' ? -1 : 1) * (e.shiftKey ? 12 : 1)); draw(true); return; }
        else if (k === 'Enter' || k === ' ') { e.preventDefault(); pick(t.dataset.d); return; }
        else return;
        e.preventDefault(); act = new Date(act.getFullYear(), act.getMonth(), act.getDate() + delta); hov = act; draw(true); hov = null; return;
      }
      if (t.classList.contains('fd-c')) {
        var cols = mode === 'y' ? 4 : 3, list = [].slice.call(pop.querySelectorAll('.fd-c')), i = list.indexOf(t), nI = i;
        if (k === 'ArrowLeft') nI = i + (rtl ? 1 : -1); else if (k === 'ArrowRight') nI = i + (rtl ? -1 : 1); else if (k === 'ArrowUp') nI = i - cols; else if (k === 'ArrowDown') nI = i + cols;
        else return;
        e.preventDefault(); if (list[nI]) { t.tabIndex = -1; list[nI].tabIndex = 0; list[nI].focus(); }
      }
    });
    pop.addEventListener('focusout', function (e) { var r = e.relatedTarget; if (r && !pop.contains(r) && r !== b && OPEN && OPEN.pop === pop) close(); });
    OPEN = { b: b, pop: pop, key: function () { }, place: place };
    var f0 = pop.querySelector('.fd-g [tabindex="0"]'); if (f0) f0.focus({ preventScroll: true });
  }

  function scan(root) { var r = root || document; [].forEach.call(r.querySelectorAll('select'), enhance); [].forEach.call(r.querySelectorAll('input[type=date]'), enhanceDate); }
  var pending = 0;
  new MutationObserver(function (ms) {
    for (var i = 0; i < ms.length; i++) { var m = ms[i]; if (m.addedNodes && m.addedNodes.length) { if (!pending) pending = requestAnimationFrame(function () { pending = 0; scan(document); }); return; } }
  }).observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { scan(document); }); else scan(document);
  /* عند إعادة رسم الصفحة تُستبدل القائمة الأصلية؛ نزيل الأزرار اليتيمة */
  setInterval(function () { [].forEach.call(document.querySelectorAll('.fs-btn'), function (b) { if (!b.__fss || !b.__fss.isConnected) { if (OPEN && OPEN.b === b) close(); b.remove(); } }); }, 1500);
})();
