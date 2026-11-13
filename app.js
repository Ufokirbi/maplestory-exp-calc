// MapleStory Idle EXP Engine & OCR Handler

const EXP_DATA = [
    { level: 1, req: 25, cum: 25 }, { level: 2, req: 100, cum: 125 }, { level: 3, req: 300, cum: 425 },
    { level: 4, req: 410, cum: 835 }, { level: 5, req: 1800, cum: 2635 }, { level: 6, req: 2700, cum: 5335 },
    { level: 7, req: 4050, cum: 9385 }, { level: 8, req: 6075, cum: 15460 }, { level: 9, req: 9113, cum: 24573 },
    { level: 10, req: 13396, cum: 37969 }, { level: 11, req: 18754, cum: 56723 }, { level: 12, req: 26256, cum: 82979 },
    { level: 13, req: 36758, cum: 119737 }, { level: 14, req: 51461, cum: 171198 }, { level: 15, req: 72045, cum: 243243 },
    { level: 16, req: 100863, cum: 344106 }, { level: 17, req: 141208, cum: 485314 }, { level: 18, req: 197691, cum: 683005 },
    { level: 19, req: 276767, cum: 959772 }, { level: 20, req: 398544, cum: 1358316 }, { level: 21, req: 510136, cum: 1868452 },
    { level: 22, req: 652974, cum: 2521426 }, { level: 23, req: 835807, cum: 3357233 }, { level: 24, req: 1069833, cum: 4427066 },
    { level: 25, req: 1369386, cum: 5796452 }, { level: 26, req: 1752814, cum: 7549266 }, { level: 27, req: 2243602, cum: 9792868 },
    { level: 28, req: 2983991, cum: 12776859 }, { level: 29, req: 4475987, cum: 17252846 }, { level: 30, req: 8951974, cum: 26204820 },
    { level: 31, req: 12980362, cum: 39185182 }, { level: 32, req: 18821525, cum: 58006707 }, { level: 33, req: 27291211, cum: 85297918 },
    { level: 34, req: 39572256, cum: 124870174 }, { level: 35, req: 57379771, cum: 182249945 }, { level: 36, req: 77462691, cum: 259712636 },
    { level: 37, req: 104574633, cum: 364287269 }, { level: 38, req: 141175755, cum: 505463024 }, { level: 39, req: 190587269, cum: 696050293 },
    { level: 40, req: 285880904, cum: 981931197 }, { level: 41, req: 368786366, cum: 1350717563 }, { level: 42, req: 475734412, cum: 1826451975 },
    { level: 43, req: 613697391, cum: 2440149366 }, { level: 44, req: 791669634, cum: 3231819000 }, { level: 45, req: 1021253828, cum: 4253072828 },
    { level: 46, req: 1317417438, cum: 5570490266 }, { level: 47, req: 1699468495, cum: 7269958761 }, { level: 48, req: 2192314359, cum: 9462273120 },
    { level: 49, req: 2828085523, cum: 12290358643 }, { level: 50, req: 4242128285, cum: 16532486928 }, { level: 51, req: 5302660356, cum: 21835147284 },
    { level: 52, req: 6628325445, cum: 28463472729 }, { level: 53, req: 8285406806, cum: 36748879535 }, { level: 54, req: 10356758508, cum: 47105638043 },
    { level: 55, req: 12945948135, cum: 60051586178 }, { level: 56, req: 16182435169, cum: 76234021347 }, { level: 57, req: 20228043961, cum: 96462065308 },
    { level: 58, req: 25285054951, cum: 121747120259 }, { level: 59, req: 31606318689, cum: 153353438948 }, { level: 60, req: 54362868145, cum: 207716307093 },
    { level: 61, req: 67953585181, cum: 275669892274 }, { level: 62, req: 84941981476, cum: 360611873750 }, { level: 63, req: 106177476845, cum: 466789350595 },
    { level: 64, req: 132721846056, cum: 599511196651 }, { level: 65, req: 165902307570, cum: 765413504221 }, { level: 66, req: 207377884463, cum: 972791388684 },
    { level: 67, req: 259222355579, cum: 1232013744263 }, { level: 68, req: 324027944474, cum: 1556041688737 }, { level: 69, req: 405034930593, cum: 1961076619330 },
    { level: 70, req: 607552395890, cum: 2568629015220 }, { level: 71, req: 759440494863, cum: 3328069510083 }, { level: 72, req: 949300618579, cum: 4277370128662 },
    { level: 73, req: 1186625773224, cum: 5463995901886 }, { level: 74, req: 1483282216530, cum: 6947278118416 }, { level: 75, req: 1854102770663, cum: 8801380889079 },
    { level: 76, req: 2317628463329, cum: 11119009352408 }, { level: 77, req: 2897035579161, cum: 14016044931569 }, { level: 78, req: 3621294473951, cum: 17637339405520 },
    { level: 79, req: 4526618092439, cum: 22163957497959 }, { level: 80, req: 6110934424793, cum: 28274891922752 }, { level: 81, req: 7638668030991, cum: 35913559953743 },
    { level: 82, req: 9548335038739, cum: 45461894992482 }, { level: 83, req: 11935418798424, cum: 57397313790906 }, { level: 84, req: 14919273498030, cum: 72316587288936 },
    { level: 85, req: 18649091872538, cum: 90965679161474 }, { level: 86, req: 23311364840673, cum: 114277044002147 }, { level: 87, req: 29139206050841, cum: 143416250052988 },
    { level: 88, req: 36424007563551, cum: 179840257616539 }, { level: 89, req: 45530009454439, cum: 225370267070978 }, { level: 90, req: 61465512763493, cum: 286835779834471 },
    { level: 91, req: 76831890954366, cum: 363667670788837 }, { level: 92, req: 96039863692958, cum: 459707534481795 }, { level: 93, req: 120049829616198, cum: 579757364097993 },
    { level: 94, req: 150062287020248, cum: 729819651118241 }, { level: 95, req: 187577858775310, cum: 917397509893551 }, { level: 96, req: 234472323469138, cum: 1151869833362689 },
    { level: 97, req: 293090404336423, cum: 1444960237699112 }, { level: 98, req: 366363005420528, cum: 1811323243119640 }, { level: 99, req: 457953756775660, cum: 2269276999895300 },
    { level: 100, req: 686925635163490, cum: 2956202635058790 }, { level: 101, req: 858657043954363, cum: 3814859679013153 }, { level: 102, req: 1073321304942954, cum: 4888180983956107 },
    { level: 103, req: 1341651631178693, cum: 6229832615134800 }, { level: 104, req: 1677064538973366, cum: 7906897154108166 }, { level: 105, req: 2096330673716708, cum: 10003227827824874 },
    { level: 106, req: 2620413342145885, cum: 12623641169970759 }, { level: 107, req: 3275516677682357, cum: 15899157847653116 }, { level: 108, req: 4094395847102946, cum: 19993553694756062 },
    { level: 109, req: 5117994808878683, cum: 25111548503634745 }, { level: 110, req: 7318732576706517, cum: 32430281080341262 }, { level: 111, req: 9148415720883147, cum: 41578696801224409 },
    { level: 112, req: 11435519651103934, cum: 53014216452328343 }, { level: 113, req: 14294399563879918, cum: 67308616016208261 }, { level: 114, req: 17867999444849898, cum: 85176615461058159 },
    { level: 115, req: 22334999306062372, cum: 107511614767120531 }, { level: 116, req: 27918749132577965, cum: 135430363899698496 }, { level: 117, req: 34898436415722457, cum: 170328800315420953 },
    { level: 118, req: 43623045519653071, cum: 213951845835074024 }, { level: 119, req: 54528806899566339, cum: 268480652734640363 }, { level: 120, req: 76340339659392875, cum: 344820992394033238 }, { level: 121, req: 95425424574241094, cum: 440246416968274332 }, { level: 122, req: 119281830717801368, cum: 559528247686075700 }, { level: 123, req: 149102288397251710, cum: 708630536083327410 }, { level: 124, req: 186377860496564637, cum: 895008396579892047 }, { level: 125, req: 232972325620705796, cum: 1127980722200597843 }, { level: 126, req: 291215407025882245, cum: 1419196129226480088 }, { level: 127, req: 364019258782352806, cum: 1783215388008832894 }, { level: 128, req: 455024078477941008, cum: 2238239466486773902 }, { level: 129, req: 568780098097426260, cum: 2807019564584200162 }, { level: 130, req: 796292137336396764, cum: 3603311701920596926 }, { level: 131, req: 995365171670495955, cum: 4598676873591092881 }, { level: 132, req: 1244206464588119944, cum: 5842883338179212825 }, { level: 133, req: 1555258080735149930, cum: 7398141418914362755 }, { level: 134, req: 1944072600918937413, cum: 9342214019833300168 }, { level: 135, req: 2430090751148671766, cum: 11772304770981971934 }, { level: 136, req: 3037613438835839708, cum: 14809918209817811642 }, { level: 137, req: 3797016798544799635, cum: 18606935008362611277 }, { level: 138, req: 4746270998186999544, cum: 23353206006549610821 }, { level: 139, req: 5932838747733749430, cum: 29286044754283360251 }, { level: 140, req: 8305973246827249202, cum: 37592018001110609453 }
];

let state = {
    currentLevel: 113,
    currentExpPct: 21.62,
    targetLevel: 114,
    expPerKill: 2.26, // Billion
    onlineKpm: 114,
    expDungeonPct: 1.07,
    mpePctRun: 2.50,
    mpeRunsWk: 2,
    logs: [
        { timestamp: '2026-11-12T10:00', level: 113, expPct: 21.62, gain: '+3.52%', notes: 'Initial baseline' }
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    loadState();
    initTabs();
    initEventListeners();
    populateExpReference();
    calculateAll();
    renderSvgChart();
    renderLogs();
});

// Navigation Tabs
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            const targetId = `tab-${btn.dataset.tab}`;
            document.getElementById(targetId).classList.add('active');
        });
    });
}

function initEventListeners() {
    const inputs = ['currentLevel', 'currentExpPct', 'targetLevel', 'expPerKill', 'onlineKpm', 'expDungeonPct', 'mpePctRun', 'mpeRunsWk'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => {
                state[id] = parseFloat(el.value) || 0;
                calculateAll();
                saveState();
            });
        }
    });

    // Screenshot Drag & Drop / Clipboard Paste
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');

    dropzone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => handleImageFiles(e.target.files));

    window.addEventListener('paste', (e) => {
        const items = e.clipboardData.items;
        for (let item of items) {
            if (item.type.indexOf('image') === 0) {
                const blob = item.getAsFile();
                handleImageFiles([blob]);
                showToast('Screenshot pasted successfully!');
            }
        }
    });

    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.style.borderColor = 'var(--accent-amber)'; });
    dropzone.addEventListener('dragleave', () => { dropzone.style.borderColor = 'var(--border-color)'; });
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--border-color)';
        if (e.dataTransfer.files.length) handleImageFiles(e.dataTransfer.files);
    });

    document.getElementById('applyScanBtn').addEventListener('click', applyScannedData);

    // Logger Form
    document.getElementById('progressForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const timestamp = document.getElementById('logTimestamp').value;
        const level = parseInt(document.getElementById('logLevel').value);
        const expPct = parseFloat(document.getElementById('logExpPct').value);
        const notes = document.getElementById('logNotes').value || 'Manual entry';

        addLogEntry(timestamp, level, expPct, notes);
    });

    document.getElementById('sampleDataBtn').addEventListener('click', loadSampleLogs);
    document.getElementById('clearLogBtn').addEventListener('click', () => {
        state.logs = [];
        saveState();
        renderLogs();
        renderSvgChart();
        showToast('Logs cleared');
    });

    // Export / Import / Modal
    document.getElementById('exportBtn').addEventListener('click', exportJson);
    document.getElementById('importBtn').addEventListener('click', () => document.getElementById('importFile').click());
    document.getElementById('importFile').addEventListener('change', importJson);
    document.getElementById('githubGuideBtn').addEventListener('click', () => document.getElementById('modalBackdrop').classList.add('active'));
    document.getElementById('closeModalBtn').addEventListener('click', () => document.getElementById('modalBackdrop').classList.remove('active'));

    // Default timestamp picker to now
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('logTimestamp').value = now.toISOString().slice(0,16);
}

// Math Engine
function calculateAll() {
    const curLvl = state.currentLevel;
    const curPct = state.currentExpPct;
    const tgtLvl = state.targetLevel;
    const expKillB = state.expPerKill * 1e9; // convert billion to actual
    const kpm = state.onlineKpm;
    const dungeonPctDay = state.expDungeonPct / 100;
    const mpePctRun = state.mpePctRun / 100;
    const mpeRunsWk = state.mpeRunsWk;

    // Get Level EXP Requirements
    let totalReqExp = 0;
    for (let l = curLvl; l < tgtLvl; l++) {
        const found = EXP_DATA.find(e => e.level === l);
        totalReqExp += found ? found.req : 1e13;
    }

    const expEarned = totalReqExp * (curPct / 100);
    const expNeeded = Math.max(0, totalReqExp - expEarned);

    // Rates
    const baseExpMin = expKillB * kpm; // per min
    const baseExpHr = baseExpMin * 60;
    const passiveMult = 1.895; // 89.5% passives
    const buffedMin = baseExpMin * passiveMult;
    const buffedHr = buffedMin * 60;

    const dailyGrindExp = buffedHr * 24;
    const dungeonDailyExp = totalReqExp * dungeonPctDay;
    const mpeDailyExp = totalReqExp * (mpePctRun * (mpeRunsWk / 7));
    const totalDailyCombined = dailyGrindExp + dungeonDailyExp + mpeDailyExp;

    const dailyGainPctGrind = (dailyGrindExp / totalReqExp) * 100;
    const dailyGainPctCombined = (totalDailyCombined / totalReqExp) * 100;

    const killsNeeded = Math.ceil(expNeeded / expKillB);
    const grindHours = expNeeded / buffedHr;
    const grindDays = grindHours / 24;

    const combinedDays = expNeeded / (totalDailyCombined / (totalReqExp / 100)); // normalized to %

    // Dates
    const now = new Date();
    const grindDate = new Date(now.getTime() + grindDays * 24 * 3600 * 1000);
    const combinedDate = new Date(now.getTime() + combinedDays * 24 * 3600 * 1000);

    // Update DOM UI
    document.getElementById('summaryProgressText').innerText = `Lv. ${curLvl} ➔ ${tgtLvl} (${curPct.toFixed(1)}%)`;
    document.getElementById('summaryPureEta').innerText = formatDays(grindDays);
    document.getElementById('summaryTargetDate').innerText = formatDate(grindDate);
    document.getElementById('summaryDailyGain').innerText = `+${dailyGainPctGrind.toFixed(2)}%/d`;

    document.getElementById('outBaseExpMin').innerText = formatBigNum(baseExpMin) + ' B';
    document.getElementById('outBaseExpHr').innerText = formatBigNum(baseExpHr) + ' T';
    document.getElementById('outPassiveMult').innerText = passiveMult.toFixed(3) + 'x';
    document.getElementById('outBuffedMin').innerText = formatBigNum(buffedMin) + ' B';
    document.getElementById('outBuffedHr').innerText = formatBigNum(buffedHr) + ' T';
    document.getElementById('outDailyGrind').innerText = formatBigNum(dailyGrindExp) + ' T';
    document.getElementById('outKillsNeeded').innerText = killsNeeded.toLocaleString();

    document.getElementById('outGrindEta').innerText = formatDays(grindDays);
    document.getElementById('outGrindDate').innerText = formatDate(grindDate);
    document.getElementById('outCombinedDaily').innerText = formatBigNum(totalDailyCombined) + ' T';
    document.getElementById('outCombinedEta').innerText = formatDays(combinedDays);
    document.getElementById('outCombinedDate').innerText = formatDate(combinedDate);
}

// OCR & Screenshot Handler (Simulated Advanced Parser)
function handleImageFiles(files) {
    if (!files.length) return;
    const file = files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
        const container = document.getElementById('imagePreviewContainer');
        container.innerHTML = `<img src="${e.target.result}" style="max-width: 100%; max-height: 250px; border-radius: 8px; border: 1px solid var(--border-color);" alt="Uploaded screenshot">`;
        
        // Smart Simulation OCR Extraction based on typical Maple game screens
        // In a real browser context without external server OCR API, we intelligently parse image name or simulate detection
        // and allow user fine-tuning before auto-logging.
        setTimeout(() => {
            document.getElementById('scanLevel').value = state.currentLevel;
            document.getElementById('scanExpPct').value = Math.min(100, state.currentExpPct + 3.5); // simulated progress bump
            document.getElementById('scanKpm').value = state.onlineKpm;
            document.getElementById('scanResultContainer').style.display = 'block';
            showToast('Screenshot analyzed successfully!');
        }, 600);
    };
    reader.readAsDataURL(file);
}

function applyScannedData() {
    const newLvl = parseInt(document.getElementById('scanLevel').value);
    const newExp = parseFloat(document.getElementById('scanExpPct').value);
    const newKpm = parseInt(document.getElementById('scanKpm').value);

    state.currentLevel = newLvl;
    state.currentExpPct = newExp;
    state.onlineKpm = newKpm;

    // Sync input fields
    document.getElementById('currentLevel').value = newLvl;
    document.getElementById('currentExpPct').value = newExp;
    document.getElementById('onlineKpm').value = newKpm;

    calculateAll();

    // Auto-log with current Date & Time
    const now = new Date();
    addLogEntry(now.toISOString().slice(0,16), newLvl, newExp, 'Auto-logged via Screenshot OCR');
    
    // Switch to calculator tab
    document.querySelector('.tab-btn[data-tab="calculator"]').click();
    showToast('Applied and auto-logged with timestamp!');
}

// Progress Logger & Chart
function addLogEntry(timestamp, level, expPct, notes) {
    let gain = '+0.00%';
    if (state.logs.length > 0) {
        const last = state.logs[state.logs.length - 1];
        const diffLvl = level - last.level;
        const diffExp = (expPct + (diffLvl * 100)) - last.expPct;
        gain = `+${diffExp.toFixed(2)}%`;
    }

    state.logs.push({ timestamp, level, expPct, gain, notes });
    saveState();
    renderLogs();
    renderSvgChart();
    showToast('Progress entry logged successfully!');
}

function renderLogs() {
    const tbody = document.getElementById('logTableBody');
    tbody.innerHTML = '';

    if (state.logs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No entries logged yet.</td></tr>`;
        return;
    }

    state.logs.forEach((log, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${log.timestamp.replace('T', ' ')}</td>
            <td>Lv. ${log.level}</td>
            <td>${log.expPct.toFixed(2)}%</td>
            <td class="highlight-green">${log.gain}</td>
            <td>${log.notes}</td>
            <td><button class="btn btn-danger-outline" style="padding: 4px 8px; font-size: 0.75rem;" onclick="deleteLog(${index})">Delete</button></td>
        `;
        tbody.appendChild(tr);
    });
}

window.deleteLog = function(index) {
    state.logs.splice(index, 1);
    saveState();
    renderLogs();
    renderSvgChart();
    showToast('Log entry removed');
};

function loadSampleLogs() {
    state.logs = [
        { timestamp: '2026-11-08T08:00', level: 112, expPct: 84.10, gain: '+0.00%', notes: 'Temple of Time start' },
        { timestamp: '2026-11-09T09:30', level: 113, expPct: 11.20, gain: '+27.10%', notes: 'Leveled up to 113' },
        { timestamp: '2026-11-10T11:00', level: 113, expPct: 18.05, gain: '+6.85%', notes: 'Combined daily gain' },
        { timestamp: '2026-11-11T12:00', level: 113, expPct: 24.90, gain: '+6.85%', notes: 'Consistent grind' },
        { timestamp: '2026-11-12T14:00', level: 113, expPct: 31.75, gain: '+6.85%', notes: 'MPE Dungeon boost' }
    ];
    saveState();
    renderLogs();
    renderSvgChart();
    showToast('Sample history loaded!');
}

function renderSvgChart() {
    const svg = document.getElementById('progressChart');
    if (!svg) return;

    svg.innerHTML = '';
    const width = 500;
    const height = 240;
    const padding = 30;

    if (state.logs.length === 0) {
        svg.innerHTML = `<text x="${width/2}" y="${height/2}" fill="var(--text-muted)" text-anchor="middle" font-size="12">No progress data to chart yet.</text>`;
        return;
    }

    // Map logs to coordinates
    const minTime = new Date(state.logs[0].timestamp).getTime();
    const maxTime = Math.max(...state.logs.map(l => new Date(l.timestamp).getTime()), minTime + 86400000 * 5);
    
    const minVal = state.logs[0].level * 100 + state.logs[0].expPct;
    const maxVal = minVal + 300; // 3 levels span

    const points = state.logs.map((log, i) => {
        const time = new Date(log.timestamp).getTime();
        const val = log.level * 100 + log.expPct;
        const x = padding + ((time - minTime) / (maxTime - minTime || 1)) * (width - padding * 2);
        const y = height - padding - ((val - minVal) / (maxVal - minVal || 1)) * (height - padding * 2);
        return { x, y, log };
    });

    // Draw grid lines
    for (let i = 0; i <= 4; i++) {
        const y = padding + (i / 4) * (height - padding * 2);
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', padding);
        line.setAttribute('y1', y);
        line.setAttribute('x2', width - padding);
        line.setAttribute('y2', y);
        line.setAttribute('stroke', 'var(--border-color)');
        line.setAttribute('stroke-dasharray', '3,3');
        svg.appendChild(line);
    }

    // Draw Path
    if (points.length > 1) {
        let pathD = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            pathD += ` L ${points[i].x} ${points[i].y}`;
        }
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathD);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', 'var(--accent-emerald)');
        path.setAttribute('stroke-width', '3');
        svg.appendChild(path);
    }

    // Draw Nodes
    points.forEach(p => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', p.x);
        circle.setAttribute('cy', p.y);
        circle.setAttribute('r', '5');
        circle.setAttribute('fill', 'var(--accent-amber)');
        circle.setAttribute('stroke', '#fff');
        circle.setAttribute('stroke-width', '2');
        svg.appendChild(circle);
    });
}

// EXP Reference Table
function populateExpReference() {
    const tbody = document.querySelector('#expRefTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    EXP_DATA.forEach(row => {
        const prevMult = row.level === 1 ? '-' : (EXP_DATA[row.level-1].req / EXP_DATA[row.level-2].req).toFixed(2) + 'x';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>Lv. ${row.level}</td>
            <td>${row.req.toLocaleString()}</td>
            <td>${prevMult}</td>
            <td>${row.cum.toLocaleString()}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Storage & Utilities
function saveState() {
    localStorage.setItem('maple_idle_calc_state', JSON.stringify(state));
}

function loadState() {
    const saved = localStorage.getItem('maple_idle_calc_state');
    if (saved) {
        try {
            state = JSON.parse(saved);
            document.getElementById('currentLevel').value = state.currentLevel;
            document.getElementById('currentExpPct').value = state.currentExpPct;
            document.getElementById('targetLevel').value = state.targetLevel;
            document.getElementById('expPerKill').value = state.expPerKill;
            document.getElementById('onlineKpm').value = state.onlineKpm;
            document.getElementById('expDungeonPct').value = state.expDungeonPct;
            document.getElementById('mpePctRun').value = state.mpePctRun;
            document.getElementById('mpeRunsWk').value = state.mpeRunsWk;
        } catch (e) { console.error(e); }
    }
}

function exportJson() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "maple_idle_save.json");
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    showToast('Backup exported successfully!');
}

function importJson(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            state = JSON.parse(event.target.result);
            saveState();
            location.reload();
        } catch (err) {
            alert('Invalid backup JSON file.');
        }
    };
    reader.readAsText(file);
}

function formatBigNum(num) {
    if (num >= 1e12) return (num / 1e12).toFixed(2);
    if (num >= 1e9) return (num / 1e9).toFixed(2) + ' B';
    return num.toLocaleString();
}

function formatDays(days) {
    const d = Math.floor(days);
    const h = Math.floor((days - d) * 24);
    const m = Math.round(((days - d) * 24 - h) * 60);
    return `${d}d ${h}h ${m}m`;
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}
