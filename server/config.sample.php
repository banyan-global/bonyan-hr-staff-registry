<?php
/**
 * ============================================================
 *  Bonyan HR · ملف الإعدادات (سرّي — لا يُرفع إلى GitHub أبدًا)
 * ============================================================
 *  مكانه على الخادم (خارج المجلد العام):
 *     /home/<رقم الحساب>/bonyan-hr-private/config.php
 *  المرفقات والنسخ الاحتياطية تُحفظ تلقائيًا بجانبه في: bonyan-hr-private/storage
 *  املأ الخانات المعلّمة بـ ← فقط.
 */
return [
    'site_url' => 'https://hr.bonyanglobal.com/',

    /* ← قاعدة البيانات (من لوحة هوستنجر: قواعد البيانات) */
    'db' => [
        'host' => 'localhost',
        'name' => 'u000000000_bonyanhr',   // ← اسم قاعدة البيانات كما يظهر في اللوحة
        'user' => 'u000000000_bonyanhr',   // ← اسم المستخدم كما يظهر في اللوحة
        'pass' => '',                      // ← كلمة مرور قاعدة البيانات
    ],

    /* ← البريد المرسل لرسائل النظام */
    'smtp' => [
        'host' => 'smtp.hostinger.com', 'port' => 465, 'secure' => 'ssl',
        'user' => 'noreply@bonyanglobal.com',
        'pass' => '',                      // ← كلمة مرور صندوق noreply
        'from' => 'noreply@bonyanglobal.com',
        'from_name' => 'الموارد البشرية · مجموعة بنيان العالمية',
        'reply_to' => 'digital@bonyanglobal.com',   // غيّره إلى hr@bonyanglobal.com متى أُنشئ
    ],

    'hr_notify' => 'digital@bonyanglobal.com',   // يصله تنبيه كل تسجيل جديد والتنبيه الأسبوعي للوثائق
    'mail_only_to' => '',                        // للتجربة فقط: بريد واحد تذهب إليه كل الرسائل. فارغ = تصل أصحابها
    'dev_email' => 'osama.mo.bonyan@gmail.com',

    /* الحسابات الأولى (تُنشأ مرة واحدة عند أول دخول، ثم تُدار من صفحة «النظام») — الدخول برمز يصل إلى هذا البريد */
    'accounts' => [
        ['email' => 'osama.mo.bonyan@gmail.com', 'name' => 'م. أسامة جنيدي', 'title' => 'مدير النظام', 'role' => 'admin'],
        ['email' => 'galghamdi0203@gmail.com', 'name' => 'أ. غيداء عبدالله', 'title' => 'مديرة الموارد البشرية', 'role' => 'hr'],
        ['email' => 'abdullah.m.y.alghamdi@gmail.com', 'name' => 'د. عبدالله الغامدي', 'title' => 'الرئيس التنفيذي', 'role' => 'ceo'],
    ],

    'session_hours' => 12,     // أقصى مدة للجلسة
    'idle_minutes' => 120,     // تنتهي الجلسة بعد هذا الخمول

    /* ← مفتاح مؤقت لنقل البيانات من النظام القديم (٢٤ حرفًا أو أكثر). أفرغه ('') فور انتهاء النقل */
    'import_token' => '',

    /* ← انسخ قيمة SELF_SECRET من «إعدادات المشروع» في Apps Script لتبقى روابط «تحديث بياناتي» في الرسائل القديمة صالحة */
    'self_secret' => '',
];
