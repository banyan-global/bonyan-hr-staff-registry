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

  /* ٤) الشعار الرئيسي — الصور مضمّنة في logos.js (مأخوذة من مجلد الشعارات في Drive، نسخة مفرغة لكل جهة) */
  MAIN_LOGO: { logo: 'mark', white: 'markWhite', name: { ar: 'بنيان', en: 'Bonyan', id: 'Bonyan' } },

  /* شعارا جانبي الرأس: وقف بنيان يمينًا، وجامعة بنيان العالمية يسارًا */
  HEADER_SIDES: {
    right: { logo: 'waqf', name: { ar: 'وقف بنيان', en: 'Bonyan Endowment', id: 'Wakaf Bonyan' } },
    left: { logo: 'university', name: { ar: 'جامعة بنيان العالمية', en: 'Bonyan International University', id: 'Universitas Internasional Bonyan' } }
  },

  /* ٥) شعارات الشريط المتحرك (بألوانها الأصلية) — المفتاح logo يشير إلى اسم الصورة في logos.js */
  STRIP_LOGOS: [
    { logo: 'university', name: { ar: 'جامعة بنيان العالمية', en: 'Bonyan International University', id: 'Universitas Internasional Bonyan' } },
    { logo: 'humanitarian', name: { ar: 'بنيان الإنسانية', en: 'Bonyan Humanitarian', id: 'Bonyan Kemanusiaan' } },
    { logo: 'darAltamkeen', name: { ar: 'دار التمكين', en: 'Dar Al-Tamkeen', id: 'Dar Al-Tamkeen' } },
    { logo: 'waqf', name: { ar: 'وقف بنيان', en: 'Bonyan Endowment', id: 'Wakaf Bonyan' } },
    { logo: 'afaq', name: { ar: 'آفاق', en: 'Afaq', id: 'Afaq' } },
    { logo: 'distance', name: { ar: 'بنيان للتعليم عن بعد', en: 'Bonyan Online Education', id: 'Bonyan Pendidikan Daring' } },
    { logo: 'academy', name: { ar: 'أكاديمية بنيان', en: 'Bonyan Academy', id: 'Akademi Bonyan' } },
    { logo: 'research', name: { ar: 'مركز بنيان للأبحاث', en: 'Bonyan Research Center', id: 'Pusat Riset Bonyan' } },
    { logo: 'taqat', name: { ar: 'طاقات', en: 'Taqat', id: 'Taqat' } },
    { logo: 'maqraa', name: { ar: 'مقرأة بنيان', en: 'Bonyan Quranic Desk', id: 'Maqraa Bonyan' } },
    { logo: 'maarif', name: { ar: 'كلية المعارف', en: 'Al-Maarif College', id: 'Kolese Al-Maarif' } },
    { logo: 'kafaa', name: { ar: 'كفاءة تقنية', en: 'Kafaa Tech', id: 'Kafaa Tech' } },
    { logo: 'tamkeenEducation', name: { ar: 'تمكين التعليم', en: 'Tamkeen Education', id: 'Tamkeen Pendidikan' } },
    { logo: 'raqeem', name: { ar: 'رقيم', en: 'Raqeem', id: 'Raqeem' } }
  ],

  /* ٦) الجهات التي تظهر في سؤال "الجهة" داخل النموذج */
  ENTITIES: [
    { v: 'bonyan', ar: 'شركة بنيان', en: 'Bonyan Company', id: 'Perusahaan Bonyan' },
    { v: 'bonyan-university', ar: 'جامعة بنيان العالمية', en: 'Bonyan International University', id: 'Universitas Internasional Bonyan' },
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
