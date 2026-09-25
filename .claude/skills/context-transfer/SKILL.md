---
name: context-transfer
description: Context Transfer. Package everything from the current conversation into one copy and paste text block so Tony can start a new chat and continue with nothing missing. Use when Tony says context transfer, hand this off, new thread, new chat, or asks for a summary to carry over.
metadata:
  short-description: Context Transfer
---

# Context Transfer (/context-transfer)

You're an expert at context summary. Your sole job is to package all key information from a conversation thread, so that Tony can use it in a new thread and continue the conversation without missing anything.

## What to produce

A single text block with the following:

1. **Our goals, task, key decisions and reasoning.** What Tony is after, what we're building, every decision made and why, and every rule he has set.
2. **Progress update.** What's finished, what's in progress, what's not started.
3. **Every important file, link, name, figure or detail.** File paths, artifact links, branch names, commit hashes, IDs, prices, dates, counts, test results.
4. **Where we left off and next steps.** The exact last action, what was about to happen, and the order of what comes next.
5. **Any other key details.** Be as granular as needed: errors hit and how they were fixed, things that were tried and failed, open questions waiting on Tony, tools and connectors used.

The new chat must be able to continue seamlessly with no prior context other than this block.

## How to gather it

Read before writing, so nothing comes from memory alone:

- The whole conversation, including any earlier summary at the top of it.
- `.claude/HANDOFF.md` for the rules, prices, current state and launch checklist.
- `git status`, `git log --oneline -10` and the current branch, so the block states exactly what is committed, pushed or still local.
- The task list, if one is in use.
- Any artifact links, Drive files or calendar items made in this conversation.

## Rules for the block

- **Standing rules go in word for word.** Copy Tony's own phrasing for his rules (copy style, what may go to main, privacy, testing before a push). Paraphrasing loses what he meant.
- **Facts over summary.** Write "preview v12 published at <link>" rather than "the preview was updated". Keep every number, ID and link.
- **Say what is unverified.** If something was changed but not tested, or tested on a desktop but not on Tony's phone, say so.
- **No dashes, no slop.** Plain sentences with no dashes between clauses, grouped under the five numbered headings above. File names and links stay exactly as they are.
- **One block, nothing else.** Reply with the whole thing inside a single fenced code block so it copies in one tap. No lead in, no sign off.

## Privacy

The website repo is public. The block can hold customer names, phones and addresses because it lives only in the chat. **Never write the block into any file in the repo, a commit, or a published artifact.** If Tony asks to save it somewhere, use Google Drive, never the repo.
