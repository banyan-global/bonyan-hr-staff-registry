/* قوائم منسدلة موحّدة لكل صفحات المنصة: تحوّل أي <select> إلى قائمة أنيقة بنفس هوية الصفحة،
   مع البحث (للقوائم الطويلة) والتنقل بالأسهم وEnter وEsc والكتابة للقفز إلى خيار.
   القائمة الأصلية تبقى مخفية في مكانها وتُحدَّث قيمتها ويُطلق حدث change، فلا يتغير شيء في منطق الصفحات. */
(function () {
  'use strict';
  if (window.__fancySelect) return; window.__fancySelect = 1;
  var OPEN = null, SEQ = 0;
  (function () { var st = document.createElement('style'); st.id = 'fs-css'; st.textContent = ".fs-native{position:absolute!important;width:1px!important;height:1px!important;opacity:0!important;pointer-events:none!important;overflow:hidden!important;clip:rect(0 0 0 0)!important;margin:0!important;padding:0!important;border:0!important}\n.fs-btn{appearance:none;-webkit-appearance:none;display:flex;align-items:center;gap:10px;width:100%;min-width:0;min-height:44px;padding:0 12px 0 10px;padding-inline:14px 8px;border-radius:13px;border:1px solid rgba(120,135,160,.35);background:rgba(127,140,160,.07);color:inherit;font:inherit;font-size:14px;cursor:pointer;text-align:start;transition:border-color .15s,box-shadow .15s,background .15s;background-image:none!important}\n.fs-btn:hover:not(:disabled){border-color:rgba(185,143,69,.6)}\n.fs-btn:focus-visible,.fs-btn.fs-open{outline:none;border-color:#c9a35e;box-shadow:0 0 0 4px rgba(227,196,133,.28)}\n.fs-btn:disabled{opacity:.55;cursor:not-allowed}\n.fs-btn .fs-v{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:700}\n.fs-btn.fs-ph .fs-v{font-weight:600;opacity:.6}\n.fs-btn .fs-c{flex:none;width:26px;height:26px;border-radius:8px;display:grid;place-items:center;background:rgba(185,143,69,.12);color:#b38a3e;transition:transform .2s,background .2s}\n.fs-btn .fs-c svg{width:15px;height:15px}\n.fs-btn.fs-open .fs-c{transform:rotate(180deg);background:rgba(185,143,69,.22)}\n.fs-pop{position:fixed;z-index:2147483000;display:flex;flex-direction:column;min-width:200px;padding:6px;border-radius:16px;background:#fff;color:#172036;border:1px solid rgba(20,35,64,.12);box-shadow:0 24px 54px -14px rgba(10,22,44,.4),0 2px 6px rgba(10,22,44,.08);font-family:inherit;font-size:14px;animation:fsIn .14s ease-out;overflow:hidden}\n.fs-pop.up{animation-name:fsUp}\n@keyframes fsIn{from{opacity:0;transform:translateY(-4px) scale(.98)}to{opacity:1;transform:none}}\n@keyframes fsUp{from{opacity:0;transform:translateY(4px) scale(.98)}to{opacity:1;transform:none}}\n.fs-pop.fs-dark{background:#17233a;color:#eef3fb;border-color:rgba(227,196,133,.28);box-shadow:0 24px 54px -14px rgba(0,0,0,.6)}\n.fs-q{padding:2px 2px 6px}\n.fs-q input{width:100%;height:38px;border-radius:11px;border:1px solid rgba(120,135,160,.3);background:rgba(127,140,160,.08);color:inherit;font:inherit;font-size:13.5px;padding:0 12px;outline:none}\n.fs-q input:focus{border-color:#c9a35e;box-shadow:0 0 0 3px rgba(227,196,133,.25)}\n.fs-list{overflow:auto;display:grid;gap:2px;overscroll-behavior:contain}\n.fs-o{display:flex;align-items:center;gap:10px;min-height:40px;padding:8px 12px;border-radius:10px;cursor:pointer;line-height:1.4}\n.fs-o span{flex:1;min-width:0}\n.fs-o i{flex:none;width:18px;height:18px;display:grid;place-items:center;color:#b38a3e;opacity:0}\n.fs-o i svg{width:16px;height:16px}\n.fs-o.act{background:rgba(127,140,160,.12)}\n.fs-o.on{background:rgba(227,196,133,.2);font-weight:800}\n.fs-pop.fs-dark .fs-o.on{background:rgba(227,196,133,.16);color:#f3dca6}\n.fs-o.on i{opacity:1}\n.fs-o.ph{opacity:.65}\n.fs-o.off{opacity:.4;cursor:not-allowed}\n.fs-none{padding:16px;text-align:center;opacity:.6;font-weight:700}\n@media (prefers-reduced-motion:reduce){.fs-pop{animation:none}}"; (document.head || document.documentElement).appendChild(st); })();
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
  window.addEventListener('resize', function () { if (OPEN) close(); });
  document.addEventListener('scroll', function (e) { if (OPEN && !OPEN.pop.contains(e.target)) close(); }, true);

  function scan(root) { [].forEach.call((root || document).querySelectorAll('select'), enhance); }
  var pending = 0;
  new MutationObserver(function (ms) {
    for (var i = 0; i < ms.length; i++) { var m = ms[i]; if (m.addedNodes && m.addedNodes.length) { if (!pending) pending = requestAnimationFrame(function () { pending = 0; scan(document); }); return; } }
  }).observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { scan(document); }); else scan(document);
  /* عند إعادة رسم الصفحة تُستبدل القائمة الأصلية؛ نزيل الأزرار اليتيمة */
  setInterval(function () { [].forEach.call(document.querySelectorAll('.fs-btn'), function (b) { if (!b.__fss || !b.__fss.isConnected) { if (OPEN && OPEN.b === b) close(); b.remove(); } }); }, 1500);
})();
