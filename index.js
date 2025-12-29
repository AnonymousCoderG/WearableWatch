



//updated with connectivity  and vitals & temp 


// const BLYNK_AUTH_TOKEN = 'uXKhBrB_1_wQO6s-w0QD5F-fgN1qM8TX';
// const BLYNK_BASE_URL = 'https://blynk.cloud/external/api';

// const V_PINS = {
//     steps: 'V1',
//     heartRate: 'V2',
//     spo2: 'V3',
//     temp: 'V4', 
//     scanStatus: 'V5' 
// };

// let appState = {
//     metrics: {
//         steps: 0,
//         heartRate: 0,
//         spo2: 0,
//         temp: 0,
//         scanStatus: 0
//     },
//     history: Array(40).fill(0)
// };

// // UI Elements
// const v1El = document.getElementById('v1-value');
// const v2El = document.getElementById('v2-value');
// const v3El = document.getElementById('v3-value');
// const v4El = document.getElementById('v4-value');
// const v5Text = document.getElementById('v5-text');
// const v5Dot = document.getElementById('v5-dot');
// const lastUpdatedEl = document.getElementById('last-updated');
// const scanRing = document.getElementById('scan-ring');
// const scanLaser = document.querySelector('.scan-laser');
// const anatomyCore = document.querySelector('.anatomy-core');

// // Local-only footer inputs
// const inputAge = document.getElementById('local-age');
// const inputHeight = document.getElementById('local-height');
// const inputWeight = document.getElementById('local-weight');
// const displayBMI = document.getElementById('local-bmi');

// // Canvas references
// const ecgCanvas = document.getElementById('ecg-canvas');
// const edaCanvas = document.getElementById('eda-canvas');
// const ecgCtx = ecgCanvas?.getContext('2d');
// const edaCtx = edaCanvas?.getContext('2d');

// let ecgOffset = 0;
// let edaOffset = 0;

// /**
//  * BMI Calculation Logic
//  */
// function updateBMI() {
//     const height = parseFloat(inputHeight.value);
//     const weight = parseFloat(inputWeight.value);
//     if (height > 0 && weight > 0) {
//         const heightMeters = height / 100;
//         const bmi = weight / (heightMeters * heightMeters);
//         displayBMI.textContent = bmi.toFixed(1);
//     } else {
//         displayBMI.textContent = "--.-";
//     }
//     // Persist locally
//     localStorage.setItem('diginurse_vitals', JSON.stringify({
//         age: inputAge.value,
//         height: inputHeight.value,
//         weight: inputWeight.value
//     }));
// }

// /**
//  * Load Local Vitals
//  */
// function loadLocalVitals() {
//     const saved = localStorage.getItem('diginurse_vitals');
//     if (saved) {
//         try {
//             const data = JSON.parse(saved);
//             if (data.age) inputAge.value = data.age;
//             if (data.height) inputHeight.value = data.height;
//             if (data.weight) inputWeight.value = data.weight;
//             updateBMI();
//         } catch(e) {}
//     }
// }

// /**
//  * Initialize Canvas scaling with High DPI support
//  */
// function initCanvas() {
//     if (ecgCanvas && edaCanvas) {
//         const dpr = window.devicePixelRatio || 1;
//         const rect1 = ecgCanvas.getBoundingClientRect();
//         ecgCanvas.width = rect1.width * dpr;
//         ecgCanvas.height = 60 * dpr;
//         ecgCtx?.scale(dpr, dpr);

//         const rect2 = edaCanvas.getBoundingClientRect();
//         edaCanvas.width = rect2.width * dpr;
//         edaCanvas.height = 60 * dpr;
//         edaCtx?.scale(dpr, dpr);
//     }
// }

// /**
//  * Draw ECG Waveform (Heart Rate V2)
//  */
// function drawECG() {
//     if (!ecgCtx) return;
//     const isConnected = appState.metrics.scanStatus > 0;
//     const ctx = ecgCtx;
//     const w = ecgCanvas.width / (window.devicePixelRatio || 1);
//     const h = 60;
    
//     ctx.clearRect(0, 0, w, h);
    
//     if (!isConnected) {
//         ctx.strokeStyle = '#475569';
//         ctx.beginPath();
//         ctx.moveTo(0, h/2);
//         ctx.lineTo(w, h/2);
//         ctx.stroke();
//         requestAnimationFrame(drawECG);
//         return;
//     }

//     ctx.strokeStyle = '#10b981';
//     ctx.lineWidth = 2;
//     ctx.shadowBlur = 8;
//     ctx.shadowColor = 'rgba(16,185,129,0.3)';
//     ctx.beginPath();
    
//     const hr = appState.metrics.heartRate || 72;
//     const speed = (hr / 60) * 1.5;
    
//     for (let i = 0; i < w; i++) {
//         let x = i;
//         let t = (i + ecgOffset) % 100;
//         let y = h / 2;
        
//         if (t > 10 && t < 20) y -= Math.sin((t-10) * Math.PI / 10) * 3; 
//         else if (t > 30 && t < 34) y += (t-30) * 4; 
//         else if (t > 34 && t < 38) y -= (t-34) * 20; 
//         else if (t > 38 && t < 42) y += (t-38) * 15; 
//         else if (t > 60 && t < 80) y -= Math.sin((t-60) * Math.PI / 20) * 5; 
        
//         if (i === 0) ctx.moveTo(x, y);
//         else ctx.lineTo(x, y);
//     }
//     ctx.stroke();
//     ecgOffset += speed;
//     requestAnimationFrame(drawECG);
// }

// /**
//  * Draw SpO2 Waveform (V3)
//  */
// function drawEDA() {
//     if (!edaCtx) return;
//     const isConnected = appState.metrics.scanStatus > 0;
//     const ctx = edaCtx;
//     const w = edaCanvas.width / (window.devicePixelRatio || 1);
//     const h = 60;
    
//     ctx.clearRect(0, 0, w, h);
    
//     if (!isConnected) {
//         ctx.strokeStyle = '#475569';
//         ctx.beginPath();
//         ctx.moveTo(0, h/2);
//         ctx.lineTo(w, h/2);
//         ctx.stroke();
//         requestAnimationFrame(drawEDA);
//         return;
//     }

//     ctx.strokeStyle = '#22d3ee';
//     ctx.lineWidth = 2;
//     ctx.shadowBlur = 8;
//     ctx.shadowColor = 'rgba(34,211,238,0.3)';
//     ctx.beginPath();
    
//     const spo2 = appState.metrics.spo2 || 98;
//     const amp = 8 + (spo2 / 20);

//     for (let i = 0; i < w; i++) {
//         let x = i;
//         let y = (h / 2) + Math.sin((i + edaOffset) * 0.04) * amp + Math.cos((i + edaOffset) * 0.02) * (amp/3);
//         if (i === 0) ctx.moveTo(x, y);
//         else ctx.lineTo(x, y);
//     }
//     ctx.stroke();
//     edaOffset += 1.2;
//     requestAnimationFrame(drawEDA);
// }

// /**
//  * Update Movement Histogram
//  */
// function updateHistogram() {
//     const container = document.getElementById('hr-graph');
//     if (!container) return;

//     appState.history.shift();
//     appState.history.push(appState.metrics.steps % 500); 
    
//     container.innerHTML = appState.history.map(val => {
//         const height = Math.max(3, (val / 500) * 60);
//         const opacity = 0.1 + (val / 500) * 0.5;
//         return `<div class="flex-grow bg-slate-400 rounded-t-sm transition-all duration-500" style="height: ${height}px; opacity: ${opacity}"></div>`;
//     }).join('');
// }

// /**
//  * Update UI Elements with Blynk State
//  */
// function updateUI() {
//     const isConnected = appState.metrics.scanStatus > 0;

//     if(v1El) v1El.textContent = isConnected ? appState.metrics.steps.toLocaleString() : "---";
//     if(v2El) v2El.textContent = isConnected ? appState.metrics.heartRate : "--";
//     if(v3El) v3El.textContent = isConnected ? appState.metrics.spo2 : "--";
//     if(v4El) v4El.textContent = isConnected ? Number(appState.metrics.temp).toFixed(1) : "0.0";

//     if(v5Text) {
//         v5Text.textContent = isConnected ? "DEVICE_CONNECTED" : "DEVICE_OFFLINE";
//         v5Text.className = isConnected ? "text-emerald-400 text-xs font-bold" : "text-rose-500 text-xs font-bold";
//     }
    
//     if(v5Dot) {
//         v5Dot.className = isConnected 
//             ? "w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" 
//             : "w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_10px_#f43f5e]";
//     }

//     if (scanRing) {
//         scanRing.style.opacity = isConnected ? "0.6" : "0.05";
//         scanRing.style.animationPlayState = isConnected ? "running" : "paused";
//     }
//     if (scanLaser) {
//         scanLaser.style.display = isConnected ? "block" : "none";
//     }
//     if (anatomyCore) {
//         anatomyCore.style.opacity = isConnected ? "1" : "0.2";
//         anatomyCore.style.animationPlayState = isConnected ? "running" : "paused";
//     }

//     if(lastUpdatedEl) {
//         lastUpdatedEl.textContent = isConnected 
//             ? `LAST_TELEMETRY_SYNC: ${new Date().toLocaleTimeString()}`
//             : `DEVICE_CONNECTION_LOST`;
//         lastUpdatedEl.className = isConnected 
//             ? "text-emerald-500/80 bg-emerald-500/5 px-6 py-2 rounded-full border border-emerald-500/10 backdrop-blur-sm"
//             : "text-rose-500/80 bg-rose-500/5 px-6 py-2 rounded-full border border-rose-500/10 backdrop-blur-sm";
//     }
//     updateHistogram();
// }

// /**
//  * Fetch Pin from Blynk
//  */
// async function fetchPinValue(pin) {
//     try {
//         const url = `${BLYNK_BASE_URL}/get?token=${BLYNK_AUTH_TOKEN}&${pin}`;
//         const response = await fetch(url);
//         if (!response.ok) return null;
//         const text = await response.text();
//         return isNaN(text) ? 0 : Number(text);
//     } catch (e) {
//         return null;
//     }
// }

// /**
//  * Main Sync Loop
//  */
// async function syncData() {
//     try {
//         const results = await Promise.all([
//             fetchPinValue(V_PINS.steps),
//             fetchPinValue(V_PINS.heartRate),
//             fetchPinValue(V_PINS.spo2),
//             fetchPinValue(V_PINS.temp),
//             fetchPinValue(V_PINS.scanStatus)
//         ]);

//         if (results[0] !== null) appState.metrics.steps = results[0];
//         if (results[1] !== null) appState.metrics.heartRate = results[1];
//         if (results[2] !== null) appState.metrics.spo2 = results[2];
//         if (results[3] !== null) appState.metrics.temp = results[3];
//         if (results[4] !== null) appState.metrics.scanStatus = results[4];

//         updateUI();
//     } catch (e) {
//         console.warn("Blynk sync interrupted");
//         appState.metrics.scanStatus = 0; 
//         updateUI();
//     }
// }

// // Initial Setup
// window.addEventListener('resize', () => {
//     initCanvas();
// });

// // Setup local vital listeners
// [inputAge, inputHeight, inputWeight].forEach(el => {
//     el?.addEventListener('input', updateBMI);
// });

// initCanvas();
// drawECG();
// drawEDA();
// loadLocalVitals();
// syncData();

// setInterval(syncData, 3000);


/**
 * DigiNurse Bio-Telemetry Core
 * V-Pin Mapping:
 * V1: Master Power (1=ON, 0=OFF)
 * V2: Heart Rate (0-200)
 * V3: SpO2 (0-100)
 * V4: Body Temp (Double)
 * V6: Status Text (String)
 * V7: Sleep Chart (0=Awake, 1=Sleep)
 * V8: Sleep Quality (0-100)
 */

const BLYNK_AUTH_TOKEN = 'uXKhBrB_1_wQO6s-w0QD5F-fgN1qM8TX';
const BLYNK_BASE_URL = 'https://blynk.cloud/external/api';

const V_PINS = {
    masterPower: 'V1',
    heartRate: 'V2',
    spo2: 'V3',
    temp: 'V4', 
    statusText: 'V6',
    sleepState: 'V7',
    sleepQuality: 'V8'
};

let appState = {
    metrics: {
        power: 0,
        heartRate: 0,
        spo2: 0,
        temp: 0,
        status: "STILL",
        sleepState: 0,
        sleepQuality: 0
    },
    sleepHistory: Array(40).fill(0),
    dataLog: [],
    sessionStartTime: Date.now(),
    lastIntervalLogged: -1
};

let ecgOffset = 0;
let edaOffset = 0;
let elements = {};

/**
 * Data Management
 */
function recordSnapshot() {
    if (appState.metrics.power === 0) return;

    const snapshot = {
        timestamp: new Date().toISOString(),
        hr: appState.metrics.heartRate,
        spo2: appState.metrics.spo2,
        temp: appState.metrics.temp,
        sleepQuality: appState.metrics.sleepQuality,
        status: appState.metrics.status
    };

    appState.dataLog.push(snapshot);
    if (appState.dataLog.length > 10000) appState.dataLog.shift();
    
    try {
        localStorage.setItem('diginurse_log', JSON.stringify(appState.dataLog));
    } catch(e) {}

    if (elements.logCounter) {
        elements.logCounter.textContent = `SNAPSHOTS: ${appState.dataLog.length}`;
    }

    handlePeriodicLogging();
}

function handlePeriodicLogging() {
    const elapsedSeconds = Math.floor((Date.now() - appState.sessionStartTime) / 1000);
    const intervalSeconds = 120; // 2 minutes
    const totalIntervalsPassed = Math.floor(elapsedSeconds / intervalSeconds);

    if (elements.countdown) {
        const nextLogAt = (totalIntervalsPassed + 1) * intervalSeconds;
        const remaining = nextLogAt - elapsedSeconds;
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        elements.countdown.textContent = `NEXT_INTERVAL_LOG: ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    if (totalIntervalsPassed > appState.lastIntervalLogged) {
        if (totalIntervalsPassed === 0) return;
        const intervalIndex = (totalIntervalsPassed - 1) % 5;
        updatePeriodicTableRow(intervalIndex);
        appState.lastIntervalLogged = totalIntervalsPassed;
    }
}

function updatePeriodicTableRow(index) {
    const row = document.getElementById(`row-${index}`);
    if (!row) return;

    document.querySelectorAll('.periodic-table tr').forEach(r => r.classList.remove('active-row'));
    row.classList.add('active-row');
    row.classList.remove('text-slate-400');
    row.classList.add('text-white');

    row.querySelector('.hr-val').textContent = appState.metrics.heartRate + " BPM";
    row.querySelector('.spo2-val').textContent = appState.metrics.spo2 + '%';
    row.querySelector('.temp-val').textContent = Number(appState.metrics.temp).toFixed(1) + '°C';
    row.querySelector('.sq-val').textContent = appState.metrics.sleepQuality + '%';
    row.querySelector('.time-val').textContent = new Date().toLocaleTimeString();
}

/**
 * Helper to get status styling
 * Strictly binary: ACTIVE or STILL
 */
function getStatusStyles(status) {
    const s = String(status).toUpperCase();
    if (s === "ACTIVE") {
        return "bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]";
    }
    // Default to STILL styling
    return "bg-cyan-500/20 text-cyan-400 border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.2)]";
}

/**
 * UI & Webforms
 */
function updateUI() {
    // Treat any non-1 value as Offline (including null, undefined, 0)
    const isOnline = appState.metrics.power === 1;
    
    // Global Power Class applied to body to dim/grayscale entire UI
    if (isOnline) {
        document.getElementById('main-body').classList.remove("system-standby");
    } else {
        document.getElementById('main-body').classList.add("system-standby");
    }

    // Header V1 Status Update
    if (elements.v1Text) {
        elements.v1Text.textContent = isOnline ? "SYSTEM_ONLINE" : "SYSTEM_STANDBY";
        elements.v1Text.className = isOnline ? "text-emerald-400" : "text-rose-500";
    }
    if (elements.v1Dot) {
        elements.v1Dot.className = isOnline ? 
            "w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" : 
            "w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_10px_#f43f5e]";
    }

    // Metric Displays - Show placeholders when device is off
    if (elements.v2) elements.v2.textContent = isOnline ? appState.metrics.heartRate : "--";
    if (elements.v3) elements.v3.textContent = isOnline ? appState.metrics.spo2 : "--";
    if (elements.v4) elements.v4.textContent = isOnline ? Number(appState.metrics.temp).toFixed(1) : "0.0";
    if (elements.v8) elements.v8.textContent = isOnline ? appState.metrics.sleepQuality : "--";
    
    // V6 Status Handling
    if (elements.v6Status) {
        const status = isOnline ? appState.metrics.status : "OFF";
        elements.v6Status.textContent = status;
        elements.v6Status.className = "inline-block px-3 py-1 rounded border text-[11px] font-black tracking-widest uppercase transition-all duration-300 " + (isOnline ? getStatusStyles(status) : "bg-slate-800 text-slate-500 border-slate-700");
    }

    if (elements.v7Text) elements.v7Text.textContent = isOnline ? (appState.metrics.sleepState === 1 ? "SLEEP" : "AWAKE") : "---";

    if (elements.lastUpdated) {
        elements.lastUpdated.textContent = isOnline ? `LAST_SYNC: ${new Date().toLocaleTimeString()}` : "DEVICE_OFFLINE / STANDBY";
        elements.lastUpdated.className = isOnline ? 
            "text-emerald-500/80 bg-emerald-500/5 px-6 py-2 rounded-full border border-emerald-500/10" :
            "text-rose-500/80 bg-rose-500/5 px-6 py-2 rounded-full border border-rose-500/10";
    }

    // Sleep History Visualization
    if (elements.sleepHistContainer) {
        appState.sleepHistory.shift();
        appState.sleepHistory.push(isOnline ? appState.metrics.sleepState : 0);
        elements.sleepHistContainer.innerHTML = appState.sleepHistory.map(val => {
            const height = val === 1 ? 55 : 5;
            const color = val === 1 ? 'bg-indigo-500' : 'bg-slate-700';
            return `<div class="flex-grow ${color} opacity-60 rounded-t-sm transition-all duration-300" style="height: ${height}px"></div>`;
        }).join('');
    }

    // Anatomical Heart Pulse
    const dot = document.getElementById('hr-pulse-dot');
    if (dot) {
        const pulseSpeed = isOnline ? (60 / Math.max(40, appState.metrics.heartRate)) : 2;
        dot.style.animation = isOnline ? `pulse ${pulseSpeed}s infinite` : 'none';
        dot.style.opacity = isOnline ? "1" : "0.1";
    }
}

function drawWaveforms() {
    const ecgCtx = elements.ecgCanvas?.getContext('2d');
    const edaCtx = elements.edaCanvas?.getContext('2d');
    if (!ecgCtx || !edaCtx) return;

    const isOnline = appState.metrics.power === 1;
    const dpr = window.devicePixelRatio || 1;
    const w = elements.ecgCanvas.width / dpr;
    const h = 60;

    ecgCtx.clearRect(0, 0, w, h);
    ecgCtx.strokeStyle = isOnline ? '#ef4444' : '#334155';
    ecgCtx.lineWidth = 2;
    ecgCtx.beginPath();
    const speed = isOnline ? (appState.metrics.heartRate / 60) * 1.5 : 0.5;
    for (let i = 0; i < w; i++) {
        let t = (i + ecgOffset) % 100;
        let y = h / 2;
        if (isOnline) {
            if (t > 34 && t < 38) y -= (t-34) * 20; 
            else if (t > 38 && t < 42) y += (t-38) * 15;
        }
        if (i === 0) ecgCtx.moveTo(i, y); else ecgCtx.lineTo(i, y);
    }
    ecgCtx.stroke();
    ecgOffset += isOnline ? speed : 0.2;

    edaCtx.clearRect(0, 0, w, h);
    edaCtx.strokeStyle = isOnline ? '#3b82f6' : '#334155';
    edaCtx.lineWidth = 2;
    edaCtx.beginPath();
    for (let i = 0; i < w; i++) {
        let y = (h / 2) + Math.sin((i + edaOffset) * 0.04) * (isOnline ? 10 : 2);
        if (i === 0) edaCtx.moveTo(i, y); else edaCtx.lineTo(i, y);
    }
    edaCtx.stroke();
    edaOffset += 1.2;

    requestAnimationFrame(drawWaveforms);
}

/**
 * Blynk API
 */
async function fetchPinValue(pin) {
    try {
        const response = await fetch(`${BLYNK_BASE_URL}/get?token=${BLYNK_AUTH_TOKEN}&${pin}`);
        if (!response.ok) return null;
        let text = await response.text();
        // Sanitize string (remove quotes and whitespace)
        return text.replace(/"/g, '').trim();
    } catch (e) { return null; }
}

async function syncData() {
    const results = await Promise.all([
        fetchPinValue(V_PINS.masterPower), fetchPinValue(V_PINS.heartRate),
        fetchPinValue(V_PINS.spo2), fetchPinValue(V_PINS.temp),
        fetchPinValue(V_PINS.statusText), fetchPinValue(V_PINS.sleepState),
        fetchPinValue(V_PINS.sleepQuality)
    ]);
    
    // Explicitly check for power value "1"
    if (results[0] !== null) {
        appState.metrics.power = results[0] === "1" ? 1 : 0;
    } else {
        appState.metrics.power = 0; // Default to standby if fetch fails
    }

    if (results[1] !== null) appState.metrics.heartRate = parseInt(results[1]) || 0;
    if (results[2] !== null) appState.metrics.spo2 = parseInt(results[2]) || 0;
    if (results[3] !== null) appState.metrics.temp = parseFloat(results[3]) || 0;
    
    // Normalize V6: Only keep ACTIVE or STILL (no "READY" or others)
    if (results[4] !== null) {
        const rawStatus = results[4].toUpperCase();
        appState.metrics.status = rawStatus.includes("ACTIVE") ? "ACTIVE" : "STILL";
    }
    
    if (results[5] !== null) appState.metrics.sleepState = parseInt(results[5]) || 0;
    if (results[6] !== null) appState.metrics.sleepQuality = parseInt(results[6]) || 0;
    
    updateUI();
    if (appState.metrics.power === 1) recordSnapshot();
}

/**
 * Initialization
 */
document.addEventListener('DOMContentLoaded', () => {
    elements = {
        v1Text: document.getElementById('v1-text'),
        v1Dot: document.getElementById('v1-dot'),
        v2: document.getElementById('v2-value'),
        v3: document.getElementById('v3-value'),
        v4: document.getElementById('v4-value'),
        v6Status: document.getElementById('v6-status'),
        v7Text: document.getElementById('v7-text'),
        v8: document.getElementById('v8-value'),
        lastUpdated: document.getElementById('last-updated'),
        logCounter: document.getElementById('log-counter'),
        age: document.getElementById('local-age'),
        height: document.getElementById('local-height'),
        weight: document.getElementById('local-weight'),
        bmi: document.getElementById('local-bmi'),
        ecgCanvas: document.getElementById('ecg-canvas'),
        edaCanvas: document.getElementById('eda-canvas'),
        sleepHistContainer: document.getElementById('sleep-graph'),
        downloadBtn: document.getElementById('download-btn-trigger'),
        countdown: document.getElementById('next-log-countdown')
    };

    // Canvas Scaling
    const dpr = window.devicePixelRatio || 1;
    [elements.ecgCanvas, elements.edaCanvas].forEach(c => {
        if (!c) return;
        const rect = c.getBoundingClientRect();
        c.width = rect.width * dpr;
        c.height = 60 * dpr;
        c.getContext('2d').scale(dpr, dpr);
    });

    // Local Storage Recovery
    const savedVitals = localStorage.getItem('diginurse_vitals');
    if (savedVitals) {
        try {
            const d = JSON.parse(savedVitals);
            elements.age.value = d.age || 32;
            elements.height.value = d.height || 189;
            elements.weight.value = d.weight || 85.5;
        } catch(e) {}
    }

    // Event Bindings
    elements.downloadBtn?.addEventListener('click', () => {
        if (appState.dataLog.length === 0) { alert("Log is empty."); return; }
        let report = "DIGINURSE TELEMETRY LOG\n";
        appState.dataLog.forEach(e => {
            // Convert stored UTC ISO timestamp to local time string to match the dashboard table
            const localTimestamp = new Date(e.timestamp).toLocaleString();
            report += `${localTimestamp} | HR:${e.hr} | SPO2:${e.spo2}% | T:${Number(e.temp).toFixed(2)} | SQ:${e.sleepQuality}% | ${e.status}\n`;
        });
        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `DigiNurse_Log_${Date.now()}.txt`;
        a.click();
    });

    [elements.age, elements.height, elements.weight].forEach(el => el?.addEventListener('input', () => {
        const h = parseFloat(elements.height.value) / 100;
        const w = parseFloat(elements.weight.value);
        if (h > 0) elements.bmi.textContent = (w / (h * h)).toFixed(1);
        
        localStorage.setItem('diginurse_vitals', JSON.stringify({
            age: elements.age.value,
            height: elements.height.value,
            weight: elements.weight.value
        }));
    }));

    drawWaveforms();
    syncData();
    setInterval(syncData, 3000);
});