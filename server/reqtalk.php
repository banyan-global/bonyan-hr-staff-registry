<?php
/**
 * متابعة الطلبات والتواصل حولها
 * - المتابعون (الإدارة العليا): يصلهم كل طلب جديد وكل خطوة فيه إشعارًا في المنصة، وبالبريد حسب اختيارهم
 *   (new: الطلبات الجديدة والردود فقط — all: كل خطوة أيضًا — none: إشعارات المنصة فقط)، مع ملخص يومي
 * - محادثة الطلب: استفسار من المتابع أو المعتمد، ورد المنسوب، محفوظة مع الطلب ويراها من في مساره
 * - طلب التعديل: يُعاد الطلب إلى المنسوب (returned) فيعدّله ويعيد إرساله، فيكمل من المرحلة نفسها
 * - الإشعارات: جدول notes لكل بريد (حساب)، تظهر في جرس المنصة، ومعها تنبيه الجوال إن كان مفعّلًا
 */
declare(strict_types=1);

const REQ_WATCH_MODES = ['new', 'all', 'none'];

/* المتابعون: من أصحاب الاعتماد النهائي. الافتراضي (قبل أي ضبط): د. عبدالله، بريد الطلبات الجديدة والردود */
function req_watchers(): array {
    $v = json_decode((string)(setting('req_watchers') ?: ''), true);
    $fin = array_column(req_finals(), 'name', 'email');
    if (!is_array($v)) { $v = []; foreach ($fin as $e => $n) if (mb_strpos($n, 'عبدالله') !== false) { $v[] = ['email' => $e, 'mail' => 'new']; break; } }
    $o = [];
    foreach ($v as $w) { $e = strtolower(trim((string)($w['email'] ?? ''))); if (isset($fin[$e])) $o[$e] = ['email' => $e, 'name' => $fin[$e], 'mail' => in_array($w['mail'] ?? '', REQ_WATCH_MODES, true) ? $w['mail'] : 'new']; }
    return array_values($o);
}
function req_watchers_save(array $in): void {
    $fin = array_column(req_finals(), 'name', 'email'); $o = [];
    foreach (array_slice($in, 0, 10) as $w) { $e = strtolower(trim((string)($w['email'] ?? ''))); if (isset($fin[$e])) $o[$e] = ['email' => $e, 'mail' => in_array($w['mail'] ?? '', REQ_WATCH_MODES, true) ? $w['mail'] : 'new']; }
    setting_set('req_watchers', json_encode(array_values($o), JSON_UNESCAPED_UNICODE));
}
function req_is_watcher(string $email): bool { $email = strtolower($email); foreach (req_watchers() as $w) if ($w['email'] === $email) return true; return false; }
function req_private(array $r): bool { return function_exists('staff_private') && staff_private((string)$r['ref']); }

/* ============ الإشعارات داخل المنصة ============ */
function note_add(string $email, string $title, string $body, string $no = '', string $kind = 'info'): void {
    $email = strtolower(trim($email)); if ($email === '') return;
    q('INSERT INTO notes (email, title, body, req_no, kind, created_at) VALUES (?,?,?,?,?,?)', [$email, mb_substr($title, 0, 160), mb_substr($body, 0, 400), $no, $kind, now()]);
    /* تنبيه الجوال لصاحب الحساب إن فعّله (يُرسل بعد الرد حتى لا يتأخر المستخدم) */
    $u = q1('SELECT id FROM users WHERE LOWER(email)=? AND active=1', [$email]);
    if ($u && function_exists('push_to_user') && function_exists('defer_after')) { $uid = (int)$u['id']; defer_after(function () use ($uid, $title, $body, $no) { try { push_to_user($uid, ['title' => $title, 'body' => $body, 'url' => $no !== '' ? '#rq=' . $no : '#home']); } catch (Throwable $e) { } }); }
}
function note_list(): array {
    $u = current_user(); if (!$u) throw new HttpError('auth_required', 401);
    $rows = q('SELECT id, title, body, req_no, kind, created_at, read_at FROM notes WHERE email=? ORDER BY id DESC LIMIT 40', [strtolower((string)$u['email'])])->fetchAll();
    return ['ok' => true, 'notes' => array_map(fn($n) => ['id' => (int)$n['id'], 't' => $n['title'], 'b' => $n['body'], 'no' => $n['req_no'], 'k' => $n['kind'], 'at' => substr((string)$n['created_at'], 0, 16), 'read' => $n['read_at'] !== null], $rows),
        'unread' => (int)q1('SELECT COUNT(*) n FROM notes WHERE email=? AND read_at IS NULL', [strtolower((string)$u['email'])])['n']];
}
function note_read(array $b): array {
    $u = current_user(); if (!$u) throw new HttpError('auth_required', 401);
    $mail = strtolower((string)$u['email']);
    if (!empty($b['all'])) q('UPDATE notes SET read_at=? WHERE email=? AND read_at IS NULL', [now(), $mail]);
    elseif (($b['no'] ?? '') !== '') q('UPDATE notes SET read_at=? WHERE email=? AND req_no=? AND read_at IS NULL', [now(), $mail, (string)$b['no']]);
    else foreach (array_slice((array)($b['ids'] ?? []), 0, 50) as $id) q('UPDATE notes SET read_at=? WHERE email=? AND id=? AND read_at IS NULL', [now(), $mail, (int)$id]);
    return ['ok' => true];
}

/* ============ المتابعون: أحداث الطلب ============ */
function req_watch_event(array $r, string $ev, string $line = '', string $skip = ''): void {
    if (req_private($r)) return; /* السجل الخاص طلباته بينه وبين المالك فقط */
    $s = staff_get($r['ref']); $name = $s ? staff_name($s) : $r['ref']; $tn = REQ_TYPES[$r['type']][1] ?? 'طلب';
    $chain = json_decode($r['chain'], true) ?: []; $mine = req_staff_emails($r['ref']);
    $where = $r['status'] === 'pending' ? 'عند ' . ($chain[(int)$r['stage']]['who'] ?? $chain[(int)$r['stage']]['label'] ?? '') : (REQ_ST[$r['status']] ?? $r['status']);
    foreach (req_watchers() as $w) {
        if (in_array($w['email'], $mine, true) || $w['email'] === strtolower($skip)) continue;
        $title = ['new' => 'طلب جديد: ' . $tn, 'step' => $tn . ' · ' . $name, 'reply' => 'رد الموظف: ' . $name, 'resubmit' => 'عدّل ' . $name . ' طلبه'][$ev] ?? $tn;
        note_add($w['email'], $title, ($ev === 'new' ? $name . ' · ' . req_summary($r) . ' · ' . $where : $line . ($line !== '' ? ' · ' : '') . $where) . ' · ' . $r['no'], $r['no'], $ev);
        $send = $w['mail'] === 'all' || ($w['mail'] === 'new' && in_array($ev, ['new', 'reply', 'resubmit'], true));
        if ($send) try { req_watch_mail($r, $w, $ev, $line); } catch (Throwable $e) { error_log('[bonyan-hr] watch mail ' . $e->getMessage()); }
    }
}
function req_watch_mail(array $r, array $w, string $ev, string $line): void {
    $s = staff_get($r['ref']); $name = $s ? staff_name($s) : $r['ref']; $tn = REQ_TYPES[$r['type']][1] ?? 'طلب';
    $open = $r['status'] === 'pending';
    $btns = [[mx_url('rq=' . $r['no']), $open ? '💬 استفسار أو طلب تعديل' : 'عرض الطلب في المنصة', 'primary']];
    if ($open) array_unshift($btns, [(string)cfg('site_url') . 'decide.html#t=' . req_tok_issue($r, (int)$r['stage'], $w['email'], $w['name']) . '&a=approve', '✓ اعتماد نهائي', 'success']);
    $head = ['new' => ['طلب جديد من ' . $name, 'قدّم ' . $name . ' ' . $tn . '. هذه تفاصيله وأين وصل في مساره، وتستطيع اعتماده نهائيًا أو التواصل معه من الأزرار أدناه.', 'blue'],
        'step' => [$tn . ': ' . $line, 'تحديث على طلب ' . $name . '.', 'blue'],
        'reply' => ['رد ' . $name . ' على استفسارك', $line, 'gold'],
        'resubmit' => ['عدّل ' . $name . ' طلبه وأعاد إرساله', 'أجرى الموظف التعديل المطلوب، والطلب الآن ' . ($open ? 'يكمل مساره.' : (REQ_ST[$r['status']] ?? '')), 'green']][$ev] ?? [$tn, $line, 'blue'];
    $rows = array_merge([['رقم الطلب', $r['no'], 1], ['مقدّم الطلب', $name], ['نوع الطلب', $tn]], array_map(fn($v) => [$v[0], (string)$v[1], $v[2] ?? 0], req_view_rows($r)));
    $html = mx_page(['tone' => $head[2], 'badge' => $tn, 'title' => $head[0], 'lead' => $head[1],
        'body' => ($ev === 'reply' ? '' : mx_rows($rows, 'تفاصيل الطلب')) . req_chain_html($r) . req_thread_html($r['no']), 'buttons' => $btns,
        'foot' => 'يصلك هذا البريد لأنك متابع لطلبات المنسوبين. تغيّر ما يصلك بالبريد من «النماذج الإدارية» ← «إدارة القائمة».']);
    send_mail($w['email'], $head[0] . ' · ' . $r['no'], $html, $head[0] . "\n" . mx_url('rq=' . $r['no']), 'Bonyan HR', logo_inline());
}

/* ============ محادثة الطلب ============ */
function req_msgs(string $no): array {
    return array_map(fn($m) => ['id' => (int)$m['id'], 'k' => $m['kind'], 'by' => $m['by_name'], 'role' => $m['by_role'], 'body' => $m['body'], 'at' => substr((string)$m['created_at'], 0, 16)],
        q('SELECT * FROM req_msgs WHERE req_no=? ORDER BY id', [$no])->fetchAll());
}
function req_thread_html(string $no): string {
    $m = array_slice(req_msgs($no), -4); if (!$m) return '';
    $h = '';
    foreach ($m as $x) $h .= mx_note(($x['k'] === 'edit' ? 'طلب تعديل: ' : '') . $x['body'], $x['role'] === 'staff' ? 'gold' : 'blue', $x['by'] . ' · ' . $x['at']);
    return '<div style="height:6px"></div>' . $h;
}
/* من يشارك في محادثة الطلب: صاحبه، والمتابعون، وأصحاب الاعتماد النهائي، ومن في مساره، والموارد البشرية ومدير النظام */
function req_talk_role(array $u, array $r): string {
    $mail = strtolower((string)$u['email']);
    if (my_staff_ref($u) === $r['ref']) return 'staff';
    if (req_private($r)) return is_owner($u) ? 'boss' : '';
    if (req_is_watcher($mail) || req_is_final($mail)) return 'boss';
    if (req_can_decide($u, $r) || strpos((string)$r['chain'], '"email":"' . $mail . '"') !== false) return 'approver';
    if (has_perm($u, 'requests.approve') || has_perm($u, 'staff.edit')) return 'hr';
    return '';
}
function req_msg(array $b): array {
    $u = current_user(); if (!$u) throw new HttpError('auth_required', 401);
    $r = q1('SELECT * FROM requests WHERE no=?', [(string)($b['no'] ?? '')]); if (!$r) throw new HttpError('not_found', 404);
    $role = req_talk_role($u, $r); if ($role === '') throw new HttpError('forbidden', 403);
    $kind = (string)($b['kind'] ?? 'ask'); $body = req_str($b['body'] ?? '', 1500);
    if (mb_strlen(trim($body)) < 2) throw new HttpError('اكتب رسالتك');
    if (rate_hit('rmsg:' . $u['id'], 60, 3600)) throw new HttpError('رسائل كثيرة؛ حاول بعد قليل', 429);
    if ($role === 'staff') $kind = 'reply';
    elseif (!in_array($kind, ['ask', 'edit'], true)) $kind = 'ask';
    if ($kind === 'edit' && $r['status'] !== 'pending') throw new HttpError('طلب التعديل متاح والطلب قيد الإجراء فقط');
    $by = (string)($u['name'] ?: $u['email']);
    q('INSERT INTO req_msgs (req_no, by_email, by_name, by_role, kind, body, created_at) VALUES (?,?,?,?,?,?,?)', [$r['no'], strtolower((string)$u['email']), $by, $role === 'staff' ? 'staff' : $role, $kind, $body, now()]);
    if ($kind === 'edit') { q("UPDATE requests SET status='returned', updated_at=? WHERE id=?", [now(), $r['id']]); $r = q1('SELECT * FROM requests WHERE id=?', [$r['id']]); }
    audit_log($r['ref'], ['ask' => 'استفسار على طلب', 'edit' => 'طلب تعديل', 'reply' => 'رد على استفسار'][$kind], $r['no'] . ' · ' . mb_substr($body, 0, 200), $u['_label'] ?? $by);
    $s = staff_get($r['ref']); $name = $s ? staff_name($s) : $r['ref']; $tn = REQ_TYPES[$r['type']][1] ?? 'طلب';
    if ($role !== 'staff') {
        /* إلى الموظف: بريد وإشعار، وزر الرد أو التعديل يفتح الطلب في بوابته */
        foreach (req_staff_emails($r['ref']) as $e) note_add($e, $kind === 'edit' ? 'مطلوب تعديل طلبك' : 'استفسار على طلبك', $by . ': ' . mb_substr($body, 0, 160), $r['no'], $kind);
        $html = mx_page(['tone' => $kind === 'edit' ? 'gold' : 'blue', 'badge' => $tn, 'title' => $kind === 'edit' ? 'مطلوب تعديل على طلبك' : 'استفسار على طلبك',
            'lead' => $kind === 'edit' ? 'طلب ' . $by . ' تعديلًا على طلبك ' . $r['no'] . '. عدّله وأعد إرساله، فيكمل مساره من المرحلة نفسها.' : 'كتب ' . $by . ' استفسارًا على طلبك ' . $r['no'] . '. ردّك يصل إليه مباشرة.',
            'body' => mx_note($body, $kind === 'edit' ? 'gold' : 'blue', $by) . mx_rows([['رقم الطلب', $r['no'], 1], ['نوع الطلب', $tn], ['التفاصيل', req_summary($r)]], 'الطلب'),
            'buttons' => [[mx_url('rq=' . $r['no']), $kind === 'edit' ? '✎ تعديل الطلب وإعادة إرساله' : '💬 الرد على الاستفسار', 'primary']]]);
        $to = req_staff_email($s); if ($to !== '') try { send_mail($to, ($kind === 'edit' ? 'مطلوب تعديل طلبك ' : 'استفسار على طلبك ') . $r['no'], $html, $body . "\n" . mx_url('rq=' . $r['no']), 'Bonyan HR', logo_inline()); } catch (Throwable $e) { }
        /* المتابعون الآخرون يعلمون بالاستفسار في الجرس */
        foreach (req_watchers() as $w) if ($w['email'] !== strtolower((string)$u['email'])) note_add($w['email'], ($kind === 'edit' ? 'طلب تعديل من ' : 'استفسار من ') . $by, $name . ' · ' . $r['no'] . ': ' . mb_substr($body, 0, 140), $r['no'], $kind);
    } else {
        /* رد الموظف: إلى من سأله (بريد وإشعار)، والمتابعين */
        $askers = []; foreach (q("SELECT DISTINCT by_email, by_name FROM req_msgs WHERE req_no=? AND kind IN ('ask','edit')", [$r['no']])->fetchAll() as $a) $askers[$a['by_email']] = $a['by_name'];
        foreach ($askers as $e => $n) {
            if (req_is_watcher($e)) continue; /* المتابع يصله من req_watch_event */
            note_add($e, 'رد ' . $name, mb_substr($body, 0, 180), $r['no'], 'reply');
            $html = mx_page(['tone' => 'gold', 'badge' => $tn, 'title' => 'رد ' . $name . ' على استفسارك', 'lead' => 'على الطلب ' . $r['no'] . '.', 'body' => mx_note($body, 'gold', $name) . req_thread_html($r['no']), 'buttons' => [[mx_url('rq=' . $r['no']), 'فتح الطلب والمحادثة', 'primary']]]);
            try { send_mail($e, 'رد ' . $name . ' · ' . $r['no'], $html, $body, 'Bonyan HR', logo_inline()); } catch (Throwable $ex) { }
        }
        req_watch_event($r, 'reply', mb_substr($body, 0, 300));
    }
    return ['ok' => true, 'request' => req_out($u, $r)];
}
/* إعادة إرسال الطلب بعد التعديل: تُحدَّث بياناته ويكمل من المرحلة نفسها */
function req_resubmit(array $b): array {
    $u = current_user(); if (!$u) throw new HttpError('auth_required', 401);
    $r = q1('SELECT * FROM requests WHERE no=?', [(string)($b['no'] ?? '')]); if (!$r) throw new HttpError('not_found', 404);
    $own = my_staff_ref($u) === $r['ref']; if (!$own && !has_perm($u, 'staff.edit')) throw new HttpError('forbidden', 403);
    if ($r['status'] !== 'returned') throw new HttpError('الطلب ليس بانتظار التعديل');
    $old = json_decode($r['data'], true) ?: []; $in = (array)($b['data'] ?? []);
    $in['supervisor'] = $old['supervisor'] ?? ''; /* المسار ثابت؛ لا يتغيّر المسؤول المباشر عند التعديل */
    $GLOBALS['REQ_EXCEPT_NO'] = $r['no'];
    $data = req_clean($r['type'], $in, $r['ref']);
    if ($r['type'] === 'leave') { req_leave_overlap($r['ref'], $data, $r['no']); if (function_exists('leave_quota_check')) leave_quota_check($r['ref'], $data, $r['no']); }
    foreach (['supName', 'supervisor'] as $k) if (isset($old[$k])) $data[$k] = $old[$k];
    $chg = []; foreach ($data as $k => $v) if (!is_array($v) && (string)($old[$k] ?? '') !== (string)$v && !in_array($k, ['supName', 'supervisor'], true)) $chg[] = $k;
    q("UPDATE requests SET data=?, status='pending', updated_at=? WHERE id=?", [json_encode($data, JSON_UNESCAPED_UNICODE), now(), $r['id']]);
    $by = (string)($u['name'] ?: $u['email']);
    q('INSERT INTO req_msgs (req_no, by_email, by_name, by_role, kind, body, created_at) VALUES (?,?,?,?,?,?,?)', [$r['no'], strtolower((string)$u['email']), $by, 'staff', 'resubmit', req_str($b['note'] ?? '', 600) ?: 'عدّلت الطلب وأعدت إرساله.', now()]);
    $r = q1('SELECT * FROM requests WHERE id=?', [$r['id']]);
    audit_log($r['ref'], 'إعادة إرسال بعد التعديل', $r['no'] . ($chg ? ' · ' . implode('، ', $chg) : ''), $u['_label'] ?? $by);
    /* من طلب التعديل يعلم، والمعتمد الحالي تصله رسالة الاعتماد من جديد */
    foreach (q("SELECT DISTINCT by_email FROM req_msgs WHERE req_no=? AND kind='edit'", [$r['no']])->fetchAll() as $a) if (!req_is_watcher($a['by_email'])) note_add($a['by_email'], 'عُدّل الطلب ' . $r['no'], 'أعاد الموظف إرساله بعد التعديل', $r['no'], 'resubmit');
    $chain = json_decode($r['chain'], true) ?: [];
    if ($r['type'] === 'leave') lv_mail_approvers($r); else req_mail_approvers($r, $chain[(int)$r['stage']] ?? []);
    req_watch_event($r, 'resubmit', '');
    return ['ok' => true, 'request' => req_out($u, $r)];
}

/* ============ الملخص اليومي للمتابعين (من المهمة اليومية) ============ */
function req_watch_digest(): int {
    $n = 0; $since = date('Y-m-d H:i:s', strtotime('-1 day'));
    $rows = q("SELECT * FROM requests WHERE updated_at >= ? OR status IN ('pending','returned') ORDER BY id DESC LIMIT 400", [$since])->fetchAll();
    $rows = array_values(array_filter($rows, fn($r) => !req_private($r)));
    if (!$rows) return 0;
    $new = array_filter($rows, fn($r) => $r['created_at'] >= $since);
    $done = array_filter($rows, fn($r) => $r['updated_at'] >= $since && in_array($r['status'], ['approved', 'rejected'], true));
    $late = array_filter($rows, fn($r) => in_array($r['status'], ['pending', 'returned'], true) && $r['updated_at'] < date('Y-m-d H:i:s', strtotime('-2 days')));
    if (!$new && !$done && !$late) return 0;
    $line = function ($r) { $s = staff_get($r['ref']); $c = json_decode($r['chain'], true) ?: [];
        return [$r['no'], ($s ? staff_name($s) : $r['ref']) . ' · ' . (REQ_TYPES[$r['type']][1] ?? '') . ' · ' . ($r['status'] === 'pending' ? 'عند ' . ($c[(int)$r['stage']]['who'] ?? $c[(int)$r['stage']]['label'] ?? '') : (REQ_ST[$r['status']] ?? ''))]; };
    $body = ($new ? mx_rows(array_map($line, array_slice(array_values($new), 0, 25)), 'طلبات جديدة (' . count($new) . ')') : '')
        . ($done ? mx_rows(array_map($line, array_slice(array_values($done), 0, 25)), 'صدر فيها القرار (' . count($done) . ')') : '')
        . ($late ? mx_rows(array_map($line, array_slice(array_values($late), 0, 25)), 'متأخرة أكثر من يومين (' . count($late) . ')') : '');
    foreach (req_watchers() as $w) {
        if ($w['mail'] === 'none') continue;
        $html = mx_page(['tone' => $late ? 'gold' : 'blue', 'badge' => 'ملخص يومي', 'title' => 'ملخص طلبات المنسوبين', 'lead' => count($new) . ' طلبًا جديدًا، و' . count($done) . ' صدر فيها القرار، و' . count($late) . ' متأخرة.',
            'body' => $body, 'buttons' => [[mx_url('reqs'), 'فتح الطلبات في المنصة', 'primary']]]);
        try { send_mail($w['email'], 'ملخص طلبات المنسوبين · ' . date('Y-m-d'), $html, 'ملخص طلبات المنسوبين', 'Bonyan HR', logo_inline()); $n++; } catch (Throwable $e) { }
    }
    return $n;
}
/* يُرسل الملخص مرة واحدة في اليوم بعد السابعة صباحًا: من المهمة اليومية إن كانت مضبوطة، أو مع أول زيارة للمنصة بعدها */
function req_watch_digest_tick(): void {
    $tz = new DateTimeZone('Asia/Riyadh'); $now = new DateTime('now', $tz);
    if ((int)$now->format('G') < 7) return;
    $k = 'wdigest:' . $now->format('Y-m-d');
    if (kv_get($k) !== null) return;
    kv_put($k, '1', 3 * 86400);
    req_watch_digest();
}
