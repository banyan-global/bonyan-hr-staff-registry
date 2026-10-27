/* ============================================================
   Bonyan HR — صفحة عرض البيانات (برمز دخول)
   صفحة مستقلة (admin.html) يُدخل إليها من زر «الموارد البشرية» أعلى النموذج، والرمز يُطلب في كل دخول (لا يُحفظ على الجهاز).
   - يُتحقق من الرمز في الخادم (خاصية ADMIN_CODE في Apps Script)
   - مؤشرات، كرة أرضية بأعداد المنسوبين والجنسيات، بحث وتصفية، جدول، تفاصيل كاملة، تصدير CSV
   ============================================================ */
(function () {
  'use strict';
  var STANDALONE = !window.BonyanApp || !!window.BONYAN_LIB; /* في admin.html يُحمَّل app.js مكتبةً لرسم البطاقات فقط */
  var A = window.BonyanApp || (function () {
    /* أدوات مستقلة حين تُفتح الصفحة وحدها */
    var CFG = window.APP_CONFIG, DICT = window.I18N, LS = 'bonyan-hr-registry-draft-v1';
    var lang = CFG.DEFAULT_LANG;
    try { var sl = localStorage.getItem(LS + '-lang'); if (sl && DICT[sl]) lang = sl; } catch (e) { }
    var q = (location.search.match(/[?&]lang=(ar|en|id)/) || [])[1]; if (q) lang = q;
    var CMAP = {}; (window.COUNTRIES || []).forEach(function (c) { CMAP[c[0]] = c; });
    var LI = { ar: 1, en: 2, id: 3 };
    var ar = function (s) { return String(s).replace(/\d/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'[d]; }); };
    var st = { lang: lang, view: 'admin' };
    var tl = function (L, k, v) { var s = (DICT[L] && DICT[L][k]) || DICT.ar[k] || k; return v ? s.replace(/\{(\w+)\}/g, function (_, n) { return L === 'ar' ? ar(v[n]) : v[n]; }) : s; };
    return {
      state: st, CFG: CFG, DEMO: !CFG.GAS_URL,
      t: function (k, v) { return tl(st.lang, k, v); }, tl: tl,
      esc: function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); },
      cname: function (cc) { var c = CMAP[cc]; return c ? c[LI[st.lang]] : ''; },
      flag: function (cc) { return cc && /^[A-Z]{2}$/i.test(cc) ? '<img class="flag" src="https://flagcdn.com/w40/' + cc.toLowerCase() + '.png" alt="" width="20" height="15" loading="lazy">' : ''; },
      num: function (n) { return st.lang === 'ar' ? ar(n) : String(n); },
      api: function (body) {
        return fetch(CFG.GAS_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body), redirect: 'follow' })
          .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
          .then(function (j) { if (!j.ok) throw new Error(j.error || 'error'); return j; });
      },
      toast: function (m) { var el = document.getElementById('toast'); if (!el) return; el.textContent = m; el.className = 'toast show'; clearTimeout(el._t); el._t = setTimeout(function () { el.className = 'toast'; }, 2600); },
      $: function (s, r) { return (r || document).querySelector(s); },
      $$: function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); },
      globeLabel: function (o) { return o.name ? o.name[st.lang] : ''; },
      hqText: function (compact) { var h = CFG.HQ; return (compact ? h.short : (h.label || h.name))[st.lang]; },
      hqTip: function () { var e = function (v) { return String(v).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }; return '<b>' + e(CFG.HQ.name[st.lang]) + '</b>' + (CFG.SITES || []).map(function (q) { return '<span>' + e(q.name[st.lang]) + '</span>'; }).join(''); }
    };
  })();
  var $ = A.$, $$ = A.$$, esc = A.esc;
  var SS_KEY = 'bonyan-hr-admin-code';
  var DEMO_CODE = '123456';
  var PAGE = 40;

  var TX = {
    ar: {
      eyebrow: 'الموارد البشرية · سري', title: 'لوحة بيانات المنسوبين', lockT: 'صفحة خاصة بالموارد البشرية',
      lockD: 'أدخل رمز الدخول لعرض بيانات المنسوبين ومرفقاتهم.', code: 'رمز الدخول', show: 'إظهار الرمز', view: 'عرض البيانات',
      demoHint: 'وضع المعاينة: استخدم الرمز {c} لعرض بيانات تجريبية.', checking: 'جارٍ التحقق…', back: 'العودة إلى النموذج',
      bad: 'الرمز غير صحيح', locked: 'أُوقفت المحاولات مؤقتًا لكثرة الأخطاء، حاول بعد ١٥ دقيقة.', notSetup: 'لم يُضبط رمز صفحة البيانات بعد. شغّل الدالة setup في Apps Script.', refreshFail: 'تعذّر التحديث، ما زالت البيانات السابقة معروضة.', stDone: 'مكتمل', stUpd: 'محدَّث', stPend: 'بانتظار المرفقات', net: 'تعذّر الاتصال بالخادم، حاول مرة أخرى.', updated: 'آخر تحديث: {d}', demoTag: 'بيانات تجريبية',
      refresh: 'تحديث', csv: 'تصدير CSV', sheet: 'فتح الجدول', lock: 'قفل',
      kTotal: 'إجمالي المنسوبين', kCountries: 'دولة عمل', kNat: 'جنسية', kEnt: 'جهة', kExp: 'وثائق منتهية أو تنتهي خلال ٩٠ يومًا', kPend: 'بانتظار المرفقات',
      geoT: 'توزّع المنسوبين حول العالم', geoD: 'اضغط على أي دولة في القائمة أو على الكرة لعرض منسوبيها.', all: 'الكل',
      natN: 'الجنسيات: {n}', regsN: 'المناطق: {n}', regN: 'المناطق', entN: 'الجهات: {n}', staffN: 'المنسوبون: {n}',
      search: 'ابحث بالاسم أو الرقم المرجعي أو الجواز أو الجوال…', fCountry: 'دولة العمل', fEntity: 'الجهة', fStatus: 'الحالة',
      results: '{n} نتيجة', clear: 'مسح التصفية', more: 'عرض المزيد', empty: 'لا توجد نتائج مطابقة.', none: 'لا توجد بيانات بعد. ستظهر هنا بعد أول استمارة مكتملة.',
      cName: 'المنسوب', cRef: 'الرقم المرجعي', cEnt: 'الجهة', cJob: 'المسمى', cWork: 'دولة العمل', cNat: 'الجنسية', cMobile: 'الجوال', cPass: 'انتهاء الجواز', cStatus: 'الحالة',
      folder: 'مجلد المرفقات', close: 'إغلاق', file: 'ملف {n}', openFile: 'عرض الملف', noFile: 'لا يوجد',
      g: { id: 'البيانات الشخصية', docs: 'الوثائق الرسمية', contact: 'التواصل والعنوان', em: 'الطوارئ', job: 'الوظيفة والعقد', edu: 'المؤهلات والخبرات', fin: 'الراتب والبيانات المالية', files: 'المرفقات', sys: 'بيانات السجل' },
      quals: 'المؤهلات', exp: 'الخبرات', langs: 'اللغات', expired: 'منتهية', soon: 'خلال {n} يومًا'
    },
    en: {
      eyebrow: 'Human Resources · Confidential', title: 'Staff Data Dashboard', lockT: 'HR-only page',
      lockD: 'Enter the access code to view staff records and documents.', code: 'Access code', show: 'Show code', view: 'View data',
      demoHint: 'Preview mode: use code {c} to see sample data.', checking: 'Checking…', back: 'Back to the form',
      bad: 'Incorrect code', locked: 'Too many wrong attempts. Try again in 15 minutes.', notSetup: 'The dashboard code is not set yet. Run setup in Apps Script.', refreshFail: 'Refresh failed; showing the previous data.', stDone: 'Complete', stUpd: 'Updated', stPend: 'Awaiting attachments', net: 'Could not reach the server, please try again.', updated: 'Updated: {d}', demoTag: 'Sample data',
      refresh: 'Refresh', csv: 'Export CSV', sheet: 'Open sheet', lock: 'Lock',
      kTotal: 'Total staff', kCountries: 'Countries', kNat: 'Nationalities', kEnt: 'Entities', kExp: 'Documents expired or expiring within 90 days', kPend: 'Awaiting documents',
      geoT: 'Staff around the world', geoD: 'Tap a country in the list or on the globe to see its staff.', all: 'All',
      natN: 'Nationalities: {n}', regsN: 'Regions: {n}', regN: 'Regions', entN: 'Entities: {n}', staffN: 'Staff: {n}',
      search: 'Search by name, reference, passport or mobile…', fCountry: 'Work country', fEntity: 'Entity', fStatus: 'Status',
      results: '{n} results', clear: 'Clear filters', more: 'Show more', empty: 'No matching results.', none: 'No data yet. Records appear here after the first completed form.',
      cName: 'Staff member', cRef: 'Reference', cEnt: 'Entity', cJob: 'Job title', cWork: 'Work country', cNat: 'Nationality', cMobile: 'Mobile', cPass: 'Passport expiry', cStatus: 'Status',
      folder: 'Documents folder', close: 'Close', file: 'File {n}', openFile: 'Open file', noFile: 'None',
      g: { id: 'Personal details', docs: 'Official documents', contact: 'Contact & address', em: 'Emergency', job: 'Job & contract', edu: 'Qualifications & experience', fin: 'Salary & payment', files: 'Documents', sys: 'Record' },
      quals: 'Qualifications', exp: 'Experience', langs: 'Languages', expired: 'Expired', soon: 'In {n} days'
    },
    id: {
      eyebrow: 'SDM · Rahasia', title: 'Dasbor Data Staf', lockT: 'Halaman khusus SDM',
      lockD: 'Masukkan kode akses untuk melihat data staf dan dokumennya.', code: 'Kode akses', show: 'Tampilkan kode', view: 'Lihat data',
      demoHint: 'Mode pratinjau: gunakan kode {c} untuk melihat data contoh.', checking: 'Memeriksa…', back: 'Kembali ke formulir',
      bad: 'Kode salah', locked: 'Terlalu banyak percobaan salah. Coba lagi dalam 15 menit.', notSetup: 'Kode dasbor belum diatur. Jalankan setup di Apps Script.', refreshFail: 'Gagal memperbarui; data sebelumnya tetap ditampilkan.', stDone: 'Lengkap', stUpd: 'Diperbarui', stPend: 'Menunggu lampiran', net: 'Tidak dapat terhubung ke server, coba lagi.', updated: 'Diperbarui: {d}', demoTag: 'Data contoh',
      refresh: 'Muat ulang', csv: 'Ekspor CSV', sheet: 'Buka sheet', lock: 'Kunci',
      kTotal: 'Total staf', kCountries: 'Negara', kNat: 'Kewarganegaraan', kEnt: 'Lembaga', kExp: 'Dokumen kedaluwarsa atau habis dalam 90 hari', kPend: 'Menunggu dokumen',
      geoT: 'Sebaran staf di dunia', geoD: 'Ketuk negara di daftar atau di bola dunia untuk melihat stafnya.', all: 'Semua',
      natN: 'Kewarganegaraan: {n}', regsN: 'Wilayah: {n}', regN: 'Wilayah', entN: 'Lembaga: {n}', staffN: 'Staf: {n}',
      search: 'Cari nama, nomor referensi, paspor atau ponsel…', fCountry: 'Negara kerja', fEntity: 'Lembaga', fStatus: 'Status',
      results: '{n} hasil', clear: 'Hapus filter', more: 'Tampilkan lagi', empty: 'Tidak ada hasil yang cocok.', none: 'Belum ada data. Data muncul setelah formulir pertama selesai.',
      cName: 'Staf', cRef: 'Referensi', cEnt: 'Lembaga', cJob: 'Jabatan', cWork: 'Negara kerja', cNat: 'Kewarganegaraan', cMobile: 'Ponsel', cPass: 'Paspor berakhir', cStatus: 'Status',
      folder: 'Folder dokumen', close: 'Tutup', file: 'Berkas {n}', openFile: 'Buka berkas', noFile: 'Tidak ada',
      g: { id: 'Data pribadi', docs: 'Dokumen resmi', contact: 'Kontak & alamat', em: 'Darurat', job: 'Pekerjaan & kontrak', edu: 'Kualifikasi & pengalaman', fin: 'Gaji & pembayaran', files: 'Dokumen', sys: 'Catatan' },
      quals: 'Kualifikasi', exp: 'Pengalaman', langs: 'Bahasa', expired: 'Kedaluwarsa', soon: 'Dalam {n} hari'
    }
  };
  /* نصوص اللوحة المحدّثة: تبويبات، مخططات، وثائق، رواتب، سجل الدخول */
  Object.assign(TX.ar, {
    tabOv: 'نظرة عامة', tabStaff: 'المنسوبون', tabDocs: 'الوثائق والتنبيهات', tabPay: 'الرواتب', tabAudit: 'سجل الدخول',
    hello: 'مرحبًا {w}', ringL: 'سجلات مكتملة',
    cEntT: 'المنسوبون حسب الجهة', cNatT: 'أكثر الجنسيات', cEmpT: 'نوع الارتباط', cGenT: 'الجنس', cStT: 'حالة السجلات', cWeekT: 'التسجيلات خلال آخر ١٢ أسبوعًا',
    other: 'أخرى', male: 'ذكور', female: 'إناث', unknown: 'غير محدد', ofTotal: '{p}٪ من الإجمالي', weekOf: 'أسبوع {d}',
    fNat: 'الجنسية', fEmp: 'نوع الارتباط', fGender: 'الجنس', fDoc: 'الوثائق', docExp: 'وثائق منتهية', doc30: 'تنتهي خلال ٣٠ يومًا', doc90: 'تنتهي خلال ٩٠ يومًا', docSoon: 'وثيقة قريبة الانتهاء',
    vTable: 'جدول', vCards: 'بطاقات', cAdded: 'تاريخ التسجيل',
    dExpT: 'وثائق منتهية', d30T: 'تنتهي خلال ٣٠ يومًا', d90T: 'تنتهي خلال ٣١–٩٠ يومًا',
    dk: { passportExpiry: 'الجواز', nationalIdExpiry: 'الهوية الوطنية', permitExpiry: 'الإقامة', workPermitExpiry: 'تصريح العمل', contractEnd: 'العقد' },
    dEmpty: 'لا توجد وثائق منتهية أو تنتهي خلال ٩٠ يومًا.', dLeft: 'باقي {n} يومًا', dAgo: 'انتهت منذ {n} يومًا', dToday: 'تنتهي اليوم', dExport: 'تصدير القائمة',
    dKind: 'الوثيقة', dDate: 'تاريخ الانتهاء', dDays: 'الأيام المتبقية',
    pN: 'عدد الرواتب', pAvg: 'المتوسط', pMed: 'الوسيط', pMin: 'الأدنى', pMax: 'الأعلى', pSum: 'الإجمالي الشهري',
    pByEnt: 'متوسط الراتب حسب الجهة', pDist: 'توزيع الرواتب', pMethod: 'طريقة استلام الراتب (كل المنسوبين)',
    pNone: 'لا توجد رواتب مسجّلة بعد.', pNote: 'تُحسب الأرقام لكل عملة على حدة، ولا تُجمع العملات المختلفة معًا.',
    aTime: 'الوقت', aAct: 'العملية', aWho: 'المستخدم', aEmpty: 'لا توجد عمليات دخول مسجّلة.', aLogin: 'دخول', aFail: 'محاولة خاطئة',
    print: 'طباعة الملف', backForm: 'رجوع إلى النموذج',
    edOpen: 'تعديل البيانات والمرفقات', edit: 'تعديل', edSave: 'حفظ التعديلات', edCancel: 'إلغاء', edBanner: 'وضع التعديل: غيّر ما تريد ثم اضغط «حفظ التعديلات». تُحفظ في الجدول مباشرة وتُسجَّل باسمك في ورقة «السجل».', edAuto: 'يُبنى تلقائيًا من أجزاء الاسم', edReplace: 'استبدال الملف', edUpload: 'رفع ملف', edAdd: 'إضافة صف', edDel: 'حذف الصف', edNone: 'لا توجد تعديلات لحفظها', edSaving: 'جارٍ الحفظ…', edUploading: 'رفع الملفات {i} من {n}…', edSaved: 'تم حفظ التعديلات في الجدول', edFail: 'تعذّر الحفظ', edBig: 'ملف أكبر من ١٠ ميغابايت:', edPicked: 'سيُرفع:', edDirty: 'لديك تعديلات غير محفوظة: احفظها أو اضغط «إلغاء»',
    pList: 'كشف الرواتب', pAllEnt: 'كل الجهات', pSal: 'الراتب الشهري', pMeth: 'طريقة الاستلام', pBank: 'البنك', pAcc: 'الآيبان / رقم الحساب', pHolder: 'صاحب الحساب', pTotal: 'الإجمالي', pMissing: 'منسوبون لم يُسجَّل راتبهم', pCsv: 'تصدير كشف الرواتب', pEntHint: 'اضغط على جهة لعرض رواتبها فقط في الكشف', pShown: '{n} منسوبًا', pRowHint: 'اضغط على أي منسوب لعرض ملفه كاملًا',
    cardT: 'بطاقة المنسوب', cardFlip: 'اقلب البطاقة', cardPng: 'تنزيل البطاقة بوجهيها', cardMaking: 'جارٍ تجهيز البطاقة…', cardFail: 'تعذّر تجهيز البطاقة', cardHint: 'اضغط على البطاقة لقلبها', cardRow: 'عرض البطاقة'
  });
  Object.assign(TX.en, {
    tabOv: 'Overview', tabStaff: 'Staff', tabDocs: 'Documents & alerts', tabPay: 'Salaries', tabAudit: 'Access log',
    hello: 'Welcome, {w}', ringL: 'records complete',
    cEntT: 'Staff by entity', cNatT: 'Top nationalities', cEmpT: 'Employment type', cGenT: 'Gender', cStT: 'Record status', cWeekT: 'Registrations, last 12 weeks',
    other: 'Other', male: 'Male', female: 'Female', unknown: 'Not set', ofTotal: '{p}% of total', weekOf: 'Week of {d}',
    fNat: 'Nationality', fEmp: 'Employment type', fGender: 'Gender', fDoc: 'Documents', docExp: 'Expired documents', doc30: 'Expiring within 30 days', doc90: 'Expiring within 90 days', docSoon: 'Document expiring soon',
    vTable: 'Table', vCards: 'Cards', cAdded: 'Registered',
    dExpT: 'Expired documents', d30T: 'Expiring within 30 days', d90T: 'Expiring in 31–90 days',
    dk: { passportExpiry: 'Passport', nationalIdExpiry: 'National ID', permitExpiry: 'Residence permit', workPermitExpiry: 'Work permit', contractEnd: 'Contract' },
    dEmpty: 'No documents expired or expiring within 90 days.', dLeft: '{n} days left', dAgo: 'Expired {n} days ago', dToday: 'Expires today', dExport: 'Export list',
    dKind: 'Document', dDate: 'Expiry date', dDays: 'Days left',
    pN: 'Salaries', pAvg: 'Average', pMed: 'Median', pMin: 'Lowest', pMax: 'Highest', pSum: 'Monthly total',
    pByEnt: 'Average salary by entity', pDist: 'Salary distribution', pMethod: 'Payment method (all staff)',
    pNone: 'No salaries recorded yet.', pNote: 'Figures are calculated per currency; different currencies are never added together.',
    aTime: 'Time', aAct: 'Action', aWho: 'User', aEmpty: 'No sign-ins recorded.', aLogin: 'Sign-in', aFail: 'Wrong code',
    print: 'Print record', backForm: 'Back to the form',
    edOpen: 'Edit data & documents', edit: 'Edit', edSave: 'Save changes', edCancel: 'Cancel', edBanner: 'Edit mode: change what you need, then tap “Save changes”. Changes go straight to the sheet and are logged under your name.', edAuto: 'Built automatically from the name parts', edReplace: 'Replace file', edUpload: 'Upload file', edAdd: 'Add row', edDel: 'Delete row', edNone: 'Nothing to save', edSaving: 'Saving…', edUploading: 'Uploading files {i} of {n}…', edSaved: 'Changes saved to the sheet', edFail: 'Could not save', edBig: 'File larger than 10 MB:', edPicked: 'Will upload:', edDirty: 'You have unsaved changes: save them or tap Cancel',
    pList: 'Payroll list', pAllEnt: 'All entities', pSal: 'Monthly salary', pMeth: 'Payment method', pBank: 'Bank', pAcc: 'IBAN / account no.', pHolder: 'Account holder', pTotal: 'Total', pMissing: 'Staff with no salary recorded', pCsv: 'Export payroll', pEntHint: 'Tap an entity to list its salaries only', pShown: '{n} staff', pRowHint: 'Tap any staff member to open the full record',
    cardT: 'Staff card', cardFlip: 'Flip card', cardPng: 'Download both sides', cardMaking: 'Preparing the card…', cardFail: 'Could not prepare the card', cardHint: 'Tap the card to flip it', cardRow: 'View card'
  });
  Object.assign(TX.id, {
    tabOv: 'Ringkasan', tabStaff: 'Staf', tabDocs: 'Dokumen & peringatan', tabPay: 'Gaji', tabAudit: 'Log akses',
    hello: 'Selamat datang, {w}', ringL: 'data lengkap',
    cEntT: 'Staf per lembaga', cNatT: 'Kewarganegaraan terbanyak', cEmpT: 'Jenis hubungan kerja', cGenT: 'Jenis kelamin', cStT: 'Status data', cWeekT: 'Pendaftaran 12 minggu terakhir',
    other: 'Lainnya', male: 'Laki-laki', female: 'Perempuan', unknown: 'Tidak diisi', ofTotal: '{p}% dari total', weekOf: 'Minggu {d}',
    fNat: 'Kewarganegaraan', fEmp: 'Jenis hubungan kerja', fGender: 'Jenis kelamin', fDoc: 'Dokumen', docExp: 'Dokumen kedaluwarsa', doc30: 'Habis dalam 30 hari', doc90: 'Habis dalam 90 hari', docSoon: 'Dokumen segera habis',
    vTable: 'Tabel', vCards: 'Kartu', cAdded: 'Terdaftar',
    dExpT: 'Dokumen kedaluwarsa', d30T: 'Habis dalam 30 hari', d90T: 'Habis dalam 31–90 hari',
    dk: { passportExpiry: 'Paspor', nationalIdExpiry: 'KTP/ID', permitExpiry: 'Izin tinggal', workPermitExpiry: 'Izin kerja', contractEnd: 'Kontrak' },
    dEmpty: 'Tidak ada dokumen kedaluwarsa atau habis dalam 90 hari.', dLeft: 'Sisa {n} hari', dAgo: 'Kedaluwarsa {n} hari lalu', dToday: 'Habis hari ini', dExport: 'Ekspor daftar',
    dKind: 'Dokumen', dDate: 'Tanggal habis', dDays: 'Sisa hari',
    pN: 'Jumlah gaji', pAvg: 'Rata-rata', pMed: 'Median', pMin: 'Terendah', pMax: 'Tertinggi', pSum: 'Total bulanan',
    pByEnt: 'Rata-rata gaji per lembaga', pDist: 'Sebaran gaji', pMethod: 'Cara pembayaran (semua staf)',
    pNone: 'Belum ada gaji yang tercatat.', pNote: 'Angka dihitung per mata uang; mata uang berbeda tidak dijumlahkan.',
    aTime: 'Waktu', aAct: 'Aksi', aWho: 'Pengguna', aEmpty: 'Belum ada catatan masuk.', aLogin: 'Masuk', aFail: 'Kode salah',
    print: 'Cetak data', backForm: 'Kembali ke formulir',
    edOpen: 'Ubah data & dokumen', edit: 'Ubah', edSave: 'Simpan perubahan', edCancel: 'Batal', edBanner: 'Mode ubah: ubah yang perlu lalu ketuk “Simpan perubahan”. Perubahan langsung masuk ke tabel dan dicatat atas nama Anda.', edAuto: 'Dibentuk otomatis dari bagian nama', edReplace: 'Ganti berkas', edUpload: 'Unggah berkas', edAdd: 'Tambah baris', edDel: 'Hapus baris', edNone: 'Tidak ada perubahan', edSaving: 'Menyimpan…', edUploading: 'Mengunggah berkas {i} dari {n}…', edSaved: 'Perubahan tersimpan di tabel', edFail: 'Gagal menyimpan', edBig: 'Berkas lebih dari 10 MB:', edPicked: 'Akan diunggah:', edDirty: 'Ada perubahan yang belum disimpan: simpan atau ketuk Batal',
    pList: 'Daftar gaji', pAllEnt: 'Semua lembaga', pSal: 'Gaji bulanan', pMeth: 'Cara pembayaran', pBank: 'Bank', pAcc: 'IBAN / No. rekening', pHolder: 'Pemilik rekening', pTotal: 'Total', pMissing: 'Staf tanpa gaji tercatat', pCsv: 'Ekspor daftar gaji', pEntHint: 'Ketuk lembaga untuk melihat gajinya saja', pShown: '{n} staf', pRowHint: 'Ketuk staf untuk membuka data lengkapnya',
    cardT: 'Kartu staf', cardFlip: 'Balik kartu', cardPng: 'Unduh kedua sisi', cardMaking: 'Menyiapkan kartu…', cardFail: 'Kartu tidak dapat disiapkan', cardHint: 'Ketuk kartu untuk membaliknya', cardRow: 'Lihat kartu'
  });
  function x(k, v) {
    var d = TX[A.state.lang] || TX.ar, s = k.indexOf('.') > 0 ? d[k.split('.')[0]][k.split('.')[1]] : d[k];
    s = s == null ? k : s;
    return v ? s.replace(/\{(\w+)\}/g, function (_, n) { return A.num(v[n]); }) : s;
  }

  /* أعمدة السجل (نسخة احتياطية مطابقة لـ Code.gs — تستبدلها الأعمدة القادمة من الخادم) */
  var COLS = [
  ['ref', 'الرقم المرجعي', 's'], ['status', 'الحالة', 's'], ['createdAt', 'تاريخ التسجيل', 's'], ['updatedAt', 'آخر تحديث', 's'],
  ['folder', 'مجلد المرفقات', 's'],
  ['fullNameAr', 'الاسم بالعربية', 't'], ['fullNameLatin', 'الاسم كما في الجواز', 't'],
  ['firstNameAr', 'الاسم الأول', 't'], ['fatherNameAr', 'اسم الأب', 't'], ['grandNameAr', 'اسم الجد', 't'], ['lastNameAr', 'اسم العائلة', 't'],
  ['firstName', 'First name', 't'], ['fatherName', 'Father name', 't'], ['grandName', 'Grandfather name', 't'], ['lastName', 'Family name', 't'],
  ['gender', 'الجنس', 't'], ['birthDate', 'تاريخ الميلاد', 'd'], ['birthCountry', 'دولة الميلاد', 't'], ['birthCity', 'مدينة الميلاد', 't'],
  ['nationality', 'الجنسية', 't'], ['otherNationality', 'جنسية أخرى', 't'], ['workCountry', 'دولة العمل', 't'],
  ['maritalStatus', 'الحالة الاجتماعية', 't'], ['dependents', 'عدد المعالين', 't'], ['bloodType', 'فصيلة الدم', 't'],
  ['passportNo', 'رقم الجواز', 't'], ['passportCountry', 'بلد إصدار الجواز', 't'], ['passportIssue', 'إصدار الجواز', 'd'], ['passportExpiry', 'انتهاء الجواز', 'd'],
  ['nationalIdNo', 'رقم الهوية الوطنية (ID)', 't'], ['nationalIdExpiry', 'انتهاء الهوية', 'd'],
  ['permitNo', 'رقم الإقامة', 't'], ['permitOccupation', 'المهنة في الإقامة', 't'], ['permitIssue', 'إصدار الإقامة', 'd'], ['permitExpiry', 'انتهاء الإقامة', 'd'],
  ['workPermitNo', 'رقم تصريح العمل', 't'], ['workPermitExpiry', 'انتهاء تصريح العمل', 'd'],
  ['insuranceNo', 'الرقم التأميني (مصر)', 't'], ['npwp', 'NPWP (إندونيسيا)', 't'], ['bpjsTk', 'BPJS Ketenagakerjaan', 't'], ['bpjsKes', 'BPJS Kesehatan', 't'],
  ['kraPin', 'KRA PIN (كينيا)', 't'], ['nssfNo', 'NSSF (كينيا)', 't'], ['shaNo', 'SHA (كينيا)', 't'], ['tin', 'TIN (إثيوبيا)', 't'],
  ['officialEmail', 'البريد الرسمي', 't'], ['personalEmail', 'البريد الشخصي', 't'], ['mobile', 'الجوال', 't'], ['whatsapp', 'الواتساب', 't'],
  ['addrCountry', 'دولة السكن', 't'], ['addrRegion', 'المنطقة', 't'], ['addrCity', 'المدينة', 't'],
  ['homeCountry', 'دولة العنوان الدائم', 't'], ['homeCity', 'مدينة العنوان الدائم', 't'],
  ['em1Name', 'طوارئ ١: الاسم', 't'], ['em1Relation', 'طوارئ ١: الصلة', 't'], ['em1Phone', 'طوارئ ١: الجوال', 't'],
  ['em2Name', 'طوارئ ٢: الاسم', 't'], ['em2Relation', 'طوارئ ٢: الصلة', 't'], ['em2Phone', 'طوارئ ٢: الجوال', 't'],
  ['entity', 'الجهة', 't'], ['workRegion', 'منطقة العمل', 't'], ['workOffice', 'المدينة/المكتب', 't'], ['department', 'الإدارة/القسم', 't'], ['jobTitle', 'المسمى الوظيفي', 't'],
  ['manager', 'المدير المباشر', 't'], ['employeeNo', 'الرقم الوظيفي', 't'], ['startDate', 'تاريخ مباشرة العمل', 'd'], ['employmentType', 'نوع الارتباط', 't'],
  ['contractStatus', 'عقد العمل', 't'], ['contractType', 'نوع العقد', 't'], ['contractNo', 'رقم العقد', 't'], ['contractStart', 'بداية العقد', 'd'], ['contractEnd', 'نهاية العقد', 'd'],
  ['topDegree', 'أعلى مؤهل', 't'], ['techLevel', 'المستوى التقني العام', 't'], ['techSkills', 'البرامج والمهارات التقنية', 't'],
  ['hasCerts', 'دورات وشهادات مهنية', 't'], ['certifications', 'تفاصيل الدورات والشهادات', 't'], ['quran', 'الحفظ من القرآن', 't'],
  ['payMethod', 'طريقة استلام الراتب', 't'], ['bankCountry', 'دولة البنك', 't'], ['bankName', 'البنك', 't'], ['accountHolder', 'صاحب الحساب', 't'],
  ['iban', 'الآيبان', 't'], ['accountNo', 'رقم الحساب', 't'], ['swift', 'SWIFT', 't'], ['bankBranch', 'الفرع', 't'], ['payOther', 'طريقة أخرى', 't'],
  ['salary', 'الراتب الشهري', 'n'], ['currency', 'العملة', 't'],
  ['photo', 'الصورة الشخصية', 'f'], ['passportScan', 'صورة الجواز', 'f'], ['nationalIdScan', 'صورة الهوية', 'f'], ['permitScan', 'صورة الإقامة', 'f'],
  ['workPermitScan', 'صورة تصريح العمل', 'f'], ['contractFile', 'ملف العقد', 'f'], ['degreeFile', 'الشهادة', 'f'], ['certFiles', 'الدورات والشهادات', 'f'], ['bankProof', 'إثبات الحساب', 'f'],
  ['lang', 'لغة التعبئة', 's'], ['tz', 'المنطقة الزمنية', 's'],
  ['workCountryCode', 'رمز دولة العمل', 's'], ['nationalityCode', 'رمز الجنسية', 's']
];
  var GROUPS = [
    ['id', ['fullNameAr', 'fullNameLatin', 'firstNameAr', 'fatherNameAr', 'grandNameAr', 'lastNameAr', 'firstName', 'fatherName', 'grandName', 'lastName', 'gender', 'birthDate', 'birthCountry', 'birthCity', 'nationality', 'otherNationality', 'maritalStatus', 'dependents', 'bloodType']],
    ['docs', ['passportNo', 'passportCountry', 'passportIssue', 'passportExpiry', 'nationalIdNo', 'nationalIdExpiry', 'permitNo', 'permitOccupation', 'permitIssue', 'permitExpiry', 'workPermitNo', 'workPermitExpiry', 'insuranceNo', 'npwp', 'bpjsTk', 'bpjsKes', 'kraPin', 'nssfNo', 'shaNo', 'tin']],
    ['contact', ['officialEmail', 'personalEmail', 'mobile', 'whatsapp', 'addrCountry', 'addrRegion', 'addrCity', 'homeCountry', 'homeCity']],
    ['em', ['em1Name', 'em1Relation', 'em1Phone', 'em2Name', 'em2Relation', 'em2Phone']],
    ['job', ['entity', 'workCountry', 'workRegion', 'workOffice', 'department', 'jobTitle', 'manager', 'employeeNo', 'startDate', 'employmentType', 'contractStatus', 'contractType', 'contractNo', 'contractStart', 'contractEnd']],
    ['edu', ['topDegree', 'techLevel', 'techSkills', 'hasCerts', 'certifications', 'quran']],
    ['fin', ['salary', 'currency', 'payMethod', 'bankCountry', 'bankName', 'accountHolder', 'iban', 'accountNo', 'swift', 'bankBranch', 'payOther']],
    ['files', ['photo', 'passportScan', 'nationalIdScan', 'permitScan', 'workPermitScan', 'contractFile', 'degreeFile', 'certFiles', 'bankProof']],
    ['sys', ['ref', 'status', 'createdAt', 'updatedAt', 'lang', 'tz']]
  ];
  var EXPIRY = ['passportExpiry', 'nationalIdExpiry', 'permitExpiry', 'workPermitExpiry', 'contractEnd'];

  var S = { data: null, loading: false, err: '', f: { q: '', country: '', nat: '', entity: '', status: '', emp: '', gender: '', doc: '' }, shown: PAGE, open: null, globe: null, el: null,
    tab: 'overview', view: 'table', sort: { k: 'createdAt', dir: -1 }, opts: {}, cur: '', docKind: '', payEnt: '', paySort: { k: 'salary', dir: -1 } };

  /* ---------------------------------------------------------- أدوات */
  function today() { var d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function days(v) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(v || ''); if (!m) return null; return Math.round((new Date(+m[1], m[2] - 1, +m[3]) - today()) / 864e5); }
  function expChip(v) {
    var n = days(v);
    if (n === null) return esc(v || '—');
    var cls = n < 0 ? 'bad' : (n <= 90 ? 'warn' : 'ok');
    return '<span class="chip ' + cls + '" dir="ltr">' + esc(v) + '</span>' + (n < 0 ? ' <small class="exp-note bad">' + esc(x('expired')) + '</small>' : (n <= 90 ? ' <small class="exp-note warn">' + esc(x('soon', { n: n })) + '</small>' : ''));
  }
  function stKey(v) { return /بانتظار/.test(v || '') ? 'stPend' : (/محد/.test(v || '') ? 'stUpd' : (v ? 'stDone' : '')); }
  function stText(v) { var k = stKey(v); return k ? x(k) : '—'; }
  function statusChip(v) {
    var cls = /بانتظار/.test(v) ? 'warn' : (/محد/.test(v) ? 'info' : 'ok');
    return '<span class="chip ' + cls + '">' + esc(stText(v)) + '</span>';
  }
  function colLbl(c) {
    if (A.state.lang === 'ar') return c[1];
    var D = window.I18N && window.I18N[A.state.lang], v = D && D['f.' + c[0]];
    return typeof v === 'string' && v ? v : c[1];
  }
  function normQ(v) { return String(v == null ? '' : v).replace(/[٠-٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); }).replace(/[۰-۹]/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d); }).toLowerCase().replace(/\s+/g, ' '); }
  function cc2name(cc, fallback) { return (cc && A.cname(cc)) || fallback || cc || '—'; }
  function uniq(arr) { var o = {}; arr.forEach(function (v) { if (v) o[v] = 1; }); return Object.keys(o); }
  function initials(n) { return String(n || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0]; }).join(''); }
  function driveThumb(u) { var m = /\/d\/([\w-]+)|[?&]id=([\w-]+)/.exec(u || ''); return m ? 'https://drive.google.com/thumbnail?id=' + (m[1] || m[2]) + '&sz=w240' : ''; }
  function files(v) { return Array.isArray(v) ? v : []; }
  /* الرمز يبقى في الذاكرة فقط أثناء فتح الصفحة؛ لا يُحفظ على الجهاز، ويُطلب من جديد عند كل دخول */
  var memCode = '';
  try { sessionStorage.removeItem(SS_KEY); } catch (e) { }
  function saveCode(c) { memCode = c; }
  function readCode() { return memCode; }
  function dropCode() { memCode = ''; }

  /* ---------------------------------------------------------- بيانات المعاينة */
  function demoData() {
    var seed = 7; function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    function pick(a) { return a[Math.floor(rnd() * a.length)]; }
    function dt(offsetDays) { var d = today(); d.setDate(d.getDate() + offsetDays); return d.toISOString().slice(0, 10); }
    var people = [['AHMED SALEH', 'أحمد صالح', 'ذكر'], ['FATIMA HASSAN', 'فاطمة حسن', 'أنثى'], ['MUHAMMAD RIZKI', 'محمد رزقي', 'ذكر'], ['SITI AMINAH', 'سيتي آمنة', 'أنثى'], ['ABDULLAH OMAR', 'عبدالله عمر', 'ذكر'],
      ['AISHA MOHAMED', 'عائشة محمد', 'أنثى'], ['YUSUF ABDI', 'يوسف عبدي', 'ذكر'], ['HALIMA ALI', 'حليمة علي', 'أنثى'], ['IBRAHIM KHALID', 'إبراهيم خالد', 'ذكر'], ['MARYAM SAID', 'مريم سعيد', 'أنثى'],
      ['HAMZA TEKLE', 'حمزة تكلي', 'ذكر'], ['ZAINAB OSMAN', 'زينب عثمان', 'أنثى'], ['KHALID NASSER', 'خالد ناصر', 'ذكر'], ['NUR HIDAYAH', 'نور هداية', 'أنثى'], ['OMAR FARAH', 'عمر فارح', 'ذكر'],
      ['SAFIYA JUMA', 'صفية جمعة', 'أنثى'], ['BILAL AHMED', 'بلال أحمد', 'ذكر'], ['HAFSA YASIN', 'حفصة ياسين', 'أنثى'], ['ANAS KAMAL', 'أنس كمال', 'ذكر'], ['RUQAYYA ISMAIL', 'رقية إسماعيل', 'أنثى'],
      ['SALIM MWANGI', 'سالم موانغي', 'ذكر'], ['HUDA ABDELRAHMAN', 'هدى عبدالرحمن', 'أنثى'], ['TARIQ HUSSAIN', 'طارق حسين', 'ذكر'], ['ASMA ZAKARIA', 'أسماء زكريا', 'أنثى'],
      ['MUSA KEDIR', 'موسى كدير', 'ذكر'], ['AMINA WARSAME', 'أمينة ورسمي', 'أنثى'], ['HASSAN MBWANA', 'حسن مبوانا', 'ذكر'], ['LATIFA AZIZ', 'لطيفة عزيز', 'أنثى']];
    var place = [['SA', 'SA'], ['SA', 'EG'], ['SA', 'SD'], ['SA', 'YE'], ['SA', 'PK'], ['SA', 'ID'], ['SA', 'JO'], ['EG', 'EG'], ['EG', 'EG'], ['EG', 'SD'], ['ID', 'ID'], ['ID', 'ID'], ['ID', 'ID'],
      ['KE', 'KE'], ['KE', 'SO'], ['ET', 'ET'], ['ET', 'ET'], ['SO', 'SO'], ['TZ', 'TZ'], ['MY', 'ID'], ['PK', 'PK'], ['SA', 'SA'], ['SA', 'EG'], ['EG', 'EG'], ['ET', 'ET'], ['SO', 'SO'], ['TZ', 'KE'], ['SA', 'SY']];
    var ents = A.CFG.ENTITIES.filter(function (e) { return e.v !== 'other'; }).map(function (e) { return e.ar; }).slice(0, 9);
    var jobs = ['مدير مشروع', 'أخصائي بيانات', 'منسّق برامج', 'محاسب', 'معلّم', 'مشرف ميداني', 'مصمم جرافيك', 'أخصائي موارد بشرية', 'مطوّر أنظمة', 'مسؤول علاقات'];
    var cur = { SA: 'SAR', EG: 'EGP', ID: 'IDR', KE: 'KES', ET: 'ETB', SO: 'USD', TZ: 'TZS', MY: 'MYR', PK: 'PKR' };
    var sal = { SA: 7000, EG: 18000, ID: 9000000, KE: 90000, ET: 30000, SO: 900, TZ: 1500000, MY: 4500, PK: 150000 };
    var rows = people.map(function (p, i) {
      var pl = place[i % place.length], wc = pl[0], nc = pl[1], abroad = wc !== nc, created = dt(-Math.floor(rnd() * 60));
      var r = {
        ref: 'BNY-HR-' + wc + '-' + new Date().getFullYear() + '-' + ('000' + (i + 1)).slice(-4), status: i % 9 === 4 ? 'بانتظار المرفقات' : (i % 7 === 2 ? 'محدَّث' : 'مكتمل'),
        createdAt: created + ' ' + (8 + i % 10) + ':' + (10 + i * 7 % 50), updatedAt: created + ' ' + (9 + i % 10) + ':05', folder: '',
        fullNameLatin: p[0], fullNameAr: p[1], firstNameAr: p[1].split(' ')[0], lastNameAr: p[1].split(' ')[1], firstName: p[0].split(' ')[0], lastName: p[0].split(' ')[1], gender: p[2], birthDate: dt(-365 * (24 + Math.floor(rnd() * 25))), birthCountry: cc2name(nc), birthCity: '',
        nationality: A.cname(nc, 'ar'), otherNationality: '', workCountry: A.cname(wc, 'ar'), maritalStatus: pick(['متزوج', 'أعزب', 'متزوج']), dependents: String(Math.floor(rnd() * 5)), bloodType: pick(['O+', 'A+', 'B+', 'AB+', 'O-']),
        passportNo: String.fromCharCode(65 + i % 26) + (1000000 + Math.floor(rnd() * 8999999)), passportCountry: A.cname(nc, 'ar'), passportIssue: dt(-900), passportExpiry: dt(i % 6 === 1 ? -20 : (i % 5 === 2 ? 45 : 400 + Math.floor(rnd() * 1500))),
        nationalIdNo: String(10000000 + Math.floor(rnd() * 89999999)), nationalIdExpiry: dt(300 + Math.floor(rnd() * 1000)),
        permitNo: abroad ? String(2000000000 + Math.floor(rnd() * 99999999)) : '', permitOccupation: abroad ? pick(jobs) : '', permitIssue: abroad ? dt(-300) : '', permitExpiry: abroad ? dt(i % 4 === 1 ? 70 : 200 + Math.floor(rnd() * 400)) : '',
        officialEmail: p[0].split(' ')[0].toLowerCase() + '@bonyan.org', personalEmail: p[0].replace(' ', '.').toLowerCase() + '@mail.com', mobile: '+' + ['966', '20', '62', '254', '251', '252', '255', '60', '92'][['SA', 'EG', 'ID', 'KE', 'ET', 'SO', 'TZ', 'MY', 'PK'].indexOf(wc)] + ' 5' + Math.floor(10000000 + rnd() * 89999999), whatsapp: '',
        addrCountry: A.cname(wc, 'ar'), addrRegion: '', addrCity: '', homeCountry: abroad ? A.cname(nc, 'ar') : '', homeCity: '',
        em1Name: pick(['محمد', 'سارة', 'علي', 'خديجة']) + ' ' + p[1].split(' ')[1], em1Relation: pick(['أخ', 'زوج/زوجة', 'أب']), em1Phone: '+966 5' + Math.floor(10000000 + rnd() * 89999999), em2Name: '', em2Relation: '', em2Phone: '',
        entity: ents[i % ents.length], workRegion: ({ SA: pick(['منطقة مكة المكرمة', 'منطقة الرياض', 'المنطقة الشرقية']), EG: pick(['القاهرة', 'الجيزة']), ID: pick(['DKI Jakarta', 'Jawa Barat']), KE: pick(['Nairobi', 'Garissa']), ET: 'Addis Ababa' })[wc] || '', workOffice: '', department: pick(['البرامج', 'المالية', 'التقنية', 'التعليم', 'الموارد البشرية']), jobTitle: jobs[i % jobs.length], manager: '', employeeNo: 'E-' + (300 + i), startDate: dt(-200 - Math.floor(rnd() * 1500)), employmentType: pick(['دوام كامل', 'دوام كامل', 'عن بعد', 'ميداني']),
        contractStatus: i % 8 === 3 ? 'لا يوجد' : 'يوجد', contractType: i % 8 === 3 ? '' : 'محدد المدة', contractNo: '', contractStart: dt(-365), contractEnd: i % 8 === 3 ? '' : dt(i % 5 === 0 ? 60 : 300 + Math.floor(rnd() * 500)),
        techLevel: pick(['متوسط', 'متقدم', 'خبير']), certifications: i % 3 ? '1. إدارة المشاريع الاحترافية — الإدارة\n2. Google Data Analytics — تحليل البيانات' : '', hasCerts: i % 3 ? 'نعم' : 'لا', topDegree: pick(['بكالوريوس · إدارة أعمال', 'ماجستير · تربية', 'بكالوريوس · علوم حاسب', 'دبلوم · محاسبة', 'دكتوراه · دراسات إسلامية']), techSkills: '', quran: pick(['أقل من ٥ أجزاء', '٥–١٥ جزءًا', 'القرآن كاملًا']),
        payMethod: i % 6 === 5 ? 'نقدًا' : 'تحويل بنكي', bankCountry: A.cname(wc, 'ar'), bankName: pick(['البنك الأهلي', 'بنك الراجحي', 'Bank Syariah', 'Equity Bank']), accountHolder: p[0], iban: wc === 'SA' ? 'SA03 8000 0000 6080 1016 7519' : '', accountNo: wc === 'SA' ? '' : String(100000000 + Math.floor(rnd() * 899999999)), swift: '', bankBranch: '',
        payOther: '', salary: (Math.round(sal[wc] * (0.8 + rnd() * 0.9) / 100) * 100).toLocaleString('en-US'), currency: cur[wc],
        photo: [], passportScan: ['#'], nationalIdScan: ['#'], permitScan: abroad ? ['#'] : '', contractFile: i % 8 === 3 ? 'لا يوجد' : ['#'], degreeFile: '', bankProof: '',
        lang: pick(['ar', 'ar', 'en', 'id']), tz: '', workCountryCode: wc, nationalityCode: nc
      };
      return r;
    });
    var stamp = function (dd, h) { return dt(dd) + ' ' + h; };
    var audit = [[stamp(0, '09:12'), 'دخول لوحة البيانات', 'مشرف المعاينة'], [stamp(-1, '14:40'), 'دخول لوحة البيانات', 'مشرف المعاينة'], [stamp(-1, '14:39'), 'محاولة دخول خاطئة', ''], [stamp(-3, '10:05'), 'دخول لوحة البيانات', 'مشرف المعاينة']];
    return { ok: true, demo: true, who: 'مشرف المعاينة', audit: audit, at: new Date().toISOString().slice(0, 16).replace('T', ' '), cols: COLS, rows: rows.reverse(), quals: [], exp: [], langs: [], sheetUrl: '' };
  }

  /* ---------------------------------------------------------- الجلب */
  function load(code, silent) {
    S.loading = true; S.err = '';
    if (!silent) draw();
    var p = A.DEMO
      ? new Promise(function (res, rej) { setTimeout(function () { code === DEMO_CODE ? res(demoData()) : rej(new Error('bad_code')); }, 650); })
      : A.api({ action: 'list', code: code });
    return p.then(function (j) {
      S.data = j; S.loading = false; saveCode(code); S.shown = PAGE;
      draw();
      return true;
    }).catch(function (e) {
      S.loading = false;
      var m = (e && e.message) || '';
      var badCode = /bad_code|الرمز غير صحيح/.test(m);
      var msg = badCode ? x('bad') : (/locked|أُوقفت/.test(m) ? x('locked') : (/not_setup/.test(m) ? x('notSetup') : (/Failed to fetch|NetworkError|HTTP|Load failed/.test(m) ? x('net') : (m || x('bad')))));
      if (silent && S.data && !badCode) { A.toast(x('refreshFail')); var rb = $('[data-adm="refresh"]'); if (rb) rb.classList.remove('busy'); return false; }
      S.err = msg;
      if (badCode) dropCode();
      S.data = null; draw();
      var inp = $('#admCode'); if (inp) { inp.select(); }
      return false;
    });
  }

  /* ---------------------------------------------------------- الرسم */
  function draw() {
    var el = S.el; if (!el) return;
    if (!S.data) { if (S.globe) { S.globe.destroy(); S.globe = null; } el.innerHTML = lockHTML(); var i = $('#admCode'); if (i && !S.loading) setTimeout(function () { i.focus(); }, 60); return; }
    el.innerHTML = dashHTML();
    if (S.tab === 'overview') mountGlobe();
    if (S.tab === 'staff') drawTable();
  }
  var LOCK_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path class="shackle" d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/><circle cx="12" cy="15.5" r="1.4"/></svg>';
  function lockHTML() {
    return '<div class="lock-wrap"><form class="lock-card' + (S.err ? ' is-err' : '') + (S.loading ? ' is-busy' : '') + '" id="admLock" autocomplete="off">' +
      '<span class="lock-ic">' + LOCK_SVG + '</span>' +
      '<p class="eyebrow">' + esc(x('eyebrow')) + '</p><h1>' + esc(x('lockT')) + '</h1><p class="lead">' + esc(x('lockD')) + '</p>' +
      '<label class="lbl" for="admCode">' + esc(x('code')) + '</label>' +
      '<div class="code-row"><input class="inp code-inp" id="admCode" type="password" inputmode="numeric" autocomplete="one-time-code" maxlength="24" dir="ltr" placeholder="••••••"' + (S.loading ? ' disabled' : '') + '>' +
      '<button type="button" class="code-eye" id="admEye" aria-label="' + esc(x('show')) + '" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/></svg></button></div>' +
      '<p class="err" role="alert">' + esc(S.err) + '</p>' +
      '<button type="submit" class="btn gold big" id="admGo"' + (S.loading ? ' disabled' : '') + '><span>' + esc(S.loading ? x('checking') : x('view')) + '</span>' + (S.loading ? '<i class="spin" aria-hidden="true"></i>' : '<svg class="arr" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11m-4-4 4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>') + '</button>' +
      (A.DEMO ? '<p class="note"><span class="dot" aria-hidden="true"></span>' + esc(x('demoHint', { c: DEMO_CODE }).replace(A.num(DEMO_CODE), DEMO_CODE)) + '</p>' : '') +
      '<a class="link" href="index.html">' + esc(x('back')) + '</a>' +
      '</form></div>';
  }
  function stats(rows) {
    var by = {};
    rows.forEach(function (r) {
      var c = r.workCountryCode || ''; if (!c) return;
      by[c] = by[c] || { n: 0, nats: {}, ents: {}, regs: {} };
      var rk = String(r.workRegion || '').trim().toLowerCase().replace(/^(منطقة|محافظة|provinsi|county)\s+/, '');
      if (rk) by[c].regs[rk] = 1;
      by[c].n++; if (r.nationalityCode) by[c].nats[r.nationalityCode] = 1; if (r.entity) by[c].ents[r.entity] = 1;
    });
    return by;
  }
  function expiring(r) { return EXPIRY.some(function (k) { var n = days(r[k]); return n !== null && n <= 90; }); }
  /* ترجمة القيم المخزَّنة بالعربية (الجنس، نوع الارتباط…) إلى لغة الواجهة */
  var REV = null;
  function loc(field, v) {
    if (!v) return v;
    var D = window.I18N || {}, L = A.state.lang;
    if (!REV) {
      REV = {};
      Object.keys(D.ar || {}).forEach(function (k) { var m = /^o\.(\w+)\.(\w+)$/.exec(k); if (m) REV[m[1] + '|' + D.ar[k]] = k; });
    }
    var key = REV[field + '|' + v];
    return key && D[L] && D[L][key] ? D[L][key] : v;
  }
  function moneyOf(v) { var n = +String(v == null ? '' : v).replace(/[٠-٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); }).replace(/[^\d.]/g, ''); return isFinite(n) && n > 0 ? n : null; }
  function fmtN(n) { return Math.round(n).toLocaleString(A.state.lang === 'ar' ? 'ar-u-nu-arab' : 'en-US'); }
  function pct(a, b) { return b ? Math.round(a / b * 100) : 0; }
  function genderKey(v) { return /ذكر|^male/i.test(v || '') ? 'male' : (/أنثى|female/i.test(v || '') ? 'female' : ''); }
  function docState(r) {
    var worst = null;
    EXPIRY.forEach(function (k) { var n = days(r[k]); if (n !== null && (worst === null || n < worst)) worst = n; });
    return worst === null ? '' : (worst < 0 ? 'exp' : (worst <= 30 ? 'd30' : (worst <= 90 ? 'd90' : 'ok')));
  }
  function countBy(rows, fn) { var o = {}; rows.forEach(function (r) { var k = fn(r); if (k) o[k] = (o[k] || 0) + 1; }); return o; }
  function sortedPairs(o) { return Object.keys(o).map(function (k) { return [k, o[k]]; }).sort(function (a, b) { return b[1] - a[1]; }); }

  var ICON = {
    users: 'M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19M10 10.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M20 19v-1.5a3.5 3.5 0 0 0-2.6-3.4M15.5 3.6a3.5 3.5 0 0 1 0 6.8',
    globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M3 12h18M12 3c2.6 2.6 2.6 15.4 0 18M12 3c-2.6 2.6-2.6 15.4 0 18',
    flag: 'M4 21V4M4 4h11l-1.5 3.5L15 11H4',
    ent: 'M4 20V9l8-5 8 5v11M9 20v-6h6v6M2 20h20',
    clock: 'M12 8v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18',
    file: 'M6 2.5h8l4 4V21H6zM14 2.5V7h4M12 11v4M12 17.5v.01',
    grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
    rows: 'M4 6h16M4 12h16M4 18h16',
    money: 'M3 7h18v10H3zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6M6 10v.01M18 14v.01',
    shield: 'M12 3 4.5 6v6c0 4.5 3.2 7.8 7.5 9 4.3-1.2 7.5-4.5 7.5-9V6z',
    chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
    back: 'M14 6l6 6-6 6M20 12H4'
  };
  function ic(p) { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + p + '"/></svg>'; }

  function dashHTML() {
    var d = S.data, rows = d.rows || [], by = stats(rows);
    var docs = rows.map(docState);
    var nExp = docs.filter(function (s) { return s === 'exp'; }).length, nSoon = docs.filter(function (s) { return s === 'd30' || s === 'd90'; }).length;
    var nPend = rows.filter(function (r) { return /بانتظار/.test(r.status); }).length;
    var done = rows.length - nPend;
    var kp = [
      [rows.length, 'kTotal', ICON.users, '', ''],
      [Object.keys(by).length, 'kCountries', ICON.globe, '', 'tab:overview'],
      [uniq(rows.map(function (r) { return r.nationalityCode; })).length, 'kNat', ICON.flag, '', ''],
      [uniq(rows.map(function (r) { return r.entity; })).length, 'kEnt', ICON.ent, '', ''],
      [nExp + nSoon, 'kExp', ICON.clock, nExp ? 'bad' : 'warn', 'tab:docs'],
      [nPend, 'kPend', ICON.file, 'warn', 'pend']
    ];
    var tabs = [['overview', 'tabOv', ICON.chart], ['staff', 'tabStaff', ICON.users], ['docs', 'tabDocs', ICON.clock, nExp + nSoon], ['pay', 'tabPay', ICON.money]];
    if (d.audit) tabs.push(['audit', 'tabAudit', ICON.shield]);
    var ring = pct(done, rows.length);
    return '<section class="adm-hero rise" style="--d:0">' +
        '<span class="adm-hero-glow" aria-hidden="true"></span>' +
        '<div class="adm-hero-top"><div class="adm-hero-t"><p class="eyebrow"><span class="lock-mini">' + LOCK_SVG + '</span>' + esc(x('eyebrow')) + '</p>' +
          '<h1>' + esc(x('title')) + '</h1>' +
          '<p class="adm-hello">' + (d.who ? esc(x('hello', { w: d.who })) + ' · ' : '') + esc(x('updated', { d: '' })) + '<span dir="ltr">' + esc(d.at || '') + '</span>' + (d.demo ? ' <em class="demo-tag">' + esc(x('demoTag')) + '</em>' : '') + '</p></div>' +
          '<div class="adm-ring" style="--p:' + ring + '"><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="50" class="trk"/><circle cx="60" cy="60" r="50" class="val" style="stroke-dasharray:' + (314.16 * ring / 100).toFixed(1) + ' 314.16"/></svg><b>' + A.num(ring) + '٪</b><span>' + esc(x('ringL')) + '</span></div>' +
        '</div>' +
        '<ul class="adm-kpis">' + kp.map(function (k, i) {
          var tag = k[4] ? 'button type="button" data-kpi="' + k[4] + '"' : 'div';
          return '<li class="kpi rise ' + k[3] + '" style="--d:' + (i + 1) + '"><' + tag + ' class="kpi-in"><span class="kpi-ic" aria-hidden="true">' + ic(k[2]) + '</span><b>' + A.num(k[0]) + '</b><span>' + esc(x(k[1])) + '</span></' + (k[4] ? 'button' : 'div') + '></li>';
        }).join('') + '</ul>' +
        '<div class="adm-actions">' +
          '<button type="button" class="btn ghost sm" data-adm="refresh"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11a8 8 0 0 0-14.9-3.5M4 4v4h4M4 13a8 8 0 0 0 14.9 3.5M20 20v-4h-4"/></svg>' + esc(x('refresh')) + '</button>' +
          '<button type="button" class="btn ghost sm" data-adm="csv"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11m0 0-4-4m4 4 4-4M5 19h14"/></svg>' + esc(x('csv')) + '</button>' +
          (d.sheetUrl ? '<a class="btn ghost sm" href="' + esc(d.sheetUrl) + '" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3.5" width="16" height="17" rx="2"/><path d="M4 9h16M4 14.5h16M10 9v11.5"/></svg>' + esc(x('sheet')) + '</a>' : '') +
          '<button type="button" class="btn ghost sm" data-adm="lock">' + LOCK_SVG + esc(x('lock')) + '</button>' +
        '</div>' +
      '</section>' +
      '<nav class="adm-tabs rise" style="--d:3" role="tablist">' + tabs.map(function (tb) {
        return '<button type="button" role="tab" data-tab="' + tb[0] + '" aria-selected="' + (S.tab === tb[0]) + '">' + ic(tb[2]) + '<span>' + esc(x(tb[1])) + '</span>' + (tb[3] ? '<em>' + A.num(tb[3]) + '</em>' : '') + '</button>';
      }).join('') + '</nav>' +
      '<div class="adm-panel" id="admPanel">' + panelHTML() + '</div>';
  }
  function panelHTML() {
    if (S.tab === 'staff') return staffHTML();
    if (S.tab === 'docs') return docsHTML();
    if (S.tab === 'pay') return payHTML();
    if (S.tab === 'audit') return auditHTML();
    return overviewHTML();
  }

  /* ---------- مخططات أفقية بسيطة (عمود واحد بلون واحد) */
  function hbars(pairs, opt) {
    opt = opt || {};
    var max = pairs.reduce(function (m, p) { return Math.max(m, p[1]); }, 0) || 1, tot = opt.total || pairs.reduce(function (s, p) { return s + p[1]; }, 0);
    return '<ol class="hb">' + pairs.map(function (p, i) {
      var lbl = opt.label ? opt.label(p[0]) : esc(p[0]), w = Math.max(2, p[1] / max * 100);
      var inner = '<span class="hb-l">' + lbl + '</span><span class="hb-t"><i style="width:' + w.toFixed(1) + '%;--i:' + i + '"></i></span><b class="hb-v">' + (opt.val ? opt.val(p[1]) : A.num(p[1])) + '</b>';
      var tip = esc(x('ofTotal', { p: pct(p[1], tot) }));
      return '<li>' + (opt.filter && p[0] !== '__other' ? '<button type="button" class="hb-row" data-go="' + opt.filter + '" data-v="' + esc(p[0]) + '" title="' + tip + '">' + inner + '</button>' : '<div class="hb-row" title="' + tip + '">' + inner + '</div>') + '</li>';
    }).join('') + '</ol>';
  }
  function topN(pairs, n) {
    if (pairs.length <= n) return pairs;
    var rest = pairs.slice(n - 1).reduce(function (s, p) { return s + p[1]; }, 0);
    return pairs.slice(0, n - 1).concat([['__other', rest]]);
  }
  function card(title, body, extra) { return '<article class="adm-card' + (extra ? ' ' + extra : '') + '"><h3>' + esc(title) + '</h3>' + body + '</article>'; }

  function overviewHTML() {
    var rows = S.data.rows || [], by = stats(rows), rank = Object.keys(by).sort(function (a, b) { return by[b].n - by[a].n; });
    var ents = sortedPairs(countBy(rows, function (r) { return r.entity; }));
    var nats = topN(sortedPairs(countBy(rows, function (r) { return r.nationalityCode; })), 8);
    var emps = sortedPairs(countBy(rows, function (r) { return r.employmentType; }));
    var g = countBy(rows, function (r) { return genderKey(r.gender) || 'unknown'; });
    var st = countBy(rows, function (r) { return stKey(r.status); });
    /* التسجيلات الأسبوعية — آخر ١٢ أسبوعًا */
    var wk = [], now = today(), maxW = 0;
    for (var i = 11; i >= 0; i--) { var s0 = new Date(now); s0.setDate(s0.getDate() - (i + 1) * 7 + 1); wk.push({ from: s0, n: 0 }); }
    rows.forEach(function (r) { var dd = days((r.createdAt || '').slice(0, 10)); if (dd === null || dd > 0 || dd < -84) return; var idx = 11 - Math.floor(-dd / 7); if (wk[idx]) wk[idx].n++; });
    wk.forEach(function (w) { maxW = Math.max(maxW, w.n); });
    var gTot = (g.male || 0) + (g.female || 0) + (g.unknown || 0);
    var split = function (parts) {
      var tot = parts.reduce(function (s, p) { return s + p[1]; }, 0) || 1;
      return '<div class="split" role="img">' + parts.filter(function (p) { return p[1]; }).map(function (p) { return '<i class="' + p[2] + '" style="flex:' + p[1] + '" title="' + esc(p[0] + ': ' + p[1]) + '"></i>'; }).join('') + '</div>' +
        '<ul class="split-lg">' + parts.map(function (p) { return '<li><i class="' + p[2] + '"></i><span>' + esc(p[0]) + '</span><b>' + A.num(p[1]) + '</b><small>' + A.num(pct(p[1], tot)) + '٪</small></li>'; }).join('') + '</ul>';
    };
    return '<section class="adm-geo">' +
        '<div class="adm-rank"><div class="adm-sec-h"><h2>' + esc(x('geoT')) + '</h2><p class="hint">' + esc(x('geoD')) + '</p></div><ol class="rank-list">' +
          rank.map(function (c, i) {
            var b = by[c], share = pct(b.n, rows.length);
            return '<li><button type="button" class="rank-item' + (S.f.country === c ? ' on' : '') + '" data-country="' + esc(c) + '" style="--s:' + share + '%"><span class="rk-n">' + A.num(i + 1) + '</span>' + A.flag(c) +
              '<span class="rk-t"><b>' + esc(cc2name(c)) + '</b><small>' + (Object.keys(b.regs).length ? esc(x('regsN', { n: Object.keys(b.regs).length })) + ' · ' : '') + esc(x('natN', { n: Object.keys(b.nats).length })) + ' · ' + esc(x('entN', { n: Object.keys(b.ents).length })) + '</small></span><span class="rk-v">' + A.num(b.n) + '<small>' + A.num(share) + '٪</small></span></button></li>';
          }).join('') + '</ol></div>' +
        '<div class="adm-globe"><div class="hero-globe"><canvas id="admGlobe" role="img" aria-label="' + esc(x('geoT')) + '"></canvas><div class="globe-tip" id="admTip" hidden></div></div>' +
          '<div class="globe-legend"><span><i class="lg-staff"></i>' + esc(A.t('globe.lgStaff')) + '</span><span><i class="lg-nat"></i>' + esc(A.t('globe.lgNat')) + '</span><span><i class="lg-hq"></i>' + esc(A.t('globe.lgHq')) + '</span></div></div>' +
      '</section>' +
      '<div class="adm-cards">' +
        card(x('cEntT'), hbars(ents, { filter: 'entity' }), 'span2') +
        card(x('cNatT'), hbars(nats, { filter: 'nat', label: function (cc) { return cc === '__other' ? esc(x('other')) : A.flag(cc) + esc(cc2name(cc)); } })) +
        card(x('cGenT'), split([[x('male'), g.male || 0, 'c1'], [x('female'), g.female || 0, 'c2']].concat(g.unknown ? [[x('unknown'), g.unknown, 'c0']] : []))) +
        card(x('cStT'), split([[x('stDone'), st.stDone || 0, 's-ok'], [x('stUpd'), st.stUpd || 0, 's-info'], [x('stPend'), st.stPend || 0, 's-warn']])) +
        card(x('cEmpT'), hbars(emps, { filter: 'emp', label: function (v) { return esc(loc('employmentType', v)); } })) +
        card(x('cWeekT'), '<div class="cols" role="img">' + wk.map(function (w, i) {
          var h = maxW ? w.n / maxW * 100 : 0, lb = w.from.getDate() + '/' + (w.from.getMonth() + 1);
          return '<div class="col' + (i === 11 ? ' last' : '') + '" title="' + esc(x('weekOf', { d: lb }) + ' · ' + w.n) + '"><span class="col-v">' + (w.n && (w.n === maxW || i === 11) ? A.num(w.n) : '') + '</span><i style="height:' + Math.max(w.n ? 6 : 2, h) + '%;--i:' + i + '"></i><small>' + (i % 3 === 2 || i === 11 ? A.num(lb) : '') + '</small></div>';
        }).join('') + '</div>', 'span3') +
      '</div>';
  }

  /* ---------- المنسوبون: تصفية متقدمة، فرز، جدول أو بطاقات */
  function staffHTML() {
    var rows = S.data.rows || [], by = stats(rows), rank = Object.keys(by).sort(function (a, b) { return by[b].n - by[a].n; });
    var all = [['', x('all')]];
    var countryOpts = all.concat(rank.map(function (c) { return [c, cc2name(c)]; }));
    var natOpts = all.concat(sortedPairs(countBy(rows, function (r) { return r.nationalityCode; })).map(function (p) { return [p[0], cc2name(p[0])]; }));
    var entOpts = all.concat(uniq(rows.map(function (r) { return r.entity; })).sort().map(function (e) { return [e, e]; }));
    var stOpts = all.concat(uniq(rows.map(function (r) { return r.status; })).map(function (e) { return [e, stText(e)]; }));
    var empOpts = all.concat(uniq(rows.map(function (r) { return r.employmentType; })).map(function (e) { return [e, loc('employmentType', e)]; }));
    var genOpts = all.concat([['male', x('male')], ['female', x('female')]]);
    var docOpts = all.concat([['exp', x('docExp')], ['d30', x('doc30')], ['d90', x('doc90')]]);
    return '<section class="adm-list">' +
        '<div class="adm-tools">' +
          '<div class="adm-search"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="9" cy="9" r="5.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="m13.2 13.2 3.3 3.3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>' +
            '<input class="inp" id="admQ" type="search" placeholder="' + esc(x('search')) + '" value="' + esc(S.f.q) + '" autocomplete="off"></div>' +
          '<div class="adm-view" role="group">' +
            '<button type="button" data-view="table" aria-pressed="' + (S.view === 'table') + '" title="' + esc(x('vTable')) + '">' + ic(ICON.rows) + '<span>' + esc(x('vTable')) + '</span></button>' +
            '<button type="button" data-view="cards" aria-pressed="' + (S.view === 'cards') + '" title="' + esc(x('vCards')) + '">' + ic(ICON.grid) + '<span>' + esc(x('vCards')) + '</span></button></div>' +
        '</div>' +
        '<div class="adm-filters">' + dd('country', x('fCountry'), countryOpts) + dd('nat', x('fNat'), natOpts) + dd('entity', x('fEntity'), entOpts) + dd('status', x('fStatus'), stOpts) + dd('emp', x('fEmp'), empOpts) + dd('gender', x('fGender'), genOpts) + dd('doc', x('fDoc'), docOpts) + '</div>' +
        '<div class="adm-count"><span id="admCount"></span><span class="adm-chips" id="admChips"></span><button type="button" class="link" data-adm="clear" id="admClear" hidden>' + esc(x('clear')) + '</button></div>' +
        '<div id="admResults"></div>' +
        '<div class="adm-more"><button type="button" class="btn ghost" data-adm="more" id="admMore" hidden>' + esc(x('more')) + '</button></div>' +
      '</section>';
  }
  function dd(key, label, opts) {
    S.opts[key] = opts;
    var cur = S.f[key], o = opts.filter(function (v) { return v[0] === cur; })[0] || opts[0];
    var fl = (key === 'country' || key === 'nat');
    return '<div class="adm-dd' + (cur ? ' is-on' : '') + '" data-dd="' + key + '"><span class="adm-dd-l">' + esc(label) + '</span><button type="button" class="inp adm-dd-btn" aria-haspopup="listbox" aria-expanded="false">' +
      (fl && cur ? A.flag(cur) : '') + '<span class="val">' + esc(o[1]) + '</span><svg class="chev" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5 6 7.5 9 4.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
      '<div class="combo-panel" hidden><ul class="combo-list" role="listbox">' + opts.map(function (v, i) {
        return '<li role="option" data-cc="' + esc(v[0]) + '" aria-selected="' + (v[0] === cur) + '" style="--i:' + Math.min(i, 12) + '">' + (fl && v[0] ? A.flag(v[0]) : '') + '<span class="nm">' + esc(v[1]) + '</span><span class="tick" aria-hidden="true"></span></li>';
      }).join('') + '</ul></div></div>';
  }
  var FKEYS = ['country', 'nat', 'entity', 'status', 'emp', 'gender', 'doc'];
  function filtered() {
    var q = normQ(S.f.q).trim(), f = S.f;
    var list = (S.data.rows || []).filter(function (r) {
      if (f.country && r.workCountryCode !== f.country) return false;
      if (f.nat && r.nationalityCode !== f.nat) return false;
      if (f.entity && r.entity !== f.entity) return false;
      if (f.status && r.status !== f.status) return false;
      if (f.emp && r.employmentType !== f.emp) return false;
      if (f.gender && genderKey(r.gender) !== f.gender) return false;
      if (f.doc) { var ds = docState(r); if (f.doc === 'exp' ? ds !== 'exp' : (f.doc === 'd30' ? ds !== 'd30' : (ds !== 'd30' && ds !== 'd90'))) return false; }
      if (!q) return true;
      return [r.fullNameLatin, r.fullNameAr, r.ref, r.passportNo, r.mobile, r.officialEmail, r.personalEmail, r.jobTitle, r.employeeNo, r.department, r.workRegion].some(function (v) { return normQ(v).indexOf(q) > -1; });
    });
    var k = S.sort.k, dir = S.sort.dir;
    var val = function (r) {
      if (k === 'passportExpiry') { var n = days(r.passportExpiry); return n === null ? 1e9 : n; }
      if (k === 'workCountry') return cc2name(r.workCountryCode, r.workCountry);
      if (k === 'nationality') return cc2name(r.nationalityCode, r.nationality);
      if (k === 'status') return stText(r.status);
      return String(r[k] || '');
    };
    return list.slice().sort(function (a, b) {
      var va = val(a), vb = val(b);
      var c = typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb), A.state.lang);
      return c * dir;
    });
  }
  var SORTS = [['fullNameLatin', 'cName'], ['status', 'cStatus'], ['ref', 'cRef'], ['entity', 'cEnt'], ['jobTitle', 'cJob'], ['workCountry', 'cWork'], ['nationality', 'cNat'], ['mobile', 'cMobile', 1], ['passportExpiry', 'cPass'], ['createdAt', 'cAdded']];
  function drawTable() {
    var host = $('#admResults');
    if (!host) return;
    var list = filtered(), f = S.f;
    var any = f.q || FKEYS.some(function (k) { return f[k]; });
    $('#admCount').textContent = x('results', { n: list.length });
    $('#admClear').hidden = !any;
    $('#admChips').innerHTML = FKEYS.filter(function (k) { return f[k]; }).map(function (k) {
      var o = (S.opts[k] || []).filter(function (v) { return v[0] === f[k]; })[0];
      return '<button type="button" class="fchip" data-unf="' + k + '">' + esc(o ? o[1] : f[k]) + '<i aria-hidden="true">×</i></button>';
    }).join('');
    if (!(S.data.rows || []).length) { host.innerHTML = '<p class="adm-empty">' + esc(x('none')) + '</p>'; $('#admMore').hidden = true; return; }
    if (!list.length) { host.innerHTML = '<p class="adm-empty">' + esc(x('empty')) + '</p>'; $('#admMore').hidden = true; return; }
    var page = list.slice(0, S.shown);
    if (S.view === 'cards') {
      host.innerHTML = '<ul class="p-cards">' + page.map(function (r, i) {
        var ph = files(r.photo)[0], th = driveThumb(ph), ds = docState(r);
        return '<li style="--i:' + Math.min(i, 20) + '"><button type="button" class="p-card" data-ref="' + esc(r.ref) + '">' +
          '<span class="p-top"><span class="av">' + (th ? '<img src="' + esc(th) + '" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">' : '') + '<i>' + esc(initials(r.fullNameLatin)) + '</i></span>' + statusChip(r.status) + '</span>' +
          '<b class="p-name">' + esc(r.fullNameAr || r.fullNameLatin) + '</b><span class="p-latin" dir="ltr">' + esc(r.fullNameLatin) + '</span>' +
          '<span class="p-job">' + esc(r.jobTitle || '—') + '</span><span class="p-ent">' + esc(r.entity || '') + '</span>' +
          '<span class="p-foot"><span class="cty">' + A.flag(r.workCountryCode) + esc(cc2name(r.workCountryCode, r.workCountry)) + '</span>' + (ds === 'exp' || ds === 'd30' || ds === 'd90' ? '<span class="chip ' + (ds === 'exp' ? 'bad' : 'warn') + '">' + esc(x(ds === 'exp' ? 'docExp' : 'docSoon')) + '</span>' : '') + '</span>' +
          '</button></li>';
      }).join('') + '</ul>';
    } else {
      host.innerHTML = '<div class="adm-table-wrap"><table class="adm-table"><thead><tr>' + SORTS.map(function (s) {
        var on = S.sort.k === s[0];
        return '<th' + (on ? ' aria-sort="' + (S.sort.dir > 0 ? 'ascending' : 'descending') + '"' : '') + '><button type="button" class="th-sort' + (on ? ' on' : '') + '" data-sort="' + s[0] + '">' + esc(x(s[1])) + '<i aria-hidden="true">' + (on ? (S.sort.dir > 0 ? '▲' : '▼') : '↕') + '</i></button></th>';
      }).join('') + '</tr></thead><tbody id="admRows">' + page.map(function (r, i) {
        var ph = files(r.photo)[0], th = driveThumb(ph);
        return '<tr data-ref="' + esc(r.ref) + '" tabindex="0" style="--i:' + Math.min(i, 20) + '">' +
          '<td><span class="who"><span class="av">' + (th ? '<img src="' + esc(th) + '" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">' : '') + '<i>' + esc(initials(r.fullNameLatin)) + '</i></span><span class="who-t"><b>' + esc(r.fullNameAr || r.fullNameLatin) + '</b><small dir="ltr">' + esc(r.fullNameAr ? r.fullNameLatin : '') + '</small></span></span></td><td>' + statusChip(r.status) + '</td>' +
          '<td><code dir="ltr">' + esc(r.ref) + '</code></td><td>' + esc(r.entity || '—') + '</td><td>' + esc(r.jobTitle || '—') + '</td>' +
          '<td><span class="cty">' + A.flag(r.workCountryCode) + esc(cc2name(r.workCountryCode, r.workCountry)) + '</span></td>' +
          '<td><span class="cty">' + A.flag(r.nationalityCode) + esc(cc2name(r.nationalityCode, r.nationality)) + '</span></td>' +
          '<td dir="ltr" class="mono">' + esc(r.mobile || '—') + '</td><td>' + expChip(r.passportExpiry) + '</td><td dir="ltr" class="mono">' + esc((r.createdAt || '').slice(0, 10)) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
    }
    $('#admMore').hidden = list.length <= S.shown;
  }

  /* ---------- الوثائق والتنبيهات */
  function docItems() {
    var out = [];
    (S.data.rows || []).forEach(function (r) {
      EXPIRY.forEach(function (k) { var n = days(r[k]); if (n !== null && n <= 90) out.push({ r: r, k: k, n: n, d: r[k] }); });
    });
    return out.sort(function (a, b) { return a.n - b.n; });
  }
  function docsHTML() {
    var all = docItems(), kind = S.docKind;
    var list = kind ? all.filter(function (it) { return it.k === kind; }) : all;
    var c = { exp: 0, d30: 0, d90: 0 };
    all.forEach(function (it) { c[it.n < 0 ? 'exp' : (it.n <= 30 ? 'd30' : 'd90')]++; });
    var kinds = EXPIRY.map(function (k) { return [k, all.filter(function (it) { return it.k === k; }).length]; });
    var tile = function (key, cls, path) { return '<div class="d-tile ' + cls + '"><span class="d-ic" aria-hidden="true">' + ic(path) + '</span><b>' + A.num(c[key]) + '</b><span>' + esc(x(key === 'exp' ? 'dExpT' : (key === 'd30' ? 'd30T' : 'd90T'))) + '</span></div>'; };
    return '<section class="adm-docs">' +
      '<div class="d-tiles">' + tile('exp', 'bad', 'M12 9v4M12 17h.01M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0') + tile('d30', 'warn', ICON.clock) + tile('d90', 'info', 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2') + '</div>' +
      '<div class="d-kinds" role="group"><button type="button" data-dkind="" aria-pressed="' + !kind + '">' + esc(x('all')) + ' <em>' + A.num(all.length) + '</em></button>' + kinds.map(function (kk) {
        return '<button type="button" data-dkind="' + kk[0] + '" aria-pressed="' + (kind === kk[0]) + '"' + (kk[1] ? '' : ' disabled') + '>' + esc(x('dk.' + kk[0])) + ' <em>' + A.num(kk[1]) + '</em></button>';
      }).join('') + (list.length ? '<button type="button" class="btn ghost sm d-exp" data-adm="docsCsv"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11m0 0-4-4m4 4 4-4M5 19h14"/></svg>' + esc(x('dExport')) + '</button>' : '') + '</div>' +
      (list.length ? '<ol class="d-list">' + list.map(function (it, i) {
        var r = it.r, cls = it.n < 0 ? 'bad' : (it.n <= 30 ? 'warn' : 'info');
        var when = it.n < 0 ? x('dAgo', { n: -it.n }) : (it.n === 0 ? x('dToday') : x('dLeft', { n: it.n }));
        return '<li style="--i:' + Math.min(i, 20) + '"><button type="button" class="d-row ' + cls + '" data-ref="' + esc(r.ref) + '"><span class="d-bar" aria-hidden="true"></span>' +
          '<span class="who-t"><b>' + esc(r.fullNameAr || r.fullNameLatin) + '</b><small dir="ltr">' + esc(r.fullNameLatin) + '</small></span>' +
          '<span class="d-kind">' + esc(x('dk.' + it.k)) + '</span><span class="cty">' + A.flag(r.workCountryCode) + esc(cc2name(r.workCountryCode, r.workCountry)) + '</span>' +
          '<span class="d-date" dir="ltr">' + esc(it.d) + '</span><span class="chip ' + cls + '">' + esc(when) + '</span></button></li>';
      }).join('') + '</ol>' : '<p class="adm-empty ok">' + esc(x('dEmpty')) + '</p>') +
      '</section>';
  }

  /* ---------- الرواتب: لكل عملة على حدة */
  function payHTML() {
    var rows = (S.data.rows || []).filter(function (r) { return moneyOf(r.salary) !== null && r.currency; });
    if (!rows.length) return '<p class="adm-empty">' + esc(x('pNone')) + '</p>';
    var curs = sortedPairs(countBy(rows, function (r) { return r.currency; }));
    if (!S.cur || !curs.some(function (c) { return c[0] === S.cur; })) S.cur = curs[0][0];
    var mine = rows.filter(function (r) { return r.currency === S.cur; }), vals = mine.map(function (r) { return moneyOf(r.salary); }).sort(function (a, b) { return a - b; });
    var sum = vals.reduce(function (s, v) { return s + v; }, 0), avg = sum / vals.length;
    var med = vals.length % 2 ? vals[(vals.length - 1) / 2] : (vals[vals.length / 2 - 1] + vals[vals.length / 2]) / 2;
    var byEnt = {}; mine.forEach(function (r) { var e = r.entity || x('unknown'); byEnt[e] = byEnt[e] || [0, 0]; byEnt[e][0] += moneyOf(r.salary); byEnt[e][1]++; });
    var entAvg = Object.keys(byEnt).map(function (e) { return [e, byEnt[e][0] / byEnt[e][1]]; }).sort(function (a, b) { return b[1] - a[1]; });
    /* توزيع على ٦ فئات */
    var lo = vals[0], hi = vals[vals.length - 1], B = 6, step = (hi - lo) / B || 1, bins = [];
    for (var i = 0; i < B; i++) bins.push([lo + i * step, 0]);
    vals.forEach(function (v) { var k = Math.min(B - 1, Math.floor((v - lo) / step)); bins[k][1]++; });
    var maxB = bins.reduce(function (m, b) { return Math.max(m, b[1]); }, 1);
    var pm = sortedPairs(countBy(S.data.rows || [], function (r) { return r.payMethod; }));
    var curName = function (c) { var nm = A.t('cur.' + c); return nm && nm !== 'cur.' + c ? c + ' · ' + nm : c; };
    return '<section class="adm-pay">' +
      '<div class="d-kinds cur-chips" role="group">' + curs.map(function (c) { return '<button type="button" data-cur="' + esc(c[0]) + '" aria-pressed="' + (S.cur === c[0]) + '">' + esc(curName(c[0])) + ' <em>' + A.num(c[1]) + '</em></button>'; }).join('') + '</div>' +
      '<ul class="pay-stats">' + [['pN', A.num(vals.length)], ['pAvg', fmtN(avg)], ['pMed', fmtN(med)], ['pMin', fmtN(lo)], ['pMax', fmtN(hi)], ['pSum', fmtN(sum)]].map(function (s, i) {
        return '<li class="rise" style="--d:' + i + '"><span>' + esc(x(s[0])) + '</span><b dir="ltr">' + s[1] + '</b>' + (i ? '<small>' + esc(S.cur) + '</small>' : '') + '</li>';
      }).join('') + '</ul>' +
      '<div class="adm-cards">' +
        card(x('pByEnt'), hbars(entAvg, { val: fmtN, filter: 'payEnt' }) + '<p class="hint">' + esc(x('pEntHint')) + '</p>') +
        card(x('pDist'), '<div class="cols hist" role="img">' + bins.map(function (b, i) {
          return '<div class="col" title="' + esc(fmtN(b[0]) + ' – ' + fmtN(b[0] + step) + ' · ' + b[1]) + '"><span class="col-v">' + (b[1] ? A.num(b[1]) : '') + '</span><i style="height:' + Math.max(b[1] ? 6 : 2, b[1] / maxB * 100) + '%;--i:' + i + '"></i><small dir="ltr">' + (i % 2 === 0 ? fmtN(b[0]) : '') + '</small></div>';
        }).join('') + '</div>') +
        card(x('pMethod'), hbars(pm, { label: function (v) { return esc(loc('payMethod', v)); } })) +
      '</div>' +
      payListHTML(mine) + missingHTML() +
      '<p class="hint pay-note">' + esc(x('pNote')) + '</p>' +
      '</section>';
  }
  /* كشف الرواتب التفصيلي للعملة المختارة (ويمكن تصفيته بالجهة من مخطط «متوسط الراتب حسب الجهة») */
  function payRows(mine) {
    var k = S.paySort.k, dir = S.paySort.dir;
    var nm = function (r) { return r.fullNameAr || r.fullNameLatin || ''; };
    return mine.filter(function (r) { return !S.payEnt || (r.entity || x('unknown')) === S.payEnt; }).slice().sort(function (a, b) {
      if (k === 'salary') return (moneyOf(a.salary) - moneyOf(b.salary)) * dir;
      var va = k === 'name' ? nm(a) : String(a[k] || ''), vb = k === 'name' ? nm(b) : String(b[k] || '');
      return va.localeCompare(vb, A.state.lang) * dir;
    });
  }
  function payListHTML(mine) {
    var list = payRows(mine), tot = list.reduce(function (s, r) { return s + moneyOf(r.salary); }, 0);
    var th = function (k, l) { var on = S.paySort.k === k; return '<th><button type="button" class="th-sort' + (on ? ' on' : '') + '" data-psort="' + k + '">' + esc(l) + (on ? '<i aria-hidden="true">' + (S.paySort.dir > 0 ? '▲' : '▼') + '</i>' : '') + '</button></th>'; };
    var acc = function (r) { return r.iban || r.accountNo || ''; };
    return '<section class="adm-card pay-list"><div class="pay-list-h"><h3>' + esc(x('pList')) + ' · ' + esc(S.cur) + '</h3>' +
      '<div class="pay-list-tools">' + (S.payEnt ? '<button type="button" class="chip on" data-payent="">' + esc(S.payEnt) + ' ✕</button>' : '<span class="chip">' + esc(x('pAllEnt')) + '</span>') +
      '<span class="muted">' + esc(x('pShown', { n: list.length })) + '</span>' +
      '<button type="button" class="btn ghost sm" data-adm="payCsv">' + esc(x('pCsv')) + '</button></div></div>' +
      '<p class="hint">' + esc(x('pRowHint')) + '</p>' +
      '<div class="adm-table-wrap"><table class="adm-table pay-table"><thead><tr><th>#</th>' + th('name', x('cName')) + th('entity', x('cEnt')) + th('jobTitle', x('cJob')) + '<th>' + esc(x('cWork')) + '</th>' + th('salary', x('pSal')) +
      '<th>' + esc(x('pMeth')) + '</th><th>' + esc(x('pBank')) + '</th><th>' + esc(x('pAcc')) + '</th></tr></thead><tbody>' +
      list.map(function (r, i) {
        return '<tr class="pay-row" data-ref="' + esc(r.ref) + '" tabindex="0" style="--i:' + Math.min(i, 30) + '"><td class="mono">' + A.num(i + 1) + '</td>' +
          '<td><span class="who-t"><b>' + esc(r.fullNameAr || r.fullNameLatin) + '</b><small dir="ltr">' + esc(r.fullNameAr ? r.fullNameLatin : r.ref) + '</small></span></td>' +
          '<td>' + esc(r.entity || '—') + '</td><td>' + esc(r.jobTitle || '—') + '</td>' +
          '<td><span class="cty">' + A.flag(r.workCountryCode) + esc(cc2name(r.workCountryCode, r.workCountry)) + '</span></td>' +
          '<td><b class="money" dir="ltr">' + fmtN(moneyOf(r.salary)) + ' <small>' + esc(r.currency) + '</small></b></td>' +
          '<td>' + esc(loc('payMethod', r.payMethod) || '—') + '</td><td dir="auto">' + esc(r.bankName || '—') + '</td>' +
          '<td dir="ltr" class="mono">' + esc(acc(r) || '—') + '</td></tr>';
      }).join('') + '</tbody><tfoot><tr><td></td><td colspan="4"><b>' + esc(x('pTotal')) + '</b></td><td><b class="money" dir="ltr">' + fmtN(tot) + ' <small>' + esc(S.cur) + '</small></b></td><td colspan="3"></td></tr></tfoot></table></div></section>';
  }
  function missingHTML() {
    var miss = (S.data.rows || []).filter(function (r) { return moneyOf(r.salary) === null || !r.currency; });
    if (!miss.length) return '';
    return '<section class="adm-card pay-miss"><h3>' + esc(x('pMissing')) + ' <em>' + A.num(miss.length) + '</em></h3><div class="miss-list">' +
      miss.map(function (r) { return '<button type="button" class="pay-row miss" data-ref="' + esc(r.ref) + '"><b>' + esc(r.fullNameAr || r.fullNameLatin) + '</b><small>' + esc(r.entity || '') + (r.payMethod ? ' · ' + esc(loc('payMethod', r.payMethod)) : '') + '</small></button>'; }).join('') +
      '</div></section>';
  }
  function payCsv() {
    var q = function (v) { v = String(v == null ? '' : v); if (/^[=+\-@]/.test(v)) v = "'" + v; else if (/^\d{12,}$/.test(v.replace(/\s/g, ''))) return '"=""' + v + '"""'; return '"' + v.replace(/"/g, '""') + '"'; };
    var rows = (S.data.rows || []).filter(function (r) { return moneyOf(r.salary) !== null && r.currency === S.cur; });
    var list = payRows(rows);
    var head = [x('cName'), 'Name', x('cRef'), x('cEnt'), x('cJob'), x('cWork'), x('pSal'), 'Currency', x('pMeth'), x('pBank'), x('pHolder'), 'IBAN', 'Account', 'SWIFT'];
    var lines = [head.map(q).join(',')].concat(list.map(function (r) {
      return [r.fullNameAr, r.fullNameLatin, r.ref, r.entity, r.jobTitle, cc2name(r.workCountryCode, r.workCountry), moneyOf(r.salary), r.currency, loc('payMethod', r.payMethod), r.bankName, r.accountHolder, r.iban, r.accountNo, r.swift].map(q).join(',');
    }));
    var blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'Bonyan-HR-Payroll-' + S.cur + (S.payEnt ? '-' + S.payEnt.replace(/\s+/g, '-') : '') + '-' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  /* ---------- سجل الدخول */
  function auditHTML() {
    var a = S.data.audit || [];
    if (!a.length) return '<p class="adm-empty">' + esc(x('aEmpty')) + '</p>';
    return '<section class="adm-list"><div class="adm-table-wrap"><table class="adm-table audit"><thead><tr><th>' + esc(x('aTime')) + '</th><th>' + esc(x('aAct')) + '</th><th>' + esc(x('aWho')) + '</th></tr></thead><tbody>' +
      a.map(function (e) { var bad = /خاطئة|fail/i.test(e[1] || ''); return '<tr class="static"><td dir="ltr" class="mono">' + esc(e[0]) + '</td><td><span class="chip ' + (bad ? 'bad' : 'ok') + '">' + esc(bad ? x('aFail') : x('aLogin')) + '</span></td><td>' + esc(e[2] || '—') + '</td></tr>'; }).join('') +
      '</tbody></table></div></section>';
  }

  function mountGlobe() {
    if (S.globe) { S.globe.destroy(); S.globe = null; }
    var c = $('#admGlobe'); if (!c || !window.BonyanGlobe) return;
    S.globe = window.BonyanGlobe(c, { hq: A.CFG.HQ, centerLon: 40, tilt: 16, tip: $('#admTip'), label: A.globeLabel, hqText: A.hqText, hqTip: A.hqTip, sites: A.CFG.SITES });
    var by = stats(S.data.rows || []), map = {};
    Object.keys(by).forEach(function (cc) { map[cc] = { n: by[cc].n, nat: Object.keys(by[cc].nats).length, reg: Object.keys(by[cc].regs).length }; });
    S.globe.setPoints(map, function (cc, d) {
      var rows = [[x('kTotal'), d.n]];
      if (d.reg > 1) rows.push([x('regN'), d.reg]);
      if (d.nat > 1) rows.push([x('kNat'), d.nat]);
      return { name: cc2name(cc), n: A.num(d.n), nat: d.nat ? A.num(d.nat) : '', tip: cc2name(cc),
        tipHTML: '<b>' + esc(cc2name(cc)) + '</b>' + rows.map(function (r) { return '<span><i>' + esc(r[0]) + '</i><em>' + esc(A.num(r[1])) + '</em></span>'; }).join('') };
    });
    if (S.f.country) S.globe.focusOn(S.f.country);
  }

  /* ---------------------------------------------------------- التفاصيل */
  function openDrawer(ref) {
    var r = (S.data.rows || []).filter(function (v) { return v.ref === ref; })[0];
    if (!r) return;
    S.open = ref;
    var cols = {}; (S.data.cols || COLS).forEach(function (c) { cols[c[0]] = c; });
    var ph = files(r.photo)[0], th = driveThumb(ph);
    var h = '<div class="drawer-scrim" data-adm="close"></div><aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="drName">' +
      '<header class="dr-head"><span class="av big">' + (th ? '<img src="' + esc(th) + '" alt="" referrerpolicy="no-referrer" onerror="this.remove()">' : '') + '<i>' + esc(initials(r.fullNameLatin)) + '</i></span>' +
        '<div class="dr-t"><h2 id="drName" dir="ltr">' + esc(r.fullNameLatin) + '</h2><p>' + esc(r.fullNameAr || '') + '</p>' +
        '<div class="dr-chips"><code dir="ltr">' + esc(r.ref) + '</code>' + statusChip(r.status) + '<span class="chip">' + A.flag(r.workCountryCode) + esc(cc2name(r.workCountryCode, r.workCountry)) + '</span></div></div>' +
        (S.edit === ref ? '' : '<button type="button" class="dr-x dr-edit" data-adm="edit" aria-label="' + esc(x('edit')) + '" title="' + esc(x('edit')) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-4-4L4 16zM13.5 6.5l4 4"/></svg></button>') +
        '<button type="button" class="dr-x dr-print" data-adm="print" aria-label="' + esc(x('print')) + '" title="' + esc(x('print')) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 9V3.5h10V9M7 17H4.5V9h15v8H17M7 14h10v6.5H7z"/></svg></button>' +
        '<button type="button" class="dr-x" data-adm="close" aria-label="' + esc(x('close')) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></header>' +
      '<div class="dr-body">' + (S.edit === ref ? editBodyHTML(r, cols) + '</div><footer class="dr-foot"><button type="button" class="btn gold" data-adm="edSave"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg><span>' + esc(x('edSave')) + '</span></button><button type="button" class="btn ghost" data-adm="edCancel">' + esc(x('edCancel')) + '</button></footer></aside>' : '') +
      (S.edit === ref ? '' : (A.card ? '<section class="dr-cardsec"><h3>' + esc(x('cardT')) + '</h3><div class="dr-card-box"><div class="idcard-wrap" id="drCard"></div></div>' +
        '<p class="dr-card-hint">' + esc(x('cardHint')) + '</p><div class="dr-card-act"><button type="button" class="btn ghost sm" data-adm="cardFlip"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.7M20 4v4.7h-4.7M20 12a8 8 0 0 1-13.7 5.6L4 15.3M4 20v-4.7h4.7"/></svg>' + esc(x('cardFlip')) + '</button>' +
        '<button type="button" class="btn gold sm" data-adm="cardPng"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11m0 0-4-4m4 4 4-4M5 19.5h14"/></svg><span>' + esc(x('cardPng')) + '</span></button></div></section>' : '') +
      '<div class="dr-tools"><button type="button" class="btn ghost sm dr-editbtn" data-adm="edit"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-4-4L4 16zM13.5 6.5l4 4"/></svg>' + esc(x('edOpen')) + '</button>' +
      (r.folder ? '<a class="btn gold sm dr-folder" href="' + esc(r.folder) + '" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>' + esc(x('folder')) + '</a>' : '') + '</div>');
    if (S.edit !== ref) GROUPS.forEach(function (g) {
      var items = g[1].filter(function (k) { var v = r[k]; return cols[k] && v != null && v !== '' && !(Array.isArray(v) && !v.length) || (g[0] === 'files' && cols[k]); });
      if (!items.length) return;
      h += '<section class="dr-sec"><h3>' + esc(x('g.' + g[0])) + '</h3><dl>' + items.map(function (k) {
        var c = cols[k], v = r[k], val;
        if (c[2] === 'f') {
          var fl = files(v);
          val = fl.length ? fl.map(function (u, i) { return '<a class="file-btn" href="' + esc(u) + '" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2.5h8l4 4V21H6zM14 2.5V7h4"/></svg>' + esc(fl.length > 1 ? x('file', { n: i + 1 }) : x('openFile')) + '</a>'; }).join('')
            : '<span class="muted">' + esc(v || x('noFile')) + '</span>';
        } else if (EXPIRY.indexOf(k) > -1) val = expChip(v);
        else if (k === 'salary') val = '<b class="money" dir="ltr">' + esc(v) + (r.currency ? ' ' + esc(r.currency) : '') + '</b>';
        else val = '<span dir="auto">' + esc(v) + '</span>';
        return '<div' + (c[2] === 'f' || String(v).length > 40 ? ' class="wide"' : '') + '><dt>' + esc(colLbl(c)) + '</dt><dd>' + val + '</dd></div>';
      }).join('') + '</dl></section>';
    });
    if (S.edit !== ref) [['quals', S.data.quals], ['exp', S.data.exp], ['langs', S.data.langs]].forEach(function (p) {
      var tb = p[1] || []; if (tb.length < 2) return;
      var mine = tb.slice(1).filter(function (row) { return row[0] === r.ref; });
      if (!mine.length) return;
      h += '<section class="dr-sec"><h3>' + esc(x(p[0])) + '</h3><div class="dr-tbl"><table><thead><tr>' + tb[0].slice(2).map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') + '</tr></thead><tbody>' +
        mine.map(function (row) { return '<tr>' + row.slice(2).map(function (c) { return '<td dir="auto">' + esc(c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div></section>';
    });
    if (S.edit !== ref) h += '</div></aside>';
    var host = $('#admDrawer');
    if (!host) { host = document.createElement('div'); host.id = 'admDrawer'; document.body.appendChild(host); }
    host.innerHTML = h; host.hidden = false;
    document.body.classList.add('no-scroll');
    drawCard(r);
    requestAnimationFrame(function () { host.classList.add('in'); var b = $('.dr-x', host); if (b) b.focus(); });
  }
  function closeDrawer() {
    var host = $('#admDrawer'); if (!host || host.hidden) return;
    S.edit = null; ED.files = {};
    host.classList.remove('in');
    document.body.classList.remove('no-scroll');
    setTimeout(function () { host.hidden = true; host.innerHTML = ''; }, 320);
    var tr = S.open && $('tr[data-ref="' + S.open + '"]'); S.open = null;
    if (tr) tr.focus();
  }

  /* ---------------------------------------------------------- التعديل من اللوحة
     كل الحقول قابلة للتعديل ما عدا ما يولّده النظام (الرقم المرجعي، التواريخ الآلية، المجلد، الاسم الكامل الذي يُبنى من أجزائه).
     تُرسل الحقول التي تغيّرت فقط، وتُستبدل المرفقات المختارة، ثم يُعاد تحميل البيانات من الجدول */
  var ED_LOCK = ['ref', 'createdAt', 'updatedAt', 'folder', 'folderId', 'fullNameAr', 'fullNameLatin', 'lang', 'tz', 'workCountryCode', 'nationalityCode'];
  var ED_COUNTRY = ['workCountry', 'nationality', 'otherNationality', 'birthCountry', 'passportCountry', 'addrCountry', 'homeCountry', 'bankCountry'];
  var ED_LONG = ['techSkills', 'certifications', 'payOther'];
  var ED = { files: {} };
  var CHILD = { quals: 6, exp: 5, langs: 2 };
  function edOpts(k) {
    var D = (window.I18N || {}).ar || {}, out = [];
    if (ED_COUNTRY.indexOf(k) > -1) return (window.COUNTRIES || []).map(function (c) { return c[1]; });
    if (k === 'status') return ['مكتمل', 'محدَّث', 'بانتظار المرفقات'];
    if (k === 'entity') return (A.CFG.ENTITIES || []).map(function (e) { return e.ar; });
    if (k === 'currency') { Object.keys(D).forEach(function (kk) { var m = /^cur\.([A-Z]{3})$/.exec(kk); if (m) out.push(m[1]); }); return out; }
    var f = k === 'em2Relation' ? 'em1Relation' : k;
    Object.keys(D).forEach(function (kk) { var m = /^o\.(\w+)\.\w+$/.exec(kk); if (m && (m[1] === f || m[1] === k)) out.push(D[kk]); });
    return out;
  }
  function edVal(c, v) {
    if (c[2] === 'n') { var n = moneyOf(v); return n === null ? '' : String(n); }
    if (c[2] === 'd') return /^\d{4}-\d{2}-\d{2}/.test(v || '') ? String(v).slice(0, 10) : '';
    return v == null ? '' : String(v);
  }
  function edField(k, c, r) {
    var v = r[k], lbl = '<dt>' + esc(colLbl(c)) + '</dt>';
    if (c[2] === 'f') {
      var fl = files(v);
      return '<div class="wide ed-file"><dt>' + esc(colLbl(c)) + '</dt><dd>' + (fl.length ? fl.map(function (u, i) { return '<a class="file-btn" href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(fl.length > 1 ? x('file', { n: i + 1 }) : x('openFile')) + '</a>'; }).join('') : '<span class="muted">' + esc(v || x('noFile')) + '</span>') +
        '<label class="btn ghost sm ed-up"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V4m0 0-4 4m4-4 4 4M5 19.5h14"/></svg><span>' + esc(x(fl.length ? 'edReplace' : 'edUpload')) + '</span><input type="file" data-fk="' + k + '" accept="image/*,application/pdf"' + (k === 'photo' ? '' : ' multiple') + ' hidden></label>' +
        '<span class="ed-picked" data-picked="' + k + '"></span></dd></div>';
    }
    var val = edVal(c, v), lock = ED_LOCK.indexOf(k) > -1;
    if (lock) return '<div' + (String(val).length > 40 ? ' class="wide"' : '') + '>' + lbl + '<dd><span class="muted" dir="auto">' + esc(val || '—') + '</span>' + (k === 'fullNameAr' || k === 'fullNameLatin' ? '<small class="ed-note">' + esc(x('edAuto')) + '</small>' : '') + '</dd></div>';
    var common = ' class="inp ed" data-ek="' + k + '" data-orig="' + esc(val) + '"';
    var input;
    if (c[2] === 'd') input = '<input type="date"' + common + ' value="' + esc(val) + '">';
    else if (c[2] === 'n') input = '<input type="text" inputmode="decimal" dir="ltr"' + common + ' value="' + esc(val) + '">';
    else if (ED_LONG.indexOf(k) > -1 || val.length > 60 || /\n/.test(val)) input = '<textarea rows="3" dir="auto"' + common + '>' + esc(val) + '</textarea>';
    else {
      var op = edOpts(k), ltr = /Email|^iban$|^swift$|^accountNo$|^passportNo$|Phone$|^mobile$|^whatsapp$|No$|^npwp$|^bpjs|^kraPin$|^tin$/.test(k);
      input = '<input type="text"' + (ltr ? ' dir="ltr"' : ' dir="auto"') + common + ' value="' + esc(val) + '"' + (op.length ? ' list="dl_' + k + '"' : '') + ' autocomplete="off">' +
        (op.length ? '<datalist id="dl_' + k + '">' + op.map(function (o) { return '<option value="' + esc(o) + '">'; }).join('') + '</datalist>' : '');
    }
    return '<div' + (ED_LONG.indexOf(k) > -1 || val.length > 40 ? ' class="wide"' : '') + '>' + lbl + '<dd class="ed-dd">' + input + '</dd></div>';
  }
  function edChildHTML(p, tb, ref) {
    var n = CHILD[p], head = (tb && tb[0] ? tb[0].slice(2) : []).slice(0, n);
    while (head.length < n) head.push('');
    var mine = (tb || []).slice(1).filter(function (row) { return row[0] === ref; }).map(function (row) { return row.slice(2, 2 + n); });
    var rowHTML = function (cells) { return '<tr>' + head.map(function (_, i) { return '<td><input class="inp ed-c" dir="auto" value="' + esc(cells[i] || '') + '"></td>'; }).join('') + '<td><button type="button" class="ed-del" data-adm="edDelRow" aria-label="' + esc(x('edDel')) + '" title="' + esc(x('edDel')) + '">×</button></td></tr>'; };
    return '<section class="dr-sec ed-child" data-child="' + p + '" data-orig="' + esc(JSON.stringify(mine)) + '"><h3>' + esc(x(p)) + '</h3><div class="dr-tbl"><table><thead><tr>' + head.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') + '<th></th></tr></thead><tbody>' +
      mine.map(rowHTML).join('') + '</tbody></table></div><button type="button" class="btn ghost sm ed-add" data-adm="edAddRow" data-tpl="' + esc(rowHTML([])) + '">+ ' + esc(x('edAdd')) + '</button></section>';
  }
  function editBodyHTML(r, cols) {
    var h = '<p class="ed-banner">' + esc(x('edBanner')) + '</p>';
    GROUPS.forEach(function (g) {
      var items = g[1].filter(function (k) { return cols[k]; });
      if (!items.length) return;
      h += '<section class="dr-sec"><h3>' + esc(x('g.' + g[0])) + '</h3><dl class="ed-dl">' + items.map(function (k) { return edField(k, cols[k], r); }).join('') + '</dl></section>';
    });
    ['quals', 'exp', 'langs'].forEach(function (p) { h += edChildHTML(p, S.data[p], r.ref); });
    return h;
  }
  function edCollect() {
    var ch = {}, n = 0;
    $$('#admDrawer [data-ek]').forEach(function (el) {
      var k = el.getAttribute('data-ek'), v = el.value.replace(/\s+$/, '');
      if (v.trim() !== (el.getAttribute('data-orig') || '').trim()) { ch[k] = v.trim(); n++; }
    });
    var CC = {}; (window.COUNTRIES || []).forEach(function (c) { CC[c[1]] = c[0]; });
    if ('workCountry' in ch) ch.workCountryCode = CC[ch.workCountry] || '';
    if ('nationality' in ch) ch.nationalityCode = CC[ch.nationality] || '';
    var kids = {};
    $$('#admDrawer [data-child]').forEach(function (sec) {
      var rows = $$('tbody tr', sec).map(function (tr) { return $$('.ed-c', tr).map(function (i) { return i.value.trim(); }); }).filter(function (r) { return r.some(String); });
      if (JSON.stringify(rows) !== sec.getAttribute('data-orig')) { kids[sec.getAttribute('data-child')] = rows; n++; }
    });
    var nf = Object.keys(ED.files).filter(function (k) { return ED.files[k] && ED.files[k].length; }).length;
    return { changes: ch, kids: kids, n: n + nf };
  }
  function readB64(file) {
    return new Promise(function (res, rej) { var fr = new FileReader(); fr.onload = function () { res(String(fr.result).split(',')[1]); }; fr.onerror = rej; fr.readAsDataURL(file); });
  }
  function edSave(btn) {
    var ref = S.open, r = (S.data.rows || []).filter(function (v) { return v.ref === ref; })[0];
    if (!r || btn.disabled) return;
    var c = edCollect();
    if (!c.n) { A.toast(x('edNone')); return; }
    var big = []; Object.keys(ED.files).forEach(function (k) { Array.prototype.forEach.call(ED.files[k] || [], function (f) { if (f.size > 10 * 1024 * 1024) big.push(f.name); }); });
    if (big.length) { A.toast(x('edBig') + ' ' + big.join('، ')); return; }
    var lbl = $('span', btn), old = lbl.textContent;
    btn.disabled = true; lbl.textContent = x('edSaving');
    var code = readCode();
    var p;
    if (A.DEMO) {
      Object.keys(c.changes).forEach(function (k) { r[k] = c.changes[k]; });
      p = new Promise(function (res) { setTimeout(res, 500); });
    } else {
      var body = { action: 'adminUpdate', code: code, ref: ref, changes: c.changes };
      Object.keys(c.kids).forEach(function (k) { body[k] = c.kids[k]; });
      p = (Object.keys(c.changes).length || Object.keys(c.kids).length ? A.api(body) : Promise.resolve()).then(function () {
        var jobs = [];
        Object.keys(ED.files).forEach(function (k) { var fl = Array.prototype.slice.call(ED.files[k] || []); fl.forEach(function (f, i) { jobs.push({ k: k, f: f, idx: i + 1, total: fl.length }); }); });
        return jobs.reduce(function (pp, j, i) {
          return pp.then(function () {
            lbl.textContent = x('edUploading', { i: i + 1, n: jobs.length });
            return readB64(j.f).then(function (b64) { return A.api({ action: 'adminUpload', code: code, ref: ref, kind: j.k, idx: j.idx, total: j.total, mime: j.f.type || 'application/octet-stream', data: b64 }); });
          });
        }, Promise.resolve()).then(function () { if (ED.files.photo) delete PHOTOS[ref]; });
      }).then(function () { return load(code, true); });
    }
    p.then(function () {
      S.edit = null; ED.files = {};
      if (A.DEMO) draw();
      if ((S.data.rows || []).some(function (v) { return v.ref === ref; })) openDrawer(ref);
      A.toast(x('edSaved'));
    }).catch(function (e) {
      btn.disabled = false; lbl.textContent = old;
      A.toast(x('edFail') + ((e && e.message) ? ' · ' + e.message : ''));
    });
  }

  /* ---------------------------------------------------------- بطاقة المنسوب داخل التفاصيل
     الصورة الشخصية تُجلب من الخادم (برمز الدخول نفسه) لتظهر في البطاقة وفي الصورة المنزّلة، وتبقى في الذاكرة فقط */
  var PHOTOS = {};
  function drawCard(r) {
    if (!A.card || !$('#drCard')) return;
    A.card.render('#drCard', r, PHOTOS[r.ref]);
    if (PHOTOS[r.ref] !== undefined || A.DEMO || !files(r.photo).length) return;
    PHOTOS[r.ref] = null;
    A.api({ action: 'photo', code: readCode(), ref: r.ref }).then(function (j) {
      PHOTOS[r.ref] = j.b64 ? 'data:' + (j.mime || 'image/jpeg') + ';base64,' + j.b64 : null;
      if (S.open === r.ref && PHOTOS[r.ref]) {
        var fl = $('#drCard .idcard.flipped');
        A.card.render('#drCard', r, PHOTOS[r.ref]);
        if (fl) $('#drCard .idcard').classList.add('flipped');
      }
    }).catch(function () { delete PHOTOS[r.ref]; });
  }
  function cardPng(btn) {
    var r = (S.data.rows || []).filter(function (v) { return v.ref === S.open; })[0];
    if (!r || !A.card || btn.disabled) return;
    var lbl = $('span', btn), old = lbl.textContent;
    btn.disabled = true; lbl.textContent = x('cardMaking');
    A.card.png(r, PHOTOS[r.ref]).then(function (url) {
      var a = document.createElement('a');
      a.href = url; a.download = 'Bonyan-Staff-Card-' + r.ref + '.png';
      document.body.appendChild(a); a.click(); setTimeout(function () { a.remove(); }, 500);
    }).catch(function () { A.toast(x('cardFail')); }).then(function () { btn.disabled = false; lbl.textContent = old; });
  }

  /* ---------------------------------------------------------- التصدير */
  function csv() {
    var cols = (S.data.cols || COLS).filter(function (c) { return c[0] !== 'folderId'; });
    var q = function (v) {
      v = Array.isArray(v) ? v.join(' | ') : String(v == null ? '' : v);
      if (/^[=+\-@\t\r]/.test(v)) v = "'" + v;
      else if (/^\d{12,}$/.test(v.replace(/\s/g, '')) || /^0\d+$/.test(v)) return '"=""' + v.replace(/"/g, '') + '"""';
      return '"' + v.replace(/"/g, '""') + '"';
    };
    var lines = [cols.map(function (c) { return q(colLbl(c)); }).join(',')].concat(filtered().map(function (r) { return cols.map(function (c) { return q(r[c[0]]); }).join(','); }));
    var blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'Bonyan-HR-Staff-' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  /* ---------------------------------------------------------- الأحداث */
  var bound = false;
  function closeDDs(except) { $$('.adm-dd').forEach(function (d) { if (d === except) return; $('.combo-panel', d).hidden = true; $('.adm-dd-btn', d).setAttribute('aria-expanded', 'false'); d.classList.remove('has-open'); }); }
  function redrawPanel() {
    var p = $('#admPanel'); if (!p) return;
    if (S.globe) { S.globe.destroy(); S.globe = null; }
    p.innerHTML = panelHTML();
    $$('.adm-tabs [data-tab]').forEach(function (b) { b.setAttribute('aria-selected', String(b.getAttribute('data-tab') === S.tab)); });
    if (S.tab === 'overview') mountGlobe();
    if (S.tab === 'staff') drawTable();
  }
  function setTab(t) { S.tab = t; S.shown = PAGE; closeDDs(); redrawPanel(); }
  function setFilter(k, v) {
    S.f[k] = v; S.shown = PAGE;
    if (S.tab !== 'staff') { setTab('staff'); return; }
    var host = $('.adm-dd[data-dd="' + k + '"]');
    if (host) { var tmp = document.createElement('div'); tmp.innerHTML = dd(k, $('.adm-dd-l', host).textContent, S.opts[k] || []); host.replaceWith(tmp.firstChild); }
    drawTable();
  }
  function bind() {
    if (bound) return; bound = true;
    document.addEventListener('submit', function (e) {
      if (e.target.id !== 'admLock') return;
      e.preventDefault();
      var v = ($('#admCode').value || '').trim();
      if (!v) { S.err = x('bad'); draw(); return; }
      load(v);
    });
    document.addEventListener('click', function (e) {
      if (A.state.view !== 'admin') return;
      var tg = e.target;
      var eye = tg.closest('#admEye');
      if (eye) { var i = $('#admCode'), on = i.type === 'password'; i.type = on ? 'text' : 'password'; eye.setAttribute('aria-pressed', String(on)); i.focus(); return; }
      var act = tg.closest('[data-adm]');
      if (act) {
        var a = act.getAttribute('data-adm');
        if (a === 'refresh') { act.classList.add('busy'); load(readCode(), true).then(function (ok) { if (ok) A.toast(x('updated', { d: '' }) + (S.data && S.data.at || '')); }); }
        else if (a === 'csv') csv();
        else if (a === 'docsCsv') docsCsv();
        else if (a === 'payCsv') payCsv();
        else if (a === 'lock') { dropCode(); S.data = null; S.err = ''; closeDrawer(); draw(); }
        else if (a === 'more') { S.shown += PAGE; drawTable(); }
        else if (a === 'clear') { S.f = { q: '', country: '', nat: '', entity: '', status: '', emp: '', gender: '', doc: '' }; redrawPanel(); }
        else if (a === 'close') { if (S.edit && edCollect().n) { A.toast(x('edDirty')); return; } closeDrawer(); }
        else if (a === 'print') window.print();
        else if (a === 'edit') { S.edit = S.open; ED.files = {}; openDrawer(S.open); var db = $('#admDrawer .dr-body'); if (db) db.scrollTop = 0; }
        else if (a === 'edCancel') { S.edit = null; ED.files = {}; openDrawer(S.open); }
        else if (a === 'edSave') edSave(act);
        else if (a === 'edAddRow') { var tb = act.closest('[data-child]'); var tmp = document.createElement('tbody'); tmp.innerHTML = act.getAttribute('data-tpl'); $('tbody', tb).appendChild(tmp.firstChild); var fi = $('tbody tr:last-child .ed-c', tb); if (fi) fi.focus(); }
        else if (a === 'edDelRow') { var trr = act.closest('tr'); if (trr) trr.remove(); }
        else if (a === 'cardFlip') { var ic = $('#drCard .idcard'); if (ic) ic.classList.toggle('flipped'); }
        else if (a === 'cardPng') cardPng(act);
        return;
      }
      var icd = tg.closest('#drCard .idcard');
      if (icd) { icd.classList.toggle('flipped'); return; }
      var tb = tg.closest('[data-tab]');
      if (tb) { setTab(tb.getAttribute('data-tab')); return; }
      var kp = tg.closest('[data-kpi]');
      if (kp) {
        var kv = kp.getAttribute('data-kpi');
        if (kv === 'pend') { S.f.status = (uniq((S.data.rows || []).map(function (r) { return r.status; })).filter(function (s) { return /بانتظار/.test(s); })[0]) || ''; setTab('staff'); }
        else setTab(kv.split(':')[1]);
        var pn = $('.adm-tabs'); if (pn) pn.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      var ps = tg.closest('[data-psort]');
      if (ps) { var pk = ps.getAttribute('data-psort'); S.paySort = S.paySort.k === pk ? { k: pk, dir: -S.paySort.dir } : { k: pk, dir: pk === 'salary' ? -1 : 1 }; redrawPanel(); return; }
      var pe = tg.closest('[data-payent], [data-go="payEnt"]');
      if (pe) { var ev = pe.hasAttribute('data-payent') ? pe.getAttribute('data-payent') : pe.getAttribute('data-v'); S.payEnt = S.payEnt === ev ? '' : ev; redrawPanel(); var pl = $('.pay-list'); if (pl && S.payEnt) pl.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
      var go = tg.closest('[data-go]');
      if (go) { S.f[go.getAttribute('data-go')] = go.getAttribute('data-v'); S.shown = PAGE; setTab('staff'); return; }
      var vw = tg.closest('.adm-view [data-view]');
      if (vw) { S.view = vw.getAttribute('data-view'); $$('.adm-view [data-view]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === vw)); }); drawTable(); return; }
      var so = tg.closest('[data-sort]');
      if (so) { var sk = so.getAttribute('data-sort'); S.sort = S.sort.k === sk ? { k: sk, dir: -S.sort.dir } : { k: sk, dir: sk === 'createdAt' ? -1 : 1 }; drawTable(); return; }
      var un = tg.closest('[data-unf]');
      if (un) { setFilter(un.getAttribute('data-unf'), ''); return; }
      var dk = tg.closest('[data-dkind]');
      if (dk) { S.docKind = dk.getAttribute('data-dkind'); redrawPanel(); return; }
      var cu = tg.closest('[data-cur]');
      if (cu) { S.cur = cu.getAttribute('data-cur'); S.payEnt = ''; redrawPanel(); return; }
      var rk = tg.closest('.rank-item');
      if (rk) { var c = rk.getAttribute('data-country'); S.f.country = S.f.country === c ? '' : c; $$('.rank-item').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-country') === S.f.country); }); if (S.f.country && S.globe) S.globe.focusOn(S.f.country); return; }
      var db = tg.closest('.adm-dd-btn');
      if (db) {
        var host = db.closest('.adm-dd'), p = $('.combo-panel', host), open = p.hidden;
        closeDDs(host); p.hidden = !open; db.setAttribute('aria-expanded', String(open)); host.classList.toggle('has-open', open);
        return;
      }
      var li = tg.closest('.adm-dd li[data-cc]');
      if (li) { var k = li.closest('.adm-dd').getAttribute('data-dd'); closeDDs(); setFilter(k, li.getAttribute('data-cc')); return; }
      if (!tg.closest('.adm-dd')) closeDDs();
      var tr = tg.closest('#admRows tr[data-ref], .p-card[data-ref], .d-row[data-ref], .pay-row[data-ref]');
      if (tr) openDrawer(tr.getAttribute('data-ref'));
    });
    document.addEventListener('keydown', function (e) {
      if (A.state.view !== 'admin') return;
      if (e.key === 'Escape') { if (S.open && S.edit && edCollect().n) { A.toast(x('edDirty')); return; } if (S.open) closeDrawer(); else closeDDs(); }
      if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('#drCard .idcard')) { e.preventDefault(); e.target.classList.toggle('flipped'); }
      if (e.key === 'Enter' && e.target.matches && e.target.matches('#admRows tr[data-ref], .pay-row[data-ref]')) openDrawer(e.target.getAttribute('data-ref'));
    });
    document.addEventListener('change', function (e) {
      var fk = e.target && e.target.getAttribute && e.target.getAttribute('data-fk');
      if (!fk) return;
      ED.files[fk] = e.target.files && e.target.files.length ? Array.prototype.slice.call(e.target.files) : null;
      var pk = $('[data-picked="' + fk + '"]');
      if (pk) pk.textContent = ED.files[fk] ? x('edPicked') + ' ' + ED.files[fk].map(function (f) { return f.name; }).join('، ') : '';
    });
    var qT = 0;
    document.addEventListener('input', function (e) {
      var ek = e.target.getAttribute && e.target.getAttribute('data-ek');
      if (ek) { e.target.classList.toggle('dirty', e.target.value.trim() !== (e.target.getAttribute('data-orig') || '').trim()); return; }
      if (e.target.id !== 'admQ') return;
      clearTimeout(qT); var v = e.target.value;
      qT = setTimeout(function () { S.f.q = v; S.shown = PAGE; drawTable(); }, 160);
    });
  }
  function docsCsv() {
    var q = function (v) { v = String(v == null ? '' : v); if (/^[=+\-@]/.test(v)) v = "'" + v; return '"' + v.replace(/"/g, '""') + '"'; };
    var list = docItems().filter(function (it) { return !S.docKind || it.k === S.docKind; });
    var lines = [[x('cName'), x('cRef'), x('cWork'), x('dKind'), x('dDate'), x('dDays')].map(q).join(',')].concat(list.map(function (it) {
      return [it.r.fullNameLatin, it.r.ref, cc2name(it.r.workCountryCode, it.r.workCountry), x('dk.' + it.k), it.d, it.n].map(q).join(',');
    }));
    var blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'Bonyan-HR-Documents-' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  window.BonyanAdmin = {
    render: function (el) {
      S.el = el; bind();
      if (S.data) { draw(); return; }
      draw();
    },
    leave: function () { if (S.globe) { S.globe.destroy(); S.globe = null; } closeDrawer(); }
  };

  /* ---------------------------------------------------------- تشغيل الصفحة المستقلة */
  if (STANDALONE) {
    var boot = function () {
      var L = A.state.lang, D = window.I18N;
      document.documentElement.lang = L; document.documentElement.dir = D[L].dir || 'rtl';
      document.title = x('title') + ' · Bonyan HR';
      var logo = (window.BONYAN_LOGOS || {}).markWhite;
      $('#admLogo').innerHTML = logo ? '<img class="main-logo" src="' + logo.src + '" alt="Bonyan">' : 'Bonyan';
      $('#admBarT').textContent = x('title');
      $('#admBarE').textContent = x('eyebrow');
      $('#admBackLbl').textContent = x('backForm');
      $$('#admLang [data-lang]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === L)); });
      var gl = $('#admGlobe'); if (S.data && gl && S.globe) { /* إعادة الرسم بعد تغيير اللغة */ }
      window.BonyanAdmin.render($('#admin'));
    };
    document.addEventListener('click', function (e) {
      var lb = e.target.closest && e.target.closest('#admLang [data-lang]');
      if (lb) { A.state.lang = lb.getAttribute('data-lang'); try { localStorage.setItem('bonyan-hr-registry-draft-v1-lang', A.state.lang); } catch (er) { } boot(); return; }
      if (e.target.closest && e.target.closest('#themeBtn')) {
        var r = document.documentElement, n = r.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        r.setAttribute('data-theme', n); try { localStorage.setItem('bonyan-hr-theme', n); } catch (er) { }
      }
    });
    window.addEventListener('scroll', function () { var t = $('#top'); if (t) t.classList.toggle('scrolled', window.scrollY > 8); }, { passive: true });
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  }
})();
