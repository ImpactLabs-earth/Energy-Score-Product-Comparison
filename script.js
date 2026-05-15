// Product Database
const products = {
    fridge: {
        id: 'fridge',
        name: "Refrigerator",
        icon: "❄️",
        mfgCo2: 300,
        defaults: {
            f1: { price: 300, label: 'F', kwh: 300 },
            f2: { price: 800, label: 'A', kwh: 100 }
        }
    },
    washing_machine: {
        id: 'washing_machine',
        name: "Washing Machine",
        icon: "🧺",
        mfgCo2: 250,
        defaults: {
            f1: { price: 250, label: 'E', kwh: 220 },
            f2: { price: 600, label: 'A', kwh: 110 }
        }
    },
    dishwasher: {
        id: 'dishwasher',
        name: "Dishwasher",
        icon: "🍽️",
        mfgCo2: 200,
        defaults: {
            f1: { price: 250, label: 'F', kwh: 250 },
            f2: { price: 700, label: 'B', kwh: 150 }
        }
    },
    tv: {
        id: 'tv',
        name: "Television",
        icon: "📺",
        mfgCo2: 400,
        defaults: {
            f1: { price: 300, label: 'G', kwh: 150 },
            f2: { price: 1000, label: 'C', kwh: 80 }
        }
    }
};

let currentProduct = 'fridge';

// Generate product grid dynamically
const productGrid = document.getElementById('product-grid');
Object.values(products).forEach(prod => {
    const div = document.createElement('div');
    div.className = `product-item ${prod.id === currentProduct ? 'active' : ''}`;
    div.dataset.id = prod.id;
    div.innerHTML = `
        <div class="product-icon">${prod.icon}</div>
        <div class="product-name">${prod.name}</div>
    `;
    div.addEventListener('click', () => selectProduct(prod.id));
    productGrid.appendChild(div);
});

function selectProduct(id) {
    currentProduct = id;
    
    // Update active class
    document.querySelectorAll('.product-item').forEach(el => {
        el.classList.toggle('active', el.dataset.id === id);
    });

    const prod = products[id];
    
    // Update titles
    document.getElementById('title-a').textContent = `${prod.name} A`;
    document.getElementById('title-b').textContent = `${prod.name} B`;
    
    // Update global settings
    document.getElementById('mfg-co2').value = prod.mfgCo2;
    
    // Update inputs F1
    document.getElementById('f1-price').value = prod.defaults.f1.price;
    document.getElementById('f1-label').value = prod.defaults.f1.label;
    document.getElementById('f1-kwh').value = prod.defaults.f1.kwh;
    
    // Update inputs F2
    document.getElementById('f2-price').value = prod.defaults.f2.price;
    document.getElementById('f2-label').value = prod.defaults.f2.label;
    document.getElementById('f2-kwh').value = prod.defaults.f2.kwh;

    // Hide results if we change product category to avoid stale data
    document.getElementById('results').classList.add('hidden');
}


// Data mapping for Energy Label generic consumption (optional UX sync)
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
const mfgCo2Input = document.getElementById('mfg-co2');

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

// Auto-fill kWh based on label change if desired (simple logic for now)
f1LabelInput.addEventListener('change', (e) => {
    // Optional scaling
});

calculateBtn.addEventListener('click', calculateImpact);

function calculateImpact() {
    const elecPrice = parseFloat(elecPriceInput.value);
    const co2Intensity = parseFloat(co2IntensityInput.value);
    const mfgCo2 = parseFloat(mfgCo2Input.value); // Base manufacturing impact

    const f1Price = parseFloat(f1PriceInput.value);
    const f1Kwh = parseFloat(f1KwhInput.value);
    
    const f2Price = parseFloat(f2PriceInput.value);
    const f2Kwh = parseFloat(f2KwhInput.value);
    
    const prodName = products[currentProduct].name;

    // Calculate over 10 years
    const years = Array.from({length: 11}, (_, i) => i); // 0 to 10
    
    // Financial Cost Arrays
    const f1Cost = years.map(y => f1Price + (y * f1Kwh * elecPrice));
    const f2Cost = years.map(y => f2Price + (y * f2Kwh * elecPrice));

    // CO2 Emissions Arrays (Now including manufacturing CO2 at year 0!)
    const f1Co2 = years.map(y => mfgCo2 + (y * f1Kwh * co2Intensity));
    const f2Co2 = years.map(y => mfgCo2 + (y * f2Kwh * co2Intensity));

    // Find break-even point financially
    let breakEvenYear = -1;
    for (let y = 1; y <= 10; y++) {
        if (f1Cost[y] > f2Cost[y] && f1Cost[y-1] <= f2Cost[y-1]) {
            breakEvenYear = y;
            break;
        } else if (f2Cost[y] > f1Cost[y] && f2Cost[y-1] <= f1Cost[y-1]) {
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
        
        let msg = `Option B is more expensive upfront, but saves you money in the long run. `;
        if (breakEvenYear !== -1) {
            msg += `It pays for itself in year ${breakEvenYear}. `;
        }
        msg += `Over 10 years, you save €${(totalCostF1 - totalCostF2).toFixed(2)} and prevent ${(f1Co2[10] - f2Co2[10]).toFixed(1)} kg of CO₂ emissions.`;
        verdictText.textContent = msg;
    } else {
        verdictTitle.textContent = "Alternative might not be worth it financially";
        verdictTitle.style.color = "#fca5a5";
        
        verdictText.textContent = `Over 10 years, Option A remains €${(totalCostF2 - totalCostF1).toFixed(2)} cheaper. However, Option B saves ${(f1Co2[10] - f2Co2[10]).toFixed(1)} kg of CO₂. Consider your environmental impact vs budget.`;
    }

    // Show results
    resultsContainer.classList.remove('hidden');

    // Render Charts
    renderCostChart(years, f1Cost, f2Cost, prodName);
    renderCo2Chart(years, f1Co2, f2Co2, prodName);
}

function renderCostChart(labels, dataA, dataB, prodName) {
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
                    label: `${prodName} A (Standard)`,
                    data: dataA,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                },
                {
                    label: `${prodName} B (Alternative)`,
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

function renderCo2Chart(labels, dataA, dataB, prodName) {
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
                    label: `${prodName} A (Standard)`,
                    data: dataA,
                    borderColor: '#ef4444',
                    borderDash: [5, 5],
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    tension: 0.3
                },
                {
                    label: `${prodName} B (Alternative)`,
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

// Initial setup to match HTML defaults
selectProduct('fridge');
