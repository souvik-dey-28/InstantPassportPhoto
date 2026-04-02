import os
import logging
from io import BytesIO
from flask import Flask, request, render_template, send_file, jsonify
from werkzeug.utils import secure_filename
from werkzeug.exceptions import RequestEntityTooLarge
from PIL import Image, ImageOps, ImageEnhance, ImageFilter

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# Lazy-load rembg so startup is fast; import error handled gracefully
try:
    from rembg import remove as rembg_remove
    REMBG_AVAILABLE = True
except ImportError:
    REMBG_AVAILABLE = False
    logger.warning("rembg not installed. Background removal unavailable.")

app = Flask(__name__)

# ─── Security: limit uploads to 16 MB ──────────────────────────────────────
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16 MB
# ─── Security: prevent decompression bombs ─────────────────────────────────
Image.MAX_IMAGE_PIXELS = 100_000_000  # ~100 megapixels max

# ─── Allowed image MIME types ──────────────────────────────────────────────
ALLOWED_MIME = {"image/jpeg", "image/jpg", "image/png", "image/webp"}

# ─── Preset background colours ─────────────────────────────────────────────
PRESET_COLOURS = {
    "white": (255, 255, 255),
    "red": (220, 38, 38),
    "blue": (37, 99, 235),
    "yellow": (234, 179, 8),
    "green": (22, 163, 74),
    "orange": (234, 88, 12),
    "pink": (236, 72, 153),
    "darkviolet": (109, 40, 217),
    "black": (0, 0, 0),
    "transparent": None,   # keep as-is (white fallback for PDF)
    "original": None,      # keep original = transparent slug
}


# ─── Error handlers ────────────────────────────────────────────────────────
@app.errorhandler(RequestEntityTooLarge)
def too_large(e):
    return jsonify(error="File too large. Maximum upload size is 16 MB per image."), 413


@app.errorhandler(500)
def server_error(e):
    logger.exception("Unhandled exception")
    return jsonify(error="An internal error occurred. Please try again."), 500


# ─── Routes ────────────────────────────────────────────────────────────────
@app.route("/")
def index():
    return render_template("index.html")

def hex_to_rgb(hex_colour: str) -> tuple:
    """Convert #RRGGBB or RRGGBB string to (R,G,B) tuple."""
    hex_colour = hex_colour.lstrip("#")
    if len(hex_colour) != 6:
        raise ValueError(f"Invalid hex colour: {hex_colour}")
    return tuple(int(hex_colour[i:i+2], 16) for i in (0, 2, 4))


def get_bg_colour(bg_param: str):
    """
    Return RGB tuple or None (= transparent / keep original).
    Accepts preset names, hex strings (#RRGGBB), or 'original'.
    """
    if not bg_param or bg_param.lower() in ("original", "transparent", ""):
        return None
    if bg_param.lower() in PRESET_COLOURS:
        return PRESET_COLOURS[bg_param.lower()]
    # Try hex
    try:
        return hex_to_rgb(bg_param)
    except ValueError:
        return (255, 255, 255)  # safe fallback


def remove_background(image_bytes: bytes) -> Image.Image:
    """
    Remove image background using rembg (free, local).
    Returns RGBA PIL image.
    """
    if not REMBG_AVAILABLE:
        raise ValueError("rembg_not_installed")

    try:
        result_bytes = rembg_remove(image_bytes)
        return Image.open(BytesIO(result_bytes)).convert("RGBA")
    except Exception as exc:
        logger.error("rembg error: %s", exc)
        raise ValueError("bg_removal_failed")


def apply_background(fg_img: Image.Image, bg_colour) -> Image.Image:
    """
    Composite foreground (RGBA) onto a solid background colour.
    If bg_colour is None, paste onto white (safe for PDF).
    """
    colour = bg_colour if bg_colour else (255, 255, 255)
    background = Image.new("RGB", fg_img.size, colour)
    if fg_img.mode == "RGBA":
        background.paste(fg_img, mask=fg_img.split()[3])
    else:
        background.paste(fg_img)
    return background


def enhance_image(img: Image.Image) -> Image.Image:
    """Apply mild local sharpening and contrast boost."""
    img = ImageEnhance.Sharpness(img).enhance(1.5)
    img = ImageEnhance.Contrast(img).enhance(1.05)
    return img


def validate_image(image_bytes: bytes) -> None:
    """Verify bytes are a valid image and safe size."""
    try:
        img = Image.open(BytesIO(image_bytes))
        img.verify()
    except Exception:
        raise ValueError("invalid_image")


def process_single_image(image_bytes: bytes, bg_colour) -> Image.Image:
    """
    Full pipeline:
      1. Validate
      2. Remove background
      3. Apply chosen background colour
      4. Enhance
    """
    validate_image(image_bytes)
    fg = remove_background(image_bytes)
    result = apply_background(fg, bg_colour)
    result = enhance_image(result)
    return result


# ─── /process  (passport sheet PDF) ───────────────────────────────────────
@app.route("/process", methods=["POST"])
def process():
    logger.info("POST /process")

    # Parse layout params safely
    try:
        passport_width  = max(100, min(int(request.form.get("width",  390)), 2000))
        passport_height = max(100, min(int(request.form.get("height", 480)), 2000))
        border          = max(0,   min(int(request.form.get("border",   2)), 50))
        spacing         = max(0,   min(int(request.form.get("spacing", 10)), 100))
    except ValueError:
        return jsonify(error="Invalid layout parameters."), 400

    bg_param  = request.form.get("bg_colour", "white").strip()
    bg_colour = get_bg_colour(bg_param)

    margin_x, margin_y, horizontal_gap = 10, 10, 10
    a4_w, a4_h = 2480, 3508

    # Collect uploaded images
    images_data = []
    i = 0
    while f"image_{i}" in request.files:
        f = request.files[f"image_{i}"]
        if f and f.filename and f.content_type in ALLOWED_MIME:
            try:
                copies = max(1, min(int(request.form.get(f"copies_{i}", 6)), 54))
            except ValueError:
                copies = 6
            images_data.append((f.read(), copies))
        i += 1

    # Fallback single-image mode
    if not images_data and "image" in request.files:
        f = request.files["image"]
        if f and f.filename and f.content_type in ALLOWED_MIME:
            try:
                copies = max(1, min(int(request.form.get("copies", 6)), 54))
            except ValueError:
                copies = 6
            images_data.append((f.read(), copies))

    if not images_data:
        return jsonify(error="No valid image uploaded. Use JPG, PNG, or WEBP."), 400

    logger.info("Processing %d image(s)", len(images_data))

    # Process each image
    passport_images = []
    for idx, (img_bytes, copies) in enumerate(images_data):
        try:
            img = process_single_image(img_bytes, bg_colour)
            img = img.resize((passport_width, passport_height), Image.LANCZOS)
            img = ImageOps.expand(img, border=border, fill="black")
            passport_images.append((img, copies))
        except ValueError as exc:
            err = str(exc)
            logger.warning("Image %d error: %s", idx, err)
            if "invalid_image" in err:
                return jsonify(error="Corrupted or unsupported image."), 415
            if "rembg_not_installed" in err:
                return jsonify(error="Background removal library not installed. Run: pip install rembg"), 501
            return jsonify(error="Failed to process image. Please try a different photo."), 500

    if not passport_images:
        return jsonify(error="No images were successfully processed."), 400

    paste_w = passport_width  + 2 * border
    paste_h = passport_height + 2 * border

    # Build A4 pages
    pages = []
    current_page = Image.new("RGB", (a4_w, a4_h), "white")
    x, y = margin_x, margin_y

    def new_page():
        nonlocal current_page, x, y
        pages.append(current_page)
        current_page = Image.new("RGB", (a4_w, a4_h), "white")
        x, y = margin_x, margin_y

    for passport_img, copies in passport_images:
        for _ in range(copies):
            if x + paste_w > a4_w - margin_x:
                x = margin_x
                y += paste_h + spacing
            if y + paste_h > a4_h - margin_y:
                new_page()
            current_page.paste(passport_img, (x, y))
            x += paste_w + horizontal_gap

    pages.append(current_page)
    logger.info("Generated %d page(s)", len(pages))

    output = BytesIO()
    if len(pages) == 1:
        pages[0].save(output, format="PDF", dpi=(300, 300))
    else:
        pages[0].save(output, format="PDF", dpi=(300, 300),
                      save_all=True, append_images=pages[1:])
    output.seek(0)

    return send_file(output, mimetype="application/pdf",
                     as_attachment=True, download_name="passport-sheet.pdf")


# ─── /remove-bg  (single PNG download) ───────────────────────────────────
@app.route("/remove-bg", methods=["POST"])
def remove_bg_single():
    """Quick background removal + download as PNG (no sheet layout)."""
    logger.info("POST /remove-bg")

    f = request.files.get("image")
    if not f or not f.filename:
        return jsonify(error="No image provided."), 400
    if f.content_type not in ALLOWED_MIME:
        return jsonify(error="Unsupported file type."), 415

    bg_param  = request.form.get("bg_colour", "white").strip()
    bg_colour = get_bg_colour(bg_param)

    image_bytes = f.read()
    try:
        validate_image(image_bytes)
        fg  = remove_background(image_bytes)
        img = apply_background(fg, bg_colour)
        img = enhance_image(img)
    except ValueError as exc:
        err = str(exc)
        if "invalid_image" in err:
            return jsonify(error="Invalid image file."), 415
        if "rembg_not_installed" in err:
            return jsonify(error="rembg not installed."), 501
        return jsonify(error="Processing failed."), 500

    output = BytesIO()
    img.save(output, format="PNG")
    output.seek(0)
    return send_file(output, mimetype="image/png",
                     as_attachment=True, download_name="removed-bg.png")


if __name__ == "__main__":
    debug = os.environ.get("FLASK_DEBUG", "false").lower() in ("1", "true", "yes")
    port  = int(os.environ.get("PORT", 5000))
    logger.info("Starting InstantPhotos on http://localhost:%d  debug=%s", port, debug)
    app.run(host="0.0.0.0", port=port, debug=debug)