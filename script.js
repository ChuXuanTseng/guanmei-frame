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
const selectedFrameName = document.querySelector('#selected-frame-name');
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
}

document.querySelectorAll('.frame-option').forEach((button) => {
  button.addEventListener('click', () => selectFrame(button));
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
  selectFrame(document.querySelector('.frame-option[data-frame="101-red"]'));
  success.hidden = true;
  form.hidden = false;
  form.querySelector('input[name="name"]').focus();
});
