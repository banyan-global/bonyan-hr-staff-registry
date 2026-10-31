/* ============================================================
   Bonyan HR — صفحة «تحديث بياناتي» (update.html)
   ١) يكتب المنسوب رقمه المرجعي، ويُتحقق منه برابط رسالته الخاص أو ببريده/جواله المسجّل
   ٢) تظهر بياناته في أقسام، فيفتح القسم الذي يريد تعديله فقط، ويستبدل أي مرفق
   ٣) تُحفظ التغييرات فقط في الجدول، وتُجدَّد بطاقته، وتصله رسالة «تم تحديث بياناتكم» بلغة الصفحة
   ============================================================ */
(function () {
  'use strict';
  var A = window.BonyanApp, CFG = window.APP_CONFIG, D = window.I18N || {};
  if (!A) return;
  var $ = A.$, $$ = A.$$, esc = A.esc;
  var Q = function (k) { var m = new RegExp('[?&]' + k + '=([^&#]*)').exec(location.search); return m ? decodeURIComponent(m[1]) : ''; };
  var LI = { ar: 1, en: 2, id: 3 };

  var TX = {
    ar: {
      eyebrow: 'الموارد البشرية · سجل المنسوبين', title: 'تحديث بياناتي', back: 'العودة إلى النموذج',
      vT: 'تحديث بياناتك المسجّلة', vD: 'اكتب رقمك المرجعي الموجود في رسالة التأكيد أو على بطاقتك، ثم اختر القسم الذي تريد تعديله.',
      vDk: 'فتحت الصفحة من رابط رسالتك الخاص. اكتب رقمك المرجعي للمتابعة.',
      ref: 'الرقم المرجعي', refPh: 'BNY-HR-SA-2026-0001', contact: 'البريد الإلكتروني أو رقم الجوال المسجّل', contactH: 'للتحقق من هويتك: اكتب البريد أو الجوال الذي سجّلت به.',
      go: 'متابعة', checking: 'جارٍ التحقق…', bad: 'البيانات غير متطابقة. تأكد من الرقم المرجعي والبريد أو الجوال المسجّل.', badK: 'الرقم المرجعي لا يطابق رابط رسالتك.',
      locked: 'توقفت المحاولات مؤقتًا لكثرة الأخطاء. حاول بعد ١٥ دقيقة.', net: 'تعذّر الاتصال بالخادم، حاول مرة أخرى.', expired: 'انتهت الجلسة، أدخل رقمك المرجعي من جديد.',
      hi: 'مرحبًا {n}', pick: 'اختر القسم الذي تريد تعديله، ثم اضغط «حفظ التعديلات».', edit: 'تعديل', close: 'إغلاق', empty: 'لا توجد بيانات',
      g: { id: 'البيانات الشخصية', docs: 'الوثائق الرسمية', contact: 'التواصل والعنوان', em: 'جهات الاتصال للطوارئ', job: 'الوظيفة والعقد', edu: 'المهارات والدورات', fin: 'الراتب والحساب البنكي', quals: 'المؤهلات العلمية', exp: 'الخبرات السابقة', langs: 'اللغات', files: 'المرفقات' },
      uploaded: 'مرفوع', noFile: 'لم يُرفع', replace: 'استبدال الملف', upload: 'رفع ملف', picked: 'سيُرفع:', addRow: 'إضافة صف', delRow: 'حذف الصف',
      save: 'حفظ التعديلات', saving: 'جارٍ الحفظ…', uploading: 'رفع الملفات {i} من {n}…', card: 'تجديد البطاقة وإرسال التأكيد…', none: 'لم تغيّر شيئًا بعد.', big: 'ملف أكبر من ١٠ ميغابايت:',
      changes: '{n} تعديل', fail: 'تعذّر الحفظ', doneT: 'تم تحديث بياناتك بنجاح', doneD: 'حُفظت تعديلاتك في سجل المنسوبين.', mailed: 'أرسلنا لك رسالة تأكيد على بريدك المسجّل.',
      otpT: 'أدخل رمز التحقق', otpD: 'أرسلنا رمزًا من ٦ أرقام إلى بريدك المسجّل {to} — صالح ١٠ دقائق.', otp: 'رمز التحقق', otpBad: 'الرمز غير صحيح أو انتهت صلاحيته.', otpBack: 'تغيير البيانات', otpGo: 'تحقق وافتح بياناتي',
      again: 'تعديل قسم آخر', home: 'العودة إلى النموذج', dl: 'تنزيل البطاقة', select: '— اختر —', yourCard: 'بطاقتك بعد التحديث', ltrNote: ''
    },
    en: {
      eyebrow: 'Human Resources · Staff Registry', title: 'Update my details', back: 'Back to the form',
      vT: 'Update your registered details', vD: 'Enter the reference number from your confirmation email or your card, then choose the section you want to change.',
      vDk: 'You opened this page from your personal email link. Enter your reference number to continue.',
      ref: 'Reference number', refPh: 'BNY-HR-SA-2026-0001', contact: 'Registered email or mobile number', contactH: 'To verify it is you: enter the email or mobile you registered with.',
      go: 'Continue', checking: 'Checking…', bad: 'The details do not match. Check your reference number and registered email or mobile.', badK: 'This reference number does not match your email link.',
      locked: 'Too many attempts. Please try again in 15 minutes.', net: 'Could not reach the server, please try again.', expired: 'Your session has expired. Please enter your reference number again.',
      hi: 'Welcome, {n}', pick: 'Choose the section you want to change, then tap “Save changes”.', edit: 'Edit', close: 'Close', empty: 'No data',
      g: { id: 'Personal details', docs: 'Official documents', contact: 'Contact & address', em: 'Emergency contacts', job: 'Job & contract', edu: 'Skills & courses', fin: 'Salary & bank account', quals: 'Qualifications', exp: 'Previous experience', langs: 'Languages', files: 'Documents' },
      uploaded: 'Uploaded', noFile: 'Not uploaded', replace: 'Replace file', upload: 'Upload file', picked: 'Will upload:', addRow: 'Add row', delRow: 'Delete row',
      save: 'Save changes', saving: 'Saving…', uploading: 'Uploading files {i} of {n}…', card: 'Renewing your card and sending the confirmation…', none: 'You have not changed anything yet.', big: 'File larger than 10 MB:',
      changes: '{n} change(s)', fail: 'Could not save', doneT: 'Your details have been updated', doneD: 'Your changes are saved in the staff registry.', mailed: 'We have sent a confirmation to your registered email.',
      otpT: 'Enter the verification code', otpD: 'We sent a 6-digit code to your registered email {to} — valid for 10 minutes.', otp: 'Verification code', otpBad: 'The code is wrong or has expired.', otpBack: 'Change details', otpGo: 'Verify and open my details',
      again: 'Edit another section', home: 'Back to the form', dl: 'Download card', select: '— Select —', yourCard: 'Your card after the update'
    },
    id: {
      eyebrow: 'SDM · Registri Staf', title: 'Perbarui data saya', back: 'Kembali ke formulir',
      vT: 'Perbarui data Anda yang terdaftar', vD: 'Masukkan nomor referensi dari email konfirmasi atau kartu Anda, lalu pilih bagian yang ingin diubah.',
      vDk: 'Anda membuka halaman ini dari tautan email pribadi Anda. Masukkan nomor referensi untuk melanjutkan.',
      ref: 'Nomor referensi', refPh: 'BNY-HR-SA-2026-0001', contact: 'Email atau nomor ponsel terdaftar', contactH: 'Untuk verifikasi: masukkan email atau ponsel yang Anda daftarkan.',
      go: 'Lanjutkan', checking: 'Memeriksa…', bad: 'Data tidak cocok. Periksa nomor referensi serta email atau ponsel terdaftar.', badK: 'Nomor referensi tidak cocok dengan tautan email Anda.',
      locked: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.', net: 'Tidak dapat terhubung ke server, coba lagi.', expired: 'Sesi berakhir. Masukkan nomor referensi lagi.',
      hi: 'Selamat datang, {n}', pick: 'Pilih bagian yang ingin diubah, lalu ketuk “Simpan perubahan”.', edit: 'Ubah', close: 'Tutup', empty: 'Tidak ada data',
      g: { id: 'Data pribadi', docs: 'Dokumen resmi', contact: 'Kontak & alamat', em: 'Kontak darurat', job: 'Pekerjaan & kontrak', edu: 'Keterampilan & kursus', fin: 'Gaji & rekening bank', quals: 'Kualifikasi', exp: 'Pengalaman sebelumnya', langs: 'Bahasa', files: 'Dokumen' },
      uploaded: 'Terunggah', noFile: 'Belum diunggah', replace: 'Ganti berkas', upload: 'Unggah berkas', picked: 'Akan diunggah:', addRow: 'Tambah baris', delRow: 'Hapus baris',
      save: 'Simpan perubahan', saving: 'Menyimpan…', uploading: 'Mengunggah berkas {i} dari {n}…', card: 'Memperbarui kartu dan mengirim konfirmasi…', none: 'Anda belum mengubah apa pun.', big: 'Berkas lebih dari 10 MB:',
      changes: '{n} perubahan', fail: 'Gagal menyimpan', doneT: 'Data Anda telah diperbarui', doneD: 'Perubahan Anda tersimpan di registri staf.', mailed: 'Kami telah mengirim konfirmasi ke email terdaftar Anda.',
      otpT: 'Masukkan kode verifikasi', otpD: 'Kami mengirim kode 6 digit ke email terdaftar Anda {to} — berlaku 10 menit.', otp: 'Kode verifikasi', otpBad: 'Kode salah atau sudah kedaluwarsa.', otpBack: 'Ubah data', otpGo: 'Verifikasi dan buka data saya',
      again: 'Ubah bagian lain', home: 'Kembali ke formulir', dl: 'Unduh kartu', select: '— Pilih —', yourCard: 'Kartu Anda setelah pembaruan'
    }
  };
  function L() { return TX[A.state.lang] ? A.state.lang : 'ar'; }
  function x(k, v) {
    var d = TX[L()], s = k.indexOf('.') > 0 ? d[k.split('.')[0]][k.split('.')[1]] : d[k];
    s = s == null ? k : s;
    return v ? s.replace(/\{(\w+)\}/g, function (_, n) { return A.num(v[n]); }) : s;
  }

  /* الأقسام والحقول (نفس أعمدة الجدول) */
  var GROUPS = [
    ['id', ['firstNameAr', 'fatherNameAr', 'grandNameAr', 'lastNameAr', 'firstName', 'fatherName', 'grandName', 'lastName', 'gender', 'birthDate', 'birthCountry', 'birthCity', 'nationality', 'otherNationality', 'maritalStatus', 'dependents', 'bloodType']],
    ['docs', ['passportNo', 'passportCountry', 'passportIssue', 'passportExpiry', 'nationalIdNo', 'nationalIdExpiry', 'permitNo', 'permitOccupation', 'permitIssue', 'permitExpiry', 'workPermitNo', 'workPermitExpiry', 'insuranceNo', 'npwp', 'bpjsTk', 'bpjsKes', 'kraPin', 'nssfNo', 'shaNo', 'tin']],
    ['contact', ['officialEmail', 'personalEmail', 'mobile', 'whatsapp', 'addrCountry', 'addrRegion', 'addrCity', 'homeCountry', 'homeCity']],
    ['em', ['em1Name', 'em1Relation', 'em1Phone', 'em2Name', 'em2Relation', 'em2Phone']],
    ['job', ['entity', 'workCountry', 'workRegion', 'workOffice', 'department', 'jobTitle', 'manager', 'employeeNo', 'startDate', 'employmentType', 'contractStatus', 'contractType', 'contractNo', 'contractStart', 'contractEnd']],
    ['edu', ['topDegree', 'techLevel', 'techSkills', 'hasCerts', 'certifications', 'quran']],
    ['fin', ['salary', 'currency', 'payMethod', 'bankCountry', 'bankName', 'accountHolder', 'iban', 'accountNo', 'swift', 'bankBranch', 'payOther']]
  ];
  var FILES = ['photo', 'passportScan', 'nationalIdScan', 'permitScan', 'workPermitScan', 'contractFile', 'degreeFile', 'certFiles', 'bankProof'];
  var CHILD = { quals: ['degree', 'major', 'institution', 'country', 'gradYear', 'grade'], exp: ['org', 'title', 'country', 'from', 'to'], langs: ['language', 'level'] };
  var COUNTRY = ['workCountry', 'nationality', 'otherNationality', 'birthCountry', 'passportCountry', 'addrCountry', 'homeCountry', 'bankCountry'];
  var OPT = { gender: 'gender', maritalStatus: 'maritalStatus', em1Relation: 'relation', em2Relation: 'relation', employmentType: 'employmentType', contractType: 'contractType', quran: 'quran', payMethod: 'payMethod', techLevel: 'techLevel', hasCerts: 'yesno', degree: 'degree', level: 'level' };
  var LONG = ['techSkills', 'certifications', 'payOther'];
  var LTR = /Email$|^mobile$|^whatsapp$|Phone$|^iban$|^swift$|^accountNo$|No$|^npwp$|^bpjs|^kraPin$|^tin$/;
  var EXTRA = { topDegree: { ar: 'أعلى مؤهل', en: 'Highest qualification', id: 'Kualifikasi tertinggi' }, contractStatus: { ar: 'عقد العمل', en: 'Employment contract', id: 'Kontrak kerja' }, contractNo: { ar: 'رقم العقد', en: 'Contract number', id: 'Nomor kontrak' }, country: { ar: 'الدولة', en: 'Country', id: 'Negara' } };

  var U = { view: 'verify', k: Q('k'), ref: '', token: '', rec: null, kids: null, cols: [], photo: '', open: {}, files: {}, err: '', busy: false, mailed: false, newPhoto: '' };
  var HEAD = {};

  function label(k) {
    var l = L(), v = D[l] && D[l]['f.' + k];
    if (typeof v === 'string' && v) return v;
    if (EXTRA[k] && EXTRA[k][l]) return EXTRA[k][l];
    return HEAD[k] || (D.ar && D.ar['f.' + k]) || k;
  }
  /* خيارات الحقل: القيمة تُحفظ بالعربية كما في الجدول، والنص يظهر بلغة الصفحة */
  function options(k) {
    var l = L(), out = [];
    if (COUNTRY.indexOf(k) > -1 || k === 'country') return (window.COUNTRIES || []).map(function (c) { return [c[1], c[LI[l]] || c[1]]; }).sort(function (a, b) { return a[1].localeCompare(b[1], l); });
    if (k === 'entity') return (CFG.ENTITIES || []).map(function (e) { return [e.ar, e[l] || e.ar]; });
    if (k === 'currency') return Object.keys(D.ar || {}).filter(function (kk) { return /^cur\.[A-Z]{3}$/.test(kk); }).map(function (kk) { var c = kk.slice(4); return [c, c + ' · ' + ((D[l] || {})[kk] || D.ar[kk])]; });
    if (k === 'contractStatus') return [['يوجد', { ar: 'يوجد', en: 'Available', id: 'Ada' }[l]], ['لا يوجد', { ar: 'لا يوجد', en: 'None', id: 'Tidak ada' }[l]]];
    if (k === 'bloodType') return ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(function (v) { return [v, v]; });
    var grp = OPT[k]; if (!grp) return null;
    Object.keys(D.ar || {}).forEach(function (kk) { var m = /^o\.(\w+)\.\w+$/.exec(kk); if (m && m[1] === grp) out.push([D.ar[kk], (D[l] || {})[kk] || D.ar[kk]]); });
    return out.length ? out : null;
  }
  function dispVal(k, v) {
    if (!v) return '';
    var op = options(k);
    if (op) { var hit = op.filter(function (o) { return o[0] === v; })[0]; if (hit) return hit[1]; }
    return v;
  }
  function moneyRaw(v) { var n = +String(v || '').replace(/[٠-٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); }).replace(/[^\d.]/g, ''); return isFinite(n) && n > 0 ? String(n) : ''; }
  function colType(k) { var c = U.cols.filter(function (cc) { return cc[0] === k; })[0]; return c ? c[2] : 't'; }

  /* ---------------------------------------------------------- الرسم */
  function draw() {
    var el = $('#upd'); if (!el) return;
    document.documentElement.lang = L(); document.documentElement.dir = (D[L()] && D[L()].dir) || (L() === 'ar' ? 'rtl' : 'ltr');
    document.title = x('title') + ' · Bonyan HR';
    $('#updBarT').textContent = x('title'); $('#updBarE').textContent = x('eyebrow'); $('#updBackLbl').textContent = x('back');
    var lg = (window.BONYAN_LOGOS || {}).markWhite; $('#updLogo').innerHTML = lg ? '<img class="main-logo" src="' + lg.src + '" alt="Bonyan">' : 'Bonyan';
    $$('#updLang [data-lang]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === L())); });
    if (U.view === 'verify') el.innerHTML = verifyHTML();
    else if (U.view === 'edit') { el.innerHTML = editHTML(); drawCard('#updCard'); }
    else { el.innerHTML = doneHTML(); drawCard('#updCardDone'); }
  }
  function drawCard(sel) {
    if (!U.rec || !$(sel)) return;
    var r = recForCard(); A.card.render(sel, r, U.newPhoto || U.photo || null);
  }
  function recForCard() { var r = {}; Object.keys(U.rec).forEach(function (k) { r[k] = U.rec[k]; }); r.lang = L(); return r; }

  function otpHTML() {
    return '<div class="upd-verify rise"><div class="upd-card">' +
      '<span class="upd-ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3.5 6.5h17v11h-17zM3.5 7l8.5 6 8.5-6"/></svg></span>' +
      '<h1>' + esc(x('otpT')) + '</h1><p class="upd-lead">' + esc(x('otpD', { to: U.otpTo || '' })) + '</p>' +
      '<form id="updOtp" novalidate>' +
        '<label class="upd-f"><span>' + esc(x('otp')) + '</span><input class="inp mono" id="updCode" dir="ltr" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="••••••"></label>' +
        (U.err ? '<p class="upd-err" role="alert">' + esc(U.err) + '</p>' : '') +
        '<button type="submit" class="btn gold big"' + (U.busy ? ' disabled' : '') + '>' + esc(U.busy ? x('checking') : x('otpGo')) + '</button>' +
        '<button type="button" class="link" data-otp-back>' + esc(x('otpBack')) + '</button>' +
      '</form></div></div>';
  }
  function verifyHTML() {
    if (U.otpTo) return otpHTML();
    return '<div class="upd-verify rise"><div class="upd-card">' +
      '<span class="upd-ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-4-4L4 16zM13.5 6.5l4 4"/></svg></span>' +
      '<h1>' + esc(x('vT')) + '</h1><p class="upd-lead">' + esc(U.k ? x('vDk') : x('vD')) + '</p>' +
      '<form id="updForm" novalidate>' +
        '<label class="upd-f"><span>' + esc(x('ref')) + '</span><input class="inp mono" id="updRef" dir="ltr" autocomplete="off" spellcheck="false" placeholder="' + esc(x('refPh')) + '" value="' + esc(U.ref) + '"></label>' +
        (U.k ? '' : '<label class="upd-f"><span>' + esc(x('contact')) + '</span><input class="inp" id="updContact" dir="ltr" autocomplete="email" spellcheck="false"><small>' + esc(x('contactH')) + '</small></label>') +
        (U.err ? '<p class="upd-err" role="alert">' + esc(U.err) + '</p>' : '') +
        '<button type="submit" class="btn gold big" id="updGo"' + (U.busy ? ' disabled' : '') + '>' + esc(U.busy ? x('checking') : x('go')) + '</button>' +
      '</form></div></div>';
  }
  function fieldHTML(k) {
    var t = colType(k), v = U.rec[k] == null ? '' : String(U.rec[k]), val = t === 'n' ? moneyRaw(v) : (t === 'd' ? (/^\d{4}-\d{2}-\d{2}/.test(v) ? v.slice(0, 10) : '') : v);
    var common = ' class="inp" data-ek="' + k + '" data-orig="' + esc(val) + '"', input, op = options(k);
    if (t === 'd') input = '<input type="date"' + common + ' value="' + esc(val) + '">';
    else if (t === 'n') input = '<input type="text" inputmode="decimal" dir="ltr"' + common + ' value="' + esc(val) + '">';
    else if (op) {
      if (val && !op.some(function (o) { return o[0] === val; })) op = [[val, val]].concat(op);
      input = '<select' + common + '><option value="">' + esc(x('select')) + '</option>' + op.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (o[0] === val ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select>';
    } else if (LONG.indexOf(k) > -1 || val.length > 60 || /\n/.test(val)) input = '<textarea rows="3" dir="auto"' + common + '>' + esc(val) + '</textarea>';
    else input = '<input type="text"' + (LTR.test(k) ? ' dir="ltr"' : ' dir="auto"') + common + ' value="' + esc(val) + '" autocomplete="off">';
    return '<label class="upd-f' + (LONG.indexOf(k) > -1 ? ' wide' : '') + '"><span>' + esc(label(k)) + '</span>' + input + '</label>';
  }
  function preview(keys) {
    var items = keys.filter(function (k) { return U.rec[k]; }).slice(0, 4);
    if (!items.length) return '<p class="upd-empty">' + esc(x('empty')) + '</p>';
    return '<dl class="upd-pv">' + items.map(function (k) { return '<div><dt>' + esc(label(k)) + '</dt><dd dir="auto">' + esc(dispVal(k, U.rec[k])) + '</dd></div>'; }).join('') + '</dl>';
  }
  function secHTML(id, inner, prev) {
    var open = !!U.open[id];
    return '<section class="upd-sec' + (open ? ' open' : '') + '" data-sec="' + id + '"><header><h2>' + esc(x('g.' + id)) + '</h2>' +
      '<button type="button" class="btn ' + (open ? 'ghost' : 'gold') + ' sm" data-toggle="' + id + '">' + esc(open ? x('close') : x('edit')) + '</button></header>' +
      (open ? '<div class="upd-body">' + inner + '</div>' : prev) + '</section>';
  }
  function childHTML(p) {
    var keys = CHILD[p], rows = (U.kids[p] || []).slice(1).map(function (r) { return r.slice(2, 2 + keys.length); });
    var head = keys.map(function (k, i) { var ar = ((U.kids[p] || [])[0] || [])[i + 2]; HEAD[k] = HEAD[k] || ar; return label(k); });
    var cellIn = function (k, v) {
      var op = options(k);
      if (op) { if (v && !op.some(function (o) { return o[0] === v; })) op = [[v, v]].concat(op); return '<select class="inp ed-c"><option value=""></option>' + op.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (o[0] === v ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select>'; }
      return '<input class="inp ed-c" dir="auto" value="' + esc(v || '') + '">';
    };
    var rowHTML = function (cells) { return '<tr>' + keys.map(function (k, i) { return '<td>' + cellIn(k, cells[i]) + '</td>'; }).join('') + '<td><button type="button" class="ed-del" data-del aria-label="' + esc(x('delRow')) + '">×</button></td></tr>'; };
    var inner = '<div class="dr-tbl upd-tbl" data-child="' + p + '" data-orig="' + esc(JSON.stringify(rows)) + '"><table><thead><tr>' + head.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') + '<th></th></tr></thead><tbody>' +
      rows.map(rowHTML).join('') + '</tbody></table></div><button type="button" class="btn ghost sm" data-addrow="' + p + '" data-tpl="' + esc(rowHTML([])) + '">+ ' + esc(x('addRow')) + '</button>';
    var prev = rows.length ? '<ul class="upd-list">' + rows.slice(0, 4).map(function (r) { return '<li dir="auto">' + esc(r.filter(String).map(function (v, i) { return dispVal(keys[i], v); }).join(' · ')) + '</li>'; }).join('') + '</ul>' : '<p class="upd-empty">' + esc(x('empty')) + '</p>';
    return secHTML(p, inner, prev);
  }
  function filesHTML() {
    var inner = FILES.map(function (k) {
      var has = +U.rec[k] > 0, pk = U.files[k];
      return '<div class="upd-file"><div><b>' + esc(label(k)) + '</b><span class="chip ' + (has ? 'ok' : '') + '">' + esc(has ? '✓ ' + x('uploaded') : x('noFile')) + '</span></div>' +
        '<label class="btn ghost sm"><span>' + esc(has ? x('replace') : x('upload')) + '</span><input type="file" data-fk="' + k + '" accept="image/*,application/pdf"' + (k === 'photo' ? '' : ' multiple') + ' hidden></label>' +
        '<small class="upd-picked">' + (pk ? esc(x('picked') + ' ' + pk.map(function (f) { return f.name; }).join('، ')) : '') + '</small></div>';
    }).join('');
    var n = FILES.filter(function (k) { return +U.rec[k] > 0; }).length;
    return secHTML('files', inner, '<p class="upd-empty">✓ ' + A.num(n) + ' / ' + A.num(FILES.length) + '</p>');
  }
  function editHTML() {
    var name = L() === 'ar' ? (U.rec.fullNameAr || U.rec.fullNameLatin) : (U.rec.fullNameLatin || U.rec.fullNameAr);
    var h = '<div class="upd-head rise"><div class="upd-who"><p class="upd-hi">' + esc(x('hi', { n: '' })).replace(/\s*$/, '') + ' <b>' + esc(name) + '</b></p>' +
      '<code dir="ltr">' + esc(U.ref) + '</code><p class="upd-lead">' + esc(x('pick')) + '</p></div><div class="upd-cardbox"><div class="idcard-wrap" id="updCard"></div></div></div><div class="upd-secs">';
    GROUPS.forEach(function (g) {
      var keys = g[1].filter(function (k) { return U.cols.some(function (c) { return c[0] === k; }); });
      h += secHTML(g[0], '<div class="upd-grid">' + keys.map(fieldHTML).join('') + '</div>', preview(keys));
    });
    ['quals', 'exp', 'langs'].forEach(function (p) { h += childHTML(p); });
    h += filesHTML() + '</div>';
    var n = collect().n;
    h += '<div class="upd-bar"><span class="upd-count">' + esc(n ? x('changes', { n: n }) : '') + '</span>' + (U.err ? '<span class="upd-err">' + esc(U.err) + '</span>' : '') +
      '<button type="button" class="btn gold" id="updSave"' + (U.busy ? ' disabled' : '') + '><span>' + esc(U.busy || x('save')) + '</span></button></div>';
    return h;
  }
  function doneHTML() {
    return '<div class="upd-done rise"><span class="upd-ic ok" aria-hidden="true">✓</span><h1>' + esc(x('doneT')) + '</h1><p class="upd-lead">' + esc(x('doneD')) + (U.mailed ? ' ' + esc(x('mailed')) : '') + '</p>' +
      '<p class="upd-cap">' + esc(x('yourCard')) + '</p><div class="upd-cardbox"><div class="idcard-wrap" id="updCardDone"></div></div>' +
      '<div class="upd-actions"><button type="button" class="btn gold" data-act="again">' + esc(x('again')) + '</button><button type="button" class="btn ghost" data-act="dl">' + esc(x('dl')) + '</button><a class="btn ghost" href="index.html">' + esc(x('home')) + '</a></div></div>';
  }

  /* ---------------------------------------------------------- جمع التعديلات */
  var pending = {}; /* قيم الحقول المعدّلة في الأقسام المغلقة تبقى محفوظة هنا حتى الحفظ */
  function readOpen() {
    $$('#upd [data-ek]').forEach(function (el) { pending[el.getAttribute('data-ek')] = { v: el.value, o: el.getAttribute('data-orig') || '' }; });
    $$('#upd [data-child]').forEach(function (t) {
      var rows = $$('tbody tr', t).map(function (tr) { return $$('.ed-c', tr).map(function (i) { return i.value.trim(); }); }).filter(function (r) { return r.some(String); });
      pending['@' + t.getAttribute('data-child')] = { v: JSON.stringify(rows), o: t.getAttribute('data-orig') };
    });
  }
  function collect() {
    var ch = {}, kids = {}, n = 0;
    Object.keys(pending).forEach(function (k) {
      var p = pending[k]; if (String(p.v).trim() === String(p.o).trim()) return;
      if (k.charAt(0) === '@') kids[k.slice(1)] = JSON.parse(p.v); else ch[k] = String(p.v).trim();
      n++;
    });
    var CC = {}; (window.COUNTRIES || []).forEach(function (c) { CC[c[1]] = c[0]; });
    if ('workCountry' in ch) ch.workCountryCode = CC[ch.workCountry] || '';
    if ('nationality' in ch) ch.nationalityCode = CC[ch.nationality] || '';
    var nf = Object.keys(U.files).filter(function (k) { return U.files[k] && U.files[k].length; }).length;
    return { ch: ch, kids: kids, n: n + nf };
  }
  /* يعيد رسم صفحة التعديل مع الإبقاء على ما كُتب في الحقول المفتوحة */
  function redrawEdit() {
    readOpen();
    var y = window.scrollY; draw();
    Object.keys(pending).forEach(function (k) {
      if (k.charAt(0) === '@') return;
      var el = $('#upd [data-ek="' + k + '"]'); if (el) { el.value = pending[k].v; el.classList.toggle('dirty', String(pending[k].v).trim() !== String(pending[k].o).trim()); }
    });
    Object.keys(pending).forEach(function (k) {
      if (k.charAt(0) !== '@') return;
      var t = $('#upd [data-child="' + k.slice(1) + '"]'); if (!t || pending[k].v === pending[k].o) return;
      var rows = JSON.parse(pending[k].v), tpl = $('[data-addrow="' + k.slice(1) + '"]').getAttribute('data-tpl'), tb = $('tbody', t);
      tb.innerHTML = rows.map(function () { return tpl; }).join('');
      $$('tr', tb).forEach(function (tr, i) { $$('.ed-c', tr).forEach(function (inp, j) { inp.value = rows[i][j] || ''; }); });
    });
    window.scrollTo(0, y);
    updateCount();
  }
  function updateCount() { readOpen(); var n = collect().n, c = $('.upd-count'); if (c) c.textContent = n ? x('changes', { n: n }) : ''; }

  /* ---------------------------------------------------------- الخادم */
  function errMsg(e) {
    var m = (e && e.message) || '';
    if (/otp_bad/.test(m)) return x('otpBad');
    if (/self_bad/.test(m)) return U.k ? x('badK') : x('bad');
    if (/locked/.test(m)) return x('locked');
    if (/self_expired/.test(m)) return x('expired');
    if (/Failed to fetch|NetworkError|HTTP|Load failed/.test(m) || !m) return x('net');
    return m;
  }
  function start(ref, contact, otp) {
    U.busy = true; U.err = ''; draw();
    var p = A.DEMO ? demoStart(ref) : A.api({ action: 'selfStart', ref: ref, k: U.k || undefined, contact: otp ? undefined : (contact || undefined), otp: otp || undefined, lang: A.state.lang });
    p.then(function (j) {
      if (j.otp) { U.busy = false; U.otpTo = j.to || '…'; draw(); var c = $('#updCode'); if (c) c.focus(); return; }
      U.otpTo = '';
      U.busy = false; U.ref = j.ref; U.token = j.token; U.rec = j.rec; U.kids = j.kids || {}; U.cols = j.cols || []; U.photo = j.photo || '';
      U.cols.forEach(function (c) { HEAD[c[0]] = c[1]; });
      U.open = {}; U.files = {}; pending = {}; U.view = 'edit'; draw(); window.scrollTo(0, 0);
    }).catch(function (e) { U.busy = false; U.err = errMsg(e); draw(); var i = $('#updRef'); if (i) i.focus(); });
  }
  function readB64(file) { return new Promise(function (res, rej) { var fr = new FileReader(); fr.onload = function () { res(String(fr.result)); }; fr.onerror = rej; fr.readAsDataURL(file); }); }
  function setBusy(t) { U.busy = t; var b = $('#updSave'); if (b) { b.disabled = !!t; $('span', b).textContent = t || x('save'); } }
  function save() {
    readOpen();
    var c = collect();
    if (!c.n) { U.err = x('none'); redrawEdit(); return; }
    var big = []; Object.keys(U.files).forEach(function (k) { (U.files[k] || []).forEach(function (f) { if (f.size > 10 * 1024 * 1024) big.push(f.name); }); });
    if (big.length) { U.err = x('big') + ' ' + big.join('، '); redrawEdit(); return; }
    U.err = ''; setBusy(x('saving'));
    var base = { ref: U.ref, token: U.token };
    var call = function (o) { var b = {}; Object.keys(base).forEach(function (k) { b[k] = base[k]; }); Object.keys(o).forEach(function (k) { b[k] = o[k]; }); return A.DEMO ? demoCall(b) : A.api(b); };
    var upd = { action: 'selfUpdate', changes: c.ch }; Object.keys(c.kids).forEach(function (k) { upd[k] = c.kids[k]; });
    (Object.keys(c.ch).length || Object.keys(c.kids).length ? call(upd) : Promise.resolve(null)).then(function (j) {
      if (j && j.rec) { U.rec = j.rec; U.kids = j.kids || U.kids; }
      var jobs = []; Object.keys(U.files).forEach(function (k) { var fl = U.files[k] || []; fl.forEach(function (f, i) { jobs.push({ k: k, f: f, idx: i + 1, total: fl.length }); }); });
      return jobs.reduce(function (pp, jb, i) {
        return pp.then(function () {
          setBusy(x('uploading', { i: i + 1, n: jobs.length }));
          return readB64(jb.f).then(function (du) {
            if (jb.k === 'photo' && /^data:image/.test(du)) U.newPhoto = du;
            U.rec[jb.k] = Math.max(1, +U.rec[jb.k] || 0);
            return call({ action: 'selfUpload', kind: jb.k, idx: jb.idx, total: jb.total, mime: jb.f.type || 'application/octet-stream', data: du.split(',')[1] });
          });
        });
      }, Promise.resolve());
    }).then(function () {
      setBusy(x('card'));
      Object.keys(c.ch).forEach(function (k) { U.rec[k] = c.ch[k]; });
      var r = recForCard(), ph = U.newPhoto || U.photo || null;
      return A.card.mailAssets(r, ph).catch(function () { return {}; }).then(function (a) { return call({ action: 'selfFinish', gif: a.gif || '', jpg: a.jpg || '', info: A.card.mailInfo(r) }); });
    }).then(function (j) {
      U.busy = false; U.mailed = !!(j && j.mailed); U.view = 'done'; U.files = {}; pending = {}; U.open = {}; draw(); window.scrollTo(0, 0);
    }).catch(function (e) { setBusy(false); U.err = x('fail') + ' · ' + errMsg(e); redrawEdit(); if (/self_expired/.test((e && e.message) || '')) { U.view = 'verify'; draw(); } });
  }

  /* معاينة دون خادم */
  function demoStart(ref) {
    return new Promise(function (res, rej) {
      setTimeout(function () {
        if (!/^BNY-HR-[A-Z]{2}-\d{4}-\d{4}$/i.test(ref)) return rej(new Error('self_bad'));
        var DT = ['birthDate', 'passportIssue', 'passportExpiry', 'nationalIdExpiry', 'permitIssue', 'permitExpiry', 'workPermitExpiry', 'startDate', 'contractStart', 'contractEnd'];
        var cols = []; GROUPS.forEach(function (g) { g[1].forEach(function (k) { cols.push([k, (D.ar && D.ar['f.' + k]) || k, DT.indexOf(k) > -1 ? 'd' : (k === 'salary' ? 'n' : 't')]); }); });
        res({ ref: ref.toUpperCase(), token: 'demo', photo: '', cols: cols, kids: { quals: [['', '', 'الدرجة', 'التخصص', 'الجهة', 'الدولة', 'سنة التخرج', 'التقدير'], [ref, '', 'بكالوريوس', 'التسويق', 'جامعة الملك عبدالعزيز', 'السعودية', '2019', 'جيد جدًا']], exp: [], langs: [['', '', 'اللغة', 'المستوى'], [ref, '', 'العربية', 'اللغة الأم']] },
          rec: { ref: ref.toUpperCase(), fullNameAr: 'أبوبكر عمر عبدالرحمن بافضل', fullNameLatin: 'ABOBAKR OMAR ABDULRAHMAN BA FADHL', firstNameAr: 'أبوبكر', fatherNameAr: 'عمر', grandNameAr: 'عبدالرحمن', lastNameAr: 'بافضل', firstName: 'ABOBAKR', fatherName: 'OMAR', grandName: 'ABDULRAHMAN', lastName: 'BA FADHL', gender: 'ذكر', birthDate: '1998-01-31', nationality: 'اليمن', nationalityCode: 'YE', workCountry: 'السعودية', workCountryCode: 'SA', maritalStatus: 'أعزب', bloodType: 'B+', passportNo: '11470379', passportExpiry: '2028-06-09', permitNo: '2141224440', permitExpiry: '2027-02-06', personalEmail: 'abobakr97@gmail.com', mobile: '+966 507201432', em1Name: 'عمر عبدالرحمن محمد بافضل', em1Relation: 'الأب', em1Phone: '+966 503664996', entity: 'شركة بنيان للتدريب المحدودة', jobTitle: 'سكرتير التدريب', startDate: '2023-11-29', employmentType: 'دوام كامل', payMethod: 'تحويل بنكي', bankName: 'البنك الأهلي السعودي', salary: '4٬000', currency: 'SAR', photo: 1, passportScan: 1, permitScan: 1, lang: 'ar' } });
      }, 500);
    });
  }
  function demoCall(b) { return new Promise(function (res) { setTimeout(function () { res(b.action === 'selfFinish' ? { ok: true, mailed: true } : { ok: true }); }, 350); }); }

  /* ---------------------------------------------------------- الأحداث */
  document.addEventListener('submit', function (e) {
    if (e.target.id === 'updOtp') {
      e.preventDefault();
      var code = ($('#updCode').value || '').replace(/[٠-٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); }).replace(/\D/g, '');
      if (code.length !== 6) { U.err = x('otpBad'); draw(); return; }
      start(U.ref, '', code); return;
    }
    if (e.target.id !== 'updForm') return;
    e.preventDefault();
    var ref = ($('#updRef').value || '').trim().toUpperCase().replace(/\s+/g, ''), ct = $('#updContact') ? ($('#updContact').value || '').trim() : '';
    U.ref = ref;
    if (!ref || (!U.k && !ct)) { U.err = U.k ? x('badK') : x('bad'); draw(); return; }
    start(ref, ct);
  });
  document.addEventListener('click', function (e) {
    var tg = e.target, lb = tg.closest('#updLang [data-lang]');
    if (tg.closest('[data-otp-back]')) { U.otpTo = ''; U.err = ''; draw(); return; }
    if (lb) { if (U.view === 'edit') readOpen(); A.state.lang = lb.getAttribute('data-lang'); try { localStorage.setItem('bonyan-hr-registry-draft-v1-lang', A.state.lang); } catch (er) { } if (U.view === 'edit') redrawEdit(); else draw(); return; }
    if (tg.closest('#themeBtn')) { var r = document.documentElement, n = r.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'; r.setAttribute('data-theme', n); try { localStorage.setItem('bonyan-hr-theme', n); } catch (er) { } return; }
    var tgl = tg.closest('[data-toggle]');
    if (tgl) { readOpen(); var id = tgl.getAttribute('data-toggle'); U.open[id] = !U.open[id]; U.err = ''; redrawEdit(); var sec = $('[data-sec="' + id + '"]'); if (sec && U.open[id]) sec.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    var add = tg.closest('[data-addrow]');
    if (add) { var t = $('[data-child="' + add.getAttribute('data-addrow') + '"] tbody'); var tmp = document.createElement('tbody'); tmp.innerHTML = add.getAttribute('data-tpl'); t.appendChild(tmp.firstChild); updateCount(); return; }
    var del = tg.closest('[data-del]');
    if (del) { del.closest('tr').remove(); updateCount(); return; }
    if (tg.closest('#updSave')) { save(); return; }
    var act = tg.closest('[data-act]');
    if (act) {
      var a = act.getAttribute('data-act');
      if (a === 'again') { U.view = 'edit'; U.open = {}; draw(); window.scrollTo(0, 0); }
      else if (a === 'dl') { var r2 = recForCard(); A.card.png(r2, U.newPhoto || U.photo || null).then(function (url) { var l = document.createElement('a'); l.href = url; l.download = 'Bonyan-Staff-Card-' + U.ref + '.png'; document.body.appendChild(l); l.click(); setTimeout(function () { l.remove(); }, 500); }); }
      return;
    }
    var ic = tg.closest('#upd .idcard'); if (ic) ic.classList.toggle('flipped');
  });
  document.addEventListener('input', function (e) {
    var k = e.target.getAttribute && e.target.getAttribute('data-ek');
    if (k) e.target.classList.toggle('dirty', e.target.value.trim() !== (e.target.getAttribute('data-orig') || '').trim());
    if (k || (e.target.classList && e.target.classList.contains('ed-c'))) updateCount();
  });
  document.addEventListener('change', function (e) {
    var fk = e.target.getAttribute && e.target.getAttribute('data-fk');
    if (fk) { U.files[fk] = e.target.files && e.target.files.length ? Array.prototype.slice.call(e.target.files) : null; var pk = e.target.closest('.upd-file').querySelector('.upd-picked'); if (pk) pk.textContent = U.files[fk] ? x('picked') + ' ' + U.files[fk].map(function (f) { return f.name; }).join('، ') : ''; updateCount(); return; }
    if (e.target.matches && e.target.matches('select[data-ek], select.ed-c')) { e.target.classList.toggle('dirty', e.target.value !== (e.target.getAttribute('data-orig') || '')); updateCount(); }
  });
  window.addEventListener('scroll', function () { var t = $('#top'); if (t) t.classList.toggle('scrolled', window.scrollY > 8); }, { passive: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', draw); else draw();
})();
