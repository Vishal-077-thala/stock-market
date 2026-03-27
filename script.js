/* ============================================
   STOCKPULSE — script.js
   All JS logic: data, chart, watchlist, ticker,
   gainers/losers, news, clock
   ============================================ */

"use strict";

/* ===================== DATA ===================== */

const INDICES = [
  { name: "S&P 500",    value: 5241.32, change: +0.87 },
  { name: "NASDAQ",     value: 16823.17, change: +1.23 },
  { name: "Dow Jones",  value: 39104.65, change: +0.44 },
  { name: "Russell 2K", value: 2052.80, change: -0.31 },
];

const STOCKS = [
  { sym: "AAPL",  name: "Apple Inc.",       price: 189.42, change: +1.14 },
  { sym: "MSFT",  name: "Microsoft Corp.",  price: 415.83, change: +0.78 },
  { sym: "GOOGL", name: "Alphabet Inc.",    price: 175.60, change: +1.55 },
  { sym: "AMZN",  name: "Amazon.com Inc.",  price: 198.10, change: -0.42 },
  { sym: "TSLA",  name: "Tesla Inc.",       price: 176.25, change: -2.11 },
  { sym: "NVDA",  name: "NVIDIA Corp.",     price: 875.39, change: +3.47 },
  { sym: "META",  name: "Meta Platforms",   price: 527.12, change: +2.08 },
  { sym: "JPM",   name: "JPMorgan Chase",   price: 199.70, change: -0.55 },
  { sym: "BRK.B", name: "Berkshire Hath.",  price: 393.50, change: +0.22 },
  { sym: "V",     name: "Visa Inc.",        price: 278.90, change: +0.91 },
];

const GAINERS = [
  { sym: "NVDA", price: "$875.39", pct: "+3.47%" },
  { sym: "META", price: "$527.12", pct: "+2.08%" },
  { sym: "GOOGL",price: "$175.60", pct: "+1.55%" },
  { sym: "AAPL", price: "$189.42", pct: "+1.14%" },
  { sym: "MSFT", price: "$415.83", pct: "+0.78%" },
];

const LOSERS = [
  { sym: "TSLA", price: "$176.25", pct: "-2.11%" },
  { sym: "AMZN", price: "$198.10", pct: "-0.42%" },
  { sym: "JPM",  price: "$199.70", pct: "-0.55%" },
  { sym: "NFLX", price: "$621.55", pct: "-1.03%" },
  { sym: "DIS",  price: "$108.90", pct: "-0.78%" },
];

const NEWS = [
  { headline: "Fed holds rates steady; markets rally on dovish signals", src: "Reuters", time: "2h ago" },
  { headline: "NVIDIA surges past $2T market cap as AI boom continues", src: "Bloomberg", time: "4h ago" },
  { headline: "Apple unveils new AI-powered MacBook lineup at WWDC", src: "TechCrunch", time: "5h ago" },
  { headline: "Oil prices dip as OPEC+ considers supply increase", src: "FT", time: "6h ago" },
  { headline: "Tesla misses Q1 deliveries; shares slide in premarket", src: "WSJ", time: "8h ago" },
];

/* ===================== LIVE CLOCK ===================== */

function updateClock() {
  const now = new Date();
  document.getElementById("current-time").textContent =
    now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
updateClock();
setInterval(updateClock, 1000);

/* ===================== TICKER BAR ===================== */

function buildTicker() {
  const track = document.getElementById("ticker-track");
  const allTickers = [...STOCKS, ...INDICES.map(i => ({
    sym: i.name.replace(/ /g,""), name: i.name, price: i.value, change: i.change
  }))];

  // Duplicate for seamless loop
  const items = [...allTickers, ...allTickers];
  track.innerHTML = items.map(s => {
    const chg = (s.change ?? 0);
    const cls = chg >= 0 ? "up" : "down";
    const sign = chg >= 0 ? "+" : "";
    const val = s.price ?? s.value;
    return `<span class="ticker-item">
      <span class="sym">${s.sym || s.name}</span>
      <span class="val">$${typeof val === 'number' ? val.toLocaleString("en-US", {minimumFractionDigits:2,maximumFractionDigits:2}) : val}</span>
      <span class="${cls}">${sign}${chg.toFixed(2)}%</span>
    </span>`;
  }).join("");
}
buildTicker();

/* ===================== INDEX CARDS ===================== */

function buildIndexCards() {
  const container = document.getElementById("index-cards");
  container.innerHTML = INDICES.map(idx => {
    const up = idx.change >= 0;
    const cls = up ? "up" : "down";
    const sign = up ? "+" : "";
    const fillPct = Math.min(Math.abs(idx.change) * 30, 100);
    return `<div class="index-card">
      <div class="ic-name">${idx.name}</div>
      <div class="ic-value ${cls}">${idx.value.toLocaleString("en-US", {minimumFractionDigits:2})}</div>
      <div class="ic-change ${cls}">${sign}${idx.change.toFixed(2)}%</div>
      <div class="ic-bar">
        <div class="ic-bar-fill" style="width:${fillPct}%;background:${up ? 'var(--up)' : 'var(--down)'}"></div>
      </div>
    </div>`;
  }).join("");
}
buildIndexCards();

/* ===================== WATCHLIST ===================== */

let selectedSym = "AAPL";
let allStocks = [...STOCKS];

function buildWatchlist(filter = "") {
  const ul = document.getElementById("watchlist");
  const filtered = allStocks.filter(s =>
    s.sym.toLowerCase().includes(filter.toLowerCase()) ||
    s.name.toLowerCase().includes(filter.toLowerCase())
  );
  if (filtered.length === 0) {
    ul.innerHTML = `<li style="color:var(--text-muted);font-family:var(--mono);font-size:12px;padding:8px 12px;">No results found.</li>`;
    return;
  }
  ul.innerHTML = filtered.map(s => {
    const up = s.change >= 0;
    const cls = up ? "up" : "down";
    const sign = up ? "+" : "";
    const sel = s.sym === selectedSym ? " selected" : "";
    return `<li data-sym="${s.sym}" class="${sel}">
      <div class="wl-left">
        <span class="wl-sym">${s.sym}</span>
        <span class="wl-name">${s.name}</span>
      </div>
      <div class="wl-right">
        <div class="wl-price">$${s.price.toFixed(2)}</div>
        <div class="wl-chg ${cls}">${sign}${s.change.toFixed(2)}%</div>
      </div>
    </li>`;
  }).join("");

  ul.querySelectorAll("li[data-sym]").forEach(li => {
    li.addEventListener("click", () => {
      selectedSym = li.dataset.sym;
      const stock = allStocks.find(s => s.sym === selectedSym);
      updateChartPanel(stock);
      buildWatchlist(document.getElementById("search-input").value);
    });
  });
}

document.getElementById("search-input").addEventListener("input", e => {
  buildWatchlist(e.target.value);
});

const refreshBtn = document.getElementById("refresh-btn");
refreshBtn.addEventListener("click", () => {
  refreshBtn.classList.add("spin");
  setTimeout(() => refreshBtn.classList.remove("spin"), 600);
  // Simulate small price movements
  allStocks = allStocks.map(s => ({
    ...s,
    price: +(s.price * (1 + (Math.random() - 0.499) * 0.004)).toFixed(2),
    change: +(s.change + (Math.random() - 0.5) * 0.1).toFixed(2)
  }));
  buildWatchlist(document.getElementById("search-input").value);
  const selected = allStocks.find(s => s.sym === selectedSym);
  if (selected) updateChartPanel(selected);
});

/* ===================== CHART ===================== */

const canvas  = document.getElementById("stockChart");
const ctx     = canvas.getContext("2d");
let chartData = [];
let currentRange = "1D";

function generatePriceData(basePrice, points, volatility = 0.012) {
  const data = [basePrice];
  for (let i = 1; i < points; i++) {
    const last = data[i - 1];
    const move = last * (1 + (Math.random() - 0.497) * volatility);
    data.push(+move.toFixed(2));
  }
  return data;
}

function getPointsForRange(range) {
  return { "1D": 78, "1W": 50, "1M": 30, "1Y": 52 }[range] || 78;
}

function getLabelForRange(range, points) {
  const labels = [];
  if (range === "1D") {
    for (let i = 0; i < points; i++) {
      const h = 9 + Math.floor(i * (6.5 / points));
      const m = Math.floor((i * 6.5 * 60 / points) % 60);
      labels.push(`${h}:${String(m).padStart(2,"0")}`);
    }
  } else if (range === "1W") {
    const days = ["Mon","Tue","Wed","Thu","Fri"];
    for (let i = 0; i < points; i++) labels.push(days[Math.floor(i / (points/5))]);
  } else if (range === "1M") {
    for (let i = 1; i <= points; i++) labels.push(`Mar ${i}`);
  } else {
    const months = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];
    for (let i = 0; i < points; i++) labels.push(months[i % 12]);
  }
  return labels;
}

function drawChart(data, labels, color) {
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const pad = { top: 20, right: 20, bottom: 40, left: 60 };
  const cw = w - pad.left - pad.right;
  const ch = h - pad.top  - pad.bottom;

  const minV = Math.min(...data) * 0.998;
  const maxV = Math.max(...data) * 1.002;

  const xStep = cw / (data.length - 1);
  const yScale = v => pad.top + ch - ((v - minV) / (maxV - minV)) * ch;
  const xScale = i => pad.left + i * xStep;

  // Grid lines
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (ch / 4) * i;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(pad.left + cw, y);
    ctx.stroke();
  }

  // Y-axis labels
  ctx.fillStyle = "rgba(148,163,184,0.7)";
  ctx.font = "10px 'Space Mono', monospace";
  ctx.textAlign = "right";
  for (let i = 0; i <= 4; i++) {
    const v = minV + ((maxV - minV) / 4) * (4 - i);
    const y = pad.top + (ch / 4) * i;
    ctx.fillText("$" + v.toFixed(0), pad.left - 6, y + 4);
  }

  // X-axis labels (sample every N)
  ctx.textAlign = "center";
  const xEvery = Math.ceil(data.length / 8);
  for (let i = 0; i < data.length; i += xEvery) {
    ctx.fillText(labels[i], xScale(i), h - pad.bottom + 16);
  }

  // Gradient fill
  const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + ch);
  grad.addColorStop(0, color + "44");
  grad.addColorStop(1, color + "00");

  ctx.beginPath();
  ctx.moveTo(xScale(0), yScale(data[0]));
  for (let i = 1; i < data.length; i++) {
    ctx.lineTo(xScale(i), yScale(data[i]));
  }
  const fillPath = new Path2D(ctx.currentPath);

  ctx.lineTo(xScale(data.length - 1), pad.top + ch);
  ctx.lineTo(xScale(0), pad.top + ch);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Line
  ctx.beginPath();
  ctx.moveTo(xScale(0), yScale(data[0]));
  for (let i = 1; i < data.length; i++) ctx.lineTo(xScale(i), yScale(data[i]));
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.stroke();

  // Last dot
  const lastX = xScale(data.length - 1);
  const lastY = yScale(data[data.length - 1]);
  ctx.beginPath();
  ctx.arc(lastX, lastY, 5, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = "#0b0e14";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Hover tooltip
  canvas._data   = data;
  canvas._labels = labels;
  canvas._pad    = pad;
  canvas._ch     = ch;
  canvas._cw     = cw;
  canvas._minV   = minV;
  canvas._maxV   = maxV;
  canvas._color  = color;
}

function updateChartPanel(stock) {
  const points  = getPointsForRange(currentRange);
  const vol     = currentRange === "1Y" ? 0.025 : 0.012;
  chartData     = generatePriceData(stock.price, points, vol);
  const labels  = getLabelForRange(currentRange, points);
  const color   = stock.change >= 0 ? "#00d4a1" : "#f43f5e";

  document.getElementById("chart-title").textContent = `${stock.sym} — ${stock.name}`;
  const chgSign = stock.change >= 0 ? "+" : "";
  document.getElementById("chart-price").innerHTML =
    `$${stock.price.toFixed(2)} <span class="${stock.change >= 0 ? 'up' : 'down'}">${chgSign}${stock.change.toFixed(2)}%</span>`;

  drawChart(chartData, labels, color);
}

// Chart tab switching
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    btn.classList.add("active");
    currentRange = btn.dataset.range;
    const stock = allStocks.find(s => s.sym === selectedSym) || STOCKS[0];
    updateChartPanel(stock);
  });
});

// Hover crosshair on chart
canvas.addEventListener("mousemove", e => {
  if (!canvas._data) return;
  const rect = canvas.getBoundingClientRect();
  const mx   = (e.clientX - rect.left) * (canvas.width / rect.width);
  const pad  = canvas._pad;
  const cw   = canvas._cw;
  const data = canvas._data;
  const xStep = cw / (data.length - 1);
  const idx   = Math.round((mx - pad.left) / xStep);
  if (idx < 0 || idx >= data.length) return;

  const stock = allStocks.find(s => s.sym === selectedSym) || STOCKS[0];
  const color = stock.change >= 0 ? "#00d4a1" : "#f43f5e";
  const labels = canvas._labels;
  drawChart(data, labels, color);

  // Crosshair
  const x = pad.left + idx * xStep;
  const y = pad.top + canvas._ch - ((data[idx] - canvas._minV) / (canvas._maxV - canvas._minV)) * canvas._ch;

  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath(); ctx.moveTo(x, pad.top); ctx.lineTo(x, pad.top + canvas._ch); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + cw, y); ctx.stroke();
  ctx.setLineDash([]);

  // Tooltip
  const tip = `$${data[idx].toFixed(2)}  ${labels[idx]}`;
  ctx.fillStyle = "rgba(26,31,46,0.92)";
  const tw = ctx.measureText(tip).width + 16;
  const tx = Math.min(x + 8, pad.left + cw - tw - 4);
  ctx.fillRect(tx, y - 18, tw, 22);
  ctx.fillStyle = "#e2e8f0";
  ctx.font = "11px 'Space Mono', monospace";
  ctx.textAlign = "left";
  ctx.fillText(tip, tx + 8, y - 1);
});

canvas.addEventListener("mouseleave", () => {
  const stock = allStocks.find(s => s.sym === selectedSym) || STOCKS[0];
  const color = stock.change >= 0 ? "#00d4a1" : "#f43f5e";
  drawChart(canvas._data, canvas._labels, color);
});

/* ===================== GAINERS & LOSERS ===================== */

function buildMovers() {
  const gEl = document.getElementById("gainers-list");
  const lEl = document.getElementById("losers-list");

  gEl.innerHTML = GAINERS.map(g => `
    <li>
      <span class="mover-sym">${g.sym}</span>
      <span class="mover-price">${g.price}</span>
      <span class="mover-pct up-bg">${g.pct}</span>
    </li>`).join("");

  lEl.innerHTML = LOSERS.map(l => `
    <li>
      <span class="mover-sym">${l.sym}</span>
      <span class="mover-price">${l.price}</span>
      <span class="mover-pct down-bg">${l.pct}</span>
    </li>`).join("");
}
buildMovers();

/* ===================== NEWS ===================== */

function buildNews() {
  document.getElementById("news-list").innerHTML = NEWS.map(n => `
    <li>
      <div class="news-headline">${n.headline}</div>
      <div class="news-meta">${n.src} &nbsp;·&nbsp; ${n.time}</div>
    </li>`).join("");
}
buildNews();

/* ===================== INIT ===================== */

// Initial render
buildWatchlist();
const initStock = STOCKS.find(s => s.sym === selectedSym) || STOCKS[0];
updateChartPanel(initStock);

// Auto-refresh prices every 8 seconds
setInterval(() => {
  allStocks = allStocks.map(s => ({
    ...s,
    price: +(s.price * (1 + (Math.random() - 0.499) * 0.002)).toFixed(2),
    change: +(s.change + (Math.random() - 0.5) * 0.05).toFixed(2)
  }));
  buildWatchlist(document.getElementById("search-input").value);
  const sel = allStocks.find(s => s.sym === selectedSym);
  if (sel) {
    document.getElementById("chart-price").innerHTML =
      `$${sel.price.toFixed(2)} <span class="${sel.change >= 0 ? 'up' : 'down'}">${sel.change >= 0 ? '+' : ''}${sel.change.toFixed(2)}%</span>`;
  }
}, 8000);