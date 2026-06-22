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
//  4. Set SENDER_NAME to the name shown in the "from" field
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
// RECIPIENT_EMAIL: leave empty → sends to the logged-in user (Session.getActiveUser()).
// Hardcode for testing: 'andrea.lupetti@zalando.de'
const RECIPIENT_EMAIL = '';
const SENDER_NAME     = 'The AI Enablement Team & Zally Coach';

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
      playerName : string   — reserved for future name-entry field
      totalScore : number   — cumulative score across all 4 levels
      timestamp  : string   — ISO date string
    }
  */
  try {
    const score   = payload.totalScore || 0;
    const ts      = payload.timestamp  || new Date().toISOString();
    const dateStr = Utilities.formatDate(
                      new Date(ts),
                      Session.getScriptTimeZone(),
                      'dd/MM/yyyy – HH:mm'
                    );

    const to = RECIPIENT_EMAIL || Session.getActiveUser().getEmail();
    if (!to) {
      Logger.log('No recipient email — skipping send.');
      return { ok: false, reason: 'no_recipient' };
    }

    const subject = '[Zally Metal] Challenge Recap & Cheat Sheet';

    GmailApp.sendEmail(to, subject, buildEmailText(score, dateStr), {
      htmlBody : buildEmailHtml(score, dateStr),
      name     : SENDER_NAME,
    });

    Logger.log('Email sent to ' + to + ' | score: ' + score);
    return { ok: true };

  } catch (err) {
    Logger.log('sendCompletionEmail error: ' + err);
    return { ok: false, reason: err.toString() };
  }
}

// ── HTML email — matches the Zally Adventure "Challenge Recap" style ────
function buildEmailHtml(score, dateStr) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Zally Metal – Challenge Recap & Cheat Sheet</title>
<style>
  body{margin:0;padding:20px 0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#333}
  .outer{max-width:620px;margin:0 auto}
  .card{background:#ffffff;border:1px solid #dddddd;border-radius:2px;padding:32px 40px 28px}
  .mission{font-family:'Courier New',Courier,monospace;font-size:26px;font-weight:bold;
           color:#E07820;text-align:center;letter-spacing:4px;margin:0 0 28px}
  p{margin:0 0 14px;line-height:1.65}
  .divider{border:none;border-top:1px solid #eeeeee;margin:22px 0}
  /* Challenge blocks — coloured left border */
  .ch{border-left:4px solid #ccc;padding:10px 14px;margin:16px 0;background:#fafafa}
  .ch.green {border-color:#4CAF50}
  .ch.blue  {border-color:#2196F3}
  .ch.orange{border-color:#FF9800}
  .ch-title{font-weight:bold;color:#333;margin:0 0 5px;font-size:14px}
  .ch-desc{margin:0 0 6px;color:#555}
  .takeaway{margin:0 0 6px;font-style:italic;color:#444}
  .takeaway strong{font-style:normal}
  /* Boss battle box */
  .boss{border:2px solid #FF5722;background:#fff8f5;padding:14px 16px;margin:16px 0;border-radius:2px}
  .boss-title{font-weight:bold;color:#FF5722;margin:0 0 5px;font-size:14px}
  /* Prompt cheat-sheet pill */
  .prompt-block{background:#f5f5f5;border-left:3px solid #aaa;padding:8px 12px;
                font-size:12px;color:#555;font-style:italic;margin-top:8px;line-height:1.55}
  .prompt-label{font-size:10px;font-weight:bold;letter-spacing:1px;color:#999;
                text-transform:uppercase;display:block;margin-bottom:3px;font-style:normal}
  /* Save CTA */
  .save{font-weight:bold;margin:22px 0 6px}
  .closing{color:#555;margin:18px 0 0}
  .sig{color:#666;font-style:italic}
  /* Score badge */
  .score-row{text-align:center;margin:18px 0}
  .score-badge{display:inline-block;border:1px solid #E07820;border-radius:2px;
               padding:6px 20px;font-size:12px;color:#E07820;letter-spacing:1px}
</style>
</head>
<body>
<div class="outer">
<div class="card">

  <!-- HEADER — emoji as numeric HTML entities (avoids GmailApp 4-byte UTF-8 corruption) -->
  <!-- &#127928; = 🎸  &#129304; = 🤘  &#127919; = 🎯  &#9889; = ⚡  &#127908; = 🎤  &#128293; = 🔥  &#128275; = 🔓  &#128377; = 🕹️ -->
  <p class="mission">&#127928; MISSION COMPLETE! &#127928;</p>

  <p>Hi there,</p>

  <p>You just shredded through all <strong>4 Lyria 3.5 challenges</strong> with Zally Metal
  and unlocked the complete prompt toolkit to create music with AI. Rock on. &#129304;</p>

  <p>Here is a recap of the <strong>Lyria 3.5</strong> skills you unlocked today:</p>

  <hr class="divider">

  <!-- CHALLENGE 1 -->
  <div class="ch green">
    <p class="ch-title">&#127919; Challenge 1: THE SOUND BLUEPRINT</p>
    <p class="ch-desc">You learned that vague prompts produce generic music.
    Specificity is everything — genre, BPM, era, instruments, and how they interact.</p>
    <p class="takeaway"><strong>Takeaway:</strong> <em>The more precise your prompt,
    the closer the output to your vision. A good Lyria prompt is a full creative brief,
    not a one-liner.</em></p>
    <div class="prompt-block">
      <span class="prompt-label">&#128275; Unlocked Prompt</span>
      "A synth-pop track in 80s style at 120 BPM, with bright synthesizers,
      a retro-futuristic atmosphere and a saxophone solo in the bridge."
    </div>
  </div>

  <!-- CHALLENGE 2 -->
  <div class="ch blue">
    <p class="ch-title">&#9889; Challenge 2: THE ENERGY FLOW</p>
    <p class="ch-desc">You learned how to control the temporal structure of a track.
    Lyria 3.5 understands timelines in seconds — you can tell it exactly when to drop.</p>
    <p class="takeaway"><strong>Takeaway:</strong> <em>Use structure tags
    ([Intro] → [Verse] → [Chorus]) and explicit timing ("Drop at 32 seconds")
    to engineer the energy curve of your track.</em></p>
    <div class="prompt-block">
      <span class="prompt-label">&#128275; Unlocked Prompt</span>
      [Intro] → Tense atmosphere, 8 seconds → [Verse 1] → Building energy →
      [Pre-Chorus] → Drop at 32 seconds → [Chorus] → Rhythmic explosion with synth lead.
    </div>
  </div>

  <!-- CHALLENGE 3 -->
  <div class="ch orange">
    <p class="ch-title">&#127908; Challenge 3: THE LYRIC INJECTION</p>
    <p class="ch-desc">You learned the correct syntax to inject lyrics into Lyria 3.5
    without confusing the model. Mixing instructions and lyrics is the #1 prompting mistake.</p>
    <p class="takeaway"><strong>Takeaway:</strong> <em>Always use the "Lyrics:" prefix
    to separate text from musical instructions. Use [Verse 1], [Chorus] section tags
    and () for backing vocals / echoes.</em></p>
    <div class="prompt-block">
      <span class="prompt-label">&#128275; Unlocked Prompt</span>
      Energetic synth-rock track, 120 BPM.<br>
      Lyrics:<br>
      [Verse 1] We move as one, the SOP is clear<br>
      [Chorus] YF&amp;K forever (YF&amp;K!) / We rise together (rise!)
    </div>
  </div>

  <!-- BOSS CHALLENGE 4 -->
  <div class="boss">
    <p class="boss-title">&#128293; BOSS CHALLENGE: THE VOCAL PERSONA</p>
    <p class="ch-desc">You mastered the human-in-the-loop workflow to define a precise
    vocal profile and test it rapidly — without burning your team's resources.</p>
    <p class="takeaway"><strong>Takeaway:</strong> <em>Specify exact timbre + style +
    range → iterate fast with <strong>lyria-3-clip-preview</strong> (30 sec clips) →
    go full <strong>lyria-3</strong> only when the vocal is right.
    Human in the Loop: always active.</em></p>
    <div class="prompt-block">
      <span class="prompt-label">&#128275; Unlocked Prompt</span>
      Vocal persona: Weathered Rocker (male), rough and raspy voice, grainy timbre,
      controlled vibrato.<br>
      Model: lyria-3-clip-preview → Quick 30-sec test → Refine vocal prompt
      → Final version: full lyria-3
    </div>
  </div>

  <hr class="divider">

  <!-- SCORE -->
  <div class="score-row">
    <span class="score-badge">Final Score: ${score.toLocaleString()} pts &nbsp;·&nbsp; ${dateStr}</span>
  </div>

  <hr class="divider">

  <p class="save">&#128377; Save this email as your personal Lyria 3.5 Cheat Sheet.</p>

  <p class="closing">See you at the next challenge!<br>
  <span class="sig">The AI Enablement Team &amp; Zally Coach</span></p>

</div>
</div>
</body>
</html>`;
}

// ── Plain-text fallback ─────────────────────────────────────────────────
function buildEmailText(score, dateStr) {
  return [
    '🎸 MISSION COMPLETE! 🎸',
    '════════════════════════════════════════',
    '',
    'Hi there,',
    '',
    'You just shredded through all 4 Lyria 3.5 challenges with Zally Metal!',
    '',
    '════════════════════════════════════════',
    '',
    '🎯 Challenge 1: THE SOUND BLUEPRINT',
    'Takeaway: Specificity is everything. Genre, BPM, era, instruments, interactions.',
    'Prompt: "A synth-pop track in 80s style at 120 BPM, with bright synthesizers,',
    'a retro-futuristic atmosphere and a saxophone solo in the bridge."',
    '',
    '⚡ Challenge 2: THE ENERGY FLOW',
    'Takeaway: Use structure tags + explicit timing to shape the energy curve.',
    'Prompt: [Intro] → Tense atmosphere, 8 seconds → Drop at 32 seconds → [Chorus]',
    '',
    '🎤 Challenge 3: THE LYRIC INJECTION',
    'Takeaway: Always use "Lyrics:" prefix + [Verse]/[Chorus] tags + () for echoes.',
    'Prompt: Energetic synth-rock, 120 BPM.',
    'Lyrics: [Verse 1] We move as one, the SOP is clear',
    '[Chorus] YF&K forever (YF&K!) / We rise together (rise!)',
    '',
    '🔥 BOSS CHALLENGE: THE VOCAL PERSONA',
    'Takeaway: Define timbre + style → test with lyria-3-clip-preview → go full lyria-3.',
    'Prompt: Vocal persona: Weathered Rocker (male), rough voice, grainy timbre.',
    'Model: lyria-3-clip-preview → test → refine → lyria-3 full version.',
    '',
    '════════════════════════════════════════',
    'Final Score: ' + score + ' pts  ·  ' + dateStr,
    '════════════════════════════════════════',
    '',
    '🕹️ Save this email as your personal Lyria 3.5 Cheat Sheet.',
    '',
    'See you at the next challenge!',
    'The AI Enablement Team & Zally Coach',
  ].join('\n');
}

// ── Helpers ─────────────────────────────────────────────────────────────
function getDriveImageUrl(fileId) {
  if (!fileId || fileId.startsWith('YOUR_')) return '';
  return 'https://lh3.googleusercontent.com/d/' + fileId;
}
