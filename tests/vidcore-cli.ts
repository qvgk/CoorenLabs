import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { vidcore } from '../src/providers/stream/vidcore/vidcore'; 
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { PORT } from '../src/core/config';

async function runTest() {
  const rl = readline.createInterface({ input, output });

  try {
    console.log("=========================================");
    console.log("      🎬 CoorenLabs Stream Test CLI 🎬   ");
    console.log("=========================================\n");

    let choice = await rl.question('Do you want to test a Movie or TV Series? (m/tv): ');
    choice = choice.trim().toLowerCase();

    let result: any;

    if (choice === 'm' || choice === 'movie') {
      const tmdbId = await rl.question('Enter TMDB ID (e.g., 550 for Fight Club): ');
      console.log(`\n[Test] Fetching Movie -> TMDB: ${tmdbId}...\n`);
      result = await vidcore.fetchMovie(tmdbId);
    } else if (choice === 'tv' || choice === 't') {
      const tmdbId = await rl.question('Enter TMDB ID (e.g., 1399 for Game of Thrones): ');
      const season = await rl.question('Enter Season Number (e.g., 1): ');
      const episode = await rl.question('Enter Episode Number (e.g., 1): ');
      console.log(`\n[Test] Fetching TV -> TMDB: ${tmdbId} | S${season} E${episode}...\n`);
      result = await vidcore.fetchTv(tmdbId, season, episode);
    } else {
      console.log('\n❌ Invalid input. Exiting.');
      process.exit(1);
    }

    console.log('\n=========================================');
    console.log('               TEST RESULT               ');
    console.log('=========================================');
    console.log(JSON.stringify(result, null, 2));

    if (result && result.sources && result.sources.length > 0) {
      
      const hostUrl = `http://localhost:${PORT || 3000}`;
      console.log(`\n▶️  Launching Cooren Cinematic Player with Sync Engine...`);

      const htmlContent = `
      <!DOCTYPE html>
      <html lang="en" class="dark">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>CoorenLabs Cinematic Player</title>
          
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <script src="https://cdn.tailwindcss.com"></script>
          <link rel="stylesheet" href="https://cdn.plyr.io/3.7.8/plyr.css" />
          
          <script>
            tailwind.config = {
              theme: {
                extend: {
                  fontFamily: { sans: ['Inter', 'sans-serif'] },
                  colors: { brand: '#e50914', dark: '#0f0f0f', panel: 'rgba(20, 20, 20, 0.95)' }
                }
              }
            }
          </script>

          <style>
              body { background: #000; overflow: hidden; margin: 0; }
              :root { --plyr-color-main: #e50914; --plyr-video-background: #000; }
              
              ::-webkit-scrollbar { width: 6px; }
              ::-webkit-scrollbar-track { background: transparent; }
              ::-webkit-scrollbar-thumb { background: #444; border-radius: 10px; }
              ::-webkit-scrollbar-thumb:hover { background: #666; }

              #sidePanel {
                  transform: translateX(100%);
                  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              }
              #sidePanel.open { transform: translateX(0); }

              .list-item { transition: all 0.2s; border-left: 3px solid transparent; }
              .list-item:hover { background: rgba(255,255,255,0.1); }
              .list-item.active { border-left-color: #e50914; background: rgba(229, 9, 20, 0.1); color: #fff; }
              
              #settingsBtn {
                  position: absolute; top: 20px; right: 20px; z-index: 50;
                  background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
                  transition: opacity 0.3s;
              }
              .plyr--hide-controls #settingsBtn { opacity: 0; pointer-events: none; }
          </style>
      </head>
      <body class="text-gray-300 h-screen w-screen relative">

          <div class="absolute inset-0 w-full h-full">
              <video id="player" playsinline crossorigin="anonymous"></video>
          </div>

          <button id="settingsBtn" class="p-3 rounded-full text-white hover:bg-white/20 hover:scale-105 transition-all cursor-pointer border border-white/10 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
          </button>

          <div id="sidePanel" class="absolute top-0 right-0 h-full w-80 bg-panel backdrop-blur-xl border-l border-white/10 z-[100] shadow-2xl flex flex-col">
              
              <div class="flex items-center justify-between p-5 border-b border-white/10">
                  <h2 class="text-lg font-semibold text-white tracking-wide">Stream Settings</h2>
                  <button id="closePanelBtn" class="text-gray-400 hover:text-white transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
              </div>

              <div class="flex-1 overflow-y-auto p-2">
                  
                  <div class="mb-4 mt-2">
                      <h3 class="px-3 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Video Sources</h3>
                      <ul id="serverList" class="flex flex-col gap-1"></ul>
                  </div>

                  <div class="mb-4 px-2">
                      <div class="p-3 bg-black/40 border border-white/5 rounded-lg">
                          <div class="flex justify-between items-center mb-3">
                              <span class="text-xs font-bold text-gray-400 uppercase">Sync Offset</span>
                              <span id="syncValue" class="text-xs text-brand font-mono font-bold">0.0s</span>
                          </div>
                          <div class="grid grid-cols-5 gap-1">
                              <button onclick="window.adjustSync(-500)" class="py-1.5 bg-white/5 hover:bg-white/10 rounded text-xs transition-colors">-0.5s</button>
                              <button onclick="window.adjustSync(-100)" class="py-1.5 bg-white/5 hover:bg-white/10 rounded text-xs transition-colors">-0.1s</button>
                              <button onclick="window.adjustSync(0)" class="py-1.5 bg-brand/20 hover:bg-brand text-brand hover:text-white border border-brand/30 rounded text-xs transition-colors">Reset</button>
                              <button onclick="window.adjustSync(100)" class="py-1.5 bg-white/5 hover:bg-white/10 rounded text-xs transition-colors">+0.1s</button>
                              <button onclick="window.adjustSync(500)" class="py-1.5 bg-white/5 hover:bg-white/10 rounded text-xs transition-colors">+0.5s</button>
                          </div>
                      </div>
                  </div>

                  <div>
                      <h3 class="px-3 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Subtitles</h3>
                      <ul id="subtitleList" class="flex flex-col gap-1">
                          <li class="list-item active cursor-pointer px-4 py-3 rounded-md text-sm font-medium" data-index="-1">
                              Off
                          </li>
                      </ul>
                  </div>

              </div>
          </div>

          <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
          <script src="https://cdn.plyr.io/3.7.8/plyr.polyfilled.js"></script>

          <script>
              const host = "${hostUrl}";
              const rawSources = ${JSON.stringify(result.sources || [])};
              const rawSubtitles = ${JSON.stringify(result.subtitles || [])};
              
              const video = document.getElementById('player');
              const serverList = document.getElementById('serverList');
              const subtitleList = document.getElementById('subtitleList');
              const sidePanel = document.getElementById('sidePanel');
              const syncValueEl = document.getElementById('syncValue');
              
              let hls = null;
              let player = null;
              let activeSubIndex = -1;
              let currentSyncMs = 0;
              let cachedSubTexts = {}; // Store raw text so we don't redownload

              // --- UI TOGGLES ---
              document.getElementById('settingsBtn').addEventListener('click', () => sidePanel.classList.add('open'));
              document.getElementById('closePanelBtn').addEventListener('click', () => sidePanel.classList.remove('open'));

              // --- SUBTITLE SYNC ENGINE ---
              
              function parseTimeStrToMs(timeStr) {
                  const parts = timeStr.split(/[:,.]/);
                  if (parts.length < 4) return 0;
                  const h = parseInt(parts[0], 10);
                  const m = parseInt(parts[1], 10);
                  const s = parseInt(parts[2], 10);
                  const ms = parseInt(parts[3], 10);
                  return (h * 3600000) + (m * 60000) + (s * 1000) + ms;
              }

              function formatMsToVttTime(ms) {
                  if (ms < 0) ms = 0; // Prevent negative time
                  const h = Math.floor(ms / 3600000);
                  ms %= 3600000;
                  const m = Math.floor(ms / 60000);
                  ms %= 60000;
                  const s = Math.floor(ms / 1000);
                  const mills = Math.floor(ms % 1000);
                  return \`\${String(h).padStart(2, '0')}:\${String(m).padStart(2, '0')}:\${String(s).padStart(2, '0')}.\${String(mills).padStart(3, '0')}\`;
              }

              // Converts raw SRT text into a perfectly synced WebVTT Blob URL
              function applySyncAndConvertToVtt(rawText, offsetMs) {
                  // Find all timestamps (00:00:00,000 or 00:00:00.000) and shift them
                  let newText = rawText.replace(/(\\d{2}:\\d{2}:\\d{2}[,.]\\d{3})/g, (match) => {
                      const timeMs = parseTimeStrToMs(match);
                      return formatMsToVttTime(timeMs + offsetMs);
                  });

                  // Ensure WEBVTT header exists
                  if (!newText.trim().startsWith('WEBVTT')) {
                      newText = 'WEBVTT\\n\\n' + newText;
                  }

                  const blob = new Blob([newText], { type: 'text/vtt' });
                  return URL.createObjectURL(blob);
              }

              // The function attached to the Sync Buttons
              window.adjustSync = function(msChange) {
                  if (activeSubIndex === -1) return; // No sub active
                  
                  if (msChange === 0) {
                      currentSyncMs = 0;
                  } else {
                      currentSyncMs += msChange;
                  }
                  
                  // Update UI Display
                  const sign = currentSyncMs > 0 ? '+' : '';
                  syncValueEl.textContent = \`\${sign}\${(currentSyncMs / 1000).toFixed(1)}s\`;

                  // Apply sync and hot-swap track
                  hotSwapSubtitleTrack(activeSubIndex);
              }

              async function hotSwapSubtitleTrack(index) {
                  if (index === -1) {
                      if (player) player.toggleCaptions(false);
                      return;
                  }

                  const sub = rawSubtitles[index];
                  let rawText = cachedSubTexts[index];

                  // Fetch raw text if we don't have it yet
                  if (!rawText) {
                      try {
                          const res = await fetch(sub.url);
                          rawText = await res.text();
                          cachedSubTexts[index] = rawText; // Cache it
                      } catch (e) {
                          console.error("Failed to fetch subtitle text for sync", e);
                          return;
                      }
                  }

                  // Generate new Blob with adjusted timestamps
                  const newVttUrl = applySyncAndConvertToVtt(rawText, currentSyncMs);

                  // Completely remove old tracks from DOM
                  const existingTracks = video.querySelectorAll('track');
                  existingTracks.forEach(t => t.remove());

                  // Inject new synced track
                  const track = document.createElement('track');
                  track.kind = 'captions';
                  track.label = sub.label || \`Track \${index + 1}\`;
                  track.srclang = (sub.label || 'en').substring(0, 2).toLowerCase();
                  track.src = newVttUrl;
                  track.default = true;
                  video.appendChild(track);

                  // Force video element to read the new track immediately
                  video.textTracks[0].mode = 'showing';
              }


              // --- INITIALIZE UI ---
              function bootUI() {
                  
                  // Build Subtitle UI List
                  rawSubtitles.forEach((sub, index) => {
                      const li = document.createElement('li');
                      li.className = 'list-item cursor-pointer px-4 py-3 rounded-md text-sm font-medium text-gray-400';
                      li.innerHTML = \`\${sub.label} <span class="text-xs text-gray-600 ml-2 uppercase">\${sub.format}</span>\`;
                      li.dataset.index = index;
                      
                      li.addEventListener('click', () => {
                          document.querySelectorAll('#subtitleList .list-item').forEach(el => el.classList.remove('active', 'text-white'));
                          li.classList.add('active', 'text-white');
                          
                          activeSubIndex = index;
                          currentSyncMs = 0; // Reset sync when changing tracks
                          syncValueEl.textContent = "0.0s";
                          
                          hotSwapSubtitleTrack(index);
                          if (player) player.toggleCaptions(true);
                      });
                      subtitleList.appendChild(li);
                  });

                  // Handle "Off" button
                  document.querySelector('[data-index="-1"]').addEventListener('click', function() {
                      document.querySelectorAll('#subtitleList .list-item').forEach(el => el.classList.remove('active', 'text-white'));
                      this.classList.add('active', 'text-white');
                      activeSubIndex = -1;
                      if (player) player.toggleCaptions(false);
                      
                      const existingTracks = video.querySelectorAll('track');
                      existingTracks.forEach(t => t.remove());
                  });

                  // Build Server UI
                  rawSources.forEach((src, idx) => {
                      const li = document.createElement('li');
                      li.className = 'list-item cursor-pointer px-4 py-3 rounded-md text-sm font-medium text-gray-400';
                      li.textContent = src.server || \`Server \${idx + 1}\`;
                      li.dataset.server = idx;
                      
                      li.addEventListener('click', () => {
                          const fullUrl = host + src.url;
                          loadStream(fullUrl, idx);
                          sidePanel.classList.remove('open');
                      });
                      serverList.appendChild(li);
                  });

                  // Load First Source
                  if (rawSources.length > 0) {
                      loadStream(host + rawSources[0].url, 0);
                  }
              }

              // --- PLAYER ENGINE ---
              function initPlyr() {
                  if (player) return;
                  player = new Plyr(video, {
                      captions: { active: true, update: true },
                      controls: ['play-large', 'play', 'progress', 'current-time', 'duration', 'mute', 'volume', 'fullscreen'],
                      keyboard: { focused: true, global: true }
                  });
              }

              function loadStream(url, index) {
                  if (hls) { hls.destroy(); }
                  
                  if (Hls.isSupported()) {
                      hls = new Hls({ maxMaxBufferLength: 100 });
                      hls.loadSource(url);
                      hls.attachMedia(video);
                      hls.on(Hls.Events.MANIFEST_PARSED, () => {
                          initPlyr();
                          video.play().catch(e => console.log("Autoplay blocked"));
                      });
                  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                      video.src = url;
                      initPlyr();
                      video.play();
                  }

                  document.querySelectorAll('#serverList .list-item').forEach(el => el.classList.remove('active', 'text-white'));
                  document.querySelector(\`[data-server="\${index}"]\`)?.classList.add('active', 'text-white');
              }

              // Start everything
              bootUI();
          </script>
      </body>
      </html>
      `;

      const htmlPath = path.resolve(__dirname, 'test-player.html');
      fs.writeFileSync(htmlPath, htmlContent);

      const startCmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
      exec(`${startCmd} file://${htmlPath}`);
      
      console.log("\n✅ Cinematic Video player opened in your web browser!");
    } else {
      console.log("\n❌ No playable sources found to launch.");
    }

  } catch (error) {
    console.error('\n❌ Test script encountered a critical error:', error);
  } finally {
    rl.close();
    setTimeout(() => {
      console.log("\n[Test] Shutting down background scraper processes...");
      process.exit(0);
    }, 2000);
  }
}

runTest();
