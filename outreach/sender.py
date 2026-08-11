#!/usr/bin/env python3
"""Outbound sender for Tony's Window Cleaning.

Sends personalised plain-text email to a prospect list over SMTP, one message
at a time, inside the limits that keep a sending domain alive.

The limits are enforced here rather than documented, because the last batch
failed on exactly the things that are easy to skip when you are in a hurry:

  * a per-inbox daily cap, and a warmup ramp for the first weeks of a domain
  * a send window, so nothing goes out at 3am looking automated
  * randomised spacing between messages
  * every merge field required, so no message goes out with a blank where the
    personal line should be - that is the difference between outreach and spam,
    and it is also the only reason any of these get a reply
  * a suppression list that is checked before every single send and can only be
    added to, never cleared
  * CAN-SPAM's actual requirements - a real postal address and a working
    opt-out - refused at startup if they are not configured

Commands:

    sender.py init                        create the database
    sender.py import leads.csv            load prospects (dedupes on email)
    sender.py preview -t installer        render the next few messages
    sender.py send -t installer --dry-run rehearse a run, send nothing
    sender.py send -t installer           send, respecting every limit
    sender.py sync                        pull replies + bounces, auto-suppress
    sender.py suppress a@b.com -r "asked" add to the do-not-contact list
    sender.py stats                       what has gone out, what came back
"""
from __future__ import annotations

import argparse
import csv
import email.utils
import imaplib
import os
import random
import re
import smtplib
import sqlite3
import ssl
import sys
import time
import tomllib
from datetime import date, datetime, timedelta
from email.header import decode_header, make_header
from email.message import EmailMessage
from email.parser import BytesParser
from email.policy import default as default_policy
from pathlib import Path
from zoneinfo import ZoneInfo

HERE = Path(__file__).resolve().parent
DB_PATH = HERE / 'outreach.db'
CONFIG_PATH = HERE / 'config.toml'
TEMPLATE_DIR = HERE / 'templates'

FIELD = re.compile(r'\{([a-z0-9_]+)\}')

SCHEMA = """
CREATE TABLE IF NOT EXISTS prospect (
  id            INTEGER PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  company       TEXT NOT NULL DEFAULT '',
  first_name    TEXT NOT NULL DEFAULT '',
  segment       TEXT NOT NULL DEFAULT '',
  city          TEXT NOT NULL DEFAULT '',
  personal_note TEXT NOT NULL DEFAULT '',
  source        TEXT NOT NULL DEFAULT '',
  added_on      TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sent (
  id          INTEGER PRIMARY KEY,
  prospect_id INTEGER NOT NULL REFERENCES prospect(id),
  template    TEXT NOT NULL,
  account     TEXT NOT NULL,
  message_id  TEXT NOT NULL,
  sent_at     TEXT NOT NULL,
  UNIQUE (prospect_id, template)
);
CREATE TABLE IF NOT EXISTS suppression (
  email      TEXT PRIMARY KEY,
  reason     TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS state (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS sent_day ON sent (account, sent_at);
"""


# ---------------------------------------------------------------- config


class ConfigError(Exception):
    pass


def load_config() -> dict:
    if not CONFIG_PATH.exists():
        raise ConfigError(
            'no config.toml - copy config.example.toml to config.toml and fill it in')
    with CONFIG_PATH.open('rb') as fh:
        cfg = tomllib.load(fh)

    # CAN-SPAM: a commercial message must carry a real postal address and a
    # working way to opt out. Both are refused here rather than warned about,
    # because a template that quietly loses them still looks fine when sent.
    ident = cfg.get('identity', {})
    for key in ('from_name', 'postal_address', 'unsubscribe_mailto'):
        if not ident.get(key):
            raise ConfigError('identity.%s is required before anything can send' % key)

    if not cfg.get('accounts'):
        raise ConfigError('at least one [[accounts]] block is required')
    for acct in cfg['accounts']:
        for key in ('address', 'host', 'port', 'password_env'):
            if not acct.get(key):
                raise ConfigError('accounts entry is missing %s' % key)
        if not os.environ.get(acct['password_env']):
            raise ConfigError(
                'environment variable %s is not set - that is the app password '
                'for %s' % (acct['password_env'], acct['address']))
    return cfg


def limits(cfg: dict) -> dict:
    d = dict(daily_cap=25, min_gap_seconds=45, max_gap_seconds=200,
             send_from_hour=8, send_to_hour=16, timezone='America/Los_Angeles',
             warmup_start=None, warmup_days=21, warmup_first_day_cap=5)
    d.update(cfg.get('limits', {}))
    return d


def allowed_today(lim: dict) -> int:
    """Daily cap, reduced during warmup.

    A domain with no sending history that opens at full volume is the exact
    pattern reputation systems are built to catch, so the cap ramps linearly
    from warmup_first_day_cap up to daily_cap over warmup_days.
    """
    start = lim.get('warmup_start')
    if not start:
        return int(lim['daily_cap'])
    began = date.fromisoformat(str(start))
    elapsed = (date.today() - began).days
    if elapsed >= int(lim['warmup_days']):
        return int(lim['daily_cap'])
    if elapsed < 0:
        return 0
    lo, hi = int(lim['warmup_first_day_cap']), int(lim['daily_cap'])
    span = max(int(lim['warmup_days']), 1)
    return max(lo, int(lo + (hi - lo) * (elapsed / span)))


def within_window(lim: dict) -> tuple[bool, str]:
    now = datetime.now(ZoneInfo(lim['timezone']))
    if now.weekday() >= 5:
        return False, 'weekend - nothing sends Saturday or Sunday'
    if not (int(lim['send_from_hour']) <= now.hour < int(lim['send_to_hour'])):
        return False, 'outside the %02d:00-%02d:00 send window (now %02d:%02d %s)' % (
            int(lim['send_from_hour']), int(lim['send_to_hour']),
            now.hour, now.minute, lim['timezone'])
    return True, ''


# ---------------------------------------------------------------- database


def connect() -> sqlite3.Connection:
    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row
    db.execute('PRAGMA foreign_keys = ON')
    return db


def cmd_init(args) -> int:
    db = connect()
    db.executescript(SCHEMA)
    db.commit()
    print('database ready at %s' % DB_PATH)
    return 0


def cmd_import(args) -> int:
    db = connect()
    db.executescript(SCHEMA)
    added = updated = skipped = 0
    with open(args.csvfile, newline='', encoding='utf-8-sig') as fh:
        for row in csv.DictReader(fh):
            addr = (row.get('email') or '').strip().lower()
            if not addr or '@' not in addr:
                skipped += 1
                continue
            values = {k: (row.get(k) or '').strip()
                      for k in ('company', 'first_name', 'segment', 'city',
                                'personal_note', 'source')}
            existing = db.execute(
                'SELECT id FROM prospect WHERE email = ?', (addr,)).fetchone()
            if existing:
                # re-importing is how a personal_note gets filled in later, so
                # only overwrite a column when the new file actually has a value
                sets, params = [], []
                for k, v in values.items():
                    if v:
                        sets.append('%s = ?' % k)
                        params.append(v)
                if sets:
                    params.append(existing['id'])
                    db.execute('UPDATE prospect SET %s WHERE id = ?' % ', '.join(sets),
                               params)
                    updated += 1
            else:
                db.execute(
                    'INSERT INTO prospect (email, company, first_name, segment, city,'
                    ' personal_note, source, added_on) VALUES (?,?,?,?,?,?,?,?)',
                    (addr, values['company'], values['first_name'], values['segment'],
                     values['city'], values['personal_note'], values['source'],
                     date.today().isoformat()))
                added += 1
    db.commit()
    print('added %d, updated %d, skipped %d' % (added, updated, skipped))
    return 0


def cmd_suppress(args) -> int:
    db = connect()
    db.executescript(SCHEMA)
    db.execute(
        'INSERT OR REPLACE INTO suppression (email, reason, created_at) VALUES (?,?,?)',
        (args.email.strip().lower(), args.reason, datetime.now().isoformat(timespec='seconds')))
    db.commit()
    print('%s will never be contacted again' % args.email)
    return 0


# ---------------------------------------------------------------- templates


def load_template(name: str) -> tuple[str, str]:
    path = TEMPLATE_DIR / ('%s.txt' % name)
    if not path.exists():
        raise ConfigError('no template at %s' % path)
    raw = path.read_text(encoding='utf-8')
    head, _, body = raw.partition('\n\n')
    if not head.lower().startswith('subject:'):
        raise ConfigError('%s must start with a "Subject:" line, then a blank line' % path)
    return head.split(':', 1)[1].strip(), body.strip()


def render(text: str, row: sqlite3.Row) -> tuple[str, list[str]]:
    """Fill merge fields. Returns the text and any fields that were empty.

    An unfilled field is a hard skip, not a blank. A message that opens
    "I was at  on " is worse than no message at all.
    """
    missing: list[str] = []
    keys = row.keys()

    def sub(m):
        key = m.group(1)
        if key not in keys:
            missing.append(key)
            return m.group(0)
        value = (row[key] or '').strip()
        if not value:
            missing.append(key)
        return value

    return FIELD.sub(sub, text), sorted(set(missing))


def build(cfg: dict, account: dict, row: sqlite3.Row, subject: str,
          body: str) -> EmailMessage:
    ident = cfg['identity']
    msg = EmailMessage()
    msg['From'] = email.utils.formataddr((ident['from_name'], account['address']))
    msg['To'] = row['email']
    msg['Subject'] = subject
    msg['Date'] = email.utils.formatdate(localtime=True)
    msg['Message-ID'] = email.utils.make_msgid(domain=account['address'].split('@')[-1])
    if ident.get('reply_to'):
        msg['Reply-To'] = ident['reply_to']
    # mailto unsubscribe is valid and needs no web endpoint. One-click
    # (RFC 8058) only becomes mandatory above 5,000 messages a day to Gmail,
    # which this tool's caps put far out of reach.
    msg['List-Unsubscribe'] = '<mailto:%s?subject=unsubscribe>' % ident['unsubscribe_mailto']
    msg.set_content(
        '%s\n\n--\n%s\n%s\n\nNot interested? Reply "stop" and I will not contact you again.\n'
        % (body.rstrip(), ident['from_name'], ident['postal_address']))
    return msg


# ---------------------------------------------------------------- selection


def candidates(db: sqlite3.Connection, template: str, segment: str | None):
    sql = ('SELECT p.* FROM prospect p '
           'WHERE p.email NOT IN (SELECT email FROM suppression) '
           '  AND p.id NOT IN (SELECT prospect_id FROM sent WHERE template = ?) ')
    params: list = [template]
    if segment:
        sql += ' AND p.segment = ?'
        params.append(segment)
    sql += ' ORDER BY p.id'
    return db.execute(sql, params).fetchall()


def sent_today(db: sqlite3.Connection, account: str) -> int:
    today = date.today().isoformat()
    return db.execute(
        'SELECT COUNT(*) FROM sent WHERE account = ? AND sent_at LIKE ?',
        (account, today + '%')).fetchone()[0]


def cmd_preview(args) -> int:
    cfg = load_config()
    db = connect()
    db.executescript(SCHEMA)
    subject_t, body_t = load_template(args.template)
    shown = 0
    for row in candidates(db, args.template, args.segment):
        subject, m1 = render(subject_t, row)
        body, m2 = render(body_t, row)
        missing = sorted(set(m1 + m2))
        print('=' * 72)
        print('to:      %s   (%s)' % (row['email'], row['company'] or 'no company'))
        if missing:
            print('SKIPPED: missing %s' % ', '.join(missing))
            continue
        print('subject: %s\n' % subject)
        print(body)
        shown += 1
        if shown >= args.limit:
            break
    print('=' * 72)
    return 0


# ---------------------------------------------------------------- sending


def cmd_send(args) -> int:
    cfg = load_config()
    lim = limits(cfg)
    db = connect()
    db.executescript(SCHEMA)
    subject_t, body_t = load_template(args.template)

    ok, why = within_window(lim)
    if not ok and not args.dry_run:
        print('not sending: %s' % why, file=sys.stderr)
        return 1

    cap = allowed_today(lim)
    queue = candidates(db, args.template, args.segment)
    if not queue:
        print('nothing queued for template "%s"' % args.template)
        return 0

    accounts = cfg['accounts']
    budget = {a['address']: max(0, cap - sent_today(db, a['address'])) for a in accounts}
    total = sum(budget.values())
    if args.limit:
        total = min(total, args.limit)
    if total <= 0:
        print('daily cap reached on every account (cap is %d/inbox today)' % cap)
        return 0

    print('template %s | %d queued | cap %d/inbox | budget %d %s'
          % (args.template, len(queue), cap, total,
             '(DRY RUN - nothing will be sent)' if args.dry_run else ''))

    servers: dict[str, smtplib.SMTP] = {}
    delivered = skipped = 0
    try:
        for row in queue:
            if delivered >= total:
                break
            subject, m1 = render(subject_t, row)
            body, m2 = render(body_t, row)
            missing = sorted(set(m1 + m2))
            if missing:
                print('  skip  %-38s missing %s' % (row['email'], ', '.join(missing)))
                skipped += 1
                continue

            account = next((a for a in accounts if budget[a['address']] > 0), None)
            if account is None:
                break

            msg = build(cfg, account, row, subject, body)
            if args.dry_run:
                print('  would send to %-34s via %s' % (row['email'], account['address']))
            else:
                srv = servers.get(account['address'])
                if srv is None:
                    srv = smtplib.SMTP(account['host'], int(account['port']), timeout=30)
                    # verify the server's certificate explicitly - smtplib's
                    # default context does not, and this connection carries the
                    # mailbox password
                    srv.starttls(context=ssl.create_default_context())
                    srv.login(account.get('username') or account['address'],
                              os.environ[account['password_env']])
                    servers[account['address']] = srv
                srv.send_message(msg)
                db.execute(
                    'INSERT INTO sent (prospect_id, template, account, message_id, sent_at)'
                    ' VALUES (?,?,?,?,?)',
                    (row['id'], args.template, account['address'], msg['Message-ID'],
                     datetime.now().isoformat(timespec='seconds')))
                db.commit()
                print('  sent  %-38s via %s' % (row['email'], account['address']))

            budget[account['address']] -= 1
            delivered += 1

            if delivered < total and not args.dry_run:
                # human-ish spacing; a burst of identical-interval sends is a
                # machine signature even when the content is fine
                time.sleep(random.uniform(float(lim['min_gap_seconds']),
                                          float(lim['max_gap_seconds'])))
    finally:
        for srv in servers.values():
            try:
                srv.quit()
            except Exception:
                pass

    print('\n%s %d, skipped %d for missing fields'
          % ('would send' if args.dry_run else 'sent', delivered, skipped))
    if skipped:
        print('fill the blanks in your CSV and re-import to pick those up')
    return 0


# ---------------------------------------------------------------- replies


def _addresses(value: str) -> list[str]:
    return [a.lower() for _, a in email.utils.getaddresses([value or '']) if a]


def cmd_sync(args) -> int:
    """Suppress anyone who replied and anyone whose address bounced.

    Continuing to mail someone who already answered is the single fastest way
    to collect a spam complaint, and complaints are what throttle a domain.
    """
    cfg = load_config()
    db = connect()
    db.executescript(SCHEMA)
    known = {r['email'] for r in db.execute('SELECT email FROM prospect')}
    since = (date.today() - timedelta(days=args.days)).strftime('%d-%b-%Y')
    added = 0

    for account in cfg['accounts']:
        host = account.get('imap_host')
        if not host:
            print('%s: no imap_host configured, skipping' % account['address'])
            continue
        box = imaplib.IMAP4_SSL(host, int(account.get('imap_port', 993)))
        try:
            box.login(account.get('username') or account['address'],
                      os.environ[account['password_env']])
            box.select('INBOX')
            _, data = box.search(None, '(SINCE %s)' % since)
            for num in data[0].split():
                _, raw = box.fetch(num, '(RFC822)')
                if not raw or not isinstance(raw[0], tuple):
                    continue
                msg = BytesParser(policy=default_policy).parsebytes(raw[0][1])
                senders = _addresses(msg.get('From', ''))
                body = ''
                try:
                    part = msg.get_body(preferencelist=('plain',))
                    body = part.get_content() if part else ''
                except Exception:
                    body = ''

                hits: set[str] = set()
                # a direct reply from someone on the list
                hits |= {a for a in senders if a in known}
                # a bounce: the failed address appears in the report body
                if any(k in s for s in senders
                       for k in ('mailer-daemon', 'postmaster', 'noreply')):
                    hits |= {a for a in known if a in body.lower()}
                for addr in hits:
                    reason = 'replied' if addr in senders else 'bounced'
                    cur = db.execute(
                        'INSERT OR IGNORE INTO suppression (email, reason, created_at)'
                        ' VALUES (?,?,?)',
                        (addr, reason, datetime.now().isoformat(timespec='seconds')))
                    if cur.rowcount:
                        added += 1
                        print('  suppressed %-38s (%s)' % (addr, reason))
            db.commit()
        finally:
            try:
                box.logout()
            except Exception:
                pass

    print('%d newly suppressed' % added)
    return 0


def cmd_stats(args) -> int:
    db = connect()
    db.executescript(SCHEMA)
    total = db.execute('SELECT COUNT(*) FROM prospect').fetchone()[0]
    supp = db.execute('SELECT COUNT(*) FROM suppression').fetchone()[0]
    print('prospects        %d' % total)
    print('suppressed       %d' % supp)
    print()
    rows = db.execute(
        'SELECT template, COUNT(*) n, MAX(sent_at) last FROM sent'
        ' GROUP BY template ORDER BY n DESC').fetchall()
    if rows:
        print('%-24s %6s  %s' % ('template', 'sent', 'last'))
        for r in rows:
            print('%-24s %6d  %s' % (r['template'], r['n'], r['last']))
        print()
    rows = db.execute(
        "SELECT substr(sent_at,1,10) d, account, COUNT(*) n FROM sent"
        " GROUP BY d, account ORDER BY d DESC LIMIT 10").fetchall()
    if rows:
        print('%-12s %-32s %s' % ('day', 'inbox', 'sent'))
        for r in rows:
            print('%-12s %-32s %d' % (r['d'], r['account'], r['n']))
    rows = db.execute(
        'SELECT reason, COUNT(*) n FROM suppression GROUP BY reason ORDER BY n DESC'
    ).fetchall()
    if rows:
        print()
        print('%-24s %s' % ('suppressed because', 'count'))
        for r in rows:
            print('%-24s %d' % (r['reason'], r['n']))
    return 0


# ---------------------------------------------------------------- cli


def main(argv=None) -> int:
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    sub = p.add_subparsers(dest='cmd', required=True)

    sub.add_parser('init').set_defaults(fn=cmd_init)

    q = sub.add_parser('import')
    q.add_argument('csvfile')
    q.set_defaults(fn=cmd_import)

    q = sub.add_parser('preview')
    q.add_argument('-t', '--template', required=True)
    q.add_argument('-s', '--segment')
    q.add_argument('-n', '--limit', type=int, default=3)
    q.set_defaults(fn=cmd_preview)

    q = sub.add_parser('send')
    q.add_argument('-t', '--template', required=True)
    q.add_argument('-s', '--segment')
    q.add_argument('-n', '--limit', type=int)
    q.add_argument('--dry-run', action='store_true')
    q.set_defaults(fn=cmd_send)

    q = sub.add_parser('sync')
    q.add_argument('--days', type=int, default=14)
    q.set_defaults(fn=cmd_sync)

    q = sub.add_parser('suppress')
    q.add_argument('email')
    q.add_argument('-r', '--reason', default='manual')
    q.set_defaults(fn=cmd_suppress)

    sub.add_parser('stats').set_defaults(fn=cmd_stats)

    args = p.parse_args(argv)
    try:
        return args.fn(args)
    except ConfigError as exc:
        print('config: %s' % exc, file=sys.stderr)
        return 2


if __name__ == '__main__':
    sys.exit(main())
