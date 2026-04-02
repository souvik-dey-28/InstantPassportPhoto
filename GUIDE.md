# 📘 InstantPhotos Beginner's Guide 📘

Welcome! This guide is written specifically for complete beginners with **zero tech experience**. You don't need to know how to code to use this app offline on your computer.

---

## 🟢 First-Time Setup (You only do this once!)

Before you can run the app for the very first time, your computer needs Python and a few tools.

### Step 1: Install Python
1. Go to [python.org/downloads](https://www.python.org/downloads/)
2. Click the big yellow **Download Python** button.
3. Once downloaded, double-click the installer file.
4. 🛑 **VERY IMPORTANT:** At the bottom of the installer window, check the box that says **"Add python.exe to PATH"**. If you forget this, it won't work!
5. Click "Install Now" and wait for it to finish.

### Step 2: Prepare the Folder
1. Download this InstantPhotos project folder (if you downloaded a ZIP from GitHub, extract/unzip it).
2. Open the `InstantPhotos` folder. You should see files like `app.py`, `requirements.txt`, etc.

### Step 3: Fast Install 
1. Inside the `InstantPhotos` folder, click on the **address bar** at the top of the file explorer.
2. Type `cmd` and press **Enter**. A black command window will open.
3. In the black window, type exactly this and press Enter:
   ```cmd
   python -m venv venv
   ```
4. Wait 10 seconds. Then type this and press Enter:
   ```cmd
   venv\Scripts\activate
   ```
5. Finally, type this and press Enter:
   ```cmd
   pip install -r requirements.txt
   ```
6. Wait for all the downloads to finish. (This downloads the engine required to automatically remove backgrounds from photos).

✅ **First-time setup is complete. You never have to do Step 1, 2, or 3 again!**

---

## 🚀 Regular Run (How to launch the app normally)

Whenever you want to use the app to make Passport photos or LinkedIn frames:

1. Open the `InstantPhotos` folder.
2. Click the folder's address bar at the top, type `cmd` and press Enter.
3. In the black window, copy-paste or type this single line and press Enter:
   ```cmd
   venv\Scripts\activate && python app.py
   ```
4. It will say "Running on http://127.0.0.1:5000/".
5. Keep the black window open! Now, open your web browser (Chrome, Edge, Safari) and go to:
   👉 **http://localhost:5000**

You can now use the app! When you are done, just close the black command window.

> **Note:** The very first time you upload a photo to remove a background, it might take 1-2 minutes to download an AI file (~170MB). After that, the app will work completely **offline and instantly** forever.

---

## 🛠️ Upcoming: The 1-Click Desktop App (Easy Mode)
If you don't want to deal with typing commands or black windows at all, there will be an `InstantPhotos.exe` file available soon. You will just double-click it like a normal app, and it will open immediately!
