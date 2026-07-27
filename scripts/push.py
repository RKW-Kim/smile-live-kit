# Push the kit to GitHub.  Runs git on YOUR machine (a login window may pop once).
# Default remote: https://github.com/RKW-Kim/smile-live-kit.git  (override with argv[1]).
import subprocess, sys, os, shutil
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REMOTE = sys.argv[1] if len(sys.argv) > 1 else "https://github.com/RKW-Kim/smile-live-kit.git"
os.chdir(ROOT)
if not shutil.which("git"):
    print("git not found. Install Git for Windows, or use GitHub Desktop (see docs/github.md)."); sys.exit(1)
def run(*a):
    print("$", " ".join(a)); r = subprocess.run(a, capture_output=False)
    return r.returncode
if not os.path.isdir(".git"): run("git", "init")
run("git", "add", "-A")
rc = run("git", "commit", "-m", "Smile live kit: structured, portable (localhost), live-data, multi-brand")
run("git", "branch", "-M", "main")
if run("git", "remote", "get-url", "origin") != 0:
    run("git", "remote", "add", "origin", REMOTE)
print("\nPushing to", REMOTE, "- a GitHub sign-in window may appear (one time).")
rc = run("git", "push", "-u", "origin", "main")
if rc != 0:
    print("\nPush failed. If the remote already has commits, pull first (or use GitHub Desktop).")
    print("secrets.env is git-ignored, so your key was NOT pushed.")
else:
    print("\nDone. Repo:", REMOTE)
