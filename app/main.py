"""
InstantPhotos Mobile App (Kivy + WebView)
==========================================
This is the entry point for packaging as an Android APK using Buildozer.

It starts the Flask server and opens the web UI in a Kivy WebView widget
so the same HTML/CSS/JS frontend is reused inside the mobile app.

HOW TO BUILD APK:
  1. Install buildozer on Linux/WSL: pip install buildozer
  2. Initialise:  buildozer init
  3. Edit buildozer.spec (see comments below)
  4. Build:       buildozer android debug
"""

import threading
import sys
import os

# Add the project root to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def run_flask():
    from app import app as flask_app
    flask_app.run(host="127.0.0.1", port=5000, debug=False, use_reloader=False)


# Start Flask in background thread
flask_thread = threading.Thread(target=run_flask, daemon=True)
flask_thread.start()

import time
time.sleep(1.5)

# ── Kivy WebView App ──────────────────────────────────────────────────────
from kivy.app import App
from kivy.uix.boxlayout import BoxLayout

try:
    from android.webview import WebView as KivyWebView
    USE_ANDROID_WEBVIEW = True
except ImportError:
    USE_ANDROID_WEBVIEW = False


class AppLayout(BoxLayout):
    pass


class InstantPhotosApp(App):
    def build(self):
        layout = AppLayout(orientation='vertical')
        if USE_ANDROID_WEBVIEW:
            wv = KivyWebView(url='http://127.0.0.1:5000')
            layout.add_widget(wv)
        else:
            # Fallback for desktop testing
            from kivy.uix.label import Label
            layout.add_widget(Label(
                text="Open http://localhost:5000\nin your browser",
                font_size='18sp'
            ))
        return layout


if __name__ == '__main__':
    InstantPhotosApp().run()
