/**
 * ============================================================
 *  Bonyan HR · نقل البيانات من Google إلى الخادم الجديد (hr.bonyanglobal.com)
 * ============================================================
 *  يُضاف هذا الملف بجانب Code.gs في مشروع Apps Script نفسه، ويُشغَّل مرة واحدة.
 *  البيانات تنتقل مباشرة من Google إلى خادم بنيان (لا تمر بأي طرف ثالث).
 *
 *  الخطوات:
 *   ١) «إعدادات المشروع» ← «خصائص النص البرمجي» ← «إضافة خاصية»:
 *        الاسم: IMPORT_TOKEN    القيمة: نفس قيمة import_token في ملف الإعدادات على الخادم
 *   ٢) اختر الدالة migrateToHostinger ثم «تشغيل». إن ظهرت رسالة «تبقّى …» شغّلها مرة أخرى
 *      (تكمل من حيث توقفت، ولا تكرر ما نُقل).
 *   ٣) اختر الدالة migrateVerify ثم «تشغيل»: تقارن كل عمود وكل ملف بين الجدول والخادم.
 *   ٤) بعد التحقق: احذف الخاصية IMPORT_TOKEN، وأفرغ import_token في ملف الإعدادات على الخادم.
 * ============================================================
 */
var MIGRATE_URL = 'https://hr.bonyanglobal.com/api/';
var MIGRATE_MAX_MS = 4.5 * 60 * 1000; // يتوقف قبل حد التشغيل (٦ دقائق) ويكمل في التشغيل التالي
var MIGRATE_MAX_FILE = 11 * 1024 * 1024;

function mProps_() { return PropertiesService.getScriptProperties(); }
function mPost_(o) {
  var token = mProps_().getProperty('IMPORT_TOKEN') || '';
  if (token.length < 24) throw new Error('أضف الخاصية IMPORT_TOKEN أولًا (٢٤ حرفًا أو أكثر) من «إعدادات المشروع».');
  o.importToken = token;
  var r = UrlFetchApp.fetch(MIGRATE_URL, { method: 'post', contentType: 'text/plain;charset=utf-8', payload: JSON.stringify(o), muteHttpExceptions: true, followRedirects: true });
  var t = r.getContentText(), j;
  try { j = JSON.parse(t); } catch (e) { throw new Error('ردّ غير متوقع من الخادم (HTTP ' + r.getResponseCode() + '): ' + t.slice(0, 160)); }
  if (!j.ok) throw new Error(o.action + ': ' + j.error);
  return j;
}
function mDate_(v, disp) {
  if (Object.prototype.toString.call(v) === '[object Date]' && !isNaN(v)) return Utilities.formatDate(v, 'Asia/Riyadh', 'yyyy-MM-dd');
  return String(disp || '').trim();
}
function mFileId_(u) { var m = /\/d\/([\w-]+)|[?&]id=([\w-]+)/.exec(u || ''); return m ? (m[1] || m[2]) : ''; }

/* يقرأ كل المنسوبين من الجدول كما هم */
function mRead_() {
  var ss = getSS_(false), sh = ss.getSheetByName(CONFIG.SHEETS.main), last = sh.getLastRow();
  if (last < 2) return [];
  var n = MAIN_COLS.length, vals = sh.getRange(2, 1, last - 1, n).getValues(), disp = sh.getRange(2, 1, last - 1, n).getDisplayValues();
  var rich = {};
  MAIN_COLS.forEach(function (c, j) { if (c[2] === 'f') rich[c[0]] = sh.getRange(2, j + 1, last - 1, 1).getRichTextValues(); });
  var kids = {};
  [['quals', CONFIG.SHEETS.quals], ['exp', CONFIG.SHEETS.exp], ['langs', CONFIG.SHEETS.langs]].forEach(function (k) {
    var c = ss.getSheetByName(k[1]), m = c ? c.getLastRow() : 0;
    if (m < 2) return;
    c.getRange(2, 1, m - 1, c.getLastColumn()).getDisplayValues().forEach(function (r) {
      var ref = String(r[0] || '').trim(); if (!ref) return;
      ((kids[ref] = kids[ref] || {})[k[0]] = kids[ref][k[0]] || []).push(r.slice(2));
    });
  });
  var out = [];
  for (var i = 0; i < vals.length; i++) {
    var data = {}, files = {}, ref = '', status = '', createdAt = '', updatedAt = '';
    MAIN_COLS.forEach(function (c, j) {
      var k = c[0], t = c[2], v = vals[i][j], d = disp[i][j];
      if (k === 'ref') ref = String(d).trim();
      else if (k === 'status') status = String(d).trim();
      else if (k === 'createdAt') createdAt = String(d).trim();
      else if (k === 'updatedAt') updatedAt = String(d).trim();
      else if (t === 'f') { files[k] = linksOf_(rich[k][i][0]); data[k] = files[k].length ? '' : String(d).trim(); }
      else if (t === 'd') data[k] = mDate_(v, d);
      else if (t === 'n') data[k] = (typeof v === 'number') ? String(v) : String(d).trim();
      else data[k] = String(d);
    });
    if (!ref) continue;
    var kd = kids[ref] || {};
    out.push({ ref: ref, status: status, createdAt: createdAt, updatedAt: updatedAt, data: data, files: files, quals: kd.quals || [], exp: kd.exp || [], langs: kd.langs || [] });
  }
  return out;
}

/* ١) النقل — يمكن تشغيله أكثر من مرة */
function migrateToHostinger() {
  var t0 = Date.now(), P = mProps_();
  var done = JSON.parse(P.getProperty('MIG_DONE') || '{}');
  var rows = mRead_(), moved = 0, nFiles = 0, skipped = [];
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (done[r.ref]) continue;
    if (Date.now() - t0 > MIGRATE_MAX_MS) break;
    mPost_({ action: 'importRow', row: { ref: r.ref, status: r.status, createdAt: r.createdAt, updatedAt: r.updatedAt, data: r.data, quals: r.quals, exp: r.exp, langs: r.langs } });
    Object.keys(r.files).forEach(function (kind) {
      r.files[kind].forEach(function (u, idx) {
        var id = mFileId_(u); if (!id) { skipped.push(r.ref + ' · ' + kind + ' (رابط غير مفهوم)'); return; }
        try {
          var f = DriveApp.getFileById(id);
          if (f.getSize() > MIGRATE_MAX_FILE) { skipped.push(r.ref + ' · ' + kind + ' (أكبر من ١١ ميغابايت)'); return; }
          var blob = f.getBlob();
          mPost_({ action: 'importFile', ref: r.ref, kind: kind, idx: idx + 1, name: f.getName(), data: Utilities.base64Encode(blob.getBytes()) });
          nFiles++;
        } catch (e) { skipped.push(r.ref + ' · ' + kind + ' (' + e.message + ')'); }
      });
    });
    done[r.ref] = new Date().toISOString();
    P.setProperty('MIG_DONE', JSON.stringify(done));
    moved++;
  }
  if (!P.getProperty('MIG_AUDIT') && Date.now() - t0 < MIGRATE_MAX_MS) {
    var lg = getSS_(false).getSheetByName(CONFIG.SHEETS.log), n = lg ? lg.getLastRow() : 0;
    if (n >= 2) {
      var all = lg.getRange(2, 1, n - 1, 4).getDisplayValues();
      for (var s = 0; s < all.length; s += 300) mPost_({ action: 'importAudit', rows: all.slice(s, s + 300) });
    }
    mPost_({ action: 'importMailed', mailed: JSON.parse(P.getProperty('MAILED') || '{}') });
    P.setProperty('MIG_AUDIT', '1');
  }
  var left = rows.filter(function (r) { return !done[r.ref]; }).length;
  Logger.log('نُقل الآن: ' + moved + ' منسوبًا و' + nFiles + ' ملفًا.');
  if (skipped.length) Logger.log('⚠️ ملفات لم تُنقل:\n' + skipped.join('\n'));
  Logger.log(left ? '⏳ تبقّى ' + left + ' منسوبًا — شغّل migrateToHostinger مرة أخرى.' : '✅ اكتمل النقل. شغّل الآن migrateVerify للتحقق.');
}

/* ٢) التحقق: يقارن كل عمود وكل ملف وكل صف فرعي بين الجدول والخادم */
function migrateVerify() {
  var rows = mRead_(), srv = mPost_({ action: 'importStats' }).rows || {};
  var norm = function (v) { return String(v == null ? '' : v).replace(/[٠-٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); }).replace(/[\s,'’]/g, '').toLowerCase(); };
  var titles = {}; MAIN_COLS.forEach(function (c) { titles[c[0]] = c[1]; });
  var okRows = 0, report = [];
  rows.forEach(function (r) {
    var s = srv[r.ref], bad = [];
    if (!s) { report.push('❌ ' + r.ref + ': غير موجود على الخادم'); return; }
    MAIN_COLS.forEach(function (c) {
      var k = c[0], t = c[2];
      if (['ref', 'status', 'createdAt', 'updatedAt', 'folder', 'folderId'].indexOf(k) > -1) return;
      if (t === 'f') {
        var want = (r.files[k] || []).length, got = (s.files && s.files[k]) || 0;
        if (want !== got) bad.push(titles[k] + ' (ملفات: ' + want + ' ← ' + got + ')');
        return;
      }
      var a = norm(r.data[k]), b = norm(s.data[k]);
      if (t === 'n') { a = a.replace(/\.0+$/, ''); b = b.replace(/\.0+$/, ''); }
      if (a !== b) bad.push(titles[k]);
    });
    ['quals', 'exp', 'langs'].forEach(function (k) {
      var a = r[k].filter(function (x) { return x.join('') !== ''; }).length, b = (s.kids[k] || []).length;
      if (a !== b) bad.push({ quals: 'المؤهلات', exp: 'الخبرات', langs: 'اللغات' }[k] + ' (' + a + ' ← ' + b + ')');
    });
    if (bad.length) report.push('⚠️ ' + r.ref + ': ' + bad.join('، ')); else okRows++;
  });
  var extra = Object.keys(srv).filter(function (ref) { return !rows.some(function (r) { return r.ref === ref; }); });
  Logger.log('النتيجة: ' + okRows + ' من ' + rows.length + ' منسوبًا مطابق تمامًا في كل الأعمدة والملفات.');
  if (report.length) Logger.log(report.join('\n'));
  if (extra.length) Logger.log('سجلات على الخادم غير موجودة في الجدول (تسجيلات جديدة بعد النقل): ' + extra.join('، '));
}

/* لإعادة النقل من البداية (نادرًا ما تحتاجه) */
function migrateReset() { mProps_().deleteProperty('MIG_DONE'); mProps_().deleteProperty('MIG_AUDIT'); Logger.log('تمت إعادة الضبط.'); }
