/* ============================================================
   Bonyan HR · Global Staff Registry — الإعدادات
   هذا هو الملف الوحيد الذي تحتاج تعديله عادةً.
   ============================================================ */
window.APP_CONFIG = {

  /* ١) رابط تطبيق الويب من Google Apps Script (ينتهي بـ /exec)
        اتركه فارغًا ليعمل الموقع في "وضع المعاينة" دون إرسال بيانات. */
  GAS_URL: 'https://script.google.com/macros/s/AKfycbwqtt2vgZQunssdK0YF56Htxm26WH412omMM2tjW23ag23Xuqph5z0pqa8ehPS_W4_6/exec',

  /* ٢) اللغات المتاحة واللغة الافتراضية */
  LANGS: ['ar', 'en', 'id'],
  DEFAULT_LANG: 'ar',

  /* ٣) اسم الجهة */
  ORG: {
    ar: 'مجموعة بنيان العالمية',
    en: 'Bonyan International Group',
    id: 'Bonyan International Group'
  },

  /* ٤) الشعار — شعار بنيان الأبيض فقط (مضمّن في logos.js) */
  MAIN_LOGO: { logo: 'markWhite', white: 'markWhite', name: { ar: 'بنيان', en: 'Bonyan', id: 'Bonyan' } },

  /* ٦) الجهات التي تظهر في سؤال "الجهة" داخل النموذج
        logo: اسم الشعار في entity-logos.js — يظهر على بطاقة المنسوب
        colors: [لون البطاقة الأساسي، اللون الداكن، لون الإبراز] من هوية الجهة */
  ENTITIES: [
    { v: 'bonyan', ar: 'شركة بنيان للتدريب المحدودة', en: 'Bonyan Training Company Ltd.', id: 'Bonyan Training Company Ltd.', logo: 'main', colors: ['#2B3155', '#191D38', '#D9B67F'] },
    { v: 'bonyan-university', ar: 'جامعة بنيان العالمية', en: 'Bonyan International University', id: 'Universitas Internasional Bonyan', logo: 'university', colors: ['#6b3624', '#1f2f4d', '#E7B08F'] },
    { v: 'bonyan-humanitarian', ar: 'بنيان الإنسانية', en: 'Bonyan Humanitarian', id: 'Bonyan Kemanusiaan', logo: 'humanitarian', mark: 'humanitarianMark', colors: ['#7d2a2f', '#2c1215', '#EDB9B6'] },
    { v: 'dar-altamkeen', ar: 'دار التمكين', en: 'Dar Al-Tamkeen', id: 'Dar Al-Tamkeen', logo: 'darAltamkeen', colors: ['#163061', '#0a1630', '#D2C4B1'] },
    { v: 'bonyan-waqf', ar: 'وقف بنيان', en: 'Bonyan Endowment', id: 'Wakaf Bonyan', logo: 'waqf', colors: ['#05603a', '#022417', '#E2BE8A'] },
    { v: 'afaq', ar: 'آفاق للتعريف بالإسلام', en: 'Afaq for Introducing Islam', id: 'Afaq Pengenalan Islam', logo: 'afaq', colors: ['#6a2531', '#25101a', '#CDD4E3'] },
    { v: 'bonyan-distance', ar: 'بنيان للتعليم عن بعد', en: 'Bonyan Distance Learning', id: 'Bonyan Pendidikan Jarak Jauh', logo: 'distance', mark: 'distanceMark', colors: ['#33568a', '#172540', '#E8AC82'] },
    { v: 'bonyan-academy', ar: 'أكاديمية بنيان', en: 'Bonyan Academy', id: 'Akademi Bonyan', logo: 'academy', mark: 'academyMark', colors: ['#465679', '#1d2438', '#E6B193'] },
    { v: 'bonyan-research', ar: 'مركز بنيان للأبحاث', en: 'Bonyan Research Center', id: 'Pusat Riset Bonyan', logo: 'research', mark: 'researchMark', colors: ['#265746', '#0f241d', '#E0C290'] },
    { v: 'taqat', ar: 'طاقات', en: 'Taqat', id: 'Taqat', logo: 'taqat', colors: ['#1c6340', '#0b2a1a', '#DCD08A'] },
    { v: 'bonyan-maqraa', ar: 'مقرأة بنيان', en: 'Bonyan Maqraa', id: 'Maqraa Bonyan', logo: 'maqraa', mark: 'maqraaMark', colors: ['#5a3a2a', '#232b3d', '#C2CFE6'] },
    { v: 'almaarif', ar: 'كلية المعارف', en: 'Al-Maarif College', id: 'Kolese Al-Maarif', logo: 'maarif', mark: 'maarifMark', colors: ['#2f339a', '#141647', '#F9B84A'] },
    { v: 'kafaa-tech', ar: 'كفاءة تقنية', en: 'Kafaa Tech', id: 'Kafaa Tech', logo: 'kafaa', mark: 'kafaaMark', colors: ['#4b3cc0', '#1d1856', '#CCC5FF'] },
    { v: 'tamkeen-education', ar: 'تمكين التعليم', en: 'Tamkeen Education', id: 'Tamkeen Pendidikan', logo: 'tamkeenEducation', mark: 'tamkeenEducationMark', colors: ['#5b3d76', '#24173a', '#5CD8DB'] },
    { v: 'other', ar: 'جهة أخرى', en: 'Other', id: 'Lainnya' }
  ],

  /* ٧) الدول التي تظهر أعلى قوائم الدول (الأكثر استخدامًا) */
  PRIORITY_COUNTRIES: ['SA', 'EG', 'ID', 'KE', 'ET', 'SD', 'SO', 'TZ', 'UG', 'NG', 'PK', 'IN', 'BD', 'MY', 'CN', 'YE', 'JO', 'SY', 'TR', 'MA'],

  /* ٧-ب) المقر الرئيسي على الكرة الأرضية (جدة). دول المنسوبين وأعدادهم تأتي تلقائيًا من السجل بعد كل تعبئة */
  HQ: { cc: 'SA', lat: 21.54, lon: 39.17, name: { ar: 'المقر الرئيسي · جدة', en: 'Headquarters · Jeddah', id: 'Kantor pusat · Jeddah' }, short: { ar: 'جدة · مكة', en: 'Jeddah · Makkah', id: 'Jeddah · Makkah' },
    label: { ar: 'المقر الرئيسي جدة · مقر مكة', en: 'HQ Jeddah · Makkah office', id: 'Pusat Jeddah · Kantor Makkah' } },
  /* مقرات أخرى تظهر بجانب المقر الرئيسي */
  SITES: [
    { cc: 'SA', lat: 21.39, lon: 39.86, name: { ar: 'مقر مكة المكرمة', en: 'Makkah office', id: 'Kantor Makkah' } }
  ],

  /* ٧-ج) مناطق العمل المقترحة لكل دولة (تظهر اقتراحاتٍ عند الكتابة، وتُحتسب «عدد المناطق» على الخريطة) */
  REGIONS: {
    SA: ['منطقة مكة المكرمة', 'منطقة الرياض', 'المنطقة الشرقية', 'منطقة المدينة المنورة', 'منطقة القصيم', 'منطقة عسير', 'منطقة تبوك', 'منطقة حائل', 'منطقة الحدود الشمالية', 'منطقة جازان', 'منطقة نجران', 'منطقة الباحة', 'منطقة الجوف'],
    EG: ['القاهرة', 'الجيزة', 'الإسكندرية', 'القليوبية', 'الدقهلية', 'الشرقية', 'الغربية', 'المنوفية', 'البحيرة', 'كفر الشيخ', 'دمياط', 'بورسعيد', 'الإسماعيلية', 'السويس', 'الفيوم', 'بني سويف', 'المنيا', 'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان', 'البحر الأحمر', 'الوادي الجديد', 'مطروح', 'شمال سيناء', 'جنوب سيناء'],
    ID: ['DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'Jawa Timur', 'DI Yogyakarta', 'Banten', 'Aceh', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Kepulauan Riau', 'Jambi', 'Sumatera Selatan', 'Bengkulu', 'Lampung', 'Bangka Belitung', 'Kalimantan Barat', 'Kalimantan Tengah', 'Kalimantan Selatan', 'Kalimantan Timur', 'Kalimantan Utara', 'Sulawesi Utara', 'Sulawesi Tengah', 'Sulawesi Selatan', 'Sulawesi Tenggara', 'Sulawesi Barat', 'Gorontalo', 'Bali', 'Nusa Tenggara Barat', 'Nusa Tenggara Timur', 'Maluku', 'Maluku Utara', 'Papua', 'Papua Barat', 'Papua Barat Daya', 'Papua Tengah', 'Papua Pegunungan', 'Papua Selatan'],
    KE: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Kiambu', 'Machakos', 'Kajiado', 'Garissa', 'Wajir', 'Mandera', 'Isiolo', 'Marsabit', 'Lamu', 'Kilifi', 'Kwale', 'Tana River', 'Uasin Gishu', 'Kakamega', 'Bungoma', 'Meru', 'Nyeri', 'Murang\'a', 'Kirinyaga', 'Embu', 'Kitui', 'Makueni', 'Turkana', 'Kericho', 'Narok', 'Kisii', 'Taita-Taveta', 'Elgeyo-Marakwet', 'Nandi', 'Baringo', 'Laikipia', 'Samburu', 'Trans Nzoia', 'West Pokot', 'Bomet', 'Nyamira', 'Migori', 'Homa Bay', 'Siaya', 'Busia', 'Vihiga', 'Nyandarua', 'Tharaka-Nithi'],
    ET: ['Addis Ababa', 'Dire Dawa', 'Oromia', 'Amhara', 'Tigray', 'Somali', 'Afar', 'Harari', 'Benishangul-Gumuz', 'Gambela', 'Sidama', 'South Ethiopia', 'Central Ethiopia', 'South West Ethiopia']
  },

  /* ٨) حدود الملفات */
  MAX_FILE_MB: 5
};
