/* صفحة الوظائف العامة: عرض الوظائف المعلنة والتقديم عليها مع السيرة الذاتية (PDF) */
(function () {
  'use strict';
  var app = document.getElementById('app');
  try { var L = window.BONYAN_LOGOS && window.BONYAN_LOGOS.markWhite; if (L && L.src) document.getElementById('lg').src = L.src; else document.getElementById('lg').hidden = true; } catch (e) { }
  try { document.querySelectorAll('.oj2-year').forEach(function (x) { x.textContent = new Date().getFullYear(); }); } catch (e) { }
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fd(s) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || ''); if (!m) return ''; try { return new Date(+m[1], +m[2] - 1, +m[3]).toLocaleDateString('ar-SA-u-ca-gregory-nu-latn', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return s; } }
  function api(b) { return fetch('api/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }).then(function (r) { return r.json(); }).then(function (j) { if (!j || !j.ok) throw new Error(j && j.error === 'locked' ? 'محاولات كثيرة، حاول بعد ساعة' : (j && j.error) || 'تعذّر الاتصال'); return j; }); }
  var JOBS = [], OPEN = '';
  function card(j) {
    return '<article class="job" id="j-' + j.slug + '"><h2>' + esc(j.title) + '</h2><div class="meta">' + [j.entity, j.location, j.kind].filter(Boolean).map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + (j.count > 1 ? '<span>' + j.count + ' شواغر</span>' : '') + (j.closesOn ? '<span class="g">التقديم حتى ' + fd(j.closesOn) + '</span>' : '') + '</div>' +
      '<p>' + esc(j.desc) + '</p>' + (j.quals ? '<h3>المؤهلات والخبرات</h3><p>' + esc(j.quals) + '</p>' : '') +
      (OPEN === j.slug ? form(j) : '<div class="acts"><button class="btn gold" data-apply="' + j.slug + '">التقديم على الوظيفة</button></div>') + '</article>';
  }
  function form(j) {
    var f = function (id, lab, type, ph, w, extra) { return '<div' + (w ? ' class="w"' : '') + '><label for="' + id + '">' + lab + '</label><input id="' + id + '" type="' + (type || 'text') + '"' + (ph ? ' placeholder="' + ph + '"' : '') + (extra || '') + '></div>'; };
    return '<form class="ap" id="apf" novalidate>' + f('a_name', 'الاسم الكامل *', 'text', 'كما في الهوية', 1, ' autocomplete="name"') + f('a_mail', 'البريد الإلكتروني *', 'email', 'name@example.com', 0, ' dir="ltr" autocomplete="email"') + f('a_phone', 'الجوال مع رمز الدولة *', 'tel', '+9665xxxxxxxx', 0, ' dir="ltr" autocomplete="tel"') +
      f('a_city', 'المدينة', 'text') + f('a_nat', 'الجنسية', 'text') + f('a_edu', 'أعلى مؤهل وتخصصه', 'text', 'مثال: بكالوريوس شريعة') + f('a_years', 'سنوات الخبرة', 'number', '0', 0, ' min="0" max="50" dir="ltr"') +
      '<div class="w"><label for="a_note">نبذة عنك وسبب اهتمامك بالوظيفة</label><textarea id="a_note" maxlength="1500"></textarea></div>' +
      '<div class="w"><label for="a_cv">السيرة الذاتية (PDF حتى 5 ميجابايت)</label><input id="a_cv" type="file" accept="application/pdf"></div>' +
      '<div class="hp" aria-hidden="true"><label for="a_web">الموقع</label><input id="a_web" tabindex="-1" autocomplete="off"></div>' +
      '<label class="ck w"><input type="checkbox" id="a_ok"><span>أوافق على استخدام بياناتي لأغراض التوظيف في مجموعة بنيان العالمية، وأقر بصحتها.</span></label>' +
      '<div class="err w" id="a_err" role="alert"></div><div class="acts w"><button class="btn gold" type="submit" id="a_send">إرسال الطلب</button><button class="btn ghost" type="button" id="a_cancel">إلغاء</button></div></form>';
  }
  function draw() {
    app.innerHTML = JOBS.length ? JOBS.map(card).join('') : '<div class="empty"><b>لا وظائف متاحة حاليًا</b><br>تابعنا؛ نعلن الوظائف هنا فور توفرها.</div>';
    app.querySelectorAll('[data-apply]').forEach(function (b) { b.onclick = function () { OPEN = b.getAttribute('data-apply'); draw(); var el = document.getElementById('a_name'); if (el) el.focus(); }; });
    var fm = document.getElementById('apf'); if (!fm) return;
    document.getElementById('a_cancel').onclick = function () { OPEN = ''; draw(); };
    fm.onsubmit = function (e) {
      e.preventDefault(); var v = function (id) { return (document.getElementById(id).value || '').trim(); }, er = document.getElementById('a_err'), btn = document.getElementById('a_send');
      if (v('a_name').length < 5) return void (er.textContent = 'اكتب اسمك الكامل.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('a_mail'))) return void (er.textContent = 'اكتب بريدًا إلكترونيًا صحيحًا.');
      if (v('a_phone').replace(/\D/g, '').length < 8) return void (er.textContent = 'اكتب رقم جوال صحيحًا مع رمز الدولة.');
      if (!document.getElementById('a_ok').checked) return void (er.textContent = 'ضع علامة الموافقة قبل الإرسال.');
      var file = document.getElementById('a_cv').files[0];
      if (file && (file.type !== 'application/pdf' || file.size > 5 * 1024 * 1024)) return void (er.textContent = 'السيرة الذاتية يجب أن تكون PDF وحجمها حتى 5 ميجابايت.');
      btn.disabled = true; btn.textContent = 'جارٍ الإرسال…'; er.textContent = '';
      var send = function (cv) {
        api({ action: 'jobApply', slug: OPEN, name: v('a_name'), email: v('a_mail'), phone: v('a_phone'), city: v('a_city'), nationality: v('a_nat'), edu: v('a_edu'), years: v('a_years'), note: v('a_note'), cv: cv || '', website: v('a_web'), consent: 1 })
          .then(function () { var art = document.getElementById('j-' + OPEN); fm.outerHTML = '<div class="ok">وصل طلبك بنجاح، وأرسلنا تأكيدًا إلى بريدك. شكرًا لاهتمامك، وسنتواصل معك إن ناسب ملفك الاحتياج.</div>'; OPEN = ''; if (art) art.scrollIntoView({ block: 'center', behavior: 'smooth' }); })
          .catch(function (x) { btn.disabled = false; btn.textContent = 'إرسال الطلب'; er.textContent = x.message; });
      };
      if (file) { var rd = new FileReader(); rd.onload = function () { send(rd.result); }; rd.onerror = function () { btn.disabled = false; btn.textContent = 'إرسال الطلب'; er.textContent = 'تعذّر قراءة الملف.'; }; rd.readAsDataURL(file); } else send('');
    };
  }
  api({ action: 'jobsPublic' }).then(function (j) { JOBS = j.jobs || []; var h = (location.hash || '').slice(1); if (h && JOBS.some(function (x) { return x.slug === h; })) OPEN = h; draw(); })
    .catch(function (e) { app.innerHTML = '<div class="empty">' + esc(e.message) + '</div>'; });
})();
