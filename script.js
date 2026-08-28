/* =========================================================
   CONFIG — edite aqui se algum nome/número mudar
========================================================= */
const CONFIG = {
  federal:   { name:'Dr. Mário Heringer', number:'1234' },
  estadual:  { name:'Bruno Miranda',      number:'12345' },
  governador:{ name:'Alexandre Kalil', sub:'Vice Carlos Mosconi', number:'12' },
  colors: {
    navy:'#123A6B', navyDark:'#0B2547', green:'#12A64C', greenDark:'#0C8A3C',
    bg:'#F4F6F9', white:'#FFFFFF'
  },
  fontDisplay:'SaoTorpes',
  fontBody:'Montserrat',
  bgImageSrc:'assets/background-colinha.png'
};

/* Pré-carrega a imagem de fundo usada na colinha final (1080x1920) */
const bgImage = new Image();
let bgImageReady = false;
bgImage.onload = () => { bgImageReady = true; };
bgImage.src = CONFIG.bgImageSrc;
function ensureBgImageLoaded(){
  return new Promise((resolve)=>{
    if(bgImageReady || bgImage.complete){ resolve(); return; }
    bgImage.addEventListener('load', ()=>resolve(), { once:true });
    bgImage.addEventListener('error', ()=>resolve(), { once:true });
  });
}

/* =========================================================
   NAVIGATION
========================================================= */
const track = document.getElementById('track');
const totalScreens = 8; // intro + 6 steps + result
let current = 0;

function goTo(index){
  current = Math.max(0, Math.min(totalScreens - 1, index));
  track.style.transform = `translateX(-${current * 100}%)`;
}
document.getElementById('startBtn').addEventListener('click', () => goTo(1));
document.querySelectorAll('[data-back]').forEach(btn=>{
  btn.addEventListener('click', () => goTo(current - 1));
});

/* =========================================================
   DIGIT BOX HELPERS
========================================================= */
function makeFixedDigits(container, value){
  container.innerHTML = '';
  [...value].forEach(ch=>{
    const box = document.createElement('div');
    box.className = 'digit-box fixed';
    box.style.display = 'flex';
    box.style.alignItems = 'center';
    box.style.justifyContent = 'center';
    box.textContent = ch;
    container.appendChild(box);
  });
  const check = document.createElement('div');
  check.className = 'check-circle show';
  check.innerHTML = checkSvg();
  container.appendChild(check);
}

function makeEditableDigits(container, length, onChange){
  container.innerHTML = '';
  const inputs = [];
  for(let i=0;i<length;i++){
    const inp = document.createElement('input');
    inp.className = 'digit-box';
    inp.setAttribute('inputmode','numeric');
    inp.setAttribute('maxlength','1');
    inp.setAttribute('autocomplete','off');
    inputs.push(inp);
    container.appendChild(inp);
    inp.addEventListener('input', ()=>{
      inp.value = inp.value.replace(/[^0-9]/g,'').slice(0,1);
      if(inp.value && i < length-1){ inputs[i+1].focus(); }
      onChange(inputs.map(x=>x.value).join(''));
    });
    inp.addEventListener('keydown', (e)=>{
      if(e.key === 'Backspace' && !inp.value && i>0){ inputs[i-1].focus(); }
    });
  }
  const check = document.createElement('div');
  check.className = 'check-circle';
  check.innerHTML = checkSvg();
  container.appendChild(check);

  return { inputs, check };
}

function checkSvg(){
  return '<svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}

/* =========================================================
   STATE
========================================================= */
const data = {
  federal:    { mode:'default', number:CONFIG.federal.number, name:CONFIG.federal.name },
  estadual:   { number:CONFIG.estadual.number, name:CONFIG.estadual.name },
  senador1:   { number:'' },
  senador2:   { number:'' },
  governador: { mode:'default', number:CONFIG.governador.number, name:CONFIG.governador.name, sub:CONFIG.governador.sub },
  presidente: { number:'' }
};

/* ---- Progress dots ---- */
for(let s=1;s<=6;s++){
  const wrap = document.getElementById('progress-'+s);
  for(let i=1;i<=6;i++){
    const dot = document.createElement('i');
    if(i < s) dot.className = 'done';
    else if(i === s) dot.className = 'current';
    wrap.appendChild(dot);
  }
}

/* ---- Step 1: Federal ---- */
makeFixedDigits(document.getElementById('federal-fixed'), CONFIG.federal.number);
const federalCustom = makeEditableDigits(document.getElementById('federal-custom'), 4, (val)=>{
  data.federal.number = val;
  toggleCheck(federalCustom.check, val.length===4);
  updateNextState(1);
});
setupChoice('federal', (value)=>{
  data.federal.mode = value;
  if(value === 'default'){
    data.federal.number = CONFIG.federal.number;
    data.federal.name = CONFIG.federal.name;
  } else {
    data.federal.name = null;
    data.federal.number = federalCustom.inputs.map(i=>i.value).join('');
  }
  document.getElementById('federal-fixed').style.display = value==='default' ? 'flex':'none';
  document.getElementById('federal-custom-wrap').classList.toggle('open', value==='custom');
  updateNextState(1);
});

/* ---- Step 2: Estadual (fixo) ---- */
makeFixedDigits(document.getElementById('estadual-fixed'), CONFIG.estadual.number);

/* ---- Step 3: Senador 1 ---- */
const s1 = makeEditableDigits(document.getElementById('senador1-input'), 3, (val)=>{
  data.senador1.number = val;
  toggleCheck(s1.check, val.length===3);
  updateNextState(3);
});

/* ---- Step 4: Senador 2 ---- */
const s2 = makeEditableDigits(document.getElementById('senador2-input'), 3, (val)=>{
  data.senador2.number = val;
  toggleCheck(s2.check, val.length===3);
  updateNextState(4);
});

/* ---- Step 5: Governador ---- */
makeFixedDigits(document.getElementById('governador-fixed'), CONFIG.governador.number);
const govCustom = makeEditableDigits(document.getElementById('governador-custom'), 2, (val)=>{
  data.governador.number = val;
  toggleCheck(govCustom.check, val.length===2);
  updateNextState(5);
});
setupChoice('governador', (value)=>{
  data.governador.mode = value;
  if(value === 'default'){
    data.governador.number = CONFIG.governador.number;
    data.governador.name = CONFIG.governador.name;
    data.governador.sub = CONFIG.governador.sub;
  } else {
    data.governador.name = null;
    data.governador.sub = null;
    data.governador.number = govCustom.inputs.map(i=>i.value).join('');
  }
  document.getElementById('governador-fixed').style.display = value==='default' ? 'flex':'none';
  document.getElementById('governador-custom-wrap').classList.toggle('open', value==='custom');
  updateNextState(5);
});

/* ---- Step 6: Presidente ---- */
const pres = makeEditableDigits(document.getElementById('presidente-input'), 2, (val)=>{
  data.presidente.number = val;
  toggleCheck(pres.check, val.length===2);
  updateGenerateState();
});

function toggleCheck(el, on){ el.classList.toggle('show', on); }

/* ---- Choice option click handling ---- */
function setupChoice(field, cb){
  const options = document.querySelectorAll(`.choice-option[data-choice="${field}"]`);
  options.forEach(opt=>{
    opt.addEventListener('click', ()=>{
      options.forEach(o=>o.classList.remove('selected'));
      opt.classList.add('selected');
      cb(opt.dataset.value);
    });
  });
}

/* ---- Next button enable/disable ---- */
function updateNextState(stepNum){
  const btn = document.querySelector(`[data-next="${stepNum}"]`);
  if(!btn) return;
  let ok = true;
  if(stepNum===1) ok = data.federal.mode==='default' || data.federal.number.length===4;
  if(stepNum===3) ok = data.senador1.number.length===3;
  if(stepNum===4) ok = data.senador2.number.length===3;
  if(stepNum===5) ok = data.governador.mode==='default' || data.governador.number.length===2;
  btn.disabled = !ok;
}
function updateGenerateState(){
  document.getElementById('generateBtn').disabled = data.presidente.number.length !== 2;
}
updateNextState(1);updateNextState(3);updateNextState(4);updateNextState(5);

document.querySelectorAll('[data-next]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const step = parseInt(btn.dataset.next,10);
    goTo(step + 1);
  });
});

/* =========================================================
   IMAGE GENERATION (Canvas)
========================================================= */
document.getElementById('generateBtn').addEventListener('click', async ()=>{
  await Promise.all([ensureFontsLoaded(), ensureBgImageLoaded()]);
  renderImage();
  goTo(7);
});
document.getElementById('restartBtn').addEventListener('click', ()=>{
  goTo(0);
});
document.getElementById('downloadBtn').addEventListener('click', ()=>{
  const canvas = document.getElementById('renderCanvas');
  const link = document.createElement('a');
  link.download = 'colinha-bruno-miranda.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

async function ensureFontsLoaded(){
  const specs = [
    `800 40px "${CONFIG.fontDisplay}"`,
    `700 42px "${CONFIG.fontDisplay}"`,
    `700 36px "${CONFIG.fontBody}"`,
    `700 46px "${CONFIG.fontBody}"`,
    `700 26px "${CONFIG.fontBody}"`
  ];
  try{
    await Promise.all(specs.map(s=>document.fonts.load(s)));
    await document.fonts.ready;
  }catch(e){ /* segue com a fonte de fallback caso algo falhe */ }
}

function renderImage(){
  const c = document.getElementById('renderCanvas');
  const ctx = c.getContext('2d');
  const W = c.width, H = c.height;
  const col = CONFIG.colors;

  // ---- background ----
  if(bgImageReady && bgImage.naturalWidth){
    // a imagem já vem no tamanho exato do story (1080x1920)
    ctx.drawImage(bgImage, 0, 0, W, H);
  } else {
    // fallback caso a imagem não carregue por algum motivo
    ctx.fillStyle = col.bg;
    ctx.fillRect(0,0,W,H);
  }

  // ---- card (calculado para ficar centralizado verticalmente) ----
  const cardX = 70, cardW = W - cardX*2;
  const innerPad = 64;
  const pillW = 780, pillH = 92;
  const topPad = 130;   // espaço entre o topo do card e a 1ª seção
  const bottomPad = 50; // espaço entre a última seção e o fim do card

  const sections = buildSections();
  const contentH = sections.reduce((sum, sec) => sum + sectionHeight(sec), 0);

  // altura total do bloco visível: metade da pílula (que fica pra fora do
  // card) + preenchimento do topo + conteúdo + preenchimento de baixo
  const blockH = (pillH/2) + topPad + contentH + bottomPad;
  const cardTop = ((H - blockH) / 2) + (pillH/2);

  let cursorY = cardTop + topPad;
  const sectionYs = [];
  sections.forEach(sec=>{
    sectionYs.push(cursorY);
    cursorY += sectionHeight(sec);
  });
  const cardBottom = cursorY + bottomPad;
  const cardH = cardBottom - cardTop;

  roundRect(ctx, cardX, cardTop, cardW, cardH, 44);
  ctx.fillStyle = col.white;
  ctx.shadowColor = 'rgba(11,37,71,0.18)';
  ctx.shadowBlur = 50;
  ctx.shadowOffsetY = 18;
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // ---- header pill ----
  const pillX = W/2 - pillW/2, pillY = cardTop - pillH/2;
  roundRect(ctx, pillX, pillY, pillW, pillH, pillH/2);
  ctx.fillStyle = col.navy;
  ctx.fill();
  ctx.fillStyle = col.white;
  ctx.font = `800 38px "${CONFIG.fontDisplay}", "${CONFIG.fontBody}", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('LEVE A COLINHA COM VOCÊ!', W/2, pillY + pillH/2 + 2);

  // ---- sections ----
  const leftX = cardX + innerPad;
  sections.forEach((sec, i)=>{
    drawSection(ctx, sec, leftX, sectionYs[i], col);
  });

  // ---- preview ----
  document.getElementById('previewImg').src = c.toDataURL('image/png');
}

function buildSections(){
  const list = [];
  list.push({
    title:'Deputado Federal',
    name: data.federal.name,
    sub: null,
    digits: data.federal.number
  });
  list.push({
    title:'Deputado Estadual',
    name: data.estadual.name,
    sub: null,
    digits: data.estadual.number
  });
  list.push({ title:'Senador 1', name:null, sub:null, digits:data.senador1.number });
  list.push({ title:'Senador 2', name:null, sub:null, digits:data.senador2.number });
  list.push({
    title:'Governador',
    name: data.governador.name,
    sub: data.governador.sub,
    digits: data.governador.number
  });
  list.push({ title:'Presidente', name:null, sub:null, digits:data.presidente.number });
  return list;
}

function sectionHeight(sec){
  let h = 56; // title
  if(sec.name) h += 46;
  if(sec.sub) h += 34;
  h += 14;
  h += 96;
  h += 58;
  return h;
}

function drawSection(ctx, sec, x, y, col){
  let cy = y;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  ctx.fillStyle = col.navy;
  ctx.font = `700 42px "${CONFIG.fontDisplay}", "${CONFIG.fontBody}", sans-serif`;
  ctx.fillText(sec.title, x, cy);
  cy += 6;

  if(sec.name){
    cy += 46;
    ctx.fillStyle = col.green;
    ctx.font = `700 36px "${CONFIG.fontBody}", sans-serif`;
    ctx.fillText(sec.name, x, cy);
  }
  if(sec.sub){
    cy += 34;
    ctx.fillStyle = col.navy;
    ctx.font = `700 26px "${CONFIG.fontBody}", sans-serif`;
    ctx.fillText(sec.sub, x, cy);
  }

  cy += 44;
  const boxSize = 90, gap = 16;
  let bx = x;
  const digits = (sec.digits || '').split('');
  digits.forEach(d=>{
    roundRect(ctx, bx, cy, boxSize, boxSize, 16);
    ctx.fillStyle = col.white;
    ctx.fill();
    ctx.lineWidth = 4.5;
    ctx.strokeStyle = col.navy;
    roundRect(ctx, bx, cy, boxSize, boxSize, 16);
    ctx.stroke();

    ctx.fillStyle = col.navy;
    ctx.font = `700 46px "${CONFIG.fontBody}", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(d, bx + boxSize/2, cy + boxSize/2 + 4);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    bx += boxSize + gap;
  });

  const checkD = 58;
  const checkX = bx + 10;
  const checkY = cy + boxSize/2 - checkD/2;
  ctx.beginPath();
  ctx.arc(checkX + checkD/2, checkY + checkD/2, checkD/2, 0, Math.PI*2);
  ctx.fillStyle = col.green;
  ctx.fill();
  ctx.strokeStyle = col.white;
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(checkX + checkD*0.28, checkY + checkD*0.53);
  ctx.lineTo(checkX + checkD*0.44, checkY + checkD*0.70);
  ctx.lineTo(checkX + checkD*0.74, checkY + checkD*0.32);
  ctx.stroke();
}

function roundRect(ctx, x, y, w, h, r){
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.arcTo(x+w, y,   x+w, y+h, r);
  ctx.arcTo(x+w, y+h, x,   y+h, r);
  ctx.arcTo(x,   y+h, x,   y,   r);
  ctx.arcTo(x,   y,   x+w, y,   r);
  ctx.closePath();
}
