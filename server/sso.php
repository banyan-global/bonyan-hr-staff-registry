<?php
/**
 * Bonyan HR · دخول موحّد (SSO) من «مسار» إلى منصة الموارد البشرية
 * ----------------------------------------------------------------
 * خادم «مسار» (Google Apps Script) يُوقّع لهوية المستخدم المسجَّل عنده رمزًا
 * بمفتاحه الخاص (RSA-SHA256)؛ وهذا الملف يتحقق منه بمفتاح مسار العام (أدناه، وهو
 * المفتاح نفسه الذي يوقّع به مسار طلبات بريده)، ثم يفتح جلسة HR لصاحب حساب فعّال فقط.
 *
 * لماذا RSA لا سرّ مشترك: مسار يملك المفتاح الخاص في خادمه، و HR لا يحتاج إلا المفتاح
 * العام (علنيّ، يجوز وضعه في المستودع). فلا سرّ يُوضع في إعدادات HR ولا يُرفع شيء حسّاس.
 *
 * خصائص الأمان: الرمز قصير العمر (≤120ث)، لمرة واحدة (jti في kv)، مربوط بالوجهة
 * (typ=sso, aud=hr, iss=masar)، والتوقيع يُتحقَّق بمفتاح مسار العام فقط.
 */
declare(strict_types=1);

/* مفتاح «مسار» العام (RSA 2048) — نفسه المستخدم في mailer.php لدى مسار. علنيّ. */
const SSO_MASAR_PUB = "-----BEGIN PUBLIC KEY-----\n"
    . "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxuemdBMcGPQ0GOf0Lmow\n"
    . "c67vvAjfhp/f8drWe9UJM/D3Y0qYCd4iswqed/4jbh47VD3YTwsFRV9SI4p+TiAG\n"
    . "3eMfxQaie4UDhXk6Ig5Fjiyrpk1C5n6Ul9rlTs4MElFwy+qvGDPjUBg2+uq7/XEI\n"
    . "snSrTEuXNvEW1Big01Z6xt58V2NlQfWa+ISVADMFrjOCZeWmzMDbz7gzvK93q2OQ\n"
    . "E8p08hMThEh5TjfRZp0cl1gTOzVOXqHZHfVp7jMAterSdVM7MDmRCFPiDRfP6+Vf\n"
    . "fLsP/TD4viIRF36s+EEtiyzzWw2+3ysaCtYVWXKE11eQL3vdLlf6EyLTfj7ewx2J\n"
    . "jQIDAQAB\n"
    . "-----END PUBLIC KEY-----";

/* المفتاح العام الفعّال (يسمح بتجاوزه من الإعدادات عند تدوير مفاتيح مسار) */
function sso_pubkey(): string { $k = trim((string)cfg('sso_masar_pub', '')); return $k !== '' ? $k : SSO_MASAR_PUB; }
/* مفتاح إيقاف اختياري: cfg('sso_off') === true يعطّل الخدمة */
function sso_enabled(): bool { return cfg('sso_off', false) !== true; }

function sso_b64url_encode(string $s): string { return rtrim(strtr(base64_encode($s), '+/', '-_'), '='); }
function sso_b64url_decode(string $s): string {
    $s = strtr($s, '-_', '+/');
    $pad = strlen($s) % 4; if ($pad) $s .= str_repeat('=', 4 - $pad);
    return (string)base64_decode($s, true);
}

/* يتحقق من الرمز ويعيد حمولته، أو يرمي HttpError بسبب الرفض (للسجل) */
function sso_check(string $token): array {
    if (!preg_match('/^[A-Za-z0-9\-_]{8,2048}\.[A-Za-z0-9\-_]{64,1024}$/', $token)) throw new HttpError('bad');
    [$p, $sigB] = explode('.', $token, 2);
    $sig = sso_b64url_decode($sigB);
    if ($sig === '' || strlen($sig) < 128) throw new HttpError('sig');
    $pub = openssl_pkey_get_public(sso_pubkey());
    if ($pub === false) throw new HttpError('key');
    /* يُوقِّع مسار نصَّ المقطع الأول (b64url للحمولة) بمفتاحه الخاص RSA-SHA256 */
    $ok = openssl_verify($p, $sig, $pub, OPENSSL_ALGO_SHA256);
    if ($ok !== 1) throw new HttpError('sig');
    $data = json_decode(sso_b64url_decode($p), true);
    if (!is_array($data)) throw new HttpError('bad');
    if (($data['typ'] ?? '') !== 'sso' || ($data['aud'] ?? '') !== 'hr' || ($data['iss'] ?? '') !== 'masar') throw new HttpError('aud');
    $now = time(); $iat = (int)($data['iat'] ?? 0); $exp = (int)($data['exp'] ?? 0);
    if ($iat <= 0 || $exp <= 0 || $iat > $now + 30 || $exp <= $now || $exp - $iat > 120) throw new HttpError('expired');
    $jti = (string)($data['jti'] ?? '');
    if (!preg_match('/^[A-Za-z0-9_\-]{12,64}$/', $jti)) throw new HttpError('bad');
    /* لمرة واحدة: أول استهلاك يحجز المعرّف ذريًا حتى انتهاء صلاحيته */
    $k = 'sso_jti:' . hash('sha256', $jti);
    if (kv_get($k) !== null) throw new HttpError('used');
    kv_put($k, '1', max(5, $exp - $now + 10));
    $email = strtolower(trim((string)($data['sub'] ?? '')));
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) throw new HttpError('bad');
    $data['sub'] = $email;
    return $data;
}

/* نقطة الدخول (GET /api/?action=sso&t=…): تحقّق → جلسة لصاحب حساب فعّال → توجيه نظيف */
function sso_enter(): void {
    header('Referrer-Policy: no-referrer');
    header('Cache-Control: no-store');
    $home = rtrim((string)cfg('site_url'), '/') . '/';
    $go = function (string $hash) use ($home) { header('Location: ' . $home . $hash, true, 302); exit; };
    $fail = function (string $why) use ($go) { audit_log('', 'فشل دخول موحّد عبر مسار', $why); $go('?sso=' . rawurlencode($why)); };

    if (!sso_enabled()) $fail('disabled');
    if (rate_hit('sso_ip:' . client_ip(), 60, 3600)) $fail('rate');
    try { $d = sso_check((string)($_GET['t'] ?? '')); }
    catch (Throwable $e) { $fail($e->getMessage()); return; }

    $email = (string)$d['sub'];
    $u = q1('SELECT * FROM users WHERE email=?', [$email]);
    if (!$u || empty($u['active'])) $fail('no_account');                          /* قاصر على أصحاب الحسابات الفعّالة */
    if (!empty($u['locked_until']) && $u['locked_until'] > now()) $fail('locked');
    if (($u['role'] ?? '') === 'staff' && !empty($u['staff_ref']) && function_exists('staff_verified') && !staff_verified((string)$u['staff_ref'])) $fail('unverified');

    open_session($u, 'عبر مسار');                                                 /* نفس آلية الجلسة المعتمدة + تسجيل في السجل */
    $go('#home');
}

/* ===== قصر الدخول المباشر (الرمز) على الحسابات الرئيسية فقط =====
 * عند التفعيل: المنسوبون (role=staff) لا يصلهم رمز ويُوجَّهون للدخول عبر «مسار»،
 * والحسابات الرئيسية (الأدوار غير staff) تواصل الدخول بالرمز كالمعتاد.
 * مفتاح قابل للتبديل في kv؛ معطّل افتراضيًّا حتى يصبح دخول «مسار» جاهزًا. */
function sso_login_only(): bool { return (string)kv_get('otp_restrict') === '1'; }
function otp_account_allowed(array $u): bool { return is_owner($u) || (($u['role'] ?? '') !== 'staff'); }

/* تبديل/قراءة الحالة — لمدير النظام فقط */
function otp_lock_set(array $b): array {
    require_perm('settings');
    if (array_key_exists('on', $b)) {
        $on = !empty($b['on']);
        kv_put('otp_restrict', $on ? '1' : '0', 0);
        audit_log('', $on ? 'تفعيل قصر الدخول على مسار' : 'إلغاء قصر الدخول على مسار', $on ? 'مُفعّل' : 'مُلغى');
    }
    return ['ok' => true, 'on' => sso_login_only()];
}
