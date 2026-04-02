/* ═══════════════════════════════════════════════════════
   InstantPhotos — linkedin.js
   LinkedIn Profile Picture Frame Generator (Banner Style)
   ═══════════════════════════════════════════════════════ */
'use strict';

(function() {


// ── State ─────────────────────────────────────────────────────────────────
const STATE = {
  userImage: null,        // HTMLImageElement or null
  ringColor: '#4b9429',
  arcText: 'text here',
  arcTextColor: '#ffffff',
  bgColour: 'transparent',
  // canvas transform state
  rotation: 0,
  flipX: false,
  flipY: false,
  useArchText: true,
  logoImage: null
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
    // Draw a subtle checkerboard pattern for the UI preview if no image
    if (!STATE.userImage) {
      const size = 20;
      for (let y = 0; y < h; y += size) {
        for (let x = 0; x < w; x += size) {
          ctx.fillStyle = (x / size + y / size) % 2 === 0 ? '#f8fafc' : '#f1f5f9';
          ctx.fillRect(x, y, size, size);
        }
      }
    }
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
    if (STATE.flipY) ctx.scale(1, -1);
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
  if (STATE.useArchText) {
    ctx.save();
    
    // Create fade gradient for the banner ends
    const grad = ctx.createLinearGradient(0, cy, cx, h);
    grad.addColorStop(0, 'rgba(255,255,255,0)');       // start fade
    grad.addColorStop(0.1, STATE.ringColor);           // solid color
    grad.addColorStop(0.9, STATE.ringColor);           // solid color
    grad.addColorStop(1, 'rgba(255,255,255,0)');       // fade near bottom right
    
    ctx.beginPath();
    // Arch from ~5 o'clock to ~9 o'clock
    ctx.arc(cx, cy, r - 36, Math.PI * 0.35, Math.PI * 1.05);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 100; // make it nice and soft/thick
    ctx.lineCap = 'round';
    
    // Apply blur to exactly mimic the screenshot's soft edges
    ctx.filter = 'blur(4px)';
    ctx.stroke();
    ctx.filter = 'none'; // reset filter
    ctx.restore();
  } else {
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
  }

  // 4. Draw Banner Text
  if (STATE.arcText && STATE.arcText.trim()) {
    if (STATE.useArchText) {
      ctx.save();
      ctx.font = `bold 46px Inter, sans-serif`; // slightly smaller for curved
      ctx.fillStyle = STATE.arcTextColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.translate(cx, cy);
      
      const str = STATE.arcText.trim();
      const textRadius = r - 36; 
      
      const chars = str.split('');
      let totalAngle = 0;
      chars.forEach(ch => {
         totalAngle += ctx.measureText(ch).width / textRadius;
      });
      // Center text along the arc we just drew (Math.PI * 0.7)
      let angle = (Math.PI * 0.7) - (totalAngle / 2);
      
      for(let i=0; i<chars.length; i++) {
        let ch = chars[i];
        let wCh = ctx.measureText(ch).width;
        let charAngle = wCh / textRadius;
        
        ctx.save();
        ctx.rotate(angle + charAngle/2);
        ctx.translate(0, textRadius);
        ctx.rotate(Math.PI); // upright
        ctx.fillText(ch, 0, 0);
        ctx.restore();
        
        angle += charAngle;
      }
      ctx.restore();
    } else {
      ctx.font = `bold 64px Inter, sans-serif`; // large font for 800px canvas
      ctx.fillStyle = STATE.arcTextColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Position text in the center of the banner
      ctx.fillText(STATE.arcText.trim(), w / 2, h * 0.86);
    }
  }

  ctx.restore(); // end clip

  // 5. Draw Outer Ring Stroke (Optional, looks clean without it or just a thin border)
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = STATE.ringColor;
  ctx.lineWidth   = 16;
  ctx.stroke();

  // 6. Draw Logo
  if (STATE.logoImage) {
    const logoSize = 120;
    const lx = cx - logoSize/2;
    // position top center, inside the boundary
    const ly = cy - r + 30;
    
    // Check if we want a circular clip for logo? Default is draw as is
    ctx.save();
    ctx.drawImage(STATE.logoImage, lx, ly, logoSize, logoSize);
    ctx.restore();
  }
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
      STATE.rotation = 0; STATE.flipX = false; STATE.flipY = false;
      drawFrame();
      showToast('Photo loaded!', 'success');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// ── Upload / Drop ──────────────────────────────────────────────────────────
function initUpload() {
  const input = document.getElementById('liFileInput');
  const triggerBtn = document.getElementById('liUploadBtnTrigger');

  const triggerUpload = () => input.click();

  if (triggerBtn) triggerBtn.addEventListener('click', triggerUpload);
  canvas.addEventListener('click', triggerUpload); // Always allow clicking canvas to change
  
  input.addEventListener('change', () => { 
    if (input.files.length > 0) {
      loadImageFile(input.files[0]); 
    }
    input.value = ''; 
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
    if (STATE.flipY) tCtx.scale(1, -1);
    tCtx.rotate((STATE.rotation * Math.PI) / 180);
    tCtx.drawImage(STATE.userImage, -tempCanvas.width/2, -tempCanvas.height/2);
    tempCanvas.toBlob(async blob => {
      const formData = new FormData();
      formData.append('image', blob, 'linkedin-origin.png');
      formData.append('bg_colour', 'original'); // keep transparent so we can use bg color picker

      try {
        const res = await fetch('/remove-bg', { method: 'POST', body: formData });
        if (!res.ok) throw new Error('API failed');
        const returnBlob = await res.blob();
        const img = new Image();
        img.onload = () => {
          STATE.userImage = img;
          STATE.rotation = 0; STATE.flipX = false; STATE.flipY = false;
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

// ── Colors ────────────────────────────────────────────────────
function initColors() {
  const ringPicker = document.getElementById('ringColorPicker');
  const ringHex    = document.getElementById('ringColorHex');
  if (ringPicker) {
    ringPicker.addEventListener('input', (e) => {
      STATE.ringColor = e.target.value;
      if (ringHex) ringHex.value = e.target.value.toUpperCase();
      drawFrame();
    });
  }

  const arcPicker = document.getElementById('arcTextColorPicker');
  const arcHex    = document.getElementById('arcTextHex');
  if (arcPicker) {
    arcPicker.addEventListener('input', (e) => {
      STATE.arcTextColor = e.target.value;
      if (arcHex) arcHex.value = e.target.value.toUpperCase();
      drawFrame();
    });
  }

  // Background Swatches Grid logic
  const bgSwatches = document.querySelectorAll('#liBgColourGrid .colour-swatch[data-colour]');
  const bgPicker   = document.getElementById('liBgColorPicker');

  const updateBg = (color) => {
    bgSwatches.forEach(s => s.classList.remove('active'));
    STATE.bgColour = color;
    drawFrame();
  };

  bgSwatches.forEach(sw => {
    sw.addEventListener('click', () => {
      updateBg(sw.dataset.colour);
      sw.classList.add('active');
    });
  });

  if (bgPicker) {
    bgPicker.addEventListener('input', (e) => {
      updateBg(e.target.value);
    });
  }
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
  const fv = document.getElementById('flipVBtn');
  if (cw) cw.addEventListener('click', () => { STATE.rotation = (STATE.rotation + 90) % 360; drawFrame(); });
  if (fh) fh.addEventListener('click', () => { STATE.flipX = !STATE.flipX; drawFrame(); });
  if (fv) fv.addEventListener('click', () => { STATE.flipY = !STATE.flipY; drawFrame(); });

  // Arch text toggle
  const archToggle = document.getElementById('archTextToggle');
  if (archToggle) {
    archToggle.addEventListener('change', (e) => {
      STATE.useArchText = e.target.checked;
      drawFrame();
    });
  }

  // Logo handlers
  const logoInput = document.getElementById('liLogoInput');
  const removeLogoBtn = document.getElementById('liRemoveLogoBtn');
  if (logoInput && removeLogoBtn) {
    logoInput.addEventListener('change', (e) => {
      if (!e.target.files[0]) return;
      const reader = new FileReader();
      reader.onload = ev => {
        const img = new Image();
        img.onload = () => {
          STATE.logoImage = img;
          removeLogoBtn.classList.remove('hidden');
          drawFrame();
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(e.target.files[0]);
    });
    
    removeLogoBtn.addEventListener('click', () => {
      STATE.logoImage = null;
      logoInput.value = '';
      removeLogoBtn.classList.add('hidden');
      drawFrame();
    });
  }
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
      STATE.rotation = 0; STATE.flipX = false; STATE.flipY = false;
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
  const btn = document.getElementById('liDownloadBtn');
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
    initColors();
    initArcText();
    initTransforms();
    initCrop();
    initDownload();
    drawFrame();
  }
});

})();
