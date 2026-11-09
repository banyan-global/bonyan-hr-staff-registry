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
  { v: 'bonyan', n: 'شركة بنيان للتدريب', c: '#2B3155' }, { v: 'uni', n: 'جامعة بنيان العالمية (بنين)', c: '#6b3624' },
  { v: 'hum', n: 'بنيان الإنسانية', c: '#7d2a2f' }, { v: 'waqf', n: 'وقف بنيان', c: '#05603a' },
  { v: 'afaq', n: 'آفاق للتعريف بالإسلام', c: '#6a2531' }, { v: 'acad', n: 'أكاديمية بنيان', c: '#465679' },
  { v: 'maarif', n: 'كلية المعارف', c: '#2f339a' }, { v: 'kafaa', n: 'كفاءة تقنية', c: '#4b3cc0' },
  { v: 'tamkeen', n: 'دار التمكين', c: '#163061' }, { v: 'tedu', n: 'تمكين التعليم', c: '#5b3d76' },
  { v: 'uniw', n: 'جامعة بنيان العالمية (بنات)', c: '#7a3352' }, { v: 'remote', n: 'شركة بنيان للتدريب (عن بعد)', c: '#2f5d8a' }, { v: 'kenya', n: 'بنيان كينيا', c: '#562670' }, { v: 'taqat', n: 'طاقات', c: '#1c6340' }
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
function sigHTML() { return '<div class="sigblock"><a class="sigp" href="mailto:osama.mo.bonyan@gmail.com?subject=%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%AA%D9%82%D9%86%D9%8A%20%E2%80%94%20%D9%85%D9%86%D8%B5%D8%A9%20%D8%A8%D9%86%D9%8A%D8%A7%D9%86%20%D9%84%D9%84%D9%85%D9%88%D8%A7%D8%B1%D8%AF%20%D8%A7%D9%84%D8%A8%D8%B4%D8%B1%D9%8A%D8%A9" title="osama.mo.bonyan@gmail.com"><span class="sm">' + ic('edit') + '</span><span>تطوير وتنفيذ <b>أسامة جنيدي</b></span><i></i><span class="tt">أخصائي بيانات ومطوّر أنظمة</span></a><span class="cp">© ' + new Date().getFullYear() + ' مجموعة بنيان العالمية</span></div>'; }
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
  var by = { bad: [], warn: [], info: [], ok: [], nofile: [] }; all.forEach(function (x) { by[st(x.d.days)].push(x); if (!x.d.file && !x.d.opt) by.nofile.push(x); });
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
  bad_email: 'اكتب بريدًا إلكترونيًا صحيحًا.', bad_code: 'الرمز غير صحيح أو انتهت صلاحيته. تأكد منه، أو اطلب رمزًا جديدًا.', code_expired: 'انتهت صلاحية الرمز، اطلب رمزًا جديدًا.',
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
  return { view: h('staff.view'), edit: h('staff.edit'), files: h('staff.files'), pay: h('finance.view'), mail: h('staff.mail'), export: h('staff.export'), audit: h('audit.view'), override: h('requests.override'), forms: h('requests.forms'), hEv: h('home.events'), hCal: h('home.cal'), hLog: h('home.log'), hCon: h('home.contact'),
    users: h('users.manage'), drive: h('backup.run'), sys: h('audit.view') || h('users.manage') || h('backup.run') || h('settings.manage'), approve: h('requests.approve'), leave: false, payedit: false,
    attv: h('attendance.view'), attm: h('attendance.manage'), news: h('announce.manage'), reports: h('reports.view'), settings: h('settings.manage') };
}
function can(p) { return role !== 'staff' && !!CAP[p]; }
function firstOf(name) { var w = String(name || '').trim().split(/\s+/); return /^(د|أ|م|ا|م\.|د\.|أ\.)\.?$/.test(w[0]) && w[1] ? w[0] + ' ' + w[1] : w[0] || ''; }

/* ---------- mapping server rows to the console model ---------- */
var ENT_KEY = { bonyan: 'bonyan', 'bonyan-university': 'uni', 'bonyan-humanitarian': 'hum', 'bonyan-waqf': 'waqf', afaq: 'afaq', 'bonyan-academy': 'acad', almaarif: 'maarif', 'kafaa-tech': 'kafaa', 'dar-altamkeen': 'tamkeen', 'tamkeen-education': 'tedu', 'bonyan-university-women': 'uniw', 'bonyan-remote': 'remote', 'bonyan-kenya': 'kenya', taqat: 'taqat' };
function nk(s) { return String(s || '').trim().toLowerCase().replace(/\s+/g, ' '); }
var ENT_IDX = {}; (CFG.ENTITIES || []).forEach(function (e) { [e.v, e.ar, e.en, e.id].concat(e.old || []).forEach(function (x) { if (x) ENT_IDX[nk(x)] = e; }); });
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
  /* الصورة الشخصية اختيارية للمنسوبات: لا تُعدّ نقصًا */
  var female = /^(female|f|أنثى|انثى|perempuan|wanita)$/i.test(String(r.gender || '').trim());
  if (!hasF(r.photo) && !female) miss.push('الصورة الشخصية');
  if (!bank && !/أخرى|other|lain|نقد|cash/i.test(r.payMethod || '')) miss.push('الحساب البنكي');
  /* الهوية الوطنية والإقامة: يكفي وجود صورة إحداهما، فلا تُعدّ الأخرى نقصًا */
  var idOk = hasF(r.nationalIdScan) || hasF(r.permitScan);
  docs.forEach(function (d) { if (!d.file && idOk && (d.t === 'الهوية الوطنية' || d.t === 'الإقامة')) d.opt = d.t === 'الإقامة' ? 'تكفي صورة الهوية الوطنية' : 'تكفي صورة الإقامة'; });
  docs.forEach(function (d) { if (!d.file && !d.opt && d.t !== 'العقد') miss.push('صورة ' + d.t); });
  if (!r.officialEmail && !r.personalEmail) miss.push('البريد الإلكتروني');
  if (!r.mobile && !r.whatsapp) miss.push('رقم الجوال');
  var cur = (/[A-Z]{3}/.exec(r.currency || '') || [])[0] || DEFCUR[cc] || 'SAR';
  var s = { ref: r.ref, r: r, name: name, latin: String(r.fullNameLatin || ''), ini: name.charAt(0), job: String(r.jobTitle || '').trim() || '—', ent: entOf(r.entity), c: ctryOf(cc, r.workCountry),
    reg: pdt(r.createdAt) || new Date(0), upd: pdt(r.updatedAt), hire: pdate(r.startDate), docs: docs, base: parseFloat(String(r.salary || '').replace(/[^\d.]/g, '')) || 0, allow: 0, cur: cur,
    miss: miss, mailed: !!MAILED[r.ref], self: false, phone: String(r.mobile || r.whatsapp || ''), wa: String(r.whatsapp || r.mobile || ''), mail: String(r.officialEmail || r.personalEmail || ''),
    female: female, iban: bank ? '•••• ' + bank.slice(-4) : '', nat: CNAME[String(r.nationality || '').toUpperCase()] || String(r.nationality || '').trim(), photo: urls(r.photo)[0] || '', lang: /^(ar|en|id)$/.test(r.lang || '') ? r.lang : '' };
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
    api({ action: 'reqList', asStaff: role === 'staff' ? 1 : 0 }).catch(function () { return null; }),
    api({ action: 'siteGet' }).catch(function () { return null; })
  ]).then(function (R) {
    if (R[3]) seed('reqs', R[3].rows);
    if (R[4]) { SITE = R[4].site; UI_HOME = (R[4].ui && R[4].ui.home) || null; }
    var j = R[0]; MAILED = j.mailed || {}; ENT_MAP = {}; CT_MAP = {};
    STAFF = (j.rows || []).map(toStaff).sort(function (a, b) { return b.reg - a.reg; });
    rebuildIndex();
    if (R[1]) seed('audit', R[1]); if (R[2]) seed('health', R[2]);
    seed('list', true);
  });
}
function reloadList() { return api({ action: 'list' }).then(function (j) { MAILED = j.mailed || {}; STAFF = (j.rows || []).map(toStaff).sort(function (a, b) { return b.reg - a.reg; }); rebuildIndex(); }); }
function loadMe() {
  api({ action: 'reqList', asStaff: role === 'staff' ? 1 : 0 }).then(function (j) { seed('reqs', j.rows); if (screen === 'app') softRender(); }).catch(function () { });
  api({ action: 'newsList', asStaff: role === 'staff' ? 1 : 0 }).then(function (j) { seed('news', j); if (screen === 'app') softRender(); }).catch(function () { });
  return Promise.all([api({ action: 'me' }), api({ action: 'myExtra' }).catch(function () { return null; })]).then(function (R) {
    var j = R[0]; if (R[1]) { SITE = R[1].site; MY_BAL = R[1].balance || null; }
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
  stopMap(); closePops(); globeKill();
  if (screen === 'loading') { app.innerHTML = '<div class="bootscr" role="status"><span class="lt"><img src="' + LOGO + '" alt=""></span><b>منصة بنيان للموارد البشرية</b><i class="spin" aria-hidden="true"></i><span class="sr">جارٍ التحميل</span></div>'; return; }
  if (screen === 'login') { app.innerHTML = loginHTML(); bindLogin(); startMap(document.getElementById('lmap'), true); loginGlobe(); return; }
  if (screen === 'noreg') { app.innerHTML = noregHTML(); bindNoreg(); startMap(document.getElementById('lmap'), true); return; }
  if (openG === null) openG = grpOf(view);
  var body;
  try { body = VIEWS[view](); } catch (e) { if (window.console) console.error(e); body = '<section class="pn"><div class="empty">تعذّر عرض هذه الصفحة. حدّث الصفحة وحاول مرة أخرى.</div></section>'; }
  app.innerHTML = '<div class="shell"><aside class="side" id="side">' + sideHTML() + '</aside><div class="main">' + topHTML() + '<main class="page" id="page">' + body + footHTML() + '</main></div></div>' + bnavHTML();
  bind(); bindLive(); bindReq(); bindHrx();
  if (view === 'home') { homeGlobe(); tickClocks(); }
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
  return '<section class="login"><canvas id="lmap" aria-hidden="true"></canvas><div class="lglobe"><span class="lgchip"><i></i>مجموعة بنيان العالمية حول العالم</span><div class="hero-globe"><canvas id="lglobe" role="img" aria-label="الكرة الأرضية: دول عمل المنسوبين"></canvas><div class="globe-tip" id="lgTip" hidden></div></div><div class="lgsum" id="lgSum"></div></div><div class="lwrap"><form class="lcard" id="lf" novalidate style="margin-top:46px"><div class="lhead"><span class="lt"><img src="' + LOGO + '" alt="بنيان"></span><h1>منصة بنيان للموارد البشرية</h1><p>مجموعة بنيان العالمية</p></div>' + tabs + f + '</form>' +
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
    myRows().filter(function (r) { return r.status !== 'pending' && r.status !== 'cancelled' && Date.now() - pdt(r.updatedAt) < 14 * DAY; }).slice(0, 3).forEach(function (r) { out.push([r.status === 'approved' ? 'emerald' : 'garnet', r.status === 'approved' ? 'check' : 'alert', (r.status === 'approved' ? 'اعتُمد طلبك ' : 'لم يُعتمد طلبك ') + r.no, reqSum(r), '', 'myreq']); });
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
    (role === 'staff' && S('staff', 'update') ? '<a class="btn goldb topcta" href="update.html?me=1">' + ic('edit') + '<span>تحديث بياناتي</span></a>' : '') +
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
  if (!tot) return '<section class="hero"><div class="hero-in"><div>' + rl + '<p class="sum">لا يوجد منسوبون في السجل بعد. شارك رابط التسجيل مع المنسوبين، وسيظهر كل من يسجّل هنا فورًا.</p><div class="chips"><button class="chip" data-act="regLink"><i style="background:#e3c485"></i>نسخ رابط التسجيل</button></div></div><div class="mapbox gbox"><div class="hero-globe"><canvas id="hglobe" role="img" aria-label="الكرة الأرضية: توزيع المنسوبين"></canvas><div class="globe-tip" id="hgTip" hidden></div></div></div></div>' + clocksHTML() + '</section>';
  var done = CNT.done, gap = CNT.gap, exp = CNT.exp, soon = CNT.soon, paid = STAFF.filter(function (s) { return s.base > 0 && FX[s.cur]; });
  var pay = paid.reduce(function (a, s) { return a + sar(s); }, 0);
  var nC = CTRY.length, nE = ENT.length, wk = STAFF.filter(function (s) { return Date.now() - s.reg < 7 * DAY; }).length;
  var sum = 'يضم السجل <b>' + nq(tot, 'منسوبًا واحدًا', 'منسوبَين', 'منسوبين', 'منسوبًا') + '</b> في <b>' + nq(nC, 'دولة واحدة', 'دولتين', 'دول', 'دولة') + '</b> و<b>' + nq(nE, 'جهة واحدة', 'جهتين', 'جهات', 'جهة') + '</b>. ' +
    (exp ? 'لديك اليوم <b>' + nq(exp, 'منسوب واحد', 'منسوبان', 'منسوبين', 'منسوبًا') + ' بوثيقة منتهية</b>' : 'لا توجد وثائق منتهية') + (soon ? '، و<b>' + soon + '</b> تنتهي وثائقهم خلال ٣٠ يومًا' : '') + (gap ? '، و<b>' + nq(gap, 'ملف واحد ناقص', 'ملفان ناقصان', 'ملفات ناقصة', 'ملفًا ناقصًا') + '</b>.' : '.');
  var hero = '<section class="hero"><div class="hero-in"><div>' + rl + '<p class="sum">' + sum + '</p>' +
    '<div class="chips">' + [['people', 'all', 'المنسوبون', tot, '#e3c485'], ['people', 'done', 'مكتمل', done, '#5cdba0'], ['people', 'gap', 'ناقص', gap, '#ffc966'], ['documents', 'bad', 'وثائق منتهية', exp, '#ff8697'], ['documents', 'warn', 'تنتهي خلال ٣٠ يومًا', soon, '#b9a6ff']].map(function (c) {
      return '<a class="chip" href="#' + c[0] + '"' + (c[0] === 'people' ? ' data-f="' + c[1] + '"' : ' data-bk="' + c[1] + '"') + '><i style="background:' + c[4] + '"></i><b>' + c[3] + '</b>' + c[2] + '</a>'; }).join('') + '</div></div>' +
    '<div class="mapbox gbox"><div class="hero-globe"><canvas id="hglobe" role="img" aria-label="الكرة الأرضية، توزيع المنسوبين: ' + esc(CTRY.map(function (c) { return c.n + ' ' + STAFF.filter(function (s) { return s.c.cc === c.cc; }).length; }).join('، ')) + '"></canvas><div class="globe-tip" id="hgTip" hidden></div></div></div></div>' + clocksHTML() + '</section>';

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
  var docOk = docsAll.length ? docsAll.filter(function (d) { return d.days > 30 && (d.file || d.opt); }).length / docsAll.length : 1;
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
  /* لا يظهر إلا ما يملكه المستخدم فعلًا: الصلاحية + القسم الظاهر له (ما يُخفيه النظام لا يظهر أصلًا) */
  var QV = { backupNow: function () { return can('sys'); }, health: function () { return can('sys'); } };
  QA = QA.filter(function (q) { return can(q[4]) && (!QV[q[3]] || QV[q[3]]()); });
  var qa = QA.length ? pn('teal', 'bolt', 'إجراءات سريعة', '', '', '<div class="pb"><div class="qa">' + QA.map(function (q) { return '<button data-act="' + q[3] + '">' + tile(q[0], q[1]) + q[2] + '</button>'; }).join('') + '</div></div>') : '';
  var cal = pn('sapphire', 'calendar', 'تقويم انتهاء الوثائق', 'أربعة أسابيع مضت واثنا عشر أسبوعًا قادمة، وكل مربع وثيقة', more('الوثائق', '#documents'), calHTML());
  var ents = ENT.map(function (e) { return { e: e, ss: STAFF.filter(function (s) { return s.ent.v === e.v; }) }; });
  /* الجهات أولًا: بطاقات أفقية متساوية، مرتبة بعدد المنسوبين، موزّعة على صفوف متوازنة (٧ ← ٤ + ٣) */
  var eCols = nE <= 4 ? Math.max(nE, 1) : Math.ceil(nE / Math.ceil(nE / 4));
  var entP = pn('gold', 'building', 'الجهات', nq(nE, 'جهة واحدة', 'جهتان', 'جهات', 'جهة') + ' · ' + nq(tot, 'منسوب واحد', 'منسوبان', 'منسوبين', 'منسوبًا'), (can('edit') ? '<button type="button" class="btn sm" data-entmove="">' + ic('users') + 'نقل بين الجهات</button> ' : '') + more('دليل المنسوبين', '#people'), '<div class="pb"><div class="ents2" style="--cols:' + eCols + '">' + ents.map(function (x, i) { var dn2 = x.ss.filter(function (s) { return s.status === 'مكتمل'; }).length, p = pct(dn2, x.ss.length), lg = elogo(x.e);
    return '<button class="ent2" style="--ec:' + x.e.c + '" data-ent="' + esc(x.e.v) + '" title="عرض منسوبي ' + esc(x.e.n) + '"><span class="lg">' + (lg && lg.indexOf('<img') > -1 ? lg : '<span class="ini">' + esc((x.e.n || '؟').trim().charAt(0)) + '</span>') + '</span>' +
      '<span class="bd"><b class="nm">' + esc(x.e.n) + '</b><span class="mt"><em>' + x.ss.length + '</em> منسوبًا · ' + p + '٪ مكتمل</span><span class="tr"><i style="width:' + p + '%"></i></span></span></button>'; }).join('') + '</div></div>');
  var recent = pn('emerald', 'userok', 'أحدث المنسوبين', '', more('الكل', '#people'), '<ul class="lst">' + STAFF.slice(0, 5).map(function (s) { return '<li style="cursor:pointer" data-open="' + esc(s.ref) + '">' + avP(s) + '<div><b>' + esc(s.name) + '</b><span class="s">' + esc(s.ent.n) + '، ' + esc(s.c.n) + ' · ' + agoD(s.reg) + '</span></div>' + (s.status === 'مكتمل' ? '<span class="pill ok"><i></i>مكتمل</span>' : '<span class="pill warn"><i></i>ناقص</span>') + '</li>'; }).join('') + '</ul>');
  var log = can('hLog') && can('audit') ? pn('slate', 'history', 'آخر العمليات', '', more('السجل الكامل', '#log'), tlHTML(6)) : '';
  var third = can('users') ? readyPanel() : can('hCon') ? quickFacts() : '';
  /* صفحة رئيسية مختصرة يرتّبها كل مستخدم بنفسه (زر «ترتيب الواجهة»)؛ والصلاحيات وإعدادات المنصة تحدد ما يُتاح أصلًا */
  var H = function (k) { return S('home', k); };
  var B = { hero: H('hero') && hero, kpis: H('kpis') && kpis, ents: H('ents') && entP, quality: H('quality') && quality, geo: H('quality') && geo, doclvl: H('quality') && docLvl,
    cal: H('cal') && can('hCal') && cal, recent: H('recent') && recent, log: H('recent') && log, third: H('recent') && third, status: H('charts') && stDonut, qa: H('qa') && qa, events: H('events') && can('hEv') && eventsPanel() };
  HOME_AV = HOME_BLOCKS.filter(function (x) { return B[x[0]]; }).map(function (x) { return x[0]; });
  var ord = homeOrder(HOME_AV), out = '', buf = [];
  var flush = function () { /* اللوحات الصغيرة تُرصّ في صفوف متوازنة: ٣ في الصف، و٤ ← ٢ + ٢ */
    while (buf.length) { var n = buf.length === 4 || buf.length === 2 ? 2 : Math.min(3, buf.length); var r = buf.splice(0, n); out += '<div class="grid g' + (r.length === 1 ? '1' : r.length) + '">' + r.join('') + '</div>'; } };
  ord.forEach(function (k) { if (HOME_FULL[k]) { flush(); out += B[k]; } else buf.push(B[k]); }); flush();
  return '<div class="hcbar"><button class="btn sm" id="hcOpen" title="رتّب لوحات صفحتك وأخفِ ما لا تحتاجه">' + ic('grid') + 'ترتيب الواجهة</button></div>' + out;
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
  return '<div class="docs" data-fvg>' + (docs.length ? docs.map(function (d) { var left = d.days > 9000 ? 1 : Math.max(0, Math.min(1, d.days / (DOC_LIFE[d.t] || 730)));
    return '<div class="doc"><span class="th">' + ic(d.t === 'العقد' ? 'doc' : 'pass') + '<small>' + (d.file ? 'ملف' : '—') + '</small></span><div><b>' + d.t + '</b><span class="s">' + (withNo && d.no ? '<span class="ltr">' + esc(d.no) + '</span>، ' : '') + (d.exp ? 'تنتهي ' + fd(d.exp) : 'بلا تاريخ انتهاء') + '</span>' +
      '<div class="life"><i style="width:' + (left * 100) + '%;background:' + STC[st(d.days)] + '"></i></div>' + (d.urls.length ? '<div class="flinks">' + d.urls.map(function (u, i) { return '<a href="' + esc(u) + '" data-fvt="' + esc(d.t + (d.urls.length > 1 ? ' · ' + (i + 1) : '')) + '">' + ic('eye') + 'عرض' + (d.urls.length > 1 ? ' ' + (i + 1) : '') + '</a>'; }).join('') + '</div>' : '') + '</div>' +
      (d.opt && d.days >= 0 ? '<span class="pill info"><i></i>' + d.opt + '</span></div>' : '<span class="pill ' + (d.file ? st(d.days) : 'bad') + '"><i></i>' + (d.file || d.days < 0 ? dl(d.days) : 'الصورة غير مرفوعة') + '</span></div>'); }).join('') : '<div class="empty">لا توجد وثائق مسجّلة.</div>') + '</div>';
}
function kvHTML(list) { return '<dl class="kv">' + list.filter(function (p) { return p[1] !== '' && p[1] != null; }).map(function (p) { return '<div><dt>' + p[0] + '</dt><dd>' + p[1] + '</dd></div>'; }).join('') + '</dl>'; }
function ltr(v) { return v ? '<span class="ltr">' + esc(v) + '</span>' : '—'; }
function completeness(s) { var tot = 4 + s.docs.filter(function (d) { return d.t !== 'العقد'; }).length; return Math.round(Math.max(0, tot - s.miss.length) / tot * 100); }
function ksec(title, icn, list) { var b = kvHTML(list); return '<section class="ksec"><h3>' + ic(icn) + title + '</h3>' + b + '</section>'; }
function profHTML(s) {
  var r = s.r, myReqs = reqRows().filter(function (x) { return x.ref === s.ref; }), openR = myReqs.filter(function (x) { return x.status === 'pending'; }).length;
  var T = [['over', 'الملخص', 'card'], ['info', 'البيانات', 'user'], ['docs', 'الوثائق', 'pass', s.docs.filter(function (d) { return d.days <= 30 || (!d.file && !d.opt); }).length], ['pay', 'المالية', 'wallet'], ['reqs', 'الطلبات', 'stamp', openR], ['log', 'السجل', 'history']]
    .filter(function (t) { return (t[0] !== 'pay' || can('pay')) && (t[0] !== 'log' || can('audit') || can('mail')); });
  if (!T.some(function (t) { return t[0] === ptab; })) ptab = 'over';
  var body = '', pc = completeness(s);
  if (ptab === 'over') body = '<div class="psum"><div class="cardcol">' + cardHTML(s) + '</div><div class="pside">' +
      '<div class="meter"><div class="mt"><span>اكتمال الملف</span><b>' + pc + '٪</b></div><div class="bar"><i style="width:' + pc + '%;background:' + (pc === 100 ? 'var(--c-ok)' : pc >= 60 ? 'var(--c-warn)' : 'var(--c-bad)') + '"></i></div></div>' +
      (mod('reqs') ? balHTML(lbal(s.ref), true) : '') + '<dl class="facts">' + [['sapphire', 'building', 'الجهة', s.ent.full || s.ent.n], ['emerald', 'user', 'المسمى الوظيفي', s.job], ['teal', 'globe', 'دولة العمل', s.c.n], ['gold', 'clock', 'مدة الخدمة', svc(s.hire)], ['amethyst', 'calendar', 'تاريخ المباشرة', s.hire ? fd(s.hire) : '—'], ['slate', 'phone', 'الجوال', s.phone || '—']].map(function (f) {
        return '<div class="fact">' + tile(f[0], f[1]) + '<div style="min-width:0"><dt>' + f[2] + '</dt><dd' + (f[1] === 'phone' ? ' class="ltr"' : '') + '>' + esc(f[3]) + '</dd></div></div>'; }).join('') + '</dl></div></div>' +
    (s.miss.length ? '<div><h3 class="h3s">نواقص الملف</h3><div class="miss">' + s.miss.map(function (m) { return '<div><span>' + m + '</span>' + (can('mail') ? '<button class="btn sm" data-msggap="' + esc(s.ref) + '">اطلبه من المنسوب</button>' : '') + '</div>'; }).join('') + '</div></div>' : '<div class="note">' + ic('check') + '<span>الملف مكتمل، وكل الوثائق المطلوبة مرفوعة.</span></div>');
  if (ptab === 'info') body = '<div class="ksecs">' +
    ksec('الهوية', 'user', [['الاسم بالعربية', esc(s.name)], ['الاسم كما في الجواز', s.latin ? '<span class="ltr">' + esc(s.latin) + '</span>' : '—'], ['الجنسية', esc(s.nat || '—')], ['أعلى مؤهل', esc(r.topDegree || '—')]]) +
    ksec('التواصل', 'chat', [['الجوال', ltr(r.mobile)], ['الواتساب', ltr(r.whatsapp)], ['البريد الرسمي', r.officialEmail ? '<span class="ltr" style="font-size:13.5px">' + esc(r.officialEmail) + '</span>' : '—'], ['البريد الشخصي', r.personalEmail ? '<span class="ltr" style="font-size:13.5px">' + esc(r.personalEmail) + '</span>' : '—']]) +
    ksec('الوظيفة', 'building', [['الجهة', esc(s.ent.full || s.ent.n)], ['المسمى', esc(s.job)], ['الإدارة', esc(r.department || '—')], ['المدير المباشر', esc(r.manager || '—')], ['دولة العمل', esc(s.c.n)], ['تاريخ المباشرة', fdx(s.hire)]]) +
    ksec('السجل في المنصة', 'history', [['الرقم المرجعي', '<span class="ltr">' + esc(s.ref) + '</span>'], ['تاريخ التسجيل', fdx(s.reg) + ' <small class="mu">' + agoD(s.reg) + '</small>'], ['آخر تحديث', s.upd ? fd(s.upd) + ' <small class="mu">' + agoD(s.upd) + '</small>' : '—'], ['رسالة التأكيد', s.mailed ? 'أُرسلت إلى بريده' : '<span class="pill mute"><i></i>لم تُرسل</span>']]) + '</div>';
  if (ptab === 'docs') body = docRows(s.docs, true) + '<div class="note">' + ic('archive') + '<span>عند استبدال وثيقة تنتقل النسخة القديمة إلى الأرشيف ولا تُحذف، ويمكن استرجاعها من التعديل التفصيلي.</span></div>';
  if (ptab === 'pay') body = kvHTML([['الراتب الشهري', s.base ? '<span class="tn">' + n(s.base) + ' ' + esc(curS(s.cur)) + '</span>' : '—'], ['العملة', esc(curN(s.cur))], ['المكافئ التقريبي بالريال', s.base && FX[s.cur] ? '<span class="tn">' + n(sar(s)) + ' ر.س</span>' : '—'],
      ['طريقة الاستلام', esc(r.payMethod || '—')], ['البنك', esc(r.bankName || '—')], ['دولة البنك', esc(r.bankCountry || '—')], ['الحساب', s.iban ? '<span class="ltr">' + esc(s.iban) + '</span>' : '<span class="pill bad"><i></i>غير مسجل</span>']]) +
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
    (can('edit') ? '<button type="button" role="menuitem" data-entmove="' + esc(s.ref) + '">' + tile('gold', 'building') + '<span><b>تغيير الجهة</b><small>نقله إلى جهة عمل أخرى</small></span></button>' : '') +
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
      (s.iban ? '<span class="ltr">' + esc(s.iban) + '</span>' : '<span class="pill bad"><i></i>غير مسجل</span>' + (can('mail') ? ' <button class="btn sm" data-msgbank="' + esc(s.ref) + '" data-stop="1">اطلبه</button>' : '')) + '</td></tr>'; }).join('') : '<tr><td colspan="7" class="empty">لا أحد في هذه التصفية.</td></tr>') + '</tbody></table></div>';
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
var ACQ = '', RPE = null;
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
  if (!RPE || RPE.src !== rp) RPE = { src: rp, map: JSON.parse(JSON.stringify(rp)), busy: false };
  var dirty = JSON.stringify(RPE.map) !== JSON.stringify(rp), def = d.roleDefaults || {};
  var matrix = '<div class="pb rpbar"><span>' + ic('info') + (dirty ? '<b>لديك تعديلات لم تُحفظ.</b> ' : '') + 'اضغط أي خانة لتمنح الدور الصلاحية أو تسحبها، ثم احفظ. يسري التعديل فورًا على كل حساب يتبع صلاحيات دوره؛ أما الحسابات «المخصّصة» فتبقى كما هي.</span>' +
      (d.roleCustom ? '<button class="btn sm" id="rpReset"' + (RPE.busy ? ' disabled' : '') + '>استعادة الافتراضي</button>' : '') + (dirty ? '<button class="btn sm" id="rpUndo">تراجع</button>' : '') +
      '<button class="btn goldb sm" id="rpSave"' + (dirty && !RPE.busy ? '' : ' disabled') + '>' + (RPE.busy ? 'جارٍ الحفظ…' : 'حفظ الصلاحيات') + '</button></div>' +
    '<div class="tw"><table class="matrix rpe"><thead><tr><th>الصلاحية</th>' + cols.map(function (k) { return '<th>' + esc(roles[k] || k) + '</th>'; }).join('') + '</tr></thead><tbody>' +
    PERM_GROUPS.map(function (g) { return '<tr class="mg"><td colspan="' + (cols.length + 1) + '">' + g[0] + '</td></tr>' + g[1].map(function (p) { return '<tr><td><span class="pcell">' + esc(p[1]) + '</span></td>' + cols.map(function (k) {
      var on = RPE.map[k].indexOf(p[0]) > -1, ch = on !== (rp[k].indexOf(p[0]) > -1), lock = k === 'admin' && p[0] === 'users.manage';
      return '<td><button type="button" class="pm ' + (on ? 'y' : 'n') + (ch ? ' ch' : '') + '" data-rpk="' + k + '" data-rpp="' + p[0] + '"' + (lock ? ' disabled title="تبقى لمدير النظام دائمًا حتى لا يُغلق النظام"' : '') + ' aria-pressed="' + on + '" aria-label="' + esc(p[1]) + ' — ' + esc(roles[k] || k) + '">' + (on ? ic('check') : '—') + '</button></td>'; }).join('') + '</tr>'; }).join(''); }).join('') +
    '</tbody></table></div><div class="calnote"><span>الصلاحيات تُفحص في الخادم مع كل عملية، وكل تعديل يُسجَّل باسمك في سجل العمليات. ولتخصيص صلاحيات موظف بعينه افتح «تعديل» عند اسمه.</span></div>';
  return '<div class="tabs2">' + [['sapphire', 'users', cnt.all, 'موظفًا بحساب إداري'], ['emerald', 'check', cnt.on, 'حسابًا مفعّلًا'], ['garnet', 'lock', cnt.off, 'حسابًا موقوفًا'], ['gold', 'bell', cnt.notify, 'تصلهم التنبيهات'], ['teal', 'userok', d.staffAccounts || 0, 'منسوبًا دخل صفحته']].map(function (x) { return '<div class="stat">' + tile(x[0], x[1]) + '<div><b>' + x[2] + '</b><span>' + x[3] + '</span></div></div>'; }).join('') + '</div>' +
    pn('emerald', 'key', 'الموظفون', 'من يدخل المنصة، وبأي دور، وبأي صلاحيات', '', table) +
    pn('sapphire', 'shield', 'مصفوفة الصلاحيات حسب الدور', 'ما يستطيعه كل دور افتراضيًا — قابلة للتعديل', '', matrix) +
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
    ['البريد الشخصي', r.personalEmail ? '<span class="ltr" style="font-size:13.5px">' + esc(r.personalEmail) + '</span>' : '—'], ['الحساب البنكي', s.iban ? '<span class="ltr">' + esc(s.iban) + '</span>' : '<span class="pill bad"><i></i>غير مسجل</span>']]);
}
VIEWS.me = function () {
  var s = ME, h = new Date().getHours(), next = s.docs.filter(function (d) { return d.exp; }).sort(function (a, b) { return a.days - b.days; })[0];
  var sum = hijri(new Date()) + '. ' + (s.status === 'مكتمل' ? 'ملفك <b>مكتمل</b>' : 'ينقص ملفك <b>' + nq(s.miss.length, 'أمر واحد', 'أمران', 'أمور', 'أمرًا') + '</b>') + (next ? '، وأقرب وثيقة تنتهي هي <b>' + next.t + '</b> (' + dl(next.days) + ').' : '.');
  var U = S('staff', 'update');
  var hero = '<section class="hero"><div class="hero-in me-hero"><div><span class="rl"><i></i>' + esc(s.job) + '، ' + esc(s.ent.n) + '</span><h1>' + (h < 12 ? 'صباح الخير' : 'مساء الخير') + ' يا ' + esc(s.name.split(' ')[0]) + '</h1><p class="sum">' + sum + '</p>' +
    '<div class="chips">' + (staffOn('myreq') ? '<a class="chip" href="#myreq-new"><i style="background:#5cdba0"></i>طلب جديد</a>' : '') + (U ? '<a class="chip" href="update.html?me=1"><i style="background:#e3c485"></i>تحديث بياناتي</a>' : '') + '<a class="chip" href="#myfile"><i style="background:#82c8f2"></i>ملفي وبطاقتي</a>' + (staffOn('myatt') ? '<a class="chip" href="#myatt"><i style="background:#7fd8e6"></i>حضوري</a>' : '') + (s.miss.length && U ? '<a class="chip" href="update.html?me=1"><i style="background:#ffc966"></i>أكمل النواقص</a>' : '') + '</div></div>' +
    (S('staff', 'card') ? '<div class="cardcol me-card">' + cardHTML(s) + '</div>' : '') + '</div></section>';
  var nd = CACHE.news && CACHE.news.data, unread = nd && nd.rows ? nd.rows.filter(function (n) { return !n.read; }) : [];
  var newsBan = staffOn('mynews') && unread.length ? '<a class="nban" href="#mynews">' + tile('gold', 'bell') + '<span><b>' + (unread.length === 1 ? 'تعميم جديد: ' + esc(unread[0].title) : unread.length + ' تعاميم جديدة من الموارد البشرية') + '</b><small>اضغط للقراءة</small></span>' + ic('back') + '</a>' : '';
  var balP = staffOn('balance') && MY_BAL && staffOn('myreq') ? pn('emerald', 'umbrella', 'رصيد إجازاتي', 'يُحتسب تلقائيًا من إجازاتك المعتمدة', '<a class="btn sm goldb" href="#myreq-new">' + ic('plus') + 'طلب إجازة</a>', '<div class="pb">' + balHTML(MY_BAL) + '</div>') : '';
  var docsOk = s.docs.filter(function (d) { return d.days > 30; }).length;
  var kp = '<div class="grid g4">' + kpi(s.status === 'مكتمل' ? 'emerald' : 'gold', s.status === 'مكتمل' ? 'userok' : 'alert', s.status === 'مكتمل' ? 'مكتمل' : s.miss.length, s.status === 'مكتمل' ? '' : 'نواقص', 'حالة ملفي', s.status === 'مكتمل' ? 'كل البيانات المطلوبة موجودة' : s.miss.slice(0, 2).join('، '), '') +
    kpi('garnet', 'pass', docsOk, 'من ' + s.docs.length, 'وثائق سارية', next ? next.t + ': ' + dl(next.days) : 'لا وثائق بتاريخ انتهاء', '') +
    kpi('teal', 'clock', '<span class="vs">' + svc(s.hire) + '</span>', '', 'مدة الخدمة', s.hire ? 'منذ ' + fd(s.hire) : 'تاريخ المباشرة غير مسجل', '') +
    kpi('sapphire', 'history', '<span class="vs">' + (s.upd ? agoD(s.upd) : '—') + '</span>', '', 'آخر تحديث لبياناتي', '<a class="more" href="update.html?me=1">تحديث الآن' + ic('back') + '</a>', '') + '</div>';
  var docs = pn('garnet', 'pass', 'وثائقي', 'تصلك رسالة من الموارد البشرية قبل انتهاء أي وثيقة', more('ملفي', '#myfile'), '<div class="pb">' + docRows(s.docs, false) + '</div>');
  var miss = pn(s.miss.length ? 'gold' : 'emerald', s.miss.length ? 'alert' : 'check', s.miss.length ? 'ما ينقص ملفي' : 'ملفي مكتمل', '', '', '<div class="pb">' + (s.miss.length ? '<div class="miss">' + s.miss.map(function (m) { return '<div><span>' + m + '</span><a class="btn sm" href="update.html?me=1">أضفه</a></div>'; }).join('') + '</div>' : '<div class="note">' + ic('check') + '<span>شكرًا لك، بياناتك ووثائقك مكتملة. إن تغيّر شيء منها حدّثه من «تحديث بياناتي».</span></div>') + '</div>');
  var data = pn('sapphire', 'user', 'بياناتي الأساسية', '', '<a class="btn sm" href="update.html?me=1">' + ic('edit') + 'تحديث</a>', '<div class="pb">' + meKV(s) + '</div>');
  return newsBan + hero + kp + (balP ? '<div class="grid g21">' + (S('staff', 'docs') ? docs : miss) + balP + '</div>' + (S('staff', 'docs') ? miss : '') : '<div class="grid g21">' + (S('staff', 'docs') ? docs : '') + miss + '</div>') + data;
};
VIEWS.myfile = function () {
  var s = ME, K = ME.kids || {};
  var qual = (K.quals || []).filter(function (x) { return x.join(''); }), ex = (K.exp || []).filter(function (x) { return x.join(''); }), lg = (K.langs || []).filter(function (x) { return x.join(''); });
  var kids = (qual.length ? '<h3 class="h3s">المؤهلات</h3><ul class="lst" style="padding:0">' + qual.map(function (q) { return '<li>' + tile('amethyst', 'cert') + '<div><b>' + esc([q[0], q[1]].filter(Boolean).join('، ')) + '</b><span class="s">' + esc([q[2], q[3], q[4]].filter(Boolean).join(' · ')) + '</span></div><span></span></li>'; }).join('') + '</ul>' : '') +
    (ex.length ? '<h3 class="h3s">الخبرات</h3><ul class="lst" style="padding:0">' + ex.map(function (q) { return '<li>' + tile('teal', 'building') + '<div><b>' + esc([q[1], q[0]].filter(Boolean).join('، ')) + '</b><span class="s">' + esc([q[2], [q[3], q[4]].filter(Boolean).join(' – ')].filter(Boolean).join(' · ')) + '</span></div><span></span></li>'; }).join('') + '</ul>' : '') +
    (lg.length ? '<h3 class="h3s">اللغات</h3><div class="miss">' + lg.map(function (q) { return '<div><span>' + esc(q[0]) + '</span><b>' + esc(q[1] || '') + '</b></div>'; }).join('') + '</div>' : '');
  return ptitle('ملفي وبطاقتي', 'بياناتك كما هي في سجل المنسوبين.' + (S('staff', 'update') ? ' لتعديل أي شيء استخدم «تحديث بياناتي»، وتصل التعديلات إلى الموارد البشرية مباشرة.' : ' لتعديل أي شيء تواصل مع الموارد البشرية.'), S('staff', 'update') ? '<a class="btn goldb" href="update.html?me=1">' + ic('edit') + 'تحديث بياناتي</a>' : '') +
    '<div class="grid g12"><div class="grid">' + (S('staff', 'card') ? '<div class="pn" style="padding:18px">' + cardHTML(s) : '<div style="display:none">') + '<div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">' + (window.BonyanApp ? '' : s.card ? '<a class="btn sm" href="' + esc(s.card) + '" download>' + ic('dl') + 'تنزيل بطاقتي</a>' : '') + '</div></div>' +
    (kids ? pn('amethyst', 'cert', 'المؤهلات والخبرات', '', '', '<div class="pb">' + kids + '</div>') : '') + '</div>' +
    pn('sapphire', 'user', 'بياناتي', '', '', '<div class="pb">' + meKV(s) + '</div>') + '</div>' +
    (S('staff', 'docs') ? pn('garnet', 'pass', 'وثائقي', '', '', '<div class="pb">' + docRows(s.docs, true) + '</div>') : '');
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
  var L = role === 'staff' ? [['#me', 'صفحتي', 'grid', 'me']].concat(staffOn('myreq') ? [['#myreq', 'طلباتي', 'doc', 'myreq']] : []).concat(staffOn('myatt') ? [['#myatt', 'حضوري', 'finger', 'myatt']] : []).concat(staffOn('mynews') ? [['#mynews', 'التعاميم', 'bell', 'mynews']] : []).concat([['#myfile', 'ملفي', 'card', 'myfile']])
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
var PERM_GROUPS = [['بيانات المنسوبين', [['staff.view', 'عرض الملفات والوثائق'], ['staff.edit', 'تعديل البيانات'], ['staff.files', 'رفع المرفقات واستبدالها'], ['staff.export', 'تصدير السجل إلى Excel']]], ['التواصل', [['staff.mail', 'مراسلة المنسوبين بالبريد وواتساب']]],
  ['المالية', [['finance.view', 'الرواتب والحسابات البنكية']]], ['الطلبات', [['requests.approve', 'اعتماد طلبات المنسوبين'], ['requests.override', 'اعتماد أي طلب في أي خطوة (للطوارئ)'], ['requests.forms', 'النماذج الإدارية ومسارات الاعتماد']]], ['الحضور والانصراف', [['attendance.view', 'عرض الحضور والانصراف'], ['attendance.manage', 'استيراد ملف جهاز البصمة']]],
  ['التعاميم والتقارير', [['announce.manage', 'إصدار التعاميم والإعلانات'], ['reports.view', 'مركز التقارير']]], ['الرقابة', [['audit.view', 'سجل العمليات']]], ['الصفحة الرئيسية', [['home.events', 'لوحة «مناسبات قادمة»'], ['home.cal', 'لوحة «تقويم انتهاء الوثائق»'], ['home.log', 'لوحة «آخر العمليات»'], ['home.contact', 'لوحة «بيانات التواصل»']]],
  ['الإدارة', [['users.manage', 'إدارة الحسابات والصلاحيات'], ['settings.manage', 'إعدادات المنصة (إظهار الأقسام وإخفاؤها)'], ['backup.run', 'النسخ الاحتياطي والتصدير الكامل']]]];
var TITLE_SUGG = ['مدير الموارد البشرية', 'أخصائي موارد بشرية', 'أخصائية موارد بشرية', 'محاسب الرواتب', 'مشرف جهة', 'مدقق داخلي', 'مساعد إداري', 'مدير تنفيذي'];
function samePerms(a, b) { return a.slice().sort().join() === b.slice().sort().join(); }
var AC = null;
function acctOpen(id) {
  var d = CACHE.users && CACHE.users.data; if (!d) { toast('جارٍ تحميل الحسابات، حاول بعد لحظة'); return; }
  var u = id ? d.users.filter(function (x) { return x.id === id; })[0] : null;
  var rp = d.rolePerms || {};
  AC = { id: u ? u.id : 0, name: u ? u.name : '', email: u ? u.email : '', title: u ? u.title : '', role: u ? u.role : 'viewer', active: u ? u.active : true, notify: u ? !!u.notify : false, staffRef: u ? u.staffRef || '' : '', self: !!(u && SESSION && u.id === SESSION.id) };
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
    '<input id="acTitle" value="' + esc(AC.title) + '" placeholder="أو اكتبه هنا"></div>' +
    '<div class="fld wide"><label>سجل الموظف المرتبط</label>' + ssel('acStaff', [{ v: '', n: 'بلا ربط يدوي (يُربط تلقائيًا إن تطابق البريد)', ic: 'link' }].concat(staffOpts()), AC.staffRef, 'اختر سجل الموظف', function (v) { sync(); AC.staffRef = v; }, 'سجل الموظف المرتبط') + '<small class="fhint">إن رُبط الحساب بسجل موظف صار لصاحبه واجهتان يختار بينهما عند الدخول: واجهة الموظف، وواجهة حسابه هذا.</small></div></div></section>' +
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
    var b = { action: 'usersSave', name: AC.name.trim(), email: ml, title: AC.title.trim(), role: AC.role, active: AC.active, notify: AC.notify, perms: AC.custom ? AC.perms : null, staffRef: AC.staffRef || '' };
    if (AC.id) b.id = AC.id;
    this.disabled = true; err.textContent = '';
    var btn = this;
    api(b).then(function (j) { seed('users', j); el.remove(); var nw = !AC.id; AC = null; softRender(); toast(nw ? 'أُضيف الموظف، ويدخل ببريده ' + ml : 'حُفظت التعديلات وسُجّلت باسمك'); })
      .catch(function (e) { btn.disabled = false; err.textContent = errText(e); });
  };
  setTimeout(function () { $('acName').focus(); }, 30);
}

if (typeof P !== 'undefined' && !P.trash) P.trash = '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12.5A2 2 0 0 0 9 21h6a2 2 0 0 0 2-1.5L18 7M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>';
/* ======================================================================
   Requests (leave · travel · salary letter) and the new sidebar
   ====================================================================== */
TITLES.reqs = ['الطلبات']; TITLES.myreq = ['طلباتي'];
STAFF_VIEWS.push('myreq');
TAB.reqs = 'pend'; TAB.myreq = 'list';
TABL.reqs = { pend: 'بانتظار اعتمادي', all: 'كل الطلبات', 'new': 'طلب نيابة عن منسوب', forms: 'النماذج الإدارية' };
TABL.myreq = { list: 'طلباتي', 'new': 'طلب جديد', pend: 'بانتظار اعتمادي' };
ALIAS['reqs-pend'] = ['reqs', 'pend']; ALIAS['reqs-all'] = ['reqs', 'all']; ALIAS['reqs-new'] = ['reqs', 'new']; ALIAS.forms = ['reqs', 'forms'];
ALIAS['myreq-new'] = ['myreq', 'new']; ALIAS['myreq-list'] = ['myreq', 'list']; ALIAS['myreq-pend'] = ['myreq', 'pend']; ALIAS.gaps = ['people', 'dir', 'gap']; ALIAS.expired = ['people', 'dir', 'exp'];

var RT2 = { leave: ['emerald', 'umbrella', 'إجازة', 'LV'], travel: ['amethyst', 'plane', 'أمر إركاب', 'TR'], cert: ['gold', 'cert', 'تعريف بالراتب', 'CR'],
  perm: ['teal', 'clock', 'استئذان', 'PM'], ot: ['sapphire', 'timer', 'عمل إضافي', 'OT'], loan: ['garnet', 'coins', 'سلفة', 'LN'], resume: ['slate', 'door', 'مباشرة عمل', 'RS'], train: ['gold', 'book', 'تدريب', 'TN'],
  resign: ['slate', 'out', 'استقالة', 'RG'], clear: ['teal', 'box', 'إخلاء طرف', 'CL'], hire: ['amethyst', 'userok', 'احتياج وظيفي', 'HN'] };
/* بطاقات «نوع الطلب» في النموذج: [النوع، الاسم، الوصف، اللون، الأيقونة] */
var RW_TYPES = [['leave', 'إجازة', 'اعتيادية أو مرضية أو اضطرارية', '#1f8f6a', 'umbrella'], ['perm', 'استئذان', 'تأخر صباحي أو خروج مبكر أو أثناء الدوام', '#15718a', 'clock'], ['travel', 'أمر إركاب', 'مهمة رسمية داخلية أو خارجية', '#5b3fc4', 'plane'],
  ['resume', 'مباشرة عمل', 'العودة بعد إجازة أو مهمة', '#3b4b6a', 'door'], ['ot', 'عمل إضافي', 'ساعات خارج الدوام', '#1d3f86', 'timer'], ['loan', 'سلفة على الراتب', 'تُخصم أقساطًا شهرية', '#9a2a43', 'coins'],
  ['cert', 'تعريف بالراتب', 'أو شهادة خبرة لجهة محددة', '#b98f25', 'cert'], ['train', 'طلب تدريب', 'ترشيح لبرنامج تدريبي', '#c08b3f', 'book'],
  ['resign', 'استقالة', 'بآخر يوم عمل وأسبابها', '#475569', 'out'], ['clear', 'إخلاء طرف', 'عند انتهاء الخدمة (للموارد البشرية)', '#15718a', 'box', 1], ['hire', 'احتياج وظيفي', 'طلب موظف لإدارة (للموارد البشرية)', '#5539c2', 'userok', 1]];
function rwFields(t) { var f = formOf(t || RW.type); return f && f.fields ? f.fields : null; }
/* أنواع الإجازة كما في نظام الإجازات السابق (و«بدون راتب» من المنصة) */
var LKINDS = ['اعتيادية (سنوية)', 'تعويضية', 'مرضية', 'دراسة / تدريب', 'طارئة (اضطرارية)', 'أمومة', 'حج', 'زواج', 'وفاة قريب', 'بدون راتب', 'أخرى'];
function myRows() { return reqRows().filter(function (r) { return r.mine !== false && (role === 'staff' || (ME && r.ref === ME.ref)); }); }
function apprRows() { return reqRows().filter(function (r) { return r.mine === false; }); }
var RST = { pending: ['warn', 'قيد الإجراء'], approved: ['ok', 'معتمد'], rejected: ['bad', 'مرفوض'], cancelled: ['mute', 'ملغى'] };
function reqRows() { var c = need('reqs', function () { return api({ action: 'reqList', asStaff: role === 'staff' ? 1 : 0 }).then(function (j) { return j.rows; }); }, 60000); return c.data || []; }
function reqPendingForMe() { return reqRows().filter(function (r) { return r.canDecide; }); }
function reqByNo(no) { return reqRows().filter(function (r) { return r.no === no; })[0]; }
function reqSum(r) {
  var d = r.data || {};
  if (r.type === 'leave') return 'إجازة ' + (d.kind || '') + '، ' + dn(d.days || 0);
  if (r.type === 'travel') return 'إلى ' + (d.dest || '') + '، ' + dn(d.days || 0);
  if (r.type === 'cert') return (d.kind || '') + ' إلى ' + (d.to || '');
  if (r.type === 'perm') return (d.kind || 'استئذان') + '، ' + hm(d.mins);
  if (r.type === 'ot') return 'عمل إضافي ' + hm(d.mins);
  if (r.type === 'loan') return 'سلفة ' + n(+d.amount || 0) + ' ر.س على ' + (d.months || 0) + ' أقساط';
  if (r.type === 'resume') return (d.kind || 'مباشرة عمل') + (d.lateDays ? '، تأخر ' + dn(d.lateDays) : '');
  if (r.type === 'train') return d.program || 'طلب تدريب';
  if (r.type === 'resign') return 'استقالة، آخر يوم ' + fdx(pdate(d.lastDay), { day: 'numeric', month: 'short' });
  if (r.type === 'clear') return 'إخلاء طرف، ' + (d.why || '');
  if (r.type === 'hire') return 'احتياج: ' + (d.title || '') + ' × ' + (d.count || 1);
  return r.sum || r.typeName || '';
}
function hm(m) { m = +m || 0; var h = Math.floor(m / 60), r = m % 60; return (h ? h + ' س' : '') + (h && r ? ' و' : '') + (r ? r + ' د' : (h ? '' : '0 د')); }
function reqDates(r) { var d = r.data || {}; if (d.day) return fdx(pdate(d.day), { day: 'numeric', month: 'short', year: 'numeric' }); if (d.start && r.type === 'loan') return 'من ' + d.start; return d.from ? fdx(pdate(d.from), { day: 'numeric', month: 'short' }) + (d.to && d.to !== d.from ? ' – ' + fdx(pdate(d.to), { day: 'numeric', month: 'short', year: 'numeric' }) : '') : ''; }
function reqPill(r) { var s = RST[r.status] || ['mute', r.statusName]; var at = r.status === 'pending' && r.chain[r.stage] ? 'عند ' + (r.chain[r.stage].who || r.chain[r.stage].label) : s[1]; return '<span class="pill ' + s[0] + '"><i></i>' + esc(at) + '</span>'; }
function reqTrail(r) {
  var steps = [{ l: 'تقديم الطلب', st: 'done' }].concat(r.chain.map(function (c, i) { return { l: c.label, st: c.decision === 'approve' || c.decision === 'edit' ? 'done' : c.decision === 'reject' ? 'x' : r.status === 'pending' && i === r.stage ? 'now' : '' }; }));
  steps.push({ l: r.status === 'approved' ? 'معتمد' : r.status === 'rejected' ? 'مرفوض' : r.status === 'cancelled' ? 'ملغى' : 'القرار', st: r.status === 'approved' ? 'done' : r.status === 'rejected' || r.status === 'cancelled' ? 'x' : '' });
  return '<ol class="stg">' + steps.map(function (s, i) { return '<li class="' + s.st + '"><i>' + (s.st === 'done' ? ic('check') : s.st === 'x' ? '×' : i + 1) + '</i><span>' + esc(s.l) + '</span></li>'; }).join('') + '</ol>';
}

/* ---------- sidebar: sections with their headings underneath ---------- */
function sideHTML() {
  var G;
  if (role === 'staff') {
    var open = myRows().filter(function (r) { return r.status === 'pending'; }).length, pendS = reqPendingForMe().length, isAppr = pendS || apprRows().length;
    G = [['خدماتي', [
      { v: 'me', n: 'صفحتي', d: 'ملخص ملفك ووثائقك', j: 'emerald', i: 'grid' },
      { v: 'myreq', n: 'طلباتي', d: 'إجازة وإركاب وتعريف', j: 'sapphire', i: 'doc', b: open + pendS, s: [['myreq-new', 'طلب جديد', TAB.myreq === 'new'], ['myreq-list', 'متابعة طلباتي', TAB.myreq === 'list', open]].concat(isAppr ? [['myreq-pend', 'بانتظار اعتمادي', TAB.myreq === 'pend', pendS, 1]] : []) },
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
var RW_STEPS = [['نوع الطلب', 'إجازة أو استئذان أو غيرهما'], ['التفاصيل', 'التواريخ والبيانات'], ['المراجعة والإرسال', 'إقرار ثم إرسال']];
function rwDays() { var d = RW.d; if (!d.from || !d.to) return 0; var a = pdate(d.from), b = pdate(d.to); return a && b && b >= a ? Math.round((b - a) / DAY) + 1 : 0; }
function rwField(id, label, html, req, wide) { return '<div class="fld' + (wide ? ' wide' : '') + '"><label for="' + id + '">' + label + (req ? ' <i class="rq">*</i>' : '') + '</label>' + html + '</div>'; }
function rwIn(k, type, ph, extra) { return '<input id="rw_' + k + '" data-rw="' + k + '" type="' + (type || 'text') + '" value="' + esc(RW.d[k] == null ? '' : RW.d[k]) + '"' + (ph ? ' placeholder="' + esc(ph) + '"' : '') + (extra || '') + '>'; }
function rwSeg(k, opts) { return '<div class="seg2" role="group">' + opts.map(function (o) { return '<button type="button" data-rwseg="' + k + '" data-v="' + esc(o) + '" aria-pressed="' + (RW.d[k] === o) + '">' + esc(o) + '</button>'; }).join('') + '</div>'; }
function rwStaff() { return RW.ref ? byRef(RW.ref) : (role === 'staff' ? ME : null); }
function rwNeedSup(t) { t = t || RW.type || 'leave'; var f = formOf(t); return f ? f.steps.some(function (x) { return x.kind === 'manager'; }) : t === 'leave'; }
/* تعبئة مسبقة: رقم الجوال من الملف، والمسؤول المباشر من آخر طلب إجازة أو من «المدير المباشر» في الملف */
function rwPrefill() {
  if (RW.type !== 'leave' && !rwNeedSup()) return;
  var s = rwStaff(), d = RW.d, sups = (formsData() || {}).sups || [];
  if (!d.contact && s && RW.type === 'leave') d.contact = s.phone || '';
  if (!d.supervisor && s) {
    var last = reqRows().filter(function (r) { return r.ref === s.ref && r.data && r.data.supervisor; })[0];
    if (last && sups.some(function (x) { return x.id === last.data.supervisor; })) d.supervisor = last.data.supervisor;
    else { var m = gn(String((s.r && s.r.manager) || '')); if (m) { var hit = sups.filter(function (x) { var n2 = gn(x.name).replace(/^(د|أ|ا|م)\.?\s*/, ''); return n2 && (m.indexOf(n2) > -1 || n2.indexOf(m) > -1); })[0]; if (hit) d.supervisor = hit.id; } }
  }
}
function rwBody() {
  if (RW.i === 0) {
    var T = RW_TYPES.filter(function (t) { return (formsData() ? !!formOf(t[0]) : ['leave', 'travel', 'cert'].indexOf(t[0]) > -1) && !(t[5] && role === 'staff'); });
    return (role !== 'staff' ? '<div class="fld wide"><label for="rwRefS">' + (RW.type === 'hire' ? 'صاحب الاحتياج (مدير الإدارة أو المسؤول عنها)' : 'المنسوب') + ' <i class="rq">*</i></label>' + ssel('rwRefS', STAFF.map(function (s) { return { v: s.ref, n: s.name, d: s.ref + ' · ' + s.ent.n, c: s.ent.c }; }), RW.ref, 'اختر المنسوب', function (v) { if (v !== RW.ref) RW.d = {}; RW.ref = v; RW.err = ''; render(); }, 'المنسوب') + (RW.type === 'hire' ? '<small class="fhint">يصله إشعار بكل خطوة في مسار الاحتياج.</small>' : '') + '</div>' : '') +
      '<div class="ccards" role="radiogroup" aria-label="نوع الطلب">' + T.filter(function (t) { return formOn(t[0]); }).map(function (t) { return '<button type="button" class="ccard" role="radio" data-rwtype="' + t[0] + '" aria-checked="' + (RW.type === t[0]) + '"><span class="ti" style="background:' + t[3] + '">' + ic(t[4]) + '</span><b>' + t[1] + '</b><small>' + t[2] + '</small></button>'; }).join('') + '</div>';
  }
  if (RW.i === 1) {
    if (rwFields()) return rwSchemaBody();
    if (RW.type === 'leave') { var fl = formOf('leave'), sups = (formsData() || {}).sups || [], needSup = rwNeedSup(), nx = fl && fl.steps[1] ? fl.steps[1].label : '';
      return '<div class="form">' + rwField('lk', 'نوع الإجازة', rwSeg('kind', LKINDS), true, true) +
      rwField('rw_from', 'تاريخ البداية', rwIn('from', 'date'), true) + rwField('rw_to', 'تاريخ النهاية', rwIn('to', 'date'), true) +
      '<div class="fld wide">' + (rwDays() ? '<div class="note">' + ic('calendar') + '<span>مدة الإجازة <b>' + dn(rwDays()) + '</b> أيامًا تقويمية شاملة يومي البداية والنهاية.</span></div>' + (typeof quotaNote === 'function' ? quotaNote(RW.d.kind, rwDays()) : '') : (RW.d.from && RW.d.to ? '<div class="note warn">' + ic('alert') + '<span>تاريخ النهاية يجب أن يكون في يوم البداية أو بعده.</span></div>' : '')) + '</div>' +
      rwField('rw_reason', 'سبب الإجازة', '<textarea id="rw_reason" data-rw="reason" maxlength="1500" placeholder="اكتب السبب باختصار">' + esc(RW.d.reason || '') + '</textarea>', true, true) +
      (needSup ? '<div class="fld wide"><label>المسؤول المباشر <i class="rq">*</i></label>' + (sups.length ? ssel('rwSup', sups.map(function (x) { return { v: x.id, n: x.name, d: x.title || '', ic: 'user' }; }), RW.d.supervisor || '', 'اختر مسؤولك المباشر', function (v) { rwSync(); RW.d.supervisor = v; RW.err = ''; render(); }, 'المسؤول المباشر')
        : '<div class="note warn">' + ic('alert') + '<span>لم تُضَف قائمة المسؤولين المباشرين بعد. تواصل مع الموارد البشرية.</span></div>') + '<small class="fhint">يصله الطلب أولًا ليعتمده أو يعدّله أو يرفضه' + (nx ? '، ثم ينتقل إلى ' + esc(nx) : '') + '.</small></div>' : '') +
      '<div class="fld wide"><div class="fsub">' + ic('users') + 'الموظف البديل أثناء الإجازة</div></div>' +
      rwField('rw_substitute', 'اسم الموظف البديل', rwIn('substitute', 'text', 'الاسم الكامل'), true) + rwField('rw_subTitle', 'المسمى الوظيفي للبديل', rwIn('subTitle', 'text', 'مثال: منسق برامج'), true) +
      rwField('rw_subNo', 'الرقم الوظيفي للبديل', rwIn('subNo', 'text', 'اختياري', ' dir="ltr"')) +
      '<div class="fld wide"><div class="fsub">' + ic('chat') + 'التواصل أثناء الإجازة</div></div>' +
      rwField('rw_contact', 'رقم التواصل', rwIn('contact', 'tel', '+966512345678', ' dir="ltr"'), true) + rwField('rw_address', 'العنوان أثناء الإجازة', rwIn('address', 'text', 'اختياري')) + '</div>'; }
    if (RW.type === 'travel') return '<div class="form">' + rwField('rw_dest', 'الوجهة', rwIn('dest', 'text', 'مثال: جاكرتا، إندونيسيا'), true) + rwField('tk', 'وسيلة السفر', rwSeg('transport', ['طيران', 'بري', 'لا يلزم']), true) +
      rwField('rw_from', 'تاريخ السفر', rwIn('from', 'date'), true) + rwField('rw_to', 'تاريخ العودة', rwIn('to', 'date'), true) +
      rwField('rw_purpose', 'الغرض من المهمة', '<textarea id="rw_purpose" data-rw="purpose" maxlength="1500" placeholder="مثال: زيارة إشرافية لمراكز التدريب">' + esc(RW.d.purpose || '') + '</textarea>', true, true) +
      '<div class="fld"><label class="ck"><input type="checkbox" data-rwck="hotel"' + (RW.d.hotel ? ' checked' : '') + '> أحتاج سكنًا</label></div>' + rwField('rw_advance', 'سلفة مصاريف (ر.س)', rwIn('advance', 'text', '0', ' inputmode="decimal" dir="ltr" data-num="1"')) + '</div>';
    return '<div class="form">' + rwField('ck', 'نوع الخطاب', rwSeg('kind', ['تعريف بالراتب', 'شهادة خبرة', 'تعريف بدون راتب']), true, true) +
      rwField('rw_to', 'الجهة الموجّه إليها', rwIn('to', 'text', 'مثال: البنك الأهلي، سفارة إندونيسيا'), true) + rwField('cl', 'لغة الخطاب', rwSeg('lang', ['العربية', 'الإنجليزية']), true) +
      rwField('rw_note', 'ملاحظات', '<textarea id="rw_note" data-rw="note" maxlength="800" placeholder="اختياري">' + esc(RW.d.note || '') + '</textarea>', false, true) + '</div>';
  }
  var s = rwStaff(), d = RW.d, rows = [['المنسوب', s ? esc(s.name) + ' <span class="ref">' + esc(s.ref) + '</span>' : '—'], ['نوع الطلب', RT2[RW.type][2]]];
  if (RW.type === 'leave') { var sp = ((formsData() || {}).sups || []).filter(function (x) { return x.id === d.supervisor; })[0];
    rows.push(['الإجازة', esc(d.kind) + '، ' + dn(rwDays())], ['المدة', fdx(pdate(d.from)) + ' إلى ' + fdx(pdate(d.to))], ['السبب', esc(d.reason || '')]);
    if (sp) rows.push(['المسؤول المباشر', esc(sp.name)]);
    rows.push(['الموظف البديل', esc(d.substitute || '') + (d.subTitle ? ' · ' + esc(d.subTitle) : '') + (d.subNo ? ' · <span class="ltr">' + esc(d.subNo) + '</span>' : '')], ['رقم التواصل', '<span class="ltr">' + esc(d.contact || '') + '</span>']);
    if (d.address) rows.push(['العنوان أثناء الإجازة', esc(d.address)]); }
  if (RW.type === 'travel') rows.push(['الوجهة', esc(d.dest)], ['المدة', fdx(pdate(d.from)) + ' إلى ' + fdx(pdate(d.to)) + '، ' + dn(rwDays())], ['السفر', esc(d.transport || 'طيران') + (d.hotel ? ' وسكن' : '') + (+d.advance ? '، سلفة ' + n(+d.advance) + ' ر.س' : '')]);
  if (RW.type === 'cert') rows.push(['الخطاب', esc(d.kind) + ' بال' + esc(d.lang || 'العربية').replace('ال', '')], ['موجّه إلى', esc(d.to)]);
  if (rwFields()) { rwFields().forEach(function (f) { var v = d[f[0]]; if (v === '' || v == null) return; rows.push([f[1], f[2] === 'date' ? fdx(pdate(v)) : f[2] === 'money' ? n(+v) + ' ر.س' : f[2] === 'month' ? fmonth(v) : f[2] === 'time' || f[2] === 'reqref' ? '<span class="ltr">' + esc(v) + '</span>' : esc(v)]); });
    var ex = rwExtra(); if (ex) rows.push(['', ex]);
    var sp2 = ((formsData() || {}).sups || []).filter(function (x) { return x.id === d.supervisor; })[0]; if (sp2) rows.push(['المسؤول المباشر', esc(sp2.name)]); }
  return kvHTML(rows) + '<label class="consent"><input type="checkbox" id="rwAgree"' + (RW.d.agree ? ' checked' : '') + '><span>أقر بصحة البيانات' + (RW.type === 'leave' ? '، وأتعهد بالعودة إلى العمل في اليوم التالي لانتهاء الإجازة وإبلاغ مديري بأي طارئ' : '') + '.</span></label>';
}
function rwHTML() {
  var sum = !RW.type ? 'لم تختر نوع الطلب بعد' : RT2[RW.type][2] + (RW.type === 'leave' && RW.d.kind ? ' ' + RW.d.kind : '') + (RW.type !== 'perm' && RW.type !== 'ot' && rwDays() ? '، ' + dn(rwDays()) : '') + (rwFields() ? rwExtraTxt() : '') + (RW.type === 'cert' && RW.d.to ? ' إلى ' + RW.d.to : '') + (RW.type === 'travel' && RW.d.dest ? ' إلى ' + RW.d.dest : '');
  var s = rwStaff();
  return '<div class="wiz"><form class="wcard pn" id="rwForm" novalidate><span class="stepchip">الخطوة ' + (RW.i + 1) + ' من ' + RW_STEPS.length + '</span><h2 class="wt">' + RW_STEPS[RW.i][0] + '</h2>' + rwBody() +
    '<div class="lerr" role="alert">' + esc(RW.err) + '</div><div class="wfoot"><button class="btn" type="button" id="rwBack"' + (RW.i ? '' : ' disabled') + '>' + ic('back') + 'السابق</button><span class="ctr">' + (RW.i + 1) + ' / ' + RW_STEPS.length + '</span><button class="btn ' + (RW.i === RW_STEPS.length - 1 ? 'goldb' : 'prim') + '" type="submit"' + (RW.busy ? ' disabled' : '') + '>' + (RW.i === RW_STEPS.length - 1 ? ic('send') + (RW.busy ? 'جارٍ الإرسال…' : 'إرسال الطلب') : 'التالي') + '</button></div></form>' +
    '<aside class="wside" aria-label="تقدم الطلب"><div class="wsh">' + tile('gold', 'stamp') + '<div><b>طلب جديد</b><small>' + (s ? esc(s.name) : 'يصلك رقم الطلب فور الإرسال') + '</small></div></div><ol class="wsteps">' + RW_STEPS.map(function (x, k) { return '<li class="' + (k < RW.i ? 'done' : k === RW.i ? 'on' : '') + '"><span><b>' + x[0] + '</b><small>' + x[1] + '</small></span><i>' + (k < RW.i ? '✓' : k + 1) + '</i></li>'; }).join('') + '</ol>' +
    '<div class="wsum"><small>اختيارك</small><b>' + esc(sum) + '</b></div><div class="whelp">' + ic('info') + '<span>' + flowText(RW.type) + '</span></div>' + (RW.type === 'leave' && s && (role !== 'staff' || staffOn('balance')) ? balHTML(lbal(s.ref), true) : '') + '</aside></div>';
}
function asciiD(v) { return String(v == null ? '' : v).replace(/[٠-٩]/g, function (c) { return c.charCodeAt(0) - 1632; }).replace(/[۰-۹]/g, function (c) { return c.charCodeAt(0) - 1776; }).replace(/٫/g, '.').replace(/٬/g, ''); }
function rwSync() { document.querySelectorAll('[data-rw]').forEach(function (e) { RW.d[e.dataset.rw] = e.dataset.num || e.type === 'tel' ? asciiD(e.value).trim() : e.value; }); var a = document.getElementById('rwAgree'); if (a) RW.d.agree = a.checked; }
function rwValidate() {
  var d = RW.d;
  if (RW.i === 0) { if (role !== 'staff' && !RW.ref) return 'اختر المنسوب أولًا'; if (!RW.type) return 'اختر نوع الطلب'; }
  if (RW.i === 1) {
    if (rwFields()) return rwSchemaCheck();
    if (RW.type === 'leave') {
      if (!d.kind) return 'اختر نوع الإجازة'; if (!rwDays()) return 'تاريخ النهاية يجب أن يكون في يوم البداية أو بعده';
      if (String(d.reason || '').trim().length < 3) return 'اكتب سبب الإجازة (3 أحرف على الأقل)';
      if (rwNeedSup() && !d.supervisor) return 'اختر المسؤول المباشر';
      if (!String(d.substitute || '').trim() || !String(d.subTitle || '').trim()) return 'اكتب اسم الموظف البديل ومسماه الوظيفي';
      if (asciiD(d.contact).replace(/\D/g, '').length < 6) return 'اكتب رقم تواصل صحيحًا مع رمز الدولة';
    }
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
  f.querySelectorAll('input[type=date][data-rw],input[type=month][data-rw]').forEach(function (c) { c.onchange = function () { rwSync(); softRender(); }; });
  /* الوقت والأرقام: تحديث الحساب فقط دون إعادة رسم الصفحة، حتى لا يضيع المؤشر أثناء الكتابة */
  f.querySelectorAll('input[type=time][data-rw],[data-rwlive]').forEach(function (c) { c.oninput = c.onchange = function () { rwSync(); var x = document.getElementById('rwExtra'); if (x && typeof rwExtra === 'function') x.innerHTML = rwExtra(); var sb = document.querySelector('.wsum b'); if (sb && rwFields()) sb.textContent = RT2[RW.type][2] + rwExtraTxt(); }; });
  document.getElementById('rwBack').onclick = function () { rwSync(); if (RW.i) { RW.i--; RW.err = ''; render(); } };
  f.onsubmit = function (e) {
    e.preventDefault(); rwSync(); var err = rwValidate(); if (err) { RW.err = err; render(); return; }
    RW.err = '';
    if (RW.i < RW_STEPS.length - 1) { RW.i++; if (RW.i === 1) rwPrefill(); render(); window.scrollTo(0, 0); return; }
    var d = {}; Object.keys(RW.d).forEach(function (k) { if (k !== 'agree') d[k] = RW.d[k]; });
    RW.busy = true; render();
    api({ action: 'reqCreate', type: RW.type, ref: role === 'staff' ? '' : RW.ref, data: d }).then(function (j) {
      var rows = reqRows().slice(); j.request.mine = true; rows.unshift(j.request); seed('reqs', rows); delete CACHE.audit;
      RW = { i: 0, type: '', ref: '', d: {}, busy: false, err: '' };
      if (role === 'staff') { TAB.myreq = 'list'; location.hash = 'myreq'; } else { TAB.reqs = 'all'; }
      render(); reqOpen(j.request.no, true);
    }).catch(function (e2) { RW.busy = false; RW.err = errText(e2); if (RW.i === RW_STEPS.length - 1 && !/too_many|locked|auth/.test(String(e2 && e2.message))) RW.i = 1; render(); });
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
  return ptitle('الطلبات', 'إجازات المنسوبين واستئذاناتهم ومباشراتهم وسلفهم وطلبات العمل الإضافي والتدريب والإركاب والتعريف. لكل طلب رقم ثابت ومسار اعتماد، وكل قرار يُسجَّل باسم صاحبه ويصل المنسوب ببريد.', can('edit') && t !== 'new' ? '<a class="btn goldb" href="#reqs-new">' + ic('plus') + 'طلب نيابة عن منسوب</a>' : '') +
    '<div class="tabs2">' + [['amethyst', 'stamp', pend.length, 'بانتظار اعتمادي'], ['gold', 'clock', k.pending, 'قيد الإجراء'], ['emerald', 'check', k.approved, 'معتمد'], ['garnet', 'alert', k.rejected, 'مرفوض']].map(function (x) { return '<div class="stat">' + tile(x[0], x[1]) + '<div><b>' + x[2] + '</b><span>' + x[3] + '</span></div></div>'; }).join('') + '</div>' +
    vtabs('reqs', T) + body;
};
VIEWS.myreq = function () {
  var rows = myRows(), t = TAB.myreq, open = rows.filter(function (r) { return r.status === 'pending'; }).length, pend = reqPendingForMe(), done = apprRows().filter(function (r) { return !r.canDecide; });
  var isAppr = pend.length || done.length; if (t === 'pend' && !isAppr) t = TAB.myreq = 'list';
  var body = t === 'new' ? rwHTML() : t === 'pend' ? pn('amethyst', 'stamp', 'بانتظار اعتمادي', pend.length ? pend.length + ' طلبًا ينتظر قرارك' : 'لا شيء ينتظرك الآن', '', '<div class="pb">' + (pend.length ? reqListHTML(pend, false) : '<div class="note">' + ic('check') + '<span>لا شيء ينتظر قرارك الآن. يصلك بريد عند وصول طلب جديد إليك.</span></div>') +
      (done.length ? '<h3 class="h3s" style="margin-top:18px">طلبات سبق أن مرّت عليك</h3>' + reqListHTML(done.slice(0, 30), false) : '') + '</div>')
    : pn('sapphire', 'doc', 'طلباتي', rows.length ? rows.length + ' طلبًا، ' + open + ' قيد الإجراء' : '', '<a class="btn sm goldb" href="#myreq-new">' + ic('plus') + 'طلب جديد</a>', '<div class="pb">' + reqListHTML(rows, true) + '</div>');
  return ptitle('طلباتي', 'قدّم طلب إجازة أو استئذان أو مباشرة عمل أو سلفة أو غيرها، وتابع أين وصل. يصلك بريد عند كل خطوة.') +
    vtabs('myreq', [['list', 'طلباتي', open ? open + ' قيد الإجراء' : rows.length, 'doc', open], ['new', 'طلب جديد', null, 'plus']].concat(isAppr ? [['pend', 'بانتظار اعتمادي', pend.length, 'stamp', pend.length]] : [])) + body;
};

/* ---------- the official request sheet (view · decide · print) ---------- */
function reqSheetHTML(r) {
  var d = r.data || {}, st = r.staff || {}, kv = function (a) { return '<div class="srow">' + a.map(function (x) { return '<div class="sf"><span>' + x[0] + '</span><b>' + (x[1] === '' || x[1] == null ? '—' : esc(x[1])) + '</b></div>'; }).join('') + '</div>'; };
  var det = r.type === 'leave' ? kv([['نوع الإجازة', d.kind], ['من', fdx(pdate(d.from))], ['إلى', fdx(pdate(d.to))], ['المدة', dn(d.days || 0)]]) + kv([['المسؤول المباشر', d.supName || ''], ['رقم التواصل', d.contact], ['العنوان أثناء الإجازة', d.address || '']]) +
      (d.substitute ? kv([['الموظف البديل', d.substitute], ['مسماه الوظيفي', d.subTitle || ''], ['رقمه الوظيفي', d.subNo || '']]) : '')
    : r.type === 'travel' ? kv([['الوجهة', d.dest], ['من', fdx(pdate(d.from))], ['إلى', fdx(pdate(d.to))], ['المدة', dn(d.days || 0)], ['وسيلة السفر', (d.transport || '') + (d.hotel ? ' وسكن' : '')], ['السلفة', +d.advance ? n(+d.advance) + ' ' + (d.currency || 'SAR') : 'لا يوجد']])
    : r.type === 'cert' ? kv([['نوع الخطاب', d.kind], ['موجّه إلى', d.to], ['لغة الخطاب', d.lang]])
    : (r.view || []).filter(function (x) { return !x[3]; }).reduce(function (a, x, i, A) { if (i % 3 === 0) a.push(A.slice(i, i + 3)); return a; }, []).map(function (g) { return kv(g.map(function (x) { return [x[0], /^\d{4}-\d{2}-\d{2}$/.test(x[1]) ? fdx(pdate(x[1])) : /^\d{4}-\d{2}$/.test(x[1]) ? fmonth(x[1]) : x[1]]; })); }).join('');
  var note = r.view && ['leave', 'travel', 'cert'].indexOf(r.type) < 0 ? (r.view || []).filter(function (x) { return x[3]; }).map(function (x) { return x[0] + ': ' + x[1]; }).join('\n') : d.reason || d.note || d.purpose;
  return '<div class="sheet" id="reqSheet"><div class="shead"><div class="sorg"><span class="seal"><img src="' + LOGO + '" alt=""></span><div><b>مجموعة بنيان العالمية</b><small>Bonyan International Group</small><em>إدارة الموارد البشرية</em></div></div><div class="smeta">رمز النموذج<b>' + esc(r.form) + '</b>الإصدار 1.0<span>رقم المعاملة</span><b>' + esc(r.no) + '</b></div></div>' +
    '<div class="stitle"><h3>' + esc(r.typeName) + '</h3><p>قُدّم ' + fdx(pdt(r.createdAt)) + ' بواسطة ' + esc(r.createdBy || r.name) + '</p></div>' +
    '<div class="sbar">بيانات المنسوب</div>' + kv([['الاسم', r.name], ['الرقم المرجعي', r.ref], ['الجهة', st.entity], ['المسمى', st.jobTitle], ['الإدارة', st.department], ['المدير المباشر', st.manager || d.supName || '']]) +
    '<div class="sbar">تفاصيل الطلب</div>' + det + (note ? '<div class="snote">' + esc(note) + '</div>' : '') +
    '<div class="sbar">الاعتماد والتوقيعات</div><div class="tw"><table class="sappr"><thead><tr><th>م</th><th>الجهة</th><th>الاسم</th><th>القرار</th><th>التاريخ</th></tr></thead><tbody>' +
    r.chain.map(function (c, i) { var dec = c.decision === 'approve' ? '<span class="pill ok"><i></i>موافق</span>' : c.decision === 'edit' ? '<span class="pill ok"><i></i>عدّل ووافق</span>' : c.decision === 'reject' ? '<span class="pill bad"><i></i>غير موافق</span>' : r.status === 'pending' && i === r.stage ? '<span class="pill warn"><i></i>بانتظار القرار</span>' : r.status === 'cancelled' ? '<span class="pill mute"><i></i>ألغي الطلب</span>' : '<span class="pill mute"><i></i>—</span>';
      return '<tr><td>' + (i + 1) + '</td><td class="r">' + esc(c.label) + '</td><td>' + esc(c.by || c.who || '') + (c.note ? '<small class="dn2">' + esc(c.note) + '</small>' : '') + (c.changes && c.changes.length ? '<small class="dn2 chg">' + c.changes.map(function (x) { return esc(x[0]) + ': <s>' + esc(x[1] || '—') + '</s> ← <b>' + esc(x[2] || '—') + '</b>'; }).join('<br>') + '</small>' : '') + '</td><td>' + dec + '</td><td>' + esc(c.at || '') + '</td></tr>'; }).join('') + '</tbody></table></div>' +
    '<div class="sfoot"><span>hr.bonyanglobal.com</span><span>' + esc(r.form) + ' · ' + esc(r.no) + '</span><span>الحالة: ' + esc(RST[r.status] ? RST[r.status][1] : r.statusName) + '</span></div></div>';
}
function reqOpen(no, fresh) {
  var r = reqByNo(no); if (!r) return;
  var old = document.getElementById('reqLayer'); if (old) old.remove();
  var own = !!(ME && ME.ref === r.ref), el = document.createElement('div'); el.id = 'reqLayer';
  el.innerHTML = '<div class="mscrim" data-rqclose="1"></div><section class="mdl rqm2" role="dialog" aria-modal="true" aria-labelledby="rqT"><header class="mh">' + tile(RT2[r.type][0], RT2[r.type][1]) + '<div><h2 id="rqT">' + esc(r.typeName) + ' <span class="ltr ref">' + esc(r.no) + '</span></h2><p>' + (fresh ? 'أُرسل الطلب. احتفظ برقمه للمتابعة.' : esc(r.name)) + '</p></div>' + reqPill(r) + '<button class="ib mx" data-rqclose="1" aria-label="إغلاق">' + ic('plus') + '</button></header>' +
    '<div class="rqbody"><div class="rqtrack">' + reqTrail(r) + '</div>' + reqSheetHTML(r) + '</div>' +
    '<footer class="mf">' + (r.canDecide ? '<div class="rqdec"><textarea id="rqNote" rows="2" maxlength="600" placeholder="ملاحظة للمنسوب (إلزامية عند الرفض)"></textarea><div class="lerr" id="rqErr" role="alert"></div></div><button class="btn" data-rqdec="reject">' + ic('alert') + 'رفض</button>' + (r.canEdit ? '<button class="btn" id="rqEdit">' + ic('edit') + 'تعديل ثم اعتماد</button>' : '') + '<button class="btn goldb" data-rqdec="approve">' + ic('check') + 'اعتماد</button>'
      : (r.status === 'pending' && (own || can('edit')) ? '<button class="btn" id="rqCancel">إلغاء الطلب</button>' : '') + '<span class="sp"></span>') +
    (SESSION && SESSION.role === 'admin' ? '<button class="btn rqdel" id="rqDel" title="حذف الطلب من النظام نهائيًا (لمدير النظام)">' + ic('trash') + 'حذف الطلب</button>' : '') +
    '<button class="btn" id="rqPrint">' + ic('dl') + 'طباعة أو حفظ PDF</button></footer></section>';
  document.body.appendChild(el); document.body.classList.add('no-scroll');
  var close = function () { el.remove(); document.body.classList.remove('no-scroll'); };
  el.querySelectorAll('[data-rqclose]').forEach(function (b) { b.onclick = close; });
  document.getElementById('rqPrint').onclick = function () { document.body.classList.add('print-sheet'); window.print(); setTimeout(function () { document.body.classList.remove('print-sheet'); }, 500); };
  var eb = document.getElementById('rqEdit'); if (eb) eb.onclick = function () { reqEditForm(r, el, close); };
  var dx = document.getElementById('rqDel'); if (dx) dx.onclick = function () {
    if (dx.dataset.sure !== '1') { dx.dataset.sure = '1'; dx.classList.add('sure'); dx.innerHTML = ic('trash') + 'تأكيد الحذف النهائي؟'; setTimeout(function () { if (dx.isConnected && dx.dataset.sure === '1') { dx.dataset.sure = ''; dx.classList.remove('sure'); dx.innerHTML = ic('trash') + 'حذف الطلب'; } }, 5000); return; }
    dx.disabled = true;
    api({ action: 'reqDelete', no: r.no }).then(function () { seed('reqs', reqRows().filter(function (x) { return x.no !== r.no; })); close(); softRender(); toast('حُذف الطلب ' + r.no + ' من النظام'); }).catch(function (e) { dx.disabled = false; toast(errText(e)); });
  };
  var c = document.getElementById('rqCancel'); if (c) c.onclick = function () { c.disabled = true; api({ action: 'reqCancel', no: r.no }).then(function () { r.status = 'cancelled'; r.statusName = 'ملغى'; seed('reqs', reqRows()); close(); softRender(); toast('أُلغي الطلب ' + r.no); }).catch(function (e) { c.disabled = false; toast(errText(e)); }); };
  el.querySelectorAll('[data-rqdec]').forEach(function (b) { b.onclick = function () {
    var ok = b.dataset.rqdec === 'approve', note = document.getElementById('rqNote').value.trim(), err = document.getElementById('rqErr');
    if (!ok && !note) { err.textContent = 'اكتب سبب الرفض ليصل إلى المنسوب.'; document.getElementById('rqNote').focus(); return; }
    el.querySelectorAll('[data-rqdec]').forEach(function (x) { x.disabled = true; });
    api({ action: 'reqDecide', no: r.no, decision: ok ? 'approve' : 'reject', note: note }).then(function (j) {
      seed('reqs', reqRows().map(function (x) { return x.no === r.no ? Object.assign(j.request, { mine: x.mine }) : x; })); delete CACHE.audit; delete CACHE['aud:' + r.ref];
      close(); softRender(); toast(ok ? (j.request.status === 'approved' ? 'اعتُمد الطلب نهائيًا وأُبلغ المنسوب' : 'وافقت، وانتقل الطلب إلى ' + (j.request.chain[j.request.stage].who || j.request.chain[j.request.stage].label)) : 'رُفض الطلب وأُبلغ المنسوب بالسبب');
    }).catch(function (e) { el.querySelectorAll('[data-rqdec]').forEach(function (x) { x.disabled = false; }); err.textContent = errText(e); });
  }; });
}
/* تعديل الطلب قبل اعتماده (المسؤول المباشر في خطوته) — يُرسل للموظف وللمرحلة التالية جدول بما تغيّر */
function reqEditForm(r, el, close) {
  var d = r.data || {}, E = { kind: d.kind || '', from: d.from || '', to: d.to || '', reason: d.reason || d.note || '', substitute: d.substitute || '', subTitle: d.subTitle || '', subNo: d.subNo || '' };
  var kinds = LKINDS.indexOf(E.kind) > -1 || !E.kind ? LKINDS : [E.kind].concat(LKINDS);
  var dd = function () { var a = pdate(E.from), b = pdate(E.to); return a && b && b >= a ? Math.round((b - a) / DAY) + 1 : 0; };
  var body = el.querySelector('.rqbody'), foot = el.querySelector('.mf');
  var fld = function (id, lab, html, wide) { return '<div class="fld' + (wide ? ' wide' : '') + '"><label for="' + id + '">' + lab + '</label>' + html + '</div>'; };
  var inp = function (k, type, extra) { return '<input id="re_' + k + '" data-re="' + k + '" type="' + (type || 'text') + '" value="' + esc(E[k]) + '"' + (extra || '') + '>'; };
  body.innerHTML = '<div class="note">' + ic('edit') + '<span>غيّر ما يلزم ثم احفظ؛ يُعتمد الطلب بعد التعديل، ويصل الموظف والمرحلة التالية جدول بما تغيّر.</span></div><div class="form" style="margin-top:12px">' +
    fld('re_kind', 'نوع الإجازة', '<select id="re_kind" data-re="kind">' + kinds.map(function (k) { return '<option' + (k === E.kind ? ' selected' : '') + '>' + esc(k) + '</option>'; }).join('') + '</select>', true) +
    fld('re_from', 'تاريخ البداية', inp('from', 'date')) + fld('re_to', 'تاريخ النهاية', inp('to', 'date')) +
    '<div class="fld wide" id="reDays"></div>' +
    fld('re_reason', 'سبب الإجازة', '<textarea id="re_reason" data-re="reason" maxlength="1500">' + esc(E.reason) + '</textarea>', true) +
    fld('re_substitute', 'اسم الموظف البديل', inp('substitute')) + fld('re_subTitle', 'المسمى الوظيفي للبديل', inp('subTitle')) + fld('re_subNo', 'الرقم الوظيفي للبديل', inp('subNo', 'text', ' dir="ltr"')) +
    fld('re_note', 'ملاحظة للموظف والمرحلة التالية', '<textarea id="re_note" maxlength="600" placeholder="اختيارية"></textarea>', true) + '</div>';
  var days = function () { var n2 = dd(); document.getElementById('reDays').innerHTML = n2 ? '<div class="note">' + ic('calendar') + '<span>المدة بعد التعديل <b>' + dn(n2) + '</b></span></div>' : '<div class="note warn">' + ic('alert') + '<span>تاريخ النهاية يجب أن يكون في يوم البداية أو بعده.</span></div>'; };
  days();
  body.querySelectorAll('[data-re]').forEach(function (x) { x.addEventListener(x.tagName === 'SELECT' || x.type === 'date' ? 'change' : 'input', function () { E[x.dataset.re] = x.value; if (x.type === 'date') days(); }); });
  foot.innerHTML = '<div class="lerr" id="reErr" role="alert"></div><span class="sp"></span><button class="btn" id="reBack">رجوع</button><button class="btn goldb" id="reSave">' + ic('check') + 'حفظ التعديلات واعتماد</button>';
  document.getElementById('reBack').onclick = function () { close(); reqOpen(r.no); };
  document.getElementById('reSave').onclick = function () {
    var er = document.getElementById('reErr');
    if (!dd()) { er.textContent = 'تحقق من التاريخين.'; return; }
    if (String(E.reason).trim().length < 3) { er.textContent = 'اكتب سبب الإجازة.'; return; }
    var b = this; b.disabled = true; er.textContent = '';
    api({ action: 'reqDecide', no: r.no, decision: 'edit', note: document.getElementById('re_note').value.trim(), edits: E }).then(function (j) {
      seed('reqs', reqRows().map(function (x) { return x.no === r.no ? Object.assign(j.request, { mine: x.mine }) : x; })); delete CACHE.audit; delete CACHE['aud:' + r.ref];
      close(); softRender(); toast(j.request.status === 'approved' ? 'حُفظ التعديل واعتُمد الطلب نهائيًا' : 'حُفظ التعديل وانتقل الطلب إلى ' + (j.request.chain[j.request.stage].who || j.request.chain[j.request.stage].label));
    }).catch(function (e) { b.disabled = false; er.textContent = errText(e); });
  };
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
  if (r) { var steps = [{ l: 'تقديم الطلب', st: 'done', at: r.createdAt }].concat(r.chain.map(function (c, i) { return { l: c.label, st: c.decision === 'approve' || c.decision === 'edit' ? 'done' : c.decision === 'reject' ? 'x' : r.status === 'pending' && i === r.stage ? 'now' : '', at: c.at, note: c.note }; }));
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
  return 'يمر الطلب على: ' + f.steps.map(function (s) { return esc(s.label); }).join(' ثم ') + '، ويصلك بريد عند كل خطوة.';
}
function formsHTML() {
  var c = need('reqForms', function () { return api({ action: 'reqForms' }); }, 120000), d = c.data;
  if (!d) return '<section class="pn"><div class="pb"><div class="empty">' + (c.err ? esc(c.err) : 'جارٍ التحميل…') + '</div></div></section>';
  var cards = d.forms.map(function (f) {
    var T = RT2[f.type] || ['slate', 'doc', f.name];
    var path = '<ol class="fpath"><li class="st0"><i>' + ic('user') + '</i><span><b>المنسوب يقدّم</b><small>من صفحته أو نيابة عنه</small></span></li>' + f.steps.map(function (s, i) {
      var who = s.people.length ? s.people.map(function (p) { return p.name; }).slice(0, 3).join('، ') + (s.people.length > 3 ? ' و' + (s.people.length - 3) + ' آخرون' : '') : '';
      var sm = s.kind === 'manager' ? (s.people.length ? 'يختاره المنسوب عند التقديم من ' + s.people.length + ' مسؤولين' : 'أضف المسؤولين المباشرين أولًا!') : s.kind === 'person' ? 'شخص بالبريد (يعتمد من رابط البريد): ' + esc(who) : who ? (s.kind === 'user' ? 'حساب محدد: ' : 'كل من بدور ' + esc(d.roles[s.v] || s.v) + ': ') + esc(who) : 'لا يوجد حساب نشط يعتمد هذه الخطوة!';
      return '<li class="' + (who ? '' : 'nobody') + '"><i>' + (i + 1) + '</i><span><b>' + esc(s.label) + '</b><small>' + sm + '</small></span></li>'; }).join('') +
      '<li class="stz"><i>' + ic('check') + '</i><span><b>القرار النهائي</b><small>يصل المنسوب ببريد</small></span></li></ol>';
    return '<article class="fcard' + (f.on ? '' : ' off') + '"><header>' + tile(T[0], T[1]) + '<div><h3>' + esc(f.name) + '</h3><span class="fcode ltr">' + esc(f.code) + ' · ' + esc(f.prefix) + '-YYYY-NNNN</span></div>' +
      (f.on ? '<span class="pill ok"><i></i>مفعّل</span>' : '<span class="pill mute"><i></i>موقوف</span>') + '</header><p class="finfo">' + esc(f.info) + '</p>' +
      '<h4>مسار الاعتماد</h4>' + path +
      '<div class="fstats"><span><b>' + f.total + '</b> طلبًا</span><span><b>' + f.pending + '</b> قيد الإجراء</span></div>' +
      '<footer>' + (d.canEdit ? '<button class="btn prim" data-flow="' + f.type + '">' + ic('users') + 'تحديد المسؤولين</button>' : '') + (d.canEdit && f.type === 'leave' ? '<button class="btn" data-sups="1">' + ic('user') + 'المسؤولون المباشرون (' + (d.sups || []).length + ')</button>' : '') +
      (can('edit') && f.on ? '<a class="btn" href="#reqs-new" data-ftype="' + f.type + '">' + ic('plus') + 'تقديم نيابة عن منسوب</a>' : '') + '</footer></article>';
  }).join('');
  return '<div class="note fnote">' + ic('info') + '<span>هذه النماذج الإلكترونية المعتمدة في المنصة. يقدّمها المنسوب من «طلباتي»، أو الموارد البشرية نيابة عنه. ' + (d.canEdit ? 'بصفتك مدير النظام تحدد من يعتمد كل نموذج وترتيب الخطوات، أو توقف النموذج مؤقتًا.' : 'مدير النظام هو من يحدد مسؤولي الاعتماد.') + '</span></div><div class="fcards">' + cards + '</div>';
}
function bindForms() {
  document.querySelectorAll('[data-flow]').forEach(function (b) { b.onclick = function () { feOpen(b.dataset.flow); }; });
  document.querySelectorAll('[data-sups]').forEach(function (b) { b.onclick = supOpen; });
  document.querySelectorAll('[data-ftype]').forEach(function (b) { b.addEventListener('click', function () { RW = { i: 0, type: b.dataset.ftype, ref: '', d: {}, busy: false, err: '' }; TAB.reqs = 'new'; }); });
}
var FE = null;
function feOpen(t) {
  var f = formOf(t); if (!f) return;
  FE = { type: t, name: f.name, on: f.on, steps: f.steps.map(function (s) { return { kind: s.kind, v: s.v, label: s.label }; }), err: '', busy: false };
  var cu = need('users', function () { return api({ action: 'usersList' }); }, 60000);
  drawFE();
  if (!cu.data) api({ action: 'usersList' }).then(function (j) { seed('users', j); if (FE && document.getElementById('feLayer')) { sync(); drawFE(); } }, function () { });
}
function feOpts() {
  var d = formsData(), U = (CACHE.users && CACHE.users.data && CACHE.users.data.users) || [];
  var R = Object.keys(d.roles).map(function (k) { var n = U.filter(function (u) { return u.active && u.role === k && u.perms.indexOf('requests.approve') > -1; }).length;
    return { v: 'role:' + k, n: d.roles[k], d: CACHE.users && CACHE.users.data ? (n ? n + ' حساب يملك صلاحية الاعتماد' : 'لا يوجد حساب بهذا الدور يملك صلاحية الاعتماد') : 'كل حساب بهذا الدور', ic: 'users', g: 'حسب الدور' }; });
  var P = U.filter(function (u) { return u.active && u.role !== 'staff'; }).map(function (u) { return { v: 'user:' + u.id, n: u.name || u.email, d: (u.title || u.roleName) + ' · ' + u.email, ic: 'user', g: 'حساب محدد بالاسم' }; });
  var X = (FE && (FE.type === 'leave' || (formOf(FE.type) || {}).mgrOk) ? [{ v: 'manager:', n: 'المسؤول المباشر', d: 'يختاره المنسوب عند التقديم من قائمة المسؤولين المباشرين', ic: 'users', g: 'خطوات خاصة' }] : [])
    .concat([{ v: 'person:', n: 'شخص بالبريد الإلكتروني', d: 'لمن ليس له حساب في المنصة؛ يعتمد من رابط يصله بالبريد', ic: 'mail', g: 'خطوات خاصة' }]);
  return X.concat(R, P);
}
function feAuto(kind, v) {
  var d = formsData(), U = (CACHE.users && CACHE.users.data && CACHE.users.data.users) || [];
  if (kind === 'role') return d.roles[v] || '';
  if (kind === 'manager') return 'المسؤول المباشر';
  if (kind === 'person') return '';
  var u = U.filter(function (x) { return String(x.id) === String(v); })[0]; return u ? (u.title || u.name) : '';
}
function sync() { var el = document.getElementById('feLayer'); if (!el || !FE) return; el.querySelectorAll('[data-fel]').forEach(function (x) { FE.steps[+x.dataset.fel].label = x.value; }); el.querySelectorAll('[data-fee]').forEach(function (x) { FE.steps[+x.dataset.fee].v = x.value.trim(); }); }
function drawFE() {
  var old = document.getElementById('feLayer'); if (old) old.remove();
  var opts = feOpts(), el = document.createElement('div'); el.id = 'feLayer';
  var rows = FE.steps.map(function (s, i) {
    return '<li class="ferow"><span class="fen">' + (i + 1) + '</span><div class="fef"><label>المسؤول عن الاعتماد</label>' + ssel('fe' + i, opts, s.kind ? s.kind + ':' + (s.kind === 'person' || s.kind === 'manager' ? '' : s.v) : '', 'اختر دورًا أو حسابًا', (function (k) { return function (v) {
        sync(); var p = v.split(':'), prevAuto = feAuto(FE.steps[k].kind, FE.steps[k].v), was = FE.steps[k].kind;
        if (!FE.steps[k].label || FE.steps[k].label === prevAuto) FE.steps[k].label = feAuto(p[0], p[1]);
        FE.steps[k].kind = p[0]; FE.steps[k].v = p[0] === 'user' ? +p[1] : p[0] === 'person' ? (was === 'person' ? FE.steps[k].v : '') : p[1]; FE.err = ''; drawFE(); }; })(i), 'المسؤول عن الخطوة ' + (i + 1)) +
      (s.kind === 'person' ? '<input class="feemail" data-fee="' + i + '" type="email" dir="ltr" value="' + esc(s.v || '') + '" placeholder="name@example.com" aria-label="بريد المعتمد في الخطوة ' + (i + 1) + '">' : '') +
      '</div><div class="fef"><label for="fel' + i + '">اسم الخطوة كما يظهر للمنسوب</label><input id="fel' + i + '" data-fel="' + i + '" value="' + esc(s.label) + '" maxlength="60" placeholder="مثال: المدير المالي"></div>' +
      '<div class="fea"><button type="button" class="ib" data-feup="' + i + '" aria-label="تقديم الخطوة"' + (i ? '' : ' disabled') + '>' + ic('chev') + '</button><button type="button" class="ib" data-fedn="' + i + '" aria-label="تأخير الخطوة"' + (i < FE.steps.length - 1 ? '' : ' disabled') + '>' + ic('chev') + '</button><button type="button" class="ib del" data-fedel="' + i + '" aria-label="حذف الخطوة"' + (FE.steps.length > 1 ? '' : ' disabled') + '>' + ic('x') + '</button></div></li>';
  }).join('');
  el.innerHTML = '<div class="mscrim" data-feclose="1"></div><section class="mdl fem" role="dialog" aria-modal="true" aria-labelledby="feT"><header class="mh">' + tile('amethyst', 'stamp') + '<div><h2 id="feT">مسؤولو اعتماد: ' + esc(FE.name) + '</h2><p>رتّب خطوات الاعتماد وحدد من يعتمد كل خطوة</p></div><button class="ib mx" data-feclose="1" aria-label="إغلاق">' + ic('plus') + '</button></header>' +
    '<div class="abody"><label class="tgl"><button type="button" class="sw" role="switch" id="feOn" aria-checked="' + FE.on + '"></button><span><b>النموذج مفعّل</b><small>' + (FE.on ? 'يظهر للمنسوبين ويمكن تقديمه' : 'موقوف: لا يظهر في «طلب جديد» ولا يُقبل تقديمه') + '</small></span></label>' +
    '<ol class="felist">' + rows + '</ol>' + (FE.steps.length < 5 ? '<button type="button" class="btn feadd" id="feAdd">' + ic('plus') + 'إضافة خطوة اعتماد</button>' : '') +
    '<div class="fepre"><small>المسار بعد الحفظ</small><b>المنسوب ← ' + FE.steps.map(function (s) { return esc(s.label || '…'); }).join(' ← ') + ' ← القرار</b></div>' +
    '<div class="note">' + ic('info') + '<span>«المسؤول المباشر» يختاره المنسوب عند التقديم، ويستطيع التعديل قبل الاعتماد. «شخص بالبريد» لمن ليس له حساب: يصله رابط خاص يعتمد منه. «حسب الدور» يعني أن أي حساب بهذا الدور يملك صلاحية «اعتماد طلبات المنسوبين» يستطيع الاعتماد. «حساب محدد» يجعل الاعتماد لشخص بعينه حتى لو لم تكن لديه هذه الصلاحية. التعديل يسري على الطلبات الجديدة، والطلبات القائمة تكمل مسارها. ولمدير النظام اعتماد أي خطوة عند الضرورة.</span></div></div>' +
    '<footer class="mf"><div class="lerr" role="alert">' + esc(FE.err) + '</div><button class="btn" data-feclose="1">إلغاء</button><button class="btn goldb" id="feSave"' + (FE.busy ? ' disabled' : '') + '>' + ic('check') + (FE.busy ? 'جارٍ الحفظ…' : 'حفظ المسار') + '</button></footer></section>';
  document.body.appendChild(el);
  var sync = function () { el.querySelectorAll('[data-fel]').forEach(function (x) { FE.steps[+x.dataset.fel].label = x.value; }); el.querySelectorAll('[data-fee]').forEach(function (x) { FE.steps[+x.dataset.fee].v = x.value.trim(); }); };
  el.querySelectorAll('[data-feclose]').forEach(function (b) { b.onclick = function () { el.remove(); FE = null; }; });
  el.querySelectorAll('[data-fel]').forEach(function (x) { x.oninput = function () { FE.steps[+x.dataset.fel].label = x.value; var p = el.querySelector('.fepre b'); if (p) p.textContent = 'المنسوب ← ' + FE.steps.map(function (s) { return s.label || '…'; }).join(' ← ') + ' ← القرار'; }; });
  el.querySelectorAll('[data-feup],[data-fedn]').forEach(function (b) { b.onclick = function () { sync(); var i = +(b.dataset.feup || b.dataset.fedn), j = b.dataset.feup ? i - 1 : i + 1, t = FE.steps[i]; FE.steps[i] = FE.steps[j]; FE.steps[j] = t; drawFE(); }; });
  el.querySelectorAll('[data-fedel]').forEach(function (b) { b.onclick = function () { sync(); FE.steps.splice(+b.dataset.fedel, 1); drawFE(); }; });
  var add = document.getElementById('feAdd'); if (add) add.onclick = function () { sync(); FE.steps.push({ kind: '', v: '', label: '' }); drawFE(); };
  document.getElementById('feOn').onclick = function () { sync(); FE.on = !FE.on; drawFE(); };
  document.getElementById('feSave').onclick = function () {
    sync();
    if (FE.steps.some(function (s) { return !s.kind; })) { FE.err = 'اختر المسؤول عن كل خطوة.'; drawFE(); return; }
    if (FE.steps.some(function (s) { return s.kind === 'person' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.v || ''); })) { FE.err = 'اكتب بريدًا صحيحًا لكل خطوة «شخص بالبريد».'; drawFE(); return; }
    if (FE.steps.some(function (s, i) { return s.kind === 'manager' && i !== 0; })) { FE.err = '«المسؤول المباشر» يكون الخطوة الأولى في المسار.'; drawFE(); return; }
    FE.busy = true; drawFE();
    api({ action: 'reqFormsSave', type: FE.type, on: FE.on, steps: FE.steps }).then(function (j) { seed('reqForms', j); var L = document.getElementById('feLayer'); if (L) L.remove(); FE = null; toast('حُفظ مسار الاعتماد'); render(); })
      .catch(function (e) { FE.busy = false; FE.err = errText(e); drawFE(); });
  };
}
document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && document.getElementById('feLayer') && !document.querySelector('.ss-pop')) { document.getElementById('feLayer').remove(); FE = null; } });

/* ---------- المسؤولون المباشرون (يختار المنسوب منهم عند تقديم الطلبات) ---------- */
var SUP = null;
function supOpen() {
  var d = formsData(); if (!d) return;
  SUP = { list: (d.sups || []).map(function (x) { return { id: x.id, name: x.name, email: x.email || '', title: x.title || '' }; }), err: '', busy: false, paste: '' };
  drawSup();
}
function supSync() { var el = document.getElementById('supLayer'); if (!el || !SUP) return; el.querySelectorAll('[data-sp]').forEach(function (x) { var p = x.dataset.sp.split(':'); SUP.list[+p[0]][p[1]] = x.value; }); var t = document.getElementById('supPaste'); if (t) SUP.paste = t.value; }
function drawSup() {
  var old = document.getElementById('supLayer'); if (old) old.remove();
  var el = document.createElement('div'); el.id = 'supLayer';
  var have = {}; SUP.list.forEach(function (x) { have[String(x.email).toLowerCase()] = 1; });
  var opts = STAFF.filter(function (s) { return s.mail && !have[s.mail.toLowerCase()]; }).map(function (s) { return { v: s.ref, n: s.name, d: s.job + ' · ' + s.ent.n, c: s.ent.c }; });
  var rows = SUP.list.length ? SUP.list.map(function (x, i) {
    return '<li class="suprow"><span class="fen">' + (i + 1) + '</span><input data-sp="' + i + ':name" value="' + esc(x.name) + '" placeholder="الاسم كما يظهر للمنسوب، مثل: د. فلان" aria-label="الاسم">' +
      '<input data-sp="' + i + ':title" value="' + esc(x.title) + '" placeholder="الصفة (اختياري)" aria-label="الصفة">' +
      '<input data-sp="' + i + ':email" value="' + esc(x.email) + '" type="email" dir="ltr" placeholder="name@example.com" aria-label="البريد">' +
      '<button type="button" class="ib del" data-spdel="' + i + '" aria-label="حذف">' + ic('x') + '</button></li>'; }).join('') : '<li class="empty">لا يوجد مسؤولون بعد. أضف من المنسوبين أو الصق القائمة.</li>';
  el.innerHTML = '<div class="mscrim" data-spclose="1"></div><section class="mdl fem supm" role="dialog" aria-modal="true" aria-labelledby="supT"><header class="mh">' + tile('emerald', 'users') + '<div><h2 id="supT">المسؤولون المباشرون</h2><p>يختار المنسوب مسؤوله من هذه القائمة عند تقديم أي طلب خطوته الأولى «المسؤول المباشر»، فيصله الطلب أولًا</p></div><button class="ib mx" data-spclose="1" aria-label="إغلاق">' + ic('plus') + '</button></header>' +
    '<div class="abody"><ol class="suplist">' + rows + '</ol>' +
    '<div class="supadd"><div class="fef"><label>إضافة من سجل المنسوبين</label>' + ssel('supPick', opts, '', 'ابحث باسم المنسوب', function (v) { supSync(); var s = byRef(v); if (s) SUP.list.push({ id: '', name: s.name, title: s.job !== '—' ? s.job : '', email: s.mail }); drawSup(); }, 'إضافة من المنسوبين') + '</div>' +
    '<button type="button" class="btn" id="supNew">' + ic('plus') + 'إضافة يدويًا</button></div>' +
    '<details class="suppaste"' + (SUP.paste ? ' open' : '') + '><summary>' + ic('doc') + 'لصق قائمة كاملة</summary><p>كل سطر: الاسم، ثم البريد (ويمكن إضافة الصفة بعدهما). مثال:<br><span class="ltr">د. فلان الفلاني, name@example.com</span></p><textarea id="supPaste" rows="5" dir="auto" placeholder="الاسم, البريد">' + esc(SUP.paste) + '</textarea><button type="button" class="btn" id="supParse">' + ic('plus') + 'إضافة الأسطر إلى القائمة</button></details>' +
    '<div class="note">' + ic('info') + '<span>البريد لا يظهر للمنسوبين؛ يرون الاسم والصفة فقط. ويصل المسؤول رابط خاص بكل طلب يعتمده أو يعدّله أو يرفضه منه، أو من المنصة إن كان له حساب.</span></div></div>' +
    '<footer class="mf"><div class="lerr" role="alert">' + esc(SUP.err) + '</div><button class="btn" data-spclose="1">إلغاء</button><button class="btn goldb" id="supSave"' + (SUP.busy ? ' disabled' : '') + '>' + ic('check') + (SUP.busy ? 'جارٍ الحفظ…' : 'حفظ القائمة') + '</button></footer></section>';
  document.body.appendChild(el);
  el.querySelectorAll('[data-spclose]').forEach(function (b) { b.onclick = function () { el.remove(); SUP = null; }; });
  el.querySelectorAll('[data-spdel]').forEach(function (b) { b.onclick = function () { supSync(); SUP.list.splice(+b.dataset.spdel, 1); drawSup(); }; });
  document.getElementById('supNew').onclick = function () { supSync(); SUP.list.push({ id: '', name: '', title: '', email: '' }); drawSup(); var x = el.querySelectorAll('[data-sp$=":name"]'); var l = document.querySelector('#supLayer [data-sp="' + (SUP.list.length - 1) + ':name"]'); if (l) l.focus(); };
  document.getElementById('supParse').onclick = function () {
    supSync(); var n0 = SUP.list.length, dup = 0;
    SUP.paste.split(/\n+/).forEach(function (line) {
      var m = /([^\s<>,;،]+@[^\s<>,;،]+\.[^\s<>,;،]+)/.exec(line); if (!m) return;
      var em = m[1].toLowerCase(), rest = line.replace(m[0], '').replace(/[<>"'{}]/g, ' ').split(/[,;،\t|]+/).map(function (x) { return x.replace(/\b(name|email)\s*:/gi, '').trim(); }).filter(Boolean);
      if (SUP.list.some(function (x) { return String(x.email).toLowerCase() === em; })) { dup++; return; }
      SUP.list.push({ id: '', name: rest[0] || '', title: rest[1] || '', email: em });
    });
    SUP.err = SUP.list.length > n0 ? '' : dup ? 'هذه العناوين موجودة في القائمة مسبقًا.' : 'لم نجد بريدًا صحيحًا في الأسطر.'; if (SUP.list.length > n0 || dup) SUP.paste = ''; drawSup();
  };
  document.getElementById('supSave').onclick = function () {
    supSync();
    var bad = SUP.list.filter(function (x) { return String(x.name).trim().length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(x.email).trim()); })[0];
    if (bad) { SUP.err = 'أكمل الاسم والبريد الصحيح لكل مسؤول' + (bad.name ? ': ' + bad.name : '') + '.'; drawSup(); return; }
    SUP.busy = true; drawSup();
    api({ action: 'reqSupsSave', sups: SUP.list }).then(function (j) { seed('reqForms', j); var L = document.getElementById('supLayer'); if (L) L.remove(); SUP = null; toast('حُفظت قائمة المسؤولين المباشرين'); render(); })
      .catch(function (e) { SUP.busy = false; SUP.err = errText(e); drawSup(); });
  };
}
document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && document.getElementById('supLayer') && !document.querySelector('.ss-pop')) { document.getElementById('supLayer').remove(); SUP = null; } });

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
    passkey_uv: 'يلزم التحقق بالبصمة أو الوجه أو رمز قفل الجهاز.', pk_fresh: 'لحمايتك، تفعيل البصمة يحتاج دخولًا حديثًا. اخرج وادخل برمز البريد ثم فعّلها مباشرة.', passkey_exists: 'هذا الجهاز مفعّلة عليه البصمة من قبل.', passkey_many: 'وصلت إلى الحد الأقصى (١٠ بصمات). احذف واحدة قديمة أولًا.', device_expired: 'انتهت صلاحية حفظ هذا الجهاز. ادخل بالرمز مرة واحدة.' }[m] || errText(e);
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

/* ======================================================================
   النظام المتكامل: إعدادات المنصة · الحضور · التعاميم · الهيكل · التقارير · أرصدة الإجازات
   ====================================================================== */
var SITE = null, MY_BAL = null, UI_HOME = null, HOME_AV = [];
/* لوحات الصفحة الرئيسية: [المعرّف، الاسم، تأخذ عرض الصفحة كاملًا؟] — بالترتيب الافتراضي */
var HOME_BLOCKS = [['hero', 'الترحيب والخريطة والساعات', 1], ['kpis', 'المؤشرات الأربعة', 1], ['ents', 'الجهات', 1], ['quality', 'جودة البيانات'], ['geo', 'التوزيع الجغرافي'], ['doclvl', 'الوثائق حسب الحالة'],
  ['cal', 'تقويم انتهاء الوثائق', 1], ['recent', 'أحدث المنسوبين'], ['log', 'آخر العمليات'], ['third', 'جاهزية النظام / بيانات التواصل'], ['status', 'حالة الملفات'], ['qa', 'إجراءات سريعة'], ['events', 'مناسبات قادمة']];
var HOME_FULL = {}; HOME_BLOCKS.forEach(function (x) { if (x[2]) HOME_FULL[x[0]] = 1; });
function homeOrder(av) {
  var u = UI_HOME || {}, hid = u.hidden || [], seen = {}, o = [];
  (u.order || []).concat(HOME_BLOCKS.map(function (x) { return x[0]; })).forEach(function (k) { if (!seen[k] && av.indexOf(k) > -1) { seen[k] = 1; if (hid.indexOf(k) < 0) o.push(k); } });
  return o;
}
/* نافذة «ترتيب الواجهة»: سحب وإفلات أو أسهم، وإخفاء/إظهار، ويُحفظ لهذا المستخدم على كل أجهزته */
var HC = null;
function hcOpen() {
  var u = UI_HOME || {}, hid = u.hidden || [], seen = {}, o = [];
  (u.order || []).concat(HOME_BLOCKS.map(function (x) { return x[0]; })).forEach(function (k) { if (!seen[k] && HOME_AV.indexOf(k) > -1) { seen[k] = 1; o.push(k); } });
  HC = { order: o, hidden: hid.filter(function (k) { return HOME_AV.indexOf(k) > -1; }), busy: false }; drawHC();
}
function hcName(k) { if (k === 'third') return can('users') ? 'جاهزية النظام والأمان' : 'بيانات التواصل'; for (var i = 0; i < HOME_BLOCKS.length; i++) if (HOME_BLOCKS[i][0] === k) return HOME_BLOCKS[i][1]; return k; }
function drawHC() {
  var old = document.getElementById('hcLayer'), y = old ? old.querySelector('.hcl').scrollTop : 0; if (old) old.remove();
  var el = document.createElement('div'); el.id = 'hcLayer';
  el.innerHTML = '<div class="mscrim" data-hcx="1"></div><section class="mdl hcm" role="dialog" aria-modal="true" aria-labelledby="hcT"><header class="mh">' + tile('sapphire', 'grid') + '<div><h2 id="hcT">ترتيب الواجهة</h2><p>اسحب اللوحة إلى مكانها أو استخدم الأسهم، وأخفِ ما لا تحتاجه. الترتيب لك وحدك ويُحفظ على كل أجهزتك.</p></div></header>' +
    '<ol class="hcl">' + HC.order.map(function (k, i) { var off = HC.hidden.indexOf(k) > -1;
      return '<li draggable="true" data-hck="' + k + '" class="' + (off ? 'off' : '') + (HOME_FULL[k] ? ' full' : '') + '"><span class="hg" aria-hidden="true">⋮⋮</span><span class="hn">' + esc(hcName(k)) + '<small>' + (HOME_FULL[k] ? 'بعرض الصفحة' : 'لوحة صغيرة') + (off ? ' · مخفية' : '') + '</small></span>' +
        '<button type="button" class="hb" data-hcm="-1" data-k="' + k + '"' + (i ? '' : ' disabled') + ' aria-label="أعلى">↑</button><button type="button" class="hb" data-hcm="1" data-k="' + k + '"' + (i < HC.order.length - 1 ? '' : ' disabled') + ' aria-label="أسفل">↓</button>' +
        '<button type="button" class="sw" role="switch" aria-checked="' + !off + '" data-hct="' + k + '" aria-label="إظهار ' + esc(hcName(k)) + '"></button></li>'; }).join('') + '</ol>' +
    '<footer class="mf"><button class="btn" id="hcReset"' + (UI_HOME ? '' : ' disabled') + '>الترتيب الافتراضي</button><span style="flex:1"></span><button class="btn" data-hcx="1">إلغاء</button><button class="btn goldb" id="hcSave"' + (HC.busy ? ' disabled' : '') + '>' + (HC.busy ? 'جارٍ الحفظ…' : 'حفظ') + '</button></footer></section>';
  document.body.appendChild(el); el.querySelector('.hcl').scrollTop = y;
  var move = function (k, to) { var i = HC.order.indexOf(k); if (i < 0 || to < 0 || to >= HC.order.length) return; HC.order.splice(i, 1); HC.order.splice(to, 0, k); drawHC(); };
  el.querySelectorAll('[data-hcx]').forEach(function (b) { b.onclick = function () { el.remove(); }; });
  el.querySelectorAll('[data-hcm]').forEach(function (b) { b.onclick = function () { move(b.dataset.k, HC.order.indexOf(b.dataset.k) + (+b.dataset.hcm)); }; });
  el.querySelectorAll('[data-hct]').forEach(function (b) { b.onclick = function () { var k = b.dataset.hct, i = HC.hidden.indexOf(k); if (i > -1) HC.hidden.splice(i, 1); else HC.hidden.push(k); drawHC(); }; });
  var drag = null;
  el.querySelectorAll('[data-hck]').forEach(function (li) {
    li.addEventListener('dragstart', function (e) { drag = li.dataset.hck; li.classList.add('dg'); try { e.dataTransfer.setData('text/plain', drag); e.dataTransfer.effectAllowed = 'move'; } catch (x) { } });
    li.addEventListener('dragend', function () { li.classList.remove('dg'); });
    li.addEventListener('dragover', function (e) { e.preventDefault(); li.classList.add('ov'); });
    li.addEventListener('dragleave', function () { li.classList.remove('ov'); });
    li.addEventListener('drop', function (e) { e.preventDefault(); if (drag && drag !== li.dataset.hck) move(drag, HC.order.indexOf(li.dataset.hck)); });
  });
  var done = function (j, msg) { UI_HOME = (j.ui && j.ui.home) || null; el.remove(); toast(msg); if (view === 'home') softRender(); };
  el.querySelector('#hcReset').onclick = function () { api({ action: 'uiSave', reset: 1 }).then(function (j) { done(j, 'عادت صفحتك إلى الترتيب الافتراضي'); }, function (er) { toast(errText(er)); }); };
  el.querySelector('#hcSave').onclick = function () { HC.busy = true; drawHC();
    api({ action: 'uiSave', home: { order: HC.order, hidden: HC.hidden } }).then(function (j) { done(j, 'حُفظ ترتيب صفحتك'); }, function (er) { HC.busy = false; drawHC(); toast(errText(er)); }); };
}
document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('#hcOpen')) hcOpen(); });
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { var l = document.getElementById('hcLayer'); if (l) l.remove(); } });
function S(g, k) { return !SITE || !SITE[g] || SITE[g][k] !== false; }
function mod(k) { return S('modules', k); }
function staffOn(k) { var m = { myreq: 'reqs', reqs: 'reqs', att: 'att', myatt: 'att', news: 'news', mynews: 'news' }[k]; return S('staff', k === 'myreq' ? 'reqs' : k === 'myatt' ? 'att' : k === 'mynews' ? 'news' : k) && (!m || mod(m)); }
var WD = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

TITLES.att = ['الحضور والانصراف']; TITLES.news = ['التعاميم والإعلانات']; TITLES.reports = ['التقارير']; TITLES.myatt = ['حضوري']; TITLES.mynews = ['التعاميم'];
STAFF_VIEWS.push('myatt', 'mynews');
TAB.att = 'month'; TABL.att = { month: 'السجل الشهري', imp: 'استيراد ملف البصمة' };
TABL.people = TABL.people || {}; TABL.people.org = 'الهيكل التنظيمي';
TABL.system = TABL.system || {}; TABL.system.set = 'إعدادات المنصة';
ALIAS['att-imp'] = ['att', 'imp']; ALIAS['att-month'] = ['att', 'month']; ALIAS.org = ['people', 'org']; ALIAS.settings = ['system', 'set'];

/* من يرى كل صفحة: الصلاحية + إعداد الإظهار */
function allowed(v) {
  if (!TITLES[v]) return false;
  if (role === 'staff') return STAFF_VIEWS.indexOf(v) >= 0 && (v === 'me' || v === 'myfile' || staffOn(v));
  if (STAFF_VIEWS.indexOf(v) >= 0) return false;
  if (v === 'payroll') return can('pay') && mod('payroll');
  if (v === 'system') return can('sys');
  if (v === 'reqs') return mod('reqs') || can('settings');
  if (v === 'att') return can('attv') && mod('att');
  if (v === 'news') return mod('news') || can('news');
  if (v === 'reports') return can('reports') && mod('reports');
  if (v === 'hract' || v === 'custody' || v === 'evals') return can('view') && mod(v === 'hract' ? 'acts' : v);
  if (v === 'jobs') return can('view') && mod('jobs');
  return true;
}
/* شارات الأقسام الجديدة من الذاكرة المؤقتة فقط (لا تطلب من الخادم) */
function hrBadge(k) {
  var a = CACHE.acts && CACHE.acts.data, j = CACHE.jobs && CACHE.jobs.data, c = CACHE.cus && CACHE.cus.data, e = CACHE.evals && CACHE.evals.data;
  if (k === 'act') return a && a.canDecide ? a.rows.filter(function (x) { return x.status === 'pending'; }).length : 0;
  if (k === 'apps') return j && j.apps ? j.apps.filter(function (x) { return x.status === 'new'; }).length : 0;
  if (k === 'mine') return (a ? a.rows.filter(function (x) { return !x.ackAt; }).length : 0) + (c ? c.rows.filter(function (x) { return x.open && !x.ackAt; }).length : 0) + (e && e.rows ? e.rows.filter(function (x) { return x.status === 'sent'; }).length : 0);
  return 0;
}

/* ---------- الشريط الجانبي: الأقسام كلها حسب الصلاحية والإظهار ---------- */
function newsUnread() { var d = CACHE.news && CACHE.news.data; return d && d.rows ? d.rows.filter(function (n) { return !n.read; }).length : 0; }
var NAVX = { v: null, open: null };
document.addEventListener('click', function (e) {
  var a = e.target.closest && e.target.closest('a.gh[data-gv]'); if (!a) return;
  e.preventDefault();
  var g = a.closest('.grp'), v = a.getAttribute('data-gv'), willOpen = !g.classList.contains('open');
  document.querySelectorAll('.side .grp.open').forEach(function (o) { if (o !== g) { o.classList.remove('open'); var h = o.querySelector('a.gh'); if (h) h.setAttribute('aria-expanded', 'false'); } });
  g.classList.toggle('open', willOpen); a.setAttribute('aria-expanded', String(willOpen)); NAVX.open = willOpen ? v : null;
}, true);
function sideHTML() {
  var G;
  if (role === 'staff') {
    var open = myRows().filter(function (r) { return r.status === 'pending'; }).length, pendS = reqPendingForMe().length, isAppr = pendS || apprRows().length;
    G = [['خدماتي', [
      { v: 'me', n: 'صفحتي', d: 'ملخص ملفك ورصيدك', j: 'emerald', i: 'grid' },
      staffOn('myreq') ? { v: 'myreq', n: 'طلباتي', d: isAppr ? 'طلباتك وما ينتظر اعتمادك' : 'إجازة واستئذان ومباشرة وسلفة', j: 'sapphire', i: 'doc', b: open + pendS, s: [['myreq-new', 'طلب جديد', view === 'myreq' && TAB.myreq === 'new'], ['myreq-list', 'متابعة طلباتي', view === 'myreq' && TAB.myreq === 'list', open]].concat(isAppr ? [['myreq-pend', 'بانتظار اعتمادي', view === 'myreq' && TAB.myreq === 'pend', pendS, 1]] : []) } : null,
      staffOn('myatt') ? { v: 'myatt', n: 'حضوري', d: 'الحضور والتأخير هذا الشهر', j: 'teal', i: 'finger' } : null,
      staffOn('mynews') ? { v: 'mynews', n: 'التعاميم', d: 'إعلانات الموارد البشرية', j: 'gold', i: 'bell', b: newsUnread() } : null,
      staffOn('myhr') ? { v: 'myhr', n: 'سجلي الوظيفي', d: 'الإجراءات والعهد والتقييمات', j: 'gold', i: 'medal', b: hrBadge('mine') } : null,
      { v: 'myfile', n: 'ملفي وبطاقتي', d: 'بياناتك والبطاقة الرسمية', j: 'garnet', i: 'card', s: S('staff', 'update') ? [['update.html?me=1', 'تحديث بياناتي', false]] : [] }].filter(Boolean)]];
  } else {
    var pend = reqPendingForMe().length;
    G = [['العمل اليومي', [
      { v: 'home', n: 'لوحة القيادة', d: 'ملخص اليوم وما يحتاج إجراء', j: 'emerald', i: 'grid' },
      { v: 'people', n: 'المنسوبون', d: 'الملفات والوثائق والبطاقات', j: 'sapphire', i: 'users', b: CNT.exp, s: [['staff', 'دليل المنسوبين', view === 'people' && TAB.people === 'dir' && filt.st === 'all', CNT.tot], ['gaps', 'الملفات الناقصة', view === 'people' && TAB.people === 'dir' && filt.st === 'gap', CNT.gap], ['documents', 'الوثائق', view === 'people' && TAB.people === 'docs', CNT.exp, 1]].concat(mod('org') ? [['org', 'الهيكل التنظيمي', view === 'people' && TAB.people === 'org']] : []) },
      allowed('reqs') ? { v: 'reqs', n: 'الطلبات', d: 'الإجازات والاستئذان والسلف وغيرها', j: 'amethyst', i: 'stamp', b: pend, s: [['reqs-pend', 'بانتظار اعتمادي', view === 'reqs' && TAB.reqs === 'pend', pend, 1], ['reqs-all', 'كل الطلبات', view === 'reqs' && TAB.reqs === 'all']].concat(mod('forms') || can('settings') || can('forms') ? [['forms', 'النماذج الإدارية', view === 'reqs' && TAB.reqs === 'forms']] : []).concat(can('edit') ? [['reqs-new', 'طلب نيابة عن منسوب', view === 'reqs' && TAB.reqs === 'new']] : []) } : null,
      allowed('att') ? { v: 'att', n: 'الحضور والانصراف', d: 'من ملف جهاز البصمة', j: 'teal', i: 'finger', s: [['att-month', 'السجل الشهري', view === 'att' && TAB.att === 'month']].concat(can('attm') ? [['att-imp', 'استيراد ملف البصمة', view === 'att' && TAB.att === 'imp']] : []) } : null,
      allowed('news') ? { v: 'news', n: 'التعاميم والإعلانات', d: 'تصل المنسوبين في صفحاتهم', j: 'gold', i: 'bell' } : null].filter(Boolean)],
      ['شؤون الموظفين', [
        allowed('hract') ? { v: 'hract', n: 'الإجراءات الإدارية', d: 'إنذارات وترقيات ونقل وشكر', j: 'garnet', i: 'stamp', b: hrBadge('act') } : null,
        allowed('custody') ? { v: 'custody', n: 'العهد', d: 'ما لدى المنسوبين من أجهزة وغيرها', j: 'teal', i: 'box' } : null,
        allowed('evals') ? { v: 'evals', n: 'تقييم الأداء', d: 'بالمعايير مع اطلاع المنسوب', j: 'gold', i: 'medal' } : null,
        allowed('jobs') ? { v: 'jobs', n: 'التوظيف', d: 'الوظائف والمتقدمون والمقابلات', j: 'amethyst', i: 'userok', b: hrBadge('apps') } : null].filter(Boolean)],
      ['الإدارة', [
        allowed('payroll') ? { v: 'payroll', n: 'الرواتب', d: 'حسب الجهة والعملة', j: 'gold', i: 'wallet', b: 0, s: [['payroll', 'كشف الرواتب', view === 'payroll' && PAYF === 'all'], ['banks', 'الحسابات البنكية', view === 'payroll' && PAYF === 'nobank', CNT.nobank, 1], ['paymonth', 'مستحقات واستقطاعات الشهر', view === 'payroll' && PAYF === 'month']] } : null,
        allowed('reports') ? { v: 'reports', n: 'التقارير', d: 'تصفية وتصدير وطباعة', j: 'sapphire', i: 'chart' } : null,
        can('sys') ? { v: 'system', n: 'النظام', d: 'الحسابات والإعدادات والسجل', j: 'slate', i: 'shield', s: [can('users') ? ['accounts', 'الموظفون والصلاحيات', view === 'system' && TAB.system === 'acc'] : null, can('settings') ? ['settings', 'إعدادات المنصة', view === 'system' && TAB.system === 'set'] : null, can('audit') ? ['log', 'سجل العمليات', view === 'system' && TAB.system === 'log'] : null, can('drive') || can('users') ? ['data', 'البيانات والنسخ', view === 'system' && TAB.system === 'data'] : null].filter(Boolean) } : null].filter(Boolean)]];
  }
  /* القائمة المتحركة: المجموعة النشطة مفتوحة، والضغط على عنوان مجموعة لها فروع يفتحها أو يغلقها */
  if (NAVX.v !== view) { NAVX.v = view; NAVX.open = view; }
  var navH = G.filter(function (g) { return g[1].length; }).map(function (g) {
    return '<div class="nsec"><span class="nlab">' + g[0] + '</span>' + g[1].map(function (x) {
      var on = view === x.v, hs = !!(x.s && x.s.length), op = hs && NAVX.open === x.v;
      return '<div class="grp' + (on ? ' on' : '') + (hs ? ' hs' : '') + (op ? ' open' : '') + '"><a class="gh" href="#' + x.v + '"' + (hs ? ' data-gv="' + x.v + '" aria-expanded="' + op + '"' : '') + (on ? ' aria-current="page"' : '') + '>' + tile(x.j, x.i) + '<span class="gt"><b>' + x.n + '</b><small>' + x.d + '</small></span>' + (x.b ? '<span class="gc hot">' + x.b + '</span>' : '') + (hs ? ic('chev', 'chev') : '') + '</a>' +
        (hs ? '<div class="subs">' + x.s.map(function (s) { return '<a class="sb' + (s[2] ? ' on' : '') + '" href="' + (/\.html/.test(s[0]) ? s[0] : '#' + s[0]) + '"' + (s[2] ? ' aria-current="true"' : '') + '><i aria-hidden="true"></i><span>' + s[1] + '</span>' + (s[3] ? '<em' + (s[4] ? ' class="hot"' : '') + '>' + s[3] + '</em>' : '') + '</a>'; }).join('') + '</div>' : '') + '</div>';
    }).join('') + '</div>';
  }).join('');
  return '<div class="side-in"><div class="brand"><span class="lt"><img src="' + LOGO + '" alt="بنيان"></span><div><b>' + (role === 'staff' ? 'بوابة المنسوب' : 'بنيان للموارد البشرية') + '</b><small>مجموعة بنيان العالمية</small></div></div><nav class="nav" aria-label="الأقسام">' + navH + '</nav></div>';
}
ALIAS.documents = ALIAS.documents || ['people', 'docs'];

/* ---------- النظام: تبويب «إعدادات المنصة» ---------- */
VIEWS.system = function () {
  var T = []; if (can('users')) T.push(['acc', 'الحسابات والصلاحيات', null, 'key']); if (can('settings')) T.push(['set', 'إعدادات المنصة', null, 'gauge']); if (can('audit')) T.push(['log', 'سجل العمليات', null, 'history']); if (can('drive') || can('users')) T.push(['data', 'البيانات والنسخ', null, 'folder']);
  if (!T.length) return '<section class="pn"><div class="empty">لا صلاحية لك في هذا القسم.</div></section>';
  if (!T.some(function (x) { return x[0] === TAB.system; })) TAB.system = T[0][0];
  var t = TAB.system, D = { acc: 'من يدخل المنصة، وماذا يرى، وماذا يعدّل. كل تغيير يُسجَّل باسمك.', set: 'أظهر أو أخفِ أي قسم في المنصة وفي بوابة المنسوب، وحدّد سياسة الإجازات وأوقات الدوام.', log: 'كل عملية تُسجَّل باسم صاحبها ووقتها، والسجل مختوم بسلسلة تكشف أي تعديل عليه.', data: 'أين تُحفظ البيانات، والنسخ الاحتياطية، والتصدير، وصحة النظام.' };
  return ptitle('النظام', D[t], t === 'data' && can('drive') ? '<button class="btn goldb" data-act="backupNow">' + ic('refresh') + 'نسخة احتياطية الآن</button>' : '') + (T.length > 1 ? vtabs('system', T) : '') +
    (t === 'acc' ? sub(VIEWS.accounts) : t === 'set' ? setHTML() : t === 'log' ? sub(VIEWS.log) : sub(VIEWS.data));
};
var SD = null;
var SET_GROUPS = [
  ['modules', 'أقسام المنصة', 'ما يظهر في القائمة الجانبية لكل الموظفين. إخفاء القسم يخفيه عن الجميع، والصلاحيات تحدد من يدخله.', 'grid', [
    ['reqs', 'الطلبات', 'الإجازات وأوامر الإركاب والتعريفات ومسارات اعتمادها', 'stamp'], ['forms', 'النماذج الإدارية', 'صفحة النماذج ومسؤولي الاعتماد', 'file'],
    ['att', 'الحضور والانصراف', 'السجل الشهري واستيراد ملف جهاز البصمة', 'finger'], ['news', 'التعاميم والإعلانات', 'تصل المنسوبين في صفحاتهم مع متابعة القراءة', 'bell'],
    ['payroll', 'الرواتب', 'كشف الرواتب والحسابات البنكية (لمن يملك صلاحية المالية)', 'wallet'], ['acts', 'الإجراءات الإدارية', 'لفت النظر والإنذارات والترقيات والنقل والعلاوات وخطابات الشكر', 'stamp'], ['custody', 'العهد', 'ما يُسلَّم للمنسوبين ويُسترد عند انتهاء الخدمة', 'box'],
    ['evals', 'تقييم الأداء', 'تقييم المنسوبين بالمعايير واطلاعهم عليه', 'medal'], ['jobs', 'التوظيف', 'إعلان الوظائف واستقبال المتقدمين والمقابلات', 'userok'], ['org', 'الهيكل التنظيمي', 'الجهات والإدارات ومن فيها', 'building'], ['reports', 'التقارير', 'تقارير قابلة للتصفية والتصدير والطباعة', 'chart']]],
  ['staff', 'بوابة المنسوب', 'ما يراه المنسوب حين يدخل ببريده. الإخفاء هنا يُطبَّق في الخادم أيضًا.', 'user', [
    ['card', 'البطاقة الرسمية', 'عرض بطاقته وتنزيلها', 'card'], ['docs', 'الوثائق', 'وثائقه وتواريخ انتهائها', 'pass'], ['pay', 'الراتب والحساب البنكي', 'يظهر له راتبه وبنكه؛ عند الإخفاء تظهر مقنّعة', 'wallet'],
    ['reqs', 'تقديم الطلبات', 'الإجازة والاستئذان والمباشرة والسلفة وغيرها من صفحته', 'stamp'], ['balance', 'رصيد الإجازات', 'المستحق والمستهلك والمتبقي', 'umbrella'], ['att', 'حضوري', 'سجل حضوره وتأخيره', 'finger'],
    ['news', 'التعاميم', 'التعاميم الموجهة إليه', 'bell'], ['update', 'تحديث بياناتي', 'تعديل بياناته ورفع وثائقه بنفسه', 'edit'], ['myhr', 'سجلي الوظيفي', 'الإجراءات والخطابات والعهد وتقييمات الأداء', 'medal']]],
  ['home', 'لوحة القيادة', 'اللوحات التي تظهر في الصفحة الرئيسية للإدارة.', 'gauge', [
    ['hero', 'الترحيب والخريطة والساعات', '', 'globe'], ['kpis', 'المؤشرات الأربعة', '', 'chart'], ['qa', 'إجراءات سريعة', '', 'plus'], ['events', 'مناسبات قادمة', 'لا تظهر للإدارة والموارد البشرية والرئيس التنفيذي', 'calendar'],
    ['charts', 'حالة الملفات', '', 'pie'], ['quality', 'جودة البيانات والتوزيع والوثائق', '', 'gauge'], ['cal', 'تقويم انتهاء الوثائق', 'لا يظهر للرئيس التنفيذي', 'calendar'], ['ents', 'الجهات', '', 'building'], ['recent', 'أحدث المنسوبين وآخر العمليات', '«آخر العمليات» لمسؤول النظام وحده', 'history']]]
];
function setHTML() {
  if (!SITE) return '<section class="pn"><div class="pb"><div class="empty">جارٍ التحميل…</div></div></section>';
  if (!SD) SD = JSON.parse(JSON.stringify(SITE));
  var dirty = JSON.stringify(SD) !== JSON.stringify(SITE);
  var groups = SET_GROUPS.map(function (g) {
    var on = g[4].filter(function (x) { return SD[g[0]][x[0]] !== false; }).length;
    return pn(g[0] === 'modules' ? 'sapphire' : g[0] === 'staff' ? 'emerald' : 'amethyst', g[3], g[1], g[2], '<span class="pill ' + (on === g[4].length ? 'ok' : 'mute') + '"><i></i>' + on + ' من ' + g[4].length + ' ظاهر</span>',
      '<div class="pb setg">' + g[4].map(function (x) { var v = SD[g[0]][x[0]] !== false;
        return '<label class="setrow' + (v ? '' : ' off') + '">' + tile(v ? 'emerald' : 'slate', x[3]) + '<span><b>' + x[1] + '</b>' + (x[2] ? '<small>' + x[2] + '</small>' : '') + '</span><button type="button" class="sw" role="switch" aria-checked="' + v + '" data-set="' + g[0] + '.' + x[0] + '" aria-label="' + esc(x[1]) + '"></button></label>'; }).join('') + '</div>');
  });
  var L = SD.leave, Wk = SD.work;
  var leave = pn('gold', 'umbrella', 'سياسة الإجازات', 'تُحسب منها أرصدة المنسوبين تلقائيًا من الإجازات المعتمدة', '', '<div class="pb"><div class="form">' +
    '<div class="fld"><label for="stAnnual">الاستحقاق السنوي (يوم)</label><input id="stAnnual" type="number" min="0" max="90" value="' + esc(L.annual) + '"></div>' +
    '<div class="fld"><label>سنة المباشرة</label><label class="setrow mini"><span><b>بالتناسب مع أشهر العمل</b><small>من باشر في يوليو يستحق نصف الرصيد</small></span><button type="button" class="sw" role="switch" aria-checked="' + !!L.prorate + '" data-set="leave.prorate"></button></label></div>' +
    '<div class="fld wide"><label>الأنواع التي تُخصم من الرصيد</label><div class="chipsel">' + LKINDS.map(function (k) { return '<button type="button" data-lk="' + k + '" aria-pressed="' + (L.kinds.indexOf(k) > -1) + '">' + k + '</button>'; }).join('') + '</div></div></div></div>');
  var work = pn('teal', 'clock', 'أوقات الدوام', 'يُحسب منها التأخير والخروج المبكر والغياب في الحضور', '', '<div class="pb"><div class="form">' +
    '<div class="fld"><label for="stStart">بداية الدوام</label><input id="stStart" type="time" value="' + esc(Wk.start) + '"></div><div class="fld"><label for="stEnd">نهاية الدوام</label><input id="stEnd" type="time" value="' + esc(Wk.end) + '"></div>' +
    '<div class="fld"><label for="stGrace">سماحية التأخير (دقيقة)</label><input id="stGrace" type="number" min="0" max="120" value="' + esc(Wk.grace) + '"></div>' +
    '<div class="fld wide"><label>أيام الإجازة الأسبوعية</label><div class="chipsel">' + WD.map(function (d, i) { return '<button type="button" data-wd="' + i + '" aria-pressed="' + (Wk.weekend.indexOf(i) > -1) + '">' + d + '</button>'; }).join('') + '</div></div></div></div>');
  var links = '<div class="setlinks"><a class="setlink" href="#accounts">' + tile('amethyst', 'key') + '<span><b>الصلاحيات لكل موظف</b><small>من يرى الرواتب، ومن يعتمد، ومن يستورد الحضور، ومن ينشر التعاميم</small></span>' + ic('back') + '</a>' +
    '<a class="setlink" href="#forms">' + tile('gold', 'stamp') + '<span><b>مسؤولو اعتماد النماذج</b><small>من يعتمد كل نموذج وترتيب الخطوات</small></span>' + ic('back') + '</a></div>';
  return links + '<div class="grid g2">' + groups[0] + groups[1] + '</div><div class="grid g2">' + leave + work + '</div>' + groups[2] +
    '<div class="setbar' + (dirty ? ' on' : '') + '" role="region" aria-label="حفظ الإعدادات"><span>' + (dirty ? ic('alert') + 'لديك تغييرات لم تُحفظ' : ic('check') + 'الإعدادات محفوظة') + '</span><button class="btn" id="stReset"' + (dirty ? '' : ' disabled') + '>تراجع</button><button class="btn goldb" id="stSave"' + (dirty ? '' : ' disabled') + '>' + ic('check') + 'حفظ الإعدادات</button></div>';
}
function bindSet() {
  if (!document.getElementById('stSave')) return;
  var redraw = function () { softRender(); };
  document.querySelectorAll('[data-set]').forEach(function (b) { b.onclick = function (e) { e.preventDefault(); var p = b.dataset.set.split('.'); SD[p[0]][p[1]] = b.getAttribute('aria-checked') !== 'true'; redraw(); }; });
  document.querySelectorAll('[data-lk]').forEach(function (b) { b.onclick = function () { var k = b.dataset.lk, a = SD.leave.kinds, i = a.indexOf(k); if (i > -1) { if (a.length > 1) a.splice(i, 1); } else a.push(k); redraw(); }; });
  document.querySelectorAll('[data-wd]').forEach(function (b) { b.onclick = function () { var d = +b.dataset.wd, a = SD.work.weekend, i = a.indexOf(d); if (i > -1) a.splice(i, 1); else a.push(d); a.sort(); redraw(); }; });
  [['stAnnual', 'leave', 'annual', 'n'], ['stStart', 'work', 'start'], ['stEnd', 'work', 'end'], ['stGrace', 'work', 'grace', 'n']].forEach(function (x) { var el = document.getElementById(x[0]); if (el) el.onchange = function () { SD[x[1]][x[2]] = x[3] ? +el.value : el.value; redraw(); }; });
  document.getElementById('stReset').onclick = function () { SD = null; render(); };
  document.getElementById('stSave').onclick = function () {
    var b = this; b.disabled = true;
    api({ action: 'siteSave', site: SD }).then(function (j) { SITE = j.site; SD = null; delete CACHE.lbal; toast('حُفظت إعدادات المنصة'); render(); }, function (e) { b.disabled = false; toast(errText(e)); });
  };
}

/* ======================= الحضور والانصراف ======================= */
var AT = { month: '', q: '', ent: '', sort: 'absent', all: false }, AI = null;
function ymNow() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2); }
function ymName(ym) { var p = ym.split('-'); return fd(new Date(+p[0], +p[1] - 1, 1), { month: 'long', year: 'numeric' }); }
function attData(ym) { return need('att:' + ym, function () { return api({ action: 'attMonth', month: ym }); }, 60000); }
function minsTxt(m) { m = Math.round(m || 0); return m >= 60 ? Math.floor(m / 60) + ' س' + (m % 60 ? ' و' + (m % 60) + ' د' : '') : m + ' د'; }
VIEWS.att = function () {
  var T = [['month', 'السجل الشهري', null, 'calendar']].concat(can('attm') ? [['imp', 'استيراد ملف البصمة', null, 'dl']] : []);
  if (!T.some(function (x) { return x[0] === TAB.att; })) TAB.att = 'month';
  return ptitle('الحضور والانصراف', 'من ملفات جهاز البصمة: الحضور والتأخير والخروج المبكر والغياب لكل منسوب، مع احتساب الإجازات وأوامر الإركاب المعتمدة.', can('attm') && TAB.att === 'month' ? '<a class="btn goldb" href="#att-imp">' + ic('dl') + 'استيراد ملف البصمة</a>' : '') +
    vtabs('att', T) + (TAB.att === 'imp' ? attImpHTML() : attMonthHTML());
};
function attMonthHTML() {
  var ym = AT.month || ymNow(), c = attData(ym), d = c.data;
  if (!d) return '<section class="pn"><div class="pb"><div class="empty">' + (c.err ? esc(c.err) : 'جارٍ التحميل…') + '</div></div></section>';
  var months = d.months.slice(); if (months.indexOf(ym) < 0) months.unshift(ym); if (months.indexOf(ymNow()) < 0) months.unshift(ymNow());
  var q = AT.q.trim().toLowerCase();
  var list = STAFF.filter(function (s) { return (!AT.ent || s.ent.v === AT.ent) && (!q || (s.name + ' ' + s.ref + ' ' + s.latin).toLowerCase().indexOf(q) > -1); }).map(function (s) { return { s: s, a: d.rows[s.ref] || null }; });
  var withData = list.filter(function (x) { return x.a; });
  var sortF = { absent: function (a, b) { return (b.a ? b.a.absent : -1) - (a.a ? a.a.absent : -1); }, late: function (a, b) { return (b.a ? b.a.lateMin : -1) - (a.a ? a.a.lateMin : -1); }, name: function (a, b) { return a.s.name.localeCompare(b.s.name, 'ar'); }, hours: function (a, b) { return (b.a ? b.a.hours : -1) - (a.a ? a.a.hours : -1); } };
  list.sort(sortF[AT.sort] || sortF.absent);
  var tot = withData.reduce(function (o, x) { o.p += x.a.present; o.l += x.a.late; o.ab += x.a.absent; o.h += x.a.hours; return o; }, { p: 0, l: 0, ab: 0, h: 0 });
  var rate = withData.length && d.workDays ? Math.round(tot.p / (withData.length * d.workDays) * 100) : 0;
  var kp = '<div class="grid g4">' + kpi('sapphire', 'calendar', d.workDays, 'يوم', 'أيام العمل حتى اليوم', ymName(ym) + ' · الإجازة الأسبوعية: ' + d.work.weekend.map(function (i) { return WD[i]; }).join(' و'), '') +
    kpi('emerald', 'userok', rate, '٪', 'نسبة الحضور', withData.length + ' منسوبًا لهم سجلات', '', '<div class="bar"><i style="width:' + rate + '%;background:var(--j-emerald)"></i></div>') +
    kpi('gold', 'clock', tot.l, 'مرة', 'تأخير', 'بعد ' + d.work.start + ' بأكثر من ' + d.work.grace + ' دقيقة', '') + kpi('garnet', 'alert', tot.ab, 'يوم', 'غياب بلا عذر', 'أيام عمل بلا بصمة ولا إجازة معتمدة', '') + '</div>';
  if (!d.months.length && !withData.length) return kp + '<section class="pn"><div class="pb"><div class="emptyx">' + tile('teal', 'finger') + '<b>لا سجلات حضور بعد</b><p>صدّر ملف الحضور من موقع جهاز البصمة (Excel أو CSV) وارفعه هنا، وتُطابق المنصة الموظفين تلقائيًا بالرقم الوظيفي أو الاسم.</p>' + (can('attm') ? '<a class="btn goldb" href="#att-imp">' + ic('dl') + 'استيراد أول ملف</a>' : '') + '</div></div></section>';
  var bar = '<section class="pn tbar"><div class="fbar">' + fsearch('atq', AT.q, 'ابحث باسم المنسوب أو رقمه', 'بحث في الحضور') +
    ssel('atm', months.map(function (m) { return { v: m, n: ymName(m), ic: 'calendar' }; }), ym, ymName(ym), function (v) { AT.month = v; render(); }, 'الشهر', 'الشهر') +
    ssel('ate', entOpts(true, true), AT.ent, 'الكل', function (v) { AT.ent = v; render(); }, 'الجهة', 'الجهة') +
    ssel('ats', [{ v: 'absent', n: 'الأكثر غيابًا', ic: 'alert' }, { v: 'late', n: 'الأكثر تأخيرًا', ic: 'clock' }, { v: 'hours', n: 'الأكثر ساعات', ic: 'chart' }, { v: 'name', n: 'الاسم', ic: 'user' }], AT.sort, 'الأكثر غيابًا', function (v) { AT.sort = v; render(); }, 'الترتيب', 'الترتيب') + '</div></section>';
  var noRec = list.filter(function (x) { return !x.a; }).length; if (!AT.all) list = list.filter(function (x) { return x.a; });
  var rows = list.map(function (x) { var a = x.a, s = x.s, pr = a && d.workDays ? Math.round(a.present / d.workDays * 100) : 0;
    return '<tr class="click" data-attref="' + esc(s.ref) + '"><td><div class="person">' + avP(s) + '<div><b>' + esc(s.name) + '</b><span>' + esc(s.ent.n) + '</span></div></div></td>' +
      (a ? '<td><div class="abar"><i style="width:' + Math.min(100, pr) + '%"></i></div><small class="tn">' + a.present + ' من ' + d.workDays + '</small></td><td class="num">' + (a.late ? '<b class="tw">' + a.late + '</b> <small>' + minsTxt(a.lateMin) + '</small>' : '—') + '</td><td class="num">' + (a.early || '—') + '</td><td class="num">' + (a.absent ? '<span class="pill bad"><i></i>' + a.absent + '</span>' : '<span class="pill ok"><i></i>0</span>') + '</td><td class="num">' + (a.leaveDays || '—') + '</td><td class="num">' + (a.excused || a.otHours ? (a.excused ? '<span class="pill ok" title="تأخير أو خروج مبكر مبرّر باستئذان معتمد"><i></i>' + a.excused + ' مبرّر</span>' : '') + (a.otHours ? ' <span class="pill info" title="عمل إضافي معتمد"><i></i>+' + a.otHours + ' س</span>' : '') : '—') + '</td><td class="num">' + a.hours + '</td>'
        : '<td colspan="7"><span class="mu">لا سجلات في هذا الشهر</span></td>') + '</tr>'; }).join('');
  return kp + bar + pn('teal', 'finger', 'سجل ' + ymName(ym), list.length + ' منسوبًا · اضغط منسوبًا لعرض أيامه', (noRec ? '<button class="btn sm" id="atAll">' + (AT.all ? 'إخفاء من لا سجلات لهم' : 'إظهار من لا سجلات لهم (' + noRec + ')') + '</button>' : '') + '<button class="btn sm" data-repgo="att">' + ic('excel') + 'تقرير قابل للتصدير</button>',
    '<div class="tw"><table class="atab"><thead><tr><th>المنسوب</th><th>الحضور</th><th class="num">التأخير</th><th class="num">خروج مبكر</th><th class="num">الغياب</th><th class="num">إجازة/مهمة</th><th class="num">استئذان وإضافي</th><th class="num">الساعات</th></tr></thead><tbody>' + (rows || '<tr><td colspan="8" class="empty">لا أحد في هذه التصفية.</td></tr>') + '</tbody></table></div>');
}
/* أيام منسوب في الشهر: تقويم ملوّن */
function attCal(d, ym) {
  var p = ym.split('-'), y = +p[0], m = +p[1] - 1, first = new Date(y, m, 1), n = new Date(y, m + 1, 0).getDate(), today = new Date(); today.setHours(0, 0, 0, 0);
  var by = {}; (d.days || []).forEach(function (x) { by[x.day] = x; }); var lv = d.leave || {}, abs = {}; (d.absentDays || []).forEach(function (x) { abs[x] = 1; });
  var cells = ''; for (var i = 0; i < first.getDay(); i++) cells += '<span class="cd pad"></span>';
  for (var k = 1; k <= n; k++) {
    var ds = y + '-' + ('0' + (m + 1)).slice(-2) + '-' + ('0' + k).slice(-2), dt = new Date(y, m, k), x = by[ds], cls = '', sub = '';
    var pm = d.permDays && d.permDays[ds];
    if (x) { cls = x.late && !pm ? 'late' : 'ok'; sub = (x.in || '—') + (x.out ? '–' + x.out : ''); if (pm) cls += ' pm'; }
    else if (lv[ds]) { cls = 'lv'; sub = lv[ds] === 'travel' ? 'مهمة' : 'إجازة'; }
    else if (abs[ds]) { cls = 'ab'; sub = 'غياب'; }
    else if (dt > today) cls = 'fut'; else cls = 'off';
    cells += '<span class="cd ' + cls + '" title="' + esc(fd(dt, { weekday: 'long', day: 'numeric', month: 'long' }) + (x && x.late ? ' · تأخير ' + minsTxt(x.late) : '') + (pm ? ' · استئذان معتمد: ' + pm.join('، ') : '')) + '"><b>' + k + '</b><small class="ltr">' + esc(sub) + '</small></span>';
  }
  return '<div class="acal"><div class="acal-h">' + WD.map(function (w) { return '<span>' + w.replace('ال', '') + '</span>'; }).join('') + '</div><div class="acal-g">' + cells + '</div>' +
    '<div class="acal-k"><span class="ok">حضور</span><span class="ok pm">باستئذان</span><span class="late">تأخير</span><span class="lv">إجازة/مهمة</span><span class="ab">غياب</span><span class="off">عطلة</span></div></div>';
}
function attOpen(ref) {
  var s = byRef(ref); if (!s) return; var ym = AT.month || ymNow();
  var el = document.createElement('div'); el.id = 'attLayer';
  el.innerHTML = '<div class="mscrim" data-atclose="1"></div><section class="mdl attm" role="dialog" aria-modal="true" aria-labelledby="atT"><header class="mh">' + avP(s) + '<div><h2 id="atT">' + esc(s.name) + '</h2><p>' + ymName(ym) + ' · ' + esc(s.ent.n) + '</p></div><button class="ib mx" data-atclose="1" aria-label="إغلاق">' + ic('plus') + '</button></header><div class="abody"><div class="empty">جارٍ التحميل…</div></div></section>';
  document.body.appendChild(el);
  el.querySelectorAll('[data-atclose]').forEach(function (b) { b.onclick = function () { el.remove(); }; });
  api({ action: 'attMonth', month: ym, ref: ref }).then(function (j) {
    var a = j.rows[ref] || { present: 0, late: 0, lateMin: 0, absent: 0, hours: 0, days: [], absentDays: [], leave: {} };
    el.querySelector('.abody').innerHTML = '<div class="amini">' + [['حضور', a.present + ' من ' + j.workDays], ['تأخير', a.late ? a.late + ' (' + minsTxt(a.lateMin) + ')' : '0'], ['غياب', a.absent], ['ساعات', a.hours]].map(function (x) { return '<div><small>' + x[0] + '</small><b>' + x[1] + '</b></div>'; }).join('') + '</div>' + attCal(a, ym) +
      (a.days.length ? '<div class="tw"><table><thead><tr><th>اليوم</th><th>الدخول</th><th>الخروج</th><th class="num">التأخير</th><th class="num">الساعات</th></tr></thead><tbody>' + a.days.map(function (x) { return '<tr><td>' + fd(pdate(x.day), { weekday: 'short', day: 'numeric', month: 'short' }) + '</td><td class="ltr">' + (x.in || '—') + '</td><td class="ltr">' + (x.out || '—') + '</td><td class="num">' + (x.late ? minsTxt(x.late) : '—') + '</td><td class="num">' + (x.mins ? (x.mins / 60).toFixed(1) : '—') + '</td></tr>'; }).join('') + '</tbody></table></div>' : '');
  }, function (e) { el.querySelector('.abody').innerHTML = '<div class="empty">' + esc(errText(e)) + '</div>'; });
}
/* ---------- الاستيراد: رفع ← مطابقة الأعمدة ← معاينة وربط غير المطابقين ← استيراد ---------- */
var AF = [['id', 'رقم الموظف في الجهاز', 'AC-No أو User ID أو الرقم الوظيفي'], ['name', 'اسم الموظف', 'يُستعمل للمطابقة إن لم يوجد رقم'], ['dt', 'التاريخ والوقت معًا', 'إن كان كل صف بصمة واحدة'], ['date', 'التاريخ', 'إن كان التاريخ في عمود منفصل'], ['time', 'وقت البصمة', 'مع عمود التاريخ'], ['in', 'وقت الدخول', 'إن كان للدخول عمود'], ['out', 'وقت الخروج', 'إن كان للخروج عمود']];
function attImpHTML() {
  var batches = (attData(AT.month || ymNow()).data || {}).batches || [];
  var hist = batches.length ? pn('slate', 'history', 'آخر الملفات المستوردة', '', '', '<ul class="lst">' + batches.map(function (b) { return '<li>' + tile('teal', 'file') + '<div><b>' + esc(b.file_name) + '</b><span class="s">' + b.records + ' يوم عمل · ' + b.staff + ' منسوبًا · ' + (b.from_day || '') + ' إلى ' + (b.to_day || '') + ' · ' + esc(b.created_by) + ' · ' + agoD(pdt(b.created_at)) + (+b.unmatched ? ' · <b class="tw">' + b.unmatched + ' غير مطابق</b>' : '') + '</span></div><button class="btn sm" data-attundo="' + esc(b.id) + '">تراجع</button></li>'; }).join('') + '</ul>') : '';
  if (!AI) return '<section class="pn"><div class="pb"><label class="dropz" id="attDrop">' + tile('teal', 'dl') + '<b>اسحب ملف الحضور هنا أو اضغط للاختيار</b><small>Excel (xlsx) أو CSV كما يصدّره موقع جهاز البصمة · حتى ١٢ ميغابايت</small><input type="file" id="attFile" accept=".csv,.xlsx,.txt,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" hidden></label>' +
    '<ol class="howto"><li><b>صدّر التقرير</b> من موقع البصمة لفترة معينة (شهر مثلًا).</li><li><b>ارفعه هنا</b> وحدد ماذا يعني كل عمود (تقترحه المنصة تلقائيًا).</li><li><b>عاين النتيجة</b> واربط من لم تتعرف عليه المنصة مرة واحدة، فتتذكره في المرات القادمة.</li><li><b>استورد</b>، ويمكنك التراجع عن أي ملف لاحقًا.</li></ol></div></section>' + hist;
  var opts = [{ v: '-1', n: 'لا يوجد', ic: 'x' }].concat(AI.head.map(function (h, i) { return { v: String(i), n: h || 'العمود ' + (i + 1), d: AI.sample.map(function (r) { return r[i]; }).filter(Boolean).slice(0, 2).join(' · ') }; }));
  var map = '<div class="amap">' + AF.map(function (f) { return '<div class="fld"><label>' + f[1] + '</label>' + ssel('am_' + f[0], opts, String(AI.map[f[0]]), 'لا يوجد', function (v) { AI.map[f[0]] = +v; AI.pre = null; render(); }, f[1]) + '<small class="hint">' + f[2] + '</small></div>'; }).join('') + '</div>';
  var sample = '<div class="tw"><table class="mini"><thead><tr>' + AI.head.map(function (h, i) { var used = Object.keys(AI.map).filter(function (k) { return AI.map[k] === i; })[0]; return '<th' + (used ? ' class="used"' : '') + '>' + esc(h || '—') + (used ? '<small>' + AF.filter(function (f) { return f[0] === used; })[0][1] + '</small>' : '') + '</th>'; }).join('') + '</tr></thead><tbody>' + AI.sample.map(function (r) { return '<tr>' + AI.head.map(function (h, i) { return '<td>' + esc(r[i] || '') + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
  var pre = AI.pre ? '<div class="apre"><div class="amini">' + [['أيام عمل', AI.pre.records], ['منسوبون', AI.pre.staff], ['الفترة', (AI.pre.from || '—') + ' ← ' + (AI.pre.to || '—')], ['غير مطابق', AI.pre.unmatched.length]].map(function (x) { return '<div><small>' + x[0] + '</small><b>' + x[1] + '</b></div>'; }).join('') + '</div>' +
    (AI.pre.badDates ? '<div class="note">' + ic('alert') + '<span>' + AI.pre.badDates + ' صفًا بلا تاريخ مفهوم وسيُتجاهل. تأكد من اختيار عمود التاريخ الصحيح.</span></div>' : '') +
    (AI.pre.unmatched.length ? '<h3 class="h3s">اربط من لم تتعرف عليه المنصة</h3><div class="ulink">' + AI.pre.unmatched.map(function (u) { return '<div class="ul"><span><b>' + esc(u.name || '—') + '</b><small class="ltr">' + esc(u.id || '') + ' · ' + u.n + ' بصمة</small></span>' + ssel('ul_' + u.key.replace(/[^\w]/g, '_'), [{ v: '', n: 'تجاهل', ic: 'x' }].concat(STAFF.map(function (s) { return { v: s.ref, n: s.name, d: s.ref + ' · ' + s.ent.n, c: s.ent.c }; })), AI.link[u.key] || '', 'اختر المنسوب', (function (k) { return function (v) { AI.link[k] = v; render(); }; })(u.key), 'ربط ' + (u.name || u.id)) + '</div>'; }).join('') + '</div><p class="hint">يُحفظ الربط فتتعرف المنصة على هذا الشخص تلقائيًا في الملفات القادمة.</p>' : '<div class="note">' + ic('check') + '<span>تعرفت المنصة على كل الموظفين في الملف.</span></div>') + '</div>' : '';
  return pn('teal', 'file', esc(AI.name), AI.total + ' صفًا في الملف', '<button class="btn sm" id="attCancel">' + ic('x') + 'ملف آخر</button>', '<div class="pb"><h3 class="h3s">ماذا يعني كل عمود؟</h3>' + map + '<h3 class="h3s">أول صفوف الملف</h3>' + sample + pre +
    '<div class="lerr" role="alert">' + esc(AI.err || '') + '</div><div class="abtns"><button class="btn" id="attPre"' + (AI.busy ? ' disabled' : '') + '>' + ic('eye') + 'معاينة المطابقة</button><button class="btn goldb" id="attGo"' + (AI.busy || !AI.pre ? ' disabled' : '') + '>' + ic('check') + (AI.busy ? 'جارٍ…' : 'استيراد ' + (AI.pre ? AI.pre.records + ' يوم عمل' : '')) + '</button></div></div>') + hist;
}
function bindAtt() {
  document.querySelectorAll('[data-attref]').forEach(function (r) { r.onclick = function () { attOpen(r.dataset.attref); }; });
  var q = document.getElementById('atq'); if (q) q.oninput = function () { AT.q = q.value; softRender(); };
  var aa = document.getElementById('atAll'); if (aa) aa.onclick = function () { AT.all = !AT.all; render(); };
  document.querySelectorAll('[data-attundo]').forEach(function (b) { b.onclick = function () { if (b.dataset.sure !== '1') { b.dataset.sure = '1'; b.textContent = 'تأكيد التراجع؟'; return; } b.disabled = true; api({ action: 'attUndo', batch: b.dataset.attundo }).then(function (j) { Object.keys(CACHE).forEach(function (k) { if (/^att:/.test(k)) delete CACHE[k]; }); toast('حُذفت ' + j.removed + ' سجلات هذا الملف'); render(); }, function (e) { b.disabled = false; toast(errText(e)); }); }; });
  var f = document.getElementById('attFile'), dz = document.getElementById('attDrop');
  var take = function (file) {
    if (!file) return; if (file.size > 12 * 1024 * 1024) { toast('الملف أكبر من ١٢ ميغابايت'); return; }
    var rd = new FileReader(); dz.classList.add('busy');
    rd.onload = function () { var b64 = String(rd.result).split(',')[1] || '';
      api({ action: 'attUpload', name: file.name, b64: b64 }).then(function (j) { AI = { token: j.token, name: j.name, head: j.head, sample: j.sample, total: j.total, map: j.guess, link: {}, pre: null, err: '', busy: false }; render(); }, function (e) { dz.classList.remove('busy'); toast(errText(e)); }); };
    rd.readAsDataURL(file);
  };
  if (f) f.onchange = function () { take(f.files[0]); };
  if (dz) { dz.ondragover = function (e) { e.preventDefault(); dz.classList.add('over'); }; dz.ondragleave = function () { dz.classList.remove('over'); }; dz.ondrop = function (e) { e.preventDefault(); dz.classList.remove('over'); take(e.dataTransfer.files[0]); }; }
  var c = document.getElementById('attCancel'); if (c) c.onclick = function () { AI = null; render(); };
  var run = function (dry) { AI.busy = true; AI.err = ''; render();
    api({ action: 'attImport', token: AI.token, map: AI.map, link: AI.link, dry: dry }).then(function (j) {
      if (dry) { AI.busy = false; AI.pre = j; render(); return; }
      Object.keys(CACHE).forEach(function (k) { if (/^att:/.test(k)) delete CACHE[k]; });
      toast('استُورد ' + j.records + ' يوم عمل لـ ' + j.staff + ' منسوبًا'); AI = null; TAB.att = 'month'; if (j.to) AT.month = j.to.slice(0, 7); render();
    }, function (e) { AI.busy = false; AI.err = errText(e); render(); }); };
  var p = document.getElementById('attPre'); if (p) p.onclick = function () { run(true); };
  var g = document.getElementById('attGo'); if (g) g.onclick = function () { run(false); };
}
/* حضوري (المنسوب) */
var MYM = '';
VIEWS.myatt = function () {
  var ym = MYM || ymNow(), c = need('myatt:' + ym, function () { return api({ action: 'attMy', month: ym }); }, 60000), d = c.data;
  if (!d) return '<section class="pn"><div class="pb"><div class="empty">' + (c.err ? esc(c.err) : 'جارٍ التحميل…') + '</div></div></section>';
  if (d.hidden) return '<section class="pn"><div class="pb"><div class="empty">هذا القسم غير متاح حاليًا.</div></div></section>';
  var a = d.rows[ME.ref] || { present: 0, late: 0, lateMin: 0, absent: 0, hours: 0, days: [], absentDays: [], leave: {} };
  var p = ym.split('-'), prev = new Date(+p[0], +p[1] - 2, 1), next = new Date(+p[0], +p[1], 1), f = function (x) { return x.getFullYear() + '-' + ('0' + (x.getMonth() + 1)).slice(-2); };
  var nav = '<div class="mnav"><button class="btn sm" data-mym="' + f(prev) + '">' + ic('back') + 'الشهر السابق</button><b>' + ymName(ym) + '</b>' + (f(next) <= ymNow() ? '<button class="btn sm" data-mym="' + f(next) + '">الشهر التالي' + ic('back') + '</button>' : '<span></span>') + '</div>';
  return ptitle('حضوري', 'سجل بصمتك كما يصل الموارد البشرية من جهاز البصمة. الدوام من ' + d.work.start + ' إلى ' + d.work.end + '، وسماحية التأخير ' + d.work.grace + ' دقيقة.') + nav +
    '<div class="grid g4">' + kpi('emerald', 'userok', a.present, 'من ' + d.workDays, 'أيام الحضور', '', '') + kpi('gold', 'clock', a.late, 'مرة', 'التأخير', (a.lateMin ? 'مجموعه ' + minsTxt(a.lateMin) : 'لا تأخير') + (a.excused ? ' · ' + a.excused + ' مبرّر باستئذان' : ''), '') + kpi('garnet', 'alert', a.absent, 'يوم', 'غياب بلا عذر', 'إن كان لديك عذر قدّم طلب إجازة أو استئذان', '') + kpi('sapphire', 'chart', a.hours, 'ساعة', 'ساعات العمل', '', '') + '</div>' +
    pn('teal', 'calendar', 'أيام ' + ymName(ym), '', '', '<div class="pb">' + attCal(a, ym) + '</div>');
};

/* ======================= التعاميم والإعلانات ======================= */
var NK = { 'تعميم': ['sapphire', 'doc'], 'إعلان': ['gold', 'bell'], 'تهنئة': ['emerald', 'gift'], 'تنبيه': ['garnet', 'alert'] };
function newsData() { return need('news', function () { return api({ action: 'newsList', asStaff: role === 'staff' ? 1 : 0 }); }, 60000); }
function audLabel(a) { return a.map(function (x) { var k = x.slice(0, 2), v = x.slice(2); if (k === 'c:') return (CT_MAP[v] || { n: v }).n; return entOf(v).n; }).join('، '); }
function newsCard(n, admin, total) {
  var K = NK[n.kind] || NK['تعميم'], body = esc(n.body).replace(/\n/g, '<br>');
  return '<article class="ncard' + (n.pinned ? ' pin' : '') + (n.read || admin ? '' : ' unread') + (n.active ? '' : ' off') + '" data-nid="' + n.id + '"><header>' + tile(K[0], K[1]) + '<div><span class="nk">' + esc(n.kind) + (n.pinned ? ' · مثبّت' : '') + (!n.read && !admin ? ' · <b>جديد</b>' : '') + '</span><h3>' + esc(n.title) + '</h3><small>' + esc(n.by) + ' · ' + agoD(pdt(n.at)) + (n.expires ? ' · يظهر حتى ' + fdx(pdate(n.expires)) : '') + '</small></div></header>' +
    '<div class="nbody">' + body + '</div>' +
    (admin ? '<footer><span class="pill ' + (n.audience.length ? 'info' : 'mute') + '"><i></i>' + (n.audience.length ? esc(audLabel(n.audience)) : 'كل المنسوبين') + '</span><button class="lnk" data-nreaders="' + n.id + '">' + ic('eye') + ' قرأه ' + n.reads + (total ? ' من ' + total : '') + '</button><span class="sp"></span><button class="btn sm" data-nedit="' + n.id + '">' + ic('edit') + 'تعديل</button><button class="btn sm" data-ndel="' + n.id + '">حذف</button></footer>' : '') + '</article>';
}
VIEWS.news = function () {
  var c = newsData(), d = c.data;
  if (!d) return ptitle('التعاميم والإعلانات', '') + '<section class="pn"><div class="pb"><div class="empty">' + (c.err ? esc(c.err) : 'جارٍ التحميل…') + '</div></div></section>';
  var admin = d.canEdit, rows = d.rows || [];
  return ptitle('التعاميم والإعلانات', 'تعاميم الموارد البشرية تصل المنسوبين في صفحاتهم، ويمكن توجيهها لجهة أو دولة، ومتابعة من قرأها.', admin ? '<button class="btn goldb" data-nnew="1">' + ic('plus') + 'تعميم جديد</button>' : '') +
    (rows.length ? '<div class="nlist">' + rows.map(function (n) { return newsCard(n, admin, d.staffTotal); }).join('') + '</div>' : '<section class="pn"><div class="pb"><div class="emptyx">' + tile('gold', 'bell') + '<b>لا تعاميم بعد</b><p>انشر أول تعميم: تذكير بموعد، أو سياسة جديدة، أو تهنئة. يظهر للمنسوبين فور نشره.</p>' + (admin ? '<button class="btn goldb" data-nnew="1">' + ic('plus') + 'تعميم جديد</button>' : '') + '</div></div></section>');
};
VIEWS.mynews = function () {
  var c = newsData(), d = c.data;
  if (!d) return '<section class="pn"><div class="pb"><div class="empty">' + (c.err ? esc(c.err) : 'جارٍ التحميل…') + '</div></div></section>';
  var rows = d.rows || [];
  return ptitle('التعاميم', 'ما تنشره الموارد البشرية لك. الجديد يظهر مميزًا حتى تقرأه.') + (rows.length ? '<div class="nlist">' + rows.map(function (n) { return newsCard(n, false); }).join('') + '</div>' : '<section class="pn"><div class="pb"><div class="empty">لا تعاميم حاليًا.</div></div></section>');
};
var NE = null;
function newsEdit(n) {
  NE = n ? { id: n.id, title: n.title, body: n.body, kind: n.kind, pinned: n.pinned, audience: n.audience.slice(), expires: n.expires, active: n.active } : { id: 0, title: '', body: '', kind: 'تعميم', pinned: false, audience: [], expires: '', active: true };
  drawNE();
}
function drawNE() {
  var old = document.getElementById('neLayer'); if (old) old.remove();
  var raws = {}; STAFF.forEach(function (s) { var r = String(s.r.entity || '').trim(); if (r) raws[r] = s.ent; });
  var aud = Object.keys(raws).map(function (r) { return ['e:' + r, raws[r].n, raws[r].c]; }).concat(CTRY.map(function (c) { return ['c:' + c.cc, c.n, '']; }));
  var el = document.createElement('div'); el.id = 'neLayer';
  el.innerHTML = '<div class="mscrim" data-neclose="1"></div><section class="mdl nem" role="dialog" aria-modal="true" aria-labelledby="neT"><header class="mh">' + tile('gold', 'bell') + '<div><h2 id="neT">' + (NE.id ? 'تعديل التعميم' : 'تعميم جديد') + '</h2><p>يظهر للمنسوبين في صفحاتهم فور الحفظ</p></div><button class="ib mx" data-neclose="1" aria-label="إغلاق">' + ic('plus') + '</button></header><div class="abody">' +
    '<div class="fld"><label>النوع</label><div class="seg2" role="group">' + Object.keys(NK).map(function (k) { return '<button type="button" data-nk="' + k + '" aria-pressed="' + (NE.kind === k) + '">' + k + '</button>'; }).join('') + '</div></div>' +
    '<div class="fld"><label for="neTitle">العنوان</label><input id="neTitle" maxlength="160" value="' + esc(NE.title) + '" placeholder="مثال: مواعيد الدوام في شهر رمضان"></div>' +
    '<div class="fld"><label for="neBody">النص</label><textarea id="neBody" rows="7" maxlength="6000" placeholder="اكتب التعميم كما تريده أن يصل">' + esc(NE.body) + '</textarea></div>' +
    '<div class="fld"><label>يصل إلى</label><div class="chipsel"><button type="button" data-na="" aria-pressed="' + !NE.audience.length + '">كل المنسوبين</button>' + aud.map(function (a) { return '<button type="button" data-na="' + esc(a[0]) + '" aria-pressed="' + (NE.audience.indexOf(a[0]) > -1) + '">' + (a[2] ? '<i class="dot" style="background:' + a[2] + '"></i>' : ic('globe')) + esc(a[1]) + '</button>'; }).join('') + '</div><small class="hint">اختر جهة أو دولة أو أكثر، أو اتركه لكل المنسوبين.</small></div>' +
    '<div class="form"><div class="fld"><label for="neExp">يختفي بعد تاريخ (اختياري)</label><input id="neExp" type="date" value="' + esc(NE.expires) + '"></div><div class="fld"><label>&nbsp;</label><label class="setrow mini"><span><b>تثبيت أعلى القائمة</b></span><button type="button" class="sw" role="switch" id="nePin" aria-checked="' + NE.pinned + '"></button></label></div></div>' +
    '</div><footer class="mf"><div class="lerr" role="alert"></div><button class="btn" data-neclose="1">إلغاء</button><button class="btn goldb" id="neSave">' + ic('send') + (NE.id ? 'حفظ التعديل' : 'نشر') + '</button></footer></section>';
  document.body.appendChild(el);
  var sync = function () { NE.title = el.querySelector('#neTitle').value; NE.body = el.querySelector('#neBody').value; NE.expires = el.querySelector('#neExp').value; };
  el.querySelectorAll('[data-neclose]').forEach(function (b) { b.onclick = function () { el.remove(); }; });
  el.querySelectorAll('[data-nk]').forEach(function (b) { b.onclick = function () { sync(); NE.kind = b.dataset.nk; drawNE(); }; });
  el.querySelectorAll('[data-na]').forEach(function (b) { b.onclick = function () { sync(); var v = b.dataset.na; if (!v) NE.audience = []; else { var i = NE.audience.indexOf(v); if (i > -1) NE.audience.splice(i, 1); else NE.audience.push(v); } drawNE(); }; });
  el.querySelector('#nePin').onclick = function () { sync(); NE.pinned = !NE.pinned; drawNE(); };
  el.querySelector('#neSave').onclick = function () { sync(); var b = this; b.disabled = true;
    api({ action: 'newsSave', id: NE.id, title: NE.title, body: NE.body, kind: NE.kind, pinned: NE.pinned, audience: NE.audience, expires: NE.expires, active: NE.active }).then(function (j) { seed('news', j); el.remove(); toast(NE.id ? 'حُفظ التعميم' : 'نُشر التعميم'); render(); }, function (e) { b.disabled = false; el.querySelector('.lerr').textContent = errText(e); }); };
  setTimeout(function () { var t = el.querySelector('#neTitle'); if (t && !NE.title) t.focus(); }, 30);
}
function bindNews() {
  var d = CACHE.news && CACHE.news.data;
  document.querySelectorAll('[data-nnew]').forEach(function (b) { b.onclick = function () { newsEdit(null); }; });
  document.querySelectorAll('[data-nedit]').forEach(function (b) { b.onclick = function () { newsEdit(d.rows.filter(function (n) { return n.id === +b.dataset.nedit; })[0]); }; });
  document.querySelectorAll('[data-ndel]').forEach(function (b) { b.onclick = function () { if (b.dataset.sure !== '1') { b.dataset.sure = '1'; b.textContent = 'تأكيد الحذف؟'; return; } api({ action: 'newsDelete', id: +b.dataset.ndel }).then(function (j) { seed('news', j); toast('حُذف التعميم'); render(); }, function (e) { toast(errText(e)); }); }; });
  document.querySelectorAll('[data-nreaders]').forEach(function (b) { b.onclick = function () { api({ action: 'newsReaders', id: +b.dataset.nreaders }).then(function (j) { var box = b.closest('.ncard'), old = box.querySelector('.nread'); if (old) { old.remove(); return; } var x = document.createElement('div'); x.className = 'nread'; x.innerHTML = j.rows.length ? j.rows.map(function (r) { return '<span>' + esc(r.name) + '<small>' + agoD(pdt(r.at)) + '</small></span>'; }).join('') : '<span>لم يقرأه أحد بعد</span>'; box.appendChild(x); }); }; });
  /* المنسوب: يُسجَّل التعميم مقروءًا عند ظهوره في صفحته */
  if (role === 'staff' && view === 'mynews' && d && d.rows) d.rows.filter(function (n) { return !n.read; }).forEach(function (n) { n.read = true; api({ action: 'newsRead', id: n.id }).catch(function () { }); });
}

/* ======================= الهيكل التنظيمي ======================= */
var ORG = { ent: '', q: '' };
function orgHTML() {
  var q = ORG.q.trim().toLowerCase();
  var ents = ENT.filter(function (e) { return !ORG.ent || e.v === ORG.ent; }).map(function (e) {
    var ss = STAFF.filter(function (s) { return s.ent.v === e.v && (!q || (s.name + ' ' + s.job + ' ' + (s.r.department || '')).toLowerCase().indexOf(q) > -1); });
    var deps = {}; ss.forEach(function (s) { var k = String(s.r.department || '').trim() || 'بدون إدارة محددة'; (deps[k] = deps[k] || []).push(s); });
    var names = Object.keys(deps).sort(function (a, b) { return a === 'بدون إدارة محددة' ? 1 : b === 'بدون إدارة محددة' ? -1 : deps[b].length - deps[a].length; });
    if (!ss.length) return '';
    var cs = {}; ss.forEach(function (s) { cs[s.c.n] = (cs[s.c.n] || 0) + 1; });
    return '<section class="oent" style="--ec:' + e.c + '"><header><div class="olg">' + (elogo(e) || tile('slate', 'building')) + '</div><div><h3>' + esc(e.full || e.n) + '</h3><small>' + nq(ss.length, 'منسوب واحد', 'منسوبان', 'منسوبين', 'منسوبًا') + ' · ' + nq(names.length, 'إدارة واحدة', 'إدارتان', 'إدارات', 'إدارة') + ' · ' + Object.keys(cs).map(function (k) { return k + ' ' + cs[k]; }).join('، ') + '</small></div></header>' +
      '<div class="odeps">' + names.map(function (dn2) { var L = deps[dn2], mgr = {}; L.forEach(function (s) { var m = String(s.r.manager || '').trim(); if (m) mgr[m] = (mgr[m] || 0) + 1; }); var top = Object.keys(mgr).sort(function (a, b) { return mgr[b] - mgr[a]; })[0];
        return '<div class="odep"><h4>' + esc(dn2) + '<em>' + L.length + '</em></h4>' + (top ? '<p class="omgr">' + ic('user') + 'المدير المباشر: <b>' + esc(top) + '</b></p>' : '') + '<ul>' + L.map(function (s) { return '<li data-open="' + esc(s.ref) + '">' + avP(s) + '<span><b>' + esc(s.name) + '</b><small>' + esc(s.job) + '</small></span></li>'; }).join('') + '</ul></div>'; }).join('') + '</div></section>';
  }).join('');
  return '<section class="pn tbar"><div class="fbar">' + fsearch('orgq', ORG.q, 'ابحث باسم أو مسمى أو إدارة', 'بحث في الهيكل') + ssel('orge', entOpts(true, true), ORG.ent, 'الكل', function (v) { ORG.ent = v; render(); }, 'الجهة', 'الجهة') + '</div></section>' +
    '<div class="note">' + ic('info') + '<span>يُبنى الهيكل تلقائيًا من حقلي «الإدارة» و«المدير المباشر» في ملفات المنسوبين. لتحسينه أكمل هذين الحقلين من تعديل الملف.</span></div>' + (ents || '<section class="pn"><div class="pb"><div class="empty">لا نتائج.</div></div></section>');
}
VIEWS.people = function () {
  var t = TAB.people, nC = CTRY.length, nE = ENT.length, nd = 0;
  STAFF.forEach(function (s) { nd += s.docs.length; });
  if (t === 'org' && !mod('org')) t = TAB.people = 'dir';
  var acts = t === 'dir' ? (can('export') ? '<button class="btn" data-act="excel">' + ic('excel') + 'تصدير Excel</button>' : '') + (can('edit') ? '<button class="btn goldb" data-act="regLink">' + ic('plus') + 'نسخ رابط التسجيل</button>' : '')
    : t === 'docs' ? (can('mail') ? '<button class="btn goldb" data-act="remindAll">' + ic('send') + 'تذكير أصحاب الوثائق المنتهية</button>' : '') : '';
  return ptitle('المنسوبون', CNT.tot + ' منسوبًا في ' + nq(nC, 'دولة واحدة', 'دولتين', 'دول', 'دولة') + ' و' + nq(nE, 'جهة واحدة', 'جهتين', 'جهات', 'جهة') + '. الملفات والبطاقات والوثائق في مكان واحد.', acts) +
    vtabs('people', [['dir', 'الدليل', CNT.tot, 'users'], ['docs', 'الوثائق', CNT.exp ? CNT.exp + ' منتهية' : nd, 'pass', CNT.exp]].concat(mod('org') ? [['org', 'الهيكل التنظيمي', nE, 'building']] : [])) +
    (t === 'dir' ? sub(VIEWS.dir) : t === 'org' ? orgHTML() : sub(VIEWS.documents));
};

/* ======================= أرصدة الإجازات ======================= */
function lbal(ref) { if (role === 'staff') return MY_BAL; var c = need('lbal', function () { return api({ action: 'leaveBalances' }); }, 120000); return c.data && c.data.rows ? c.data.rows[ref] || null : null; }
function balHTML(b, compact) {
  if (!b) return '';
  var pc = b.entitled ? Math.min(100, Math.round(b.used / b.entitled * 100)) : 0, pp = b.entitled ? Math.min(100 - pc, Math.round(b.pending / b.entitled * 100)) : 0;
  return '<div class="lbal' + (compact ? ' c' : '') + '"><div class="lb-t"><span>رصيد الإجازات ' + b.year + '</span><b>' + b.left + '<small> يوم متبقٍ</small></b></div><div class="lb-bar"><i class="u" style="width:' + pc + '%"></i><i class="p" style="width:' + pp + '%"></i></div>' +
    '<div class="lb-k"><span><i class="u"></i>استُهلك ' + b.used + '</span>' + (b.pending ? '<span><i class="p"></i>قيد الاعتماد ' + b.pending + '</span>' : '') + '<span><i></i>المستحق ' + b.entitled + '</span></div>' +
    (!compact && Object.keys(b.byKind || {}).length ? '<div class="lb-kinds">' + Object.keys(b.byKind).map(function (k) { return '<span>' + esc(k) + ': <b>' + b.byKind[k] + '</b>' + (b.kinds.indexOf(k) < 0 ? ' <small>(لا تُخصم)</small>' : '') + '</span>'; }).join('') + '</div>' : '') + '</div>';
}

/* ======================= مركز التقارير ======================= */
var RP = { id: 'staff', q: '', ent: '', cc: '', f: '', sortK: -1, sortD: 1 };
var REPORTS = [
  ['staff', 'سجل المنسوبين', 'الأسماء والجهات والدول والمسميات والتواصل', 'users', 'sapphire'],
  ['docs', 'الوثائق وتواريخ الانتهاء', 'المنتهية والقريبة والسارية', 'pass', 'garnet'],
  ['gaps', 'نواقص الملفات', 'ما ينقص كل ملف', 'alert', 'gold'],
  ['reqs', 'الطلبات', 'الإجازات والإركاب والتعريفات وحالاتها', 'stamp', 'amethyst'],
  ['leave', 'أرصدة الإجازات', 'المستحق والمستهلك والمتبقي', 'umbrella', 'emerald'],
  ['att', 'الحضور الشهري', 'الحضور والتأخير والغياب', 'finger', 'teal'],
  ['pay', 'الرواتب', 'الراتب بالعملة والمكافئ بالريال', 'wallet', 'gold']
];
function repAllowed(id) { return id === 'pay' ? can('pay') && mod('payroll') : id === 'att' ? can('attv') && mod('att') : id === 'reqs' || id === 'leave' ? mod('reqs') : true; }
function repData(id) {
  var F = function (s) { var q = RP.q.trim().toLowerCase(); return (!RP.ent || s.ent.v === RP.ent) && (!RP.cc || s.c.cc === RP.cc) && (!q || (s.name + ' ' + s.ref + ' ' + s.latin + ' ' + s.job).toLowerCase().indexOf(q) > -1); };
  var SS = STAFF.filter(F);
  if (id === 'staff') return { cols: ['الاسم', 'الرقم المرجعي', 'الجهة', 'دولة العمل', 'المسمى', 'الإدارة', 'تاريخ المباشرة', 'الجوال', 'البريد', 'الحالة'], rows: SS.map(function (s) { return [s.name, s.ref, s.ent.n, s.c.n, s.job, s.r.department || '', s.hire ? fd(s.hire) : '', s.phone, s.mail, s.status]; }),
    filters: [['', 'الكل'], ['done', 'مكتمل'], ['gap', 'ناقص']], ff: function (r, f) { return !f || (f === 'done' ? r[9] === 'مكتمل' : r[9] === 'ناقص'); } };
  if (id === 'docs') { var R = []; SS.forEach(function (s) { s.docs.forEach(function (d) { R.push([s.name, s.ent.n, d.t, d.no || '', d.exp ? fd(d.exp) : '—', d.days > 9000 ? '—' : d.days, d.days < 0 ? 'منتهية' : d.days <= 30 ? 'خلال ٣٠ يومًا' : d.days <= 90 ? 'خلال ٩٠ يومًا' : 'سارية', d.file ? 'مرفوعة' : 'غير مرفوعة']); }); });
    return { cols: ['المنسوب', 'الجهة', 'الوثيقة', 'رقمها', 'تنتهي في', 'الأيام المتبقية', 'الحالة', 'الصورة'], rows: R, num: [5], filters: [['', 'الكل'], ['منتهية', 'منتهية'], ['خلال ٣٠ يومًا', 'خلال ٣٠ يومًا'], ['خلال ٩٠ يومًا', 'خلال ٩٠ يومًا']], ff: function (r, f) { return !f || r[6] === f; } }; }
  if (id === 'gaps') return { cols: ['المنسوب', 'الجهة', 'الدولة', 'عدد النواقص', 'النواقص', 'البريد'], rows: SS.filter(function (s) { return s.miss.length; }).map(function (s) { return [s.name, s.ent.n, s.c.n, s.miss.length, s.miss.join('، '), s.mail]; }), num: [3] };
  if (id === 'reqs') { var refs = {}; SS.forEach(function (s) { refs[s.ref] = 1; });
    return { cols: ['رقم الطلب', 'المنسوب', 'النوع', 'التفاصيل', 'الفترة', 'الحالة', 'عند', 'تاريخ التقديم'], rows: reqRows().filter(function (r) { return refs[r.ref]; }).map(function (r) { return [r.no, r.name, r.typeName, reqSum(r), reqDates(r), r.statusName, r.status === 'pending' && r.chain[r.stage] ? r.chain[r.stage].label : '', fd(pdt(r.createdAt))]; }),
      filters: [['', 'كل الحالات'], ['قيد الإجراء', 'قيد الإجراء'], ['معتمد', 'معتمد'], ['مرفوض', 'مرفوض']], ff: function (r, f) { return !f || r[5] === f; } }; }
  if (id === 'leave') { var c = need('lbal', function () { return api({ action: 'leaveBalances' }); }, 120000); if (!c.data) return { wait: c.err || 'جارٍ التحميل…' };
    return { cols: ['المنسوب', 'الجهة', 'المستحق', 'المستهلك', 'قيد الاعتماد', 'المتبقي'], rows: SS.map(function (s) { var b = c.data.rows[s.ref] || {}; return [s.name, s.ent.n, b.entitled || 0, b.used || 0, b.pending || 0, b.left || 0]; }), num: [2, 3, 4, 5] }; }
  if (id === 'att') { var ym = AT.month || ymNow(), a = attData(ym); if (!a.data) return { wait: a.err || 'جارٍ التحميل…' };
    return { title: ymName(ym), cols: ['المنسوب', 'الجهة', 'أيام العمل', 'الحضور', 'التأخير (مرات)', 'التأخير (دقائق)', 'خروج مبكر', 'الغياب', 'إجازة/مهمة', 'الساعات'], rows: SS.map(function (s) { var x = a.data.rows[s.ref]; return x ? [s.name, s.ent.n, a.data.workDays, x.present, x.late, x.lateMin, x.early, x.absent, x.leaveDays, x.hours] : null; }).filter(Boolean), num: [2, 3, 4, 5, 6, 7, 8, 9] }; }
  if (id === 'pay') return { cols: ['المنسوب', 'الجهة', 'الراتب', 'العملة', 'المكافئ بالريال', 'طريقة الاستلام', 'البنك', 'الحساب'], rows: SS.map(function (s) { return [s.name, s.ent.n, s.base || 0, s.cur, s.base && FX[s.cur] ? Math.round(sar(s)) : '', s.r.payMethod || '', s.r.bankName || '', s.iban || 'غير مسجل']; }), num: [2, 4] };
  return { cols: [], rows: [] };
}
VIEWS.reports = function () {
  if (!repAllowed(RP.id)) RP.id = 'staff';
  var R = REPORTS.filter(function (r) { return repAllowed(r[0]); }), cur = R.filter(function (r) { return r[0] === RP.id; })[0], d = repData(RP.id);
  var side = '<nav class="rnav" aria-label="التقارير">' + R.map(function (r) { return '<button type="button" data-rp="' + r[0] + '" aria-current="' + (r[0] === RP.id) + '">' + tile(r[4], r[3]) + '<span><b>' + r[1] + '</b><small>' + r[2] + '</small></span></button>'; }).join('') + '</nav>';
  var body;
  if (d.wait) body = '<div class="empty">' + esc(d.wait) + '</div>';
  else {
    var rows = d.rows.filter(function (r) { return !d.ff || d.ff(r, RP.f); });
    if (RP.sortK > -1) rows.sort(function (a, b) { var x = a[RP.sortK], y = b[RP.sortK]; return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'ar')) * RP.sortD; });
    RP._rows = rows; RP._cols = d.cols; RP._title = cur[1] + (d.title ? ' · ' + d.title : '');
    var num = d.num || [];
    body = '<div class="rtools">' + (d.filters ? '<div class="schips">' + d.filters.map(function (f) { return '<button data-rpf="' + esc(f[0]) + '" aria-pressed="' + (RP.f === f[0]) + '">' + f[1] + '</button>'; }).join('') + '</div>' : '') + '<span class="fcount"><b>' + rows.length + '</b> صفًا</span>' +
      '<button class="btn sm" id="rpCsv">' + ic('excel') + 'تصدير Excel</button><button class="btn sm" id="rpPrint">' + ic('doc') + 'طباعة</button></div>' +
      '<div class="tw rtw"><table class="rtab"><thead><tr>' + d.cols.map(function (c, i) { return '<th' + (num.indexOf(i) > -1 ? ' class="num"' : '') + '><button type="button" data-rps="' + i + '">' + c + (RP.sortK === i ? (RP.sortD > 0 ? ' ▲' : ' ▼') : '') + '</button></th>'; }).join('') + '</tr></thead><tbody>' +
      (rows.length ? rows.map(function (r) { return '<tr>' + r.map(function (v, i) { return '<td' + (num.indexOf(i) > -1 ? ' class="num"' : '') + '>' + esc(v === '' || v == null ? '—' : typeof v === 'number' ? n(v) : v) + '</td>'; }).join('') + '</tr>'; }).join('') : '<tr><td colspan="' + d.cols.length + '" class="empty">لا صفوف في هذه التصفية.</td></tr>') + '</tbody></table></div>';
  }
  var bar = '<div class="fbar">' + fsearch('rpq', RP.q, 'ابحث بالاسم أو الرقم المرجعي', 'بحث في التقرير') + ssel('rpe', entOpts(true, true), RP.ent, 'الكل', function (v) { RP.ent = v; render(); }, 'الجهة', 'الجهة') + ssel('rpc', ctryOpts(), RP.cc, 'الكل', function (v) { RP.cc = v; render(); }, 'الدولة', 'الدولة') +
    (RP.id === 'att' ? ssel('rpm', ((attData(AT.month || ymNow()).data || {}).months || [ymNow()]).map(function (m) { return { v: m, n: ymName(m) }; }), AT.month || ymNow(), ymName(AT.month || ymNow()), function (v) { AT.month = v; render(); }, 'الشهر', 'الشهر') : '') + '</div>';
  return ptitle('التقارير', 'اختر تقريرًا، وصفِّه بالجهة والدولة والحالة، ثم صدّره إلى Excel أو اطبعه. كل التقارير من البيانات الحية.') +
    '<div class="rgrid">' + side + '<section class="pn rmain" id="repArea"><div class="ph">' + tile(cur[4], cur[3]) + '<div><h2>' + cur[1] + (d.title ? ' · ' + esc(d.title) : '') + '</h2><p>' + cur[2] + '</p></div></div><div class="pb">' + bar + body + '</div></section></div>';
};
function repCsv() {
  var q = function (v) { v = v == null ? '' : String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
  var txt = '﻿' + [RP._cols].concat(RP._rows).map(function (r) { return r.map(q).join(','); }).join('\r\n');
  var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], { type: 'text/csv;charset=utf-8' })); a.download = 'Bonyan-HR-' + RP.id + '-' + new Date().toISOString().slice(0, 10) + '.csv';
  document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 800);
}
function bindReports() {
  document.querySelectorAll('[data-rp]').forEach(function (b) { b.onclick = function () { RP.id = b.dataset.rp; RP.f = ''; RP.sortK = -1; render(); }; });
  document.querySelectorAll('[data-rpf]').forEach(function (b) { b.onclick = function () { RP.f = b.dataset.rpf; render(); }; });
  document.querySelectorAll('[data-rps]').forEach(function (b) { b.onclick = function () { var k = +b.dataset.rps; if (RP.sortK === k) RP.sortD = -RP.sortD; else { RP.sortK = k; RP.sortD = 1; } render(); }; });
  var q = document.getElementById('rpq'); if (q) q.oninput = function () { RP.q = q.value; softRender(); };
  var c = document.getElementById('rpCsv'); if (c) c.onclick = repCsv;
  var p = document.getElementById('rpPrint'); if (p) p.onclick = function () { document.body.classList.add('print-rep'); var t = document.createElement('div'); t.id = 'repHead'; t.innerHTML = '<b>' + esc(RP._title) + '</b><span>منصة بنيان للموارد البشرية · ' + fd(new Date()) + ' · ' + RP._rows.length + ' صفًا</span>'; document.getElementById('repArea').prepend(t); setTimeout(function () { window.print(); document.body.classList.remove('print-rep'); t.remove(); }, 60); };
  document.querySelectorAll('[data-repgo]').forEach(function (b) { b.onclick = function () { RP.id = b.dataset.repgo; location.hash = 'reports'; }; });
}

/* ======================= ربط كل ما سبق ======================= */
/* مصفوفة صلاحيات الأدوار: منح/سحب ثم حفظ (لمدير النظام) */
document.addEventListener('click', function (e) {
  var t = e.target.closest && e.target.closest('[data-rpk], #rpSave, #rpUndo, #rpReset'); if (!t || !RPE || !can('users')) return;
  if (t.dataset.rpk) { var L = RPE.map[t.dataset.rpk], p = t.dataset.rpp, i = L.indexOf(p); if (i > -1) L.splice(i, 1); else L.push(p); softRender(); return; }
  if (t.id === 'rpUndo') { RPE = null; softRender(); return; }
  var reset = t.id === 'rpReset';
  if (reset && !confirm('إعادة صلاحيات كل الأدوار إلى إعدادات النظام الأصلية؟')) return;
  RPE.busy = true; softRender();
  api(reset ? { action: 'rolePermsSave', reset: 1 } : { action: 'rolePermsSave', map: RPE.map }).then(function (j) {
    RPE = null; seed('users', j); toast(reset ? 'أُعيدت صلاحيات الأدوار إلى الافتراضي' : 'حُفظت صلاحيات الأدوار، وتسري على الحسابات التابعة لأدوارها فورًا'); softRender();
  }, function (er) { RPE.busy = false; toast(errText(er)); softRender(); });
});
/* ======================= البحث العام أعلى الصفحة =======================
   يبحث في المنسوبين (الاسم بالعربي واللاتيني، الرقم المرجعي، الجوال وواتساب، البريد، الجواز والهوية، الرقم الوظيفي، الجهة، الدولة، المسمى)
   وفي أقسام المنصة الظاهرة لك؛ يتجاهل الهمزات والتشكيل والأرقام العربية، ويعمل بالأسهم وEnter */
function gn(s) {
  return String(s == null ? '' : s).toLowerCase().replace(/[ً-ٟـ]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
    .replace(/[٠-٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); }).replace(/\s+/g, ' ').trim();
}
function bindGq() {
  var gq = document.getElementById('gq'), hits = document.getElementById('hits'); if (!gq || !hits) return;
  var items = [], sel = -1;
  var all = function (raw) { filt = { q: raw, ent: '', cc: '', st: 'all' }; cur = ''; TAB.people = 'dir'; hits.hidden = true; if (view === 'people') render(); else location.hash = 'people'; };
  var go = function (it) { hits.hidden = true; gq.blur(); if (it.k === 's') openRec(it.v); else if (it.k === 'p') location.hash = it.v.replace(/^#/, ''); else all(it.v); };
  var mark = function () { [].forEach.call(hits.querySelectorAll('[data-gi]'), function (b) { var on = +b.dataset.gi === sel; b.classList.toggle('act', on); if (on) b.scrollIntoView({ block: 'nearest' }); }); };
  var run = function () {
    var raw = gq.value.trim(), q = gn(raw); items = []; sel = -1;
    if (!q) { hits.hidden = true; return; }
    var toks = q.split(' '), qd = q.replace(/\D/g, '');
    var res = STAFF.map(function (s) {
      var r = s.r || {}, hay = gn([s.name, r.fullNameLatin, s.ref, s.job, s.ent && s.ent.n, s.c && s.c.n, r.officialEmail, r.personalEmail, r.passportNo, r.employeeNo, r.nationalIdNo, r.department, r.jobTitle].join(' ')),
        dig = [s.phone, r.whatsapp, r.phone, r.mobile].join(' ').replace(/\D/g, '');
      var hit = toks.every(function (t) { return hay.indexOf(t) > -1; }) || (qd.length >= 4 && dig.indexOf(qd) > -1);
      if (!hit) return null;
      var nm = gn(s.name + ' ' + (r.fullNameLatin || ''));
      return { s: s, sc: nm.indexOf(q) === 0 ? 0 : (' ' + nm).indexOf(' ' + q) > -1 ? 1 : nm.indexOf(q) > -1 ? 2 : 3 };
    }).filter(Boolean).sort(function (a, b) { return a.sc - b.sc || a.s.name.localeCompare(b.s.name, 'ar'); });
    var seen = {}, pages = [].slice.call(document.querySelectorAll('.side a[href^="#"]')).map(function (a) { var b = a.querySelector('b') || a.querySelector('span') || a; return { h: a.getAttribute('href'), t: (b.textContent || '').trim() }; })
      .filter(function (p) { if (!p.t || seen[p.h] || gn(p.t).indexOf(q) < 0) return false; seen[p.h] = 1; return true; }).slice(0, 4);
    var H = '';
    if (res.length) {
      H += '<div class="dh"><span>المنسوبون</span><span>' + res.length + '</span></div>';
      res.slice(0, 7).forEach(function (x) { var s = x.s; items.push({ k: 's', v: s.ref });
        H += '<button type="button" data-gi="' + (items.length - 1) + '">' + av(s) + '<span><b>' + esc(s.name) + '</b><span class="ref">' + esc(s.ref) + ' · ' + esc(s.ent ? s.ent.n : '') + (s.job ? ' · ' + esc(s.job) : '') + '</span></span></button>'; });
    }
    if (pages.length) {
      H += '<div class="dh"><span>أقسام المنصة</span></div>';
      pages.forEach(function (p) { items.push({ k: 'p', v: p.h }); H += '<button type="button" data-gi="' + (items.length - 1) + '"><span class="gpi">' + ic('grid') + '</span><span><b>' + esc(p.t) + '</b></span></button>'; });
    }
    if (res.length > 7 || (res.length && can('view'))) { items.push({ k: 'a', v: raw }); H += '<button type="button" class="gall" data-gi="' + (items.length - 1) + '">' + ic('search') + '<span><b>عرض كل النتائج (' + res.length + ') في دليل المنسوبين</b></span></button>'; }
    if (!items.length) H = '<div class="empty" style="padding:18px">لا نتائج لـ «' + esc(raw) + '». جرّب جزءًا من الاسم، أو الرقم المرجعي، أو آخر أرقام الجوال.</div>';
    hits.innerHTML = H; hits.hidden = false;
    hits.querySelectorAll('[data-gi]').forEach(function (b) { b.onmousedown = function (e) { e.preventDefault(); go(items[+b.dataset.gi]); }; b.onmouseenter = function () { sel = +b.dataset.gi; mark(); }; });
  };
  gq.oninput = run;
  gq.onfocus = function () { if (gq.value.trim()) run(); };
  gq.onkeydown = function (e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { if (!items.length) return; e.preventDefault(); sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length; mark(); }
    else if (e.key === 'Enter') { e.preventDefault(); var raw = gq.value.trim(); if (!raw) return; if (sel > -1) go(items[sel]); else if (items.length === 1 || (items[0] && items[0].k === 's' && items.filter(function (x) { return x.k === 's'; }).length === 1)) go(items[0]); else all(raw); }
    else if (e.key === 'Escape') { hits.hidden = true; gq.blur(); }
  };
  gq.onblur = function () { setTimeout(function () { hits.hidden = true; }, 150); };
}
/* ======================= نقل المنسوبين بين الجهات (لمن يملك تعديل البيانات) ======================= */
var EM = null;
/* خطوتان: ١) اختيار الأسماء ٢) اختيار الجهة ثم النقل */
function emOpen(ref) { EM = { step: 1, to: '', sel: {}, q: '', from: '', busy: false, done: 0 }; if (ref) { EM.sel[ref] = 1; EM.step = 2; } drawEM(); }
function emTargets() { return (CFG.ENTITIES || []).filter(function (e) { return e.v !== 'other'; }); }
function emPicked() { return Object.keys(EM.sel).filter(function (k) { return EM.sel[k] && byRef(k); }); }
function drawEM() {
  var old = document.getElementById('emLayer'), y = old ? (old.querySelector('.eml') || {}).scrollTop || 0 : 0; if (old) old.remove();
  var picked = emPicked(), tgt = emTargets().filter(function (e) { return e.ar === EM.to; })[0], body = '', foot = '';
  var steps = '<ol class="emsteps"><li class="' + (EM.step === 1 ? 'on' : 'done') + '"><i>1</i>اختر الأسماء</li><li class="' + (EM.step === 2 ? 'on' : '') + '"><i>2</i>اختر الجهة وانقل</li></ol>';
  var chips = picked.length ? '<div class="emchips">' + picked.slice(0, 40).map(function (r) { var s = byRef(r); return '<span>' + esc(s.name) + (EM.step === 1 ? '<button type="button" data-emun="' + esc(r) + '" aria-label="إزالة ' + esc(s.name) + '">×</button>' : '') + '</span>'; }).join('') + (picked.length > 40 ? '<span>+' + (picked.length - 40) + '</span>' : '') + '</div>' : '';
  if (EM.step === 1) {
    var q = gn(EM.q), rows = STAFF.filter(function (s) { return (!EM.from || s.ent.v === EM.from) && (!q || gn(s.name + ' ' + (s.r.fullNameLatin || '') + ' ' + s.ref + ' ' + s.ent.n).indexOf(q) > -1); });
    var froms = ENT.map(function (e) { return '<option value="' + esc(e.v) + '"' + (EM.from === e.v ? ' selected' : '') + '>' + esc(e.n) + ' (' + STAFF.filter(function (s) { return s.ent.v === e.v; }).length + ')</option>'; }).join('');
    var allOn = rows.length && rows.every(function (s) { return EM.sel[s.ref]; });
    /* «تحديد الكل» يظهر فقط بعد التضييق ببحث أو بجهة، حتى لا يُحدَّد السجل كله بالخطأ */
    var narrowed = !!(EM.from || q);
    body = '<div class="emf"><input id="emQ" type="search" placeholder="ابحث بالاسم أو الرقم المرجعي" value="' + esc(EM.q) + '" autocomplete="off">' +
      '<label class="emfrom"><span>اعرض منسوبي</span><select id="emFrom" aria-label="اعرض منسوبي جهة معيّنة"><option value="">كل الجهات</option>' + froms + '</select></label></div>' +
      (narrowed && rows.length > 1 ? '<div class="emall"><span>' + rows.length + ' ظاهرون ' + (EM.from ? 'من «' + esc((ENT.filter(function (e) { return e.v === EM.from; })[0] || {}).n || '') + '»' : 'بهذا البحث') + '</span><button type="button" class="btn sm" id="emAll">' + (allOn ? 'إلغاء تحديدهم' : 'تحديدهم كلهم') + '</button></div>' : '') + chips +
      '<div class="eml">' + (rows.map(function (s) { var on = !!EM.sel[s.ref];
        return '<label class="' + (on ? 'on' : '') + '"><input type="checkbox" data-emref="' + esc(s.ref) + '"' + (on ? ' checked' : '') + '>' + av(s) + '<span><b>' + esc(s.name) + '</b><small>' + esc(s.ref) + ' · ' + esc(s.ent.n) + '</small></span></label>'; }).join('') || '<div class="empty" style="padding:18px">لا أحد بهذا البحث.</div>') + '</div>';
    foot = '<span class="emcnt">' + (picked.length ? 'حدّدت <b>' + picked.length + '</b>' : 'لم تحدّد أحدًا بعد') + '</span><button class="btn" data-emx="1">إلغاء</button><button class="btn goldb" id="emNext"' + (picked.length ? '' : ' disabled') + '>التالي: اختر الجهة ←</button>';
  } else {
    var same = tgt ? picked.filter(function (r) { return byRef(r).ent.full === tgt.ar; }).length : 0;
    body = '<div class="emsum">' + tile('sapphire', 'users') + '<div><b>' + nq(picked.length, 'منسوب واحد', 'منسوبان', 'منسوبين', 'منسوبًا') + ' سيُنقلون</b>' + chips + '</div></div>' +
      '<div class="emt">' + emTargets().map(function (e) { var k = ENT_KEY[e.v] || e.v;
        return '<button type="button" class="' + (EM.to === e.ar ? 'on' : '') + '" data-emto="' + esc(e.ar) + '" style="--ec:' + ((e.colors || [])[0] || '#475569') + '"><span class="lg">' + (ELOGO[k] ? '<img src="' + ELOGO[k] + '" alt="">' : '<i>' + esc(e.ar.charAt(0)) + '</i>') + '</span><b>' + esc(e.ar) + '</b></button>'; }).join('') + '</div>' +
      (same ? '<div class="note">' + ic('info') + '<span>' + nq(same, 'واحد منهم', 'اثنان منهم', 'منهم', 'منهم') + (same > 2 ? ' ' + same : '') + ' في هذه الجهة أصلًا ولن يتغيّر.</span></div>' : '');
    foot = '<div class="lerr" role="alert"></div><button class="btn" id="emBack"' + (EM.busy ? ' disabled' : '') + '>→ رجوع إلى الأسماء</button><button class="btn goldb" id="emGo"' + (EM.busy || !EM.to || same === picked.length ? ' disabled' : '') + '>' + (EM.busy ? 'جارٍ النقل… ' + EM.done + ' من ' + (picked.length - same) : tgt ? 'نقل ' + (picked.length - same) + ' إلى «' + esc(tgt.ar) + '»' : 'اختر الجهة') + '</button>';
  }
  var el = document.createElement('div'); el.id = 'emLayer';
  el.innerHTML = '<div class="mscrim" data-emx="1"></div><section class="mdl emm" role="dialog" aria-modal="true" aria-labelledby="emT"><header class="mh">' + tile('gold', 'building') + '<div><h2 id="emT">نقل منسوبين بين الجهات</h2><p>كل نقل يُسجَّل في ملف المنسوب وفي سجل العمليات باسمك.</p></div></header>' +
    steps + '<div class="emb">' + body + '</div><footer class="mf">' + foot + '</footer></section>';
  document.body.appendChild(el); var L2 = el.querySelector('.eml'); if (L2) L2.scrollTop = y;
  var on = function (sel, ev, fn) { var n = el.querySelector(sel); if (n) n[ev] = fn; };
  el.querySelectorAll('[data-emx]').forEach(function (b) { b.onclick = function () { if (!EM.busy) el.remove(); }; });
  el.querySelectorAll('[data-emun]').forEach(function (b) { b.onclick = function () { EM.sel[b.dataset.emun] = 0; drawEM(); }; });
  el.querySelectorAll('[data-emref]').forEach(function (c) { c.onchange = function () { EM.sel[c.dataset.emref] = c.checked ? 1 : 0; drawEM(); }; });
  el.querySelectorAll('[data-emto]').forEach(function (b) { b.onclick = function () { EM.to = b.dataset.emto; drawEM(); }; });
  on('#emQ', 'oninput', function () { EM.q = this.value; var p = this.selectionStart; drawEM(); var n = document.getElementById('emQ'); n.focus(); try { n.setSelectionRange(p, p); } catch (x) { } });
  on('#emFrom', 'onchange', function () { EM.from = this.value; drawEM(); });
  on('#emAll', 'onclick', function () { var q = gn(EM.q), rows = STAFF.filter(function (s) { return (!EM.from || s.ent.v === EM.from) && (!q || gn(s.name + ' ' + (s.r.fullNameLatin || '') + ' ' + s.ref + ' ' + s.ent.n).indexOf(q) > -1); }), all = rows.every(function (s) { return EM.sel[s.ref]; }); rows.forEach(function (s) { EM.sel[s.ref] = all ? 0 : 1; }); drawEM(); });
  on('#emNext', 'onclick', function () { EM.step = 2; drawEM(); });
  on('#emBack', 'onclick', function () { EM.step = 1; drawEM(); });
  on('#emGo', 'onclick', function () {
    var to = EM.to, list = emPicked().filter(function (r) { return byRef(r).ent.full !== to; }), ok = 0, fail = [];
    if (!list.length) return;
    EM.busy = true; EM.done = 0; drawEM();
    (function next(i) {
      if (i >= list.length) { reloadList().then(function () { EM.busy = false; var l = document.getElementById('emLayer'); if (l) l.remove(); toast(fail.length ? 'نُقل ' + ok + '، وتعذّر ' + fail.length : 'نُقل ' + nq(ok, 'منسوب واحد', 'منسوبان', 'منسوبين', 'منسوبًا') + ' إلى «' + to + '»'); softRender(); }); return; }
      api({ action: 'adminUpdate', ref: list[i], changes: { entity: to } }).then(function () { ok++; }, function () { fail.push(list[i]); }).then(function () { EM.done = i + 1; drawEM(); next(i + 1); });
    })(0);
  });
  if (EM.step === 1 && !old) setTimeout(function () { var n = document.getElementById('emQ'); if (n) n.focus(); }, 30);
}
document.addEventListener('click', function (e) { var t = e.target.closest && e.target.closest('[data-entmove]'); if (!t || !can('edit')) return; e.preventDefault(); var d = t.closest('details'); if (d) d.open = false; emOpen(t.dataset.entmove || ''); });
document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && EM && !EM.busy) { var l = document.getElementById('emLayer'); if (l) l.remove(); } });
/* زر القائمة: في الجوال يفتح القائمة الجانبية، وفي الشاشات الكبيرة يُخفيها أو يُظهرها لتتسع الصفحة (ويُحفظ الاختيار) */
function sideOffGet() { try { return localStorage.getItem('bhr_side_off') === '1'; } catch (e) { return false; } }
document.body.classList.toggle('side-off', sideOffGet());
function bindMenuBtn() {
  var b = document.getElementById('menuBtn'); if (!b) return;
  var wide = function () { return window.matchMedia('(min-width: 901px)').matches; };
  var lab = function () { if (wide()) { var off = document.body.classList.contains('side-off'); b.setAttribute('aria-pressed', String(!off)); b.title = off ? 'إظهار القائمة الجانبية' : 'إخفاء القائمة الجانبية لتتسع الصفحة'; b.setAttribute('aria-label', b.title); } else { b.removeAttribute('aria-pressed'); b.title = 'القائمة'; b.setAttribute('aria-label', 'القائمة'); } };
  var mobile = b.onclick;
  b.onclick = function (e) {
    if (!wide()) { if (mobile) mobile.call(b, e); return; }
    var off = !document.body.classList.contains('side-off'); document.body.classList.toggle('side-off', off);
    try { localStorage.setItem('bhr_side_off', off ? '1' : '0'); } catch (x) { }
    lab(); window.dispatchEvent(new Event('resize'));
  };
  lab();
}
function bindHrx() {
  bindGq(); bindMenuBtn();
  bindSet(); bindAtt(); bindNews(); bindReports();
  var oq = document.getElementById('orgq'); if (oq) oq.oninput = function () { ORG.q = oq.value; softRender(); };
}
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { var l = document.getElementById('attLayer'); if (l) l.remove(); var n = document.getElementById('neLayer'); if (n && !document.querySelector('.ss-pop')) n.remove(); } });

/* ======================= الكرة الأرضية (نفس كرة النظام السابق) ======================= */
var GLB = null, PUBC = null;
function globeKill() { if (GLB) { try { GLB.destroy(); } catch (e) { } GLB = null; } }
function globeMount(id, tipId, map, compact) {
  var c = document.getElementById(id), CF = window.APP_CONFIG || {};
  if (!c || !window.BonyanGlobe || !window.LAND_MASK || !CF.HQ) return;
  globeKill();
  var cn = function (cc) { return CNAME[cc] || (CT_MAP[cc] || {}).n || cc; };
  GLB = window.BonyanGlobe(c, { hq: CF.HQ, centerLon: 40, tilt: 16, compact: !!compact, tip: document.getElementById(tipId),
    label: function (o) { return o && o.name ? (o.name.ar || o.name) : cn(o && o.cc); }, hqText: function (cp) { var h = CF.HQ; return ((cp ? h.short : (h.label || h.name)) || {}).ar || ''; },
    hqTip: function () { return '<b>' + esc(CF.HQ.name.ar) + '</b>' + (CF.SITES || []).map(function (s) { return '<span>' + esc(s.name.ar) + '</span>'; }).join(''); }, sites: CF.SITES || [] });
  GLB.setPoints(map, function (cc, d) {
    var rows = [['المنسوبون', d.n]]; if (d.nat > 1) rows.push(['الجنسيات', d.nat]); if (d.reg > 1) rows.push(['المناطق', d.reg]);
    return { name: cn(cc), n: n(d.n), nat: d.nat ? n(d.nat) : '', tip: cn(cc), tipHTML: '<b>' + esc(cn(cc)) + '</b>' + rows.map(function (r) { return '<span><i>' + esc(r[0]) + '</i><em>' + n(r[1]) + '</em></span>'; }).join('') };
  });
}
function staffGeo() { var m = {}; STAFF.forEach(function (s) { var cc = s.c.cc; if (!cc || cc === '—') return; var x = m[cc] = m[cc] || { n: 0, nats: {}, regs: {} }; x.n++; if (s.nat) x.nats[s.nat] = 1; var rg = String(s.r.workRegion || s.r.region || '').trim(); if (rg) x.regs[rg] = 1; });
  Object.keys(m).forEach(function (cc) { m[cc] = { n: m[cc].n, nat: Object.keys(m[cc].nats).length, reg: Object.keys(m[cc].regs).length }; }); return m; }
function homeGlobe() { globeMount('hglobe', 'hgTip', staffGeo(), false); }
function loginGlobe() {
  var go = function () { if (!document.getElementById('lglobe')) return; globeMount('lglobe', 'lgTip', PUBC.countries || {}, false);
    var s = document.getElementById('lgSum'); if (s && PUBC.total) s.innerHTML = '<span><b>' + n(PUBC.total) + '</b> منسوبًا</span><span><b>' + Object.keys(PUBC.countries || {}).length + '</b> دول</span>' + (PUBC.nationalities ? '<span><b>' + PUBC.nationalities + '</b> جنسية</span>' : ''); };
  if (PUBC) { go(); return; }
  if (!window.matchMedia || !matchMedia('(min-width: 1100px)').matches) return;
  fetch('api/?action=countries', { credentials: 'same-origin' }).then(function (r) { return r.json(); }).then(function (j) { PUBC = j && j.ok ? j : { countries: {} }; go(); }, function () { PUBC = { countries: {} }; go(); });
}

/* توقيع المطوّر بنفس صيغة تقرير إثيوبيا ونموذج التسجيل (oj-sign): يظهر البريد والمسمى عند المرور */
function sigHTML() {
  return '<div class="oj-sign"><a class="oj2" href="mailto:osama.mo.bonyan@gmail.com?subject=' + encodeURIComponent('استفسار تقني — منصة بنيان للموارد البشرية') + '">' +
    '<span class="oj2-row"><span class="oj2-dot"></span><span class="oj2-txt">تطوير وتنفيذ <b>أسامة جنيدي</b></span><span class="oj2-mail">osama.mo.bonyan@gmail.com</span></span>' +
    '<span class="oj2-role">أخصائي بيانات ومطوّر أنظمة</span></a><div class="oj2-copy">© <span class="oj2-year">' + new Date().getFullYear() + '</span> مجموعة بنيان العالمية</div></div>';
}

/* ===== عارض المرفقات داخل المنصة: الصور وملفات PDF تُعرض في طبقة فوق الصفحة بلا نوافذ خارجية ===== */
var FV = null;
function fvIsFile(h) { return /[?&]action=file&id=/.test(h || ''); }
var FVI = {
  x: '<path d="M6 6l12 12M18 6L6 18"/>', prev: '<path d="M9 6l6 6-6 6"/>', next: '<path d="M15 6l-6 6 6 6"/>',
  zin: '<circle cx="11" cy="11" r="6.5"/><path d="M11 8v6M8 11h6M16 16l4.5 4.5"/>', zout: '<circle cx="11" cy="11" r="6.5"/><path d="M8 11h6M16 16l4.5 4.5"/>',
  rot: '<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v5h-5"/>', dl: '<path d="M12 4v11M7 10.5l5 5 5-5M5 19.5h14"/>', fit: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'
};
function fvIc(k) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + FVI[k] + '</svg>'; }
function fvOpen(items, i) {
  fvClose();
  FV = { items: items, i: i, cache: {}, z: 1, r: 0 };
  var el = document.createElement('div'); el.id = 'fvLayer'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'عارض المرفقات');
  el.innerHTML = '<div class="fvbar"><div class="fvt"><b id="fvTitle"></b><span id="fvCount"></span></div><div class="fvtools">' +
    '<button type="button" class="fvb" data-fv="zout" title="تصغير">' + fvIc('zout') + '</button><span class="fvz" id="fvZ" dir="ltr">100%</span><button type="button" class="fvb" data-fv="zin" title="تكبير">' + fvIc('zin') + '</button>' +
    '<button type="button" class="fvb" data-fv="fit" title="ملاءمة الشاشة">' + fvIc('fit') + '</button><button type="button" class="fvb" data-fv="rot" title="تدوير">' + fvIc('rot') + '</button>' +
    '<i class="fvsep"></i><button type="button" class="fvb" data-fv="dl" title="تنزيل">' + fvIc('dl') + '</button><button type="button" class="fvb fvx" data-fv="x" title="إغلاق (Esc)">' + fvIc('x') + '</button></div></div>' +
    '<div class="fvstage" id="fvStage"></div>' +
    (items.length > 1 ? '<button type="button" class="fvnav fvprev" data-fv="prev" aria-label="السابق">' + fvIc('prev') + '</button><button type="button" class="fvnav fvnext" data-fv="next" aria-label="التالي">' + fvIc('next') + '</button><div class="fvdots" id="fvDots"></div>' : '');
  document.body.appendChild(el); document.body.classList.add('no-scroll');
  el.addEventListener('click', function (e) {
    var b = e.target.closest('[data-fv]');
    if (b) { fvAct(b.getAttribute('data-fv')); return; }
    var d = e.target.closest('[data-fvi]'); if (d) { FV.i = +d.getAttribute('data-fvi'); fvShow(); return; }
    if (e.target === el || e.target.id === 'fvStage' || e.target.classList.contains('fvwrap')) fvClose();
  });
  el.querySelector('#fvStage').addEventListener('wheel', function (e) { if (!FV || FV.kind !== 'img' || !(e.ctrlKey || e.metaKey)) return; e.preventDefault(); fvZoom(e.deltaY < 0 ? 1.15 : 1 / 1.15); }, { passive: false });
  setTimeout(function () { var x = el.querySelector('.fvx'); if (x) x.focus(); }, 30);
  fvShow();
}
function fvClose() {
  var el = document.getElementById('fvLayer'); if (el) el.remove();
  if (FV) { Object.keys(FV.cache).forEach(function (k) { var c = FV.cache[k]; if (c && c.url) URL.revokeObjectURL(c.url); }); FV = null; }
  if (!document.getElementById('fullLayer')) document.body.classList.remove('no-scroll');
}
function fvLoad(it) {
  if (FV.cache[it.u]) return FV.cache[it.u].p;
  var c = FV.cache[it.u] = {};
  c.p = fetch(it.u, { credentials: 'same-origin' }).then(function (r) {
    if (!r.ok) throw new Error(r.status === 404 ? 'الملف غير موجود أو مؤرشف' : r.status === 403 || r.status === 401 ? 'لا تملك صلاحية عرض هذا الملف' : 'تعذّر تحميل الملف');
    var cd = r.headers.get('Content-Disposition') || '', m = /filename\*=UTF-8''([^;]+)/i.exec(cd);
    try { c.name = m ? decodeURIComponent(m[1]) : ''; } catch (e) { c.name = ''; }
    c.type = (r.headers.get('Content-Type') || '').split(';')[0].trim();
    return r.blob();
  }).then(function (b) { c.size = b.size; c.url = URL.createObjectURL(c.type && b.type !== c.type ? new Blob([b], { type: c.type }) : b); return c; });
  return c.p;
}
function fvShow() {
  if (!FV) return;
  var it = FV.items[FV.i], st = document.getElementById('fvStage'), el = document.getElementById('fvLayer');
  FV.z = 1; FV.r = 0; FV.kind = '';
  document.getElementById('fvTitle').textContent = it.t || 'مرفق';
  document.getElementById('fvCount').textContent = FV.items.length > 1 ? (FV.i + 1) + ' من ' + FV.items.length : '';
  var dots = document.getElementById('fvDots');
  if (dots) dots.innerHTML = FV.items.map(function (x, k) { return '<button type="button" data-fvi="' + k + '" class="' + (k === FV.i ? 'on' : '') + '" aria-label="' + esc(x.t || '') + '" title="' + esc(x.t || '') + '"></button>'; }).join('');
  el.classList.remove('is-img', 'is-pdf'); el.classList.add('loading');
  st.innerHTML = '<div class="fvload"><i></i><span>جارٍ تحميل الملف…</span></div>';
  var want = FV.i;
  fvLoad(it).then(function (c) {
    if (!FV || FV.i !== want) return;
    el.classList.remove('loading');
    if (/^image\//.test(c.type)) {
      FV.kind = 'img'; el.classList.add('is-img');
      st.innerHTML = '<div class="fvwrap"><div class="fvbox" id="fvBox"><img id="fvImg" src="' + c.url + '" alt="' + esc(it.t || '') + '" draggable="false"></div></div>';
      var im = document.getElementById('fvImg'); if (im.complete && im.naturalWidth) fvApply(); else im.onload = fvApply;
    } else if (c.type === 'application/pdf') {
      FV.kind = 'pdf'; el.classList.add('is-pdf');
      st.innerHTML = '<iframe class="fvpdf" src="' + c.url + '#view=FitH" title="' + esc(it.t || 'ملف PDF') + '"></iframe>';
    } else {
      st.innerHTML = '<div class="fvnone">' + fvIc('dl') + '<b>' + esc(c.name || it.t || 'ملف') + '</b><span>هذا النوع من الملفات لا يُعرض داخل المتصفح، يمكنك تنزيله.</span><button type="button" class="btn goldb" data-fv="dl">تنزيل الملف</button></div>';
    }
    var nx = FV.items[FV.i + 1]; if (nx) fvLoad(nx).catch(function () { });
  }).catch(function (e) {
    if (!FV || FV.i !== want) return;
    delete FV.cache[it.u]; el.classList.remove('loading');
    st.innerHTML = '<div class="fvnone err">' + fvIc('x') + '<b>' + esc(e.message || 'تعذّر تحميل الملف') + '</b><button type="button" class="btn" data-fv="retry">إعادة المحاولة</button></div>';
  });
}
function fvApply() {
  var im = document.getElementById('fvImg'), bx = document.getElementById('fvBox'); if (!im || !bx || !im.naturalWidth) return;
  var wr = bx.parentNode, side = FV.r % 180 !== 0, nw = im.naturalWidth, nh = im.naturalHeight;
  var vw = side ? nh : nw, vh = side ? nw : nh, aw = wr.clientWidth - 24, ah = wr.clientHeight - 24;
  var fit = Math.min(1, aw / vw, ah / vh), w = nw * fit * FV.z, h = nh * fit * FV.z;
  bx.style.width = (side ? h : w) + 'px'; bx.style.height = (side ? w : h) + 'px';
  im.style.width = w + 'px'; im.style.height = h + 'px'; im.style.transform = 'translate(-50%,-50%) rotate(' + FV.r + 'deg)';
  wr.classList.toggle('zoomed', FV.z > 1);
  var z = document.getElementById('fvZ'); if (z) z.textContent = Math.round(FV.z * 100) + '%';
}
function fvZoom(f) { FV.z = Math.max(.5, Math.min(5, FV.z * f)); fvApply(); }
function fvAct(a) {
  if (!FV) return;
  var n = FV.items.length;
  if (a === 'x') fvClose();
  else if (a === 'next' && n > 1) { FV.i = (FV.i + 1) % n; fvShow(); }
  else if (a === 'prev' && n > 1) { FV.i = (FV.i - 1 + n) % n; fvShow(); }
  else if (a === 'retry') fvShow();
  else if (a === 'zin' && FV.kind === 'img') fvZoom(1.25);
  else if (a === 'zout' && FV.kind === 'img') fvZoom(1 / 1.25);
  else if (a === 'fit' && FV.kind === 'img') { FV.z = 1; FV.r = 0; fvApply(); }
  else if (a === 'rot' && FV.kind === 'img') { FV.r = (FV.r + 90) % 360; fvApply(); }
  else if (a === 'dl') {
    var it = FV.items[FV.i];
    fvLoad(it).then(function (c) { var l = document.createElement('a'); l.href = c.url; l.download = c.name || (it.t || 'مرفق'); document.body.appendChild(l); l.click(); l.remove(); }).catch(function () { toast('تعذّر تنزيل الملف'); });
  }
}
document.addEventListener('click', function (e) {
  if (e.defaultPrevented || e.button || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
  var a = e.target.closest && e.target.closest('a[href]');
  if (!a || !fvIsFile(a.getAttribute('href')) || a.closest('#fvLayer')) return;
  e.preventDefault();
  var box = a.closest('[data-fvg]') || a.parentNode;
  var links = [].slice.call(box.querySelectorAll('a[href]')).filter(function (x) { return fvIsFile(x.getAttribute('href')); });
  if (links.indexOf(a) < 0) links = [a];
  fvOpen(links.map(function (x) { return { u: x.getAttribute('href'), t: x.getAttribute('data-fvt') || x.textContent.trim() }; }), links.indexOf(a));
}, true);
window.addEventListener('resize', function () { if (FV && FV.kind === 'img') fvApply(); });
document.addEventListener('keydown', function (e) {
  if (!FV) return;
  if (e.key === 'Escape') { e.stopPropagation(); fvClose(); }
  else if (e.key === 'ArrowLeft') fvAct('next');
  else if (e.key === 'ArrowRight') fvAct('prev');
  else if ((e.key === '+' || e.key === '=') && !e.ctrlKey) fvAct('zin');
  else if (e.key === '-' && !e.ctrlKey) fvAct('zout');
}, true);

/* ======================================================================
   وحدات الموارد البشرية المكمّلة (نوفمبر ٢٠٢٦):
   الطلبات المبنية بمخطط حقول · مستحقات واستقطاعات الشهر
   ====================================================================== */
P.timer = '<path d="M10 2.5h4M12 5.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15ZM12 9v4l2.5 1.5M18.5 6.5l1.5-1.5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>';
P.coins = '<ellipse cx="9" cy="7" rx="5.5" ry="2.5" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="M3.5 7v4c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5V7M3.5 11v4c0 1.4 2.5 2.5 5.5 2.5 1 0 1.9-.1 2.7-.4M14.5 13.5c3 0 6 1.1 6 2.5s-2.7 2.5-6 2.5-6-1.1-6-2.5 3-2.5 6-2.5ZM8.5 16v2.5c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>';
P.door = '<path d="M5 21V4.5A1.5 1.5 0 0 1 6.5 3h8A1.5 1.5 0 0 1 16 4.5V21M3 21h18M12.5 12h.01M16 8h2.5a1 1 0 0 1 1 1v12" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>';
P.book = '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15ZM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5M8 7.5h8M8 11h6" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>';

function fmonth(ym) { var p = String(ym || '').split('-'); return p.length === 2 ? fd(new Date(+p[0], +p[1] - 1, 1), { month: 'long', year: 'numeric' }) : (ym || ''); }
function ymAdd(ym, k) { var p = ym.split('-'), d = new Date(+p[0], +p[1] - 1 + k, 1); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2); }
function tmins(t) { var m = /^(\d{2}):(\d{2})$/.exec(t || ''); return m ? +m[1] * 60 + +m[2] : null; }

/* ---------- الطلبات المبنية بالمخطط: الحقول تأتي من الخادم ---------- */
function rwRefOpts(types) {
  var s = rwStaff(); if (!s) return [];
  return reqRows().filter(function (r) { return r.ref === s.ref && r.status === 'approved' && types.indexOf(r.type) > -1; })
    .map(function (r) { var d = r.data || {}; return { v: r.no, n: (r.type === 'leave' ? 'إجازة ' + (d.kind || '') : r.type === 'resign' ? 'استقالة، آخر يوم ' + (d.lastDay || '') : 'مهمة إلى ' + (d.dest || '')) + ' · ' + r.no, d: (d.from ? fdx(pdate(d.from)) : '') + (d.to ? ' إلى ' + fdx(pdate(d.to)) : ''), ic: RT2[r.type][1] }; });
}
function rwSchemaBody() {
  var F = rwFields(), d = RW.d, h = '<div class="form">';
  F.forEach(function (f) {
    var k = f[0], lab = f[1], kind = f[2], req = !!f[3], opt = f[4], ph = f[5] || '', id = 'rw_' + k;
    if (kind === 'seg') h += rwField(id, lab, rwSeg(k, opt), req, true);
    else if (kind === 'area') h += rwField(id, lab, '<textarea id="' + id + '" data-rw="' + k + '" maxlength="' + (opt ? opt[1] : 1200) + '" placeholder="' + esc(ph || (req ? '' : 'اختياري')) + '">' + esc(d[k] || '') + '</textarea>', req, true);
    else if (kind === 'date') h += rwField(id, lab, rwIn(k, 'date'), req, F.some(function (g) { return g[2] === 'time'; }));
    else if (kind === 'time') h += rwField(id, lab, rwIn(k, 'time', '', ' dir="ltr" step="300"'), req);
    else if (kind === 'month') { var now = ymNow(), ms = []; for (var i = 0; i < 12; i++) ms.push(ymAdd(now, i));
      h += '<div class="fld"><label>' + lab + (req ? ' <i class="rq">*</i>' : '') + '</label>' + ssel(id, ms.map(function (m) { return { v: m, n: fmonth(m), ic: 'calendar' }; }), d[k] || '', 'اختر الشهر', function (v) { rwSync(); RW.d[k] = v; RW.err = ''; render(); }, lab) + '</div>'; }
    else if (kind === 'int' || kind === 'money') h += rwField(id, lab, rwIn(k, 'text', opt ? (kind === 'money' ? 'مثال: ' + Math.max(opt[0], 1000) : 'من ' + opt[0] + ' إلى ' + opt[1]) : '', ' dir="ltr" inputmode="' + (kind === 'int' ? 'numeric' : 'decimal') + '" data-rwlive="1" data-num="1" autocomplete="off"'), req);
    else if (kind === 'reqref') { var ro = rwRefOpts(opt || []);
      h += '<div class="fld wide"><label>' + lab + (req ? ' <i class="rq">*</i>' : '') + '</label>' + (ro.length ? ssel(id, [{ v: '', n: 'بدون ربط', ic: 'x' }].concat(ro), d[k] || '', 'اختر الإجازة أو المهمة التي عدت منها', function (v) { rwSync(); RW.d[k] = v; RW.err = ''; render(); }, lab)
        : '<div class="note">' + ic('info') + '<span>' + ((opt || []).indexOf('resign') > -1 ? 'لا يوجد طلب استقالة معتمد لهذا المنسوب؛ يمكن المتابعة دون ربط.' : 'لا توجد إجازة أو مهمة معتمدة لربطها. إن كانت مباشرة بعد تعيين جديد فاختر «تعيين جديد».') + '</span></div>') + '</div>'; }
    else h += rwField(id, lab, rwIn(k, 'text', ph), req, opt && opt[1] > 120);
  });
  if (rwNeedSup()) { var sups = (formsData() || {}).sups || [], fl = formOf(RW.type), nx = fl && fl.steps[1] ? fl.steps[1].label : '';
    h += '<div class="fld wide"><label>المسؤول المباشر <i class="rq">*</i></label>' + (sups.length ? ssel('rwSup', sups.map(function (x) { return { v: x.id, n: x.name, d: x.title || '', ic: 'user' }; }), d.supervisor || '', 'اختر مسؤولك المباشر', function (v) { rwSync(); RW.d.supervisor = v; RW.err = ''; render(); }, 'المسؤول المباشر')
      : '<div class="note warn">' + ic('alert') + '<span>لم تُضَف قائمة المسؤولين المباشرين بعد. تواصل مع الموارد البشرية.</span></div>') + '<small class="fhint">يصله الطلب أولًا ليعتمده أو يرفضه' + (nx ? '، ثم ينتقل إلى ' + esc(nx) : '') + '.</small></div>'; }
  h += '<div class="fld wide" id="rwExtra">' + rwExtra() + '</div>';
  return h + '</div>';
}
/* ما تحسبه المنصة مباشرة أثناء التعبئة (المدة، القسط، التأخر عن العودة…) */
function rwCalc() {
  var d = RW.d, t = RW.type, o = {};
  if (t === 'perm' || t === 'ot') { var a = tmins(d.fromT), b = tmins(d.toT); if (a != null && b != null) { var m = b - a; if (t === 'ot' && m < 0) m += 1440; o.mins = m; } }
  if (t === 'loan') { var am = +d.amount || 0, k = +d.months || 0; if (am > 0 && k > 0) { o.inst = Math.round(am / k * 100) / 100; if (d.start) o.end = ymAdd(d.start, k - 1); } }
  if (t === 'resume' && d.link && d.day) { var r = reqByNo(d.link), to = r && r.data ? pdate(r.data.to) : null, dy = pdate(d.day);
    if (to && dy) { var late = 0, x = new Date(to.getTime() + DAY), we = SITE && SITE.work && Array.isArray(SITE.work.weekend) ? SITE.work.weekend : [5, 6]; for (; x < dy; x = new Date(x.getTime() + DAY)) if (we.indexOf(x.getDay()) < 0) late++; o.late = late; o.before = dy < to; } }
  if (t === 'train' && d.from && d.to) { var f1 = pdate(d.from), f2 = pdate(d.to); if (f1 && f2 && f2 >= f1) o.days = Math.round((f2 - f1) / DAY) + 1; }
  return o;
}
function rwExtra() {
  var c = rwCalc(), t = RW.type;
  if ((t === 'perm' || t === 'ot') && c.mins != null) return c.mins > 0 ? '<div class="note">' + ic('clock') + '<span>المدة <b>' + hm(c.mins) + '</b>' + (t === 'perm' && c.mins > 300 ? ' — أطول من المسموح (5 ساعات)؛ قدّم طلب إجازة بدلًا منه.' : t === 'perm' ? '. يبرّر الاستئذان المعتمد التأخير أو الخروج في كشف الحضور.' : '. تُحتسب الساعة الإضافية بأجر الساعة × 1.5.') + '</span></div>' : '<div class="note warn">' + ic('alert') + '<span>وقت النهاية يجب أن يكون بعد وقت البداية.</span></div>';
  if (t === 'loan' && c.inst) return '<div class="note">' + ic('coins') + '<span>القسط الشهري <b>' + n(c.inst) + ' ر.س</b>' + (c.end ? ' من ' + fmonth(RW.d.start) + ' حتى ' + fmonth(c.end) : '') + '. تظهر الأقساط في استقطاعات الرواتب كل شهر.</span></div>';
  if (t === 'resume' && c.late != null) return c.before ? '<div class="note warn">' + ic('alert') + '<span>تاريخ المباشرة قبل نهاية الإجازة أو المهمة المرتبطة.</span></div>' : '<div class="note' + (c.late ? ' warn' : '') + '">' + ic(c.late ? 'alert' : 'check') + '<span>' + (c.late ? 'تأخرت عن العودة <b>' + dn(c.late) + '</b> عمل، تُخصم من رصيدك السنوي بعد الاعتماد.' : 'عدت في موعدك. شكرًا لك.') + '</span></div>';
  if (t === 'train' && c.days) return '<div class="note">' + ic('calendar') + '<span>مدة البرنامج <b>' + dn(c.days) + '</b></span></div>';
  return '';
}
function rwExtraTxt() { var c = rwCalc(), t = RW.type; return (t === 'perm' || t === 'ot') && c.mins > 0 ? '، ' + hm(c.mins) : t === 'loan' && c.inst ? '، قسط ' + n(c.inst) + ' ر.س' : t === 'resume' && c.late ? '، تأخر ' + dn(c.late) : ''; }
function rwSchemaCheck() {
  var d = RW.d, F = rwFields(), c = rwCalc();
  for (var i = 0; i < F.length; i++) { var f = F[i], v = d[f[0]];
    if (f[3] && (v === '' || v == null)) return (f[2] === 'seg' || f[2] === 'month' || f[2] === 'reqref' ? 'اختر ' : 'اكتب ') + f[1];
    if ((f[2] === 'int' || f[2] === 'money') && v !== '' && v != null && !(f[2] === 'int' ? /^\d+$/ : /^\d+(\.\d{1,2})?$/).test(String(v))) return 'اكتب ' + f[1] + ' بالأرقام فقط' + (f[2] === 'int' ? ' (عدد صحيح)' : '');
    if ((f[2] === 'int' || f[2] === 'money') && v !== '' && v != null && f[4] && (+v < f[4][0] || +v > f[4][1])) return f[1] + ': القيمة بين ' + n(f[4][0]) + ' و' + n(f[4][1]);
    if (f[2] === 'area' && f[3] && String(v || '').trim().length < (f[4] ? f[4][0] : 3)) return 'اكتب ' + f[1] + ' (' + (f[4] ? f[4][0] : 3) + ' أحرف على الأقل)'; }
  if ((RW.type === 'perm' || RW.type === 'ot') && !(c.mins > 0)) return 'وقت النهاية يجب أن يكون بعد وقت البداية';
  if (RW.type === 'perm' && c.mins > 300) return 'الاستئذان خمس ساعات على الأكثر؛ للمدة الأطول قدّم طلب إجازة';
  if (RW.type === 'resume' && d.kind !== 'تعيين جديد' && !d.link) return 'اختر الإجازة أو المهمة التي عدت منها';
  if (RW.type === 'resume' && c.before) return 'تاريخ المباشرة قبل نهاية الإجازة أو المهمة المرتبطة';
  var today = ymd(new Date()), ago45 = ymd(new Date(Date.now() - 45 * DAY)), we2 = SITE && SITE.work && Array.isArray(SITE.work.weekend) ? SITE.work.weekend : [5, 6];
  if ((RW.type === 'perm' || RW.type === 'ot') && d.day && d.day < ago45) return 'التاريخ أقدم من 45 يومًا؛ تواصل مع الموارد البشرية';
  if (RW.type === 'perm' && d.day && we2.indexOf(pdate(d.day).getDay()) > -1) return 'هذا اليوم عطلة نهاية أسبوع؛ لا يلزم استئذان';
  if (RW.type === 'ot' && c.mins > 720) return 'العمل الإضافي 12 ساعة على الأكثر في اليوم';
  if (RW.type === 'resume' && d.day && d.day > today) return 'تاريخ المباشرة لا يكون في المستقبل؛ قدّم الإشعار يوم مباشرتك أو بعده';
  if (RW.type === 'resign' && d.lastDay && d.lastDay < today) return 'آخر يوم عمل لا يكون في الماضي';
  if (RW.type === 'hire' && d.needBy && d.needBy < today) return 'تاريخ الاحتياج لا يكون في الماضي';
  for (var j = 0; j < F.length; j++) { var g = F[j], gv = d[g[0]]; if ((g[2] === 'text') && g[3] && g[4] && String(gv || '').trim().length < g[4][0]) return 'اكتب ' + g[1] + ' (' + g[4][0] + ' أحرف على الأقل)'; }
  if (RW.type === 'train' && d.from && d.to && !c.days) return 'تاريخ النهاية يجب أن يكون في يوم البداية أو بعده';
  if (rwNeedSup() && !d.supervisor) return 'اختر المسؤول المباشر';
  return '';
}

/* ---------- الرواتب: مستحقات واستقطاعات الشهر ---------- */
ALIAS.paymonth = ['payroll', null, 'month'];
var PM = { month: '' };
var _payroll0 = VIEWS.payroll;
VIEWS.payroll = function () { return PAYF === 'month' ? payMonthHTML() : _payroll0(); };
function payMonthHTML() {
  var ym = PM.month || ymNow(), c = need('pay:' + ym, function () { return api({ action: 'payMonth', month: ym }); }, 60000), d = c.data;
  var head = ptitle('مستحقات واستقطاعات الشهر', 'ما يُضاف إلى راتب كل منسوب أو يُخصم منه هذا الشهر، من المعتمد فقط: العمل الإضافي وأقساط السلف وجزاءات الحسم. راجعها قبل إعداد مسير الرواتب.', '<a class="btn" href="#payroll">' + ic('wallet') + 'كشف الرواتب</a>');
  if (!d) return head + '<section class="pn"><div class="pb"><div class="empty">' + (c.err ? esc(c.err) : 'جارٍ التحميل…') + '</div></div></section>';
  var rows = d.rows, ot = rows.filter(function (r) { return r.otHours > 0; }), ln = rows.filter(function (r) { return r.loans.length; });
  var sumC = function (k) { var o = {}; rows.forEach(function (r) { if (r[k]) o[r.cur] = (o[r.cur] || 0) + r[k]; }); return Object.keys(o).map(function (c2) { return n(o[c2]) + ' <small>' + c2 + '</small>'; }).join(' · ') || '0'; };
  var bar = '<section class="pn tbar"><div class="fbar">' + ssel('pmm', d.months.map(function (m) { return { v: m, n: fmonth(m), ic: 'calendar', d: m === ymNow() ? 'الشهر الحالي' : '' }; }), ym, fmonth(ym), function (v) { PM.month = v; render(); }, 'الشهر', 'الشهر') + '</div></section>';
  var kp = '<div class="grid g4">' + kpi('sapphire', 'timer', ot.reduce(function (a, r) { return a + r.otHours; }, 0), 'ساعة', 'عمل إضافي معتمد', nq(ot.length, 'منسوب واحد', 'منسوبان', 'منسوبين', 'منسوبًا'), '') +
    kpi('emerald', 'wallet', sumC('otAmount'), '', 'مستحقات الإضافي', 'تقديرية حسب الراتب المسجّل', '') +
    kpi('garnet', 'coins', ln.reduce(function (a, r) { return a + r.loans.length; }, 0), 'قسط', 'أقساط سلف هذا الشهر', nq(ln.length, 'منسوب واحد', 'منسوبان', 'منسوبين', 'منسوبًا'), '') +
    kpi('gold', 'chart', sumC('deduct'), '', 'إجمالي الاستقطاع', 'يُخصم من رواتب الشهر', '') + '</div>';
  var tb = rows.length ? '<div class="tw"><table class="pmtab"><thead><tr><th>المنسوب</th><th class="num">ساعات إضافية</th><th class="num">مستحق الإضافي</th><th>السلف والجزاءات</th><th class="num">الاستقطاع</th><th class="num">الصافي</th></tr></thead><tbody>' +
    rows.map(function (r) { var s = byRef(r.ref);
      return '<tr class="click" data-open="' + esc(r.ref) + '"><td><div class="person">' + (s ? av(s) : tile('slate', 'user')) + '<div><b>' + esc(r.name) + '</b><span>' + esc(r.entity || '') + '</span></div></div></td>' +
        '<td class="num">' + (r.otHours ? '<b>' + r.otHours + '</b>' + (r.otWeekend ? ' <small>منها ' + r.otWeekend + ' في عطلة</small>' : '') + '<small class="dn2 ltr">' + r.otNos.map(esc).join(' · ') + '</small>' : '—') + '</td>' +
        '<td class="num">' + (r.otHours ? (r.noSalary ? '<span class="pill warn"><i></i>لا راتب مسجّل</span>' : n(r.otAmount) + ' <small>' + r.cur + '</small><small class="dn2">أجر الساعة ' + r.hourly + '</small>') : '—') + '</td>' +
        '<td>' + (r.loans.length || (r.pens || []).length ? r.loans.map(function (l) { return '<div class="pmln"><span class="ltr">' + esc(l.no) + '</span> سلفة: القسط ' + l.k + ' من ' + l.n + ' (' + n(l.inst) + ')<small> · المتبقي بعده ' + n(l.left) + '</small></div>'; }).join('') +
          (r.pens || []).map(function (x) { return '<div class="pmln"><span class="ltr">' + esc(x.no) + '</span> جزاء: حسم ' + dn(x.days) + ' (' + n(x.amount) + ')</div>'; }).join('') : '—') + '</td>' +
        '<td class="num">' + (r.deduct ? '<b class="tbad">' + n(r.deduct) + '</b> <small>' + r.cur + '</small>' : '—') + '</td>' +
        '<td class="num"><b class="' + (r.net < 0 ? 'tbad' : 'tok') + '">' + (r.net > 0 ? '+' : '') + n(r.net) + '</b> <small>' + r.cur + '</small></td></tr>'; }).join('') + '</tbody></table></div>'
    : '<div class="emptyx">' + tile('gold', 'wallet') + '<b>لا مستحقات ولا استقطاعات في ' + fmonth(ym) + '</b><p>تظهر هنا تلقائيًا ساعات العمل الإضافي المعتمدة وأقساط السلف المعتمدة لهذا الشهر.</p></div>';
  return head + bar + kp + pn('gold', 'coins', fmonth(ym), rows.length ? rows.length + ' منسوبًا' : '', '', '<div class="pb">' + tb + '<p class="fhint" style="margin-top:10px">' + ic('info') + ' ' + esc(d.rule) + '. المبالغ تقديرية للمراجعة، والمعتمد ما في مسير الرواتب.</p></div>');
}

/* ======================================================================
   أدوات مشتركة: نافذة منبثقة بنمط المنصة
   ====================================================================== */
P.box = '<path d="M21 8 12 3 3 8v8l9 5 9-5V8ZM3 8l9 5 9-5M12 13v8M7.5 5.5l9 5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>';
P.medal = '<path d="M8 3h8l-2 6h-4L8 3ZM12 9a6 6 0 1 0 0 12 6 6 0 0 0 0-12Zm0 3 1.2 2.3 2.5.4-1.8 1.8.4 2.5-2.3-1.2-2.3 1.2.4-2.5-1.8-1.8 2.5-.4L12 12Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>';
P.swap = '<path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>';
P.up = '<path d="M12 20V5M5.5 11.5 12 5l6.5 6.5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>';
function layer(id, head, body, foot, cls) {
  var old = document.getElementById(id); if (old) old.remove();
  var el = document.createElement('div'); el.id = id;
  el.innerHTML = '<div class="mscrim" data-lyclose="1"></div><section class="mdl ' + (cls || '') + '" role="dialog" aria-modal="true" aria-labelledby="' + id + 'T"><header class="mh">' + head.tile + '<div><h2 id="' + id + 'T">' + head.t + '</h2>' + (head.p ? '<p>' + head.p + '</p>' : '') + '</div>' + (head.end || '') + '<button class="ib mx" data-lyclose="1" aria-label="إغلاق">' + ic('plus') + '</button></header>' +
    '<div class="abody">' + body + '</div>' + (foot ? '<footer class="mf">' + foot + '</footer>' : '') + '</section>';
  document.body.appendChild(el); document.body.classList.add('no-scroll');
  var close = function () { el.remove(); if (!document.querySelector('.mdl')) document.body.classList.remove('no-scroll'); document.removeEventListener('keydown', esc1); };
  var esc1 = function (e) { if (e.key === 'Escape' && !document.querySelector('.ss-pop')) close(); };
  document.addEventListener('keydown', esc1);
  el.querySelectorAll('[data-lyclose]').forEach(function (b) { b.onclick = close; });
  el.close = close; return el;
}
function staffOpts() { return STAFF.map(function (s) { return { v: s.ref, n: s.name, d: s.ref + ' · ' + s.ent.n + (s.job ? ' · ' + s.job : ''), c: s.ent.c }; }); }
function fldH(id, lab, html, req, wide) { return '<div class="fld' + (wide ? ' wide' : '') + '"><label for="' + id + '">' + lab + (req ? ' <i class="rq">*</i>' : '') + '</label>' + html + '</div>'; }
function segH(name, opts, val) { return '<div class="seg2" role="group">' + opts.map(function (o) { return '<button type="button" data-seg="' + name + '" data-v="' + esc(o) + '" aria-pressed="' + (val === o) + '">' + esc(o) + '</button>'; }).join('') + '</div>'; }
function bindSeg(el, st, redraw) { el.querySelectorAll('[data-seg]').forEach(function (b) { b.onclick = function () { st[b.dataset.seg] = b.dataset.v; if (redraw) redraw(); else el.querySelectorAll('[data-seg="' + b.dataset.seg + '"]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); }; }); }
/* ورقة رسمية بترويسة بنيان (للقرارات والخطابات) */
function sheetH(o) {
  var kv = function (a) { return '<div class="srow">' + a.map(function (x) { return '<div class="sf"><span>' + x[0] + '</span><b>' + (x[1] === '' || x[1] == null ? '—' : esc(x[1])) + '</b></div>'; }).join('') + '</div>'; };
  var groups = []; (o.rows || []).forEach(function (x, i) { if (i % 3 === 0) groups.push([]); groups[groups.length - 1].push(x); });
  return '<div class="sheet" id="hrSheet"><div class="shead"><div class="sorg"><span class="seal"><img src="' + LOGO + '" alt=""></span><div><b>مجموعة بنيان العالمية</b><small>Bonyan International Group</small><em>إدارة الموارد البشرية</em></div></div><div class="smeta">' + esc(o.metaL || 'رقم القرار') + '<b>' + esc(o.no) + '</b><span>التاريخ</span><b>' + esc(o.date || '') + '</b></div></div>' +
    '<div class="stitle"><h3>' + esc(o.title) + '</h3>' + (o.sub ? '<p>' + esc(o.sub) + '</p>' : '') + '</div>' +
    '<div class="sbar">بيانات المنسوب</div>' + kv(o.who) + (groups.length ? '<div class="sbar">' + esc(o.detT || 'التفاصيل') + '</div>' + groups.map(kv).join('') : '') + (o.text ? '<div class="snote">' + esc(o.text) + '</div>' : '') +
    (o.sign ? '<div class="sbar">الاعتماد</div><div class="ssign">' + o.sign.map(function (x) { return '<div><span>' + esc(x[0]) + '</span><b>' + esc(x[1] || '') + '</b><small>' + esc(x[2] || '') + '</small></div>'; }).join('') + '</div>' : '') +
    '<div class="sfoot"><span>hr.bonyanglobal.com</span><span>' + esc(o.no) + '</span><span>' + esc(o.foot || '') + '</span></div></div>';
}
function printSheet() { document.body.classList.add('print-sheet'); window.print(); setTimeout(function () { document.body.classList.remove('print-sheet'); }, 500); }

/* ======================================================================
   الإجراءات الإدارية (لفت نظر، إنذار، مخالفة، شكر، ترقية، نقل، علاوة، إنهاء خدمة)
   ====================================================================== */
TITLES.hract = ['الإجراءات الإدارية']; TITLES.custody = ['العهد']; TITLES.myhr = ['سجلي الوظيفي'];
STAFF_VIEWS.push('myhr');
var AK = { notice: ['slate', 'info', 'لفت نظر', 'تنبيه مكتوب على ملاحظة في الأداء أو السلوك'], warning: ['garnet', 'alert', 'إنذار', 'أول أو ثانٍ أو نهائي'], violation: ['garnet', 'stamp', 'مخالفة وجزاء', 'بحسم من الأجر عند الحاجة'],
  thanks: ['emerald', 'medal', 'شكر وتقدير', 'خطاب شكر على إنجاز'], promotion: ['gold', 'up', 'ترقية', 'مسمى أو مرتبة جديدة'], transfer: ['sapphire', 'swap', 'نقل', 'إلى جهة أو إدارة أخرى'],
  raise: ['emerald', 'coins', 'علاوة', 'تعديل الراتب الشهري'], termination: ['slate', 'out', 'إنهاء خدمة', 'ثم إخلاء الطرف'] };
var AST = { pending: ['warn', 'بانتظار الإدارة العليا'], issued: ['ok', 'صادر'], rejected: ['bad', 'لم يُعتمد'], void: ['mute', 'ملغى'] };
var AF = { q: '', kind: '', st: '' };
function actData() { return need('acts', function () { return api({ action: 'actList' }); }, 60000); }
function actRowH(a, staffSide) {
  var K = AK[a.kind] || ['slate', 'doc', a.kindName], st = AST[a.status] || ['mute', a.statusName];
  var pill = a.status === 'issued' ? (a.ackAt ? '<span class="pill ok"><i></i>اطّلع ' + esc(agoD(pdt(a.ackAt))) + '</span>' : '<span class="pill warn"><i></i>' + (staffSide ? 'بانتظار اطلاعك' : 'لم يطّلع بعد') + '</span>') : '<span class="pill ' + st[0] + '"><i></i>' + st[1] + '</span>';
  return '<li><button type="button" class="rqrow" data-act-open="' + a.id + '">' + tile(K[0], K[1]) + '<div class="rqm"><b>' + esc(staffSide ? a.sum : a.name) + '</b><span class="s"><span class="ltr">' + esc(a.no) + '</span> · ' + esc(staffSide ? K[2] : a.sum) + ' · نافذ ' + fdx(pdate(a.data.effective), { day: 'numeric', month: 'short', year: 'numeric' }) + '</span></div>' + pill + '</button></li>';
}
VIEWS.hract = function () {
  var c = actData(), d = c.data;
  var head = ptitle('الإجراءات الإدارية', 'ما يصدر على ملف المنسوب: لفت النظر والإنذارات والمخالفات وخطابات الشكر، والترقيات والنقل والعلاوات وإنهاء الخدمة. ما يغيّر الملف أو الراتب يعتمده أحد الإدارة العليا قبل تطبيقه، ويؤكد المنسوب اطلاعه من صفحته.', d && d.canIssue ? '<button class="btn goldb" id="actNew">' + ic('plus') + 'إجراء جديد</button>' : '');
  if (!d) return head + '<section class="pn"><div class="pb"><div class="empty">' + (c.err ? esc(c.err) : 'جارٍ التحميل…') + '</div></div></section>';
  var all = d.rows, y = String(new Date().getFullYear()), q = AF.q.trim().toLowerCase();
  var pend = all.filter(function (a) { return a.status === 'pending'; }), noack = all.filter(function (a) { return a.status === 'issued' && !a.ackAt; });
  var list = all.filter(function (a) { return (!AF.kind || a.kind === AF.kind) && (!AF.st || (AF.st === 'noack' ? a.status === 'issued' && !a.ackAt : a.status === AF.st)) && (!q || (a.no + ' ' + a.name + ' ' + a.ref + ' ' + a.sum).toLowerCase().indexOf(q) >= 0); });
  var cnt = function (f) { return all.filter(f).length; };
  var kp = '<div class="grid g4">' + kpi('gold', 'stamp', pend.length, '', 'بانتظار الإدارة العليا', d.canDecide ? 'تعتمدها أنت' : 'يعتمدها المدير العام', '') +
    kpi('garnet', 'alert', cnt(function (a) { return a.status === 'issued' && ['notice', 'warning', 'violation'].indexOf(a.kind) > -1 && a.createdAt.slice(0, 4) === y; }), '', 'تنبيهات وإنذارات ' + y, 'لفت نظر وإنذار ومخالفة', '') +
    kpi('emerald', 'medal', cnt(function (a) { return a.status === 'issued' && ['thanks', 'promotion', 'raise'].indexOf(a.kind) > -1 && a.createdAt.slice(0, 4) === y; }), '', 'شكر وترقيات وعلاوات ' + y, '', '') +
    kpi('sapphire', 'eye', noack.length, '', 'لم يطّلع عليها المنسوب', 'تصله بالبريد وفي صفحته', '') + '</div>';
  var bar = '<section class="pn tbar"><div class="fbar">' + fsearch('afq', AF.q, 'ابحث برقم الإجراء أو اسم المنسوب', 'بحث في الإجراءات') +
    ssel('afk', [{ v: '', n: 'كل الأنواع', ic: 'doc' }].concat(Object.keys(AK).map(function (k) { return { v: k, n: AK[k][2], ic: AK[k][1], k: cnt(function (a) { return a.kind === k; }) }; })), AF.kind, 'كل الأنواع', function (v) { AF.kind = v; render(); }, 'نوع الإجراء', 'النوع') +
    ssel('afs', [{ v: '', n: 'كل الحالات', ic: 'stamp' }, { v: 'pending', n: 'بانتظار الإدارة العليا', k: pend.length }, { v: 'noack', n: 'لم يطّلع عليها المنسوب', k: noack.length }, { v: 'issued', n: 'صادر', k: cnt(function (a) { return a.status === 'issued'; }) }, { v: 'rejected', n: 'لم يُعتمد' }, { v: 'void', n: 'ملغى' }], AF.st, 'كل الحالات', function (v) { AF.st = v; render(); }, 'الحالة', 'الحالة') + '</div></section>';
  return head + kp + bar + pn('garnet', 'stamp', 'سجل الإجراءات', list.length + ' إجراءً', '', '<div class="pb">' + (list.length ? '<ul class="rqlist">' + list.map(function (a) { return actRowH(a, false); }).join('') + '</ul>' : '<div class="emptyx">' + tile('garnet', 'stamp') + '<b>لا إجراءات ' + (all.length ? 'في هذه التصفية' : 'بعد') + '</b><p>يصدر الإجراء من زر «إجراء جديد»، ويصل المنسوب بريد ليطّلع عليه في صفحته.</p></div>') + '</div>');
};
function actOpen(id, staffSide) {
  var d = actData().data, a = d && d.rows.filter(function (x) { return x.id === +id; })[0]; if (!a) return;
  var K = AK[a.kind] || ['slate', 'doc', a.kindName], x = a.data || {}, rows = [['نوع الإجراء', a.kindName + (x.degree ? ' ' + x.degree : '')], ['تاريخ النفاذ', fdx(pdate(x.effective))]];
  if (a.kind === 'violation') rows.push(['تاريخ المخالفة', fdx(pdate(x.vdate))], ['الجزاء', x.deduct ? 'حسم أجر ' + dn(+x.deduct) : 'دون حسم']);
  if (a.kind === 'promotion') rows.push(['المسمى السابق', x.oldTitle], ['المسمى الجديد', x.newTitle], ['المرتبة الجديدة', x.newGrade]);
  if (a.kind === 'transfer') rows.push(['من', [x.oldEntity, x.oldDepartment].filter(Boolean).join(' · ')], ['إلى', [x.newEntity || x.oldEntity, x.newDepartment].filter(Boolean).join(' · ')], ['المدير الجديد', x.newManager]);
  if (a.kind === 'raise' && !staffSide || a.kind === 'raise' && staffSide) rows.push(['الراتب السابق', x.oldSalary ? n(x.oldSalary) + ' ' + (x.cur || '') : ''], ['الراتب الجديد', n(+x.newSalary || 0) + ' ' + (x.cur || '')]);
  if (a.kind === 'termination') rows.push(['آخر يوم عمل', fdx(pdate(x.lastDay))], ['السبب', x.reason]);
  var sign = [['أصدره', a.createdBy, a.createdAt]]; if (a.decidedBy) sign.push([a.status === 'rejected' ? 'لم يعتمده' : 'اعتمده', a.decidedBy, a.decidedAt]); sign.push(['اطّلع المنسوب', a.ackAt ? a.name : '', a.ackAt || 'لم يطّلع بعد']);
  var sh = sheetH({ no: a.no, date: fdx(pdt(a.createdAt)), title: x.title || a.kindName, sub: (AST[a.status] || [0, ''])[1], who: [['الاسم', a.name], ['الرقم المرجعي', a.ref], ['الجهة', a.entity], ['المسمى', a.jobTitle]], rows: rows, detT: 'القرار', text: x.details + (x.decisionNote ? '\n\nملاحظة الاعتماد: ' + x.decisionNote : '') + (x.voidNote ? '\n\nسبب الإلغاء: ' + x.voidNote : '') + (a.ackNote ? '\n\nملاحظة المنسوب: ' + a.ackNote : ''), sign: sign, foot: a.kindName });
  var top = !staffSide && d.canDecide && a.status === 'pending', mine = staffSide && a.status === 'issued' && !a.ackAt;
  var foot = (top ? '<div class="rqdec"><textarea id="axNote" rows="2" maxlength="600" placeholder="ملاحظة (إلزامية عند عدم الاعتماد)"></textarea><div class="lerr" id="axErr" role="alert"></div></div><button class="btn" data-axd="reject">' + ic('alert') + 'عدم الاعتماد</button><button class="btn goldb" data-axd="approve">' + ic('check') + 'اعتماد وتطبيق</button>' : '') +
    (mine ? '<div class="rqdec"><textarea id="axNote" rows="2" maxlength="600" placeholder="ملاحظتك (اختيارية)"></textarea><div class="lerr" id="axErr" role="alert"></div></div><button class="btn goldb" id="axAck">' + ic('eye') + 'اطّلعت على الإجراء</button>' : '') +
    (!top && !mine ? '<span class="sp"></span>' : '') + (!staffSide && SESSION && SESSION.role === 'admin' && (a.status === 'pending' || a.status === 'issued') ? '<button class="btn rqdel" id="axVoid">' + ic('x') + 'إلغاء الإجراء</button>' : '') + '<button class="btn" id="axPrint">' + ic('dl') + 'طباعة أو حفظ PDF</button>';
  var el = layer('actLayer', { tile: tile(K[0], K[1]), t: esc(a.kindName) + ' <span class="ltr ref">' + esc(a.no) + '</span>', p: esc(a.name), end: '<span class="pill ' + (AST[a.status] || ['mute'])[0] + '"><i></i>' + esc((AST[a.status] || [0, a.statusName])[1]) + '</span>' }, '<div class="rqbody">' + sh + '</div>', foot, 'rqm2');
  el.querySelector('#axPrint').onclick = printSheet;
  var upd = function (j, msg) { var c2 = actData().data; if (c2) c2.rows = c2.rows.map(function (r) { return r.id === j.row.id ? j.row : r; }); delete CACHE.audit; el.close(); softRender(); toast(msg); };
  el.querySelectorAll('[data-axd]').forEach(function (b) { b.onclick = function () { var ok = b.dataset.axd === 'approve', note = el.querySelector('#axNote').value.trim(); if (!ok && note.length < 3) { el.querySelector('#axErr').textContent = 'اكتب سبب عدم الاعتماد.'; return; } b.disabled = true;
    api({ action: 'actDecide', id: a.id, decision: b.dataset.axd, note: note }).then(function (j) { upd(j, ok ? 'اعتُمد الإجراء وطُبّق على الملف، ووصل المنسوب بريد' : 'لم يُعتمد الإجراء'); }).catch(function (e) { b.disabled = false; el.querySelector('#axErr').textContent = errText(e); }); }; });
  var ak = el.querySelector('#axAck'); if (ak) ak.onclick = function () { ak.disabled = true; api({ action: 'actAck', id: a.id, note: el.querySelector('#axNote').value.trim() }).then(function (j) { upd(j, 'سُجّل اطلاعك. شكرًا لك'); }).catch(function (e) { ak.disabled = false; el.querySelector('#axErr').textContent = errText(e); }); };
  var vd = el.querySelector('#axVoid'); if (vd) vd.onclick = function () {
    if (vd.dataset.sure !== '1') { vd.dataset.sure = '1'; vd.classList.add('sure'); vd.innerHTML = ic('x') + 'اكتب السبب ثم أكّد'; var t = el.querySelector('#axNote'); if (!t) { el.querySelector('.mf').insertAdjacentHTML('afterbegin', '<div class="rqdec"><textarea id="axNote" rows="2" maxlength="600" placeholder="سبب الإلغاء"></textarea><div class="lerr" id="axErr" role="alert"></div></div>'); } el.querySelector('#axNote').focus(); return; }
    var nt = el.querySelector('#axNote').value.trim(); if (nt.length < 3) { el.querySelector('#axErr').textContent = 'اكتب سبب الإلغاء.'; return; } vd.disabled = true;
    api({ action: 'actVoid', id: a.id, note: nt }).then(function (j) { upd(j, 'أُلغي الإجراء'); }).catch(function (e) { vd.disabled = false; el.querySelector('#axErr').textContent = errText(e); });
  };
}
var AN = null;
function actNew(ref) {
  AN = { ref: ref || '', kind: '', d: { effective: ymd(new Date()) }, err: '', busy: false }; drawAN();
}
function ymd(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
function drawAN() {
  var k = AN.kind, d = AN.d, s = AN.ref ? byRef(AN.ref) : null, kinds = (actData().data || {}).kinds || {};
  var inp = function (key, type, ph, extra) { return '<input id="an_' + key + '" data-an="' + key + '" type="' + (type || 'text') + '" value="' + esc(d[key] == null ? '' : d[key]) + '"' + (ph ? ' placeholder="' + esc(ph) + '"' : '') + (extra || '') + '>'; };
  var f = '';
  if (k === 'warning') f += fldH('w', 'درجة الإنذار', segH('degree', ['أول', 'ثانٍ', 'نهائي'], d.degree), true, true);
  if (k === 'violation') f += fldH('an_vdate', 'تاريخ المخالفة', inp('vdate', 'date'), true) + fldH('an_deduct', 'الجزاء: حسم من الأجر (أيام)', inp('deduct', 'number', '0', ' min="0" max="5" dir="ltr"'), false);
  if (k === 'promotion') f += fldH('an_newTitle', 'المسمى الوظيفي الجديد', inp('newTitle', 'text', s ? 'الحالي: ' + (s.job || '—') : ''), true) + fldH('an_newGrade', 'المرتبة أو الدرجة الجديدة', inp('newGrade', 'text', 'اختياري'));
  if (k === 'transfer') f += fldH('an_newEntity', 'الجهة الجديدة', inp('newEntity', 'text', s ? 'الحالية: ' + s.ent.n : '')) + fldH('an_newDepartment', 'الإدارة الجديدة', inp('newDepartment', 'text', 'اختياري')) + fldH('an_newManager', 'المدير المباشر الجديد', inp('newManager', 'text', 'اختياري'));
  if (k === 'raise') f += fldH('an_newSalary', 'الراتب الشهري الجديد' + (s ? ' (' + s.cur + ')' : ''), inp('newSalary', 'number', s && s.base ? 'الحالي: ' + n(s.base) : '', ' min="0" dir="ltr"'), true);
  if (k === 'termination') f += fldH('an_lastDay', 'آخر يوم عمل', inp('lastDay', 'date'), true) + fldH('r', 'السبب', segH('reason', ['انتهاء العقد', 'عدم اجتياز فترة التجربة', 'فصل لمخالفة جسيمة', 'إعادة هيكلة', 'أخرى'], d.reason), true, true);
  var body = '<div class="form">' + fldH('anRef', 'المنسوب', ssel('anRef', staffOpts(), AN.ref, 'اختر المنسوب', function (v) { syncAN(); AN.ref = v; drawAN(); }, 'المنسوب'), true, true) +
    '<div class="fld wide"><label>نوع الإجراء <i class="rq">*</i></label><div class="ccards sm" role="radiogroup">' + Object.keys(AK).map(function (x) { return '<button type="button" class="ccard" role="radio" data-ank="' + x + '" aria-checked="' + (k === x) + '">' + tile(AK[x][0], AK[x][1], 'ti') + '<b>' + AK[x][2] + '</b><small>' + AK[x][3] + '</small>' + (kinds[x] && kinds[x].approve ? '<em class="needap">يعتمده المدير العام</em>' : '') + '</button>'; }).join('') + '</div></div>' +
    (k ? fldH('an_title', 'الموضوع', inp('title', 'text', 'يُكتب تلقائيًا إن تُرك فارغًا')) + fldH('an_effective', 'تاريخ النفاذ', inp('effective', 'date'), true) + f +
      fldH('an_details', k === 'thanks' ? 'نص الشكر' : 'التفاصيل والمسوّغ', '<textarea id="an_details" data-an="details" maxlength="3000" placeholder="' + (k === 'thanks' ? 'مثال: تقديرًا لجهودكم المتميزة في…' : 'الوقائع والمسوّغ النظامي، أو ما يلزم المنسوب') + '">' + esc(d.details || '') + '</textarea>', true, true) : '') + '</div>' +
    (k && kinds[k] && kinds[k].approve ? '<div class="note">' + ic('info') + '<span>هذا الإجراء يُرسل أولًا لاعتماد الإدارة العليا، ثم يُطبَّق على ملف المنسوب' + (k === 'raise' ? ' (الراتب)' : k === 'promotion' ? ' (المسمى والمرتبة)' : k === 'transfer' ? ' (الجهة والإدارة والمدير)' : '') + ' ويصله بريد.</span></div>' : k ? '<div class="note">' + ic('mail') + '<span>يصدر مباشرة، ويصل المنسوب بريد ليطّلع عليه ويؤكد اطلاعه من صفحته.</span></div>' : '');
  var el = layer('anLayer', { tile: tile('garnet', 'stamp'), t: 'إجراء إداري جديد', p: 'يُحفظ في ملف المنسوب وسجل العمليات' }, body, '<div class="lerr" role="alert">' + esc(AN.err) + '</div><button class="btn" data-lyclose="1">إلغاء</button><button class="btn goldb" id="anSave"' + (AN.busy || !k ? ' disabled' : '') + '>' + ic('check') + (AN.busy ? 'جارٍ الحفظ…' : (kinds[k] && kinds[k].approve ? 'إرسال للاعتماد' : 'إصدار الإجراء')) + '</button>', 'anm');
  el.querySelectorAll('[data-lyclose]').forEach(function (b) { b.onclick = function () { el.close(); AN = null; }; });
  el.querySelectorAll('[data-ank]').forEach(function (b) { b.onclick = function () { syncAN(); AN.kind = b.dataset.ank; AN.err = ''; drawAN(); }; });
  bindSeg(el, AN.d, function () { syncAN(); drawAN(); });
  if (window.FancySelect && FancySelect.scan) try { FancySelect.scan(el); } catch (e) { }
  var sv = el.querySelector('#anSave'); if (sv) sv.onclick = function () {
    syncAN(); if (!AN.ref) { AN.err = 'اختر المنسوب'; drawAN(); return; } if (String(AN.d.details || '').trim().length < 5) { AN.err = 'اكتب التفاصيل والمسوّغ'; drawAN(); return; }
    AN.busy = true; drawAN();
    api({ action: 'actSave', ref: AN.ref, kind: AN.kind, data: AN.d }).then(function (j) { var c2 = actData().data; if (c2) c2.rows.unshift(j.row); delete CACHE.audit; var L = document.getElementById('anLayer'); if (L) L.close(); AN = null; render(); toast(j.row.status === 'pending' ? 'أُرسل الإجراء ' + j.row.no + ' لاعتماد الإدارة العليا' : 'صدر الإجراء ' + j.row.no + ' ووصل المنسوب بريد'); })
      .catch(function (e) { AN.busy = false; AN.err = errText(e); drawAN(); });
  };
}
function syncAN() { var el = document.getElementById('anLayer'); if (!el || !AN) return; el.querySelectorAll('[data-an]').forEach(function (x) { AN.d[x.dataset.an] = x.value; }); }

/* ======================================================================
   العهد: ما يُسلَّم للمنسوب ويُسترد منه، وشرط لإخلاء الطرف
   ====================================================================== */
var CF = { q: '', st: 'open', cat: '' };
function cusData() { return need('cus', function () { return api({ action: 'cusList' }); }, 60000); }
VIEWS.custody = function () {
  var c = cusData(), d = c.data;
  var head = ptitle('العهد', 'الأجهزة والمفاتيح والسيارات وغيرها مما يُسلَّم للمنسوب. يقرّ المنسوب بالاستلام من صفحته، ولا يكتمل إخلاء الطرف حتى تُسترد كل عهده.', d && d.canEdit ? '<button class="btn goldb" id="cusNew">' + ic('plus') + 'تسليم عهدة</button>' : '');
  if (!d) return head + '<section class="pn"><div class="pb"><div class="empty">' + (c.err ? esc(c.err) : 'جارٍ التحميل…') + '</div></div></section>';
  var all = d.rows, q = CF.q.trim().toLowerCase(), open = all.filter(function (x) { return x.open; });
  var list = all.filter(function (x) { return (CF.st === 'all' || (CF.st === 'open' ? x.open : !x.open)) && (!CF.cat || x.category === CF.cat) && (!q || (x.name + ' ' + x.ref + ' ' + x.item + ' ' + x.serial).toLowerCase().indexOf(q) >= 0); });
  var holders = {}; open.forEach(function (x) { holders[x.ref] = 1; });
  var kp = '<div class="grid g4">' + kpi('teal', 'box', open.length, 'عهدة', 'لدى المنسوبين الآن', nq(Object.keys(holders).length, 'منسوب واحد', 'منسوبان', 'منسوبين', 'منسوبًا'), '') +
    kpi('gold', 'wallet', n(open.reduce(function (a, x) { return a + (x.value || 0); }, 0)), 'ر.س', 'قيمتها المسجّلة', 'لما سُجّلت قيمته', '') +
    kpi('sapphire', 'eye', open.filter(function (x) { return !x.ackAt; }).length, '', 'لم يقرّ المنسوب باستلامها', 'يصله بريد عند التسليم', '') +
    kpi('emerald', 'check', all.length - open.length, '', 'سُلّمت وأُعيدت', '', '') + '</div>';
  var bar = '<section class="pn tbar"><div class="fbar">' + fsearch('cfq', CF.q, 'ابحث بالمنسوب أو العهدة أو الرقم التسلسلي', 'بحث في العهد') +
    ssel('cfs', [{ v: 'open', n: 'لدى المنسوبين', k: open.length, ic: 'box' }, { v: 'back', n: 'أُعيدت', k: all.length - open.length, ic: 'check' }, { v: 'all', n: 'الكل', k: all.length, ic: 'doc' }], CF.st, 'لدى المنسوبين', function (v) { CF.st = v; render(); }, 'الحالة', 'الحالة') +
    ssel('cfc', [{ v: '', n: 'كل الأنواع', ic: 'box' }].concat(d.cats.map(function (x) { return { v: x, n: x }; })), CF.cat, 'كل الأنواع', function (v) { CF.cat = v; render(); }, 'النوع', 'النوع') + '</div></section>';
  var tb = list.length ? '<div class="tw"><table class="cutab"><thead><tr><th>المنسوب</th><th>العهدة</th><th>الرقم التسلسلي</th><th>الاستلام</th><th>الحالة</th>' + (d.canEdit ? '<th></th>' : '') + '</tr></thead><tbody>' + list.map(function (x) { var s = byRef(x.ref);
    return '<tr><td><div class="person">' + (s ? av(s) : tile('slate', 'user')) + '<div><b>' + esc(x.name) + '</b><span>' + esc(x.entity) + '</span></div></div></td><td><b>' + esc(x.item) + '</b><small class="dn2">' + esc(x.category) + (x.value ? ' · ' + n(x.value) + ' ر.س' : '') + '</small></td><td><span class="ltr">' + esc(x.serial || '—') + '</span></td>' +
      '<td>' + fdx(pdate(x.issuedOn), { day: 'numeric', month: 'short', year: 'numeric' }) + '<small class="dn2">' + esc(x.condOut) + (x.ackAt ? ' · أقرّ باستلامها' : ' · لم يقرّ بعد') + '</small></td>' +
      '<td>' + (x.open ? '<span class="pill warn"><i></i>لدى المنسوب</span>' : '<span class="pill ok"><i></i>أُعيدت ' + fdx(pdate(x.returnedOn), { day: 'numeric', month: 'short' }) + '</span><small class="dn2">' + esc(x.condIn) + '</small>') + '</td>' +
      (d.canEdit ? '<td class="acts2">' + (x.open ? '<button class="btn sm" data-cus-ret="' + x.id + '">' + ic('check') + 'استلامها</button><button class="ib" data-cus-ed="' + x.id + '" aria-label="تعديل">' + ic('edit') + '</button>' : '') + '</td>' : '') + '</tr>'; }).join('') + '</tbody></table></div>'
    : '<div class="emptyx">' + tile('teal', 'box') + '<b>' + (all.length ? 'لا عهد في هذه التصفية' : 'لا عهد مسجّلة بعد') + '</b><p>سجّل ما تسلّمه للمنسوب من أجهزة ومفاتيح وغيرها، ليقرّ باستلامه ويُسترد عند انتهاء الخدمة.</p></div>';
  return head + kp + bar + pn('teal', 'box', CF.st === 'open' ? 'العهد لدى المنسوبين' : CF.st === 'back' ? 'العهد المعادة' : 'كل العهد', list.length + ' عهدة', '', '<div class="pb">' + tb + '</div>');
};
function cusForm(x, ref) {
  var C = x ? { id: x.id, ref: x.ref, item: x.item, category: x.category, serial: x.serial, value: x.value == null ? '' : x.value, issuedOn: x.issuedOn, condOut: x.condOut, note: x.note } : { ref: ref || '', item: '', category: '', serial: '', value: '', issuedOn: ymd(new Date()), condOut: 'جديدة', note: '' };
  var cats = (cusData().data || {}).cats || [];
  var draw = function (err) {
    var inp = function (k, type, ph, extra) { return '<input id="cu_' + k + '" data-cu="' + k + '" type="' + (type || 'text') + '" value="' + esc(C[k] == null ? '' : C[k]) + '"' + (ph ? ' placeholder="' + esc(ph) + '"' : '') + (extra || '') + '>'; };
    var el = layer('cuLayer', { tile: tile('teal', 'box'), t: x ? 'تعديل بيانات عهدة' : 'تسليم عهدة لمنسوب', p: 'يصل المنسوب بريد ليقرّ باستلامها' },
      '<div class="form">' + fldH('cuRef', 'المنسوب', ssel('cuRef', staffOpts(), C.ref, 'اختر المنسوب', function (v) { sync(); C.ref = v; draw(); }, 'المنسوب'), true, true) +
      fldH('cu_item', 'وصف العهدة', inp('item', 'text', 'مثال: حاسب محمول Dell Latitude 5440'), true, true) + fldH('c', 'النوع', segH('category', cats, C.category), true, true) +
      fldH('cu_serial', 'الرقم التسلسلي', inp('serial', 'text', 'اختياري', ' dir="ltr"')) + fldH('cu_value', 'القيمة التقديرية (ر.س)', inp('value', 'number', 'اختياري', ' min="0" dir="ltr"')) +
      fldH('cu_issuedOn', 'تاريخ التسليم', inp('issuedOn', 'date'), true) + fldH('o', 'حالتها عند التسليم', segH('condOut', ['جديدة', 'مستعملة بحالة جيدة', 'تحتاج صيانة'], C.condOut), true, true) +
      fldH('cu_note', 'ملاحظات', '<textarea id="cu_note" data-cu="note" maxlength="600" placeholder="اختياري">' + esc(C.note || '') + '</textarea>', false, true) + '</div>',
      '<div class="lerr" role="alert">' + esc(err || '') + '</div><button class="btn" data-lyclose="1">إلغاء</button><button class="btn goldb" id="cuSave">' + ic('check') + (x ? 'حفظ التعديل' : 'تسجيل التسليم') + '</button>', 'anm');
    var sync = function () { el.querySelectorAll('[data-cu]').forEach(function (i) { C[i.dataset.cu] = i.value; }); };
    bindSeg(el, C, function () { sync(); draw(); });
    if (window.FancySelect && FancySelect.scan) try { FancySelect.scan(el); } catch (e) { }
    el.querySelector('#cuSave').onclick = function () { sync(); if (!C.ref) return draw('اختر المنسوب'); if (String(C.item).trim().length < 2) return draw('اكتب وصف العهدة'); if (!C.category) return draw('اختر نوع العهدة');
      this.disabled = true; api(Object.assign({ action: 'cusSave' }, C)).then(function (j) { var c2 = cusData().data; if (c2) { c2.rows = c2.rows.filter(function (r) { return r.id !== j.row.id; }); c2.rows.unshift(j.row); } delete CACHE.audit; el.close(); softRender(); toast(x ? 'حُفظ التعديل' : 'سُجّلت العهدة ووصل المنسوب بريد'); }).catch(function (e) { draw(errText(e)); }); };
  };
  draw();
}
function cusReturn(x) {
  var C = { returnedOn: ymd(new Date()), condIn: 'سليمة', note: '' };
  var el = layer('cuLayer', { tile: tile('emerald', 'check'), t: 'استلام عهدة من المنسوب', p: esc(x.item) + ' · ' + esc(x.name) },
    '<div class="form">' + fldH('cr_on', 'تاريخ الاستلام', '<input id="cr_on" type="date" value="' + C.returnedOn + '">', true) + fldH('ci', 'حالتها عند الاستلام', segH('condIn', ['سليمة', 'بها تلف', 'مفقودة'], C.condIn), true, true) +
    fldH('cr_note', 'ملاحظات', '<textarea id="cr_note" maxlength="400" placeholder="اختياري: وصف التلف أو ما يلزم"></textarea>', false, true) + '</div>',
    '<div class="lerr" role="alert"></div><button class="btn" data-lyclose="1">إلغاء</button><button class="btn goldb" id="crSave">' + ic('check') + 'تأكيد الاستلام</button>', 'anm');
  bindSeg(el, C);
  if (window.FancySelect && FancySelect.scan) try { FancySelect.scan(el); } catch (e) { }
  el.querySelector('#crSave').onclick = function () { var b = this; b.disabled = true;
    api({ action: 'cusReturn', id: x.id, returnedOn: el.querySelector('#cr_on').value, condIn: C.condIn, note: el.querySelector('#cr_note').value }).then(function (j) { var c2 = cusData().data; if (c2) c2.rows = c2.rows.map(function (r) { return r.id === j.row.id ? j.row : r; }); delete CACHE.audit; el.close(); softRender(); toast('سُجّل استلام العهدة'); })
      .catch(function (e) { b.disabled = false; el.querySelector('.lerr').textContent = errText(e); }); };
}

/* ======================================================================
   صفحة المنسوب: سجلي الوظيفي (الإجراءات، العهد، التقييمات)
   ====================================================================== */
VIEWS.myhr = function () {
  var a = actData(), c = cusData(), A = (a.data && a.data.rows) || [], C = (c.data && c.data.rows) || [], E = myEvals();
  var noack = A.filter(function (x) { return !x.ackAt; }).length, cna = C.filter(function (x) { return x.open && !x.ackAt; }).length, ena = E.filter(function (x) { return x.status === 'sent'; }).length;
  var cuH = C.length ? '<ul class="culist">' + C.map(function (x) { return '<li class="' + (x.open ? '' : 'back') + '">' + tile(x.open ? 'teal' : 'slate', 'box') + '<div><b>' + esc(x.item) + '</b><small>' + esc(x.category) + (x.serial ? ' · <span class="ltr">' + esc(x.serial) + '</span>' : '') + ' · استلمتها ' + fdx(pdate(x.issuedOn), { day: 'numeric', month: 'short', year: 'numeric' }) + (x.open ? '' : ' · أعدتها ' + fdx(pdate(x.returnedOn), { day: 'numeric', month: 'short' })) + '</small></div>' +
    (x.open ? (x.ackAt ? '<span class="pill ok"><i></i>أقررت بالاستلام</span>' : '<button class="btn sm goldb" data-cus-ack="' + x.id + '">' + ic('check') + 'أقرّ باستلامها</button>') : '<span class="pill mute"><i></i>أُعيدت</span>') + '</li>'; }).join('') + '</ul>'
    : '<div class="note">' + ic('box') + '<span>لا عهد مسجّلة باسمك.</span></div>';
  return ptitle('سجلي الوظيفي', 'ما صدر لك من الموارد البشرية: الإجراءات والخطابات، والعهد التي استلمتها، وتقييمات أدائك. اطّلع عليها وأكّد اطلاعك.') +
    '<div class="grid g3">' + kpi('garnet', 'stamp', A.length, '', 'الإجراءات والخطابات', noack ? noack + ' بانتظار اطلاعك' : 'اطّلعت عليها كلها', '') + kpi('teal', 'box', C.filter(function (x) { return x.open; }).length, '', 'العهد لديك', cna ? cna + ' بانتظار إقرارك' : '', '') + kpi('gold', 'medal', E.length, '', 'تقييمات الأداء', ena ? ena + ' بانتظار اطلاعك' : '', '') + '</div>' +
    pn('garnet', 'stamp', 'الإجراءات والخطابات', A.length ? A.length + ' إجراءً' : '', '', '<div class="pb">' + (A.length ? '<ul class="rqlist">' + A.map(function (x) { return actRowH(x, true); }).join('') + '</ul>' : '<div class="note">' + ic('check') + '<span>لا إجراءات صادرة لك.</span></div>') + '</div>') +
    pn('teal', 'box', 'عهدي', '', '', '<div class="pb">' + cuH + '</div>') + (typeof myEvalsHTML === 'function' ? myEvalsHTML(E) : '');
};

/* ======================================================================
   المرحلة الرابعة: أرصدة مستقلة وترحيل · الحضور من الجوال · تصحيح الحضور
   ====================================================================== */
P.pin = '<path d="M12 21s-7-6.2-7-11.5a7 7 0 1 1 14 0C19 14.8 12 21 12 21Z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/><circle cx="12" cy="9.5" r="2.6" fill="none" stroke="currentColor" stroke-width="1.9"/>';
function quotaNote(kind, days) {
  var s = rwStaff(), b = s ? lbal(s.ref) : null; if (!b || !kind) return '';
  if (b.kinds && b.kinds.indexOf(kind) > -1) return days > b.left ? '<div class="note warn">' + ic('alert') + '<span>المدة أطول من رصيدك السنوي المتبقي (' + b.left + ' يوم).</span></div>' : '';
  var q = (b.quotas || []).filter(function (x) { return x.kind === kind; })[0]; if (!q) return '';
  return days > q.left ? '<div class="note warn">' + ic('alert') + '<span>رصيد «' + esc(kind) + '» هذا العام ' + q.quota + ' يومًا، والمتاح ' + q.left + (q.strict ? '. قلّل المدة؛ لن يُقبل الطلب بأطول من المتاح.' : '. ما زاد يُعامل وفق نظام العمل (بأجر مخفّض).') + '</span></div>'
    : '<div class="note">' + ic('umbrella') + '<span>رصيد «' + esc(kind) + '» المتاح هذا العام <b>' + q.left + '</b> من ' + q.quota + ' يومًا.</span></div>';
}
var _balHTML0 = balHTML;
balHTML = function (b, compact) {
  if (!b) return '';
  var h = _balHTML0(b, compact);
  var extra = (b.carried ? '<div class="lb-carry">' + ic('history') + 'منها ' + b.carried + ' يومًا مرحّلة من ' + (b.year - 1) + '</div>' : '') + (b.lateReturn ? '<div class="lb-carry warn">' + ic('alert') + 'خُصم ' + dn(b.lateReturn) + ' تأخرًا عن العودة</div>' : '') +
    (!compact && (b.quotas || []).length ? '<div class="lb-q">' + b.quotas.map(function (q) { var pc = Math.min(100, Math.round((q.used + q.pending) / q.quota * 100)); return '<div><span>' + esc(q.kind) + '</span><i><em style="width:' + pc + '%"></em></i><b>' + q.left + '<small>/' + q.quota + '</small></b></div>'; }).join('') + '</div>' : '');
  return extra ? h.replace(/<\/div>$/, extra + '</div>') : h;
};

/* ---------- الإعدادات: الأرصدة المستقلة والترحيل، والتجربة، والحضور من الجوال ---------- */
var _setHTML0 = setHTML;
setHTML = function () {
  var h = _setHTML0(); if (!SD) return h;
  var L = SD.leave, W = SD.work; L.quotas = L.quotas || {}; W.sites = W.sites || []; W.mobileRefs = W.mobileRefs || []; W.remoteRefs = W.remoteRefs || []; if (W.probation == null) W.probation = 90; if (!W.mobile) W.mobile = 'off';
  var qk = LKINDS.filter(function (k) { return L.kinds.indexOf(k) < 0 && k !== 'بدون راتب' && k !== 'أخرى'; });
  var qp = pn('emerald', 'umbrella', 'أرصدة الأنواع الأخرى والترحيل', 'لكل نوع رصيد سنوي مستقل لا يُخصم من السنوية؛ صفر يعني بلا حد', '', '<div class="pb"><div class="form">' +
    '<div class="fld"><label for="stCarry">أقصى ما يُرحَّل من السنوية للعام التالي (يوم)</label><input id="stCarry" type="number" min="0" max="60" value="' + esc(L.carry || 0) + '"><small class="fhint">صفر: لا ترحيل</small></div>' +
    '<div class="fld wide"><div class="qgrid">' + qk.map(function (k) { return '<label><span>' + esc(k) + '</span><input type="number" min="0" max="180" data-quota="' + esc(k) + '" value="' + esc(L.quotas[k] || 0) + '"><small>يوم</small></label>'; }).join('') + '</div></div></div></div>');
  var mm = [['off', 'موقوف', 'البصمة فقط'], ['listed', 'لمنسوبين محددين', 'العمل الميداني أو عن بعد'], ['all', 'للجميع', 'كل المنسوبين']];
  var mp = pn('teal', 'pin', 'البصمة من الجوال', 'يبصم المنسوب من جواله داخل نطاق مقر جهته، ويصله تنبيه عند بداية الدوام، وإن غادر النطاق أثناء الدوام يُطلب منه استئذان أو يُحتسب انصرافه', '', '<div class="pb"><div class="form">' +
    '<div class="fld wide"><label>من يسجّل من الجوال</label><div class="seg2">' + mm.map(function (x) { return '<button type="button" data-mob="' + x[0] + '" aria-pressed="' + (W.mobile === x[0]) + '">' + x[1] + '<small>' + x[2] + '</small></button>'; }).join('') + '</div></div>' +
    (W.mobile === 'listed' ? '<div class="fld wide"><label>المنسوبون المسموح لهم</label>' + ssel('stMobAdd', staffOpts().filter(function (o) { return W.mobileRefs.indexOf(o.v) < 0; }), '', 'أضف منسوبًا', function (v) { SD.work.mobileRefs.push(v); softRender(); }, 'إضافة منسوب') +
      '<div class="chipsel">' + W.mobileRefs.map(function (r) { var s = byRef(r); return '<button type="button" data-mobdel="' + esc(r) + '" aria-pressed="true">' + esc(s ? s.name : r) + ' ×</button>'; }).join('') + '</div></div>' : '') +
    '<div class="fld wide"><label>يعملون عن بعد (بلا نطاق ولا مواعيد)</label>' + ssel('stRemAdd', staffOpts().filter(function (o) { return W.remoteRefs.indexOf(o.v) < 0; }), '', 'أضف منسوبًا', function (v) { SD.work.remoteRefs.push(v); softRender(); }, 'إضافة منسوب يعمل عن بعد') +
      '<div class="chipsel">' + W.remoteRefs.map(function (r) { var s = byRef(r); return '<button type="button" data-remdel="' + esc(r) + '" aria-pressed="true">' + esc(s ? s.name : r) + ' ×</button>'; }).join('') + '</div><small class="fhint">منسوبو أي جهة في اسمها «عن بعد» يعملون عن بعد تلقائيًا: يبصمون من أي مكان وفي أي وقت، بلا تأخير ولا تنبيهات دوام. أضف هنا من يعمل عن بعد من الجهات الأخرى.</small></div>' +
    '<div class="fld wide"><label>تأكيد التواجد أثناء الدوام</label><div class="seg2">' + [[0, 'لا'], [30, 'كل نصف ساعة'], [60, 'كل ساعة'], [120, 'كل ساعتين']].map(function (x) { return '<button type="button" data-chk="' + x[0] + '" aria-pressed="' + ((W.checkEvery == null ? 60 : +W.checkEvery) === x[0]) + '">' + x[1] + '</button>'; }).join('') + '</div><small class="fhint">يصل المنسوب تنبيه، فإذا فتحه تحقق جواله من وجوده داخل نطاق المقر، وإن كان خارجه طُلب منه استئذان أو احتُسب انصرافه.</small></div>' +
    '<div class="fld wide"><label>مقرات الجهات (نقطة مركزية لكل مقر)</label><div class="sites">' + W.sites.map(function (x, i) { return '<div class="siter"><input data-site="' + i + '.name" value="' + esc(x.name) + '" placeholder="اسم المقر"><select data-site="' + i + '.entity" aria-label="الجهة"><option value="">كل الجهات</option>' + ENT.map(function (e) { var v = e.full || e.n; return '<option value="' + esc(v) + '"' + (v === x.entity || e.n === x.entity ? ' selected' : '') + '>' + esc(e.n) + '</option>'; }).join('') + '</select><input data-site="' + i + '.lat" value="' + esc(x.lat) + '" dir="ltr" placeholder="خط العرض"><input data-site="' + i + '.lng" value="' + esc(x.lng) + '" dir="ltr" placeholder="خط الطول"><input data-site="' + i + '.radius" type="number" min="30" max="5000" value="' + esc(x.radius) + '" dir="ltr" title="النطاق بالمتر"><button type="button" class="ib" data-sitehere="' + i + '" title="موقعي الحالي" aria-label="استخدام موقعي الحالي">' + ic('pin') + '</button><button type="button" class="ib del" data-sitedel="' + i + '" aria-label="حذف الموقع">' + ic('x') + '</button><div class="sitelink"><input data-sitelink="' + i + '" dir="ltr" inputmode="url" placeholder="الصق رابط خرائط جوجل للمقر لتُملأ الإحداثيات تلقائيًا" aria-label="رابط خرائط جوجل"><button type="button" class="btn sm" data-sitego="' + i + '">' + ic('pin') + 'استخراج</button><select data-site="' + i + '.tz" aria-label="توقيت المقر" title="توقيت المقر">' + tzOpts(x.tz) + '</select>' + (x.lat && x.lng ? '<a class="btn sm ghost" target="_blank" rel="noopener" href="https://www.google.com/maps?q=' + encodeURIComponent(x.lat + ',' + x.lng) + '">' + ic('eye') + 'تحقق على الخريطة</a>' : '') + '</div></div>'; }).join('') +
    '</div><button type="button" class="btn sm" id="siteAdd">' + ic('plus') + 'إضافة مقر</button><small class="fhint">لكل جهة مقرها: يُقبل حضور منسوبيها داخل النطاق حوله فقط (50 م افتراضيًا). المقر بلا جهة يصلح لمن لا مقر لجهته. الإحداثيات من خرائط جوجل (اضغط مطوّلًا على المكان)، أو اضغط «موقعي الحالي» وأنت في المقر.</small></div></div></div>');
  return h.replace('<div class="setbar', '<div class="grid g2">' + qp + mp + '</div><div class="setbar');
};
var _bindSet0 = bindSet;
bindSet = function () {
  _bindSet0(); if (!SD || !document.getElementById('stSave')) return;
  var re = function () { softRender(); };
  var g = function (id) { return document.getElementById(id); };
  if (g('stCarry')) g('stCarry').onchange = function () { SD.leave.carry = +this.value || 0; re(); };
  document.querySelectorAll('[data-quota]').forEach(function (x) { x.onchange = function () { SD.leave.quotas[x.dataset.quota] = +x.value || 0; re(); }; });
  document.querySelectorAll('[data-mob]').forEach(function (b) { b.onclick = function () { SD.work.mobile = b.dataset.mob; re(); }; });
  document.querySelectorAll('[data-chk]').forEach(function (b) { b.onclick = function () { SD.work.checkEvery = +b.dataset.chk; re(); }; });
  document.querySelectorAll('[data-mobdel]').forEach(function (b) { b.onclick = function () { SD.work.mobileRefs = SD.work.mobileRefs.filter(function (r) { return r !== b.dataset.mobdel; }); re(); }; });
  document.querySelectorAll('[data-remdel]').forEach(function (b) { b.onclick = function () { SD.work.remoteRefs = SD.work.remoteRefs.filter(function (r) { return r !== b.dataset.remdel; }); re(); }; });
  document.querySelectorAll('[data-site]').forEach(function (x) { x.onchange = function () { var p = x.dataset.site.split('.'); var st = SD.work.sites[+p[0]]; st[p[1]] = p[1] === 'name' || p[1] === 'entity' || p[1] === 'tz' ? x.value : +x.value; if ((p[1] === 'lat' || p[1] === 'lng') && st.lat && st.lng) { var gz = tzGuess(+st.lat, +st.lng); if (gz) st.tz = gz; } re(); }; });
  document.querySelectorAll('[data-sitedel]').forEach(function (b) { b.onclick = function () { SD.work.sites.splice(+b.dataset.sitedel, 1); re(); }; });
  document.querySelectorAll('[data-sitehere]').forEach(function (b) { b.onclick = function () { if (!navigator.geolocation) return toast('المتصفح لا يدعم تحديد الموقع'); b.disabled = true;
    navigator.geolocation.getCurrentPosition(function (p) { var x = SD.work.sites[+b.dataset.sitehere]; x.lat = +p.coords.latitude.toFixed(6); x.lng = +p.coords.longitude.toFixed(6); x.tz = devTZ() || x.tz; re(); toast('أُخذ موقعك الحالي بدقة ' + Math.round(p.coords.accuracy) + ' م'); }, function () { b.disabled = false; toast('تعذّر تحديد موقعك؛ فعّل خدمة الموقع'); }, { enableHighAccuracy: true, timeout: 15000 }); }; });
  if (g('siteAdd')) g('siteAdd').onclick = function () { SD.work.sites.push({ name: '', entity: '', lat: '', lng: '', radius: 50, tz: 'Asia/Riyadh' }); re(); };
  var siteGo = function (i) {
    var inp = document.querySelector('[data-sitelink="' + i + '"]'), btn = document.querySelector('[data-sitego="' + i + '"]'), u = inp ? inp.value.trim() : '';
    if (!u) { if (inp) inp.focus(); return toast('الصق رابط المقر من خرائط جوجل أولًا'); }
    if (btn) btn.disabled = true;
    api({ action: 'geoResolve', url: u }).then(function (r) {
      var x = SD.work.sites[i]; if (!x) return; x.lat = r.lat; x.lng = r.lng; if (!x.name && r.name) x.name = r.name; var gz = tzGuess(r.lat, r.lng); if (gz) x.tz = gz; re();
      toast('تم: ' + r.lat + '، ' + r.lng + ' — راجعها بزر «تحقق على الخريطة» ثم احفظ');
    }).catch(function (e) { if (btn) btn.disabled = false; toast(errText(e) || 'تعذّر استخراج الإحداثيات'); });
  };
  document.querySelectorAll('[data-sitego]').forEach(function (b) { b.onclick = function () { siteGo(+b.dataset.sitego); }; });
  document.querySelectorAll('[data-sitelink]').forEach(function (x) {
    x.onpaste = function () { setTimeout(function () { if (x.value.trim()) siteGo(+x.dataset.sitelink); }, 30); };
    x.onkeydown = function (e) { if (e.key === 'Enter') { e.preventDefault(); siteGo(+x.dataset.sitelink); } };
  });
};

/* ---------- صفحة «حضوري»: التسجيل من الجوال ---------- */
var _myatt0 = VIEWS.myatt;
VIEWS.myatt = function () {
  var h = _myatt0(), c = need('attToday', function () { return api({ action: 'attToday', tz: devTZ() }); }, 30000), d = c.data;
  if (!d || !d.on) return h;
  var done = d.in && d.out, card = '<section class="pn mobck"><div class="mck">' + tile('teal', 'pin') + '<div><h2>' + (done ? 'سجّلت حضورك وانصرافك اليوم' : d.in ? 'حاضر منذ ' + d.in : 'لم تسجّل حضورك اليوم') + '</h2><p>' + (d.weekend ? 'اليوم عطلة نهاية الأسبوع. ' : '') + (d.remote ? 'تعمل عن بعد: سجّل حضورك وانصرافك من أي مكان وفي أي وقت.' : 'تُقبل البصمة من جوالك داخل نطاق مقر جهتك، وإن غادرت النطاق أثناء الدوام يُطلب منك استئذان أو يُحتسب انصرافك.') + '</p>' +
    (d.in ? '<div class="mtimes"><span>الحضور <b class="ltr">' + d.in + '</b></span><span>الانصراف <b class="ltr">' + (d.out || '—') + '</b></span></div>' : '') + '<div class="lerr" id="mckErr" role="alert"></div></div>' +
    '<button class="btn ' + (d.in ? 'prim' : 'goldb') + ' big" id="mckBtn">' + ic('finger') + (d.in ? (d.out ? 'تحديث الانصراف' : 'تسجيل الانصراف') : 'تسجيل الحضور') + '</button></div></section>';
  return h.replace('<div class="grid g4">', card + '<div class="grid g4">');
};
function devTZ() { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { return ''; } }
function mobCheck(b) {
  var err = document.getElementById('mckErr'), d = attT() || {}, remote = !!d.remote;
  if (!navigator.geolocation && !remote) { err.textContent = 'المتصفح لا يدعم تحديد الموقع.'; return; }
  b.disabled = true; var t0 = b.innerHTML; b.innerHTML = ic(remote ? 'finger' : 'pin') + (remote ? 'جارٍ التسجيل…' : 'جارٍ تحديد موقعك…'); err.textContent = '';
  var send = function (p) {
    var q = { action: 'attCheck', tz: devTZ() }; if (p) { q.lat = p.coords.latitude; q.lng = p.coords.longitude; q.acc = p.coords.accuracy; }
    api(q).then(function (j) { seed('attToday', j); GEO.out = 0; GEO.permSent = false; Object.keys(CACHE).forEach(function (k) { if (k.indexOf('myatt:') === 0) delete CACHE[k]; }); softRender(); toast((j.kind === 'in' ? 'سُجّل حضورك' : 'سُجّل انصرافك') + (j.site === 'عن بعد' ? ' (عن بعد)' : ' في ' + j.site)); })
      .catch(function (e) { b.disabled = false; b.innerHTML = t0; err.textContent = errText(e); });
  };
  /* العامل عن بعد: يُرسل الموقع إن توفر سريعًا للتوثيق، وإلا يُسجَّل بدونه */
  if (remote) { if (!navigator.geolocation) return send(null); return navigator.geolocation.getCurrentPosition(send, function () { send(null); }, { enableHighAccuracy: false, timeout: 6000, maximumAge: 300000 }); }
  navigator.geolocation.getCurrentPosition(send, function (e) { b.disabled = false; b.innerHTML = t0; err.textContent = e && e.code === 1 ? 'اسمح للمنصة بالوصول إلى موقعك من إعدادات المتصفح، ثم حاول مرة أخرى.' : 'تعذّر تحديد موقعك. فعّل خدمة الموقع وحاول مرة أخرى.'; }, { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 });
}

/* ---------- تصحيح الحضور من نافذة المنسوب في السجل الشهري ---------- */
function attOpen(ref) {
  var s = byRef(ref); if (!s) return; var ym = AT.month || ymNow();
  var el = layer('attLayer', { tile: avP(s), t: esc(s.name), p: ymName(ym) + ' · ' + esc(s.ent.n) }, '<div class="empty">جارٍ التحميل…</div>', '', 'attm');
  var load = function () {
    api({ action: 'attMonth', month: ym, ref: ref }).then(function (j) {
      var a = j.rows[ref] || { present: 0, late: 0, lateMin: 0, absent: 0, hours: 0, days: [], absentDays: [], leave: {} }, fix = can('attm');
      el.querySelector('.abody').innerHTML = '<div class="amini">' + [['حضور', a.present + ' من ' + j.workDays], ['تأخير', a.late ? a.late + ' (' + minsTxt(a.lateMin) + ')' : '0'], ['غياب', a.absent], ['مبرّر باستئذان', a.excused || 0], ['إضافي', (a.otHours || 0) + ' س'], ['ساعات', a.hours]].map(function (x) { return '<div><small>' + x[0] + '</small><b>' + x[1] + '</b></div>'; }).join('') + '</div>' + attCal(a, ym) +
        (fix ? '<div class="fixbar"><button class="btn sm" id="afNew">' + ic('edit') + 'تصحيح يوم أو إضافة سجل</button><small>كل تصحيح يُحفظ في سجل العمليات بقيمته السابقة وسببه. استيراد ملف البصمة لاحقًا لليوم نفسه يستبدله.</small></div><div id="afForm"></div>' : '') +
        (a.days.length ? '<div class="tw"><table><thead><tr><th>اليوم</th><th>الدخول</th><th>الخروج</th><th class="num">التأخير</th><th class="num">الساعات</th><th>المصدر</th>' + (fix ? '<th></th>' : '') + '</tr></thead><tbody>' + a.days.map(function (x) { return '<tr><td>' + fd(pdate(x.day), { weekday: 'short', day: 'numeric', month: 'short' }) + '</td><td class="ltr">' + (x.in || '—') + '</td><td class="ltr">' + (x.out || '—') + '</td><td class="num">' + (x.late ? minsTxt(x.late) : '—') + '</td><td class="num">' + (x.mins ? (x.mins / 60).toFixed(1) : '—') + '</td><td><small class="mu">' + esc(x.src || 'جهاز البصمة') + '</small></td>' + (fix ? '<td><button class="ib" data-afday="' + x.day + '" data-afin="' + (x.in || '') + '" data-afout="' + (x.out || '') + '" aria-label="تصحيح">' + ic('edit') + '</button></td>' : '') + '</tr>'; }).join('') + '</tbody></table></div>' : '');
      var form = function (day, ti, to) {
        var box = el.querySelector('#afForm'); box.innerHTML = '<div class="affix"><div class="form">' + fldH('af_day', 'اليوم', '<input id="af_day" type="date" value="' + (day || '') + '">', true) + fldH('af_in', 'الحضور', '<input id="af_in" type="time" dir="ltr" value="' + (ti || '') + '">', true) + fldH('af_out', 'الانصراف', '<input id="af_out" type="time" dir="ltr" value="' + (to || '') + '">') +
          fldH('af_why', 'سبب التصحيح', '<input id="af_why" maxlength="300" placeholder="مثال: عطل في جهاز البصمة، أو مهمة خارجية">', true, true) + '</div><div class="lerr" id="afErr" role="alert"></div><div class="afacts">' + (day && ti ? '<button class="btn sm rqdel" id="afDel">' + ic('trash') + 'حذف سجل اليوم</button>' : '') + '<span class="sp"></span><button class="btn sm" id="afCancel">إلغاء</button><button class="btn sm goldb" id="afSave">' + ic('check') + 'حفظ التصحيح</button></div></div>';
        if (window.FancySelect && FancySelect.scan) try { FancySelect.scan(box); } catch (e) { }
        var send = function (remove) { var er = box.querySelector('#afErr'); api({ action: 'attFix', ref: ref, day: box.querySelector('#af_day').value, in: box.querySelector('#af_in').value, out: box.querySelector('#af_out').value, reason: box.querySelector('#af_why').value, remove: remove ? 1 : 0 })
          .then(function () { toast('حُفظ التصحيح في سجل العمليات'); Object.keys(CACHE).forEach(function (k) { if (/^att/.test(k)) delete CACHE[k]; }); load(); }).catch(function (e) { er.textContent = errText(e); }); };
        box.querySelector('#afSave').onclick = function () { send(false); }; box.querySelector('#afCancel').onclick = function () { box.innerHTML = ''; };
        var dl = box.querySelector('#afDel'); if (dl) dl.onclick = function () { send(true); };
        box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      };
      var nb = el.querySelector('#afNew'); if (nb) nb.onclick = function () { form('', '', ''); };
      el.querySelectorAll('[data-afday]').forEach(function (b) { b.onclick = function () { form(b.dataset.afday, b.dataset.afin, b.dataset.afout); }; });
    }, function (e) { el.querySelector('.abody').innerHTML = '<div class="empty">' + esc(errText(e)) + '</div>'; });
  };
  load();
}

/* ======================================================================
   المرحلة الخامسة: تقييم الأداء · التوظيف
   ====================================================================== */
P.star = '<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>';
P.link = '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>';
TITLES.evals = ['تقييم الأداء']; TITLES.jobs = ['التوظيف'];
function evData() { return need('evals', function () { return api({ action: 'evList' }); }, 60000); }
function myEvals() { if (role !== 'staff') return []; var c = evData(); return (c.data && c.data.rows) || []; }
var EVL = [[4.5, 'ممتاز', 'emerald'], [3.5, 'جيد جدًا', 'sapphire'], [2.5, 'جيد', 'gold'], [1.5, 'مقبول', 'amethyst'], [0, 'يحتاج تحسينًا', 'garnet']];
function evTone(t) { for (var i = 0; i < EVL.length; i++) if (t >= EVL[i][0]) return EVL[i]; return EVL[4]; }
function evBadge(e) { var t = evTone(e.total); return '<span class="evb ' + t[2] + '"><b>' + (+e.total).toFixed(1) + '</b><small>' + t[1] + '</small></span>'; }
var EF = { q: '', st: '', per: '' };
VIEWS.evals = function () {
  var c = evData(), d = c.data;
  var head = ptitle('تقييم الأداء', 'تقييم المنسوب بستة معايير من 1 إلى 5 مع نقاط القوة وفرص التحسين وأهداف الفترة القادمة. يُرسل التقييم للمنسوب ليطّلع عليه ويضيف ملاحظته.', d && d.canEdit ? '<button class="btn goldb" id="evNew">' + ic('plus') + 'تقييم جديد</button>' : '');
  if (!d) return head + '<section class="pn"><div class="pb"><div class="empty">' + (c.err ? esc(c.err) : 'جارٍ التحميل…') + '</div></div></section>';
  var all = d.rows, q = EF.q.trim().toLowerCase(), pers = {}; all.forEach(function (e) { pers[e.period] = (pers[e.period] || 0) + 1; });
  var list = all.filter(function (e) { return (!EF.st || e.status === EF.st) && (!EF.per || e.period === EF.per) && (!q || (e.name + ' ' + e.ref + ' ' + e.period).toLowerCase().indexOf(q) >= 0); });
  var sent = all.filter(function (e) { return e.status !== 'draft'; }), avg = sent.length ? sent.reduce(function (a, e) { return a + e.total; }, 0) / sent.length : 0;
  var kp = '<div class="grid g4">' + kpi('gold', 'medal', sent.length, '', 'تقييمات مرسلة', Object.keys(pers).length + ' فترة', '') + kpi('emerald', 'star', avg ? avg.toFixed(2) : '—', 'من 5', 'متوسط الأداء', avg ? evTone(avg)[1] : '', '') +
    kpi('sapphire', 'eye', all.filter(function (e) { return e.status === 'sent'; }).length, '', 'بانتظار اطلاع المنسوب', '', '') + kpi('slate', 'edit', all.filter(function (e) { return e.status === 'draft'; }).length, '', 'مسودات', 'لم تُرسل بعد', '') + '</div>';
  var bar = '<section class="pn tbar"><div class="fbar">' + fsearch('efq', EF.q, 'ابحث باسم المنسوب أو الفترة', 'بحث في التقييمات') +
    ssel('efp', [{ v: '', n: 'كل الفترات', ic: 'calendar' }].concat(Object.keys(pers).map(function (p) { return { v: p, n: p, k: pers[p] }; })), EF.per, 'كل الفترات', function (v) { EF.per = v; render(); }, 'الفترة', 'الفترة') +
    ssel('efs', [{ v: '', n: 'كل الحالات', ic: 'stamp' }, { v: 'draft', n: 'مسودة' }, { v: 'sent', n: 'بانتظار اطلاعه' }, { v: 'ack', n: 'اطّلع' }], EF.st, 'كل الحالات', function (v) { EF.st = v; render(); }, 'الحالة', 'الحالة') + '</div></section>';
  var rows = list.length ? '<ul class="rqlist">' + list.map(function (e) { return '<li><button type="button" class="rqrow" data-ev="' + e.id + '">' + (byRef(e.ref) ? av(byRef(e.ref)) : tile('gold', 'medal')) + '<div class="rqm"><b>' + esc(e.name) + '</b><span class="s">' + esc(e.period) + ' · ' + esc(e.entity) + (e.data.evaluator ? ' · المقيِّم: ' + esc(e.data.evaluator) : '') + ' · توصية: ' + esc(e.data.rec || '—') + '</span>' + evBars(e) + '</div>' +
    '<div class="evr">' + evBadge(e) + (e.status === 'draft' ? '<span class="pill mute"><i></i>مسودة</span>' : e.status === 'sent' ? '<span class="pill warn"><i></i>لم يطّلع</span>' : '<span class="pill ok"><i></i>اطّلع</span>') + '</div></button></li>'; }).join('') + '</ul>'
    : '<div class="emptyx">' + tile('gold', 'medal') + '<b>' + (all.length ? 'لا تقييمات في هذه التصفية' : 'لا تقييمات بعد') + '</b><p>ابدأ بتقييم منسوب لفترة محددة، واحفظه مسودة أو أرسله له مباشرة.</p></div>';
  return head + kp + bar + pn('gold', 'medal', 'التقييمات', list.length + ' تقييمًا', '', '<div class="pb">' + rows + '</div>');
};
function evBars(e) { var C = ((evData().data || {}).crit) || []; return '<span class="evbars">' + C.map(function (c) { var v = e.scores[c[0]] || 0; return '<i title="' + esc(c[1]) + ': ' + v + '"><em style="height:' + (v * 20) + '%"></em></i>'; }).join('') + '</span>'; }
function evSheet(e) {
  var C = (evData().data || {}).crit || [];
  return sheetH({ no: 'EV-' + e.id, metaL: 'رقم التقييم', date: fdx(pdt(e.sentAt || e.createdAt)), title: 'تقييم الأداء الوظيفي', sub: e.period, who: [['الاسم', e.name], ['الرقم المرجعي', e.ref], ['الجهة', e.entity], ['المسمى', e.jobTitle], ['المقيِّم', e.data.evaluator || e.by], ['الفترة', e.period]],
    rows: C.map(function (c) { return [c[1], (e.scores[c[0]] || 0) + ' من 5']; }).concat([['التقدير العام', (+e.total).toFixed(2) + ' من 5 · ' + evTone(e.total)[1]], ['التوصية', e.data.rec || '—']]), detT: 'المعايير',
    text: ['نقاط القوة: ' + (e.data.strengths || '—'), 'فرص التحسين: ' + (e.data.improve || '—'), 'أهداف الفترة القادمة: ' + (e.data.goals || '—')].concat(e.ackNote ? ['ملاحظة المنسوب: ' + e.ackNote] : []).join('\n\n'),
    sign: [['المقيِّم', e.data.evaluator || e.by, e.createdAt], ['اطّلع المنسوب', e.ackAt ? e.name : '', e.ackAt || 'لم يطّلع بعد']], foot: 'تقييم الأداء' });
}
function evOpen(id) {
  var d = evData().data, e = d && d.rows.filter(function (x) { return x.id === +id; })[0]; if (!e) return;
  var staffSide = role === 'staff', draft = e.status === 'draft' && !staffSide && d.canEdit, mine = staffSide && e.status === 'sent';
  var foot = (mine ? '<div class="rqdec"><textarea id="evNote" rows="2" maxlength="600" placeholder="ملاحظتك على التقييم (اختيارية)"></textarea><div class="lerr" id="evErr" role="alert"></div></div><button class="btn goldb" id="evAck">' + ic('eye') + 'اطّلعت على التقييم</button>' : '<span class="sp"></span>') +
    (draft ? '<button class="btn rqdel" id="evDel">' + ic('trash') + 'حذف المسودة</button><button class="btn prim" id="evEdit">' + ic('edit') + 'تعديل وإرسال</button>' : '') + '<button class="btn" id="evPrint">' + ic('dl') + 'طباعة أو حفظ PDF</button>';
  var el = layer('evLayer', { tile: tile('gold', 'medal'), t: 'تقييم ' + esc(e.period), p: esc(e.name), end: evBadge(e) }, '<div class="rqbody">' + evSheet(e) + '</div>', foot, 'rqm2');
  el.querySelector('#evPrint').onclick = printSheet;
  var ak = el.querySelector('#evAck'); if (ak) ak.onclick = function () { ak.disabled = true; api({ action: 'evAck', id: e.id, note: el.querySelector('#evNote').value.trim() }).then(function (j) { d.rows = d.rows.map(function (r) { return r.id === j.row.id ? j.row : r; }); el.close(); softRender(); toast('سُجّل اطلاعك على التقييم'); }).catch(function (x) { ak.disabled = false; el.querySelector('#evErr').textContent = errText(x); }); };
  var ed = el.querySelector('#evEdit'); if (ed) ed.onclick = function () { el.close(); evForm(e); };
  var dl = el.querySelector('#evDel'); if (dl) dl.onclick = function () { if (dl.dataset.sure !== '1') { dl.dataset.sure = '1'; dl.classList.add('sure'); dl.innerHTML = ic('trash') + 'تأكيد الحذف؟'; return; } api({ action: 'evDelete', id: e.id }).then(function () { d.rows = d.rows.filter(function (r) { return r.id !== e.id; }); el.close(); softRender(); toast('حُذفت المسودة'); }).catch(function (x) { toast(errText(x)); }); };
}
function evForm(e) {
  var d = evData().data || {}, C = d.crit || [], R = d.recs || [];
  var F = e ? { id: e.id, ref: e.ref, period: e.period, evaluator: e.data.evaluator || '', scores: Object.assign({}, e.scores), strengths: e.data.strengths || '', improve: e.data.improve || '', goals: e.data.goals || '', rec: e.data.rec || '' }
    : { ref: '', period: '', evaluator: (SESSION && SESSION.name) || '', scores: {}, strengths: '', improve: '', goals: '', rec: '' };
  var draw = function (err) {
    var tot = C.filter(function (c) { return F.scores[c[0]]; }).length === C.length ? C.reduce(function (a, c) { return a + F.scores[c[0]]; }, 0) / C.length : 0;
    var el = layer('evLayer', { tile: tile('gold', 'medal'), t: e ? 'تعديل التقييم' : 'تقييم أداء جديد', p: 'يُرسل للمنسوب ليطّلع عليه، أو يُحفظ مسودة' },
      '<div class="form">' + fldH('evRef', 'المنسوب', ssel('evRef', staffOpts(), F.ref, 'اختر المنسوب', function (v) { sync(); F.ref = v; draw(); }, 'المنسوب'), true, true) +
      fldH('ev_period', 'فترة التقييم', '<input id="ev_period" data-ev="period" value="' + esc(F.period) + '" placeholder="مثال: الربع الرابع 2026" maxlength="60">', true) + fldH('ev_evaluator', 'المقيِّم', '<input id="ev_evaluator" data-ev="evaluator" value="' + esc(F.evaluator) + '" maxlength="120">') +
      '<div class="fld wide"><label>المعايير <i class="rq">*</i></label><div class="evcrit">' + C.map(function (c) { return '<div class="evc"><span>' + esc(c[1]) + '</span><div class="evs" role="radiogroup" aria-label="' + esc(c[1]) + '">' + [1, 2, 3, 4, 5].map(function (v) { return '<button type="button" role="radio" data-evs="' + c[0] + '" data-v="' + v + '" aria-checked="' + (F.scores[c[0]] === v) + '">' + v + '</button>'; }).join('') + '</div></div>'; }).join('') + '</div>' +
      (tot ? '<div class="note">' + ic('star') + '<span>التقدير العام <b>' + tot.toFixed(2) + ' من 5</b> · ' + evTone(tot)[1] + '</span></div>' : '<small class="fhint">1 ضعيف · 2 مقبول · 3 جيد · 4 جيد جدًا · 5 ممتاز</small>') + '</div>' +
      fldH('ev_strengths', 'نقاط القوة', '<textarea id="ev_strengths" data-ev="strengths" maxlength="1500">' + esc(F.strengths) + '</textarea>', false, true) + fldH('ev_improve', 'فرص التحسين', '<textarea id="ev_improve" data-ev="improve" maxlength="1500">' + esc(F.improve) + '</textarea>', false, true) +
      fldH('ev_goals', 'أهداف الفترة القادمة', '<textarea id="ev_goals" data-ev="goals" maxlength="1500">' + esc(F.goals) + '</textarea>', false, true) + fldH('r', 'التوصية', segH('rec', R, F.rec), false, true) + '</div>',
      '<div class="lerr" role="alert">' + esc(err || '') + '</div><button class="btn" data-lyclose="1">إلغاء</button><button class="btn" id="evDraft">' + ic('edit') + 'حفظ مسودة</button><button class="btn goldb" id="evSend">' + ic('send') + 'إرسال للمنسوب</button>', 'anm');
    var sync = function () { el.querySelectorAll('[data-ev]').forEach(function (x) { F[x.dataset.ev] = x.value; }); };
    el.querySelectorAll('[data-evs]').forEach(function (b) { b.onclick = function () { sync(); F.scores[b.dataset.evs] = +b.dataset.v; draw(); }; });
    bindSeg(el, F, function () { sync(); draw(); });
    var go = function (send) { sync(); if (!F.ref) return draw('اختر المنسوب'); if (F.period.trim().length < 3) return draw('اكتب فترة التقييم'); if (C.some(function (c) { return !F.scores[c[0]]; })) return draw('قيّم كل المعايير من 1 إلى 5');
      api(Object.assign({ action: 'evSave', send: send ? 1 : 0 }, F)).then(function (j) { var dd = evData().data; if (dd) { dd.rows = dd.rows.filter(function (r) { return r.id !== j.row.id; }); dd.rows.unshift(j.row); } delete CACHE.audit; el.close(); softRender(); toast(send ? 'أُرسل التقييم للمنسوب' : 'حُفظت المسودة'); }).catch(function (x) { draw(errText(x)); }); };
    el.querySelector('#evDraft').onclick = function () { go(false); }; el.querySelector('#evSend').onclick = function () { go(true); };
  };
  draw();
}
function myEvalsHTML(E) {
  return pn('gold', 'medal', 'تقييمات أدائي', E.length ? E.length + ' تقييمًا' : '', '', '<div class="pb">' + (E.length ? '<ul class="rqlist">' + E.map(function (e) { return '<li><button type="button" class="rqrow" data-ev="' + e.id + '">' + tile('gold', 'medal') + '<div class="rqm"><b>' + esc(e.period) + '</b><span class="s">المقيِّم: ' + esc(e.data.evaluator || e.by) + ' · ' + fdx(pdt(e.sentAt)) + '</span>' + evBars(e) + '</div><div class="evr">' + evBadge(e) + (e.status === 'sent' ? '<span class="pill warn"><i></i>بانتظار اطلاعك</span>' : '<span class="pill ok"><i></i>اطّلعت</span>') + '</div></button></li>'; }).join('') + '</ul>' : '<div class="note">' + ic('medal') + '<span>لا تقييمات مرسلة لك بعد.</span></div>') + '</div>');
}

/* ---------- التوظيف ---------- */
TAB.jobs = 'jobs'; TABL.jobs = { jobs: 'الوظائف', apps: 'المتقدمون', needs: 'الاحتياجات المعتمدة' };
ALIAS['jobs-apps'] = ['jobs', 'apps']; ALIAS['jobs-needs'] = ['jobs', 'needs'];
var JF = { job: 0, st: '', q: '' };
function jbData() { return need('jobs', function () { return api({ action: 'jobList' }); }, 60000); }
var APS = { new: ['info', 'جديد'], review: ['warn', 'قيد الدراسة'], interview: ['vio', 'مقابلة'], accepted: ['ok', 'مقبول'], rejected: ['bad', 'غير مقبول'] };
VIEWS.jobs = function () {
  var c = jbData(), d = c.data, t = TAB.jobs;
  var head = ptitle('التوظيف', 'من احتياج الإدارة المعتمد إلى إعلان الوظيفة في صفحة الوظائف العامة، ثم المتقدمون والمقابلات والتقييم، والمقبول يصله رابط تسجيل بياناته في سجل المنسوبين.', d && d.canEdit ? '<button class="btn goldb" id="jbNew">' + ic('plus') + 'إعلان وظيفة</button>' : '');
  if (!d) return head + '<section class="pn"><div class="pb"><div class="empty">' + (c.err ? esc(c.err) : 'جارٍ التحميل…') + '</div></div></section>';
  var open = d.jobs.filter(function (j) { return j.status === 'open'; }), apps = d.apps;
  var kp = '<div class="grid g4">' + kpi('amethyst', 'bell', open.length, '', 'وظائف معلنة', d.jobs.length + ' إعلانًا إجمالًا', '') + kpi('sapphire', 'users', apps.length, '', 'متقدمون', apps.filter(function (a) { return a.status === 'new'; }).length + ' جديد', '') +
    kpi('gold', 'calendar', apps.filter(function (a) { return a.status === 'interview'; }).length, '', 'في مرحلة المقابلة', '', '') + kpi('emerald', 'userok', apps.filter(function (a) { return a.status === 'accepted'; }).length, '', 'مقبولون', '', '') + '</div>';
  var body;
  if (t === 'apps') {
    var q = JF.q.trim().toLowerCase(), L = apps.filter(function (a) { return (!JF.job || a.jobId === JF.job) && (!JF.st || a.status === JF.st) && (!q || (a.name + ' ' + a.email + ' ' + a.phone).toLowerCase().indexOf(q) >= 0); });
    body = '<section class="pn tbar"><div class="fbar">' + fsearch('jfq', JF.q, 'ابحث باسم المتقدم أو بريده', 'بحث في المتقدمين') +
      ssel('jfj', [{ v: '0', n: 'كل الوظائف', ic: 'userok' }].concat(d.jobs.map(function (j) { return { v: String(j.id), n: j.title, d: j.entity, k: j.apps }; })), String(JF.job), 'كل الوظائف', function (v) { JF.job = +v; render(); }, 'الوظيفة', 'الوظيفة') +
      ssel('jfs', [{ v: '', n: 'كل الحالات', ic: 'stamp' }].concat(Object.keys(APS).map(function (k) { return { v: k, n: APS[k][1], k: apps.filter(function (a) { return a.status === k; }).length }; })), JF.st, 'كل الحالات', function (v) { JF.st = v; render(); }, 'الحالة', 'الحالة') + '</div></section>' +
      pn('sapphire', 'users', 'المتقدمون', L.length + ' متقدمًا', '', '<div class="pb">' + (L.length ? '<div class="tw"><table class="aptab"><thead><tr><th>المتقدم</th><th>الوظيفة</th><th>المؤهل والخبرة</th><th>تاريخ التقديم</th><th>المقابلة</th><th>الحالة</th></tr></thead><tbody>' + L.map(function (a) { var j = d.jobs.filter(function (x) { return x.id === a.jobId; })[0] || {}, r = a.review || {};
        return '<tr class="click" data-app="' + a.id + '"><td><b>' + esc(a.name) + '</b><small class="dn2 ltr">' + esc(a.email) + '</small></td><td>' + esc(j.title || '—') + '</td><td>' + esc(a.data.edu || '—') + '<small class="dn2">' + (a.data.years || 0) + ' سنة خبرة' + (a.data.city ? ' · ' + esc(a.data.city) : '') + '</small></td><td>' + fdx(pdt(a.createdAt), { day: 'numeric', month: 'short' }) + '</td><td>' + (r.date ? fdx(pdate(r.date), { day: 'numeric', month: 'short' }) + (r.total ? ' · <b>' + r.total + '</b>/5' : '') + (r.rec ? '<small class="dn2">' + esc(r.rec) + '</small>' : '') : '—') + '</td><td><span class="pill ' + APS[a.status][0] + '"><i></i>' + APS[a.status][1] + '</span></td></tr>'; }).join('') + '</tbody></table></div>'
        : '<div class="emptyx">' + tile('sapphire', 'users') + '<b>لا متقدمين ' + (apps.length ? 'في هذه التصفية' : 'بعد') + '</b><p>شارك رابط صفحة الوظائف، ويظهر هنا كل من يتقدم.</p></div>') + '</div>');
  } else if (t === 'needs') {
    body = pn('amethyst', 'userok', 'الاحتياجات الوظيفية المعتمدة', 'من نموذج «طلب احتياج وظيفي»', '<a class="btn sm" href="#reqs-new">' + ic('plus') + 'تقديم احتياج</a>', '<div class="pb">' + (d.needs.length ? '<ul class="rqlist">' + d.needs.map(function (x) { var used = d.jobs.some(function (j) { return j.needNo === x.no; });
      return '<li><div class="rqrow">' + tile('amethyst', 'userok') + '<div class="rqm"><b>' + esc(x.data.title || '') + ' × ' + (x.data.count || 1) + '</b><span class="s"><span class="ltr">' + esc(x.no) + '</span> · ' + esc(x.data.entity || '') + ' · ' + esc(x.data.contract || '') + ' · قبل ' + fdx(pdate(x.data.needBy)) + '</span></div>' + (used ? '<span class="pill ok"><i></i>أُعلنت</span>' : d.canEdit ? '<button class="btn sm goldb" data-jbneed="' + esc(x.no) + '">' + ic('plus') + 'إعلانها</button>' : '') + '</div></li>'; }).join('') + '</ul>'
      : '<div class="note">' + ic('info') + '<span>لا احتياجات معتمدة بعد. تقدّمها الإدارات من «طلب جديد ← احتياج وظيفي»، ويعتمدها المدير العام.</span></div>') + '</div>');
  } else {
    body = '<div class="jbshare">' + tile('amethyst', 'link') + '<div><b>صفحة الوظائف العامة</b><span class="ltr">' + esc(d.url) + '</span></div><button class="btn sm" id="jbCopy">' + ic('copy') + 'نسخ الرابط</button><a class="btn sm" href="' + esc(d.url) + '" target="_blank" rel="noopener">' + ic('eye') + 'معاينة</a></div>' +
      (d.jobs.length ? '<div class="jbcards">' + d.jobs.map(function (j) { var A = apps.filter(function (a) { return a.jobId === j.id; });
        return '<article class="jbcard' + (j.status === 'open' ? '' : ' off') + '"><header>' + tile('amethyst', 'userok') + '<div><h3>' + esc(j.title) + '</h3><span>' + esc([j.entity, j.location, j.kind].filter(Boolean).join(' · ')) + '</span></div>' + (j.status === 'open' ? '<span class="pill ok"><i></i>معلنة</span>' : j.status === 'filled' ? '<span class="pill info"><i></i>شُغلت</span>' : '<span class="pill mute"><i></i>مغلقة</span>') + '</header>' +
          '<p>' + esc(j.desc.slice(0, 180)) + (j.desc.length > 180 ? '…' : '') + '</p><div class="jbst">' + Object.keys(APS).map(function (k) { var n2 = A.filter(function (a) { return a.status === k; }).length; return n2 ? '<span class="pill ' + APS[k][0] + '"><i></i>' + APS[k][1] + ' ' + n2 + '</span>' : ''; }).join('') + (A.length ? '' : '<span class="mu">لا متقدمين بعد</span>') + '</div>' +
          '<footer><small>' + (j.closesOn ? 'يُغلق ' + fdx(pdate(j.closesOn)) : 'بلا موعد إغلاق') + (j.needNo ? ' · من الاحتياج <span class="ltr">' + esc(j.needNo) + '</span>' : '') + '</small><a class="btn sm" href="#jobs-apps" data-jbapps="' + j.id + '">' + ic('users') + 'المتقدمون (' + A.length + ')</a>' + (d.canEdit ? '<button class="btn sm" data-jbed="' + j.id + '">' + ic('edit') + 'تعديل</button>' : '') + '</footer></article>'; }).join('') + '</div>'
        : '<section class="pn"><div class="pb"><div class="emptyx">' + tile('amethyst', 'userok') + '<b>لا وظائف معلنة بعد</b><p>أعلن وظيفة لتظهر في صفحة الوظائف العامة ويتقدم عليها من يناسبها.</p></div></div></section>');
  }
  return head + kp + vtabs('jobs', [['jobs', 'الوظائف', d.jobs.length, 'userok'], ['apps', 'المتقدمون', apps.length, 'users', apps.filter(function (a) { return a.status === 'new'; }).length], ['needs', 'الاحتياجات المعتمدة', d.needs.length, 'stamp']]) + body;
};
function jbForm(j, need0) {
  var d = jbData().data || {}, nd = need0 ? (d.needs.filter(function (x) { return x.no === need0; })[0] || {}).data || {} : {};
  var F = j ? { id: j.id, title: j.title, entity: j.entity, department: j.department, location: j.location, kind: j.kind, count: j.count, desc: j.desc, quals: j.quals, closesOn: j.closesOn, needNo: j.needNo, status: j.status }
    : { title: nd.title || '', entity: nd.entity || '', department: nd.department || '', location: '', kind: { 'دوام كامل': 'دوام كامل', 'دوام جزئي': 'دوام جزئي', 'مؤقت': 'مؤقت', 'تعاقد': 'تعاقد' }[nd.contract] || 'دوام كامل', count: nd.count || 1, desc: nd.reason ? '' : '', quals: nd.quals || '', closesOn: '', needNo: need0 || '', status: 'open' };
  var draw = function (err) {
    var inp = function (k, type, ph, extra) { return '<input id="jb_' + k + '" data-jb="' + k + '" type="' + (type || 'text') + '" value="' + esc(F[k] == null ? '' : F[k]) + '"' + (ph ? ' placeholder="' + esc(ph) + '"' : '') + (extra || '') + '>'; };
    var el = layer('jbLayer', { tile: tile('amethyst', 'userok'), t: j ? 'تعديل إعلان الوظيفة' : 'إعلان وظيفة', p: F.needNo ? 'من الاحتياج ' + esc(F.needNo) : 'تظهر في صفحة الوظائف العامة فور الحفظ' },
      '<div class="form">' + fldH('jb_title', 'المسمى الوظيفي', inp('title', 'text', 'مثال: معلم قرآن كريم'), true) + fldH('jb_entity', 'الجهة', inp('entity', 'text', 'مثال: تمكين التعليم'), true) +
      fldH('jb_department', 'الإدارة أو القسم', inp('department', 'text', 'اختياري')) + fldH('jb_location', 'مكان العمل', inp('location', 'text', 'مثال: جدة، أو عن بعد')) +
      fldH('k', 'نوع العقد', segH('kind', d.kinds || [], F.kind), true, true) + fldH('jb_count', 'العدد المطلوب', inp('count', 'number', '1', ' min="1" max="50" dir="ltr"')) + fldH('jb_closesOn', 'آخر موعد للتقديم', inp('closesOn', 'date')) +
      fldH('jb_desc', 'وصف الوظيفة ومهامها', '<textarea id="jb_desc" data-jb="desc" maxlength="4000" placeholder="المهام الرئيسة وبيئة العمل">' + esc(F.desc) + '</textarea>', true, true) + fldH('jb_quals', 'المؤهلات والخبرات المطلوبة', '<textarea id="jb_quals" data-jb="quals" maxlength="3000">' + esc(F.quals) + '</textarea>', false, true) +
      (j ? fldH('s', 'حالة الإعلان', segH('status', ['open', 'closed', 'filled'], F.status).replace('>open<', '>معلنة<').replace('>closed<', '>مغلقة<').replace('>filled<', '>شُغلت<'), true, true) : '') + '</div>',
      '<div class="lerr" role="alert">' + esc(err || '') + '</div><button class="btn" data-lyclose="1">إلغاء</button><button class="btn goldb" id="jbSave">' + ic('check') + (j ? 'حفظ' : 'نشر الإعلان') + '</button>', 'anm');
    var sync = function () { el.querySelectorAll('[data-jb]').forEach(function (x) { F[x.dataset.jb] = x.value; }); };
    bindSeg(el, F, function () { sync(); draw(); });
    if (window.FancySelect && FancySelect.scan) try { FancySelect.scan(el); } catch (e) { }
    el.querySelector('#jbSave').onclick = function () { sync(); if (String(F.title).trim().length < 2) return draw('اكتب المسمى الوظيفي'); if (String(F.desc).trim().length < 10) return draw('اكتب وصف الوظيفة ومهامها');
      this.disabled = true; api(Object.assign({ action: 'jobSave' }, F)).then(function (r) { seed('jobs', r); el.close(); TAB.jobs = 'jobs'; render(); toast(j ? 'حُفظ الإعلان' : 'نُشرت الوظيفة في صفحة الوظائف'); }).catch(function (x) { draw(errText(x)); }); };
  };
  draw();
}
function appOpen(id) {
  var d = jbData().data, a = d && d.apps.filter(function (x) { return x.id === +id; })[0]; if (!a) return;
  var j = d.jobs.filter(function (x) { return x.id === a.jobId; })[0] || {}, R = Object.assign({ scores: {} }, a.review || {}), F = { status: a.status, notify: true };
  var draw = function (err) {
    var tot = Object.keys(R.scores || {}).length ? (Object.keys(R.scores).reduce(function (s, k) { return s + R.scores[k]; }, 0) / Object.keys(R.scores).length) : 0;
    var el = layer('apLayer', { tile: tile('sapphire', 'user'), t: esc(a.name), p: esc(j.title || '') + ' · قدّم ' + fdx(pdt(a.createdAt)), end: '<span class="pill ' + APS[a.status][0] + '"><i></i>' + APS[a.status][1] + '</span>' },
      kvHTML([['البريد', '<span class="ltr">' + esc(a.email) + '</span>'], ['الجوال', '<span class="ltr">' + esc(a.phone) + '</span>'], ['المدينة', esc(a.data.city || '')], ['الجنسية', esc(a.data.nationality || '')], ['المؤهل', esc(a.data.edu || '')], ['الخبرة', (a.data.years || 0) + ' سنة'],
        ['نبذة', esc(a.data.note || '')], ['السيرة الذاتية', a.cv ? '<a class="btn sm" href="api/?action=cv&id=' + a.id + '" target="_blank" rel="noopener">' + ic('file') + 'فتح ملف PDF</a>' : 'لم تُرفق']]) +
      '<div class="form" style="margin-top:12px">' + fldH('st', 'المرحلة', '<div class="seg2">' + Object.keys(APS).map(function (k) { return '<button type="button" data-apst="' + k + '" aria-pressed="' + (F.status === k) + '">' + APS[k][1] + '</button>'; }).join('') + '</div>', true, true) +
      '<div class="fld wide"><div class="fsub">' + ic('calendar') + 'المقابلة الشخصية</div></div>' +
      fldH('ap_date', 'التاريخ', '<input id="ap_date" data-ap="date" type="date" value="' + esc(R.date || '') + '">') + fldH('ap_time', 'الوقت', '<input id="ap_time" data-ap="time" type="time" dir="ltr" value="' + esc(R.time || '') + '">') +
      fldH('m', 'الطريقة', segH('mode', ['حضورية', 'عن بعد', 'هاتفية'], R.mode), false, true) + fldH('ap_panel', 'لجنة المقابلة', '<input id="ap_panel" data-ap="panel" maxlength="200" value="' + esc(R.panel || '') + '">', false, true) +
      '<div class="fld wide"><label>تقييم المقابلة</label><div class="evcrit">' + (d.crit || []).map(function (c) { return '<div class="evc"><span>' + esc(c[1]) + '</span><div class="evs">' + [1, 2, 3, 4, 5].map(function (v) { return '<button type="button" data-aps="' + c[0] + '" data-v="' + v + '" aria-checked="' + ((R.scores || {})[c[0]] === v) + '">' + v + '</button>'; }).join('') + '</div></div>'; }).join('') + '</div>' + (tot ? '<small class="fhint">المتوسط ' + tot.toFixed(2) + ' من 5</small>' : '') + '</div>' +
      fldH('r', 'التوصية', segH('rec', ['توظيف', 'احتياط', 'عدم توظيف'], R.rec), false, true) + fldH('ap_notes', 'ملاحظات اللجنة', '<textarea id="ap_notes" data-ap="notes" maxlength="2000">' + esc(R.notes || '') + '</textarea>', false, true) +
      '<label class="consent"><input type="checkbox" id="apNotify"' + (F.notify ? ' checked' : '') + '><span>أرسل للمتقدم بريدًا عند تغيير المرحلة (دعوة المقابلة، أو القبول مع رابط تسجيل بياناته، أو الاعتذار)</span></label></div>',
      '<div class="lerr" role="alert">' + esc(err || '') + '</div><button class="btn" data-lyclose="1">إغلاق</button>' + (d.canEdit ? '<button class="btn goldb" id="apSave">' + ic('check') + 'حفظ</button>' : ''), 'anm');
    var sync = function () { el.querySelectorAll('[data-ap]').forEach(function (x) { R[x.dataset.ap] = x.value; }); var n2 = el.querySelector('#apNotify'); if (n2) F.notify = n2.checked; };
    el.querySelectorAll('[data-apst]').forEach(function (b) { b.onclick = function () { sync(); F.status = b.dataset.apst; draw(); }; });
    el.querySelectorAll('[data-aps]').forEach(function (b) { b.onclick = function () { sync(); R.scores[b.dataset.aps] = +b.dataset.v; draw(); }; });
    bindSeg(el, R, function () { sync(); draw(); });
    if (window.FancySelect && FancySelect.scan) try { FancySelect.scan(el); } catch (e) { }
    var sv = el.querySelector('#apSave'); if (sv) sv.onclick = function () { sync(); if (F.status === 'interview' && !R.date) return draw('حدد تاريخ المقابلة'); sv.disabled = true;
      api({ action: 'appSet', id: a.id, status: F.status, review: R, notify: F.notify ? 1 : 0 }).then(function (r) { d.apps = d.apps.map(function (x) { return x.id === r.row.id ? r.row : x; }); el.close(); softRender(); toast('حُفظ' + (F.notify && F.status !== a.status ? ' وأُرسل البريد للمتقدم' : '')); }).catch(function (x) { draw(errText(x)); }); };
  };
  draw();
}

/* ---------- ربط الأحداث ---------- */
var _bindHrx0 = bindHrx;
bindHrx = function () {
  _bindHrx0();
  var g = function (id) { return document.getElementById(id); };
  if (g('actNew')) g('actNew').onclick = function () { actNew(''); };
  if (g('mckBtn')) g('mckBtn').onclick = function () { mobCheck(this); };
  if (g('evNew')) g('evNew').onclick = function () { evForm(null); };
  if (g('efq')) g('efq').oninput = function () { EF.q = this.value; softRender(); };
  document.querySelectorAll('[data-ev]').forEach(function (b) { if (b.tagName === 'BUTTON' && b.classList.contains('rqrow')) b.onclick = function () { evOpen(b.dataset.ev); }; });
  if (g('jbNew')) g('jbNew').onclick = function () { jbForm(null); };
  if (g('jfq')) g('jfq').oninput = function () { JF.q = this.value; softRender(); };
  if (g('jbCopy')) g('jbCopy').onclick = function () { var u = (jbData().data || {}).url || ''; (navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject()).then(function () { toast('نُسخ رابط صفحة الوظائف'); }, function () { toast(u); }); };
  document.querySelectorAll('[data-jbed]').forEach(function (b) { b.onclick = function () { var jj = (jbData().data.jobs || []).filter(function (x) { return x.id === +b.dataset.jbed; })[0]; if (jj) jbForm(jj); }; });
  document.querySelectorAll('[data-jbneed]').forEach(function (b) { b.onclick = function () { jbForm(null, b.dataset.jbneed); }; });
  document.querySelectorAll('[data-jbapps]').forEach(function (b) { b.addEventListener('click', function () { JF.job = +b.dataset.jbapps; JF.st = ''; }); });
  document.querySelectorAll('[data-app]').forEach(function (b) { b.onclick = function () { appOpen(b.dataset.app); }; });
  document.querySelectorAll('[data-act-open]').forEach(function (b) { b.onclick = function () { actOpen(b.dataset.actOpen, view === 'myhr'); }; });
  if (g('afq')) g('afq').oninput = function () { AF.q = this.value; softRender(); };
  if (g('cusNew')) g('cusNew').onclick = function () { cusForm(null, ''); };
  if (g('cfq')) g('cfq').oninput = function () { CF.q = this.value; softRender(); };
  var cd = document.querySelector('[data-cus-ret],[data-cus-ed],[data-cus-ack]') ? cusData().data : null;
  document.querySelectorAll('[data-cus-ret]').forEach(function (b) { b.onclick = function () { var x = cd.rows.filter(function (r) { return r.id === +b.dataset.cusRet; })[0]; if (x) cusReturn(x); }; });
  document.querySelectorAll('[data-cus-ed]').forEach(function (b) { b.onclick = function () { var x = cd.rows.filter(function (r) { return r.id === +b.dataset.cusEd; })[0]; if (x) cusForm(x); }; });
  document.querySelectorAll('[data-cus-ack]').forEach(function (b) { b.onclick = function () { b.disabled = true; api({ action: 'cusAck', id: +b.dataset.cusAck }).then(function (j) { cd.rows = cd.rows.map(function (r) { return r.id === j.row.id ? j.row : r; }); softRender(); toast('سُجّل إقرارك باستلام العهدة'); }).catch(function (e) { b.disabled = false; toast(errText(e)); }); }; });
};

/* ======================================================================
   ربط البصمة بالجوال ومقر الجهة: تنبيه بداية الدوام، ومراقبة النطاق أثناء الدوام
   ====================================================================== */
ALIAS['myatt-ck'] = ['myatt']; ALIAS['myatt-perm'] = ['myatt']; ALIAS['myatt-out'] = ['myatt'];
var GEO = { watch: null, out: 0, timer: null, asked: false, pend: '', last: null, exitAt: 0 };
(function () { var h = location.hash.slice(1); if (/^myatt-(ck|perm|out)$/.test(h)) GEO.pend = h.slice(6); window.addEventListener('hashchange', function () { var x = location.hash.slice(1); if (/^myatt-(ck|perm|out)$/.test(x)) GEO.pend = x.slice(6); }); })();
function geoD(a1, o1, a2, o2) { var R = 6371000, r = Math.PI / 180, dp = (a2 - a1) * r, dl = (o2 - o1) * r, h = Math.sin(dp / 2) * Math.sin(dp / 2) + Math.cos(a1 * r) * Math.cos(a2 * r) * Math.sin(dl / 2) * Math.sin(dl / 2); return 2 * R * Math.asin(Math.min(1, Math.sqrt(h))); }
function attT() { var c = CACHE.attToday; return c && c.data; }
/* الدقيقة الحالية بتوقيت المقر (لا بتوقيت الجهاز) */
function siteMin(d) { var n = new Date(), off = d && d.tzOff != null ? +d.tzOff : -n.getTimezoneOffset(); return (((n.getUTCHours() * 60 + n.getUTCMinutes() + off) % 1440) + 1440) % 1440; }
function inWork(d) { if (!d || d.remote) return false; var m = siteMin(d), f = function (t) { var p = String(t || '').split(':'); return +p[0] * 60 + +p[1]; }; return !d.weekend && m >= f(d.start) && m < f(d.end); }
/* تفعيل التنبيهات: عامل الخدمة + اشتراك Web Push */
function pushOn(btn) {
  var d = attT(); if (!('serviceWorker' in navigator) || !('PushManager' in window)) { toast(/iP(hone|ad)/.test(navigator.userAgent) ? 'على الآيفون: أضف المنصة إلى الشاشة الرئيسية من زر المشاركة، ثم افتحها منها وفعّل التنبيهات' : 'المتصفح لا يدعم التنبيهات؛ استخدم Chrome'); return; }
  if (btn) btn.disabled = true;
  Notification.requestPermission().then(function (p) {
    if (p !== 'granted') throw new Error('لم تسمح بالتنبيهات. فعّلها من إعدادات المتصفح للمنصة.');
    return navigator.serviceWorker.register('sw.js').then(function () { return navigator.serviceWorker.ready; });
  }).then(function (reg) {
    var k = d.vapid.replace(/-/g, '+').replace(/_/g, '/'), raw = atob(k + '==='.slice((k.length + 3) % 4)), key = new Uint8Array(raw.length); for (var i = 0; i < raw.length; i++) key[i] = raw.charCodeAt(i);
    return reg.pushManager.getSubscription().then(function (s) { return s || reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key }); });
  }).then(function (s) { var j = s.toJSON(); return api({ action: 'pushSub', endpoint: j.endpoint, p256dh: j.keys.p256dh, auth: j.keys.auth }); })
    .then(function () { d.push = true; softRender(); toast('فُعّلت التنبيهات على هذا الجهاز'); })
    .catch(function (e) { if (btn) btn.disabled = false; toast(e && e.message ? e.message : errText(e)); });
}
function geoNote(title, body, actions) {
  try { if (Notification.permission === 'granted' && navigator.serviceWorker) navigator.serviceWorker.getRegistration().then(function (r) { if (r) r.showNotification(title, { body: body, icon: 'icon-192.png', dir: 'rtl', lang: 'ar', tag: 'att-exit', renotify: true, requireInteraction: true, data: { url: '#myatt' }, actions: actions || [] }).catch(function () { }); }).catch(function () { }); } catch (e) { }
}
/* مراقبة النطاق أثناء الدوام (تعمل والمنصة مفتوحة على الجوال) */
function geoStart() {
  var d = attT(); if (role !== 'staff' || !d || !d.on || !navigator.geolocation) return geoStop();
  var need = d.in && !d.out && inWork(d) && d.sites.length;
  if (!need) return geoStop();
  if (GEO.watch !== null) return;
  var go = function () { GEO.watch = navigator.geolocation.watchPosition(geoTick, function () { }, { enableHighAccuracy: true, maximumAge: 30000, timeout: 60000 }); };
  if (navigator.permissions && navigator.permissions.query) navigator.permissions.query({ name: 'geolocation' }).then(function (p) { if (p.state === 'granted') go(); }, go); else go();
}
function geoStop() { if (GEO.watch !== null) { navigator.geolocation.clearWatch(GEO.watch); GEO.watch = null; } }
function geoTick(p) {
  var d = attT(); if (!d || !d.in || d.out || !inWork(d)) return geoStop();
  var c = p.coords; if (c.accuracy > 120) return;
  var best = d.sites.reduce(function (b, x) { var m = geoD(c.latitude, c.longitude, x.lat, x.lng); return !b || m < b.m ? { s: x, m: m } : b; }, null); if (!best) return;
  GEO.last = { lat: c.latitude, lng: c.longitude, acc: c.accuracy, m: best.m, s: best.s };
  var outside = best.m > best.s.radius + Math.min(c.accuracy / 2, 25);
  if (outside) { GEO.out++; if (GEO.out >= 2 && !document.getElementById('exLayer') && !GEO.permSent) geoExit(best); }
  else { GEO.out = 0; if (GEO.timer) { clearTimeout(GEO.timer); GEO.timer = null; } var L = document.getElementById('exLayer'); if (L) { L.close(); toast('عدت إلى نطاق المقر'); } }
}
function geoExit(best) {
  GEO.exitAt = Date.now();
  geoNote('خرجت من نطاق المقر', 'أنت على بُعد ' + Math.round(best.m) + ' م من ' + best.s.name + '. قدّم استئذانًا لمسؤولك المباشر أو سجّل انصرافك، وإلا يُحتسب انصرافًا بعد ١٠ دقائق.', [{ action: 'perm', title: 'طلب استئذان' }, { action: 'out', title: 'تسجيل انصراف' }]);
  exitDlg(best);
  if (GEO.timer) clearTimeout(GEO.timer);
  GEO.timer = setTimeout(function () { var g = GEO.last; if (!g || g.m <= g.s.radius + 25 || GEO.permSent) return; geoCheckout(true); }, 10 * 60 * 1000);
}
function geoCheckout(auto, btn) {
  var g = GEO.last; if (!g) return;
  if (btn) btn.disabled = true;
  api({ action: 'attCheck', lat: g.lat, lng: g.lng, acc: g.acc, exit: 1, auto: auto ? 1 : 0, tz: devTZ() }).then(function (j) { seed('attToday', j); geoStop(); if (GEO.timer) { clearTimeout(GEO.timer); GEO.timer = null; } var L = document.getElementById('exLayer'); if (L) L.close(); Object.keys(CACHE).forEach(function (k) { if (k.indexOf('myatt:') === 0) delete CACHE[k]; }); softRender(); toast(auto ? 'احتُسب انصرافك لمغادرتك نطاق المقر' : 'سُجّل انصرافك'); if (auto) geoNote('احتُسب انصرافك', 'غادرت نطاق المقر دون استئذان، فسُجّل انصرافك تلقائيًا.'); })
    .catch(function (e) { if (btn) btn.disabled = false; toast(errText(e)); });
}
function exitDlg(best) {
  var sups = (formsData() || {}).sups || [], last = reqRows().filter(function (r) { return ME && r.ref === ME.ref && r.data && r.data.supervisor; })[0], sup = last ? last.data.supervisor : '';
  var now = new Date(), hhmm = function (d) { return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); }, back = new Date(now.getTime() + 3600000);
  var d = attT(), endM = String(d.end || '16:00'); if (hhmm(back) > endM) back = new Date(now.getFullYear(), now.getMonth(), now.getDate(), +endM.slice(0, 2), +endM.slice(3, 5));
  var F = { sup: sup, to: hhmm(back), why: '' };
  var el = layer('exLayer', { tile: tile('garnet', 'pin'), t: 'خرجت من نطاق المقر', p: 'على بُعد ' + Math.round(best.m) + ' م من ' + esc(best.s.name) },
    '<div class="note warn">' + ic('alert') + '<span>أنت خارج نطاق ' + best.s.radius + ' م من المقر أثناء الدوام. اختر أحد الأمرين، وإن لم تختر ولم تعد إلى المقر يُحتسب انصرافك بعد <b>١٠ دقائق</b>.</span></div>' +
    '<div class="exopts"><div class="exo"><h3>' + ic('clock') + 'طلب استئذان من المسؤول المباشر</h3><div class="form">' +
    (sups.length ? '<div class="fld wide"><label>المسؤول المباشر <i class="rq">*</i></label>' + ssel('exSup', sups.map(function (x) { return { v: x.id, n: x.name, d: x.title || '', ic: 'user' }; }), F.sup, 'اختر مسؤولك المباشر', function (v) { F.sup = v; }, 'المسؤول المباشر') + '</div>' : '') +
    fldH('ex_to', 'أعود حتى الساعة', '<input id="ex_to" type="time" dir="ltr" value="' + F.to + '">', true) + fldH('ex_why', 'السبب', '<input id="ex_why" maxlength="300" placeholder="مثال: مراجعة جهة حكومية">', true, true) +
    '</div><div class="lerr" id="exErr" role="alert"></div><button class="btn goldb" id="exPerm">' + ic('send') + 'إرسال الاستئذان</button></div>' +
    '<div class="exo"><h3>' + ic('out') + 'انتهى عملي اليوم</h3><p>يُسجَّل انصرافك الآن بوقت المغادرة.</p><button class="btn prim" id="exOut">' + ic('finger') + 'تسجيل انصرافي الآن</button></div></div>', '', 'anm');
  el.querySelector('#exOut').onclick = function () { geoCheckout(false, this); };
  el.querySelector('#exPerm').onclick = function () {
    var b = this, er = el.querySelector('#exErr'), to = el.querySelector('#ex_to').value, why = el.querySelector('#ex_why').value.trim(), from = hhmm(new Date());
    if (why.length < 3) { er.textContent = 'اكتب سبب الاستئذان'; return; } if (!to || to <= from) { er.textContent = 'وقت العودة يجب أن يكون بعد الآن'; return; } if (sups.length && !F.sup) { er.textContent = 'اختر مسؤولك المباشر'; return; }
    b.disabled = true; var t = new Date(), day = t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2);
    api({ action: 'reqCreate', type: 'perm', data: { kind: 'خروج أثناء الدوام', day: day, fromT: from, toT: to, reason: why + ' (عند مغادرة نطاق المقر)', supervisor: F.sup } }).then(function (j) {
      GEO.permSent = true; if (GEO.timer) { clearTimeout(GEO.timer); GEO.timer = null; } var rows = reqRows().slice(); j.request.mine = true; rows.unshift(j.request); seed('reqs', rows);
      el.close(); toast('أُرسل الاستئذان ' + j.request.no + ' لمسؤولك المباشر، ولن يُحتسب انصرافك'); softRender();
    }).catch(function (e) { b.disabled = false; er.textContent = errText(e); });
  };
}
/* بطاقة «حضوري»: المقر وحالة التنبيهات */
var _myatt1 = VIEWS.myatt;
VIEWS.myatt = function () {
  var h = _myatt1(), d = attT(); if (!d || !d.on) return h;
  var pushOk = d.push && typeof Notification !== 'undefined' && Notification.permission === 'granted';
  if (d.remote) return h.replace('<div class="lerr" id="mckErr"', '<div class="mlink"><span class="tok">' + ic('globe') + 'عمل عن بعد · بلا نطاق ولا مواعيد</span><span>' + ic('clock') + 'التوقيت: <b>' + esc(tzName(d.tz)) + '</b></span></div><div class="lerr" id="mckErr"');
  var extra = '<div class="mlink">' + (d.sites.length ? '<span>' + ic('pin') + 'مقرك: <b>' + esc(d.sites.map(function (x) { return x.name; }).join('، ')) + '</b> · النطاق ' + d.sites[0].radius + ' م</span>' : '<span class="tbad">' + ic('alert') + 'لم يُحدَّد مقر لجهتك بعد</span>') +
    (d.tz && d.tz !== 'Asia/Riyadh' ? '<span>' + ic('clock') + 'بتوقيت <b>' + esc(tzName(d.tz)) + '</b></span>' : '') +
    (pushOk ? '<span class="tok">' + ic('bell') + 'التنبيهات مفعّلة</span>' : '<button class="btn sm goldb" id="pushOn">' + ic('bell') + 'فعّل تنبيه بداية الدوام</button>') +
    (GEO.watch !== null ? '<span class="tok">' + ic('eye') + 'متابعة النطاق تعمل</span>' : '') + '</div>';
  return h.replace('<div class="lerr" id="mckErr"', extra + '<div class="lerr" id="mckErr"');
};
var _bindHrx1 = bindHrx;
bindHrx = function () {
  _bindHrx1();
  if (role !== 'staff') return;
  var c = need('attToday', function () { return api({ action: 'attToday', tz: devTZ() }); }, 60000);
  if (c.data && c.data.on && c.data.in && !c.data.out) formsData();
  var pb = document.getElementById('pushOn'); if (pb) pb.onclick = function () { pushOn(pb); };
  if (c.data) {
    geoStart();
    var mb = document.getElementById('mckBtn'); if (mb && GEO.pulse > Date.now()) mb.classList.add('pulse');
    if (GEO.pend && view === 'myatt') { var a = GEO.pend; GEO.pend = '';
      if (a === 'ck') { GEO.pulse = Date.now() + 5000; var b0 = document.getElementById('mckBtn'); if (b0) b0.scrollIntoView({ block: 'center' }); }
      if ((a === 'perm' || a === 'out') && GEO.last) { if (a === 'out') geoCheckout(false); else exitDlg({ m: GEO.last.m, s: GEO.last.s }); } }
  }
};

/* ======================================================================
   تثبيت التطبيق وتفعيل التنبيهات والموقع: إلزامي لمن تُفعَّل له البصمة من الجوال
   ====================================================================== */
var INST = { evt: null, done: false };
window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); INST.evt = e; gateDraw(); });
window.addEventListener('appinstalled', function () { INST.done = true; INST.evt = null; gateDraw(); });
ALIAS['myatt-chk'] = ['myatt'];
(function () { var h = location.hash.slice(1); if (h === 'myatt-chk') GEO.pend = 'chk'; window.addEventListener('hashchange', function () { if (location.hash.slice(1) === 'myatt-chk') GEO.pend = 'chk'; }); })();
function isPhone() { return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || (window.matchMedia && matchMedia('(pointer: coarse)').matches && window.screen.width < 900); }
function isIOS() { return /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); }
function standalone() { return (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true; }
var GATE = { geo: null };
function gateNeed() { var d = attT(); return role === 'staff' && d && d.on && !d.remote && isPhone(); }
function gateState() {
  var d = attT() || {};
  return { inst: standalone() || INST.done, push: !!(d.push && typeof Notification !== 'undefined' && Notification.permission === 'granted'), geo: GATE.geo === 'granted' };
}
function gateDraw() {
  var L = document.getElementById('gateLayer');
  if (!gateNeed()) { if (L) L.remove(); return; }
  var st = gateState(); if (st.inst && st.push && st.geo) { if (L) { L.remove(); toast('اكتمل التفعيل. البصمة من الجوال جاهزة'); } return; }
  var ios = isIOS(), canPrompt = !!INST.evt;
  var step = function (ok, n, t, body, btn) { return '<li class="' + (ok ? 'ok' : '') + '"><i>' + (ok ? ic('check') : n) + '</i><div><b>' + t + '</b>' + (ok ? '<small>تم</small>' : body + (btn || '')) + '</div></li>'; };
  var instBody = st.inst ? '' : ios ? '<small>اضغط زر المشاركة ' + '<span class="shr">⎙</span>' + ' أسفل سفاري، ثم «إضافة إلى الشاشة الرئيسية»، ثم افتح «بنيان HR» من الشاشة الرئيسية وأكمل منه.</small>'
    : canPrompt ? '<small>يُضاف إلى الشاشة الرئيسية كتطبيق، ويعمل منه الحضور والتنبيهات.</small>' : '<small>من قائمة المتصفح ⋮ اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية»، ثم افتحه من الشاشة الرئيسية.</small>';
  var html = '<div class="gate"><div class="gcard"><span class="glogo"><img src="' + LOGO + '" alt=""></span><h2>فعّل البصمة من جوالك</h2><p>هذه الخطوات إلزامية لتسجيل حضورك وانصرافك من المقر، ولا تأخذ أكثر من دقيقة.</p><ol class="gsteps">' +
    step(st.inst, 1, 'ثبّت تطبيق «بنيان HR»', instBody, !st.inst && canPrompt ? '<button class="btn goldb" id="gInst">' + ic('dl') + 'تثبيت التطبيق</button>' : '') +
    step(st.push, 2, 'فعّل التنبيهات', '<small>يصلك تنبيه عند بداية الدوام ونهايته، وللتأكد من وجودك في المقر أثناءه.</small>', !st.push ? '<button class="btn ' + (st.inst || !ios ? 'goldb' : '') + '" id="gPush"' + (ios && !st.inst ? ' disabled' : '') + '>' + ic('bell') + 'تفعيل التنبيهات</button>' : '') +
    step(st.geo, 3, 'اسمح بتحديد الموقع', '<small>' + (GATE.geo === 'denied' ? 'رُفض الإذن. افتح إعدادات المتصفح أو التطبيق ← الأذونات ← الموقع ← «السماح».' : 'يُستخدم للتحقق من وجودك داخل نطاق مقر جهتك فقط أثناء الدوام.') + '</small>', !st.geo ? '<button class="btn goldb" id="gGeo">' + ic('pin') + 'السماح بالموقع</button>' : '') +
    '</ol><small class="gnote">' + ic('info') + 'لا يُتتبَّع موقعك خارج وقت الدوام، ولا يُحفظ إلا عند البصمة.</small></div></div>';
  if (!L) { L = document.createElement('div'); L.id = 'gateLayer'; L.setAttribute('role', 'dialog'); L.setAttribute('aria-modal', 'true'); document.body.appendChild(L); }
  L.innerHTML = html;
  var g = function (id) { return L.querySelector('#' + id); };
  if (g('gInst')) g('gInst').onclick = function () { var e = INST.evt; if (!e) return; e.prompt(); e.userChoice.then(function (c) { if (c.outcome === 'accepted') INST.done = true; INST.evt = null; gateDraw(); }); };
  if (g('gPush')) g('gPush').onclick = function () { pushOn(this); var t = setInterval(function () { if (gateState().push) { clearInterval(t); gateDraw(); } }, 800); setTimeout(function () { clearInterval(t); gateDraw(); }, 20000); };
  if (g('gGeo')) g('gGeo').onclick = function () { var b = this; b.disabled = true; navigator.geolocation.getCurrentPosition(function () { GATE.geo = 'granted'; gateDraw(); geoStart(); }, function (er) { GATE.geo = er && er.code === 1 ? 'denied' : null; b.disabled = false; gateDraw(); }, { enableHighAccuracy: true, timeout: 20000 }); };
}
function gateCheck() {
  if (!gateNeed()) return gateDraw();
  if (GATE.geo === null && navigator.permissions && navigator.permissions.query) navigator.permissions.query({ name: 'geolocation' }).then(function (p) { GATE.geo = p.state === 'granted' ? 'granted' : p.state === 'denied' ? 'denied' : ''; gateDraw(); p.onchange = function () { GATE.geo = p.state; gateDraw(); }; }, function () { GATE.geo = ''; gateDraw(); });
  else gateDraw();
}
/* التحقق من التواجد عند فتح تنبيه «تأكيد التواجد» */
function geoCheckOnce() {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(function (p) {
    geoTick(p); geoTick(p);
    var g = GEO.last; if (g && g.m <= g.s.radius + Math.min(p.coords.accuracy / 2, 25)) toast('أنت داخل نطاق ' + g.s.name + '. شكرًا لك');
  }, function () { toast('تعذّر تحديد موقعك؛ فعّل خدمة الموقع'); }, { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 });
}
var _bindHrx2 = bindHrx;
bindHrx = function () {
  _bindHrx2();
  if (role !== 'staff') return;
  if ('serviceWorker' in navigator && !GATE.sw) { GATE.sw = 1; navigator.serviceWorker.register('sw.js').catch(function () { }); }
  if (attT()) gateCheck();
  if (GEO.pend === 'chk' && view === 'myatt' && attT()) { GEO.pend = ''; geoCheckOnce(); }
};

/* ---------- الجوال: كل جدول يحمل عناوين أعمدته ليُعرض بطاقات ---------- */
(function () {
  var SKIP = '.mini, .rtab, .matrix, .sappr';
  function label(t) {
    if (t.matches(SKIP)) return;
    var hs = [].map.call(t.querySelectorAll('thead th'), function (th) { return th.textContent.replace(/\s+/g, ' ').trim(); });
    if (!hs.length) return;
    t.classList.add('mc');
    [].forEach.call(t.querySelectorAll('tbody tr, tfoot tr'), function (tr) {
      var i = 0;
      [].forEach.call(tr.children, function (td, k) {
        if (!td.hasAttribute('data-l')) td.setAttribute('data-l', (td.colSpan || 1) > 1 ? '' : (hs[i] || ''));
        if (k > 0 && !td.dataset.mv && td.firstChild && !(td.childNodes.length === 1 && td.firstElementChild && td.firstElementChild.classList.contains('mv'))) { var w = document.createElement('div'); w.className = 'mv'; while (td.firstChild) w.appendChild(td.firstChild); td.appendChild(w); td.dataset.mv = 1; }
        if (k === 0 && (td.querySelector('.av, .pcell, .who, b') || /المنسوب|الموظف|المتقدم|الجهة|اليوم/.test(hs[0] || ''))) td.classList.add('rh');
        i += td.colSpan || 1;
      });
      if (tr.children.length > 5 && !tr.querySelector('td[colspan]')) tr.classList.add('g2');
    });
  }
  var pend = false;
  function run() { pend = false; [].forEach.call(document.querySelectorAll('.tw > table'), label); fixTabs(); }
  /* الشريحة المختارة تظهر كاملة دون أن تتحرك الصفحة */
  function fixTabs() {
    [].forEach.call(document.querySelectorAll('.vtabs'), function (v) {
      if (v.scrollWidth <= v.clientWidth + 2 || v.dataset.sc === location.hash) return;
      var s = v.querySelector('[aria-selected="true"]'); if (!s) return;
      v.dataset.sc = location.hash;
      var vr = v.getBoundingClientRect(), sr = s.getBoundingClientRect();
      if (sr.left < vr.left || sr.right > vr.right) v.scrollLeft += (sr.left + sr.width / 2) - (vr.left + vr.width / 2);
    });
  }
  try {
    new MutationObserver(function () { if (!pend) { pend = true; requestAnimationFrame(run); } }).observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) { }
})();

/* ---------- إزالة المرفقات: لمالك المنصة وحده، بجانب زر «عرض» ---------- */
function isOwner() { return !!(SESSION && SESSION.owner === true); }
function fileIdOf(u) { var m = String(u || '').match(/[?&]id=([a-f0-9]{32})/); return m ? m[1] : ''; }
function frmBtn(u) {
  var id = isOwner() ? fileIdOf(u) : '';
  return id ? '<button type="button" class="frm" data-frm="' + id + '" title="إزالة المرفق" aria-label="إزالة المرفق">' + ic('trash') + '<span>تأكيد الإزالة</span></button>' : '';
}
var OTHER_FILES = [['photo', 'الصورة الشخصية', 'user'], ['degreeFile', 'المؤهل العلمي', 'doc'], ['certFiles', 'الشهادات والدورات', 'doc'], ['bankProof', 'إثبات الحساب البنكي', 'bank']];
var _docRows = docRows;
docRows = function (docs, withNo) {
  var h = _docRows(docs, withNo);
  if (!isOwner()) return h;
  h = h.replace(/(<a href="([^"]+)" data-fvt="[^"]*">[\s\S]*?<\/a>)/g, function (m, a, u) { return a + frmBtn(u.replace(/&amp;/g, '&')); });
  /* بقية المرفقات (ومنها الصورة الشخصية) تظهر هنا للمالك فقط ليزيلها */
  var s = (STAFF || []).filter(function (x) { return x.docs === docs; })[0];
  if (!s || !withNo) return h;
  var rows = OTHER_FILES.map(function (o) {
    var us = urls(s.r[o[0]]); if (!us.length) return '';
    return '<div class="doc"><span class="th">' + ic(o[2]) + '<small>ملف</small></span><div><b>' + o[1] + '</b><div class="flinks">' + us.map(function (u, i) {
      return '<a href="' + esc(u) + '" data-fvt="' + esc(o[1] + (us.length > 1 ? ' · ' + (i + 1) : '')) + '">' + ic('eye') + 'عرض' + (us.length > 1 ? ' ' + (i + 1) : '') + '</a>' + frmBtn(u);
    }).join('') + '</div></div></div>';
  }).join('');
  return h + (rows ? '<h4 class="frm-h">' + ic('archive') + 'مرفقات أخرى</h4><div class="docs" data-fvg>' + rows + '</div>' : '');
};
document.addEventListener('click', function (e) {
  var b = e.target.closest && e.target.closest('[data-frm]'); if (!b) return;
  e.preventDefault(); e.stopPropagation();
  if (!b.classList.contains('arm')) {
    [].forEach.call(document.querySelectorAll('.frm.arm'), function (o) { o.classList.remove('arm'); });
    b.classList.add('arm'); clearTimeout(b._t); b._t = setTimeout(function () { b.classList.remove('arm'); }, 4000);
    return;
  }
  clearTimeout(b._t); b.disabled = true; b.classList.add('busy');
  api({ action: 'fileRemove', id: b.getAttribute('data-frm') }).then(function () {
    Object.keys(CACHE).forEach(function (k) { if (/^(aud|msg):/.test(k) || k === 'audit') delete CACHE[k]; });
    return reloadList();
  }).then(function () { softRender(); toast('أُزيل المرفق من الملف، وسُجّل في سجل العمليات'); })
    .catch(function (er) { b.disabled = false; b.classList.remove('busy', 'arm'); toast('تعذّرت الإزالة: ' + ((er && er.message) || '')); });
}, true);

/* ---------- توقيت المقرات ---------- */
var TZS = [['Asia/Riyadh', 'السعودية (مكة المكرمة)'], ['Asia/Jakarta', 'إندونيسيا - غرب (جاكرتا)'], ['Asia/Makassar', 'إندونيسيا - وسط (مكاسر)'], ['Asia/Jayapura', 'إندونيسيا - شرق (جايابورا)'], ['Africa/Nairobi', 'كينيا (نيروبي)'], ['Africa/Addis_Ababa', 'إثيوبيا (أديس أبابا)'], ['Asia/Dubai', 'الإمارات (دبي)'], ['Africa/Cairo', 'مصر (القاهرة)'], ['Europe/Istanbul', 'تركيا (إسطنبول)'], ['Asia/Karachi', 'باكستان (كراتشي)'], ['Asia/Kuala_Lumpur', 'ماليزيا (كوالالمبور)']];
function tzName(z) { for (var i = 0; i < TZS.length; i++) if (TZS[i][0] === z) return TZS[i][1]; return z || 'السعودية (مكة المكرمة)'; }
function tzOpts(cur) { cur = cur || 'Asia/Riyadh'; var L = TZS.slice(); if (!L.some(function (x) { return x[0] === cur; })) L.push([cur, cur]); return L.map(function (x) { return '<option value="' + x[0] + '"' + (x[0] === cur ? ' selected' : '') + '>' + esc(x[1]) + '</option>'; }).join(''); }
/* تخمين التوقيت من الإحداثيات للبلدان التي تعمل فيها المجموعة */
function tzGuess(la, lo) {
  if (la > -11.5 && la < 6.5 && lo > 94 && lo < 141.5) return lo < 114.6 ? 'Asia/Jakarta' : lo < 125.5 ? 'Asia/Makassar' : 'Asia/Jayapura';
  if (la > 16 && la < 32.5 && lo > 34.4 && lo < 55.7) return 'Asia/Riyadh';
  if (la > -4.8 && la < 5.1 && lo > 33.9 && lo < 41.95) return 'Africa/Nairobi';
  if (la > 3.4 && la < 15 && lo > 33 && lo < 48) return 'Africa/Addis_Ababa';
  return '';
}

/* ======================================================================
   حساب مزدوج: من له حساب نظام وسجل منسوب معًا يختار عند الدخول
   «واجهة الموظف» أو «واجهة النظام»، ويبدّل بينهما من الشريط العلوي
   ====================================================================== */
var MODE = { real: '', dual: false };
/* اسم واجهة الحساب بحسب دوره */
function sysLabel(r) { return { ceo: 'واجهة المدير العام', hr: 'واجهة الموارد البشرية', viewer: 'واجهة الاطلاع' }[r] || 'واجهة النظام'; }
function sysIcon(r) { return { ceo: 'chart', hr: 'users' }[r] || 'grid'; }
function sysHint(r) { return { ceo: 'لوحة القيادة، والاعتمادات، والتقارير، والمنسوبون', hr: 'المنسوبون، والطلبات، والحضور، والرواتب' }[r] || 'لوحة القيادة، والمنسوبون، والطلبات، والإعدادات'; }
function modeKey() { return 'bhr:mode'; }
function modeGet() { try { return sessionStorage.getItem(modeKey()) || ''; } catch (e) { return ''; } }
function modeSet(m) { try { if (m) sessionStorage.setItem(modeKey(), m); else sessionStorage.removeItem(modeKey()); } catch (e) { } }
var _enterApp0 = enterApp;
enterApp = function (u) {
  MODE.dual = !!(u && u.role !== 'staff' && u.hasRecord); MODE.real = u ? u.role : '';
  if (!MODE.dual) return _enterApp0(u);
  var m = modeGet();
  if (m !== 'staff' && m !== 'sys') return modePick(u);
  return _enterApp0(m === 'staff' ? Object.assign({}, u, { role: 'staff' }) : u);
};
function modePick(u) {
  var L = document.getElementById('modeLayer'); if (!L) { L = document.createElement('div'); L.id = 'modeLayer'; L.setAttribute('role', 'dialog'); L.setAttribute('aria-modal', 'true'); L.setAttribute('aria-labelledby', 'mdT'); document.body.appendChild(L); }
  var nm = firstOf(u.name || u.email);
  L.innerHTML = '<div class="gate"><div class="gcard mpk"><span class="glogo"><img src="' + LOGO + '" alt=""></span><h2 id="mdT">أهلًا ' + esc(nm) + '، بأي واجهة تدخل؟</h2><p>لحسابك واجهتان، وتستطيع التبديل بينهما في أي وقت من الشريط العلوي.</p>' +
    '<div class="mpick"><button type="button" data-mode="staff">' + tile('teal', 'user') + '<b>واجهة الموظف</b><small>صفحتي، وطلباتي، وحضوري، والتعاميم، وملفي</small></button>' +
    '<button type="button" data-mode="sys">' + tile('sapphire', sysIcon(u.role)) + '<b>' + sysLabel(u.role) + '</b><small>' + sysHint(u.role) + '</small></button></div></div></div>';
  return new Promise(function (res) {
    L.querySelectorAll('[data-mode]').forEach(function (b) { b.onclick = function () {
      var m = b.dataset.mode; modeSet(m); L.remove();
      try { history.replaceState(null, '', location.pathname + location.search + (m === 'staff' ? '#me' : '#home')); } catch (e) { }
      res(_enterApp0(m === 'staff' ? Object.assign({}, u, { role: 'staff' }) : u));
    }; });
    var f = L.querySelector('[data-mode]'); if (f) f.focus();
  });
}
var _topHTML0 = topHTML;
topHTML = function () {
  var h = _topHTML0(); if (!MODE.dual) return h;
  var toStaff = role !== 'staff', sl = sysLabel(MODE.real);
  return h.replace('<button class="ib" id="theme"', '<button type="button" class="btn sm modesw" id="modeSw" title="' + (toStaff ? 'التبديل إلى واجهة الموظف' : 'التبديل إلى ' + sl) + '">' + ic(toStaff ? 'user' : sysIcon(MODE.real)) + '<span>' + (toStaff ? 'واجهة الموظف' : sl) + '</span></button><button class="ib" id="theme"');
};
document.addEventListener('click', function (e) {
  var b = e.target.closest && e.target.closest('#modeSw'); if (!b) return;
  var m = role === 'staff' ? 'sys' : 'staff'; modeSet(m); b.disabled = true;
  location.replace(location.pathname + location.search + (m === 'staff' ? '#me' : '#home')); setTimeout(function () { location.reload(); }, 50);
}, true);
var _logout0 = logout;
logout = function () { modeSet(''); var L = document.getElementById('modeLayer'); if (L) L.remove(); return _logout0(); };

window.addEventListener('hashchange', route);
boot();
})();
