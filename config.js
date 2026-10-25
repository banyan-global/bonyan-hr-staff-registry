/* ============================================================
   Bonyan HR · Global Staff Registry — الإعدادات
   هذا هو الملف الوحيد الذي تحتاج تعديله عادةً.
   ============================================================ */
window.APP_CONFIG = {

  /* ١) رابط تطبيق الويب من Google Apps Script (ينتهي بـ /exec)
        اتركه فارغًا ليعمل الموقع في "وضع المعاينة" دون إرسال بيانات. */
  GAS_URL: '',

  /* ٢) اللغات المتاحة واللغة الافتراضية */
  LANGS: ['ar', 'en', 'id'],
  DEFAULT_LANG: 'ar',

  /* ٣) اسم الجهة */
  ORG: {
    ar: 'مجموعة بنيان العالمية',
    en: 'Bonyan International Group',
    id: 'Bonyan International Group'
  },

  /* ٤) الشعار الرئيسي
        local: مسار نسخة محلية داخل المستودع (اختياري)
        drive: معرّف الملف في Google Drive (يُستخدم تلقائيًا إن لم توجد النسخة المحلية) */
  MAIN_LOGO: {
    name: { ar: 'شركة بنيان', en: 'Bonyan', id: 'Bonyan' },
    local: 'assets/img/logos/bonyan.png',
    drive: '15coxCS7UqEDjD4TYBf9w0nmvkF4JSShI'
  },

  /* ٥) شعارات الشريط المتحرك (بألوانها الأصلية) */
  STRIP_LOGOS: [
    { name: { ar: 'جامعة بنيان', en: 'Bonyan University', id: 'Universitas Bonyan' }, local: 'assets/img/logos/bonyan-university.png', drive: '1FbmJFRqTY_2Ql1XCI-K8fQ6xkMp6W-AX' },
    { name: { ar: 'بنيان الإنسانية', en: 'Bonyan Humanitarian', id: 'Bonyan Kemanusiaan' }, local: 'assets/img/logos/bonyan-humanitarian.png', drive: '1-w7IvRiTgs793YEyZE-KKDBZsRgKhUXE' },
    { name: { ar: 'دار التمكين', en: 'Dar Al-Tamkeen', id: 'Dar Al-Tamkeen' }, local: 'assets/img/logos/dar-altamkeen.png', drive: '1-MBCgpk3jo8eYzKqz9MFxMbWumk9lWL6' },
    { name: { ar: 'وقف بنيان', en: 'Bonyan Endowment', id: 'Wakaf Bonyan' }, local: 'assets/img/logos/bonyan-waqf.png', drive: '19dP8gD5W74gpW9Gg6KG6nMx5C_NtEu8s' },
    { name: { ar: 'آفاق', en: 'Afaq', id: 'Afaq' }, local: 'assets/img/logos/afaq.png', drive: '1M65eWMon9PaqdG7bx6_lUDjw1lKSMvL5' },
    { name: { ar: 'بنيان للتعليم عن بعد', en: 'Bonyan Distance Learning', id: 'Bonyan Pendidikan Jarak Jauh' }, local: 'assets/img/logos/bonyan-distance.png', drive: '1hjo-eTArMHWfZNAx36YI4GQ280m_HLS7' },
    { name: { ar: 'أكاديمية بنيان', en: 'Bonyan Academy', id: 'Akademi Bonyan' }, local: 'assets/img/logos/bonyan-academy.png', drive: '1kwRsFhK9Kb3M_AKgoJpgf-PTKYl1fgZl' },
    { name: { ar: 'مركز بنيان للأبحاث', en: 'Bonyan Research Center', id: 'Pusat Riset Bonyan' }, local: 'assets/img/logos/bonyan-research.png', drive: '1uKM7ralWqzLHBST_pGEEVnnDEtzm_i0s' },
    { name: { ar: 'طاقات', en: 'Taqat', id: 'Taqat' }, local: 'assets/img/logos/taqat.png', drive: '1v8gK4VSmKEZDFxSDaOh9LcZC4bRG7s2G' },
    { name: { ar: 'مقرأة بنيان', en: 'Bonyan Maqraa', id: 'Maqraa Bonyan' }, local: 'assets/img/logos/bonyan-maqraa.png', drive: '1P0s-7h8kktyvXx_pIdDhQjRG3pmujj1Z' },
    { name: { ar: 'كلية المعارف', en: 'Al-Maarif College', id: 'Kolese Al-Maarif' }, local: 'assets/img/logos/almaarif.png', drive: '1TvrHUUdrk-BSSKIR69xXDzPFGA24_uHz' },
    { name: { ar: 'كفاءة تقنية', en: 'Kafaa Tech', id: 'Kafaa Tech' }, local: 'assets/img/logos/kafaa-tech.png', drive: '15ow0Jq3kGcPagKCcHYQoKHDdOxDYQLG4' },
    { name: { ar: 'تمكين التعليم', en: 'Tamkeen Education', id: 'Tamkeen Pendidikan' }, local: 'assets/img/logos/tamkeen-education.png', drive: '1xlhfUeMlUO-Jqg3kX3WJk6eRUP9bLMmb' },
    { name: { ar: 'رقيم', en: 'Raqeem', id: 'Raqeem' }, local: 'assets/img/logos/raqeem.jpg', drive: '18fjExF6djDb71BRDz_RPKvuiLQlp3C5B' }
  ],

  /* ٦) الجهات التي تظهر في سؤال "الجهة" داخل النموذج */
  ENTITIES: [
    { v: 'bonyan', ar: 'شركة بنيان', en: 'Bonyan Company', id: 'Perusahaan Bonyan' },
    { v: 'bonyan-university', ar: 'جامعة بنيان', en: 'Bonyan University', id: 'Universitas Bonyan' },
    { v: 'bonyan-university-eg', ar: 'جامعة بنيان مصر', en: 'Bonyan University Egypt', id: 'Universitas Bonyan Mesir' },
    { v: 'bonyan-humanitarian', ar: 'بنيان الإنسانية', en: 'Bonyan Humanitarian', id: 'Bonyan Kemanusiaan' },
    { v: 'dar-altamkeen', ar: 'دار التمكين', en: 'Dar Al-Tamkeen', id: 'Dar Al-Tamkeen' },
    { v: 'bonyan-waqf', ar: 'وقف بنيان', en: 'Bonyan Endowment', id: 'Wakaf Bonyan' },
    { v: 'afaq', ar: 'آفاق', en: 'Afaq', id: 'Afaq' },
    { v: 'bonyan-distance', ar: 'بنيان للتعليم عن بعد', en: 'Bonyan Distance Learning', id: 'Bonyan Pendidikan Jarak Jauh' },
    { v: 'bonyan-academy', ar: 'أكاديمية بنيان', en: 'Bonyan Academy', id: 'Akademi Bonyan' },
    { v: 'bonyan-research', ar: 'مركز بنيان للأبحاث', en: 'Bonyan Research Center', id: 'Pusat Riset Bonyan' },
    { v: 'altibyan', ar: 'معهد التبيان', en: 'Al-Tibyan Institute', id: 'Institut Al-Tibyan' },
    { v: 'chinese-center', ar: 'المركز الصيني الثقافي', en: 'Chinese Cultural Center', id: 'Pusat Budaya Tiongkok' },
    { v: 'taqat', ar: 'طاقات', en: 'Taqat', id: 'Taqat' },
    { v: 'bonyan-maqraa', ar: 'مقرأة بنيان', en: 'Bonyan Maqraa', id: 'Maqraa Bonyan' },
    { v: 'almaarif', ar: 'كلية المعارف', en: 'Al-Maarif College', id: 'Kolese Al-Maarif' },
    { v: 'kafaa-tech', ar: 'كفاءة تقنية', en: 'Kafaa Tech', id: 'Kafaa Tech' },
    { v: 'tamkeen-education', ar: 'تمكين التعليم', en: 'Tamkeen Education', id: 'Tamkeen Pendidikan' },
    { v: 'third-sector', ar: 'تأهيل قيادات القطاع الثالث', en: 'Third Sector Leadership Program', id: 'Program Kepemimpinan Sektor Ketiga' },
    { v: 'raqeem', ar: 'رقيم', en: 'Raqeem', id: 'Raqeem' },
    { v: 'other', ar: 'جهة أخرى', en: 'Other', id: 'Lainnya' }
  ],

  /* ٧) الدول التي تظهر أعلى قوائم الدول (الأكثر استخدامًا) */
  PRIORITY_COUNTRIES: ['SA', 'EG', 'ID', 'KE', 'ET', 'SD', 'SO', 'TZ', 'UG', 'NG', 'PK', 'IN', 'BD', 'MY', 'CN', 'YE', 'JO', 'SY', 'TR', 'MA'],

  /* ٧-ب) نقاط الكرة الأرضية في الواجهة: المقر والدول التي يعمل فيها المنسوبون
          (أضف أو احذف دولًا بإحداثيات المدينة) */
  HQ: { cc: 'SA', lat: 21.54, lon: 39.17, name: { ar: 'المقر الرئيسي · جدة', en: 'Headquarters · Jeddah', id: 'Kantor pusat · Jeddah' } },
  OFFICES: [
    { cc: 'EG', lat: 30.04, lon: 31.24 },
    { cc: 'KE', lat: -1.29, lon: 36.82 },
    { cc: 'ET', lat: 9.03, lon: 38.74 },
    { cc: 'ID', lat: -6.2, lon: 106.85 }
  ],

  /* ٨) حدود الملفات */
  MAX_FILE_MB: 5,

  /* ٩) التوقيع في أسفل الصفحة */
  SIGNATURE: {
    ar: 'تصميم وتطوير م. أسامة جنيدي',
    en: 'Designed and developed by Eng. Osama Junaydi',
    id: 'Dirancang dan dikembangkan oleh Eng. Osama Junaydi'
  }
};
