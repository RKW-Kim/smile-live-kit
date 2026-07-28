#!/bin/bash
set -e
echo "Smile Live Kit Auto Push"
echo "Checking git repo"
git rev-parse --git-dir
echo "Fetching origin"
git fetch origin
echo "Switching to main and pulling"
git checkout main
git pull origin main
echo "Creating backup branch"
BRANCH_BACKUP=backup-auto-$(date +%Y%m%d-%H%M%S)
git checkout -b $BRANCH_BACKUP
git push -u origin $BRANCH_BACKUP
echo "Returning to main and creating fresh feature branch"
git checkout main
BRANCH_FEAT=feat/fresh-v4-$(date +%Y%m%d-%H%M)
git checkout -b $BRANCH_FEAT
echo "Cleaning duplicated files"
rm -f obs/*FINAL*.json
rm -f obs/Smile-Trading-Kit-v2.json
rm -f obs/Smile-Trading-Kit-v3.json
rm -f core/live.json
rm -rf core/vendor
rm -rf core/node_modules
echo "Staging all"
git add .
echo "Committing"
COMMIT_MSG="feat: fresh v4 localhost + 1:1 SVG + validate fix - $(date -u +%Y-%m-%dT%H:%M:%SZ)"
git commit -m "$COMMIT_MSG" || echo "Nothing to commit"
echo "Pushing branch"
git push -u origin $BRANCH_FEAT
echo "Creating PR if gh is installed"
if command -v gh >/dev/null 2>&1; then
  gh pr create --title "$COMMIT_MSG" --body "Auto generated fresh push, localhost v4, SVG 1:1 locked, validate workflow fixed, duplicates removed" --base main
else
  echo "gh CLI not found, create PR manually at https://github.com/RKW-Kim/smile-live-kit/compare/$BRANCH_FEAT"
fi
echo "Done"
