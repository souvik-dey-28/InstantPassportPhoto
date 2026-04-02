# InstantPhotos Upgrade — Task List

## Phase 1: Git Cleanup
- [x] Update `.gitignore` (venv, .env, node_modules confirmed)
- [x] Create `.env.example`
- [x] Fix `requirements.txt`

## Phase 2: Backend
- [x] Update `app.py` — add `/linkedin` route

## Phase 3: LinkedIn Frame Generator (NEW)
- [x] Create `templates/linkedin.html`
- [x] Create `static/linkedin.js`

## Phase 4: Passport Photo Tab Upgrades
- [x] Update `templates/index.html` — crop toolbar (rotate/flip), 6 more langs, LinkedIn tab link
- [x] Update `static/app.js` — wire rotate/flip, fix theme bug, orientation logic
- [x] Update `static/style.css` — crop toolbar styles, missing theme tokens

## Phase 5: Translations
- [x] Update `static/translations/i18n.json` — 6 new languages + new keys

## Phase 6: Documentation
- [x] Rewrite `README.md`

## Phase 7: Desktop
- [x] Update `desktop/launcher.py`
- [x] Update `desktop/build.bat`

## Phase 8: GitHub Push
- [ ] Run `git rm -r --cached venv/`
- [ ] Run `git rm --cached .env`
- [ ] `git add -A && git commit && git push`
