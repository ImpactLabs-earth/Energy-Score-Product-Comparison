// Product Database
const products = {
    fridge: {
        id: 'fridge',
        name: "Refrigerator",
        icon: "❄️",
        mfgCo2: 257,
        classes: {
            A: { kwh: 105, price: 1100, lifetime: 15 },
            B: { kwh: 130, price: 950, lifetime: 14 },
            C: { kwh: 160, price: 800, lifetime: 13 },
            D: { kwh: 200, price: 650, lifetime: 12 },
            E: { kwh: 240, price: 500, lifetime: 11 },
            F: { kwh: 290, price: 400, lifetime: 10 },
            G: { kwh: 350, price: 320, lifetime: 9 }
        },
        defaults: {
            f1: { label: 'F' },
            f2: { label: 'A' }
        }
    },
    washing_machine: {
        id: 'washing_machine',
        name: "Washing Machine",
        icon: "🧺",
        mfgCo2: 342,
        classes: {
            A: { kwh: 48, price: 850, lifetime: 15 },
            B: { kwh: 54, price: 700, lifetime: 14 },
            C: { kwh: 62, price: 550, lifetime: 13 },
            D: { kwh: 69, price: 480, lifetime: 12 },
            E: { kwh: 76, price: 420, lifetime: 11 },
            F: { kwh: 83, price: 380, lifetime: 10 },
            G: { kwh: 92, price: 330, lifetime: 9 }
        },
        defaults: {
            f1: { label: 'E' },
            f2: { label: 'A' }
        }
    },
    dishwasher: {
        id: 'dishwasher',
        name: "Dishwasher",
        icon: "🍽️",
        mfgCo2: 271,
        classes: {
            A: { kwh: 54, price: 950, lifetime: 15 },
            B: { kwh: 64, price: 800, lifetime: 14 },
            C: { kwh: 74, price: 650, lifetime: 13 },
            D: { kwh: 84, price: 550, lifetime: 12 },
            E: { kwh: 94, price: 450, lifetime: 11 },
            F: { kwh: 104, price: 400, lifetime: 10 },
            G: { kwh: 115, price: 350, lifetime: 9 }
        },
        defaults: {
            f1: { label: 'F' },
            f2: { label: 'B' }
        }
    },
    tv: {
        id: 'tv',
        name: "Television",
        icon: "📺",
        mfgCo2: 555,
        classes: {
            A: { kwh: 35, price: 1500, lifetime: 15 },
            B: { kwh: 45, price: 1200, lifetime: 14 },
            C: { kwh: 55, price: 1000, lifetime: 13 },
            D: { kwh: 65, price: 850, lifetime: 12 },
            E: { kwh: 80, price: 700, lifetime: 11 },
            F: { kwh: 100, price: 550, lifetime: 10 },
            G: { kwh: 130, price: 450, lifetime: 9 }
        },
        defaults: {
            f1: { label: 'G' },
            f2: { label: 'C' }
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

// Elements
const countrySelect = document.getElementById('country');
const elecPriceInput = document.getElementById('elec-price');
const co2IntensityInput = document.getElementById('co2-intensity');
const mfgCo2Input = document.getElementById('mfg-co2');

const f1PriceInput = document.getElementById('f1-price');
const f1LabelInput = document.getElementById('f1-label');
const f1KwhInput = document.getElementById('f1-kwh');
const f1LifetimeInput = document.getElementById('f1-lifetime');

const f2PriceInput = document.getElementById('f2-price');
const f2LabelInput = document.getElementById('f2-label');
const f2KwhInput = document.getElementById('f2-kwh');
const f2LifetimeInput = document.getElementById('f2-lifetime');

const calculateBtn = document.getElementById('calculate-btn');
const resultsContainer = document.getElementById('results');
const verdictTitle = document.getElementById('verdict-title');
const verdictText = document.getElementById('verdict-text');

// Charts instances
let costChartInstance = null;
let co2ChartInstance = null;

function selectProduct(id) {
    currentProduct = id;
    
    document.querySelectorAll('.product-item').forEach(el => {
        el.classList.toggle('active', el.dataset.id === id);
    });

    const prod = products[id];
    
    document.getElementById('title-a').textContent = `${prod.name} A`;
    document.getElementById('title-b').textContent = `${prod.name} B`;
    mfgCo2Input.value = prod.mfgCo2;
    
    const label1 = prod.defaults.f1.label;
    f1LabelInput.value = label1;
    f1PriceInput.value = prod.classes[label1].price;
    f1KwhInput.value = prod.classes[label1].kwh;
    f1LifetimeInput.value = prod.classes[label1].lifetime;
    
    const label2 = prod.defaults.f2.label;
    f2LabelInput.value = label2;
    f2PriceInput.value = prod.classes[label2].price;
    f2KwhInput.value = prod.classes[label2].kwh;
    f2LifetimeInput.value = prod.classes[label2].lifetime;

    resultsContainer.classList.add('hidden');
}

f1LabelInput.addEventListener('change', (e) => {
    const label = e.target.value;
    const prod = products[currentProduct];
    if (prod && prod.classes[label]) {
        f1PriceInput.value = prod.classes[label].price;
        f1KwhInput.value = prod.classes[label].kwh;
        f1LifetimeInput.value = prod.classes[label].lifetime;
    }
});

f2LabelInput.addEventListener('change', (e) => {
    const label = e.target.value;
    const prod = products[currentProduct];
    if (prod && prod.classes[label]) {
        f2PriceInput.value = prod.classes[label].price;
        f2KwhInput.value = prod.classes[label].kwh;
        f2LifetimeInput.value = prod.classes[label].lifetime;
    }
});

countrySelect.addEventListener('change', (e) => {
    co2IntensityInput.value = e.target.value;
});

calculateBtn.addEventListener('click', calculateImpact);

function calculateImpact() {
    const elecPrice = parseFloat(elecPriceInput.value);
    const co2Intensity = parseFloat(co2IntensityInput.value);
    const mfgCo2 = parseFloat(mfgCo2Input.value);

    const f1Price = parseFloat(f1PriceInput.value);
    const f1Kwh = parseFloat(f1KwhInput.value);
    const f1Lifetime = parseInt(f1LifetimeInput.value, 10) || 10;
    
    const f2Price = parseFloat(f2PriceInput.value);
    const f2Kwh = parseFloat(f2KwhInput.value);
    const f2Lifetime = parseInt(f2LifetimeInput.value, 10) || 10;
    
    const prodName = products[currentProduct].name;

    // Calculate over 20 years to better show replacement impact
    const years = Array.from({length: 21}, (_, i) => i);
    
    const f1Cost = years.map(y => {
        // Number of times purchased up to year y
        const buys = Math.floor(y / f1Lifetime) + 1;
        return (f1Price * buys) + (y * f1Kwh * elecPrice);
    });
    
    const f2Cost = years.map(y => {
        const buys = Math.floor(y / f2Lifetime) + 1;
        return (f2Price * buys) + (y * f2Kwh * elecPrice);
    });

    const f1Co2 = years.map(y => {
        const buys = Math.floor(y / f1Lifetime) + 1;
        return (mfgCo2 * buys) + (y * f1Kwh * co2Intensity);
    });
    
    const f2Co2 = years.map(y => {
        const buys = Math.floor(y / f2Lifetime) + 1;
        return (mfgCo2 * buys) + (y * f2Kwh * co2Intensity);
    });

    let breakEvenYear = -1;
    for (let y = 1; y <= 20; y++) {
        if (f1Cost[y] > f2Cost[y] && f1Cost[y-1] <= f2Cost[y-1]) {
            breakEvenYear = y;
            break;
        } else if (f2Cost[y] > f1Cost[y] && f2Cost[y-1] <= f1Cost[y-1]) {
            breakEvenYear = y;
            break;
        }
    }

    const totalCostF1 = f1Cost[20];
    const totalCostF2 = f2Cost[20];
    
    if (totalCostF2 < totalCostF1) {
        verdictTitle.textContent = "Great Investment!";
        verdictTitle.style.color = "#34d399";
        
        let msg = `Option B saves you money in the long run. `;
        if (breakEvenYear !== -1) {
            msg += `It pays for itself in year ${breakEvenYear}. `;
        }
        msg += `Over 20 years, you save €${(totalCostF1 - totalCostF2).toFixed(2)} and prevent ${(f1Co2[20] - f2Co2[20]).toFixed(1)} kg of CO₂.`;
        verdictText.textContent = msg;
    } else {
        verdictTitle.textContent = "Alternative might not be worth it financially";
        verdictTitle.style.color = "#fca5a5";
        
        verdictText.textContent = `Over 20 years, Option A remains €${(totalCostF2 - totalCostF1).toFixed(2)} cheaper. However, Option B saves ${(f1Co2[20] - f2Co2[20]).toFixed(1)} kg of CO₂.`;
    }

    resultsContainer.classList.remove('hidden');

    renderCostChart(years, f1Cost, f2Cost, prodName);
    renderCo2Chart(years, f1Co2, f2Co2, prodName);
}

function renderCostChart(labels, dataA, dataB, prodName) {
    const ctx = document.getElementById('costChart').getContext('2d');
    if (costChartInstance) costChartInstance.destroy();
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
                    tension: 0,
                    stepped: 'middle' // shows jumps nicely when buying new appliance
                },
                {
                    label: `${prodName} B (Alternative)`,
                    data: dataB,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    tension: 0,
                    stepped: 'middle'
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                tooltip: { callbacks: { label: (context) => `€${context.parsed.y.toFixed(2)}` } }
            },
            scales: {
                y: { beginAtZero: false, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
                x: { grid: { color: 'rgba(255, 255, 255, 0.05)' } }
            }
        }
    });
}

function renderCo2Chart(labels, dataA, dataB, prodName) {
    const ctx = document.getElementById('co2Chart').getContext('2d');
    if (co2ChartInstance) co2ChartInstance.destroy();

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
                    tension: 0,
                    stepped: 'middle'
                },
                {
                    label: `${prodName} B (Alternative)`,
                    data: dataB,
                    borderColor: '#10b981',
                    borderDash: [5, 5],
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    tension: 0,
                    stepped: 'middle'
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                tooltip: { callbacks: { label: (context) => `${context.parsed.y.toFixed(1)} kg` } }
            },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
                x: { grid: { color: 'rgba(255, 255, 255, 0.05)' } }
            }
        }
    });
}

selectProduct('fridge');
