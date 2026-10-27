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
  var u = linksOf_(sh.getRange(row, col_('photo')).getRichTextValue())[0] || '';
  var m = /\/d\/([\w-]+)|[?&]id=([\w-]+)/.exec(u);
  if (!m) return { ok: true, none: true };
  var f = DriveApp.getFileById(m[1] || m[2]);
  var blob = f.getSize() > 2500000 ? f.getThumbnail() : f.getBlob();
  if (!blob) return { ok: true, none: true };
  return { ok: true, mime: blob.getContentType() || 'image/jpeg', b64: Utilities.base64Encode(blob.getBytes()) };
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
  sh.getRange(row, col_('status')).setValue(updated ? 'محدَّث' : 'مكتمل');
  cache.remove('countries');
  cache.remove('tok_' + b.ref);
  cache.put('done_' + b.ref, b.token, 3600);
  log_(b.ref, 'اكتمل الرفع', '');
  notify_(sh, row, b.ref, updated);
  return { ok: true };
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
