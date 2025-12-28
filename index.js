
const BLYNK_AUTH_TOKEN = 'uXKhBrB_1_wQO6s-w0QD5F-fgN1qM8TX';
const BLYNK_BASE_URL = 'https://blynk.cloud/external/api';

const V_PINS = {
    steps: 'V1',
    heartRate: 'V2',
    spo2: 'V3',
    temp: 'V4',
    scanStatus: 'V5'
};

let appState = {
    metrics: {
        steps: 0,
        heartRate: 0,
        spo2: 0,
        temp: 0,
        scanStatus: 0
    },
    history: Array(40).fill(0)
};

// UI Elements
const v1El = document.getElementById('v1-value');
const v2El = document.getElementById('v2-value');
const v3El = document.getElementById('v3-value');
const v4El = document.getElementById('v4-value');
const v5Text = document.getElementById('v5-text');
const v5Dot = document.getElementById('v5-dot');
const lastUpdatedEl = document.getElementById('last-updated');
const scanRing = document.getElementById('scan-ring');

// Canvas references
const ecgCanvas = document.getElementById('ecg-canvas');
const edaCanvas = document.getElementById('eda-canvas');
const ecgCtx = ecgCanvas?.getContext('2d');
const edaCtx = edaCanvas?.getContext('2d');

let ecgOffset = 0;
let edaOffset = 0;

/**
 * Initialize Canvas scaling with High DPI support
 */
function initCanvas() {
    if (ecgCanvas && edaCanvas) {
        const dpr = window.devicePixelRatio || 1;
        const rect1 = ecgCanvas.getBoundingClientRect();
        ecgCanvas.width = rect1.width * dpr;
        ecgCanvas.height = 60 * dpr;
        ecgCtx?.scale(dpr, dpr);

        const rect2 = edaCanvas.getBoundingClientRect();
        edaCanvas.width = rect2.width * dpr;
        edaCanvas.height = 60 * dpr;
        edaCtx?.scale(dpr, dpr);
    }
}

/**
 * Draw ECG Waveform (Heart Rate V2)
 */
function drawECG() {
    if (!ecgCtx) return;
    const ctx = ecgCtx;
    const w = ecgCanvas.width / (window.devicePixelRatio || 1);
    const h = 60;
    
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(16,185,129,0.3)';
    ctx.beginPath();
    
    const hr = appState.metrics.heartRate || 72;
    const speed = (hr / 60) * 1.5;
    
    for (let i = 0; i < w; i++) {
        let x = i;
        let t = (i + ecgOffset) % 100;
        let y = h / 2;
        
        // PQRST Complex
        if (t > 10 && t < 20) y -= Math.sin((t-10) * Math.PI / 10) * 3; // P
        else if (t > 30 && t < 34) y += (t-30) * 4; // Q
        else if (t > 34 && t < 38) y -= (t-34) * 20; // R
        else if (t > 38 && t < 42) y += (t-38) * 15; // S
        else if (t > 60 && t < 80) y -= Math.sin((t-60) * Math.PI / 20) * 5; // T
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ecgOffset += speed;
    requestAnimationFrame(drawECG);
}

/**
 * Draw SpO2 Waveform (V3) - Plethysmograph style
 */
function drawEDA() {
    if (!edaCtx) return;
    const ctx = edaCtx;
    const w = edaCanvas.width / (window.devicePixelRatio || 1);
    const h = 60;
    
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(34,211,238,0.3)';
    ctx.beginPath();
    
    const spo2 = appState.metrics.spo2 || 98;
    const amp = 8 + (spo2 / 20);

    for (let i = 0; i < w; i++) {
        let x = i;
        let y = (h / 2) + Math.sin((i + edaOffset) * 0.04) * amp + Math.cos((i + edaOffset) * 0.02) * (amp/3);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
    edaOffset += 1.2;
    requestAnimationFrame(drawEDA);
}

/**
 * Update Movement Histogram with smoother transitions
 */
function updateHistogram() {
    const container = document.getElementById('hr-graph');
    if (!container) return;

    appState.history.shift();
    appState.history.push(appState.metrics.steps % 500); 
    
    container.innerHTML = appState.history.map(val => {
        const height = Math.max(3, (val / 500) * 60);
        const opacity = 0.1 + (val / 500) * 0.5;
        return `<div class="flex-grow bg-slate-400 rounded-t-sm transition-all duration-500" style="height: ${height}px; opacity: ${opacity}"></div>`;
    }).join('');
}

/**
 * Update UI Elements with Blynk State
 */
function updateUI() {
    if(v1El) v1El.textContent = appState.metrics.steps.toLocaleString();
    if(v2El) v2El.textContent = appState.metrics.heartRate;
    if(v3El) v3El.textContent = appState.metrics.spo2;
    if(v4El) v4El.textContent = Number(appState.metrics.temp).toFixed(1);

    // V5 Logic (Link/Scan status)
    const isScanActive = appState.metrics.scanStatus > 0;
    if(v5Text) v5Text.textContent = isScanActive ? "PRECISION_SCAN_ACTIVE" : "ENCRYPTED_LINK_ACTIVE";
    if(v5Dot) v5Dot.className = isScanActive ? "w-2 h-2 bg-blue-400 rounded-full animate-ping shadow-[0_0_10px_#22d3ee]" : "w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]";
    if(scanRing) scanRing.style.opacity = isScanActive ? "0.6" : "0.1";

    // Dynamic Sidebar Status Bars
    const sidebar = document.getElementById('status-sidebar');
    if (sidebar) {
        const bars = sidebar.querySelectorAll('div');
        const hrLevel = Math.floor((appState.metrics.heartRate / 200) * 10);
        const spo2Level = Math.floor((appState.metrics.spo2 / 100) * 10);
        
        bars.forEach((bar, idx) => {
            // Split bars between SpO2 (top 5) and Heart Rate (bottom 5)
            if (idx < 5) { 
                const active = idx >= (5 - Math.ceil(spo2Level/2));
                bar.className = active ? "w-6 h-1 bg-cyan-500 rounded-sm shadow-[0_0_8px_rgba(34,211,238,0.6)]" : "w-6 h-1 bg-slate-800 rounded-sm";
            } else {
                const active = (idx - 5) >= (5 - Math.ceil(hrLevel/2));
                bar.className = active ? "w-6 h-1 bg-emerald-500 rounded-sm shadow-[0_0_8px_rgba(16,185,129,0.6)]" : "w-6 h-1 bg-slate-800 rounded-sm";
            }
        });
    }

    if(lastUpdatedEl) lastUpdatedEl.textContent = `LAST_TELEMETRY_SYNC: ${new Date().toLocaleTimeString()}`;
    updateHistogram();
}

/**
 * Fetch Pin from Blynk
 */
async function fetchPinValue(pin) {
    try {
        const url = `${BLYNK_BASE_URL}/get?token=${BLYNK_AUTH_TOKEN}&${pin}`;
        const response = await fetch(url);
        if (!response.ok) return null;
        const text = await response.text();
        return isNaN(text) ? 0 : Number(text);
    } catch (e) {
        return null;
    }
}

/**
 * Main Sync Loop
 */
async function syncData() {
    try {
        const results = await Promise.all([
            fetchPinValue(V_PINS.steps),
            fetchPinValue(V_PINS.heartRate),
            fetchPinValue(V_PINS.spo2),
            fetchPinValue(V_PINS.temp),
            fetchPinValue(V_PINS.scanStatus)
        ]);

        if (results[0] !== null) appState.metrics.steps = results[0];
        if (results[1] !== null) appState.metrics.heartRate = results[1];
        if (results[2] !== null) appState.metrics.spo2 = results[2];
        if (results[3] !== null) appState.metrics.temp = results[3];
        if (results[4] !== null) appState.metrics.scanStatus = results[4];

        updateUI();
    } catch (e) {
        console.warn("Blynk sync interrupted");
    }
}

// Initial Setup
window.addEventListener('resize', () => {
    initCanvas();
});

initCanvas();
drawECG();
drawEDA();
syncData();

// Frequent updates for smooth numbers, Blynk polling every 3s
setInterval(syncData, 3000);



//updated with connectivity 

// const BLYNK_AUTH_TOKEN = 'uXKhBrB_1_wQO6s-w0QD5F-fgN1qM8TX';
// const BLYNK_BASE_URL = 'https://blynk.cloud/external/api';

// const V_PINS = {
//     steps: 'V1',
//     heartRate: 'V2',
//     spo2: 'V3',
//     temp: 'V4',
//     scanStatus: 'V5' // Now used as Connectivity Status
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

// // Canvas references
// const ecgCanvas = document.getElementById('ecg-canvas');
// const edaCanvas = document.getElementById('eda-canvas');
// const ecgCtx = ecgCanvas?.getContext('2d');
// const edaCtx = edaCanvas?.getContext('2d');

// let ecgOffset = 0;
// let edaOffset = 0;

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
//         // Draw flatline if disconnected
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
        
//         // PQRST Complex
//         if (t > 10 && t < 20) y -= Math.sin((t-10) * Math.PI / 10) * 3; // P
//         else if (t > 30 && t < 34) y += (t-30) * 4; // Q
//         else if (t > 34 && t < 38) y -= (t-34) * 20; // R
//         else if (t > 38 && t < 42) y += (t-38) * 15; // S
//         else if (t > 60 && t < 80) y -= Math.sin((t-60) * Math.PI / 20) * 5; // T
        
//         if (i === 0) ctx.moveTo(x, y);
//         else ctx.lineTo(x, y);
//     }
//     ctx.stroke();
//     ecgOffset += speed;
//     requestAnimationFrame(drawECG);
// }

// /**
//  * Draw SpO2 Waveform (V3) - Plethysmograph style
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
//  * Update Movement Histogram with smoother transitions
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
//     if(v4El) v4El.textContent = isConnected ? Number(appState.metrics.temp).toFixed(1) : "--.-";

//     // V5 Logic (Connection status)
//     if(v5Text) {
//         v5Text.textContent = isConnected ? "DEVICE_CONNECTED" : "DEVICE_OFFLINE";
//         v5Text.className = isConnected ? "text-emerald-400 text-xs font-bold" : "text-rose-500 text-xs font-bold";
//     }
    
//     if(v5Dot) {
//         v5Dot.className = isConnected 
//             ? "w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" 
//             : "w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_10px_#f43f5e]";
//     }

//     // Viewport effects react to connection
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

//     // Dynamic Sidebar Status Bars
//     const sidebar = document.getElementById('status-sidebar');
//     if (sidebar) {
//         const bars = sidebar.querySelectorAll('div');
//         const hrLevel = isConnected ? Math.floor((appState.metrics.heartRate / 200) * 10) : 0;
//         const spo2Level = isConnected ? Math.floor((appState.metrics.spo2 / 100) * 10) : 0;
        
//         bars.forEach((bar, idx) => {
//             if (idx < 5) { 
//                 const active = isConnected && idx >= (5 - Math.ceil(spo2Level/2));
//                 bar.className = active ? "w-6 h-1 bg-cyan-500 rounded-sm shadow-[0_0_8px_rgba(34,211,238,0.6)]" : "w-6 h-1 bg-slate-800 rounded-sm";
//             } else {
//                 const active = isConnected && (idx - 5) >= (5 - Math.ceil(hrLevel/2));
//                 bar.className = active ? "w-6 h-1 bg-emerald-500 rounded-sm shadow-[0_0_8px_rgba(16,185,129,0.6)]" : "w-6 h-1 bg-slate-800 rounded-sm";
//             }
//         });
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
//         appState.metrics.scanStatus = 0; // Set to offline on error
//         updateUI();
//     }
// }

// // Initial Setup
// window.addEventListener('resize', () => {
//     initCanvas();
// });

// initCanvas();
// drawECG();
// drawEDA();
// syncData();

// // Frequent updates for smooth numbers, Blynk polling every 3s
// setInterval(syncData, 3000);
