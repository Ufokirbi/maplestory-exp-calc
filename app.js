/* ==========================================================================
   MapleStory Idle — EXP Calculator, Print Screen KPM Scanner & Progress Logger
   ========================================================================== */

// --- 1. EXP TABLE DATABASE (Lv 1 to 140) ---
const EXP_TABLE = {};

function generateExpTable() {
  let baseExp = 100;
  for (let lvl = 1; lvl <= 140; lvl++) {
    if (lvl === 1) baseExp = 100;
    else if (lvl <= 50) baseExp = Math.round(baseExp * 1.22);
    else if (lvl <= 90) baseExp = Math.round(baseExp * 1.25);
    else if (lvl < 113) baseExp = Math.round(baseExp * 1.275);
    else if (lvl === 113) baseExp = 19992310000000000; // Exact sheet match
    else baseExp = Math.round(baseExp * 1.30);

    EXP_TABLE[lvl] = baseExp;
  }
}
generateExpTable();

function formatExp(num) {
  if (num === 0 || !num) return "0.00";
  const abs = Math.abs(num);
  if (abs >= 1e15) return (num / 1e15).toFixed(2) + " Qa";
  if (abs >= 1e12) return (num / 1e12).toFixed(2) + " T";
  if (abs >= 1e9) return (num / 1e9).toFixed(2) + " B";
  if (abs >= 1e6) return (num / 1e6).toFixed(2) + " M";
  if (abs >= 1e3) return (num / 1e3).toFixed(2) + " K";
  return num.toFixed(2);
}

function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(Math.round(num));
}

function showToast(message, isError = false) {
  const banner = document.getElementById('toastBanner');
  const msgEl = document.getElementById('toastMessage');
  const iconEl = document.getElementById('toastIcon');
  if (!banner || !msgEl) return;

  msgEl.innerText = message;
  iconEl.className = isError
    ? "fa-solid fa-circle-exclamation text-rose-400 text-base"
    : "fa-solid fa-circle-check text-emerald-400 text-base";

  banner.classList.remove('hidden');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => banner.classList.add('hidden'), 3500);
}

// --- 2. STATE & STORAGE MANAGEMENT ---
const DEFAULT_STATE = {
  currentLevel: 113,
  currentExpPercent: 21.62,
  targetLevel: 114,
  expPerKill: 2.26,
  expUnit: 1e9,
  onlineKpm: 114,
  offlineKpm: 54,
  dungeonPercent: 1.07,
  mpePercent: 2.50,
  mpeRuns: 2,
  buffCoupon: 0.0,
  buffGuild: 36.0,
  buffHeroPage: 45.5,
  buffHeroTrail: 3.0,
  buffAdFree: 5.0,
  buffAbility: 0.0,
  onlineHours: 24,
  adBoosterActive: true,
  anniversaryActive: true,
  startDate: new Date().toISOString().split('T')[0],
  logs: []
};

function getState() {
  const saved = localStorage.getItem('maple_idle_exp_state_v2');
  if (saved) {
    try { return { ...DEFAULT_STATE, ...JSON.parse(saved) }; }
    catch (e) { return DEFAULT_STATE; }
  }
  return DEFAULT_STATE;
}

function saveState(state) {
  localStorage.setItem('maple_idle_exp_state_v2', JSON.stringify(state));
}

function getTotalTargetExp(currLevel, currExpPct, tgtLevel) {
  if (tgtLevel <= currLevel) {
    return { totalNeeded: 0, currLevelReq: EXP_TABLE[currLevel] || 19992310000000000, currEarned: 0 };
  }

  const currLevelReq = EXP_TABLE[currLevel] || 19992310000000000;
  const currEarned = currLevelReq * (currExpPct / 100);
  let totalNeeded = currLevelReq - currEarned;

  for (let l = currLevel + 1; l < tgtLevel; l++) {
    totalNeeded += (EXP_TABLE[l] || (currLevelReq * 1.3));
  }

  return { totalNeeded, currLevelReq, currEarned };
}

// --- 3. CORE CALCULATIONS ---
function calculateAll() {
  const getVal = (id, fallback) => {
    const el = document.getElementById(id);
    return el ? (parseFloat(el.value) || fallback) : fallback;
  };

  const getCheck = (id, fallback) => {
    const el = document.getElementById(id);
    return el ? el.checked : fallback;
  };

  const currentLevel = parseInt(getVal('inputCurrentLevel', 113));
  const currentExpPercent = getVal('inputCurrentExpPercent', 21.62);
  const targetLevel = parseInt(getVal('inputTargetLevel', currentLevel + 1));
  const expPerKillVal = getVal('inputExpPerKill', 2.26);
  const expUnitMult = getVal('inputExpUnit', 1e9);
  const onlineKpm = getVal('inputOnlineKpm', 114);
  const offlineKpm = getVal('inputOfflineKpm', 54);
  const dungeonPercent = getVal('inputDungeonPercent', 1.07);
  const mpePercent = getVal('inputMpePercent', 2.50);
  const mpeRuns = getVal('inputMpeRuns', 2);

  const bCoupon = getVal('buffCoupon', 0.0);
  const bGuild = getVal('buffGuild', 36.0);
  const bHeroPage = getVal('buffHeroPage', 45.5);
  const bHeroTrail = getVal('buffHeroTrail', 3.0);
  const bAdFree = getVal('buffAdFree', 5.0);
  const bAbility = getVal('buffAbility', 0.0);

  const onlineHours = getVal('inputOnlineHours', 24);
  const offlineHours = Math.max(0, 24 - onlineHours);

  const adBoosterActive = getCheck('toggleAdBooster', true);
  const anniversaryActive = getCheck('toggleAnniversary', true);

  const totalPassivePct = bCoupon + bGuild + bHeroPage + bHeroTrail + bAdFree + bAbility;
  const passiveMult = 1 + (totalPassivePct / 100);

  const rawExpPerKill = expPerKillVal * expUnitMult;
  const baseExpMin = onlineKpm * rawExpPerKill;
  const baseExpHr = baseExpMin * 60;

  const buffedExpMin = baseExpMin * passiveMult;
  const buffedExpHr = baseExpHr * passiveMult;

  const offlineBaseExpMin = offlineKpm * rawExpPerKill;
  const offlineBuffedExpHr = (offlineBaseExpMin * passiveMult) * 60;

  const dailyGrindExp = (onlineHours * buffedExpHr) + (offlineHours * offlineBuffedExpHr);

  const { totalNeeded: expNeeded, currLevelReq: levelExpReq, currEarned: expEarned } = getTotalTargetExp(currentLevel, currentExpPercent, targetLevel);
  const killsNeeded = Math.ceil(expNeeded / (rawExpPerKill * passiveMult));

  const dungeonDailyExp = levelExpReq * (dungeonPercent / 100);
  const mpeDailyExp = levelExpReq * (mpePercent / 100) * (mpeRuns / 7);
  const adBoosterDailyExp = adBoosterActive ? (baseExpMin * 1.107 * 20) : 0;
  const annivDailyExp = anniversaryActive ? (buffedExpHr * 10) : 0;

  const combinedDailyExp = dailyGrindExp + dungeonDailyExp + mpeDailyExp + adBoosterDailyExp + annivDailyExp;

  const pureDailyPct = (dailyGrindExp / levelExpReq) * 100;
  const combinedDailyPct = (combinedDailyExp / levelExpReq) * 100;

  const pureEtaDays = dailyGrindExp > 0 ? (expNeeded / dailyGrindExp) : 999;
  const combinedEtaDays = combinedDailyExp > 0 ? (expNeeded / combinedDailyExp) : 999;
  const timeSavedDays = Math.max(0, pureEtaDays - combinedEtaDays);

  const setText = (id, text) => { const el = document.getElementById(id); if (el) el.innerText = text; };
  const setStyle = (id, prop, val) => { const el = document.getElementById(id); if (el) el.style[prop] = val; };
  const setHTML = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };

  setText('currentExpPercentDisplay', currentExpPercent.toFixed(2) + "%");
  setText('scanRefLevel', currentLevel);
  setText('heroLevelSpan', `Lv. ${currentLevel} ➔ ${targetLevel}`);
  setText('heroCurrentExpPercent', currentExpPercent.toFixed(2) + "%");
  setText('heroExpRatio', `${formatExp(expEarned)} / ${formatExp(levelExpReq)}`);
  setStyle('heroProgressBar', 'width', Math.min(100, currentExpPercent) + "%");
  setText('heroExpNeeded', formatExp(expNeeded));

  setText('heroPureEtaDays', formatDaysToHMS(pureEtaDays));
  setText('heroPureDailyGain', `+${pureDailyPct.toFixed(2)}%/day`);
  setText('heroPureTargetDate', calculateTargetDate(pureEtaDays));
  setText('heroDailyGrindYield', formatExp(dailyGrindExp));

  setText('heroCombinedEtaDays', formatDaysToHMS(combinedEtaDays));
  setText('heroCombinedTargetDate', calculateTargetDate(combinedEtaDays));
  setText('heroCombinedDailyYield', `${formatExp(combinedDailyExp)}/day`);
  setText('heroTimeSavedBadge', `⚡ -${timeSavedDays.toFixed(1)} days`);

  setText('calcBaseExpMin', formatExp(baseExpMin));
  setText('calcBaseExpHr', formatExp(baseExpHr));
  setText('calcPassiveMult', `${passiveMult.toFixed(3)}x`);
  setText('calcPassivePercent', `+${totalPassivePct.toFixed(1)}% Passives`);
  setText('calcBuffedExpHr', formatExp(buffedExpHr));
  setText('calcBuffedExpMin', `${formatExp(buffedExpMin)} / min`);

  setText('levelReqRaw', `${formatNumber(levelExpReq)} EXP`);
  setText('metricLevelExpReq', formatExp(expNeeded));
  setText('metricExpEarned', formatExp(expEarned));
  setText('metricKillsNeeded', formatNumber(killsNeeded));

  setHTML('metricDailyGrind', `${formatExp(dailyGrindExp)} <span class="text-[10px] text-slate-400">(+${pureDailyPct.toFixed(2)}%/d)</span>`);
  setHTML('metricDailyDungeon', `${formatExp(dungeonDailyExp)} <span class="text-[10px] text-slate-400">(+${dungeonPercent.toFixed(2)}%/d)</span>`);
  setHTML('metricDailyMpe', `${formatExp(mpeDailyExp)} <span class="text-[10px] text-slate-400">(+${((mpePercent * mpeRuns) / 7).toFixed(2)}%/d)</span>`);
  setHTML('metricDailyAdBooster', `${formatExp(adBoosterDailyExp)} <span class="text-[10px] text-slate-400">(+${((adBoosterDailyExp / levelExpReq) * 100).toFixed(2)}%/d)</span>`);
  setHTML('metricDailyAnniv', `${formatExp(annivDailyExp)} <span class="text-[10px] text-slate-400">(+${((annivDailyExp / levelExpReq) * 100).toFixed(2)}%/d)</span>`);
  setHTML('metricCombinedDaily', `${formatExp(combinedDailyExp)} <span class="text-xs text-emerald-400">(+${combinedDailyPct.toFixed(2)}%/d)</span>`);

  setText('passiveSummaryBadge', `+${totalPassivePct.toFixed(1)}% (${passiveMult.toFixed(3)}x)`);

  renderTimeline(currentExpPercent, pureDailyPct, combinedDailyPct);
  renderLoggerAndChart(combinedDailyPct, pureDailyPct);
  computeScannedKpm();

  const state = getState();
  saveState({
    ...state,
    currentLevel, currentExpPercent, targetLevel, expPerKill: expPerKillVal, expUnit: expUnitMult,
    onlineKpm, offlineKpm, dungeonPercent, mpePercent, mpeRuns,
    buffCoupon: bCoupon, buffGuild: bGuild, buffHeroPage: bHeroPage, buffHeroTrail: bHeroTrail,
    buffAdFree: bAdFree, buffAbility: bAbility, onlineHours,
    adBoosterActive, anniversaryActive,
    startDate: document.getElementById('startDateInput') ? document.getElementById('startDateInput').value : state.startDate
  });
}

// --- 4. PRINT SCREEN KPM & EXP SCANNER (OCR + PASTE) ---
let kpmCalcMode = 'kills';
let latestCalculatedKpm = null;

function openScreenshotModal() {
  switchTab('scanner');
}

function setKpmCalcMode(mode) {
  kpmCalcMode = mode;
  const killsBtn = document.getElementById('kpmModeKillsBtn');
  const expBtn = document.getElementById('kpmModeExpBtn');
  const killsDiv = document.getElementById('kpmMethodKills');
  const expDiv = document.getElementById('kpmMethodExpDiff');

  if (mode === 'kills') {
    killsBtn.className = "py-2 px-3 rounded-lg bg-indigo-600 text-white font-bold transition";
    expBtn.className = "py-2 px-3 rounded-lg text-slate-400 hover:text-white font-medium transition";
    killsDiv.classList.remove('hidden');
    expDiv.classList.add('hidden');
  } else {
    expBtn.className = "py-2 px-3 rounded-lg bg-indigo-600 text-white font-bold transition";
    killsBtn.className = "py-2 px-3 rounded-lg text-slate-400 hover:text-white font-medium transition";
    expDiv.classList.remove('hidden');
    killsDiv.classList.add('hidden');
  }
  computeScannedKpm();
}

// Listen for Ctrl+V Print Screen paste anywhere on the page
document.addEventListener('paste', function (event) {
  const items = (event.clipboardData || event.originalEvent.clipboardData).items;
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf('image') !== -1) {
      const blob = items[i].getAsFile();
      switchTab('scanner');
      processScreenshotBlob(blob);
      break;
    }
  }
});

function handleScreenshotFile(event) {
  const file = event.target.files[0];
  if (file) processScreenshotBlob(file);
}

async function processScreenshotBlob(blob) {
  const previewImg = document.getElementById('screenshotPreviewImg');
  const placeholder = document.getElementById('dropZonePlaceholder');
  const statusBox = document.getElementById('ocrStatusBox');
  const statusText = document.getElementById('ocrStatusText');
  const progressPct = document.getElementById('ocrProgressPct');
  const progressBar = document.getElementById('ocrProgressBar');
  const rawTextEl = document.getElementById('ocrRawText');
  const spinner = document.getElementById('ocrSpinner');

  // Show preview
  const url = URL.createObjectURL(blob);
  previewImg.src = url;
  previewImg.classList.remove('hidden');
  placeholder.classList.add('hidden');
  statusBox.classList.remove('hidden');
  spinner.className = "fa-solid fa-spinner fa-spin text-indigo-400";
  statusText.innerText = "Running OCR on your Print Screen...";

  try {
    if (typeof Tesseract === 'undefined') {
      statusText.innerText = "OCR library offline — enter the numbers from your screenshot on the right.";
      spinner.className = "fa-solid fa-circle-info text-amber-400";
      return;
    }

    const result = await Tesseract.recognize(blob, 'eng', {
      logger: m => {
        if (m.status === 'recognizing text') {
          const pct = Math.round(m.progress * 100);
          progressPct.innerText = pct + "%";
          progressBar.style.width = pct + "%";
        }
      }
    });

    const text = result.data.text || "";
    rawTextEl.innerText = text.trim() || "(No readable text detected — try cropping closer to the numbers)";
    spinner.className = "fa-solid fa-circle-check text-emerald-400";
    statusText.innerText = "Scan complete! Verify extracted numbers on the right.";

    extractNumbersFromOcr(text);
  } catch (err) {
    console.error("OCR error:", err);
    spinner.className = "fa-solid fa-triangle-exclamation text-amber-400";
    statusText.innerText = "Could not auto-read image. Enter numbers manually on the right.";
  }
}

function extractNumbersFromOcr(text) {
  // Look for patterns like "Kill: 1,240" or "Defeated: 540" or "21.62%" or "10 min"
  const killMatch = text.match(/(?:kill|killed|defeat|defeated|monster|mob)s?[:\s-]*([\d,]+)/i);
  const minMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:min|minute|m\b)/i);
  const pctMatches = [...text.matchAll(/(\d{1,2}\.\d{1,3})\s*%/g)].map(m => parseFloat(m[1]));

  if (killMatch) {
    const kills = parseInt(killMatch[1].replace(/,/g, ''), 10);
    if (!isNaN(kills) && kills > 0) {
      document.getElementById('scanTotalKills').value = kills;
      setKpmCalcMode('kills');
      showToast(`Detected ${formatNumber(kills)} kills from screenshot!`);
    }
  }

  if (minMatch) {
    const mins = parseFloat(minMatch[1]);
    if (!isNaN(mins) && mins > 0) {
      document.getElementById('scanDurationMin').value = mins;
      document.getElementById('scanExpMinutes').value = mins;
    }
  }

  // If no kill count found, check if EXP % values were detected
  if (!killMatch && pctMatches.length > 0) {
    const startInput = document.getElementById('scanStartExpPct');
    const endInput = document.getElementById('scanEndExpPct');

    if (!startInput.value) {
      startInput.value = pctMatches[0];
      setKpmCalcMode('expdiff');
      showToast(`Detected Print 1 EXP: ${pctMatches[0]}%. Now paste Print 2!`);
    } else {
      endInput.value = pctMatches[0];
      setKpmCalcMode('expdiff');
      showToast(`Detected Print 2 EXP: ${pctMatches[0]}%! KPM calculated.`);
    }
  }

  computeScannedKpm();
}

function computeScannedKpm() {
  const resultEl = document.getElementById('scannedKpmResult');
  const expHrEl = document.getElementById('scannedExpHrResult');
  if (!resultEl) return;

  const expPerKillVal = parseFloat(document.getElementById('inputExpPerKill')?.value) || 2.26;
  const expUnitMult = parseFloat(document.getElementById('inputExpUnit')?.value) || 1e9;
  const rawExpPerKill = expPerKillVal * expUnitMult;

  const bCoupon = parseFloat(document.getElementById('buffCoupon')?.value) || 0;
  const bGuild = parseFloat(document.getElementById('buffGuild')?.value) || 0;
  const bHeroPage = parseFloat(document.getElementById('buffHeroPage')?.value) || 0;
  const bHeroTrail = parseFloat(document.getElementById('buffHeroTrail')?.value) || 0;
  const bAdFree = parseFloat(document.getElementById('buffAdFree')?.value) || 0;
  const bAbility = parseFloat(document.getElementById('buffAbility')?.value) || 0;
  const passiveMult = 1 + ((bCoupon + bGuild + bHeroPage + bHeroTrail + bAdFree + bAbility) / 100);

  let kpm = 0;

  if (kpmCalcMode === 'kills') {
    const kills = parseFloat(document.getElementById('scanTotalKills')?.value) || 0;
    const mins = parseFloat(document.getElementById('scanDurationMin')?.value) || 0;
    if (kills > 0 && mins > 0) {
      kpm = kills / mins;
    }
  } else {
    const p1 = parseFloat(document.getElementById('scanStartExpPct')?.value);
    const p2 = parseFloat(document.getElementById('scanEndExpPct')?.value);
    const mins = parseFloat(document.getElementById('scanExpMinutes')?.value) || 0;
    const currLvl = parseInt(document.getElementById('inputCurrentLevel')?.value) || 113;
    const levelExpReq = EXP_TABLE[currLvl] || 19992310000000000;

    if (!isNaN(p1) && !isNaN(p2) && p2 > p1 && mins > 0) {
      const pctGain = p2 - p1;
      const expGained = levelExpReq * (pctGain / 100);
      const expPerMin = expGained / mins;
      kpm = expPerMin / (rawExpPerKill * passiveMult);
    }
  }

  if (kpm > 0) {
    latestCalculatedKpm = Math.round(kpm * 10) / 10;
    const buffedExpHr = latestCalculatedKpm * rawExpPerKill * passiveMult * 60;
    resultEl.innerText = `${latestCalculatedKpm} KPM`;
    expHrEl.innerText = `Buffed EXP/hr: ${formatExp(buffedExpHr)}`;
  } else {
    latestCalculatedKpm = null;
    resultEl.innerText = "-- KPM";
    expHrEl.innerText = "Buffed EXP/hr: --";
  }
}

function applyScannedKpm(target) {
  if (!latestCalculatedKpm || latestCalculatedKpm <= 0) {
    showToast("Enter valid kills/time or 2 EXP % prints first!", true);
    return;
  }
  const roundedKpm = Math.round(latestCalculatedKpm);
  if (target === 'online') {
    document.getElementById('inputOnlineKpm').value = roundedKpm;
    showToast(`Updated Online KPM to ${roundedKpm}!`);
  } else {
    document.getElementById('inputOfflineKpm').value = roundedKpm;
    showToast(`Updated Offline KPM to ${roundedKpm}!`);
  }
  calculateAll();
  switchTab('calc');
}

// --- 5. PROGRESS LOGGER & CHART RENDERER ---
function renderLoggerAndChart(projectedCombinedPctDay, projectedPurePctDay) {
  const state = getState();
  const logs = state.logs || [];

  logs.sort((a, b) => new Date(a.date) - new Date(b.date));

  const badge = document.getElementById('loggerTabBadge');
  const header = document.getElementById('logCountHeader');
  if (badge) badge.innerText = `${logs.length} logs`;
  if (header) header.innerText = `${logs.length} Check-In Entries`;

  const tbody = document.getElementById('logHistoryTableBody');
  if (tbody) {
    tbody.innerHTML = '';
    if (logs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="py-6 text-center text-slate-500 italic">No check-in entries logged yet. Click "Load 5-Day Sample Data" or use the form above to add your daily EXP progress.</td></tr>`;
    } else {
      logs.forEach((log, index) => {
        const prev = logs[index - 1];
        let gainStr = "--";
        let statusBadge = `<span class="text-slate-500">-</span>`;

        if (prev) {
          const dayDiff = Math.max(1, (new Date(log.date) - new Date(prev.date)) / (1000 * 3600 * 24));
          const expDiff = (log.level * 100 + log.expPercent) - (prev.level * 100 + prev.expPercent);
          const dailyRate = expDiff / dayDiff;
          gainStr = `+${dailyRate.toFixed(2)}%/d`;

          if (dailyRate >= projectedCombinedPctDay) {
            statusBadge = `<span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">🔥 Ahead (${(dailyRate - projectedCombinedPctDay).toFixed(2)}%/d)</span>`;
          } else if (dailyRate >= projectedPurePctDay) {
            statusBadge = `<span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">⚡ On Track</span>`;
          } else {
            statusBadge = `<span class="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-semibold border border-rose-500/30">🔻 Slow</span>`;
          }
        } else {
          statusBadge = `<span class="px-2 py-0.5 rounded bg-slate-800 text-slate-400">Baseline Start</span>`;
        }

        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-800/40";
        tr.innerHTML = `
          <td class="py-2.5 px-3 font-semibold text-slate-200">${log.date}</td>
          <td class="py-2.5 px-3 text-amber-400">Lv. ${log.level}</td>
          <td class="py-2.5 px-3 text-right font-bold text-emerald-400">${log.expPercent.toFixed(2)}%</td>
          <td class="py-2.5 px-3 text-right font-bold text-white">${gainStr}</td>
          <td class="py-2.5 px-3 text-center">${statusBadge}</td>
          <td class="py-2.5 px-3 text-slate-400 truncate max-w-[150px]">${log.note || '-'}</td>
          <td class="py-2.5 px-3 text-center">
            <button onclick="deleteLog('${log.id}')" class="text-rose-400 hover:text-rose-300 p-1 transition"><i class="fa-solid fa-trash-can"></i></button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }
  }

  if (logs.length >= 2) {
    const first = logs[0];
    const last = logs[logs.length - 1];
    const daysSpan = Math.max(1, (new Date(last.date) - new Date(first.date)) / (1000 * 3600 * 24));
    const totalPctGained = (last.level * 100 + last.expPercent) - (first.level * 100 + first.expPercent);
    const actualVelocity = totalPctGained / daysSpan;

    document.getElementById('kpiActualVelocity').innerText = `+${actualVelocity.toFixed(2)}%/day`;
    document.getElementById('kpiProjectedVelocity').innerText = `Goal: +${projectedCombinedPctDay.toFixed(2)}%/day`;

    const diffVsGoal = actualVelocity - projectedCombinedPctDay;
    const kpiPaceBadge = document.getElementById('kpiPaceBadge');
    if (kpiPaceBadge) {
      if (diffVsGoal >= 0) {
        kpiPaceBadge.className = "text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";
        kpiPaceBadge.innerText = `+${diffVsGoal.toFixed(2)}%/d Ahead`;
      } else {
        kpiPaceBadge.className = "text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30";
        kpiPaceBadge.innerText = `${diffVsGoal.toFixed(2)}%/d Behind`;
      }
    }

    const currExpEl = document.getElementById('inputCurrentExpPercent');
    const currExp = currExpEl ? (parseFloat(currExpEl.value) || 0) : 0;
    const remPct = 100 - currExp;
    const remainingDays = actualVelocity > 0 ? (remPct / actualVelocity) : 999;
    document.getElementById('kpiLoggedEtaDate').innerText = calculateTargetDate(remainingDays);
  } else {
    document.getElementById('kpiActualVelocity').innerText = "0.00%/day";
    const kpiBadge = document.getElementById('kpiPaceBadge');
    if (kpiBadge) kpiBadge.innerText = "Needs 2+ Logs";
    document.getElementById('kpiLoggedEtaDate').innerText = "--";
  }

  renderSvgChart(logs, projectedCombinedPctDay, projectedPurePctDay);
}

function renderSvgChart(logs, combinedDailyPct, pureDailyPct) {
  const svg = document.getElementById('progressSvgChart');
  if (!svg) return;

  const width = 800;
  const height = 300;
  const padL = 45;
  const padR = 25;
  const padT = 25;
  const padB = 40;

  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  let html = '';

  const steps = [0, 25, 50, 75, 100];
  steps.forEach(pct => {
    const y = padT + plotH - (pct / 100) * plotH;
    html += `<line x1="${padL}" y1="${y}" x2="${width - padR}" y2="${y}" stroke="#1e293b" stroke-dasharray="3,3" stroke-width="1"/>`;
    html += `<text x="${padL - 8}" y="${y + 4}" fill="#64748b" font-size="10" text-anchor="end" font-family="JetBrains Mono">${pct}%</text>`;
  });

  const totalDays = 14;
  const currExpEl = document.getElementById('inputCurrentExpPercent');
  const startExp = currExpEl ? (parseFloat(currExpEl.value) || 21.62) : 21.62;

  let combinedPoints = '';
  for (let d = 0; d <= totalDays; d++) {
    const x = padL + (d / totalDays) * plotW;
    const val = Math.min(100, startExp + (d * combinedDailyPct));
    const y = padT + plotH - (val / 100) * plotH;
    combinedPoints += `${d === 0 ? 'M' : 'L'} ${x} ${y} `;
  }
  html += `<path d="${combinedPoints}" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4,4" opacity="0.75"/>`;

  let purePoints = '';
  for (let d = 0; d <= totalDays; d++) {
    const x = padL + (d / totalDays) * plotW;
    const val = Math.min(100, startExp + (d * pureDailyPct));
    const y = padT + plotH - (val / 100) * plotH;
    purePoints += `${d === 0 ? 'M' : 'L'} ${x} ${y} `;
  }
  html += `<path d="${purePoints}" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="2,2" opacity="0.5"/>`;

  if (logs.length > 0) {
    const firstDate = new Date(logs[0].date);
    let actualPoints = '';
    const nodeCoords = [];

    logs.forEach((log, index) => {
      const dDiff = Math.max(0, (new Date(log.date) - firstDate) / (1000 * 3600 * 24));
      const x = padL + Math.min(plotW, (dDiff / totalDays) * plotW);
      const y = padT + plotH - (Math.min(100, log.expPercent) / 100) * plotH;

      actualPoints += `${index === 0 ? 'M' : 'L'} ${x} ${y} `;
      nodeCoords.push({ x, y, log });
    });

    const areaPoints = `${actualPoints} L ${nodeCoords[nodeCoords.length - 1].x} ${padT + plotH} L ${padL} ${padT + plotH} Z`;
    html += `
      <defs>
        <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#10b981" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#10b981" stop-opacity="0.0"/>
        </linearGradient>
      </defs>
      <path d="${areaPoints}" fill="url(#emeraldGrad)" />
      <path d="${actualPoints}" fill="none" stroke="#10b981" stroke-width="3" class="chart-line" />
    `;

    nodeCoords.forEach(node => {
      html += `
        <circle cx="${node.x}" cy="${node.y}" r="5" fill="#10b981" stroke="#0b0f19" stroke-width="2" class="cursor-pointer transition-all"
          onmouseenter="showChartTooltip(event, '${node.log.date}', ${node.log.level}, ${node.log.expPercent}, '${(node.log.note || '').replace(/'/g, "\\'")}')"
          onmouseleave="hideChartTooltip()" />
      `;
    });
  }

  for (let d = 0; d <= totalDays; d += 2) {
    const x = padL + (d / totalDays) * plotW;
    html += `<text x="${x}" y="${height - 10}" fill="#64748b" font-size="10" text-anchor="middle" font-family="JetBrains Mono">Day +${d}</text>`;
  }

  svg.innerHTML = html;
}

function showChartTooltip(e, date, level, exp, note) {
  const tooltip = document.getElementById('chartTooltip');
  if (!tooltip) return;

  const container = document.getElementById('chartContainer');
  const rect = container.getBoundingClientRect();

  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  tooltip.style.left = `${Math.min(rect.width - 150, x + 10)}px`;
  tooltip.style.top = `${Math.max(10, y - 50)}px`;
  tooltip.innerHTML = `
    <div class="font-bold text-amber-400">${date}</div>
    <div class="text-white">Lv. ${level} (${exp.toFixed(2)}%)</div>
    ${note ? `<div class="text-[10px] text-slate-400 italic">${note}</div>` : ''}
  `;
  tooltip.classList.remove('hidden');
}

function hideChartTooltip() {
  const tooltip = document.getElementById('chartTooltip');
  if (tooltip) tooltip.classList.add('hidden');
}

// --- 6. LOG ENTRY HANDLERS ---
function handleLogSubmit(e) {
  e.preventDefault();
  const date = document.getElementById('logDateInput').value;
  const level = parseInt(document.getElementById('logLevelInput').value);
  const expPercent = parseFloat(document.getElementById('logExpInput').value);
  const note = document.getElementById('logNoteInput').value.trim();

  addLogEntry({ date, level, expPercent, note });

  document.getElementById('inputCurrentLevel').value = level;
  document.getElementById('inputCurrentExpPercent').value = expPercent;
  calculateAll();
  showToast("Daily check-in logged!");
}

function addLogEntry(entry) {
  const state = getState();
  const logs = state.logs || [];

  const newEntry = {
    id: Date.now().toString(),
    date: entry.date,
    level: entry.level,
    expPercent: entry.expPercent,
    note: entry.note || ''
  };

  logs.push(newEntry);
  saveState({ ...state, logs });
  calculateAll();
}

function deleteLog(id) {
  const state = getState();
  const logs = (state.logs || []).filter(l => l.id !== id);
  saveState({ ...state, logs });
  calculateAll();
  showToast("Log entry removed.");
}

function clearAllLogs() {
  const state = getState();
  saveState({ ...state, logs: [] });
  calculateAll();
  showToast("All check-in logs cleared.");
}

function loadSampleLogHistory() {
  const today = new Date();
  const sampleLogs = [];
  const baseLvl = 113;
  const baseExp = 12.0;
  const dailyGain = 6.95;

  for (let i = 4; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    let currExp = baseExp + ((4 - i) * dailyGain);
    let currLvl = baseLvl;
    if (currExp >= 100) {
      currLvl += 1;
      currExp -= 100;
    }

    sampleLogs.push({
      id: (Date.now() - i * 1000).toString(),
      date: dateStr,
      level: currLvl,
      expPercent: parseFloat(currExp.toFixed(2)),
      note: i === 0 ? "Daily 2x MPE + Dungeon run" : "Grind session"
    });
  }

  const state = getState();
  saveState({ ...state, logs: sampleLogs });
  calculateAll();
  showToast("5-day sample progress loaded!");
}

// --- 7. MODALS & SAVE EXPORT/IMPORT ---
function openQuickLogModal() {
  const state = getState();
  document.getElementById('modalLogDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('modalLogLevel').value = state.currentLevel;
  document.getElementById('modalLogExp').value = state.currentExpPercent;
  document.getElementById('quickLogModal').classList.remove('hidden');
}

function closeQuickLogModal() {
  document.getElementById('quickLogModal').classList.add('hidden');
}

function handleQuickLogModalSubmit(e) {
  e.preventDefault();
  const date = document.getElementById('modalLogDate').value;
  const level = parseInt(document.getElementById('modalLogLevel').value);
  const expPercent = parseFloat(document.getElementById('modalLogExp').value);
  const note = document.getElementById('modalLogNote').value.trim();

  addLogEntry({ date, level, expPercent, note });

  document.getElementById('inputCurrentLevel').value = level;
  document.getElementById('inputCurrentExpPercent').value = expPercent;
  calculateAll();
  closeQuickLogModal();
  showToast("Quick EXP check-in saved!");
}

function exportSaveJSON() {
  const state = getState();
  const jsonStr = JSON.stringify(state, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `maplestory_exp_save_${state.currentLevel}_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast("Backup JSON exported!");
}

function triggerImportSave() {
  document.getElementById('importFileInput').click();
}

function importSaveJSON(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      saveState(imported);
      location.reload();
    } catch (err) {
      showToast("Invalid JSON save file!", true);
    }
  };
  reader.readAsText(file);
}

// --- 8. TIMELINE & EXP TABLE ---
function renderTimeline(startPct, purePctDay, combinedPctDay) {
  const tbody = document.getElementById('timelineTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const startDateEl = document.getElementById('startDateInput');
  const startDateStr = startDateEl ? (startDateEl.value || new Date().toISOString().split('T')[0]) : new Date().toISOString().split('T')[0];
  let currDate = new Date(startDateStr);
  let currPercent = startPct;

  for (let day = 1; day <= 25; day++) {
    if (currPercent >= 100) break;

    const start = currPercent;
    const end = Math.min(100, currPercent + combinedPctDay);

    let badge = '<span class="text-slate-500">-</span>';
    if (end >= 100) {
      badge = '<span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">🎉 LEVEL UP!</span>';
    } else if (end >= 75 && start < 75) {
      badge = '<span class="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold">⭐ 75% Milestone</span>';
    } else if (end >= 50 && start < 50) {
      badge = '<span class="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-semibold">⚡ 50% Halfway</span>';
    }

    const dateStr = currDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const tr = document.createElement('tr');
    tr.className = end >= 100 ? 'bg-amber-500/10 font-bold' : 'hover:bg-slate-800/40';
    tr.innerHTML = `
      <td class="py-2.5 px-3 font-semibold text-slate-200">Day ${day}</td>
      <td class="py-2.5 px-3 text-slate-400">${dateStr}</td>
      <td class="py-2.5 px-3 text-right text-slate-300">${start.toFixed(2)}%</td>
      <td class="py-2.5 px-3 text-right text-amber-400/80">+${purePctDay.toFixed(2)}%</td>
      <td class="py-2.5 px-3 text-right text-emerald-400 font-bold">+${combinedPctDay.toFixed(2)}%</td>
      <td class="py-2.5 px-3 text-right text-emerald-300 font-bold">${end.toFixed(2)}%</td>
      <td class="py-2.5 px-3">${badge}</td>
    `;
    tbody.appendChild(tr);

    currPercent = end;
    currDate.setDate(currDate.getDate() + 1);
  }
}

function renderExpTable() {
  const tbody = document.getElementById('expReferenceTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const currentLvlEl = document.getElementById('inputCurrentLevel');
  const currentLvl = currentLvlEl ? (parseInt(currentLvlEl.value) || 113) : 113;

  for (let lvl = 1; lvl <= 140; lvl++) {
    const exp = EXP_TABLE[lvl];
    const tr = document.createElement('tr');
    tr.id = `exp-row-${lvl}`;
    tr.className = lvl === currentLvl ? 'bg-amber-500/15 border-l-4 border-amber-500 font-bold' : 'hover:bg-slate-800/40';

    tr.innerHTML = `
      <td class="py-2.5 px-4 text-slate-200">
        Level ${lvl} ${lvl === currentLvl ? '<span class="text-xs text-amber-400 ml-1">(Current)</span>' : ''}
      </td>
      <td class="py-2.5 px-4 text-right text-slate-400">${formatNumber(exp)}</td>
      <td class="py-2.5 px-4 text-right text-amber-400 font-bold">${formatExp(exp)}</td>
      <td class="py-2.5 px-4 text-center">
        <button onclick="setCurrentLevelFromTable(${lvl})" class="text-[11px] bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 px-2.5 py-1 rounded-md transition">
          Select
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  }
}

function filterExpTable(query) {
  const q = query.trim().toLowerCase();
  for (let lvl = 1; lvl <= 140; lvl++) {
    const row = document.getElementById(`exp-row-${lvl}`);
    if (!row) continue;
    row.style.display = (!q || lvl.toString().includes(q)) ? '' : 'none';
  }
}

function setCurrentLevelFromTable(lvl) {
  const lvlEl = document.getElementById('inputCurrentLevel');
  const tgtEl = document.getElementById('inputTargetLevel');
  if (lvlEl) lvlEl.value = lvl;
  if (tgtEl) tgtEl.value = lvl + 1;
  calculateAll();
  switchTab('calc');
}

// --- 9. UTILITIES ---
function formatDaysToHMS(daysDecimal) {
  if (daysDecimal >= 999) return "999+ days";
  const totalSeconds = Math.floor(daysDecimal * 86400);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${days}d ${hours}h ${minutes}m`;
}

function calculateTargetDate(daysToAdd) {
  if (daysToAdd >= 999) return "Far in future";
  const startDateEl = document.getElementById('startDateInput');
  const startStr = startDateEl ? (startDateEl.value || new Date().toISOString().split('T')[0]) : new Date().toISOString().split('T')[0];
  const target = new Date(startStr);
  target.setDate(target.getDate() + Math.ceil(daysToAdd));
  return target.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function syncOnlineHours(val) {
  const v = parseInt(val);
  const lbl = document.getElementById('onlineHoursLabel');
  const disp = document.getElementById('offlineHoursDisplay');
  if (lbl) lbl.innerText = `${v} Hours Online`;
  if (disp) disp.innerText = `Offline: ${24 - v} hrs`;
}

function switchTab(tabKey) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active', 'text-amber-400', 'border-amber-500', 'font-bold');
    btn.classList.add('text-slate-400', 'border-transparent', 'font-medium');
  });

  document.querySelectorAll('.tab-view').forEach(view => view.classList.add('hidden'));

  const activeBtn = document.getElementById(`tab-${tabKey}`);
  const activeView = document.getElementById(`view-${tabKey}`);

  if (activeBtn && activeView) {
    activeBtn.classList.add('active', 'text-amber-400', 'border-amber-500', 'font-bold');
    activeBtn.classList.remove('text-slate-400', 'border-transparent', 'font-medium');
    activeView.classList.remove('hidden');
  }

  if (tabKey === 'exptable') renderExpTable();
}

function loadPreset(key) {
  const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
  if (key === 'sheet') {
    setVal('inputCurrentLevel', 113);
    setVal('inputCurrentExpPercent', 21.62);
    setVal('inputTargetLevel', 114);
    setVal('inputExpPerKill', 2.26);
    setVal('inputExpUnit', 1e9);
    setVal('inputOnlineKpm', 114);
    setVal('inputOfflineKpm', 54);
  } else if (key === 'early') {
    setVal('inputCurrentLevel', 60);
    setVal('inputCurrentExpPercent', 10.0);
    setVal('inputTargetLevel', 61);
    setVal('inputExpPerKill', 15.5);
    setVal('inputExpUnit', 1e6);
    setVal('inputOnlineKpm', 140);
    setVal('inputOfflineKpm', 70);
  } else if (key === 'mid') {
    setVal('inputCurrentLevel', 95);
    setVal('inputCurrentExpPercent', 45.0);
    setVal('inputTargetLevel', 96);
    setVal('inputExpPerKill', 450.0);
    setVal('inputExpUnit', 1e6);
    setVal('inputOnlineKpm', 120);
    setVal('inputOfflineKpm', 60);
  } else if (key === 'late') {
    setVal('inputCurrentLevel', 120);
    setVal('inputCurrentExpPercent', 5.0);
    setVal('inputTargetLevel', 121);
    setVal('inputExpPerKill', 12.5);
    setVal('inputExpUnit', 1e9);
    setVal('inputOnlineKpm', 110);
    setVal('inputOfflineKpm', 50);
  }
  calculateAll();
}

function resetDefaults() {
  localStorage.removeItem('maple_idle_exp_state_v2');
  location.reload();
}

function openGitHubModal() { document.getElementById('githubModal').classList.remove('hidden'); }
function closeGitHubModal() { document.getElementById('githubModal').classList.add('hidden'); }

// --- INITIALIZATION ---
window.onload = function () {
  const state = getState();

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  };

  const setCheck = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.checked = val;
  };

  setVal('inputCurrentLevel', state.currentLevel);
  setVal('inputCurrentExpPercent', state.currentExpPercent);
  setVal('inputTargetLevel', state.targetLevel);
  setVal('inputExpPerKill', state.expPerKill);
  setVal('inputExpUnit', state.expUnit);
  setVal('inputOnlineKpm', state.onlineKpm);
  setVal('inputOfflineKpm', state.offlineKpm);
  setVal('inputDungeonPercent', state.dungeonPercent);
  setVal('inputMpePercent', state.mpePercent);
  setVal('inputMpeRuns', state.mpeRuns);

  setVal('buffCoupon', state.buffCoupon);
  setVal('buffGuild', state.buffGuild);
  setVal('buffHeroPage', state.buffHeroPage);
  setVal('buffHeroTrail', state.buffHeroTrail);
  setVal('buffAdFree', state.buffAdFree);
  setVal('buffAbility', state.buffAbility);

  setVal('inputOnlineHours', state.onlineHours);
  setCheck('toggleAdBooster', state.adBoosterActive);
  setCheck('toggleAnniversary', state.anniversaryActive);

  const dateVal = state.startDate || new Date().toISOString().split('T')[0];
  setVal('startDateInput', dateVal);
  setVal('logDateInput', dateVal);
  setVal('logLevelInput', state.currentLevel);

  syncOnlineHours(state.onlineHours);
  calculateAll();
  renderExpTable();
};
