# NO-SANDBOX PROTOCOL — How AIs Without a Sandbox Deliver Changes

> **If you are an AI without a sandbox environment** (no filesystem access, no `git push`, no ability to write files directly), this document is your operating manual. Read it before writing any code or instructions for the human.

---

## The Problem

The primary AI (Z.ai Code) works in a sandbox where it can edit files, run `git push`, and verify with a browser. But other AIs (Claude, GPT, Gemini, any chat assistant) that the user consults **do not have a sandbox**. They can only output text.

When a no-sandbox AI wants to change a file, it has two bad options:
1. **Describe the change in prose** — the human copy-pastes, risks breaking things, wastes time troubleshooting.
2. **Output a full file** — the human replaces the entire file, which is dangerous for large files and error-prone.

There is a **third, better option**: output a self-contained Python script that surgically modifies the exact files. The human runs ONE command. No copy-paste risk. No manual editing.

---

## The Rule

**If you cannot write to the filesystem or push to git yourself, you MUST deliver your changes as a single, complete, runnable Python script that the human executes with one command.**

Do NOT:
- Ask the human to "edit line 47 of `src/app/page.tsx` to change X to Y"
- Output a full file replacement and say "replace the entire file with this"
- Give a list of manual steps the human must perform

DO:
- Output one Python script that does all the surgical edits itself
- The human runs it with a single command
- The script is idempotent (safe to run multiple times)
- The script prints what it changed

---

## The Script Contract — 4 Rules

### Rule 1: Assume the human is in the repo root

The human is **always** at `./smile-live-kit` (the repo root). Never include a `cd` command. Never assume a different working directory. The script should use paths relative to the current directory (which IS the repo root).

```python
# CORRECT — relative paths, assumes cwd is the repo root
with open("src/app/page.tsx", "w") as f:
    f.write(new_content)

# WRONG — don't cd
import subprocess
subprocess.run(["cd", "smile-live-kit"])  # NO. The human is already here.
```

### Rule 2: NO inline comments in commands

**This is critical.** The human's console enters "quote mode" when it encounters certain characters (like `#` at the start of a line, or inline comments in bash commands). This breaks command execution and wastes time.

When you give the human a command to run (e.g., `python3 apply_changes.py`), do NOT include comments in the command itself. Explain what the command does **before or after** the command, in your prose — not inline.

```bash
# CORRECT — explain in prose, then give the clean command
Run this to apply the scene changes:

python3 apply_changes.py

# WRONG — inline comments break the console
python3 apply_changes.py  # this applies the scene changes
```

```bash
# WRONG — this will enter quote mode in some consoles
git add -A
git commit -m "fix scene"  # fixes the layout
git push

# CORRECT — explain before, give clean commands
This stages, commits, and pushes the fix:

git add -A
git commit -m "fix scene"
git push
```

### Rule 3: The script is self-contained and surgical

The Python script should:
- Use `pathlib.Path` for file operations (cross-platform, clean).
- Read the file, do a targeted string replacement or insertion, write it back.
- Be **idempotent** — if run twice, it shouldn't break (check if the change is already applied).
- Print a summary of what it changed.
- Handle the case where the target string isn't found (print a warning, don't crash silently).

**Template:**
```python
import pathlib

ROOT = pathlib.Path(".")  # cwd is the repo root

def patch(file_path, old, new, label):
    p = ROOT / file_path
    content = p.read_text(encoding="utf-8")
    if new in content:
        print(f"SKIP  {label} — already applied")
        return
    if old not in content:
        print(f"WARN  {label} — target string not found in {file_path}")
        return
    content = content.replace(old, new, 1)
    p.write_text(content, encoding="utf-8")
    print(f"OK    {label} — patched {file_path}")

patch(
    "src/app/page.tsx",
    old='<div className="old-class">',
    new='<div className="new-class">',
    label="scene container class",
)

print("\nDone. Next: git add -A && git commit && git push")
```

### Rule 4: Group related changes into one script

If you're changing 5 files for one feature, put all 5 changes in **one script**. The human runs one command, not five. If the script fails partway, it should print what it did and didn't do, so the human can report back accurately.

---

## How to Deliver the Script

When you (the no-sandbox AI) want to change something, your message to the human should follow this structure:

1. **Explain what you're changing and why** (prose).
2. **Give the script** in a single Python code block. Tell the human to save it as `apply_changes.py` in the repo root.
3. **Give the run command** as a clean, comment-free line: `python3 apply_changes.py`
4. **Explain what to do after** (e.g., "then commit and push: `git add -A && git commit -m 'feat: ...' && git push`" — as clean commands, explained in prose).

### Example message

> I'll fix the starting-soon scene layout. The issue is the headline is too large for smaller screens. I'm reducing it from 148px to 96px and adjusting the spacing.
>
> Save this as `apply_changes.py` in the repo root:
>
> ```python
> import pathlib
> ROOT = pathlib.Path(".")
> def patch(file_path, old, new, label):
>     p = ROOT / file_path
>     content = p.read_text(encoding="utf-8")
>     if new in content:
>         print(f"SKIP  {label}")
>         return
>     if old not in content:
>         print(f"WARN  {label} — not found in {file_path}")
>         return
>     p.write_text(content.replace(old, new, 1), encoding="utf-8")
>     print(f"OK    {label}")
> 
> patch("public/scenes/01-starting-soon.html",
>     old="font-size:148px;line-height:.92;letter-spacing:-.03em",
>     new="font-size:96px;line-height:.95;letter-spacing:-.02em",
>     label="headline size")
> print("\nDone.")
> ```
>
> Run it:
>
> python3 apply_changes.py
>
> Then commit and push:
>
> git add -A
> git commit -m "fix(scene): reduce starting-soon headline for smaller screens"
> git push

---

## When You CAN Push (Sandbox AIs)

If you ARE a sandbox AI (like Z.ai Code with filesystem + git access), follow the normal workflow in `AGENTS.md` — branch, implement, verify, commit, push, PR. You do NOT need the Python-script protocol. That protocol is only for AIs that cannot touch the filesystem.

---

## Why This Matters

1. **The human is not a developer.** They cannot troubleshoot a broken copy-paste. A surgical script either works or prints a clear warning — no middle ground.
2. **Time is the constraint.** Every minute spent manually editing files is a minute not spent on the actual vision. One command beats ten manual edits.
3. **Reproducibility.** A script is a record of the change. If it breaks something, the human can show the AI the script + the output. If a manual edit breaks something, the human has to describe what they did (often inaccurately).
4. **Multi-AI collaboration.** Different AIs (Z.ai Code, Claude, GPT, etc.) can all use the same protocol. The human doesn't need to know which AI has which capabilities — they just run the script.

---

## Quick Reference

| Situation | What to do |
|-----------|-----------|
| You have a sandbox (can write files + git push) | Follow `AGENTS.md` normal workflow. Branch → implement → verify → commit → push → PR. |
| You do NOT have a sandbox (chat-only AI) | Output a single Python script. Human saves it as `apply_changes.py` and runs `python3 apply_changes.py`. |
| The change is tiny (one line) | Still use the script. It's faster for the human than manual editing and leaves a record. |
| The change is a new file | The script writes the new file: `pathlib.Path("path/to/new.tsx").write_text(content)`. |
| The change deletes a file | The script unlinks it: `pathlib.Path("path/to/old.tsx").unlink()`. |
| You need the human to run multiple commands | Give each command on its own line, NO inline comments. Explain in prose before/after. |

---

*This protocol exists because the human got burned by manual copy-paste edits that broke things and wasted hours. Never again. One script, one command, one clear outcome.*
