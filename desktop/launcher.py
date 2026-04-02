"""
InstantPhotos Desktop Launcher
================================
Wraps the Flask web app in a native desktop window using pywebview.
Run this file instead of app.py if you want a standalone desktop window.

Requirements: pip install pywebview
"""
import threading
import webview
import sys
import os

# Add the project root to the path so 'app' can be imported
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app as flask_app  # noqa: E402


def run_flask():
    """Start Flask in the background on port 5000."""
    flask_app.run(host="127.0.0.1", port=5000, debug=False, use_reloader=False)


if __name__ == "__main__":
    # Start Flask server in a background daemon thread
    flask_thread = threading.Thread(target=run_flask, daemon=True)
    flask_thread.start()

    # Small delay so Flask is ready before the window opens
    import time
    time.sleep(1.2)

    # Create the desktop window
    window = webview.create_window(
        title="InstantPhotos — Free Passport & LinkedIn Frame Generator",
        url="http://127.0.0.1:5000",
        width=1100,
        height=820,
        resizable=True,
        min_size=(700, 550),
    )
    webview.start()
