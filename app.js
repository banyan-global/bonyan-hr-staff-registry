/* ============================================================
   Bonyan HR · Global Staff Registry — منطق النموذج
   ============================================================ */
(function () {
  'use strict';

  var CFG = window.APP_CONFIG;
  var DICT = window.I18N;
  var COUNTRIES = window.COUNTRIES;
  var IBAN_LEN = window.IBAN_LENGTHS || {};
  var LS_KEY = 'bonyan-hr-registry-draft-v1';
  var LANG_IDX = { ar: 1, en: 2, id: 3 };
  var CMAP = {};
  COUNTRIES.forEach(function (c) { CMAP[c[0]] = c; });
  var DEMO = !CFG.GAS_URL;
  /* وضع المعاينة: تنقّل حر بين الخطوات دون تعبئة، مع إظهار الأسئلة المشروطة */
  var PREVIEW = DEMO;
  var CURRENCIES = ['SAR', 'USD', 'EUR', 'EGP', 'IDR', 'KES', 'ETB', 'AED', 'GBP', 'TZS', 'UGX', 'NGN', 'PKR', 'MYR', 'other'];

  /* ---------------------------------------------------------- الحالة */
  var state = {
    lang: CFG.DEFAULT_LANG,
    view: 'welcome',
    step: 0,
    maxStep: 0,
    data: { qualifications: [{}], experience: [], languages: [{}], certs: [{}], waSame: 'yes', hasOtherNat: 'no', startDiff: 'no' },
    files: {},
    errors: {},
    checked: {},
    result: null
  };

  /* ---------------------------------------------------------- أدوات */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function arDigits(s) { return String(s).replace(/\d/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'[d]; }); }
  function tl(lang, key, vars) {
    var s = (DICT[lang] && DICT[lang][key]) || DICT.ar[key] || key;
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        var v = vars[k];
        if (lang === 'ar' && typeof v === 'number') v = arDigits(v);
        s = s.split('{' + k + '}').join(v);
      });
    }
    return s;
  }
  function t(key, vars) { return tl(state.lang, key, vars); }
  function cname(cc, lang) { var c = CMAP[cc]; return c ? c[LANG_IDX[lang || state.lang]] : ''; }
  function dialOf(cc) { var c = CMAP[cc]; return c ? c[4] : ''; }
  function flag(cc) {
    return cc && /^[A-Z]{2}$/i.test(cc) ? '<img class="flag" src="https://flagcdn.com/w40/' + cc.toLowerCase() + '.png" alt="" width="20" height="15" loading="lazy">' : '';
  }
  function locale(lang) { return lang === 'ar' ? 'ar-u-ca-gregory-nu-arab' : (lang === 'id' ? 'id-ID' : 'en-GB'); }
  function fmtDate(iso, lang) {
    if (!iso) return '';
    var d = new Date(iso + 'T00:00:00');
    if (isNaN(d)) return iso;
    try { return new Intl.DateTimeFormat(locale(lang || state.lang), { year: 'numeric', month: 'long', day: 'numeric' }).format(d); }
    catch (e) { return iso; }
  }
  function hijri(iso) {
    if (!iso) return '';
    try {
      var loc = state.lang === 'ar' ? 'ar-SA-u-ca-islamic-umalqura' : 'en-u-ca-islamic-umalqura';
      return new Intl.DateTimeFormat(loc, { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(iso + 'T00:00:00'));
    } catch (e) { return ''; }
  }
  function today() { var d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function daysUntil(iso) { return Math.round((new Date(iso + 'T00:00:00') - today()) / 86400000); }
  function yearsBetween(iso) {
    var b = new Date(iso + 'T00:00:00'), n = today();
    var y = n.getFullYear() - b.getFullYear();
    if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) y--;
    return y;
  }
  function debounce(fn, ms) { var h; return function () { clearTimeout(h); h = setTimeout(fn, ms); }; }

  /* ---------------------------------------------------------- الشروط */
  var C = {
    abroad: function (d) {
      if (!(d.nationality && d.workCountry) || d.nationality === d.workCountry) return false;
      if (d.hasOtherNat === 'yes' && d.otherNationality === d.workCountry) return false;
      return true;
    },
    addrSA: function (d) { return (d.addrCountry || d.workCountry) === 'SA'; },
    hasDeps: function (d) { return ['married', 'divorced', 'widowed'].indexOf(d.maritalStatus) > -1; },
    contract: function (d) { return d.hasContract === 'yes'; },
    noContract: function (d) { return d.hasContract === 'no'; },
    waDiff: function (d) { return d.waSame === 'no'; },
    bank: function (d) { return d.payMethod === 'bank'; },
    payOther: function (d) { return d.payMethod === 'other'; },
    iban: function (d) { return d.payMethod === 'bank' && !!IBAN_LEN[d.bankCountry]; },
    noIban: function (d) { return d.payMethod === 'bank' && !!d.bankCountry && !IBAN_LEN[d.bankCountry]; },
    currencyOther: function (d) { return d.currency === 'other'; },
    paid: function (d) { return d.employmentType !== 'volunteer'; },
    otherNat: function (d) { return d.hasOtherNat === 'yes'; },
    female: function (d) { return d.gender === 'female'; },
    notFemale: function (d) { return d.gender !== 'female'; },
    startDiff: function (d) { return (d.hasContract === 'yes' && d.startDiff === 'yes') || d.hasContract === 'no'; },
    contractAsk: function (d) { return d.hasContract === 'yes'; },
    certs: function (d) { return d.hasCerts === 'yes'; },
    /* مواطنو دول الخليج العاملون في دولة خليجية أخرى لا يحتاجون إقامة ولا تصريح عمل */
    needPermit: function (d) { var G = ['SA', 'AE', 'KW', 'BH', 'QA', 'OM']; return C.abroad(d) && !(G.indexOf(d.workCountry) > -1 && (G.indexOf(d.nationality) > -1 || (d.hasOtherNat === 'yes' && G.indexOf(d.otherNationality) > -1))); },
    abroadNotSA: function (d) { return C.needPermit(d) && d.workCountry !== 'SA'; },
    abroadSA: function (d) { return C.needPermit(d) && d.workCountry === 'SA'; },
    wc: function (cc) { return function (d) { return d.workCountry === cc; }; },
    wcAny: function (list) { return function (d) { return list.indexOf(d.workCountry) > -1; }; }
  };
  /* مسميات الوثائق حسب أنظمة كل دولة */
  var ID_KIND = { SA: 'sa', EG: 'eg', ID: 'id', KE: 'ke', ET: 'et' };
  var PERMIT_KIND = { SA: 'sa', EG: 'eg', ID: 'id', KE: 'ke', ET: 'et' };
  function idKind(d) { return ID_KIND[d.nationality] || 'gen'; }
  function permitKind(d) { return PERMIT_KIND[d.workCountry] || 'gen'; }
  var ID_RULES = { sa: /^1\d{9}$/, eg: /^[23]\d{13}$/, id: /^\d{16}$/ };
  var PERMIT_RULES = { sa: /^2\d{9}$/ };
  function toLatinDigits(v) { return String(v == null ? '' : v).replace(/[٠-٩]/g, function (c) { return c.charCodeAt(0) - 1632; }).replace(/[۰-۹]/g, function (c) { return c.charCodeAt(0) - 1776; }); }
  /* توحيد رقم الجوال: أرقام لاتينية، دون رمز الدولة المكرر أو الصفر في أوله */
  function normPhone(v, dial) {
    var s = toLatinDigits(v).replace(/[^\d+]/g, '');
    if (s.indexOf('00') === 0) s = '+' + s.slice(2);
    if (s.charAt(0) === '+') { s = s.slice(1); if (dial && s.indexOf(dial) === 0 && s.length - dial.length >= 6) s = s.slice(dial.length); }
    else if (dial && s.indexOf(dial) === 0 && s.length - dial.length >= 8) s = s.slice(dial.length);
    return s.replace(/^0+/, '');
  }
  function startOf(d) { return C.startDiff(d) ? d.startDate : (d.hasContract === 'yes' ? d.contractStart : d.startDate); }
  /* مدة الخدمة. gen = بعد «منذ» (سنتين/شهرين)، وإلا بالرفع (سنتان/شهران) */
  function svcLen(iso, lang, gen) {
    lang = lang || state.lang;
    if (!iso) return '';
    var b = new Date(iso + 'T00:00:00'), now = today();
    var mo = (now.getFullYear() - b.getFullYear()) * 12 + now.getMonth() - b.getMonth() - (now.getDate() < b.getDate() ? 1 : 0);
    if (mo < 0) return '';
    var y = Math.floor(mo / 12), m = mo % 12, out = [];
    if (lang === 'ar') {
      var Y = function (n) { return n === 1 ? 'سنة' : n === 2 ? (gen ? 'سنتين' : 'سنتان') : (n <= 10 ? arDigits(n) + ' سنوات' : arDigits(n) + ' سنة'); };
      var M = function (n) { return n === 1 ? 'شهر' : n === 2 ? (gen ? 'شهرين' : 'شهران') : (n <= 10 ? arDigits(n) + ' أشهر' : arDigits(n) + ' شهرًا'); };
      if (y) out.push(Y(y)); if (m) out.push(M(m));
      return out.length ? out.join(' و') : (gen ? '' : 'انضم حديثًا');
    }
    if (lang === 'id') { if (y) out.push(y + ' thn'); if (m) out.push(m + ' bln'); return out.length ? out.join(' ') : 'Baru bergabung'; }
    if (y) out.push(y + (y === 1 ? ' yr' : ' yrs')); if (m) out.push(m + (m === 1 ? ' mo' : ' mos'));
    return out.length ? out.join(' ') : (gen ? '' : 'Just joined');
  }
  function svcLine(iso, lang) {
    if (!iso) return '';
    var g = svcLen(iso, lang, true);
    return g ? tl(lang || state.lang, 'card.svc', { d: g }) : tl(lang || state.lang, 'card.svcNew');
  }

  /* ---------------------------------------------------------- مخطط النموذج */
  var STEPS = [
    { id: 'personal', sections: [
      { t: 's.nameAr', hint: 'h.nameAr', cols: 4, fields: [
        { k: 'firstNameAr', type: 'text', dir: 'rtl', v: 'arabic', ph: 'ph.firstNameAr' },
        { k: 'fatherNameAr', type: 'text', dir: 'rtl', v: 'arabic', ph: 'ph.fatherNameAr' },
        { k: 'grandNameAr', type: 'text', dir: 'rtl', v: 'arabic', ph: 'ph.grandNameAr' },
        { k: 'lastNameAr', type: 'text', dir: 'rtl', v: 'arabic', ph: 'ph.lastNameAr' }
      ] },
      { t: 's.nameEn', hint: 'h.nameEn', cols: 4, fields: [
        { k: 'firstName', type: 'text', req: 1, v: 'latin', dir: 'ltr', ph: 'ph.firstName', upper: 1 },
        { k: 'fatherName', type: 'text', v: 'latin', dir: 'ltr', ph: 'ph.fatherName', upper: 1 },
        { k: 'grandName', type: 'text', v: 'latin', dir: 'ltr', ph: 'ph.grandName', upper: 1 },
        { k: 'lastName', type: 'text', req: 1, v: 'latin', dir: 'ltr', ph: 'ph.lastName', upper: 1 }
      ] },
      { t: 's.identity', fields: [
        { k: 'gender', type: 'seg', opts: ['male', 'female'], req: 1 },
        { k: 'birthDate', type: 'date', req: 1, v: 'birth', meta: 'age' },
        { k: 'birthCountry', type: 'country', req: 1 },
        { k: 'birthCity', type: 'text', listFn: function (d) { return 'city|' + (d.birthCountry || '') + '|'; } }
      ] },
      { t: 's.nationality', fields: [
        { k: 'nationality', type: 'country', req: 1 },
        { k: 'hasOtherNat', type: 'seg', opts: ['no', 'yes'], optKey: 'yesno', req: 1 },
        { k: 'otherNationality', type: 'country', req: 1, show: C.otherNat },
        { k: 'workCountry', type: 'country', req: 1, hint: 'h.workCountry', w: 'full' }
      ] },
      { t: 's.family', fields: [
        { k: 'maritalStatus', type: 'seg', opts: ['single', 'married', 'divorced', 'widowed'], req: 1, w: 'full' },
        { k: 'dependents', type: 'text', num: 1, v: 'int', min: 0, max: 30, dir: 'ltr', show: C.hasDeps },
        { k: 'bloodType', type: 'select', opts: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'], rawOpts: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] }
      ] }
    ] },
    { id: 'documents', sections: [
      { t: 's.passport', fields: [
        { k: 'passportNo', type: 'text', req: 1, v: 'docNo', dir: 'ltr', hint: 'h.passportNo', upper: 1 },
        { k: 'passportCountry', type: 'country', req: 1 },
        { k: 'passportIssue', type: 'date', req: 1, v: 'past' },
        { k: 'passportExpiry', type: 'date', req: 1, after: 'passportIssue', meta: 'expiry' }
      ] },
      { t: 's.nationalId', titleKey: function (d) { return C.abroad(d) ? 's.nationalId.home' : 's.nationalId'; }, hintKey: function (d) { return C.abroad(d) ? 'h.nationalId.home' : ''; }, fields: [
        { k: 'nationalIdNo', type: 'text', reqFn: function (d) { return !C.abroad(d); }, v: 'nationalId', dir: 'ltr', mono: 1, labelKey: function (d) { return 'f.nationalIdNo.' + idKind(d); }, hintKey: function (d) { return 'h.nationalIdNo.' + idKind(d); } },
        { k: 'nationalIdExpiry', type: 'date', meta: 'expiry' }
      ] },
      { t: 's.permit', titleKey: function (d) { return 's.permit.' + permitKind(d); }, hint: 'h.permit', hintKey: function (d) { return 'h.permit.' + permitKind(d); }, show: C.needPermit, fields: [
        { k: 'permitNo', type: 'text', req: 1, v: 'permit', dir: 'ltr', mono: 1, labelKey: function (d) { return 'f.permitNo.' + permitKind(d); } },
        { k: 'permitOccupation', type: 'text', show: C.abroadSA },
        { k: 'permitIssue', type: 'date', v: 'past' },
        { k: 'permitExpiry', type: 'date', req: 1, after: 'permitIssue', meta: 'expiry' },
        { k: 'workPermitNo', type: 'text', v: 'docNo', dir: 'ltr', mono: 1, show: C.abroadNotSA, labelKey: function (d) { return 'f.workPermitNo.' + permitKind(d); }, hint: 'h.workPermitNo' },
        { k: 'workPermitExpiry', type: 'date', after: 'permitIssue', meta: 'expiry', show: C.abroadNotSA }
      ] },
      { t: 's.official', hint: 'h.official', show: C.wcAny(['EG', 'ID', 'KE', 'ET']), fields: [
        { k: 'insuranceNo', type: 'text', dir: 'ltr', mono: 1, show: C.wc('EG') },
        { k: 'npwp', type: 'text', dir: 'ltr', mono: 1, show: C.wc('ID'), hint: 'h.npwp' },
        { k: 'bpjsTk', type: 'text', dir: 'ltr', mono: 1, show: C.wc('ID') },
        { k: 'bpjsKes', type: 'text', dir: 'ltr', mono: 1, show: C.wc('ID') },
        { k: 'kraPin', type: 'text', dir: 'ltr', mono: 1, upper: 1, v: 'kra', ph: 'ph.kraPin', show: C.wc('KE') },
        { k: 'nssfNo', type: 'text', dir: 'ltr', mono: 1, show: C.wc('KE') },
        { k: 'shaNo', type: 'text', dir: 'ltr', mono: 1, show: C.wc('KE') },
        { k: 'tin', type: 'text', dir: 'ltr', mono: 1, show: C.wc('ET') }
      ] }
    ] },
    { id: 'contact', sections: [
      { t: 's.reach', fields: [
        { k: 'officialEmail', type: 'email', v: 'email', dir: 'ltr', ph: 'ph.officialEmail', hint: 'h.emailOfficial' },
        { k: 'personalEmail', type: 'email', req: 1, v: 'email', dir: 'ltr', ph: 'ph.email' },
        { k: 'mobile', type: 'phone', req: 1 },
        { k: 'waSame', type: 'seg', opts: ['yes', 'no'], optKey: 'yesno', req: 1 },
        { k: 'whatsapp', type: 'phone', req: 1, show: C.waDiff, w: 'full' }
      ] },
      { t: 's.currentAddress', fields: [
        { k: 'addrCountry', type: 'country', req: 1 },
        { k: 'addrRegion', type: 'text', listFn: function (d) { return 'reg|' + (d.addrCountry || ''); } },
        { k: 'addrCity', type: 'text', req: 1, listFn: function (d) { return 'city|' + (d.addrCountry || '') + '|' + (d.addrRegion || ''); } }
      ] },
      { t: 's.homeAddress', show: C.abroad, fields: [
        { k: 'homeCountry', type: 'country', req: 1 },
        { k: 'homeCity', type: 'text', req: 1, listFn: function (d) { return 'city|' + (d.homeCountry || '') + '|'; } }
      ] }
    ] },
    { id: 'emergency', sections: [
      { t: 's.em1', fields: [
        { k: 'em1Name', type: 'text', req: 1 },
        { k: 'em1Relation', type: 'select', req: 1, optKey: 'relation', opts: ['spouse', 'father', 'mother', 'brother', 'sister', 'son', 'daughter', 'relative', 'friend', 'other'] },
        { k: 'em1Phone', type: 'phone', req: 1, w: 'full' }
      ] },
      { t: 's.em2', hint: 'h.em2', fields: [
        { k: 'em2Name', type: 'text' },
        { k: 'em2Relation', type: 'select', optKey: 'relation', opts: ['spouse', 'father', 'mother', 'brother', 'sister', 'son', 'daughter', 'relative', 'friend', 'other'] },
        { k: 'em2Phone', type: 'phone', w: 'full', reqIf: 'em2Name' }
      ] }
    ] },
    { id: 'job', sections: [
      { t: 's.position', fields: [
        { k: 'entity', type: 'select', req: 1, entity: 1, w: 'full' },
        { k: 'entityOther', type: 'text', req: 1, w: 'full', show: function (d) { return d.entity === 'other'; } },
        { k: 'jobTitle', type: 'text', req: 1 },
        { k: 'department', type: 'text', req: 1 },
        { k: 'workRegion', type: 'text', req: 1, listFn: function (d) { return 'reg|' + (d.workCountry || ''); }, labelKey: function (d) { return 'f.workRegion.' + ({ SA: 'sa', EG: 'eg', ID: 'id', KE: 'ke', ET: 'et' }[d.workCountry] || 'gen'); } },
        { k: 'workOffice', type: 'text', req: 1, listFn: function (d) { return 'city|' + (d.workCountry || '') + '|' + (d.workRegion || ''); } },
        { k: 'manager', type: 'text' },
        { k: 'employeeNo', type: 'text', dir: 'ltr' },
        { k: 'employmentType', type: 'seg', req: 1, opts: ['fullTime', 'partTime', 'remote', 'field', 'contractor', 'volunteer'], w: 'full', hint: 'h.employmentType' }
      ] },
      { t: 's.contract', fields: [
        { k: 'hasContract', type: 'seg', req: 1, opts: ['yes', 'no'], optKey: 'yesno', w: 'full' },
        { k: 'contractNone', type: 'info', text: 'h.contractNone', show: C.noContract, w: 'full' },
        { k: 'contractType', type: 'seg', req: 1, opts: ['local', 'international'], show: C.contract },
        { k: 'contractNo', type: 'text', dir: 'ltr', show: C.contract },
        { k: 'contractStart', type: 'date', req: 1, show: C.contract },
        { k: 'contractEnd', type: 'date', after: 'contractStart', afterErr: 'e.afterStart', show: C.contract, meta: 'expiry' },
        { k: 'startDiff', type: 'seg', req: 1, opts: ['no', 'yes'], optKey: 'yesno', show: C.contractAsk, w: 'full' },
        { k: 'startDate', type: 'date', req: 1, v: 'start', meta: 'service', show: C.startDiff }
      ] }
    ] },
    { id: 'education', sections: [
      { t: 's.qualifications', fields: [
        { k: 'qualifications', type: 'repeater', min: 1, add: 'b.addQualification', w: 'full', fields: [
          { k: 'degree', type: 'select', req: 1, opts: ['secondary', 'diploma', 'bachelor', 'master', 'phd', 'other'] },
          { k: 'degreeOther', type: 'text', req: 1, showItem: function (it) { return it.degree === 'other'; } },
          { k: 'major', type: 'text', req: 1 },
          { k: 'institution', type: 'text', req: 1 },
          { k: 'country', type: 'country' },
          { k: 'gradYear', type: 'text', num: 1, v: 'year', dir: 'ltr', ph: 'ph.year' },
          { k: 'grade', type: 'text' }
        ] }
      ] },
      { t: 's.experience', fields: [
        { k: 'experience', type: 'repeater', min: 0, add: 'b.addExperience', w: 'full', fields: [
          { k: 'org', type: 'text', req: 1 },
          { k: 'title', type: 'text', req: 1 },
          { k: 'country', type: 'country' },
          { k: 'from', type: 'date', v: 'past' },
          { k: 'to', type: 'date', after: 'from', afterErr: 'e.afterStart' }
        ] }
      ] },
      { t: 's.languages', fields: [
        { k: 'languages', type: 'repeater', min: 1, add: 'b.addLanguage', w: 'full', compact: 1, fields: [
          { k: 'language', type: 'text', req: 1, list: 'langs.list' },
          { k: 'level', type: 'select', req: 1, opts: ['native', 'advanced', 'intermediate', 'beginner'] }
        ] }
      ] },
      { t: 's.skills', fields: [
        { k: 'techLevel', type: 'seg', req: 1, opts: ['basic', 'mid', 'adv', 'expert'], optKey: 'techLevel', w: 'full', hintKey: function (d) { return d.techLevel ? 'h.techLevel.' + d.techLevel : 'h.techLevel'; } },
        { k: 'techSkills', type: 'textarea', w: 'full', hint: 'h.techSkills' }
      ] },
      { t: 's.certs', fields: [
        { k: 'hasCerts', type: 'seg', req: 1, opts: ['no', 'yes'], optKey: 'yesno', w: 'full' },
        { k: 'certs', type: 'repeater', min: 1, add: 'b.addCert', w: 'full', show: C.certs, compact: 1, fields: [
          { k: 'certName', type: 'text', req: 1 },
          { k: 'certField', type: 'text', req: 1 }
        ] }
      ] },
      { t: 's.quran', fields: [
        { k: 'quran', type: 'select', opts: ['none', 'lt5', '5to15', '15to29', 'full'], w: 'full' }
      ] }
    ] },
    { id: 'finance', sections: [
      { t: 's.pay', fields: [
        { k: 'salary', type: 'text', reqFn: C.paid, num: 1, v: 'money', dir: 'ltr', mono: 1, inputmode: 'decimal', ph: 'ph.salary', hint: 'h.salary' },
        { k: 'currency', type: 'select', req: 1, opts: CURRENCIES, rawOpts: CURRENCIES.slice(0, -1) }
      ] },
      { t: 's.salary', fields: [
        { k: 'payMethod', type: 'seg', reqFn: C.paid, opts: ['bank', 'cash', 'other'], w: 'full' },
        { k: 'bankCountry', type: 'country', req: 1, show: C.bank },
        { k: 'bankName', type: 'text', req: 1, show: C.bank },
        { k: 'accountHolder', type: 'text', req: 1, show: C.bank, dir: 'ltr', upper: 1, w: 'full' },
        { k: 'iban', type: 'text', req: 1, show: C.iban, v: 'iban', dir: 'ltr', hint: 'h.iban', upper: 1, mono: 1, w: 'full' },
        { k: 'accountNo', type: 'text', req: 1, show: C.noIban, dir: 'ltr', mono: 1 },
        { k: 'swift', type: 'text', show: C.noIban, dir: 'ltr', upper: 1, mono: 1 },
        { k: 'bankBranch', type: 'text', show: C.noIban },
        { k: 'payOther', type: 'textarea', req: 1, show: C.payOther, w: 'full' }
      ] }
    ] },
    { id: 'attachments', sections: [
      { t: 's.files', fields: [
        { k: 'photo', type: 'file', reqFn: C.notFemale, photo: 1, max: 1, hint: 'h.photo', hintKey: function (d) { return d.gender === 'female' ? 'h.photoFemale' : 'h.photo'; }, w: 'full' },
        { k: 'passportScan', type: 'file', req: 1, max: 2 },
        { k: 'nationalIdScan', type: 'file', reqFn: function (d) { return !C.abroad(d); }, max: 2, hint: 'h.nationalIdScan', labelKey: function (d) { return 'f.nationalIdScan.' + idKind(d); } },
        { k: 'permitScan', type: 'file', req: 1, max: 2, hint: 'h.permitScan', show: C.needPermit, labelKey: function (d) { return 'f.permitScan.' + permitKind(d); } },
        { k: 'workPermitScan', type: 'file', max: 2, show: C.abroadNotSA, labelKey: function (d) { return 'f.workPermitScan.' + permitKind(d); } },
        { k: 'contractFile', type: 'file', req: 1, max: 3, hint: 'h.contractFile', show: C.contract },
        { k: 'contractNone2', type: 'info', text: 'h.contractNone', show: C.noContract, label: 'f.contractFile' },
        { k: 'degreeFile', type: 'file', max: 2 },
        { k: 'certFiles', type: 'file', req: 1, max: 6, show: C.certs, hint: 'h.certFiles' },
        { k: 'bankProof', type: 'file', max: 1 }
      ] }
    ] },
    { id: 'review', sections: [] }
  ];

  var FIELD = {};
  STEPS.forEach(function (st, si) {
    st.sections.forEach(function (sec) {
      sec.fields.forEach(function (f) { f.step = si; f.section = sec; FIELD[f.k] = f; });
    });
  });

  /* ---------------------------------------------------------- القيم */
  function getVal(path) {
    var p = path.split(':');
    if (p[0] === 'rep') { var it = (state.data[p[1]] || [])[+p[2]]; return it ? it[p[3]] : undefined; }
    return state.data[path];
  }
  function setVal(path, v) {
    var p = path.split(':');
    if (p[0] === 'rep') { var arr = state.data[p[1]]; if (arr && arr[+p[2]]) arr[+p[2]][p[3]] = v; return; }
    state.data[path] = v;
  }
  function showAllQ() { return PREVIEW && state.showAll !== false; }
  function secShown(sec) { return showAllQ() || !(sec.show && !sec.show(state.data)); }
  function isCond(f) { return !!(f.show || (f.section && f.section.show)); }
  function condTag(f) { return showAllQ() && isCond(f) ? '<span class="cond-tag">' + esc(t('pv.cond')) + '</span>' : ''; }
  function visible(f) {
    if (showAllQ()) return true;
    if (f.section && f.section.show && !f.section.show(state.data)) return false;
    if (f.show && !f.show(state.data)) return false;
    return true;
  }
  function applyDefaults(changed) {
    var d = state.data;
    if (changed === 'hasCerts' && d.hasCerts === 'yes' && !(d.certs && d.certs.length)) d.certs = [{}];
    if (changed === 'workCountry' && d.workCountry) {
      if (!d.addrCountry) d.addrCountry = d.workCountry;
      if (!d.mobileDial) d.mobileDial = d.workCountry;
      if (!d.whatsappDial) d.whatsappDial = d.workCountry;
      if (!d.em1PhoneDial) d.em1PhoneDial = d.workCountry;
      if (!d.bankCountry) d.bankCountry = d.workCountry;
      if (!d.currency) {
        var cur = { SA: 'SAR', EG: 'EGP', ID: 'IDR', KE: 'KES', ET: 'ETB', AE: 'AED', GB: 'GBP', TZ: 'TZS', UG: 'UGX', NG: 'NGN', PK: 'PKR', MY: 'MYR', US: 'USD' }[d.workCountry];
        if (cur) d.currency = cur;
      }
    }
    if (changed === 'nationality' && d.nationality) {
      if (!d.passportCountry) d.passportCountry = d.nationality;
      if (!d.homeCountry) d.homeCountry = d.nationality;
      if (!d.em2PhoneDial) d.em2PhoneDial = d.nationality;
      if (!d.birthCountry) d.birthCountry = d.nationality;
    }
  }

  /* ---------------------------------------------------------- التحقق */
  function ibanValid(s) {
    var r = (s.slice(4) + s.slice(0, 4)).replace(/[A-Z]/g, function (ch) { return ch.charCodeAt(0) - 55; });
    var mod = 0;
    for (var i = 0; i < r.length; i += 7) mod = parseInt(String(mod) + r.slice(i, i + 7), 10) % 97;
    return mod === 1;
  }
  function validate(f, path, item) {
    var d = state.data;
    var v = getVal(path);
    if (f.type === 'info') return '';
    if (f.type === 'file') {
      var files = state.files[f.k] || [];
      return (isReq(f) && !files.length) ? 'e.fileRequired' : '';
    }
    if (f.type === 'repeater') return '';
    if (f.k === 'currency' && v === 'other' && !String(d.currencyOther || '').trim()) return 'e.currencyOther';
    var empty = v == null || String(v).trim() === '';
    var required = isReq(f, item) || (f.reqIf && d[f.reqIf]);
    if (empty) return required ? 'e.required' : '';
    v = String(v).trim();
    if (f.num) v = toLatinDigits(v);
    if (f.type === 'phone') return /^\d{6,14}$/.test(normPhone(v, dialOf(d[(path || f.k) + 'Dial']))) ? '' : 'e.phone';
    switch (f.v) {
      case 'latin': if (!/^[A-Za-z][A-Za-z' .\-]*$/.test(v)) return 'e.latin'; break;
      case 'email': if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'e.email'; break;
      case 'docNo': if (!/^[A-Za-z0-9\-]{3,24}$/.test(toLatinDigits(v).replace(/\s/g, ''))) return 'e.docNo'; break;
      case 'arabic': if (!/^[\u0600-\u06FF\s'ـ]+$/.test(v)) return 'e.arabic'; break;
      case 'int': var iv = +v; if (!/^\d+$/.test(v) || iv < (f.min || 0) || iv > (f.max || 99)) return 'e.int'; break;
      case 'kra': if (!/^[A-Z]\d{9}[A-Z]$/i.test(v.replace(/\s/g, ''))) return 'e.kra'; break;
      case 'nationalId':
        var nv = toLatinDigits(v).replace(/[\s-]/g, ''), rule = ID_RULES[idKind(d)];
        /* خلط شائع: كتابة رقم الإقامة (هوية مقيم) مكان الهوية الوطنية لبلد الجنسية */
        if (C.abroad(d) && ((d.workCountry === 'SA' && d.nationality !== 'SA' && /^2\d{9}$/.test(nv)) || (d.permitNo && toLatinDigits(d.permitNo).replace(/[\s-]/g, '') === nv))) return 'e.nationalId.isPermit';
        if (rule ? !rule.test(nv) : !/^[A-Za-z0-9]{4,24}$/.test(nv)) return 'e.nationalId.' + (rule ? idKind(d) : 'gen');
        break;
      case 'permit':
        var pv = toLatinDigits(v).replace(/[\s-]/g, ''), prule = PERMIT_RULES[permitKind(d)];
        if (prule ? !prule.test(pv) : !/^[A-Za-z0-9\/]{3,24}$/.test(pv)) return prule ? 'e.permit.' + permitKind(d) : 'e.docNo';
        break;
      case 'birth':
        var age = yearsBetween(v);
        if (daysUntil(v) > 0) return 'e.future';
        if (age < 15 || age > 90) return 'e.birth';
        break;
      case 'past': if (daysUntil(v) > 0) return 'e.future'; break;
      case 'start': if (daysUntil(v) > 366) return 'e.future'; break;
      case 'money': var m = moneyNum(v); if (!(m > 0 && m < 1e10)) return 'e.money'; break;
      case 'year': var y = +v; if (!(y >= 1950 && y <= new Date().getFullYear() + 1)) return 'e.year'; break;
      case 'iban':
        var s = toLatinDigits(v).replace(/[\s\-]/g, '').toUpperCase(), cc = d.bankCountry, n = IBAN_LEN[cc];
        if (s.slice(0, 2) !== cc || s.length !== n) return { k: 'e.iban', vars: { cc: cc, n: n } };
        if (!ibanValid(s)) return 'e.ibanCheck';
        break;
    }
    if (f.after) {
      var other = item ? item[f.after] : d[f.after];
      if (other && v <= other) return f.afterErr || 'e.afterIssue';
    }
    return '';
  }
  function validateStep(si, mark) {
    var bad = [];
    var st = STEPS[si];
    if (st.id === 'review') {
      ['consentTruth', 'consentData'].forEach(function (k) {
        var e = state.data[k] ? '' : 'e.consent';
        if (mark) state.errors[k] = e;
        if (e) bad.push(k);
      });
      return bad;
    }
    st.sections.forEach(function (sec) {
      sec.fields.forEach(function (f) {
        if (!visible(f)) { delete state.errors[f.k]; return; }
        if (f.type === 'repeater') {
          (state.data[f.k] || []).forEach(function (item, i) {
            f.fields.forEach(function (sf) {
              var path = 'rep:' + f.k + ':' + i + ':' + sf.k;
              if (sf.showItem && !sf.showItem(item)) { delete state.errors[path]; return; }
              var e = validate(sf, path, item);
              if (mark) state.errors[path] = e;
              if (e) bad.push(path);
            });
          });
          return;
        }
        var e = validate(f, f.k);
        if (mark) state.errors[f.k] = e;
        if (e) bad.push(f.k);
      });
    });
    return bad;
  }

  /* ---------------------------------------------------------- عرض القيم */
  function optLabel(f, v, lang) {
    if (v == null || v === '') return '';
    if (f.entity) {
      var en = CFG.ENTITIES.filter(function (x) { return x.v === v; })[0];
      return en ? en[lang || state.lang] : v;
    }
    if (f.k === 'currency' && f.rawOpts.indexOf(v) > -1) return v + ' — ' + tl(lang || state.lang, 'cur.' + v);
    if (f.rawOpts && f.rawOpts.indexOf(v) > -1) return v;
    return tl(lang || state.lang, 'o.' + (f.optKey || f.k) + '.' + v);
  }
  function moneyNum(v) {
    v = String(v || '').replace(/[٠-٩]/g, function (c) { return c.charCodeAt(0) - 1632; }).trim();
    if (/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(v.replace(/\s/g, ''))) v = v.replace(/\./g, '').replace(',', '.');
    v = v.replace(/[,\s٬']/g, '').replace('٫', '.');
    return v === '' ? NaN : +v;
  }
  function moneyFmt(v, lang) { var n = moneyNum(v); return isFinite(n) ? n.toLocaleString((lang || state.lang) === 'ar' ? 'ar-u-nu-arab' : 'en-US', { maximumFractionDigits: 2 }) : String(v); }
  function display(f, path, lang) {
    lang = lang || state.lang;
    var v = getVal(path);
    if (f.type === 'phone') {
      if (!v) return '';
      var cc = state.data[(path.indexOf('rep:') === 0 ? '' : path) + 'Dial'];
      return '+' + dialOf(cc) + ' ' + normPhone(v, dialOf(cc));
    }
    if (v == null || v === '') return '';
    if (f.type === 'country') return cname(v, lang);
    if (f.type === 'date') return fmtDate(v, lang);
    if (f.type === 'seg' || f.type === 'select' || f.type === 'rating') return optLabel(f, v, lang);
    if (f.num && f.v !== 'money') return lang === 'ar' ? arDigits(v) : String(v);
    if (f.v === 'money') { var cu = state.data.currency; return moneyFmt(v, lang) + (cu ? ' ' + (cu === 'other' ? (state.data.currencyOther || '') : tl(lang, 'cur.' + cu)) : ''); }
    return String(v);
  }

  /* ---------------------------------------------------------- مكوّنات الحقول */
  function isReq(f, item) { return !!(f.req || (f.reqFn && f.reqFn(state.data, item)) || (f.reqIf && state.data[f.reqIf] && String(state.data[f.reqIf]).trim())); }
  function lblText(f) { return t(f.labelKey ? f.labelKey(state.data) : (f.label || ('f.' + f.k))); }
  function hintText(f) { var k = f.hintKey ? f.hintKey(state.data) : f.hint; return k ? t(k) : ''; }
  function reqMark(f) { return isReq(f) ? '<span class="req" aria-hidden="true">*</span>' : ''; }
  function secTitle(sec) { return t(sec.titleKey ? sec.titleKey(state.data) : sec.t); }
  function secHint(sec) { var k = sec.hintKey ? sec.hintKey(state.data) : sec.hint; return k ? t(k) : ''; }
  function dispNum(v) { return v == null ? '' : (state.lang === 'ar' ? arDigits(v) : String(v)); }
  function labelHTML(f, forId) {
    return '<label class="lbl" for="' + forId + '">' + esc(lblText(f)) + reqMark(f) + condTag(f) + '</label>';
  }
  function fieldHTML(f, path, item) {
    var id = 'f-' + path.replace(/:/g, '-');
    var v = getVal(path);
    var err = state.errors[path];
    var errText = err ? (typeof err === 'object' ? t(err.k, err.vars) : t(err)) : '';
    var w = f.w === 'full' || f.type === 'textarea' ? ' w-full' : '';
    var hidden = (!item && !visible(f)) || (item && f.showItem && !f.showItem(item) && !showAllQ()) ? ' hidden' : '';
    if (f.type === 'rating') w = ' w-full rating-row';
    if (NAME_PAIR[path] && state.autoName && state.autoName[path] && v) w += ' is-sug';
    var h = '<div class="field' + w + (err ? ' has-err' : '') + '" data-field="' + esc(path) + '"' + hidden + '>';
    var ctrl = '';
    var dirA = f.dir ? ' dir="' + f.dir + '"' : '';
    var ph = f.ph ? ' placeholder="' + esc(t(f.ph)) + '"' : '';
    var desc = ' aria-describedby="' + id + '-err"';
    switch (f.type) {
      case 'text': case 'email': case 'number':
        var it = f.type === 'number' ? 'number' : (f.type === 'email' ? 'email' : 'text');
        var extra = f.type === 'number' ? ' inputmode="numeric" min="' + (f.min || 0) + '" max="' + (f.max || 9999) + '" step="1"' : '';
        var sugKey = f.list ? 'langs' : (f.listFn ? f.listFn(state.data) || '-' : '');
        var list = sugKey ? ' data-sug="' + esc(sugKey) + '" role="combobox" aria-autocomplete="list" aria-expanded="false"' : '';
        var auto = f.type === 'email' ? ' autocomplete="email"' : ' autocomplete="off"';
        if (f.inputmode) extra += ' inputmode="' + f.inputmode + '"';
        else if (f.num) extra += ' inputmode="numeric"';
        var shown = f.num && v ? dispNum(v) : (v || '');
        ctrl = '<input class="inp' + (f.upper ? ' up' : '') + (f.mono ? ' mono' : '') + '" type="' + it + '" id="' + id + '" data-path="' + esc(path) + '" value="' + esc(shown) + '"' + dirA + ph + extra + list + auto + desc + (err ? ' aria-invalid="true"' : '') + '>';
        if (sugKey) ctrl = '<div class="sug-w">' + ctrl + '<svg class="sug-chev" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5 6 7.5 9 4.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>';
        break;
      case 'textarea':
        ctrl = '<textarea class="inp" rows="3" id="' + id + '" data-path="' + esc(path) + '"' + dirA + desc + '>' + esc(v || '') + '</textarea>';
        break;
      case 'date':
        ctrl = dateHTML(f, path, id, v, err, desc);
        break;
      case 'select':
        var opts = f.entity ? CFG.ENTITIES.map(function (e) { return [e.v, e[state.lang]]; })
          : f.opts.map(function (o) { return [o, optLabel(f, o)]; });
        OPTS[path] = opts;
        ctrl = comboHTML(id, path, 'opts', v, err, desc);
        if (f.k === 'currency') ctrl += '<input class="inp mt" type="text" dir="ltr" data-path="currencyOther" value="' + esc(state.data.currencyOther || '') + '" placeholder="QAR"' + (C.currencyOther(state.data) || showAllQ() ? '' : ' hidden') + ' id="f-currencyOther">';
        break;
      case 'seg': case 'rating':
        ctrl = '<div class="seg' + (f.type === 'rating' ? ' rate' : '') + '" role="radiogroup" id="' + id + '" aria-labelledby="' + id + '-lbl">' + f.opts.map(function (o) {
          var on = v === o;
          return '<button type="button" role="radio" aria-checked="' + on + '" data-path="' + esc(path) + '" data-val="' + esc(o) + '" tabindex="' + (on || (!v && o === f.opts[0]) ? 0 : -1) + '">' + esc(optLabel(f, o)) + '</button>';
        }).join('') + '</div>';
        break;
      case 'country':
        ctrl = comboHTML(id, path, 'country', v);
        break;
      case 'phone':
        var dpath = path + 'Dial';
        ctrl = '<div class="phone" dir="ltr">' + comboHTML(id + '-dial', dpath, 'dial', state.data[dpath]) +
          '<input class="inp" type="tel" inputmode="tel" autocomplete="tel-national" id="' + id + '" data-path="' + esc(path) + '" value="' + esc(v || '') + '" placeholder="' + esc(t('ph.phone')) + '"' + desc + (err ? ' aria-invalid="true"' : '') + '></div>';
        break;
      case 'info':
        return '<div class="field w-full" data-field="' + esc(path) + '"' + hidden + '>' + (f.label ? '<span class="lbl">' + esc(t(f.label)) + '</span>' : '') + '<p class="note"><span class="dot" aria-hidden="true"></span>' + esc(t(f.text)) + '</p></div>';
      case 'file':
        return fileFieldHTML(f, hidden, err);
      case 'repeater':
        return repeaterHTML(f, hidden);
    }
    var segLike = f.type === 'seg' || f.type === 'rating';
    var lblId = id + (segLike ? '-lbl' : '');
    if (segLike) h += '<span class="lbl" id="' + lblId + '">' + esc(lblText(f)) + reqMark(f) + condTag(f) + '</span>';
    else h += labelHTML(f, id);
    h += ctrl;
    var ht = hintText(f);
    if (ht) h += '<p class="hint">' + esc(ht) + '</p>';
    if (NAME_PAIR[path]) h += '<p class="sug-note"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5 9.6 6.4 14.5 8 9.6 9.6 8 14.5 6.4 9.6 1.5 8 6.4 6.4z"/></svg>' + esc(t('m.sugName')) + '</p>';
    h += '<p class="err" id="' + id + '-err" role="alert">' + esc(errText) + '</p>';
    return h + '</div>';
  }

  function dateMeta(f, v) {
    if (!v) return '';
    var out = [];
    if (f.meta === 'age') { var a = yearsBetween(v); if (a >= 0 && a < 120) out.push('<span class="chip">' + esc(t('m.age', { n: a })) + '</span>'); }
    if (f.meta === 'expiry') {
      var n = daysUntil(v);
      if (n < 0) out.push('<span class="chip bad">' + esc(t('m.expired')) + '</span>');
      else if (n <= 90) out.push('<span class="chip warn">' + esc(t('m.expiresIn', { n: n })) + '</span>');
      else out.push('<span class="chip ok">' + esc(t('m.valid', { d: fmtDate(v) })) + '</span>');
    }
    if (f.meta === 'service') {
      var b = new Date(v + 'T00:00:00'), now = today();
      var months = (now.getFullYear() - b.getFullYear()) * 12 + now.getMonth() - b.getMonth() - (now.getDate() < b.getDate() ? 1 : 0);
      if (months >= 0) out.push('<span class="chip">' + esc(t('card.svcT') + ': ' + svcLen(v)) + '</span>');
    }
    if (calPref() === 'h') out.push('<span class="hj">' + esc(t('dp.gIs', { d: fmtDate(v) })) + '</span>');
    else { var hj = hijri(v); if (hj) out.push('<span class="hj">' + esc(t('m.hijri', { d: hj })) + '</span>'); }
    return out.join('');
  }

  /* ---------- التاريخ: ميلادي أو هجري (أم القرى) بثلاث قوائم: اليوم والشهر والسنة. يُحفظ دائمًا بالميلادي ISO */
  var DPP = {};
  var HMONTHS = {
    ar: ['محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'],
    en: ['Muharram', 'Safar', 'Rabi I', 'Rabi II', 'Jumada I', 'Jumada II', 'Rajab', 'Shaban', 'Ramadan', 'Shawwal', 'Dhu al-Qadah', 'Dhu al-Hijjah'],
    id: ['Muharram', 'Safar', 'Rabiul Awal', 'Rabiul Akhir', 'Jumadil Awal', 'Jumadil Akhir', 'Rajab', 'Syaban', 'Ramadan', 'Syawal', 'Zulkaidah', 'Zulhijah']
  };
  var GMONTHS = { ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'] };
  function gMonthName(i, L) {
    if (GMONTHS[L]) return GMONTHS[L][i];
    try { return new Intl.DateTimeFormat(L === 'id' ? 'id-ID' : 'en-GB', { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(2020, i, 1))); } catch (e) { return String(i + 1); }
  }
  function calPref() { return state.data.calPref === 'h' ? 'h' : 'g'; }
  var HFMT = null;
  function hParts(iso) {
    try {
      HFMT = HFMT || new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', { year: 'numeric', month: 'numeric', day: 'numeric', timeZone: 'UTC' });
      var o = {}; HFMT.formatToParts(new Date(iso + 'T00:00:00Z')).forEach(function (p) { if (p.type === 'year' || p.type === 'month' || p.type === 'day') o[p.type[0]] = parseInt(p.value, 10); });
      return o.y ? o : null;
    } catch (e) { return null; }
  }
  function isoOf(dt) { return dt.toISOString().slice(0, 10); }
  function fromHijri(y, m, d) {
    var approx = Date.UTC(622, 6, 16) + ((y - 1) * 354.36667 + (m - 1) * 29.5306 + (d - 1)) * 864e5;
    for (var k = -6; k <= 6; k++) {
      var iso = isoOf(new Date(approx + k * 864e5)), h = hParts(iso);
      if (h && h.y === y && h.m === m && h.d === d) return iso;
    }
    return null;
  }
  function gDays(y, m) { return y && m ? new Date(Date.UTC(y, m, 0)).getUTCDate() : 31; }
  function hDays(y, m) { return y && m && fromHijri(y, m, 30) ? 30 : (y && m ? 29 : 30); }
  function yearSpan(f) {
    var Y = new Date().getFullYear();
    if (f.v === 'birth') return [Y - 15, Y - 90];
    if (/Expiry|End$|^to$/.test(f.k)) return [Y - 15, Y + 20];
    if (/Issue$|^from$/.test(f.k) || f.v === 'past') return [Y, Y - 45];
    return [Y + 1, Y - 45];
  }
  function dpParts(path, v) {
    var cal = calPref(), p = DPP[path];
    if (p && p.cal === cal && !v) return p;
    if (!v) return { cal: cal };
    var g = v.split('-').map(Number);
    if (cal === 'h') { var h = hParts(v); return h ? { cal: 'h', y: h.y, m: h.m, d: h.d } : { cal: 'h' }; }
    return { cal: 'g', y: g[0], m: g[1], d: g[2] };
  }
  function dateHTML(f, path, id, v, err, desc) {
    var L = state.lang, p = dpParts(path, v), cal = p.cal, span = yearSpan(f);
    var y0 = span[0], y1 = span[1];
    if (cal === 'h') { var ha = hParts(y0 + '-06-30'), hb = hParts(y1 + '-06-30'); y0 = ha ? ha.y : y0; y1 = hb ? hb.y : y1; }
    var step = y0 > y1 ? -1 : 1, years = [];
    for (var yy = y0; step > 0 ? yy <= y1 : yy >= y1; yy += step) years.push(yy);
    if (p.y && years.indexOf(p.y) < 0) years.push(p.y);
    var nd = cal === 'h' ? hDays(p.y, p.m) : gDays(p.y, p.m);
    var inv = err ? ' aria-invalid="true"' : '';
    var opt = function (val, lbl, sel) { return '<option value="' + val + '"' + (sel ? ' selected' : '') + '>' + esc(lbl) + '</option>'; };
    var dd = '<select class="inp dp-s" data-dpk="d" aria-label="' + esc(t('dp.day')) + '"' + inv + '>' + opt('', t('dp.day')) + Array.apply(null, Array(nd)).map(function (_, i) { return opt(i + 1, dispNum(i + 1), p.d === i + 1); }).join('') + '</select>';
    var mm = '<select class="inp dp-s dp-m" data-dpk="m" aria-label="' + esc(t('dp.month')) + '"' + inv + '>' + opt('', t('dp.month')) + Array.apply(null, Array(12)).map(function (_, i) {
      return opt(i + 1, dispNum(('0' + (i + 1)).slice(-2)) + ' · ' + (cal === 'h' ? (HMONTHS[L] || HMONTHS.en)[i] : gMonthName(i, L)), p.m === i + 1);
    }).join('') + '</select>';
    var yr = '<select class="inp dp-s" data-dpk="y" aria-label="' + esc(t('dp.year')) + '"' + inv + '>' + opt('', t('dp.year')) + years.map(function (y) { return opt(y, dispNum(y) + (cal === 'h' ? (L === 'ar' ? ' هـ' : ' AH') : ''), p.y === y); }).join('') + '</select>';
    return '<div class="dp' + (cal === 'h' ? ' is-h' : '') + '" data-dp="' + esc(path) + '" id="' + id + '" role="group"' + desc + '>' +
      '<div class="dp-row">' + dd + mm + yr + '</div>' +
      '<div class="dp-cal" role="radiogroup" aria-label="' + esc(t('dp.cal')) + '"><button type="button" role="radio" data-dpcal="g" aria-checked="' + (cal === 'g') + '">' + esc(t('dp.g')) + '</button><button type="button" role="radio" data-dpcal="h" aria-checked="' + (cal === 'h') + '">' + esc(t('dp.h')) + '</button></div></div>' +
      '<p class="meta" data-meta="' + esc(path) + '">' + dateMeta(f, v) + '</p>';
  }
  function dpRefresh(path, focusKey) {
    var host = $('.dp[data-dp="' + path + '"]'); if (!host) return;
    var f = fieldOf(path), fe = host.closest('.field');
    var tmp = document.createElement('div');
    tmp.innerHTML = dateHTML(f, path, host.id, getVal(path), state.errors[path], host.getAttribute('aria-describedby') ? ' aria-describedby="' + host.getAttribute('aria-describedby') + '"' : '');
    var meta = $('[data-meta="' + path + '"]', fe);
    host.replaceWith(tmp.firstChild);
    if (meta) meta.replaceWith(tmp.lastChild);
    if (focusKey) { var s = $('.dp[data-dp="' + path + '"] [data-dpk="' + focusKey + '"]'); if (s) s.focus(); }
  }
  function dpChange(sel) {
    var host = sel.closest('.dp'), path = host.getAttribute('data-dp'), cal = calPref();
    var p = DPP[path] = DPP[path] && DPP[path].cal === cal ? DPP[path] : dpParts(path, getVal(path));
    p.cal = cal; p[sel.getAttribute('data-dpk')] = sel.value ? +sel.value : undefined;
    var iso = '';
    if (p.y && p.m && p.d) {
      if (cal === 'h') { iso = fromHijri(p.y, p.m, p.d) || (p.d === 30 ? fromHijri(p.y, p.m, 29) : ''); }
      else { var dmax = gDays(p.y, p.m); if (p.d > dmax) p.d = dmax; iso = p.y + '-' + ('0' + p.m).slice(-2) + '-' + ('0' + p.d).slice(-2); }
    }
    if (iso) { delete DPP[path]; onValue(path, iso, false); }
    else if (getVal(path)) onValue(path, '', false);
    var fe = host.closest('.field');
    if (fe && iso && state.errors[path] === '') { fe.classList.remove('has-err'); var er = $('.err', fe); if (er) er.textContent = ''; }
    dpRefresh(path, sel.getAttribute('data-dpk'));
  }
  function dpSetCal(cal) {
    if (calPref() === cal) return;
    state.data.calPref = cal; DPP = {};
    saveDraft();
    var y = window.scrollY, fid = document.activeElement && document.activeElement.closest && document.activeElement.closest('.dp');
    var fpath = fid && fid.getAttribute('data-dp');
    $$('.dp[data-dp]').forEach(function (h) { dpRefresh(h.getAttribute('data-dp')); });
    window.scrollTo(0, y);
    if (fpath) { var b = $('.dp[data-dp="' + fpath + '"] [data-dpcal="' + cal + '"]'); if (b) b.focus(); }
  }

  /* ---------- قائمة الدول القابلة للبحث */
  var OPTS = {};
  var CHEV = '<svg class="chev" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5 6 7.5 9 4.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function optText(path, v) {
    var o = (OPTS[path] || []).filter(function (x) { return x[0] === v; })[0];
    return o ? o[1] : '';
  }
  function comboHTML(id, path, mode, v, err, desc) {
    var label;
    if (mode === 'opts') label = v && optText(path, v) ? '<span class="val">' + esc(optText(path, v)) + '</span>' : '<span class="ph">' + esc(t('ph.select')) + '</span>';
    else if (v) label = mode === 'dial' ? flag(v) + '<span class="code">+' + esc(dialOf(v)) + '</span>' : flag(v) + '<span>' + esc(cname(v)) + '</span>';
    else label = '<span class="ph">' + esc(mode === 'dial' ? '+' : t('ph.select')) + '</span>';
    return '<div class="combo ' + mode + (v ? ' has-val' : '') + '" data-combo="' + esc(path) + '" data-mode="' + mode + '">' +
      '<button type="button" class="inp combo-btn" id="' + id + '" aria-haspopup="listbox" aria-expanded="false"' + (desc || '') + (err ? ' aria-invalid="true"' : '') + '>' + label + CHEV + '</button></div>';
  }
  var openCombo = null;
  function closeCombo() {
    if (!openCombo) return;
    $$('.has-open').forEach(function (e) { e.classList.remove('has-open'); });
    var p = $('.combo-panel', openCombo);
    if (p) p.remove();
    $('.combo-btn', openCombo).setAttribute('aria-expanded', 'false');
    openCombo = null;
  }
  function openComboFor(el) {
    closeCombo();
    openCombo = el;
    var mode = el.getAttribute('data-mode');
    var btn = $('.combo-btn', el);
    btn.setAttribute('aria-expanded', 'true');
    var panel = document.createElement('div');
    panel.className = 'combo-panel';
    var path0 = el.getAttribute('data-combo');
    var optList = mode === 'opts' ? (OPTS[path0] || []) : null;
    var searchable = !optList || optList.length > 10;
    panel.innerHTML = (searchable ? '<div class="combo-search-w"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="9" cy="9" r="5.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="m13.2 13.2 3.3 3.3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg><input class="combo-search" type="search" placeholder="' + esc(t('ph.search')) + '" aria-label="' + esc(t('ph.search')) + '" autocomplete="off"></div>' : '') +
      '<ul class="combo-list" role="listbox" tabindex="-1"></ul>';
    el.appendChild(panel);
    ['.field', '.sec', '.rep-item', '.file-field'].forEach(function (sel) { var a = el.closest(sel); if (a) a.classList.add('has-open'); });
    var rb = btn.getBoundingClientRect(), below = window.innerHeight - rb.bottom, above = rb.top;
    if (below < (optList && !searchable ? Math.min(340, optList.length * 46 + 30) : 360) && above > below) panel.classList.add('up');
    var input = $('.combo-search', panel);
    var list = $('.combo-list', panel);
    var cur = getVal(el.getAttribute('data-combo'));
    function row(c) {
      var name = c[LANG_IDX[state.lang]];
      return '<li role="option" data-cc="' + c[0] + '" aria-selected="' + (c[0] === cur) + '">' + flag(c[0]) + '<span class="nm">' + esc(name) + '</span>' + (mode === 'dial' && c[4] ? '<span class="code">+' + c[4] + '</span>' : '') + '</li>';
    }
    function optRow(o, i) {
      return '<li role="option" data-cc="' + esc(o[0]) + '" aria-selected="' + (o[0] === cur) + '" style="--i:' + Math.min(i, 12) + '"><span class="nm">' + esc(o[1]) + '</span><span class="tick" aria-hidden="true"></span></li>';
    }
    function draw(q) {
      if (optList) {
        var qq = (q || '').trim().toLowerCase();
        var hit = optList.filter(function (o) { return !qq || o[1].toLowerCase().indexOf(qq) > -1; });
        list.innerHTML = hit.length ? hit.map(optRow).join('') : '<li class="empty" role="presentation">' + esc(t('m.noResults')) + '</li>';
        var sel = $('li[aria-selected="true"]', list) || $('li[data-cc]', list);
        if (sel) { sel.classList.add('act'); if (!qq) sel.scrollIntoView({ block: 'nearest' }); }
        return;
      }
      q = (q || '').trim().toLowerCase().replace(/^\+/, '');
      var match = function (c) {
        if (!q) return true;
        return c[1].toLowerCase().indexOf(q) > -1 || c[2].toLowerCase().indexOf(q) > -1 || c[3].toLowerCase().indexOf(q) > -1 || c[0].toLowerCase() === q || (c[4] && c[4].indexOf(q) === 0);
      };
      var pool = COUNTRIES.filter(function (c) { return (mode !== 'dial' || c[4]) && match(c); });
      var sorted = pool.slice().sort(function (a, b) { return a[LANG_IDX[state.lang]].localeCompare(b[LANG_IDX[state.lang]], state.lang); });
      var html = '';
      if (!q) {
        var pri = CFG.PRIORITY_COUNTRIES.map(function (cc) { return CMAP[cc]; }).filter(Boolean);
        html += '<li class="grp" role="presentation">' + esc(t('m.common')) + '</li>' + pri.map(row).join('') + '<li class="grp" role="presentation">' + esc(t('m.all')) + '</li>';
      }
      html += sorted.map(row).join('');
      if (!pool.length) html = '<li class="empty" role="presentation">' + esc(t('m.noResults')) + '</li>';
      list.innerHTML = html;
      var first = $('li[data-cc]', list);
      if (first) first.classList.add('act');
    }
    draw('');
    if (input) input.addEventListener('input', function () { draw(input.value); });
    panel.addEventListener('keydown', function (e) {
      var items = $$('li[data-cc]', list), i = items.indexOf($('li.act', list));
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (i > -1) items[i].classList.remove('act');
        i = e.key === 'ArrowDown' ? Math.min(items.length - 1, i + 1) : Math.max(0, i - 1);
        if (items[i]) { items[i].classList.add('act'); items[i].scrollIntoView({ block: 'nearest' }); }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (items[i]) pickCountry(el, items[i].getAttribute('data-cc'));
      } else if (e.key === 'Escape') { e.stopPropagation(); closeCombo(); btn.focus(); }
      else if (e.key === 'Tab') { closeCombo(); }
    });
    list.addEventListener('click', function (e) {
      var li = e.target.closest('li[data-cc]');
      if (li) pickCountry(el, li.getAttribute('data-cc'));
    });
    list.addEventListener('mousemove', function (e) {
      var li = e.target.closest('li[data-cc]');
      if (li && !li.classList.contains('act')) { $$('li.act', list).forEach(function (x) { x.classList.remove('act'); }); li.classList.add('act'); }
    });
    setTimeout(function () { (input || list).focus({ preventScroll: true }); }, 10);
  }
  function pickCountry(el, cc) {
    var path = el.getAttribute('data-combo');
    closeCombo();
    onValue(path, cc, true);
  }

  /* ---------- اقتراحات الكتابة (قائمة تظهر أسفل الحقل أثناء الكتابة، مع السماح بأي قيمة أخرى) */
  /* المناطق والمدن: من places.js حسب الدولة المختارة (والمدن حسب المنطقة إن عُرفت) */
  function placeOf(cc) { var P = window.PLACES || {}; return P[cc] || (CFG.REGIONS && CFG.REGIONS[cc] ? { r: CFG.REGIONS[cc].map(function (n) { return [n, []]; }) } : null); }
  function regionMatch(pl, name) {
    var q = sugNorm(name); if (!pl || !q) return null;
    return pl.r.filter(function (r) { return sugNorm(r[0]) === q; })[0] || null;
  }
  function allCities(pl) {
    var seen = {}, out = [];
    pl.r.forEach(function (r) { r[1].forEach(function (c) { if (!seen[c]) { seen[c] = 1; out.push(c); } }); });
    (pl.c || []).forEach(function (c) { if (!seen[c]) { seen[c] = 1; out.push(c); } });
    return out.sort(function (a, b) { return a.localeCompare(b, 'ar'); });
  }
  function sugItems(key) {
    if (key === 'langs') return t('langs.list').split('|');
    var p = String(key || '').split('|'), pl = placeOf(p[1]);
    if (!pl) return [];
    if (p[0] === 'reg') return pl.r.map(function (r) { return r[0]; });
    if (p[0] === 'city') { var rg = regionMatch(pl, p[2]); return rg && rg[1].length ? rg[1].concat(pl.c || []) : allCities(pl); }
    return [];
  }
  var REGION_OF = { workOffice: ['workRegion', 'workCountry'], addrCity: ['addrRegion', 'addrCountry'] };
  var DEP_OF = { workCountry: ['workRegion', 'workOffice'], addrCountry: ['addrRegion', 'addrCity'], homeCountry: ['homeCity'], birthCountry: ['birthCity'] };
  function sugKeyOf(inp) { var f = FIELD[inp.getAttribute('data-path')]; return f && f.list ? 'langs' : (f && f.listFn ? f.listFn(state.data) : inp.getAttribute('data-sug')); }
  function sugNorm(x) {
    return String(x || '').toLowerCase().replace(/[\u064B-\u0652\u0640]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي')
      .replace(/^(منطقه|محافظه|المنطقه)\s+/, '').replace(/[\s'’`-]+/g, ' ').trim();
  }
  var sugOpen = null;
  function closeSug() {
    if (!sugOpen) return;
    if (!document.body.contains(sugOpen)) { sugOpen = null; return; }
    var p = sugOpen.parentNode && $('.sug-panel', sugOpen.parentNode);
    if (p) p.remove();
    sugOpen.setAttribute('aria-expanded', 'false');
    ['.field', '.sec', '.rep-item'].forEach(function (sel) { var a = sugOpen.closest(sel); if (a) a.classList.remove('has-open'); });
    sugOpen = null;
  }
  function showSug(inp) {
    var items = sugItems(sugKeyOf(inp));
    if (!items.length) { closeSug(); return; }
    var q = sugNorm(inp.value);
    var hit = items.filter(function (x) { var n = sugNorm(x); return !q || n.indexOf(q) > -1; });
    hit.sort(function (a, b) { var na = sugNorm(a), nb = sugNorm(b); return (q ? (na.indexOf(q) === 0 ? 0 : 1) - (nb.indexOf(q) === 0 ? 0 : 1) : 0); });
    if (hit.length > 150) hit = hit.slice(0, 150);
    var exact = hit.length === 1 && sugNorm(hit[0]) === q;
    var w = inp.parentNode, panel = $('.sug-panel', w);
    if (exact) autoRegion(inp.getAttribute('data-path'), hit[0]);
    if (!hit.length || exact) { if (panel) panel.remove(); inp.setAttribute('aria-expanded', 'false'); return; }
    if (sugOpen && sugOpen !== inp) closeSug();
    if (!panel) {
      panel = document.createElement('ul'); panel.className = 'sug-panel'; panel.setAttribute('role', 'listbox');
      panel.id = inp.id + '-sug'; inp.setAttribute('aria-controls', panel.id);
      w.appendChild(panel);
      panel.addEventListener('mousedown', function (e) { e.preventDefault(); });
      panel.addEventListener('click', function (e) { var li = e.target.closest('li[data-v]'); if (li) pickSug(inp, li.getAttribute('data-v')); });
    }
    var rb = inp.getBoundingClientRect();
    panel.classList.toggle('up', window.innerHeight - rb.bottom < 250 && rb.top > window.innerHeight - rb.bottom);
    panel.innerHTML = hit.map(function (x, i) { return '<li role="option" id="' + inp.id + '-o' + i + '" data-v="' + esc(x) + '"' + (i === 0 && q ? ' class="act"' : '') + '>' + esc(x) + '</li>'; }).join('');
    inp.setAttribute('aria-expanded', 'true');
    ['.field', '.sec', '.rep-item'].forEach(function (sel) { var a = inp.closest(sel); if (a) a.classList.add('has-open'); });
    sugOpen = inp;
  }
  /* اختيار مدينة دون منطقة: تُملأ المنطقة تلقائيًا إن كانت المدينة تتبع منطقة واحدة */
  function autoRegion(path, v) {
    var ro = REGION_OF[path];
    if (ro && !String(state.data[ro[0]] || '').trim()) {
      var pl = placeOf(state.data[ro[1]]);
      var hits = pl ? pl.r.filter(function (r) { return r[1].indexOf(v) > -1; }) : [];
      if (hits.length === 1) {
        onValue(ro[0], hits[0][0], false);
        var ri = document.getElementById('f-' + ro[0]); if (ri) ri.value = hits[0][0];
      }
    }
  }
  function pickSug(inp, v) {
    inp.value = v;
    var path = inp.getAttribute('data-path');
    onValue(path, v, false);
    autoRegion(path, v);
    var fe = inp.closest('.field');
    if (fe && fe.classList.contains('has-err')) { fe.classList.remove('has-err'); inp.removeAttribute('aria-invalid'); var er = $('.err', fe); if (er) er.textContent = ''; }
    closeSug();
  }

  /* ---------- المرفقات */
  function fileFieldHTML(f, hidden, err) {
    var files = state.files[f.k] || [];
    var id = 'f-' + f.k;
    var accept = f.photo ? 'image/jpeg,image/png,image/webp' : 'image/jpeg,image/png,image/webp,application/pdf';
    var h = '<div class="field w-full file-field' + (f.photo ? ' is-photo' : '') + (err ? ' has-err' : '') + '" data-field="' + f.k + '"' + hidden + '>';
    h += '<div class="ff-head"><span class="lbl" id="' + id + '-lbl">' + esc(lblText(f)) + reqMark(f) + condTag(f) + '</span>';
    h += '<span class="ff-accept">' + esc(f.photo ? t('m.acceptPhoto') : t('m.accept', { n: CFG.MAX_FILE_MB })) + '</span></div>';
    var fh = hintText(f);
    if (fh) h += '<p class="hint">' + esc(fh) + '</p>';
    if (f.photo) {
      var pf = files[0];
      h += '<div class="photo-row"><div class="photo-frame' + (pf ? ' has' : '') + '">' +
        (pf ? '<img src="' + pf.thumb + '" alt="">' : '<svg viewBox="0 0 70 90" aria-hidden="true"><ellipse cx="35" cy="38" rx="17" ry="22" fill="none" stroke="currentColor" stroke-dasharray="3 3"/><path d="M8 90c2-16 13-24 27-24s25 8 27 24" fill="none" stroke="currentColor" stroke-dasharray="3 3"/></svg>') +
        '<span class="pf-size">35 × 45 mm</span></div><div class="photo-side">';
      if (pf && pf.bg) h += '<p class="chip ' + (pf.bg === 'ok' ? 'ok' : 'warn') + '">' + esc(t(pf.bg === 'ok' ? 'm.photoBgOk' : 'm.photoBgWarn')) + '</p>';
      else h += '<p class="hint">' + esc(t('m.photoGuide')) + '</p>';
      h += dropHTML(f, id, accept, files) + '</div></div>';
    } else {
      h += '<ul class="thumbs">' + files.map(function (fl, i) {
        return '<li>' + (fl.thumb ? '<img src="' + fl.thumb + '" alt="">' : '<span class="pdf">PDF</span>') +
          '<span class="fn" dir="ltr">' + esc(fl.origName) + '</span><span class="fs">' + Math.max(1, Math.round(fl.size / 1024)) + ' KB</span>' +
          '<button type="button" class="link danger" data-rmfile="' + f.k + '" data-i="' + i + '">' + esc(t('b.removeFile')) + '</button></li>';
      }).join('') + '</ul>';
      h += dropHTML(f, id, accept, files);
    }
    h += '<p class="err" id="' + id + '-err" role="alert">' + (err ? esc(typeof err === 'object' ? t(err.k, err.vars) : t(err)) : '') + '</p></div>';
    return h;
  }
  function dropHTML(f, id, accept, files) {
    if (files.length >= f.max && !f.photo) return '';
    var label = f.photo && files.length ? t('b.choose') : (files.length ? t('b.chooseMore') : t('b.choose'));
    return '<label class="drop" for="' + id + '"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 13V4m0 0L6.5 7.5M10 4l3.5 3.5M4 13.5v1A1.5 1.5 0 0 0 5.5 16h9a1.5 1.5 0 0 0 1.5-1.5v-1" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg><span>' + esc(label) + '</span>' +
      '<input type="file" id="' + id + '" data-file="' + f.k + '" accept="' + accept + '"' + (f.max > 1 ? ' multiple' : '') + ' aria-describedby="' + id + '-err"></label>';
  }
  function readAsDataURL(file) {
    return new Promise(function (res, rej) { var r = new FileReader(); r.onload = function () { res(r.result); }; r.onerror = rej; r.readAsDataURL(file); });
  }
  function loadImg(src) {
    return new Promise(function (res, rej) { var im = new Image(); im.onload = function () { res(im); }; im.onerror = rej; im.src = src; });
  }
  function checkWhiteBg(img) {
    var c = document.createElement('canvas'), w = 60, h = 75;
    c.width = w; c.height = h;
    var x = c.getContext('2d');
    x.drawImage(img, 0, 0, w, h);
    var px = x.getImageData(0, 0, w, h).data, sum = 0, sat = 0, n = 0;
    for (var yy = 0; yy < h; yy++) {
      for (var xx = 0; xx < w; xx++) {
        var edge = yy < h * 0.14 || ((xx < w * 0.12 || xx > w * 0.88) && yy < h * 0.7);
        if (!edge) continue;
        var i = (yy * w + xx) * 4, r = px[i], g = px[i + 1], b = px[i + 2];
        var mx = Math.max(r, g, b), mn = Math.min(r, g, b);
        sum += (r * 0.299 + g * 0.587 + b * 0.114); sat += mx ? (mx - mn) / mx : 0; n++;
      }
    }
    return (sum / n > 205 && sat / n < 0.14) ? 'ok' : 'warn';
  }
  function processFile(file, f) {
    var maxB = CFG.MAX_FILE_MB * 1048576;
    var isImg = /^image\//.test(file.type) || /\.(jpe?g|png|webp|heic)$/i.test(file.name);
    var isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
    if (!(isImg || (isPdf && !f.photo))) return Promise.reject({ k: 'e.fileType' });
    if (isPdf) {
      if (file.size > maxB) return Promise.reject({ k: 'e.fileSize', vars: { n: CFG.MAX_FILE_MB } });
      return readAsDataURL(file).then(function (u) {
        return { origName: file.name, name: file.name, mime: 'application/pdf', b64: u.split(',')[1], size: file.size, thumb: '' };
      });
    }
    if (file.size > 25 * 1048576) return Promise.reject({ k: 'e.fileSize', vars: { n: 25 } });
    var url = URL.createObjectURL(file);
    return loadImg(url).then(function (img) {
      var maxSide = f.photo ? 1000 : 1800;
      var s = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
      var c = document.createElement('canvas');
      c.width = Math.round(img.naturalWidth * s); c.height = Math.round(img.naturalHeight * s);
      var x = c.getContext('2d');
      x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
      x.drawImage(img, 0, 0, c.width, c.height);
      var data = c.toDataURL('image/jpeg', 0.85);
      var tc = document.createElement('canvas'), ts = Math.min(1, 240 / Math.max(c.width, c.height));
      tc.width = Math.round(c.width * ts); tc.height = Math.round(c.height * ts);
      tc.getContext('2d').drawImage(c, 0, 0, tc.width, tc.height);
      var bytes = Math.round((data.length - 23) * 0.75);
      URL.revokeObjectURL(url);
      if (bytes > maxB) throw { k: 'e.fileSize', vars: { n: CFG.MAX_FILE_MB } };
      return {
        origName: file.name, name: file.name.replace(/\.[^.]+$/, '') + '.jpg', mime: 'image/jpeg', b64: data.split(',')[1],
        size: bytes, thumb: tc.toDataURL('image/jpeg', 0.8), bg: f.photo ? checkWhiteBg(img) : null
      };
    }, function () { URL.revokeObjectURL(url); throw { k: 'e.fileType' }; });
  }
  function onFiles(k, list) {
    var f = FIELD[k];
    var arr = Array.prototype.slice.call(list);
    if (f.photo) arr = arr.slice(0, 1);
    var room = f.photo ? 1 : f.max - (state.files[k] || []).length;
    arr = arr.slice(0, Math.max(0, room));
    var wrap = $('[data-field="' + k + '"]');
    if (wrap) wrap.classList.add('busy');
    Promise.all(arr.map(function (file) { return processFile(file, f); })).then(function (res) {
      state.files[k] = f.photo ? res : (state.files[k] || []).concat(res);
      state.errors[k] = '';
    }, function (e) {
      state.errors[k] = e && e.k ? e : 'e.fileType';
    }).then(function () { rerenderField(k); updateNav(); });
  }

  /* ---------- الحقول المتكررة */
  function repeaterHTML(f, hidden) {
    var items = state.data[f.k] || [];
    var h = '<div class="field w-full rep' + (f.compact ? ' compact' : '') + '" data-field="' + f.k + '"' + hidden + '><ol class="rep-list">';
    items.forEach(function (item, i) {
      h += '<li class="rep-item"><div class="rep-head"><span class="rep-n">' + (state.lang === 'ar' ? arDigits(i + 1) : i + 1) + '</span>' +
        (items.length > f.min ? '<button type="button" class="link danger" data-rep-rm="' + f.k + '" data-i="' + i + '">' + esc(t('b.remove')) + '</button>' : '') + '</div><div class="grid">';
      f.fields.forEach(function (sf) { h += fieldHTML(sf, 'rep:' + f.k + ':' + i + ':' + sf.k, item); });
      h += '</div></li>';
    });
    h += '</ol><button type="button" class="btn ghost add" data-rep-add="' + f.k + '"><span aria-hidden="true">+</span> ' + esc(t(f.add)) + '</button></div>';
    return h;
  }

  /* ---------------------------------------------------------- رسم الصفحة */
  function renderStatic() {
    var L = state.lang;
    document.documentElement.lang = L;
    document.documentElement.dir = t('dir');
    document.title = t('app.title') + ' · ' + CFG.ORG[L];
    $('#brandTitle').textContent = t('app.title');
    $('#brandDept').textContent = t('app.dept') + ' · ' + CFG.ORG[L];
    $('#mainLogo').setAttribute('alt', CFG.MAIN_LOGO.name[L]);
    $$('#langSwitch [data-lang]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === L)); });
    $('#langNow').textContent = DICT[L]['lang.name'];
    $('#langSwitch').setAttribute('aria-label', t('m.lang'));
    themeLabel();
    $('.lang-toggle').setAttribute('aria-label', t('m.lang') + ': ' + DICT[L]['lang.name']);
    $('#footPrivacy').textContent = t('m.privacy');
    $('#hrBtnLbl').textContent = ({ ar: 'الموارد البشرية', en: 'HR', id: 'SDM' })[L];
    $('#hrBtn').setAttribute('title', ({ ar: 'لوحة بيانات الموارد البشرية (برمز دخول)', en: 'HR data dashboard (access code required)', id: 'Dasbor data SDM (perlu kode akses)' })[L]);
    $('#btnHomeLbl').textContent = ({ ar: 'رجوع', en: 'Back', id: 'Kembali' })[L];
    $('#btnHome').setAttribute('aria-label', ({ ar: 'رجوع إلى الصفحة الرئيسية', en: 'Back to the home page', id: 'Kembali ke beranda' })[L]);
  }

  var LOGO_STATE = {};
  var THEME_TX = { ar: ['الوضع الليلي', 'الوضع النهاري'], en: ['Night mode', 'Day mode'], id: ['Mode malam', 'Mode siang'] };
  function themeLabel() {
    var b = $('#themeBtn'); if (!b) return;
    var dark = document.documentElement.getAttribute('data-theme') === 'dark', l = THEME_TX[state.lang][dark ? 1 : 0];
    b.setAttribute('aria-label', l); b.title = l;
    var m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute('content', dark ? '#16294a' : '#16294a');
  }
  function langOpen(on) {
    var sw = $('#langSwitch');
    sw.classList.toggle('open', on);
    $('.lang-toggle', sw).setAttribute('aria-expanded', String(on));
    $$('.lang-opts button', sw).forEach(function (b) { b.tabIndex = on ? 0 : -1; });
  }

  var revealIO = null;
  function reveal(root) {
    var els = $$('[data-reveal]:not(.in)', root || document);
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    if (!revealIO) revealIO = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); revealIO.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (e) { revealIO.observe(e); });
  }
  function logoImg(l, cls, alt, white) {
    var LG = window.BONYAN_LOGOS || {};
    var d = LG[white && l.white ? l.white : l.logo];
    if (!d) return '<span class="' + cls + ' logo-fallback">' + esc(alt) + '</span>';
    return '<img class="' + cls + '" src="' + d.src + '" width="' + d.w + '" height="' + d.h + '" alt="' + esc(alt) + '" decoding="async">';
  }
  /* ---------------------------------------------------------- بطاقة المنسوب الحيّة */
  function mrzClean(s) { return String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '<'); }
  function yymmdd(iso) { return iso ? iso.slice(2, 4) + iso.slice(5, 7) + iso.slice(8, 10) : '<<<<<<'; }
  function pad(s, n) { s = s.slice(0, n); while (s.length < n) s += '<'; return s; }
  function latinName(d) { return [d.firstName, d.fatherName, d.grandName, d.lastName].filter(Boolean).join(' ').toUpperCase(); }
  function arabicName(d) { return [d.firstNameAr, d.fatherNameAr, d.grandNameAr, d.lastNameAr].filter(Boolean).join(' '); }
  var EX_ICON = '<svg class="ex-ic" viewBox="0 0 20 20" aria-hidden="true"><rect x="2.5" y="4.5" width="15" height="10" rx="2"/><path d="M6 17.5h8M10 7v4.5m0 0-2-2m2 2 2-2"/></svg>';
  function cardData() {
    var d = state.data, L = state.lang;
    var ent = CFG.ENTITIES.filter(function (x) { return x.v === d.entity; })[0];
    var EL = window.ENTITY_LOGOS || {};
    var st0 = startOf(d), ref = (state.result && state.result.ref) || ('BNY-HR-' + (d.workCountry || '••') + '-' + new Date().getFullYear() + '-••••');
    return {
      d: d, L: L, ent: ent, showEnt: ent && ent.v !== 'other',
      th: ent && ent.colors ? ent.colors : ['#2B3155', '#191D38', '#D9B67F'],
      el: ent && ent.logo && EL[ent.logo], em: ent && ent.mark && EL[ent.mark],
      entName: ent ? (ent.v === 'other' ? (d.entityOther || ent[L]) : ent[L]) : '',
      latin: latinName(d), nameAr: arabicName(d), st0: st0, svc: svcLen(st0), ref: ref,
      photo: (state.files.photo || [])[0],
      l1: pad('P<' + mrzClean(d.nationality || '') + mrzClean(d.lastName || '') + '<<' + mrzClean([d.firstName, d.fatherName, d.grandName].filter(Boolean).join(' ')), 36),
      l2: pad(mrzClean(d.passportNo || '') + '<' + mrzClean(d.nationality || '') + yymmdd(d.birthDate) + (d.gender === 'female' ? 'F' : (d.gender === 'male' ? 'M' : '<')) + yymmdd(d.passportExpiry) + '<BONYANHR', 36),
      emerg: d.em1Name ? d.em1Name + (d.em1Phone ? ' · +' + dialOf(d.em1PhoneDial) + ' ' + d.em1Phone : '') : '—',
      blood: d.bloodType ? optLabel(FIELD.bloodType, d.bloodType) : '—'
    };
  }
  function cardHTML() {
    var d = state.data, L = state.lang;
    var latin = latinName(d), nameAr = arabicName(d), st0 = startOf(d), svc = svcLen(st0);
    var ent = CFG.ENTITIES.filter(function (x) { return x.v === d.entity; })[0];
    var photo = (state.files.photo || [])[0];
    var ref = (state.result && state.result.ref) || ('BNY-HR-' + (d.workCountry || '••') + '-' + new Date().getFullYear() + '-••••');
    var l1 = pad('P<' + mrzClean(d.nationality || '') + mrzClean(d.lastName || '') + '<<' + mrzClean([d.firstName, d.fatherName, d.grandName].filter(Boolean).join(' ')), 36);
    var l2 = pad(mrzClean(d.passportNo || '') + '<' + mrzClean(d.nationality || '') + yymmdd(d.birthDate) + (d.gender === 'female' ? 'F' : (d.gender === 'male' ? 'M' : '<')) + yymmdd(d.passportExpiry) + '<BONYANHR', 36);
    var em = d.em1Name ? d.em1Name + (d.em1Phone ? ' · +' + dialOf(d.em1PhoneDial) + ' ' + d.em1Phone : '') : '—';
    var mainLogo = logoImg(CFG.MAIN_LOGO, 'ic-logo-img', CFG.MAIN_LOGO.name[L], true);
    var th = ent && ent.colors ? ent.colors : ['#2B3155', '#191D38', '#D9B67F'];
    var EL = window.ENTITY_LOGOS || {}, el = ent && ent.logo && EL[ent.logo];
    var showEnt = ent && ent.v !== 'other';
    var entName = ent ? (ent.v === 'other' ? (d.entityOther || ent[L]) : ent[L]) : '';
    var emk = ent && ent.mark && EL[ent.mark];
    var plate = showEnt ? (el ? '<span class="ic-plate' + (emk ? ' sq' : '') + '" title="' + esc(ent[L]) + '"><img src="' + (emk || el).src + '" alt="' + esc(ent[L]) + '"></span>' : '<span class="ic-plate txt">' + esc(ent[L]) + '</span>') : '';
    var top = showEnt
      ? plate + '<span class="ic-kind">' + esc(t('card.kind')) + '<b>STAFF · HR</b></span><span class="ic-bny">' + mainLogo + '</span>'
      : '<span class="ic-logo">' + mainLogo + '</span><span class="ic-kind">' + esc(t('card.kind')) + '<b>STAFF · HR</b></span><span class="ic-holo" aria-hidden="true"></span>';
    var wmL = (window.BONYAN_LOGOS || {}).markWhite;
    var wm = (showEnt && el) ? '<span class="ic-wm ent" aria-hidden="true"><img src="' + el.src + '" alt=""></span>' : (wmL ? '<span class="ic-wm" aria-hidden="true"><img src="' + wmL.src + '" alt=""></span>' : '');
    var fit = function (txt, n, big, small) { var l = (txt || '').length; return l > n ? ' style="font-size:' + Math.max(small, big * n / l).toFixed(3) + 'rem"' : ''; };
    return '<div class="idcard' + (showEnt ? ' has-ent' : '') + '" style="--c1:' + th[0] + ';--c2:' + th[1] + ';--ca:' + th[2] + '" tabindex="0" role="button" aria-label="' + esc(t('card.flip')) + '"><div class="idcard-in">' +
      '<div class="face front"><div class="ic-guil" aria-hidden="true"></div>' +
        '<div class="ic-top">' + top + '</div>' +
        '<div class="ic-body"><div class="ic-photo">' + (photo ? '<img src="' + photo.thumb + '" alt="">' : '<svg viewBox="0 0 70 90" aria-hidden="true"><circle cx="35" cy="34" r="15" fill="currentColor"/><path d="M6 90c2-18 14-28 29-28s27 10 29 28z" fill="currentColor"/></svg>') + '</div>' +
          '<div class="ic-info">' +
          (nameAr || !latin
            ? '<p class="ic-name-ar' + (nameAr ? '' : ' ph') + '" dir="rtl"' + fit(nameAr, 22, 1.12, .74) + '>' + esc(nameAr || t('card.nameAr')) + '</p>' +
              '<p class="ic-name-en' + (latin ? '' : ' ph') + '" dir="ltr"' + fit(latin, 30, .62, .48) + '>' + esc(latin || t('card.name')) + '</p>'
            : '<p class="ic-name-ar ic-latin" dir="ltr"' + fit(latin, 20, .98, .6) + '>' + esc(latin) + '</p>') +
          '<p class="ic-role' + (d.jobTitle ? '' : ' ph') + '">' + esc(d.jobTitle || t('card.role')) + '</p>' +
          '<p class="ic-ent' + (ent ? '' : ' ph') + '">' + esc(ent ? entName : t('card.entity')) + '</p>' +
          (svc ? '<p class="ic-svc"><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8.5" r="6"/><path d="M8 5v3.6l2.2 1.4M6.5 1.5h3"/></svg><span>' + esc(svcLine(st0)) + '</span></p>' : '') +
          (d.workCountry ? '<p class="ic-loc">' + flag(d.workCountry) + '<span>' + esc(cname(d.workCountry)) + '</span>' + (d.nationality && d.nationality !== d.workCountry ? '<span class="ic-nat">' + flag(d.nationality) + '</span>' : '') + '</p>' : '') + '</div></div>' +
        '<div class="ic-mrz" dir="ltr" aria-hidden="true"><span>' + esc(l1) + '</span><span>' + esc(l2) + '</span></div>' +
      '</div>' +
      '<div class="face back"><div class="ic-strip" aria-hidden="true"></div>' + wm.replace('ic-wm', 'ic-wm dark') +
        '<dl class="ic-back">' +
          '<div><dt>' + esc(t('card.ref')) + '</dt><dd dir="ltr" class="mono">' + esc(ref) + '</dd></div>' +
          '<div><dt>' + esc(t('card.emergency')) + '</dt><dd dir="auto">' + esc(em) + '</dd></div>' +
          '<div><dt>' + esc(t('card.blood')) + '</dt><dd>' + esc(d.bloodType ? optLabel(FIELD.bloodType, d.bloodType) : '—') + '</dd></div>' +
          '<div><dt>' + esc(t('card.passport')) + '</dt><dd>' + esc(d.passportExpiry ? fmtDate(d.passportExpiry) : '—') + '</dd></div>' +
          '<div><dt>' + esc(t('card.since')) + '</dt><dd>' + esc(st0 ? fmtDate(st0) : '—') + '</dd></div>' +
          '<div><dt>' + esc(t('card.svcT')) + '</dt><dd class="gold">' + esc(svc || '—') + '</dd></div>' +
          '<div><dt>' + esc(t('card.empNo')) + '</dt><dd dir="ltr" class="mono">' + esc(d.employeeNo || '—') + '</dd></div>' +
        '</dl><div class="ic-bars" aria-hidden="true">' + barcode(ref) + '</div>' +
      '</div></div></div>';
  }
  function barcode(s) {
    var h = '', x = 0, seed = 0;
    for (var i = 0; i < s.length; i++) seed = (seed * 31 + s.charCodeAt(i)) >>> 0;
    while (x < 236) {
      seed = (seed * 1103515245 + 12345) >>> 0;
      var w = 1 + (seed >> 16) % 3;
      h += '<i style="inset-inline-start:' + x + 'px;width:' + w + 'px"></i>';
      x += w + 1 + ((seed >> 8) % 3);
    }
    return h;
  }
  var sideRO = null;
  function fitSideCard() {
    var box = $('.side-card-box'); if (!box) return;
    if (!sideRO && window.ResizeObserver) { sideRO = new ResizeObserver(function () { fitSideCard(); }); sideRO.observe(box); }
    if (!box.offsetWidth) return;
    box.style.setProperty('--s', (box.offsetWidth / 380).toFixed(4));
    var w = $('#cardWrapSide'); if (w) w.style.setProperty('--s', (box.offsetWidth / 380).toFixed(4));
  }
  function renderCard(targetSel) {
    var wrap = $(targetSel || '#cardWrap');
    if (!wrap) return;
    var flipped = $('.idcard.flipped', wrap);
    wrap.innerHTML = cardHTML();
    if (flipped) $('.idcard', wrap).classList.add('flipped');
  }
  function bindCard() {
    document.addEventListener('pointermove', function (e) {
      var w = e.target.closest && e.target.closest('.idcard-wrap');
      if (!w || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      var r = w.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
      w.style.setProperty('--rx', (-py * 12).toFixed(2) + 'deg');
      w.style.setProperty('--ry', (px * 16).toFixed(2) + 'deg');
      w.style.setProperty('--gx', ((px + 0.5) * 100).toFixed(1) + '%');
      w.style.setProperty('--gy', ((py + 0.5) * 100).toFixed(1) + '%');
    });
    document.addEventListener('pointerout', function (e) {
      var w = e.target.closest && e.target.closest('.idcard-wrap');
      if (w && !w.contains(e.relatedTarget)) { w.style.setProperty('--rx', '0deg'); w.style.setProperty('--ry', '0deg'); }
    });
    document.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('idcard')) { e.preventDefault(); e.target.classList.toggle('flipped'); }
    });
  }

  /* ---------------------------------------------------------- احتفال */
  function confetti() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var c = document.createElement('canvas');
    c.className = 'confetti';
    document.body.appendChild(c);
    var dpr = Math.min(2, window.devicePixelRatio || 1), W = innerWidth, H = innerHeight;
    c.width = W * dpr; c.height = H * dpr;
    var x = c.getContext('2d'); x.scale(dpr, dpr);
    var cols = ['#E8C480', '#9C7432', '#143D66', '#8DB8E6', '#FFFFFF', '#1E7A52'];
    var P = [];
    for (var i = 0; i < 160; i++) {
      var left = i % 2 === 0;
      P.push({ x: left ? -10 : W + 10, y: H * (0.35 + Math.random() * 0.3), vx: (left ? 1 : -1) * (4 + Math.random() * 7), vy: -(6 + Math.random() * 9),
        s: 5 + Math.random() * 7, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, c: cols[i % cols.length], sh: i % 3 });
    }
    var start = performance.now();
    (function tick(now) {
      var el = now - start;
      x.clearRect(0, 0, W, H);
      P.forEach(function (p) {
        p.vy += 0.22; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.globalAlpha = Math.max(0, 1 - el / 3200); x.fillStyle = p.c;
        if (p.sh === 0) x.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
        else if (p.sh === 1) { x.beginPath(); x.arc(0, 0, p.s / 3, 0, 6.3); x.fill(); }
        else { x.beginPath(); x.moveTo(0, -p.s / 2); x.lineTo(p.s / 2, p.s / 2); x.lineTo(-p.s / 2, p.s / 2); x.fill(); }
        x.restore();
      });
      if (el < 3300) requestAnimationFrame(tick); else c.remove();
    })(start);
  }

  function countUp(root) {
    $$('[data-count]', root).forEach(function (el) {
      var to = +el.getAttribute('data-count'), t0 = null;
      var fmt = function (n) { return state.lang === 'ar' ? arDigits(n) : String(n); };
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = fmt(to); return; }
      (function step(ts) {
        if (!t0) t0 = ts;
        var k = Math.min(1, (ts - t0) / 1400), e = 1 - Math.pow(1 - k, 3);
        el.textContent = fmt(Math.round(to * e));
        if (k < 1) requestAnimationFrame(step);
      })(performance.now());
    });
  }
  function renderMainLogo() {
    var nm = CFG.MAIN_LOGO.name[state.lang];
    $('#logoBox').innerHTML = logoImg(CFG.MAIN_LOGO, 'main-logo', nm, true).replace('<img ', '<img id="mainLogo" ');
    $('#footLogo').innerHTML = logoImg(CFG.MAIN_LOGO, 'foot-logo', nm, true);
  }
  function hasProgress() {
    if (state.maxStep > 0) return true;
    return Object.keys(state.data).some(function (k) { var v = state.data[k]; return typeof v === 'string' && v && ['waSame', 'hasOtherNat', 'startDiff'].indexOf(k) < 0; });
  }

  function renderStepper() {
    var n = STEPS.length;
    $('#stepper').innerHTML = STEPS.map(function (st, i) {
      var done = state.checked[i] && i !== state.step;
      var cls = i === state.step ? 'cur' : (done ? 'done' : (i <= state.maxStep ? 'seen' : ''));
      if (done && state.justDone === i) cls += ' stamp-in';
      var num = state.lang === 'ar' ? arDigits(i + 1) : String(i + 1);
      var can = PREVIEW || i <= state.maxStep;
      return '<li class="' + cls + '" style="--i:' + i + '"><button type="button" data-goto="' + i + '"' + (can ? '' : ' disabled') + (i === state.step ? ' aria-current="step"' : '') + '>' +
        '<span class="sn">' + num + '</span>' +
        '<span class="st">' + esc(t('st.' + st.id)) + '</span>' +
        (done ? '<span class="stamp" aria-hidden="true">' + esc(t('m.stamp')) + '</span>' : '') + '</button></li>';
    }).join('');
    state.justDone = null;
    $('#blocks').innerHTML = STEPS.map(function (st, i) {
      var c = i === state.step ? 'cur' : (state.checked[i] ? 'done' : '');
      return '<i class="' + c + '" style="--i:' + i + '" title="' + esc(t('st.' + st.id)) + '"></i>';
    }).join('');
    $('#progLabel').textContent = t('m.stepOf', { i: state.step + 1, n: n });
  }

  function renderStep() {
    var st = STEPS[state.step];
    document.body.setAttribute('data-step', st.id);
    var html = (PREVIEW ? '<div class="pv-bar"><span class="pv-ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/></svg></span>' +
      '<p><b>' + esc(t('pv.title')) + '</b>' + esc(t('pv.desc')) + '</p>' +
      '<label class="pv-sw"><input type="checkbox" id="pvAll"' + (showAllQ() ? ' checked' : '') + '><span class="sw" aria-hidden="true"></span>' + esc(t('pv.all')) + '</label></div>' : '') +
      '<header class="step-head">' +
      '<h2 id="stepTitle" tabindex="-1">' + esc(t('st.' + st.id)) + '</h2><p class="lead">' + esc(t('sd.' + st.id)) + '</p></header>';
    if (st.id === 'review') html += '<div class="review-card-box"><div class="idcard-wrap" id="cardWrapReview"></div></div>' + reviewHTML(true);
    st.sections.forEach(function (sec) {
      var hid = secShown(sec) ? '' : ' hidden';
      var sh = secHint(sec);
      html += '<section class="sec"' + hid + ' data-sec="' + sec.t + '"><h3>' + esc(secTitle(sec)) + '</h3>' + (sh ? '<p class="hint sec-hint">' + esc(sh) + '</p>' : '') + '<div class="grid' + (sec.cols === 4 ? ' g4' : '') + (sec.fields.every(function (x) { return x.type === 'rating' || x.type === 'textarea'; }) ? ' rates' : '') + '">';
      sec.fields.forEach(function (f) { html += fieldHTML(f, f.k); });
      html += '</div></section>';
    });
    var body = $('#stepBody');
    body.innerHTML = html;
    if (state.animate) {
      var rtl = document.documentElement.dir === 'rtl';
      body.style.setProperty('--dx', ((state.dir || 1) * (rtl ? -1 : 1) * 36) + 'px');
      body.classList.remove('enter'); void body.offsetWidth; body.classList.add('enter');
      state.animate = false;
    }
    if (st.id === 'review') renderCard('#cardWrapReview');
    updateNav();
  }

  function reviewHTML(editable) {
    var h = editable ? '<p class="review-lead">' + esc(t('m.reviewLead')) + '</p>' : '';
    STEPS.forEach(function (st, si) {
      if (st.id === 'review') return;
      var rows = '';
      st.sections.forEach(function (sec) {
        if (sec.show && !sec.show(state.data)) return;
        sec.fields.forEach(function (f) {
          if (!visible(f) || f.type === 'info') return;
          if (f.type === 'repeater') {
            (state.data[f.k] || []).forEach(function (item, i) {
              var parts = f.fields.map(function (sf) { return display(sf, 'rep:' + f.k + ':' + i + ':' + sf.k); }).filter(Boolean);
              if (parts.length) rows += '<div class="rv"><dt>' + esc(t('s.' + f.k)) + ' ' + esc(dispNum(i + 1)) + '</dt><dd>' + esc(parts.join(' · ')) + '</dd></div>';
            });
            return;
          }
          if (f.type === 'file') {
            var fl = state.files[f.k] || [];
            if (fl.length) rows += '<div class="rv"><dt>' + esc(lblText(f)) + '</dt><dd dir="auto">' + fl.map(function (x) { return esc(x.origName); }).join('، ') + '</dd></div>';
            return;
          }
          var v = display(f, f.k);
          if (f.k === 'currency' && state.data.currency === 'other' && state.data.currencyOther) v = state.data.currencyOther;
          if (v) rows += '<div class="rv"><dt>' + esc(lblText(f)) + '</dt><dd dir="auto">' + esc(v) + '</dd></div>';
        });
      });
      if (st.id === 'job' && state.data.hasContract === 'no') rows += '<div class="rv"><dt>' + esc(t('s.contract')) + '</dt><dd>' + esc(t('m.noContract')) + '</dd></div>';
      h += '<section class="rv-sec"><div class="rv-head"><h3>' + esc(t('st.' + st.id)) + '</h3>' + (editable ? '<button type="button" class="link" data-goto="' + si + '">' + esc(t('b.edit')) + '</button>' : '') + '</div><dl>' + rows + '</dl></section>';
    });
    if (editable) {
      h += '<section class="consents">' + ['consentTruth', 'consentData'].map(function (k) {
        var err = state.errors[k];
        return '<div class="field w-full' + (err ? ' has-err' : '') + '" data-field="' + k + '"><label class="check"><input type="checkbox" data-path="' + k + '"' + (state.data[k] ? ' checked' : '') + '><span>' + esc(t('m.' + k)) + '</span></label><p class="err" role="alert">' + (err ? esc(t(err)) : '') + '</p></div>';
      }).join('') + '</section>';
    }
    return h;
  }

  function updateNav() {
    var last = state.step === STEPS.length - 1;
    $('#btnPrev').hidden = state.step === 0;
    $('#btnPrev').textContent = t('b.prev');
    $('#btnNextLbl').textContent = last ? t('b.submit') : t('b.next');
    $('#btnNext').classList.toggle('submit', last);
  }

  function rerenderField(path) {
    var old = $('[data-field="' + path + '"]');
    if (!old) return;
    var f = FIELD[path];
    if (!f) return;
    var tmp = document.createElement('div');
    tmp.innerHTML = fieldHTML(f, path);
    old.replaceWith(tmp.firstChild);
  }

  function refreshVisibility() {
    $$('#stepBody [data-sec]').forEach(function (s) {
      var sec = null;
      STEPS[state.step].sections.forEach(function (x) { if (x.t === s.getAttribute('data-sec')) sec = x; });
      if (sec) s.hidden = !secShown(sec);
    });
    $$('#stepBody [data-field]').forEach(function (el) {
      var f = FIELD[el.getAttribute('data-field')];
      if (f) el.hidden = !visible(f);
    });
    var co = $('#f-currencyOther');
    if (co) co.hidden = !C.currencyOther(state.data) && !showAllQ();
  }

  function renderView() {
    $('#welcome').hidden = state.view !== 'welcome';
    $('#wizard').hidden = state.view !== 'wizard';
    $('#success').hidden = state.view !== 'success';
    var gf = $('.hero-glass.is-full'); if (gf) globeFull(gf, false);
    document.body.setAttribute('data-view', state.view);
    $('#btnHome').hidden = state.view === 'welcome';
    if (state.onScroll) state.onScroll();
    if (globe && state.view !== 'welcome') { globe.destroy(); globe = null; }
    if (state.view === 'welcome') renderWelcome();
    if (state.view === 'wizard') {
      $('#sideCardCap').textContent = t('card.live');
      $('#sideCardHint').textContent = t('card.flip');
      renderCard('#cardWrapSide');
      fitSideCard();
      syncUserPoint();
      loadStaffMap();
      renderStepper(); renderStep();
    }
    if (state.view === 'success') renderSuccess();
  }
  var globe = null, miniGlobe = null, staff = null;
  function globeLabel(o) { return o.name ? o.name[state.lang] : cname(o.cc); }
  function hqText(compact) { var h = CFG.HQ; return (compact ? h.short : (h.label || h.name))[state.lang]; }
  function hqTip() {
    return '<b>' + esc(CFG.HQ.name[state.lang]) + '</b>' + (CFG.SITES || []).map(function (s) { return '<span>' + esc(s.name[state.lang]) + '</span>'; }).join('');
  }
  function syncUserPoint() {
    var cc = state.data.workCountry;
    [globe, miniGlobe].forEach(function (g) { if (g) g.setUser(cc, cc ? cname(cc) : ''); });
  }
  function pointFmt(cc, d) {
    var rows = [[t('globe.tStaff'), d.n]];
    if (d.reg > 1) rows.push([t('globe.tReg'), d.reg]);
    if (d.nat > 1) rows.push([t('globe.tNat'), d.nat]);
    var html = '<b>' + flag(cc) + esc(cname(cc)) + '</b>' + rows.map(function (r) { return '<span><i>' + esc(r[0]) + '</i><em>' + esc(dispNum(r[1])) + '</em></span>'; }).join('');
    return { name: cname(cc), n: dispNum(d.n), nat: d.nat ? dispNum(d.nat) : '', tipHTML: html,
      tip: cname(cc) + ' · ' + t('globe.staffN', { n: d.n }) + (d.nat ? ' · ' + t('globe.natN', { n: d.nat }) : '') };
  }
  function applyStaff(g) {
    if (!g) return;
    g.setPoints(staff ? staff.countries : {}, pointFmt);
  }
  /* بيانات المعاينة (عند عدم ضبط رابط الخادم) — تُضاف إليها استماراتك التجريبية على هذا الجهاز */
  var DEMO_KEY = 'bonyan-hr-demo-map-v2';
  var DEMO_SEED = { SA: { n: 38, nats: ['SA', 'EG', 'SD', 'YE', 'JO', 'SY', 'PK', 'IN', 'ID'], regs: ['مكة', 'الرياض', 'الشرقية', 'المدينة'] }, EG: { n: 17, nats: ['EG', 'SD'], regs: ['القاهرة', 'الجيزة', 'الإسكندرية'] }, ID: { n: 12, nats: ['ID'], regs: ['jakarta', 'jawa barat'] },
    KE: { n: 8, nats: ['KE', 'SO'], regs: ['nairobi', 'garissa'] }, ET: { n: 9, nats: ['ET'], regs: ['addis ababa'] }, SO: { n: 3, nats: ['SO'], regs: ['mogadishu'] }, TZ: { n: 4, nats: ['TZ', 'KE'], regs: ['dar es salaam'] }, PK: { n: 2, nats: ['PK'], regs: ['karachi'] }, MY: { n: 3, nats: ['MY', 'ID'], regs: ['selangor'] } };
  function demoRaw() { try { return JSON.parse(localStorage.getItem(DEMO_KEY)) || JSON.parse(JSON.stringify(DEMO_SEED)); } catch (e) { return JSON.parse(JSON.stringify(DEMO_SEED)); } }
  function summarize(raw) {
    var out = {}, all = {}, total = 0;
    Object.keys(raw).forEach(function (cc) { var r = raw[cc]; out[cc] = { n: r.n, nat: r.nats.length, reg: (r.regs || []).length }; total += r.n; r.nats.forEach(function (x) { all[x] = 1; }); });
    return { countries: out, total: total, nationalities: Object.keys(all).length };
  }
  function normReg(s) { return String(s || '').trim().toLowerCase().replace(/^(منطقة|محافظة|provinsi|county)\s+/, '').replace(/\s+/g, ' '); }
  function demoAdd(wc, nat, reg) {
    var raw = demoRaw();
    raw[wc] = raw[wc] || { n: 0, nats: [], regs: [] };
    raw[wc].regs = raw[wc].regs || [];
    if (reg && raw[wc].regs.indexOf(normReg(reg)) < 0) raw[wc].regs.push(normReg(reg));
    raw[wc].n++;
    if (nat && raw[wc].nats.indexOf(nat) < 0) raw[wc].nats.push(nat);
    try { localStorage.setItem(DEMO_KEY, JSON.stringify(raw)); } catch (e) { }
    staff = summarize(raw);
  }
  function loadStaffMap(force) {
    if (DEMO) { staff = summarize(demoRaw()); onStaff(); return; }
    if (staff && !force) { onStaff(); return; }
    fetch(CFG.GAS_URL + '?action=countries' + (force ? '&t=' + Date.now() : '')).then(function (r) { return r.json(); }).then(function (j) {
      if (!j || !j.ok) return;
      staff = { countries: j.countries || {}, total: j.total || 0, nationalities: j.nationalities || 0 };
      onStaff();
    }).catch(function () { });
  }
  function onStaff() {
    applyStaff(globe); applyStaff(miniGlobe);
    var sum = $('#globeSum');
    if (sum && staff) sum.innerHTML = globeSumHTML();
  }
  function globeSumHTML() {
    if (!staff || !staff.total) return esc(t('globe.empty'));
    return '<span><b>' + esc(t('globe.staffN', { n: staff.total })) + '</b></span><span>· ' + esc(t('globe.inCountries', { n: Object.keys(staff.countries).length })) + '</span><span>· ' + esc(t('globe.natN', { n: staff.nationalities })) + '</span>';
  }

  var PREP_ICONS = {
    photo: '<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="10" r="3.2"/><path d="M6.5 19c.8-3 3-4.5 5.5-4.5s4.7 1.5 5.5 4.5"/>',
    passport: '<rect x="5" y="2.5" width="14" height="19" rx="2"/><circle cx="12" cy="10" r="3.6"/><path d="M8.4 10h7.2M12 6.4c1.2 1.1 1.2 6.1 0 7.2M12 6.4c-1.2 1.1-1.2 6.1 0 7.2M9 17h6"/>',
    id: '<rect x="2.5" y="5" width="19" height="14" rx="2"/><circle cx="8" cy="11" r="2.2"/><path d="M4.8 16c.6-1.6 1.8-2.4 3.2-2.4s2.6.8 3.2 2.4M14 10h5M14 13h4"/>',
    permit: '<path d="M6 2.5h8l4 4V21a.5.5 0 0 1-.5.5h-11A.5.5 0 0 1 6 21z"/><path d="M14 2.5V7h4"/><circle cx="12" cy="14" r="3.6"/><path d="m10.4 14 1.1 1.1 2.2-2.2"/>',
    contract: '<path d="M6 2.5h8l4 4V21a.5.5 0 0 1-.5.5h-11A.5.5 0 0 1 6 21z"/><path d="M14 2.5V7h4M8.5 11h7M8.5 14h5M8.5 18.2c1-1.4 1.8-1.4 2.4 0s1.4 1.4 2.4-.6"/>',
    bank: '<path d="M3 9.5 12 4l9 5.5M4.5 9.5v8M9 9.5v8M15 9.5v8M19.5 9.5v8M3 20h18"/>'
  };
  var STAT_ICONS = [
    '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.6 2.6 15.4 0 18M12 3c-2.6 2.6-2.6 15.4 0 18"/></svg>',
    '<svg viewBox="0 0 24 24"><rect x="4" y="13" width="5" height="7" rx="1"/><rect x="10" y="8" width="5" height="12" rx="1"/><rect x="16" y="3" width="5" height="17" rx="1"/></svg>',
    '<svg viewBox="0 0 24 24"><path d="M4 20V9l8-5 8 5v11M9 20v-6h6v6M2 20h20"/></svg>',
    '<svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9.5 2.5h5"/></svg>'
  ];
  function orgHTML() {
    var o = CFG.ORG[state.lang], i = o.lastIndexOf(' ');
    return i > 0 ? esc(o.slice(0, i)) + ' <span class="hl">' + esc(o.slice(i + 1)) + '</span>' : esc(o);
  }
  function renderWelcome() {
    var prep = ['photo', 'passport', 'id', 'permit', 'contract', 'bank'];
    var stats = [[CFG.LANGS.length, 'stat.langs'], [STEPS.length, 'stat.steps'], [CFG.ENTITIES.length - 1, 'stat.entities'], [12, 'stat.minutes']];
    var arrow = '<svg class="arr" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11m-4-4 4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var num = function (n) { return state.lang === 'ar' ? arDigits(n) : String(n); };
    var startLbl = esc(t(hasProgress() ? 'b.continue' : 'b.start'));
    $('#welcome').innerHTML =
      '<section class="wrap hero-sec">' +
        '<div class="hero-brand">' +
          '<span class="hero-logo rise" style="--d:0" id="heroLogo">' + logoImg(CFG.MAIN_LOGO, 'hero-logo-img', CFG.MAIN_LOGO.name[state.lang], true) + '</span>' +
          '<span class="hero-rule rise" style="--d:1" aria-hidden="true"><i></i><i></i><i></i></span>' +
          '<p class="hero-org rise" style="--d:1">' + orgHTML() + '</p>' +
        '</div>' +
        '<div class="hero rise" style="--d:2">' +
          '<span class="hero-orb o1" aria-hidden="true"></span><span class="hero-orb o2" aria-hidden="true"></span>' +
          '<div class="hero-in">' +
            '<div class="hero-text">' +
              '<p class="badge rise" style="--d:3"><span class="live" aria-hidden="true"></span>' + esc(t('hero.badge')) + '</p>' +
              '<h1 class="rise" style="--d:4"><span>' + esc(t('hero.l1')) + '</span><span class="hl">' + esc(t('hero.l2')) + '</span></h1>' +
              '<p class="lead rise" style="--d:5">' + esc(t('app.lead')) + '</p>' +
              '<div class="hero-cta rise" style="--d:6"><button type="button" class="btn gold big js-start"><span>' + startLbl + '</span>' + arrow + '</button>' +
              '<a class="btn glass big" href="#prep">' + esc(t('b.prepare')) + '</a></div>' +
            '</div>' +
            '<div class="hero-glass rise" style="--d:5">' +
              '<span class="globe-chip"><i aria-hidden="true"></i>' + esc((CFG.HQ.label || CFG.HQ.name)[state.lang]) + '</span>' +
              '<div class="hero-globe"><canvas id="globe" aria-label="' + esc(t('globe.hint')) + '" role="img"></canvas><div class="globe-tip" id="globeTip" hidden></div>' +
                '<div class="globe-ctl" role="group"><button type="button" data-gz="in" aria-label="' + esc(t('globe.zin')) + '"><svg viewBox="0 0 20 20"><path d="M10 4v12M4 10h12"/></svg></button>' +
                '<button type="button" data-gz="out" aria-label="' + esc(t('globe.zout')) + '"><svg viewBox="0 0 20 20"><path d="M4 10h12"/></svg></button>' +
                '<button type="button" data-gz="full" aria-label="' + esc(t('globe.full')) + '"><svg class="ex" viewBox="0 0 20 20"><path d="M3.5 8V3.5H8M12 3.5h4.5V8M16.5 12v4.5H12M8 16.5H3.5V12"/></svg><svg class="co" viewBox="0 0 20 20"><path d="M8 3.5V8H3.5M16.5 8H12V3.5M12 16.5V12h4.5M3.5 12H8v4.5"/></svg></button></div>' +
                '<span class="globe-zlbl" id="globeZ"></span></div>' +
              '<div class="globe-legend"><span><i class="lg-staff"></i>' + esc(t('globe.lgStaff')) + '</span><span><i class="lg-nat"></i>' + esc(t('globe.lgNat')) + '</span><span><i class="lg-hq"></i>' + esc(t('globe.lgHq')) + '</span></div>' +
              '<div class="globe-foot"><span id="globeSum">' + globeSumHTML() + '</span>' + (DEMO ? '<em class="demo-tag">' + esc(t('globe.demo')) + '</em>' : '') + '</div>' +
            '</div>' +
          '</div>' +
          '<ul class="stats">' + stats.map(function (s, i) { return '<li class="stat rise" style="--d:' + (6 + i) + '"><span class="stat-ic" aria-hidden="true">' + STAT_ICONS[i] + '</span><b data-count="' + s[0] + '">0</b><span>' + esc(t(s[1])) + '</span></li>'; }).join('') + '</ul>' +
        '</div></section>' +
      '<section class="wrap block-sec" id="prep">' +
        '<div class="sec-head" data-reveal><div class="k"><p class="eyebrow">' + esc(t('prep.eyebrow')) + '</p><h2>' + esc(t('app.prepare')) + '</h2></div><p class="hint">' + esc(t('m.draftNote')) + '</p></div>' +
        '<ol class="prep-grid">' + prep.map(function (p, i) {
          return '<li class="prep-card" data-reveal style="--i:' + i + '"><span class="prep-ic"><svg viewBox="0 0 24 24" aria-hidden="true">' + PREP_ICONS[p] + '</svg></span><b>' + esc(t('prep.' + p)) + '</b><span class="s">' + esc(t('prep.' + p + '.s')) + '</span></li>';
        }).join('') + '</ol>' +
      '</section>' +
      '<section class="wrap block-sec">' +
        '<div class="sec-head" data-reveal><div class="k"><p class="eyebrow">' + esc(t('how.eyebrow')) + '</p><h2>' + esc(t('how.title')) + '</h2></div></div>' +
        '<ol class="how-grid">' + [1, 2, 3, 4].map(function (i) {
          return '<li class="how-card" data-reveal style="--i:' + (i - 1) + '"><span class="n" aria-hidden="true">' + num('0' + i) + '</span><b>' + esc(t('how.' + i + '.t')) + '</b><p>' + esc(t('how.' + i + '.d')) + '</p></li>';
        }).join('') + '</ol>' +
        '<div class="cta-band" data-reveal><div><h3>' + esc(t('cta.title')) + '</h3><p>' + esc(t('cta.desc')) + '</p></div><button type="button" class="btn gold big js-start"><span>' + startLbl + '</span>' + arrow + '</button></div>' +
      '</section>';
    countUp($('#welcome'));
    reveal($('#welcome'));
    if (globe) globe.destroy();
    if (window.BonyanGlobe && window.LAND_MASK) {
      globe = window.BonyanGlobe($('#globe'), {
        hq: CFG.HQ, centerLon: 40, tilt: 16, tip: $('#globeTip'),
        onZoom: function (z) { var el = $('#globeZ'); if (el) { el.textContent = '×' + dispNum(Math.round(z * 10) / 10); el.classList.toggle('on', z > 1.01); } },
        label: globeLabel, hqText: hqText, hqTip: hqTip, sites: CFG.SITES
      });
      applyStaff(globe);
      syncUserPoint();
    }
    loadStaffMap();
  }

  function renderSuccess() {
    var r = state.result || {};
    var name = [state.data.firstName, state.data.lastName].filter(Boolean).join(' ');
    var mrz = ('P<' + (r.ref || '').replace(/-/g, '<') + '<<' + (state.data.lastName || '').toUpperCase().replace(/[^A-Z]/g, '<') + '<<' + (state.data.firstName || '').toUpperCase().replace(/[^A-Z]/g, '<') + '<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<').slice(0, 44);
    $('#success').innerHTML =
      '<div class="success-card"><div class="success-grid"><div class="success-text"><div class="seal" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5 10 17.5 19 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>' +
      '<h1>' + esc(t('m.successTitle')) + '</h1><p class="lead">' + esc(t('m.successBody', { name: name })) + '</p></div>' +
      '<div class="success-cardbox"><div class="idcard-wrap" id="cardWrapSuccess"></div><span class="big-stamp" aria-hidden="true">' + esc(t('m.registered')) + '</span></div></div>' +
      '<div class="ref"><span class="ref-l">' + esc(t('m.ref')) + '</span><span class="ref-v" dir="ltr">' + esc(r.ref || '') + '</span><span class="mrz" dir="ltr" aria-hidden="true">' + esc(mrz) + '</span></div>' +
      (r.updated ? '<p class="note"><span class="dot" aria-hidden="true"></span>' + esc(t('m.updated')) + '</p>' : '') +
      (DEMO ? '<p class="note warn"><span class="dot" aria-hidden="true"></span>' + esc(t('m.demo')) + '</p>' : '') +
      '<div class="welcome-actions"><button type="button" class="btn gold" data-ex="open">' + EX_ICON + '<span>' + esc(t('ex.btn')) + '</span></button>' + (DEMO ? '' : '<button type="button" class="btn ghost" id="btnPrint">' + esc(t('b.print')) + '</button>') +
      '<button type="button" class="btn primary" id="btnNew">' + esc(t('b.newEntry')) + '</button></div></div>' +
      '<div class="print-summary">' + reviewHTML(false) + '</div>';
    renderCard('#cardWrapSuccess');
    setTimeout(confetti, 350);
  }


  /* ---------------------------------------------------------- تصدير البطاقة صورةً عالية الجودة */
  function loadImg2(src) { return new Promise(function (res) { if (!src) return res(null); var im = new Image(); im.onload = function () { res(im); }; im.onerror = function () { res(null); }; im.src = src; }); }
  function exportCard() {
    var c = cardData(), L = c.L, rtl = L === 'ar';
    var CW = 1012, CH = 638, M = 110, GAP = 90, HEAD = 250, FOOT = 120;
    var SW = M * 2 + CW * 2 + GAP, SH = HEAD + 80 + CH + 70 + FOOT, Q = 1.35;
    var cv = document.createElement('canvas'); cv.width = Math.round(SW * Q); cv.height = Math.round(SH * Q);
    var x = cv.getContext('2d'); x.scale(Q, Q);
    var F = function (w, px, mono) { return w + ' ' + px + 'px ' + (mono ? '"IBM Plex Mono", monospace' : '"Tajawal", sans-serif'); };
    var isAr = function (s) { return /[؀-ۿ]/.test(s || ''); };
    function txt(s, px, py, o) {
      o = o || {}; s = String(s == null ? '' : s);
      x.font = F(o.w || 700, o.size || 28, o.mono); x.fillStyle = o.color || '#fff';
      x.direction = o.dir || (isAr(s) ? 'rtl' : 'ltr'); x.textAlign = o.align || 'start'; x.textBaseline = o.base || 'alphabetic';
      if (o.max) { while (x.measureText(s).width > o.max && (o.size || 28) > 12) { o.size = (o.size || 28) - 1; x.font = F(o.w || 700, o.size, o.mono); } }
      if (o.ls) x.letterSpacing = o.ls + 'px';
      x.fillText(s, px, py);
      if (o.ls) x.letterSpacing = '0px';
      x.direction = 'ltr';
    }
    function rr(px, py, w, h, r) { x.beginPath(); x.moveTo(px + r, py); x.arcTo(px + w, py, px + w, py + h, r); x.arcTo(px + w, py + h, px, py + h, r); x.arcTo(px, py + h, px, py, r); x.arcTo(px, py, px + w, py, r); x.closePath(); }
    function contain(im, px, py, w, h, align) {
      var k = Math.min(w / im.width, h / im.height), iw = im.width * k, ih = im.height * k;
      var ox = align === 'start' ? px : (align === 'end' ? px + w - iw : px + (w - iw) / 2);
      x.drawImage(im, ox, py + (h - ih) / 2, iw, ih); return iw;
    }
    var bnyW = (window.BONYAN_LOGOS || {}).markWhite;
    return Promise.all([
      document.fonts && document.fonts.load ? Promise.all([document.fonts.load(F(900, 40)), document.fonts.load(F(500, 24, true))]) : null,
      loadImg2(bnyW && bnyW.src), loadImg2(c.photo && c.photo.thumb), loadImg2((c.em || c.el || {}).src), loadImg2(c.showEnt && c.el ? c.el.src : null)
    ]).then(function (r) {
      var bny = r[1], photo = r[2], elogo = r[3], efull = r[4], c1 = c.th[0], c2 = c.th[1], ca = c.th[2];
      /* الخلفية */
      var bg = x.createLinearGradient(0, 0, 0, SH); bg.addColorStop(0, '#f4f6fb'); bg.addColorStop(1, '#e7ecf4');
      x.fillStyle = bg; x.fillRect(0, 0, SW, SH);
      x.save(); x.globalAlpha = .07; x.strokeStyle = '#b5923f'; x.lineWidth = 2;
      for (var g = 0; g < 18; g++) { x.beginPath(); x.arc(SW * .85, SH * 1.1, 160 + g * 70, 0, Math.PI * 2); x.stroke(); }
      x.restore();
      /* الرأس */
      var hg = x.createLinearGradient(0, 0, SW, HEAD); hg.addColorStop(0, '#16294a'); hg.addColorStop(1, '#0f1f38');
      x.fillStyle = hg; x.fillRect(0, 0, SW, HEAD);
      x.fillStyle = '#c9a86a'; x.fillRect(0, HEAD - 6, SW, 6);
      var hx = rtl ? SW - M : M;
      if (bny) { var bw = 120 * bny.width / bny.height; x.drawImage(bny, rtl ? SW - M - bw : M, 64, bw, 120); }
      var tx0 = rtl ? SW - M - 250 : M + 250, al = rtl ? 'right' : 'left';
      txt(t('card.kind') + ' · ' + CFG.ORG[L], tx0, 108, { size: 50, w: 900, color: '#fff', align: al, dir: rtl ? 'rtl' : 'ltr' });
      txt(c.nameAr ? c.nameAr + (c.latin ? '  ·  ' + c.latin : '') : (c.latin || '—'), tx0, 170, { size: 34, w: 700, color: '#f3dca6', align: al, dir: rtl ? 'rtl' : 'ltr', max: SW - M * 2 - 600 });
      txt(c.ref, rtl ? M : SW - M, 108, { size: 34, w: 500, mono: 1, color: '#e3c485', align: rtl ? 'left' : 'right', dir: 'ltr', ls: 2 });
      txt(t('m.ref'), rtl ? M : SW - M, 160, { size: 24, w: 700, color: 'rgba(255,255,255,.6)', align: rtl ? 'left' : 'right' });
      /* مواضع الوجهين */
      var yC = HEAD + 80, xF = rtl ? M + CW + GAP : M, xB = rtl ? M : M + CW + GAP;
      [xF, xB].forEach(function (px, i) {
        txt(i ? t('ex.back') : t('ex.front'), rtl ? px + CW : px, yC - 22, { size: 24, w: 800, color: '#6f561f', align: rtl ? 'right' : 'left' });
        x.save(); x.shadowColor = 'rgba(22,41,74,.28)'; x.shadowBlur = 50; x.shadowOffsetY = 22; rr(px, yC, CW, CH, 46); x.fillStyle = '#000'; x.fill(); x.restore();
      });
      /* ===== الوجه الأمامي */
      var X0 = xF, Y0 = yC, pad = 38;
      x.save(); rr(X0, Y0, CW, CH, 46); x.clip();
      var fg = x.createLinearGradient(X0, Y0, X0 + CW, Y0 + CH); fg.addColorStop(0, shade(c1, -.2)); fg.addColorStop(.5, c1); fg.addColorStop(1, c2);
      x.fillStyle = fg; x.fillRect(X0, Y0, CW, CH);
      x.globalAlpha = .16; x.strokeStyle = ca; x.lineWidth = 1.6;
      for (var k = 0; k < 70; k++) { x.beginPath(); x.arc(X0 + CW * 1.15, Y0 + CH * 1.25, 30 + k * 21, 0, Math.PI * 2); x.stroke(); }
      x.globalAlpha = 1;
      var sx = function (v, w) { return rtl ? X0 + CW - v - (w || 0) : X0 + v; };
      /* الشريط العلوي: شعار الجهة + نوع البطاقة + شعار بنيان */
      var topY = Y0 + 34, plateH = 118;
      var used = pad;
      if (c.showEnt) {
        var pw = elogo ? (c.em ? plateH : Math.min(CW * .5, plateH * 0.78 * elogo.width / elogo.height + 40)) : 300;
        rr(sx(used, pw), topY, pw, plateH, 26); x.fillStyle = '#fff'; x.fill();
        x.lineWidth = 3; x.strokeStyle = hexA(ca, .5); x.stroke();
        if (elogo) contain(elogo, sx(used, pw) + 14, topY + 12, pw - 28, plateH - 24);
        else txt(c.entName, sx(used, pw) + pw / 2, topY + plateH / 2 + 10, { size: 30, w: 900, color: c1, align: 'center', max: pw - 30 });
        used += pw + 26;
      }
      txt(t('card.kind'), rtl ? sx(used) : sx(used), topY + 52, { size: 30, w: 700, color: 'rgba(255,255,255,.85)', align: rtl ? 'right' : 'left' });
      txt('STAFF · HR', rtl ? sx(used) : sx(used), topY + 92, { size: 22, w: 500, mono: 1, color: ca, align: rtl ? 'right' : 'left', dir: 'ltr', ls: 5 });
      if (bny) { var bh = 74, bw2 = bh * bny.width / bny.height; x.drawImage(bny, rtl ? X0 + pad : X0 + CW - pad - bw2, topY + (plateH - bh) / 2, bw2, bh); }
      /* الصورة */
      var phW = 238, phH = 306, phY = Y0 + 180, phX = sx(pad, phW);
      rr(phX, phY, phW, phH, 22); x.fillStyle = 'rgba(255,255,255,.1)'; x.fill();
      x.save(); rr(phX, phY, phW, phH, 22); x.clip();
      if (photo) { var kk = Math.max(phW / photo.width, phH / photo.height); x.drawImage(photo, phX + (phW - photo.width * kk) / 2, phY + (phH - photo.height * kk) / 2, photo.width * kk, photo.height * kk); }
      else { x.fillStyle = 'rgba(255,255,255,.3)'; x.beginPath(); x.arc(phX + phW / 2, phY + phH * .4, phW * .22, 0, Math.PI * 2); x.fill(); x.beginPath(); x.ellipse(phX + phW / 2, phY + phH * 1.02, phW * .42, phH * .34, 0, 0, Math.PI * 2); x.fill(); }
      x.restore(); rr(phX, phY, phW, phH, 22); x.lineWidth = 6; x.strokeStyle = ca; x.stroke();
      /* البيانات */
      var ix = rtl ? phX - 36 : phX + phW + 36, ia = rtl ? 'right' : 'left', iw = CW - pad * 2 - phW - 36, iy = phY + 34;
      if (c.nameAr) { txt(c.nameAr, ix, iy + 6, { size: 50, w: 900, color: '#fff', align: ia, dir: 'rtl', max: iw }); iy += 50; txt(c.latin || '', ix, iy, { size: 25, w: 700, color: 'rgba(255,255,255,.72)', align: ia, dir: 'ltr', max: iw, ls: 3 }); iy += 54; }
      else { txt(c.latin || 'YOUR NAME', ix, iy, { size: 40, w: 900, color: '#fff', align: ia, dir: 'ltr', max: iw, ls: 1 }); iy += 56; }
      if (c.d.jobTitle) { txt(c.d.jobTitle, ix, iy, { size: 32, w: 800, color: ca, align: ia, max: iw }); iy += 46; }
      if (c.entName) { txt(c.entName, ix, iy, { size: 28, w: 500, color: 'rgba(255,255,255,.75)', align: ia, max: iw }); iy += 54; }
      if (c.svc) {
        var sv = svcLine(c.st0); x.font = F(800, 26); var chw = x.measureText(sv).width + 70, chx = rtl ? ix - chw : ix;
        rr(chx, iy - 36, chw, 50, 25); var cg = x.createLinearGradient(chx, 0, chx + chw, 0); cg.addColorStop(0, mix(ca, '#ffffff', .5)); cg.addColorStop(1, ca); x.fillStyle = cg; x.fill();
        txt(sv, rtl ? chx + chw - 24 : chx + 24, iy - 2, { size: 26, w: 800, color: c2, align: ia }); iy += 56;
      }
      if (c.d.workCountry) txt(cname(c.d.workCountry), ix, iy, { size: 28, w: 600, color: 'rgba(255,255,255,.88)', align: ia });
      /* سطرا MRZ */
      x.fillStyle = hexA(ca, .14); x.fillRect(X0, Y0 + CH - 120, CW, 120);
      txt(c.l1, X0 + pad, Y0 + CH - 70, { size: 25, w: 500, mono: 1, color: 'rgba(255,255,255,.78)', dir: 'ltr', align: 'left', ls: 5 });
      txt(c.l2, X0 + pad, Y0 + CH - 28, { size: 25, w: 500, mono: 1, color: 'rgba(255,255,255,.78)', dir: 'ltr', align: 'left', ls: 5 });
      x.restore();
      /* ===== الوجه الخلفي */
      X0 = xB;
      x.save(); rr(X0, Y0, CW, CH, 46); x.clip();
      var bk = x.createLinearGradient(X0, Y0, X0 + CW * .4, Y0 + CH); bk.addColorStop(0, '#ffffff'); bk.addColorStop(1, mix('#ffffff', c1, .06));
      x.fillStyle = bk; x.fillRect(X0, Y0, CW, CH);
      var rg1 = x.createRadialGradient(X0 + CW, Y0 + CH, 0, X0 + CW, Y0 + CH, CW * .75); rg1.addColorStop(0, hexA(c1, .14)); rg1.addColorStop(1, hexA(c1, 0)); x.fillStyle = rg1; x.fillRect(X0, Y0, CW, CH);
      var rg2 = x.createRadialGradient(X0, Y0 + CH, 0, X0, Y0 + CH, CW * .55); rg2.addColorStop(0, hexA(ca, .22)); rg2.addColorStop(1, hexA(ca, 0)); x.fillStyle = rg2; x.fillRect(X0, Y0, CW, CH);
      x.save(); x.globalAlpha = .07; x.strokeStyle = c1; x.lineWidth = 1.4; for (var kq = 0; kq < 60; kq++) { x.beginPath(); x.arc(X0 - CW * .1, Y0 + CH * 1.2, 20 + kq * 24, 0, Math.PI * 2); x.stroke(); } x.restore();
      var sg = x.createLinearGradient(0, Y0, 0, Y0 + 140); sg.addColorStop(0, c2); sg.addColorStop(.6, c1); sg.addColorStop(1, c2);
      x.fillStyle = sg; x.fillRect(X0, Y0, CW, 140);
      if (efull) { var eh = CH * .54, ew = eh * efull.width / efull.height; if (ew > CW * .8) { ew = CW * .8; eh = ew * efull.height / efull.width; } x.save(); x.globalAlpha = .1; x.drawImage(efull, X0 + (CW - ew) / 2, Y0 + CH - eh - CH * .16, ew, eh); x.restore(); }
      else if (bny) {
        var dh = CH * .62, dw = dh * bny.width / bny.height, tmp = document.createElement('canvas'); tmp.width = Math.round(dw); tmp.height = Math.round(dh);
        var tc = tmp.getContext('2d'); tc.drawImage(bny, 0, 0, dw, dh); tc.globalCompositeOperation = 'source-in'; tc.fillStyle = '#000'; tc.fillRect(0, 0, dw, dh);
        x.save(); x.globalAlpha = .05; x.drawImage(tmp, X0 + (CW - dw) / 2, Y0 + CH - dh - CH * .18); x.restore();
      }
      var lab = mix(c1, '#9a7a45', .25), fields = [
        [t('card.ref'), c.ref, 1, 1], [t('card.emergency'), c.emerg], [t('card.blood'), c.blood], [t('card.passport'), c.d.passportExpiry ? fmtDate(c.d.passportExpiry) : '—'],
        [t('card.since'), c.st0 ? fmtDate(c.st0) : '—'], [t('card.svcT'), c.svc || '—', 0, 0, 1], [t('card.empNo'), c.d.employeeNo || '—', 1]
      ];
      var colW = (CW - pad * 2) / 3, fy = Y0 + 196;
      fields.forEach(function (f, i) {
        var col, row;
        if (i === 0) { col = 0; row = 0; } else { col = (i - 1) % 3; row = 1 + Math.floor((i - 1) / 3); }
        var fx = rtl ? X0 + CW - pad - col * colW : X0 + pad + col * colW, yy = fy + row * 104;
        txt(f[0], fx, yy, { size: 22, w: 700, color: lab, align: rtl ? 'right' : 'left' });
        txt(f[1], fx, yy + 40, { size: f[3] ? 30 : 27, w: 800, color: f[4] ? c1 : '#1D2140', align: rtl ? 'right' : 'left', mono: f[2], dir: f[2] ? 'ltr' : undefined, max: f[3] ? CW - pad * 2 : colW - 16, ls: f[2] ? 2 : 0 });
      });
      /* الباركود */
      var seed = 0; for (var q = 0; q < c.ref.length; q++) seed = (seed * 31 + c.ref.charCodeAt(q)) >>> 0;
      var bx = 0, BY = Y0 + CH - 110;
      x.fillStyle = c2;
      while (bx < 640) { seed = (seed * 1103515245 + 12345) >>> 0; var bw3 = (1 + (seed >> 16) % 3) * 2.66; x.fillRect((rtl ? X0 + CW - pad - bx - bw3 : X0 + pad + bx), BY, bw3, 70); bx += bw3 + 2.66 * (1 + ((seed >> 8) % 3)); }
      x.restore();
      /* التذييل */
      var today2 = new Date(), iso = today2.getFullYear() + '-' + ('0' + (today2.getMonth() + 1)).slice(-2) + '-' + ('0' + today2.getDate()).slice(-2);
      txt(t('ex.foot', { d: fmtDate(iso) }), SW / 2, SH - 52, { size: 24, w: 600, color: '#5f7286', align: 'center', dir: rtl ? 'rtl' : 'ltr' });
      return cv;
    });
  }
  function shade(hex, f) { var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255; var k = f < 0 ? 0 : 255, p = Math.abs(f); return 'rgb(' + Math.round((k - r) * p + r) + ',' + Math.round((k - g) * p + g) + ',' + Math.round((k - b) * p + b) + ')'; }
  function mix(a, b, p) { var A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16); var ch = function (s) { return Math.round(((A >> s) & 255) * (1 - p) + ((B >> s) & 255) * p); }; return 'rgb(' + ch(16) + ',' + ch(8) + ',' + ch(0) + ')'; }
  function hexA(hex, a) { var n = parseInt(hex.slice(1), 16); return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')'; }
  var globeHome = null;
  function globeFull(box, on) {
    if (on) { globeHome = document.createComment('globe'); box.parentNode.insertBefore(globeHome, box); document.body.appendChild(box); }
    else if (globeHome && globeHome.parentNode) { globeHome.parentNode.insertBefore(box, globeHome); globeHome.remove(); globeHome = null; }
    box.classList.remove('rise'); box.style.opacity = '1';
    box.classList.toggle('is-full', on); document.body.classList.toggle('no-scroll', on);
    if (globe && !on) globe.setZoom(1);
  }
  function openExport() {
    var box = $('#cardExport');
    if (!box) { box = document.createElement('div'); box.id = 'cardExport'; box.className = 'overlay ex-ov'; document.body.appendChild(box); }
    box.hidden = false;
    box.innerHTML = '<div class="ex-card"><div class="ex-head"><b>' + esc(t('ex.title')) + '</b><button type="button" class="dr-x" data-ex="close" aria-label="' + esc(t('b.close')) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div><div class="ex-body"><div class="ex-wait"><i class="spin" aria-hidden="true"></i>' + esc(t('ex.making')) + '</div></div></div>';
    document.body.classList.add('no-scroll');
    exportCard().then(function (cv) {
      var url = cv.toDataURL('image/png'), c = cardData();
      var name = 'Bonyan-Staff-Card-' + (c.latin || 'STAFF').replace(/\s+/g, '-') + '.png';
      $('.ex-body', box).innerHTML = '<img class="ex-img" src="' + url + '" alt="">' +
        '<div class="ex-actions"><a class="btn gold big" href="' + url + '" download="' + esc(name) + '"><svg class="arr" viewBox="0 0 20 20" aria-hidden="true" style="transform:none"><path d="M10 3.5v9m0 0-3.5-3.5M10 12.5l3.5-3.5M4 15.5h12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg><span>' + esc(t('ex.download')) + '</span></a>' +
        '<p class="hint">' + esc(t('ex.hint', { w: cv.width, h: cv.height })) + '</p></div>';
    }).catch(function () { $('.ex-body', box).innerHTML = '<p class="err">' + esc(t('ex.fail')) + '</p>'; });
  }

  /* ---------------------------------------------------------- الأحداث */
  var cardSoon = debounce(function () { if (state.view !== 'wizard') return; renderCard('#cardWrapSide'); if ($('#cardWrapReview')) renderCard('#cardWrapReview'); }, 140);
  function validFmt(path) {
    var f = FIELD[path];
    if (!f) { var p = path.split(':'); var rf = FIELD[p[1]]; f = rf && rf.fields.filter(function (x) { return x.k === p[3]; })[0]; }
    return f && ['text', 'email', 'phone', 'number'].indexOf(f.type) > -1;
  }
  var DRIVERS = ['entity', 'hasCerts', 'nationality', 'workCountry', 'maritalStatus', 'waSame', 'hasContract', 'payMethod', 'bankCountry', 'addrCountry', 'currency', 'otherNationality', 'hasOtherNat', 'employmentType'];
  function fieldOf(path) {
    var f = FIELD[path]; if (f) return f;
    var p = path.split(':'); var rf = FIELD[p[1]];
    return rf && rf.fields && rf.fields.filter(function (x) { return x.k === p[3]; })[0];
  }
  /* اقتراح الاسم بالحروف الأخرى تلقائيًا (قابل للتعديل) */
  var NAME_PAIR = { firstNameAr: 'firstName', fatherNameAr: 'fatherName', grandNameAr: 'grandName', lastNameAr: 'lastName' };
  Object.keys(NAME_PAIR).forEach(function (k) { NAME_PAIR[NAME_PAIR[k]] = k; });
  function suggestName(path, v) {
    var other = NAME_PAIR[path], NT = window.NameTranslit;
    if (!other || !NT) return;
    state.autoName = state.autoName || {};
    delete state.autoName[path];
    var cur = state.data[other];
    if (cur && !state.autoName[other]) return;
    var toAr = !/Ar$/.test(path), sug = '';
    if (v && String(v).trim()) sug = toAr ? (/[A-Za-z]/.test(v) ? NT.toArabic(v) : '') : (/[\u0600-\u06FF]/.test(v) ? NT.toLatin(v) : '');
    if (!sug && cur && state.autoName[other] && !String(v || '').trim()) sug = '';
    else if (!sug) return;
    state.data[other] = sug;
    if (sug) state.autoName[other] = true; else delete state.autoName[other];
    delete state.errors[other];
    var inp = document.getElementById('f-' + other);
    if (inp) {
      inp.value = sug;
      var fe = inp.closest('.field');
      if (fe) { fe.classList.toggle('is-sug', !!sug); fe.classList.remove('has-err'); var pe = $('.err', fe); if (pe) pe.textContent = ''; fe.classList.remove('sug-flash'); void fe.offsetWidth; if (sug) fe.classList.add('sug-flash'); }
    }
  }
  function onValue(path, v, rerenderStep) {
    if (DEP_OF[path] && state.data[path] && state.data[path] !== v) {
      /* تغيّرت الدولة: تُمسح المنطقة والمدينة إن كانتا من قائمة الدولة السابقة */
      var oldPl = placeOf(state.data[path]), stash = state.placeStash = state.placeStash || {};
      if (oldPl) DEP_OF[path].forEach(function (k) {
        var cur = state.data[k]; if (!cur) return;
        var inOld = oldPl.r.some(function (r) { return sugNorm(r[0]) === sugNorm(cur) || r[1].indexOf(cur) > -1; }) || (oldPl.c || []).indexOf(cur) > -1;
        if (inOld) { stash[path + '|' + state.data[path] + '|' + k] = cur; delete state.data[k]; delete state.errors[k]; }
      });
      /* الرجوع إلى دولة سابقة يعيد منطقتها ومدينتها */
      DEP_OF[path].forEach(function (k) { var sv = stash[path + '|' + v + '|' + k]; if (sv && !state.data[k]) state.data[k] = sv; });
    }
    var nf = fieldOf(path);
    if (nf && nf.num && typeof v === 'string') v = toLatinDigits(v);
    setVal(path, v);
    if (NAME_PAIR[path]) {
      var self = document.getElementById('f-' + path), sf = self && self.closest('.field');
      if (sf) sf.classList.remove('is-sug');
      suggestName(path, v);
    }
    var base = path.indexOf('rep:') === 0 ? path : path;
    if (state.errors[base]) {
      var f = FIELD[path];
      if (f) { state.errors[path] = validate(f, path); }
      else if (path.indexOf('rep:') === 0) {
        var p = path.split(':'), rf = FIELD[p[1]];
        var sf = rf && rf.fields.filter(function (x) { return x.k === p[3]; })[0];
        if (sf) state.errors[path] = validate(sf, path, state.data[p[1]][+p[2]]);
      } else state.errors[path] = '';
    }
    if (path === 'currencyOther' && state.errors.currency && String(v || '').trim()) {
      state.errors.currency = '';
      var cf = $('[data-field="currency"]'); if (cf) { cf.classList.remove('has-err'); var ce = $('.err', cf); if (ce) ce.textContent = ''; }
    }
    cardSoon();
    if (path === 'workCountry') syncUserPoint();
    if (DRIVERS.indexOf(path) > -1) {
      applyDefaults(path);
      Object.keys(state.errors).forEach(function (ek) {
        if (state.errors[ek] && FIELD[ek] && FIELD[ek].type !== 'file') state.errors[ek] = validate(FIELD[ek], ek);
      });
    }
    saveDraft();
    if (rerenderStep || DRIVERS.indexOf(path) > -1) {
      var focusId = document.activeElement && document.activeElement.id;
      var sy = window.scrollY;
      renderStep();
      window.scrollTo(0, sy);
      var target = focusId && document.getElementById(focusId);
      var combo = path.indexOf('Dial') > -1 ? null : $('[data-combo="' + path + '"] .combo-btn');
      if (combo && rerenderStep) combo.focus();
      else if (target) target.focus();
    } else {
      var el = $('[data-field="' + path + '"]');
      if (el) {
        var e = state.errors[path];
        el.classList.toggle('has-err', !!e);
        var pe = $('.err', el);
        if (pe) pe.textContent = e ? (typeof e === 'object' ? t(e.k, e.vars) : t(e)) : '';
        el.classList.toggle('is-ok', !e && v != null && String(v).trim() !== '' && !!validFmt(path));
      }
      var meta = $('[data-meta="' + path + '"]');
      if (meta) {
        var mf = FIELD[path] || (function () { var p = path.split(':'); var rf = FIELD[p[1]]; return rf && rf.fields.filter(function (x) { return x.k === p[3]; })[0]; })();
        if (mf) meta.innerHTML = dateMeta(mf, v);
      }
      refreshVisibility();
    }
  }

  function goTo(i, focus) {
    closeCombo();
    state.dir = i >= state.step ? 1 : -1;
    state.animate = true;
    state.step = i;
    state.maxStep = Math.max(state.maxStep, i);
    renderStepper();
    renderStep();
    saveDraft();
    var top = $('#wizard');
    if (top) top.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    if (focus !== false) { var h = $('#stepTitle'); if (h) h.focus({ preventScroll: true }); }
  }

  function next() {
    if (state.submitting) return;
    if (!PREVIEW && state.step === STEPS.length - 1) {
      for (var si = 0; si < STEPS.length - 1; si++) {
        if (validateStep(si, true).length) {
          state.checked[si] = false;
          goTo(si, true);
          setTimeout(function () {
            var first = $('#stepBody .has-err');
            if (first) { first.scrollIntoView({ block: 'center', behavior: 'smooth' }); var c0 = $('input,select,textarea,button', first); if (c0) c0.focus({ preventScroll: true }); }
          }, 350);
          toast(t('e.stepBack'), 'bad');
          return;
        }
      }
    }
    var bad = PREVIEW ? [] : validateStep(state.step, true);
    if (bad.length) {
      renderStep();
      var first = $('#stepBody .has-err');
      if (first) {
        first.scrollIntoView({ block: 'center', behavior: 'smooth' });
        var ctl = $('input,select,textarea,button', first);
        if (ctl) ctl.focus({ preventScroll: true });
      }
      toast(t('e.step'), 'bad');
      return;
    }
    if (!PREVIEW) {
      if (!state.checked[state.step]) state.justDone = state.step;
      state.checked[state.step] = true;
    }
    if (state.step === STEPS.length - 1) { submit(); return; }
    goTo(state.step + 1);
  }

  function bind() {
    document.addEventListener('click', function (e) {
      var tgt = e.target;
      var exb = tgt.closest('[data-ex]');
      if (exb) { if (exb.getAttribute('data-ex') === 'open') openExport(); else { var eb = $('#cardExport'); if (eb) { eb.hidden = true; eb.innerHTML = ''; } document.body.classList.remove('no-scroll'); } return; }
      if (tgt.closest('.ex-ov') && !tgt.closest('.ex-card')) { var eb2 = $('#cardExport'); eb2.hidden = true; eb2.innerHTML = ''; document.body.classList.remove('no-scroll'); return; }
      if (tgt.closest('#logoBox, #btnHome')) { e.preventDefault(); if (state.view === 'success') { clearDraft(); return; } saveDraft(); if (location.hash) history.replaceState(null, '', location.pathname + location.search); closeCombo(); state.view = 'welcome'; renderView(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
      var dpc = tgt.closest('[data-dpcal]');
      if (dpc) { dpSetCal(dpc.getAttribute('data-dpcal')); return; }
      var gz = tgt.closest('[data-gz]');
      if (gz && globe) {
        var act = gz.getAttribute('data-gz'), box = gz.closest('.hero-glass');
        if (act === 'in') globe.zoomBy(1.45);
        else if (act === 'out') globe.zoomBy(1 / 1.45);
        else globeFull(box, !box.classList.contains('is-full'));
        return;
      }
      if (tgt.closest('.lang-toggle')) { langOpen(!$('#langSwitch').classList.contains('open')); return; }
      var lb = tgt.closest('#langSwitch [data-lang]');
      if (lb) { langOpen(false); if (lb.getAttribute('data-lang') !== state.lang) setLang(lb.getAttribute('data-lang')); return; }
      if (!tgt.closest('#langSwitch') && $('#langSwitch').classList.contains('open')) langOpen(false);
      if (tgt.closest('#btnStart, .js-start')) { state.view = 'wizard'; renderView(); goTo(state.step, true); return; }
      if (tgt.closest('#btnClear')) { clearDraft(); return; }
      if (tgt.closest('#btnNew')) { clearDraft(); return; }
      if (tgt.closest('#btnPrint')) { window.print(); return; }
      if (tgt.closest('#btnNext')) { next(); return; }
      if (tgt.closest('#btnPrev')) { goTo(Math.max(0, state.step - 1)); return; }
      var g = tgt.closest('[data-goto]');
      if (g && !g.disabled) { goTo(+g.getAttribute('data-goto')); return; }
      var seg = tgt.closest('.seg button');
      if (seg) {
        var sp = seg.getAttribute('data-path'), sv = seg.getAttribute('data-val');
        onValue(sp, sv, true);
        var sb = $('.seg button[data-path="' + sp + '"][data-val="' + sv + '"]');
        if (sb) sb.focus({ preventScroll: true });
        return;
      }
      var cb = tgt.closest('.combo-btn');
      if (cb) {
        var combo = cb.closest('.combo');
        if (openCombo === combo) closeCombo(); else openComboFor(combo);
        return;
      }
      if (openCombo && !tgt.closest('.combo')) closeCombo();
      var add = tgt.closest('[data-rep-add]');
      if (add) {
        var k = add.getAttribute('data-rep-add');
        state.data[k] = state.data[k] || [];
        state.data[k].push({});
        saveDraft(); rerenderField(k);
        var items = $$('[data-field="' + k + '"] .rep-item');
        var last = items[items.length - 1];
        if (last) { var c1 = $('input,select,button.combo-btn', last); if (c1) c1.focus(); }
        return;
      }
      var rm = tgt.closest('[data-rep-rm]');
      if (rm) {
        var rk = rm.getAttribute('data-rep-rm');
        state.data[rk].splice(+rm.getAttribute('data-i'), 1);
        Object.keys(state.errors).forEach(function (ek) { if (ek.indexOf('rep:' + rk + ':') === 0) delete state.errors[ek]; });
        saveDraft(); rerenderField(rk);
        return;
      }
      var rf = tgt.closest('[data-rmfile]');
      if (rf) {
        var fk = rf.getAttribute('data-rmfile');
        state.files[fk].splice(+rf.getAttribute('data-i'), 1);
        rerenderField(fk);
        return;
      }
    });
    document.addEventListener('keydown', function (e) {
      var seg = e.target.closest && e.target.closest('.seg button');
      if (seg && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].indexOf(e.key) > -1) {
        e.preventDefault();
        var btns = $$('button', seg.parentNode), i = btns.indexOf(seg);
        var rtl = document.documentElement.dir === 'rtl';
        var fwd = e.key === 'ArrowDown' || (e.key === (rtl ? 'ArrowLeft' : 'ArrowRight'));
        var nb = btns[(i + (fwd ? 1 : -1) + btns.length) % btns.length];
        onValue(nb.getAttribute('data-path'), nb.getAttribute('data-val'), true);
        var again = $('.seg button[data-path="' + nb.getAttribute('data-path') + '"][data-val="' + nb.getAttribute('data-val') + '"]');
        if (again) again.focus();
      }
      var gfull = $('.hero-glass.is-full');
      if (e.key === 'Escape' && gfull) globeFull(gfull, false);
      if (e.key === 'Escape' && $('#langSwitch').classList.contains('open')) { langOpen(false); $('.lang-toggle').focus(); }
      if (e.key === 'Escape' && openCombo) { var b = $('.combo-btn', openCombo); closeCombo(); if (b) b.focus(); }
      if (e.target.matches && e.target.matches('input[data-sug]')) {
        var inp = e.target, sp = $('.sug-panel', inp.parentNode);
        if (e.key === 'ArrowDown' && !sp) { e.preventDefault(); showSug(inp); return; }
        if (!sp) return;
        var its = $$('li[data-v]', sp), k = its.indexOf($('li.act', sp));
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          if (k > -1) its[k].classList.remove('act');
          k = e.key === 'ArrowDown' ? Math.min(its.length - 1, k + 1) : Math.max(0, k - 1);
          if (its[k]) { its[k].classList.add('act'); its[k].scrollIntoView({ block: 'nearest' }); inp.setAttribute('aria-activedescendant', its[k].id); }
        } else if (e.key === 'Enter' && k > -1) { e.preventDefault(); pickSug(inp, its[k].getAttribute('data-v')); }
        else if (e.key === 'Escape') { e.stopPropagation(); closeSug(); }
        else if (e.key === 'Tab') closeSug();
      }
    });
    document.addEventListener('focusin', function (e) {
      if (e.target.matches && e.target.matches('input[data-sug]')) showSug(e.target);
      else if (sugOpen && e.target !== sugOpen) closeSug();
    });
    document.addEventListener('focusout', function (e) {
      if (e.target.matches && e.target.matches('input[data-sug]')) setTimeout(function () { if (sugOpen === e.target && document.activeElement !== e.target) closeSug(); }, 120);
    });
    document.addEventListener('input', function (e) {
      var el = e.target;
      if (!el.matches('[data-path]') || el.type === 'checkbox' || el.closest('.seg')) return;
      if (el.tagName === 'SELECT') return;
      var v = el.value;
      onValue(el.getAttribute('data-path'), v, false);
      if (el.hasAttribute('data-sug')) showSug(el);
    });
    document.addEventListener('change', function (e) {
      var el = e.target;
      if (el.matches && el.matches('.dp-s')) { dpChange(el); return; }
      if (el.id === 'pvAll') { state.showAll = el.checked; renderStep(); var pv = $('#pvAll'); if (pv) pv.focus(); return; }
      if (el.matches('input[type="file"][data-file]')) { onFiles(el.getAttribute('data-file'), el.files); return; }
      if (el.matches('input[type="checkbox"][data-path]')) {
        onValue(el.getAttribute('data-path'), el.checked, false);
        state.errors[el.getAttribute('data-path')] = el.checked ? '' : state.errors[el.getAttribute('data-path')];
        var fe = el.closest('.field'); if (fe && el.checked) { fe.classList.remove('has-err'); $('.err', fe).textContent = ''; }
        return;
      }
      if (el.tagName === 'SELECT' && el.matches('[data-path]')) { onValue(el.getAttribute('data-path'), el.value, DRIVERS.indexOf(el.getAttribute('data-path')) > -1); return; }
      if (el.matches('input[data-path]') && el.classList.contains('up')) {
        el.value = el.value.toUpperCase();
        setVal(el.getAttribute('data-path'), el.value); saveDraft();
      }
      if (el.matches('[data-path]')) {
        var path = el.getAttribute('data-path');
        var f = FIELD[path];
        if (f && (f.v || f.after) && el.value) {
          state.errors[path] = validate(f, path);
          onValue(path, el.value, false);
        }
      }
    });
    document.addEventListener('dragover', function (e) { e.preventDefault(); var d = e.target.closest && e.target.closest('.drop'); if (d) d.classList.add('over'); });
    document.addEventListener('dragleave', function (e) { var d = e.target.closest && e.target.closest('.drop'); if (d) d.classList.remove('over'); });
    document.addEventListener('drop', function (e) {
      e.preventDefault();
      var d = e.target.closest && e.target.closest('.drop');
      if (!d) return;
      e.preventDefault(); d.classList.remove('over');
      var inp = $('input[type="file"]', d);
      if (inp && e.dataTransfer.files.length) onFiles(inp.getAttribute('data-file'), e.dataTransfer.files);
    });
    document.addEventListener('error', function (e) {
      var im = e.target;
      if (!im || im.tagName !== 'IMG') return;
      if (im.classList.contains('flag')) { im.remove(); return; }
      var rest = (im.getAttribute('data-srcs') || '').split('|').filter(Boolean);
      if (rest.length) { im.setAttribute('data-srcs', rest.slice(1).join('|')); im.src = rest[0]; return; }
      if (im.hasAttribute('data-alt')) {
        if (im.getAttribute('data-key')) LOGO_STATE[im.getAttribute('data-key')] = 'fail';
        var s = document.createElement('span');
        s.className = im.className + ' logo-fallback';
        if (im.id) s.id = im.id;
        s.textContent = im.getAttribute('data-alt');
        im.replaceWith(s);
      }
    }, true);
    document.addEventListener('load', function (e) {
      var im = e.target;
      if (im && im.tagName === 'IMG' && im.getAttribute('data-key') && im.naturalWidth) LOGO_STATE[im.getAttribute('data-key')] = im.currentSrc || im.src;
    }, true);
    document.addEventListener('click', function (e) {
      var card = e.target.closest && e.target.closest('.idcard');
      if (card) card.classList.toggle('flipped');
    });
    bindCard();
  }

  function setLang(L) {
    if (!DICT[L]) return;
    state.lang = L;
    try { localStorage.setItem(LS_KEY + '-lang', L); } catch (e) { }
    renderMainLogo();
    renderStatic();
    renderView();
  }

  /* ---------------------------------------------------------- المسودة */
  var saveDraft = debounce(function () {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ data: state.data, step: state.step, maxStep: state.maxStep, checked: state.checked, auto: state.autoName || {}, at: Date.now() }));
    } catch (e) { }
  }, 400);
  function loadDraft() {
    try {
      var L = localStorage.getItem(LS_KEY + '-lang');
      if (L && DICT[L]) state.lang = L;
      var raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      var d = JSON.parse(raw);
      if (d && d.data) {
        state.data = d.data;
        state.data.qualifications = state.data.qualifications || [{}];
        state.data.experience = state.data.experience || [];
        state.data.languages = state.data.languages || [{}];
        if (!state.data.hasOtherNat) state.data.hasOtherNat = 'no';
        if (!state.data.certs || !state.data.certs.length) state.data.certs = [{}];
        if (!state.data.startDiff) state.data.startDiff = 'no';
        state.step = Math.min(d.step || 0, STEPS.length - 1);
        state.maxStep = d.maxStep || state.step;
        state.checked = d.checked || {};
        delete state.data.consentTruth; delete state.data.consentData;
        var attIdx = -1; STEPS.forEach(function (st, i) { if (st.id === 'attachments') attIdx = i; });
        if (attIdx > -1 && state.step > attIdx) { state.step = attIdx; }
        if (attIdx > -1) { state.checked[attIdx] = false; if (state.maxStep > attIdx) state.maxStep = attIdx; }
        state.autoName = d.auto || {};
        state.restored = Object.keys(d.data).some(function (k) { var v = d.data[k]; return typeof v === 'string' && v && ['waSame', 'hasOtherNat', 'startDiff'].indexOf(k) < 0; });
      }
    } catch (e) { }
  }
  function clearDraft() {
    try { localStorage.removeItem(LS_KEY); } catch (e) { }
    state.data = { qualifications: [{}], experience: [], languages: [{}], certs: [{}], waSame: 'yes', hasOtherNat: 'no', startDiff: 'no' };
    state.files = {}; state.errors = {}; state.checked = {}; state.step = 0; state.maxStep = 0; state.restored = false; state.result = null;
    state.view = 'welcome';
    renderView();
    window.scrollTo(0, 0);
  }

  /* ---------------------------------------------------------- الإرسال */
  /* اسم واضح لكل مرفق عند حفظه في Drive: «نوع المستند - اسم المنسوب» */
  var FILE_AR = { photo: 'صورة شخصية', passportScan: 'جواز السفر', certFiles: 'شهادة دورة' };
  function fileLabelAr(f) {
    var lb = FILE_AR[f.k] || tl('ar', f.labelKey ? f.labelKey(state.data) : 'f.' + f.k);
    return String(lb).replace(/[\\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ').trim();
  }
  function buildPayload() {
    var raw = {}, ar = {}, d = state.data;
    STEPS.forEach(function (st) {
      st.sections.forEach(function (sec) {
        sec.fields.forEach(function (f) {
          if (!visible(f) || f.type === 'info' || f.type === 'file') return;
          if (f.type === 'repeater') {
            raw[f.k] = (d[f.k] || []).map(function (it) { var o = {}; f.fields.forEach(function (sf) { if (!sf.showItem || sf.showItem(it)) o[sf.k] = it[sf.k]; }); return o; });
            ar[f.k] = (d[f.k] || []).map(function (it, i) {
              var o = {};
              f.fields.forEach(function (sf) { if (sf.showItem && !sf.showItem(it)) return; o[sf.k] = display(sf, 'rep:' + f.k + ':' + i + ':' + sf.k, 'ar'); });
              return o;
            });
            return;
          }
          if (d[f.k] == null || d[f.k] === '') return;
          raw[f.k] = d[f.k];
          ar[f.k] = display(f, f.k, 'ar');
          if (f.type === 'phone') { raw[f.k + 'Dial'] = dialOf(d[f.k + 'Dial']); raw[f.k] = normPhone(d[f.k], raw[f.k + 'Dial']); }
        });
      });
    });
    if (d.currency === 'other' && d.currencyOther) { raw.currency = d.currencyOther; ar.currency = d.currencyOther; }
    if (raw.salary != null) { raw.salary = moneyNum(d.salary); ar.salary = raw.salary; }
    if (d.hasContract === 'no') ar.contractStatus = tl('ar', 'm.noContract');
    if (d.waSame === 'yes' && d.mobile) { ar.whatsapp = ar.mobile; raw.whatsapp = d.mobile; }
    Object.keys(raw).forEach(function (k) { if (typeof raw[k] === 'string') raw[k] = toLatinDigits(raw[k]); });
    ['nationalIdNo', 'permitNo', 'workPermitNo', 'passportNo', 'iban', 'accountNo', 'mobile', 'whatsapp', 'em1Phone', 'em2Phone', 'insuranceNo', 'npwp', 'bpjsTk', 'bpjsKes', 'kraPin', 'nssfNo', 'shaNo', 'tin', 'employeeNo', 'addrPostal', 'addrBuilding', 'addrAdditional'].forEach(function (k) { if (typeof ar[k] === 'string') ar[k] = toLatinDigits(ar[k]); });
    if (d.entity === 'other' && d.entityOther) { ar.entity = d.entityOther; raw.entity = d.entityOther; }
    delete ar.entityOther; delete raw.entityOther;
    ar.fullNameLatin = latinName(d);
    ar.fullNameAr = arabicName(d);
    var st0 = startOf(d);
    if (st0) { raw.startDate = st0; ar.startDate = st0; }
    if (d.hasCerts === 'yes') { ar.certifications = (d.certs || []).filter(function (c) { return c.certName; }).map(function (c, i) { return (i + 1) + '. ' + c.certName + (c.certField ? ' — ' + c.certField : ''); }).join('\n'); raw.certifications = ar.certifications; }
    (ar.qualifications || []).forEach(function (q, i) { var it = (d.qualifications || [])[i] || {}; if (it.degree === 'other' && it.degreeOther) q.degree = it.degreeOther; });
    if (d.hasOtherNat !== 'yes') { delete raw.otherNationality; delete ar.otherNationality; }
    ar.workCountryCode = d.workCountry || '';
    ar.nationalityCode = d.nationality || '';
    ar.workCountryEn = cname(d.workCountry, 'en');
    return {
      raw: raw, ar: ar,
      meta: { lang: state.lang, tz: (Intl.DateTimeFormat().resolvedOptions().timeZone || ''), ua: navigator.userAgent.slice(0, 180), website: ($('#hp') || {}).value || '' }
    };
  }
  function api(body) {
    return fetch(CFG.GAS_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body), redirect: 'follow' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (j) { if (!j.ok) throw new Error(j.error || 'error'); return j; });
  }
  function withRetry(fn, n) {
    return fn().catch(function (e) { if (n > 0) return new Promise(function (r) { setTimeout(r, 1200); }).then(function () { return withRetry(fn, n - 1); }); throw e; });
  }
  function overlay(text, pct, err) {
    var o = $('#overlay');
    o.hidden = false;
    $('#ovText').textContent = text;
    $('#ovBar').style.width = (pct || 0) + '%';
    $('#ovErr').hidden = !err;
    $('#ovActions').hidden = !err;
    if (err) { $('#ovErr').textContent = err; $('#ovRetry').textContent = t('b.retry'); $('#ovClose').textContent = t('b.close'); }
    o.classList.toggle('is-err', !!err);
  }
  function submit() {
    if (state.submitting) return;
    state.submitting = true;
    var nb = $('#btnNext'); if (nb) nb.disabled = true;
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    var queue = [];
    STEPS.forEach(function (st) {
      st.sections.forEach(function (sec) {
        sec.fields.forEach(function (f) {
          if (f.type !== 'file' || !visible(f)) return;
          (state.files[f.k] || []).forEach(function (fl, i, arr) { queue.push({ kind: f.k, label: fileLabelAr(f), labelUi: lblText(f), idx: i + 1, total: arr.length, file: fl }); });
        });
      });
    });
    var total = queue.length + 2;
    var done = 0;
    var payload = buildPayload();
    overlay(t('m.sending'), 4);
    var ref, token, updated;
    var chain;
    if (DEMO) {
      chain = new Promise(function (r) { setTimeout(r, 700); }).then(function () {
        ref = 'BNY-HR-' + (state.data.workCountry || 'XX') + '-' + new Date().getFullYear() + '-0042';
        done++;
        return queue.reduce(function (p, q, i) {
          return p.then(function () {
            overlay(t('m.uploading', { name: q.labelUi, i: i + 1, n: queue.length }), Math.round(++done / total * 100));
            return new Promise(function (r) { setTimeout(r, 350); });
          });
        }, Promise.resolve());
      });
    } else {
      chain = withRetry(function () { return api({ action: 'submit', payload: payload }); }, 1).then(function (j) {
        ref = j.ref; token = j.token; updated = j.updated; done++;
        return queue.reduce(function (p, q, i) {
          return p.then(function () {
            overlay(t('m.uploading', { name: q.labelUi, i: i + 1, n: queue.length }), Math.round(done / total * 100));
            return withRetry(function () {
              return api({ action: 'upload', ref: ref, token: token, kind: q.kind, label: q.label, idx: q.idx, total: q.total, name: q.file.name, mime: q.file.mime, data: q.file.b64 });
            }, 2).then(function () { done++; });
          });
        }, Promise.resolve());
      }).then(function () {
        overlay(t('m.finishing'), 96);
        return withRetry(function () { return api({ action: 'finalize', ref: ref, token: token }); }, 1);
      });
    }
    chain.then(function () {
      overlay(t('m.finishing'), 100);
      state.result = { ref: ref, updated: updated };
      if (DEMO) { if (!updated && state.data.workCountry) demoAdd(state.data.workCountry, state.data.nationality, state.data.workRegion); } else loadStaffMap(true);
      setTimeout(function () {
        $('#overlay').hidden = true;
        state.submitting = false;
        try { localStorage.removeItem(LS_KEY); } catch (e) { }
        state.view = 'success';
        renderView();
        window.scrollTo(0, 0);
      }, 400);
    }).catch(function (e) {
      state.submitting = false;
      var nb2 = $('#btnNext'); if (nb2) nb2.disabled = false;
      var msg = (e && e.message) || '';
      overlay(t('m.sending'), 0, /Failed to fetch|NetworkError|HTTP/.test(msg) || !msg ? t('e.network') : t('e.server', { msg: msg }));
    });
  }

  function toast(msg, kind) {
    var el = $('#toast');
    el.textContent = msg;
    el.className = 'toast show ' + (kind || '');
    clearTimeout(toast._h);
    toast._h = setTimeout(function () { el.className = 'toast'; }, 3200);
  }

  /* واجهة مشتركة لصفحة عرض البيانات (admin.js) */
  window.BonyanApp = {
    t: t, tl: tl, esc: esc, cname: cname, flag: flag, arDigits: arDigits, fmtDate: fmtDate, state: state, CFG: CFG, DEMO: DEMO,
    api: api, toast: toast, $: $, $$: $$, globeLabel: globeLabel, hqText: hqText, hqTip: hqTip, pointFmt: pointFmt,
    num: function (n) { return state.lang === 'ar' ? arDigits(n) : String(n); }
  };


  /* ---------------------------------------------------------- التشغيل */
  function init() {
    loadDraft();
    var q = (location.search.match(/[?&]lang=(ar|en|id)/) || [])[1];
    if (q) state.lang = q;
    $('#langSwitch').innerHTML = '<button type="button" class="lang-toggle" aria-expanded="false">' +
      '<svg class="lang-ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.6 2.6 15.4 0 18M12 3c-2.6 2.6-2.6 15.4 0 18"/></svg>' +
      '<span id="langNow"></span><svg class="chev" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5 6 7.5 9 4.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
      '<div class="lang-opts">' + CFG.LANGS.map(function (L) {
        var short = { ar: 'ع', en: 'EN', id: 'ID' }[L] || L.toUpperCase();
        return '<button type="button" data-lang="' + L + '" aria-pressed="false" lang="' + L + '" tabindex="-1"><b>' + short + '</b><span>' + esc(DICT[L]['lang.name']) + '</span></button>';
      }).join('') + '</div>';
    renderMainLogo();
    renderStatic();
    renderView();
    bind();
    $('#form').addEventListener('submit', function (e) { e.preventDefault(); });
    var onScroll = function () {
      var y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
      $('#top').classList.toggle('scrolled', y > 8);
      $('#top').classList.toggle('stuck', state.view !== 'welcome' || y > 150);
      $('#scrollBar').style.transform = 'scaleX(' + (h > 0 ? Math.min(1, y / h) : 0) + ')';
    };
    state.onScroll = onScroll;
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

    window.addEventListener('resize', fitSideCard);
    $('#themeBtn').addEventListener('click', function () {
      var root = document.documentElement, next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.classList.add('theme-anim');
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('bonyan-hr-theme', next); } catch (e) { }
      themeLabel();
      setTimeout(function () { root.classList.remove('theme-anim'); }, 550);
    });
    themeLabel();
    $('#ovRetry').addEventListener('click', function () { $('#overlay').hidden = true; submit(); });
    $('#ovClose').addEventListener('click', function () { $('#overlay').hidden = true; });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
