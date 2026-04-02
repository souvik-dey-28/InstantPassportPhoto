# InstantPhotos — Full Professional Upgrade Plan

## What This Achieves

Transform InstantPhotos from a basic passport photo tool into a **professional, all-in-one photo toolbox** with:
1. A fully rebuilt LinkedIn Profile Picture Frame Generator (like aicarousels.com) — **inside the main Flask app** (no separate React/Vite project needed)
2. An upgraded Passport Photo Generator with crop rotate/mirror/horizontal/vertical options
3. AI Prompt Generator (already exists, will be improved)
4. Multilingual support (16 languages), theme system, color wheel — (already exist, will be fixed/expanded)
5. Clean README, proper .gitignore, venv removed from git, GitHub push

---

## Current Status — What Already Exists ✅

| Feature | Status |
|---|---|
| Flask backend (`app.py`) | ✅ Good — needs minor fixes |
| Passport photo PDF generator | ✅ Works |
| Background removal (rembg) | ✅ Works |
| Crop modal (Cropper.js) | ✅ Exists but missing rotate/mirror/H/V |
| Color swatches + wheel | ✅ Exists |
| AI Prompt Generator | ✅ Exists |
| Theme system (dark/light/colors) | ✅ Exists |
| Language selector (10 langs) | ✅ Exists — needs 6 more |
| LinkedIn generator (React/Vite) | ⚠️ Separate broken app — needs port to Flask |
| venv committed to repo | ❌ Must be removed from git history |
| .env with API keys committed | ❌ Must be removed |
| README outdated | ❌ Needs full rewrite |

---

## User Review Required

> [!CAUTION]
> The `.env` file contains **real API keys** (Cloudinary, Remove.bg). These are committed to git history. We will:
> 1. Remove `.env` from git (already in `.gitignore`)
> 2. Add a `.env.example` template so others know what to configure
> 3. The venv folder is 100+ MB — we will remove it from git tracking

> [!WARNING]
> The existing `linkedin-generator/` folder is a React/Vite app that has **build errors** (`build_err.txt`, `build_err2.txt`). We will **replace** its functionality by building a proper LinkedIn frame generator page **inside the Flask app** (pure HTML/CSS/JS Canvas). The `linkedin-generator/` folder will be kept but marked as legacy.

> [!IMPORTANT]
> The LinkedIn generator will be a **new tab** inside `index.html` — same look/feel as aicarousels.com: circular photo, colored arc ring, arc text (custom text), download as PNG. All done client-side with Canvas API. No server needed for this feature.

---

## Proposed Changes

### 1. Git Cleanup

#### [MODIFY] `.gitignore`
- Add `venv/`, `.env` (already there — verify)
- Add `linkedin-generator/node_modules/`, `linkedin-generator/dist/`

#### Run git commands
- `git rm -r --cached venv/` — stop tracking the 100+ MB venv
- `git rm --cached .env` — stop tracking secret keys

---

### 2. Backend — `app.py`

#### [MODIFY] `app.py`
- Add `/linkedin` route that serves a new `linkedin.html` template  
- Add `/linkedin-export` POST route that takes canvas image data (base64) and returns a downloadable PNG
- Minor fix: the `original` background mode currently uses white as fallback — make it truly transparent for PNG downloads
- Add proper rate limiting headers

---

### 3. Frontend — LinkedIn Frame Generator (NEW)

#### [NEW] `templates/linkedin.html`
Full LinkedIn Profile Picture Frame Generator page with:
- **Upload photo** — drag & drop
- **Live Canvas preview** — 600×600px circular frame
- **Arc ring**: customizable color (presets + color wheel), ring thickness
- **Arc text**: custom text (e.g. `#OpenToWork`, your name, company), font size, text color — rendered on the arc at the bottom like aicarousels.com
- **Crop system** (Cropper.js): clockwise rotate, anticlockwise rotate, flip horizontal, flip vertical
- **Background color**: white, transparent, presets, custom wheel
- Orientation toggle: **Square / Portrait / Landscape** for the output
- Download as PNG (800×800, circular clipped)
- Fully integrated with the theme + language system from the main app

#### [NEW] `static/linkedin.js`
Pure Canvas API implementation (no React needed):
- `drawFrame()` — renders image + arc ring + arc text on canvas
- `rotateCW/CCW()`, `flipH/V()` — transform helpers
- `downloadPNG()` — exports circular canvas to PNG

---

### 4. Frontend — Passport Photo Tab Upgrades

#### [MODIFY] `templates/index.html`
- Add **3rd tab**: `💼 LinkedIn Frame` that links to `/linkedin`
- Crop modal: add toolbar with buttons: 🔄 Rotate CW, 🔄 Rotate CCW, ↔️ Flip H, ↕️ Flip V
- Add orientation toggle for passport: **Portrait (standard)** / **Landscape** / **Square**
- Add 6 more languages to the `<select>`: Spanish 🇪🇸, Chinese 🇨🇳, Portuguese 🇧🇷, Russian 🇷🇺, Urdu 🇵🇰, Arabic 🇸🇦

#### [MODIFY] `static/app.js`
- Wire up rotate/flip buttons to Cropper.js API (`cropper.rotate(90)`, `cropper.scaleX(-1)`, `cropper.scaleY(-1)`)
- Fix language selector to handle 16 languages
- Fix theme persistence bug (line 67: saves `currentTheme` instead of new value)
- Add orientation logic for passport sheet (portrait/landscape/square aspect ratio pre-sets)

#### [MODIFY] `static/style.css`
- Add crop toolbar button styles
- Add LinkedIn page link/button styles
- Fix toast stacking issue
- Add `[data-theme="yellow"]`, `[data-theme="black"]` tokens (currently missing)

---

### 5. Translations

#### [MODIFY] `static/translations/i18n.json`
- Add 6 new language keys: `es`, `zh`, `pt`, `ru`, `ur`, `ar`
- Add new translation keys for: `linkedin_title`, `arc_text`, `arc_color`, `rotate_cw`, `rotate_ccw`, `flip_h`, `flip_v`, `orientation`

---

### 6. Documentation

#### [MODIFY] `README.md`
Complete rewrite with:
- Professional badge header
- Features table (Passport Photo, LinkedIn Frame, AI Prompt Generator)
- One-command install: `pip install -r requirements.txt && python app.py`
- Screenshot placeholder section
- Desktop EXE instructions
- Mobile APK instructions
- Contributing guide
- License

#### [NEW] `.env.example`
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
REMOVE_BG_API_KEY=your_key
```

#### [MODIFY] `requirements.txt`
- Pin versions properly
- Add `pywebview` for desktop
- Remove version conflicts

---

### 7. Desktop App

#### [MODIFY] `desktop/build.bat`
- Fix to use system Python if venv not found (already partially done)
- Add `--icon` flag for EXE (needs icon file)
- Add `--add-data` for translations

#### [MODIFY] `desktop/launcher.py`
- Update window title to `InstantPhotos — Photo & LinkedIn Frame Generator`
- Set proper window size `1200×860`

---

### 8. GitHub Push

Run these git commands after all changes:
```bash
git rm -r --cached venv/
git rm --cached .env
git add -A
git commit -m "feat: LinkedIn frame generator + crop rotate/flip + 16 langs + README rewrite"
git push origin main
```

---

## Verification Plan

### Browser Test
- Open `http://localhost:5000` → Passport Photo tab works
- Open LinkedIn tab → upload photo, see circular frame, change arc color, type arc text, download PNG
- Crop modal → rotate CW/CCW, flip H/V all work
- Theme switch: all 8 themes render correctly
- Language switch: all 16 languages load

### Files Test
- `venv/` not tracked by git
- `.env` not tracked by git  
- `requirements.txt` installs cleanly on a fresh Python 3.9+ environment

### Desktop
- `desktop/build.bat` runs without error
- `dist/InstantPhotos.exe` launches and opens the app window

---

## Open Questions

> [!IMPORTANT]
> **Q1: LinkedIn Frame — Arc Text position**: The sample image shows text **curved along the bottom arc** (like "LinkedIn Profile Picture Frame Generator" written along the circle edge). Do you want:
> - A) Text written **along the curve** of the arc (like aicarousels.com exact style)  
> - B) Text written **flat inside** a banner at the bottom (simpler, cleaner)
> 
> Default plan: **A) Arc-curved text** (matches your reference image exactly)

> [!IMPORTANT]
> **Q2: LinkedIn Frame — Hashtag/Custom text**: In your sample image it says `#CashNee`. Should this be:
> - A) Editable by the user (they type their name/hashtag)
> - B) Fixed as your branding
>
> Default plan: **A) Fully editable** — user types anything

> [!IMPORTANT]
> **Q3: Remove the `linkedin-generator/` React folder?** It has build errors and 250KB package-lock.json. Options:
> - A) Delete it entirely (we replace with the Flask canvas page)
> - B) Keep it, just mark as "legacy/experimental"
>
> Default plan: **B) Keep but move to `legacy/`** subfolder so git history is preserved

