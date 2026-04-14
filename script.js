// ===== DATA =====
const ANGLES = [
  {deg:0,   rad:'0',       radVal:0},
  {deg:15,  rad:'π/12',    radVal:Math.PI/12},
  {deg:30,  rad:'π/6',     radVal:Math.PI/6},
  {deg:45,  rad:'π/4',    radVal:Math.PI/4},
  {deg:60,  rad:'π/3',    radVal:Math.PI/3},
  {deg:90,  rad:'π/2',    radVal:Math.PI/2},
  {deg:120, rad:'2π/3',   radVal:2*Math.PI/3},
  {deg:135, rad:'3π/4',   radVal:3*Math.PI/4},
  {deg:150, rad:'5π/6',   radVal:5*Math.PI/6},
  {deg:180, rad:'π',      radVal:Math.PI},
  {deg:210, rad:'7π/6',   radVal:7*Math.PI/6},
  {deg:225, rad:'5π/4',   radVal:5*Math.PI/4},
  {deg:240, rad:'4π/3',   radVal:4*Math.PI/3},
  {deg:270, rad:'3π/2',   radVal:3*Math.PI/2},
  {deg:300, rad:'5π/3',   radVal:5*Math.PI/3},
  {deg:315, rad:'7π/4',   radVal:7*Math.PI/4},
  {deg:330, rad:'11π/6',  radVal:11*Math.PI/6},
  {deg:360, rad:'2π',     radVal:2*Math.PI},
];

const SPECIAL = new Set([0,30,45,60,90,120,135,150,180,210,225,240,270,300,315,330,360]);

function quadrant(d) {
  if(d>=0 && d<90) return 'Q1';
  if(d>=90 && d<180) return 'Q2';
  if(d>=180 && d<270) return 'Q3';
  return 'Q4';
}

function fmtTan(v) {
  if(!isFinite(v)) return '∞';
  return v.toFixed(3);
}

function fmtSin(v) {
  const s = [0, 0.5, Math.sqrt(2)/2, Math.sqrt(3)/2, 1, -0.5, -Math.sqrt(2)/2, -Math.sqrt(3)/2, -1];
  const labels = ['0', '½', '√2/2', '√3/2', '1', '-½', '-√2/2', '-√3/2', '-1'];
  for(let i=0;i<s.length;i++) if(Math.abs(v-s[i])<0.001) return labels[i];
  return v.toFixed(3);
}

// Build table
function buildTable() {
  const tbody = document.getElementById('tableBody');
  if (!tbody) return;
  ANGLES.forEach(a => {
    const s = Math.sin(a.radVal), c = Math.cos(a.radVal), t = Math.tan(a.radVal);
    const tr = document.createElement('tr');
    tr.dataset.deg = a.deg;
    tr.dataset.quad = quadrant(a.deg);
    tr.dataset.special = SPECIAL.has(a.deg) ? '1' : '0';

    const sinPct = Math.round(((s+1)/2)*100);
    const cosPct = Math.round(((c+1)/2)*100);
    const sinColor = s>=0 ? '#ff6b6b' : '#ff9999';
    const cosColor = c>=0 ? '#4ecdc4' : '#9ee8e4';

    tr.innerHTML = `
      <td class="td-deg">${a.deg}°</td>
      <td class="td-rad">${a.rad}</td>
      <td class="td-sin">${fmtSin(s)}</td>
      <td class="td-cos">${fmtSin(c)}</td>
      <td class="td-tan">${fmtTan(t)}</td>
      <td class="td-bar">
        <div class="bar-wrap">
          <div class="bar-bg"><div class="bar-fill" style="width:${sinPct}%;background:${sinColor}"></div></div>
          <span style="font-family:'DM Mono',monospace;font-size:11px;color:var(--muted);min-width:32px">${s.toFixed(2)}</span>
        </div>
      </td>
      <td class="td-bar">
        <div class="bar-wrap">
          <div class="bar-bg"><div class="bar-fill" style="width:${cosPct}%;background:${cosColor}"></div></div>
          <span style="font-family:'DM Mono',monospace;font-size:11px;color:var(--muted);min-width:32px">${c.toFixed(2)}</span>
        </div>
      </td>
    `;
    tr.addEventListener('click', () => {
      document.getElementById('angleSlider').value = a.deg;
      updateAll(a.deg);
      tr.scrollIntoView({behavior:'smooth', block:'nearest'});
      document.getElementById('circulo').scrollIntoView({behavior:'smooth'});
    });
    tbody.appendChild(tr);
  });
}

function filterTable(q, btn) {
  document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('#tableBody tr').forEach(tr=>{
    if(q==='all') { tr.style.display=''; return; }
    if(q==='special') { tr.style.display = tr.dataset.special==='1' ? '' : 'none'; return; }
    tr.style.display = tr.dataset.quad===q ? '' : 'none';
  });
}

// ===== CANVAS =====
const SIN_COL = '#ff6b6b';
const COS_COL = '#4ecdc4';
const RAD_COL = '#a78bfa';
const BG = '#13161e';
const GRID = 'rgba(255,255,255,0.06)';
const TEXT_COL = '#6b7280';

function drawCircle(deg) {
  const cc = document.getElementById('circleCanvas');
  if (!cc) return;
  const ctx = cc.getContext('2d');
  const rad = deg * Math.PI / 180;
  const W = cc.width, H = cc.height;
  const cx = W/2, cy = H/2, r = W*0.38;

  ctx.clearRect(0,0,W,H);
  ctx.fillStyle = BG; ctx.fillRect(0,0,W,H);

  // concentric rings
  [0.25,0.5,0.75,1].forEach(f => {
    ctx.strokeStyle = GRID; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx,cy,r*f,0,2*Math.PI); ctx.stroke();
  });

  // axes
  ctx.strokeStyle = GRID; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cx-r-20,cy); ctx.lineTo(cx+r+20,cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx,cy-r-20); ctx.lineTo(cx,cy+r+20); ctx.stroke();

  // quadrant labels
  ctx.font = '10px DM Mono, monospace'; ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.textAlign='center';
  ctx.fillText('0°/360°', cx+r+16, cy-8);
  ctx.fillText('90°', cx+6, cy-r-12);
  ctx.fillText('180°', cx-r-16, cy-8);
  ctx.fillText('270°', cx+8, cy+r+16);

  const px = cx + r*Math.cos(rad);
  const py = cy - r*Math.sin(rad);
  const s = Math.sin(rad), c = Math.cos(rad);

  // angle arc fill
  ctx.fillStyle = 'rgba(129,140,248,0.08)';
  ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,r,0,-rad,false); ctx.closePath(); ctx.fill();

  // cos line
  ctx.strokeStyle = COS_COL; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(px,cy); ctx.stroke();

  // sin line
  ctx.strokeStyle = SIN_COL; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(px,cy); ctx.lineTo(px,py); ctx.stroke();

  // dashed projection lines
  ctx.setLineDash([4,4]); ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(cx,py); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx,py); ctx.stroke();
  ctx.setLineDash([]);

  // radius
  ctx.strokeStyle = RAD_COL; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(px,py); ctx.stroke();

  // angle arc
  ctx.strokeStyle = 'rgba(129,140,248,0.5)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(cx,cy,28,0,-rad,rad>=0); ctx.stroke();

  // unit circle
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(cx,cy,r,0,2*Math.PI); ctx.stroke();

  // point
  ctx.fillStyle = '#0d0f14';
  ctx.beginPath(); ctx.arc(px,py,8,0,2*Math.PI); ctx.fill();
  ctx.fillStyle = RAD_COL;
  ctx.beginPath(); ctx.arc(px,py,6,0,2*Math.PI); ctx.fill();

  // labels
  ctx.font = 'bold 12px Outfit, sans-serif'; ctx.textAlign='center';
  ctx.fillStyle = COS_COL;
  const midCosX = (cx+px)/2, midCosY = cy + (c>=0?16:-20);
  ctx.fillText('cos', midCosX, midCosY);

  ctx.fillStyle = SIN_COL;
  const midSinX = px + (c>=0?22:-22), midSinY = (cy+py)/2;
  ctx.fillText('sen', midSinX, midSinY+4);

  // angle text
  ctx.fillStyle = RAD_COL; ctx.font = '11px DM Mono, monospace';
  const lx = cx + 38*Math.cos(-rad/2), ly = cy - 38*Math.sin(-rad/2)+4;
  ctx.fillText(deg + '°', lx, ly);
}

function drawWave(deg) {
  const wc = document.getElementById('waveCanvas');
  if (!wc) return;
  const wctx = wc.getContext('2d');
  const ww = wc.parentElement.offsetWidth - 48 || 400;
  wc.width = ww; wc.height = 180;
  const wh = 180;
  const wy = wh/2, amp = 62;

  wctx.clearRect(0,0,ww,wh);
  wctx.fillStyle = BG; wctx.fillRect(0,0,ww,wh);

  // grid horizontal
  wctx.strokeStyle = GRID; wctx.lineWidth = 1;
  wctx.beginPath(); wctx.moveTo(0,wy); wctx.lineTo(ww,wy); wctx.stroke();

  // x labels
  wctx.font='10px DM Mono,monospace'; wctx.fillStyle=TEXT_COL; wctx.textAlign='center';
  ['0°','90°','180°','270°','360°'].forEach((l,i)=>{
    const x = i*(ww/4);
    wctx.fillText(l,x,wy+18);
    wctx.strokeStyle=GRID; wctx.lineWidth=0.5;
    wctx.beginPath(); wctx.moveTo(x,wy-amp-10); wctx.lineTo(x,wy+amp+10); wctx.stroke();
  });

  // sin wave
  wctx.strokeStyle = SIN_COL; wctx.lineWidth = 2;
  wctx.beginPath();
  for(let i=0;i<=ww;i++){
    const a = (i/ww)*2*Math.PI;
    const y = wy - amp*Math.sin(a);
    i===0? wctx.moveTo(i,y): wctx.lineTo(i,y);
  }
  wctx.stroke();

  // cos wave
  wctx.strokeStyle = COS_COL; wctx.lineWidth = 2;
  wctx.beginPath();
  for(let i=0;i<=ww;i++){
    const a = (i/ww)*2*Math.PI;
    const y = wy - amp*Math.cos(a);
    i===0? wctx.moveTo(i,y): wctx.lineTo(i,y);
  }
  wctx.stroke();

  // markers
  const wx = (deg/360)*ww;
  const s = Math.sin(deg*Math.PI/180), c = Math.cos(deg*Math.PI/180);

  // vertical line
  wctx.strokeStyle = 'rgba(129,140,248,0.35)'; wctx.lineWidth = 1; wctx.setLineDash([4,4]);
  wctx.beginPath(); wctx.moveTo(wx,0); wctx.lineTo(wx,wh); wctx.stroke();
  wctx.setLineDash([]);

  // sin point
  wctx.fillStyle = '#0d0f14';
  wctx.beginPath(); wctx.arc(wx, wy-amp*s, 7, 0, 2*Math.PI); wctx.fill();
  wctx.fillStyle = SIN_COL;
  wctx.beginPath(); wctx.arc(wx, wy-amp*s, 5, 0, 2*Math.PI); wctx.fill();

  // cos point
  wctx.fillStyle = '#0d0f14';
  wctx.beginPath(); wctx.arc(wx, wy-amp*c, 7, 0, 2*Math.PI); wctx.fill();
  wctx.fillStyle = COS_COL;
  wctx.beginPath(); wctx.arc(wx, wy-amp*c, 5, 0, 2*Math.PI); wctx.fill();
}

function radLabel(deg) {
  const map = {0:'0', 15:'π/12', 30:'π/6', 45:'π/4', 60:'π/3', 90:'π/2',
    120:'2π/3', 135:'3π/4', 150:'5π/6', 180:'π', 210:'7π/6', 225:'5π/4',
    240:'4π/3', 270:'3π/2', 300:'5π/3', 315:'7π/4', 330:'11π/6', 360:'2π'};
  if(map[deg]) return map[deg];
  return (deg*Math.PI/180).toFixed(3) + ' rad';
}

function updateAll(deg) {
  const rad = deg*Math.PI/180;
  const s = Math.sin(rad), c = Math.cos(rad), t = Math.tan(rad);

  document.getElementById('degShow').textContent = deg + '°';
  document.getElementById('radShow').textContent = radLabel(deg);
  document.getElementById('sinShow').textContent = s.toFixed(3);
  document.getElementById('cosShow').textContent = c.toFixed(3);
  document.getElementById('tanShow').textContent = isFinite(t) ? t.toFixed(3) : '∞';

  const s2 = s*s, c2 = c*c;
  document.getElementById('sin2bar').style.width = Math.round(s2*100)+'%';
  document.getElementById('cos2bar').style.width = Math.round(c2*100)+'%';
  document.getElementById('sin2val').textContent = s2.toFixed(4);
  document.getElementById('cos2val').textContent = c2.toFixed(4);
  document.getElementById('sumVal').textContent = (s2+c2).toFixed(4);

  drawCircle(deg);
  drawWave(deg);

  // highlight table row
  document.querySelectorAll('#tableBody tr').forEach(tr=>{
    tr.classList.toggle('highlighted', +tr.dataset.deg===deg);
  });
}

// NAV dots active
const sections = ['inicio','definiciones','circulo','propiedades','potencias','prop-potencias','raices','prop-raices','definicion-log','logaritmos','tabla'];
const navLinks = document.querySelectorAll('.nav a');
const io = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      const i = sections.indexOf(e.target.id);
      navLinks.forEach((a,j)=>a.classList.toggle('active',j===i));
    }
  });
},{threshold:0.4});
sections.forEach(id=>{const el=document.getElementById(id); if(el)io.observe(el);});

document.getElementById('angleSlider').addEventListener('input', e=>updateAll(+e.target.value));

buildTable();
updateAll(45);
window.addEventListener('resize',()=>updateAll(+document.getElementById('angleSlider').value));

// ===== TITLE TRANSLATION =====
const translations = ['Matemáticas','Mathematics','Mathématiques','Matematica','Mathematik','Matemáticas','Matematik','Mathematics','Maтемáтiĸa','Μαθηματικά'];
let langIndex = 0;
document.getElementById('mainTitle').textContent = translations[langIndex];
setInterval(() => {
  langIndex = (langIndex + 1) % translations.length;
  document.getElementById('mainTitle').textContent = translations[langIndex];
}, 3000);

// ===== POTENCIA GRAFICO =====
const potenciaCanvas = document.getElementById('potenciaCanvas');
const pctx = potenciaCanvas?.getContext('2d');
let currentBase = 2;
let animProgress = 0;
let animatingBase = 2;

function drawPotenciaGrafico(base, progress = 1) {
  if (!pctx || !potenciaCanvas) return;
  const w = potenciaCanvas.parentElement?.offsetWidth - 48 || 600;
  const h = 200;
  potenciaCanvas.width = w;
  potenciaCanvas.height = h;
  
  pctx.clearRect(0, 0, w, h);
  pctx.fillStyle = '#13161e';
  pctx.fillRect(0, 0, w, h);
  
  // grid
  pctx.strokeStyle = 'rgba(255,255,255,0.06)';
  pctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    pctx.beginPath();
    pctx.moveTo(0, i * (h / 5));
    pctx.lineTo(w, i * (h / 5));
    pctx.stroke();
  }
  for (let i = 0; i <= 6; i++) {
    pctx.beginPath();
    pctx.moveTo(i * (w / 6), 0);
    pctx.lineTo(i * (w / 6), h);
    pctx.stroke();
  }
  
  const maxVal = Math.pow(base, 10);
  const padded = maxVal * 1.1;
  const groundY = h - 30;
  const chartH = h - 50;
  
  // labels
  pctx.fillStyle = '#6b7280';
  pctx.font = '10px DM Mono, monospace';
  pctx.textAlign = 'center';
  for (let i = 0; i <= 6; i++) {
    const val = Math.round((i / 6) * 10);
    pctx.fillText('n=' + val, i * (w / 6), groundY + 15);
  }
  
  // draw curve
  const numPoints = Math.floor(50 * progress);
  pctx.strokeStyle = '#818cf8';
  pctx.lineWidth = 2.5;
  pctx.beginPath();
  for (let i = 0; i <= numPoints; i++) {
    const n = (i / 50) * 10;
    const val = Math.pow(base, n);
    const x = (i / 50) * (w - 40) + 20;
    const y = groundY - (val / padded) * chartH;
    if (i === 0) pctx.moveTo(x, y);
    else pctx.lineTo(x, y);
  }
  pctx.stroke();
  
  // animated dot
  if (progress >= 1) {
    const lastN = 10;
    const lastVal = Math.pow(base, lastN);
    const x = w - 20;
    const y = groundY - (lastVal / padded) * chartH;
    
    pctx.fillStyle = '#0d0f14';
    pctx.beginPath();
    pctx.arc(x, y, 8, 0, Math.PI * 2);
    pctx.fill();
    pctx.fillStyle = '#818cf8';
    pctx.beginPath();
    pctx.arc(x, y, 5, 0, Math.PI * 2);
    pctx.fill();
    
    pctx.fillStyle = '#e8eaf0';
    pctx.font = 'bold 12px DM Mono, monospace';
    pctx.fillText(base + '^10 = ' + lastVal.toLocaleString(), x - 40, y - 15);
  }
}

function animatePotencia() {
  animProgress += 0.02;
  if (animProgress > 1) animProgress = 1;
  drawPotenciaGrafico(animatingBase, animProgress);
  if (animProgress < 1) {
    requestAnimationFrame(animatePotencia);
  }
}

function updatePotenciaGrafico(base, btn) {
  currentBase = base;
  animatingBase = base;
  animProgress = 0;
  document.querySelectorAll('#potencias .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  animatePotencia();
}

if (potenciaCanvas) {
  const btn = document.querySelector('#potencias button.filter-btn');
  if (btn) updatePotenciaGrafico(2, btn);
  window.addEventListener('resize', () => {
    const activeBtn = document.querySelector('#potencias button.filter-btn.active') || document.querySelector('#potencias button.filter-btn');
    if (activeBtn) updatePotenciaGrafico(currentBase, activeBtn);
  });
}

// ===== TREE NAV =====
const sectionMap = [
  {id: 'inicio', num: '0', title: 'Inicio'},
  {id: 'definiciones', num: '1.1', title: 'Fundamentos (Seno y Coseno)'},
  {id: 'circulo', num: '1.2', title: 'Círculo Trigonométrico'},
  {id: 'propiedades', num: '1.3', title: 'Propiedades Trig'},
  {id: 'potencias', num: '2.1', title: '¿Qué es una Potencia?'},
  {id: 'prop-potencias', num: '2.2', title: 'Propiedades de las Potencias'},
  {id: 'raices', num: '3.1', title: '¿Qué es una Raíz?'},
  {id: 'prop-raices', num: '3.2', title: 'Propiedades de las Raíces'},
  {id: 'triangulo', num: '4.1', title: 'Definición de Triángulo'},
  {id: 'clasificacion', num: '4.2', title: 'Clasificación'},
  {id: 'teoremas', num: '4.3', title: 'Teoremas'},
  {id: 'teoremas-cualesquiera', num: '4.4', title: 'Teoremas Cualesquiera'},
  {id: 'definicion-log', num: '5.1', title: '¿Qué es un Logaritmo?'},
  {id: 'logaritmos', num: '5.2', title: 'Propiedades de los Logaritmos'},
  {id: 'tabla', num: '1.4', title: 'Tabla de Referencia'},
];

// Toggle rama
function toggleRama(header) {
  const section = header.closest('.tree-nav-section');
  section.classList.toggle('expanded');
}

// Init: expandir la primera rama
document.querySelector('.tree-nav-section')?.classList.add('expanded');

// Buscador
const navSearch = document.getElementById('navSearch');
const navResults = document.getElementById('navResults');

navSearch?.addEventListener('input', e => {
  const query = e.target.value.toLowerCase().trim();
  const resultsContainer = document.getElementById('navResults');
  
  if (!query) {
    resultsContainer.classList.remove('show');
    return;
  }
  
  const matches = sectionMap.filter(s => s.title.toLowerCase().includes(query));
  
  if (matches.length === 0) {
    resultsContainer.innerHTML = '<a style="color:var(--muted)">No encontrado</a>';
  } else {
    resultsContainer.innerHTML = matches.map(m => 
      `<a href="#${m.id}">${m.num} — ${m.title}</a>`
    ).join('');
  }
  
  resultsContainer.classList.add('show');
});

navSearch?.addEventListener('blur', () => {
  setTimeout(() => document.getElementById('navResults')?.classList.remove('show'), 200);
});

// Highlight activo en tree nav
const treeSections = ['inicio','definiciones','circulo','propiedades','potencias','prop-potencias','raices','prop-raices','triangulo','clasificacion','teoremas','teoremas-cualesquiera','definicion-log','logaritmos','tabla'];
const treeLinks = document.querySelectorAll('.tree-nav-items a');
const treeObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const id = e.target.id;
      const idx = treeSections.indexOf(id);
      
      // Highlight items
      treeLinks.forEach((a, i) => a.classList.toggle('active', i === idx));
      
      // Determinar rama activa
      const section = document.querySelectorAll('.tree-nav-section');
      section.forEach(s => s.classList.remove('active'));
      
      if (id === 'inicio') {
        document.querySelector('.rama-sen')?.classList.add('active');
      } else if (idx >= 1 && idx <= 4) {
        document.querySelector('.rama-sen')?.classList.add('active');
      } else if (idx >= 5 && idx <= 6) {
        document.querySelector('.rama-pot')?.classList.add('active');
      } else if (idx >= 7 && idx <= 8) {
        document.querySelector('.rama-rai')?.classList.add('active');
      } else if (idx >= 9 && idx <= 12) {
        document.querySelector('.rama-tri')?.classList.add('active');
      } else if (idx >= 13 && idx <= 14) {
        document.querySelector('.rama-log')?.classList.add('active');
      }
    }
  });
}, {threshold: 0.3});

treeSections.forEach(id => {
  const el = document.getElementById(id);
  if (el) treeObs.observe(el);
});

// ===== RESUMEN Y EJERCICIOS =====
const completeSections = {
  tabla: {
    title: "Seno y Coseno",
    resumen: "SENO Y COSENO: El seno (sen) mide la altura vertical, el coseno (cos) mide la posición horizontal. En el círculo unitario: sen(θ)=coordenada Y, cos(θ)=coordenada X. Siempre se cumple: sen²θ + cos²θ = 1. sen(-θ) = -sen(θ) (impar), cos(-θ) = cos(θ) (par). Las funciones se repiten cada 360° (período). Rango: -1 ≤ sen ≤ 1, -1 ≤ cos ≤ 1. Valores especiales: sen 0°=0, sen 90°=1, cos 0°=1, cos 90°=0.",
    ejercicios: [
      { tipo: "cálculo", texto: "En un triángulo rectángulo, hipotenusa=10cm, cateto=6cm. Calcula el seno del ángulo opuesto." },
      { tipo: "problema", texto: "Si sen(θ)=0.8, calcula cos(θ) usando la identidad pitagórica." },
      { tipo: "cálculo", texto: "Calcula las coordenadas del punto en el círculo unitario para θ=45°." },
      { tipo: "concepto", texto: "Explica por qué sen(90°)=1 y cos(90°)=0." },
      { tipo: "problema", texto: "Si sen(θ)=0.6, calcula tan(θ)." }
    ]
  },
  "teoremas-cualesquiera": {
    title: "Triángulos",
    resumen: "TRIÁNGULOS: Un triángulo tiene 3 lados, 3 vértices y 3 ángulos que suman 180°. TEOREMA DE PITÁGORAS: en triángulo rectángulo, c² = a² + b². TEOREMA DE LA ALTURA: h² = m · n. TEOREMA DE LOS CATETOS: a² = c·m, b² = c·n. TEOREMA DE LA MEDIANA: m = c/2. RECÍPROCO: si a² + b² = c², el triángulo es rectángulo.",
    ejercicios: [
      { tipo: "cálculo", texto: "Calcula la hipotenusa si los catetos miden 3 cm y 4 cm." },
      { tipo: "cálculo", texto: "Calcula un cateto si la hipotenusa es 13 cm y el otro cateto 5 cm." },
      { tipo: "problema", texto: "Usa el recíproco: ¿es rectángulo un triángulo de lados 5, 12, 13?" },
      { tipo: "concepto", texto: "¿Por qué en un triángulo rectángulo la mediana = hipotenusa/2?" },
      { tipo: "problema", texto: "Calcula el área de un triángulo rectángulo con catetos 6 cm y 8 cm." }
    ]
  },
  logaritmos: {
    title: "Logaritmos",
    resumen: "LOGARITMOS: logₐ(x) = y ⟺ aʸ = x. Es la operación inversa a la potenciación. Condiciones: a > 0, a ≠ 1, x > 0. Propiedades: log(A·B) = log A + log B, log(A/B) = log A - log B, log(Aⁿ) = n·log A. Casos especiales: logₐ(1) = 0, logₐ(a) = 1.",
    ejercicios: [
      { tipo: "cálculo", texto: "Calcula: log₂(8)" },
      { tipo: "cálculo", texto: "Calcula: log₁₀(100)" },
      { tipo: "cálculo", texto: "Usa propiedades: log₂(16 · 4)" },
      { tipo: "cálculo", texto: "Calcula: log₃(9)" },
      { tipo: "concepto", texto: "¿Por qué no existe log₂(-8)?" }
    ]
  }
};

// Función para crear las subsecciones al final de cada sección completa
function addResumenEjercicios() {
  Object.keys(completeSections).forEach(sectionId => {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    const container = section.querySelector('.container');
    if (!container) return;
    
    if (section.querySelector('.resumen-box')) return;
    
    const data = completeSections[sectionId];
    const resumenHTML = `
      <div class="resumen-box" style="background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:2rem;margin-top:2rem">
        <h3 style="font-family:'DM Serif Display',serif;font-size:1.3rem;margin-bottom:1rem;color:var(--accent)">📝 Resumen</h3>
        <p style="color:var(--muted);line-height:1.8;font-size:14px">${data.resumen}</p>
      </div>
    `;
    
    const ejerciciosHTML = `
      <div class="ejercicios-box" style="background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:2rem;margin-top:1.5rem">
        <h3 style="font-family:'DM Serif Display',serif;font-size:1.3rem;margin-bottom:1rem;color:var(--gold)">✏️ Ejercicios (5)</h3>
        <ol style="color:var(--text);padding-left:1.25rem;line-height:2">
          ${data.ejercicios.map((e, i) => `
            <li style="margin-bottom:0.75rem">
              <span style="font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:0.05em">${e.tipo}</span>
              <p style="color:var(--text);margin-top:0.25rem">${e.texto}</p>
            </li>
          `).join('')}
        </ol>
      </div>
    `;
    
    container.insertAdjacentHTML('beforeend', resumenHTML + ejerciciosHTML);
  });
}

// Agregar estilos para las cajas
const style = document.createElement('style');
style.textContent = `
  .resumen-box, .ejercicios-box { animation: fadeIn 0.5s ease; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
`;
document.head.appendChild(style);

// ===== TRIÁNGULOS CANVAS =====
function drawTriangulo() {
  const canvas = document.getElementById('trianguloCanvas');
  if (!canvas) return;
  try {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.parentElement?.offsetWidth || 250;
    const h = 200;
    canvas.width = w; canvas.height = h;
    
    ctx.fillStyle = '#1a1e28';
    ctx.fillRect(0, 0, w, h);
    
    const ax = w * 0.15, ay = h * 0.8;
    const bx = w * 0.85, by = h * 0.8;
    const cx = w * 0.5, cy = h * 0.2;
    
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.lineTo(cx, cy);
    ctx.closePath();
    ctx.stroke();
    
    ctx.fillStyle = 'rgba(129,140,248,0.1)';
    ctx.fill();
    
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px DM Mono, monospace';
    ctx.fillText('A', ax - 15, ay + 20);
    ctx.fillText('B', bx + 10, by + 20);
    ctx.fillText('C', cx - 5, cy - 10);
  } catch(e) { console.error('Error drawTriangulo:', e); }
}

function drawPitagoras() {
  const canvas = document.getElementById('pitagorasCanvas');
  if (!canvas) return;
  try {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.parentElement?.offsetWidth || 400;
    const h = 220;
    canvas.width = w; canvas.height = h;
    
    ctx.fillStyle = '#1a1e28';
    ctx.fillRect(0, 0, w, h);
    
    // Triángulo rectángulo con ángulo recto en corner izquierda
    const x0 = w * 0.15;
    const y0 = h * 0.75;
    const base = w * 0.55;
    const altura = h * 0.5;
    
    // Dibujar triángulo
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x0, y0); // Esquina inferior izquierda (90°)
    ctx.lineTo(x0 + base, y0); // Esquina inferior derecha
    ctx.lineTo(x0, y0 - altura); // Esquina superior izquierda
    ctx.closePath();
    ctx.stroke();
    
    // Ángulo recto (cuadrado)
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 2;
    const squareSize = 20;
    ctx.beginPath();
    ctx.moveTo(x0 + squareSize, y0);
    ctx.lineTo(x0 + squareSize, y0 - squareSize);
    ctx.lineTo(x0, y0 - squareSize);
    ctx.stroke();
    
    // Etiquetas
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 14px DM Mono, monospace';
    ctx.fillText('c', x0 + base/2 - 5, y0 + 20); // hipotenusa (arriba)
    ctx.fillStyle = '#ff6b6b';
    ctx.fillText('a', x0 - 15, y0 - altura/2); // cateto vertical
    ctx.fillStyle = '#4ecdc4';
    ctx.fillText('b', x0 + base/2, y0 - altura - 10); // cateto horizontal
  } catch(e) { console.error('Error drawPitagoras:', e); }
}

function drawAltura() {
  const canvas = document.getElementById('alturaCanvas');
  if (!canvas) return;
  try {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.parentElement?.offsetWidth || 350;
    const h = 180;
    canvas.width = w; canvas.height = h;
    
    ctx.fillStyle = '#1a1e28';
    ctx.fillRect(0, 0, w, h);
    
    const mx = w * 0.5, my = h * 0.75;
    const tam = h * 0.5;
    
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(mx - tam, my);
    ctx.lineTo(mx + tam, my);
    ctx.stroke();
    
    ctx.strokeStyle = '#ffd166';
    ctx.beginPath();
    ctx.moveTo(mx, my);
    ctx.lineTo(mx, my - tam * 0.9);
    ctx.stroke();
    
    ctx.strokeStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.moveTo(mx - tam, my);
    ctx.lineTo(mx, my - tam * 0.9);
    ctx.lineTo(mx, my);
    ctx.closePath();
    ctx.stroke();
    
    ctx.strokeStyle = '#4ecdc4';
    ctx.beginPath();
    ctx.moveTo(mx + tam, my);
    ctx.lineTo(mx, my - tam * 0.9);
    ctx.lineTo(mx, my);
    ctx.closePath();
    ctx.stroke();
    
    ctx.fillStyle = '#ffd166';
    ctx.font = '12px DM Mono, monospace';
    ctx.fillText('h', mx - 15, my - tam * 0.4);
    ctx.fillText('m', mx - tam * 0.5, my + 20);
    ctx.fillText('n', mx + tam * 0.5, my + 20);
  } catch(e) { console.error('Error drawAltura:', e); }
}

function drawMediana() {
  const canvas = document.getElementById('medianaCanvas');
  if (!canvas) return;
  try {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.parentElement?.offsetWidth || 350;
    const h = 180;
    canvas.width = w; canvas.height = h;
    
    ctx.fillStyle = '#1a1e28';
    ctx.fillRect(0, 0, w, h);
    
    const mx = w * 0.5, my = h * 0.7;
    const tam = h * 0.45;
    
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(mx - tam * 0.6, my + tam * 0.4);
    ctx.lineTo(mx + tam * 0.6, my + tam * 0.4);
    ctx.lineTo(mx - tam * 0.6, my - tam * 0.5);
    ctx.closePath();
    ctx.stroke();
    
    const px = mx + tam * 0.3;
    const py = my + tam * 0.2;
    ctx.fillStyle = '#4ecdc4';
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    ctx.beginPath();
    ctx.moveTo(mx - tam * 0.6, my - tam * 0.5);
    ctx.lineTo(px, py);
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.fillStyle = '#ffd166';
    ctx.font = '12px DM Mono, monospace';
    ctx.fillText('M', px + 8, py - 8);
    ctx.fillText('c/2', mx - tam * 0.1, my + tam * 0.35);
  } catch(e) { console.error('Error drawMediana:', e); }
}

function drawClasificacion() {
  const canvas = document.getElementById('clasifCanvas');
  if (!canvas) return;
  try {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.parentElement?.offsetWidth || 400;
    const h = 280;
    canvas.width = w;
    canvas.height = h;
    
    ctx.fillStyle = '#13161e';
    ctx.fillRect(0, 0, w, h);
    
    const yBase = h * 0.75;
    const cx = w / 2;
    
    // Por lados
    ctx.fillStyle = '#818cf8';
    ctx.font = 'bold 14px DM Mono, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('POR LADOS', cx, 25);
    
    // Equilátero
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 80, yBase - 20);
    ctx.lineTo(cx - 110, yBase - 80);
    ctx.lineTo(cx - 50, yBase - 80);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = 'rgba(129,140,248,0.2)';
    ctx.fill();
    ctx.fillStyle = '#6b7280';
    ctx.font = '11px DM Mono';
    ctx.fillText('Equilátero', cx - 80, yBase + 5);
    
    // Isósceles
    ctx.strokeStyle = '#4ecdc4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, yBase - 20);
    ctx.lineTo(cx - 30, yBase - 80);
    ctx.lineTo(cx + 20, yBase - 80);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = 'rgba(78,205,196,0.2)';
    ctx.fill();
    ctx.fillStyle = '#6b7280';
    ctx.fillText('Isósceles', cx - 10, yBase + 5);
    
    // Escaleno
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx + 80, yBase - 20);
    ctx.lineTo(cx + 50, yBase - 80);
    ctx.lineTo(cx + 120, yBase - 80);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,107,107,0.2)';
    ctx.fill();
    ctx.fillStyle = '#6b7280';
    ctx.fillText('Escaleno', cx + 85, yBase + 5);
    
    // Por ángulos
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 14px DM Mono, sans-serif';
    ctx.fillText('POR ÁNGULOS', cx, yBase + 40);
    
    // Acutángulo
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 80, yBase + 80);
    ctx.lineTo(cx - 40, yBase + 80);
    ctx.lineTo(cx - 80, yBase + 50);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = '#6b7280';
    ctx.font = '11px DM Mono';
    ctx.fillText('Acutángulo', cx - 60, yBase + 110);
    
    // Rectángulo
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 10, yBase + 80);
    ctx.lineTo(cx + 30, yBase + 80);
    ctx.lineTo(cx - 10, yBase + 50);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = '#6b7280';
    ctx.fillText('Rectángulo', cx + 10, yBase + 110);
    
    // Rectángulo con ángulo
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx - 10, yBase + 80, 6, 0, Math.PI/2);
    ctx.stroke();
    
    // Obtusángulo
    ctx.strokeStyle = '#a78bfa';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx + 70, yBase + 80);
    ctx.lineTo(cx + 110, yBase + 80);
    ctx.lineTo(cx + 70, yBase + 45);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = '#6b7280';
    ctx.fillText('Obtusángulo', cx + 90, yBase + 110);
  } catch(e) {
    console.error('Error en drawClasificacion:', e);
  }
}

// Inicializar canvas de triángulos con delay
setTimeout(function() {
  try {
    const tc = document.getElementById('trianguloCanvas');
    const pc = document.getElementById('pitagorasCanvas');
    const ac = document.getElementById('alturaCanvas');
    const mc = document.getElementById('medianaCanvas');
    const cc = document.getElementById('clasifCanvas');
    
    if (tc && typeof drawTriangulo === 'function') { 
      console.log('Dibujando triangulo'); 
      drawTriangulo(); 
    }
    if (pc && typeof drawPitagoras === 'function') { 
      console.log('Dibujando pitagoras'); 
      drawPitagoras(); 
    }
    if (ac && typeof drawAltura === 'function') { 
      console.log('Dibujando altura'); 
      drawAltura(); 
    }
    if (mc && typeof drawMediana === 'function') { 
      console.log('Dibujando mediana'); 
      drawMediana(); 
    }
    if (cc && typeof drawClasificacion === 'function') { 
      console.log('Dibujando clasificacion'); 
      drawClasificacion(); 
    }
  } catch(e) {
    console.error('Error inicializando canvas:', e);
  }
}, 100);

// Window resize
window.addEventListener('resize', function() {
  try {
    if (typeof drawClasificacion === 'function') drawClasificacion();
  } catch(e) {}
});

// Inicializar
document.addEventListener('DOMContentLoaded', addResumenEjercicios);