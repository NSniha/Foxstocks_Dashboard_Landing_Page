/* =========================
    Helpers
========================= */
const ns = "http://www.w3.org/2000/svg";
const $ = (q, el=document) => el.querySelector(q);
const $$ = (q, el=document) => Array.from(el.querySelectorAll(q));

function mk(tag, attrs={}){
  const el = document.createElementNS(ns, tag);
  for(const k in attrs) el.setAttribute(k, attrs[k]);
  return el;
}

function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }

function seededSeries(len, seed=1){
  let x = seed * 9973;
  const arr = [];
  let v = 50 + (seed % 7) * 2;
  for(let i=0;i<len;i++){
    x = (x * 9301 + 49297) % 233280;
    const r = x / 233280;
    v += (r - 0.48) * 7;
    v += Math.sin(i/3) * 1.2;
    arr.push(v);
  }
  return arr;
}

function buildPath(points){
  let d = "";
  points.forEach((p,i)=>{
    d += (i===0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`);
  });
  return d;
}

/* =========================
    Sparklines (stocks)
========================= */
function drawSpark(svg, mode="green", seed=1){
  const W = 100, H = 40;
  const pad = 2;
  svg.innerHTML = "";
  const data = seededSeries(28, seed).map((v,i)=>v + i*0.4);

  const min = Math.min(...data), max = Math.max(...data);
  const span = (max-min)||1;
  const step = (W - pad*2) / (data.length-1);

  const pts = data.map((v,i)=>({
    x: pad + i*step,
    y: pad + (H - pad*2) * (1 - (v-min)/span)
  }));

  const d = buildPath(pts);

  let stroke = "rgba(34,197,94,.9)";
  if(mode==="white") stroke = "rgba(255,255,255,.92)";
  if(mode==="none") stroke = "rgba(18,21,42,.25)";

  const path = mk("path", { d, fill:"none", stroke, "stroke-width":"2.2", "stroke-linecap":"round", "stroke-linejoin":"round", opacity: mode==="none" ? ".35" : "1" });
  svg.appendChild(path);
}

$$(".fx-spark").forEach((svg, i)=>{
  drawSpark(svg, svg.dataset.spark || "green", 3+i*2);
});
drawSpark($("#topSpark"), "green", 19);

/* =========================
    Market chart 
========================= */
function drawMarket(svg, seed=7){
  svg.innerHTML = "";
  const W=900, H=300;
  const padL=62, padR=28, padT=18, padB=54;

  const gridG = mk("g");
  for(let i=0;i<4;i++){
    const y = padT + (H-padT-padB)*(i/3);
    gridG.appendChild(mk("line",{x1:padL,y1:y,x2:W-padR,y2:y,class:"gridDot"}));
  }
  for(let i=0;i<4;i++){
    const x = padL + (W-padL-padR)*(i/3);
    gridG.appendChild(mk("line",{x1:x,y1:padT,x2:x,y2:H-padB,class:"gridDot"}));
  }
  svg.appendChild(gridG);

  // left labels
  const labels = ["11,700","11,650","11,600","11,550"];
  labels.forEach((t, idx)=>{
    const y = padT + (H-padT-padB)*(idx/3) + 4;
    const tx = mk("text",{x:padL-12,y:y,"text-anchor":"end",class:"axisText"});
    tx.textContent = t;
    svg.appendChild(tx);
  });

  // bottom times
  const times = ["10 am","11 am","12 pm"];
  times.forEach((t, idx)=>{
    const x = padL + (W-padL-padR)*(idx/2);
    const tx = mk("text",{x, y:H-18, "text-anchor":"middle", class:"axisText"});
    tx.textContent = t;
    svg.appendChild(tx);
  });

  const data = seededSeries(22, seed).map((v,i)=> v + i*1.2 + 28);
  const min = Math.min(...data), max = Math.max(...data);
  const span = (max-min)||1;
  const step = (W-padL-padR)/(data.length-1);

  const pts = data.map((v,i)=>({
    x: padL + i*step,
    y: padT + (H-padT-padB)*(1-(v-min)/span)
  }));

  const lineD = buildPath(pts);
  const areaD = `${lineD} L ${W-padR} ${H-padB} L ${padL} ${H-padB} Z`;

  svg.appendChild(mk("path",{d:areaD,class:"areaPath"}));
  svg.appendChild(mk("path",{d:lineD,class:"linePath"}));
}

drawMarket($("#marketSvg"), 11);

/* market tabs + range */
const mTabs = $("#mTabs");
const mRange = $("#mRange");
let marketSeed = 11;

mTabs.addEventListener("click", (e)=>{
  const t = e.target.closest(".fx-tab");
  if(!t) return;
  $$(".fx-tab", mTabs).forEach(x=>x.classList.remove("active"));
  t.classList.add("active");

  const key = t.dataset.market;
  marketSeed = ({nasdaq:11, sse:21, euronext:31, bse:41}[key] || 11);
  drawMarket($("#marketSvg"), marketSeed + rangeAdd());
});

function rangeAdd(){
  const active = $(".r.active", mRange)?.dataset.range || "1d";
  return ({ "1d":0, "5d":3, "1m":6, "6m":9, "1y":12 }[active] || 0);
}

mRange.addEventListener("click", (e)=>{
  const r = e.target.closest(".r");
  if(!r) return;
  $$(".r", mRange).forEach(x=>x.classList.remove("active"));
  r.classList.add("active");
  drawMarket($("#marketSvg"), marketSeed + rangeAdd());
});

/* =========================
    Analytics chart (tooltip + dashed line)
========================= */
const tip = $("#tip");
const tipDate = $("#tipDate");
const tipVal = $("#tipVal");

function fmtDate(i){
  const base = new Date(Date.UTC(2023,0,30,1,12,16));
  base.setUTCMinutes(base.getUTCMinutes() + i*7);
  const month = base.toLocaleString(undefined,{month:"short"});
  const day = base.toLocaleString(undefined,{day:"2-digit"});
  const time = base.toLocaleString(undefined,{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:true});
  return `${month} ${day}, ${time}`;
}

function drawAnalytics(svg, seed=4){
  svg.innerHTML = "";
  const W=900, H=380;
  const padL=18, padR=52, padT=18, padB=54;

  // light grid (solid)
  const g = mk("g");
  for(let i=0;i<7;i++){
    const y = padT + (H-padT-padB)*(i/6);
    g.appendChild(mk("line",{x1:padL,y1:y,x2:W-padR,y2:y,class:"gridLine"}));
  }
  for(let i=0;i<10;i++){
    const x = padL + (W-padL-padR)*(i/9);
    g.appendChild(mk("line",{x1:x,y1:padT,x2:x,y2:H-padB,class:"gridLine"}));
  }
  svg.appendChild(g);

  // right axis labels
  const rightLabels = ["$15000","$12000","$9000","$6000","$3000","$0"];
  rightLabels.forEach((t, idx)=>{
    const y = padT + (H-padT-padB)*(idx/5) + 4;
    const tx = mk("text",{x:W-10,y:y,"text-anchor":"end",class:"axisText"});
    tx.textContent = t;
    svg.appendChild(tx);
  });

  // bottom time labels
  const times = ["10 am","11 am","12 pm","12 pm","12 pm","12 pm"];
  times.forEach((t, idx)=>{
    const x = padL + (W-padL-padR)*(idx/(times.length-1));
    const tx = mk("text",{x, y:H-14, "text-anchor":"middle", class:"axisText"});
    tx.textContent = t;
    svg.appendChild(tx);
  });

  // dashed horizontal reference line 
  const refY = padT + (H-padT-padB)*0.33;
  svg.appendChild(mk("line",{x1:padL,y1:refY,x2:W-padR,y2:refY,class:"refLine"}));

  const data = seededSeries(44, seed).map((v,i)=> v + i*0.9 + 22);
  const min = Math.min(...data), max = Math.max(...data);
  const span = (max-min)||1;
  const step = (W-padL-padR)/(data.length-1);

  const pts = data.map((v,i)=>({
    x: padL + i*step,
    y: padT + (H-padT-padB)*(1-(v-min)/span)
  }));

  const lineD = buildPath(pts);
  const areaD = `${lineD} L ${W-padR} ${H-padB} L ${padL} ${H-padB} Z`;

  svg.appendChild(mk("path",{d:areaD,class:"areaPath"}));
  svg.appendChild(mk("path",{d:lineD,class:"linePath"}));

  // hover elements
  const hoverLine = mk("line",{x1:padL,y1:padT,x2:padL,y2:H-padB,class:"hoverLine",opacity:"0"});
  const dot = mk("circle",{cx:padL,cy:padT,r:"6",class:"hoverDot",opacity:"0"});
  svg.appendChild(hoverLine);
  svg.appendChild(dot);

  function updateAt(idx){
    idx = clamp(idx, 0, pts.length-1);
    const p = pts[idx];

    hoverLine.setAttribute("x1", p.x);
    hoverLine.setAttribute("x2", p.x);
    hoverLine.setAttribute("opacity", "1");

    dot.setAttribute("cx", p.x);
    dot.setAttribute("cy", p.y);
    dot.setAttribute("opacity", "1");

    const rect = svg.getBoundingClientRect();
    const left = (p.x / W) * rect.width;
    const top = (p.y / H) * rect.height;

    tip.style.opacity = "1";
    // place tooltip slightly right like screenshot
    tip.style.left = `${clamp(left + 18, 10, rect.width - 180)}px`;
    tip.style.top = `${clamp(top - 26, 8, rect.height - 70)}px`;

    tipDate.textContent = fmtDate(idx);
    const val = 14032.56 + (idx - 20) * 14.7;
    tipVal.textContent = `$${val.toLocaleString(undefined,{minimumFractionDigits:2, maximumFractionDigits:2})}`;
  }

  // default hovered position (like screenshot)
  updateAt(22);

  svg.addEventListener("mousemove",(e)=>{
    const rect = svg.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * W;
    const idx = Math.round((mx - padL) / step);
    updateAt(idx);
  });
  svg.addEventListener("mouseleave",()=>{
    hoverLine.setAttribute("opacity","0");
    dot.setAttribute("opacity","0");
    tip.style.opacity="0";
  });
}

drawAnalytics($("#anaSvg"), 4);

// analytics range switch
const aRange = $("#aRange");
let aSeed = 4;
aRange.addEventListener("click",(e)=>{
  const t = e.target.closest("span");
  if(!t) return;
  $$("#aRange span").forEach(x=>x.classList.remove("active"));
  t.classList.add("active");

  const k = t.dataset.ar;
  aSeed = ({ "1d":4, "5d":8, "1m":12, "6m":18, "1y":24, "5y":33, "max":40 }[k] || 4);
  drawAnalytics($("#anaSvg"), aSeed);
});

/* =========================
    Stocks next arrow scroll
========================= */
const stocksRow = $("#stocksRow");
$("#stocksNext").addEventListener("click", ()=>{
  stocksRow.scrollBy({left:240, behavior:"smooth"});
});

/* =========================
    Mobile sidebar toggle
========================= */
const sidebar = $("#sidebar");
const overlay = $("#overlay");
const burger = $("#burger");

function openSide(){
  sidebar.classList.add("open");
  overlay.classList.add("show");
}
function closeSide(){
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
}
burger?.addEventListener("click", openSide);
overlay.addEventListener("click", closeSide);

window.addEventListener("keydown",(e)=>{
  if(e.key === "Escape") closeSide();
});