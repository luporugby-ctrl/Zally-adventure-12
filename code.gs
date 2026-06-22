// ═══════════════════════════════════════════════════════════════════════
//  ZALLY METAL — Lyria 3.5 Training Game  |  Google Apps Script
// ═══════════════════════════════════════════════════════════════════════
//
//  SETUP CHECKLIST
//  ───────────────
//  1. Upload zally_metal.png and zally_metal_jump.png to Google Drive
//  2. Right-click each file → "Get link" → copy the File ID
//     (the long string between /d/ and /view in the share URL)
//  3. Paste both IDs in IMAGE_IDS below
//  4. Set RECIPIENT_EMAIL (the player's email, or use a dynamic approach)
//  5. Deploy → New Deployment → Web App
//       • Execute as: Me
//       • Who has access: Anyone (or "Anyone in your organisation")
//  6. Copy the Web App URL and share with the team
//
// ═══════════════════════════════════════════════════════════════════════

// ── Google Drive image IDs ──────────────────────────────────────────────
const IMAGE_IDS = {
  zallyMetal:     'YOUR_ZALLY_METAL_PNG_FILE_ID_HERE',
  zallyMetalJump: 'YOUR_ZALLY_METAL_JUMP_PNG_FILE_ID_HERE',
};

// ── Email config ────────────────────────────────────────────────────────
// Leave RECIPIENT_EMAIL empty to send to the logged-in user (Session.getActiveUser()).
// Or hardcode an address for testing: 'team@example.com'
const RECIPIENT_EMAIL = '';

// ── Web App entry point ─────────────────────────────────────────────────
function doGet(e) {
  const template = HtmlService.createTemplateFromFile('index');
  template.zallyUrl     = getDriveImageUrl(IMAGE_IDS.zallyMetal);
  template.zallyJumpUrl = getDriveImageUrl(IMAGE_IDS.zallyMetalJump);
  return template.evaluate()
    .setTitle('ZALLY METAL — Lyria 3.5 Training Game')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

// ── Called by the client when the player completes all 4 levels ─────────
function sendCompletionEmail(payload) {
  /*
    payload (JSON from client):
    {
      playerName : string   — name entered by the player (future field)
      totalScore : number   — cumulative score across all 4 levels
      timestamp  : string   — ISO date string
    }
  */

  try {
    const score     = payload.totalScore  || 0;
    const player    = payload.playerName  || 'Rock Star';
    const ts        = payload.timestamp   || new Date().toISOString();
    const dateStr   = Utilities.formatDate(
                        new Date(ts),
                        Session.getScriptTimeZone(),
                        'dd/MM/yyyy – HH:mm'
                      );

    // Determine recipient
    const to = RECIPIENT_EMAIL || Session.getActiveUser().getEmail();
    if (!to) {
      Logger.log('No recipient email — skipping send.');
      return { ok: false, reason: 'no_recipient' };
    }

    const subject = '🎸 Zally Metal – Mission Complete! All 4 Lyria 3.5 Challenges Unlocked';

    const htmlBody = buildEmailHtml(player, score, dateStr);
    const textBody = buildEmailText(player, score, dateStr);

    GmailApp.sendEmail(to, subject, textBody, {
      htmlBody : htmlBody,
      name     : 'Zally Metal — YF&K Operations',
    });

    Logger.log('Email sent to ' + to + ' | score: ' + score);
    return { ok: true };

  } catch (err) {
    Logger.log('sendCompletionEmail error: ' + err);
    return { ok: false, reason: err.toString() };
  }
}

// ── HTML email body ─────────────────────────────────────────────────────
function buildEmailHtml(player, score, dateStr) {
  // ── PASTE YOUR HOUSE-STYLE HTML EMAIL TEMPLATE BELOW ──
  // Replace the placeholder content between the <body> tags with your
  // organisation's standard template.  The variables available are:
  //   {{PLAYER}}  → player name
  //   {{SCORE}}   → numeric final score
  //   {{DATE}}    → formatted completion date/time
  //
  // A minimal placeholder is provided so the function works out of the box.
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Zally Metal – Mission Complete</title>
  <style>
    body { margin:0; padding:0; background:#0a0a0a; font-family: Arial, Helvetica, sans-serif; color:#ffffff; }
    .wrapper { max-width:600px; margin:0 auto; background:#111111; border:1px solid #222; }
    .header  { background:#000000; padding:32px 24px 20px; text-align:center; border-bottom:3px solid #ccff00; }
    .header h1 { margin:0 0 4px; font-size:22px; letter-spacing:3px; color:#ccff00; text-transform:uppercase; }
    .header p  { margin:0; font-size:11px; color:#666; letter-spacing:2px; text-transform:uppercase; }
    .band    { background:#ccff00; height:4px; }
    .body    { padding:32px 24px; }
    .intro   { font-size:15px; line-height:1.7; color:#cccccc; margin-bottom:24px; }
    .score-box { background:#0d0d0d; border:2px solid #ccff00; border-radius:4px;
                 padding:20px 24px; text-align:center; margin:24px 0; }
    .score-box .label { font-size:10px; letter-spacing:3px; color:#888; text-transform:uppercase; margin-bottom:6px; }
    .score-box .value { font-size:36px; font-weight:bold; color:#ccff00; letter-spacing:2px; }
    .score-box .sub   { font-size:11px; color:#555; margin-top:6px; }
    .challenges { margin:24px 0; border-collapse:collapse; width:100%; }
    .challenges td { padding:10px 12px; font-size:12px; border-bottom:1px solid #222; }
    .challenges .num { color:#ccff00; font-weight:bold; width:32px; }
    .challenges .title { color:#fff; }
    .challenges .badge { color:#666; font-size:10px; text-align:right; }
    .cta { text-align:center; margin:32px 0 8px; }
    .cta a { display:inline-block; background:#ccff00; color:#000000; font-weight:bold;
              font-size:12px; letter-spacing:2px; text-transform:uppercase;
              padding:14px 36px; border-radius:3px; text-decoration:none; }
    .footer { padding:20px 24px 28px; text-align:center; border-top:1px solid #1a1a1a; }
    .footer p { margin:4px 0; font-size:11px; color:#444; }
    .footer .sig { color:#666; margin-top:12px; font-size:10px; letter-spacing:1px; }
  </style>
</head>
<body>
<div class="wrapper">

  <!-- HEADER -->
  <div class="header">
    <h1>🎸 Mission Complete</h1>
    <p>Zally Metal × YF&amp;K Operations — Lyria 3.5 Training</p>
  </div>
  <div class="band"></div>

  <!-- BODY -->
  <div class="body">

    <p class="intro">
      Hey <strong>${escapeHtml(player)}</strong>,<br><br>
      You just shredded through all <strong>4 Lyria 3.5 challenges</strong>
      with Zally Metal and unlocked the complete prompt toolkit for the YF&amp;K team anthem.
      Rock on. 🤘
    </p>

    <!-- SCORE -->
    <div class="score-box">
      <div class="label">Final Score</div>
      <div class="value">${score.toLocaleString()}</div>
      <div class="sub">Completed on ${dateStr}</div>
    </div>

    <!-- CHALLENGES UNLOCKED -->
    <p style="font-size:11px;color:#888;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">
      Challenges Unlocked
    </p>
    <table class="challenges">
      <tr>
        <td class="num">01</td>
        <td class="title">The Sound Blueprint</td>
        <td class="badge">Lyria 3.5 #1 — Specificity</td>
      </tr>
      <tr>
        <td class="num">02</td>
        <td class="title">The Energy Flow</td>
        <td class="badge">Lyria 3.5 #2 — Structure &amp; Timestamps</td>
      </tr>
      <tr>
        <td class="num">03</td>
        <td class="title">The Lyric Injection</td>
        <td class="badge">Lyria 3.5 #3 — Separation &amp; Tags</td>
      </tr>
      <tr>
        <td class="num">04</td>
        <td class="title">Boss Battle</td>
        <td class="badge">Lyria 3.5 #4 — Vocal Persona</td>
      </tr>
    </table>

    <!-- ── PASTE YOUR ADDITIONAL CONTENT / HOUSE-STYLE BLOCK HERE ── -->

    <div class="cta">
      <a href="https://deepmind.google/technologies/lyria/" target="_blank">
        Explore Lyria 3.5 →
      </a>
    </div>

  </div>

  <!-- FOOTER -->
  <div class="footer">
    <p>This message was generated automatically by the Zally Metal training game.</p>
    <p class="sig">YF&amp;K Operations — Human in the Loop · Always Active</p>
  </div>

</div>
</body>
</html>`;
}

// ── Plain-text fallback ─────────────────────────────────────────────────
function buildEmailText(player, score, dateStr) {
  return [
    '🎸 ZALLY METAL — MISSION COMPLETE',
    '══════════════════════════════════',
    '',
    'Hey ' + player + ',',
    '',
    'You just completed all 4 Lyria 3.5 challenges!',
    '',
    'Final Score : ' + score,
    'Completed   : ' + dateStr,
    '',
    'CHALLENGES UNLOCKED',
    '───────────────────',
    '01 The Sound Blueprint      — Lyria 3.5 #1: Specificity',
    '02 The Energy Flow          — Lyria 3.5 #2: Structure & Timestamps',
    '03 The Lyric Injection      — Lyria 3.5 #3: Separation & Tags',
    '04 Boss Battle              — Lyria 3.5 #4: Vocal Persona',
    '',
    '──────────────────────────────────────',
    'YF&K Operations — Human in the Loop',
  ].join('\n');
}

// ── Helpers ─────────────────────────────────────────────────────────────
function getDriveImageUrl(fileId) {
  try {
    return DriveApp.getFileById(fileId).getDownloadUrl();
  } catch (err) {
    Logger.log('Image not found: ' + fileId);
    return '';
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
