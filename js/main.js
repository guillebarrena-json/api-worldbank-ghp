// 1. Lista de países estática o dinámica
const COUNTRIES = [
  { code: 'ARG', name: 'Argentina' },
  { code: 'BRA', name: 'Brasil' },
  { code: 'CHN', name: 'China' },
  { code: 'USA', name: 'Estados Unidos' },
  // … añade los que quieras
];

const countrySelect  = document.getElementById('country');
const indicatorSelect = document.getElementById('indicator');
const form           = document.getElementById('controls');
let chartInstance    = null;

// Poblar dropdown de países
function initCountryDropdown() {
  COUNTRIES.forEach(({ code, name }) => {
    const opt = document.createElement('option');
    opt.value = code;
    opt.textContent = name;
    countrySelect.append(opt);
  });
}

// Petición a la API y extracción de datos
async function fetchTimeSeries(country, indicator) {
  const url = `https://api.worldbank.org/v2/country/${country}/indicator/${indicator}?format=json&per_page=1000`;
  const res = await fetch(url);
  const [meta, data] = await res.json();
  return data
    .filter(d => d.value !== null)
    .map(d => ({ year: +d.date, value: +d.value }))
    .sort((a, b) => a.year - b.year);
}

// Renderizar o actualizar gráfico de líneas
function renderChart(dataset, label) {
  const ctx = document.getElementById('timeSeriesChart').getContext('2d');
  const labels = dataset.map(d => d.year);
  const values = dataset.map(d => d.value);

  const config = {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label,
        data: values,
        fill: false,
        tension: 0.1
      }]
    },
    options: {
      scales: {
        x: { title: { display: true, text: 'Año' } },
        y: { title: { display: true, text: label } }
      }
    }
  };

  if (chartInstance) {
    chartInstance.data   = config.data;
    chartInstance.options = config.options;
    chartInstance.update();
  } else {
    chartInstance = new Chart(ctx, config);
  }
}

// Manejo del submit
form.addEventListener('submit', async e => {
  e.preventDefault();
  const country   = countrySelect.value;
  const indicator = indicatorSelect.value;
  const labelText = indicatorSelect.options[indicatorSelect.selectedIndex].text;

  // Mostrar “cargando…” o bloquea el botón si lo deseas
  const data = await fetchTimeSeries(country, indicator);
  renderChart(data, labelText);
});

// Inicialización
initCountryDropdown();
