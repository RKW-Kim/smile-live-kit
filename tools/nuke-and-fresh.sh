#!/bin/bash
set -e
git reset --hard
git clean -fdx
git checkout main
git pull origin main
git checkout -B feat/clean-v5-no-localhost
unzip ~/Downloads/smile-live-kit-NO-LOCALHOST.zip -d /tmp/clean
cp -r /tmp/clean/* .
git add .
git commit -m "feat: v5 no localhost file only, scenes fixed"
git push -u origin HEAD
gh pr create --title "feat: v5 no localhost" --body "No localhost, pure file://, scenes fixed" --base main || echo "Create PR manually"
