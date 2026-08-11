# Outreach sender

Sends personalised plain-text email to a prospect list, one message at a time,
inside the limits that keep a sending domain alive.

The last batch failed because it went out all at once from an address with no
sending history and no authentication, and most of it was rejected before anyone
saw it. So the limits live in the code, not in a checklist:

| Rule | What happens if you break it |
|---|---|
| Per-inbox daily cap, ramped over a 3-week warmup | Refuses to send past the cap |
| Send window, weekdays only | Refuses to run outside it |
| Randomised 45–200s gap between messages | Enforced, no flag to disable |
| Every merge field filled | That prospect is skipped, not sent blank |
| Suppression list | Checked before every send; add-only |
| Postal address + working opt-out | Refuses to start without both |
| Already sent this template | Never sends twice |

## Before it will send anything

**1. A separate domain.** Never send cold outreach from `twindowclean.com`. If
the sending domain picks up a spam reputation, your quote replies and customer
confirmations start landing in junk too. Buy something like `twindowcleanhd.com`
(~$12/yr) and point it at the real site so it doesn't look abandoned.

**2. Google Workspace or Microsoft 365 on it**, ~$7/mailbox/month. Two mailboxes
lets you send twice the volume at half the per-inbox risk.

**3. SPF, DKIM and DMARC on that domain.** Three DNS records, and Workspace
walks you through them. Without these you are rejected on arrival — this is the
single thing that killed the last batch.

**4. An app password per mailbox** (Google account → Security → 2-Step
Verification → App passwords). Put it in your shell, never in a file:

```sh
export OUTREACH_PW_TONY='xxxx xxxx xxxx xxxx'
```

**5. Warm the inboxes for two to three weeks** before real sends. Set
`warmup_start` in the config to the day you begin and the cap ramps itself from
5/day to full over 21 days.

## Setup

```sh
cp config.example.toml config.toml     # then fill it in
python3 sender.py init
```

`config.toml`, the database, and any `*.local.csv` are gitignored. The config
names the *environment variables* holding your passwords, never the passwords.

## Building the list

`prospects.sample.csv` is seeded with the real High Desert and Inland Empire
companies from the commercial playbook — glass installers, solar installers,
property managers, dealerships — with the email column deliberately blank.

Fill in an address and a `personal_note` for each, then:

```sh
python3 sender.py import prospects.local.csv
```

Re-importing only overwrites columns that have a value, so this is also how you
fill in a `personal_note` later without wiping anything else.

**Don't buy a list.** Purchased lists are stuffed with dead addresses and spam
traps, and one trap hit can blacklist the domain. Build it by hand from Google
Maps and the Greater High Desert Chamber directory.

### The personal_note field is the whole thing

Every template uses `{personal_note}`, and a prospect with a blank one is
**skipped, not sent**. That is deliberate. One real line — the building you
drove past, the storefront job you saw them finish — is the difference between
a reply and a complaint, and complaints are what get a domain throttled.

If you can't write that line honestly for a prospect, they aren't a prospect
yet.

## Running it

```sh
python3 sender.py preview -t installer -n 3        # read what will go out
python3 sender.py send -t installer --dry-run      # rehearse, sends nothing
python3 sender.py send -t installer -s installer   # send to one segment
python3 sender.py sync                             # suppress repliers + bounces
python3 sender.py stats
```

**Run `sync` before every send.** It reads the inbox over IMAP and suppresses
anyone who replied and anyone who bounced. Mailing someone who already answered
is the fastest way to collect a complaint.

Segments in the sample list: `installer`, `solar`, `property`, `hoa`,
`dealership`.

## Templates

Plain text in `templates/`. First line is `Subject:`, then a blank line, then
the body. `{field}` merges from the prospect row — `company`, `first_name`,
`city`, `personal_note`.

Keep them plain. No logos, no tracking pixels, no shortened links, no
attachments — all four hurt deliverability, and a message that looks like a
person typed it is more convincing anyway.

Every message gets the postal address and opt-out line appended automatically,
plus a `List-Unsubscribe` header. Don't put them in the template.

## Follow-ups

One, four business days later, using `templates/followup.txt`. Then stop. A
third and fourth chase is what generates the complaints, and in a market this
size you will see these people again.

## On the law

Cold B2B email is legal in the US under CAN-SPAM. What it requires: accurate
From and Subject lines, a working opt-out honoured **within 10 days**, and a
valid physical postal address. All three are handled here, but honouring
opt-outs is on you — run `sync`, and when someone replies "stop", they're
suppressed permanently.

One-click unsubscribe (RFC 8058) only becomes mandatory above 5,000 messages a
day to Gmail, which these caps put far out of reach. The `mailto:`
`List-Unsubscribe` header this sends is the correct choice at this volume and
needs no web endpoint.

## What this does not do

No open or click tracking — tracking pixels hurt deliverability and this volume
is small enough to judge by replies. `sync` handles bounces and replies; nothing
else phones home.

## Verified

Every limit above was exercised against a local STARTTLS SMTP server: real
delivery with certificate verification, duplicate suppression, cap enforcement,
window rejection, the warmup ramp, and refusal to start with a missing postal
address or app password.
