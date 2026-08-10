const menuButton = document.querySelector('.menu-button');
const mainNav = document.querySelector('.main-nav');
const form = document.querySelector('#order-form');
const success = document.querySelector('#success-message');
const quoteNumber = document.querySelector('#quote-number');
const newOrderButton = document.querySelector('#new-order');
const sendOrderLineButton = document.querySelector('#send-order-line');
const lineSendNote = document.querySelector('#line-send-note');
const orderNotificationEndpoint = document.querySelector('meta[name="guanmei-order-notification-endpoint"]')?.content.trim();
const referenceField = document.querySelector('#reference-example');
const referenceNote = document.querySelector('#reference-note');
const referenceName = document.querySelector('#reference-name');
const artworkUpload = document.querySelector('#artwork-upload');
const previewArtworkImage = document.querySelector('#preview-artwork-image');
const previewPlaceholder = document.querySelector('#preview-placeholder');
const uploadStatus = document.querySelector('#upload-status');
const previewFrame = document.querySelector('#preview-frame');
const previewStage = document.querySelector('#preview-stage');
const texturePreviewCanvas = document.querySelector('#texture-preview-canvas');
const texturePreviewContext = texturePreviewCanvas?.getContext('2d');
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
let pendingOrderNotification = null;
let orderNotificationQueued = false;
const frameTextureSources = {
  '101-small-coffee': 'assets/frames/textures/101-small-coffee-face-tile.webp',
  '101-small-teak': 'assets/frames/textures/101-small-teak-face-tile.webp',
  '101-small-red': 'assets/frames/textures/101-small-red-face-tile.webp',
  '101-middle-red': 'assets/frames/textures/101-middle-red-face-tile.webp',
  '101-middle-coffee': 'assets/frames/textures/101-middle-coffee-face-tile.webp',
  '101-middle-teak': 'assets/frames/textures/101-middle-teak-face-tile.webp',
  '101-large-coffee': 'assets/frames/textures/101-large-coffee-face-tile.webp',
  '101-large-green': 'assets/frames/textures/101-large-green-face-tile.webp',
  '101-large-red': 'assets/frames/textures/101-large-red-face-tile.webp',
  '101-large-purple': 'assets/frames/textures/101-large-purple-face-tile.webp',
  '101-large-teak': 'assets/frames/textures/101-large-teak-face-tile.webp',
  '101-large-blue': 'assets/frames/textures/101-large-blue-face-tile.webp',
  '101-large-plain': 'assets/frames/textures/101-large-plain-face-tile.webp',
  '102-black': 'assets/frames/textures/102-black-face-tile.webp',
  'carved-test-1': 'assets/frames/textures/carved-test-1-face-tile.webp',
  'carved-test-2': 'assets/frames/textures/carved-test-2-face-tile.webp'
};
const frameTextureRevision = '20260810-1735';

const frameTexturePalettes = {
  '101-small-coffee': { base: '#33221f', light: 'rgba(244, 224, 199, .20)', shadow: 'rgba(8, 5, 4, .48)', edge: 'rgba(29, 16, 13, .84)' },
  '101-small-teak': { base: '#a86426', light: 'rgba(255, 229, 178, .25)', shadow: 'rgba(73, 35, 9, .42)', edge: 'rgba(93, 50, 17, .74)' },
  '101-small-red': { base: '#7e302c', light: 'rgba(255, 229, 205, .26)', shadow: 'rgba(44, 10, 8, .42)', edge: 'rgba(58, 20, 15, .78)' },
  '101-middle-red': { base: '#78271f', light: 'rgba(255, 223, 192, .25)', shadow: 'rgba(48, 8, 6, .46)', edge: 'rgba(61, 17, 12, .80)' },
  '101-middle-coffee': { base: '#241816', light: 'rgba(225, 203, 179, .18)', shadow: 'rgba(4, 3, 2, .56)', edge: 'rgba(17, 10, 9, .88)' },
  '101-middle-teak': { base: '#ad5722', light: 'rgba(255, 220, 164, .25)', shadow: 'rgba(74, 28, 6, .43)', edge: 'rgba(95, 41, 13, .76)' },
  '101-large-coffee': { base: '#1f1e20', light: 'rgba(220, 215, 213, .15)', shadow: 'rgba(1, 1, 1, .60)', edge: 'rgba(12, 10, 11, .90)' },
  '101-large-green': { base: '#4d8c60', light: 'rgba(224, 255, 203, .24)', shadow: 'rgba(11, 55, 25, .43)', edge: 'rgba(23, 74, 41, .78)' },
  '101-large-red': { base: '#79322e', light: 'rgba(255, 220, 195, .23)', shadow: 'rgba(52, 12, 10, .44)', edge: 'rgba(67, 23, 19, .78)' },
  '101-large-purple': { base: '#62536e', light: 'rgba(242, 224, 255, .24)', shadow: 'rgba(35, 23, 46, .44)', edge: 'rgba(47, 34, 60, .80)' },
  '101-large-teak': { base: '#bd7b26', light: 'rgba(255, 230, 170, .26)', shadow: 'rgba(79, 41, 6, .42)', edge: 'rgba(104, 61, 14, .77)' },
  '101-large-blue': { base: '#4e8790', light: 'rgba(211, 251, 255, .23)', shadow: 'rgba(10, 48, 57, .45)', edge: 'rgba(24, 70, 76, .79)' },
  '101-large-plain': { base: '#d8b954', light: 'rgba(255, 252, 203, .33)', shadow: 'rgba(99, 77, 14, .31)', edge: 'rgba(130, 104, 24, .66)' },
  '102-black': { base: '#141414', light: 'rgba(226, 231, 229, .16)', shadow: 'rgba(0, 0, 0, .64)', edge: 'rgba(6, 6, 6, .92)' },
  'carved-test-1': { base: '#b6822c', light: 'rgba(255, 239, 172, .38)', shadow: 'rgba(71, 38, 6, .47)', edge: 'rgba(93, 54, 12, .84)' },
  'carved-test-2': { base: '#523534', light: 'rgba(232, 206, 202, .24)', shadow: 'rgba(31, 15, 15, .53)', edge: 'rgba(48, 27, 27, .88)' }
};

const frameTextures = Object.fromEntries(Object.entries(frameTextureSources).map(([frame, source]) => {
  const texture = new Image();
  texture.src = `${source}?v=${frameTextureRevision}`;
  return [frame, texture];
}));

function drawTexturedFramePreview() {
  if (!previewFrame || !texturePreviewCanvas || !texturePreviewContext) return;

  const selected = document.querySelector('.frame-option.is-selected');
  const selectedFrame = selected?.dataset.frame;
  const frameTexture = frameTextures[selectedFrame];
  const palette = frameTexturePalettes[selectedFrame] || frameTexturePalettes['101-small-red'];
  const usesRealTexture = Boolean(frameTexture?.complete && frameTexture.naturalWidth > 0);
  if (!usesRealTexture) {
    texturePreviewCanvas.hidden = true;
    previewFrame.classList.remove('is-texture-preview');
    return;
  }

  const rect = previewFrame.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) return;

  const deviceScale = Math.min(window.devicePixelRatio || 1, 2);
  const canvasWidth = Math.round(rect.width * deviceScale);
  const canvasHeight = Math.round(rect.height * deviceScale);
  if (texturePreviewCanvas.width !== canvasWidth || texturePreviewCanvas.height !== canvasHeight) {
    texturePreviewCanvas.width = canvasWidth;
    texturePreviewCanvas.height = canvasHeight;
  }

  texturePreviewCanvas.hidden = false;
  previewFrame.classList.add('is-texture-preview');

  const ctx = texturePreviewContext;
  const width = rect.width;
  const height = rect.height;
  const frameSize = Math.max(9, Number.parseFloat(previewFrame.style.getPropertyValue('--frame-size')) || 18);
  const innerWidth = width - frameSize * 2;
  const innerHeight = height - frameSize * 2;
  ctx.setTransform(deviceScale, 0, 0, deviceScale, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const paintStrip = (points, rotation, shadeStart, shadeEnd) => {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    points.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
    ctx.closePath();
    ctx.clip();
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate(rotation);
    const texture = ctx.createPattern(frameTexture, 'repeat');
    ctx.fillStyle = texture || palette.base;
    // 將原始框條照片的完整面寬縮放到目前選取框型的面寬，
    // 保留木紋與雕紋的實際比例，不把紋路拉成單色平面。
    const textureScale = Math.max(.08, frameSize / frameTexture.naturalHeight);
    const textureSpan = Math.max(width, height) * 2 / textureScale;
    ctx.scale(textureScale, textureScale);
    ctx.fillRect(-textureSpan, -textureSpan, textureSpan * 2, textureSpan * 2);
    ctx.restore();
    const gradient = ctx.createLinearGradient(shadeStart[0], shadeStart[1], shadeEnd[0], shadeEnd[1]);
    gradient.addColorStop(0, palette.light);
    gradient.addColorStop(.45, 'rgba(255,255,255,0)');
    gradient.addColorStop(1, palette.shadow);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    points.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
    ctx.closePath();
    ctx.strokeStyle = palette.edge;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  };

  ctx.save();
  ctx.shadowColor = 'rgba(55, 37, 25, .36)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = palette.base;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  ctx.fillStyle = '#faf9f6';
  ctx.fillRect(frameSize, frameSize, innerWidth, innerHeight);
  if (previewArtworkImage && !previewArtworkImage.hidden && previewArtworkImage.complete && previewArtworkImage.naturalWidth > 0) {
    const imageRatio = previewArtworkImage.naturalWidth / previewArtworkImage.naturalHeight;
    const targetRatio = innerWidth / innerHeight;
    let drawWidth = innerWidth;
    let drawHeight = innerHeight;
    if (imageRatio > targetRatio) drawHeight = innerWidth / imageRatio;
    else drawWidth = innerHeight * imageRatio;
    const drawX = frameSize + (innerWidth - drawWidth) / 2;
    const drawY = frameSize + (innerHeight - drawHeight) / 2;
    ctx.drawImage(previewArtworkImage, drawX, drawY, drawWidth, drawHeight);
  } else {
    ctx.fillStyle = '#8c8175';
    ctx.textAlign = 'center';
    ctx.font = '500 15px "Noto Serif TC", serif';
    ctx.fillText('你的作品會顯示在這裡', width / 2, height / 2 - 2);
    ctx.font = '10px "Noto Sans TC", sans-serif';
    ctx.fillStyle = '#9b9187';
    ctx.fillText('先上傳一張照片或作品圖', width / 2, height / 2 + 20);
  }

  paintStrip([[0, 0], [width, 0], [width - frameSize, frameSize], [frameSize, frameSize]], 0, [0, 0], [0, frameSize]);
  paintStrip([[width, 0], [width, height], [width - frameSize, height - frameSize], [width - frameSize, frameSize]], Math.PI / 2, [width, 0], [width - frameSize, 0]);
  paintStrip([[width, height], [0, height], [frameSize, height - frameSize], [width - frameSize, height - frameSize]], 0, [0, height], [0, height - frameSize]);
  paintStrip([[0, height], [0, 0], [frameSize, frameSize], [frameSize, height - frameSize]], Math.PI / 2, [0, 0], [frameSize, 0]);

  ctx.strokeStyle = 'rgba(255, 244, 223, .76)';
  ctx.lineWidth = 1.3;
  ctx.strokeRect(frameSize + .65, frameSize + .65, innerWidth - 1.3, innerHeight - 1.3);
  ctx.strokeStyle = 'rgba(57, 24, 17, .72)';
  ctx.lineWidth = 1;
  ctx.strokeRect(.5, .5, width - 1, height - 1);
}

Object.values(frameTextures).forEach((texture) => texture.addEventListener('load', drawTexturedFramePreview));
previewArtworkImage?.addEventListener('load', drawTexturedFramePreview);

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
  const { frame, code, width, height, spec } = button.dataset;
  previewFrame.dataset.frame = frame;
  if (selectedFrameName) selectedFrameName.textContent = code;
  if (texturePreviewCanvas) texturePreviewCanvas.setAttribute('aria-label', `${code} 真實框條即時預覽`);
  if (frameCodeField) frameCodeField.value = code;
  if (frameSpecField) frameSpecField.value = spec || `W${width} × H${height} mm`;
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
  drawTexturedFramePreview();
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

function createLineOrderMessage(quote, data) {
  const row = (label, value) => `${label}：${value || '未填寫'}`;
  return [
    '【冠美相框｜客製裝裱詢價】',
    `詢價編號：${quote}`,
    '',
    row('姓名', data.name),
    row('電話', data.phone),
    row('Email', data.email),
    row('方便聯絡時段', data.contactTime),
    '',
    row('裝裱項目', data.itemType),
    row('喜好風格', data.style),
    row('選擇框型', data.frameCode),
    row('框條規格', data.frameSpec),
    row('作品尺寸', data.size),
    row('取件方式', data.delivery),
    row('參考案例', data.reference),
    row('預覽圖片檔名', data.uploadedFileName),
    '',
    row('補充需求', data.note),
    '',
    '（由冠美相框網站詢價單帶入）'
  ].join('\n');
}

function createLineOrderUrl(message) {
  return `https://line.me/R/oaMessage/%40gmgm/?${encodeURIComponent(message)}`;
}

function queueOrderNotification() {
  if (!pendingOrderNotification || orderNotificationQueued || !orderNotificationEndpoint) return;

  const requestBody = JSON.stringify({
    ...pendingOrderNotification,
    source: 'guanmei-website',
    submitAction: 'send_to_official_line'
  });
  const requestBlob = new Blob([requestBody], { type: 'text/plain;charset=UTF-8' });
  let queued = false;

  if (navigator.sendBeacon) queued = navigator.sendBeacon(orderNotificationEndpoint, requestBlob);
  if (!queued) {
    fetch(orderNotificationEndpoint, {
      method: 'POST',
      mode: 'no-cors',
      keepalive: true,
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: requestBody
    }).catch(() => {
      // 客人已開啟官方 LINE，不以背景通知失敗打斷詢價流程。
    });
  }

  orderNotificationQueued = true;
  if (lineSendNote) lineSendNote.textContent = '詢價資料已同步通知冠美；請在 LINE 完成送出，方便我們一對一回覆。';
}

sendOrderLineButton?.addEventListener('click', queueOrderNotification);

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const quote = createQuoteNumber();
  const data = Object.fromEntries(new FormData(form).entries());
  const requests = JSON.parse(localStorage.getItem('guanmei-quote-requests') || '[]');
  requests.push({ quote, submittedAt: new Date().toISOString(), ...data });
  localStorage.setItem('guanmei-quote-requests', JSON.stringify(requests));
  pendingOrderNotification = { quote, submittedAt: new Date().toISOString(), ...data };
  orderNotificationQueued = false;
  quoteNumber.textContent = quote;
  if (sendOrderLineButton) sendOrderLineButton.href = createLineOrderUrl(createLineOrderMessage(quote, data));
  if (lineSendNote) lineSendNote.textContent = '若尚未加入好友，LINE 會先請你加入冠美相框；請再於 LINE 完成送出，方便我們一對一回覆。';
  form.hidden = true;
  success.hidden = false;
  success.focus?.();
});

newOrderButton?.addEventListener('click', () => {
  form.reset();
  if (referenceField) referenceField.value = '';
  if (referenceNote) referenceNote.hidden = true;
  pendingOrderNotification = null;
  orderNotificationQueued = false;
  document.querySelector('.frame-filter-button[data-frame-filter="plain"]')?.click();
  selectFrame(document.querySelector('.frame-option[data-frame="101-small-red"]'));
  success.hidden = true;
  form.hidden = false;
  form.querySelector('input[name="name"]').focus();
});

window.addEventListener('resize', updatePreviewDimensions);
requestAnimationFrame(updatePreviewDimensions);
