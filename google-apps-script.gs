/**
 * Backend reservasi Tasyakuran Khitan untuk Google Sheets.
 * Pasang script ini dari menu Extensions > Apps Script pada spreadsheet tujuan.
 */

const SHEET_NAME = 'Reservasi';
const HEADERS = [
  'Waktu Masuk',
  'Nama pada Undangan',
  'Nama Pengisi',
  'Kehadiran',
  'Ucapan dan Doa',
  'URL Undangan'
];

function doGet() {
  return jsonResponse_({ status: 'ok', service: 'Reservasi Tasyakuran Khitan' });
}

function doPost(e) {
  try {
    const payload = JSON.parse((e.postData && e.postData.contents) || '{}');

    // Honeypot: bot biasanya mengisi kolom tersembunyi ini.
    if (payload.website) return jsonResponse_({ success: true });

    const name = safeCell_(payload.name, 100);
    const attendance = safeCell_(payload.attendance, 50);
    const allowedAttendance = ['InsyaAllah hadir', 'Mohon maaf belum bisa hadir'];

    if (!name) throw new Error('Nama wajib diisi.');
    if (allowedAttendance.indexOf(attendance) === -1) {
      throw new Error('Status kehadiran tidak valid.');
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);

    try {
      const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      let sheet = spreadsheet.getSheetByName(SHEET_NAME);

      if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME);
      if (sheet.getLastRow() === 0) prepareSheet_(sheet);

      sheet.appendRow([
        new Date(),
        safeCell_(payload.invitedGuest, 100),
        name,
        attendance,
        safeCell_(payload.message, 500),
        safeCell_(payload.pageUrl, 500)
      ]);
    } finally {
      lock.releaseLock();
    }

    return jsonResponse_({ success: true });
  } catch (error) {
    return jsonResponse_({ success: false, message: error.message });
  }
}

function prepareSheet_(sheet) {
  sheet.appendRow(HEADERS);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, HEADERS.length)
    .setBackground('#083b34')
    .setFontColor('#ffffff')
    .setFontWeight('bold');
  sheet.getRange('A:A').setNumberFormat('dd mmm yyyy, HH:mm:ss');
  sheet.autoResizeColumns(1, HEADERS.length);
}

function safeCell_(value, maxLength) {
  let text = String(value || '').trim().slice(0, maxLength);
  if (/^[=+\-@]/.test(text)) text = "'" + text;
  return text;
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
