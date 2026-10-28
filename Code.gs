/**
 * ============================================================
 *  Bonyan HR · Global Staff Registry — خادم Google Apps Script
 * ============================================================
 *  يستقبل بيانات النموذج من الموقع (GitHub Pages) ويحفظها في:
 *   - جدول Google Sheets: «Bonyan HR · سجل المنسوبين»
 *   - مجلد Drive: «Bonyan HR · ملفات المنسوبين / الدولة / الرقم المرجعي · الاسم»
 *
 *  خطوات التشغيل مذكورة في README.md
 *  ١) شغّل الدالة setup مرة واحدة.
 *  ٢) انشر المشروع كتطبيق ويب، وانسخ الرابط إلى assets/js/config.js
 * ============================================================
 */

var CONFIG = {
  SS_TITLE: 'Bonyan HR · سجل المنسوبين',
  ROOT_FOLDER: 'Bonyan HR · ملفات المنسوبين',
  FORM_URL: 'https://banyan-global.github.io/bonyan-hr-staff-registry/',
  MAIL_ONLY_TO: 'osama.mo.bonyan@gmail.com', // مرحلة التجربة: رسائل التأكيد تذهب لهذا البريد فقط. اتركه '' لتصل لكل منسوب على بريده
  REF_PREFIX: 'BNY-HR',
  SHEETS: { main: 'المنسوبون', quals: 'المؤهلات', exp: 'الخبرات', langs: 'اللغات', log: 'السجل' },
  COLORS: { navy: '#143D66', brass: '#9C7432', band: '#F3F5F8', white: '#FFFFFF', ink: '#0F2238' },
  FONT: 'IBM Plex Sans Arabic',
  TOKEN_TTL: 21600 // ٦ ساعات لإكمال رفع المرفقات
};

/* أعمدة الورقة الرئيسية: [المفتاح، العنوان، النوع]
   النوع: t نص، d تاريخ، n رقم، f ملف، s نظام */
var MAIN_COLS = [
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
  ['lang', 'لغة التعبئة', 's'], ['tz', 'المنطقة الزمنية', 's'], ['folderId', 'معرّف المجلد', 's'],
  ['workCountryCode', 'رمز دولة العمل', 's'], ['nationalityCode', 'رمز الجنسية', 's']
];
var EXPIRY_KEYS = ['passportExpiry', 'nationalIdExpiry', 'permitExpiry', 'workPermitExpiry', 'contractEnd'];
var DEGREE_RANK = { 'دكتوراه': 6, 'ماجستير': 5, 'بكالوريوس': 4, 'دبلوم': 3, 'ثانوي': 2, 'أخرى': 1 };

/* ============================================================ الإعداد */
function setup() {
  var props = PropertiesService.getScriptProperties();
  var ss = getSS_(true);
  var root = getRoot_(true);
  ensureSheets_(ss);
  Logger.log('✅ تم الإعداد');
  Logger.log('الجدول: ' + ss.getUrl());
  Logger.log('مجلد المرفقات: ' + root.getUrl());
  Logger.log('الخطوة التالية: نشر ← نشر جديد ← تطبيق ويب، ثم انسخ الرابط إلى config.js');
  if (!props.getProperty('ADMIN_CODE')) props.setProperty('ADMIN_CODE', String(Math.floor(100000 + Math.random() * 900000)));
  Logger.log('🔐 رمز صفحة عرض البيانات: ' + props.getProperty('ADMIN_CODE') + '  (لتغييره: إعدادات المشروع ← خصائص النص البرمجي ← ADMIN_CODE)');
  Logger.log('👥 لرموز مستقلة لكل موظف في الموارد البشرية: أضف خاصية ADMIN_CODES بالشكل  أسامة=482913, سارة=771204  (كل دخول يُسجَّل باسم صاحبه)');
  if (!props.getProperty('HR_EMAIL')) Logger.log('اختياري: أضف خاصية HR_EMAIL في إعدادات المشروع لتصلك رسالة عند كل تسجيل.');
}

function getSS_(create) {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('SS_ID');
  if (id) { try { return SpreadsheetApp.openById(id); } catch (e) { } }
  if (!create) throw new Error('لم يُجهَّز الجدول بعد. شغّل الدالة setup.');
  var ss = SpreadsheetApp.create(CONFIG.SS_TITLE);
  props.setProperty('SS_ID', ss.getId());
  return ss;
}
function getRoot_(create) {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('ROOT_ID');
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) { } }
  if (!create) throw new Error('لم يُجهَّز مجلد المرفقات بعد. شغّل الدالة setup.');
  var f = DriveApp.createFolder(CONFIG.ROOT_FOLDER);
  props.setProperty('ROOT_ID', f.getId());
  return f;
}

/* إعادة ضبط ورقة «المنسوبون»: العناوين، عدد الأعمدة، التنسيقات، الألوان، الأعمدة المخفية، وقواعد تنبيه الانتهاء */
function layoutMain_(main) {
  var n = MAIN_COLS.length, want = MAIN_COLS.map(function (c) { return c[1]; });
  reorderMain_(main, want);
  if (main.getMaxColumns() < n) main.insertColumnsAfter(main.getMaxColumns(), n - main.getMaxColumns());
  if (main.getMaxColumns() > n) {
    var extra = main.getRange(1, n + 1, Math.max(1, main.getLastRow()), main.getMaxColumns() - n).getValues();
    var blank = extra.slice(1).every(function (r) { return r.every(function (v) { return v === '' || v === null; }); });
    if (blank) main.deleteColumns(n + 1, main.getMaxColumns() - n);
  }
  main.showColumns(1, n);
  var hr = main.getRange(1, 1, 1, n);
  hr.setValues([want]).setFontWeight('bold').setFontColor(CONFIG.COLORS.white).setBackground(CONFIG.COLORS.navy)
    .setVerticalAlignment('middle').setHorizontalAlignment('center').setWrap(true);
  var rows = Math.max(1, main.getMaxRows() - 1);
  MAIN_COLS.forEach(function (c, i) {
    var col = i + 1, body = main.getRange(2, col, rows, 1);
    body.setNumberFormat(c[2] === 'd' ? 'yyyy-mm-dd' : (c[2] === 'n' ? '#,##0' : '@'));
    if (c[2] === 'f') main.getRange(1, col).setBackground(CONFIG.COLORS.brass);
    if (c[2] === 's' && c[0] !== 'ref' && c[0] !== 'status') main.getRange(1, col).setBackground('#3B5878');
  });
  main.setColumnWidths(1, n, 160);
  main.setColumnWidth(col_('ref'), 190);
  main.setColumnWidth(col_('fullNameAr'), 230);
  main.setColumnWidth(col_('fullNameLatin'), 230);
  main.setColumnWidth(col_('folder'), 110);
  main.hideColumns(col_('folderId'));
  main.setFrozenRows(1);
  main.setFrozenColumns(col_('fullNameAr')); /* المثبّت هو الاسم بالعربية */
  main.getBandings().forEach(function (b) { b.remove(); });
  main.getRange(1, 1, main.getMaxRows(), n).applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, true, false)
    .setHeaderRowColor(CONFIG.COLORS.navy).setFirstRowColor(CONFIG.COLORS.white).setSecondRowColor(CONFIG.COLORS.band);
  main.setConditionalFormatRules([]);
  addExpiryRules_(main);
  main.getRange(1, 1).setNote('Bonyan HR · Global Staff Registry · ' + n + ' عمودًا');
}
/* إذا كانت عناوين الجدول هي نفسها لكن بترتيب مختلف (تغيّر ترتيب MAIN_COLS)، تُنقل الأعمدة كاملة
   بقيمها وصيغها وروابطها وتنسيقها إلى الترتيب الجديد، فلا تنزاح أي بيانات عن عنوانها */
function reorderMain_(main, want) {
  var lc = main.getLastColumn(); if (lc < 1) return;
  var head = main.getRange(1, 1, 1, lc).getValues()[0].map(String);
  if (!want.every(function (h) { return head.indexOf(h) > -1; })) return;
  for (var j = 0; j < want.length; j++) {
    var cur = head.indexOf(want[j]);
    if (cur === j) continue;
    if (main.getFrozenColumns()) main.setFrozenColumns(0);
    main.moveColumns(main.getRange(1, cur + 1, 1, 1), j + 1);
    head.splice(j, 0, head.splice(cur, 1)[0]);
  }
}
/* تشغيل يدوي عند الحاجة: يصلح ترتيب أعمدة الجدول دون المساس بالبيانات */
function repairSheet() { layoutMain_(getSS_(false).getSheetByName(CONFIG.SHEETS.main)); Logger.log('✅ تم ضبط أعمدة الجدول'); }

function ensureSheets_(ss) {
  var S = CONFIG.SHEETS;
  var main = prepSheet_(ss, S.main, MAIN_COLS.map(function (c) { return c[1]; }), 160);
  /* تتحقق في كل مرة من أن عناوين الأعمدة تطابق MAIN_COLS تمامًا؛ وإن اختلفت (جدول أُنشئ بنسخة سابقة)
     يُعاد ترتيب العناوين والتنسيقات وقواعد التلوين على الترتيب الحالي الذي تُكتب به البيانات */
  var want = MAIN_COLS.map(function (c) { return c[1]; });
  var head = main.getRange(1, 1, 1, Math.max(1, main.getLastColumn())).getValues()[0];
  var same = head.length === want.length && want.every(function (h, i) { return head[i] === h; });
  if (!same) layoutMain_(main);
  prepSheet_(ss, S.quals, ['الرقم المرجعي', 'الاسم', 'الدرجة', 'التخصص', 'الجهة', 'الدولة', 'سنة التخرج', 'التقدير'], 170);
  prepSheet_(ss, S.exp, ['الرقم المرجعي', 'الاسم', 'جهة العمل', 'المسمى', 'الدولة', 'من', 'إلى'], 170);
  prepSheet_(ss, S.langs, ['الرقم المرجعي', 'الاسم', 'اللغة', 'المستوى'], 170);
  prepSheet_(ss, S.log, ['الوقت', 'الرقم المرجعي', 'العملية', 'التفاصيل'], 220);
  var def = ss.getSheetByName('Sheet1') || ss.getSheetByName('ورقة1');
  if (def && ss.getSheets().length > 1) ss.deleteSheet(def);
  return main;
}

function prepSheet_(ss, name, headers, width) {
  var sh = ss.getSheetByName(name);
  if (sh) return sh;
  sh = ss.insertSheet(name);
  sh.setRightToLeft(true);
  if (sh.getMaxColumns() < headers.length) sh.insertColumnsAfter(sh.getMaxColumns(), headers.length - sh.getMaxColumns());
  var h = sh.getRange(1, 1, 1, headers.length);
  h.setValues([headers]).setFontWeight('bold').setFontColor(CONFIG.COLORS.white).setBackground(CONFIG.COLORS.navy)
    .setVerticalAlignment('middle').setHorizontalAlignment('center').setWrap(true);
  sh.setRowHeight(1, 42);
  sh.setFrozenRows(1);
  sh.getRange(1, 1, sh.getMaxRows(), headers.length).setFontFamily(CONFIG.FONT).setFontSize(10);
  sh.setColumnWidths(1, headers.length, width);
  if (sh.getMaxColumns() > headers.length) sh.deleteColumns(headers.length + 1, sh.getMaxColumns() - headers.length);
  sh.getRange(1, 1, sh.getMaxRows(), headers.length)
    .applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, true, false)
    .setHeaderRowColor(CONFIG.COLORS.navy).setFirstRowColor(CONFIG.COLORS.white).setSecondRowColor(CONFIG.COLORS.band);
  sh.getRange(1, 1, sh.getMaxRows(), headers.length).createFilter();
  return sh;
}

function addExpiryRules_(sh) {
  var rules = sh.getConditionalFormatRules();
  EXPIRY_KEYS.forEach(function (k) {
    var c = col_(k), r = sh.getRange(2, c, sh.getMaxRows() - 1, 1), a = colLetter_(c) + '2';
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=AND(' + a + '<>"",' + a + '<TODAY())')
      .setBackground('#FCE8E6').setFontColor('#B3261E').setRanges([r]).build());
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=AND(' + a + '<>"",' + a + '<=TODAY()+90)')
      .setBackground('#FBF0D9').setFontColor('#9A6300').setRanges([r]).build());
  });
  sh.setConditionalFormatRules(rules);
}

/* ============================================================ نقاط الدخول */
function doGet(e) {
  var action = e && e.parameter && e.parameter.action;
  if (action === 'countries') return json_(countries_());
  return json_({ ok: true, service: 'Bonyan HR · Global Staff Registry' });
}

/* أرقام مجمّعة فقط لكل دولة عمل: عدد المنسوبين ومناطقهم وجنسياتهم — بلا أي بيانات شخصية.
   تُحتسب الاستمارات المكتملة فقط، وتظهر نقاطًا على الكرة الأرضية في الصفحة الأولى. */
function countries_() {
  var cache = CacheService.getScriptCache();
  var hit = cache.get('countries');
  if (hit) return JSON.parse(hit);
  var out = {}, nats = {}, allNat = {}, total = 0;
  try {
    var sh = getSS_(false).getSheetByName(CONFIG.SHEETS.main);
    var last = sh.getLastRow();
    if (last >= 2) {
      var st = sh.getRange(2, col_('status'), last - 1, 1).getValues();
      var wc = sh.getRange(2, col_('workCountryCode'), last - 1, 1).getValues();
      var nc = sh.getRange(2, col_('nationalityCode'), last - 1, 1).getValues();
      var rg = sh.getRange(2, col_('workRegion'), last - 1, 1).getValues(), regs = {};
      for (var i = 0; i < wc.length; i++) {
        if (String(st[i][0]).indexOf('بانتظار') === 0) continue;
        var c = String(wc[i][0] || '').toUpperCase(), n = String(nc[i][0] || '').toUpperCase();
        if (!/^[A-Z]{2}$/.test(c)) continue;
        out[c] = out[c] || { n: 0, nat: 0, reg: 0 }; out[c].n++; total++;
        var rk = String(rg[i][0] || '').trim().toLowerCase().replace(/^(منطقة|محافظة|provinsi|county)\s+/, '').replace(/\s+/g, ' ');
        regs[c] = regs[c] || {};
        if (rk && !regs[c][rk]) { regs[c][rk] = 1; out[c].reg++; }
        nats[c] = nats[c] || {};
        if (n && !nats[c][n]) { nats[c][n] = 1; out[c].nat++; }
        if (n) allNat[n] = 1;
      }
    }
  } catch (err) { }
  var res = { ok: true, countries: out, total: total, nationalities: Object.keys(allNat).length };
  cache.put('countries', JSON.stringify(res), 300);
  return res;
}

/* ============================================================ صفحة عرض البيانات (برمز) */
/* رموز الدخول: ADMIN_CODE (المشرف العام) + ADMIN_CODES اختياريًا لكل مستخدم باسمه
   مثال قيمة ADMIN_CODES:  أسامة=482913, سارة=771204   — كل دخول يُسجَّل باسم صاحبه في ورقة السجل */
function adminCodes_() {
  var props = PropertiesService.getScriptProperties(), out = {};
  var main = props.getProperty('ADMIN_CODE');
  if (main) out[String(main).trim()] = 'المشرف العام';
  String(props.getProperty('ADMIN_CODES') || '').split(/[,،;\n]+/).forEach(function (pair) {
    var m = /^\s*(.+?)\s*[=:]\s*(\S+)\s*$/.exec(pair);
    if (m && m[2].length >= 6) out[m[2]] = m[1];
  });
  return out;
}
function checkAdmin_(code) {
  var cache = CacheService.getScriptCache();
  var codes = adminCodes_();
  if (!Object.keys(codes).length) throw new Error('not_setup');
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  var who = null;
  try {
    var fails = +(cache.get('admin_fail') || 0);
    if (fails >= 8) throw new Error('locked');
    who = codes[String(code || '').trim()] || null;
    if (!who) cache.put('admin_fail', String(fails + 1), 900);
    else cache.remove('admin_fail');
  } finally { lock.releaseLock(); }
  if (!who) { Utilities.sleep(700); log_('', 'محاولة دخول خاطئة', ''); throw new Error('bad_code'); }
  return who;
}
/* الصورة الشخصية لمنسوب واحد (للوحة الموارد البشرية فقط، برمز الدخول) لرسمها في بطاقته */
function photo_(b) {
  checkAdmin_(b.code);
  var sh = getSS_(false).getSheetByName(CONFIG.SHEETS.main);
  var row = findRow_(sh, 'ref', function (v) { return v === b.ref; });
  if (!row) throw new Error('not_found');
  var p = photoB64_(sh, row);
  return p ? { ok: true, mime: p.mime, b64: p.b64 } : { ok: true, none: true };
}
function photoB64_(sh, row) {
  try {
    var u = linksOf_(sh.getRange(row, col_('photo')).getRichTextValue())[0] || '';
    var m = /\/d\/([\w-]+)|[?&]id=([\w-]+)/.exec(u);
    if (!m) return null;
    var f = DriveApp.getFileById(m[1] || m[2]);
    var blob = f.getSize() > 2500000 ? f.getThumbnail() : f.getBlob();
    return blob ? { mime: blob.getContentType() || 'image/jpeg', b64: Utilities.base64Encode(blob.getBytes()) } : null;
  } catch (e) { return null; }
}
function audit_() {
  try {
    var sh = getSS_(false).getSheetByName(CONFIG.SHEETS.log), n = sh ? sh.getLastRow() : 0;
    if (n < 2) return [];
    var from = Math.max(2, n - 400), vals = sh.getRange(from, 1, n - from + 1, 4).getDisplayValues();
    return vals.filter(function (r) { return /دخول لوحة البيانات|محاولة دخول خاطئة/.test(r[2]); }).reverse().slice(0, 80)
      .map(function (r) { return [r[0], r[2], r[3]]; });
  } catch (e) { return []; }
}
function linksOf_(rt) {
  if (!rt) return [];
  var out = [];
  rt.getRuns().forEach(function (r) { var u = r.getLinkUrl(); if (u && out.indexOf(u) < 0) out.push(u); });
  var u0 = rt.getLinkUrl(); if (u0 && out.indexOf(u0) < 0) out.push(u0);
  return out;
}
function list_(code) {
  var who = checkAdmin_(code);
  var ss = getSS_(false), sh = ss.getSheetByName(CONFIG.SHEETS.main);
  var last = sh.getLastRow(), rows = [];
  if (last >= 2) {
    var disp = sh.getRange(2, 1, last - 1, MAIN_COLS.length).getDisplayValues();
    var files = {};
    MAIN_COLS.forEach(function (c, j) { if (c[2] === 'f') files[c[0]] = sh.getRange(2, j + 1, last - 1, 1).getRichTextValues(); });
    rows = disp.map(function (r, i) {
      var o = {};
      MAIN_COLS.forEach(function (c, j) {
        if (c[2] === 'f') { var u = linksOf_(files[c[0]][i][0]); o[c[0]] = u.length ? u : r[j]; }
        else o[c[0]] = r[j];
      });
      o.folder = o.folderId ? 'https://drive.google.com/drive/folders/' + o.folderId : '';
      delete o.folderId;
      return o;
    }).filter(function (o) { return o.ref; });
  }
  function child(name) {
    var c = ss.getSheetByName(name), n = c ? c.getLastRow() : 0;
    if (n < 2) return [];
    return c.getRange(1, 1, n, c.getLastColumn()).getDisplayValues();
  }
  log_('', 'دخول لوحة البيانات', who);
  return {
    ok: true, at: fmtNow_(new Date()), who: who, audit: audit_(),
    cols: MAIN_COLS.filter(function (c) { return c[0] !== 'folderId'; }),
    rows: rows, quals: child(CONFIG.SHEETS.quals), exp: child(CONFIG.SHEETS.exp), langs: child(CONFIG.SHEETS.langs),
    sheetUrl: ss.getUrl()
  };
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    if (body.action === 'submit') return json_(submit_(body.payload));
    if (body.action === 'upload') return json_(upload_(body));
    if (body.action === 'finalize') return json_(finalize_(body));
    if (body.action === 'list') return json_(list_(body.code));
    if (body.action === 'photo') return json_(photo_(body));
    if (body.action === 'adminUpdate') return json_(adminUpdate_(body));
    if (body.action === 'adminUpload') return json_(adminUpload_(body));
    if (body.action === 'cardImg') return json_(cardImg_(body));
    if (body.action === 'adminMail') return json_(adminMail_(body));
    if (body.action === 'selfStart') return json_(selfStart_(body));
    if (body.action === 'selfUpdate') return json_(selfUpdate_(body));
    if (body.action === 'selfUpload') return json_(selfUpload_(body));
    if (body.action === 'selfFinish') return json_(selfFinish_(body));
    return json_({ ok: false, error: 'unknown action' });
  } catch (err) {
    log_('', 'خطأ', String(err && err.stack || err));
    return json_({ ok: false, error: String(err && err.message || err) });
  }
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

/* ============================================================ الإرسال */
function submit_(p) {
  if (!p || !p.raw || !p.ar) throw new Error('بيانات ناقصة');
  if (p.meta && p.meta.website) return { ok: false, error: 'rejected' };
  var raw = p.raw, ar = p.ar;
  ['firstName', 'lastName', 'passportNo', 'workCountry', 'nationality', 'personalEmail'].forEach(function (k) {
    if (!raw[k]) throw new Error('حقل مطلوب مفقود: ' + k);
  });

  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var ss = getSS_(false);
    var sh = ensureSheets_(ss);
    var passport = normalize_(raw.passportNo);
    var rowIdx = findRow_(sh, 'passportNo', function (v) { return normalize_(v) === passport; });
    var now = new Date();
    var dup = false;
    if (rowIdx > 0) {
      /* لا يُسمح بتحديث سجل موجود إلا إذا طابق البريد الشخصي أو رقم الجوال المسجّلين مسبقًا */
      var oldMail = String(sh.getRange(rowIdx, col_('personalEmail')).getValue() || '').trim().toLowerCase();
      var oldMob = digits_(sh.getRange(rowIdx, col_('mobile')).getDisplayValue()).slice(-8);
      var newMail = String(raw.personalEmail || '').trim().toLowerCase();
      var newMob = digits_(ar.mobile || raw.mobile).slice(-8);
      var same = (oldMail && oldMail === newMail) || (oldMob.length === 8 && oldMob === newMob);
      if (!same) { dup = true; rowIdx = 0; }
    }
    var updated = rowIdx > 0;
    var ref, folder;

    if (updated) {
      ref = sh.getRange(rowIdx, col_('ref')).getValue();
      var fid = sh.getRange(rowIdx, col_('folderId')).getValue();
      try { folder = DriveApp.getFolderById(fid); } catch (e2) { folder = null; }
      if (folder) { try { var fnm = folderName_(ref, ar); if (folder.getName() !== fnm) folder.setName(fnm); } catch (e3) { } }
    } else {
      ref = nextRef_(raw.workCountry);
    }
    if (!folder) folder = employeeFolder_(ref, ar);

    var vals = MAIN_COLS.map(function (c) {
      var k = c[0];
      switch (k) {
        case 'ref': return ref;
        case 'status': return 'بانتظار المرفقات';
        case 'createdAt': return updated ? sh.getRange(rowIdx, col_('createdAt')).getValue() : fmtNow_(now);
        case 'updatedAt': return fmtNow_(now);
        case 'folder': return '';
        case 'folderId': return folder.getId();
        case 'contractStatus': return raw.hasContract === 'no' ? 'لا يوجد' : 'يوجد';
        case 'contractFile': return raw.hasContract === 'no' ? 'لا يوجد' : '';
        case 'topDegree': return topDegree_(ar.qualifications);
        case 'lang': return (p.meta && p.meta.lang) || '';
        case 'tz': return (p.meta && p.meta.tz) || '';
        case 'workCountryCode': return cc_(ar.workCountryCode || raw.workCountry);
        case 'nationalityCode': return cc_(ar.nationalityCode || raw.nationality);
      }
      if (c[2] === 'n') { var num = Number(String(raw[k] == null ? '' : raw[k]).replace(/[,\s]/g, '')); return raw[k] === '' || raw[k] == null || isNaN(num) ? '' : num; }
      if (c[2] === 'f') return updated ? sh.getRange(rowIdx, col_(k)).getValue() : '';
      if (c[2] === 'd') return raw[k] ? new Date(raw[k] + 'T12:00:00') : '';
      var v = ar[k] != null ? ar[k] : (raw[k] != null ? raw[k] : '');
      return Array.isArray(v) ? '' : safeText_(v);
    });

    /* روابط المرفقات الحالية تُحفظ قبل الكتابة ثم تُعاد كما هي */
    var keepFiles = [];
    if (updated) {
      MAIN_COLS.forEach(function (c, j) { if (c[2] === 'f') keepFiles.push([j + 1, sh.getRange(rowIdx, j + 1).getRichTextValue()]); });
    } else {
      rowIdx = sh.getLastRow() + 1;
      ensureRows_(sh, rowIdx);
    }
    var rowRange = sh.getRange(rowIdx, 1, 1, vals.length);
    rowRange.setNumberFormats([rowFormats_()]);
    rowRange.setValues([vals]);
    keepFiles.forEach(function (f) { if (f[1] && f[1].getText()) sh.getRange(rowIdx, f[0]).setRichTextValue(f[1]); });
    sh.getRange(rowIdx, col_('folder')).setFormula('=HYPERLINK("' + folder.getUrl() + '","فتح المجلد")');

    var name = ar.fullNameLatin || '';
    replaceChildRows_(ss.getSheetByName(CONFIG.SHEETS.quals), ref, (ar.qualifications || []).map(function (q, i) {
      var rq = (raw.qualifications || [])[i] || {};
      return [ref, name, q.degree || '', q.major || '', q.institution || '', q.country || '', String(rq.gradYear || q.gradYear || ''), q.grade || ''];
    }));
    replaceChildRows_(ss.getSheetByName(CONFIG.SHEETS.exp), ref, (ar.experience || []).map(function (x, i) {
      var rx = (raw.experience || [])[i] || {};
      return [ref, name, x.org || '', x.title || '', x.country || '', rx.from || x.from || '', rx.to || x.to || ''];
    }));
    replaceChildRows_(ss.getSheetByName(CONFIG.SHEETS.langs), ref, (ar.languages || []).map(function (l) {
      return [ref, name, l.language || '', l.level || ''];
    }));

    var token = Utilities.getUuid();
    var cache = CacheService.getScriptCache();
    cache.put('tok_' + ref, token, CONFIG.TOKEN_TTL);
    cache.put('row_' + ref, String(rowIdx), CONFIG.TOKEN_TTL);
    cache.put('upd_' + ref, updated ? '1' : '', CONFIG.TOKEN_TTL);
    log_(ref, updated ? 'تحديث بيانات' : (dup ? 'تسجيل جديد · رقم جواز مكرر يحتاج مراجعة' : 'تسجيل جديد'), name + ' · ' + (ar.workCountry || ''));
    return { ok: true, ref: ref, token: token, updated: updated };
  } finally {
    lock.releaseLock();
  }
}

/* ============================================================ رفع المرفقات */
function upload_(b) {
  checkToken_(b.ref, b.token);
  var ss = getSS_(false), sh = ss.getSheetByName(CONFIG.SHEETS.main);
  var row = rowOf_(sh, b.ref);
  var folder = DriveApp.getFolderById(sh.getRange(row, col_('folderId')).getValue());
  var col = col_(b.kind);
  if (!col || MAIN_COLS[col - 1][2] !== 'f') throw new Error('نوع مرفق غير معروف');

  var ext = b.mime === 'application/pdf' ? 'pdf' : 'jpg';
  /* اسم الملف: «نوع المستند - اسم المنسوب» مثل: صورة شخصية - أسامة محمد جنيدي.jpg */
  var who = String(sh.getRange(row, col_('fullNameAr')).getDisplayValue() || sh.getRange(row, col_('fullNameLatin')).getDisplayValue() || b.ref).trim();
  var clean = function (v) { return String(v || '').replace(/[\\\/:*?"<>|\n\r]+/g, '-').replace(/\s+/g, ' ').trim().slice(0, 80); };
  var base = clean(b.label) + ' - ' + clean(who);
  var fname = base + (b.total > 1 ? ' (' + b.idx + ')' : '') + '.' + ext;
  var cache = CacheService.getScriptCache();
  var listKey = 'f_' + b.ref + '_' + b.kind;

  if (b.idx === 1) {
    var old = folder.getFiles();
    while (old.hasNext()) {
      var f0 = old.next();
      var n0 = f0.getName();
      if (n0.indexOf(base + '.') === 0 || n0.indexOf(base + ' (') === 0 || n0.indexOf(b.ref + '_' + b.label) === 0) f0.setTrashed(true);
    }
    cache.remove(listKey);
  }
  var bytes = Utilities.base64Decode(b.data);
  if (bytes.length > 12 * 1024 * 1024) throw new Error('الملف كبير جدًا');
  var file = folder.createFile(Utilities.newBlob(bytes, b.mime, fname));

  var list = JSON.parse(cache.get(listKey) || '[]');
  list.push(file.getUrl());
  cache.put(listKey, JSON.stringify(list), CONFIG.TOKEN_TTL);

  var label = list.length === 1 ? 'عرض الملف' : list.map(function (_, i) { return 'ملف ' + (i + 1); }).join('  ·  ');
  var rt = SpreadsheetApp.newRichTextValue().setText(label);
  if (list.length === 1) rt.setLinkUrl(list[0]);
  else {
    var pos = 0;
    list.forEach(function (u, i) {
      var seg = 'ملف ' + (i + 1);
      rt.setLinkUrl(pos, pos + seg.length, u);
      pos += seg.length + 5;
    });
  }
  sh.getRange(row, col).setRichTextValue(rt.build());
  return { ok: true, url: file.getUrl() };
}

function finalize_(b) {
  var cache0 = CacheService.getScriptCache();
  if (b.ref && b.token && cache0.get('done_' + b.ref) === b.token) return { ok: true };
  checkToken_(b.ref, b.token);
  var ss = getSS_(false), sh = ss.getSheetByName(CONFIG.SHEETS.main);
  var row = rowOf_(sh, b.ref);
  var cache = CacheService.getScriptCache();
  var updated = cache.get('upd_' + b.ref) === '1';
  sh.getRange(row, col_('status')).setValue('مكتمل'); /* السجل المكتمل أو المحدَّث كلاهما «مكتمل» */
  cache.remove('countries');
  cache.remove('tok_' + b.ref);
  cache.put('done_' + b.ref, b.token, 3600);
  log_(b.ref, 'اكتمل الرفع', '');
  notify_(sh, row, b.ref, updated);
  try { sendConfirm_(sh, row, b.ref, updated); } catch (em) { log_(b.ref, 'تعذّر إرسال رسالة التأكيد', String(em)); }
  return { ok: true };
}

/* ============================================================ التعديل من لوحة الموارد البشرية
   كل عملية تتطلب رمز الدخول، وتُسجَّل في ورقة «السجل» باسم صاحب الرمز مع القيم قبل التعديل وبعده */
var ADMIN_LOCKED_ = ['ref', 'createdAt', 'updatedAt', 'folder', 'folderId', 'fullNameAr', 'fullNameLatin', 'lang', 'tz'];
var NAME_PARTS_ = ['firstNameAr', 'fatherNameAr', 'grandNameAr', 'lastNameAr', 'firstName', 'fatherName', 'grandName', 'lastName'];

function adminUpdate_(b) { return updateCore_(b, checkAdmin_(b.code), false); }
function updateCore_(b, who, self) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var ss = getSS_(false), sh = ss.getSheetByName(CONFIG.SHEETS.main);
    var row = findRow_(sh, 'ref', function (v) { return v === b.ref; });
    if (!row) throw new Error('الرقم المرجعي غير موجود');
    var ch = b.changes || {}, done = [], nameChanged = false, statusSet = false;
    Object.keys(ch).forEach(function (k) {
      var ci = col_(k);
      if (!ci || ADMIN_LOCKED_.indexOf(k) > -1 || (self && SELF_LOCKED_.indexOf(k) > -1)) return;
      var c = MAIN_COLS[ci - 1];
      if (c[2] === 'f') return;
      var cell = sh.getRange(row, ci), old = cell.getDisplayValue(), v = ch[k] == null ? '' : String(ch[k]).trim();
      if (c[2] === 'd') {
        if (v && !/^\d{4}-\d{2}-\d{2}$/.test(v)) throw new Error('تاريخ غير صالح في «' + c[1] + '»');
        cell.setValue(v ? new Date(v + 'T12:00:00') : '');
      } else if (c[2] === 'n') {
        var num = Number(v.replace(/[٠-٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); }).replace(/[,\s٬]/g, '').replace('٫', '.'));
        if (v && isNaN(num)) throw new Error('رقم غير صالح في «' + c[1] + '»');
        cell.setValue(v === '' ? '' : num);
      } else {
        cell.setValue(k === 'workCountryCode' || k === 'nationalityCode' ? cc_(v) : safeText_(v));
      }
      if (NAME_PARTS_.indexOf(k) > -1) nameChanged = true;
      if (k === 'status') statusSet = true;
      done.push(c[1] + ': «' + (old || '—') + '» ← «' + (cell.getDisplayValue() || '—') + '»');
    });
    var get = function (k) { return String(sh.getRange(row, col_(k)).getDisplayValue() || '').trim(); };
    var nameAr = get('fullNameAr');
    if (nameChanged) {
      var join = function (ks) { return ks.map(get).filter(String).join(' ').replace(/\s+/g, ' ').trim(); };
      nameAr = join(['firstNameAr', 'fatherNameAr', 'grandNameAr', 'lastNameAr']);
      sh.getRange(row, col_('fullNameAr')).setValue(safeText_(nameAr));
      sh.getRange(row, col_('fullNameLatin')).setValue(safeText_(join(['firstName', 'fatherName', 'grandName', 'lastName']).toUpperCase()));
      try { var fd = DriveApp.getFolderById(sh.getRange(row, col_('folderId')).getValue()); var fn = folderName_(b.ref, { fullNameAr: nameAr, fullNameLatin: get('fullNameLatin') }); if (fd.getName() !== fn) fd.setName(fn); } catch (e1) { }
    }
    var childName = nameAr || get('fullNameLatin');
    [['quals', CONFIG.SHEETS.quals, 6], ['exp', CONFIG.SHEETS.exp, 5], ['langs', CONFIG.SHEETS.langs, 2]].forEach(function (t) {
      var csh = ss.getSheetByName(t[1]); if (!csh) return;
      if (Array.isArray(b[t[0]])) {
        var rows = b[t[0]].filter(function (r) { return Array.isArray(r) && r.some(function (v) { return String(v || '').trim(); }); })
          .map(function (r) { var o = [b.ref, childName]; for (var i = 0; i < t[2]; i++) o.push(String(r[i] == null ? '' : r[i]).trim()); return o; });
        replaceChildRows_(csh, b.ref, rows);
        done.push(t[1] + ': ' + rows.length + ' صف');
      } else if (nameChanged) {
        var n = csh.getLastRow(); if (n < 2) return;
        var refs = csh.getRange(2, 1, n - 1, 1).getValues();
        refs.forEach(function (r, i) { if (r[0] === b.ref) csh.getRange(i + 2, 2).setValue(safeText_(childName)); });
      }
    });
    if (!done.length) return { ok: true, changed: 0 };
    sh.getRange(row, col_('updatedAt')).setValue(fmtNow_(new Date()));
    if (!statusSet && sh.getRange(row, col_('status')).getValue() === 'محدَّث') sh.getRange(row, col_('status')).setValue('مكتمل');
    CacheService.getScriptCache().remove('countries');
    log_(b.ref, self ? 'تحديث ذاتي من المنسوب' : 'تعديل من لوحة الموارد البشرية', who + ' · ' + done.join(' | '));
    return { ok: true, changed: done.length };
  } finally {
    lock.releaseLock();
  }
}

/* استبدال مرفق من لوحة الموارد البشرية: الملف الأول من الدفعة ينقل الملفات المرتبطة حاليًا بالخانة إلى سلة المحذوفات (قابلة للاسترجاع) */
function adminUpload_(b) { return uploadCore_(b, checkAdmin_(b.code), false); }
function uploadCore_(b, who, self) {
  var ss = getSS_(false), sh = ss.getSheetByName(CONFIG.SHEETS.main);
  var row = findRow_(sh, 'ref', function (v) { return v === b.ref; });
  if (!row) throw new Error('الرقم المرجعي غير موجود');
  var ci = col_(b.kind);
  if (!ci || MAIN_COLS[ci - 1][2] !== 'f') throw new Error('نوع مرفق غير معروف');
  var folder = DriveApp.getFolderById(sh.getRange(row, col_('folderId')).getValue());
  var bytes = Utilities.base64Decode(b.data);
  if (bytes.length > 12 * 1024 * 1024) throw new Error('الملف كبير جدًا');
  var mime = String(b.mime || '');
  var ext = mime === 'application/pdf' ? 'pdf' : (mime === 'image/png' ? 'png' : (mime === 'image/webp' ? 'webp' : 'jpg'));
  var name = String(sh.getRange(row, col_('fullNameAr')).getDisplayValue() || sh.getRange(row, col_('fullNameLatin')).getDisplayValue() || b.ref).trim();
  var clean = function (v) { return String(v || '').replace(/[\\\/:*?"<>|\n\r]+/g, '-').replace(/\s+/g, ' ').trim().slice(0, 80); };
  var fname = clean(MAIN_COLS[ci - 1][1]) + ' - ' + clean(name) + (b.total > 1 ? ' (' + b.idx + ')' : '') + '.' + ext;
  var cell = sh.getRange(row, ci), cache = CacheService.getScriptCache(), listKey = 'adm_' + b.ref + '_' + b.kind;
  if (b.idx === 1) {
    linksOf_(cell.getRichTextValue()).forEach(function (u) {
      var m = /\/d\/([\w-]+)|[?&]id=([\w-]+)/.exec(u); if (!m) return;
      try {
        var f = DriveApp.getFileById(m[1] || m[2]), ps = f.getParents(), inside = false;
        while (ps.hasNext()) if (ps.next().getId() === folder.getId()) inside = true;
        if (inside) f.setTrashed(true);
      } catch (e) { }
    });
    cache.remove(listKey);
  }
  var file = folder.createFile(Utilities.newBlob(bytes, mime || 'application/octet-stream', fname));
  var list = JSON.parse(cache.get(listKey) || '[]');
  list.push(file.getUrl());
  cache.put(listKey, JSON.stringify(list), 3600);
  var label = list.length === 1 ? 'عرض الملف' : list.map(function (_, i) { return 'ملف ' + (i + 1); }).join('  ·  ');
  var rt = SpreadsheetApp.newRichTextValue().setText(label);
  if (list.length === 1) rt.setLinkUrl(list[0]);
  else { var pos = 0; list.forEach(function (u, i) { var seg = 'ملف ' + (i + 1); rt.setLinkUrl(pos, pos + seg.length, u); pos += seg.length + 5; }); }
  cell.setRichTextValue(rt.build());
  if (b.idx >= (b.total || 1)) {
    sh.getRange(row, col_('updatedAt')).setValue(fmtNow_(new Date()));
    log_(b.ref, self ? 'استبدال مرفق من المنسوب' : 'استبدال مرفق من لوحة الموارد البشرية', who + ' · ' + MAIN_COLS[ci - 1][1] + ' · ' + list.length + ' ملف');
  }
  return { ok: true, url: file.getUrl() };
}

/* ============================================================ رسالة تأكيد التسجيل للمنسوب (بلغة التعبئة: عربي/إنجليزي/إندونيسي)
   تُرسل بعد اكتمال التسجيل أو التحديث، وفيها بطاقته المتحركة (تنقلب بين وجهيها) التي يصنعها النموذج نفسه.
   مرحلة التجربة: CONFIG.MAIL_ONLY_TO يجعل كل الرسائل تذهب لهذا البريد فقط؛ عند الاعتماد النهائي يُترك فارغًا لتصل للمنسوبين */
var LOGO_PNG_B64_ = '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';
var CARD_PREFIX_ = 'بطاقة المنسوب - ';
var MAIL_TX_ = {
  ar: {
    sender: 'الموارد البشرية · مجموعة بنيان العالمية', hr: 'الموارد البشرية · سجل المنسوبين', org: 'مجموعة بنيان العالمية', logoAlt: 'بنيان',
    subjNew: 'تأكيد تسجيل بياناتكم', subjUpd: 'تأكيد تحديث بياناتكم', preNew: 'تم تسجيل بياناتكم في سجل منسوبي مجموعة بنيان العالمية. الرقم المرجعي {ref}', preUpd: 'تم تحديث بياناتكم في سجل منسوبي مجموعة بنيان العالمية. الرقم المرجعي {ref}',
    titleNew: 'تم تسجيل بياناتكم بنجاح', titleUpd: 'تم تحديث بياناتكم بنجاح',
    greetM: 'الأستاذ <b>{name}</b> المحترم،', greetF: 'الأستاذة <b>{name}</b> المحترمة،',
    bodyNew: 'استلمنا بياناتكم ومرفقاتكم وسُجّلت في سجل منسوبي مجموعة بنيان العالمية.', bodyUpd: 'حُفظ تحديث بياناتكم ومرفقاتكم في سجل منسوبي مجموعة بنيان العالمية.',
    card: 'بطاقة المنسوب', ref: 'الرقم المرجعي', date: 'تاريخ التسجيل', workCountry: 'دولة العمل', nationality: 'الجنسية', passport: 'رقم الجواز', passportExpiry: 'انتهاء الجواز',
    permitExpiry: 'انتهاء الإقامة', mobile: 'الجوال', email: 'البريد الإلكتروني', files: 'المرفقات المستلمة', btn: 'تحديث بياناتي',
    note: 'للتحديث: اضغط الزر ثم أدخل رقمك المرجعي · لا تتضمن هذه الرسالة أي بيانات مالية', regards: 'مع خالص التحية والتقدير', sign: 'إدارة الموارد البشرية · مجموعة بنيان العالمية',
    auto: 'رسالة آلية من نظام سجل المنسوبين، ولأي استفسار تقني يسعدنا تواصلك عبر البريد أدناه.', dev: 'م. أسامة جنيدي', copy: '© {y} مجموعة بنيان العالمية',
    expired: 'انتهت صلاحية {doc} بتاريخ {d}، نرجو تحديثها في النموذج بعد تجديدها.', soon: 'تنتهي صلاحية {doc} بتاريخ {d}، نرجو المبادرة بتجديدها وتحديثها في النموذج.',
    docs: { passportExpiry: 'جواز السفر', permitExpiry: 'الإقامة', nationalIdExpiry: 'الهوية الوطنية', workPermitExpiry: 'تصريح العمل' }
  },
  en: {
    sender: 'HR · Bonyan International Group', hr: 'Human Resources · Staff Registry', org: 'Bonyan International Group', logoAlt: 'Bonyan',
    subjNew: 'Registration confirmed', subjUpd: 'Update confirmed', preNew: 'Your details are now recorded in the Bonyan International Group staff registry. Reference {ref}', preUpd: 'Your details have been updated in the Bonyan International Group staff registry. Reference {ref}',
    titleNew: 'Your details have been registered', titleUpd: 'Your details have been updated',
    greetM: 'Dear <b>{name}</b>,', greetF: 'Dear <b>{name}</b>,',
    bodyNew: 'We have received your details and documents, and they are now recorded in the Bonyan International Group staff registry.', bodyUpd: 'Your updated details and documents have been saved in the Bonyan International Group staff registry.',
    card: 'Staff card', ref: 'Reference number', date: 'Registered on', workCountry: 'Work country', nationality: 'Nationality', passport: 'Passport no.', passportExpiry: 'Passport expiry',
    permitExpiry: 'Residence permit expiry', mobile: 'Mobile', email: 'Email', files: 'Documents received', btn: 'Update my details',
    note: 'To update: tap the button, then enter your reference number · This email contains no financial data', regards: 'With kind regards', sign: 'Human Resources · Bonyan International Group',
    auto: 'This is an automated message from the staff registry system. For any technical question, feel free to contact us at the address below.', dev: 'Eng. Osama Junaydi', copy: '© {y} Bonyan International Group',
    expired: '{doc} expired on {d}. Please update it in the form once renewed.', soon: '{doc} expires on {d}. Please renew it and update it in the form.',
    docs: { passportExpiry: 'Your passport', permitExpiry: 'Your residence permit', nationalIdExpiry: 'Your national ID', workPermitExpiry: 'Your work permit' }
  },
  id: {
    sender: 'SDM · Bonyan International Group', hr: 'Sumber Daya Manusia · Registri Staf', org: 'Bonyan International Group', logoAlt: 'Bonyan',
    subjNew: 'Konfirmasi pendaftaran', subjUpd: 'Konfirmasi pembaruan data', preNew: 'Data Anda telah tercatat dalam registri staf Bonyan International Group. Nomor referensi {ref}', preUpd: 'Data Anda telah diperbarui dalam registri staf Bonyan International Group. Nomor referensi {ref}',
    titleNew: 'Data Anda telah terdaftar', titleUpd: 'Data Anda telah diperbarui',
    greetM: 'Yth. Bapak <b>{name}</b>,', greetF: 'Yth. Ibu <b>{name}</b>,',
    bodyNew: 'Data dan dokumen Anda telah kami terima dan tercatat dalam registri staf Bonyan International Group.', bodyUpd: 'Pembaruan data dan dokumen Anda telah tersimpan dalam registri staf Bonyan International Group.',
    card: 'Kartu staf', ref: 'Nomor referensi', date: 'Tanggal pendaftaran', workCountry: 'Negara kerja', nationality: 'Kewarganegaraan', passport: 'No. paspor', passportExpiry: 'Masa berlaku paspor',
    permitExpiry: 'Masa berlaku izin tinggal', mobile: 'Ponsel', email: 'Email', files: 'Dokumen diterima', btn: 'Perbarui data saya',
    note: 'Untuk memperbarui: ketuk tombol, lalu masukkan nomor referensi Anda · Email ini tidak memuat data keuangan', regards: 'Hormat kami', sign: 'Sumber Daya Manusia · Bonyan International Group',
    auto: 'Pesan otomatis dari sistem registri staf. Untuk pertanyaan teknis, silakan hubungi alamat di bawah.', dev: 'Osama Junaydi', copy: '© {y} Bonyan International Group',
    expired: '{doc} telah habis masa berlakunya pada {d}. Mohon perbarui di formulir setelah diperpanjang.', soon: '{doc} akan habis masa berlakunya pada {d}. Mohon segera diperpanjang dan diperbarui di formulir.',
    docs: { passportExpiry: 'Paspor Anda', permitExpiry: 'Izin tinggal Anda', nationalIdExpiry: 'KTP/ID Anda', workPermitExpiry: 'Izin kerja Anda' }
  }
};
function mailLang_(v) { v = String(v || '').toLowerCase(); return MAIL_TX_[v] ? v : 'ar'; }

/* توقيع رابط التحديث الخاص بكل منسوب (لا يفتح إلا سجله، ويُطلب معه الرقم المرجعي) */
function selfSecret_() {
  var p = PropertiesService.getScriptProperties(), s = p.getProperty('SELF_SECRET');
  if (!s) { s = Utilities.getUuid() + Utilities.getUuid(); p.setProperty('SELF_SECRET', s); }
  return s;
}
function selfSig_(ref) {
  var raw = Utilities.computeHmacSha256Signature(String(ref).toUpperCase(), selfSecret_());
  return Utilities.base64EncodeWebSafe(raw).replace(/=+$/, '').slice(0, 22);
}
function updateUrl_(ref, L) { return CONFIG.FORM_URL + 'update.html?k=' + selfSig_(ref) + '&lang=' + L; }

function saveCardFiles_(folder, ref, name, gif, jpg) {
  var it = folder.getFiles();
  while (it.hasNext()) { var f = it.next(); if (f.getName().indexOf(CARD_PREFIX_) === 0) f.setTrashed(true); }
  var clean = String(name || ref).replace(/[\\\/:*?"<>|\n\r]+/g, '-').replace(/\s+/g, ' ').trim().slice(0, 80);
  var out = {};
  if (jpg) out.jpg = folder.createFile(Utilities.newBlob(Utilities.base64Decode(jpg), 'image/jpeg', CARD_PREFIX_ + clean + '.jpg'));
  if (gif) out.gif = folder.createFile(Utilities.newBlob(Utilities.base64Decode(gif), 'image/gif', CARD_PREFIX_ + clean + ' (متحركة).gif'));
  if (out.gif) CacheService.getScriptCache().put('cardgif_' + ref, out.gif.getId(), 21600);
  return out;
}
function rowName_(sh, row) { return sh.getRange(row, col_('fullNameAr')).getDisplayValue() || sh.getRange(row, col_('fullNameLatin')).getDisplayValue(); }
/* info: نصوص البطاقة بلغة التعبئة (الجهة، الدول، أسماء المرفقات) يرسلها النموذج لتظهر الرسالة بلغته */
function cardImg_(b) {
  checkToken_(b.ref, b.token);
  var sh = getSS_(false).getSheetByName(CONFIG.SHEETS.main), row = rowOf_(sh, b.ref);
  var folder = DriveApp.getFolderById(sh.getRange(row, col_('folderId')).getValue());
  saveCardFiles_(folder, b.ref, rowName_(sh, row), b.gif, b.jpg);
  if (b.info) { try { CacheService.getScriptCache().put('mailinfo_' + b.ref, JSON.stringify(b.info).slice(0, 90000), 21600); } catch (e) { } }
  return { ok: true };
}
function cardGifBlob_(sh, row, ref) {
  var id = CacheService.getScriptCache().get('cardgif_' + ref);
  try { if (id) return DriveApp.getFileById(id).getBlob(); } catch (e) { }
  try {
    var folder = DriveApp.getFolderById(sh.getRange(row, col_('folderId')).getValue()), it = folder.getFiles(), best = null;
    while (it.hasNext()) { var f = it.next(); if (f.getName().indexOf(CARD_PREFIX_) === 0 && f.getMimeType() === 'image/gif' && (!best || f.getDateCreated() > best.getDateCreated())) best = f; }
    return best ? best.getBlob() : null;
  } catch (e2) { return null; }
}
/* يرسل الرسالة ويعيد البريد الذي أُرسلت إليه (أو '' إن لم يوجد بريد) */
function sendConfirm_(sh, row, ref, updated, info) {
  var get = function (k) { return String(sh.getRange(row, col_(k)).getDisplayValue() || '').trim(); };
  if (!info) { try { info = JSON.parse(CacheService.getScriptCache().get('mailinfo_' + ref) || 'null'); } catch (e0) { info = null; } }
  info = info || {};
  var L = mailLang_(info.lang || get('lang')), T = MAIL_TX_[L];
  var fill = function (s, o) { return String(s).replace(/\{(\w+)\}/g, function (_, k) { return o[k] == null ? '' : o[k]; }); };
  var staffMail = get('personalEmail') || get('officialEmail');
  var to = CONFIG.MAIL_ONLY_TO || staffMail;
  if (!to) return '';
  var female = /أنثى|female|perempuan/i.test(get('gender'));
  var pass = get('passportNo').replace(/\s/g, '');
  var tz = 'Asia/Riyadh', today = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
  var alerts = [];
  ['passportExpiry', 'permitExpiry', 'nationalIdExpiry', 'workPermitExpiry'].forEach(function (k) {
    var v = get(k); if (!/^\d{4}-\d{2}-\d{2}/.test(v)) return;
    var days = Math.round((new Date(v.slice(0, 10) + 'T12:00:00') - new Date(today + 'T12:00:00')) / 864e5);
    if (days < 0) alerts.push(fill(T.expired, { doc: T.docs[k], d: v.slice(0, 10) }));
    else if (days <= 90) alerts.push(fill(T.soon, { doc: T.docs[k], d: v.slice(0, 10) }));
  });
  var files = [], fl = info.fileLabels || {};
  MAIN_COLS.forEach(function (c, j) {
    if (c[2] !== 'f') return;
    if (linksOf_(sh.getRange(row, j + 1).getRichTextValue()).length) files.push(fl[c[0]] || c[1]);
  });
  var gif = cardGifBlob_(sh, row, ref);
  var nameMain = L === 'ar' ? (get('fullNameAr') || get('fullNameLatin')) : (get('fullNameLatin') || get('fullNameAr'));
  var m = {
    L: L, T: T, subject: (updated ? T.subjUpd : T.subjNew) + ' · ' + ref + ' · ' + T.org,
    preheader: fill(updated ? T.preUpd : T.preNew, { ref: ref }),
    logo: 'cid:logo', cardImg: gif ? 'cid:card' : '', updated: updated, female: female, name: nameMain,
    nameAr: get('fullNameAr'), nameLatin: get('fullNameLatin'), ref: ref, date: get('createdAt'), entity: info.entity || get('entity'), jobTitle: get('jobTitle'),
    workCountry: info.workCountry || get('workCountry'), nationality: info.nationality || get('nationality'), passportMasked: pass ? '••••' + pass.slice(-4) : '', passportExpiry: get('passportExpiry'),
    permitExpiry: get('permitExpiry'), mobile: get('mobile'), email: staffMail, files: files, alerts: alerts,
    formUrl: updateUrl_(ref, L), devEmail: 'osama.mo.bonyan@gmail.com', year: Utilities.formatDate(new Date(), tz, 'yyyy')
  };
  var inline = { logo: Utilities.newBlob(Utilities.base64Decode(LOGO_PNG_B64_), 'image/png', 'bonyan.png') };
  if (gif) inline.card = gif.setName('card.gif');
  MailApp.sendEmail({
    to: to, subject: m.subject, name: T.sender,
    htmlBody: confirmMailHtml_(m), inlineImages: inline,
    body: m.preheader + '\n\n' + m.formUrl + '\n\n' + T.regards + '\n' + T.sign
  });
  log_(ref, 'إرسال رسالة التأكيد', to + ' · ' + L);
  return to;
}
/* إعادة إرسال رسالة التأكيد من لوحة الموارد البشرية (مع بطاقة جديدة يصنعها المتصفح بلغة التعبئة) */
function adminMail_(b) {
  var who = checkAdmin_(b.code);
  var sh = getSS_(false).getSheetByName(CONFIG.SHEETS.main);
  var row = findRow_(sh, 'ref', function (v) { return v === b.ref; });
  if (!row) throw new Error('الرقم المرجعي غير موجود');
  if (b.gif || b.jpg) saveCardFiles_(DriveApp.getFolderById(sh.getRange(row, col_('folderId')).getValue()), b.ref, rowName_(sh, row), b.gif, b.jpg);
  var to = sendConfirm_(sh, row, b.ref, false, b.info || null);
  if (!to) throw new Error('لا يوجد بريد إلكتروني مسجّل لهذا المنسوب');
  log_(b.ref, 'إعادة إرسال رسالة التأكيد من لوحة الموارد البشرية', who + ' · ' + to);
  return { ok: true, to: to };
}

/* ============================================================ تحديث المنسوب لبياناته بنفسه (update.html)
   ١) يكتب رقمه المرجعي، ويتحقق إما برابط رسالته الخاص (k) أو ببريده/جواله المسجّل
   ٢) يختار القسم الذي يريد تعديله ويحفظ؛ تُكتب التغييرات فقط، ويُسجَّل كل شيء في «السجل»، ثم تصله رسالة «تم تحديث بياناتكم» */
var SELF_LOCKED_ = ['status'];
function rowObj_(sh, row, ss) {
  var o = {}, disp = sh.getRange(row, 1, 1, MAIN_COLS.length).getDisplayValues()[0];
  MAIN_COLS.forEach(function (c, j) {
    if (c[0] === 'folderId' || c[0] === 'folder') return;
    if (c[2] === 'f') o[c[0]] = linksOf_(sh.getRange(row, j + 1).getRichTextValue()).length;
    else o[c[0]] = disp[j];
  });
  var ref = o.ref, kids = {};
  [['quals', CONFIG.SHEETS.quals], ['exp', CONFIG.SHEETS.exp], ['langs', CONFIG.SHEETS.langs]].forEach(function (t) {
    var c = ss.getSheetByName(t[1]), n = c ? c.getLastRow() : 0;
    if (n < 1) { kids[t[0]] = []; return; }
    var v = c.getRange(1, 1, n, c.getLastColumn()).getDisplayValues();
    kids[t[0]] = [v[0]].concat(v.slice(1).filter(function (r) { return r[0] === ref; }));
  });
  return { rec: o, kids: kids };
}
function selfStart_(b) {
  var ref = String(b.ref || '').trim().toUpperCase().replace(/\s+/g, '');
  var cache = CacheService.getScriptCache(), fk = 'selffail_' + ref;
  var fails = +(cache.get(fk) || 0);
  if (fails >= 6) throw new Error('locked');
  var ss = getSS_(false), sh = ss.getSheetByName(CONFIG.SHEETS.main);
  var row = ref ? findRow_(sh, 'ref', function (v) { return String(v).toUpperCase() === ref; }) : 0;
  var ok = false;
  if (row) {
    if (b.k && b.k === selfSig_(ref)) ok = true;
    else if (b.contact) {
      var c = String(b.contact).trim().toLowerCase(), cd = digits_(c).slice(-8);
      var mails = [sh.getRange(row, col_('personalEmail')).getDisplayValue(), sh.getRange(row, col_('officialEmail')).getDisplayValue()].map(function (v) { return String(v || '').trim().toLowerCase(); });
      var mobs = [sh.getRange(row, col_('mobile')).getDisplayValue(), sh.getRange(row, col_('whatsapp')).getDisplayValue()].map(function (v) { return digits_(v).slice(-8); });
      ok = (c.indexOf('@') > -1 && mails.indexOf(c) > -1) || (cd.length === 8 && mobs.indexOf(cd) > -1);
    }
  }
  if (!ok) { cache.put(fk, String(fails + 1), 900); Utilities.sleep(600); throw new Error('self_bad'); }
  cache.remove(fk);
  var token = Utilities.getUuid();
  cache.put('self_' + ref, token, 7200);
  var out = rowObj_(sh, row, ss);
  log_(ref, 'فتح صفحة التحديث الذاتي', b.k ? 'عبر رابط الرسالة' : 'بالبريد أو الجوال');
  var ph = photoB64_(sh, row);
  return { ok: true, ref: sh.getRange(row, col_('ref')).getValue(), token: token, rec: out.rec, kids: out.kids,
    cols: MAIN_COLS.filter(function (c) { return c[0] !== 'folderId' && c[0] !== 'folder'; }), photo: ph ? 'data:' + ph.mime + ';base64,' + ph.b64 : '' };
}
function selfCheck_(b) {
  var ref = String(b.ref || '').toUpperCase(), t = CacheService.getScriptCache().get('self_' + ref);
  if (!t || t !== b.token) throw new Error('self_expired');
  return ref;
}
function selfUpdate_(b) {
  selfCheck_(b);
  var r = updateCore_(b, 'المنسوب نفسه', true);
  var ss = getSS_(false), sh = ss.getSheetByName(CONFIG.SHEETS.main), row = findRow_(sh, 'ref', function (v) { return v === b.ref; });
  var out = rowObj_(sh, row, ss);
  r.rec = out.rec; r.kids = out.kids;
  return r;
}
function selfUpload_(b) { selfCheck_(b); return uploadCore_(b, 'المنسوب نفسه', true); }
function selfFinish_(b) {
  selfCheck_(b);
  var sh = getSS_(false).getSheetByName(CONFIG.SHEETS.main);
  var row = findRow_(sh, 'ref', function (v) { return v === b.ref; });
  if (b.gif || b.jpg) saveCardFiles_(DriveApp.getFolderById(sh.getRange(row, col_('folderId')).getValue()), b.ref, rowName_(sh, row), b.gif, b.jpg);
  var to = '';
  try { to = sendConfirm_(sh, row, b.ref, true, b.info || null); } catch (e) { log_(b.ref, 'تعذّر إرسال رسالة التأكيد', String(e)); }
  return { ok: true, mailed: !!to };
}

/* قالب رسالة تأكيد التسجيل — جداول وأنماط مضمّنة لتظهر صحيحة في Gmail وOutlook والجوال، باتجاه اللغة */
function confirmMailHtml_(m) {
  var T = m.T || MAIL_TX_.ar, RTL = (m.L || 'ar') === 'ar', S = RTL ? 'right' : 'left', E = RTL ? 'left' : 'right', DIR = RTL ? 'rtl' : 'ltr';
  var e = function (v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var NAVY = '#16294A', NAVY2 = '#0E1C33', GOLD = '#D2B074', GOLD2 = '#9C7432', INK = '#1D2A3B', MUTED = '#6B778A', LINE = '#E8EBF1';
  var FONT = RTL ? "'Tajawal','IBM Plex Sans Arabic',Tahoma,Arial,sans-serif" : "'Segoe UI',Roboto,Helvetica,Arial,sans-serif", MONO = "Consolas,'SF Mono','Courier New',monospace";
  /* خانة بيانات صغيرة: العنوان فوق القيمة */
  var cell = function (k, v, ltr, span) {
    return '<td' + (span ? ' colspan="2"' : '') + ' width="' + (span ? '100%' : '50%') + '" style="padding:6px;vertical-align:top;"><div style="background:#F7F8FB;border:1px solid ' + LINE + ';border-radius:12px;padding:10px 14px;">' +
      '<div style="font-size:11.5px;color:' + MUTED + ';font-weight:700;">' + e(k) + '</div>' +
      '<div' + (ltr ? ' dir="ltr" style="text-align:' + S + ';' : ' style="') + 'font-size:14px;color:' + INK + ';font-weight:800;margin-top:3px;word-break:break-word;">' + (v ? e(v) : '—') + '</div></div></td>';
  };
  var pairs = m.cardImg ? [[T.nationality, m.nationality], [T.passport, m.passportMasked, 1]] : [[T.workCountry, m.workCountry], [T.nationality, m.nationality], [T.passport, m.passportMasked, 1], [T.passportExpiry, m.passportExpiry, 1]];
  if (m.permitExpiry) pairs.push([T.permitExpiry, m.permitExpiry, 1]);
  pairs.push([T.mobile, m.mobile, 1]);
  var grid = '', i;
  for (i = 0; i < pairs.length; i += 2) grid += '<tr>' + cell(pairs[i][0], pairs[i][1], pairs[i][2]) + (pairs[i + 1] ? cell(pairs[i + 1][0], pairs[i + 1][1], pairs[i + 1][2]) : '<td></td>') + '</tr>';
  grid += '<tr>' + cell(T.email, m.email, 1, 1) + '</tr>';
  var chips = (m.files || []).map(function (f) {
    return '<span style="display:inline-block;margin:0 0 6px 6px;padding:6px 11px;border-radius:999px;background:#EEF7F1;border:1px solid #CFE7D8;color:#1E6B49;font-size:12.5px;font-weight:700;white-space:nowrap;">✓ ' + e(f) + '</span>';
  }).join('');
  var alerts = (m.alerts || []).map(function (a) {
    return '<div style="margin-top:12px;padding:10px 14px;border-radius:12px;background:#FFF6E5;border:1px solid #F1D49B;color:#7A5410;font-size:13px;line-height:1.8;text-align:' + S + ';">⚠️ ' + e(a) + '</div>';
  }).join('');
  var greet = (m.female ? T.greetF : T.greetM).replace('{name}', e(m.name || m.nameAr || m.nameLatin));
  var nameBig = RTL ? (m.nameAr || m.nameLatin) : (m.nameLatin || m.nameAr), nameSmall = RTL ? (m.nameAr ? m.nameLatin : '') : (m.nameLatin ? m.nameAr : '');
  return '<!doctype html><html lang="' + (m.L || 'ar') + '" dir="' + DIR + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>' + e(m.subject) + '</title>' +
  '<style>details>summary{list-style:none;cursor:pointer}details>summary::-webkit-details-marker{display:none}details[open] .chev{transform:rotate(180deg)}</style></head>' +
  '<body style="margin:0;padding:0;background:#EDF0F5;">' +
  '<div style="display:none;max-height:0;overflow:hidden;">' + e(m.preheader) + '</div>' +
  '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EDF0F5;"><tr><td align="center" style="padding:24px 10px;">' +
  '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" dir="' + DIR + '" style="max-width:560px;background:#FFFFFF;border-radius:22px;overflow:hidden;font-family:' + FONT + ';text-align:' + S + ';box-shadow:0 12px 34px rgba(22,41,74,.13);">' +
  /* الرأس */
  '<tr><td style="background:' + NAVY + ';background-image:linear-gradient(135deg,#1C335A 0%,' + NAVY + ' 45%,' + NAVY2 + ' 100%);padding:20px 24px;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>' +
    '<td style="vertical-align:middle;text-align:' + S + ';"><div style="font-size:11.5px;color:' + GOLD + ';font-weight:800;letter-spacing:.3px;">' + e(T.hr) + '</div><div style="font-size:17px;font-weight:900;color:#FFFFFF;margin-top:2px;">' + e(T.org) + '</div></td>' +
    '<td align="' + E + '" style="vertical-align:middle;"><img src="' + e(m.logo) + '" width="64" alt="' + e(T.logoAlt) + '" style="display:block;width:64px;height:auto;border:0;"></td>' +
    '</tr></table></td></tr>' +
  '<tr><td style="height:3px;line-height:3px;font-size:0;background:' + GOLD + ';background-image:linear-gradient(90deg,#B8924F,' + GOLD + ',#F0D9A8,' + GOLD + ',#B8924F);">&nbsp;</td></tr>' +
  /* العنوان */
  '<tr><td align="center" style="padding:26px 24px 4px;">' +
    '<div style="width:54px;height:54px;line-height:54px;border-radius:50%;background:#EEF7F1;border:2px solid #BFE0CC;color:#1E7A52;font-size:26px;font-weight:900;text-align:center;margin:0 auto;">✓</div>' +
    '<h1 style="margin:14px 0 4px;font-size:21px;line-height:1.5;color:' + NAVY + ';font-weight:900;text-align:center;">' + e(m.updated ? T.titleUpd : T.titleNew) + '</h1>' +
    '<p style="margin:0;font-size:14px;line-height:1.95;color:' + INK + ';text-align:center;">' + greet + '<br>' + e(m.updated ? T.bodyUpd : T.bodyNew) + '</p>' +
  '</td></tr>' +
  /* بطاقة المنسوب: صورة البطاقة نفسها كما في الموقع، وإن لم تتوفر فبطاقة نصية */
  (m.cardImg ? '<tr><td align="center" style="padding:14px 10px 0;"><img src="' + e(m.cardImg) + '" width="540" alt="' + e(T.card) + '" style="display:block;width:100%;max-width:540px;height:auto;border:0;margin:0 auto;"></td></tr>' +
    '<tr><td align="center" style="padding:2px 24px 0;font-size:12.5px;color:' + MUTED + ';">' + e(T.ref) + ' <b dir="ltr" style="font-family:' + MONO + ';color:' + NAVY + ';letter-spacing:.5px;">' + e(m.ref) + '</b> &nbsp;·&nbsp; ' + e(T.date) + ' <b dir="ltr" style="color:' + INK + ';">' + e(m.date) + '</b>' + alerts + '</td></tr>' :
  '<tr><td style="padding:18px 24px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-radius:16px;background:' + NAVY + ';background-image:linear-gradient(135deg,#21396A,' + NAVY + ' 55%,' + NAVY2 + ');"><tr>' +
    '<td style="padding:18px 20px;vertical-align:top;text-align:' + S + ';">' +
      '<div style="font-size:17px;font-weight:900;color:#FFFFFF;line-height:1.5;">' + e(nameBig) + '</div>' +
      (nameSmall ? '<div style="font-size:11px;letter-spacing:' + (RTL ? '1px' : '0') + ';color:rgba(255,255,255,.7);font-weight:700;margin-top:1px;">' + e(nameSmall) + '</div>' : '') +
      '<div style="font-size:13.5px;color:' + GOLD + ';font-weight:800;margin-top:8px;">' + e(m.jobTitle || '') + '</div>' +
      '<div style="font-size:12.5px;color:rgba(255,255,255,.78);margin-top:1px;">' + e(m.entity || '') + '</div>' +
    '</td></tr><tr><td style="padding:0 20px 16px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(210,176,116,.35);"><tr>' +
      '<td style="padding-top:12px;text-align:' + S + ';"><div style="font-size:11px;color:rgba(255,255,255,.6);font-weight:700;">' + e(T.ref) + '</div><div dir="ltr" style="text-align:' + S + ';font-family:' + MONO + ';font-size:16px;font-weight:700;letter-spacing:1px;color:' + GOLD + ';white-space:nowrap;">' + e(m.ref) + '</div></td>' +
      '<td align="' + E + '" style="padding-top:12px;"><div style="font-size:11px;color:rgba(255,255,255,.6);font-weight:700;">' + e(T.date) + '</div><div dir="ltr" style="font-size:13px;font-weight:700;color:#FFFFFF;">' + e(m.date) + '</div></td>' +
    '</tr></table></td></tr></table>' + alerts + '</td></tr>') +
  /* البيانات */
  '<tr><td style="padding:12px 18px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">' + grid + '</table></td></tr>' +
  /* المرفقات: قائمة منسدلة */
  (chips ? '<tr><td style="padding:8px 24px 0;"><details style="border:1px solid ' + LINE + ';border-radius:14px;background:#FBFCFD;">' +
    '<summary style="padding:12px 16px;font-size:14px;font-weight:800;color:' + NAVY + ';text-align:' + S + ';"><span style="display:inline-block;min-width:22px;height:22px;line-height:22px;text-align:center;border-radius:999px;background:#EEF7F1;color:#1E7A52;font-size:12px;margin-' + E + ':8px;">' + (m.files || []).length + '</span>' + e(T.files) + '<span class="chev" style="float:' + E + ';color:' + GOLD2 + ';font-size:12px;line-height:22px;display:inline-block;">▼</span></summary>' +
    '<div style="padding:4px 16px 10px;text-align:' + S + ';">' + chips + '</div></details></td></tr>' : '') +
  /* زر التحديث */
  '<tr><td align="center" style="padding:20px 24px 4px;">' +
    '<table role="presentation" cellpadding="0" cellspacing="0" align="center"><tr><td style="border-radius:12px;background:' + NAVY + ';background-image:linear-gradient(135deg,#21396A,' + NAVY2 + ');"><a href="' + e(m.formUrl) + '" style="display:inline-block;padding:12px 28px;font-family:' + FONT + ';font-size:14.5px;font-weight:800;color:#FFFFFF;text-decoration:none;">' + e(T.btn) + '</a></td></tr></table>' +
    '<p style="margin:10px 0 0;font-size:12px;line-height:1.8;color:' + MUTED + ';text-align:center;">' + e(T.note) + '</p>' +
  '</td></tr>' +
  /* الختام */
  '<tr><td align="center" style="padding:18px 24px 22px;"><div style="font-size:13.5px;color:' + INK + ';line-height:1.8;">' + e(T.regards) + '</div><div style="font-size:14.5px;font-weight:900;color:' + NAVY + ';">' + e(T.sign) + '</div></td></tr>' +
  /* التذييل وتوقيع المطوّر */
  '<tr><td align="center" style="background:#F6F7FA;border-top:1px solid ' + LINE + ';padding:14px 24px 16px;">' +
    '<p style="margin:0 0 8px;font-size:11.5px;line-height:1.8;color:' + MUTED + ';">' + e(T.auto) + '</p>' +
    '<a href="mailto:' + e(m.devEmail) + '" style="display:inline-block;padding:4px 11px;border-radius:999px;background:#FFF1E6;border:1px solid #F5C9A3;color:#B4570F;font-size:11.5px;font-weight:800;text-decoration:none;white-space:nowrap;">' + e(T.dev) + ' · <span dir="ltr">' + e(m.devEmail) + '</span></a>' +
    '<div style="margin-top:8px;font-size:11px;color:#9AA5B6;">' + e(String(T.copy).replace('{y}', m.year)) + '</div>' +
  '</td></tr>' +
  '</table></td></tr></table></body></html>';
}

/* ============================================================ أدوات */
function col_(key) {
  for (var i = 0; i < MAIN_COLS.length; i++) if (MAIN_COLS[i][0] === key) return i + 1;
  return 0;
}
function colLetter_(n) {
  var s = '';
  while (n > 0) { var m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); }
  return s;
}
function normalize_(v) { return String(v || '').replace(/\s/g, '').toUpperCase(); }
function cc_(v) { v = String(v || '').trim().toUpperCase(); return /^[A-Z]{2}$/.test(v) ? v : ''; }
function safeText_(v) { v = String(v == null ? '' : v).replace(/[ \t\u00a0]+/g, ' ').replace(/ ?\n ?/g, '\n').trim(); return /^[=+\-@]/.test(v) ? "'" + v : v; }
function digits_(v) { return String(v || '').replace(/\D/g, ''); }
function escHtml_(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
/* يضمن وجود صفوف كافية؛ الإدراج داخل النطاق يوسّع التنسيقات والقواعد الشرطية تلقائيًا */
function ensureRows_(sh, upto) {
  var max = sh.getMaxRows();
  if (upto <= max) return;
  var add = Math.max(200, upto - max);
  if (max >= 3) sh.insertRowsAfter(max - 1, add); else sh.insertRowsAfter(max, add);
}
function rowFormats_() {
  return MAIN_COLS.map(function (c) { return c[2] === 'd' ? 'yyyy-mm-dd' : (c[2] === 'n' ? '#,##0' : '@'); });
}
function fmtNow_(d) { return Utilities.formatDate(d, 'Asia/Riyadh', 'yyyy-MM-dd HH:mm'); }

function findRow_(sh, key, test) {
  var last = sh.getLastRow();
  if (last < 2) return 0;
  var vals = sh.getRange(2, col_(key), last - 1, 1).getValues();
  for (var i = 0; i < vals.length; i++) if (test(vals[i][0])) return i + 2;
  return 0;
}
function rowOf_(sh, ref) {
  var cached = CacheService.getScriptCache().get('row_' + ref);
  if (cached && sh.getRange(+cached, col_('ref')).getValue() === ref) return +cached;
  var r = findRow_(sh, 'ref', function (v) { return v === ref; });
  if (!r) throw new Error('الرقم المرجعي غير موجود');
  return r;
}
function checkToken_(ref, token) {
  var t = CacheService.getScriptCache().get('tok_' + ref);
  if (!t || t !== token) throw new Error('انتهت صلاحية جلسة الرفع، أعد الإرسال');
}

function nextRef_(cc) {
  var props = PropertiesService.getScriptProperties();
  var year = new Date().getFullYear();
  var key = 'SEQ_' + year;
  var n = (+props.getProperty(key) || 0) + 1;
  props.setProperty(key, String(n));
  return CONFIG.REF_PREFIX + '-' + String(cc || 'XX').toUpperCase() + '-' + year + '-' + ('0000' + n).slice(-4);
}

/* أسماء المجلدات بالعربية: مجلد الدولة «السعودية»، ومجلد المنسوب «الرقم المرجعي · الاسم بالعربية» */
function folderName_(ref, ar) {
  var nm = String(ar.fullNameAr || ar.fullNameLatin || '').replace(/[\\\/:*?"<>|\n\r]+/g, '-').replace(/\s+/g, ' ').trim();
  return ref + (nm ? ' · ' + nm : '');
}
function employeeFolder_(ref, ar) {
  var root = getRoot_(false);
  var countryName = ar.workCountry || 'غير محدد';
  var it = root.getFoldersByName(countryName), country = it.hasNext() ? it.next() : null;
  if (!country && ar.workCountryEn) {
    var old = root.getFoldersByName(countryName + ' · ' + ar.workCountryEn);
    if (old.hasNext()) { country = old.next(); country.setName(countryName); }
  }
  if (!country) country = root.createFolder(countryName);
  return country.createFolder(folderName_(ref, ar));
}

function replaceChildRows_(sh, ref, rows) {
  var last = sh.getLastRow();
  if (last >= 2) {
    var refs = sh.getRange(2, 1, last - 1, 1).getValues();
    for (var i = refs.length - 1; i >= 0; i--) if (refs[i][0] === ref) sh.deleteRow(i + 2);
  }
  if (rows.length) {
    var start = sh.getLastRow() + 1;
    ensureRows_(sh, start + rows.length - 1);
    sh.getRange(start, 1, rows.length, rows[0].length).setNumberFormat('@').setValues(rows.map(function (r) { return r.map(safeText_); }));
  }
}

function topDegree_(quals) {
  var best = '', rank = 0;
  (quals || []).forEach(function (q) {
    var r = DEGREE_RANK[q.degree] || 0;
    if (r > rank) { rank = r; best = q.degree + (q.major ? ' · ' + q.major : ''); }
  });
  return best;
}

function log_(ref, action, detail) {
  try {
    var sh = getSS_(false).getSheetByName(CONFIG.SHEETS.log);
    if (sh) sh.appendRow([fmtNow_(new Date()), ref, action, String(detail || '').slice(0, 500)]);
  } catch (e) { }
}

function notify_(sh, row, ref, updated) {
  var to = PropertiesService.getScriptProperties().getProperty('HR_EMAIL');
  if (!to) return;
  try {
    var get = function (k) { return escHtml_(sh.getRange(row, col_(k)).getDisplayValue()); };
    var plainName = sh.getRange(row, col_('fullNameLatin')).getDisplayValue();
    var subject = (updated ? 'تحديث بيانات: ' : 'تسجيل جديد: ') + plainName + ' · ' + ref;
    var html = '<div dir="rtl" style="font-family:Tahoma,Arial;font-size:14px;color:#0F2238">' +
      '<p style="color:#9C7432;margin:0">Bonyan HR · سجل المنسوبين</p>' +
      '<h2 style="margin:6px 0 14px;color:#143D66">' + escHtml_(subject) + '</h2><table cellpadding="6" style="border-collapse:collapse">' +
      [['الرقم المرجعي', ref], ['الاسم', get('fullNameLatin')], ['الجهة', get('entity')], ['دولة العمل', get('workCountry')],
       ['المسمى', get('jobTitle')], ['الجوال', get('mobile')], ['انتهاء الجواز', get('passportExpiry')]].map(function (r) {
        return '<tr><td style="color:#4B5B6E">' + r[0] + '</td><td><b>' + r[1] + '</b></td></tr>';
      }).join('') + '</table><p><a href="' + getSS_(false).getUrl() + '">فتح السجل</a></p></div>';
    MailApp.sendEmail({ to: to, subject: subject, htmlBody: html, name: 'Bonyan HR' });
  } catch (e) { log_(ref, 'تعذّر إرسال التنبيه', String(e)); }
}
