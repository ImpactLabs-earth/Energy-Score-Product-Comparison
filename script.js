// Data mapping for Energy Label generic consumption (if we wanted to auto-fill)
const labelToKwh = {
    'A': 100,
    'B': 130,
    'C': 160,
    'D': 200,
    'E': 250,
    'F': 300,
    'G': 350
};

// Elements
const elecPriceInput = document.getElementById('elec-price');
const co2IntensityInput = document.getElementById('co2-intensity');

const f1PriceInput = document.getElementById('f1-price');
const f1LabelInput = document.getElementById('f1-label');
const f1KwhInput = document.getElementById('f1-kwh');

const f2PriceInput = document.getElementById('f2-price');
const f2LabelInput = document.getElementById('f2-label');
const f2KwhInput = document.getElementById('f2-kwh');

const calculateBtn = document.getElementById('calculate-btn');
const resultsContainer = document.getElementById('results');
const verdictTitle = document.getElementById('verdict-title');
const verdictText = document.getElementById('verdict-text');

// Charts instances
let costChartInstance = null;
let co2ChartInstance = null;

// Auto-fill kWh based on label change (Optional UX improvement)
f1LabelInput.addEventListener('change', (e) => {
    f1KwhInput.value = labelToKwh[e.target.value];
});
f2LabelInput.addEventListener('change', (e) => {
    f2KwhInput.value = labelToKwh[e.target.value];
});

calculateBtn.addEventListener('click', calculateImpact);

function calculateImpact() {
    const elecPrice = parseFloat(elecPriceInput.value);
    const co2Intensity = parseFloat(co2IntensityInput.value);

    const f1Price = parseFloat(f1PriceInput.value);
    const f1Kwh = parseFloat(f1KwhInput.value);

    const f2Price = parseFloat(f2PriceInput.value);
    const f2Kwh = parseFloat(f2KwhInput.value);

    // Calculate over 10 years
    const years = Array.from({ length: 11 }, (_, i) => i); // 0 to 10

    // Financial Cost Arrays
    const f1Cost = years.map(y => f1Price + (y * f1Kwh * elecPrice));
    const f2Cost = years.map(y => f2Price + (y * f2Kwh * elecPrice));

    // CO2 Emissions Arrays
    const f1Co2 = years.map(y => y * f1Kwh * co2Intensity);
    const f2Co2 = years.map(y => y * f2Kwh * co2Intensity);

    // Find break-even point financially
    let breakEvenYear = -1;
    for (let y = 1; y <= 10; y++) {
        if (f1Cost[y] > f2Cost[y] && f1Cost[y - 1] <= f2Cost[y - 1]) {
            breakEvenYear = y;
            break;
        } else if (f2Cost[y] > f1Cost[y] && f2Cost[y - 1] <= f1Cost[y - 1]) {
            breakEvenYear = y;
            break;
        }
    }

    // Determine verdict
    const totalCostF1 = f1Cost[10];
    const totalCostF2 = f2Cost[10];

    if (totalCostF2 < totalCostF1) {
        verdictTitle.textContent = "Great Investment!";
        verdictTitle.style.color = "#34d399";

        let msg = `Fridge B is more expensive upfront, but saves you money in the long run. `;
        if (breakEvenYear !== -1) {
            msg += `It pays for itself in year ${breakEvenYear}. `;
        }
        msg += `Over 10 years, you save €${(totalCostF1 - totalCostF2).toFixed(2)} and prevent ${(f1Co2[10] - f2Co2[10]).toFixed(1)} kg of CO₂ emissions.`;
        verdictText.textContent = msg;
    } else {
        verdictTitle.textContent = "Alternative might not be worth it financially";
        verdictTitle.style.color = "#fca5a5";

        verdictText.textContent = `Over 10 years, Fridge A remains €${(totalCostF2 - totalCostF1).toFixed(2)} cheaper. However, Fridge B saves ${(f1Co2[10] - f2Co2[10]).toFixed(1)} kg of CO₂. Consider your environmental impact vs budget.`;
    }

    // Show results
    resultsContainer.classList.remove('hidden');

    // Render Charts
    renderCostChart(years, f1Cost, f2Cost);
    renderCo2Chart(years, f1Co2, f2Co2);
}

function renderCostChart(labels, dataA, dataB) {
    const ctx = document.getElementById('costChart').getContext('2d');

    if (costChartInstance) {
        costChartInstance.destroy();
    }

    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = 'Inter';

    costChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.map(l => l === 0 ? 'Now' : `Year ${l}`),
            datasets: [
                {
                    label: 'Fridge A',
                    data: dataA,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Fridge B',
                    data: dataB,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                tooltip: {
                    callbacks: {
                        label: (context) => `€${context.parsed.y.toFixed(2)}`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                },
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                }
            }
        }
    });
}

function renderCo2Chart(labels, dataA, dataB) {
    const ctx = document.getElementById('co2Chart').getContext('2d');

    if (co2ChartInstance) {
        co2ChartInstance.destroy();
    }

    co2ChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.map(l => l === 0 ? 'Now' : `Year ${l}`),
            datasets: [
                {
                    label: 'Fridge A',
                    data: dataA,
                    borderColor: '#ef4444',
                    borderDash: [5, 5],
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    tension: 0.3
                },
                {
                    label: 'Fridge B',
                    data: dataB,
                    borderColor: '#10b981',
                    borderDash: [5, 5],
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.parsed.y.toFixed(1)} kg`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                },
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                }
            }
        }
    });
}
