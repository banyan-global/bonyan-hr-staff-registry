/* صفحة قرار طلب الإجازة (تُفتح من أزرار البريد)
   فتح الرابط يعرض الطلب فقط؛ الاعتماد أو الرفض أو التعديل لا يُنفَّذ إلا بزر صريح (POST)،
   والرابط خاص بالمعتمد ولخطوته، وينتهي بمجرد حسمها. */
(function () {
  'use strict';
  var API = 'api/';
  var app = document.getElementById('app');
  var P = {}; (location.hash || '').replace(/^#/, '').split('&').forEach(function (kv) { var i = kv.indexOf('='); if (i > 0) P[kv.slice(0, i)] = decodeURIComponent(kv.slice(i + 1)); });
  var T = P.t || '', A = P.a || 'view', S = null, MODE = A === 'edit' ? 'edit' : 'view', BUSY = false, ED = null;
  try { var L = window.BONYAN_LOGOS && window.BONYAN_LOGOS.markWhite; if (L && L.src) document.getElementById('lg').src = L.src; else document.getElementById('lg').hidden = true; } catch (e) { }

  var IC = {
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>', edit: '<path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>', info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>', lock: '<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>'
  };
  function ic(k) { return '<svg class="i" viewBox="0 0 24 24" aria-hidden="true">' + IC[k] + '</svg>'; }
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pd(s) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || ''); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; }
  function fd(s) { var d = pd(s); if (!d) return s || ''; try { return d.toLocaleDateString('ar-SA-u-ca-gregory-nu-latn', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' }); } catch (e) { return s; } }
  function days(a, b) { var x = pd(a), y = pd(b); return x && y && y >= x ? Math.round((y - x) / 864e5) + 1 : 0; }
  function dn(n) { n = +n || 0; return n === 1 ? 'يوم واحد' : n === 2 ? 'يومان' : n + (n >= 3 && n <= 10 ? ' أيام' : ' يومًا'); }
  function api(body) {
    return fetch(API, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body), credentials: 'same-origin' })
      .then(function (r) { return r.json().catch(function () { return { ok: false, error: 'server_error' }; }); })
      .then(function (j) { if (!j || !j.ok) throw new Error(j && j.error === 'locked' ? 'محاولات كثيرة، حاول بعد قليل' : j && j.error === 'server_error' ? 'تعذّر الاتصال بالخادم، حاول مجددًا' : (j && j.error) || 'حدث خطأ'); return j; });
  }

  function trail(r) {
    var steps = [{ l: 'تقديم الطلب', st: 'ok', s: (r.createdAt || '').slice(0, 10) }].concat(r.chain.map(function (c, i) {
      var st = c.decision === 'approve' || c.decision === 'edit' ? 'ok' : c.decision === 'reject' ? 'x' : r.status === 'pending' && i === r.stage ? 'now' : '';
      return { l: c.label, st: st, s: c.decision === 'edit' ? 'عدّل واعتمد' : c.who && !c.decision ? c.who : (c.at || '').slice(0, 10) };
    }));
    return '<ol class="trail">' + steps.map(function (s, i) { return '<li class="' + s.st + '"><i>' + (s.st === 'ok' ? '✓' : s.st === 'x' ? '×' : i + 1) + '</i>' + esc(s.l) + (s.s ? '<small>' + esc(s.s) + '</small>' : '') + '</li>'; }).join('') + '</ol>';
  }
  function table(rows) { return '<table class="dt">' + rows.filter(function (r) { return r; }).map(function (r) { var v = r[1] === '' || r[1] == null ? '—' : esc(r[1]); return '<tr><td>' + esc(r[0]) + '</td><td>' + (r[2] && v !== '—' ? '<bdi dir="ltr">' + v + '</bdi>' : v) + '</td></tr>'; }).join('') + '</table>'; }
  function details(r) {
    var d = r.data || {}, s = r.staff || {}, mgr = '';
    if (r.type !== 'leave' && r.view) {
      var long = r.view.filter(function (x) { return x[3]; }), h0 = '<h2 class="sec">بيانات الطلب</h2>' + table([['اسم الموظف', r.name], ['المسمى الوظيفي', s.jobTitle], s.employeeNo ? ['الرقم الوظيفي', s.employeeNo] : null,
        ['الجهة / القسم', (s.entity || '') + (s.department ? ' - ' + s.department : '')]].concat(r.view.filter(function (x) { return !x[3]; }).map(function (x) { return [x[0], /^\d{4}-\d{2}-\d{2}$/.test(x[1]) ? fd(x[1]) : x[1], x[2] && !/^\d{4}-\d{2}-\d{2}$/.test(x[1]) ? 1 : 0]; })));
      long.forEach(function (x) { h0 += '<div class="box"><b>' + esc(x[0]) + '</b>' + esc(x[1]) + '</div>'; });
      r.chain.forEach(function (c) { if (c.decision && c.note) h0 += '<div class="box' + (c.decision === 'reject' ? ' r' : '') + '"><b>' + (c.decision === 'reject' ? 'سبب الرفض من ' : 'ملاحظة ') + esc(c.label) + '</b>' + esc(c.note) + '</div>'; });
      return h0;
    }
    r.chain.forEach(function (c) { if (c.mgr) mgr = c.who || ''; });
    var h = '<h2 class="sec">بيانات الطلب</h2>' + table([['اسم الموظف', r.name], ['المسمى الوظيفي', s.jobTitle], s.employeeNo ? ['الرقم الوظيفي', s.employeeNo] : null,
      ['الجهة / القسم', (s.entity || '') + (s.department ? ' - ' + s.department : '')], ['نوع الإجازة', d.kind], ['فترة الإجازة', fd(d.from) + ' إلى ' + fd(d.to)], ['عدد الأيام', dn(d.days)],
      ['سبب الإجازة', d.reason || d.note || ''], ['رقم التواصل', d.contact || s.mobile, 1], ['البريد الإلكتروني', s.email, 1], d.address ? ['العنوان أثناء الإجازة', d.address] : null, mgr ? ['المسؤول المباشر', mgr] : null]);
    if (d.substitute) h += '<div class="sub"><div class="t">👤 الموظف البديل أثناء الإجازة</div>' + table([['الاسم', d.substitute], ['المسمى الوظيفي', d.subTitle], d.subNo ? ['الرقم الوظيفي', d.subNo, 1] : null]) + '</div>';
    r.chain.forEach(function (c) {
      if (!c.decision) return;
      if (c.changes && c.changes.length) h += '<h2 class="sec">ما الذي غيّره ' + esc(c.label) + '</h2><table class="ch"><tr><th>الحقل</th><th>السابق</th><th>الجديد</th></tr>' + c.changes.map(function (x) { return '<tr><td>' + esc(x[0]) + '</td><td class="o">' + esc(x[1] || '—') + '</td><td class="n">' + esc(x[2] || '—') + '</td></tr>'; }).join('') + '</table>';
      if (c.note) h += '<div class="box' + (c.decision === 'reject' ? ' r' : c.decision === 'edit' ? ' g' : '') + '"><b>' + (c.decision === 'reject' ? 'سبب الرفض من ' : 'ملاحظة ') + esc(c.label) + '</b>' + esc(c.note) + '</div>';
    });
    return h;
  }
  function head(r) {
    document.getElementById('ent').textContent = (r.staff && r.staff.entity) || 'مجموعة بنيان العالمية';
    var no = document.getElementById('no'); no.textContent = r.no; no.hidden = false;
    document.title = (r.typeName || 'طلب إجازة') + ' ' + r.no + ' · ' + r.name;
    if (r.type !== 'leave') { document.getElementById('ttl').textContent = r.typeName || 'طلب'; var f2 = document.querySelector('.ft2'); if (f2) f2.textContent = 'مجموعة بنيان العالمية - منصة بنيان للموارد البشرية'; }
  }
  var STN = { approved: 'معتمد نهائيًا', rejected: 'مرفوض', cancelled: 'ملغى من صاحبه', pending: 'قيد الإجراء' };

  function viewHTML() {
    var r = S.request, h = '';
    if (S.open) {
      h += '<div class="hi"><span class="ico">' + ic('clock') + '</span><div><b>' + (S.who ? 'مرحبًا ' + esc(S.who) + '، ' : '') + 'هذا الطلب بانتظار قرارك</b><span>بصفتك: ' + esc(S.stageLabel) + (S.isLast ? ' (الاعتماد النهائي)' : '') + '. راجع البيانات ثم اختر القرار.</span></div></div>';
    } else {
      var st = r.status, cur = r.chain[r.stage] || {};
      h += '<div class="hi ' + (st === 'approved' ? 'done' : st === 'rejected' || st === 'cancelled' ? 'bad' : '') + '"><span class="ico">' + ic(st === 'approved' ? 'check' : st === 'pending' ? 'clock' : 'x') + '</span><div><b>تم اتخاذ القرار في خطوتك مسبقًا</b><span>حالة الطلب الآن: ' + esc(STN[st] || st) + (st === 'pending' && cur.label ? '، وهو عند ' + esc(cur.label) : '') + '. لا يلزمك أي إجراء.</span></div></div>';
    }
    h += trail(r) + details(r);
    if (S.open) {
      h += '<div class="dec" id="dec"><label for="note">ملاحظة ' + (S.canEdit ? 'تصل للموظف' + (S.isLast ? '' : ' وللمرحلة التالية') : 'تصل للموظف') + '</label>' +
        '<textarea id="note" maxlength="600" placeholder="اختيارية عند الاعتماد، وإلزامية عند الرفض"' + (A === 'reject' ? ' class="need"' : '') + '></textarea>' +
        '<div class="hint">' + (A === 'reject' ? 'اكتب سبب الرفض ليصل إلى الموظف، ثم اضغط «رفض الطلب».' : 'القرار يُسجَّل باسمك ووقته، ويصل الموظف بريد بالنتيجة.') + '</div>' +
        '<div class="err" id="err" role="alert"></div>' +
        '<div class="acts' + (S.canEdit ? '' : ' two') + '"><button class="btn b-ok' + (A === 'approve' ? ' pick' : '') + '" data-do="approve">' + ic('check') + (S.isLast ? 'اعتماد نهائي' : 'اعتماد الطلب') + '</button>' +
        (S.canEdit ? '<button class="btn b-ed" data-do="edit">' + ic('edit') + 'تعديل قبل الاعتماد</button>' : '') +
        '<button class="btn b-no' + (A === 'reject' ? ' pick' : '') + '" data-do="reject">' + ic('x') + 'رفض الطلب</button></div></div>';
    }
    return h;
  }
  function editHTML() {
    var d = ED, n = days(d.from, d.to), kinds = S.leaveKinds || [];
    if (kinds.indexOf(d.kind) < 0 && d.kind) kinds = [d.kind].concat(kinds);
    return '<div class="hi"><span class="ico">' + ic('edit') + '</span><div><b>تعديل الطلب قبل الاعتماد</b><span>غيّر ما يلزم ثم احفظ؛ يُعتمد الطلب بعد التعديل ويصل الموظف' + (S.isLast ? '' : ' والمرحلة التالية') + ' جدول بما تغيّر.</span></div></div>' +
      '<div class="grid">' +
      '<div class="fl w"><label for="e_kind">نوع الإجازة</label><select id="e_kind">' + kinds.map(function (k) { return '<option' + (k === d.kind ? ' selected' : '') + '>' + esc(k) + '</option>'; }).join('') + '</select></div>' +
      '<div class="fl"><label for="e_from">تاريخ البداية</label><input id="e_from" type="date" value="' + esc(d.from) + '"></div>' +
      '<div class="fl"><label for="e_to">تاريخ النهاية</label><input id="e_to" type="date" value="' + esc(d.to) + '"></div>' +
      '<div class="w"><div class="days" id="e_days">' + ic('clock') + (n ? 'المدة: ' + dn(n) + ' (أيام تقويمية شاملة اليومين)' : 'تاريخ النهاية يجب أن يكون في يوم البداية أو بعده') + '</div></div>' +
      '<div class="fl w"><label for="e_reason">سبب الإجازة</label><textarea id="e_reason" maxlength="1500">' + esc(d.reason) + '</textarea></div>' +
      '<div class="fl"><label for="e_sub">اسم الموظف البديل</label><input id="e_sub" value="' + esc(d.substitute) + '" maxlength="120"></div>' +
      '<div class="fl"><label for="e_subT">المسمى الوظيفي للبديل</label><input id="e_subT" value="' + esc(d.subTitle) + '" maxlength="120"></div>' +
      '<div class="fl"><label for="e_subN">الرقم الوظيفي للبديل (اختياري)</label><input id="e_subN" value="' + esc(d.subNo) + '" maxlength="40" dir="ltr"></div>' +
      '<div class="fl w"><label for="note">ملاحظة للموظف' + (S.isLast ? '' : ' وللمرحلة التالية') + ' (اختيارية)</label><textarea id="note" maxlength="600" placeholder="مثال: عُدّلت البداية لتناسب جدول القسم">' + esc(d.note || '') + '</textarea></div>' +
      '</div><div class="err" id="err" role="alert"></div>' +
      '<div class="acts two"><button class="btn b-ghost" data-do="back">رجوع دون حفظ</button><button class="btn b-ed" data-do="save">' + ic('check') + 'حفظ التعديلات واعتماد الطلب</button></div>';
  }
  function resultHTML(kind) {
    var r = S.request, ok = kind !== 'reject';
    var t = kind === 'reject' ? 'رُفض الطلب' : kind === 'edit' ? 'حُفظت التعديلات واعتُمد الطلب' : r.status === 'approved' ? 'اعتُمد الطلب نهائيًا' : 'اعتُمد الطلب';
    var p = kind === 'reject' ? 'وصل الموظف بريد بالرفض وسببه.' : r.status === 'approved' ? 'وصل الموظف بريد بالاعتماد النهائي.' : 'انتقل الطلب إلى ' + esc((r.chain[r.stage] || {}).label || 'المرحلة التالية') + '، ووصل الموظف بريد بذلك' + (kind === 'edit' ? ' مع جدول التعديلات.' : '.');
    return '<div class="res"><div class="big' + (ok ? '' : ' r') + '">' + ic(ok ? 'check' : 'x') + '</div><h3>' + t + '</h3><p>' + p + '</p></div>' + trail(r) + details(r);
  }
  function draw(html) { app.innerHTML = html; bind(); }
  function bind() {
    app.querySelectorAll('[data-do]').forEach(function (b) { b.addEventListener('click', function () { act(b.getAttribute('data-do')); }); });
    var f = document.getElementById('e_from'), t = document.getElementById('e_to');
    if (f && t) [f, t].forEach(function (x) { x.addEventListener('change', function () { var n = days(f.value, t.value); document.getElementById('e_days').innerHTML = ic('clock') + (n ? 'المدة: ' + dn(n) + ' (أيام تقويمية شاملة اليومين)' : 'تاريخ النهاية يجب أن يكون في يوم البداية أو بعده'); }); });
    var note = document.getElementById('note');
    if (note && A === 'reject' && MODE === 'view') setTimeout(function () { note.focus(); }, 60);
  }
  function err(m) { var e = document.getElementById('err'); if (e) e.textContent = m; }
  function lock(on) { BUSY = on; app.querySelectorAll('button').forEach(function (b) { b.disabled = on; }); }
  function act(k) {
    if (BUSY) return;
    if (k === 'edit') { var d = S.request.data || {}; ED = { kind: d.kind, from: d.from, to: d.to, reason: d.reason || d.note || '', substitute: d.substitute || '', subTitle: d.subTitle || '', subNo: d.subNo || '', note: (document.getElementById('note') || {}).value || '' }; MODE = 'edit'; draw(editHTML()); window.scrollTo(0, 0); return; }
    if (k === 'back') { MODE = 'view'; draw(viewHTML()); return; }
    var note = (document.getElementById('note') || {}).value || '';
    var body = { action: 'reqActDo', t: T, decision: k === 'save' ? 'edit' : k, note: note.trim() };
    if (k === 'reject' && note.trim().length < 3) { var n = document.getElementById('note'); n.classList.add('need'); n.focus(); err('اكتب سبب الرفض ليصل إلى الموظف.'); return; }
    if (k === 'save') {
      var v = function (id) { return (document.getElementById(id).value || '').trim(); };
      body.edits = { kind: v('e_kind'), from: v('e_from'), to: v('e_to'), reason: v('e_reason'), substitute: v('e_sub'), subTitle: v('e_subT'), subNo: v('e_subN') };
      ED = Object.assign({}, body.edits, { note: note });
      if (!days(body.edits.from, body.edits.to)) { err('تاريخ النهاية يجب أن يكون في يوم البداية أو بعده.'); return; }
      if (body.edits.reason.length < 3) { err('اكتب سبب الإجازة (3 أحرف على الأقل).'); return; }
    }
    lock(true); err('');
    api(body).then(function (j) { S = j; head(S.request); draw(resultHTML(body.decision)); window.scrollTo(0, 0); })
      .catch(function (e) { lock(false); err(e.message); });
  }

  window.addEventListener('hashchange', function () { location.reload(); });
  if (!/^[a-f0-9]{48}$/.test(T)) { draw('<div class="hi bad"><span class="ico">' + ic('lock') + '</span><div><b>الرابط غير مكتمل</b><span>افتح الرابط كما وصلك في البريد دون تعديل، أو ادخل إلى المنصة لاتخاذ القرار.</span></div></div>'); return; }
  api({ action: 'reqAct', t: T }).then(function (j) {
    S = j; head(S.request);
    if (MODE === 'edit' && S.canEdit) act('edit'); else { MODE = 'view'; draw(viewHTML()); }
    if (A === 'approve' && S.open) { var b = app.querySelector('[data-do="approve"]'); if (b) setTimeout(function () { b.scrollIntoView({ block: 'center', behavior: 'smooth' }); b.focus({ preventScroll: true }); }, 250); }
  }).catch(function (e) {
    draw('<div class="hi bad"><span class="ico">' + ic('lock') + '</span><div><b>تعذّر فتح الطلب</b><span>' + esc(e.message) + '</span></div></div>');
  });
})();
