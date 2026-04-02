# 🏗️ Cross-Platform Build Guide

This document explains exactly how to take the `InstantPhotos` Python codebase and convert it into standalone apps for Windows (`.exe`), Mac (`.app`), and Android (`.apk`).

---

## 🪟 1. Building for Windows (`.exe`)

**Requirements:** You must be on a Windows machine.

1. Open your terminal/command prompt.
2. Enter the project folder and activate your virtual environment: 
   ```cmd
   venv\Scripts\activate
   ```
3. Run the automated build script located in the `desktop` folder:
   ```cmd
   desktop\build.bat
   ```
4. This will use a library called `PyInstaller` to package the entire backend, ML models, and frontend UI into a single executable. 
5. When it finishes, you will find `InstantPhotos.exe` inside the newly created `dist/` folder. This `.exe` can be shared with anyone on Windows, and they don't need Python installed!

---

## 🍏 2. Building for macOS (`.app`)

**Requirements:** You must be on a macOS machine (Intel or Apple Silicon).

1. Open your Mac Terminal.
2. Enter the project folder and make sure you have the python environment set up (`source venv/bin/activate` or similar).
3. Install the packaging tools:
   ```bash
   pip install pyinstaller pywebview
   ```
4. Run the following command:
   ```bash
   pyinstaller --noconfirm --onefile --windowed \
     --name "InstantPhotos" \
     --add-data "templates:templates" \
     --add-data "static:static" \
     --hidden-import "rembg" \
     --hidden-import "onnxruntime" \
     --hidden-import "engineio.async_drivers.threading" \
     desktop/launcher.py
   ```
   *(Note: On Mac and Linux, the separator in `--add-data` is a colon `:` instead of a semicolon `;`).*
5. Look in the `dist/` folder! You will have an `InstantPhotos.app` bundle that acts exactly like a native Mac application.

---

## 🤖 3. Building for Android (`.apk`)

**Requirements:** You **must** be on Ubuntu Linux (or Windows WSL) to build Android Apps natively.

1. Open your terminal in Linux/WSL and install Buildozer:
   ```bash
   pip install buildozer cython virtualenv
   ```
2. Navigate into the `app` folder where `buildozer.spec` relies:
   ```bash
   cd app/
   ```
3. Run the magical build command:
   ```bash
   buildozer android debug
   ```
4. *Patience.* The very first build takes ~20 to 30 minutes! Buildozer downloads the entire Android SDK, NDK, compiles Python to native C architectures, and bundles it.
5. Once completed, your final `.apk` file will be waiting in the `app/bin/` folder. You can transfer this to your Android phone to install the App.

> **⚠️ Note on ML Libraries for Android:** 
> The library `rembg` requires `onnxruntime` to drop out backgrounds offline. In an Android APK sandbox, pure native python C-extensions (like ONNX) can sometimes crash depending on the CPU architecture armv7/armv8. If the application crashes on your phone during background removal, you will need to map `rembg` to a remote server or recompile ONNX for Android Native (NDK). 
