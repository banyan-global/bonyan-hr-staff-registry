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
  var CURRENCIES = ['SAR', 'USD', 'EUR', 'EGP', 'IDR', 'KES', 'ETB', 'AED', 'GBP', 'TZS', 'UGX', 'NGN', 'PKR', 'MYR', 'other'];

  /* ---------------------------------------------------------- الحالة */
  var state = {
    lang: CFG.DEFAULT_LANG,
    view: 'welcome',
    step: 0,
    maxStep: 0,
    data: { qualifications: [{}], experience: [], languages: [{}], waSame: 'yes' },
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
    return cc ? '<img class="flag" src="https://flagcdn.com/w40/' + cc.toLowerCase() + '.png" alt="" width="20" height="15" loading="lazy">' : '';
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
    abroad: function (d) { return !!(d.nationality && d.workCountry && d.nationality !== d.workCountry); },
    addrSA: function (d) { return (d.addrCountry || d.workCountry) === 'SA'; },
    hasDeps: function (d) { return ['married', 'divorced', 'widowed'].indexOf(d.maritalStatus) > -1; },
    contract: function (d) { return d.hasContract === 'yes'; },
    noContract: function (d) { return d.hasContract === 'no'; },
    waDiff: function (d) { return d.waSame === 'no'; },
    bank: function (d) { return d.payMethod === 'bank'; },
    wallet: function (d) { return d.payMethod === 'wallet'; },
    payOther: function (d) { return d.payMethod === 'other'; },
    iban: function (d) { return d.payMethod === 'bank' && !!IBAN_LEN[d.bankCountry]; },
    noIban: function (d) { return d.payMethod === 'bank' && !!d.bankCountry && !IBAN_LEN[d.bankCountry]; },
    currencyOther: function (d) { return d.currency === 'other'; }
  };

  /* ---------------------------------------------------------- مخطط النموذج */
  var STEPS = [
    { id: 'personal', sections: [
      { t: 's.identity', fields: [
        { k: 'firstName', type: 'text', req: 1, v: 'latin', dir: 'ltr', ph: 'ph.firstName', hint: 'h.firstName', upper: 1 },
        { k: 'middleName', type: 'text', v: 'latin', dir: 'ltr', upper: 1 },
        { k: 'lastName', type: 'text', req: 1, v: 'latin', dir: 'ltr', ph: 'ph.lastName', upper: 1 },
        { k: 'fullNameAr', type: 'text', dir: 'rtl', hint: 'h.fullNameAr' },
        { k: 'gender', type: 'seg', opts: ['male', 'female'], req: 1 },
        { k: 'birthDate', type: 'date', req: 1, v: 'birth', meta: 'age' },
        { k: 'birthCountry', type: 'country', req: 1 },
        { k: 'birthCity', type: 'text' }
      ] },
      { t: 's.nationality', fields: [
        { k: 'nationality', type: 'country', req: 1 },
        { k: 'secondNationality', type: 'country' },
        { k: 'workCountry', type: 'country', req: 1, hint: 'h.workCountry', w: 'full' }
      ] },
      { t: 's.family', fields: [
        { k: 'maritalStatus', type: 'seg', opts: ['single', 'married', 'divorced', 'widowed'], req: 1, w: 'full' },
        { k: 'dependents', type: 'number', min: 0, max: 30, show: C.hasDeps },
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
      { t: 's.nationalId', fields: [
        { k: 'nationalIdNo', type: 'text', req: 1, v: 'docNo', dir: 'ltr' },
        { k: 'nationalIdExpiry', type: 'date', meta: 'expiry' }
      ] },
      { t: 's.permit', show: C.abroad, fields: [
        { k: 'permitType', type: 'seg', opts: ['residence', 'workVisa', 'workPermit', 'other'], req: 1, w: 'full' },
        { k: 'permitNo', type: 'text', req: 1, v: 'docNo', dir: 'ltr' },
        { k: 'permitOccupation', type: 'text' },
        { k: 'permitIssue', type: 'date', v: 'past' },
        { k: 'permitExpiry', type: 'date', req: 1, after: 'permitIssue', meta: 'expiry' }
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
        { k: 'addrRegion', type: 'text' },
        { k: 'addrCity', type: 'text', req: 1 },
        { k: 'addrDistrict', type: 'text' },
        { k: 'addrStreet', type: 'text' },
        { k: 'addrPostal', type: 'text', dir: 'ltr' },
        { k: 'addrBuilding', type: 'text', dir: 'ltr', show: C.addrSA },
        { k: 'addrAdditional', type: 'text', dir: 'ltr', show: C.addrSA },
        { k: 'addrShort', type: 'text', dir: 'ltr', show: C.addrSA, upper: 1 }
      ] },
      { t: 's.homeAddress', show: C.abroad, fields: [
        { k: 'homeCountry', type: 'country', req: 1 },
        { k: 'homeCity', type: 'text', req: 1 },
        { k: 'homeAddress', type: 'textarea', w: 'full' }
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
        { k: 'jobTitle', type: 'text', req: 1 },
        { k: 'department', type: 'text', req: 1 },
        { k: 'workOffice', type: 'text', req: 1 },
        { k: 'manager', type: 'text' },
        { k: 'employeeNo', type: 'text', dir: 'ltr' },
        { k: 'startDate', type: 'date', req: 1, v: 'past', meta: 'service' },
        { k: 'employmentType', type: 'seg', req: 1, opts: ['fullTime', 'partTime', 'remote', 'field', 'contractor', 'volunteer'], w: 'full' }
      ] },
      { t: 's.contract', fields: [
        { k: 'hasContract', type: 'seg', req: 1, opts: ['yes', 'no'], optKey: 'yesno', w: 'full' },
        { k: 'contractNone', type: 'info', text: 'h.contractNone', show: C.noContract, w: 'full' },
        { k: 'contractType', type: 'seg', req: 1, opts: ['local', 'international'], show: C.contract },
        { k: 'contractNo', type: 'text', dir: 'ltr', show: C.contract },
        { k: 'contractStart', type: 'date', req: 1, show: C.contract },
        { k: 'contractEnd', type: 'date', after: 'contractStart', afterErr: 'e.afterStart', show: C.contract, meta: 'expiry' }
      ] }
    ] },
    { id: 'education', sections: [
      { t: 's.qualifications', fields: [
        { k: 'qualifications', type: 'repeater', min: 1, add: 'b.addQualification', w: 'full', fields: [
          { k: 'degree', type: 'select', req: 1, opts: ['secondary', 'diploma', 'bachelor', 'master', 'phd', 'other'] },
          { k: 'major', type: 'text', req: 1 },
          { k: 'institution', type: 'text', req: 1 },
          { k: 'country', type: 'country' },
          { k: 'gradYear', type: 'number', v: 'year', min: 1950, max: 2035, dir: 'ltr' },
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
        { k: 'techSkills', type: 'textarea', w: 'full' },
        { k: 'certifications', type: 'textarea', w: 'full' },
        { k: 'quran', type: 'select', opts: ['none', 'lt5', '5to15', '15to29', 'full'], w: 'full' }
      ] }
    ] },
    { id: 'finance', sections: [
      { t: 's.salary', fields: [
        { k: 'payMethod', type: 'seg', req: 1, opts: ['bank', 'wallet', 'other'], w: 'full' },
        { k: 'bankCountry', type: 'country', req: 1, show: C.bank },
        { k: 'bankName', type: 'text', req: 1, show: C.bank },
        { k: 'accountHolder', type: 'text', req: 1, show: C.bank, dir: 'ltr', upper: 1, w: 'full' },
        { k: 'iban', type: 'text', req: 1, show: C.iban, v: 'iban', dir: 'ltr', hint: 'h.iban', upper: 1, mono: 1, w: 'full' },
        { k: 'accountNo', type: 'text', req: 1, show: C.noIban, dir: 'ltr', mono: 1 },
        { k: 'swift', type: 'text', show: C.noIban, dir: 'ltr', upper: 1, mono: 1 },
        { k: 'bankBranch', type: 'text', show: C.noIban },
        { k: 'walletProvider', type: 'text', req: 1, show: C.wallet },
        { k: 'walletNo', type: 'text', req: 1, show: C.wallet, dir: 'ltr', mono: 1 },
        { k: 'payOther', type: 'textarea', req: 1, show: C.payOther, w: 'full' },
        { k: 'currency', type: 'select', opts: CURRENCIES, rawOpts: CURRENCIES.slice(0, -1) }
      ] }
    ] },
    { id: 'attachments', sections: [
      { t: 's.files', fields: [
        { k: 'photo', type: 'file', req: 1, photo: 1, max: 1, hint: 'h.photo', w: 'full' },
        { k: 'passportScan', type: 'file', req: 1, max: 2 },
        { k: 'nationalIdScan', type: 'file', req: 1, max: 2, hint: 'h.nationalIdScan' },
        { k: 'permitScan', type: 'file', req: 1, max: 2, hint: 'h.permitScan', show: C.abroad },
        { k: 'contractFile', type: 'file', req: 1, max: 3, hint: 'h.contractFile', show: C.contract },
        { k: 'contractNone2', type: 'info', text: 'h.contractNone', show: C.noContract, label: 'f.contractFile' },
        { k: 'degreeFile', type: 'file', max: 2 },
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
  function visible(f) {
    if (f.section && f.section.show && !f.section.show(state.data)) return false;
    if (f.show && !f.show(state.data)) return false;
    return true;
  }
  function applyDefaults(changed) {
    var d = state.data;
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
      return (f.req && !files.length) ? 'e.fileRequired' : '';
    }
    if (f.type === 'repeater') return '';
    var empty = v == null || String(v).trim() === '';
    var required = f.req || (f.reqIf && d[f.reqIf]);
    if (empty) return required ? 'e.required' : '';
    v = String(v).trim();
    if (f.type === 'phone') return /^\d{6,14}$/.test(v.replace(/[\s-]/g, '')) ? '' : 'e.phone';
    switch (f.v) {
      case 'latin': if (!/^[A-Za-z][A-Za-z' .\-]*$/.test(v)) return 'e.latin'; break;
      case 'email': if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'e.email'; break;
      case 'docNo': if (!/^[A-Za-z0-9\-]{3,24}$/.test(v.replace(/\s/g, ''))) return 'e.docNo'; break;
      case 'birth':
        var age = yearsBetween(v);
        if (daysUntil(v) > 0) return 'e.future';
        if (age < 15 || age > 90) return 'e.birth';
        break;
      case 'past': if (daysUntil(v) > 0) return 'e.future'; break;
      case 'year': var y = +v; if (!(y >= 1950 && y <= new Date().getFullYear() + 1)) return 'e.year'; break;
      case 'iban':
        var s = v.replace(/\s/g, '').toUpperCase(), cc = d.bankCountry, n = IBAN_LEN[cc];
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
    if (f.rawOpts && f.rawOpts.indexOf(v) > -1) return v;
    return tl(lang || state.lang, 'o.' + (f.optKey || f.k) + '.' + v);
  }
  function display(f, path, lang) {
    lang = lang || state.lang;
    var v = getVal(path);
    if (f.type === 'phone') {
      if (!v) return '';
      var cc = state.data[(path.indexOf('rep:') === 0 ? '' : path) + 'Dial'];
      return '+' + dialOf(cc) + ' ' + v;
    }
    if (v == null || v === '') return '';
    if (f.type === 'country') return cname(v, lang);
    if (f.type === 'date') return fmtDate(v, lang);
    if (f.type === 'seg' || f.type === 'select') return optLabel(f, v, lang);
    return String(v);
  }

  /* ---------------------------------------------------------- مكوّنات الحقول */
  function labelHTML(f, forId) {
    var req = f.req ? '<span class="req" aria-hidden="true">*</span>' : '';
    return '<label class="lbl" for="' + forId + '">' + esc(t(f.label || ('f.' + f.k))) + req + '</label>';
  }
  function fieldHTML(f, path, item) {
    var id = 'f-' + path.replace(/:/g, '-');
    var v = getVal(path);
    var err = state.errors[path];
    var errText = err ? (typeof err === 'object' ? t(err.k, err.vars) : t(err)) : '';
    var w = f.w === 'full' || f.type === 'textarea' ? ' w-full' : '';
    var hidden = (!item && !visible(f)) ? ' hidden' : '';
    var h = '<div class="field' + w + (err ? ' has-err' : '') + '" data-field="' + esc(path) + '"' + hidden + '>';
    var ctrl = '';
    var dirA = f.dir ? ' dir="' + f.dir + '"' : '';
    var ph = f.ph ? ' placeholder="' + esc(t(f.ph)) + '"' : '';
    var desc = ' aria-describedby="' + id + '-err"';
    switch (f.type) {
      case 'text': case 'email': case 'number':
        var it = f.type === 'number' ? 'number' : (f.type === 'email' ? 'email' : 'text');
        var extra = f.type === 'number' ? ' inputmode="numeric" min="' + (f.min || 0) + '" max="' + (f.max || 9999) + '" step="1"' : '';
        var list = f.list ? ' list="dl-' + f.list.replace('.', '-') + '"' : '';
        var auto = f.type === 'email' ? ' autocomplete="email"' : ' autocomplete="off"';
        ctrl = '<input class="inp' + (f.upper ? ' up' : '') + (f.mono ? ' mono' : '') + '" type="' + it + '" id="' + id + '" data-path="' + esc(path) + '" value="' + esc(v || '') + '"' + dirA + ph + extra + list + auto + desc + (err ? ' aria-invalid="true"' : '') + '>';
        break;
      case 'textarea':
        ctrl = '<textarea class="inp" rows="3" id="' + id + '" data-path="' + esc(path) + '"' + dirA + desc + '>' + esc(v || '') + '</textarea>';
        break;
      case 'date':
        ctrl = '<input class="inp" type="date" id="' + id + '" data-path="' + esc(path) + '" value="' + esc(v || '') + '"' + desc + (err ? ' aria-invalid="true"' : '') + '><p class="meta" data-meta="' + esc(path) + '">' + dateMeta(f, v) + '</p>';
        break;
      case 'select':
        var opts = f.entity ? CFG.ENTITIES.map(function (e) { return [e.v, e[state.lang]]; })
          : f.opts.map(function (o) { return [o, optLabel(f, o)]; });
        ctrl = '<div class="sel"><select class="inp" id="' + id + '" data-path="' + esc(path) + '"' + desc + '><option value="">' + esc(t('ph.select')) + '</option>' +
          opts.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (o[0] === v ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select></div>';
        if (f.k === 'currency') ctrl += '<input class="inp mt" type="text" dir="ltr" data-path="currencyOther" value="' + esc(state.data.currencyOther || '') + '" placeholder="QAR"' + (C.currencyOther(state.data) ? '' : ' hidden') + ' id="f-currencyOther">';
        break;
      case 'seg':
        ctrl = '<div class="seg" role="radiogroup" id="' + id + '" aria-labelledby="' + id + '-lbl">' + f.opts.map(function (o) {
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
    var lblId = id + (f.type === 'seg' ? '-lbl' : '');
    if (f.type === 'seg') h += '<span class="lbl" id="' + lblId + '">' + esc(t('f.' + f.k)) + (f.req ? '<span class="req" aria-hidden="true">*</span>' : '') + '</span>';
    else h += labelHTML(f, f.type === 'country' ? id : id);
    h += ctrl;
    if (f.hint) h += '<p class="hint">' + esc(t(f.hint)) + '</p>';
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
      if (months >= 0) out.push('<span class="chip">' + esc(t('m.service', { y: Math.floor(months / 12), m: months % 12 })) + '</span>');
    }
    if (state.data.workCountry === 'SA') { var hj = hijri(v); if (hj) out.push('<span class="hj">' + esc(t('m.hijri', { d: hj })) + '</span>'); }
    return out.join('');
  }

  /* ---------- قائمة الدول القابلة للبحث */
  function comboHTML(id, path, mode, v) {
    var label;
    if (v) label = mode === 'dial' ? flag(v) + '<span class="code">+' + esc(dialOf(v)) + '</span>' : flag(v) + '<span>' + esc(cname(v)) + '</span>';
    else label = '<span class="ph">' + esc(mode === 'dial' ? '+' : t('ph.select')) + '</span>';
    return '<div class="combo ' + mode + '" data-combo="' + esc(path) + '" data-mode="' + mode + '">' +
      '<button type="button" class="inp combo-btn" id="' + id + '" aria-haspopup="listbox" aria-expanded="false">' + label + '<svg class="chev" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5 6 7.5 9 4.5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></button></div>';
  }
  var openCombo = null;
  function closeCombo() {
    if (!openCombo) return;
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
    panel.innerHTML = '<input class="inp combo-search" type="search" placeholder="' + esc(t('ph.search')) + '" aria-label="' + esc(t('ph.search')) + '" autocomplete="off"><ul class="combo-list" role="listbox"></ul>';
    el.appendChild(panel);
    var input = $('.combo-search', panel);
    var list = $('.combo-list', panel);
    var cur = getVal(el.getAttribute('data-combo'));
    function row(c) {
      var name = c[LANG_IDX[state.lang]];
      return '<li role="option" data-cc="' + c[0] + '" aria-selected="' + (c[0] === cur) + '">' + flag(c[0]) + '<span class="nm">' + esc(name) + '</span>' + (mode === 'dial' && c[4] ? '<span class="code">+' + c[4] + '</span>' : '') + '</li>';
    }
    function draw(q) {
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
    input.addEventListener('input', function () { draw(input.value); });
    input.addEventListener('keydown', function (e) {
      var items = $$('li[data-cc]', list), i = items.indexOf($('li.act', list));
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (i > -1) items[i].classList.remove('act');
        i = e.key === 'ArrowDown' ? Math.min(items.length - 1, i + 1) : Math.max(0, i - 1);
        if (items[i]) { items[i].classList.add('act'); items[i].scrollIntoView({ block: 'nearest' }); }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (items[i]) pickCountry(el, items[i].getAttribute('data-cc'));
      } else if (e.key === 'Escape') { closeCombo(); btn.focus(); }
    });
    list.addEventListener('click', function (e) {
      var li = e.target.closest('li[data-cc]');
      if (li) pickCountry(el, li.getAttribute('data-cc'));
    });
    setTimeout(function () { input.focus(); }, 10);
  }
  function pickCountry(el, cc) {
    var path = el.getAttribute('data-combo');
    closeCombo();
    onValue(path, cc, true);
  }

  /* ---------- المرفقات */
  function fileFieldHTML(f, hidden, err) {
    var files = state.files[f.k] || [];
    var id = 'f-' + f.k;
    var accept = f.photo ? 'image/jpeg,image/png,image/webp,image/heic' : 'image/jpeg,image/png,image/webp,image/heic,application/pdf';
    var h = '<div class="field w-full file-field' + (f.photo ? ' is-photo' : '') + (err ? ' has-err' : '') + '" data-field="' + f.k + '"' + hidden + '>';
    h += '<div class="ff-head"><span class="lbl" id="' + id + '-lbl">' + esc(t('f.' + f.k)) + (f.req ? '<span class="req" aria-hidden="true">*</span>' : '') + '</span>';
    h += '<span class="ff-accept">' + esc(f.photo ? t('m.acceptPhoto') : t('m.accept', { n: CFG.MAX_FILE_MB })) + '</span></div>';
    if (f.hint) h += '<p class="hint">' + esc(t(f.hint)) + '</p>';
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
    if (f.photo) { state.files[k] = []; arr = arr.slice(0, 1); }
    var room = f.max - (state.files[k] || []).length;
    arr = arr.slice(0, Math.max(0, room));
    var wrap = $('[data-field="' + k + '"]');
    if (wrap) wrap.classList.add('busy');
    Promise.all(arr.map(function (file) { return processFile(file, f); })).then(function (res) {
      state.files[k] = (state.files[k] || []).concat(res);
      state.errors[k] = '';
    }, function (e) {
      state.errors[k] = e && e.k ? e : 'e.fileType';
    }).then(function () { rerenderField(k); updateNav(); renderCard(); });
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
    document.title = t('app.title') + ' · ' + t('app.dept');
    $('#brandTitle').textContent = t('app.title');
    $('#brandDept').textContent = t('app.dept') + ' · ' + CFG.ORG[L];
    $('#mainLogo').setAttribute('alt', CFG.MAIN_LOGO.name[L]);
    $$('#langSwitch button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === L)); });
    $('#langSwitch').setAttribute('aria-label', t('m.lang'));
    $('#footPrivacy').textContent = t('m.privacy');
    $('#footOrg').textContent = '© ' + new Date().getFullYear() + ' ' + CFG.ORG[L];
    $('#footSig').textContent = CFG.SIGNATURE[L];
    var dl = document.getElementById('dl-langs-list');
    if (!dl) { dl = document.createElement('datalist'); dl.id = 'dl-langs-list'; document.body.appendChild(dl); }
    dl.innerHTML = t('langs.list').split('|').map(function (x) { return '<option value="' + esc(x) + '">'; }).join('');
    renderStrip();
  }

  var LOGO_STATE = {};
  function logoImg(l, cls, alt) {
    var srcs = [];
    if (l.drive) { srcs.push('https://lh3.googleusercontent.com/d/' + l.drive + '=w600'); srcs.push('https://drive.google.com/thumbnail?id=' + l.drive + '&sz=w600'); }
    if (l.local) srcs.push(l.local);
    var key = srcs[0], st = LOGO_STATE[key];
    if (st === 'fail') return '<span class="' + cls + ' logo-fallback">' + esc(alt) + '</span>';
    if (st) return '<img class="' + cls + '" src="' + esc(st) + '" alt="' + esc(alt) + '" referrerpolicy="no-referrer">';
    return '<img class="' + cls + '" src="' + srcs[0] + '" data-key="' + esc(key) + '" data-srcs="' + esc(srcs.slice(1).join('|')) + '" data-alt="' + esc(alt) + '" alt="' + esc(alt) + '" loading="lazy" referrerpolicy="no-referrer">';
  }
  function renderStrip() {
    var L = state.lang;
    var items = CFG.STRIP_LOGOS.map(function (l) {
      return '<li class="logo-tile" title="' + esc(l.name[L]) + '">' + logoImg(l, 'logo-img', l.name[L]) + '</li>';
    }).join('');
    var html = '<ul class="strip-track">' + items + items.replace(/<li /g, '<li aria-hidden="true" ') + '</ul>';
    $$('#stripTop, .strip-fill').forEach(function (el) { el.innerHTML = html; });
  }

  /* ---------------------------------------------------------- بطاقة المنسوب الحيّة */
  function mrzClean(s) { return String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '<'); }
  function yymmdd(iso) { return iso ? iso.slice(2, 4) + iso.slice(5, 7) + iso.slice(8, 10) : '<<<<<<'; }
  function pad(s, n) { s = s.slice(0, n); while (s.length < n) s += '<'; return s; }
  function cardHTML() {
    var d = state.data, L = state.lang;
    var latin = [d.firstName, d.middleName, d.lastName].filter(Boolean).join(' ').toUpperCase();
    var ent = CFG.ENTITIES.filter(function (x) { return x.v === d.entity; })[0];
    var photo = (state.files.photo || [])[0];
    var ref = (state.result && state.result.ref) || ('BNY-HR-' + (d.workCountry || '••') + '-' + new Date().getFullYear() + '-••••');
    var l1 = pad('P<' + mrzClean(d.nationality || '') + mrzClean(d.lastName || '') + '<<' + mrzClean([d.firstName, d.middleName].filter(Boolean).join(' ')), 36);
    var l2 = pad(mrzClean(d.passportNo || '') + '<' + mrzClean(d.nationality || '') + yymmdd(d.birthDate) + (d.gender === 'female' ? 'F' : (d.gender === 'male' ? 'M' : '<')) + yymmdd(d.passportExpiry) + '<BONYANHR', 36);
    var em = d.em1Name ? d.em1Name + (d.em1Phone ? ' · +' + dialOf(d.em1PhoneDial) + ' ' + d.em1Phone : '') : '—';
    var mainLogo = logoImg(CFG.MAIN_LOGO, 'ic-logo-img', CFG.MAIN_LOGO.name[L]).replace(' loading="lazy"', '');
    return '<div class="idcard" tabindex="0" role="button" aria-label="' + esc(t('card.flip')) + '"><div class="idcard-in">' +
      '<div class="face front"><div class="ic-guil" aria-hidden="true"></div>' +
        '<div class="ic-top"><span class="ic-logo">' + mainLogo + '</span><span class="ic-kind">' + esc(t('card.kind')) + '<b>STAFF · HR</b></span><span class="ic-holo" aria-hidden="true"></span></div>' +
        '<div class="ic-body"><div class="ic-photo">' + (photo ? '<img src="' + photo.thumb + '" alt="">' : '<svg viewBox="0 0 70 90" aria-hidden="true"><circle cx="35" cy="34" r="15" fill="currentColor"/><path d="M6 90c2-18 14-28 29-28s27 10 29 28z" fill="currentColor"/></svg>') + '</div>' +
          '<div class="ic-info"><p class="ic-name" dir="ltr">' + esc(latin || t('card.name')) + '</p>' +
          '<p class="ic-name-ar' + (d.fullNameAr ? '' : ' ph') + '" dir="rtl">' + esc(d.fullNameAr || t('card.nameAr')) + '</p>' +
          '<p class="ic-role' + (d.jobTitle ? '' : ' ph') + '">' + esc(d.jobTitle || t('card.role')) + '</p>' +
          '<p class="ic-ent' + (ent ? '' : ' ph') + '">' + esc(ent ? ent[L] : t('card.entity')) + '</p>' +
          '<p class="ic-loc">' + (d.workCountry ? flag(d.workCountry) + '<span>' + esc(cname(d.workCountry)) + '</span>' : '<span class="ph">—</span>') + (d.nationality && d.nationality !== d.workCountry ? '<span class="ic-nat">' + flag(d.nationality) + '</span>' : '') + '</p></div></div>' +
        '<div class="ic-mrz" dir="ltr" aria-hidden="true"><span>' + esc(l1) + '</span><span>' + esc(l2) + '</span></div>' +
      '</div>' +
      '<div class="face back"><div class="ic-strip" aria-hidden="true"></div>' +
        '<dl class="ic-back">' +
          '<div><dt>' + esc(t('card.ref')) + '</dt><dd dir="ltr" class="mono">' + esc(ref) + '</dd></div>' +
          '<div><dt>' + esc(t('card.emergency')) + '</dt><dd dir="auto">' + esc(em) + '</dd></div>' +
          '<div><dt>' + esc(t('card.blood')) + '</dt><dd>' + esc(d.bloodType ? optLabel(FIELD.bloodType, d.bloodType) : '—') + '</dd></div>' +
          '<div><dt>' + esc(t('card.passport')) + '</dt><dd>' + esc(d.passportExpiry ? fmtDate(d.passportExpiry) : '—') + '</dd></div>' +
          '<div><dt>' + esc(t('card.since')) + '</dt><dd>' + esc(d.startDate ? fmtDate(d.startDate) : '—') + '</dd></div>' +
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
    var box = $('#logoBox');
    box.innerHTML = logoImg(CFG.MAIN_LOGO, 'main-logo', CFG.MAIN_LOGO.name[state.lang]).replace('<img ', '<img id="mainLogo" ').replace(' loading="lazy"', '');
  }

  function renderStepper() {
    var n = STEPS.length;
    $('#stepper').innerHTML = STEPS.map(function (st, i) {
      var done = state.checked[i] && i !== state.step;
      var cls = i === state.step ? 'cur' : (done ? 'done' : (i <= state.maxStep ? 'seen' : ''));
      if (done && state.justDone === i) cls += ' stamp-in';
      var num = state.lang === 'ar' ? arDigits(i + 1) : String(i + 1);
      var can = i <= state.maxStep;
      return '<li class="' + cls + '" style="--i:' + i + '"><button type="button" data-goto="' + i + '"' + (can ? '' : ' disabled') + (i === state.step ? ' aria-current="step"' : '') + '>' +
        '<span class="sn">' + num + '</span>' +
        '<span class="st">' + esc(t('st.' + st.id)) + '</span>' +
        (done ? '<span class="stamp" aria-hidden="true">' + esc(t('m.stamp')) + '</span>' : '') + '</button></li>';
    }).join('');
    state.justDone = null;
    var pct = (state.step) / (n - 1) * 100;
    $('#journeyFill').style.width = pct + '%';
    $('#journeyPlane').style.insetInlineStart = 'calc((100% - 72px) * ' + (pct / 100).toFixed(4) + ')';
    $('#progLabel').textContent = t('m.stepOf', { i: state.step + 1, n: n });
  }

  function renderStep() {
    var st = STEPS[state.step];
    var html = '<header class="step-head">' +
      '<h2 id="stepTitle" tabindex="-1">' + esc(t('st.' + st.id)) + '</h2><p class="lead">' + esc(t('sd.' + st.id)) + '</p></header>';
    if (st.id === 'review') html += '<div class="review-card-box"><div class="idcard-wrap" id="cardWrapReview"></div></div>' + reviewHTML(true);
    st.sections.forEach(function (sec) {
      var hid = sec.show && !sec.show(state.data) ? ' hidden' : '';
      html += '<section class="sec"' + hid + ' data-sec="' + sec.t + '"><h3>' + esc(t(sec.t)) + '</h3>' + (sec.hint ? '<p class="hint sec-hint">' + esc(t(sec.hint)) + '</p>' : '') + '<div class="grid">';
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
              if (parts.length) rows += '<div class="rv"><dt>' + esc(t('s.' + f.k)) + '</dt><dd>' + esc(parts.join(' · ')) + '</dd></div>';
            });
            return;
          }
          if (f.type === 'file') {
            var fl = state.files[f.k] || [];
            if (fl.length) rows += '<div class="rv"><dt>' + esc(t('f.' + f.k)) + '</dt><dd dir="auto">' + fl.map(function (x) { return esc(x.origName); }).join('، ') + '</dd></div>';
            return;
          }
          var v = display(f, f.k);
          if (f.k === 'currency' && state.data.currency === 'other' && state.data.currencyOther) v = state.data.currencyOther;
          if (v) rows += '<div class="rv"><dt>' + esc(t('f.' + f.k)) + '</dt><dd dir="auto">' + esc(v) + '</dd></div>';
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
      if (sec) s.hidden = !!(sec.show && !sec.show(state.data));
    });
    $$('#stepBody [data-field]').forEach(function (el) {
      var f = FIELD[el.getAttribute('data-field')];
      if (f) el.hidden = !visible(f);
    });
    var co = $('#f-currencyOther');
    if (co) co.hidden = !C.currencyOther(state.data);
  }

  function renderView() {
    $('#welcome').hidden = state.view !== 'welcome';
    $('#wizard').hidden = state.view !== 'wizard';
    $('#success').hidden = state.view !== 'success';
    $('#stripTop').hidden = state.view === 'welcome';
    document.body.setAttribute('data-view', state.view);
    if (globe && state.view !== 'welcome') { globe.destroy(); globe = null; }
    if (state.view === 'welcome') renderWelcome();
    if (state.view === 'wizard') {
      $('#cardCap').textContent = t('card.live');
      $('#cardHint').textContent = t('card.flip');
      renderCard(); renderStepper(); renderStep();
    }
    if (state.view === 'success') renderSuccess();
  }
  var globe = null;

  var PREP_ICONS = {
    photo: '<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="10" r="3.2"/><path d="M6.5 19c.8-3 3-4.5 5.5-4.5s4.7 1.5 5.5 4.5"/>',
    passport: '<rect x="5" y="2.5" width="14" height="19" rx="2"/><circle cx="12" cy="10" r="3.6"/><path d="M8.4 10h7.2M12 6.4c1.2 1.1 1.2 6.1 0 7.2M12 6.4c-1.2 1.1-1.2 6.1 0 7.2M9 17h6"/>',
    id: '<rect x="2.5" y="5" width="19" height="14" rx="2"/><circle cx="8" cy="11" r="2.2"/><path d="M4.8 16c.6-1.6 1.8-2.4 3.2-2.4s2.6.8 3.2 2.4M14 10h5M14 13h4"/>',
    permit: '<path d="M6 2.5h8l4 4V21a.5.5 0 0 1-.5.5h-11A.5.5 0 0 1 6 21z"/><path d="M14 2.5V7h4"/><circle cx="12" cy="14" r="3.6"/><path d="m10.4 14 1.1 1.1 2.2-2.2"/>',
    contract: '<path d="M6 2.5h8l4 4V21a.5.5 0 0 1-.5.5h-11A.5.5 0 0 1 6 21z"/><path d="M14 2.5V7h4M8.5 11h7M8.5 14h5M8.5 18.2c1-1.4 1.8-1.4 2.4 0s1.4 1.4 2.4-.6"/>',
    bank: '<path d="M3 9.5 12 4l9 5.5M4.5 9.5v8M9 9.5v8M15 9.5v8M19.5 9.5v8M3 20h18"/>'
  };
  function renderWelcome() {
    var prep = ['photo', 'passport', 'id', 'permit', 'contract', 'bank'];
    var stats = [[CFG.LANGS.length, 'stat.langs'], [STEPS.length, 'stat.steps'], [CFG.STRIP_LOGOS.length + 1, 'stat.entities'], [10, 'stat.minutes']];
    $('#welcome').innerHTML =
      '<section class="hero"><div class="hero-glow" aria-hidden="true"></div><div class="wrap hero-in">' +
        '<div class="hero-text">' +
          '<p class="eyebrow rise" style="--d:0">' + esc(t('app.dept')) + ' · Bonyan HR</p>' +
          '<h1 class="rise" style="--d:1"><span>' + esc(t('hero.l1')) + '</span><span class="hl">' + esc(t('hero.l2')) + '</span></h1>' +
          '<p class="lead rise" style="--d:2">' + esc(t('app.lead')) + '</p>' +
          (state.restored ? '<p class="restored rise" style="--d:3"><span class="dot" aria-hidden="true"></span>' + esc(t('m.draftRestored')) + ' <button type="button" class="link light" id="btnClear">' + esc(t('b.clearDraft')) + '</button></p>' : '') +
          '<div class="hero-cta rise" style="--d:3"><button type="button" class="btn gold big" id="btnStart"><span>' + esc(t('b.start')) + '</span><svg class="arr" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11m-4-4 4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
          '</div>' +
          '<ul class="stats rise" style="--d:4">' + stats.map(function (s) { return '<li><b data-count="' + s[0] + '">0</b><span>' + esc(t(s[1])) + '</span></li>'; }).join('') + '</ul>' +
        '</div>' +
        '<div class="hero-globe"><canvas id="globe" aria-label="' + esc(t('globe.hint')) + '" role="img"></canvas><div class="globe-tip" id="globeTip" hidden></div><p class="globe-cap">' + esc(t('globe.hint')) + '</p></div>' +
      '</div><div class="strip strip-hero strip-fill"></div></section>' +
      '<section class="wrap prep-sec"><div class="prep-head"><h2>' + esc(t('app.prepare')) + '</h2><p class="hint">' + esc(t('m.draftNote')) + '</p></div>' +
      '<ol class="prep-grid">' + prep.map(function (p, i) {
        return '<li class="prep-card" style="--i:' + i + '"><span class="prep-ic"><svg viewBox="0 0 24 24" aria-hidden="true">' + PREP_ICONS[p] + '</svg></span><span>' + esc(t('prep.' + p)) + '</span></li>';
      }).join('') + '</ol></section>';
    renderStrip();
    countUp($('#welcome'));
    if (globe) globe.destroy();
    if (window.BonyanGlobe && window.LAND_MASK) {
      globe = window.BonyanGlobe($('#globe'), {
        hq: CFG.HQ, offices: CFG.OFFICES, centerLon: 50, tilt: 16, tip: $('#globeTip'),
        label: function (o) { return o.name ? o.name[state.lang] : cname(o.cc); }
      });
    }
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
      '<div class="welcome-actions">' + (DEMO ? '' : '<button type="button" class="btn ghost" id="btnPrint">' + esc(t('b.print')) + '</button>') +
      '<button type="button" class="btn primary" id="btnNew">' + esc(t('b.newEntry')) + '</button></div></div>' +
      '<div class="print-summary">' + reviewHTML(false) + '</div>';
    renderCard('#cardWrapSuccess');
    setTimeout(confetti, 350);
  }

  /* ---------------------------------------------------------- الأحداث */
  var cardSoon = debounce(function () { if (state.view === 'wizard') renderCard(); }, 140);
  function validFmt(path) {
    var f = FIELD[path];
    if (!f) { var p = path.split(':'); var rf = FIELD[p[1]]; f = rf && rf.fields.filter(function (x) { return x.k === p[3]; })[0]; }
    return f && ['text', 'email', 'phone', 'number'].indexOf(f.type) > -1;
  }
  var DRIVERS = ['nationality', 'workCountry', 'maritalStatus', 'waSame', 'hasContract', 'payMethod', 'bankCountry', 'addrCountry', 'currency'];
  function onValue(path, v, rerenderStep) {
    setVal(path, v);
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
    cardSoon();
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
    var bad = validateStep(state.step, true);
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
    if (!state.checked[state.step]) state.justDone = state.step;
    state.checked[state.step] = true;
    if (state.step === STEPS.length - 1) { submit(); return; }
    goTo(state.step + 1);
  }

  function bind() {
    document.addEventListener('click', function (e) {
      var tgt = e.target;
      var lb = tgt.closest('#langSwitch button');
      if (lb) { setLang(lb.getAttribute('data-lang')); return; }
      if (tgt.closest('#btnStart')) { state.view = 'wizard'; renderView(); goTo(state.step, true); return; }
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
      if (e.key === 'Escape' && openCombo) { var b = $('.combo-btn', openCombo); closeCombo(); if (b) b.focus(); }
    });
    document.addEventListener('input', function (e) {
      var el = e.target;
      if (!el.matches('[data-path]') || el.type === 'checkbox' || el.closest('.seg')) return;
      if (el.tagName === 'SELECT') return;
      var v = el.value;
      onValue(el.getAttribute('data-path'), v, false);
    });
    document.addEventListener('change', function (e) {
      var el = e.target;
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
    document.addEventListener('dragover', function (e) { var d = e.target.closest && e.target.closest('.drop'); if (d) { e.preventDefault(); d.classList.add('over'); } });
    document.addEventListener('dragleave', function (e) { var d = e.target.closest && e.target.closest('.drop'); if (d) d.classList.remove('over'); });
    document.addEventListener('drop', function (e) {
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
      localStorage.setItem(LS_KEY, JSON.stringify({ data: state.data, step: state.step, maxStep: state.maxStep, checked: state.checked, at: Date.now() }));
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
        state.step = Math.min(d.step || 0, STEPS.length - 1);
        state.maxStep = d.maxStep || state.step;
        state.checked = d.checked || {};
        state.restored = Object.keys(d.data).some(function (k) { var v = d.data[k]; return typeof v === 'string' && v && k !== 'waSame'; });
      }
    } catch (e) { }
  }
  function clearDraft() {
    try { localStorage.removeItem(LS_KEY); } catch (e) { }
    state.data = { qualifications: [{}], experience: [], languages: [{}], waSame: 'yes' };
    state.files = {}; state.errors = {}; state.checked = {}; state.step = 0; state.maxStep = 0; state.restored = false; state.result = null;
    state.view = 'welcome';
    renderView();
    window.scrollTo(0, 0);
  }

  /* ---------------------------------------------------------- الإرسال */
  function buildPayload() {
    var raw = {}, ar = {}, d = state.data;
    STEPS.forEach(function (st) {
      st.sections.forEach(function (sec) {
        sec.fields.forEach(function (f) {
          if (!visible(f) || f.type === 'info' || f.type === 'file') return;
          if (f.type === 'repeater') {
            raw[f.k] = (d[f.k] || []).map(function (it) { return it; });
            ar[f.k] = (d[f.k] || []).map(function (it, i) {
              var o = {};
              f.fields.forEach(function (sf) { o[sf.k] = display(sf, 'rep:' + f.k + ':' + i + ':' + sf.k, 'ar'); });
              return o;
            });
            return;
          }
          if (d[f.k] == null || d[f.k] === '') return;
          raw[f.k] = d[f.k];
          ar[f.k] = display(f, f.k, 'ar');
          if (f.type === 'phone') raw[f.k + 'Dial'] = dialOf(d[f.k + 'Dial']);
        });
      });
    });
    if (d.currency === 'other' && d.currencyOther) { raw.currency = d.currencyOther; ar.currency = d.currencyOther; }
    if (d.hasContract === 'no') ar.contractStatus = tl('ar', 'm.noContract');
    if (d.waSame === 'yes' && d.mobile) { ar.whatsapp = ar.mobile; raw.whatsapp = d.mobile; }
    ar.fullNameLatin = [d.firstName, d.middleName, d.lastName].filter(Boolean).join(' ').toUpperCase();
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
    var queue = [];
    STEPS.forEach(function (st) {
      st.sections.forEach(function (sec) {
        sec.fields.forEach(function (f) {
          if (f.type !== 'file' || !visible(f)) return;
          (state.files[f.k] || []).forEach(function (fl, i, arr) { queue.push({ kind: f.k, label: tl('ar', 'f.' + f.k), labelUi: t('f.' + f.k), idx: i + 1, total: arr.length, file: fl }); });
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
      setTimeout(function () {
        $('#overlay').hidden = true;
        try { localStorage.removeItem(LS_KEY); } catch (e) { }
        state.view = 'success';
        renderView();
        window.scrollTo(0, 0);
      }, 400);
    }).catch(function (e) {
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

  /* ---------------------------------------------------------- التشغيل */
  function init() {
    loadDraft();
    var q = (location.search.match(/[?&]lang=(ar|en|id)/) || [])[1];
    if (q) state.lang = q;
    $('#langSwitch').innerHTML = CFG.LANGS.map(function (L) {
      var short = { ar: 'ع', en: 'EN', id: 'ID' }[L] || L.toUpperCase();
      return '<button type="button" data-lang="' + L + '" aria-pressed="false" lang="' + L + '" title="' + esc(DICT[L]['lang.name']) + '">' + short + '</button>';
    }).join('');
    renderMainLogo();
    renderStatic();
    renderView();
    bind();
    $('#form').addEventListener('submit', function (e) { e.preventDefault(); });
    $('#ovRetry').addEventListener('click', function () { $('#overlay').hidden = true; submit(); });
    $('#ovClose').addEventListener('click', function () { $('#overlay').hidden = true; });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
