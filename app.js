const fileInput = document.querySelector("#fileInput");
const companyNameInput = document.querySelector("#companyNameInput");
const companyLogoInput = document.querySelector("#companyLogoInput");
const dashboardColorInput = document.querySelector("#dashboardColorInput");
const themeColorInput = document.querySelector("#themeColorInput");
const accentColorInput = document.querySelector("#accentColorInput");
const themePresetBtns = document.querySelectorAll(".theme-preset");
const darkModeToggle = document.querySelector("#darkModeToggle");
const searchInput = document.querySelector("#searchInput");
const dateColumnSelect = document.querySelector("#dateColumnSelect");
const startDateInput = document.querySelector("#startDateInput");
const endDateInput = document.querySelector("#endDateInput");
const formulaNameInput = document.querySelector("#formulaNameInput");
const formulaExpressionInput = document.querySelector("#formulaExpressionInput");
const applyFormulaBtn = document.querySelector("#applyFormulaBtn");
const brandNameDisplay = document.querySelector("#brandNameDisplay");
const brandMark = document.querySelector("#brandMark");
const sampleBtn = document.querySelector("#sampleBtn");
const addRowBtn = document.querySelector("#addRowBtn");
const addColumnBtn = document.querySelector("#addColumnBtn");
const recommendChartBtn = document.querySelector("#recommendChartBtn");
const downloadCsvBtn = document.querySelector("#downloadCsvBtn");
const downloadExcelBtn = document.querySelector("#downloadExcelBtn");
const downloadDashboardBtn = document.querySelector("#downloadDashboardBtn");
const exportPdfBtn = document.querySelector("#exportPdfBtn");
const saveProjectBtn = document.querySelector("#saveProjectBtn");
const savedProjectSelect = document.querySelector("#savedProjectSelect");
const shareDashboardBtn = document.querySelector("#shareDashboardBtn");
const statusBox = document.querySelector("#status");
const datasetTitle = document.querySelector("#datasetTitle");
const datasetMeta = document.querySelector("#datasetMeta");
const rowCount = document.querySelector("#rowCount");
const columnCount = document.querySelector("#columnCount");
const numericCount = document.querySelector("#numericCount");
const totalValue = document.querySelector("#totalValue");
const categorySelect = document.querySelector("#categorySelect");
const valueSelect = document.querySelector("#valueSelect");
const customLabelSelect = document.querySelector("#customLabelSelect");
const customValueSelect = document.querySelector("#customValueSelect");
const customChartType = document.querySelector("#customChartType");
const table = document.querySelector("#dataTable");
const barChartHint = document.querySelector("#barChartHint");
const insightHint = document.querySelector("#insightHint");
const insightList = document.querySelector("#insightList");
const forecastHint = document.querySelector("#forecastHint");
const customCursor = document.querySelector("#customCursor");

let headers = [];
let rows = [];
let filteredRows = [];
let fileName = "dashboard-data";
let companyName = "SheetSight";
let companyLogo = "";
let theme = {
  dashboard: "#f3f6fb",
  primary: "#2563eb",
  accent: "#f59e0b"
};
let barChart;
let columnChart;
let customChart;
let forecastChart;
let draggedWidget = null;

const sampleRows = [
  { Date: "2026-01-01", Month: "January", Product: "Laptop", Region: "North", City: "Delhi", Sales: 42000, Quantity: 14 },
  { Date: "2026-02-01", Month: "February", Product: "Phone", Region: "West", City: "Mumbai", Sales: 31000, Quantity: 28 },
  { Date: "2026-03-01", Month: "March", Product: "Tablet", Region: "East", City: "Kolkata", Sales: 18000, Quantity: 19 },
  { Date: "2026-04-01", Month: "April", Product: "Laptop", Region: "South", City: "Bengaluru", Sales: 52000, Quantity: 17 },
  { Date: "2026-05-01", Month: "May", Product: "Phone", Region: "North", City: "Jaipur", Sales: 45000, Quantity: 35 },
  { Date: "2026-06-01", Month: "June", Product: "Tablet", Region: "West", City: "Pune", Sales: 24000, Quantity: 21 }
];

fileInput.addEventListener("change", handleFileUpload);
companyNameInput.addEventListener("input", updateBranding);
companyLogoInput.addEventListener("change", handleLogoUpload);
dashboardColorInput.addEventListener("input", updateThemeFromInputs);
themeColorInput.addEventListener("input", updateThemeFromInputs);
accentColorInput.addEventListener("input", updateThemeFromInputs);
themePresetBtns.forEach((button) => button.addEventListener("click", () => applyThemePreset(button)));
darkModeToggle.addEventListener("change", toggleDarkMode);
searchInput.addEventListener("input", applyFiltersAndRender);
dateColumnSelect.addEventListener("change", applyFiltersAndRender);
startDateInput.addEventListener("change", applyFiltersAndRender);
endDateInput.addEventListener("change", applyFiltersAndRender);
applyFormulaBtn.addEventListener("click", applyFormula);
sampleBtn.addEventListener("click", () => loadObjects(sampleRows, "Sample Sales Data"));
addRowBtn.addEventListener("click", addRow);
addColumnBtn.addEventListener("click", addColumn);
recommendChartBtn.addEventListener("click", recommendChart);
downloadCsvBtn.addEventListener("click", downloadCsv);
downloadExcelBtn.addEventListener("click", downloadExcel);
downloadDashboardBtn.addEventListener("click", downloadDashboard);
exportPdfBtn.addEventListener("click", exportPdf);
saveProjectBtn.addEventListener("click", saveProject);
savedProjectSelect.addEventListener("change", loadSavedProject);
shareDashboardBtn.addEventListener("click", shareDashboard);
categorySelect.addEventListener("change", updateDashboard);
valueSelect.addEventListener("change", updateDashboard);
customLabelSelect.addEventListener("change", updateDashboard);
customValueSelect.addEventListener("change", updateDashboard);
customChartType.addEventListener("change", updateDashboard);
setupDashboardBuilder();
setupCustomCursor();
refreshSavedProjects();

function updateBranding() {
  companyName = companyNameInput.value.trim() || "SheetSight";
  brandNameDisplay.textContent = companyName;
  if (!companyLogo) {
    brandMark.textContent = getInitials(companyName);
  }
}

function updateThemeFromInputs() {
  theme = {
    dashboard: dashboardColorInput.value,
    primary: themeColorInput.value,
    accent: accentColorInput.value
  };
  applyTheme();
  syncActivePreset();
  if (rows.length) updateDashboard();
}

function applyThemePreset(button) {
  dashboardColorInput.value = button.dataset.bg;
  themeColorInput.value = button.dataset.theme;
  accentColorInput.value = button.dataset.accent;
  updateThemeFromInputs();
}

function applyTheme() {
  const root = document.documentElement;
  root.style.setProperty("--bg", theme.dashboard);
  root.style.setProperty("--primary", theme.primary);
  root.style.setProperty("--primary-dark", shadeColor(theme.primary, -18));
  root.style.setProperty("--primary-soft", mixColors(theme.primary, "#ffffff", 0.84));
  root.style.setProperty("--accent", theme.accent);
  root.style.setProperty("--accent-soft", mixColors(theme.accent, "#ffffff", 0.9));
}

function syncActivePreset() {
  themePresetBtns.forEach((button) => {
    const isActive = button.dataset.bg === theme.dashboard && button.dataset.theme === theme.primary && button.dataset.accent === theme.accent;
    button.classList.toggle("active", isActive);
  });
}

async function handleLogoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  companyLogo = await readFileAsDataUrl(file);
  brandMark.innerHTML = `<img src="${companyLogo}" alt="">`;
  setStatus("Company logo added.");
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read the logo file."));
    reader.readAsDataURL(file);
  });
}

async function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  fileName = file.name.replace(/\.[^.]+$/, "") || "dashboard-data";
  const extension = file.name.split(".").pop().toLowerCase();

  try {
    if (extension === "csv") {
      const text = await file.text();
      loadArray(parseCsv(text), file.name);
      return;
    }

    if (!window.XLSX) {
      throw new Error("Excel support needs the SheetJS script. Check your internet connection or upload CSV.");
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    loadArray(data, file.name);
  } catch (error) {
    setStatus(error.message, true);
  }
}

function loadObjects(objects, title) {
  const allHeaders = [...new Set(objects.flatMap((item) => Object.keys(item)))];
  const data = [allHeaders, ...objects.map((item) => allHeaders.map((header) => item[header] ?? ""))];
  fileName = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  loadArray(data, title);
}

function loadArray(data, title) {
  const cleaned = data.filter((row) => row.some((cell) => String(cell).trim() !== ""));
  if (cleaned.length === 0) {
    throw new Error("The uploaded file is empty.");
  }

  headers = cleaned[0].map((cell, index) => sanitizeHeader(cell, index));
  rows = cleaned.slice(1).map((row) => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = row[index] ?? "";
    });
    return record;
  });
  filteredRows = [...rows];

  datasetTitle.textContent = title;
  renderTable();
  populateSelectors();
  populateDateSelector();
  updateDashboard();
  setEnabled(true);
  setStatus(`Loaded ${rows.length} rows and ${headers.length} columns.`);
}

function sanitizeHeader(value, index) {
  const text = String(value ?? "").trim();
  return text || `Column ${index + 1}`;
}

function parseCsv(text) {
  const result = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      result.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell);
  result.push(row);
  return result;
}

function setEnabled(enabled) {
  [
    addRowBtn,
    addColumnBtn,
    recommendChartBtn,
    downloadCsvBtn,
    downloadDashboardBtn,
    exportPdfBtn,
    saveProjectBtn,
    shareDashboardBtn,
    searchInput,
    dateColumnSelect,
    startDateInput,
    endDateInput,
    formulaNameInput,
    formulaExpressionInput,
    applyFormulaBtn,
    categorySelect,
    valueSelect,
    customLabelSelect,
    customValueSelect,
    customChartType
  ].forEach((element) => {
    element.disabled = !enabled;
  });
  downloadExcelBtn.disabled = !enabled || !window.XLSX;
  savedProjectSelect.disabled = savedProjectSelect.options.length <= 1;
}

function setStatus(message, isError = false) {
  statusBox.textContent = message;
  statusBox.style.color = isError ? "var(--danger)" : "var(--muted)";
}

function renderTable() {
  const thead = table.querySelector("thead");
  const tbody = table.querySelector("tbody");
  thead.innerHTML = "";
  tbody.innerHTML = "";

  const headerRow = document.createElement("tr");
  headers.forEach((header, columnIndex) => {
    const th = document.createElement("th");
    th.contentEditable = "true";
    th.textContent = header;
    th.addEventListener("blur", () => renameColumn(columnIndex, th.textContent.trim()));
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  filteredRows.forEach((record) => {
    const tr = document.createElement("tr");
    headers.forEach((header) => {
      const td = document.createElement("td");
      td.contentEditable = "true";
      td.textContent = record[header] ?? "";
      td.addEventListener("input", () => {
        record[header] = td.textContent;
        updateDashboard();
      });
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

function renameColumn(columnIndex, nextName) {
  const oldName = headers[columnIndex];
  const newName = sanitizeHeader(nextName, columnIndex);
  if (oldName === newName) return;

  let finalName = newName;
  let suffix = 2;
  while (headers.includes(finalName) && finalName !== oldName) {
    finalName = `${newName} ${suffix}`;
    suffix += 1;
  }

  headers[columnIndex] = finalName;
  rows.forEach((row) => {
    row[finalName] = row[oldName];
    delete row[oldName];
  });
  renderTable();
  populateSelectors();
  populateDateSelector();
  updateDashboard();
}

function addRow() {
  const record = {};
  headers.forEach((header) => {
    record[header] = "";
  });
  rows.push(record);
  filteredRows = getFilteredRows();
  renderTable();
  updateDashboard();
  setStatus("Added a new editable row.");
}

function addColumn() {
  const name = getUniqueHeader(`New Column ${headers.length + 1}`);
  headers.push(name);
  rows.forEach((row) => {
    row[name] = "";
  });
  filteredRows = getFilteredRows();
  renderTable();
  populateSelectors();
  populateDateSelector();
  updateDashboard();
  setStatus(`Added ${name}.`);
}

function getUniqueHeader(baseName) {
  let name = baseName;
  let index = 2;
  while (headers.includes(name)) {
    name = `${baseName} ${index}`;
    index += 1;
  }
  return name;
}

function populateSelectors() {
  const numericHeaders = headers.filter((header) => rows.some((row) => isNumeric(row[header])));
  fillSelect(categorySelect, headers);
  fillSelect(valueSelect, numericHeaders.length ? numericHeaders : headers);
  fillSelect(customLabelSelect, headers);
  fillSelect(customValueSelect, numericHeaders.length ? numericHeaders : headers);
  valueSelect.value = numericHeaders[0] || headers[0] || "";
  customValueSelect.value = numericHeaders[0] || headers[0] || "";
}

function populateDateSelector() {
  const dateHeaders = headers.filter((header) => rows.some((row) => parseDateValue(row[header])));
  fillSelect(dateColumnSelect, dateHeaders);
  if (!dateHeaders.length) {
    const item = document.createElement("option");
    item.value = "";
    item.textContent = "No date column";
    dateColumnSelect.appendChild(item);
  }
  const preferred = dateHeaders.find((header) => /date|month|time/i.test(header));
  dateColumnSelect.value = preferred || dateHeaders[0] || "";
}

function fillSelect(select, options) {
  const previous = select.value;
  select.innerHTML = "";
  options.forEach((option) => {
    const item = document.createElement("option");
    item.value = option;
    item.textContent = option;
    select.appendChild(item);
  });
  if (options.includes(previous)) select.value = previous;
}

function applyFiltersAndRender() {
  filteredRows = getFilteredRows();
  renderTable();
  updateDashboard();
  setStatus(`Showing ${filteredRows.length} of ${rows.length} rows.`);
}

function getFilteredRows() {
  const query = searchInput.value.trim().toLowerCase();
  const dateHeader = dateColumnSelect.value;
  const start = startDateInput.value ? new Date(`${startDateInput.value}T00:00:00`) : null;
  const end = endDateInput.value ? new Date(`${endDateInput.value}T23:59:59`) : null;

  return rows.filter((row) => {
    const matchesSearch = !query || headers.some((header) => String(row[header] ?? "").toLowerCase().includes(query));
    const date = dateHeader ? parseDateValue(row[dateHeader]) : null;
    const matchesStart = !start || (date && date >= start);
    const matchesEnd = !end || (date && date <= end);
    return matchesSearch && matchesStart && matchesEnd;
  });
}

function updateDashboard() {
  const numericHeaders = headers.filter((header) => rows.some((row) => isNumeric(row[header])));
  const selectedValue = valueSelect.value || numericHeaders[0] || headers[0];
  const selectedCategory = categorySelect.value || headers[0];
  const activeRows = filteredRows.length || rows.length ? filteredRows : [];
  const grandTotal = activeRows.reduce((sum, row) => sum + toNumber(row[selectedValue]), 0);

  rowCount.textContent = activeRows.length.toLocaleString();
  columnCount.textContent = headers.length.toLocaleString();
  numericCount.textContent = numericHeaders.length.toLocaleString();
  totalValue.textContent = formatNumber(grandTotal);
  datasetMeta.textContent = rows.length ? `${activeRows.length} visible of ${rows.length} editable records` : "Upload a file to generate charts and editable data.";

  renderBarChart(selectedCategory, selectedValue);
  renderColumnChart(numericHeaders);
  renderCustomChart();
  renderForecastChart(selectedValue);
  renderInsights(selectedCategory, selectedValue, numericHeaders);
}

function renderBarChart(categoryHeader, valueHeader) {
  const summary = new Map();
  const activeRows = filteredRows;
  activeRows.forEach((row) => {
    const label = String(row[categoryHeader] || "Blank");
    summary.set(label, (summary.get(label) || 0) + toNumber(row[valueHeader]));
  });

  const sorted = [...summary.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  barChartHint.textContent = `${valueHeader || "Value"} grouped by ${categoryHeader || "category"}.`;
  barChart = drawChart(barChart, "barChart", "bar", sorted.map(([label]) => label), sorted.map(([, value]) => value), theme.primary);
}

function renderColumnChart(numericHeaders) {
  const labels = numericHeaders.slice(0, 8);
  const values = labels.map((header) => filteredRows.reduce((sum, row) => sum + toNumber(row[header]), 0));
  columnChart = drawChart(columnChart, "columnChart", "doughnut", labels, values, getChartColors());
}

function renderCustomChart() {
  const labelHeader = customLabelSelect.value || headers[0];
  const valueHeader = customValueSelect.value || valueSelect.value || headers[0];
  const chartType = customChartType.value || "bar";
  const summary = buildSummary(labelHeader, valueHeader, filteredRows);
  const color = chartType === "line" ? theme.primary : getChartColors();
  customChart = drawChart(customChart, "customChart", chartType, summary.labels, summary.values, color);
}

function drawChart(instance, canvasId, type, labels, values, color) {
  if (instance) instance.destroy();
  if (!window.Chart) {
    setStatus("Data loaded. Charts need the Chart.js script, so check your internet connection if they do not appear.");
    return null;
  }
  const context = document.querySelector(`#${canvasId}`);
  return new Chart(context, {
    type,
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: color,
          borderColor: Array.isArray(color) ? "#ffffff" : color,
          borderWidth: type === "doughnut" ? 2 : 1
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: type === "doughnut",
          position: "bottom"
        }
      },
      scales: ["bar", "line"].includes(type) ? { y: { beginAtZero: true } } : {}
    }
  });
}

function isNumeric(value) {
  return value !== "" && value !== null && !Number.isNaN(Number(String(value).replace(/,/g, "")));
}

function toNumber(value) {
  const number = Number(String(value ?? "").replace(/,/g, ""));
  return Number.isFinite(number) ? number : 0;
}

function formatNumber(value) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value);
}

function rowsToArray() {
  return [headers, ...filteredRows.map((row) => headers.map((header) => row[header] ?? ""))];
}

function downloadCsv() {
  const csv = rowsToArray().map((row) => row.map(escapeCsv).join(",")).join("\n");
  downloadBlob(csv, `${fileName}-edited.csv`, "text/csv;charset=utf-8");
}

function escapeCsv(value) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function downloadExcel() {
  if (!window.XLSX) {
    setStatus("Excel download needs the SheetJS script. CSV download is available.", true);
    return;
  }

  const worksheet = XLSX.utils.aoa_to_sheet(rowsToArray());
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Edited Data");
  XLSX.writeFile(workbook, `${fileName}-edited.xlsx`);
}

function downloadDashboard() {
  const selectedCategory = categorySelect.value || headers[0] || "Category";
  const selectedValue = valueSelect.value || headers[0] || "Value";
  const customLabel = customLabelSelect.value || selectedCategory;
  const customValue = customValueSelect.value || selectedValue;
  const customType = customChartType.value || "bar";
  const numericHeaders = headers.filter((header) => rows.some((row) => isNumeric(row[header])));
  const chartData = buildSummary(selectedCategory, selectedValue, filteredRows);
  const customData = buildSummary(customLabel, customValue, filteredRows);
  const totals = numericHeaders.map((header) => ({
    label: header,
    value: filteredRows.reduce((sum, row) => sum + toNumber(row[header]), 0)
  }));

  const chartColors = getChartColors();
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(companyName)} Dashboard</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js"><\/script>
  <style>
    :root{--bg:${theme.dashboard};--primary:${theme.primary};--primary-dark:${shadeColor(theme.primary, -18)};--accent:${theme.accent};--line:#dbe3ef}
    body{margin:0;background:linear-gradient(135deg,${hexToRgba(theme.primary, 0.09)},transparent 34%),linear-gradient(315deg,${hexToRgba(theme.accent, 0.1)},transparent 38%),var(--bg);color:#111827;font-family:Inter,system-ui,sans-serif}
    main{padding:24px;display:grid;gap:18px}
    h1,h2,p{margin:0}.brand{display:flex;gap:14px;align-items:center}.logo{display:grid;place-items:center;width:56px;height:56px;border-radius:8px;background:linear-gradient(135deg,var(--primary),var(--accent));color:#fff;font-weight:900;overflow:hidden}.logo img{width:100%;height:100%;object-fit:cover}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.card{background:#fff;border:1px solid var(--line);border-radius:8px;padding:18px;box-shadow:0 14px 34px rgba(35,48,72,.12)}
    .charts{display:grid;grid-template-columns:1fr 1fr;gap:18px}.table-wrap{max-height:460px;overflow:auto}table{width:100%;border-collapse:collapse;background:#fff}th,td{border:1px solid var(--line);padding:9px;text-align:left}th{background:${mixColors(theme.primary, "#ffffff", 0.84)}}
    @media(max-width:850px){.grid,.charts{grid-template-columns:1fr}}
  </style>
</head>
<body>
  <main>
    <section class="card brand"><div class="logo">${companyLogo ? `<img src="${companyLogo}" alt="">` : getInitials(companyName)}</div><div><h1>${escapeHtml(companyName)}</h1><p>${escapeHtml(datasetTitle.textContent)} dashboard export</p></div></section>
    <section class="grid">
      <div class="card"><p>Rows</p><h2>${filteredRows.length}</h2></div>
      <div class="card"><p>Columns</p><h2>${headers.length}</h2></div>
      <div class="card"><p>Numeric Columns</p><h2>${numericHeaders.length}</h2></div>
      <div class="card"><p>Total ${escapeHtml(selectedValue)}</p><h2>${formatNumber(chartData.total)}</h2></div>
    </section>
    <section class="charts">
      <div class="card"><canvas id="bar"></canvas></div>
      <div class="card"><canvas id="doughnut"></canvas></div>
    </section>
    <section class="card"><h2>Custom Chart</h2><p>${escapeHtml(customValue)} by ${escapeHtml(customLabel)}</p><canvas id="custom"></canvas></section>
    <section class="card table-wrap">${buildExportTable()}</section>
  </main>
  <script>
    new Chart(document.getElementById("bar"), {type:"bar",data:{labels:${JSON.stringify(chartData.labels)},datasets:[{data:${JSON.stringify(chartData.values)},backgroundColor:${JSON.stringify(theme.primary)}}]},options:{scales:{y:{beginAtZero:true}},plugins:{legend:{display:false}}}});
    new Chart(document.getElementById("doughnut"), {type:"doughnut",data:{labels:${JSON.stringify(totals.map((item) => item.label))},datasets:[{data:${JSON.stringify(totals.map((item) => item.value))},backgroundColor:${JSON.stringify(chartColors)}}]},options:{plugins:{legend:{position:"bottom"}}}});
    new Chart(document.getElementById("custom"), {type:${JSON.stringify(customType)},data:{labels:${JSON.stringify(customData.labels)},datasets:[{data:${JSON.stringify(customData.values)},backgroundColor:${JSON.stringify(customType === "line" ? theme.primary : chartColors)},borderColor:${JSON.stringify(theme.primary)}}]},options:{scales:${JSON.stringify(["bar", "line"].includes(customType) ? { y: { beginAtZero: true } } : {})},plugins:{legend:{display:${JSON.stringify(!["bar", "line"].includes(customType))},position:"bottom"}}}});
  <\/script>
</body>
</html>`;

  downloadBlob(html, `${fileName}-dashboard.html`, "text/html;charset=utf-8");
}

function buildSummary(categoryHeader, valueHeader, sourceRows = rows) {
  const summary = new Map();
  sourceRows.forEach((row) => {
    const label = String(row[categoryHeader] || "Blank");
    summary.set(label, (summary.get(label) || 0) + toNumber(row[valueHeader]));
  });
  const sorted = [...summary.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  return {
    labels: sorted.map(([label]) => label),
    values: sorted.map(([, value]) => value),
    total: sorted.reduce((sum, [, value]) => sum + value, 0)
  };
}

function buildExportTable() {
  const head = `<thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>`;
  const body = filteredRows.map((row) => `<tr>${headers.map((header) => `<td>${escapeHtml(row[header])}</td>`).join("")}</tr>`).join("");
  return `<table>${head}<tbody>${body}</tbody></table>`;
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode", darkModeToggle.checked);
  if (rows.length) updateDashboard();
}

function applyFormula() {
  const columnName = getUniqueHeader(formulaNameInput.value.trim() || `Formula ${headers.length + 1}`);
  const expression = formulaExpressionInput.value.trim();
  if (!expression) {
    setStatus("Enter a formula first.", true);
    return;
  }

  try {
    rows.forEach((row) => {
      row[columnName] = evaluateFormula(expression, row);
    });
    headers.push(columnName);
    filteredRows = getFilteredRows();
    renderTable();
    populateSelectors();
    populateDateSelector();
    updateDashboard();
    setStatus(`Formula column ${columnName} added.`);
  } catch (error) {
    setStatus(error.message, true);
  }
}

function evaluateFormula(expression, row) {
  let prepared = expression;
  headers
    .slice()
    .sort((a, b) => b.length - a.length)
    .forEach((header) => {
      const value = String(toNumber(row[header]));
      prepared = prepared.replace(new RegExp(`\\[${escapeRegExp(header)}\\]`, "g"), value);
      prepared = prepared.replace(new RegExp(`\\b${escapeRegExp(header)}\\b`, "g"), value);
    });

  if (!/^[0-9+\-*/().\s]+$/.test(prepared)) {
    throw new Error("Formula can only use numbers, operators, parentheses, and column names.");
  }

  const result = Function(`"use strict"; return (${prepared});`)();
  return Number.isFinite(result) ? Number(result.toFixed(2)) : 0;
}

function recommendChart() {
  const dateHeader = dateColumnSelect.value;
  const selectedCategory = categorySelect.value || headers[0];
  const uniqueCount = new Set(filteredRows.map((row) => row[selectedCategory])).size;
  const recommended = dateHeader ? "line" : uniqueCount <= 6 ? "doughnut" : "bar";
  customLabelSelect.value = dateHeader || selectedCategory;
  customValueSelect.value = valueSelect.value || customValueSelect.value;
  customChartType.value = recommended;
  updateDashboard();
  setStatus(`Recommended a ${recommended} chart for this dataset.`);
}

function exportPdf() {
  setStatus("Opening print dialog. Choose Save as PDF to export.");
  window.print();
}

function saveProject() {
  const name = window.prompt("Project name", datasetTitle.textContent || fileName);
  if (!name) return;

  const projects = getSavedProjects();
  projects[name] = {
    savedAt: new Date().toISOString(),
    title: datasetTitle.textContent,
    fileName,
    companyName,
    companyLogo,
    theme,
    darkMode: darkModeToggle.checked,
    headers,
    rows
  };
  localStorage.setItem("sheetsight-projects", JSON.stringify(projects));
  refreshSavedProjects();
  savedProjectSelect.value = name;
  setStatus(`Saved project ${name}.`);
}

function loadSavedProject() {
  const name = savedProjectSelect.value;
  if (!name) return;

  const project = getSavedProjects()[name];
  if (!project) return;

  headers = project.headers || [];
  rows = project.rows || [];
  filteredRows = [...rows];
  fileName = project.fileName || "dashboard-data";
  companyName = project.companyName || "SheetSight";
  companyLogo = project.companyLogo || "";
  theme = project.theme || theme;
  companyNameInput.value = companyName === "SheetSight" ? "" : companyName;
  brandNameDisplay.textContent = companyName;
  if (companyLogo) {
    brandMark.innerHTML = `<img src="${companyLogo}" alt="">`;
  } else {
    brandMark.textContent = getInitials(companyName);
  }
  dashboardColorInput.value = theme.dashboard;
  themeColorInput.value = theme.primary;
  accentColorInput.value = theme.accent;
  darkModeToggle.checked = !!project.darkMode;
  document.body.classList.toggle("dark-mode", darkModeToggle.checked);
  applyTheme();
  syncActivePreset();
  datasetTitle.textContent = project.title || name;
  searchInput.value = "";
  startDateInput.value = "";
  endDateInput.value = "";
  renderTable();
  populateSelectors();
  populateDateSelector();
  updateDashboard();
  setEnabled(true);
  setStatus(`Loaded saved project ${name}.`);
}

async function shareDashboard() {
  const payload = {
    title: datasetTitle.textContent,
    companyName,
    theme,
    headers,
    rows: filteredRows
  };
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  const shareUrl = `${location.href.split("#")[0]}#project=${encoded}`;
  try {
    await navigator.clipboard.writeText(shareUrl);
    setStatus("Share link copied to clipboard.");
  } catch {
    downloadBlob(shareUrl, `${fileName}-share-link.txt`, "text/plain;charset=utf-8");
    setStatus("Share link downloaded as a text file.");
  }
}

function renderInsights(categoryHeader, valueHeader, numericHeaders) {
  if (!filteredRows.length) {
    insightHint.textContent = "Load data to generate quick insights.";
    insightList.innerHTML = "<li>No insights yet.</li>";
    return;
  }

  const insights = [];
  const total = filteredRows.reduce((sum, row) => sum + toNumber(row[valueHeader]), 0);
  const summary = buildSummary(categoryHeader, valueHeader, filteredRows);
  const top = summary.labels[0];
  const topValue = summary.values[0] || 0;
  const missingCells = filteredRows.reduce((count, row) => count + headers.filter((header) => String(row[header] ?? "").trim() === "").length, 0);
  const average = filteredRows.length ? total / filteredRows.length : 0;

  insights.push(`${valueHeader} total is ${formatNumber(total)} across ${filteredRows.length} visible rows.`);
  if (top) insights.push(`${top} is the top ${categoryHeader}, contributing ${formatNumber(topValue)}.`);
  if (numericHeaders.length) insights.push(`Average ${valueHeader} per row is ${formatNumber(average)}.`);
  insights.push(missingCells ? `${missingCells} empty cells found in visible data.` : "No empty cells found in visible data.");

  const trend = getTrend(valueHeader);
  if (trend) insights.push(trend);

  insightHint.textContent = `${insights.length} insights generated from visible rows.`;
  insightList.innerHTML = insights.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function renderForecastChart(valueHeader) {
  const values = filteredRows.map((row) => toNumber(row[valueHeader])).filter((value) => Number.isFinite(value));
  if (!window.Chart || values.length < 2) {
    forecastHint.textContent = "Need at least two numeric rows for forecasting.";
    if (forecastChart) forecastChart.destroy();
    forecastChart = null;
    return;
  }

  const recent = values.slice(-8);
  const step = recent.length > 1 ? (recent[recent.length - 1] - recent[0]) / (recent.length - 1) : 0;
  const future = [1, 2, 3].map((index) => Math.max(0, recent[recent.length - 1] + step * index));
  const labels = [...recent.map((_, index) => `Point ${index + 1}`), "Next 1", "Next 2", "Next 3"];
  forecastHint.textContent = step >= 0 ? "Forecast is trending upward." : "Forecast is trending downward.";
  forecastChart = drawChart(forecastChart, "forecastChart", "line", labels, [...recent, ...future], theme.accent);
}

function getTrend(valueHeader) {
  const dateHeader = dateColumnSelect.value;
  if (!dateHeader) return "";
  const dated = filteredRows
    .map((row) => ({ date: parseDateValue(row[dateHeader]), value: toNumber(row[valueHeader]) }))
    .filter((item) => item.date)
    .sort((a, b) => a.date - b.date);
  if (dated.length < 2) return "";
  const first = dated[0].value;
  const last = dated[dated.length - 1].value;
  const change = first ? ((last - first) / Math.abs(first)) * 100 : 0;
  return `${valueHeader} changed ${formatNumber(change)}% from first to latest date.`;
}

function parseDateValue(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  const text = String(value ?? "").trim();
  if (!text) return null;
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getSavedProjects() {
  try {
    return JSON.parse(localStorage.getItem("sheetsight-projects") || "{}");
  } catch {
    return {};
  }
}

function refreshSavedProjects() {
  const projects = getSavedProjects();
  savedProjectSelect.innerHTML = '<option value="">Load saved project</option>';
  Object.keys(projects)
    .sort()
    .forEach((name) => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      savedProjectSelect.appendChild(option);
    });
  savedProjectSelect.disabled = savedProjectSelect.options.length <= 1;
}

function setupDashboardBuilder() {
  document.querySelectorAll(".dashboard-widget").forEach((widget) => {
    widget.addEventListener("dragstart", () => {
      draggedWidget = widget;
      widget.classList.add("dragging");
    });
    widget.addEventListener("dragend", () => {
      widget.classList.remove("dragging");
      document.querySelectorAll(".drag-over").forEach((item) => item.classList.remove("drag-over"));
      draggedWidget = null;
    });
    widget.addEventListener("dragover", (event) => {
      event.preventDefault();
      if (widget !== draggedWidget) widget.classList.add("drag-over");
    });
    widget.addEventListener("dragleave", () => widget.classList.remove("drag-over"));
    widget.addEventListener("drop", (event) => {
      event.preventDefault();
      widget.classList.remove("drag-over");
      if (!draggedWidget || draggedWidget === widget) return;
      const parent = widget.parentElement;
      if (draggedWidget.parentElement === parent) {
        parent.insertBefore(draggedWidget, widget);
      }
    });
  });
}

function setupCustomCursor() {
  if (!customCursor || window.matchMedia("(pointer: coarse)").matches) return;

  document.body.classList.add("has-custom-cursor");
  window.addEventListener("mousemove", (event) => {
    customCursor.style.left = `${event.clientX}px`;
    customCursor.style.top = `${event.clientY}px`;
    customCursor.classList.add("visible");
  });
  window.addEventListener("mouseleave", () => customCursor.classList.remove("visible"));
  window.addEventListener("mousedown", () => customCursor.classList.add("pointer"));
  window.addEventListener("mouseup", () => customCursor.classList.remove("pointer"));

  document.addEventListener("mouseover", (event) => {
    const target = event.target.closest("button, input, select, label, .dashboard-widget, [contenteditable='true']");
    customCursor.classList.toggle("pointer", Boolean(target));
  });
}

function loadProjectFromHash() {
  const match = location.hash.match(/project=([^&]+)/);
  if (!match) return;
  try {
    const project = JSON.parse(decodeURIComponent(escape(atob(match[1]))));
    headers = project.headers || [];
    rows = project.rows || [];
    filteredRows = [...rows];
    companyName = project.companyName || "SheetSight";
    theme = project.theme || theme;
    datasetTitle.textContent = project.title || "Shared Dashboard";
    brandNameDisplay.textContent = companyName;
    dashboardColorInput.value = theme.dashboard;
    themeColorInput.value = theme.primary;
    accentColorInput.value = theme.accent;
    applyTheme();
    renderTable();
    populateSelectors();
    populateDateSelector();
    updateDashboard();
    setEnabled(true);
    setStatus("Loaded shared dashboard from link.");
  } catch {
    setStatus("Could not load shared dashboard link.", true);
  }
}

function getChartColors() {
  return [
    theme.primary,
    theme.accent,
    shadeColor(theme.primary, 18),
    shadeColor(theme.accent, -12),
    mixColors(theme.primary, "#111827", 0.35),
    mixColors(theme.accent, "#111827", 0.3),
    "#0ea5e9",
    "#10b981",
    "#f43f5e",
    "#8b5cf6"
  ];
}

function shadeColor(hex, percent) {
  const rgb = hexToRgb(hex);
  const amount = Math.round(2.55 * percent);
  return rgbToHex({
    r: clampColor(rgb.r + amount),
    g: clampColor(rgb.g + amount),
    b: clampColor(rgb.b + amount)
  });
}

function mixColors(hexA, hexB, weightB) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  return rgbToHex({
    r: clampColor(Math.round(a.r * (1 - weightB) + b.r * weightB)),
    g: clampColor(Math.round(a.g * (1 - weightB) + b.g * weightB)),
    b: clampColor(Math.round(a.b * (1 - weightB) + b.b * weightB))
  });
}

function hexToRgba(hex, alpha) {
  const rgb = hexToRgb(hex);
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
}

function hexToRgb(hex) {
  const normalized = String(hex).replace("#", "");
  const value = normalized.length === 3 ? normalized.split("").map((char) => char + char).join("") : normalized;
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16)
  };
}

function rgbToHex({ r, g, b }) {
  return `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

function clampColor(value) {
  return Math.max(0, Math.min(255, value));
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getInitials(value) {
  return escapeHtml(
    String(value || "SS")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "SS"
  );
}

function downloadBlob(content, name, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

applyTheme();
setEnabled(false);
loadProjectFromHash();
