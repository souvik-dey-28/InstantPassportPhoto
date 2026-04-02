/* ═══════════════════════════════════════════════
   InstantPhotos — app.js
   Handles: i18n, themes, photo upload, cropping,
            colour picker, PDF/PNG generation,
            AI prompt generator, feedback modal.
   ═══════════════════════════════════════════════ */

'use strict';

// ── Globals ──────────────────────────────────────────────────────────────
let translations  = {};
let currentLang   = localStorage.getItem('lang')   || 'en';
let currentTheme  = localStorage.getItem('theme')  || 'dark';
let selectedBg    = localStorage.getItem('bgColour') || 'white';
let customHex     = '#3b82f6';
let photos        = [];
let nextId        = 0;
let activeCropper = null;
let pendingCropId = null;
let savedPrompts  = JSON.parse(localStorage.getItem('promptHistory') || '[]');
let pdfBlobUrl    = null;

// ── Prompt data ───────────────────────────────────────────────────────────
const PRESETS = {
  passport:  { subject:'', style:'Photorealistic', mood:'Professional', bg:'white' },
  linkedin:  { subject:'', style:'Studio portrait', mood:'Confident',   bg:'blue' },
  instagram: { subject:'', style:'Cinematic',       mood:'Casual',      bg:'gradient' },
  creative:  { subject:'', style:'Digital painting', mood:'Creative',   bg:'original' },
};
const RANDOM_SUBJECTS = ['young professional','student','business woman','artist','teacher','engineer','doctor','entrepreneur'];
const RANDOM_STYLES   = ['Photorealistic','Cinematic','Soft light','Studio portrait','Digital painting','Watercolor art'];
const RANDOM_MOODS    = ['Professional','Confident','Friendly','Elegant','Creative','Casual','Dramatic'];

// ── i18n ──────────────────────────────────────────────────────────────────
async function loadTranslations() {
  try {
    const res  = await fetch('/static/translations/i18n.json?v=' + Date.now());
    translations = await res.json();
  } catch(e) {
    console.error('Failed to load translations', e);
    translations = {};
  }
  applyTranslations();
}

function t(key) {
  return (translations[currentLang] && translations[currentLang][key]) ||
         (translations['en']         && translations['en'][key])         || key;
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    el.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
}

// ── Theme ─────────────────────────────────────────────────────────────────
function applyTheme(theme) {
  if (theme === 'system') {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);  // FIX: save resolved theme, not stale currentTheme
}

// ── Toast ─────────────────────────────────────────────────────────────────
let toastTimer;
function showToast(msg, type = 'info') {
  const el  = document.getElementById('toast');
  const msg_el = document.getElementById('toastMsg');
  msg_el.textContent = msg;
  el.className = 'toast ' + type;
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 3500);
}

// ── Tab Navigation ────────────────────────────────────────────────────────
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.remove('hidden');
    });
  });
}

// ── Background Colour System ──────────────────────────────────────────────
function initColourPicker() {
  const preview  = document.getElementById('bgPreview');
  const swatches = document.querySelectorAll('.colour-swatch');
  const custom   = document.getElementById('customColour');

  function setActive(colour, hex) {
    selectedBg = colour;
    localStorage.setItem('bgColour', colour);
    swatches.forEach(s => s.classList.remove('active'));
    // Update preview
    if (colour === 'original') {
      preview.style.background = 'repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 0 0 / 16px 16px';
    } else {
      preview.style.background = hex || colour;
    }
  }

  swatches.forEach(swatch => {
    const colour = swatch.dataset.colour;
    if (!colour) return;
    swatch.addEventListener('click', () => {
      swatches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      const hex = swatch.style.background;
      setActive(colour, hex);
    });
  });

  // Restore saved selection
  const saved = document.querySelector(`.colour-swatch[data-colour="${selectedBg}"]`);
  if (saved) { saved.click(); }

  // Custom colour wheel
  custom.addEventListener('input', () => {
    customHex = custom.value;
    selectedBg = customHex;
    localStorage.setItem('bgColour', customHex);
    swatches.forEach(s => s.classList.remove('active'));
    document.querySelector('.colour-wheel-btn').classList.add('active');
    preview.style.background = customHex;
  });
}

// ── Photo Upload & Management ─────────────────────────────────────────────
function renderPhotoList() {
  const list = document.getElementById('photoList');
  list.innerHTML = '';
  photos.forEach(photo => {
    const card = document.createElement('div');
    card.className = 'photo-card';
    card.innerHTML = `
      <img src="${photo.previewUrl}" class="photo-thumb" alt="photo"/>
      <div class="photo-info">
        <div class="photo-name">${photo.originalFile.name}</div>
        <div class="photo-status">${photo.croppedFile ? '✅ ' + t('success_cropped') : '⚠️ Not cropped'}</div>
      </div>
      <div class="photo-copies">
        <span class="copies-label">${t('copies')}</span>
        <input type="number" class="copies-input" value="${photo.copies}" min="1" max="54" data-id="${photo.id}"/>
      </div>
      <div class="photo-actions">
        <button class="btn-tiny btn-crop" data-id="${photo.id}">${t('crop')}</button>
        <button class="btn-tiny btn-del"  data-id="${photo.id}">${t('remove')}</button>
      </div>`;
    list.appendChild(card);
  });

  list.querySelectorAll('.copies-input').forEach(inp => {
    inp.addEventListener('change', e => {
      const p = photos.find(x => x.id === +e.target.dataset.id);
      if (p) p.copies = Math.max(1, Math.min(54, parseInt(e.target.value) || 1));
    });
  });
  list.querySelectorAll('.btn-crop').forEach(btn => {
    btn.addEventListener('click', e => openCropper(+e.target.dataset.id));
  });
  list.querySelectorAll('.btn-del').forEach(btn => {
    btn.addEventListener('click', e => {
      photos = photos.filter(x => x.id !== +e.target.dataset.id);
      renderPhotoList();
      document.getElementById('addMoreWrapper').classList.toggle('hidden', photos.length === 0);
    });
  });

  document.getElementById('addMoreWrapper').classList.toggle('hidden', photos.length === 0);
}

function addFiles(files) {
  const validMime = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  let added = 0;
  [...files].forEach(file => {
    if (!validMime.includes(file.type)) return;
    if (file.size > 16 * 1024 * 1024) { showToast('File too large (max 16 MB): ' + file.name, 'error'); return; }
    photos.push({ id: nextId++, originalFile: file, croppedFile: null,
                  previewUrl: URL.createObjectURL(file), copies: 6 });
    added++;
  });
  if (!added) showToast(t('error_invalid'), 'error');
  renderPhotoList();
}

function initDropZone() {
  const zone  = document.getElementById('dropZone');
  const input = document.getElementById('imageInput');

  zone.addEventListener('click', () => input.click());
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', e => {
    e.preventDefault(); zone.classList.remove('dragover');
    addFiles(e.dataTransfer.files);
  });
  input.addEventListener('change', () => { addFiles(input.files); input.value = ''; });
  document.getElementById('addMoreBtn').addEventListener('click', () => input.click());
}

// ── Cropper ───────────────────────────────────────────────────────────────
let flipXState = 1;
let flipYState = 1;

function openCropper(id) {
  const photo = photos.find(p => p.id === id);
  if (!photo) return;
  pendingCropId = id;
  flipXState = 1; flipYState = 1;
  const img = document.getElementById('cropModalImage');
  img.src    = photo.previewUrl;
  document.getElementById('cropperModal').classList.remove('hidden');
  if (activeCropper) { activeCropper.destroy(); }
  activeCropper = new Cropper(img, { aspectRatio: 384/472, viewMode: 1, dragMode: 'move', autoCropArea: 1 });
}

function initCropper() {
  // ── Rotate & Flip toolbar ──
  document.getElementById('rotateCW').addEventListener('click', () => {
    if (activeCropper) activeCropper.rotate(90);
  });
  document.getElementById('rotateCCW').addEventListener('click', () => {
    if (activeCropper) activeCropper.rotate(-90);
  });
  document.getElementById('flipH').addEventListener('click', () => {
    if (!activeCropper) return;
    flipXState *= -1;
    activeCropper.scaleX(flipXState);
  });
  document.getElementById('flipV').addEventListener('click', () => {
    if (!activeCropper) return;
    flipYState *= -1;
    activeCropper.scaleY(flipYState);
  });

  document.getElementById('confirmCropBtn').addEventListener('click', () => {
    if (!activeCropper || pendingCropId === null) return;
    activeCropper.getCroppedCanvas({ width: 400, height: 480 }).toBlob(blob => {
      const photo    = photos.find(p => p.id === pendingCropId);
      if (!photo) return;
      photo.croppedFile = new File([blob], 'cropped-' + photo.originalFile.name, { type: 'image/png' });
      photo.previewUrl  = URL.createObjectURL(blob);
      activeCropper.destroy(); activeCropper = null; pendingCropId = null;
      document.getElementById('cropperModal').classList.add('hidden');
      renderPhotoList();
      showToast(t('success_cropped'), 'success');
    }, 'image/png');
  });
  document.getElementById('cancelCropBtn').addEventListener('click', () => {
    if (activeCropper) { activeCropper.destroy(); activeCropper = null; }
    pendingCropId = null;
    document.getElementById('cropperModal').classList.add('hidden');
  });
}

// ── Advanced Options ──────────────────────────────────────────────────────
function initAdvanced() {
  const btn   = document.getElementById('toggleAdvanced');
  const panel = document.getElementById('advancedOptions');
  btn.addEventListener('click', () => {
    const vis = !panel.classList.contains('hidden');
    panel.classList.toggle('hidden', vis);
    btn.textContent = vis ? t('advanced_options') + ' ▾' : t('hide_advanced') + ' ▴';
  });
}

// ── Generate PDF ──────────────────────────────────────────────────────────
function initGenerate() {
  const generateBtn = document.getElementById('generateBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const loading     = document.getElementById('loading');
  const pdfPreview  = document.getElementById('pdfPreview');

  generateBtn.addEventListener('click', async () => {
    if (photos.length === 0) { showToast(t('error_no_image'), 'error'); return; }

    const fd = new FormData();
    photos.forEach((p, i) => {
      fd.append(`image_${i}`, p.croppedFile || p.originalFile);
      fd.append(`copies_${i}`, p.copies);
    });
    fd.append('width',    document.getElementById('photoWidth').value);
    fd.append('height',   document.getElementById('photoHeight').value);
    fd.append('spacing',  document.getElementById('photoSpacing').value);
    fd.append('border',   document.getElementById('photoBorder').value);
    fd.append('bg_colour', selectedBg.startsWith('#') ? selectedBg : selectedBg);

    loading.classList.remove('hidden');
    generateBtn.disabled = true;
    downloadBtn.classList.add('hidden');
    pdfPreview.classList.add('hidden');

    try {
      const res = await fetch('/process', { method: 'POST', body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Processing failed.' }));
        showToast(err.error || 'Processing failed.', 'error'); return;
      }
      const blob = await res.blob();
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
      pdfBlobUrl    = URL.createObjectURL(blob);
      pdfPreview.src = pdfBlobUrl;
      pdfPreview.classList.remove('hidden');
      downloadBtn.classList.remove('hidden');
      downloadBtn.onclick = () => {
        const a = document.createElement('a'); a.href = pdfBlobUrl;
        a.download = 'passport-sheet.pdf'; a.click();
      };
      showToast(t('success_pdf'), 'success');
    } catch(e) {
      showToast('Network error. Is the server running?', 'error');
    } finally {
      loading.classList.add('hidden');
      generateBtn.disabled = false;
    }
  });
}

// ── Download Single PNG ───────────────────────────────────────────────────
function initDownloadPng() {
  const btn = document.getElementById('downloadPngBtn');
  // Shows after generate; alternate: direct single-image call
  btn.addEventListener('click', async () => {
    if (photos.length === 0) { showToast(t('error_no_image'), 'error'); return; }
    const fd = new FormData();
    const p  = photos[0];
    fd.append('image', p.croppedFile || p.originalFile);
    fd.append('bg_colour', selectedBg);
    try {
      const res  = await fetch('/remove-bg', { method: 'POST', body: fd });
      if (!res.ok) { const e = await res.json().catch(()=>({})); showToast(e.error||'Failed', 'error'); return; }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'removed-bg.png'; a.click();
      showToast('PNG downloaded!', 'success');
    } catch(e) { showToast('Network error.', 'error'); }
  });

  // Show PNG button after any photo is added
  document.getElementById('imageInput').addEventListener('change', () => {
    btn.classList.remove('hidden');
  });
}

// ── AI Prompt Generator ───────────────────────────────────────────────────
function buildPrompt(preset, subject, style, mood, bg) {
  const templates = {
    passport:  `Professional passport-style portrait of ${subject||'a person'}. ${style} photography, ${mood} expression, ${bg} background, soft studio lighting, sharp focus, front-facing, high resolution, photorealistic.`,
    linkedin:  `Professional LinkedIn headshot of ${subject||'a business professional'}. ${style} photography, ${mood} expression, ${bg} background, clean studio lighting, confident smile, business casual attire, high resolution, photorealistic.`,
    instagram: `Aesthetic Instagram-worthy portrait of ${subject||'a person'}. ${style} style, ${mood} vibe, ${bg} background, beautiful natural lighting, lifestyle photography, vibrant colors, highly detailed.`,
    creative:  `${style} portrait artwork of ${subject||'a person'}. ${mood} atmosphere, ${bg} background, artistic composition, highly detailed illustration, concept art, trending on ArtStation, 8K resolution.`
  };
  return templates[preset] || templates.passport;
}

function initPromptGenerator() {
  const outputDiv     = document.getElementById('promptOutput');
  const textarea      = document.getElementById('promptText');
  const historyDiv    = document.getElementById('promptHistory');
  const historySection= document.getElementById('promptHistorySection');

  // Preset buttons
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  function generateAndShow() {
    const preset  = document.querySelector('.preset-btn.active')?.dataset.preset || 'passport';
    const subject = document.getElementById('promptSubject').value.trim();
    const style   = document.getElementById('promptStyle').value;
    const mood    = document.getElementById('promptMood').value;
    const bg      = document.getElementById('promptBg').value;
    const prompt  = buildPrompt(preset, subject, style, mood, bg);
    textarea.value = prompt;
    outputDiv.classList.remove('hidden');
    return prompt;
  }

  document.getElementById('generatePromptBtn').addEventListener('click', generateAndShow);

  document.getElementById('randomPromptBtn').addEventListener('click', () => {
    document.getElementById('promptSubject').value = RANDOM_SUBJECTS[Math.floor(Math.random()*RANDOM_SUBJECTS.length)];
    document.getElementById('promptStyle').value   = RANDOM_STYLES[Math.floor(Math.random()*RANDOM_STYLES.length)];
    document.getElementById('promptMood').value    = RANDOM_MOODS[Math.floor(Math.random()*RANDOM_MOODS.length)];
    generateAndShow();
  });

  document.getElementById('copyPromptBtn').addEventListener('click', () => {
    if (!textarea.value) return;
    navigator.clipboard.writeText(textarea.value).then(() => showToast(t('prompt_copy'), 'success'));
  });

  document.getElementById('savePromptBtn').addEventListener('click', () => {
    const prompt = textarea.value;
    if (!prompt) return;
    savedPrompts.unshift(prompt);
    if (savedPrompts.length > 20) savedPrompts.pop();
    localStorage.setItem('promptHistory', JSON.stringify(savedPrompts));
    renderHistory();
    showToast(t('save_prompt') + ' ✓', 'success');
  });

  function renderHistory() {
    historyDiv.innerHTML = '';
    if (!savedPrompts.length) { historySection.classList.add('hidden'); return; }
    historySection.classList.remove('hidden');
    savedPrompts.forEach((p, i) => {
      const item = document.createElement('div');
      item.className = 'history-item';
      item.textContent = p;
      item.title = p;
      item.addEventListener('click', () => { textarea.value = p; outputDiv.classList.remove('hidden'); });
      historyDiv.appendChild(item);
    });
  }
  renderHistory();
}

// ── Feedback Modal ────────────────────────────────────────────────────────
function initFeedback() {
  const btn   = document.getElementById('feedbackBtn');
  const modal = document.getElementById('feedbackModal');
  const close = document.getElementById('closeModal');
  const form  = document.getElementById('feedbackForm');

  btn.addEventListener('click',   () => modal.classList.remove('hidden'));
  close.addEventListener('click', () => modal.classList.add('hidden'));
  modal.addEventListener('click', e => { if (e.target === modal) modal.classList.add('hidden'); });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const contact = form.contact.value.trim();
    const message = form.message.value.trim();
    if (!contact || !message) { showToast(t('error_no_image'), 'error'); return; }
    const submitBtn = form.querySelector('[type=submit]');
    submitBtn.disabled = true;
    submitBtn.textContent = '…';
    try {
      if (window.emailjs) {
        await emailjs.send('service_aoewzsq', 'template_hbw13lt', {
          contact, message, user_agent: navigator.userAgent,
          time: new Date().toLocaleString()
        });
      }
      showToast(t('success_feedback'), 'success');
      modal.classList.add('hidden');
      form.reset();
    } catch(err) {
      showToast('Failed to send. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = t('feedback_submit');
    }
  });
}

// ── Particles ─────────────────────────────────────────────────────────────
function initParticles() {
  if (!window.particlesJS) return;
  particlesJS('particles-js', {
    particles: {
      number: { value: 60, density: { enable: true, value_area: 900 } },
      color: { value: '#3b82f6' }, shape: { type: 'circle' },
      opacity: { value: 0.35, random: true },
      size: { value: 2.5, random: true },
      line_linked: { enable: true, distance: 140, color: '#64748b', opacity: 0.3, width: 1 },
      move: { enable: true, speed: 1.5, out_mode: 'out' }
    },
    interactivity: {
      detect_on: 'canvas',
      events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' } },
      modes: { repulse: { distance: 80 }, push: { particles_nb: 3 } }
    },
    retina_detect: true
  });
}

// ── Init ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Load translations first
  await loadTranslations();

  // Apply saved theme
  document.getElementById('themeSelect').value = currentTheme;
  applyTheme(currentTheme);
  document.getElementById('themeSelect').addEventListener('change', e => {
    currentTheme = e.target.value;
    localStorage.setItem('theme', currentTheme);
    applyTheme(currentTheme);
  });

  // Language change
  document.getElementById('langSelect').value = currentLang;
  document.getElementById('langSelect').addEventListener('change', e => {
    currentLang = e.target.value;
    localStorage.setItem('lang', currentLang);
    applyTranslations();
  });

  // EmailJS (optional)
  if (window.emailjs) emailjs.init('XJqjmVHK4ISEX0Zam');

  // Init all subsystems
  initTabs();
  initColourPicker();
  initDropZone();
  initCropper();
  initAdvanced();
  initGenerate();
  initDownloadPng();
  // initPromptGenerator(); // Disabled as LinkedIn replaced it
  initFeedback();
  initParticles();
});
