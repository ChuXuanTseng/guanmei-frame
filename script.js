const menuButton = document.querySelector('.menu-button');
const mainNav = document.querySelector('.main-nav');
const form = document.querySelector('#order-form');
const success = document.querySelector('#success-message');
const quoteNumber = document.querySelector('#quote-number');
const newOrderButton = document.querySelector('#new-order');
const referenceField = document.querySelector('#reference-example');
const referenceNote = document.querySelector('#reference-note');
const referenceName = document.querySelector('#reference-name');
const artworkUpload = document.querySelector('#artwork-upload');
const previewArtworkImage = document.querySelector('#preview-artwork-image');
const previewPlaceholder = document.querySelector('#preview-placeholder');
const uploadStatus = document.querySelector('#upload-status');
const previewFrame = document.querySelector('#preview-frame');
const previewStage = document.querySelector('#preview-stage');
const selectedFrameName = document.querySelector('#selected-frame-name');
const artworkWidthInput = document.querySelector('#artwork-width');
const artworkHeightInput = document.querySelector('#artwork-height');
const previewWidthMeasure = document.querySelector('#preview-width-measure');
const previewHeightMeasure = document.querySelector('#preview-height-measure');
const previewSizeSummary = document.querySelector('#preview-size-summary');
const frameCodeField = document.querySelector('#frame-code');
const frameSpecField = document.querySelector('#frame-spec');
const uploadedFileNameField = document.querySelector('#uploaded-file-name');
let previewImageUrl = null;

menuButton?.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  menuButton.classList.toggle('open', isOpen);
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

mainNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  mainNav.classList.remove('open');
  menuButton?.classList.remove('open');
  menuButton?.setAttribute('aria-expanded', 'false');
}));

document.querySelectorAll('.case-card').forEach((card) => {
  card.querySelector('button').addEventListener('click', () => {
    const reference = card.dataset.reference;
    if (referenceField) referenceField.value = reference;
    if (referenceNote && referenceName) {
      referenceName.textContent = reference;
      referenceNote.hidden = false;
    }
    document.querySelector('#order').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

document.querySelectorAll('[data-order-type]').forEach((card) => {
  card.addEventListener('click', () => {
    const itemType = card.dataset.orderType;
    const matchingChoice = document.querySelector(`input[name="itemType"][value="${itemType}"]`);
    if (matchingChoice) matchingChoice.checked = true;
    document.querySelector('#order').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

function selectFrame(button) {
  if (!button || !previewFrame) return;
  document.querySelectorAll('.frame-option').forEach((option) => {
    const isSelected = option === button;
    option.classList.toggle('is-selected', isSelected);
    option.setAttribute('aria-pressed', String(isSelected));
  });
  const { frame, code, width, height } = button.dataset;
  previewFrame.dataset.frame = frame;
  if (selectedFrameName) selectedFrameName.textContent = code;
  if (frameCodeField) frameCodeField.value = code;
  if (frameSpecField) frameSpecField.value = `W${width} × H${height} mm`;
  updatePreviewDimensions();
}

document.querySelectorAll('.frame-option').forEach((button) => {
  button.addEventListener('click', () => selectFrame(button));
});

function clampArtworkDimension(input, fallback) {
  const value = Number(input?.value);
  if (!Number.isFinite(value)) return fallback;
  return Math.min(200, Math.max(5, value));
}

function formatCentimeters(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function updatePreviewDimensions() {
  if (!previewFrame || !previewStage) return;

  const selected = document.querySelector('.frame-option.is-selected');
  if (!selected) return;

  const artworkWidth = clampArtworkDimension(artworkWidthInput, 40);
  const artworkHeight = clampArtworkDimension(artworkHeightInput, 30);
  const frameFaceWidth = Number(selected.dataset.width) / 10;
  const outerWidth = artworkWidth + frameFaceWidth * 2;
  const outerHeight = artworkHeight + frameFaceWidth * 2;
  const stageRect = previewStage.getBoundingClientRect();
  const maxWidth = Math.max(160, stageRect.width - 76);
  const maxHeight = Math.max(170, stageRect.height - 50);
  const scale = Math.min(maxWidth / outerWidth, maxHeight / outerHeight);
  const borderWidth = Math.max(9, Math.round(frameFaceWidth * scale));

  previewFrame.style.width = `${Math.round(outerWidth * scale)}px`;
  previewFrame.style.height = `${Math.round(outerHeight * scale)}px`;
  previewFrame.style.setProperty('--frame-size', `${borderWidth}px`);

  const widthText = `成品寬約 ${formatCentimeters(outerWidth)} cm`;
  const heightText = `成品高約 ${formatCentimeters(outerHeight)} cm`;
  if (previewWidthMeasure) previewWidthMeasure.textContent = widthText;
  if (previewHeightMeasure) previewHeightMeasure.textContent = heightText;
  if (previewSizeSummary) {
    previewSizeSummary.textContent = `作品 ${formatCentimeters(artworkWidth)} × ${formatCentimeters(artworkHeight)} cm · 成品約 ${formatCentimeters(outerWidth)} × ${formatCentimeters(outerHeight)} cm`;
  }
}

[artworkWidthInput, artworkHeightInput].forEach((input) => {
  input?.addEventListener('input', updatePreviewDimensions);
  input?.addEventListener('change', updatePreviewDimensions);
});

document.querySelectorAll('.frame-filter-button').forEach((filterButton) => {
  filterButton.addEventListener('click', () => {
    const { frameFilter } = filterButton.dataset;
    document.querySelectorAll('.frame-filter-button').forEach((button) => {
      const isActive = button === filterButton;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-selected', String(isActive));
    });

    const options = [...document.querySelectorAll('.frame-option')];
    options.forEach((option) => {
      option.hidden = option.dataset.category !== frameFilter;
    });

    const selected = document.querySelector('.frame-option.is-selected');
    if (selected?.hidden) {
      selectFrame(options.find((option) => option.dataset.category === frameFilter));
    }
  });
});

artworkUpload?.addEventListener('change', () => {
  const [file] = artworkUpload.files;
  if (!file) return;
  if (previewImageUrl) URL.revokeObjectURL(previewImageUrl);
  previewImageUrl = URL.createObjectURL(file);
  previewArtworkImage.src = previewImageUrl;
  previewArtworkImage.hidden = false;
  previewPlaceholder.hidden = true;
  if (uploadStatus) uploadStatus.textContent = `已載入：${file.name}（僅在這台裝置上預覽）`;
  if (uploadedFileNameField) uploadedFileNameField.value = file.name;
});

function createQuoteNumber() {
  const now = new Date();
  const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('');
  const serial = String(Math.floor(1000 + Math.random() * 9000));
  return `GM-${date}-${serial}`;
}

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const quote = createQuoteNumber();
  const data = Object.fromEntries(new FormData(form).entries());
  const requests = JSON.parse(localStorage.getItem('guanmei-quote-requests') || '[]');
  requests.push({ quote, submittedAt: new Date().toISOString(), ...data });
  localStorage.setItem('guanmei-quote-requests', JSON.stringify(requests));
  quoteNumber.textContent = quote;
  form.hidden = true;
  success.hidden = false;
  success.focus?.();
});

newOrderButton?.addEventListener('click', () => {
  form.reset();
  if (referenceField) referenceField.value = '';
  if (referenceNote) referenceNote.hidden = true;
  document.querySelector('.frame-filter-button[data-frame-filter="plain"]')?.click();
  selectFrame(document.querySelector('.frame-option[data-frame="101-small-red"]'));
  success.hidden = true;
  form.hidden = false;
  form.querySelector('input[name="name"]').focus();
});

window.addEventListener('resize', updatePreviewDimensions);
requestAnimationFrame(updatePreviewDimensions);
