@echo off
echo === InstantPhotos — Build Desktop EXE ===
echo.

:: Make sure we're in the project root (parent of this script)
cd /d "%~dp0.."

:: Activate virtual environment if present
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
) else (
    echo WARNING: venv not found. Using system Python.
)

:: Install PyInstaller + pywebview if missing
pip install pyinstaller pywebview --quiet

echo Building EXE with PyInstaller...
pyinstaller --noconfirm --onefile --windowed ^
  --name "InstantPhotos" ^
  --add-data "templates;templates" ^
  --add-data "static;static" ^
  --hidden-import "rembg" ^
  --hidden-import "onnxruntime" ^
  --hidden-import "engineio.async_drivers.threading" ^
  desktop\launcher.py

echo.
echo === Build done! Find InstantPhotos.exe in dist\ folder ===
pause
