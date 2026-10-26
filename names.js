/* ============================================================
   Bonyan HR — اقتراح كتابة الاسم بين العربية والإنجليزية
   ١) قاموس للأسماء الشائعة بالكتابة المعتمدة في الجوازات
      (الصيغة الأولى بعد | هي المعتمدة، والبقية صيغ مقبولة للبحث العكسي)
   ٢) قواعد نقل حرفي لما لا يوجد في القاموس
   ============================================================ */
(function () {
  'use strict';
  var RAW = [
    'محمد|MOHAMMED/MUHAMMAD/MOHAMED/MOHAMMAD/MUHAMMED/MOHAMAD', 'أحمد|AHMED/AHMAD', 'محمود|MAHMOUD/MAHMUD', 'مصطفى|MUSTAFA/MOSTAFA', 'حامد|HAMED/HAMID', 'حمد|HAMAD',
    'علي|ALI', 'عمر|OMAR/UMAR', 'عثمان|OTHMAN/OSMAN/USMAN/UTHMAN', 'أبوبكر|ABUBAKAR/ABUBAKR/ABU BAKR', 'خالد|KHALID/KHALED', 'سعد|SAAD/SAD', 'سعيد|SAEED/SAID/SAYED',
    'عبدالله|ABDULLAH/ABDALLAH/ABDULLA/ABDULAH', 'عبدالرحمن|ABDULRAHMAN/ABDURRAHMAN/ABDELRAHMAN/ABDUL RAHMAN', 'عبدالعزيز|ABDULAZIZ/ABDELAZIZ', 'عبدالملك|ABDULMALIK/ABDULMALEK',
    'عبدالكريم|ABDULKARIM/ABDELKARIM', 'عبدالرحيم|ABDULRAHIM/ABDURRAHIM', 'عبدالقادر|ABDULQADIR/ABDELKADER/ABDULKADIR', 'عبدالمجيد|ABDULMAJEED/ABDULMAJID', 'عبدالحميد|ABDULHAMEED/ABDULHAMID',
    'عبدالعليم|ABDULALEEM', 'عبدالفتاح|ABDULFATTAH/ABDELFATTAH', 'عبدالسلام|ABDULSALAM/ABDUSSALAM', 'عبدالغني|ABDULGHANI', 'عبدالباسط|ABDULBASIT', 'عبدالحكيم|ABDULHAKIM',
    'عبدالإله|ABDULELAH/ABDULILAH', 'عبدالمحسن|ABDULMOHSEN/ABDULMUHSIN', 'عبدالواحد|ABDULWAHID', 'عبدالوهاب|ABDULWAHAB', 'عبدالناصر|ABDULNASSER', 'عبدالهادي|ABDULHADI',
    'عبدالجبار|ABDULJABBAR', 'عبدالمنعم|ABDULMONEIM', 'عبدالصمد|ABDUSSAMAD/ABDULSAMAD', 'عبدالباري|ABDULBARI', 'عبدالحليم|ABDULHALIM', 'عبدالرزاق|ABDULRAZZAQ', 'عبدالشكور|ABDULSHAKUR',
    'عبدالرشيد|ABDIRASHID/ABDULRASHID', 'عبدي|ABDI', 'عبده|ABDO/ABDU',
    'إبراهيم|IBRAHIM/EBRAHIM', 'إسماعيل|ISMAIL/ISMAEL', 'إسحاق|ISHAQ/ISHAK', 'يعقوب|YAQOUB/YAKUB/YAQUB', 'يوسف|YOUSEF/YUSUF/YOUSSEF/YOUSIF', 'يونس|YOUNIS/YUNUS', 'موسى|MOUSA/MUSA',
    'عيسى|ISSA/ISA', 'هارون|HAROUN/HARUN', 'داود|DAWOOD/DAUD/DAWUD', 'سليمان|SULAIMAN/SULEIMAN/SOLIMAN', 'آدم|ADAM', 'نوح|NOOH/NUH', 'إدريس|IDRIS', 'إلياس|ILYAS/ELIAS', 'يحيى|YAHYA',
    'زكريا|ZAKARIA/ZAKARIYA/ZAKARIYYA', 'أيوب|AYOUB/AYUB', 'صالح|SALEH/SALIH', 'هود|HOOD/HUD', 'شعيب|SHUAIB/SHOAIB', 'لقمان|LUQMAN/LOKMAN',
    'حسن|HASSAN/HASAN', 'حسين|HUSSEIN/HUSSAIN/HUSEIN/HOSSAM', 'حسام|HOSSAM/HUSAM', 'حمزة|HAMZA/HAMZAH', 'جعفر|JAAFAR/JAFAR', 'طلحة|TALHA', 'الزبير|ALZUBAIR/ZUBAIR', 'زبير|ZUBAIR',
    'بلال|BILAL', 'أنس|ANAS', 'معاذ|MOAZ/MUAZ/MUADH', 'أسامة|OSAMA/USAMA/OSAMAH', 'زيد|ZAID/ZAYED', 'زياد|ZIAD/ZIYAD', 'عمار|AMMAR', 'ياسر|YASSER/YASIR', 'ياسين|YASEEN/YASIN',
    'طارق|TARIQ/TAREK/TAREQ', 'فيصل|FAISAL/FAYSAL', 'فهد|FAHAD/FAHD', 'سلطان|SULTAN', 'تركي|TURKI', 'نايف|NAIF/NAYEF', 'بندر|BANDAR', 'سلمان|SALMAN', 'ماجد|MAJED/MAJID', 'راشد|RASHED/RASHID',
    'رشيد|RASHEED/RASHID', 'منصور|MANSOUR/MANSUR', 'ناصر|NASSER/NASIR', 'نصر|NASR', 'عادل|ADEL/ADIL', 'كمال|KAMAL', 'جمال|JAMAL/GAMAL', 'جلال|JALAL', 'بدر|BADR/BADER', 'نور|NOOR/NUR',
    'نورة|NOURA/NORAH', 'منير|MOUNIR/MUNIR', 'مازن|MAZEN/MAZIN', 'هشام|HISHAM/HESHAM', 'وليد|WALEED/WALID', 'وائل|WAEL/WAIL', 'رامي|RAMI', 'سامي|SAMI', 'هاني|HANI', 'فادي|FADI', 'شادي|SHADI',
    'إياد|IYAD/EYAD', 'عماد|EMAD/IMAD', 'مراد|MORAD/MURAD', 'مهند|MOHANNAD/MUHANNAD', 'معتز|MOATAZ/MUTAZ', 'مؤمن|MOAMEN/MUMIN', 'أمين|AMEEN/AMIN', 'أيمن|AYMAN', 'أكرم|AKRAM',
    'أشرف|ASHRAF', 'أنور|ANWAR', 'أسعد|ASAAD/ASAD', 'أسد|ASAD', 'باسم|BASSEM/BASIM', 'جابر|JABER/JABIR', 'جميل|JAMEEL/JAMIL', 'حاتم|HATEM/HATIM', 'حازم|HAZEM/HAZIM', 'حمدي|HAMDI',
    'خليل|KHALIL', 'رائد|RAED', 'رضا|REDA/RIDA', 'رمضان|RAMADAN/RAMZAN', 'شريف|SHERIF/SHARIF', 'صبري|SABRI', 'صلاح|SALAH', 'عاطف|ATEF', 'عبيد|OBAID/UBAID', 'عزيز|AZIZ', 'عصام|ESSAM/ISAM',
    'علاء|ALAA', 'فارس|FARES/FARIS', 'فاروق|FAROUK/FARUQ', 'فتحي|FATHI', 'قاسم|QASIM/KASSEM', 'كريم|KARIM/KAREEM', 'لطفي|LOTFI', 'مجدي|MAGDY/MAJDI', 'محسن|MOHSEN/MUHSIN', 'مدحت|MEDHAT',
    'مروان|MARWAN', 'مسعود|MASOUD', 'مشعل|MESHAL/MISHAL', 'مصعب|MUSAB/MOSAB', 'مهدي|MAHDI/MEHDI', 'نبيل|NABIL/NABEEL', 'نجيب|NAJIB/NAGIB', 'نزار|NIZAR', 'هيثم|HAITHAM', 'وسيم|WASEEM/WASIM',
    'يزيد|YAZEED/YAZID', 'يامن|YAMEN', 'سيف|SAIF/SEIF', 'سالم|SALEM/SALIM', 'سليم|SALEEM/SALIM', 'شاكر|SHAKER/SHAKIR', 'شكري|SHOKRI/SHUKRI', 'عامر|AMER/AMIR', 'عمرو|AMR', 'عوض|AWAD',
    'غازي|GHAZI', 'فؤاد|FOUAD/FUAD', 'فرج|FARAG/FARAJ', 'فوزي|FAWZI/FAWZY', 'مختار|MOKHTAR/MUKHTAR', 'مبارك|MUBARAK', 'منذر|MONTHER/MUNDHIR', 'نادر|NADER/NADIR', 'هاشم|HASHEM/HASHIM',
    'تميم|TAMIM/TAMEEM', 'ثامر|THAMER', 'جبريل|JIBRIL/JIBRIEL', 'ميكائيل|MIKAIL', 'رضوان|RIDWAN/REDWAN', 'زين|ZAIN/ZEIN', 'عزام|AZZAM', 'غسان|GHASSAN', 'قصي|QUSAI', 'لؤي|LOAI/LUAI',
    'نعيم|NAEEM/NAIM', 'هيثم|HAITHAM', 'وحيد|WAHEED/WAHID', 'حبيب|HABIB', 'حكيم|HAKIM', 'رحيم|RAHIM', 'شمس|SHAMS', 'عرفات|ARAFAT', 'فتح|FATH', 'مالك|MALIK/MALEK', 'نعمان|NOMAN/NUMAN',
    'جمعة|JUMA/JUMAA/GOMAA', 'خميس|KHAMIS', 'سبت|SABT', 'شعبان|SHABAN', 'رجب|RAJAB/RAGAB', 'محرم|MUHARRAM', 'صفر|SAFAR',
    'فاطمة|FATIMA/FATMA/FATIMAH', 'عائشة|AISHA/AYSHA/AISYAH', 'خديجة|KHADIJA/KHADIJAH', 'مريم|MARYAM/MARIAM', 'زينب|ZAINAB/ZEINAB', 'حفصة|HAFSA/HAFSAH', 'أسماء|ASMAA/ASMA',
    'سمية|SUMAYA/SUMAYYAH/SOMAYA', 'صفية|SAFIYA/SAFIYYAH', 'رقية|RUQAYYA/RUQAYAH', 'أم كلثوم|UMKULTHUM', 'آمنة|AMINA/AMINAH', 'أمينة|AMINA/AMEENA', 'حليمة|HALIMA/HALIMAH',
    'سارة|SARA/SARAH', 'هاجر|HAJAR/HAGAR', 'هدى|HUDA/HODA', 'نور|NOOR/NUR', 'نوال|NAWAL', 'منى|MONA/MUNA', 'ليلى|LAILA/LEILA/LAYLA', 'سلمى|SALMA', 'لبنى|LUBNA', 'رنا|RANA', 'ريم|REEM/RIM',
    'هند|HIND', 'دعاء|DOAA/DUAA', 'إيمان|EMAN/IMAN', 'أمل|AMAL', 'ابتسام|IBTISAM/EBTESAM', 'سعاد|SOAD/SUAD', 'نجلاء|NAJLA/NAGLAA', 'شيماء|SHAIMAA/SHAYMA', 'هبة|HEBA/HIBA',
    'آية|AYA/AYAH', 'رحمة|RAHMA/RAHMAH', 'نعمة|NIMA/NEAMA', 'جميلة|JAMILA/JAMEELA', 'لطيفة|LATIFA/LATEEFA', 'وفاء|WAFAA/WAFA', 'سناء|SANAA', 'رشا|RASHA', 'دينا|DINA', 'لينا|LINA',
    'جنى|JANA', 'تسنيم|TASNEEM/TASNIM', 'رغد|RAGHAD', 'شهد|SHAHAD', 'غادة|GHADA', 'منيرة|MUNIRA/MOUNIRA', 'نادية|NADIA/NADIYA', 'سميرة|SAMIRA/SAMEERA', 'بشرى|BUSHRA', 'زهراء|ZAHRA/ZAHRAA',
    'عفاف|AFAF', 'حنان|HANAN', 'إسراء|ESRAA/ISRAA', 'مها|MAHA', 'ندى|NADA', 'هالة|HALA', 'وداد|WIDAD', 'بسمة|BASMA', 'نسرين|NESREEN/NISRIN', 'ياسمين|YASMIN/YASMEEN', 'صفاء|SAFAA/SAFA',
    'مروة|MARWA/MARWAH', 'نهى|NOHA/NUHA', 'عبير|ABEER/ABIR', 'أريج|AREEJ', 'جواهر|JAWAHER', 'لولوة|LULWA', 'العنود|ALANOUD', 'الجوهرة|ALJAWHARA', 'نوف|NOUF', 'ديما|DIMA',
    'نجمة|NAJMA', 'حواء|HAWA/HAWAA', 'شريفة|SHARIFA', 'زهرة|ZAHRA/ZAHRAH', 'سعدية|SAADIA', 'فرحة|FARHA', 'رابعة|RABIA/RABIAH', 'حسنة|HASNA',
    'رزقي|RIZKI/RIZKY', 'حسان|HASSAN', 'سعود|SAUD', 'صابر|SABER/SABIR', 'سمير|SAMIR/SAMEER', 'بن|BIN', 'بنت|BINT', 'ابن|IBN', 'محمدي|MOHAMMEDI', 'تهاني|TAHANI', 'نادين|NADINE', 'هيفاء|HAIFA', 'بشير|BASHIR/BASHEER', 'نذير|NAZIR', 'شاهد|SHAHID', 'ضياء|DIAA/ZIA', 'أنيس|ANIS', 'إدريس|IDRIS', 'سيتي|SITI', 'سهيل|SUHAIL/SOHAIL', 'مرتضى|MURTADA/MORTADA', 'مصطفى|MUSTAFA', 'إنداه|INDAH', 'أجوس|AGUS', 'سري|SRI', 'ويدودو|WIDODO', 'سوهارتو|SUHARTO', 'عائض|AYED/AIDH', 'مشاري|MISHARI/MESHARI', 'تركية|TURKIA', 'عبير|ABEER', 'دوي|DEWI', 'بودي|BUDI', 'بوتري|PUTRI', 'واهيودي|WAHYUDI', 'نوري|NURI', 'نور الدين|NURUDDIN/NOURELDIN', 'نورالدين|NURUDDIN/NOURELDIN', 'صلاح الدين|SALAHUDDIN', 'صلاحالدين|SALAHUDDIN', 'شمس الدين|SHAMSUDDIN/SYAMSUDDIN', 'شمسالدين|SHAMSUDDIN',
    'سيف الدين|SAIFUDDIN', 'عز الدين|IZZUDDIN/EZZELDIN', 'عزالدين|IZZUDDIN/EZZELDIN', 'محي الدين|MUHYIDDIN/MOHIELDIN', 'كمال الدين|KAMALUDDIN', 'جمال الدين|JAMALUDDIN/GAMALELDIN', 'بدر الدين|BADRUDDIN',
    'هداية|HIDAYAH/HIDAYA', 'رحمن|RAHMAN', 'حكمة|HIKMAH/HIKMA', 'فطرة|FITRAH/FITRI', 'إسلام|ISLAM', 'إحسان|IHSAN', 'إخلاص|IKHLAS', 'عافية|AFIYAH', 'سيتي|SITI', 'سهيل|SUHAIL/SOHAIL', 'مرتضى|MURTADA/MORTADA', 'مصطفى|MUSTAFA', 'إنداه|INDAH', 'أجوس|AGUS', 'سري|SRI', 'ويدودو|WIDODO', 'سوهارتو|SUHARTO', 'عائض|AYED/AIDH', 'مشاري|MISHARI/MESHARI', 'تركية|TURKIA', 'عبير|ABEER', 'نور الهدى|NURULHUDA', 'وحيو|WAHYU',
    'فارح|FARAH', 'فرح|FARAH', 'ورسمي|WARSAME', 'كدير|KEDIR/KADIR', 'جامع|JAMA', 'آدن|ADEN', 'عدن|ADEN', 'ديريه|DIRIYE', 'جيله|GELLE', 'إسحاقة|ISAAQ', 'موانغي|MWANGI', 'أوتينو|OTIENO', 'كاماو|KAMAU',
    'الحسن|ALHASSAN/AL HASSAN/ALHASAN', 'الحسين|ALHUSSEIN', 'الغامدي|ALGHAMDI/AL GHAMDI', 'الزهراني|ALZAHRANI/AL ZAHRANI', 'القحطاني|ALQAHTANI/AL QAHTANI', 'العتيبي|ALOTAIBI/AL OTAIBI',
    'الشهري|ALSHEHRI/AL SHEHRI', 'الحربي|ALHARBI/AL HARBI', 'المطيري|ALMUTAIRI/AL MUTAIRI', 'الدوسري|ALDOSARI/ALDOSSARY', 'الشمري|ALSHAMMARI/AL SHAMMARI', 'العنزي|ALANAZI/AL ANAZI',
    'السبيعي|ALSUBAIE', 'الطلحي|ALTALHI', 'الأحمدي|ALAHMADI', 'المالكي|ALMALKI', 'الجهني|ALJOHANI/ALJUHANI', 'العمري|ALOMARI/ALAMRI', 'الثقفي|ALTHAQAFI', 'البقمي|ALBUQAMI', 'السلمي|ALSULAMI',
    'الهاشمي|ALHASHIMI', 'الأنصاري|ALANSARI', 'القرشي|ALQURASHI', 'الشريف|ALSHARIF', 'السيد|ELSAYED/ALSAYED', 'المصري|ELMASRY/ALMASRI', 'الشافعي|ELSHAFEI', 'الجنيدي|ALJUNAIDI',
    'جنيدي|JUNAYDI/JUNAIDI/GONEIDY', 'الكردي|ALKURDI', 'البغدادي|ALBAGHDADI', 'التميمي|ALTAMIMI', 'الخطيب|ALKHATIB/ELKHATEEB', 'النجار|ALNAJJAR/ELNAGGAR', 'الحداد|ALHADDAD/ELHADDAD',
    'عبدالحي|ABDULHAI', 'عبدالمطلب|ABDULMUTTALIB', 'الرحمن|ALRAHMAN', 'الله|ALLAH'
  ];
  var A2L = {}, L2A = {};
  RAW.forEach(function (row) {
    var p = row.split('|'), ar = p[0].replace(/\s+/g, ''), forms = p[1].split('/');
    if (!A2L[ar]) A2L[ar] = forms[0];
    forms.forEach(function (f) { var k = f.replace(/[\s'-]+/g, ''); if (!L2A[k]) L2A[k] = p[0].replace(/\s+/g, ''); });
  });

  /* ---------- عربي ← لاتيني */
  var CONS = { 'ب': 'B', 'ت': 'T', 'ث': 'TH', 'ج': 'J', 'ح': 'H', 'خ': 'KH', 'د': 'D', 'ذ': 'TH', 'ر': 'R', 'ز': 'Z', 'س': 'S', 'ش': 'SH', 'ص': 'S', 'ض': 'D', 'ط': 'T', 'ظ': 'Z',
    'غ': 'GH', 'ف': 'F', 'ق': 'Q', 'ك': 'K', 'ل': 'L', 'م': 'M', 'ن': 'N', 'ه': 'H', 'پ': 'P', 'گ': 'G', 'چ': 'CH', 'ڤ': 'V' };
  function normAr(s) { return String(s || '').replace(/[ً-ْـ]/g, '').replace(/\s+/g, ' ').trim(); }
  function ruleAr(w) {
    var out = '', ch = w.split(''), n = ch.length, vowel = function (c) { return /[اأإآويىةعئؤ]/.test(c || ''); };
    for (var i = 0; i < n; i++) {
      var c = ch[i], prev = ch[i - 1], next = ch[i + 1], first = i === 0, last = i === n - 1;
      if (c === 'ا' || c === 'أ' || c === 'آ') { out += 'A'; continue; }
      if (c === 'إ') { out += 'I'; continue; }
      if (c === 'ء') continue;
      if (c === 'ئ') { out += 'I'; continue; }
      if (c === 'ؤ') { out += 'O'; continue; }
      if (c === 'ع') { out += 'A'; continue; }
      if (c === 'ة' || c === 'ى') { out += 'A'; continue; }
      if (c === 'و') { out += (first || next === 'ا' || (prev && vowel(prev))) ? 'W' : 'OU'; continue; }
      if (c === 'ي') { out += (first || next === 'ا' || (prev && vowel(prev))) ? 'Y' : 'I'; continue; }
      var L = CONS[c];
      if (!L) continue;
      out += L;
      if (next && CONS[next]) {
        if (i === 0) out += 'A';                       /* بعد الحرف الأول: فتحة تقديرية */
        else if (i === n - 2) out += 'I';              /* قبل الحرف الأخير: كسرة تقديرية (صابر ← SABIR) */
      }
    }
    return out.replace(/AA+/g, 'AA').replace(/^AA/, 'A').replace(/OUOU/g, 'OU');
  }
  function arWordToLatin(w) {
    if (A2L[w]) return A2L[w];
    if (/^عبد.+/.test(w)) { var r = w.slice(3); return 'ABDUL' + (A2L[r] || ruleAr(r)).replace(/^AL/, ''); }
    if (/^ال.+/.test(w)) { var r2 = w.slice(2); return 'AL' + (A2L[r2] || ruleAr(r2)); }
    return ruleAr(w);
  }
  function toLatin(s) {
    s = normAr(s).replace(/عبد\s+(ال)?/g, function (m, al) { return 'عبد' + (al || ''); }).replace(/(^|\s)(أبو|ابو)\s+/g, '$1أبو');
    if (A2L[s.replace(/\s+/g, '')]) return A2L[s.replace(/\s+/g, '')];
    return s.split(' ').filter(Boolean).map(arWordToLatin).join(' ');
  }

  /* ---------- لاتيني ← عربي */
  var DI = [['KH', 'خ'], ['GH', 'غ'], ['SH', 'ش'], ['TH', 'ث'], ['DH', 'ذ'], ['CH', 'تش'], ['PH', 'ف'], ['NY', 'ني'], ['NG', 'نغ']];
  var SI = { B: 'ب', C: 'ك', D: 'د', F: 'ف', G: 'ج', H: 'ه', J: 'ج', K: 'ك', L: 'ل', M: 'م', N: 'ن', P: 'ب', Q: 'ق', R: 'ر', S: 'س', T: 'ت', V: 'ف', W: 'و', X: 'كس', Y: 'ي', Z: 'ز' };
  function ruleLat(w) {
    w = w.toUpperCase().replace(/[^A-Z]/g, '');
    var V = function (c) { return /[AEIOU]/.test(c || ''); };
    /* E الأخيرة الصامتة بعد مقطع مثل DINE / ROSE */
    if (/[IOU][NSLTDRM]E$/.test(w) && w.length > 4) w = w.slice(0, -1);
    var fem = /AH$/.test(w) && w.length > 3;
    if (fem) w = w.slice(0, -2);
    var out = '', i = 0, n = w.length;
    while (i < n) {
      var two = w.substr(i, 2), c = w[i], first = i === 0;
      var di = DI.filter(function (d) { return d[0] === two; })[0];
      if (di) { out += di[1]; i += 2; continue; }
      if (c === 'Y' && (V(w[i - 1]) || first) && V(w[i + 1])) { out += 'ي'; i++; continue; }
      if (V(c) || c === 'Y') {
        if (first) {
          if (two === 'AI' || two === 'AY') { out += 'أي'; i += 2; continue; }
          if (two === 'AU' || two === 'AW') { out += 'أو'; i += 2; continue; }
          out += c === 'E' ? 'إي' : c === 'I' ? 'إ' : (c === 'O' || c === 'U') ? 'أو' : 'أ';
          i++; while (V(w[i]) && w[i] === c) i++; continue;
        }
        if (two === 'AI' || two === 'AY' || two === 'EI') { out += 'اي'; i += 2; continue; }
        if (two === 'AU' || two === 'AW') { out += 'او'; i += 2; continue; }
        out += c === 'A' ? 'ا' : (c === 'O' || c === 'U') ? 'و' : 'ي';
        i++; while (i < n && w[i] === c) i++; continue;
      }
      if (c === w[i + 1] && SI[c]) { out += SI[c]; i += 2; continue; }
      out += SI[c] || ''; i++;
    }
    if (fem) out += 'ة';
    return out;
  }
  function latWordToAr(w) {
    var k = w.toUpperCase().replace(/[\s'-]+/g, '');
    if (L2A[k]) return L2A[k];
    if (/^ABD(UL|EL|AL|U|I)?.{3,}/.test(k)) { var r = k.replace(/^ABD(UL|EL|AL|U|I)?/, ''); return 'عبد' + (L2A['AL' + r] || ('ال' + (L2A[r] || ruleLat(r)))); }
    if (/^(AL|EL).{3,}/.test(k)) { var r2 = k.slice(2); return 'ال' + (L2A[r2] || ruleLat(r2)); }
    return ruleLat(k);
  }
  function toArabic(s) {
    s = String(s || '').toUpperCase().replace(/[^A-Z\s'-]/g, ' ').replace(/\s+/g, ' ').trim();
    var whole = s.replace(/[\s'-]+/g, '');
    if (L2A[whole]) return L2A[whole];
    var parts = s.split(' ').filter(Boolean), out = [];
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      if ((p === 'ABDUL' || p === 'ABDEL' || p === 'ABD' || p === 'AL' || p === 'EL') && parts[i + 1]) { out.push(latWordToAr(p + parts[i + 1])); i++; continue; }
      out.push(latWordToAr(p));
    }
    return out.join(' ');
  }

  window.NameTranslit = { toLatin: toLatin, toArabic: toArabic };
})();
