/**
 * 冠美相框｜客製裝裱詢價通知服務
 *
 * 網站不會在客人填完表單時自動通知店家；只有客人按下
 * 「傳送詢價單到官方 LINE」後，才會呼叫此網頁應用程式。
 *
 * 部署前請在「專案設定 → 指令碼屬性」設定：
 * - LINE_CHANNEL_ACCESS_TOKEN：Messaging API 的長期 Channel access token
 * - LINE_ORDER_GROUP_ID：冠美訂單通知群組的 groupId
 *
 * INQUIRY_SPREADSHEET_ID 由程式第一次執行時自動建立，不需手動設定。
 */

const SPREADSHEET_NAME = '冠美相框｜客製裝裱詢價資料';
const SHEET_NAME = '詢價資料';
const ORDER_NOTIFICATION_EMAIL = 'gmtw.service@gmail.com';
const HEADERS = [
  '詢價編號',
  '送出時間',
  '姓名',
  '電話',
  '電子郵件',
  '聯絡時段',
  '裝裱類型',
  '偏好風格',
  '作品／成品尺寸',
  '取件方式',
  '選擇框型',
  '框型規格',
  '參考案例',
  '上傳檔名',
  '補充需求',
  '處理狀態',
  '店內備註',
  'Email 通知',
  'LINE 群組通知',
];

function doGet() {
  return ContentService.createTextOutput('冠美相框詢價通知服務運作中');
}

function doPost(event) {
  const payload = readPayload_(event);

  // 僅接受客人按下官方 LINE 按鈕後，由網站送出的通知請求。
  if (payload.website || payload.source !== 'guanmei-website' || payload.submitAction !== 'send_to_official_line') {
    return json_({ ok: false, error: 'notification_not_requested' });
  }

  if (!payload.name || !payload.phone || !payload.itemType || !payload.privacy) {
    return json_({ ok: false, error: 'missing_required_fields' });
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const sheet = getInquirySheet_();
    const submittedAt = new Date();
    const quote = text_(payload.quote) || `GM-${Utilities.formatDate(submittedAt, 'Asia/Taipei', 'yyyyMMdd')}`;
    const existingRow = findInquiryRow_(sheet, quote);

    // 客人重複點擊 LINE 按鈕時，不重複寄信或推播。
    if (existingRow) return json_({ ok: true, quote, duplicate: true });

    sheet.appendRow([
      safeText_(quote),
      submittedAt,
      safeText_(payload.name),
      safeText_(payload.phone),
      safeText_(payload.email),
      safeText_(payload.contactTime),
      safeText_(payload.itemType),
      safeText_(payload.style),
      safeText_(payload.size),
      safeText_(payload.delivery),
      safeText_(payload.frameCode),
      safeText_(payload.frameSpec),
      safeText_(payload.reference),
      safeText_(payload.uploadedFileName),
      safeText_(payload.note),
      '待聯繫',
      '',
      '處理中',
      '處理中',
    ]);

    const row = sheet.getLastRow();
    sheet.getRange(row, 2).setNumberFormat('yyyy-mm-dd hh:mm');
    const message = buildOrderMessage_(quote, submittedAt, payload);
    const emailStatus = sendEmailNotification_(quote, message);
    const lineStatus = sendLineGroupNotification_(message);
    sheet.getRange(row, 18, 1, 2).setValues([[emailStatus, lineStatus]]);

    return json_({ ok: true, quote, emailStatus, lineStatus });
  } finally {
    lock.releaseLock();
  }
}

function readPayload_(event) {
  const raw = event && event.postData && event.postData.contents;
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (error) {
      // 也支援標準 HTML 表單傳送。
    }
  }
  return (event && event.parameter) || {};
}

function getInquirySheet_() {
  const properties = PropertiesService.getScriptProperties();
  const spreadsheetId = properties.getProperty('INQUIRY_SPREADSHEET_ID');
  let spreadsheet;
  let sheet;

  if (spreadsheetId) {
    spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
  } else {
    spreadsheet = SpreadsheetApp.create(SPREADSHEET_NAME);
    sheet = spreadsheet.getSheets()[0];
    sheet.setName(SHEET_NAME);
    properties.setProperty('INQUIRY_SPREADSHEET_ID', spreadsheet.getId());
  }

  ensureSheetLayout_(sheet);
  return sheet;
}

function ensureSheetLayout_(sheet) {
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, HEADERS.length)
    .setBackground('#E9E9E6')
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setWrap(true);
  sheet.setRowHeight(1, 30);

  const widths = [122, 148, 84, 116, 180, 104, 118, 132, 144, 108, 120, 132, 176, 166, 240, 92, 160, 112, 132];
  widths.forEach((width, index) => sheet.setColumnWidth(index + 1, width));
}

function findInquiryRow_(sheet, quote) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;
  const match = sheet.getRange(2, 1, lastRow - 1, 1).createTextFinder(quote).matchEntireCell(true).findNext();
  return match ? match.getRow() : 0;
}

function buildOrderMessage_(quote, submittedAt, payload) {
  const row = (label, value) => `${label}：${text_(value) || '未填寫'}`;
  const formattedTime = Utilities.formatDate(submittedAt, 'Asia/Taipei', 'yyyy/MM/dd HH:mm');
  return [
    '【冠美相框｜客製裝裱詢價】',
    `詢價編號：${quote}`,
    `通知時間：${formattedTime}`,
    '',
    row('姓名', payload.name),
    row('電話', payload.phone),
    row('Email', payload.email),
    row('方便聯絡時段', payload.contactTime),
    '',
    row('裝裱項目', payload.itemType),
    row('喜好風格', payload.style),
    row('選擇框型', payload.frameCode),
    row('框條規格', payload.frameSpec),
    row('作品尺寸', payload.size),
    row('取件方式', payload.delivery),
    row('參考案例', payload.reference),
    row('預覽圖片檔名', payload.uploadedFileName),
    '',
    row('補充需求', payload.note),
    '',
    '客人已按下網站的「傳送詢價單到官方 LINE」。'
  ].join('\n').slice(0, 4900);
}

function sendEmailNotification_(quote, message) {
  try {
    MailApp.sendEmail({
      to: ORDER_NOTIFICATION_EMAIL,
      subject: `【冠美相框詢價】${quote}`,
      body: message,
      name: '冠美相框網站'
    });
    return '已寄送';
  } catch (error) {
    return `失敗：${statusText_(error)}`;
  }
}

function sendLineGroupNotification_(message) {
  const properties = PropertiesService.getScriptProperties();
  const accessToken = properties.getProperty('LINE_CHANNEL_ACCESS_TOKEN');
  const groupId = properties.getProperty('LINE_ORDER_GROUP_ID');
  if (!accessToken || !groupId) return '未設定 LINE 機器人或訂單群組';

  try {
    const response = UrlFetchApp.fetch('https://api.line.me/v2/bot/message/push', {
      method: 'post',
      contentType: 'application/json',
      headers: { Authorization: `Bearer ${accessToken}` },
      payload: JSON.stringify({
        to: groupId,
        messages: [{ type: 'text', text: message }]
      }),
      muteHttpExceptions: true
    });
    const statusCode = response.getResponseCode();
    if (statusCode >= 200 && statusCode < 300) return '已推播';
    return `失敗：LINE ${statusCode}`;
  } catch (error) {
    return `失敗：${statusText_(error)}`;
  }
}

function text_(value) {
  return String(value || '').trim();
}

function safeText_(value) {
  const text = text_(value);
  // 避免客人輸入 =、+、-、@ 時被試算表當成公式執行。
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

function statusText_(error) {
  return String(error && error.message ? error.message : error).replace(/\s+/g, ' ').slice(0, 120);
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
