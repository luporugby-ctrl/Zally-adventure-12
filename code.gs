// ═══════════════════════════════════════════════════════
//  ZALLY METAL — Lyria 3.5 Training Game
//  Google Apps Script entry point
//
//  SETUP:
//  1. Upload zally_metal.png and zally_metal_jump.png to Drive
//  2. Right-click each file → Get Link → copy the file ID
//     (the ID is the long string in the URL after /d/ and before /view)
//  3. Paste both IDs below
//  4. Deploy → New Deployment → Web App → Execute as Me → Anyone
// ═══════════════════════════════════════════════════════

const IMAGE_IDS = {
  zallyMetal:     'YOUR_ZALLY_METAL_PNG_FILE_ID_HERE',
  zallyMetalJump: 'YOUR_ZALLY_METAL_JUMP_PNG_FILE_ID_HERE',
};

function doGet(e) {
  const template = HtmlService.createTemplateFromFile('index');
  template.zallyUrl     = getDriveImageUrl(IMAGE_IDS.zallyMetal);
  template.zallyJumpUrl = getDriveImageUrl(IMAGE_IDS.zallyMetalJump);
  return template.evaluate()
    .setTitle('ZALLY METAL – Lyria 3.5 Training Game')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

function getDriveImageUrl(fileId) {
  try {
    return DriveApp.getFileById(fileId).getDownloadUrl();
  } catch (err) {
    Logger.log('Image not found: ' + fileId);
    return '';
  }
}
