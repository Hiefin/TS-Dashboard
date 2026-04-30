import { collectEvent, getEvents, getBuckets, tickBucket, } from './collector.js';
import { initCharts, updateCharts, EVENT_TYPES, EVENT_COLORS, } from './chart.js';
// Elements 
const sparkCanvas = document.getElementById('sparkChart');
const donutCanvas = document.getElementById('donutChart');
const totalEl = document.getElementById('m-total');
const rateEl = document.getElementById('m-rate');
const errEl = document.getElementById('m-err');
const pagesEl = document.getElementById('m-pages');
const tbody = document.getElementById('event-body');
const barsEl = document.getElementById('pages-bars');
const legendEl = document.getElementById('donut-legend');
const typeSelect = document.getElementById('e-type');
const pageInput = document.getElementById('e-page');
const autoBtn = document.getElementById('btn-auto');
// Rendering fncs
function renderMetrics() {
    const events = getEvents();
    const now = Date.now();
    const total = events.length;
    const perMin = events.filter(e => now - e.ts < 60000).length;
    const errCount = events.filter(e => e.type === 'error').length;
    const errRate = total > 0 ? Math.round((errCount / total) * 100) : 0;
    const pages = new Set(events.map(e => e.page)).size;
    totalEl.textContent = String(total);
    rateEl.textContent = String(perMin);
    errEl.textContent = errRate + '%';
    pagesEl.textContent = String(pages);
}
function renderTable() {
    const events = getEvents().slice(-8).reverse();
    tbody.innerHTML = events.map(e => {
        const age = Math.round((Date.now() - e.ts) / 1000);
        return `<tr>
            <td><span class="tag tag-${e.type}">${e.type.replace('_', ' ')}</span></td>
            <td class="muted">${e.page}</td>
            <td class="muted">${age}s ago</td>
        </tr>`;
    }).join('') || `<tr><td colspan="3" class="muted">No events yet</td></tr>`;
}
function renderBars() {
    const events = getEvents();
    const counts = {};
    for (const e of events)
        counts[e.page] = (counts[e.page] ?? 0) + 1;
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const max = sorted[0]?.[1] ?? 1;
    barsEl.innerHTML = sorted.length === 0
        ? `<p class="muted">No data yet</p>`
        : sorted.map(([page, count]) => `
            <div class="bar-row">
                <span class="bar-label">${page}</span>
                <div class="bar-track">
                    <div class="bar-fill" style="width:${Math.round((count / max) * 100)}%"></div>
                </div>
                <span class="bar-count">${count}</span>
            </div>`).join('');
}
function renderLegend() {
    const events = getEvents();
    const total = events.length || 1;
    legendEl.innerHTML = EVENT_TYPES.map(type => {
        const count = events.filter(e => e.type === type).length;
        const pct = Math.round((count / total) * 100);
        return `<div class="legend-row">
            <div class="legend-dot" style="background:${EVENT_COLORS[type]}"></div>
            <span class="legend-name">${type.replace('_', ' ')}</span>
            <span class="legend-pct">${pct}%</span>
        </div>`;
    }).join('');
}
//Refresh all function
function updateAll() {
    updateCharts(getEvents(), getBuckets());
    renderMetrics();
    renderTable();
    renderBars();
    renderLegend();
}
// Need timer for the clicking attributes
let autoTimer = null;
const PAGES = ['/home', '/pricing', '/docs', '/blog', '/login', '/dashboard'];
const TYPES = ['page_view', 'page_view', 'page_view', 'ride_posted', 'ride_posted', 'error', 'seat_reserved', 'signup'];
function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
window.emitManual = function () {
    const type = typeSelect.value;
    const page = pageInput.value.trim() || '/home';
    collectEvent(type, page);
    updateAll();
};
window.toggleAuto = function () {
    if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
        autoBtn.textContent = 'Auto: off';
        autoBtn.classList.remove('on');
    }
    else {
        autoTimer = setInterval(() => {
            collectEvent(randomFrom(TYPES), randomFrom(PAGES));
            updateAll();
        }, 600);
        autoBtn.textContent = 'Auto: on';
        autoBtn.classList.add('on');
    }
};
// ticks buckets every 5s
setInterval(() => {
    tickBucket();
    updateAll();
}, 5000);
// for startup
initCharts(sparkCanvas, donutCanvas);
// seed a handful of events so the page isn't empty on load
const seeds = [
    ['page_view', '/home'],
    ['page_view', '/pricing'],
    ['seat_reserved', '/pricing'],
    ['signup', '/pricing'],
    ['page_view', '/dashboard'],
    ['error', '/dashboard'],
    ['ride_posted', '/pricing'],
    ['seat_reserved', '/home'],
];
seeds.forEach(([type, page]) => collectEvent(type, page));
updateAll();
