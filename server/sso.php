<?php
/**
 * Bonyan HR · دخول موحّد (SSO) من «مسار» إلى منصة الموارد البشرية
 * ----------------------------------------------------------------
 * خادم «مسار» يُصدِر لهوية المستخدم المسجَّل عنده رمزًا موقّعًا (HMAC-SHA256)،
 * قصير العمر (≤ دقيقتين) ولمرة واحدة ومربوطًا بالوجهة (aud=hr). وهذا الملف يتحقق
 * منه ثم يفتح جلسة HR لصاحب حساب فعّال فقط. السرّ المشترك في الإعدادات
 * (cfg('sso_secret')) على الطرفين، ولا يُرفع في المستودع إطلاقًا.
 * ما دام السرّ غير مُعرَّف فالخدمة معطّلة تمامًا.
 */
declare(strict_types=1);

function sso_secret(): string { return trim((string)cfg('sso_secret', '')); }
function sso_enabled(): bool { return sso_secret() !== ''; }

function sso_b64url_encode(string $s): string { return rtrim(strtr(base64_encode($s), '+/', '-_'), '='); }
function sso_b64url_decode(string $s): string {
    $s = strtr($s, '-_', '+/');
    $pad = strlen($s) % 4; if ($pad) $s .= str_repeat('=', 4 - $pad);
    return (string)base64_decode($s, true);
}

/* يُصدِر رمزًا — للاختبار والمرجع فقط؛ في الإنتاج يُصدره خادم «مسار» بالصيغة والسرّ نفسيهما.
   لا يرتبط به أي مسار في الـ API، فلا يمكن توليد رمز عبر HR من الخارج. */
function sso_mint(string $email, int $ttl = 90): string {
    $sec = sso_secret(); if ($sec === '') throw new HttpError('sso_disabled');
    $now = time();
    $payload = json_encode([
        'sub' => strtolower(trim($email)), 'iss' => 'masar', 'aud' => 'hr',
        'iat' => $now, 'exp' => $now + max(30, min(120, $ttl)), 'jti' => bin2hex(random_bytes(16)),
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $p = sso_b64url_encode((string)$payload);
    return $p . '.' . sso_b64url_encode(hash_hmac('sha256', $p, $sec, true));
}

/* يتحقق من الرمز ويعيد حمولته، أو يرمي HttpError بسبب الرفض (للسجل فقط) */
function sso_check(string $token): array {
    $sec = sso_secret();
    if ($sec === '') throw new HttpError('disabled');
    if (!preg_match('/^[A-Za-z0-9\-_]{8,1024}\.[A-Za-z0-9\-_]{32,128}$/', $token)) throw new HttpError('bad');
    [$p, $sig] = explode('.', $token, 2);
    $expect = sso_b64url_encode(hash_hmac('sha256', $p, $sec, true));
    if (!hash_equals($expect, $sig)) throw new HttpError('sig');                 /* توقيع غير صحيح */
    $data = json_decode(sso_b64url_decode($p), true);
    if (!is_array($data)) throw new HttpError('bad');
    if (($data['aud'] ?? '') !== 'hr' || ($data['iss'] ?? '') !== 'masar') throw new HttpError('aud');
    $now = time(); $iat = (int)($data['iat'] ?? 0); $exp = (int)($data['exp'] ?? 0);
    if ($iat <= 0 || $exp <= 0 || $iat > $now + 30 || $exp <= $now || $exp - $iat > 120) throw new HttpError('expired');
    $jti = (string)($data['jti'] ?? '');
    if (!preg_match('/^[a-f0-9]{16,64}$/', $jti)) throw new HttpError('bad');
    /* لمرة واحدة: أول استهلاك يحجز المعرّف ذريًا حتى انتهاء صلاحيته */
    $k = 'sso_jti:' . $jti;
    if (kv_get($k) !== null) throw new HttpError('used');                        /* إعادة استخدام */
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
