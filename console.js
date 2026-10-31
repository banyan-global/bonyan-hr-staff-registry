/* Bonyan HR · منصة الموارد البشرية (الواجهة الرئيسية) — تطوير وتنفيذ م. أسامة جنيدي
   البيانات من خادم بنيان مباشرة (api/)، والصلاحيات تُفحص في الخادم مع كل طلب. */

(function () {
'use strict';
var BA = window.BHR_ASSETS || {}, LOGO = BA.logo || '', MAP = BA.map || null, ELOGO = BA.elogo || {};
var TODAY = new Date(), DAY = 864e5;

/* ---------- icons ---------- */
var P = {
  grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.3-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><circle cx="17" cy="9" r="2.6"/><path d="M16 14.6c2.8.1 4.8 1.8 5.4 5.4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
  userok: '<circle cx="10" cy="8" r="4"/><path d="M3 21c1-4 3.6-6 7-6 1.6 0 3 .4 4.1 1.2"/><path d="M15 19l2 2 4-4"/>',
  pass: '<rect x="5" y="3" width="14" height="18" rx="2.5"/><circle cx="12" cy="10" r="3"/><path d="M9 16.5h6"/>',
  doc: '<path d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
  wallet: '<path d="M4 7a2 2 0 0 1 2-2h11v4"/><rect x="3" y="8" width="18" height="12" rx="2.5"/><path d="M16 14h2"/>',
  bank: '<path d="M3 10l9-5 9 5M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  stamp: '<path d="M9 3h6l-1 7h-4z"/><path d="M5 14h14v3H5zM4 21h16"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  shield: '<path d="M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  file: '<path d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v5h5"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  bell: '<path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
  chev: '<path d="M6 9l6 6 6-6"/>',
  back: '<path d="M15 6l-6 6 6 6"/>',
  dl: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 7l8.5 6 8.5-6"/>',
  send: '<path d="M4 12l16-8-6 16-3-7z"/><path d="M11 13l9-9"/>',
  edit: '<path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-4-4L4 16z"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  key: '<circle cx="8" cy="14" r="4"/><path d="M11 11l9-9M17 5l2 2M15 7l2 2"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  archive: '<rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8M10 12h4"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.9-3M4 4v4h4M4 13a8 8 0 0 0 14.9 3M20 20v-4h-4"/>',
  card: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="9" cy="11" r="2"/><path d="M6 16c.5-1.4 1.6-2 3-2s2.5.6 3 2M15 10h3M15 13h3"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>',
  building: '<path d="M4 21V6l8-3 8 3v15M9 21v-4h6v4M8 9h2M14 9h2M8 13h2M14 13h2"/>',
  bolt: '<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
  pie: '<path d="M12 3a9 9 0 1 0 9 9h-9z"/><path d="M15 3.5A9 9 0 0 1 20.5 9H15z"/>',
  gauge: '<path d="M4 18a8 8 0 1 1 16 0"/><path d="M12 18l4-6"/>',
  alert: '<path d="M12 3l9.5 17h-19z"/><path d="M12 10v4M12 17h.01"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  out: '<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 8l-4 4 4 4M6 12h10"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  chat: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4h0A1.5 1.5 0 0 1 4 14.5z"/><path d="M8 8.5h8M8 11.5h5"/>',
  excel: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 8l8 8M16 8l-8 8"/>',
  finger: '<path d="M7.5 4.8A8 8 0 0 1 20 11.5v1"/><path d="M4.3 9A8 8 0 0 0 4 11.5c0 2 .3 3.5 1 5"/><path d="M8.5 20.5c-.9-2-1.5-4.7-1.5-8a5 5 0 0 1 10 0v1.5"/><path d="M12 12v1.5c0 3 .6 5.3 1.6 7.5"/><path d="M17 17c-.1 1.4-.4 2.6-.8 3.6"/>',
  plane: '<path d="M10.2 13.8L3 11.5l1.6-1.6 7.4.6 4.3-4.3c.9-.9 2.6-1.4 3.1-.9s0 2.2-.9 3.1L14.2 12.7l.6 7.4-1.6 1.6z"/>',
  umbrella: '<path d="M3 12.5a9 9 0 0 1 18 0z"/><path d="M12 3v1M12 12.5v6.5a2 2 0 0 1-4 0"/>',
  cert: '<rect x="4" y="3" width="16" height="12" rx="2"/><path d="M8 7.5h8M8 10.5h5"/><circle cx="15.5" cy="17" r="2.6"/><path d="M14 19.2l-.6 2.8 2.1-1 2.1 1-.6-2.8"/>'
};
function ic(n, c) { return '<svg class="i' + (c ? ' ' + c : '') + '" viewBox="0 0 24 24" aria-hidden="true">' + (P[n] || '') + '</svg>'; }
function tile(j, n, cls) { return '<span class="tile ' + j + (cls ? ' ' + cls : '') + '">' + ic(n) + '</span>'; }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
var NF = new Intl.NumberFormat('en-US');
function n(x) { return NF.format(Math.round(x)); }
function fd(d, o) { return d.toLocaleDateString('ar-SA-u-ca-gregory-nu-latn', o || { day: 'numeric', month: 'long', year: 'numeric' }); }
function hijri(d) { try { return d.toLocaleDateString('ar-SA-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return ''; } }
function wday(d) { return d.toLocaleDateString('ar-SA', { weekday: 'long' }); }

/* ---------- roles ---------- */
var USERS = {
  ceo: { name: 'د. عبدالله الغامدي', first: 'دكتور عبدالله', role: 'الرئيس التنفيذي', ini: 'ع', mail: 'abdullah.m.y.alghamdi@gmail.com', j: 'sapphire' },
  hr: { name: 'أ. غيداء عبدالله', first: 'أستاذة غيداء', role: 'مدير الموارد البشرية', ini: 'غ', mail: 'galghamdi0203@gmail.com', j: 'emerald' },
  admin: { name: 'م. أسامة جنيدي', first: 'م. أسامة', role: 'مدير النظام', ini: 'أ', mail: 'osama.mo.bonyan@gmail.com', j: 'amethyst' }
};
var PERMS = [
  ['view', 'عرض ملفات المنسوبين والوثائق', 'users'], ['edit', 'تعديل البيانات ورفع المرفقات', 'edit'], ['pay', 'عرض الرواتب', 'wallet'], ['payedit', 'إعداد المسير ورفعه للاعتماد', 'send'],
  ['approve', 'اعتماد التعديلات الحساسة والمسير', 'stamp'], ['leave', 'اعتماد الإجازات وأوامر الإركاب', 'calendar'], ['mail', 'إرسال الرسائل والتذكيرات', 'mail'],
  ['export', 'التصدير والتقارير', 'dl'], ['audit', 'سجل العمليات', 'history'], ['drive', 'إعدادات الدرايف والأرشيف', 'folder'], ['users', 'إدارة الحسابات والصلاحيات', 'key']
];
var PERM = {
  ceo: { view: 1, edit: 0, pay: 1, payedit: 0, approve: 1, leave: 1, mail: 0, export: 1, audit: 1, drive: 0, users: 0 },
  hr: { view: 1, edit: 1, pay: 1, payedit: 1, approve: 1, leave: 1, mail: 1, export: 1, audit: 1, drive: 0, users: 0 },
  admin: { view: 1, edit: 1, pay: 1, payedit: 1, approve: 1, leave: 1, mail: 1, export: 1, audit: 1, drive: 1, users: 1 }
};
var role = 'hr', ME = null;

/* ---------- demo data ---------- */
/* ---------- reference data (live) ---------- */
var ENT0 = [
  { v: 'bonyan', n: 'شركة بنيان للتدريب', c: '#2B3155' }, { v: 'uni', n: 'جامعة بنيان العالمية', c: '#6b3624' },
  { v: 'hum', n: 'بنيان الإنسانية', c: '#7d2a2f' }, { v: 'waqf', n: 'وقف بنيان', c: '#05603a' },
  { v: 'afaq', n: 'آفاق للتعريف بالإسلام', c: '#6a2531' }, { v: 'acad', n: 'أكاديمية بنيان', c: '#465679' },
  { v: 'maarif', n: 'كلية المعارف', c: '#2f339a' }, { v: 'kafaa', n: 'كفاءة تقنية', c: '#4b3cc0' },
  { v: 'tamkeen', n: 'دار التمكين', c: '#163061' }, { v: 'tedu', n: 'تمكين التعليم', c: '#5b3d76' }
];
var ENT = [], CTRY = [], STAFF = [];
/* أسعار صرف تقريبية إلى الريال السعودي (للمقارنة فقط، لا للصرف) */
var FX = { SAR: 1, USD: 3.75, EUR: 4.35, GBP: 5, AED: 1.02, QAR: 1.03, KWD: 12.2, BHD: 9.95, OMR: 9.74, JOD: 5.29, EGP: 0.077, IDR: 0.00023, MYR: 0.89, KES: 0.029, PKR: 0.0134, INR: 0.043, BDT: 0.031, TRY: 0.09,
  NGN: 0.0025, TZS: 0.0015, UGX: 0.001, ETB: 0.026, SOS: 0.0066, SDG: 0.0062, YER: 0.015, MAD: 0.41, TND: 1.28, DZD: 0.028, IQD: 0.0029, LBP: 0.000042, AFN: 0.055, CNY: 0.52, PHP: 0.065, THB: 0.115,
  ZAR: 0.21, GHS: 0.24, XOF: 0.0066, XAF: 0.0066, SGD: 2.9, CAD: 2.7, AUD: 2.45, JPY: 0.025, MRU: 0.094, DJF: 0.021, LYD: 0.69, BND: 2.9 };
var CUR_S = { SAR: 'ر.س', IDR: 'روبية', EGP: 'جنيه', USD: 'دولار', KES: 'شلن', PKR: 'روبية', EUR: 'يورو', MYR: 'رنغيت', TRY: 'ليرة', AED: 'درهم', INR: 'روبية', GBP: 'جنيه' };
var CUR_N = { SAR: 'ريال سعودي', IDR: 'روبية إندونيسية', EGP: 'جنيه مصري', KES: 'شلن كيني', USD: 'دولار أمريكي', PKR: 'روبية باكستانية', EUR: 'يورو', MYR: 'رنغيت ماليزي', TRY: 'ليرة تركية',
  AED: 'درهم إماراتي', INR: 'روبية هندية', BDT: 'تاكا بنغلاديشي', GBP: 'جنيه إسترليني', ETB: 'بر إثيوبي', TZS: 'شلن تنزاني', UGX: 'شلن أوغندي', NGN: 'نايرا نيجيرية', SDG: 'جنيه سوداني', YER: 'ريال يمني', JOD: 'دينار أردني', SOS: 'شلن صومالي' };
var CUR_J = { SAR: 'var(--j-emerald)', IDR: 'var(--j-garnet)', EGP: 'var(--j-gold)', KES: 'var(--j-teal)', USD: 'var(--j-sapphire)', PKR: 'var(--j-amethyst)' };
var DEFCUR = { SA: 'SAR', ID: 'IDR', EG: 'EGP', KE: 'KES', PK: 'PKR', MY: 'MYR', TR: 'TRY', AE: 'AED', IN: 'INR', BD: 'BDT', ET: 'ETB', TZ: 'TZS', UG: 'UGX', NG: 'NGN', JO: 'JOD', GB: 'GBP' };
var DOC_LIFE = { 'جواز السفر': 3650, 'الإقامة': 730, 'الهوية الوطنية': 1825, 'تصريح العمل': 730, 'العقد': 730 };
function curS(c) { return CUR_S[c] || c; }
function curN(c) { return CUR_N[c] || c; }
function curJ(c) { return CUR_J[c] || 'var(--j-slate)'; }
function st(days) { return days < 0 ? 'bad' : days <= 30 ? 'warn' : days <= 90 ? 'info' : 'ok'; }
var STC = { bad: 'var(--c-bad)', warn: 'var(--c-warn)', info: 'var(--c-info)', ok: 'var(--c-ok)' };
function byRef(r) { return STAFF.filter(function (s) { return s.ref === r; })[0]; }
function av(s, extra) { var ring = s.worst < 0 ? 'var(--c-bad)' : s.status === 'ناقص' ? 'var(--c-warn)' : 'transparent'; return '<span class="av r"' + (extra || '') + ' style="background:linear-gradient(140deg,' + s.ent.c + 'cc,' + s.ent.c + ');--st:' + ring + '">' + esc(s.ini) + '</span>'; }
function elogo(e) { return ELOGO[e.v] ? '<span><img src="' + ELOGO[e.v] + '" alt="' + esc(e.n) + '"></span>' : ''; }
var CNT = {
  get tot() { return STAFF.length; }, get done() { return STAFF.filter(function (s) { return s.status === 'مكتمل'; }).length; },
  get gap() { return STAFF.filter(function (s) { return s.status === 'ناقص'; }).length; }, get exp() { return STAFF.filter(function (s) { return s.worst < 0; }).length; },
  get soon() { return STAFF.filter(function (s) { return s.worst >= 0 && s.worst <= 30; }).length; }, get mail() { return STAFF.filter(function (s) { return !s.mailed; }).length; },
  get self() { return STAFF.filter(function (s) { return s.self; }).length; }, get nobank() { return STAFF.filter(function (s) { return !s.iban; }).length; }
};

var AUDIT = [];
var ACT = { hr: { n: 'غيداء عبدالله', j: 'emerald' }, admin: { n: 'أسامة جنيدي', j: 'amethyst' }, ceo: { n: 'د. عبدالله الغامدي', j: 'sapphire' }, sys: { n: 'النظام', j: 'slate' }, self: { n: 'منسوب', j: 'teal' } };

/* ---------- leave & travel requests (HR side) ---------- */
var REQS = [];
Object.defineProperty(CNT, 'leaves', { get: function () { return REQS.filter(function (r) { return r.type === 'leave' && r.stage === 2; }).length; } });
Object.defineProperty(CNT, 'travels', { get: function () { return REQS.filter(function (r) { return r.type === 'travel' && r.stage === 2; }).length; } });
Object.defineProperty(CNT, 'pendAll', { get: function () { return CNT.self + CNT.leaves + CNT.travels; } });

/* ---------- employee portal data ---------- */
var MY = null;
var STG = { leave: ['تقديم الطلب', 'المدير المباشر', 'الموارد البشرية', 'معتمد'], travel: ['تقديم الطلب', 'المدير المباشر', 'الموارد البشرية', 'معتمد'], cert: ['تقديم الطلب', 'الموارد البشرية', 'جاهز'], update: ['تقديم الطلب', 'الموارد البشرية', 'محدَّث'] };
var RT = { leave: ['gold', 'umbrella', 'إجازة'], travel: ['amethyst', 'plane', 'أمر إركاب'], cert: ['emerald', 'cert', 'تعريف بالراتب'], update: ['sapphire', 'edit', 'تحديث بيانات'] };
function stages(type, stage) {
  var L = STG[type], cur = Math.min(stage, L.length - 1);
  return '<ol class="stg">' + L.map(function (l, i) { var c = stage < 0 && i === 1 ? 'x' : i < cur || (i === cur && i === L.length - 1) ? 'done' : i === cur ? 'now' : ''; return '<li class="' + c + '"><i>' + (c === 'done' ? ic('check') : c === 'x' ? '×' : i + 1) + '</i><span>' + l + '</span></li>'; }).join('') + '</ol>';
}
function stPill(type, stage) { var L = STG[type]; return stage < 0 ? '<span class="pill bad"><i></i>مرفوض</span>' : stage >= L.length - 1 ? '<span class="pill ok"><i></i>' + L[L.length - 1] + '</span>' : '<span class="pill warn"><i></i>عند ' + L[stage] + '</span>'; }
function hm(m) { if (m == null) return '—'; var h = Math.floor(m / 60), mm = m % 60; return (h % 12 || 12) + ':' + String(mm).padStart(2, '0') + (h < 12 ? ' ص' : ' م'); }
function rng(a, b) { return fd(a, { day: 'numeric', month: 'short' }) + (b && +b !== +a ? ' إلى ' + fd(b, { day: 'numeric', month: 'short', year: 'numeric' }) : ''); }

/* ---------- navigation ---------- */
var view = 'home', screen = 'loading', cur = '', ptab = 'over', filt = { q: '', ent: '', cc: '', st: 'all' }, bucket = 'warn', openG = null, lTab = 'in', lMode = 'login', lStep = 0, atab = 'self';
var NAV = [
  { v: 'home', n: 'لوحة القيادة', j: 'emerald', i: 'grid' }, { v: 'people', n: 'المنسوبون', j: 'sapphire', i: 'users', b: 'exp' },
  { v: 'payroll', n: 'الرواتب', j: 'gold', i: 'wallet', p: 'pay', b: 'nobank' },
  { v: 'system', n: 'النظام', j: 'teal', i: 'shield', p: 'sys' }
];
var SNAV = [{ k: 'me', n: 'صفحتي', j: 'emerald', i: 'grid', v: 'me' }, { k: 'myfile', n: 'ملفي وبطاقتي', j: 'garnet', i: 'card', v: 'myfile' }];
Object.defineProperty(CNT, 'myOpen', { get: function () { return MY ? MY.reqs.filter(function (r) { return r.stage >= 0 && r.stage < STG[r.type].length - 1; }).length : 0; } });
var TITLES = { home: ['لوحة القيادة'], people: ['المنسوبون'], payroll: ['الرواتب'], system: ['النظام'], me: ['صفحتي'], myfile: ['ملفي وبطاقتي'] };
var STAFF_VIEWS = ['me', 'myfile'];
var ALIAS = { staff: ['people', 'dir'], documents: ['people', 'docs'], banks: ['payroll', null, 'nobank'], log: ['system', 'log'], security: ['system', 'acc'], accounts: ['system', 'acc'], files: ['system', 'data'], data: ['system', 'data'] };
function allowed(v) {
  if (!TITLES[v]) return false;
  if (role === 'staff') return STAFF_VIEWS.indexOf(v) >= 0;
  if (STAFF_VIEWS.indexOf(v) >= 0) return false;
  if (v === 'payroll') return can('pay');
  if (v === 'system') return can('sys');
  return true;
}
function home() { return role === 'staff' ? 'me' : 'home'; }
function grpOf(v) { var g = NAV.filter(function (x) { return x.v === v || (x.items && x.items.some(function (i) { return i.v === v; })); })[0]; return g ? g.k : 'dash'; }

var app = document.getElementById('app');
function sigHTML() { return '<div class="sigblock"><a class="sigp" href="mailto:osama.mo.bonyan@gmail.com" title="osama.mo.bonyan@gmail.com"><span class="sm">' + ic('edit') + '</span><span>تطوير وتنفيذ <b>أسامة جنيدي</b></span><i></i><span class="tt">أخصائي بيانات ومطوّر أنظمة</span></a><span class="cp">© ' + new Date().getFullYear() + ' مجموعة بنيان العالمية</span></div>'; }
function footHTML() { return '<footer class="foot">' + sigHTML() + '</footer>'; }
function ptitle(h, p, acts) { if (NOTITLE) return ''; return '<div class="ptitle"><div><h1>' + h + '</h1><p>' + p + '</p></div>' + (acts ? '<div class="acts">' + acts + '</div>' : '') + '</div>'; }
function pn(j, i, h, p, end, body, cls) { return '<section class="pn' + (cls ? ' ' + cls : '') + '"><div class="ph">' + tile(j, i) + '<div><h2>' + h + '</h2>' + (p ? '<p>' + p + '</p>' : '') + '</div>' + (end ? '<div class="end">' + end + '</div>' : '') + '</div>' + body + '</section>'; }
function more(t, href) { return '<a class="more" href="' + href + '">' + t + ic('back') + '</a>'; }
function toast(m) { var t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.innerHTML = ic('check') + esc(m); document.body.appendChild(t); setTimeout(function () { t.remove(); }, 2800); }
function ro() { return '<span class="ro">' + ic('eye') + 'صلاحيتك اطلاع واعتماد</span>'; }
function hub(items) { return '<div class="hub">' + items.map(function (h) { return '<a class="hubt" href="#' + h.v + '"' + (h.f ? ' data-f="' + h.f + '"' : '') + (h.bk ? ' data-bk="' + h.bk + '"' : '') + (h.act ? ' data-act="' + h.act + '"' : '') + (h.hot ? ' data-hot="1"' : '') + '>' + tile(h.j, h.i) + '<div><h3>' + h.n + '</h3><p>' + h.d + '</p></div><div class="ft"><b>' + (h.c == null ? '' : h.c) + (h.u ? '<small>' + h.u + '</small>' : '') + '</b><span class="go">' + ic('back') + '</span></div></a>'; }).join('') + '</div>'; }

/* ---------- views ---------- */
var VIEWS = {};
function kpi(j, i, v, unit, l, d, sp, extra) { return '<div class="pn kpi"><div class="t">' + tile(j, i) + '<div><div class="v">' + v + (unit ? '<small>' + unit + '</small>' : '') + '</div><div class="l">' + l + '</div></div></div>' + (extra || '') + '<div class="d"><span>' + d + '</span>' + (sp || '') + '</div></div>'; }
function spark(a, col) {
  var W = 110, H = 34, mx = Math.max.apply(null, a), mn = Math.min.apply(null, a), rg = mx - mn || 1, st = W / (a.length - 1);
  var pts = a.map(function (v, i) { return [W - i * st, H - 4 - (v - mn) / rg * (H - 10)]; }), d = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' '), l = pts[pts.length - 1], id = 'sg' + Math.random().toString(36).slice(2, 7);
  return '<svg class="spark" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + col + '" stop-opacity=".3"/><stop offset="1" stop-color="' + col + '" stop-opacity="0"/></linearGradient></defs><path d="' + d + ' L0 ' + H + ' L' + W + ' ' + H + 'Z" fill="url(#' + id + ')"/><path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="' + l[0] + '" cy="' + l[1] + '" r="3.5" fill="' + col + '" stroke="var(--panel)" stroke-width="1.5"/></svg>';
}
function donut(parts, tot, big, small, defs) {
  var R = 76, C = 2 * Math.PI * R, off = 0, segs = parts.map(function (p) { var len = p[0] / tot * C; var s = '<circle cx="95" cy="95" r="' + R + '" fill="none" stroke="' + p[1] + '" stroke-width="20" stroke-dasharray="' + Math.max(0, len - (parts.length > 1 ? 4 : 0)).toFixed(1) + ' ' + C.toFixed(1) + '" stroke-dashoffset="' + (-off).toFixed(1) + '" stroke-linecap="' + (parts.length > 1 ? 'butt' : 'round') + '"/>'; off += len; return s; }).join('');
  return '<div class="donut"><svg viewBox="0 0 190 190" aria-hidden="true">' + (defs || '') + '<circle cx="95" cy="95" r="' + R + '" fill="none" stroke="var(--well)" stroke-width="20"/>' + segs + '</svg><div class="c"><b>' + big + '</b><span>' + small + '</span></div></div>';
}
function gauge(p, col, l) {
  var R = 64, L = Math.PI * R, id = 'gg' + Math.random().toString(36).slice(2, 7);
  return '<div class="gauge"><svg viewBox="0 0 160 92" aria-hidden="true"><defs><linearGradient id="' + id + '"><stop offset="0" stop-color="' + col + '" stop-opacity=".55"/><stop offset="1" stop-color="' + col + '"/></linearGradient></defs><path d="M16 84 A64 64 0 0 1 144 84" fill="none" stroke="var(--well)" stroke-width="15" stroke-linecap="round"/><path d="M16 84 A64 64 0 0 1 144 84" fill="none" stroke="url(#' + id + ')" stroke-width="15" stroke-linecap="round" stroke-dasharray="' + (L * p).toFixed(1) + ' ' + L.toFixed(1) + '"/></svg><b>' + Math.round(p * 100) + '٪</b><span>' + l + '</span></div>';
}
function lineChart(m) {
  var W = 720, H = 250, L = 34, R = 18, T = 14, B = 34, mx = Math.max(4, Math.max.apply(null, m.map(function (x) { return x.a; }))), tick = Math.ceil(mx / 4);
  var X = function (i) { return W - R - i * (W - R - L) / (m.length - 1); }, Y = function (v) { return H - B - v / (tick * 4) * (H - B - T); };
  var grid = ''; for (var g = 0; g <= 4; g++) { var y = Y(g * tick); grid += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y + '" y2="' + y + '" stroke="var(--line-2)" stroke-dasharray="' + (g ? '4 6' : '0') + '"/><text x="' + (L - 10) + '" y="' + (y + 4) + '" text-anchor="end">' + g * tick + '</text>'; }
  function path(k) { var pts = m.map(function (x, i) { return [X(i), Y(x[k])]; }); var d = 'M' + pts[0][0] + ' ' + pts[0][1]; for (var i = 1; i < pts.length; i++) { var p0 = pts[i - 1], p1 = pts[i], cx = (p0[0] + p1[0]) / 2; d += ' C' + cx + ' ' + p0[1] + ' ' + cx + ' ' + p1[1] + ' ' + p1[0] + ' ' + p1[1]; } return { d: d, pts: pts }; }
  var a = path('a'), b = path('b');
  var dots = function (p, col) { return p.pts.map(function (q, i) { return '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="' + (i === p.pts.length - 1 ? 6 : 4) + '" fill="var(--panel)" stroke="' + col + '" stroke-width="2.5"/>'; }).join(''); };
  var la = a.pts[a.pts.length - 1];
  return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="حركة التسجيل الشهرية"><defs><linearGradient id="la" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d8ee0" stop-opacity=".28"/><stop offset="1" stop-color="#3d8ee0" stop-opacity="0"/></linearGradient><linearGradient id="lb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#22a874" stop-opacity=".22"/><stop offset="1" stop-color="#22a874" stop-opacity="0"/></linearGradient></defs>' + grid +
    '<path d="' + a.d + ' L' + X(m.length - 1) + ' ' + Y(0) + ' L' + X(0) + ' ' + Y(0) + 'Z" fill="url(#la)"/><path d="' + b.d + ' L' + X(m.length - 1) + ' ' + Y(0) + ' L' + X(0) + ' ' + Y(0) + 'Z" fill="url(#lb)"/>' +
    '<path d="' + a.d + '" fill="none" stroke="#3d8ee0" stroke-width="3" stroke-linecap="round"/><path d="' + b.d + '" fill="none" stroke="#22a874" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 0"/>' + dots(a, '#3d8ee0') + dots(b, '#22a874') +
    '<g><rect x="' + (la[0] - 20) + '" y="' + (la[1] - 34) + '" width="40" height="24" rx="8" fill="#3d8ee0"/><text x="' + la[0] + '" y="' + (la[1] - 17) + '" text-anchor="middle" style="fill:#fff;font-weight:800;font-size:13px">' + m[m.length - 1].a + '</text></g>' +
    m.map(function (x, i) { return '<text x="' + X(i) + '" y="' + (H - 8) + '" text-anchor="middle">' + x.d.toLocaleDateString('ar-SA-u-ca-gregory', { month: 'long' }) + '</text>'; }).join('') + '</svg>';
}
function calHTML() {
  var cols = []; for (var w = -4; w < 13; w++) cols.push([]);
  STAFF.forEach(function (s) { s.docs.forEach(function (d) { var w = Math.floor(d.days / 7); if (w >= -4 && w < 13) cols[w + 4].push({ s: s, d: d }); }); });
  var g = cols.map(function (c, i) { var w = i - 4; c.sort(function (a, b) { return a.d.days - b.d.days; });
    return '<div><div class="wk' + (w < 0 ? ' past' : w === 0 ? ' now' : '') + '">' + c.map(function (x) { return '<button style="background:' + STC[st(x.d.days)] + '" data-open="' + x.s.ref + '" data-tip="' + esc(x.s.name + '\n' + x.d.t + '\n' + dl(x.d.days)) + '" aria-label="' + esc(x.s.name + '، ' + x.d.t + '، ' + dl(x.d.days)) + '"></button>'; }).join('') + '</div>' +
      '<div class="wkl' + (w === 0 ? ' now' : '') + '">' + (w === 0 ? 'هذا الأسبوع' : fd(new Date(+TODAY + w * 7 * DAY), { day: 'numeric', month: 'short' })) + '</div></div>'; }).join('');
  return '<div class="cal"><div class="cal-g">' + g + '</div></div><div class="calnote"><div class="legend"><span><i style="background:var(--c-bad)"></i>منتهية</span><span><i style="background:var(--c-warn)"></i>خلال ٣٠ يومًا</span><span><i style="background:var(--c-info)"></i>خلال ٩٠ يومًا</span><span><i style="background:var(--c-ok)"></i>سارية</span></div><span>كل أحد تصل الموارد البشرية قائمة بالوثائق التي تنتهي خلال ٦٠ يومًا</span></div>';
}



VIEWS.documents = function () {
  var all = []; STAFF.forEach(function (s) { s.docs.forEach(function (d) { all.push({ s: s, d: d }); }); });
  var B = [['bad', 'منتهية', 'garnet', 'alert'], ['warn', 'خلال ٣٠ يومًا', 'gold', 'clock'], ['info', 'خلال ٩٠ يومًا', 'sapphire', 'calendar'], ['ok', 'سارية', 'emerald', 'check'], ['nofile', 'بلا ملف مرفوع', 'slate', 'file']];
  var by = { bad: [], warn: [], info: [], ok: [], nofile: [] }; all.forEach(function (x) { by[st(x.d.days)].push(x); if (!x.d.file) by.nofile.push(x); });
  var rows = by[bucket].sort(function (a, b) { return a.d.days - b.d.days; });
  var types = {}; all.forEach(function (x) { var t = types[x.d.t] = types[x.d.t] || { n: 0, bad: 0, warn: 0 }; t.n++; if (x.d.days < 0) t.bad++; else if (x.d.days <= 30) t.warn++; });
  var tbl = rows.length ? '<div class="tw"><table><thead><tr><th>المنسوب</th><th>الوثيقة</th><th>الرقم</th><th>تاريخ الانتهاء</th><th>الحالة</th><th></th></tr></thead><tbody>' +
    rows.map(function (x) { return '<tr class="click" data-open="' + x.s.ref + '"><td><div class="person">' + av(x.s) + '<div><b>' + esc(x.s.name) + '</b><span>' + esc(x.s.c.n + '، ' + x.s.ent.n) + '</span></div></div></td><td>' + x.d.t + '</td><td><span class="ltr">' + esc(x.d.no || '—') + '</span></td><td>' + fdx(x.d.exp) + '</td><td><span class="pill ' + (x.d.file && bucket !== 'nofile' ? st(x.d.days) : 'bad') + '"><i></i>' + (bucket === 'nofile' ? 'الملف غير مرفوع' : dl(x.d.days)) + '</span></td><td>' + (can('mail') && (x.d.days <= 90 || bucket === 'nofile') ? '<button class="btn sm" data-msgdoc="' + x.s.ref + '" data-stop="1">' + ic('send') + 'تذكير</button>' : '') + '</td></tr>'; }).join('') + '</tbody></table></div>' : '<div class="empty">لا توجد وثائق في هذه الفئة.</div>';
  return ptitle('مركز الوثائق', all.length + ' وثيقة مسجّلة: جوازات وهويات وإقامات وتصاريح عمل وعقود. كل أحد تصل الموارد البشرية قائمة بما ينتهي خلال ٦٠ يومًا.', can('mail') ? '<button class="btn goldb" data-act="remindAll">' + ic('send') + 'تذكير أصحاب الوثائق المنتهية</button>' : ro()) +
    '<div class="tabs2">' + B.map(function (x) { return '<button class="stat" data-bucket="' + x[0] + '" aria-pressed="' + (bucket === x[0]) + '">' + tile(x[2], x[3]) + '<div><b>' + by[x[0]].length + '</b><span>' + x[1] + '</span></div></button>'; }).join('') + '</div>' +
    pn('sapphire', 'calendar', 'تقويم الانتهاء', 'اضغط أي مربع لفتح ملف صاحبه', '', calHTML()) +
    '<div class="grid g21">' + pn('garnet', 'pass', B.filter(function (x) { return x[0] === bucket; })[0][1], rows.length + ' وثيقة، الأقرب انتهاءً أولًا', '', tbl) +
    pn('teal', 'pie', 'حسب نوع الوثيقة', '', '', '<div class="pb bars">' + Object.keys(types).sort(function (a, b) { return types[b].n - types[a].n; }).map(function (k) { var t = types[k];
      return '<div class="brow"><span class="cc">' + ic(k === 'العقد' ? 'doc' : 'pass') + '</span><div><div class="nm">' + k + '<span>' + (t.bad ? t.bad + ' منتهية' : t.warn ? t.warn + ' قريبة' : 'سليمة') + '</span></div><div class="tr"><i style="width:' + (t.bad / t.n * 100) + '%;background:var(--c-bad)"></i><i style="width:' + (t.warn / t.n * 100) + '%;background:var(--c-warn)"></i><i style="flex:1;background:var(--c-ok);opacity:.6"></i></div></div><span class="v">' + t.n + '</span></div>'; }).join('') + '</div>') + '</div>';
};





/* ----- hub: staff ----- */

/* ----- hub: payroll ----- */

/* ----- employee portal ----- */

/* ===== v5: one page per section, in-page tabs ===== */
var TAB = { people: 'dir', payroll: 'run', system: 'acc' }, NOTITLE = false, PAYF = 'all', PAYE = '';
var TABL = { people: { dir: 'الدليل', docs: 'الوثائق' }, payroll: { run: 'كشف الرواتب' }, system: { acc: 'الحسابات والصلاحيات', log: 'سجل العمليات', data: 'البيانات والنسخ' } };
function vtabs(key, items) {
  return '<div class="vtabs" role="tablist">' + items.map(function (x) { return '<button role="tab" data-vt="' + key + ':' + x[0] + '" aria-selected="' + (TAB[key] === x[0]) + '">' + ic(x[3]) + x[1] + (x[2] != null ? '<span class="c' + (x[4] ? ' hot' : '') + '">' + x[2] + '</span>' : '') + '</button>'; }).join('') + '</div>';
}
function sub(fn) { NOTITLE = true; try { return fn(); } finally { NOTITLE = false; } }

VIEWS.people = function () {
  var t = TAB.people, nC = new Set(STAFF.map(function (s) { return s.c.cc; })).size, nE = new Set(STAFF.map(function (s) { return s.ent.v; })).size, nd = 0;
  STAFF.forEach(function (s) { nd += s.docs.length; });
  var acts = t === 'dir' ? (can('export') ? '<button class="btn" data-act="excel">' + ic('excel') + 'تصدير Excel</button>' : '') + (can('edit') ? '<button class="btn goldb" data-act="regLink">' + ic('plus') + 'نسخ رابط التسجيل</button>' : '')
    : (can('mail') ? '<button class="btn goldb" data-act="remindAll">' + ic('send') + 'تذكير أصحاب الوثائق المنتهية</button>' : '');
  return ptitle('المنسوبون', CNT.tot + ' منسوبًا في ' + nC + ' دول و' + nE + ' جهات. الملفات والبطاقات والوثائق في مكان واحد.', acts) +
    vtabs('people', [['dir', 'الدليل', CNT.tot, 'users'], ['docs', 'الوثائق', CNT.exp ? CNT.exp + ' منتهية' : nd, 'pass', CNT.exp]]) +
    (t === 'dir' ? sub(VIEWS.dir) : sub(VIEWS.documents));
};



/* ----- employee: requests merged ----- */

/* ===== v6: direct messaging (email + WhatsApp) ===== */
var MSGS = [];
var MT = {
  docs: { n: 'تذكير بتجديد وثيقة', ar: ['تذكير بتجديد {doc}', 'السلام عليكم {name}،\n\nنود تذكيرك بأن {doc} {when}. نرجو رفع النسخة الجديدة من رابط التحديث أدناه في أقرب وقت.\n\n{link}\n\nمع التحية،\nالموارد البشرية، مجموعة بنيان العالمية'],
    en: ['Reminder: renew your {doc}', 'Dear {name},\n\nThis is a reminder that your {doc} {when}. Please upload the renewed copy using the link below.\n\n{link}\n\nBest regards,\nHR, Bonyan International Group'],
    id: ['Pengingat: perpanjang {doc}', 'Yth. {name},\n\nKami mengingatkan bahwa {doc} Anda {when}. Mohon unggah salinan terbaru melalui tautan di bawah.\n\n{link}\n\nSalam,\nSDM, Bonyan International Group'] },
  gap: { n: 'طلب استكمال بيانات', ar: ['نرجو استكمال ملفك', 'السلام عليكم {name}،\n\nينقص ملفك في سجل المنسوبين: {missing}. نرجو استكماله من الرابط أدناه، ولا يستغرق ذلك أكثر من دقيقتين.\n\n{link}\n\nمع التحية،\nالموارد البشرية'],
    en: ['Please complete your file', 'Dear {name},\n\nYour staff file is missing: {missing}. Please complete it using the link below. It takes about two minutes.\n\n{link}\n\nBest regards,\nHR'],
    id: ['Mohon lengkapi data Anda', 'Yth. {name},\n\nData Anda belum lengkap: {missing}. Mohon lengkapi melalui tautan di bawah, hanya sekitar dua menit.\n\n{link}\n\nSalam,\nSDM'] },
  update: { n: 'دعوة لتحديث البيانات', ar: ['حدّث بياناتك في سجل المنسوبين', 'السلام عليكم {name}،\n\nنرجو مراجعة بياناتك وتحديث ما تغيّر منها، مثل الجوال والعنوان والحساب البنكي، من الرابط الخاص بك:\n\n{link}\n\nرقمك المرجعي: {ref}\n\nمع التحية،\nالموارد البشرية'],
    en: ['Please review your details', 'Dear {name},\n\nPlease review your details and update anything that changed, such as phone, address or bank account, using your personal link:\n\n{link}\n\nReference: {ref}\n\nBest regards,\nHR'],
    id: ['Mohon perbarui data Anda', 'Yth. {name},\n\nMohon periksa dan perbarui data Anda, seperti nomor telepon, alamat atau rekening bank, melalui tautan pribadi Anda:\n\n{link}\n\nNomor referensi: {ref}\n\nSalam,\nSDM'] },
  general: { n: 'رسالة عامة', ar: ['رسالة من الموارد البشرية', 'السلام عليكم {name}،\n\n\n\nمع التحية،\nالموارد البشرية، مجموعة بنيان العالمية'],
    en: ['A message from HR', 'Dear {name},\n\n\n\nBest regards,\nHR, Bonyan International Group'], id: ['Pesan dari SDM', 'Yth. {name},\n\n\n\nSalam,\nSDM, Bonyan International Group'] }
};
var LANGN = { ar: 'العربية', en: 'English', id: 'Bahasa Indonesia' };
var CMP = null;
function linky(t) { return esc(t).replace(/https?:\/\/\S+/g, function (u) { return '<bdi dir="ltr">' + u + '</bdi>'; }).replace(/\n/g, '<br>'); }
function msgOpen(refs) {
  var list = refs.map(byRef).filter(Boolean), one = list.length === 1 ? list[0] : null;
  var tpl = one ? (one.worst <= 30 ? 'docs' : one.miss.length ? 'gap' : 'update') : (filt.st === 'exp' ? 'docs' : filt.st === 'gap' ? 'gap' : 'update');
  CMP = { refs: refs, list: list, one: one, ch: 'mail', tpl: tpl, L: one ? langOf(one) : 'auto', link: true, subj: '', body: '' };
  loadT(); drawMsg();
}
function loadT() { var s = CMP.one || CMP.list[0], L = CMP.L === 'auto' ? langOf(s) : CMP.L, T = MT[CMP.tpl][L]; CMP.subj = T[0]; CMP.body = T[1]; }
function render1(s) { var L = CMP.L === 'auto' ? langOf(s) : CMP.L; return { subj: fillT(CMP.subj, s, L), body: fillT(CMP.body, s, L), L: L }; }
function drawMsg() {
  var old = document.getElementById('msgLayer'); if (old) old.remove();
  var s = CMP.one || CMP.list[0], R = render1(s), bulk = !CMP.one, ch = bulk && CMP.ch !== 'mail' ? 'mail' : CMP.ch;
  CMP.ch = ch;
  var who = bulk ? '<div class="mto bulk"><div class="faces">' + CMP.list.slice(0, 8).map(function (x) { return av(x); }).join('') + (CMP.list.length > 8 ? '<span class="av" style="background:var(--well);color:var(--mute)">+' + (CMP.list.length - 8) + '</span>' : '') + '</div><div><b>' + CMP.list.length + ' منسوبين</b><span>كلٌّ يصله بريد باسمه وبلغته، من البريد الرسمي للموارد البشرية</span></div></div>'
    : '<div class="mto">' + av(s) + '<div><b>' + esc(s.name) + '</b><span class="ltr">' + esc(s.mail || 'لا يوجد بريد مسجّل') + '</span><span class="ltr">' + esc(s.wa || s.phone) + '</span></div></div>';
  var chs = [['mail', 'البريد الرسمي', 'mail'], ['wa', 'واتساب', 'chat'], ['both', 'الاثنان', 'send']];
  var waUrl = 'https://wa.me/' + waDigits(s) + '?text=' + encodeURIComponent(sendText(s, 'wa').body);
  var prev = ch === 'wa' ? '' : '<div class="mp-mail"><div class="h"><img src="' + LOGO + '" alt="">الموارد البشرية، مجموعة بنيان العالمية</div><div class="b" dir="' + (R.L === 'ar' ? 'rtl' : 'ltr') + '"><b>' + esc(R.subj) + '</b><p>' + linky(R.body) + '</p></div><div class="f">رسالة آلية من منصة بنيان للموارد البشرية</div></div>';
  if (ch !== 'mail') prev += '<div class="mp-wa"><div class="bub" dir="' + (R.L === 'ar' ? 'rtl' : 'ltr') + '">' + linky(R.body) + '<span class="tm">' + hm(new Date().getHours() * 60 + new Date().getMinutes()) + '</span></div></div>';
  var send = ch === 'mail' ? '<button class="btn goldb" id="msgSend">' + ic('send') + (bulk ? 'إرسال إلى ' + CMP.list.length + ' منسوبين' : 'إرسال البريد') + '</button>'
    : '<a class="btn goldb" id="msgSend" href="' + waUrl + '" target="_blank" rel="noopener">' + ic('chat') + (ch === 'both' ? 'إرسال البريد وفتح واتساب' : 'فتح واتساب بالرسالة') + '</a>';
  var el = document.createElement('div'); el.id = 'msgLayer';
  el.innerHTML = '<div class="mscrim" data-mclose="1"></div><section class="mdl" role="dialog" aria-modal="true" aria-label="مراسلة المنسوب"><header class="mh">' + tile('emerald', 'chat') + '<div><h2>' + (bulk ? 'مراسلة جماعية' : 'مراسلة المنسوب') + '</h2><p>' + (bulk ? 'بالبريد الرسمي فقط' : 'تصل على بريده الرسمي أو واتساب') + '</p></div><button class="ib mx" data-mclose="1" aria-label="إغلاق">' + ic('plus') + '</button></header>' +
    '<div class="mbody"><div class="mform">' + who +
    '<div class="fld"><label>القناة</label><div class="mseg" role="group">' + chs.map(function (c) { var dis = bulk && c[0] !== 'mail'; return '<button type="button" data-mch="' + c[0] + '" aria-pressed="' + (ch === c[0]) + '"' + (dis ? ' disabled title="الإرسال الجماعي بواتساب يحتاج حساب واتساب للأعمال"' : '') + '>' + ic(c[2]) + c[1] + '</button>'; }).join('') + '</div></div>' +
    '<div class="form"><div class="fld"><label for="mTpl">القالب</label><select id="mTpl">' + Object.keys(MT).map(function (k) { return '<option value="' + k + '"' + (CMP.tpl === k ? ' selected' : '') + '>' + MT[k].n + '</option>'; }).join('') + '</select></div>' +
    '<div class="fld"><label for="mLang">اللغة</label><select id="mLang">' + (bulk ? '<option value="auto"' + (CMP.L === 'auto' ? ' selected' : '') + '>لغة كل منسوب</option>' : '') + Object.keys(LANGN).map(function (k) { return '<option value="' + k + '"' + (CMP.L === k ? ' selected' : '') + '>' + LANGN[k] + '</option>'; }).join('') + '</select></div>' +
    (ch !== 'wa' ? '<div class="fld wide"><label for="mSubj">عنوان البريد</label><input id="mSubj" dir="' + (R.L === 'ar' ? 'rtl' : 'ltr') + '" value="' + esc(CMP.subj) + '"></div>' : '') +
    '<div class="fld wide"><label for="mBody">نص الرسالة</label><textarea id="mBody" rows="8" dir="' + (R.L === 'ar' ? 'rtl' : 'ltr') + '">' + esc(CMP.body) + '</textarea><small class="hint">المتغيرات: {name} الاسم، {ref} الرقم المرجعي، {doc} الوثيقة، {missing} النواقص، {link} رابط التحديث</small></div>' +
    '<div class="fld wide"><label class="ck"><input type="checkbox" id="mLink"' + (CMP.link ? ' checked' : '') + '> إرفاق رابط التحديث الذاتي الخاص بالمنسوب</label></div></div></div>' +
    '<div class="mprev"><span class="ml">معاينة ' + (bulk ? 'أول رسالة' : 'الرسالة') + '</span>' + prev + '</div></div>' +
    '<footer class="mf"><span class="note">' + ic('info') + '<span>' + (ch === 'mail' ? 'يُرسل من بريد المنصة الرسمي، ويُحفظ في سجل المنسوب باسمك. الرابط الخاص يُضاف لكل منسوب عند الإرسال.' : 'يفتح واتساب برسالة جاهزة لترسلها أنت. الإرسال الآلي يحتاج حساب واتساب للأعمال.') + '</span></span><button class="btn" data-mclose="1">إلغاء</button>' + send + '</footer></section>';
  document.body.appendChild(el);
  var $ = function (i) { return document.getElementById(i); };
  el.querySelectorAll('[data-mclose]').forEach(function (b) { b.onclick = function () { el.remove(); CMP = null; }; });
  el.querySelectorAll('[data-mch]').forEach(function (b) { b.onclick = function () { syncMsg(); CMP.ch = b.dataset.mch; drawMsg(); }; });
  $('mTpl').onchange = function () { CMP.tpl = this.value; loadT(); drawMsg(); };
  $('mLang').onchange = function () { CMP.L = this.value; loadT(); drawMsg(); };
  $('mLink').onchange = function () { syncMsg(); CMP.link = this.checked; drawMsg(); };
  var upd = function () { syncMsg(); var R2 = render1(s), m = el.querySelector('.mp-mail .b'), w = el.querySelector('.mp-wa .bub'); if (m) m.innerHTML = '<b>' + esc(R2.subj) + '</b><p>' + linky(R2.body) + '</p>'; if (w) w.innerHTML = linky(R2.body) + '<span class="tm">' + hm(new Date().getHours() * 60 + new Date().getMinutes()) + '</span>'; var a = $('msgSend'); if (a.tagName === 'A') a.href = 'https://wa.me/' + waDigits(s) + '?text=' + encodeURIComponent(sendText(s, 'wa').body); };
  $('mBody').oninput = upd; if ($('mSubj')) $('mSubj').oninput = upd;
  $('msgSend').addEventListener('click', function (ev) { syncMsg(); if (ch === 'mail') ev.preventDefault(); realSend(el, s, ch, bulk); });
  setTimeout(function () { var f = $('mBody'); if (f) f.focus(); }, 30);
}
function syncMsg() { if (!CMP) return; var b = document.getElementById('mBody'), sj = document.getElementById('mSubj'); if (b) CMP.body = b.value; if (sj) CMP.subj = sj.value; }

/* ---------- map ---------- */
var mapRAF = 0, mapRO = null, clockT = 0;
function stopMap() { cancelAnimationFrame(mapRAF); if (mapRO) { mapRO.disconnect(); mapRO = null; } clearInterval(clockT); }
function startMap(cv, faint) {
  if (!cv) return;
  var bin = atob(MAP.b64), bits = new Uint8Array(MAP.cols * MAP.rows); for (var i = 0; i < bits.length; i++) bits[i] = (bin.charCodeAt(i >> 3) >> (7 - (i & 7))) & 1;
  var counts = {}; STAFF.forEach(function (s) { counts[s.c.cc] = (counts[s.c.cc] || 0) + 1; });
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, t0 = performance.now(), ctx = cv.getContext('2d');
  function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function draw(now) {
    var dpr = Math.min(2, devicePixelRatio || 1), W = cv.clientWidth, H = cv.clientHeight; if (!W || !H) return;
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    var lonSpan = MAP.L1 - MAP.L0, latSpan = MAP.A1 - MAP.A0, sc = Math.min(W / lonSpan, H / latSpan) * (faint ? 1.3 : 1.05);
    var ox = (W - lonSpan * sc) / 2, oy = (H - latSpan * sc) / 2;
    var px = function (lon) { return ox + (lon - MAP.L0) * sc; }, py = function (lat) { return oy + (MAP.A1 - lat) * sc; };
    var r = Math.max(.75, sc * MAP.S * .27);
    ctx.fillStyle = 'rgba(227,196,133,' + (faint ? .26 : .32) + ')';
    for (var y = 0; y < MAP.rows; y++) for (var x = 0; x < MAP.cols; x++) if (bits[y * MAP.cols + x]) { ctx.beginPath(); ctx.arc(px(MAP.L0 + x * MAP.S), py(MAP.A1 - y * MAP.S), r, 0, 6.283); ctx.fill(); }
    var hx = px(39.17), hy = py(21.54), t = reduce ? 1 : Math.max(0, Math.min(1, (now - t0) / 1600)), ease = 1 - Math.pow(1 - t, 3);
    var ks = Object.keys(MAP.C).filter(function (k) { return counts[k]; });
    ks.forEach(function (k, idx) {
      if (k === 'SA') return;
      var c = MAP.C[k], x2 = px(c[1]), y2 = py(c[0]), mx = (hx + x2) / 2, my = (hy + y2) / 2 - Math.hypot(x2 - hx, y2 - hy) * .32, tt = Math.max(0, Math.min(1, ease * 1.25 - idx * .04));
      var gr = ctx.createLinearGradient(hx, hy, x2, y2); gr.addColorStop(0, 'rgba(246,223,171,.95)'); gr.addColorStop(1, 'rgba(76,203,220,.8)');
      ctx.strokeStyle = gr; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(hx, hy);
      for (var s = 1; s <= 32 * tt; s++) { var u = s / 32; ctx.lineTo((1 - u) * (1 - u) * hx + 2 * (1 - u) * u * mx + u * u * x2, (1 - u) * (1 - u) * hy + 2 * (1 - u) * u * my + u * u * y2); }
      ctx.stroke();
      if (!faint && !reduce && t >= 1) { var u2 = ((now / 2400) + idx * .17) % 1; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc((1 - u2) * (1 - u2) * hx + 2 * (1 - u2) * u2 * mx + u2 * u2 * x2, (1 - u2) * (1 - u2) * hy + 2 * (1 - u2) * u2 * my + u2 * u2 * y2, 1.8, 0, 6.283); ctx.fill(); }
    });
    var dotsXY = ks.map(function (k) { var c = MAP.C[k]; return { k: k, x: px(c[1]), y: py(c[0]), r: 4 + Math.sqrt(counts[k]) * 2.4 }; });
    dotsXY.forEach(function (d) {
      ctx.fillStyle = d.k === 'SA' ? 'rgba(246,223,171,.25)' : 'rgba(76,203,220,.2)'; ctx.beginPath(); ctx.arc(d.x, d.y, d.r + 6, 0, 6.283); ctx.fill();
      ctx.fillStyle = d.k === 'SA' ? '#f6dfab' : '#4ccbdc'; ctx.beginPath(); ctx.arc(d.x, d.y, Math.max(0, d.r * ease), 0, 6.283); ctx.fill();
    });
    if (!faint && ease > .9) {
      ctx.font = '700 12.5px Tajawal, sans-serif'; ctx.direction = 'rtl'; ctx.textAlign = 'center';
      var placed = [], hit = function (a) { return placed.some(function (b) { return a.x < b.x + b.w + 4 && a.x + a.w + 4 > b.x && a.y < b.y + b.h + 3 && a.y + a.h + 3 > b.y; }) || dotsXY.some(function (d) { return d.x + d.r > a.x && d.x - d.r < a.x + a.w && d.y + d.r > a.y && d.y - d.r < a.y + a.h; }) || a.x < 2 || a.x + a.w > W - 2 || a.y < 2 || a.y + a.h > H - 2; };
      dotsXY.slice().sort(function (a, b) { return counts[b.k] - counts[a.k]; }).forEach(function (d) {
        var nm = (CTRY.filter(function (z) { return z.cc === d.k; })[0] || { n: d.k }).n, lab = nm + '  ' + counts[d.k], tw = ctx.measureText(lab).width + 18, th = 24, gap = d.r + 8;
        var C = [[0, -1], [0, 1], [-1, 0], [1, 0], [-1, -1], [1, -1], [-1, 1], [1, 1], [0, -2.2], [0, 2.2], [-1.8, 0], [1.8, 0]], best = null;
        for (var q = 0; q < C.length && !best; q++) { var cx = d.x + C[q][0] * (gap + tw / 2), cy = d.y + C[q][1] * (gap + th / 2), box = { x: cx - tw / 2, y: cy - th / 2, w: tw, h: th, cx: cx, cy: cy }; if (!hit(box)) best = box; }
        if (!best) best = { x: d.x - tw / 2, y: d.y - gap - th, w: tw, h: th, cx: d.x, cy: d.y - gap - th / 2 };
        placed.push(best);
        ctx.strokeStyle = 'rgba(227,196,133,.45)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(Math.max(best.x, Math.min(best.x + best.w, d.x)), Math.max(best.y, Math.min(best.y + best.h, d.y))); ctx.stroke();
        ctx.fillStyle = 'rgba(6,14,30,.82)'; rr(best.x, best.y, tw, th, 12); ctx.fill(); ctx.strokeStyle = 'rgba(227,196,133,.35)'; ctx.stroke();
        ctx.fillStyle = '#f2f5fb'; ctx.fillText(lab, best.cx, best.cy + 4.5);
      });
    }
    if (!faint) { var pulse = reduce ? .5 : (now / 1500) % 1; ctx.strokeStyle = 'rgba(246,223,171,' + (1 - pulse) * .85 + ')'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(hx, hy, 10 + pulse * 24, 0, 6.283); ctx.stroke(); }
    if (!reduce && (t < 1 || !faint)) mapRAF = requestAnimationFrame(draw);
  }
  mapRAF = requestAnimationFrame(draw);
  if (window.ResizeObserver) { mapRO = new ResizeObserver(function () { cancelAnimationFrame(mapRAF); mapRAF = requestAnimationFrame(draw); }); mapRO.observe(cv); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { cancelAnimationFrame(mapRAF); mapRAF = requestAnimationFrame(draw); });
}

/* ---------- login ---------- */
var LG = { mail: '' };

/* ---------- bindings ---------- */
function openRec(ref) { if (role === 'staff') return; cur = ref; ptab = 'over'; TAB.people = 'dir'; if (view !== 'people') { filt = { q: '', ent: '', cc: '', st: 'all' }; openG = null; location.hash = 'people'; } else render(); }
function closePops() { var t = document.querySelector('.tip'); if (t) t.remove(); document.body.classList.remove('nav-open'); var sc = document.querySelector('.scrim'); if (sc) sc.remove(); }
function logAct(a, r) { AUDIT.unshift({ u: role, a: a, r: r == null ? -1 : r, t: 1, i: 'key' }); }
function bind() {
  var $ = function (s) { return app.querySelector(s); };
  app.querySelectorAll('[data-open]').forEach(function (el) { el.addEventListener('click', function (e) { if (e.target.closest('[data-stop]')) return; openRec(el.dataset.open); }); });
  app.querySelectorAll('[data-go]').forEach(function (el) { el.onclick = function () { location.hash = el.dataset.go; }; });
  app.querySelectorAll('[data-act]').forEach(function (el) { el.addEventListener('click', function (e) { e.stopPropagation(); doAct(el.dataset.act, el); }); });
  app.querySelectorAll('[data-g]').forEach(function (el) { el.onclick = function () { var k = el.dataset.g; openG = openG === k ? '' : k; var isOpen = el.parentNode.classList.toggle('open'); el.setAttribute('aria-expanded', isOpen); }; });
  app.querySelectorAll('a[data-f]').forEach(function (el) { el.addEventListener('click', function () { TAB.people = 'dir'; filt = { q: '', ent: '', cc: '', st: el.dataset.f }; if (view === 'people') setTimeout(render); }); });
  app.querySelectorAll('a[data-bk]').forEach(function (el) { el.addEventListener('click', function () { bucket = el.dataset.bk; TAB.people = 'docs'; if (view === 'people') setTimeout(render); }); });
  app.querySelectorAll('[data-msg]').forEach(function (el) { el.onclick = function () { msgOpen([el.dataset.msg]); }; });
  app.querySelectorAll('[data-msgall]').forEach(function (el) { el.onclick = function () { msgOpen(filtered().map(function (x) { return x.ref; })); }; });
  app.querySelectorAll('[data-vt]').forEach(function (el) { el.onclick = function () { var p = el.dataset.vt.split(':'); TAB[p[0]] = p[1]; render(); }; });
  app.querySelectorAll('[data-pe]').forEach(function (el) { el.onclick = function () { PAYE = el.dataset.pe; PAYF = 'all'; render(); var t = app.querySelector('#payEnt'); if (t) t.closest('.pn').scrollIntoView({ behavior: 'smooth', block: 'start' }); }; });
  app.querySelectorAll('[data-pf]').forEach(function (el) { el.onclick = function () { PAYF = el.dataset.pf; render(); }; });
  app.querySelectorAll('a[data-pfl]').forEach(function (el) { el.addEventListener('click', function () { PAYF = el.dataset.pfl; PAYE = ''; if (view === 'payroll') setTimeout(function () { render(); var t = app.querySelector('#payEnt'); if (t) t.closest('.pn').scrollIntoView({ behavior: 'smooth', block: 'start' }); }); }); });
  var pe = $('#payEnt'); if (pe) pe.onchange = function () { PAYE = pe.value; render(); };
  var af = $('#attFile'); if (af) af.onchange = function () { if (af.files[0]) toast('قُرئ الملف «' + af.files[0].name + '». في النسخة الحية تُطابق البصمات وتُحدَّث الأرقام'); };
  app.querySelectorAll('[data-gobk]').forEach(function (el) { el.onclick = function () { bucket = el.dataset.gobk; location.hash = 'documents'; }; });
  app.querySelectorAll('[data-pick]').forEach(function (el) { el.onclick = function () { cur = el.dataset.pick; ptab = 'over'; render(); if (innerWidth < 1280) { var p = $('.prof'); if (p) p.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }; });
  app.querySelectorAll('[data-ptab]').forEach(function (el) { el.onclick = function () { ptab = el.dataset.ptab; render(); }; });
  app.querySelectorAll('[data-st]').forEach(function (el) { el.onclick = function () { filt.st = el.dataset.st; render(); }; });
  app.querySelectorAll('[data-bucket]').forEach(function (el) { el.onclick = function () { bucket = el.dataset.bucket; render(); }; });
  app.querySelectorAll('[data-atab]').forEach(function (el) { el.onclick = function () { atab = el.dataset.atab; render(); }; });
  app.querySelectorAll('[data-ent]').forEach(function (el) { el.onclick = function () { filt = { q: '', ent: el.dataset.ent, cc: '', st: 'all' }; cur = ''; location.hash = 'people'; }; });
  function decide(id, ok) {
    if (id.charAt(0) === 'S') { var s = byRef(id.slice(1)); s.self = false; logAct((ok ? 'اعتمد' : 'رفض') + ' تعديلًا حساسًا لـ', STAFF.indexOf(s)); }
    else { var r = REQS.filter(function (x) { return x.id === id; })[0]; r.stage = ok ? 3 : -1; logAct((ok ? 'اعتمد ' : 'رفض ') + (r.type === 'leave' ? 'إجازة' : 'أمر إركاب') + ' ' + r.id + ' لـ', STAFF.indexOf(r.s)); }
    render(); toast(ok ? 'اعتُمد الطلب وأُبلغ المنسوب بالبريد' : 'رُفض الطلب وأُبلغ المنسوب بالسبب');
  }
  app.querySelectorAll('[data-appr]').forEach(function (el) { el.onclick = function () { decide(el.dataset.appr, true); }; });
  app.querySelectorAll('[data-rej]').forEach(function (el) { el.onclick = function () { decide(el.dataset.rej, false); }; });
  var fq = $('#fq'); if (fq) fq.oninput = function () { filt.q = fq.value; var p = fq.selectionStart; render(); var f2 = $('#fq'); f2.focus(); f2.setSelectionRange(p, p); };
  var fe = $('#fent'); if (fe) fe.onchange = function () { filt.ent = fe.value; render(); };
  var fc = $('#fcc'); if (fc) fc.onchange = function () { filt.cc = fc.value; render(); };
  var fw = $('#fwho'); if (fw) fw.onchange = function () { $('#tlbox').innerHTML = tlHTML(20, fw.value); $('#tlbox').querySelectorAll('[data-open]').forEach(function (el) { el.onclick = function () { openRec(el.dataset.open); }; }); };
  $('#theme').onclick = function () { var r = document.documentElement, c = r.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); r.setAttribute('data-theme', c === 'dark' ? 'light' : 'dark'); };
  $('#logout').onclick = logout;
  var bell = $('#bell'), ntf = $('#ntf'); bell.onclick = function (e) { e.stopPropagation(); ntf.hidden = !ntf.hidden; bell.setAttribute('aria-expanded', !ntf.hidden); };
  document.onclick = function (e) { if (ntf && !ntf.hidden && !e.target.closest('.bellwrap')) { ntf.hidden = true; bell.setAttribute('aria-expanded', 'false'); } };
  $('#menuBtn').onclick = function () { document.body.classList.add('nav-open'); var sc = document.createElement('div'); sc.className = 'scrim'; sc.onclick = closePops; document.body.appendChild(sc); };
  var gq = $('#gq'), hits = $('#hits');
  if (gq) { gq.oninput = function () { var q = gq.value.trim().toLowerCase(); if (!q) { hits.hidden = true; return; }
      var r = STAFF.filter(function (s) { return (s.name + ' ' + s.ref + ' ' + s.phone + ' ' + s.job).toLowerCase().indexOf(q) >= 0; }).slice(0, 7);
      hits.innerHTML = r.length ? r.map(function (s) { return '<button data-hit="' + s.ref + '">' + av(s) + '<span><b>' + esc(s.name) + '</b><span class="ref">' + s.ref + '</span></span></button>'; }).join('') : '<div class="empty" style="padding:18px">لا أحد باسم أو رقم «' + esc(gq.value) + '»</div>';
      hits.hidden = false; hits.querySelectorAll('[data-hit]').forEach(function (b) { b.onmousedown = function (e) { e.preventDefault(); openRec(b.dataset.hit); }; }); };
    gq.onblur = function () { setTimeout(function () { hits.hidden = true; }, 120); }; }
  var tip = null;
  app.querySelectorAll('[data-tip]').forEach(function (el) {
    el.onmouseenter = function () { tip = document.createElement('div'); tip.className = 'tip'; tip.innerHTML = esc(el.dataset.tip).replace(/\n/g, '<br>'); document.body.appendChild(tip); var b = el.getBoundingClientRect(); tip.style.top = (b.top - tip.offsetHeight - 8) + 'px'; tip.style.left = Math.max(8, Math.min(innerWidth - tip.offsetWidth - 8, b.left + b.width / 2 - tip.offsetWidth / 2)) + 'px'; };
    el.onmouseleave = function () { if (tip) tip.remove(); tip = null; };
  });
}
document.addEventListener('keydown', function (e) {
  if (e.key === '/' && screen === 'app' && !/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) { var g = document.getElementById('gq'); if (g) { e.preventDefault(); g.focus(); } }
  if (e.key === 'Escape') { closePops(); var ml = document.getElementById('msgLayer'); if (ml) { ml.remove(); CMP = null; } }
});
/* ======================================================================
   Live layer: real accounts, real data and real actions (hr.bonyanglobal.com/api/)
   ====================================================================== */
var CFG = window.APP_CONFIG || {}, API = 'api/';
var SESSION = null, CAP = {}, MAILED = {}, ME_DATA = null, CACHE = {};
var ROLEJ = { admin: 'amethyst', hr: 'emerald', ceo: 'sapphire', viewer: 'slate' };
var ERR = {
  bad_email: 'اكتب بريدًا إلكترونيًا صحيحًا.', bad_code: 'الرمز غير صحيح، تأكد منه وحاول مرة أخرى.', code_expired: 'انتهت صلاحية الرمز، اطلب رمزًا جديدًا.',
  locked: 'أُوقفت المحاولات مؤقتًا لكثرة الأخطاء، حاول بعد ١٥ دقيقة.', too_many_codes: 'طلبت رموزًا كثيرة، حاول بعد ساعة.', forbidden: 'لا تملك صلاحية هذا الإجراء.',
  email_exists: 'هذا البريد مسجّل لحساب آخر.', cannot_lock_self: 'لا يمكنك إيقاف حسابك أو سحب صلاحية إدارة الحسابات منه.', too_many: 'تجاوزت الحد اليومي للرسائل.',
  bad_role: 'الدور غير صحيح.', server_error: 'حدث خطأ في الخادم وسُجّل لمدير النظام. حاول مرة أخرى.', auth_required: 'انتهت الجلسة، سجّل الدخول من جديد.', not_found: 'غير موجود.'
};
function errText(e) { var m = (e && e.message) || ''; return ERR[m] || (/Failed to fetch|NetworkError|Load failed|HTTP/.test(m) || !m ? 'تعذّر الاتصال بالخادم، تحقّق من الإنترنت وحاول مرة أخرى.' : m); }
function api(body) {
  return fetch(API, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body), credentials: 'same-origin' })
    .then(function (r) { return r.json().catch(function () { throw new Error('HTTP ' + r.status); }); })
    .then(function (j) {
      if (!j || !j.ok) { var e = new Error((j && j.error) || 'error'); if (e.message === 'auth_required' && SESSION && body.action !== 'authMe') sessionEnded(); throw e; }
      return j;
    });
}
/* بيانات تُجلب عند الحاجة وتُحفظ مؤقتًا؛ تُعاد رسم الصفحة عند وصولها */
function need(k, fn, maxAge) {
  var c = CACHE[k];
  if (c && (c.loading || Date.now() - c.at < (maxAge || 120000))) return c;
  CACHE[k] = c = { loading: true, at: 0, data: c ? c.data : null, err: '' };
  fn().then(function (d) { c.data = d; c.err = ''; }).catch(function (e) { c.err = errText(e); })
    .then(function () { c.loading = false; c.at = Date.now(); if (screen === 'app' && CACHE[k] === c) softRender(); });
  return c;
}
function seed(k, d) { CACHE[k] = { loading: false, at: Date.now(), data: d, err: '' }; }
function softRender() { var y = window.scrollY, a = document.activeElement, id = a && a.id, pos = a && a.selectionStart; render(); window.scrollTo(0, y); if (id) { var f = document.getElementById(id); if (f && f.focus) { f.focus(); try { if (pos != null) f.setSelectionRange(pos, pos); } catch (e) { } } } }
function capsFrom(p) {
  var h = function (x) { return p.indexOf(x) > -1; };
  return { view: h('staff.view'), edit: h('staff.edit'), files: h('staff.files'), pay: h('finance.view'), mail: h('staff.mail'), export: h('staff.view'), audit: h('audit.view'),
    users: h('users.manage'), drive: h('backup.run'), sys: h('audit.view') || h('users.manage') || h('backup.run'), approve: false, leave: false, payedit: false };
}
function can(p) { return role !== 'staff' && !!CAP[p]; }
function firstOf(name) { var w = String(name || '').trim().split(/\s+/); return /^(د|أ|م|ا|م\.|د\.|أ\.)\.?$/.test(w[0]) && w[1] ? w[0] + ' ' + w[1] : w[0] || ''; }

/* ---------- mapping server rows to the console model ---------- */
var ENT_KEY = { bonyan: 'bonyan', 'bonyan-university': 'uni', 'bonyan-humanitarian': 'hum', 'bonyan-waqf': 'waqf', afaq: 'afaq', 'bonyan-academy': 'acad', almaarif: 'maarif', 'kafaa-tech': 'kafaa', 'dar-altamkeen': 'tamkeen', 'tamkeen-education': 'tedu' };
function nk(s) { return String(s || '').trim().toLowerCase().replace(/\s+/g, ' '); }
var ENT_IDX = {}; (CFG.ENTITIES || []).forEach(function (e) { [e.v, e.ar, e.en, e.id].forEach(function (x) { if (x) ENT_IDX[nk(x)] = e; }); });
var ENT_MAP = {}, CT_MAP = {}, CNAME = {}, CDIAL = {};
(window.COUNTRIES || []).forEach(function (c) { CNAME[c[0]] = c[1]; CDIAL[c[0]] = String(c[4] || '').replace(/\D/g, ''); });
function entOf(name) {
  var cf = ENT_IDX[nk(name)], v = cf ? (ENT_KEY[cf.v] || cf.v) : (name ? 'x:' + nk(name) : 'none');
  if (ENT_MAP[v]) return ENT_MAP[v];
  var b = ENT0.filter(function (x) { return x.v === v; })[0];
  return (ENT_MAP[v] = { v: v, n: b ? b.n : cf ? cf.ar : (String(name || '').trim() || 'جهة غير محددة'), c: b ? b.c : cf && cf.colors ? cf.colors[0] : '#475569', full: cf ? cf.ar : String(name || '') });
}
function ctryOf(cc, name) { var k = cc || '—'; return CT_MAP[k] || (CT_MAP[k] = { cc: k, n: CNAME[cc] || String(name || '').trim() || 'غير محددة' }); }
var DOCS = [['جواز السفر', 'passportExpiry', 'passportNo', 'passportScan'], ['الهوية الوطنية', 'nationalIdExpiry', 'nationalIdNo', 'nationalIdScan'], ['الإقامة', 'permitExpiry', 'permitNo', 'permitScan'],
  ['تصريح العمل', 'workPermitExpiry', 'workPermitNo', 'workPermitScan'], ['العقد', 'contractEnd', 'contractNo', 'contractFile']];
function pdate(v) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(v || ''); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; }
function pdt(v) { var m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec(v || ''); return m ? new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]) : pdate(v); }
function daysTo(d) { var t = new Date(); t.setHours(0, 0, 0, 0); return Math.round((d - t) / DAY); }
function urls(v) { return Array.isArray(v) ? v.filter(function (u) { return typeof u === 'string' && u.charAt(0) !== '#'; }) : []; }
function hasF(v) { return Array.isArray(v) && v.length > 0; }
function toStaff(r) {
  var cc = String(r.workCountryCode || '').toUpperCase(), docs = [];
  DOCS.forEach(function (D) {
    var exp = pdate(r[D[1]]), no = String(r[D[2]] || '').trim(), f = hasF(r[D[3]]);
    if (!exp && !no && !f) return;
    docs.push({ t: D[0], exp: exp, no: no, file: f, urls: urls(r[D[3]]), days: exp ? daysTo(exp) : 99999 });
  });
  var name = String(r.fullNameAr || '').trim() || String(r.fullNameLatin || '').trim() || r.ref, bank = String(r.iban || r.accountNo || '').replace(/\s+/g, '');
  var miss = [];
  if (!hasF(r.photo)) miss.push('الصورة الشخصية');
  if (!bank && !/أخرى|other|lain|نقد|cash/i.test(r.payMethod || '')) miss.push('الحساب البنكي');
  docs.forEach(function (d) { if (!d.file && d.t !== 'العقد') miss.push('صورة ' + d.t); });
  if (!r.officialEmail && !r.personalEmail) miss.push('البريد الإلكتروني');
  if (!r.mobile && !r.whatsapp) miss.push('رقم الجوال');
  var cur = (/[A-Z]{3}/.exec(r.currency || '') || [])[0] || DEFCUR[cc] || 'SAR';
  var s = { ref: r.ref, r: r, name: name, latin: String(r.fullNameLatin || ''), ini: name.charAt(0), job: String(r.jobTitle || '').trim() || '—', ent: entOf(r.entity), c: ctryOf(cc, r.workCountry),
    reg: pdt(r.createdAt) || new Date(0), upd: pdt(r.updatedAt), hire: pdate(r.startDate), docs: docs, base: parseFloat(String(r.salary || '').replace(/[^\d.]/g, '')) || 0, allow: 0, cur: cur,
    miss: miss, mailed: !!MAILED[r.ref], self: false, phone: String(r.mobile || r.whatsapp || ''), wa: String(r.whatsapp || r.mobile || ''), mail: String(r.officialEmail || r.personalEmail || ''),
    iban: bank ? '•••• ' + bank.slice(-4) : '', nat: CNAME[String(r.nationality || '').toUpperCase()] || String(r.nationality || '').trim(), photo: urls(r.photo)[0] || '', lang: /^(ar|en|id)$/.test(r.lang || '') ? r.lang : '' };
  s.status = miss.length || r.status === 'بانتظار المرفقات' ? 'ناقص' : 'مكتمل';
  s.worst = docs.length ? Math.min.apply(null, docs.map(function (d) { return d.days; })) : 99999;
  return s;
}
function rebuildIndex() {
  var ec = {}, cc = {};
  STAFF.forEach(function (s) { ec[s.ent.v] = (ec[s.ent.v] || 0) + 1; cc[s.c.cc] = (cc[s.c.cc] || 0) + 1; });
  ENT = Object.keys(ec).map(function (v) { return ENT_MAP[v]; }).sort(function (a, b) { return ec[b.v] - ec[a.v]; });
  CTRY = Object.keys(cc).map(function (k) { return CT_MAP[k]; }).sort(function (a, b) { return cc[b.cc] - cc[a.cc]; });
  var CC = window.COUNTRY_CENTROIDS || {};
  if (MAP) Object.keys(cc).forEach(function (k) { if (!MAP.C[k] && CC[k]) MAP.C[k] = CC[k]; });
}
function sar(s) { return s.base * (FX[s.cur] || 0); }
function dl(days) { return days > 9000 ? 'بلا تاريخ انتهاء' : days < 0 ? 'منتهية منذ ' + dn(-days) : days === 0 ? 'تنتهي اليوم' : 'متبقٍ ' + dn(days); }
function dn(d) { return d === 1 ? 'يوم واحد' : d === 2 ? 'يومان' : d <= 10 ? d + ' أيام' : d + ' يومًا'; }
function nq(n, one, two, few, many) { return n === 1 ? one : n === 2 ? two : n >= 3 && n <= 10 ? n + ' ' + few : n + ' ' + many; }
function fdx(d, o) { return d ? fd(d, o) : '—'; }
function ago(min) {
  if (min < 1) return 'الآن';
  if (min < 60) return min === 1 ? 'قبل دقيقة' : min === 2 ? 'قبل دقيقتين' : 'قبل ' + min + (min <= 10 ? ' دقائق' : ' دقيقة');
  var h = Math.round(min / 60); if (h < 24) return h === 1 ? 'قبل ساعة' : h === 2 ? 'قبل ساعتين' : 'قبل ' + h + (h <= 10 ? ' ساعات' : ' ساعة');
  var d = Math.round(h / 24); if (d < 30) return d === 1 ? 'أمس' : d === 2 ? 'قبل يومين' : 'قبل ' + d + (d <= 10 ? ' أيام' : ' يومًا');
  return fd(new Date(Date.now() - min * 6e4));
}
function agoD(d) { return d ? ago(Math.max(0, Math.round((Date.now() - d) / 6e4))) : '—'; }
function pct(a, b) { return b ? Math.round(a / b * 100) : 0; }
function langOf(s) { return s.lang || (s.c.cc === 'ID' ? 'id' : /^(KE|PK|TZ|UG|NG|ET|IN|BD|GB|PH|GH)$/.test(s.c.cc) ? 'en' : 'ar'); }
function waDigits(s) { var d = String(s.wa || s.phone || '').replace(/[^\d+]/g, ''); if (d.charAt(0) === '+') return d.slice(1); if (d.slice(0, 2) === '00') return d.slice(2); if (d.charAt(0) === '0' && CDIAL[s.c.cc]) return CDIAL[s.c.cc] + d.slice(1); return d; }
function avP(s, extra) { if (!s.photo) return av(s, extra); var ring = s.worst < 0 ? 'var(--c-bad)' : s.status === 'ناقص' ? 'var(--c-warn)' : 'transparent'; return '<span class="av r ph"' + (extra || '') + ' style="--st:' + ring + '"><img src="' + esc(s.photo) + '" alt="" loading="lazy"></span>'; }
function regURL() { return location.origin + location.pathname.replace(/[^/]*$/, '') + 'register.html'; }
function siteURL() { return location.origin + location.pathname.replace(/[^/]*$/, ''); }

/* ---------- loading ---------- */
function loadAll() {
  return Promise.all([
    api({ action: 'list' }),
    can('audit') ? api({ action: 'audit', limit: 400 }).catch(function () { return null; }) : null,
    can('users') ? api({ action: 'health' }).catch(function () { return null; }) : null,
    api({ action: 'reqList' }).catch(function () { return null; })
  ]).then(function (R) {
    if (R[3]) seed('reqs', R[3].rows);
    var j = R[0]; MAILED = j.mailed || {}; ENT_MAP = {}; CT_MAP = {};
    STAFF = (j.rows || []).map(toStaff).sort(function (a, b) { return b.reg - a.reg; });
    rebuildIndex();
    if (R[1]) seed('audit', R[1]); if (R[2]) seed('health', R[2]);
    seed('list', true);
  });
}
function reloadList() { return api({ action: 'list' }).then(function (j) { MAILED = j.mailed || {}; STAFF = (j.rows || []).map(toStaff).sort(function (a, b) { return b.reg - a.reg; }); rebuildIndex(); }); }
function loadMe() {
  api({ action: 'reqList' }).then(function (j) { seed('reqs', j.rows); if (screen === 'app') softRender(); }).catch(function () { });
  return api({ action: 'me' }).then(function (j) {
    ME_DATA = j;
    if (!j.record) { ME = null; return; }
    ME = toStaff(j.record); ME.card = j.card || ''; ME.kids = j.kids || {};
    STAFF = [ME]; rebuildIndex();
  });
}

/* ---------- boot, login, logout ---------- */
function boot() {
  screen = 'loading'; render();
  api({ action: 'authMe' }).then(function (j) {
    if (!j.user) return devHello().then(function () { screen = 'login'; render(); });
    return enterApp(j.user);
  }).catch(function (e) { screen = 'login'; LG.err = /auth_required/.test(e.message) ? '' : errText(e); render(); });
}
function enterApp(u) {
  SESSION = u; role = u.role === 'staff' ? 'staff' : u.role; CAP = capsFrom(u.perms || []);
  var nm = u.name || u.email;
  USERS[role] = { name: nm, first: firstOf(nm), role: u.title || u.roleName || '', ini: nm.charAt(0), mail: u.email, j: ROLEJ[u.role] || 'slate' };
  screen = 'loading'; render();
  return (role === 'staff' ? loadMe() : loadAll()).then(function () {
    if (role === 'staff' && !ME) { screen = 'noreg'; render(); return; }
    screen = 'app'; openG = null;
    /* روابط الملف القديمة (admin.html?ref=…) تصل هنا: تفتح ملف المنسوب في المنصة */
    var qref = (location.search.match(/[?&]ref=([^&#]+)/) || [])[1];
    if (qref) { qref = decodeURIComponent(qref); try { history.replaceState(null, '', location.pathname + '#people'); } catch (e) { } if (role !== 'staff' && byRef(qref)) { cur = qref; ptab = 'over'; TAB.people = 'dir'; filt = { q: '', ent: '', cc: '', st: 'all' }; } }
    route();
    setTimeout(pkOffer, 900);
  }).catch(function (e) { if (SESSION) { screen = 'login'; LG.err = errText(e); render(); } });
}
function resetState() { SESSION = null; ME = null; ME_DATA = null; STAFF = []; ENT = []; CTRY = []; CACHE = {}; CAP = {}; role = 'hr'; cur = ''; ptab = 'over'; filt = { q: '', ent: '', cc: '', st: 'all' }; }
function logout() {
  api({ action: 'authLogout' }).catch(function () { }).then(function () {
    resetState(); LG = lgNew();
    try { history.replaceState(null, '', location.pathname); } catch (e) { }
    return devHello();
  }).then(function () { screen = 'login'; render(); window.scrollTo(0, 0);
  });
}
function sessionEnded() { resetState(); var m = LG.mail || ''; LG = lgNew(); LG.mail = m; LG.err = 'انتهت الجلسة، سجّل الدخول من جديد.'; var l = document.getElementById('msgLayer'); if (l) l.remove(); devHello().then(function () { screen = 'login'; render(); }); }
function route() {
  if (!SESSION || screen === 'login' || screen === 'loading' || screen === 'noreg') { render(); return; }
  var h = location.hash.slice(1), a = ALIAS[h]; screen = 'app';
  if (a) { h = a[0]; if (a[1]) TAB[h] = a[1]; if (h === 'payroll') { PAYF = a[2] || 'all'; PAYE = ''; } if (h === 'people' && a[1] === 'dir') { filt = { q: '', ent: '', cc: '', st: a[2] || 'all' }; } try { history.replaceState(null, '', '#' + h); } catch (e) { } }
  view = allowed(h) ? h : home(); window.scrollTo(0, 0); render();
}
function render() {
  stopMap(); closePops();
  if (screen === 'loading') { app.innerHTML = '<div class="bootscr" role="status"><span class="lt"><img src="' + LOGO + '" alt=""></span><b>منصة بنيان للموارد البشرية</b><i class="spin" aria-hidden="true"></i><span class="sr">جارٍ التحميل</span></div>'; return; }
  if (screen === 'login') { app.innerHTML = loginHTML(); bindLogin(); startMap(document.getElementById('lmap'), true); return; }
  if (screen === 'noreg') { app.innerHTML = noregHTML(); bindNoreg(); startMap(document.getElementById('lmap'), true); return; }
  if (openG === null) openG = grpOf(view);
  var body;
  try { body = VIEWS[view](); } catch (e) { if (window.console) console.error(e); body = '<section class="pn"><div class="empty">تعذّر عرض هذه الصفحة. حدّث الصفحة وحاول مرة أخرى.</div></section>'; }
  app.innerHTML = '<div class="shell"><aside class="side" id="side">' + sideHTML() + '</aside><div class="main">' + topHTML() + '<main class="page" id="page">' + body + footHTML() + '</main></div></div>' + bnavHTML();
  bind(); bindLive(); bindReq();
  if (view === 'home') { startMap(document.getElementById('map'), false); tickClocks(); }
}

var LG = { step: 'email', mail: '', to: '', err: '', busy: false, tab: 'in', remember: true };
function loginHTML() {
  var f, steps = '<div class="steps s3">' + ['البريد', 'الرمز', 'الدخول'].map(function (l, i) { return '<div class="' + (i <= (LG.step === 'code' ? 1 : 0) ? 'on' : '') + '"><i></i>' + l + '</div>'; }).join('') + '</div>';
  var tabs = '<div class="ltabs" role="group" aria-label="نوع الدخول">' + [['in', 'تسجيل الدخول'], ['new', 'سجّل بياناتك'], ['track', 'متابعة طلب']].map(function (t) { return '<button type="button" data-lt="' + t[0] + '" aria-pressed="' + (LG.tab === t[0]) + '">' + t[1] + '</button>'; }).join('') + '</div>';
  if (LG.tab === 'track') f = trackHTML();
  else if (LG.tab === 'new') f = '<h2>سجّل بياناتك في سجل المنسوبين</h2><p class="lp">إن لم تسجّل بياناتك من قبل، عبّئ النموذج مرة واحدة وارفع وثائقك. بعدها تدخل من هنا ببريدك لترى ملفك وبطاقتك وتحدّث بياناتك متى شئت.</p>' +
    '<ul class="lneed">' + [['pass', 'صورة الجواز أو الهوية والإقامة'], ['user', 'صورة شخصية واضحة'], ['bank', 'بيانات الحساب البنكي'], ['clock', 'حوالي ١٠ دقائق، بالعربية أو الإنجليزية أو الإندونيسية']].map(function (x) { return '<li>' + ic(x[0]) + '<span>' + x[1] + '</span></li>'; }).join('') + '</ul>' +
    '<a class="btn goldb" href="register.html">' + ic('edit') + 'ابدأ التسجيل الآن</a><button type="button" class="lnk" data-lt="in">سجّلت من قبل؟ ادخل ببريدك</button>';
  else if (LG.step === 'email' && DEV && !LG.other) f = quickHTML();
  else if (LG.step === 'email') f = steps + '<h2>أهلًا بك</h2><p class="lp">ادخل ببريدك المسجّل لدينا، وسيصلك رمز دخول من ٦ أرقام. الإدارة والمنسوبون يدخلون من هنا.</p>' +
    '<div class="lf"><label for="lmail">البريد الإلكتروني</label><input id="lmail" class="ltr" style="text-align:left" type="email" autocomplete="username" inputmode="email" spellcheck="false" value="' + esc(LG.mail) + '" placeholder="name@example.com"></div>' +
    '<div class="lerr" id="lerr" role="alert">' + esc(LG.err) + '</div><button class="btn prim" id="lnext" type="submit"' + (LG.busy ? ' disabled' : '') + '>' + ic('send') + (LG.busy ? 'جارٍ الإرسال…' : 'أرسل رمز الدخول') + '</button>' + pkAltHTML() + (DEV ? '<button type="button" class="lnk" id="qback">' + ic('back') + 'العودة إلى الدخول السريع</button>' : '') +
    '<a class="lreg" href="register.html">' + tile('gold', 'plus') + '<span><b>لم تسجّل بياناتك بعد؟</b><small>عبّئ نموذج المنسوبين أولًا، ثم ادخل من هنا</small></span>' + ic('back') + '</a>';
  else f = steps + '<h2>أدخل رمز الدخول</h2><p class="lp">إن كان بريدك مسجّلًا لدينا فقد أرسلنا رمزًا من ٦ أرقام إلى <span class="ltr">' + esc(LG.to || LG.mail) + '</span>، صالحًا ١٠ دقائق ولمرة واحدة.</p>' +
    '<div class="otp" id="otp">' + [0, 1, 2, 3, 4, 5].map(function (i) { return '<input inputmode="numeric" autocomplete="' + (i ? 'off' : 'one-time-code') + '" maxlength="6" aria-label="الرقم ' + (i + 1) + '">'; }).join('') + '</div>' +
    '<label class="lrem"><input type="checkbox" id="lrem"' + (LG.remember ? ' checked' : '') + '><span><b>تذكّر هذا الجهاز ٣٠ يومًا</b><small>تدخل بعدها بضغطة واحدة دون رمز. لا تفعّله على جهاز مشترك.</small></span></label>' +
    '<div class="lerr" id="lerr" role="alert">' + esc(LG.err) + '</div><button class="btn prim" id="lnext" type="submit"' + (LG.busy ? ' disabled' : '') + '>' + ic('lock') + (LG.busy ? 'جارٍ التحقق…' : 'دخول') + '</button>' +
    '<div class="lrow2"><button type="button" class="lnk" id="lback">تغيير البريد</button><button type="button" class="lnk" id="lresend">إعادة إرسال الرمز</button></div>' +
    '<div class="note lnote">' + ic('info') + '<span>لم يصلك الرمز خلال دقيقتين؟ افحص مجلد الرسائل غير المرغوبة. وإن لم تسجّل بياناتك من قبل <a href="register.html">فسجّلها أولًا من هنا</a>.</span></div>';
  return '<section class="login"><canvas id="lmap" aria-hidden="true"></canvas><div class="lwrap"><form class="lcard" id="lf" novalidate style="margin-top:46px"><div class="lhead"><span class="lt"><img src="' + LOGO + '" alt="بنيان"></span><h1>منصة بنيان للموارد البشرية</h1><p>مجموعة بنيان العالمية</p></div>' + tabs + f + '</form>' +
    '<div class="lfeat"><div>' + tile('emerald', 'finger') + 'دخول بالبصمة أو الوجه</div><div>' + tile('sapphire', 'bolt') + 'دخول سريع من جهازك المحفوظ</div><div>' + tile('garnet', 'lock') + 'قفل بعد المحاولات الخاطئة</div></div><div class="lsig">' + sigHTML() + '</div></div></section>';
}
function bindLogin() {
  var $ = function (i) { return document.getElementById(i); };
  document.querySelectorAll('[data-lt]').forEach(function (b) { b.onclick = function () { LG.tab = b.dataset.lt; LG.err = ''; render(); }; });
  if (LG.tab === 'track') { bindTrack(); return; }
  bindQuick();
  if ($('qback')) $('qback').onclick = function () { LG.other = false; LG.err = ''; render(); };
  if (!$('lnext')) { if ($('qpk') && !LG.busyPk && !LG.busyDev) $('qpk').focus(); else if ($('qdev') && !LG.busyDev) $('qdev').focus(); return; }
  var otp = $('otp'), ins = otp ? otp.querySelectorAll('input') : [];
  function code() { var c = ''; ins.forEach(function (x) { c += x.value; }); return c; }
  function fill(t) { ins.forEach(function (x, i) { x.value = t[i] || ''; }); (ins[Math.min(t.length, 5)] || ins[5]).focus(); }
  ins.forEach(function (x, i) {
    x.oninput = function () { var v = x.value.replace(/\D/g, ''); if (v.length > 1) { fill(v.slice(0, 6)); if (v.length >= 6) $('lnext').click(); return; } x.value = v; if (v && ins[i + 1]) ins[i + 1].focus(); if (code().length === 6) $('lnext').click(); };
    x.onkeydown = function (e) { if (e.key === 'Backspace' && !x.value && ins[i - 1]) ins[i - 1].focus(); };
  });
  if (otp) { otp.addEventListener('paste', function (e) { var t = ((e.clipboardData && e.clipboardData.getData('text')) || '').replace(/\D/g, '').slice(0, 6); if (t) { e.preventDefault(); fill(t); if (t.length === 6) $('lnext').click(); } }); if (!LG.busy) ins[0].focus(); }
  else if ($('lmail') && !LG.busy) $('lmail').focus();
  if ($('lback')) $('lback').onclick = function () { LG.step = 'email'; LG.err = ''; render(); };
  if ($('lresend')) $('lresend').onclick = function () { send(true); };
  function send(again) {
    var m = again ? LG.mail : $('lmail').value.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(m)) { LG.err = ERR.bad_email; LG.mail = m; render(); return; }
    LG.mail = m; LG.busy = true; LG.err = ''; render();
    api({ action: 'authStart', email: m }).then(function (j) { LG.busy = false; LG.step = 'code'; LG.to = j.to || m; render(); if (again) toast('أُرسل رمز جديد'); })
      .catch(function (e) { LG.busy = false; LG.err = errText(e); render(); });
  }
  $('lf').onsubmit = function (e) {
    e.preventDefault(); if (LG.busy) return;
    if (LG.step === 'email') { send(false); return; }
    var c = code(); if (c.length !== 6) { LG.err = 'اكتب الرمز كاملًا (٦ أرقام).'; $('lerr').textContent = LG.err; return; }
    LG.busy = true; LG.err = ''; render();
    api({ action: 'authVerify', email: LG.mail, code: c, remember: !!LG.remember }).then(function () { JUST_IN = true; return api({ action: 'authMe' }); }).then(function (j) {
      LG = lgNew();
      if (!j.user) throw new Error('auth_required');
      return enterApp(j.user);
    }).catch(function (e) { LG.busy = false; LG.err = errText(e); render(); });
  };
}
function noregHTML() {
  return '<section class="login"><canvas id="lmap" aria-hidden="true"></canvas><div class="lwrap"><div class="lcard" style="margin-top:46px"><div class="lhead"><span class="lt"><img src="' + LOGO + '" alt="بنيان"></span><h1>منصة بنيان للموارد البشرية</h1><p>مجموعة بنيان العالمية</p></div>' +
    '<h2>لم نجد سجلّك بعد</h2><p class="lp">دخلت ببريد <span class="ltr">' + esc(SESSION ? SESSION.email : '') + '</span>، لكن لا يوجد سجل منسوب بهذا البريد. سجّل بياناتك مرة واحدة، وبعدها تجد هنا ملفك وبطاقتك ووثائقك.</p>' +
    '<a class="btn goldb" href="register.html">' + ic('edit') + 'سجّل بياناتك الآن</a><button type="button" class="lnk" id="nrOut">الخروج والدخول ببريد آخر</button></div><div class="lsig">' + sigHTML() + '</div></div></section>';
}
function bindNoreg() { var b = document.getElementById('nrOut'); if (b) b.onclick = logout; }
function meUser() { return role === 'staff' && ME ? { name: ME.name, role: ME.job + '، ' + ME.ent.n, ini: ME.ini } : USERS[role] || { name: '', role: '', ini: '' }; }

/* ---------- top bar & notifications ---------- */
function ntfItems() {
  var out = [];
  if (role === 'staff') {
    if (!ME) return out;
    ME.docs.filter(function (d) { return d.days <= 60; }).forEach(function (d) { out.push([d.days < 0 ? 'garnet' : 'gold', 'pass', d.t + ': ' + dl(d.days), d.exp ? 'تاريخ الانتهاء ' + fd(d.exp) + '. حدّث الوثيقة من «تحديث بياناتي».' : '', '', 'myfile']); });
    reqRows().filter(function (r) { return r.status !== 'pending' && r.status !== 'cancelled' && Date.now() - pdt(r.updatedAt) < 14 * DAY; }).slice(0, 3).forEach(function (r) { out.push([r.status === 'approved' ? 'emerald' : 'garnet', r.status === 'approved' ? 'check' : 'alert', (r.status === 'approved' ? 'اعتُمد طلبك ' : 'لم يُعتمد طلبك ') + r.no, reqSum(r), '', 'myreq']); });
    if (ME.miss.length) out.push(['amethyst', 'alert', 'ينقص ملفك: ' + ME.miss.slice(0, 2).join('، ') + (ME.miss.length > 2 ? ' وغيرها' : ''), 'أكملها من «تحديث بياناتي»', '', 'myfile']);
    return out;
  }
  reqPendingForMe().slice(0, 4).forEach(function (r) { out.push([RT2[r.type][0], RT2[r.type][1], r.typeName + ': ' + r.name, 'بانتظار قرارك · ' + r.no, '', 'reqs-pend']); });
  var docs = []; STAFF.forEach(function (s) { s.docs.forEach(function (d) { if (d.days <= 30) docs.push({ s: s, d: d }); }); });
  docs.sort(function (a, b) { return a.d.days - b.d.days; }).slice(0, 5).forEach(function (x) { out.push([x.d.days < 0 ? 'garnet' : 'gold', 'pass', x.d.t + ': ' + x.s.name, dl(x.d.days), x.s.ref]); });
  STAFF.filter(function (s) { return Date.now() - s.reg < 3 * DAY; }).slice(0, 3).forEach(function (s) { out.push(['emerald', 'userok', 'سجّل ' + s.name, s.ent.n + ' · ' + agoD(s.reg), s.ref]); });
  return out;
}
function ntfHTML(items) {
  items = items || ntfItems();
  return '<div class="dh"><span>التنبيهات</span><span>' + (items.length ? nq(items.length, 'تنبيه واحد', 'تنبيهان', 'تنبيهات', 'تنبيهًا') : 'لا جديد') + '</span></div>' +
    (items.length ? items.map(function (x) { return '<button class="ntf"' + (x[4] ? ' data-open="' + esc(x[4]) + '"' : ' data-go="' + (x[5] || 'home') + '"') + '>' + tile(x[0], x[1]) + '<div><b>' + esc(x[2]) + '</b><span>' + esc(x[3]) + '</span></div></button>'; }).join('')
      : '<div class="empty" style="padding:22px 16px">لا توجد تنبيهات الآن. الوثائق سارية ولا تسجيلات جديدة.</div>');
}
function topHTML() {
  var u = meUser(), t = [TITLES[view][0], TABL[view] && Object.keys(TABL[view]).length > 1 ? TABL[view][TAB[view]] : ''], N = ntfItems();
  var avt = role === 'staff' && ME ? (ME.photo ? '<span class="av ph"><img src="' + esc(ME.photo) + '" alt=""></span>' : '<span class="av" style="background:linear-gradient(140deg,' + ME.ent.c + 'cc,' + ME.ent.c + ');color:#fff">' + esc(u.ini) + '</span>') : '<span class="av">' + esc(u.ini) + '</span>';
  return '<header class="top"><button class="ib menu" id="menuBtn" aria-label="القائمة">' + ic('menu') + '</button><div class="crumb">' + (t[1] ? '<span class="parent">' + t[0] + '</span>' + ic('back') + '<b>' + t[1] + '</b>' : '<b>' + t[0] + '</b>') + '</div><span class="sp"></span>' +
    (role === 'staff' ? '' : '<div class="find">' + ic('search') + '<input id="gq" placeholder="ابحث بالاسم أو الرقم المرجعي أو الجوال" autocomplete="off" aria-label="بحث في المنسوبين"><kbd>/</kbd><div class="drop" id="hits" hidden></div></div>') +
    (role === 'staff' ? '<a class="btn goldb topcta" href="update.html?me=1">' + ic('edit') + '<span>تحديث بياناتي</span></a>' : '') +
    '<button class="ib" id="theme" aria-label="تبديل الوضع الليلي">' + ic('moon') + '</button>' +
    '<div class="bellwrap"><button class="ib" id="bell" aria-label="التنبيهات" aria-expanded="false">' + ic('bell') + (N.length ? '<span class="n">' + N.length + '</span>' : '') + '</button><div class="drop" id="ntf" hidden>' + ntfHTML(N) + '</div></div>' +
    '<div class="me"><button type="button" class="mebtn" id="secBtn" title="الدخول والأمان: البصمة والأجهزة المحفوظة" aria-label="الدخول والأمان">' + avt + '<div><b>' + esc(u.name) + '</b><small>' + esc(u.role) + '</small></div></button><button class="ib out" id="logout" aria-label="تسجيل الخروج" title="تسجيل الخروج">' + ic('out') + '</button></div></header>';
}

/* ---------- clocks (real time zones) ---------- */
var TZ = { SA: ['جدة', 'Asia/Riyadh', 'المقر الرئيسي'], ID: ['جاكرتا', 'Asia/Jakarta'], EG: ['القاهرة', 'Africa/Cairo'], KE: ['نيروبي', 'Africa/Nairobi'], PK: ['كراتشي', 'Asia/Karachi'], YE: ['صنعاء', 'Asia/Aden'],
  SD: ['الخرطوم', 'Africa/Khartoum'], ET: ['أديس أبابا', 'Africa/Addis_Ababa'], TR: ['إسطنبول', 'Europe/Istanbul'], MY: ['كوالالمبور', 'Asia/Kuala_Lumpur'], NG: ['أبوجا', 'Africa/Lagos'], TZ: ['دار السلام', 'Africa/Dar_es_Salaam'],
  UG: ['كمبالا', 'Africa/Kampala'], SO: ['مقديشو', 'Africa/Mogadishu'], IN: ['نيودلهي', 'Asia/Kolkata'], BD: ['دكا', 'Asia/Dhaka'], JO: ['عمّان', 'Asia/Amman'], AE: ['دبي', 'Asia/Dubai'], QA: ['الدوحة', 'Asia/Qatar'],
  KW: ['الكويت', 'Asia/Kuwait'], BH: ['المنامة', 'Asia/Bahrain'], OM: ['مسقط', 'Asia/Muscat'], MA: ['الرباط', 'Africa/Casablanca'], TN: ['تونس', 'Africa/Tunis'], DZ: ['الجزائر', 'Africa/Algiers'], SY: ['دمشق', 'Asia/Damascus'],
  IQ: ['بغداد', 'Asia/Baghdad'], LB: ['بيروت', 'Asia/Beirut'], PS: ['القدس', 'Asia/Hebron'], GB: ['لندن', 'Europe/London'], CN: ['بكين', 'Asia/Shanghai'], PH: ['مانيلا', 'Asia/Manila'], TH: ['بانكوك', 'Asia/Bangkok'],
  AF: ['كابل', 'Asia/Kabul'], ZA: ['جوهانسبرغ', 'Africa/Johannesburg'], GH: ['أكرا', 'Africa/Accra'], SN: ['داكار', 'Africa/Dakar'], TD: ['إنجامينا', 'Africa/Ndjamena'], DJ: ['جيبوتي', 'Africa/Djibouti'], LY: ['طرابلس', 'Africa/Tripoli'], MR: ['نواكشوط', 'Africa/Nouakchott'] };
function clocksHTML() {
  var ks = ['SA'].concat(CTRY.map(function (c) { return c.cc; }).filter(function (k) { return k !== 'SA' && TZ[k]; })).concat(['ID', 'EG', 'KE']).filter(function (k, i, a) { return a.indexOf(k) === i; }).slice(0, 4);
  return '<div class="clocks">' + ks.map(function (k) { var z = TZ[k];
    return '<div class="clk' + (k === 'SA' ? ' hq' : '') + '" data-tz="' + z[1] + '"><svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="rgba(255,255,255,.06)" stroke="rgba(227,196,133,.45)" stroke-width="1.5"/><line class="hh" x1="20" y1="20" x2="20" y2="11" stroke="#f6dfab" stroke-width="2.4" stroke-linecap="round"/><line class="mm" x1="20" y1="20" x2="20" y2="7" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/><circle cx="20" cy="20" r="2" fill="#e3c485"/></svg><div><b class="tm">--:--</b><span>' + z[0] + '، ' + (z[2] || CNAME[k] || k) + '</span></div></div>'; }).join('') + '</div>';
}
function tickClocks() {
  function upd() {
    var now = new Date();
    document.querySelectorAll('.clk').forEach(function (el) {
      var p = {};
      try { new Intl.DateTimeFormat('en-GB', { timeZone: el.dataset.tz, hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(now).forEach(function (x) { p[x.type] = x.value; }); } catch (e) { return; }
      var h = (+p.hour) % 24, m = +p.minute;
      el.querySelector('.tm').textContent = (h % 12 || 12) + ':' + String(m).padStart(2, '0') + (h < 12 ? ' ص' : ' م');
      el.querySelector('.hh').setAttribute('transform', 'rotate(' + ((h % 12) * 30 + m * .5) + ' 20 20)'); el.querySelector('.mm').setAttribute('transform', 'rotate(' + (m * 6) + ' 20 20)');
    });
  }
  upd(); clockT = setInterval(upd, 15000);
}

/* ---------- dashboard ---------- */
VIEWS.home = function () {
  var u = USERS[role] || meUser(), tot = STAFF.length;
  var rl = '<span class="rl"><i></i>' + esc(u.role) + '</span><h1>مرحبًا بك، ' + esc(u.first) + '</h1>';
  if (!tot) return '<section class="hero"><div class="hero-in"><div>' + rl + '<p class="sum">لا يوجد منسوبون في السجل بعد. شارك رابط التسجيل مع المنسوبين، وسيظهر كل من يسجّل هنا فورًا.</p><div class="chips"><button class="chip" data-act="regLink"><i style="background:#e3c485"></i>نسخ رابط التسجيل</button></div></div><div class="mapbox"><canvas id="map" aria-hidden="true"></canvas></div></div>' + clocksHTML() + '</section>';
  var done = CNT.done, gap = CNT.gap, exp = CNT.exp, soon = CNT.soon, paid = STAFF.filter(function (s) { return s.base > 0 && FX[s.cur]; });
  var pay = paid.reduce(function (a, s) { return a + sar(s); }, 0);
  var nC = CTRY.length, nE = ENT.length, wk = STAFF.filter(function (s) { return Date.now() - s.reg < 7 * DAY; }).length;
  var sum = 'يضم السجل <b>' + nq(tot, 'منسوبًا واحدًا', 'منسوبَين', 'منسوبين', 'منسوبًا') + '</b> في <b>' + nq(nC, 'دولة واحدة', 'دولتين', 'دول', 'دولة') + '</b> و<b>' + nq(nE, 'جهة واحدة', 'جهتين', 'جهات', 'جهة') + '</b>. ' +
    (exp ? 'لديك اليوم <b>' + nq(exp, 'منسوب واحد', 'منسوبان', 'منسوبين', 'منسوبًا') + ' بوثيقة منتهية</b>' : 'لا توجد وثائق منتهية') + (soon ? '، و<b>' + soon + '</b> تنتهي وثائقهم خلال ٣٠ يومًا' : '') + (gap ? '، و<b>' + nq(gap, 'ملف واحد ناقص', 'ملفان ناقصان', 'ملفات ناقصة', 'ملفًا ناقصًا') + '</b>.' : '.');
  var hero = '<section class="hero"><div class="hero-in"><div>' + rl + '<p class="sum">' + sum + '</p>' +
    '<div class="chips">' + [['people', 'all', 'المنسوبون', tot, '#e3c485'], ['people', 'done', 'مكتمل', done, '#5cdba0'], ['people', 'gap', 'ناقص', gap, '#ffc966'], ['documents', 'bad', 'وثائق منتهية', exp, '#ff8697'], ['documents', 'warn', 'تنتهي خلال ٣٠ يومًا', soon, '#b9a6ff']].map(function (c) {
      return '<a class="chip" href="#' + c[0] + '"' + (c[0] === 'people' ? ' data-f="' + c[1] + '"' : ' data-bk="' + c[1] + '"') + '><i style="background:' + c[4] + '"></i><b>' + c[3] + '</b>' + c[2] + '</a>'; }).join('') + '</div></div>' +
    '<div class="mapbox"><canvas id="map" role="img" aria-label="خريطة توزيع المنسوبين: ' + esc(CTRY.map(function (c) { return c.n + ' ' + STAFF.filter(function (s) { return s.c.cc === c.cc; }).length; }).join('، ')) + '"></canvas></div></div>' + clocksHTML() + '</section>';

  var weeks = []; for (var w = 11; w >= 0; w--) weeks.push(STAFF.filter(function (s) { var d = (Date.now() - s.reg) / DAY; return d >= w * 7 && d < w * 7 + 7; }).length);
  var kpis = '<div class="grid g4">' +
    kpi('sapphire', 'users', tot, '', 'إجمالي المنسوبين', wk ? '<span class="delta up">+' + wk + ' هذا الأسبوع</span>' : 'لا تسجيلات هذا الأسبوع', spark(weeks, '#3d8ee0')) +
    kpi('emerald', 'userok', pct(done, tot), '٪', 'ملفات مكتملة', done + ' من ' + tot, '', '<div class="bar"><i style="width:' + pct(done, tot) + '%;background:var(--j-emerald)"></i></div>') +
    kpi('garnet', 'pass', exp + soon, '', 'منسوبون بوثائق تحتاج تجديدًا', exp ? '<span class="delta dn">' + exp + ' منتهية</span>' + (soon ? ' و' + soon + ' قريبة' : '') : soon ? soon + ' تنتهي خلال ٣٠ يومًا' : 'كل الوثائق سارية', '') +
    (can('pay') ? kpi('gold', 'wallet', pay >= 10000 ? n(pay / 1000) : n(pay), pay >= 10000 ? 'ألف ر.س' : 'ر.س', 'الرواتب الشهرية بالمكافئ', paid.length + ' منسوبًا، بأسعار صرف تقريبية', '')
      : kpi('gold', 'building', nE, '', 'جهات تابعة', nq(nC, 'دولة عمل واحدة', 'دولتا عمل', 'دول عمل', 'دولة عمل'), '')) + '</div>';

  var months = []; for (var m = 5; m >= 0; m--) { var a = new Date(TODAY.getFullYear(), TODAY.getMonth() - m, 1), b = new Date(TODAY.getFullYear(), TODAY.getMonth() - m + 1, 1);
    var inM = STAFF.filter(function (s) { return s.reg >= a && s.reg < b; }); months.push({ d: a, a: inM.length, b: inM.filter(function (s) { return s.status === 'مكتمل'; }).length }); }
  var regChart = pn('sapphire', 'chart', 'حركة التسجيل خلال ٦ أشهر', 'كل منسوب يسجّل عبر النموذج يظهر هنا', '<div class="legend"><span><i style="background:#3d8ee0"></i>سجّلوا</span><span><i style="background:#22a874"></i>ملفاتهم مكتملة</span></div>', '<div class="pb">' + lineChart(months) + '</div>');
  var parts = [[done, 'var(--c-ok)', 'مكتمل'], [gap, 'var(--c-warn)', 'ناقص']];
  var stDonut = pn('amethyst', 'pie', 'حالة الملفات', '', '', '<div class="pb">' + donut(parts, tot, tot, 'منسوبًا') + '<div class="dleg">' + parts.concat([[exp, 'var(--c-bad)', 'منهم بوثيقة منتهية']]).map(function (p) { return '<div><i style="background:' + p[1] + '"></i><span>' + p[2] + '</span><b>' + p[0] + '</b><span class="p">' + pct(p[0], tot) + '٪</span></div>'; }).join('') + '</div></div>');

  var docsAll = []; STAFF.forEach(function (s) { s.docs.forEach(function (d) { docsAll.push(d); }); });
  var docOk = docsAll.length ? docsAll.filter(function (d) { return d.days > 30 && d.file; }).length / docsAll.length : 1;
  var quality = pn('emerald', 'gauge', 'جودة البيانات', '', more('التفاصيل', '#people'), '<div class="pb"><div class="gauges">' + gauge(tot ? done / tot : 0, '#22a874', 'اكتمال الملفات') + gauge(docOk, '#3d8ee0', 'سلامة الوثائق') + '</div><div class="mini">' +
    '<div><span>حسابات بنكية مسجلة</span><b>' + pct(tot - CNT.nobank, tot) + '٪</b></div><div><span>صور شخصية مرفوعة</span><b>' + pct(STAFF.filter(function (s) { return s.photo || s.miss.indexOf('الصورة الشخصية') < 0; }).length, tot) + '٪</b></div>' +
    '<div><span>وصلتهم رسالة التأكيد</span><b>' + pct(tot - CNT.mail, tot) + '٪</b></div></div></div>');
  var byC = CTRY.map(function (c) { var ss = STAFF.filter(function (s) { return s.c.cc === c.cc; }); return { c: c, n: ss.length, d: ss.filter(function (s) { return s.status === 'مكتمل'; }).length }; });
  var mx = byC.length ? byC[0].n : 1;
  var geo = pn('teal', 'globe', 'التوزيع الجغرافي', 'حسب دولة العمل', '', '<div class="pb bars">' + byC.map(function (x) { return '<div class="brow"><span class="cc">' + esc(x.c.cc) + '</span><div><div class="nm">' + esc(x.c.n) + '<span>' + x.d + ' مكتمل</span></div><div class="tr" style="width:' + (x.n / mx * 100) + '%"><i style="width:' + (x.d / x.n * 100) + '%;background:var(--j-teal)"></i><i style="flex:1;background:var(--c-warn);opacity:.55"></i></div></div><span class="v">' + x.n + '</span></div>'; }).join('') + '</div>');
  var by = { bad: 0, warn: 0, info: 0, ok: 0 }; docsAll.forEach(function (d) { by[st(d.days)]++; });
  var dow = [0, 0, 0, 0, 0, 0, 0]; STAFF.forEach(function (s) { dow[s.reg.getDay()]++; }); var dmx = Math.max.apply(null, dow) || 1, DN = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  var docLvl = pn('garnet', 'alert', 'الوثائق حسب الحالة', docsAll.length + ' وثيقة', more('الوثائق', '#documents'), '<div class="pb"><div class="lvl">' + [['bad', 'منتهية'], ['warn', 'خلال ٣٠ يومًا'], ['info', 'خلال ٩٠ يومًا'], ['ok', 'سارية']].map(function (x) { return '<button class="' + x[0] + '" data-gobk="' + x[0] + '"><b>' + by[x[0]] + '</b><span>' + x[1] + '</span></button>'; }).join('') + '</div>' +
    '<h3 style="font-size:14px;font-weight:800;margin:20px 0 10px;color:var(--mute)">أيام التسجيل خلال الأسبوع</h3><div class="wkd">' + dow.map(function (v, i) { return '<div><i style="height:' + Math.max(18, v / dmx * 100) + '%;opacity:' + (.45 + v / dmx * .55) + '">' + v + '</i><span>' + DN[i].replace('ال', '') + '</span></div>'; }).join('') + '</div></div>');

  var D = [], soonL = STAFF.filter(function (s) { return s.worst >= 0 && s.worst <= 30; }), nob = STAFF.filter(function (s) { return !s.iban; });
  var RP = reqPendingForMe(); if (RP.length) D.push({ j: 'amethyst', i: 'stamp', t: nq(RP.length, 'طلب واحد', 'طلبان', 'طلبات', 'طلبًا') + ' بانتظار قرارك', s: 'إجازات وأوامر إركاب وتعريفات وصلت إلى خطوتك في مسار الاعتماد.', faces: RP.map(function (r) { return byRef(r.ref); }).filter(Boolean), a: '<a class="btn sm prim" href="#reqs-pend">مراجعة</a>' });
  if (exp) D.push({ j: 'garnet', i: 'pass', t: nq(exp, 'منسوب واحد', 'منسوبان', 'منسوبين', 'منسوبًا') + ' بوثائق منتهية', s: 'راسلهم بلغتهم من صفحة الوثائق، وتصلهم رسالة فيها رابط رفع الوثيقة الجديدة.', faces: STAFF.filter(function (s) { return s.worst < 0; }), a: '<a class="btn sm prim" href="#documents" data-bk="bad">عرض</a>' });
  if (soonL.length) D.push({ j: 'gold', i: 'clock', t: nq(soonL.length, 'منسوب واحد', 'منسوبان', 'منسوبين', 'منسوبًا') + ' تنتهي وثائقهم خلال ٣٠ يومًا', s: 'ذكّرهم الآن قبل أن تنتهي.', faces: soonL, a: '<a class="btn sm" href="#documents" data-bk="warn">عرض</a>' });
  if (gap) D.push({ j: 'amethyst', i: 'alert', t: nq(gap, 'ملف واحد ناقص', 'ملفان ناقصان', 'ملفات ناقصة', 'ملفًا ناقصًا'), s: 'صورة شخصية أو حساب بنكي أو صور وثائق لم تُرفع بعد.', faces: STAFF.filter(function (s) { return s.status === 'ناقص'; }), a: '<a class="btn sm" href="#people" data-f="gap">عرض</a>' });
  if (can('pay') && nob.length) D.push({ j: 'sapphire', i: 'bank', t: nq(nob.length, 'منسوب واحد', 'منسوبان', 'منسوبين', 'منسوبًا') + ' بلا حساب بنكي', s: 'يتعطل صرف رواتبهم حتى يضيفوه من «تحديث بياناتي».', faces: nob, a: '<a class="btn sm" href="#banks">عرض</a>' });
  if (!D.length) D.push({ j: 'emerald', i: 'check', t: 'لا شيء ينتظرك الآن', s: 'الملفات مكتملة والوثائق سارية.' });
  var todo = pn('garnet', 'bolt', role === 'ceo' ? 'يستحق انتباهك' : 'يحتاج إجراءً منك', 'الأهم أولًا', '', '<ul class="lst">' + D.map(function (d) { return '<li>' + tile(d.j, d.i) + '<div><b>' + d.t + '</b><span class="s">' + d.s + '</span>' + (d.faces && d.faces.length ? '<div class="faces">' + d.faces.slice(0, 7).map(function (s) { return av(s, ' title="' + esc(s.name) + '"'); }).join('') + (d.faces.length > 7 ? '<span class="av" style="background:var(--well);color:var(--mute)">+' + (d.faces.length - 7) + '</span>' : '') + '</div>' : '') + '</div>' + (d.a || '<span></span>') + '</li>'; }).join('') + '</ul>');
  var QA = [['sapphire', 'plus', 'نسخ رابط التسجيل', 'regLink', 'view'], ['emerald', 'chat', 'مراسلة الناقصة ملفاتهم', 'msgGap', 'mail'], ['garnet', 'send', 'تذكير الوثائق', 'remindAll', 'mail'], ['gold', 'excel', 'تصدير Excel', 'excel', 'export'], ['amethyst', 'refresh', 'نسخة احتياطية الآن', 'backupNow', 'drive'], ['teal', 'shield', 'صحة النظام', 'health', 'users']];
  var qa = pn('teal', 'bolt', 'إجراءات سريعة', '', '', '<div class="pb"><div class="qa">' + QA.map(function (q) { return '<button data-act="' + q[3] + '"' + (can(q[4]) ? '' : ' disabled title="خارج صلاحياتك"') + '>' + tile(q[0], q[1]) + q[2] + '</button>'; }).join('') + '</div></div>');
  var cal = pn('sapphire', 'calendar', 'تقويم انتهاء الوثائق', 'أربعة أسابيع مضت واثنا عشر أسبوعًا قادمة، وكل مربع وثيقة', more('الوثائق', '#documents'), calHTML());
  var ents = ENT.map(function (e) { return { e: e, ss: STAFF.filter(function (s) { return s.ent.v === e.v; }) }; });
  var entP = pn('gold', 'building', 'الجهات', nq(nE, 'جهة واحدة', 'جهتان', 'جهات', 'جهة') + ' في السجل', '', '<div class="pb"><div class="ents">' + ents.map(function (x) { var dn2 = x.ss.filter(function (s) { return s.status === 'مكتمل'; }).length;
    return '<button class="ent" style="--ec:' + x.e.c + '" data-ent="' + esc(x.e.v) + '"><div class="lg">' + elogo(x.e) + '</div><h3>' + esc(x.e.n) + '</h3><div class="nb"><b>' + x.ss.length + '</b><span>' + pct(dn2, x.ss.length) + '٪ مكتمل</span></div><div class="tr"><i style="width:' + pct(dn2, x.ss.length) + '%"></i></div></button>'; }).join('') + '</div></div>');
  var recent = pn('emerald', 'userok', 'أحدث المنسوبين', '', more('الكل', '#people'), '<ul class="lst">' + STAFF.slice(0, 5).map(function (s) { return '<li style="cursor:pointer" data-open="' + esc(s.ref) + '">' + avP(s) + '<div><b>' + esc(s.name) + '</b><span class="s">' + esc(s.ent.n) + '، ' + esc(s.c.n) + ' · ' + agoD(s.reg) + '</span></div>' + (s.status === 'مكتمل' ? '<span class="pill ok"><i></i>مكتمل</span>' : '<span class="pill warn"><i></i>ناقص</span>') + '</li>'; }).join('') + '</ul>');
  var log = can('audit') ? pn('slate', 'history', 'آخر العمليات', '', more('السجل الكامل', '#log'), tlHTML(6)) : natPanel();
  var third = can('users') ? readyPanel() : quickFacts();
  /* الأهم أولًا (نمط صندوق المهام في أنظمة الموارد البشرية): المهام والإجراءات والمناسبات، ثم المؤشرات والرسوم */
  return hero + kpis + '<div class="grid g21">' + todo + '<div class="stack">' + qa + eventsPanel() + '</div></div>' + '<div class="grid g21">' + regChart + stDonut + '</div><div class="grid g3">' + quality + geo + docLvl + '</div>' + cal + entP + '<div class="grid g3">' + recent + log + third + '</div>';
};
function eventsPanel() {
  var t0 = new Date(TODAY); t0.setHours(0, 0, 0, 0); var E = [];
  STAFF.forEach(function (s) {
    if (!s.hire) return;
    var h = new Date(s.hire); h.setHours(0, 0, 0, 0);
    var dd = Math.round((h - t0) / DAY);
    if (dd >= 0 && dd <= 30) E.push({ d: dd, s: s, t: 'يباشر العمل', k: 'teal', i: 'userok' });
    else if (dd < 0 && dd >= -30) E.push({ d: dd, s: s, t: 'باشر حديثًا · مرحبًا به', k: 'emerald', i: 'userok' });
    var y = t0.getFullYear() - h.getFullYear(), an = new Date(t0.getFullYear(), h.getMonth(), h.getDate());
    if (an < t0) { an = new Date(t0.getFullYear() + 1, h.getMonth(), h.getDate()); y++; }
    var da = Math.round((an - t0) / DAY);
    if (y >= 1 && da <= 30) E.push({ d: da, s: s, t: 'يُتم ' + (y === 1 ? 'سنته الأولى' : y === 2 ? 'سنتين' : y + (y <= 10 ? ' سنوات' : ' سنة')) + ' معنا', k: 'gold', i: 'gift' });
  });
  reqRows().forEach(function (r) {
    if (r.status !== 'approved' || !r.data || !r.data.from) return; var f = pdate(r.data.from); if (!f) return;
    var dd = Math.round((f - t0) / DAY), s = byRef(r.ref); if (dd < 0 || dd > 14 || !s) return;
    E.push({ d: dd, s: s, t: (r.type === 'travel' ? 'يبدأ مهمة سفر إلى ' + (r.data.dest || '') : 'تبدأ إجازته'), k: r.type === 'travel' ? 'sapphire' : 'amethyst', i: r.type === 'travel' ? 'plane' : 'umbrella' });
  });
  E.sort(function (a, b) { return Math.abs(a.d) - Math.abs(b.d); });
  var when = function (d) { return d === 0 ? 'اليوم' : d === 1 ? 'غدًا' : d === -1 ? 'أمس' : d > 0 ? 'بعد ' + (d === 2 ? 'يومين' : dn(d)) : 'قبل ' + (d === -2 ? 'يومين' : dn(-d)); };
  return pn('gold', 'calendar', 'مناسبات قادمة', 'خلال ٣٠ يومًا', '', E.length ? '<ul class="lst evl">' + E.slice(0, 6).map(function (e) {
      return '<li data-open="' + esc(e.s.ref) + '" style="cursor:pointer">' + avP(e.s) + '<div><b>' + esc(e.s.name) + '</b><span class="s">' + tile(e.k, e.i, 'xs') + esc(e.t) + '</span></div><span class="when' + (e.d === 0 ? ' now' : '') + '">' + when(e.d) + '</span></li>'; }).join('') + '</ul>'
    : '<div class="pb"><div class="note">' + ic('calendar') + '<span>لا مناسبات خلال الثلاثين يومًا القادمة. تظهر هنا ذكرى المباشرة والمنضمون الجدد وبدء الإجازات المعتمدة.</span></div></div>');
};
function natPanel() {
  var c = {}; STAFF.forEach(function (s) { var k = s.nat || 'غير محددة'; c[k] = (c[k] || 0) + 1; });
  var ks = Object.keys(c).sort(function (a, b) { return c[b] - c[a]; }).slice(0, 7), mx = ks.length ? c[ks[0]] : 1;
  return pn('sapphire', 'globe', 'الجنسيات', Object.keys(c).length + ' جنسية', '', '<div class="pb bars">' + ks.map(function (k) { return '<div class="brow"><span class="cc">' + ic('user') + '</span><div><div class="nm">' + esc(k) + '</div><div class="tr" style="width:' + (c[k] / mx * 100) + '%"><i style="flex:1;background:var(--j-sapphire)"></i></div></div><span class="v">' + c[k] + '</span></div>'; }).join('') + '</div>');
}
function quickFacts() {
  var tot = STAFF.length, wa = STAFF.filter(function (s) { return s.r.whatsapp; }).length, off = STAFF.filter(function (s) { return s.r.officialEmail; }).length, deg = STAFF.filter(function (s) { return s.r.topDegree; }).length;
  return pn('amethyst', 'info', 'بيانات التواصل', '', '', '<div class="pb"><div class="mini">' + [['بريد رسمي مسجّل', off], ['واتساب مسجّل', wa], ['المؤهل العلمي مسجّل', deg]].map(function (x) { return '<div><span>' + x[0] + '</span><b>' + pct(x[1], tot) + '٪</b></div>'; }).join('') + '</div></div>');
}
function readyPanel() {
  var c = need('health', function () { return api({ action: 'health' }); }, 300000), h = c.data;
  if (!h) return pn('amethyst', 'shield', 'جاهزية النظام والأمان', '', '', '<div class="pb"><div class="empty">' + (c.err ? esc(c.err) : 'جارٍ الفحص…') + '</div></div>');
  var ok = h.checks.filter(function (x) { return x.ok; }).length, r = ok / h.checks.length;
  return pn('amethyst', 'shield', 'جاهزية النظام والأمان', ok + ' من ' + h.checks.length + ' فحوص سليمة', more('التفاصيل', '#data'), '<div class="pb ready">' + donut([[r * 100, 'url(#rg)']], 100, Math.round(r * 100) + '٪', 'جاهز', '<defs><linearGradient id="rg"><stop offset="0" stop-color="#8a6ff0"/><stop offset="1" stop-color="#2bb3c6"/></linearGradient></defs>') +
    '<div class="chk">' + h.checks.slice(0, 5).map(function (x) { return '<div><span class="o ' + (x.ok ? 'y' : 'p') + '">' + ic(x.ok ? 'check' : 'alert') + '</span><div><b>' + esc(x.name) + '</b><br><span>' + esc(x.note) + '</span></div><span></span></div>'; }).join('') + '</div></div>');
}

/* ---------- audit timeline ---------- */
var NOISE = /^(عرض بيانات المنسوبين|فتح صفحتي|دخول لوحة البيانات)$/;
function audIcon(a) {
  return /خطأ|خاطئة/.test(a) ? ['garnet', 'alert'] : /دخول|خروج|رمز/.test(a) ? ['sapphire', 'key'] : /تعديل|تحديث/.test(a) ? ['emerald', 'edit'] : /رسالة|بريد|تذكير|تنبيه|واتساب/.test(a) ? ['gold', 'mail'] :
    /تسجيل جديد|إنشاء/.test(a) ? ['teal', 'userok'] : /نسخة|تصدير|تنزيل|Excel/.test(a) ? ['amethyst', 'dl'] : /مرفق|ملف|رفع|استرجاع/.test(a) ? ['garnet', 'file'] : /حساب|صلاحي|قفل|جلسات/.test(a) ? ['slate', 'shield'] : ['slate', 'history'];
}
function dayLbl(d) { var t = new Date(); t.setHours(0, 0, 0, 0); var x = new Date(d); x.setHours(0, 0, 0, 0); var k = Math.round((t - x) / DAY); return k === 0 ? 'اليوم' : k === 1 ? 'أمس' : fd(x, { weekday: 'long', day: 'numeric', month: 'long' }); }
function tlRows(rows, lim, opt) {
  opt = opt || {}; var out = '', last = '';
  rows.slice(0, lim).forEach(function (a) {
    var d = pdt(a.at), I = audIcon(a.action), s = a.ref ? byRef(a.ref) : null;
    if (opt.days) { var L = dayLbl(d); if (L !== last) { out += '<li class="day">' + L + '</li>'; last = L; } }
    out += '<li>' + tile(I[0], I[1]) + '<div><p><b>' + esc(a.actor || 'النظام') + '</b> ' + esc(a.action) + (s && !opt.noRef ? ' <button class="lnk" data-open="' + esc(s.ref) + '">' + esc(s.name) + '</button>' : a.ref && !opt.noRef ? ' <span class="ltr ref">' + esc(a.ref) + '</span>' : '') +
      (opt.detail && a.detail ? '<small class="dt">' + esc(a.detail) + '</small>' : '') + '</p><time title="' + esc(a.at) + '">' + agoD(d) + '</time></div></li>';
  });
  return '<ul class="tl">' + (out || '<li class="day">لا توجد عمليات</li>') + '</ul>';
}
function tlHTML(lim) {
  var c = need('audit', function () { return api({ action: 'audit', limit: 400 }); }), rows = ((c.data && c.data.rows) || []).filter(function (r) { return !NOISE.test(r.action); });
  if (!c.data) return '<div class="pb"><div class="empty">' + (c.err ? esc(c.err) : 'جارٍ التحميل…') + '</div></div>';
  return tlRows(rows, lim);
}
var LOGF = { q: '', who: '', noise: false };
VIEWS.log = function () {
  var c = need('audit', function () { return api({ action: 'audit', limit: 400 }); }, 30000), all = (c.data && c.data.rows) || [];
  var who = {}; all.forEach(function (r) { if (r.actor) who[r.actor] = 1; });
  var q = LOGF.q.trim().toLowerCase(), rows = all.filter(function (r) { return (LOGF.noise || !NOISE.test(r.action)) && (!LOGF.who || r.actor === LOGF.who) && (!q || (r.action + ' ' + r.detail + ' ' + r.actor + ' ' + r.ref).toLowerCase().indexOf(q) >= 0); });
  var integ = c.data && c.data.integrity, sel = 'height:40px;border:1px solid var(--line);border-radius:11px;padding:0 10px;background:var(--soft);color:var(--ink)';
  var bar = '<div class="logbar"><input id="lgq" placeholder="ابحث في العمليات: اسم، رقم مرجعي، إجراء" value="' + esc(LOGF.q) + '" aria-label="بحث في السجل" style="' + sel + ';flex:1;min-width:200px">' +
    ssel('lgwho', [{ v: '', n: 'كل المستخدمين', ic: 'users' }].concat(Object.keys(who).sort().map(function (k) { return { v: k, n: k, k: all.filter(function (r) { return r.actor === k; }).length }; })), LOGF.who, 'كل المستخدمين', function (v) { LOGF.who = v; softRender(); }, 'تصفية حسب المستخدم') +
    '<label class="ck"><input type="checkbox" id="lgnoise"' + (LOGF.noise ? ' checked' : '') + '> إظهار مرات الاطلاع</label></div>';
  return ptitle('سجل العمليات', 'كل عملية في المنصة تُسجَّل باسم صاحبها ووقتها، والسجل مختوم بسلسلة تكشف أي تعديل عليه.') +
    pn('slate', 'history', 'آخر العمليات', rows.length + ' من ' + all.length + ' عملية', integ ? (integ.ok ? '<span class="pill ok"><i></i>السجل سليم</span>' : '<span class="pill bad"><i></i>تغيّر سطر في السجل</span>') : '',
      '<div class="pb">' + bar + (c.data ? tlRows(rows, 250, { days: true, detail: true }) : '<div class="empty">' + (c.err ? esc(c.err) : 'جارٍ التحميل…') + '</div>') + '</div>');
};

/* ---------- people ---------- */
var SORTS = [{ v: '', n: 'الأحدث تسجيلًا', ic: 'clock' }, { v: 'name', n: 'الاسم (أ ← ي)', ic: 'user' }, { v: 'docs', n: 'الأقرب انتهاءً للوثائق', ic: 'pass' }, { v: 'gaps', n: 'الأكثر نواقص', ic: 'alert' }, { v: 'svc', n: 'الأقدم خدمة', ic: 'calendar' }];
function filtered() {
  var q = filt.q.trim().toLowerCase();
  var L = STAFF.filter(function (s) {
    var okSt = filt.st === 'all' || (filt.st === 'done' && s.status === 'مكتمل') || (filt.st === 'gap' && s.status === 'ناقص') || (filt.st === 'exp' && s.worst < 0) || (filt.st === 'soon' && s.worst >= 0 && s.worst <= 30) || (filt.st === 'mail' && !s.mailed);
    return okSt && (!filt.ent || s.ent.v === filt.ent) && (!filt.cc || s.c.cc === filt.cc) && (!q || (s.name + ' ' + s.latin + ' ' + s.ref + ' ' + s.phone + ' ' + s.mail + ' ' + s.job).toLowerCase().indexOf(q) >= 0);
  });
  var k = filt.sort || '';
  if (k) L = L.slice().sort(function (a, b) {
    return k === 'name' ? a.name.localeCompare(b.name, 'ar') : k === 'docs' ? a.worst - b.worst : k === 'gaps' ? b.miss.length - a.miss.length || a.worst - b.worst : (a.hire || TODAY) - (b.hire || TODAY);
  });
  return L;
}
function stPill(x) {
  var wd = x.worst;
  return wd < 0 ? '<span class="pill bad"><i></i>وثيقة منتهية</span>' : wd <= 30 ? '<span class="pill warn"><i></i>تنتهي قريبًا</span>' : x.status === 'ناقص' ? '<span class="pill warn"><i></i>ناقص</span>' : '<span class="pill ok"><i></i>مكتمل</span>';
}
VIEWS.dir = function () {
  var list = filtered(), s = byRef(cur);
  if (!s || list.indexOf(s) < 0) s = list[0] || null;
  cur = s ? s.ref : '';
  var soon = STAFF.filter(function (x) { return x.worst >= 0 && x.worst <= 30; }).length;
  var C = { all: CNT.tot, done: CNT.done, gap: CNT.gap, exp: CNT.exp, soon: soon };
  var rows = list.length ? list.map(function (x) {
    return '<button class="prow" data-pick="' + esc(x.ref) + '" aria-current="' + (s && x.ref === s.ref) + '">' + avP(x) + '<span><b>' + esc(x.name) + '</b><span class="s">' + esc(x.job) + '، ' + esc(x.ent.n) + '</span></span><span class="fl">' +
      stPill(x) + '<span class="ref">' + esc(x.ref.replace(/^BNY-HR-/, '')) + '</span></span></button>'; }).join('')
    : '<div class="empty">' + (STAFF.length ? 'لا أحد يطابق هذه التصفية. جرّب إزالة أحد المرشحات.' : 'لا يوجد منسوبون بعد.') + '</div>';
  var E = ENT_MAP[filt.ent], CC = CT_MAP[filt.cc], SO = SORTS.filter(function (o) { return o.v === (filt.sort || ''); })[0];
  var STN = { done: 'مكتمل', gap: 'ناقص', exp: 'وثيقة منتهية', soon: 'تنتهي خلال ٣٠ يومًا', mail: 'لم تصله رسالة التأكيد' };
  var bar = '<section class="pn tbar"><div class="fbar">' + fsearch('fq', filt.q, 'ابحث بالاسم أو الرقم المرجعي أو الجوال أو البريد', 'بحث في المنسوبين') +
    ssel('fent', entOpts(true, true), filt.ent, 'الكل', function (v) { filt.ent = v; render(); }, 'الجهة', 'الجهة') +
    ssel('fcc', ctryOpts(), filt.cc, 'الكل', function (v) { filt.cc = v; render(); }, 'دولة العمل', 'الدولة') +
    ssel('fsort', SORTS, filt.sort || '', 'الأحدث تسجيلًا', function (v) { filt.sort = v; render(); }, 'ترتيب القائمة', 'الترتيب') + '</div>' +
    '<div class="frow"><div class="schips" role="group" aria-label="حالة الملف">' + [['all', 'الكل', ''], ['done', 'مكتمل', 'ok'], ['gap', 'ناقص', 'warn'], ['soon', 'تنتهي قريبًا', 'warn'], ['exp', 'وثيقة منتهية', 'bad']].map(function (x) {
      return '<button data-st="' + x[0] + '" class="' + x[2] + '" aria-pressed="' + (filt.st === x[0]) + '">' + (x[2] ? '<i></i>' : '') + x[1] + '<b>' + C[x[0]] + '</b></button>'; }).join('') + '</div>' +
    fchips([[filt.q.trim() ? 'بحث: ' + filt.q.trim() : '', function () { filt.q = ''; }], [E ? 'الجهة: ' + E.n : '', function () { filt.ent = ''; }], [CC ? 'الدولة: ' + CC.n : '', function () { filt.cc = ''; }], [filt.st !== 'all' && STN[filt.st] ? 'الحالة: ' + STN[filt.st] : '', function () { filt.st = 'all'; }]]) +
    '<span class="fcount"><b>' + list.length + '</b> من ' + CNT.tot + (SO && SO.v ? ' · ' + esc(SO.n) : '') + '</span>' +
    (can('mail') && list.length > 1 ? '<button class="btn sm" data-msgall="1">' + ic('chat') + 'مراسلة ' + nq(list.length, 'منسوب واحد', 'منسوبَين', 'منسوبين', 'منسوبًا') + '</button>' : '') + '</div></section>';
  var listH = '<section class="pn plist"><div class="rows">' + rows + '</div></section>';
  return ptitle('دليل المنسوبين', CNT.tot + ' منسوبًا. اختر منسوبًا لعرض ملفه وبطاقته ووثائقه وطلباته.', '') + bar +
    '<div class="md">' + listH + (s ? profHTML(s) : '<section class="pn prof"><div class="empty">اختر منسوبًا من القائمة.</div></section>') + '</div>';
};
function cardHTML(s, tools) {
  /* البطاقة الرسمية نفسها التي يصدرها النموذج (app.js) — تُرسم بعد إدراج الصفحة */
  if (window.BonyanApp && BonyanApp.card) return '<div class="offcard"><div class="idcard-wrap" data-card="' + esc(s.ref) + '"></div>' + (tools === false ? '' : '<div class="cardtools"><button type="button" class="btn sm" data-cardflip="1">' + ic('refresh') + 'قلب البطاقة</button><button type="button" class="btn sm" data-cardpng="' + esc(s.ref) + '">' + ic('dl') + 'تنزيل البطاقة</button></div>') + '</div>';
  return '<div class="scard" style="background:linear-gradient(135deg,' + s.ent.c + ' 0%,' + s.ent.c + ' 35%,#0a172e 135%)"><div class="lg">' + elogo(s.ent) + '<small>بطاقة منسوب<br>مجموعة بنيان العالمية</small></div><div class="ph2">' + esc(s.ini) + '</div><div class="nm"><b>' + esc(s.name) + '</b><small>' + esc(s.job) + '</small></div><div class="ft"><span>' + esc(s.ent.n) + '</span><b>' + esc(s.ref) + '</b></div></div>';
}
function mountCards() {
  if (!window.BonyanApp || !BonyanApp.card) return;
  document.querySelectorAll('[data-card]').forEach(function (el) {
    var s = byRef(el.dataset.card) || (ME && ME.ref === el.dataset.card ? ME : null); if (!s) return;
    try { BonyanApp.card.render(el, cardRec(s), s.photo || null); } catch (e) { if (window.console) console.error(e); }
  });
}
/* إن لم تُسجَّل أجزاء الاسم (سجلات قديمة) يُستعمل الاسم الكامل */
function cardRec(s) { var r = {}; Object.keys(s.r).forEach(function (k) { r[k] = s.r[k]; }); if (!r.firstNameAr && !r.lastNameAr) r.firstNameAr = r.fullNameAr || ''; if (!r.firstName && !r.lastName) r.firstName = r.fullNameLatin || ''; return r; }
function cardPng(s, btn) {
  if (btn) btn.disabled = true;
  BonyanApp.card.png(cardRec(s), s.photo || null).then(function (url) { var a = document.createElement('a'); a.href = url; a.download = 'Bonyan-Staff-Card-' + s.ref + '.png'; document.body.appendChild(a); a.click(); setTimeout(function () { a.remove(); }, 500); })
    .catch(function () { toast('تعذّر تجهيز البطاقة، حاول مرة أخرى'); }).then(function () { if (btn) btn.disabled = false; });
}
/* الملف الكامل (التعديل والمرفقات والأرشيف والطباعة) داخل المنصة نفسها */
var FULL_CHANGED = false;
function openFull(ref, edit) {
  closeFull();
  var el = document.createElement('div'); el.id = 'fullLayer';
  el.innerHTML = '<div class="fl-load" role="status"><i class="spin" aria-hidden="true"></i><span>جارٍ فتح الملف…</span></div><iframe title="ملف المنسوب الكامل" src="admin.html?embed=1&amp;ref=' + encodeURIComponent(ref) + (edit ? '&amp;edit=1' : '') + '"></iframe>';
  document.body.appendChild(el); document.body.classList.add('no-scroll');
}
function closeFull() { var el = document.getElementById('fullLayer'); if (el) el.remove(); document.body.classList.remove('no-scroll'); }
window.addEventListener('message', function (e) {
  if (e.origin !== location.origin || !e.data || !e.data.bhr) return;
  if (e.data.type === 'saved') FULL_CHANGED = true;
  if (e.data.type === 'close') { closeFull(); if (FULL_CHANGED) { FULL_CHANGED = false; Object.keys(CACHE).forEach(function (k) { if (/^(aud|msg):/.test(k) || k === 'audit') delete CACHE[k]; }); reloadList().then(softRender, softRender); toast('حُدّثت بيانات المنسوب'); } }
});
function svc(d) { if (!d) return '—'; var m = Math.round((Date.now() - d) / DAY / 30.4); if (m < 0) return 'لم يباشر بعد'; var y = Math.floor(m / 12), r = m % 12; return ((y ? (y === 1 ? 'سنة' : y === 2 ? 'سنتان' : y + (y <= 10 ? ' سنوات' : ' سنة')) : '') + (y && r ? ' و' : '') + (r ? (r === 1 ? 'شهر' : r === 2 ? 'شهران' : r + ' أشهر') : '')) || 'أقل من شهر'; }
function docRows(docs, withNo) {
  return '<div class="docs">' + (docs.length ? docs.map(function (d) { var left = d.days > 9000 ? 1 : Math.max(0, Math.min(1, d.days / (DOC_LIFE[d.t] || 730)));
    return '<div class="doc"><span class="th">' + ic(d.t === 'العقد' ? 'doc' : 'pass') + '<small>' + (d.file ? 'ملف' : '—') + '</small></span><div><b>' + d.t + '</b><span class="s">' + (withNo && d.no ? '<span class="ltr">' + esc(d.no) + '</span>، ' : '') + (d.exp ? 'تنتهي ' + fd(d.exp) : 'بلا تاريخ انتهاء') + '</span>' +
      '<div class="life"><i style="width:' + (left * 100) + '%;background:' + STC[st(d.days)] + '"></i></div>' + (d.urls.length ? '<div class="flinks">' + d.urls.map(function (u, i) { return '<a href="' + esc(u) + '" target="_blank" rel="noopener">' + ic('eye') + 'عرض' + (d.urls.length > 1 ? ' ' + (i + 1) : '') + '</a>'; }).join('') + '</div>' : '') + '</div>' +
      '<span class="pill ' + (d.file ? st(d.days) : 'bad') + '"><i></i>' + (d.file || d.days < 0 ? dl(d.days) : 'الصورة غير مرفوعة') + '</span></div>'; }).join('') : '<div class="empty">لا توجد وثائق مسجّلة.</div>') + '</div>';
}
function kvHTML(list) { return '<dl class="kv">' + list.filter(function (p) { return p[1] !== '' && p[1] != null; }).map(function (p) { return '<div><dt>' + p[0] + '</dt><dd>' + p[1] + '</dd></div>'; }).join('') + '</dl>'; }
function ltr(v) { return v ? '<span class="ltr">' + esc(v) + '</span>' : '—'; }
function completeness(s) { var tot = 4 + s.docs.filter(function (d) { return d.t !== 'العقد'; }).length; return Math.round(Math.max(0, tot - s.miss.length) / tot * 100); }
function ksec(title, icn, list) { var b = kvHTML(list); return '<section class="ksec"><h3>' + ic(icn) + title + '</h3>' + b + '</section>'; }
function profHTML(s) {
  var r = s.r, myReqs = reqRows().filter(function (x) { return x.ref === s.ref; }), openR = myReqs.filter(function (x) { return x.status === 'pending'; }).length;
  var T = [['over', 'الملخص', 'card'], ['info', 'البيانات', 'user'], ['docs', 'الوثائق', 'pass', s.docs.filter(function (d) { return d.days <= 30 || !d.file; }).length], ['pay', 'المالية', 'wallet'], ['reqs', 'الطلبات', 'stamp', openR], ['log', 'السجل', 'history']]
    .filter(function (t) { return (t[0] !== 'pay' || can('pay')) && (t[0] !== 'log' || can('audit') || can('mail')); });
  if (!T.some(function (t) { return t[0] === ptab; })) ptab = 'over';
  var body = '', pc = completeness(s);
  if (ptab === 'over') body = '<div class="psum"><div class="cardcol">' + cardHTML(s) + '</div><div class="pside">' +
      '<div class="meter"><div class="mt"><span>اكتمال الملف</span><b>' + pc + '٪</b></div><div class="bar"><i style="width:' + pc + '%;background:' + (pc === 100 ? 'var(--c-ok)' : pc >= 60 ? 'var(--c-warn)' : 'var(--c-bad)') + '"></i></div></div>' +
      '<dl class="facts">' + [['sapphire', 'building', 'الجهة', s.ent.full || s.ent.n], ['emerald', 'user', 'المسمى الوظيفي', s.job], ['teal', 'globe', 'دولة العمل', s.c.n], ['gold', 'clock', 'مدة الخدمة', svc(s.hire)], ['amethyst', 'calendar', 'تاريخ المباشرة', s.hire ? fd(s.hire) : '—'], ['slate', 'phone', 'الجوال', s.phone || '—']].map(function (f) {
        return '<div class="fact">' + tile(f[0], f[1]) + '<div style="min-width:0"><dt>' + f[2] + '</dt><dd' + (f[1] === 'phone' ? ' class="ltr"' : '') + '>' + esc(f[3]) + '</dd></div></div>'; }).join('') + '</dl></div></div>' +
    (s.miss.length ? '<div><h3 class="h3s">نواقص الملف</h3><div class="miss">' + s.miss.map(function (m) { return '<div><span>' + m + '</span>' + (can('mail') ? '<button class="btn sm" data-msggap="' + esc(s.ref) + '">اطلبه من المنسوب</button>' : '') + '</div>'; }).join('') + '</div></div>' : '<div class="note">' + ic('check') + '<span>الملف مكتمل، وكل الوثائق المطلوبة مرفوعة.</span></div>');
  if (ptab === 'info') body = '<div class="ksecs">' +
    ksec('الهوية', 'user', [['الاسم بالعربية', esc(s.name)], ['الاسم كما في الجواز', s.latin ? '<span class="ltr">' + esc(s.latin) + '</span>' : '—'], ['الجنسية', esc(s.nat || '—')], ['أعلى مؤهل', esc(r.topDegree || '—')]]) +
    ksec('التواصل', 'chat', [['الجوال', ltr(r.mobile)], ['الواتساب', ltr(r.whatsapp)], ['البريد الرسمي', r.officialEmail ? '<span class="ltr" style="font-size:13.5px">' + esc(r.officialEmail) + '</span>' : '—'], ['البريد الشخصي', r.personalEmail ? '<span class="ltr" style="font-size:13.5px">' + esc(r.personalEmail) + '</span>' : '—']]) +
    ksec('الوظيفة', 'building', [['الجهة', esc(s.ent.full || s.ent.n)], ['المسمى', esc(s.job)], ['الإدارة', esc(r.department || '—')], ['المدير المباشر', esc(r.manager || '—')], ['دولة العمل', esc(s.c.n)], ['تاريخ المباشرة', fdx(s.hire)]]) +
    ksec('السجل في المنصة', 'history', [['الرقم المرجعي', '<span class="ltr">' + esc(s.ref) + '</span>'], ['تاريخ التسجيل', fdx(s.reg) + ' <small class="mu">' + agoD(s.reg) + '</small>'], ['آخر تحديث', s.upd ? fd(s.upd) + ' <small class="mu">' + agoD(s.upd) + '</small>' : '—'], ['رسالة التأكيد', s.mailed ? 'أُرسلت إلى بريده' : '<span class="pill mute"><i></i>لم تُرسل</span>']]) + '</div>';
  if (ptab === 'docs') body = docRows(s.docs, true) + '<div class="note">' + ic('archive') + '<span>عند استبدال وثيقة تنتقل النسخة القديمة إلى الأرشيف ولا تُحذف، ويمكن استرجاعها من التعديل التفصيلي.</span></div>';
  if (ptab === 'pay') body = kvHTML([['الراتب الشهري', s.base ? '<span class="tn">' + n(s.base) + ' ' + esc(curS(s.cur)) + '</span>' : '—'], ['العملة', esc(curN(s.cur))], ['المكافئ التقريبي بالريال', s.base && FX[s.cur] ? '<span class="tn">' + n(sar(s)) + ' ر.س</span>' : '—'],
      ['طريقة الاستلام', esc(r.payMethod || '—')], ['البنك', esc(r.bankName || '—')], ['دولة البنك', esc(r.bankCountry || '—')], ['الحساب', s.iban ? '<span class="ltr">' + s.iban + '</span>' : '<span class="pill bad"><i></i>غير مسجل</span>']]) +
    '<div class="note">' + ic('lock') + '<span>رقم الحساب يظهر مقنّعًا في المنصة. بياناته كاملة في التعديل التفصيلي لمن يملك صلاحية المالية.</span></div>';
  if (ptab === 'reqs') body = (can('edit') ? '<div class="rqhead"><span>' + (myReqs.length ? nq(myReqs.length, 'طلب واحد', 'طلبان', 'طلبات', 'طلبًا') + (openR ? '، ' + openR + ' قيد الإجراء' : '') : 'لا طلبات لهذا المنسوب بعد') + '</span><a class="btn sm goldb" href="#reqs-new" data-rwref="' + esc(s.ref) + '">' + ic('plus') + 'طلب نيابة عنه</a></div>' : '') +
    (myReqs.length ? reqListHTML(myReqs, false) : '');
  if (ptab === 'log') body = profLog(s);
  var E = s.ent.c || '#1b3050';
  var menu = '<details class="dmenu"><summary class="btn" aria-label="إجراءات أخرى">' + ic('dots') + '<span>المزيد</span></summary><div class="dpop" role="menu">' +
    '<button type="button" role="menuitem" data-full="' + esc(s.ref) + '">' + tile('sapphire', 'doc') + '<span><b>الملف الكامل والطباعة</b><small>كل الحقول ونسخة قابلة للطباعة</small></span></button>' +
    '<button type="button" role="menuitem" data-cardpng="' + esc(s.ref) + '">' + tile('gold', 'card') + '<span><b>تنزيل البطاقة</b><small>صورة PNG بوجهيها</small></span></button>' +
    '<a role="menuitem" href="api/?action=zip&amp;ref=' + encodeURIComponent(s.ref) + '" download>' + tile('emerald', 'folder') + '<span><b>تنزيل المرفقات</b><small>ملف مضغوط بكل الوثائق</small></span></a>' +
    '<button type="button" role="menuitem" data-copyref="' + esc(s.ref) + '">' + tile('slate', 'copy') + '<span><b>نسخ الرقم المرجعي</b><small class="ltr">' + esc(s.ref) + '</small></span></button>' +
    (can('edit') ? '<a role="menuitem" href="#reqs-new" data-rwref="' + esc(s.ref) + '">' + tile('amethyst', 'stamp') + '<span><b>طلب نيابة عنه</b><small>إجازة أو إركاب أو تعريف</small></span></a>' : '') + '</div></details>';
  var acts = (can('edit') ? '<button class="btn prim" data-full="' + esc(s.ref) + '" data-fedit="1">' + ic('edit') + 'تعديل البيانات</button>' : ro()) +
    (can('mail') ? '<button class="btn goldb" data-msg="' + esc(s.ref) + '">' + ic('chat') + 'مراسلة</button>' : '') + menu;
  return '<section class="pn prof" aria-live="polite"><div class="phero" style="--ec:' + esc(E) + '"><div class="pid">' + avP(s) +
    '<div class="pnm"><h2>' + esc(s.name) + '</h2>' + (s.latin ? '<p class="lat ltr">' + esc(s.latin) + '</p>' : '') + '<p class="job">' + esc(s.job) + ' · ' + esc(s.ent.n) + '</p>' +
    '<div class="meta"><span class="refc ltr">' + esc(s.ref) + '</span>' + (s.status === 'مكتمل' ? '<span class="pill ok"><i></i>ملف مكتمل</span>' : '<span class="pill warn"><i></i>' + nq(s.miss.length || 1, 'نقص واحد', 'نقصان', 'نواقص', 'نقصًا') + '</span>') + (s.worst < 0 ? '<span class="pill bad"><i></i>وثيقة منتهية</span>' : s.worst <= 30 ? '<span class="pill warn"><i></i>وثيقة تنتهي قريبًا</span>' : '') + (openR ? '<span class="pill info"><i></i>' + openR + ' طلب قيد الإجراء</span>' : '') + '</div></div></div>' +
    '<div class="pact">' + acts + '</div></div>' +
    '<div class="ptabs" role="tablist">' + T.map(function (t) { return '<button role="tab" data-ptab="' + t[0] + '" aria-selected="' + (ptab === t[0]) + '">' + ic(t[2]) + t[1] + (t[3] ? '<em>' + t[3] + '</em>' : '') + '</button>'; }).join('') + '</div><div class="pbody">' + body + '</div></section>';
}
function profLog(s) {
  var out = '';
  if (can('mail') || can('view')) {
    var m = need('msg:' + s.ref, function () { return api({ action: 'messages', ref: s.ref }).then(function (j) { return j.rows; }); }, 30000);
    var rows = m.data || [];
    out += '<div><h3 class="h3s">المراسلات</h3>' + (!m.data ? '<div class="empty">' + (m.err ? esc(m.err) : 'جارٍ التحميل…') + '</div>' : rows.length ? '<ul class="lst" style="padding:0">' + rows.map(function (x) { var wa = x.channel === 'wa';
      return '<li>' + tile(wa ? 'teal' : 'sapphire', wa ? 'chat' : 'mail') + '<div><b>' + esc(x.subject || '(بلا عنوان)') + '</b><span class="s">' + (wa ? 'واتساب' : 'البريد') + '، ' + esc(x.sent_by) + '، ' + agoD(pdt(x.at)) + '</span></div><span class="pill ' + (wa ? 'info' : 'ok') + '"><i></i>' + (wa ? 'فُتحت' : 'أُرسلت') + '</span></li>'; }).join('') + '</ul>'
      : '<div class="note">' + ic('chat') + '<span>لا مراسلات مع هذا المنسوب بعد.' + (can('mail') ? ' استخدم «مراسلة المنسوب» أسفل الملف.' : '') + '</span></div>') + '</div>';
  }
  if (can('audit')) {
    var a = need('aud:' + s.ref, function () { return api({ action: 'audit', ref: s.ref, limit: 60 }).then(function (j) { return j.rows; }); }, 30000);
    out += '<div><h3 class="h3s">سجل الملف</h3>' + (a.data ? tlRows(a.data.filter(function (r) { return !NOISE.test(r.action); }), 30, { noRef: true, detail: true }) : '<div class="empty">' + (a.err ? esc(a.err) : 'جارٍ التحميل…') + '</div>') + '</div>';
  }
  return out;
}

/* ---------- payroll ---------- */
VIEWS.payroll = function () {
  var paid = STAFF.filter(function (s) { return s.base > 0; }), conv = paid.filter(function (s) { return FX[s.cur]; }), tot = conv.reduce(function (a, s) { return a + sar(s); }, 0), nob = STAFF.filter(function (s) { return !s.iban; });
  var byE = ENT.map(function (e) { var ss = paid.filter(function (s) { return s.ent.v === e.v; }), curs = {}; ss.forEach(function (s) { curs[s.cur] = (curs[s.cur] || 0) + s.base; });
    return { e: e, ss: ss, curs: curs, sar: ss.reduce(function (a, s) { return a + sar(s); }, 0) }; }).filter(function (x) { return x.ss.length; }).sort(function (a, b) { return b.sar - a.sar; });
  var mx = byE.length ? byE[0].sar || 1 : 1, allCur = {}; paid.forEach(function (s) { allCur[s.cur] = allCur[s.cur] || { n: 0, sum: 0, sar: 0 }; allCur[s.cur].n++; allCur[s.cur].sum += s.base; allCur[s.cur].sar += sar(s); });
  var ck = Object.keys(allCur).sort(function (a, b) { return allCur[b].sar - allCur[a].sar; });
  var entT = byE.length ? '<div class="tw"><table class="etab"><thead><tr><th>الجهة</th><th>العملة</th><th class="num">المنسوبون</th><th class="num">الإجمالي بعملة الصرف</th><th class="num">يعادل بالريال</th><th>الحصة</th></tr></thead><tbody>' +
    byE.map(function (x) { var cs = Object.keys(x.curs); return '<tr class="click" data-pe="' + esc(x.e.v) + '"><td><div class="person"><span class="elg">' + elogo(x.e) + '</span><b>' + esc(x.e.n) + '</b></div></td><td>' + cs.map(function (c) { return '<span class="ccy" style="background:' + curJ(c) + '">' + c + '</span>'; }).join(' ') + '</td><td class="num">' + x.ss.length + '</td>' +
      '<td class="num">' + cs.map(function (c) { return '<b>' + n(x.curs[c]) + '</b> <small>' + esc(curS(c)) + '</small>'; }).join('<br>') + '</td><td class="num">' + n(x.sar) + ' <small>ر.س</small></td><td style="min-width:120px"><div class="share"><i style="width:' + (x.sar / mx * 100) + '%;background:' + x.e.c + '"></i></div><small class="tn">' + pct(x.sar, tot) + '٪</small></td></tr>'; }).join('') +
    '</tbody><tfoot><tr><td colspan="2"><b>الإجمالي</b></td><td class="num"><b>' + paid.length + '</b></td><td class="num">—</td><td class="num"><b>' + n(tot) + '</b> <small>ر.س</small></td><td></td></tr></tfoot></table></div>' : '<div class="empty">لا رواتب مسجّلة بعد.</div>';
  var list = STAFF.filter(function (s) { return (PAYF === 'all' || !s.iban) && (!PAYE || s.ent.v === PAYE); }).sort(function (a, b) { return sar(b) - sar(a) || b.base - a.base; });
  var run = '<div class="seg pseg"><button data-pf="all" aria-pressed="' + (PAYF === 'all') + '">الكل<b>' + STAFF.length + '</b></button><button data-pf="nobank" aria-pressed="' + (PAYF === 'nobank') + '">بلا حساب بنكي<b>' + nob.length + '</b></button>' +
    '<span id="payEnt">' + ssel('payEntS', entOpts(true, true), PAYE, 'الكل', function (v) { PAYE = v; render(); }, 'الجهة', 'الجهة') + '</span></div>' +
    '<div class="tw"><table><thead><tr><th>المنسوب</th><th>الجهة</th><th class="num">الراتب الشهري</th><th>العملة</th><th class="num">يعادل بالريال</th><th>طريقة الاستلام</th><th>الحساب البنكي</th></tr></thead><tbody>' +
    (list.length ? list.map(function (s) { return '<tr class="click" data-open="' + esc(s.ref) + '"><td><div class="person">' + av(s) + '<div><b>' + esc(s.name) + '</b><span>' + esc(s.job) + '</span></div></div></td><td>' + esc(s.ent.n) + '</td><td class="num">' + (s.base ? '<b>' + n(s.base) + '</b>' : '—') + '</td><td>' + s.cur + '</td><td class="num">' + (s.base && FX[s.cur] ? n(sar(s)) + ' <small>ر.س</small>' : '—') + '</td><td>' + esc(s.r.payMethod || '—') + '</td><td>' +
      (s.iban ? '<span class="ltr">' + s.iban + '</span>' : '<span class="pill bad"><i></i>غير مسجل</span>' + (can('mail') ? ' <button class="btn sm" data-msgbank="' + esc(s.ref) + '" data-stop="1">اطلبه</button>' : '')) + '</td></tr>'; }).join('') : '<tr><td colspan="7" class="empty">لا أحد في هذه التصفية.</td></tr>') + '</tbody></table></div>';
  var curP = pn('emerald', 'globe', 'حسب العملة', 'الرواتب كما سجّلها المنسوبون', '', ck.length ? '<div class="pb cur">' + ck.map(function (k) { return '<div><span class="code" style="background:' + curJ(k) + '">' + k + '</span><div><b>' + n(allCur[k].sum) + '</b><span>' + esc(curN(k)) + '، ' + nq(allCur[k].n, 'منسوب واحد', 'منسوبان', 'منسوبين', 'منسوبًا') + '</span></div><span class="pct">' + (FX[k] ? pct(allCur[k].sar, tot) + '٪' : '—') + '</span></div>'; }).join('') + '</div>' : '<div class="pb"><div class="empty">لا رواتب مسجّلة.</div></div>');
  return ptitle('الرواتب', 'الرواتب الشهرية كما في سجل المنسوبين، بعملة كل منسوب، ومعها مكافئ تقريبي بالريال السعودي للمقارنة.', '<button class="btn" data-act="excel">' + ic('excel') + 'تصدير Excel</button>') +
    '<div class="grid g4">' + kpi('gold', 'wallet', n(tot), 'ر.س', 'إجمالي الرواتب بالمكافئ', 'بأسعار صرف تقريبية', '') +
    kpi('sapphire', 'users', paid.length, 'منسوبًا', 'لهم راتب مسجّل', nq(byE.length, 'جهة واحدة', 'جهتان', 'جهات', 'جهة') + '، ' + nq(ck.length, 'عملة واحدة', 'عملتان', 'عملات', 'عملة'), '') +
    '<a class="kpilink" href="#payroll" data-pfl="nobank">' + kpi('garnet', 'bank', nob.length, '', 'بلا حساب بنكي', '<span class="delta dn">يتعطل صرفهم</span>', '') + '</a>' +
    kpi('slate', 'alert', STAFF.length - paid.length, '', 'بلا راتب مسجّل', 'يُضاف من التعديل التفصيلي', '') + '</div>' +
    '<div class="grid g21">' + pn('emerald', 'building', 'حسب الجهة', 'اضغط جهة لعرض منسوبيها', '', entT) + curP + '</div>' +
    pn('sapphire', 'wallet', 'كشف الرواتب', list.length + ' منسوبًا' + (PAYE ? '، ' + esc((ENT_MAP[PAYE] || {}).n || '') : ''), '', run);
};

/* ---------- system ---------- */
VIEWS.system = function () {
  var T = []; if (can('users')) T.push(['acc', 'الحسابات والصلاحيات', null, 'key']); if (can('audit')) T.push(['log', 'سجل العمليات', null, 'history']); if (can('drive') || can('users')) T.push(['data', 'البيانات والنسخ', null, 'folder']);
  if (!T.some(function (x) { return x[0] === TAB.system; })) TAB.system = T[0][0];
  var t = TAB.system, D = { acc: 'من يدخل المنصة، وماذا يرى، وماذا يعدّل. كل تغيير يُسجَّل باسمك.', log: 'كل عملية تُسجَّل باسم صاحبها ووقتها، والسجل مختوم بسلسلة تكشف أي تعديل عليه.', data: 'أين تُحفظ البيانات، والنسخ الاحتياطية، والتصدير، وصحة الخادم.' };
  return ptitle('النظام', D[t], t === 'data' && can('drive') ? '<button class="btn goldb" data-act="backupNow">' + ic('refresh') + 'نسخة احتياطية الآن</button>' : '') + (T.length > 1 ? vtabs('system', T) : '') +
    (t === 'acc' ? sub(VIEWS.accounts) : t === 'log' ? sub(VIEWS.log) : sub(VIEWS.data));
};
var PERM_ROWS = [['staff.view', 'users'], ['staff.edit', 'edit'], ['staff.files', 'file'], ['staff.mail', 'mail'], ['finance.view', 'wallet'], ['audit.view', 'history'], ['requests.approve', 'stamp'], ['users.manage', 'key'], ['backup.run', 'archive']];
var ACQ = '';
VIEWS.accounts = function () {
  var c = need('users', function () { return api({ action: 'usersList' }); }, 60000), d = c.data;
  if (!d) return pn('emerald', 'key', 'الموظفون والصلاحيات', '', '', '<div class="pb"><div class="empty">' + (c.err ? esc(c.err) : 'جارٍ التحميل…') + '</div></div>');
  var roles = d.roles || {}, rp = d.rolePerms || {}, meId = SESSION ? SESSION.id : 0, q = ACQ.trim().toLowerCase();
  var list = d.users.filter(function (u) { return !q || (u.name + ' ' + u.email + ' ' + u.title + ' ' + u.roleName).toLowerCase().indexOf(q) >= 0; });
  var cnt = { all: d.users.length, on: d.users.filter(function (u) { return u.active; }).length, off: d.users.filter(function (u) { return !u.active; }).length, notify: d.users.filter(function (u) { return u.notify; }).length };
  var rows = list.map(function (u) {
    var stt = !u.active ? ['موقوف', 'bad'] : u.locked ? ['مقفل مؤقتًا', 'warn'] : u.lastLogin ? ['مفعّل', 'ok'] : ['لم يدخل بعد', 'mute'], self = u.id === meId, R = ROLE_INFO[u.role] || ['slate'], custom = !samePerms(u.perms, rp[u.role] || []);
    return '<tr><td><div class="person"><span class="av ' + R[0] + '">' + esc((u.name || u.email).charAt(0)) + '</span><div><b>' + esc(u.name || u.email) + (self ? ' <small class="you2">أنت</small>' : '') + '</b><span class="ltr">' + esc(u.email) + '</span></div></div></td>' +
      '<td><b>' + esc(u.roleName) + '</b><br><small class="mu">' + esc(u.title || '') + '</small></td><td>' + u.perms.length + (custom ? ' <span class="pill vio"><i></i>مخصّصة</span>' : '') + '</td>' +
      '<td><span class="pill ' + stt[1] + '"><i></i>' + stt[0] + '</span><br><small class="mu">' + (u.lastLogin ? 'آخر دخول ' + agoD(pdt(u.lastLogin)) : '') + '</small></td>' +
      '<td><button class="sw" role="switch" aria-checked="' + !!u.notify + '" data-unotify="' + u.id + '" aria-label="تنبيهات التسجيل الجديد لـ ' + esc(u.name || u.email) + '"></button></td>' +
      '<td class="acts2"><button class="btn sm prim" data-acedit="' + u.id + '">' + ic('edit') + 'تعديل</button>' + (u.locked ? '<button class="btn sm" data-uact="unlock" data-id="' + u.id + '">فك القفل</button>' : '') + (self ? '' : '<button class="btn sm" data-uact="kick" data-id="' + u.id + '" title="يُخرجه من كل الأجهزة">إنهاء الجلسات</button>') + '</td></tr>';
  }).join('');
  var table = '<div class="pb acbar"><input id="acq" type="search" placeholder="ابحث بالاسم أو البريد أو الدور" value="' + esc(ACQ) + '" aria-label="بحث في الموظفين"><button class="btn goldb" data-act="acctNew">' + ic('plus') + 'إضافة موظف</button></div>' +
    '<div class="tw"><table class="actab"><thead><tr><th>الموظف</th><th>الدور</th><th>الصلاحيات</th><th>الحالة</th><th>التنبيهات</th><th></th></tr></thead><tbody>' + (rows || '<tr><td colspan="6" class="empty">لا أحد بهذا البحث.</td></tr>') + '</tbody></table></div>';
  var cols = Object.keys(rp);
  var matrix = '<div class="tw"><table class="matrix"><thead><tr><th>الصلاحية</th>' + cols.map(function (k) { return '<th>' + esc(roles[k] || k) + '</th>'; }).join('') + '</tr></thead><tbody>' +
    PERM_GROUPS.map(function (g) { return '<tr class="mg"><td colspan="' + (cols.length + 1) + '">' + g[0] + '</td></tr>' + g[1].map(function (p) { return '<tr><td><span class="pcell">' + esc(p[1]) + '</span></td>' + cols.map(function (k) { var on = rp[k].indexOf(p[0]) > -1; return '<td><span class="pm ' + (on ? 'y' : 'n') + '" aria-label="' + (on ? 'نعم' : 'لا') + '">' + (on ? ic('check') : '—') + '</span></td>'; }).join('') + '</tr>'; }).join(''); }).join('') +
    '</tbody></table></div><div class="calnote"><span>الصلاحيات تُفحص في الخادم مع كل عملية. ولتخصيص صلاحيات موظف بعينه افتح «تعديل» عند اسمه.</span></div>';
  return '<div class="tabs2">' + [['sapphire', 'users', cnt.all, 'موظفًا بحساب إداري'], ['emerald', 'check', cnt.on, 'حسابًا مفعّلًا'], ['garnet', 'lock', cnt.off, 'حسابًا موقوفًا'], ['gold', 'bell', cnt.notify, 'تصلهم التنبيهات'], ['teal', 'userok', d.staffAccounts || 0, 'منسوبًا دخل صفحته']].map(function (x) { return '<div class="stat">' + tile(x[0], x[1]) + '<div><b>' + x[2] + '</b><span>' + x[3] + '</span></div></div>'; }).join('') + '</div>' +
    pn('emerald', 'key', 'الموظفون', 'من يدخل المنصة، وبأي دور، وبأي صلاحيات', '', table) +
    pn('sapphire', 'shield', 'مصفوفة الصلاحيات حسب الدور', 'ما يستطيعه كل دور افتراضيًا', '', matrix) +
    '<div class="tabs2 polrow" aria-label="سياسة الدخول">' + [['sapphire', 'mail', 'بلا كلمة مرور', 'رمز من ٦ أرقام على البريد في كل دخول'], ['emerald', 'clock', '١٠ دقائق', 'صلاحية رمز الدخول، لمرة واحدة'], ['garnet', 'lock', '٨ محاولات', 'ثم يُقفل الحساب ١٥ دقيقة'], ['gold', 'history', '١٢ ساعة', 'أقصى مدة للجلسة، وتنتهي بعد ساعتين بلا نشاط']]
      .map(function (p) { return '<div class="stat">' + tile(p[0], p[1]) + '<div><b>' + p[2] + '</b><span>' + p[3] + '</span></div></div>'; }).join('') + '</div>';
};
function bytes(b) { return b > 1073741824 ? (b / 1073741824).toFixed(2) + ' غيغابايت' : b > 1048576 ? (b / 1048576).toFixed(1) + ' ميغابايت' : Math.max(1, Math.round(b / 1024)) + ' كيلوبايت'; }
VIEWS.data = function () {
  var h = can('users') ? need('health', function () { return api({ action: 'health' }); }, 60000) : null, b = can('drive') ? need('backups', function () { return api({ action: 'backups' }); }, 60000) : null;
  var H = h && h.data, B = b && b.data, S = H ? H.stats : null;
  var stats = '<div class="tabs2">' + [['sapphire', 'users', S ? S.staff : STAFF.length, 'منسوبًا في قاعدة البيانات'], ['gold', 'file', S ? S.files : '…', 'مرفقًا محفوظًا'], ['emerald', 'archive', S ? S.archived : '…', 'نسخة سابقة مؤرشفة'], ['teal', 'refresh', B ? B.backups.length : S ? S.backups : '…', 'نسخة احتياطية']].map(function (x) { return '<div class="stat">' + tile(x[0], x[1]) + '<div><b>' + x[2] + '</b><span>' + x[3] + '</span></div></div>'; }).join('') + '</div>';
  var where = pn('gold', 'folder', 'أين تُحفظ البيانات', 'على خادم بنيان، لا على أي خدمة خارجية', '', '<div class="pb">' + (S ? kvHTML([['قاعدة البيانات', '<span class="ltr">' + esc(S.db) + '</span> <small class="mu">MySQL</small>'], ['المرفقات والنسخ', '<span class="ltr" style="font-size:13px">' + esc(S.storage) + '</span> <small class="mu">خارج المجلد العام</small>'], ['حجم المرفقات', bytes(S.filesBytes)], ['الخادم', esc(S.server)], ['سجل العمليات', S.audit + ' عملية'], ['الحسابات الإدارية النشطة', S.users]])
    : '<div class="empty">' + (h && h.err ? esc(h.err) : can('users') ? 'جارٍ التحميل…' : 'تفاصيل الخادم لمدير النظام.') + '</div>') +
    '<div class="xrow"><a class="btn goldb" href="api/?action=exportXlsx" download>' + ic('excel') + 'تصدير السجل كاملًا (Excel)</a></div><p class="hint">ملف Excel فيه أوراق المنسوبين والمؤهلات والخبرات واللغات' + (can('audit') ? ' وسجل العمليات' : '') + '. ولتنزيل مرفقات منسوب افتح ملفه واضغط «تنزيل المرفقات».</p></div>');
  var checks = can('users') ? pn('emerald', 'shield', 'صحة النظام', H ? H.checks.filter(function (x) { return x.ok; }).length + ' من ' + H.checks.length + ' سليمة' : '', '<button class="btn sm" data-act="recheck">' + ic('refresh') + 'إعادة الفحص</button>',
    '<div class="pb">' + (H ? '<ul class="hlist">' + H.checks.map(function (x) { return '<li><span class="o ' + (x.ok ? 'y' : 'p') + '">' + ic(x.ok ? 'check' : 'alert') + '</span><div><b>' + esc(x.name) + '</b><span>' + esc(x.note) + '</span></div></li>'; }).join('') + '</ul><p class="hint">الإصدار ' + esc(H.version) + ' · PHP ' + esc(H.php) + '</p>' : '<div class="empty">' + (h.err ? esc(h.err) : 'جارٍ الفحص…') + '</div>') + '</div>') : '';
  var bk = can('drive') ? pn('teal', 'refresh', 'النسخ الاحتياطية', 'نسخة آلية كل ليلة، ويُحفظ آخر ٣٠ نسخة', '', '<div class="pb">' + (B ? (B.backups.length ? '<ul class="bklist">' + B.backups.slice(0, 12).map(function (x) { return '<li>' + ic('archive') + '<div><b class="ltr">' + esc(x.name) + '</b><span>' + esc(x.at) + ' · ' + bytes(x.size) + '</span></div><a class="btn sm" href="api/?action=backupDownload&amp;name=' + encodeURIComponent(x.name) + '" download>' + ic('dl') + 'تنزيل</a></li>'; }).join('') + '</ul>' : '<div class="empty">لا توجد نسخ بعد.</div>') +
    '<p class="hint">مساحة التخزين المستخدمة: ' + bytes(B.storageBytes) + '.</p>' : '<div class="empty">' + (b.err ? esc(b.err) : 'جارٍ التحميل…') + '</div>') + '</div>') : '';
  return stats + '<div class="grid g2">' + where + (checks || bk) + '</div>' + (checks && bk ? bk : '');
};

/* ---------- staff portal ---------- */
function meKV(s) {
  var r = s.r;
  return kvHTML([['الرقم المرجعي', '<span class="ltr">' + esc(s.ref) + '</span>'], ['الاسم كما في الجواز', s.latin ? '<span class="ltr">' + esc(s.latin) + '</span>' : '—'], ['الجهة', esc(s.ent.full || s.ent.n)], ['المسمى', esc(s.job)], ['الإدارة', esc(r.department || '—')],
    ['دولة العمل', esc(s.c.n)], ['تاريخ المباشرة', fdx(s.hire)], ['الجوال', ltr(r.mobile)], ['الواتساب', ltr(r.whatsapp)], ['البريد الرسمي', r.officialEmail ? '<span class="ltr" style="font-size:13.5px">' + esc(r.officialEmail) + '</span>' : '—'],
    ['البريد الشخصي', r.personalEmail ? '<span class="ltr" style="font-size:13.5px">' + esc(r.personalEmail) + '</span>' : '—'], ['الحساب البنكي', s.iban ? '<span class="ltr">' + s.iban + '</span>' : '<span class="pill bad"><i></i>غير مسجل</span>']]);
}
VIEWS.me = function () {
  var s = ME, h = new Date().getHours(), next = s.docs.filter(function (d) { return d.exp; }).sort(function (a, b) { return a.days - b.days; })[0];
  var sum = hijri(new Date()) + '. ' + (s.status === 'مكتمل' ? 'ملفك <b>مكتمل</b>' : 'ينقص ملفك <b>' + nq(s.miss.length, 'أمر واحد', 'أمران', 'أمور', 'أمرًا') + '</b>') + (next ? '، وأقرب وثيقة تنتهي هي <b>' + next.t + '</b> (' + dl(next.days) + ').' : '.');
  var hero = '<section class="hero"><div class="hero-in me-hero"><div><span class="rl"><i></i>' + esc(s.job) + '، ' + esc(s.ent.n) + '</span><h1>' + (h < 12 ? 'صباح الخير' : 'مساء الخير') + ' يا ' + esc(s.name.split(' ')[0]) + '</h1><p class="sum">' + sum + '</p>' +
    '<div class="chips"><a class="chip" href="#myreq-new"><i style="background:#5cdba0"></i>طلب جديد</a><a class="chip" href="update.html?me=1"><i style="background:#e3c485"></i>تحديث بياناتي</a><a class="chip" href="#myfile"><i style="background:#82c8f2"></i>ملفي وبطاقتي</a>' + (s.miss.length ? '<a class="chip" href="update.html?me=1"><i style="background:#ffc966"></i>أكمل النواقص</a>' : '') + '</div></div>' +
    '<div class="cardcol me-card">' + cardHTML(s) + '</div></div></section>';
  var docsOk = s.docs.filter(function (d) { return d.days > 30; }).length;
  var kp = '<div class="grid g4">' + kpi(s.status === 'مكتمل' ? 'emerald' : 'gold', s.status === 'مكتمل' ? 'userok' : 'alert', s.status === 'مكتمل' ? 'مكتمل' : s.miss.length, s.status === 'مكتمل' ? '' : 'نواقص', 'حالة ملفي', s.status === 'مكتمل' ? 'كل البيانات المطلوبة موجودة' : s.miss.slice(0, 2).join('، '), '') +
    kpi('garnet', 'pass', docsOk, 'من ' + s.docs.length, 'وثائق سارية', next ? next.t + ': ' + dl(next.days) : 'لا وثائق بتاريخ انتهاء', '') +
    kpi('teal', 'clock', '<span class="vs">' + svc(s.hire) + '</span>', '', 'مدة الخدمة', s.hire ? 'منذ ' + fd(s.hire) : 'تاريخ المباشرة غير مسجل', '') +
    kpi('sapphire', 'history', '<span class="vs">' + (s.upd ? agoD(s.upd) : '—') + '</span>', '', 'آخر تحديث لبياناتي', '<a class="more" href="update.html?me=1">تحديث الآن' + ic('back') + '</a>', '') + '</div>';
  var docs = pn('garnet', 'pass', 'وثائقي', 'تصلك رسالة من الموارد البشرية قبل انتهاء أي وثيقة', more('ملفي', '#myfile'), '<div class="pb">' + docRows(s.docs, false) + '</div>');
  var miss = pn(s.miss.length ? 'gold' : 'emerald', s.miss.length ? 'alert' : 'check', s.miss.length ? 'ما ينقص ملفي' : 'ملفي مكتمل', '', '', '<div class="pb">' + (s.miss.length ? '<div class="miss">' + s.miss.map(function (m) { return '<div><span>' + m + '</span><a class="btn sm" href="update.html?me=1">أضفه</a></div>'; }).join('') + '</div>' : '<div class="note">' + ic('check') + '<span>شكرًا لك، بياناتك ووثائقك مكتملة. إن تغيّر شيء منها حدّثه من «تحديث بياناتي».</span></div>') + '</div>');
  var data = pn('sapphire', 'user', 'بياناتي الأساسية', '', '<a class="btn sm" href="update.html?me=1">' + ic('edit') + 'تحديث</a>', '<div class="pb">' + meKV(s) + '</div>');
  return hero + kp + '<div class="grid g21">' + docs + miss + '</div>' + data;
};
VIEWS.myfile = function () {
  var s = ME, K = ME.kids || {};
  var qual = (K.quals || []).filter(function (x) { return x.join(''); }), ex = (K.exp || []).filter(function (x) { return x.join(''); }), lg = (K.langs || []).filter(function (x) { return x.join(''); });
  var kids = (qual.length ? '<h3 class="h3s">المؤهلات</h3><ul class="lst" style="padding:0">' + qual.map(function (q) { return '<li>' + tile('amethyst', 'cert') + '<div><b>' + esc([q[0], q[1]].filter(Boolean).join('، ')) + '</b><span class="s">' + esc([q[2], q[3], q[4]].filter(Boolean).join(' · ')) + '</span></div><span></span></li>'; }).join('') + '</ul>' : '') +
    (ex.length ? '<h3 class="h3s">الخبرات</h3><ul class="lst" style="padding:0">' + ex.map(function (q) { return '<li>' + tile('teal', 'building') + '<div><b>' + esc([q[1], q[0]].filter(Boolean).join('، ')) + '</b><span class="s">' + esc([q[2], [q[3], q[4]].filter(Boolean).join(' – ')].filter(Boolean).join(' · ')) + '</span></div><span></span></li>'; }).join('') + '</ul>' : '') +
    (lg.length ? '<h3 class="h3s">اللغات</h3><div class="miss">' + lg.map(function (q) { return '<div><span>' + esc(q[0]) + '</span><b>' + esc(q[1] || '') + '</b></div>'; }).join('') + '</div>' : '');
  return ptitle('ملفي وبطاقتي', 'بياناتك كما هي في سجل المنسوبين. لتعديل أي شيء استخدم «تحديث بياناتي»، وتصل التعديلات إلى الموارد البشرية مباشرة.', '<a class="btn goldb" href="update.html?me=1">' + ic('edit') + 'تحديث بياناتي</a>') +
    '<div class="grid g12"><div class="grid"><div class="pn" style="padding:18px">' + cardHTML(s) + '<div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">' + (window.BonyanApp ? '' : s.card ? '<a class="btn sm" href="' + esc(s.card) + '" download>' + ic('dl') + 'تنزيل بطاقتي</a>' : '') + '</div></div>' +
    (kids ? pn('amethyst', 'cert', 'المؤهلات والخبرات', '', '', '<div class="pb">' + kids + '</div>') : '') + '</div>' +
    pn('sapphire', 'user', 'بياناتي', '', '', '<div class="pb">' + meKV(s) + '</div>') + '</div>' +
    pn('garnet', 'pass', 'وثائقي', '', '', '<div class="pb">' + docRows(s.docs, true) + '</div>');
};

/* ---------- messaging (real send) ---------- */
function fillT(txt, s, L, mode) {
  var d = s.docs.slice().sort(function (a, b) { return a.days - b.days; })[0];
  var DNm = { 'جواز السفر': { en: 'passport', id: 'paspor' }, 'الهوية الوطنية': { en: 'national ID', id: 'KTP' }, 'تصريح العمل': { en: 'work permit', id: 'izin kerja' }, 'الإقامة': { en: 'residence permit', id: 'KITAS / izin tinggal' }, 'العقد': { en: 'contract', id: 'kontrak' } };
  var dnm = !d ? (L === 'ar' ? 'وثيقتك' : L === 'en' ? 'document' : 'dokumen') : L === 'ar' ? d.t : (DNm[d.t] || {})[L] || d.t;
  var when = !d || d.days > 9000 ? (L === 'ar' ? 'تحتاج مراجعة' : L === 'en' ? 'needs review' : 'perlu diperiksa') : L === 'ar' ? (d.days < 0 ? 'انتهت منذ ' + dn(-d.days) : 'تنتهي خلال ' + dn(d.days)) : L === 'en' ? (d.days < 0 ? 'expired ' + (-d.days) + ' days ago' : 'expires in ' + d.days + ' days') : (d.days < 0 ? 'telah habis ' + (-d.days) + ' hari lalu' : 'akan habis dalam ' + d.days + ' hari');
  var miss = s.miss.length ? s.miss.join('، ') : (L === 'ar' ? 'بعض البيانات' : L === 'en' ? 'some details' : 'beberapa data');
  var link = !(CMP && CMP.link) ? '' : mode === 'mail' ? '{link}' : mode === 'wa' ? siteURL() + 'update.html' : siteURL() + 'update.html?k=•••';
  return txt.replace(/\{name\}/g, s.name.split(' ')[0]).replace(/\{ref\}/g, s.ref).replace(/\{doc\}/g, dnm).replace(/\{when\}/g, when).replace(/\{missing\}/g, miss).replace(/\{link\}/g, link).replace(/\n{3,}/g, '\n\n');
}
function sendText(s, mode) { var L = CMP.L === 'auto' ? langOf(s) : CMP.L; return { subj: fillT(CMP.subj, s, L, mode), body: fillT(CMP.body, s, L, mode), L: L }; }
function msgTpl(refs, tpl) { msgOpen(refs); if (CMP && tpl) { CMP.tpl = tpl; loadT(); drawMsg(); } }
function realSend(el, s, ch, bulk) {
  var list = CMP.list.slice(), btn = document.getElementById('msgSend'), ok = 0, fail = [];
  if (ch === 'wa') { var R = sendText(s, 'wa'); api({ action: 'messageWa', ref: s.ref, subject: R.subj || R.body.split('\n')[0], body: R.body }).catch(function () { }); delete CACHE['msg:' + s.ref]; toast('فُتح واتساب بالرسالة، وسُجّلت في ملف المنسوب'); el.remove(); CMP = null; softRender(); return; }
  var noMail = list.filter(function (x) { return !x.mail; });
  list = list.filter(function (x) { return x.mail; });
  if (!list.length) { toast('لا يوجد بريد إلكتروني مسجّل' + (bulk ? ' لهؤلاء المنسوبين' : ' لهذا المنسوب')); return; }
  if (btn) { btn.setAttribute('aria-disabled', 'true'); btn.style.pointerEvents = 'none'; }
  var items = list.map(function (x) { return { x: x, R: sendText(x, 'mail') }; });
  if (ch === 'both') { var W = sendText(s, 'wa'); api({ action: 'messageWa', ref: s.ref, subject: W.subj, body: W.body }).catch(function () { }); }
  var i = 0;
  (function next() {
    if (i >= items.length) {
      items.forEach(function (it) { delete CACHE['msg:' + it.x.ref]; delete CACHE['aud:' + it.x.ref]; }); delete CACHE.audit;
      el.remove(); CMP = null; softRender();
      toast(fail.length ? 'أُرسل ' + ok + ' وتعذّر ' + fail.length + (fail[0] ? ' (' + fail[0] + ')' : '') : bulk ? 'أُرسل البريد إلى ' + ok + ' منسوبين، كلٌّ بلغته' + (noMail.length ? '، و' + noMail.length + ' بلا بريد مسجّل' : '') : 'أُرسل البريد إلى ' + list[0].mail + (ch === 'both' ? '، وفُتح واتساب' : ''));
      return;
    }
    var it = items[i++]; if (btn) btn.lastChild.textContent = 'جارٍ الإرسال… ' + i + ' من ' + items.length;
    api({ action: 'message', ref: it.x.ref, subject: it.R.subj, body: it.R.body, lang: it.R.L }).then(function () { ok++; }).catch(function (e) { fail.push(errText(e)); if (/انتهت الجلسة/.test(errText(e))) i = items.length; }).then(next);
  })();
}

/* ---------- actions ---------- */
function dlLink(href) { var a = document.createElement('a'); a.href = href; a.download = ''; document.body.appendChild(a); a.click(); setTimeout(function () { a.remove(); }, 500); }
function copyText(t) {
  if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(t);
  return new Promise(function (res, rej) { var ta = document.createElement('textarea'); ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy') ? res() : rej(); } catch (e) { rej(e); } ta.remove(); });
}
function doAct(a, el) {
  if (a === 'excel') { dlLink(API + '?action=exportXlsx'); toast('جارٍ تجهيز ملف Excel، وسيُنزَّل خلال لحظات'); return; }
  if (a === 'regLink' || a === 'invite') { var u = regURL(); copyText(u).then(function () { toast('نُسخ رابط التسجيل: ' + u); }, function () { toast('رابط التسجيل: ' + u); }); return; }
  if (a === 'msgGap') { var G = STAFF.filter(function (s) { return s.status === 'ناقص'; }); if (!G.length) { toast('لا توجد ملفات ناقصة'); return; } msgTpl(G.map(function (s) { return s.ref; }), 'gap'); return; }
  if (a === 'remindAll') {
    var L = STAFF.filter(function (s) { return s.worst < 0; }); if (!L.length) L = STAFF.filter(function (s) { return s.worst <= 30; });
    if (!L.length) { toast('لا توجد وثائق منتهية أو قريبة من الانتهاء'); return; }
    msgTpl(L.map(function (s) { return s.ref; }), 'docs'); return;
  }
  if (a === 'backupNow') { el.disabled = true; api({ action: 'backupNow' }).then(function (j) { seed('backups', j); delete CACHE.health; toast('أُنشئت نسخة احتياطية جديدة: ' + (j.backups[0] ? j.backups[0].name : '')); softRender(); }).catch(function (e) { el.disabled = false; toast(errText(e)); }); return; }
  if (a === 'health') { location.hash = 'data'; return; }
  if (a === 'recheck') { delete CACHE.health; softRender(); return; }
  if (a === 'selfUpdate') { location.href = 'update.html?me=1'; return; }
  if (a === 'acctNew') { if (CACHE.users && CACHE.users.data) acctOpen(0); else { api({ action: 'usersList' }).then(function (j) { seed('users', j); acctOpen(0); }).catch(function (e) { toast(errText(e)); }); } return; }
  toast('تم');
}
function saveUser(id, patch) {
  var c = CACHE.users, u = c && c.data ? c.data.users.filter(function (x) { return x.id === id; })[0] : null; if (!u) return;
  var b = { action: 'usersSave', id: u.id, email: u.email, name: u.name, title: u.title, role: u.role, active: u.active, notify: u.notify };
  Object.keys(patch).forEach(function (k) { b[k] = patch[k]; });
  return api(b).then(function (j) { seed('users', j); softRender(); toast('حُفظ التغيير وسُجّل باسمك'); }).catch(function (e) { toast(errText(e)); softRender(); });
}
function bindLive() {
  var $ = function (s) { return app.querySelector(s); }, all = function (s, f) { app.querySelectorAll(s).forEach(f); };
  all('[data-msggap]', function (el) { el.onclick = function (e) { e.stopPropagation(); msgTpl([el.dataset.msggap], 'gap'); }; });
  all('[data-msgdoc]', function (el) { el.onclick = function (e) { e.stopPropagation(); msgTpl([el.dataset.msgdoc], 'docs'); }; });
  all('[data-msgbank]', function (el) { el.onclick = function (e) { e.stopPropagation(); msgTpl([el.dataset.msgbank], 'gap'); }; });
  all('[data-unotify]', function (el) { el.onclick = function () { el.setAttribute('aria-checked', el.getAttribute('aria-checked') !== 'true'); saveUser(+el.dataset.unotify, { notify: el.getAttribute('aria-checked') === 'true' }); }; });
  all('[data-urole]', function (el) { el.onchange = function () { saveUser(+el.dataset.urole, { role: el.value, perms: null }); }; });
  all('[data-uact]', function (el) { el.onclick = function () {
    var id = +el.dataset.id, a = el.dataset.uact; el.disabled = true;
    if (a === 'unlock') api({ action: 'usersUnlock', id: id }).then(function (j) { seed('users', j); softRender(); toast('فُك القفل'); }).catch(function (e) { toast(errText(e)); el.disabled = false; });
    else if (a === 'kick') api({ action: 'sessionsRevoke', id: id }).then(function () { toast('أُنهيت كل جلسات هذا الحساب'); el.disabled = false; }).catch(function (e) { toast(errText(e)); el.disabled = false; });
    else if (a === 'toggle') { var u = CACHE.users.data.users.filter(function (x) { return x.id === id; })[0]; saveUser(id, { active: !u.active }); }
  }; });
  mountCards();
  document.querySelectorAll('.offcard .idcard-wrap').forEach(function (w) { w.onclick = function (e) { var c = w.querySelector('.idcard'); if (c) c.classList.toggle('flipped'); }; w.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); w.onclick(); } }; });
  document.querySelectorAll('[data-cardflip]').forEach(function (el) { el.onclick = function () { var c = el.closest('.offcard').querySelector('.idcard'); if (c) c.classList.toggle('flipped'); }; });
  document.querySelectorAll('[data-cardpng]').forEach(function (el) { el.onclick = function () { var s = byRef(el.dataset.cardpng) || ME; if (s) cardPng(s, el); }; });
  all('[data-copyref]', function (el) { el.onclick = function () { copyText(el.dataset.copyref).then(function () { toast('نُسخ الرقم المرجعي'); }, function () {}); var d = el.closest('details'); if (d) d.removeAttribute('open'); }; });
  all('[data-rwref]', function (el) { el.addEventListener('click', function () { RW = { i: 0, type: '', ref: el.dataset.rwref, d: {}, busy: false, err: '' }; TAB.reqs = 'new'; }); });
  all('[data-full]', function (el) { el.onclick = function (e) { e.stopPropagation(); openFull(el.dataset.full, !!el.dataset.fedit); }; });
  all('[data-acedit]', function (el) { el.onclick = function () { acctOpen(+el.dataset.acedit); }; });
  var aq = $('#acq'); if (aq) aq.oninput = function () { ACQ = aq.value; softRender(); };
  document.querySelectorAll('[data-bnqa]').forEach(function (el) { el.onclick = function (e) { e.stopPropagation(); window.scrollTo(0, 0); setTimeout(function () { var b = document.getElementById('qaBtn'); if (b) b.click(); }, 60); }; });
  var au = $('#addUser2'); if (au) au.onsubmit = function (e) {
    e.preventDefault(); var nm = $('#nuName').value.trim(), ml = $('#nuMail').value.trim().toLowerCase();
    if (!nm || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(ml)) { toast('اكتب الاسم وبريدًا صحيحًا'); return; }
    api({ action: 'usersSave', name: nm, email: ml, title: $('#nuTitle').value.trim(), role: $('#nuRole').value }).then(function (j) { seed('users', j); softRender(); toast('أُضيف الحساب، ويدخل صاحبه ببريده ' + ml); }).catch(function (er) { toast(errText(er)); });
  };
  var lq = $('#lgq'); if (lq) lq.oninput = function () { LOGF.q = lq.value; softRender(); };
  var ln = $('#lgnoise'); if (ln) ln.onchange = function () { LOGF.noise = ln.checked; softRender(); };
  var th = $('#theme'); if (th) th.addEventListener('click', function () { try { localStorage.setItem('bonyan-hr-theme', document.documentElement.getAttribute('data-theme')); } catch (e) { } });
}

/* أيقونات إضافية لشريط التصفية والقوائم */
P.x = '<path d="M6 6l12 12M18 6 6 18"/>';
P.dots = '<circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none"/>';
P.sort = '<path d="M7 4v16m0 0-3-3m3 3 3-3M17 20V4m0 0-3 3m3-3 3 3"/>';
P.filter = '<path d="M4 5h16l-6 7.5V19l-4 1.5v-8z"/>';
P.gift = '<path d="M4 11h16v9H4zM3 7h18v4H3zM12 7v13M12 7c-1.5-3-5-3.5-5-1.2C7 7 9.5 7 12 7Zm0 0c1.5-3 5-3.5 5-1.2C17 7 14.5 7 12 7Z"/>';
P.copy = '<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8"/>';
P.phone = '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>';
/* ---------- smart select: search inside the list, groups, descriptions, counts ---------- */
var SSEL = {};
function ssel(id, opts, val, ph, onPick, label, pre) {
  SSEL[id] = { opts: opts, onPick: onPick };
  var cur = opts.filter(function (o) { return o.v === val; })[0], on = !!(cur && cur.v);
  /* pre: عنوان صغير داخل الزر (نمط شريط التصفية) — «الجهة · الكل» */
  return '<div class="ssel' + (pre ? ' fsel' : '') + (pre && on ? ' on' : '') + '" data-ss="' + id + '"><button type="button" class="ss-btn" id="' + id + '" aria-haspopup="listbox" aria-expanded="false" aria-label="' + esc(label || ph) + '">' +
    (pre ? '<small class="pre">' + esc(pre) + '</small>' : '') + (cur && cur.c ? '<i class="dot" style="background:' + cur.c + '"></i>' : '') + '<span class="' + (on ? '' : 'ph') + '">' + esc(cur ? cur.n : ph) + '</span>' + ic('chev') + '</button></div>';
}
/* ---------- شريط التصفية الموحّد: بحث + قوائم + شرائح المرشحات النشطة ---------- */
function fsearch(id, val, ph, label) {
  return '<label class="fsearch">' + ic('search') + '<input id="' + id + '" type="search" placeholder="' + esc(ph) + '" value="' + esc(val || '') + '" aria-label="' + esc(label || ph) + '" autocomplete="off"></label>';
}
var FCLR = {};
function fchips(list) {
  /* list: [[نص الشريحة, دالة المسح]] */
  FCLR = {}; var on = list.filter(function (x) { return x && x[0]; });
  if (!on.length) return '';
  return '<div class="fchips" aria-label="المرشحات المطبقة">' + on.map(function (x, i) { FCLR[i] = x[1]; return '<button type="button" class="fchip" data-fclr="' + i + '" aria-label="إزالة مرشح ' + esc(x[0]) + '">' + esc(x[0]) + ic('x') + '</button>'; }).join('') +
    (on.length > 1 ? '<button type="button" class="fclear" data-fclr="all">مسح الكل</button>' : '') + '</div>';
}
document.addEventListener('click', function (e) {
  var b = e.target.closest && e.target.closest('[data-fclr]'); if (!b) return;
  if (b.dataset.fclr === 'all') Object.keys(FCLR).forEach(function (k) { FCLR[k](); }); else if (FCLR[b.dataset.fclr]) FCLR[b.dataset.fclr]();
  render();
});
/* قائمة «المزيد» المنسدلة (details) تُغلق عند النقر خارجها أو Escape */
document.addEventListener('click', function (e) { document.querySelectorAll('details.dmenu[open]').forEach(function (d) { if (!d.contains(e.target)) d.removeAttribute('open'); }); });
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') document.querySelectorAll('details.dmenu[open]').forEach(function (d) { d.removeAttribute('open'); var s = d.querySelector('summary'); if (s) s.focus(); }); });
function ssOpen(box) {
  ssClose();
  var id = box.dataset.ss, S = SSEL[id]; if (!S) return;
  var btn = box.querySelector('.ss-btn'), pop = document.createElement('div'), many = S.opts.length > 7;
  pop.className = 'ss-pop'; pop.setAttribute('role', 'listbox');
  pop.innerHTML = (many ? '<div class="ss-q">' + ic('search') + '<input type="search" placeholder="ابحث في القائمة" aria-label="ابحث في القائمة"></div>' : '') + '<div class="ss-list"></div>';
  box.appendChild(pop); btn.setAttribute('aria-expanded', 'true'); box.classList.add('open');
  var list = pop.querySelector('.ss-list'), q = pop.querySelector('input'), act = -1;
  function draw() {
    var t = q ? q.value.trim().toLowerCase() : '', g = null, h = '', items = S.opts.filter(function (o) { return !t || (o.n + ' ' + (o.d || '') + ' ' + o.v).toLowerCase().indexOf(t) >= 0; });
    items.forEach(function (o, i) {
      if (o.g && o.g !== g) { h += '<div class="ss-g">' + esc(o.g) + '</div>'; g = o.g; }
      h += '<button type="button" role="option" class="ss-o' + (i === act ? ' act' : '') + '" data-i="' + S.opts.indexOf(o) + '" aria-selected="' + (btn.textContent === o.n) + '">' + (o.c ? '<i class="dot" style="background:' + o.c + '"></i>' : o.ic ? ic(o.ic) : '') +
        '<span><b>' + esc(o.n) + '</b>' + (o.d ? '<small>' + esc(o.d) + '</small>' : '') + '</span>' + (o.k != null ? '<em>' + o.k + '</em>' : '') + '</button>';
    });
    list.innerHTML = h || '<div class="ss-none">لا نتائج</div>';
    list.querySelectorAll('.ss-o').forEach(function (b) { b.onmousedown = function (e) { e.preventDefault(); pick(+b.dataset.i); }; });
    return items;
  }
  function pick(i) { var o = S.opts[i]; ssClose(); if (S.onPick) S.onPick(o.v, o); }
  var items = draw();
  if (q) { q.focus(); q.oninput = function () { act = -1; items = draw(); }; }
  else { var f = list.querySelector('.ss-o'); if (f) f.focus(); }
  pop.onkeydown = function (e) {
    var os = list.querySelectorAll('.ss-o');
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); act = Math.max(0, Math.min(os.length - 1, act + (e.key === 'ArrowDown' ? 1 : -1))); os.forEach(function (b, k) { b.classList.toggle('act', k === act); }); if (os[act]) { os[act].scrollIntoView({ block: 'nearest' }); if (!q) os[act].focus(); } }
    else if (e.key === 'Enter') { e.preventDefault(); var b = os[act >= 0 ? act : 0]; if (b) pick(+b.dataset.i); }
    else if (e.key === 'Escape') { e.preventDefault(); ssClose(); btn.focus(); }
  };
}
function ssClose() { document.querySelectorAll('.ssel.open').forEach(function (b) { b.classList.remove('open'); var p = b.querySelector('.ss-pop'); if (p) p.remove(); var t = b.querySelector('.ss-btn'); if (t) t.setAttribute('aria-expanded', 'false'); }); }
document.addEventListener('click', function (e) {
  var b = e.target.closest && e.target.closest('.ss-btn');
  if (b) { var box = b.parentNode; if (box.classList.contains('open')) ssClose(); else ssOpen(box); return; }
  if (!e.target.closest || !e.target.closest('.ss-pop')) ssClose();
  var qb = e.target.closest && e.target.closest('#qaBtn'), qm = document.getElementById('qaMenu');
  if (qb && qm) { var open = qm.hidden; qm.hidden = !open; qb.setAttribute('aria-expanded', open); if (open) { var f = qm.querySelector('a,button'); if (f) f.focus(); } return; }
  if (qm && !qm.hidden && !e.target.closest('.qawrap')) { qm.hidden = true; document.getElementById('qaBtn').setAttribute('aria-expanded', 'false'); }
  if (qm && !qm.hidden && e.target.closest('#qaMenu a, #qaMenu button')) { qm.hidden = true; }
}, true);
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { ssClose(); var qm = document.getElementById('qaMenu'); if (qm && !qm.hidden) { qm.hidden = true; var b = document.getElementById('qaBtn'); b.setAttribute('aria-expanded', 'false'); b.focus(); } var ac = document.getElementById('acctLayer'); if (ac) ac.remove(); } });
function entOpts(withAll, counts) { return (withAll ? [{ v: '', n: 'كل الجهات', ic: 'building' }] : []).concat(ENT.map(function (e) { return { v: e.v, n: e.n, d: e.full && e.full !== e.n ? e.full : '', c: e.c, k: counts ? STAFF.filter(function (s) { return s.ent.v === e.v; }).length : null }; })); }
function ctryOpts() { return [{ v: '', n: 'كل الدول', ic: 'globe' }].concat(CTRY.map(function (c) { return { v: c.cc, n: c.n, d: c.cc, k: STAFF.filter(function (s) { return s.c.cc === c.cc; }).length }; })); }

/* ---------- quick actions (one place for every action) ---------- */
function qaMenuHTML() {
  var G = [];
  G.push(['المنسوبون', 'users', 'sapphire', [['#people', 'all', 'دليل المنسوبين', 'الملفات والبطاقات والوثائق', 'users'], ['#people', 'gap', 'الملفات الناقصة', CNT.gap + ' ملفًا ينقصه شيء', 'alert'], ['act:regLink', '', 'نسخ رابط التسجيل', 'لإرساله إلى منسوب جديد', 'plus']].concat(can('mail') ? [['act:msgGap', '', 'مراسلة الناقصة ملفاتهم', 'طلب استكمال بلغة كل منسوب', 'chat']] : [])]);
  G.push(['الطلبات', 'stamp', 'amethyst', [['#reqs-pend', '', 'بانتظار اعتمادي', reqPendingForMe().length + ' طلبًا ينتظر قرارك', 'stamp'], ['#reqs-all', '', 'كل الطلبات', 'إجازات وإركاب وتعريفات', 'doc']].concat(can('edit') ? [['#reqs-new', '', 'طلب نيابة عن منسوب', 'تقدّمه الموارد البشرية عنه', 'plus']] : [])]);
  G.push(['الوثائق', 'pass', 'garnet', [['#documents', 'bad', 'الوثائق المنتهية', CNT.exp + ' منسوبًا', 'alert'], ['#documents', 'warn', 'تنتهي خلال ٣٠ يومًا', CNT.soon + ' منسوبًا', 'clock']].concat(can('mail') ? [['act:remindAll', '', 'تذكير أصحابها', 'رسالة بلغة كل منسوب', 'send']] : [])]);
  G.push(['التقارير', 'chart', 'gold', [['act:excel', '', 'تصدير Excel', 'السجل كاملًا في ملف واحد', 'excel']].concat(can('pay') ? [['#payroll', '', 'الرواتب', 'حسب الجهة والعملة', 'wallet']] : []).concat(can('audit') ? [['#log', '', 'سجل العمليات', 'من فعل ماذا ومتى', 'history']] : [])]);
  var sys = [];
  if (can('users')) sys.push(['act:acctNew', '', 'إضافة موظف', 'حساب جديد بصلاحيات محددة', 'key'], ['#accounts', '', 'الموظفون والصلاحيات', 'الأدوار وتخصيص الصلاحيات', 'shield']);
  if (can('drive')) sys.push(['act:backupNow', '', 'نسخة احتياطية الآن', 'تُحفظ على الخادم', 'refresh']);
  if (can('users')) sys.push(['#data', '', 'صحة النظام والبيانات', 'أين تُحفظ وكيف تُستخرج', 'folder']);
  if (sys.length) G.push(['النظام', 'shield', 'teal', sys]);
  return '<div class="qamenu" id="qaMenu" hidden role="menu" aria-label="إجراءات سريعة">' + G.map(function (g) {
    return '<section><h3>' + tile(g[2], g[1]) + g[0] + '</h3>' + g[3].map(function (x) {
      var inner = ic(x[4]) + '<span><b>' + x[2] + '</b><small>' + x[3] + '</small></span>';
      return x[0].indexOf('act:') === 0 ? '<button type="button" role="menuitem" data-act="' + x[0].slice(4) + '">' + inner + '</button>' : '<a role="menuitem" href="' + x[0] + '"' + (x[1] ? (x[0] === '#people' ? ' data-f="' : ' data-bk="') + x[1] + '"' : '') + '>' + inner + '</a>';
    }).join('') + '</section>'; }).join('') + '</div>';
}
function bnavHTML() {
  var L = role === 'staff' ? [['#me', 'صفحتي', 'grid', 'me'], ['#myreq', 'طلباتي', 'doc', 'myreq'], ['#myfile', 'ملفي', 'card', 'myfile'], ['update.html?me=1', 'تحديث', 'edit', '']]
    : [['#home', 'الرئيسية', 'grid', 'home'], ['#people', 'المنسوبون', 'users', 'people'], ['#reqs', 'الطلبات', 'stamp', 'reqs']].concat(can('sys') ? [['#system', 'النظام', 'shield', 'system']] : []);
  return '<nav class="bnav" aria-label="التنقل السريع">' + L.map(function (x) { return '<a href="' + x[0] + '"' + (x[3] && view === x[3] ? ' aria-current="page"' : '') + '>' + ic(x[2]) + '<span>' + x[1] + '</span></a>'; }).join('') +
    '</nav>';
}

/* ---------- staff (admin accounts) & permissions editor ---------- */
var ROLE_INFO = {
  admin: ['amethyst', 'key', 'كل الصلاحيات، ومنها إدارة الحسابات والنسخ الاحتياطية'],
  hr: ['emerald', 'users', 'عرض بيانات المنسوبين وتعديلها ومرفقاتهم ومراسلتهم والرواتب والسجل'],
  ceo: ['sapphire', 'eye', 'اطلاع كامل على البيانات والرواتب والسجل دون تعديل'],
  viewer: ['slate', 'eye', 'عرض بيانات المنسوبين فقط، دون الرواتب ودون تعديل']
};
var PERM_GROUPS = [['بيانات المنسوبين', [['staff.view', 'عرض الملفات والوثائق'], ['staff.edit', 'تعديل البيانات'], ['staff.files', 'رفع المرفقات واستبدالها']]], ['التواصل', [['staff.mail', 'مراسلة المنسوبين بالبريد وواتساب']]],
  ['المالية', [['finance.view', 'الرواتب والحسابات البنكية']]], ['الطلبات', [['requests.approve', 'اعتماد طلبات المنسوبين']]], ['الرقابة', [['audit.view', 'سجل العمليات']]], ['الإدارة', [['users.manage', 'إدارة الحسابات والصلاحيات'], ['backup.run', 'النسخ الاحتياطي والتصدير الكامل']]]];
var TITLE_SUGG = ['مدير الموارد البشرية', 'أخصائي موارد بشرية', 'أخصائية موارد بشرية', 'محاسب الرواتب', 'مشرف جهة', 'مدقق داخلي', 'مساعد إداري', 'مدير تنفيذي'];
function samePerms(a, b) { return a.slice().sort().join() === b.slice().sort().join(); }
var AC = null;
function acctOpen(id) {
  var d = CACHE.users && CACHE.users.data; if (!d) { toast('جارٍ تحميل الحسابات، حاول بعد لحظة'); return; }
  var u = id ? d.users.filter(function (x) { return x.id === id; })[0] : null;
  var rp = d.rolePerms || {};
  AC = { id: u ? u.id : 0, name: u ? u.name : '', email: u ? u.email : '', title: u ? u.title : '', role: u ? u.role : 'viewer', active: u ? u.active : true, notify: u ? !!u.notify : false, self: !!(u && SESSION && u.id === SESSION.id) };
  AC.custom = u ? !samePerms(u.perms, rp[u.role] || []) : false; AC.perms = u ? u.perms.slice() : (rp.viewer || []).slice();
  drawAcct();
}
function drawAcct() {
  var old = document.getElementById('acctLayer'); if (old) old.remove();
  var d = CACHE.users.data, roles = d.roles || {}, rp = d.rolePerms || {}, eff = AC.custom ? AC.perms : (rp[AC.role] || []);
  var el = document.createElement('div'); el.id = 'acctLayer';
  el.innerHTML = '<div class="mscrim" data-aclose="1"></div><section class="mdl acct" role="dialog" aria-modal="true" aria-labelledby="acT"><header class="mh">' + tile('emerald', 'key') + '<div><h2 id="acT">' + (AC.id ? 'تعديل حساب موظف' : 'إضافة موظف') + '</h2><p>يدخل صاحبه ببريده، ويصله رمز دخول في كل مرة</p></div><button class="ib mx" data-aclose="1" aria-label="إغلاق">' + ic('plus') + '</button></header>' +
    '<div class="abody"><section class="ast"><h3><i>١</i>بيانات الموظف</h3><div class="form"><div class="fld"><label for="acName">الاسم</label><input id="acName" value="' + esc(AC.name) + '" placeholder="مثال: أ. سارة العتيبي" autocomplete="off"></div>' +
    '<div class="fld"><label for="acMail">البريد الإلكتروني</label><input id="acMail" class="ltr" style="text-align:left" type="email" value="' + esc(AC.email) + '" placeholder="name@bonyanglobal.com" autocomplete="off"></div>' +
    '<div class="fld wide"><label for="acTitle">المسمى</label>' + ssel('acTitleSel', [{ v: '', n: 'اكتب مسمى أو اختر من القائمة', ic: 'edit' }].concat(TITLE_SUGG.map(function (t) { return { v: t, n: t }; })), '', 'اختر مسمى شائعًا', function (v) { if (v) { document.getElementById('acTitle').value = v; } }, 'مسميات شائعة') +
    '<input id="acTitle" value="' + esc(AC.title) + '" placeholder="أو اكتبه هنا"></div></div></section>' +
    '<section class="ast"><h3><i>٢</i>الدور</h3><div class="rcards" role="radiogroup" aria-label="الدور">' + Object.keys(roles).map(function (k) { var R = ROLE_INFO[k] || ['slate', 'user', ''];
      return '<button type="button" role="radio" class="rcard" data-acrole="' + k + '" aria-checked="' + (AC.role === k) + '"' + (AC.self ? ' disabled' : '') + '>' + tile(R[0], R[1]) + '<span><b>' + esc(roles[k]) + '</b><small>' + R[2] + '</small><em>' + (rp[k] || []).length + ' صلاحيات</em></span><i class="rc-ck">' + ic('check') + '</i></button>'; }).join('') + '</div>' + (AC.self ? '<p class="hint">لا يمكنك تغيير دور حسابك.</p>' : '') + '</section>' +
    '<section class="ast"><h3><i>٣</i>الصلاحيات</h3><label class="tgl"><button type="button" class="sw" role="switch" id="acCustom" aria-checked="' + AC.custom + '"' + (AC.self ? ' disabled' : '') + '></button><span><b>تخصيص صلاحيات هذا الحساب</b><small>' + (AC.custom ? 'الصلاحيات أدناه خاصة بهذا الموظف' : 'يأخذ صلاحيات دوره تلقائيًا، وتتحدث إن تغيّر الدور') + '</small></span></label>' +
    '<div class="pgroups">' + PERM_GROUPS.map(function (g) { return '<div class="pg"><h4>' + g[0] + '</h4>' + g[1].map(function (p) { var on = eff.indexOf(p[0]) > -1;
      return '<label class="pchk' + (AC.custom ? '' : ' ro') + '"><input type="checkbox" data-acperm="' + p[0] + '"' + (on ? ' checked' : '') + (AC.custom ? '' : ' disabled') + '><span>' + p[1] + '</span></label>'; }).join('') + '</div>'; }).join('') + '</div></section>' +
    '<section class="ast"><h3><i>٤</i>الحالة والتنبيهات</h3><label class="tgl"><button type="button" class="sw" role="switch" id="acNotify" aria-checked="' + AC.notify + '"></button><span><b>تصله تنبيهات التسجيل الجديد</b><small>نسخة من تنبيه كل تسجيل جديد والقائمة الأسبوعية للوثائق</small></span></label>' +
    '<label class="tgl"><button type="button" class="sw" role="switch" id="acActive" aria-checked="' + AC.active + '"' + (AC.self ? ' disabled' : '') + '></button><span><b>الحساب مفعّل</b><small>إيقافه يُنهي جلساته فورًا ويمنعه من الدخول</small></span></label></section></div>' +
    '<footer class="mf"><span class="lerr" id="acErr" role="alert"></span><button class="btn" data-aclose="1">إلغاء</button><button class="btn goldb" id="acSave">' + ic('check') + (AC.id ? 'حفظ التعديلات' : 'إضافة الموظف') + '</button></footer></section>';
  document.body.appendChild(el);
  var $ = function (i) { return document.getElementById(i); };
  function sync() { AC.name = $('acName').value; AC.email = $('acMail').value; AC.title = $('acTitle').value; }
  el.querySelectorAll('[data-aclose]').forEach(function (b) { b.onclick = function () { el.remove(); AC = null; }; });
  el.querySelectorAll('[data-acrole]').forEach(function (b) { b.onclick = function () { sync(); AC.role = b.dataset.acrole; if (!AC.custom) AC.perms = (rp[AC.role] || []).slice(); drawAcct(); var r = document.querySelector('[data-acrole="' + AC.role + '"]'); if (r) r.focus(); }; });
  $('acCustom').onclick = function () { sync(); AC.custom = !AC.custom; if (AC.custom) AC.perms = (rp[AC.role] || []).slice(); drawAcct(); $('acCustom').focus(); };
  $('acNotify').onclick = function () { AC.notify = !AC.notify; this.setAttribute('aria-checked', AC.notify); };
  $('acActive').onclick = function () { AC.active = !AC.active; this.setAttribute('aria-checked', AC.active); };
  el.querySelectorAll('[data-acperm]').forEach(function (c) { c.onchange = function () { var k = c.dataset.acperm; AC.perms = AC.perms.filter(function (x) { return x !== k; }); if (c.checked) AC.perms.push(k); }; });
  $('acSave').onclick = function () {
    sync(); var err = $('acErr'), ml = AC.email.trim().toLowerCase();
    if (!AC.name.trim()) { err.textContent = 'اكتب اسم الموظف.'; $('acName').focus(); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(ml)) { err.textContent = ERR.bad_email; $('acMail').focus(); return; }
    if (AC.custom && !AC.perms.length) { err.textContent = 'اختر صلاحية واحدة على الأقل.'; return; }
    var b = { action: 'usersSave', name: AC.name.trim(), email: ml, title: AC.title.trim(), role: AC.role, active: AC.active, notify: AC.notify, perms: AC.custom ? AC.perms : null };
    if (AC.id) b.id = AC.id;
    this.disabled = true; err.textContent = '';
    var btn = this;
    api(b).then(function (j) { seed('users', j); el.remove(); var nw = !AC.id; AC = null; softRender(); toast(nw ? 'أُضيف الموظف، ويدخل ببريده ' + ml : 'حُفظت التعديلات وسُجّلت باسمك'); })
      .catch(function (e) { btn.disabled = false; err.textContent = errText(e); });
  };
  setTimeout(function () { $('acName').focus(); }, 30);
}

/* ======================================================================
   Requests (leave · travel · salary letter) and the new sidebar
   ====================================================================== */
TITLES.reqs = ['الطلبات']; TITLES.myreq = ['طلباتي'];
STAFF_VIEWS.push('myreq');
TAB.reqs = 'pend'; TAB.myreq = 'list';
TABL.reqs = { pend: 'بانتظار اعتمادي', all: 'كل الطلبات', 'new': 'طلب نيابة عن منسوب', forms: 'النماذج الإدارية' };
TABL.myreq = { list: 'طلباتي', 'new': 'طلب جديد' };
ALIAS['reqs-pend'] = ['reqs', 'pend']; ALIAS['reqs-all'] = ['reqs', 'all']; ALIAS['reqs-new'] = ['reqs', 'new']; ALIAS.forms = ['reqs', 'forms'];
ALIAS['myreq-new'] = ['myreq', 'new']; ALIAS['myreq-list'] = ['myreq', 'list']; ALIAS.gaps = ['people', 'dir', 'gap']; ALIAS.expired = ['people', 'dir', 'exp'];

var RT2 = { leave: ['emerald', 'umbrella', 'إجازة', 'LV'], travel: ['amethyst', 'plane', 'أمر إركاب', 'TR'], cert: ['gold', 'cert', 'تعريف بالراتب', 'CR'] };
var RST = { pending: ['warn', 'قيد الإجراء'], approved: ['ok', 'معتمد'], rejected: ['bad', 'مرفوض'], cancelled: ['mute', 'ملغى'] };
function reqRows() { var c = need('reqs', function () { return api({ action: 'reqList' }).then(function (j) { return j.rows; }); }, 60000); return c.data || []; }
function reqPendingForMe() { return reqRows().filter(function (r) { return r.canDecide; }); }
function reqByNo(no) { return reqRows().filter(function (r) { return r.no === no; })[0]; }
function reqSum(r) {
  var d = r.data || {};
  if (r.type === 'leave') return 'إجازة ' + (d.kind || '') + '، ' + dn(d.days || 0);
  if (r.type === 'travel') return 'إلى ' + (d.dest || '') + '، ' + dn(d.days || 0);
  return (d.kind || '') + ' إلى ' + (d.to || '');
}
function reqDates(r) { var d = r.data || {}; return d.from ? fdx(pdate(d.from), { day: 'numeric', month: 'short' }) + (d.to && d.to !== d.from ? ' – ' + fdx(pdate(d.to), { day: 'numeric', month: 'short', year: 'numeric' }) : '') : ''; }
function reqPill(r) { var s = RST[r.status] || ['mute', r.statusName]; var at = r.status === 'pending' && r.chain[r.stage] ? 'عند ' + r.chain[r.stage].label : s[1]; return '<span class="pill ' + s[0] + '"><i></i>' + esc(at) + '</span>'; }
function reqTrail(r) {
  var steps = [{ l: 'تقديم الطلب', st: 'done' }].concat(r.chain.map(function (c, i) { return { l: c.label, st: c.decision === 'approve' ? 'done' : c.decision === 'reject' ? 'x' : r.status === 'pending' && i === r.stage ? 'now' : '' }; }));
  steps.push({ l: r.status === 'approved' ? 'معتمد' : r.status === 'rejected' ? 'مرفوض' : r.status === 'cancelled' ? 'ملغى' : 'القرار', st: r.status === 'approved' ? 'done' : r.status === 'rejected' || r.status === 'cancelled' ? 'x' : '' });
  return '<ol class="stg">' + steps.map(function (s, i) { return '<li class="' + s.st + '"><i>' + (s.st === 'done' ? ic('check') : s.st === 'x' ? '×' : i + 1) + '</i><span>' + esc(s.l) + '</span></li>'; }).join('') + '</ol>';
}

/* ---------- sidebar: sections with their headings underneath ---------- */
function sideHTML() {
  var G;
  if (role === 'staff') {
    var open = reqRows().filter(function (r) { return r.status === 'pending'; }).length;
    G = [['خدماتي', [
      { v: 'me', n: 'صفحتي', d: 'ملخص ملفك ووثائقك', j: 'emerald', i: 'grid' },
      { v: 'myreq', n: 'طلباتي', d: 'إجازة وإركاب وتعريف', j: 'sapphire', i: 'doc', b: open, s: [['myreq-new', 'طلب جديد', TAB.myreq === 'new'], ['myreq-list', 'متابعة طلباتي', TAB.myreq === 'list', open]] },
      { v: 'myfile', n: 'ملفي وبطاقتي', d: 'بياناتك والبطاقة الرسمية', j: 'garnet', i: 'card', s: [['update.html?me=1', 'تحديث بياناتي', false]] }]]];
  } else {
    var pend = reqPendingForMe().length;
    G = [['العمل اليومي', [
      { v: 'home', n: 'لوحة القيادة', d: 'ملخص اليوم وما يحتاج إجراء', j: 'emerald', i: 'grid' },
      { v: 'people', n: 'المنسوبون', d: 'الملفات والوثائق والبطاقات', j: 'sapphire', i: 'users', b: CNT.exp, s: [['staff', 'دليل المنسوبين', view === 'people' && TAB.people === 'dir' && filt.st === 'all', CNT.tot], ['gaps', 'الملفات الناقصة', view === 'people' && TAB.people === 'dir' && filt.st === 'gap', CNT.gap], ['documents', 'الوثائق', view === 'people' && TAB.people === 'docs', CNT.exp, 1]] },
      { v: 'reqs', n: 'الطلبات', d: 'إجازات وإركاب وتعريفات', j: 'amethyst', i: 'stamp', b: pend, s: [['reqs-pend', 'بانتظار اعتمادي', view === 'reqs' && TAB.reqs === 'pend', pend, 1], ['reqs-all', 'كل الطلبات', view === 'reqs' && TAB.reqs === 'all'], ['forms', 'النماذج الإدارية', view === 'reqs' && TAB.reqs === 'forms'], ['reqs-new', 'طلب نيابة عن منسوب', view === 'reqs' && TAB.reqs === 'new']].filter(function (x) { return x[0] !== 'reqs-new' || can('edit'); }) }]],
      ['الإدارة', [
        can('pay') ? { v: 'payroll', n: 'الرواتب', d: 'حسب الجهة والعملة', j: 'gold', i: 'wallet', b: 0, s: [['payroll', 'كشف الرواتب', view === 'payroll' && PAYF === 'all'], ['banks', 'الحسابات البنكية', view === 'payroll' && PAYF === 'nobank', CNT.nobank, 1]] } : null,
        can('sys') ? { v: 'system', n: 'النظام', d: 'الحسابات والسجل والبيانات', j: 'teal', i: 'shield', s: [can('users') ? ['accounts', 'الموظفون والصلاحيات', view === 'system' && TAB.system === 'acc'] : null, can('audit') ? ['log', 'سجل العمليات', view === 'system' && TAB.system === 'log'] : null, can('drive') || can('users') ? ['data', 'البيانات والنسخ', view === 'system' && TAB.system === 'data'] : null].filter(Boolean) } : null].filter(Boolean)]];
  }
  var navH = G.filter(function (g) { return g[1].length; }).map(function (g) {
    return '<div class="nsec"><span class="nlab">' + g[0] + '</span>' + g[1].map(function (x) {
      var on = view === x.v;
      return '<div class="grp' + (on ? ' on' : '') + '"><a class="gh" href="#' + x.v + '"' + (on ? ' aria-current="page"' : '') + '>' + tile(x.j, x.i) + '<span class="gt"><b>' + x.n + '</b><small>' + x.d + '</small></span>' + (x.b ? '<span class="gc hot">' + x.b + '</span>' : '') + '</a>' +
        (x.s && x.s.length ? '<div class="subs">' + x.s.map(function (s) { return '<a class="sb' + (s[2] ? ' on' : '') + '" href="' + (/\.html/.test(s[0]) ? s[0] : '#' + s[0]) + '"' + (s[2] ? ' aria-current="true"' : '') + '><i aria-hidden="true"></i><span>' + s[1] + '</span>' + (s[3] ? '<em' + (s[4] ? ' class="hot"' : '') + '>' + s[3] + '</em>' : '') + '</a>'; }).join('') + '</div>' : '') + '</div>';
    }).join('') + '</div>';
  }).join('');
  return '<div class="side-in"><div class="brand"><span class="lt"><img src="' + LOGO + '" alt="بنيان"></span><div><b>' + (role === 'staff' ? 'بوابة المنسوب' : 'بنيان للموارد البشرية') + '</b><small>مجموعة بنيان العالمية</small></div></div><nav class="nav" aria-label="الأقسام">' + navH + '</nav></div>';
}

/* ---------- request wizard (staff for themselves, HR on behalf) ---------- */
var RW = { i: 0, type: '', ref: '', d: {}, busy: false, err: '' };
var RW_STEPS = [['نوع الطلب', 'إجازة أو إركاب أو تعريف'], ['التفاصيل', 'التواريخ والبيانات'], ['المراجعة والإرسال', 'إقرار ثم إرسال']];
function rwDays() { var d = RW.d; if (!d.from || !d.to) return 0; var a = pdate(d.from), b = pdate(d.to); return a && b && b >= a ? Math.round((b - a) / DAY) + 1 : 0; }
function rwField(id, label, html, req, wide) { return '<div class="fld' + (wide ? ' wide' : '') + '"><label for="' + id + '">' + label + (req ? ' <i class="rq">*</i>' : '') + '</label>' + html + '</div>'; }
function rwIn(k, type, ph, extra) { return '<input id="rw_' + k + '" data-rw="' + k + '" type="' + (type || 'text') + '" value="' + esc(RW.d[k] == null ? '' : RW.d[k]) + '"' + (ph ? ' placeholder="' + esc(ph) + '"' : '') + (extra || '') + '>'; }
function rwSeg(k, opts) { return '<div class="seg2" role="group">' + opts.map(function (o) { return '<button type="button" data-rwseg="' + k + '" data-v="' + esc(o) + '" aria-pressed="' + (RW.d[k] === o) + '">' + esc(o) + '</button>'; }).join('') + '</div>'; }
function rwStaff() { return RW.ref ? byRef(RW.ref) : (role === 'staff' ? ME : null); }
function rwBody() {
  if (RW.i === 0) {
    var T = [['leave', 'إجازة', 'اعتيادية أو مرضية أو اضطرارية', '#1f8f6a', 'umbrella'], ['travel', 'أمر إركاب', 'مهمة رسمية داخلية أو خارجية', '#5b3fc4', 'plane'], ['cert', 'تعريف بالراتب', 'أو شهادة خبرة لجهة محددة', '#b98f25', 'cert']];
    return (role !== 'staff' ? '<div class="fld wide"><label for="rwRefS">المنسوب <i class="rq">*</i></label>' + ssel('rwRefS', STAFF.map(function (s) { return { v: s.ref, n: s.name, d: s.ref + ' · ' + s.ent.n, c: s.ent.c }; }), RW.ref, 'اختر المنسوب', function (v) { RW.ref = v; render(); }, 'المنسوب') + '</div>' : '') +
      '<div class="ccards" role="radiogroup" aria-label="نوع الطلب">' + T.filter(function (t) { return formOn(t[0]); }).map(function (t) { return '<button type="button" class="ccard" role="radio" data-rwtype="' + t[0] + '" aria-checked="' + (RW.type === t[0]) + '"><span class="ti" style="background:' + t[3] + '">' + ic(t[4]) + '</span><b>' + t[1] + '</b><small>' + t[2] + '</small></button>'; }).join('') + '</div>';
  }
  if (RW.i === 1) {
    if (RW.type === 'leave') return '<div class="form">' + rwField('lk', 'نوع الإجازة', rwSeg('kind', ['اعتيادية', 'مرضية', 'اضطرارية', 'بدون راتب']), true, true) +
      rwField('rw_from', 'من', rwIn('from', 'date'), true) + rwField('rw_to', 'إلى', rwIn('to', 'date'), true) +
      '<div class="fld wide">' + (rwDays() ? '<div class="note">' + ic('calendar') + '<span>مدة الإجازة <b>' + dn(rwDays()) + '</b> شاملة الأيام كلها.</span></div>' : '') + '</div>' +
      rwField('rw_substitute', 'القائم بالعمل', rwIn('substitute', 'text', 'اسم الزميل البديل (اختياري)')) + rwField('rw_contact', 'رقم للتواصل أثناء الإجازة', rwIn('contact', 'tel', 'اختياري', ' dir="ltr"')) +
      rwField('rw_note', 'ملاحظات', '<textarea id="rw_note" data-rw="note" maxlength="1500" placeholder="سبب الإجازة أو أي تفصيل يفيد الموارد البشرية">' + esc(RW.d.note || '') + '</textarea>', false, true) + '</div>';
    if (RW.type === 'travel') return '<div class="form">' + rwField('rw_dest', 'الوجهة', rwIn('dest', 'text', 'مثال: جاكرتا، إندونيسيا'), true) + rwField('tk', 'وسيلة السفر', rwSeg('transport', ['طيران', 'بري', 'لا يلزم']), true) +
      rwField('rw_from', 'تاريخ السفر', rwIn('from', 'date'), true) + rwField('rw_to', 'تاريخ العودة', rwIn('to', 'date'), true) +
      rwField('rw_purpose', 'الغرض من المهمة', '<textarea id="rw_purpose" data-rw="purpose" maxlength="1500" placeholder="مثال: زيارة إشرافية لمراكز التدريب">' + esc(RW.d.purpose || '') + '</textarea>', true, true) +
      '<div class="fld"><label class="ck"><input type="checkbox" data-rwck="hotel"' + (RW.d.hotel ? ' checked' : '') + '> أحتاج سكنًا</label></div>' + rwField('rw_advance', 'سلفة مصاريف (ر.س)', rwIn('advance', 'number', '0', ' min="0"')) + '</div>';
    return '<div class="form">' + rwField('ck', 'نوع الخطاب', rwSeg('kind', ['تعريف بالراتب', 'شهادة خبرة', 'تعريف بدون راتب']), true, true) +
      rwField('rw_to', 'الجهة الموجّه إليها', rwIn('to', 'text', 'مثال: البنك الأهلي، سفارة إندونيسيا'), true) + rwField('cl', 'لغة الخطاب', rwSeg('lang', ['العربية', 'الإنجليزية']), true) +
      rwField('rw_note', 'ملاحظات', '<textarea id="rw_note" data-rw="note" maxlength="800" placeholder="اختياري">' + esc(RW.d.note || '') + '</textarea>', false, true) + '</div>';
  }
  var s = rwStaff(), d = RW.d, rows = [['المنسوب', s ? esc(s.name) + ' <span class="ref">' + esc(s.ref) + '</span>' : '—'], ['نوع الطلب', RT2[RW.type][2]]];
  if (RW.type === 'leave') rows.push(['الإجازة', esc(d.kind) + '، ' + dn(rwDays())], ['المدة', fdx(pdate(d.from)) + ' إلى ' + fdx(pdate(d.to))], ['القائم بالعمل', esc(d.substitute || '—')]);
  if (RW.type === 'travel') rows.push(['الوجهة', esc(d.dest)], ['المدة', fdx(pdate(d.from)) + ' إلى ' + fdx(pdate(d.to)) + '، ' + dn(rwDays())], ['السفر', esc(d.transport || 'طيران') + (d.hotel ? ' وسكن' : '') + (+d.advance ? '، سلفة ' + n(+d.advance) + ' ر.س' : '')]);
  if (RW.type === 'cert') rows.push(['الخطاب', esc(d.kind) + ' بال' + esc(d.lang || 'العربية').replace('ال', '')], ['موجّه إلى', esc(d.to)]);
  return kvHTML(rows) + '<label class="consent"><input type="checkbox" id="rwAgree"' + (RW.d.agree ? ' checked' : '') + '><span>أقر بصحة البيانات' + (RW.type === 'leave' ? '، وأتعهد بالعودة إلى العمل في اليوم التالي لانتهاء الإجازة وإبلاغ مديري بأي طارئ' : '') + '.</span></label>';
}
function rwHTML() {
  var sum = !RW.type ? 'لم تختر نوع الطلب بعد' : RT2[RW.type][2] + (RW.type === 'leave' && RW.d.kind ? ' ' + RW.d.kind : '') + (rwDays() ? '، ' + dn(rwDays()) : '') + (RW.type === 'cert' && RW.d.to ? ' إلى ' + RW.d.to : '') + (RW.type === 'travel' && RW.d.dest ? ' إلى ' + RW.d.dest : '');
  var s = rwStaff();
  return '<div class="wiz"><form class="wcard pn" id="rwForm" novalidate><span class="stepchip">الخطوة ' + (RW.i + 1) + ' من ' + RW_STEPS.length + '</span><h2 class="wt">' + RW_STEPS[RW.i][0] + '</h2>' + rwBody() +
    '<div class="lerr" role="alert">' + esc(RW.err) + '</div><div class="wfoot"><button class="btn" type="button" id="rwBack"' + (RW.i ? '' : ' disabled') + '>' + ic('back') + 'السابق</button><span class="ctr">' + (RW.i + 1) + ' / ' + RW_STEPS.length + '</span><button class="btn ' + (RW.i === RW_STEPS.length - 1 ? 'goldb' : 'prim') + '" type="submit"' + (RW.busy ? ' disabled' : '') + '>' + (RW.i === RW_STEPS.length - 1 ? ic('send') + (RW.busy ? 'جارٍ الإرسال…' : 'إرسال الطلب') : 'التالي') + '</button></div></form>' +
    '<aside class="wside" aria-label="تقدم الطلب"><div class="wsh">' + tile('gold', 'stamp') + '<div><b>طلب جديد</b><small>' + (s ? esc(s.name) : 'يصلك رقم الطلب فور الإرسال') + '</small></div></div><ol class="wsteps">' + RW_STEPS.map(function (x, k) { return '<li class="' + (k < RW.i ? 'done' : k === RW.i ? 'on' : '') + '"><span><b>' + x[0] + '</b><small>' + x[1] + '</small></span><i>' + (k < RW.i ? '✓' : k + 1) + '</i></li>'; }).join('') + '</ol>' +
    '<div class="wsum"><small>اختيارك</small><b>' + esc(sum) + '</b></div><div class="whelp">' + ic('info') + '<span>' + flowText(RW.type) + '</span></div></aside></div>';
}
function rwSync() { document.querySelectorAll('[data-rw]').forEach(function (e) { RW.d[e.dataset.rw] = e.value; }); var a = document.getElementById('rwAgree'); if (a) RW.d.agree = a.checked; }
function rwValidate() {
  var d = RW.d;
  if (RW.i === 0) { if (role !== 'staff' && !RW.ref) return 'اختر المنسوب أولًا'; if (!RW.type) return 'اختر نوع الطلب'; }
  if (RW.i === 1) {
    if (RW.type === 'leave') { if (!d.kind) return 'اختر نوع الإجازة'; if (!rwDays()) return 'تحقق من تاريخي البداية والنهاية'; }
    if (RW.type === 'travel') { if (!String(d.dest || '').trim() || !String(d.purpose || '').trim()) return 'اكتب الوجهة والغرض من المهمة'; if (!rwDays()) return 'تحقق من تاريخي السفر والعودة'; }
    if (RW.type === 'cert') { if (!d.kind) return 'اختر نوع الخطاب'; if (!String(d.to || '').trim()) return 'اكتب الجهة الموجّه إليها الخطاب'; }
  }
  if (RW.i === 2 && !d.agree) return 'ضع علامة على الإقرار قبل الإرسال';
  return '';
}
function rwBind() {
  var f = document.getElementById('rwForm'); if (!f) return;
  f.querySelectorAll('[data-rwtype]').forEach(function (b) { b.onclick = function () { rwSync(); if (RW.type !== b.dataset.rwtype) RW.d = {}; RW.type = b.dataset.rwtype; RW.err = ''; render(); }; });
  f.querySelectorAll('[data-rwseg]').forEach(function (b) { b.onclick = function () { rwSync(); RW.d[b.dataset.rwseg] = b.dataset.v; RW.err = ''; render(); }; });
  f.querySelectorAll('[data-rwck]').forEach(function (c) { c.onchange = function () { RW.d[c.dataset.rwck] = c.checked; }; });
  f.querySelectorAll('input[type=date][data-rw]').forEach(function (c) { c.onchange = function () { rwSync(); softRender(); }; });
  document.getElementById('rwBack').onclick = function () { rwSync(); if (RW.i) { RW.i--; RW.err = ''; render(); } };
  f.onsubmit = function (e) {
    e.preventDefault(); rwSync(); var err = rwValidate(); if (err) { RW.err = err; render(); return; }
    RW.err = '';
    if (RW.i < RW_STEPS.length - 1) { RW.i++; render(); window.scrollTo(0, 0); return; }
    var d = {}; Object.keys(RW.d).forEach(function (k) { if (k !== 'agree') d[k] = RW.d[k]; });
    RW.busy = true; render();
    api({ action: 'reqCreate', type: RW.type, ref: role === 'staff' ? '' : RW.ref, data: d }).then(function (j) {
      var rows = reqRows().slice(); rows.unshift(j.request); seed('reqs', rows); delete CACHE.audit;
      RW = { i: 0, type: '', ref: '', d: {}, busy: false, err: '' };
      if (role === 'staff') { TAB.myreq = 'list'; location.hash = 'myreq'; } else { TAB.reqs = 'all'; }
      render(); reqOpen(j.request.no, true);
    }).catch(function (e2) { RW.busy = false; RW.err = errText(e2); render(); });
  };
}

/* ---------- lists ---------- */
var RF = { type: '', st: '', q: '' };
function reqListHTML(rows, mine) {
  if (!rows.length) return '<div class="empty">' + (mine ? 'لا طلبات بعد. ابدأ بطلب جديد من الزر أعلاه.' : 'لا طلبات في هذه القائمة.') + '</div>';
  return '<ul class="rqlist">' + rows.map(function (r) { var T = RT2[r.type];
    return '<li><button type="button" class="rqrow" data-rq="' + esc(r.no) + '">' + tile(T[0], T[1]) + '<div class="rqm"><b>' + esc(mine ? reqSum(r) : r.name) + '</b><span class="s"><span class="ltr">' + esc(r.no) + '</span> · ' + esc(mine ? T[2] : reqSum(r)) + (reqDates(r) ? ' · ' + reqDates(r) : '') + ' · ' + agoD(pdt(r.createdAt)) + '</span>' + reqTrail(r) + '</div>' + reqPill(r) + '</button></li>'; }).join('') + '</ul>';
}
VIEWS.reqs = function () {
  var all = reqRows(), pend = reqPendingForMe(), t = TAB.reqs;
  if (t === 'new' && !can('edit')) t = TAB.reqs = 'all';
  var T = [['pend', 'بانتظار اعتمادي', pend.length, 'stamp', pend.length], ['all', 'كل الطلبات', all.length, 'doc'], ['forms', 'النماذج الإدارية', null, 'file']].concat(can('edit') ? [['new', 'طلب نيابة عن منسوب', null, 'plus']] : []);
  var body;
  if (t === 'forms') body = formsHTML();
  else if (t === 'new') body = rwHTML();
  else {
    var q = RF.q.trim().toLowerCase(), list = (t === 'pend' ? pend : all).filter(function (r) { return (!RF.type || r.type === RF.type) && (!RF.st || r.status === RF.st) && (!q || (r.no + ' ' + r.name + ' ' + r.ref + ' ' + reqSum(r)).toLowerCase().indexOf(q) >= 0); });
    var cnt = function (k, v) { return (t === 'pend' ? pend : all).filter(function (r) { return r[k] === v; }).length; };
    body = '<section class="pn"><div class="tbar" style="border-bottom:1px solid var(--line-2)"><div class="fbar">' + fsearch('rfq', RF.q, 'ابحث برقم الطلب أو اسم المنسوب', 'بحث في الطلبات') +
      ssel('rft', [{ v: '', n: 'الكل', ic: 'doc' }].concat(Object.keys(RT2).map(function (k) { return { v: k, n: RT2[k][2], k: cnt('type', k), ic: RT2[k][1] }; })), RF.type, 'الكل', function (v) { RF.type = v; render(); }, 'نوع الطلب', 'نوع الطلب') +
      (t === 'all' ? ssel('rfs', [{ v: '', n: 'الكل', ic: 'stamp' }].concat(Object.keys(RST).map(function (k) { return { v: k, n: RST[k][1], k: cnt('status', k) }; })), RF.st, 'الكل', function (v) { RF.st = v; render(); }, 'حالة الطلب', 'الحالة') : '') + '</div>' +
      fchips([[RF.q.trim() ? 'بحث: ' + RF.q.trim() : '', function () { RF.q = ''; }], [RF.type && RT2[RF.type] ? 'النوع: ' + RT2[RF.type][2] : '', function () { RF.type = ''; }], [t === 'all' && RF.st && RST[RF.st] ? 'الحالة: ' + RST[RF.st][1] : '', function () { RF.st = ''; }]]) + '</div>' +
      '<div class="pb">' + (t === 'pend' && !pend.length ? '<div class="note">' + ic('check') + '<span>لا شيء ينتظر قرارك الآن. يصلك بريد عند وصول طلب جديد إلى خطوتك.</span></div>' : reqListHTML(list, false)) + '</div></section>';
  }
  var k = { pending: all.filter(function (r) { return r.status === 'pending'; }).length, approved: all.filter(function (r) { return r.status === 'approved'; }).length, rejected: all.filter(function (r) { return r.status === 'rejected'; }).length };
  return ptitle('الطلبات', 'إجازات المنسوبين وأوامر الإركاب والتعريفات. لكل طلب رقم ثابت ومسار اعتماد، وكل قرار يُسجَّل باسم صاحبه ويصل المنسوب ببريد.', can('edit') && t !== 'new' ? '<a class="btn goldb" href="#reqs-new">' + ic('plus') + 'طلب نيابة عن منسوب</a>' : '') +
    '<div class="tabs2">' + [['amethyst', 'stamp', pend.length, 'بانتظار اعتمادي'], ['gold', 'clock', k.pending, 'قيد الإجراء'], ['emerald', 'check', k.approved, 'معتمد'], ['garnet', 'alert', k.rejected, 'مرفوض']].map(function (x) { return '<div class="stat">' + tile(x[0], x[1]) + '<div><b>' + x[2] + '</b><span>' + x[3] + '</span></div></div>'; }).join('') + '</div>' +
    vtabs('reqs', T) + body;
};
VIEWS.myreq = function () {
  var rows = reqRows(), t = TAB.myreq, open = rows.filter(function (r) { return r.status === 'pending'; }).length;
  var body = t === 'new' ? rwHTML() : pn('sapphire', 'doc', 'طلباتي', rows.length ? rows.length + ' طلبًا، ' + open + ' قيد الإجراء' : '', '<a class="btn sm goldb" href="#myreq-new">' + ic('plus') + 'طلب جديد</a>', '<div class="pb">' + reqListHTML(rows, true) + '</div>');
  return ptitle('طلباتي', 'قدّم طلب إجازة أو أمر إركاب أو تعريف بالراتب، وتابع أين وصل. يصلك بريد عند كل خطوة.') +
    vtabs('myreq', [['list', 'طلباتي', open ? open + ' قيد الإجراء' : rows.length, 'doc', open], ['new', 'طلب جديد', null, 'plus']]) + body;
};

/* ---------- the official request sheet (view · decide · print) ---------- */
function reqSheetHTML(r) {
  var d = r.data || {}, st = r.staff || {}, kv = function (a) { return '<div class="srow">' + a.map(function (x) { return '<div class="sf"><span>' + x[0] + '</span><b>' + (x[1] === '' || x[1] == null ? '—' : esc(x[1])) + '</b></div>'; }).join('') + '</div>'; };
  var det = r.type === 'leave' ? kv([['نوع الإجازة', d.kind], ['من', fdx(pdate(d.from))], ['إلى', fdx(pdate(d.to))], ['المدة', dn(d.days || 0)], ['القائم بالعمل', d.substitute], ['التواصل أثناء الإجازة', d.contact]])
    : r.type === 'travel' ? kv([['الوجهة', d.dest], ['من', fdx(pdate(d.from))], ['إلى', fdx(pdate(d.to))], ['المدة', dn(d.days || 0)], ['وسيلة السفر', (d.transport || '') + (d.hotel ? ' وسكن' : '')], ['السلفة', +d.advance ? n(+d.advance) + ' ' + (d.currency || 'SAR') : 'لا يوجد']])
    : kv([['نوع الخطاب', d.kind], ['موجّه إلى', d.to], ['لغة الخطاب', d.lang]]);
  var note = d.note || d.purpose;
  return '<div class="sheet" id="reqSheet"><div class="shead"><div class="sorg"><span class="seal"><img src="' + LOGO + '" alt=""></span><div><b>مجموعة بنيان العالمية</b><small>Bonyan International Group</small><em>إدارة الموارد البشرية</em></div></div><div class="smeta">رمز النموذج<b>' + esc(r.form) + '</b>الإصدار 1.0<span>رقم المعاملة</span><b>' + esc(r.no) + '</b></div></div>' +
    '<div class="stitle"><h3>' + esc(r.typeName) + '</h3><p>قُدّم ' + fdx(pdt(r.createdAt)) + ' بواسطة ' + esc(r.createdBy || r.name) + '</p></div>' +
    '<div class="sbar">بيانات المنسوب</div>' + kv([['الاسم', r.name], ['الرقم المرجعي', r.ref], ['الجهة', st.entity], ['المسمى', st.jobTitle], ['الإدارة', st.department], ['المدير المباشر', st.manager]]) +
    '<div class="sbar">تفاصيل الطلب</div>' + det + (note ? '<div class="snote">' + esc(note) + '</div>' : '') +
    '<div class="sbar">الاعتماد والتوقيعات</div><div class="tw"><table class="sappr"><thead><tr><th>م</th><th>الجهة</th><th>الاسم</th><th>القرار</th><th>التاريخ</th></tr></thead><tbody>' +
    r.chain.map(function (c, i) { var dec = c.decision === 'approve' ? '<span class="pill ok"><i></i>موافق</span>' : c.decision === 'reject' ? '<span class="pill bad"><i></i>غير موافق</span>' : r.status === 'pending' && i === r.stage ? '<span class="pill warn"><i></i>بانتظار القرار</span>' : r.status === 'cancelled' ? '<span class="pill mute"><i></i>ألغي الطلب</span>' : '<span class="pill mute"><i></i>—</span>';
      return '<tr><td>' + (i + 1) + '</td><td class="r">' + esc(c.label) + '</td><td>' + esc(c.by || '') + (c.note ? '<small class="dn2">' + esc(c.note) + '</small>' : '') + '</td><td>' + dec + '</td><td>' + esc(c.at || '') + '</td></tr>'; }).join('') + '</tbody></table></div>' +
    '<div class="sfoot"><span>hr.bonyanglobal.com</span><span>' + esc(r.form) + ' · ' + esc(r.no) + '</span><span>الحالة: ' + esc(RST[r.status] ? RST[r.status][1] : r.statusName) + '</span></div></div>';
}
function reqOpen(no, fresh) {
  var r = reqByNo(no); if (!r) return;
  var old = document.getElementById('reqLayer'); if (old) old.remove();
  var own = role === 'staff' || (ME && ME.ref === r.ref), el = document.createElement('div'); el.id = 'reqLayer';
  el.innerHTML = '<div class="mscrim" data-rqclose="1"></div><section class="mdl rqm2" role="dialog" aria-modal="true" aria-labelledby="rqT"><header class="mh">' + tile(RT2[r.type][0], RT2[r.type][1]) + '<div><h2 id="rqT">' + esc(r.typeName) + ' <span class="ltr ref">' + esc(r.no) + '</span></h2><p>' + (fresh ? 'أُرسل الطلب. احتفظ برقمه للمتابعة.' : esc(r.name)) + '</p></div>' + reqPill(r) + '<button class="ib mx" data-rqclose="1" aria-label="إغلاق">' + ic('plus') + '</button></header>' +
    '<div class="rqbody"><div class="rqtrack">' + reqTrail(r) + '</div>' + reqSheetHTML(r) + '</div>' +
    '<footer class="mf">' + (r.canDecide ? '<div class="rqdec"><textarea id="rqNote" rows="2" maxlength="600" placeholder="ملاحظة للمنسوب (إلزامية عند الرفض)"></textarea><div class="lerr" id="rqErr" role="alert"></div></div><button class="btn" data-rqdec="reject">' + ic('alert') + 'رفض</button><button class="btn goldb" data-rqdec="approve">' + ic('check') + 'اعتماد</button>'
      : (r.status === 'pending' && (own || can('edit')) ? '<button class="btn" id="rqCancel">إلغاء الطلب</button>' : '') + '<span class="sp"></span>') +
    '<button class="btn" id="rqPrint">' + ic('dl') + 'طباعة أو حفظ PDF</button></footer></section>';
  document.body.appendChild(el); document.body.classList.add('no-scroll');
  var close = function () { el.remove(); document.body.classList.remove('no-scroll'); };
  el.querySelectorAll('[data-rqclose]').forEach(function (b) { b.onclick = close; });
  document.getElementById('rqPrint').onclick = function () { document.body.classList.add('print-sheet'); window.print(); setTimeout(function () { document.body.classList.remove('print-sheet'); }, 500); };
  var c = document.getElementById('rqCancel'); if (c) c.onclick = function () { c.disabled = true; api({ action: 'reqCancel', no: r.no }).then(function () { r.status = 'cancelled'; r.statusName = 'ملغى'; seed('reqs', reqRows()); close(); softRender(); toast('أُلغي الطلب ' + r.no); }).catch(function (e) { c.disabled = false; toast(errText(e)); }); };
  el.querySelectorAll('[data-rqdec]').forEach(function (b) { b.onclick = function () {
    var ok = b.dataset.rqdec === 'approve', note = document.getElementById('rqNote').value.trim(), err = document.getElementById('rqErr');
    if (!ok && !note) { err.textContent = 'اكتب سبب الرفض ليصل إلى المنسوب.'; document.getElementById('rqNote').focus(); return; }
    el.querySelectorAll('[data-rqdec]').forEach(function (x) { x.disabled = true; });
    api({ action: 'reqDecide', no: r.no, decision: ok ? 'approve' : 'reject', note: note }).then(function (j) {
      seed('reqs', reqRows().map(function (x) { return x.no === r.no ? j.request : x; })); delete CACHE.audit; delete CACHE['aud:' + r.ref];
      close(); softRender(); toast(ok ? (j.request.status === 'approved' ? 'اعتُمد الطلب نهائيًا وأُبلغ المنسوب' : 'وافقت، وانتقل الطلب إلى ' + j.request.chain[j.request.stage].label) : 'رُفض الطلب وأُبلغ المنسوب بالسبب');
    }).catch(function (e) { el.querySelectorAll('[data-rqdec]').forEach(function (x) { x.disabled = false; }); err.textContent = errText(e); });
  }; });
}
function bindReq() {
  document.querySelectorAll('[data-rq]').forEach(function (b) { b.onclick = function () { reqOpen(b.dataset.rq); }; });
  var q = document.getElementById('rfq'); if (q) q.oninput = function () { RF.q = q.value; softRender(); };
  rwBind(); bindForms();
}

/* ---------- public tracking on the sign-in screen ---------- */
var TRK = { no: '', mail: '', res: null, err: '', busy: false };
function trackHTML() {
  var r = TRK.res, res = '';
  if (r) { var steps = [{ l: 'تقديم الطلب', st: 'done', at: r.createdAt }].concat(r.chain.map(function (c, i) { return { l: c.label, st: c.decision === 'approve' ? 'done' : c.decision === 'reject' ? 'x' : r.status === 'pending' && i === r.stage ? 'now' : '', at: c.at, note: c.note }; }));
    res = '<div class="trres"><div class="trh"><b>' + esc(r.typeName) + '</b><span class="pill ' + (RST[r.status] || ['mute'])[0] + '"><i></i>' + esc(r.statusName) + '</span></div><ol class="tl3">' + steps.map(function (s, i) { return '<li class="' + s.st + '"><i>' + (s.st === 'done' ? '✓' : s.st === 'x' ? '×' : i + 1) + '</i><div><b>' + esc(s.l) + '</b><small>' + esc(s.at || (s.st === 'now' ? 'يُراجع الآن' : 'لاحقًا')) + (s.note ? ' · ' + esc(s.note) : '') + '</small></div></li>'; }).join('') + '</ol></div>'; }
  return '<h2>متابعة طلب</h2><p class="lp">اكتب رقم الطلب كما وصلك في البريد، والبريد المسجّل في ملفك. لا تحتاج إلى تسجيل الدخول.</p>' +
    '<div class="lf"><label for="trkNo">رقم الطلب</label><input id="trkNo" class="ltr" style="text-align:left" value="' + esc(TRK.no) + '" placeholder="LV-2026-0001" autocomplete="off"></div>' +
    '<div class="lf"><label for="trkMail">البريد الإلكتروني</label><input id="trkMail" class="ltr" style="text-align:left" type="email" value="' + esc(TRK.mail) + '" placeholder="name@example.com"></div>' +
    '<div class="lerr" role="alert">' + esc(TRK.err) + '</div><button class="btn prim" id="lnext" type="submit"' + (TRK.busy ? ' disabled' : '') + '>' + ic('search') + (TRK.busy ? 'جارٍ البحث…' : 'تحقق') + '</button>' + res;
}
function bindTrack() {
  var f = document.getElementById('lf'); if (!f || LG.tab !== 'track') return;
  f.onsubmit = function (e) { e.preventDefault(); TRK.no = document.getElementById('trkNo').value.trim(); TRK.mail = document.getElementById('trkMail').value.trim(); TRK.busy = true; TRK.err = ''; TRK.res = null; render();
    api({ action: 'reqTrack', no: TRK.no, email: TRK.mail }).then(function (j) { TRK.busy = false; TRK.res = j; render(); }).catch(function (er) { TRK.busy = false; TRK.err = errText(er); render(); }); };
}

/* ---------- النماذج الإدارية ومسؤولو الاعتماد (يحددهم مدير النظام) ---------- */
function formsData() { return need('reqForms', function () { return api({ action: 'reqForms' }); }, 120000).data; }
function formOf(t) { var d = formsData(); return d ? d.forms.filter(function (f) { return f.type === t; })[0] : null; }
function formOn(t) { var f = formOf(t); return !f || f.on; }
function flowText(t) {
  var f = formOf(t); if (!t) return 'اختر نوع الطلب، وسيظهر هنا مسار اعتماده.';
  if (!f) return 'يمر الطلب بمسار اعتماد، ويصلك بريد عند كل خطوة.';
  return 'يمر الطلب على: ' + f.steps.map(function (s) { return s.label; }).join(' ثم ') + '، ويصلك بريد عند كل خطوة.';
}
function formsHTML() {
  var c = need('reqForms', function () { return api({ action: 'reqForms' }); }, 120000), d = c.data;
  if (!d) return '<section class="pn"><div class="pb"><div class="empty">' + (c.err ? esc(c.err) : 'جارٍ التحميل…') + '</div></div></section>';
  var cards = d.forms.map(function (f) {
    var T = RT2[f.type] || ['slate', 'doc', f.name];
    var path = '<ol class="fpath"><li class="st0"><i>' + ic('user') + '</i><span><b>المنسوب يقدّم</b><small>من صفحته أو نيابة عنه</small></span></li>' + f.steps.map(function (s, i) {
      var who = s.people.length ? s.people.map(function (p) { return p.name; }).slice(0, 3).join('، ') + (s.people.length > 3 ? ' و' + (s.people.length - 3) + ' آخرون' : '') : '';
      return '<li class="' + (who ? '' : 'nobody') + '"><i>' + (i + 1) + '</i><span><b>' + esc(s.label) + '</b><small>' + (who ? (s.kind === 'user' ? 'حساب محدد: ' : 'كل من بدور ' + esc(d.roles[s.v] || s.v) + ': ') + esc(who) : 'لا يوجد حساب نشط يعتمد هذه الخطوة!') + '</small></span></li>'; }).join('') +
      '<li class="stz"><i>' + ic('check') + '</i><span><b>القرار النهائي</b><small>يصل المنسوب ببريد</small></span></li></ol>';
    return '<article class="fcard' + (f.on ? '' : ' off') + '"><header>' + tile(T[0], T[1]) + '<div><h3>' + esc(f.name) + '</h3><span class="fcode ltr">' + esc(f.code) + ' · ' + esc(f.prefix) + '-YYYY-NNNN</span></div>' +
      (f.on ? '<span class="pill ok"><i></i>مفعّل</span>' : '<span class="pill mute"><i></i>موقوف</span>') + '</header><p class="finfo">' + esc(f.info) + '</p>' +
      '<h4>مسار الاعتماد</h4>' + path +
      '<div class="fstats"><span><b>' + f.total + '</b> طلبًا</span><span><b>' + f.pending + '</b> قيد الإجراء</span></div>' +
      '<footer>' + (d.canEdit ? '<button class="btn prim" data-flow="' + f.type + '">' + ic('users') + 'تحديد المسؤولين</button>' : '') +
      (can('edit') && f.on ? '<a class="btn" href="#reqs-new" data-ftype="' + f.type + '">' + ic('plus') + 'تقديم نيابة عن منسوب</a>' : '') + '</footer></article>';
  }).join('');
  return '<div class="note fnote">' + ic('info') + '<span>هذه النماذج الإلكترونية المعتمدة في المنصة. يقدّمها المنسوب من «طلباتي»، أو الموارد البشرية نيابة عنه. ' + (d.canEdit ? 'بصفتك مدير النظام تحدد من يعتمد كل نموذج وترتيب الخطوات، أو توقف النموذج مؤقتًا.' : 'مدير النظام هو من يحدد مسؤولي الاعتماد.') + '</span></div><div class="fcards">' + cards + '</div>';
}
function bindForms() {
  document.querySelectorAll('[data-flow]').forEach(function (b) { b.onclick = function () { feOpen(b.dataset.flow); }; });
  document.querySelectorAll('[data-ftype]').forEach(function (b) { b.addEventListener('click', function () { RW = { i: 0, type: b.dataset.ftype, ref: '', d: {}, busy: false, err: '' }; TAB.reqs = 'new'; }); });
}
var FE = null;
function feOpen(t) {
  var f = formOf(t); if (!f) return;
  FE = { type: t, name: f.name, on: f.on, steps: f.steps.map(function (s) { return { kind: s.kind, v: s.v, label: s.label }; }), err: '', busy: false };
  need('users', function () { return api({ action: 'usersList' }); }, 60000);
  drawFE();
}
function feOpts() {
  var d = formsData(), U = (CACHE.users && CACHE.users.data && CACHE.users.data.users) || [];
  var R = Object.keys(d.roles).map(function (k) { var n = U.filter(function (u) { return u.active && u.role === k && u.perms.indexOf('requests.approve') > -1; }).length;
    return { v: 'role:' + k, n: d.roles[k], d: CACHE.users && CACHE.users.data ? (n ? n + ' حساب يملك صلاحية الاعتماد' : 'لا يوجد حساب بهذا الدور يملك صلاحية الاعتماد') : 'كل حساب بهذا الدور', ic: 'users', g: 'حسب الدور' }; });
  var P = U.filter(function (u) { return u.active; }).map(function (u) { return { v: 'user:' + u.id, n: u.name || u.email, d: (u.title || u.roleName) + ' · ' + u.email, ic: 'user', g: 'حساب محدد بالاسم' }; });
  return R.concat(P);
}
function feAuto(kind, v) {
  var d = formsData(), U = (CACHE.users && CACHE.users.data && CACHE.users.data.users) || [];
  if (kind === 'role') return d.roles[v] || '';
  var u = U.filter(function (x) { return String(x.id) === String(v); })[0]; return u ? (u.title || u.name) : '';
}
function drawFE() {
  var old = document.getElementById('feLayer'); if (old) old.remove();
  var opts = feOpts(), el = document.createElement('div'); el.id = 'feLayer';
  var rows = FE.steps.map(function (s, i) {
    return '<li class="ferow"><span class="fen">' + (i + 1) + '</span><div class="fef"><label>المسؤول عن الاعتماد</label>' + ssel('fe' + i, opts, s.kind ? s.kind + ':' + s.v : '', 'اختر دورًا أو حسابًا', (function (k) { return function (v) {
        var p = v.split(':'), prevAuto = feAuto(FE.steps[k].kind, FE.steps[k].v);
        if (!FE.steps[k].label || FE.steps[k].label === prevAuto) FE.steps[k].label = feAuto(p[0], p[1]);
        FE.steps[k].kind = p[0]; FE.steps[k].v = p[0] === 'user' ? +p[1] : p[1]; FE.err = ''; drawFE(); }; })(i), 'المسؤول عن الخطوة ' + (i + 1)) +
      '</div><div class="fef"><label for="fel' + i + '">اسم الخطوة كما يظهر للمنسوب</label><input id="fel' + i + '" data-fel="' + i + '" value="' + esc(s.label) + '" maxlength="60" placeholder="مثال: المدير المالي"></div>' +
      '<div class="fea"><button type="button" class="ib" data-feup="' + i + '" aria-label="تقديم الخطوة"' + (i ? '' : ' disabled') + '>' + ic('chev') + '</button><button type="button" class="ib" data-fedn="' + i + '" aria-label="تأخير الخطوة"' + (i < FE.steps.length - 1 ? '' : ' disabled') + '>' + ic('chev') + '</button><button type="button" class="ib del" data-fedel="' + i + '" aria-label="حذف الخطوة"' + (FE.steps.length > 1 ? '' : ' disabled') + '>' + ic('x') + '</button></div></li>';
  }).join('');
  el.innerHTML = '<div class="mscrim" data-feclose="1"></div><section class="mdl fem" role="dialog" aria-modal="true" aria-labelledby="feT"><header class="mh">' + tile('amethyst', 'stamp') + '<div><h2 id="feT">مسؤولو اعتماد: ' + esc(FE.name) + '</h2><p>رتّب خطوات الاعتماد وحدد من يعتمد كل خطوة</p></div><button class="ib mx" data-feclose="1" aria-label="إغلاق">' + ic('plus') + '</button></header>' +
    '<div class="abody"><label class="tgl"><button type="button" class="sw" role="switch" id="feOn" aria-checked="' + FE.on + '"></button><span><b>النموذج مفعّل</b><small>' + (FE.on ? 'يظهر للمنسوبين ويمكن تقديمه' : 'موقوف: لا يظهر في «طلب جديد» ولا يُقبل تقديمه') + '</small></span></label>' +
    '<ol class="felist">' + rows + '</ol>' + (FE.steps.length < 5 ? '<button type="button" class="btn feadd" id="feAdd">' + ic('plus') + 'إضافة خطوة اعتماد</button>' : '') +
    '<div class="fepre"><small>المسار بعد الحفظ</small><b>المنسوب ← ' + FE.steps.map(function (s) { return esc(s.label || '…'); }).join(' ← ') + ' ← القرار</b></div>' +
    '<div class="note">' + ic('info') + '<span>«حسب الدور» يعني أن أي حساب بهذا الدور يملك صلاحية «اعتماد طلبات المنسوبين» يستطيع الاعتماد. «حساب محدد» يجعل الاعتماد لشخص بعينه حتى لو لم تكن لديه هذه الصلاحية. التعديل يسري على الطلبات الجديدة، والطلبات القائمة تكمل مسارها. ولمدير النظام اعتماد أي خطوة عند الضرورة.</span></div></div>' +
    '<footer class="mf"><div class="lerr" role="alert">' + esc(FE.err) + '</div><button class="btn" data-feclose="1">إلغاء</button><button class="btn goldb" id="feSave"' + (FE.busy ? ' disabled' : '') + '>' + ic('check') + (FE.busy ? 'جارٍ الحفظ…' : 'حفظ المسار') + '</button></footer></section>';
  document.body.appendChild(el);
  var sync = function () { el.querySelectorAll('[data-fel]').forEach(function (x) { FE.steps[+x.dataset.fel].label = x.value; }); };
  el.querySelectorAll('[data-feclose]').forEach(function (b) { b.onclick = function () { el.remove(); FE = null; }; });
  el.querySelectorAll('[data-fel]').forEach(function (x) { x.oninput = function () { FE.steps[+x.dataset.fel].label = x.value; var p = el.querySelector('.fepre b'); if (p) p.textContent = 'المنسوب ← ' + FE.steps.map(function (s) { return s.label || '…'; }).join(' ← ') + ' ← القرار'; }; });
  el.querySelectorAll('[data-feup],[data-fedn]').forEach(function (b) { b.onclick = function () { sync(); var i = +(b.dataset.feup || b.dataset.fedn), j = b.dataset.feup ? i - 1 : i + 1, t = FE.steps[i]; FE.steps[i] = FE.steps[j]; FE.steps[j] = t; drawFE(); }; });
  el.querySelectorAll('[data-fedel]').forEach(function (b) { b.onclick = function () { sync(); FE.steps.splice(+b.dataset.fedel, 1); drawFE(); }; });
  var add = document.getElementById('feAdd'); if (add) add.onclick = function () { sync(); FE.steps.push({ kind: '', v: '', label: '' }); drawFE(); };
  document.getElementById('feOn').onclick = function () { sync(); FE.on = !FE.on; drawFE(); };
  document.getElementById('feSave').onclick = function () {
    sync();
    if (FE.steps.some(function (s) { return !s.kind; })) { FE.err = 'اختر المسؤول عن كل خطوة.'; drawFE(); return; }
    FE.busy = true; drawFE();
    api({ action: 'reqFormsSave', type: FE.type, on: FE.on, steps: FE.steps }).then(function (j) { seed('reqForms', j); var L = document.getElementById('feLayer'); if (L) L.remove(); FE = null; toast('حُفظ مسار الاعتماد'); render(); })
      .catch(function (e) { FE.busy = false; FE.err = errText(e); drawFE(); });
  };
}
document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && document.getElementById('feLayer') && !document.querySelector('.ss-pop')) { document.getElementById('feLayer').remove(); FE = null; } });

/* ================= الدخول السريع: جهاز محفوظ + البصمة (مفاتيح المرور) ================= */
var PK_OK = !!(window.PublicKeyCredential && navigator.credentials && window.isSecureContext);
var DEV = null, JUST_IN = false;
function bufU(b) { var s = '', a = new Uint8Array(b); for (var i = 0; i < a.length; i++) s += String.fromCharCode(a[i]); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function uBuf(s) { s = String(s).replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; var b = atob(s), a = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a.buffer; }
function pkErr(e) {
  var n = (e && e.name) || '', m = (e && e.message) || '';
  if (n === 'NotAllowedError' || n === 'AbortError') return 'أُلغيت العملية أو انتهت مهلتها. حاول مرة أخرى.';
  if (n === 'InvalidStateError') return 'هذا الجهاز مفعّلة عليه البصمة لهذا الحساب من قبل.';
  if (n === 'NotSupportedError' || n === 'SecurityError') return 'هذا المتصفح أو الجهاز لا يدعم الدخول بالبصمة.';
  return { passkey_unknown: 'هذه البصمة غير مرتبطة بحساب في المنصة. ادخل بالرمز، ثم فعّل البصمة من «الدخول والأمان».', passkey_timeout: 'انتهت مهلة العملية. حاول مرة أخرى.', bad_passkey: 'تعذّر التحقق من البصمة. حاول مرة أخرى أو ادخل بالرمز.',
    passkey_uv: 'يلزم التحقق بالبصمة أو الوجه أو رمز قفل الجهاز.', passkey_exists: 'هذا الجهاز مفعّلة عليه البصمة من قبل.', passkey_many: 'وصلت إلى الحد الأقصى (١٠ بصمات). احذف واحدة قديمة أولًا.', device_expired: 'انتهت صلاحية حفظ هذا الجهاز. ادخل بالرمز مرة واحدة.' }[m] || errText(e);
}
function pkMark(on) { try { if (on) localStorage.setItem('bhr_pk', '1'); else localStorage.removeItem('bhr_pk'); } catch (e) { } }
function pkMarked() { try { return localStorage.getItem('bhr_pk') === '1'; } catch (e) { return false; } }

/* الدخول بالبصمة: لا يحتاج بريدًا، المفتاح يعرّف صاحبه */
function pkLogin(btn) {
  if (!PK_OK) { LG.err = 'هذا المتصفح لا يدعم الدخول بالبصمة.'; render(); return; }
  LG.err = ''; LG.busyPk = true; render();
  api({ action: 'pkLoginStart' }).then(function (j) {
    var o = j.publicKey; o.challenge = uBuf(o.challenge);
    return navigator.credentials.get({ publicKey: o });
  }).then(function (c) {
    if (!c) throw new Error('bad_passkey');
    return api({ action: 'pkLoginFinish', id: c.id, clientDataJSON: bufU(c.response.clientDataJSON), authenticatorData: bufU(c.response.authenticatorData), signature: bufU(c.response.signature), remember: !!LG.remember });
  }).then(function () { pkMark(true); JUST_IN = true; return api({ action: 'authMe' }); }).then(function (j) {
    LG = lgNew(); if (!j.user) throw new Error('auth_required'); return enterApp(j.user);
  }).catch(function (e) { LG.busyPk = false; LG.err = pkErr(e); render(); });
}
/* الدخول السريع من جهاز محفوظ */
function devLogin() {
  LG.err = ''; LG.busyDev = true; render();
  api({ action: 'deviceLogin' }).then(function () { JUST_IN = true; return api({ action: 'authMe' }); }).then(function (j) {
    LG = lgNew(); if (!j.user) throw new Error('auth_required'); return enterApp(j.user);
  }).catch(function (e) { LG.busyDev = false; if (/device_expired/.test(e.message)) DEV = null; LG.err = pkErr(e); render(); });
}
function devForget() { api({ action: 'deviceForget' }).catch(function () { }).then(function () { DEV = null; LG.other = false; render(); toast('نُسي هذا الجهاز'); }); }
function devHello() { return api({ action: 'deviceHello' }).then(function (h) { DEV = h.device || null; }, function () { DEV = null; }); }
function lgNew() { return { step: 'email', mail: '', to: '', err: '', busy: false, tab: 'in', remember: true }; }

/* بطاقة «مرحبًا مجددًا» أعلى نموذج الدخول */
function quickHTML() {
  var d = DEV, pk = PK_OK && d.passkey;
  return '<div class="qback"><span class="qav">' + esc((d.name || '؟').replace(/^(د|أ|م)\.\s*/, '').charAt(0)) + '</span><div><small>مرحبًا مجددًا</small><b>' + esc(d.name) + '</b><span class="ltr">' + esc(d.email) + '</span></div></div>' +
    '<div class="lerr" id="lerr" role="alert">' + esc(LG.err) + '</div>' +
    (pk ? '<button class="btn prim qbtn" type="button" id="qpk"' + (LG.busyPk ? ' disabled' : '') + '>' + ic('finger') + (LG.busyPk ? 'بانتظار البصمة…' : 'الدخول بالبصمة') + '</button>' : '') +
    '<button class="btn ' + (pk ? '' : 'prim ') + 'qbtn" type="button" id="qdev"' + (LG.busyDev ? ' disabled' : '') + '>' + ic('bolt') + (LG.busyDev ? 'جارٍ الدخول…' : 'دخول سريع') + '</button>' +
    '<div class="lrow2"><button type="button" class="lnk" id="qother">الدخول بحساب آخر</button><button type="button" class="lnk" id="qforget">نسيان هذا الجهاز</button></div>' +
    '<div class="note lnote">' + ic('shield') + '<span>هذا الجهاز محفوظ لحسابك، فلا يلزمك رمز البريد. إن كان الجهاز مشتركًا فاضغط «نسيان هذا الجهاز».</span></div>';
}
function pkAltHTML() {
  return PK_OK ? '<div class="lor"><span>أو</span></div><button class="btn qbtn" type="button" id="qpk"' + (LG.busyPk ? ' disabled' : '') + '>' + ic('finger') + (LG.busyPk ? 'بانتظار البصمة…' : 'الدخول بالبصمة أو الوجه') + '</button>' : '';
}
function bindQuick() {
  var $ = function (i) { return document.getElementById(i); };
  if ($('qpk')) $('qpk').onclick = function () { pkLogin(); };
  if ($('qdev')) $('qdev').onclick = devLogin;
  if ($('qother')) $('qother').onclick = function () { LG.other = true; LG.err = ''; render(); };
  if ($('qforget')) $('qforget').onclick = devForget;
  if ($('lrem')) $('lrem').onchange = function () { LG.remember = $('lrem').checked; };
}

/* ---------- تفعيل البصمة على هذا الجهاز ---------- */
function pkRegister() {
  if (!PK_OK) { toast('هذا المتصفح لا يدعم الدخول بالبصمة'); return Promise.resolve(false); }
  return api({ action: 'pkRegStart' }).then(function (j) {
    var o = j.publicKey; o.challenge = uBuf(o.challenge); o.user.id = uBuf(o.user.id);
    o.excludeCredentials = (o.excludeCredentials || []).map(function (c) { return { type: 'public-key', id: uBuf(c.id) }; });
    return navigator.credentials.create({ publicKey: o });
  }).then(function (c) {
    return api({ action: 'pkRegFinish', clientDataJSON: bufU(c.response.clientDataJSON), attestationObject: bufU(c.response.attestationObject) });
  }).then(function (j) { pkMark(true); toast('فُعّل الدخول بالبصمة على ' + (j.label || 'هذا الجهاز')); return true; })
    .catch(function (e) { toast(pkErr(e)); return false; });
}
/* عرض التفعيل مرة واحدة بعد الدخول، على الأجهزة التي فيها بصمة أو وجه */
function pkOffer() {
  if (!JUST_IN) return; JUST_IN = false;
  if (!PK_OK || pkMarked() || !SESSION) return;
  try { if (localStorage.getItem('bhr_pk_no') === String(SESSION.id)) return; } catch (e) { }
  var chk = PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable ? PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable() : Promise.resolve(false);
  chk.then(function (ok) {
    if (!ok || document.getElementById('secLayer') || !SESSION) return;
    var el = document.createElement('div'); el.id = 'secLayer';
    el.innerHTML = '<div class="mscrim" data-sclose="1"></div><section class="mdl pkoffer" role="dialog" aria-modal="true" aria-labelledby="pkT"><div class="pkhero">' + ic('finger') + '</div>' +
      '<h2 id="pkT">ادخل بالبصمة في المرة القادمة</h2><p>فعّل البصمة أو بصمة الوجه على هذا الجهاز، وادخل بلمسة واحدة دون بريد ولا رمز. البصمة لا تغادر جهازك ولا تُحفظ عندنا.</p>' +
      '<div class="pkbtns"><button class="btn prim" id="pkYes">' + ic('finger') + 'تفعيل الآن</button><button class="btn" id="pkLater">لاحقًا</button></div><button class="lnk" id="pkNever">لا تسألني مجددًا على هذا الجهاز</button></section>';
    document.body.appendChild(el);
    var close = function () { el.remove(); };
    el.querySelector('[data-sclose]').onclick = close; document.getElementById('pkLater').onclick = close;
    document.getElementById('pkNever').onclick = function () { try { localStorage.setItem('bhr_pk_no', String(SESSION.id)); } catch (e) { } close(); };
    document.getElementById('pkYes').onclick = function () { var b = this; b.disabled = true; pkRegister().then(function (ok) { if (ok) close(); else b.disabled = false; }); };
  });
}

/* ---------- «الدخول والأمان»: البصمات والأجهزة المحفوظة ---------- */
var SEC = null;
function secOpen() { SEC = { data: null, err: '' }; drawSec(); api({ action: 'secList' }).then(function (j) { SEC.data = j; drawSec(); }, function (e) { SEC.err = errText(e); drawSec(); }); }
function drawSec() {
  var old = document.getElementById('secLayer'); if (old) old.remove();
  var d = SEC.data, el = document.createElement('div'); el.id = 'secLayer';
  var when = function (t) { var x = pdt(t); return x ? agoD(x) : '—'; };
  var body = !d ? '<div class="empty">' + (SEC.err ? esc(SEC.err) : 'جارٍ التحميل…') + '</div>' :
    '<section class="ast"><h3>' + ic('finger') + 'البصمة والوجه</h3>' +
      (d.passkeys.length ? '<ul class="slist">' + d.passkeys.map(function (p) { return '<li>' + tile('emerald', 'finger') + '<div><b>' + esc(p.label) + '</b><small>أُضيفت ' + when(p.created) + ' · آخر دخول ' + when(p.used) + '</small></div><button class="btn sm" data-srm="passkey:' + p.id + '">إلغاء</button></li>'; }).join('') + '</ul>'
        : '<p class="hint">لم تفعّل الدخول بالبصمة بعد. فعّله على جوالك أو حاسوبك لتدخل بلمسة.</p>') +
      (PK_OK && pkMarked() && d.passkeys.length ? '<p class="hint">' + ic('check') + ' البصمة مفعّلة على هذا الجهاز. <button type="button" class="lnk" id="secAddPk">إضافة مفتاح آخر (جوال أو مفتاح أمان)</button></p>' : PK_OK ? '<button class="btn prim" id="secAddPk">' + ic('plus') + 'تفعيل البصمة على هذا الجهاز</button>' : '<p class="hint">هذا المتصفح لا يدعم البصمة؛ جرّب Chrome أو Safari أو Edge حديثًا.</p>') + '</section>' +
    '<section class="ast"><h3>' + ic('bolt') + 'الأجهزة المحفوظة للدخول السريع</h3>' +
      (d.devices.length ? '<ul class="slist">' + d.devices.map(function (v) { return '<li>' + tile(v.current ? 'gold' : 'sapphire', 'shield') + '<div><b>' + esc(v.label) + (v.current ? ' <span class="pill ok"><i></i>هذا الجهاز</span>' : '') + '</b><small>آخر دخول ' + when(v.used) + ' · يبقى محفوظًا حتى ' + fdx(pdate(v.expires)) + '</small></div><button class="btn sm" data-srm="device:' + v.id + '">إزالة</button></li>'; }).join('') + '</ul>'
        : '<p class="hint">لا أجهزة محفوظة.</p>') +
      (d.devices.some(function (v) { return v.current; }) ? '' : '<button class="btn" id="secRemember">' + ic('shield') + 'احفظ هذا الجهاز ' + d.deviceDays + ' يومًا</button>') + '</section>' +
    '<div class="note">' + ic('lock') + '<span>البصمة تبقى داخل جهازك، والمنصة تحفظ مفتاحًا عامًا لا يصلح لغير التحقق. إن فقدت جهازًا فأزله من هنا فورًا.</span></div>';
  el.innerHTML = '<div class="mscrim" data-sclose="1"></div><section class="mdl secm" role="dialog" aria-modal="true" aria-labelledby="secT"><header class="mh">' + tile('amethyst', 'key') + '<div><h2 id="secT">الدخول والأمان</h2><p>' + esc(SESSION ? SESSION.email : '') + '</p></div><button class="ib mx" data-sclose="1" aria-label="إغلاق">' + ic('plus') + '</button></header><div class="abody">' + body + '</div></section>';
  document.body.appendChild(el);
  el.querySelectorAll('[data-sclose]').forEach(function (b) { b.onclick = function () { el.remove(); }; });
  el.querySelectorAll('[data-srm]').forEach(function (b) { b.onclick = function () { var p = b.dataset.srm.split(':'); b.disabled = true;
    api({ action: 'secRemove', kind: p[0], id: p[1] }).then(function (j) { SEC.data = j; if (p[0] === 'passkey' && !j.passkeys.length) pkMark(false); drawSec(); toast(p[0] === 'passkey' ? 'أُلغيت البصمة' : 'أُزيل الجهاز'); }, function (e) { b.disabled = false; toast(errText(e)); }); }; });
  var a = document.getElementById('secAddPk'); if (a) a.onclick = function () { a.disabled = true; pkRegister().then(function () { secOpen(); }); };
  var r = document.getElementById('secRemember'); if (r) r.onclick = function () { r.disabled = true; api({ action: 'secRemove', kind: 'remember' }).then(function (j) { SEC.data = j; drawSec(); toast('حُفظ هذا الجهاز للدخول السريع'); }, function (e) { r.disabled = false; toast(errText(e)); }); };
  var f = el.querySelector('.mx'); if (f) f.focus();
}
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { var l = document.getElementById('secLayer'); if (l) l.remove(); } });
document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('#secBtn')) secOpen(); });

window.addEventListener('hashchange', route);
boot();
})();
