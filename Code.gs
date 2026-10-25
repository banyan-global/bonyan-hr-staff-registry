/**
 * ============================================================
 *  Bonyan HR · Global Staff Registry — خادم Google Apps Script
 * ============================================================
 *  يستقبل بيانات النموذج من الموقع (GitHub Pages) ويحفظها في:
 *   - جدول Google Sheets: «Bonyan HR · سجل المنسوبين 2026»
 *   - مجلد Drive: «Bonyan HR · ملفات المنسوبين / الدولة / الرقم المرجعي · الاسم»
 *
 *  خطوات التشغيل مذكورة في README.md
 *  ١) شغّل الدالة setup مرة واحدة.
 *  ٢) انشر المشروع كتطبيق ويب، وانسخ الرابط إلى assets/js/config.js
 * ============================================================
 */

var CONFIG = {
  SS_TITLE: 'Bonyan HR · سجل المنسوبين 2026',
  ROOT_FOLDER: 'Bonyan HR · ملفات المنسوبين',
  REF_PREFIX: 'BNY-HR',
  SHEETS: { main: 'المنسوبون', quals: 'المؤهلات', exp: 'الخبرات', langs: 'اللغات', log: 'السجل' },
  COLORS: { navy: '#143D66', brass: '#9C7432', band: '#F3F5F8', white: '#FFFFFF', ink: '#0F2238' },
  FONT: 'IBM Plex Sans Arabic',
  TOKEN_TTL: 21600 // ٦ ساعات لإكمال رفع المرفقات
};

/* أعمدة الورقة الرئيسية: [المفتاح، العنوان، النوع]
   النوع: t نص، d تاريخ، f ملف، s نظام */
var MAIN_COLS = [
  ['ref', 'الرقم المرجعي', 's'], ['status', 'الحالة', 's'], ['createdAt', 'تاريخ التسجيل', 's'], ['updatedAt', 'آخر تحديث', 's'],
  ['folder', 'مجلد المرفقات', 's'],
  ['fullNameLatin', 'الاسم كما في الجواز', 't'], ['fullNameAr', 'الاسم بالعربية', 't'], ['gender', 'الجنس', 't'],
  ['birthDate', 'تاريخ الميلاد', 'd'], ['birthCountry', 'دولة الميلاد', 't'], ['birthCity', 'مدينة الميلاد', 't'],
  ['nationality', 'الجنسية', 't'], ['secondNationality', 'جنسية ثانية', 't'], ['workCountry', 'دولة العمل', 't'],
  ['maritalStatus', 'الحالة الاجتماعية', 't'], ['dependents', 'عدد المعالين', 't'], ['bloodType', 'فصيلة الدم', 't'],
  ['passportNo', 'رقم الجواز', 't'], ['passportCountry', 'بلد إصدار الجواز', 't'], ['passportIssue', 'إصدار الجواز', 'd'], ['passportExpiry', 'انتهاء الجواز', 'd'],
  ['nationalIdNo', 'رقم الهوية الوطنية', 't'], ['nationalIdExpiry', 'انتهاء الهوية', 'd'],
  ['permitType', 'نوع الإقامة/التصريح', 't'], ['permitNo', 'رقم الإقامة/التصريح', 't'], ['permitOccupation', 'المهنة في الإقامة', 't'],
  ['permitIssue', 'إصدار الإقامة', 'd'], ['permitExpiry', 'انتهاء الإقامة', 'd'],
  ['officialEmail', 'البريد الرسمي', 't'], ['personalEmail', 'البريد الشخصي', 't'], ['mobile', 'الجوال', 't'], ['whatsapp', 'الواتساب', 't'],
  ['addrCountry', 'دولة السكن', 't'], ['addrRegion', 'المنطقة', 't'], ['addrCity', 'المدينة', 't'], ['addrDistrict', 'الحي', 't'],
  ['addrStreet', 'الشارع', 't'], ['addrPostal', 'الرمز البريدي', 't'], ['addrBuilding', 'رقم المبنى', 't'], ['addrAdditional', 'الرقم الإضافي', 't'], ['addrShort', 'العنوان المختصر', 't'],
  ['homeCountry', 'دولة العنوان الدائم', 't'], ['homeCity', 'مدينة العنوان الدائم', 't'], ['homeAddress', 'العنوان الدائم', 't'],
  ['em1Name', 'طوارئ ١: الاسم', 't'], ['em1Relation', 'طوارئ ١: الصلة', 't'], ['em1Phone', 'طوارئ ١: الجوال', 't'],
  ['em2Name', 'طوارئ ٢: الاسم', 't'], ['em2Relation', 'طوارئ ٢: الصلة', 't'], ['em2Phone', 'طوارئ ٢: الجوال', 't'],
  ['entity', 'الجهة', 't'], ['workOffice', 'المكتب/المدينة', 't'], ['department', 'الإدارة/القسم', 't'], ['jobTitle', 'المسمى الوظيفي', 't'],
  ['manager', 'المدير المباشر', 't'], ['employeeNo', 'الرقم الوظيفي', 't'], ['startDate', 'تاريخ المباشرة', 'd'], ['employmentType', 'نوع الارتباط', 't'],
  ['contractStatus', 'عقد العمل', 't'], ['contractType', 'نوع العقد', 't'], ['contractNo', 'رقم العقد', 't'], ['contractStart', 'بداية العقد', 'd'], ['contractEnd', 'نهاية العقد', 'd'],
  ['topDegree', 'أعلى مؤهل', 't'], ['techSkills', 'المهارات التقنية', 't'], ['certifications', 'الدورات والشهادات', 't'], ['quran', 'الحفظ من القرآن', 't'],
  ['payMethod', 'طريقة استلام الراتب', 't'], ['bankCountry', 'دولة البنك', 't'], ['bankName', 'البنك', 't'], ['accountHolder', 'صاحب الحساب', 't'],
  ['iban', 'الآيبان', 't'], ['accountNo', 'رقم الحساب', 't'], ['swift', 'SWIFT', 't'], ['bankBranch', 'الفرع', 't'],
  ['walletProvider', 'مزوّد المحفظة', 't'], ['walletNo', 'رقم المحفظة', 't'], ['payOther', 'طريقة أخرى', 't'], ['currency', 'العملة', 't'],
  ['photo', 'الصورة الشخصية', 'f'], ['passportScan', 'صورة الجواز', 'f'], ['nationalIdScan', 'صورة الهوية', 'f'], ['permitScan', 'صورة الإقامة', 'f'],
  ['contractFile', 'ملف العقد', 'f'], ['degreeFile', 'الشهادة', 'f'], ['bankProof', 'إثبات الحساب', 'f'],
  ['lang', 'لغة التعبئة', 's'], ['tz', 'المنطقة الزمنية', 's'], ['folderId', 'معرّف المجلد', 's']
];
var EXPIRY_KEYS = ['passportExpiry', 'nationalIdExpiry', 'permitExpiry', 'contractEnd'];
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

function ensureSheets_(ss) {
  var S = CONFIG.SHEETS;
  var main = prepSheet_(ss, S.main, MAIN_COLS.map(function (c) { return c[1]; }), 160);
  if (!main.getRange(1, 1).getNote()) {
    MAIN_COLS.forEach(function (c, i) {
      var col = i + 1, body = main.getRange(2, col, main.getMaxRows() - 1, 1);
      if (c[2] === 'd') body.setNumberFormat('yyyy-mm-dd');
      else body.setNumberFormat('@');
      if (c[2] === 'f') main.getRange(1, col).setBackground(CONFIG.COLORS.brass);
      if (c[2] === 's' && c[0] !== 'ref' && c[0] !== 'status') main.getRange(1, col).setBackground('#3B5878');
    });
    main.setColumnWidth(col_('ref'), 190);
    main.setColumnWidth(col_('fullNameLatin'), 230);
    main.setColumnWidth(col_('folder'), 110);
    main.hideColumns(col_('folderId'));
    main.setFrozenColumns(col_('fullNameLatin'));
    addExpiryRules_(main);
    main.getRange(1, 1).setNote('Bonyan HR · Global Staff Registry');
  }
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
function doGet() {
  return json_({ ok: true, service: 'Bonyan HR · Global Staff Registry' });
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    if (body.action === 'submit') return json_(submit_(body.payload));
    if (body.action === 'upload') return json_(upload_(body));
    if (body.action === 'finalize') return json_(finalize_(body));
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
    var updated = rowIdx > 0;
    var ref, folder;

    if (updated) {
      ref = sh.getRange(rowIdx, col_('ref')).getValue();
      var fid = sh.getRange(rowIdx, col_('folderId')).getValue();
      try { folder = DriveApp.getFolderById(fid); } catch (e2) { folder = null; }
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
      }
      if (c[2] === 'f') return updated ? sh.getRange(rowIdx, col_(k)).getValue() : '';
      if (c[2] === 'd') return raw[k] ? new Date(raw[k] + 'T12:00:00') : '';
      var v = ar[k] != null ? ar[k] : (raw[k] != null ? raw[k] : '');
      return Array.isArray(v) ? '' : String(v);
    });

    if (!updated) {
      rowIdx = sh.getLastRow() + 1;
    }
    sh.getRange(rowIdx, 1, 1, vals.length).setValues([vals]);
    sh.getRange(rowIdx, col_('folder')).setFormula('=HYPERLINK("' + folder.getUrl() + '","فتح المجلد")');

    var name = ar.fullNameLatin || '';
    replaceChildRows_(ss.getSheetByName(CONFIG.SHEETS.quals), ref, (ar.qualifications || []).map(function (q) {
      return [ref, name, q.degree || '', q.major || '', q.institution || '', q.country || '', q.gradYear || '', q.grade || ''];
    }));
    replaceChildRows_(ss.getSheetByName(CONFIG.SHEETS.exp), ref, (ar.experience || []).map(function (x) {
      return [ref, name, x.org || '', x.title || '', x.country || '', x.from || '', x.to || ''];
    }));
    replaceChildRows_(ss.getSheetByName(CONFIG.SHEETS.langs), ref, (ar.languages || []).map(function (l) {
      return [ref, name, l.language || '', l.level || ''];
    }));

    var token = Utilities.getUuid();
    var cache = CacheService.getScriptCache();
    cache.put('tok_' + ref, token, CONFIG.TOKEN_TTL);
    cache.put('row_' + ref, String(rowIdx), CONFIG.TOKEN_TTL);
    cache.put('upd_' + ref, updated ? '1' : '', CONFIG.TOKEN_TTL);
    log_(ref, updated ? 'تحديث بيانات' : 'تسجيل جديد', name + ' · ' + (ar.workCountry || ''));
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
  var fname = b.ref + '_' + b.label + (b.total > 1 ? '_' + b.idx : '') + '.' + ext;
  var cache = CacheService.getScriptCache();
  var listKey = 'f_' + b.ref + '_' + b.kind;

  if (b.idx === 1) {
    var old = folder.getFiles();
    while (old.hasNext()) {
      var f0 = old.next();
      if (f0.getName().indexOf(b.ref + '_' + b.label) === 0) f0.setTrashed(true);
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
  checkToken_(b.ref, b.token);
  var ss = getSS_(false), sh = ss.getSheetByName(CONFIG.SHEETS.main);
  var row = rowOf_(sh, b.ref);
  var cache = CacheService.getScriptCache();
  var updated = cache.get('upd_' + b.ref) === '1';
  sh.getRange(row, col_('status')).setValue(updated ? 'محدَّث' : 'مكتمل');
  cache.remove('tok_' + b.ref);
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

function employeeFolder_(ref, ar) {
  var root = getRoot_(false);
  var countryName = (ar.workCountry || 'غير محدد') + (ar.workCountryEn ? ' · ' + ar.workCountryEn : '');
  var it = root.getFoldersByName(countryName);
  var country = it.hasNext() ? it.next() : root.createFolder(countryName);
  return country.createFolder(ref + ' · ' + (ar.fullNameLatin || ''));
}

function replaceChildRows_(sh, ref, rows) {
  var last = sh.getLastRow();
  if (last >= 2) {
    var refs = sh.getRange(2, 1, last - 1, 1).getValues();
    for (var i = refs.length - 1; i >= 0; i--) if (refs[i][0] === ref) sh.deleteRow(i + 2);
  }
  if (rows.length) sh.getRange(sh.getLastRow() + 1, 1, rows.length, rows[0].length).setNumberFormat('@').setValues(rows);
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
    var get = function (k) { return sh.getRange(row, col_(k)).getDisplayValue(); };
    var subject = (updated ? 'تحديث بيانات: ' : 'تسجيل جديد: ') + get('fullNameLatin') + ' · ' + ref;
    var html = '<div dir="rtl" style="font-family:Tahoma,Arial;font-size:14px;color:#0F2238">' +
      '<p style="color:#9C7432;margin:0">Bonyan HR · سجل المنسوبين</p>' +
      '<h2 style="margin:6px 0 14px;color:#143D66">' + subject + '</h2><table cellpadding="6" style="border-collapse:collapse">' +
      [['الرقم المرجعي', ref], ['الاسم', get('fullNameLatin')], ['الجهة', get('entity')], ['دولة العمل', get('workCountry')],
       ['المسمى', get('jobTitle')], ['الجوال', get('mobile')], ['انتهاء الجواز', get('passportExpiry')]].map(function (r) {
        return '<tr><td style="color:#4B5B6E">' + r[0] + '</td><td><b>' + r[1] + '</b></td></tr>';
      }).join('') + '</table><p><a href="' + getSS_(false).getUrl() + '">فتح السجل</a></p></div>';
    MailApp.sendEmail({ to: to, subject: subject, htmlBody: html, name: 'Bonyan HR' });
  } catch (e) { log_(ref, 'تعذّر إرسال التنبيه', String(e)); }
}
