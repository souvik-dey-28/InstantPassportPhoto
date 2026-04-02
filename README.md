# 📸 InstantPhotos

**Free, open-source photo toolbox — no API keys, no signup, no cost.**

[![Python](https://img.shields.io/badge/Python-3.9%2B-blue?logo=python)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.x-lightgrey?logo=flask)](https://flask.palletsprojects.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Languages](https://img.shields.io/badge/Languages-16-orange)]()

---

## ✨ Features

| Feature | Details |
|---|---|
| 🪪 **Passport Photo Generator** | Remove background, choose colour, generate A4 PDF sheet |
| 💼 **LinkedIn Frame Generator** | Circular ring, arc text (#OpenToWork), rotate/flip, download PNG |
| 🎨 **AI Prompt Generator** | Structured prompts for passport, LinkedIn, Instagram, creative AI art |
| 🌍 **16 Languages** | EN · HI · BN · TA · GU · FR · DE · JA · KO · IT · ES · ZH · PT · RU · UR · AR |
| 🎭 **10 Themes** | Dark · Light · System · Red · Blue · Yellow · Green · Orange · Pink · Violet · Black |
| 🎨 **Color System** | 9 presets + full RGB/HEX color wheel |
| 🖼️ **Crop Tools** | Rotate CW/CCW · Flip H/V · Drag crop (Cropper.js) |
| 💾 **Export** | PDF (passport sheet) · PNG (single / LinkedIn frame) |

---

## 🚀 Quick Start (any OS)

```bash
# 1. Clone
git clone https://github.com/souvik-dey-28/InstantPhotos.git
cd InstantPhotos

# 2. Create virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run
python app.py
```

Open your browser at **http://localhost:5000**

> **Note:** First run will download the AI background removal model (~170 MB). Subsequent runs are instant.

---

## 📦 Requirements

```
Python 3.9+
Flask
Pillow
rembg
onnxruntime
```

All listed in `requirements.txt` — install with `pip install -r requirements.txt`.

---

## 🖼️ Pages

| URL | Description |
|---|---|
| `/` | Passport Photo Generator + AI Prompt Generator |
| `/linkedin` | LinkedIn Profile Picture Frame Generator |

---

## 💼 LinkedIn Frame Generator

1. Go to **http://localhost:5000/linkedin**
2. Upload your photo (drag & drop or click)
3. Customize the ring color, thickness, arc text
4. Crop, rotate, flip as needed
5. Click **Download PNG (800×800)**

Supports: Square, Portrait 4:5, Wide 16:9 output.

---

## 🖥️ Desktop App (Windows EXE)

```bash
cd desktop
build.bat
```

Find `InstantPhotos.exe` in the `dist/` folder. Double-click to run — no Python installation needed.

---

## 📱 Mobile App (APK) — Coming Soon

Basic structure in `/app` folder. PWA version planned.

---

## 🌍 Language Support

English · हिन्दी · বাংলা · தமிழ் · ગુજરાતી · Français · Deutsch · 日本語 · 한국어 · Italiano · Español · 中文 · Português · Русский · اردو · العربية

Translations are in `static/translations/i18n.json` — contributions welcome!

---

## 🎨 Theme System

| Theme | Description |
|---|---|
| 🌑 Dark | Default sleek dark |
| ☀️ Light | Clean white |
| 💻 System | Auto matches your OS |
| 🔴🔵🟡🟢🟠🌸🔮⬛ | Accent colour themes |

---

## 🗂️ Project Structure

```
InstantPhotos/
├── app.py                  # Flask backend
├── requirements.txt        # Python dependencies
├── .env.example            # Environment variable template
├── templates/
│   ├── index.html          # Main app (Passport + AI Prompt)
│   └── linkedin.html       # LinkedIn Frame Generator
├── static/
│   ├── app.js              # Main frontend JS
│   ├── linkedin.js         # LinkedIn canvas engine
│   ├── style.css           # All styles + theme tokens
│   └── translations/
│       └── i18n.json       # 16-language translations
├── desktop/
│   ├── launcher.py         # PyWebView desktop wrapper
│   └── build.bat           # PyInstaller build script
└── app/                    # Mobile app structure (WIP)
```

---

## 🔒 Security

- File size limit: 16 MB per upload
- Allowed types: JPG, PNG, WEBP only
- No files stored on server — all processing in memory
- No external API calls — 100% local processing (rembg)
- Input validation on all parameters

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: your feature"`
4. Push and open a Pull Request

---

## 🗺️ Roadmap

- [x] Passport photo generator (PDF sheet)
- [x] Background removal (local, rembg)
- [x] AI Prompt Generator
- [x] 16 languages
- [x] 10 themes + color wheel
- [x] LinkedIn Frame Generator
- [x] Crop / rotate / flip tools
- [ ] Mobile APK (Kivy or PWA)
- [ ] Gradient backgrounds
- [ ] Shadow/border effects
- [ ] Batch export (multiple sizes)

---

## 📄 License

MIT License — free for personal and commercial use.

---

Made with ❤️ by [Souvik Dey](https://github.com/souvik-dey-28) — helping people worldwide with free photo tools.