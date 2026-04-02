/* ═══════════════════════════════════════════════════════
   InstantPhotos — linkedin.js
   LinkedIn Profile Picture Frame Generator (Banner Style)
   ═══════════════════════════════════════════════════════ */
'use strict';

// ── State ─────────────────────────────────────────────────────────────────
const STATE = {
  userImage: null,        // HTMLImageElement or null
  ringColor: '#4b9429',
  arcText: '#CashNee',
  arcTextColor: '#ffffff',
  bgColour: 'transparent',
  // canvas transform state
  rotation: 0,
  flipX: false
};

const canvas = document.getElementById('liCanvas');
const ctx    = canvas.getContext('2d');

function drawFrame() {
  const w = 800, h = 800; // Generate high-res internally
  canvas.width  = w;
  canvas.height = h;

  ctx.clearRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;
  const r  = w / 2 - 4;

  // Clip to circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();

  // 1. Draw Background Pattern/Color
  if (STATE.bgColour === 'transparent') {
    // Checkerboard or white for transparent? Let's use white base for transparent export 
    // unless they actually want transparent. If transparent, don't draw bg unless it's the UI preview.
  } else {
    ctx.fillStyle = STATE.bgColour;
    ctx.fillRect(0, 0, w, h);
  }

  // 2. Draw user image
  if (STATE.userImage) {
    const img = STATE.userImage;
    ctx.save();
    ctx.translate(cx, cy);
    if (STATE.flipX) ctx.scale(-1, 1);
    ctx.rotate((STATE.rotation * Math.PI) / 180);
    
    // Scale to cover the circle
    const scale = Math.max((r * 2) / img.naturalWidth, (r * 2) / img.naturalHeight);
    const dw = img.naturalWidth  * scale;
    const dh = img.naturalHeight * scale;
    ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
    ctx.restore();
  } else {
    // Placeholder light grey matching the example UI
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, 0, w, h);
    ctx.font = `bold 40px Inter, sans-serif`;
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('No Image Selected', cx, cy);
  }

  // 3. Draw Bottom Banner
  // We use a quadratic curve for the top border of the banner to match the circle's aesthetic
  ctx.beginPath();
  // Start from left side of the circle near the bottom
  ctx.moveTo(0, h * 0.78);
  // Curve gracefully towards the right
  ctx.quadraticCurveTo(w / 2, h * 0.72, w, h * 0.78);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fillStyle = STATE.ringColor;
  ctx.fill();

  // 4. Draw Banner Text
  if (STATE.arcText && STATE.arcText.trim()) {
    ctx.font = `bold 64px Inter, sans-serif`; // large font for 800px canvas
    ctx.fillStyle = STATE.arcTextColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Position text in the center of the banner
    ctx.fillText(STATE.arcText.trim(), w / 2, h * 0.86);
  }

  ctx.restore(); // end clip

  // 5. Draw Outer Ring Stroke (Optional, looks clean without it or just a thin border)
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = STATE.ringColor;
  ctx.lineWidth   = 16;
  ctx.stroke();
}

// ── Toast ──────────────────────────────────────────────────────────────────
let toastTimer;
function showToast(msg, type = 'info') {
  const el = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  el.className = 'toast ' + type;
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 3000);
}

// ── Image loading ──────────────────────────────────────────────────────────
function loadImageFile(file) {
  if (!file || !file.type.startsWith('image/')) {
    showToast('Please upload a valid image (JPG, PNG, WEBP)', 'error'); return;
  }
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      STATE.userImage = img;
      STATE.rotation = 0; STATE.flipX = false;
      drawFrame();
      showToast('Photo loaded!', 'success');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// ── Upload / Drop ──────────────────────────────────────────────────────────
function initUpload() {
  const zone  = document.getElementById('liDropZone');
  const input = document.getElementById('liFileInput');

  zone.addEventListener('click', () => input.click());
  canvas.addEventListener('click', () => { if (!STATE.userImage) input.click(); });
  input.addEventListener('change', () => { loadImageFile(input.files[0]); input.value = ''; });

  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', e => {
    e.preventDefault(); zone.classList.remove('dragover');
    loadImageFile(e.dataTransfer.files[0]);
  });
}

// ── Background Removal (AI) ────────────────────────────────────────────────
function initRemoveBg() {
  const btn = document.getElementById('liRemoveBgBtn');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    if (!STATE.userImage) {
      showToast('Upload a photo first!', 'error');
      return;
    }
    showToast('Removing background using AI... please wait', 'info');
    
    // Get raw image data without banner/frame applied by isolating userImage
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = STATE.userImage.naturalWidth;
    tempCanvas.height = STATE.userImage.naturalHeight;
    const tCtx = tempCanvas.getContext('2d');
    
    // Apply current rotation/flip so the removed BG image matches current state
    tCtx.translate(tempCanvas.width/2, tempCanvas.height/2);
    if (STATE.flipX) tCtx.scale(-1, 1);
    tCtx.rotate((STATE.rotation * Math.PI) / 180);
    tCtx.drawImage(STATE.userImage, -tempCanvas.width/2, -tempCanvas.height/2);

    tempCanvas.toBlob(async blob => {
      const formData = new FormData();
      formData.append('images', blob, 'linkedin-origin.png');
      formData.append('bg_colour', 'original'); // keep transparent so we can use bg color picker

      try {
        const res = await fetch('/remove-bg', { method: 'POST', body: formData });
        if (!res.ok) throw new Error('API failed');
        const returnBlob = await res.blob();
        const img = new Image();
        img.onload = () => {
          STATE.userImage = img;
          STATE.rotation = 0; STATE.flipX = false;
          drawFrame();
          showToast('Background AI removed successfully!', 'success');
        };
        img.src = URL.createObjectURL(returnBlob);
      } catch (err) {
        showToast('Background removal failed.', 'error');
      }
    }, 'image/png');
  });
}

// ── Swatches ────────────────────────────────────────────────────
function initRingSwatches() {
  const swatches = document.querySelectorAll('#ringSwatches .li-swatch[data-color]');
  const picker   = document.getElementById('ringColorPicker');
  const hexOut   = document.getElementById('ringColorHex');

  const updateColor = (color) => {
    swatches.forEach(s => s.classList.remove('active'));
    STATE.ringColor = color;
    if (hexOut) hexOut.value = color.toUpperCase();
    drawFrame();
  };

  swatches.forEach(sw => {
    sw.addEventListener('click', () => {
      updateColor(sw.dataset.color);
      sw.classList.add('active');
    });
  });
  if (picker) picker.addEventListener('input', () => updateColor(picker.value));
}

function initArcTextSwatches() {
  const swatches = document.querySelectorAll('#arcTextSwatches .li-swatch[data-color]');
  const picker   = document.getElementById('arcTextColorPicker');
  const hexOut   = document.getElementById('arcTextHex');

  const updateColor = (color) => {
    swatches.forEach(s => s.classList.remove('active'));
    STATE.arcTextColor = color;
    if (hexOut) hexOut.value = color.toUpperCase();
    drawFrame();
  };

  swatches.forEach(sw => {
    sw.addEventListener('click', () => {
      updateColor(sw.dataset.color);
      sw.classList.add('active');
    });
  });
  if (picker) picker.addEventListener('input', () => updateColor(picker.value));
}

function initBgSwatches() {
  const swatches = document.querySelectorAll('#bgSwatches .li-swatch[data-color]');
  const picker   = document.getElementById('bgColorPicker');

  const updateColor = (color) => {
    swatches.forEach(s => s.classList.remove('active'));
    STATE.bgColour = color;
    drawFrame();
  };

  swatches.forEach(sw => {
    sw.addEventListener('click', () => {
      updateColor(sw.dataset.color);
      sw.classList.add('active');
    });
  });
  if (picker) picker.addEventListener('input', () => updateColor(picker.value));
}

// ── Text input ─────────────────────────────────────────────────────────
function initArcText() {
  const inp = document.getElementById('arcText');
  if (inp) inp.addEventListener('input', () => { STATE.arcText = inp.value; drawFrame(); });
}

// ── Transform (outside crop) ───────────────────────────────────────────────
function initTransforms() {
  const cw = document.getElementById('rotateCWBtn');
  const fh = document.getElementById('flipHBtn');
  if (cw) cw.addEventListener('click', () => { STATE.rotation = (STATE.rotation + 90) % 360; drawFrame(); });
  if (fh) fh.addEventListener('click', () => { STATE.flipX = !STATE.flipX; drawFrame(); });
}

// ── Crop Modal ─────────────────────────────────────────────────────────────
let activeCropper = null;
function initCrop() {
  const modal     = document.getElementById('cropperModal');
  const cropImg   = document.getElementById('cropModalImage');
  const openBtn   = document.getElementById('cropOpen');
  const cancelBtn = document.getElementById('cancelCropBtn');
  const confirmBtn= document.getElementById('confirmCropBtn');

  if (!openBtn || !modal) return;

  openBtn.addEventListener('click', () => {
    if (!STATE.userImage) { showToast('Upload a photo first.', 'error'); return; }
    // Ensure we don't conflict with main tab cropper logic
    window._isLiCrop = true; 
    cropImg.src = STATE.userImage.src;
    modal.classList.remove('hidden');
    if (activeCropper) { activeCropper.destroy(); }
    // Wait for display
    setTimeout(() => {
      activeCropper = new Cropper(cropImg, { aspectRatio: 1, viewMode: 1, dragMode: 'move', autoCropArea: 0.95 });
    }, 100);
  });

  confirmBtn.addEventListener('click', () => {
    if (!window._isLiCrop || !activeCropper) return;
    const croppedCanvas = activeCropper.getCroppedCanvas({ width: 800, height: 800 });
    const img = new Image();
    img.onload = () => {
      STATE.userImage = img;
      STATE.rotation = 0; STATE.flipX = false;
      activeCropper.destroy(); activeCropper = null;
      modal.classList.add('hidden');
      window._isLiCrop = false;
      drawFrame();
      showToast('Crop applied!', 'success');
    };
    img.src = croppedCanvas.toDataURL('image/png');
  });

  cancelBtn.addEventListener('click', () => {
    if (window._isLiCrop) {
      if (activeCropper) { activeCropper.destroy(); activeCropper = null; }
      modal.classList.add('hidden');
      window._isLiCrop = false;
    }
  });
}

// ── Download ───────────────────────────────────────────────────────────────
function initDownload() {
  const btn = document.getElementById('downloadBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = STATE.arcText ? `linkedin-frame-${STATE.arcText.replace(/[^a-z0-9]/gi,'_')}.png` : 'linkedin-frame.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('Downloaded!', 'success');
  });
}

// ── Boot ───────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Only init if we are on the page with liCanvas
  if (document.getElementById('liCanvas')) {
    initUpload();
    initRemoveBg();
    initRingSwatches();
    initArcTextSwatches();
    initBgSwatches();
    initArcText();
    initTransforms();
    initCrop();
    initDownload();
    drawFrame();
  }
});
