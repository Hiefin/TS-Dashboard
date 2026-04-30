let sparkChart = null;
let donutChart = null;
export const EVENT_TYPES = [
    'page_view', 'ride_posted', 'error', 'seat_reserved', 'signup'
];
export const EVENT_COLORS = {
    page_view: '#e68270',
    ride_posted: '#7ee670',
    error: '#e670d8',
    seat_reserved: '#70e2e6',
    signup: '#7072e6'
};
export function initCharts(sparkCanvas, donutCanvas) {
    const labels = Array.from({ length: 20 }, (_, i) => i === 19 ? 'now' : `-${(19 - i) * 5}s`);
    sparkChart = new Chart(sparkCanvas, {
        type: 'line', data: {
            labels: labels,
            datasets: [{
                    data: new Array(20).fill(0),
                    borderColor: '#4f86c6',
                    backgroundColor: 'rgba(50,102,173,0.08)',
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: true,
                    tension: 0.4,
                }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 250 },
            plugins: { legend: { display: false } },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { maxTicksLimit: 5, maxRotation: 0 },
                },
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0 },
                },
            },
        },
    });
    // Donut Chart
    donutChart = new Chart(donutCanvas, {
        type: 'doughnut', data: {
            labels: EVENT_TYPES,
            datasets: [{
                    // start with equal slices so chart isn't empty on load
                    data: EVENT_TYPES.map(() => 1),
                    backgroundColor: EVENT_TYPES.map(t => EVENT_COLORS[t]),
                    borderWidth: 0,
                    hoverOffset: 4,
                }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            animation: { duration: 250 },
            plugins: { legend: { display: false } },
            cutout: '60%',
        },
    });
}
// Called after every event
export function updateCharts(events, buckets) {
    if (!sparkChart || !donutChart)
        return;
    // sparkline replace all 20 bucket counts
    sparkChart.data.datasets[0].data = buckets;
    sparkChart.update('none');
    // donut - count each ammount of type's
    const counts = EVENT_TYPES.map(type => events.filter(e => e.type === type).length);
    donutChart.data.datasets[0].data = counts;
    donutChart.update('none');
}
