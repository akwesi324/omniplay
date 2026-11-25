// Embedded 60 FPS HTML5 Canvas Virtual Engines for Newly Added Games

// 1. PAC-MAN (Authentic Coin-Op Arcade 1980)
export const HTML_PACMAN = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#000; overflow:hidden; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:monospace; }
  #hud { width:340px; display:flex; justify-content:space-between; color:#FFF; font-size:13px; font-weight:bold; padding:6px 0; }
  .p-score { color:#00F59B; }
  .p-lives { color:#FFCC00; }
  canvas { border:2px solid #0022FF; border-radius:8px; background:#000; max-width:100%; max-height:85vh; }
</style>
</head>
<body>
<div id="hud"><span>SCORE: <span id="score" class="p-score">0</span></span><span>LIVES: <span id="lives" class="p-lives">3</span></span><span>HIGH: 24800</span></div>
<canvas id="c" width="340" height="420"></canvas>
<script>
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
let score = 0, lives = 3, gameOver = false, won = false;

// 17 columns x 21 rows grid
const COLS = 17, ROWS = 21, CELL = 20;
// 1 = wall, 0 = dot, 2 = power pellet, 3 = empty
let map = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,0,0,0,0,0,0,1,0,0,0,0,0,0,2,1],
  [1,0,1,1,0,1,1,0,1,0,1,1,0,1,1,0,1],
  [1,0,1,1,0,1,1,0,1,0,1,1,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,0,1,1,1,0,1,0,1,1,0,1],
  [1,0,0,0,0,1,0,0,1,0,0,1,0,0,0,0,1],
  [1,1,1,1,0,1,1,3,1,3,1,1,0,1,1,1,1],
  [3,3,3,1,0,1,3,3,3,3,3,1,0,1,3,3,3],
  [1,1,1,1,0,1,3,1,1,1,3,1,0,1,1,1,1],
  [3,3,3,3,0,3,3,1,3,1,3,3,0,3,3,3,3],
  [1,1,1,1,0,1,3,1,1,1,3,1,0,1,1,1,1],
  [3,3,3,1,0,1,3,3,3,3,3,1,0,1,3,3,3],
  [1,1,1,1,0,1,3,1,1,1,3,1,0,1,1,1,1],
  [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,0,1,0,1,1,0,1,1,0,1],
  [1,2,0,1,0,0,0,0,3,0,0,0,0,1,0,2,1],
  [1,1,0,1,0,1,0,1,1,1,0,1,0,1,0,1,1],
  [1,0,0,0,0,1,0,0,1,0,0,1,0,0,0,0,1],
  [1,0,1,1,1,1,1,0,1,0,1,1,1,1,1,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

let pac = { x: 8, y: 16, px: 8*CELL+10, py: 16*CELL+10, dir: 'LEFT', nextDir: 'LEFT', angle: 0, mouth: 0.2, mouthSpeed: 0.04 };
let ghostTimer = 0;
let ghosts = [
  { x: 7, y: 9, px: 7*CELL+10, py: 9*CELL+10, color: '#FF0000', dir: 'UP', vulnerable: 0 },
  { x: 8, y: 9, px: 8*CELL+10, py: 9*CELL+10, color: '#FFB8FF', dir: 'UP', vulnerable: 0 },
  { x: 9, y: 9, px: 9*CELL+10, py: 9*CELL+10, color: '#00FFFF', dir: 'UP', vulnerable: 0 },
  { x: 8, y: 10, px: 8*CELL+10, py: 10*CELL+10, color: '#FFB852', dir: 'UP', vulnerable: 0 }
];

window.addEventListener('message', (e) => {
  try {
    const d = JSON.parse(e.data);
    if(d.type === 'BTN_DOWN') {
      if(d.btn === 'UP') pac.nextDir = 'UP';
      if(d.btn === 'DOWN') pac.nextDir = 'DOWN';
      if(d.btn === 'LEFT') pac.nextDir = 'LEFT';
      if(d.btn === 'RIGHT') pac.nextDir = 'RIGHT';
      if(d.btn === 'START' && (gameOver || won)) reset();
    }
  } catch(err){}
});

window.addEventListener('keydown', (e) => {
  if(e.key === 'ArrowUp') pac.nextDir = 'UP';
  if(e.key === 'ArrowDown') pac.nextDir = 'DOWN';
  if(e.key === 'ArrowLeft') pac.nextDir = 'LEFT';
  if(e.key === 'ArrowRight') pac.nextDir = 'RIGHT';
  if(e.key === 'Enter' && (gameOver || won)) reset();
});

canvas.addEventListener('touchstart', (e) => {
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const tx = touch.clientX - rect.left;
  const ty = touch.clientY - rect.top;
  const dx = tx - pac.px, dy = ty - pac.py;
  if(Math.abs(dx) > Math.abs(dy)) {
    pac.nextDir = dx > 0 ? 'RIGHT' : 'LEFT';
  } else {
    pac.nextDir = dy > 0 ? 'DOWN' : 'UP';
  }
});

function canMove(gx, gy) {
  if(gx < 0 || gx >= COLS || gy < 0 || gy >= ROWS) return true;
  return map[gy][gx] !== 1;
}

function reset() {
  score = 0; lives = 3; gameOver = false; won = false;
  document.getElementById('score').innerText = score;
  document.getElementById('lives').innerText = lives;
  pac.x = 8; pac.y = 16; pac.px = 8*CELL+10; pac.py = 16*CELL+10;
  pac.dir = 'LEFT'; pac.nextDir = 'LEFT';
}

function update() {
  if(gameOver || won) return;

  // Mouth animation
  pac.mouth += pac.mouthSpeed;
  if(pac.mouth > 0.4 || pac.mouth < 0.05) pac.mouthSpeed = -pac.mouthSpeed;

  // Move pacman
  const speed = 2;
  const targetX = pac.x * CELL + 10;
  const targetY = pac.y * CELL + 10;

  if(pac.px === targetX && pac.py === targetY) {
    // Check dot
    if(map[pac.y][pac.x] === 0) {
      map[pac.y][pac.x] = 3;
      score += 10;
      document.getElementById('score').innerText = score;
    } else if(map[pac.y][pac.x] === 2) {
      map[pac.y][pac.x] = 3;
      score += 50;
      ghosts.forEach(g => g.vulnerable = 300);
      document.getElementById('score').innerText = score;
    }

    // Try change direction
    let ndx = 0, ndy = 0;
    if(pac.nextDir === 'UP') ndy = -1;
    if(pac.nextDir === 'DOWN') ndy = 1;
    if(pac.nextDir === 'LEFT') ndx = -1;
    if(pac.nextDir === 'RIGHT') ndx = 1;
    if(canMove(pac.x + ndx, pac.y + ndy)) {
      pac.dir = pac.nextDir;
    }

    let dx = 0, dy = 0;
    if(pac.dir === 'UP') dy = -1;
    if(pac.dir === 'DOWN') dy = 1;
    if(pac.dir === 'LEFT') dx = -1;
    if(pac.dir === 'RIGHT') dx = 1;
    if(canMove(pac.x + dx, pac.y + dy)) {
      pac.x += dx;
      pac.y += dy;
      if(pac.x < 0) { pac.x = COLS - 1; pac.px = pac.x * CELL + 10; }
      if(pac.x >= COLS) { pac.x = 0; pac.px = 10; }
    }
  }

  const destX = pac.x * CELL + 10;
  const destY = pac.y * CELL + 10;
  if(pac.px < destX) pac.px = Math.min(destX, pac.px + speed);
  if(pac.px > destX) pac.px = Math.max(destX, pac.px - speed);
  if(pac.py < destY) pac.py = Math.min(destY, pac.py + speed);
  if(pac.py > destY) pac.py = Math.max(destY, pac.py - speed);

  // Ghost AI
  ghostTimer++;
  ghosts.forEach(g => {
    if(g.vulnerable > 0) g.vulnerable--;
    const gDestX = g.x * CELL + 10;
    const gDestY = g.y * CELL + 10;
    if(g.px === gDestX && g.py === gDestY) {
      const dirs = ['UP','DOWN','LEFT','RIGHT'];
      const valid = dirs.filter(d => {
        let gx = g.x, gy = g.y;
        if(d==='UP') gy--; if(d==='DOWN') gy++;
        if(d==='LEFT') gx--; if(d==='RIGHT') gx++;
        return canMove(gx, gy);
      });
      if(valid.length > 0) {
        g.dir = valid[Math.floor(Math.random() * valid.length)];
        let gx = g.x, gy = g.y;
        if(g.dir==='UP') gy--; if(g.dir==='DOWN') gy++;
        if(g.dir==='LEFT') gx--; if(g.dir==='RIGHT') gx++;
        g.x = gx; g.y = gy;
      }
    }
    const gSpeed = g.vulnerable > 0 ? 1 : 1.6;
    if(g.px < gDestX) g.px = Math.min(gDestX, g.px + gSpeed);
    if(g.px > gDestX) g.px = Math.max(gDestX, g.px - gSpeed);
    if(g.py < gDestY) g.py = Math.min(gDestY, g.py + gSpeed);
    if(g.py > gDestY) g.py = Math.max(gDestY, g.py - gSpeed);

    // Collision check
    const dist = Math.hypot(pac.px - g.px, pac.py - g.py);
    if(dist < 14) {
      if(g.vulnerable > 0) {
        score += 200;
        document.getElementById('score').innerText = score;
        g.x = 8; g.y = 9; g.px = 8*CELL+10; g.py = 9*CELL+10;
        g.vulnerable = 0;
      } else {
        lives--;
        document.getElementById('lives').innerText = lives;
        if(lives <= 0) {
          gameOver = true;
        } else {
          pac.x = 8; pac.y = 16; pac.px = 8*CELL+10; pac.py = 16*CELL+10;
        }
      }
    }
  });
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw maze
  for(let r=0; r<ROWS; r++) {
    for(let c=0; c<COLS; c++) {
      const v = map[r][c];
      const cx = c*CELL, cy = r*CELL;
      if(v === 1) {
        ctx.strokeStyle = '#0033FF';
        ctx.lineWidth = 3;
        ctx.strokeRect(cx+2, cy+2, CELL-4, CELL-4);
      } else if(v === 0) {
        ctx.fillStyle = '#FFB8AE';
        ctx.beginPath();
        ctx.arc(cx+CELL/2, cy+CELL/2, 2.5, 0, Math.PI*2);
        ctx.fill();
      } else if(v === 2) {
        ctx.fillStyle = Math.floor(Date.now()/200)%2===0 ? '#FFF' : '#FFB8AE';
        ctx.beginPath();
        ctx.arc(cx+CELL/2, cy+CELL/2, 5, 0, Math.PI*2);
        ctx.fill();
      }
    }
  }

  // Draw Pacman
  ctx.fillStyle = '#FFEE00';
  ctx.beginPath();
  let baseAngle = 0;
  if(pac.dir === 'UP') baseAngle = -Math.PI/2;
  if(pac.dir === 'DOWN') baseAngle = Math.PI/2;
  if(pac.dir === 'LEFT') baseAngle = Math.PI;
  if(pac.dir === 'RIGHT') baseAngle = 0;
  ctx.arc(pac.px, pac.py, 8, baseAngle + pac.mouth * Math.PI, baseAngle + (2 - pac.mouth) * Math.PI);
  ctx.lineTo(pac.px, pac.py);
  ctx.fill();

  // Draw Ghosts
  ghosts.forEach(g => {
    ctx.fillStyle = g.vulnerable > 0 ? (g.vulnerable < 60 && Math.floor(g.vulnerable/10)%2===0 ? '#FFF' : '#2121DE') : g.color;
    ctx.beginPath();
    ctx.arc(g.px, g.py - 2, 7, Math.PI, 0, false);
    ctx.lineTo(g.px + 7, g.py + 7);
    ctx.lineTo(g.px - 7, g.py + 7);
    ctx.fill();
    // Eyes
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(g.px - 2.5, g.py - 2, 2.2, 0, Math.PI*2);
    ctx.arc(g.px + 2.5, g.py - 2, 2.2, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(g.px - 2.5, g.py - 2, 1, 0, Math.PI*2);
    ctx.arc(g.px + 2.5, g.py - 2, 1, 0, Math.PI*2);
    ctx.fill();
  });

  if(gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#FF3366';
    ctx.font = '24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', 170, 200);
    ctx.fillStyle = '#FFF';
    ctx.font = '13px monospace';
    ctx.fillText('PRESS START TO RETRY', 170, 240);
    ctx.textAlign = 'left';
  }

  update();
  requestAnimationFrame(draw);
}
draw();
</script>
</body>
</html>
`;

// 2. HANGAROO (Classic Preserved Word Guessing)
export const HTML_HANGAROO = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#0A1208; color:#FFF; font-family:sans-serif; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; overflow:hidden; }
  #hud { width:350px; display:flex; justify-content:space-between; font-weight:bold; font-size:13px; color:#00F59B; margin-bottom:8px; }
  canvas { border:2px solid #285A18; border-radius:10px; background:#12240E; max-width:100%; max-height:85vh; }
</style>
</head>
<body>
<div id="hud"><span>CATEGORY: <span id="cat" style="color:#FFCC00;">MOVIES</span></span><span>STRIKES: <span id="strikes" style="color:#FF3366;">0 / 4</span></span></div>
<canvas id="c" width="350" height="420"></canvas>
<script>
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

const PUZZLES = [
  { phrase: "THE MATRIX", cat: "CYBER MOVIES" },
  { phrase: "SUPER MARIO", cat: "VIDEO GAMES" },
  { phrase: "PAC MAN ARCADE", cat: "RETRO GAMING" },
  { phrase: "TERMINATOR", cat: "ACTION CINEMA" },
  { phrase: "CYBERPUNK", cat: "GENRES" },
  { phrase: "AVENGERS ASSEMBLE", cat: "COMICS" }
];

let puzzleIdx = 0;
let current = PUZZLES[puzzleIdx];
let guessed = new Set();
let strikes = 0;
let gameOver = false, won = false;
let speechText = "Don't let me down, mate!";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
let cursor = 0;

window.addEventListener('message', (e) => {
  try {
    const d = JSON.parse(e.data);
    if(d.type === 'BTN_DOWN') {
      if(d.btn === 'LEFT') cursor = (cursor - 1 + ALPHABET.length) % ALPHABET.length;
      if(d.btn === 'RIGHT') cursor = (cursor + 1) % ALPHABET.length;
      if(d.btn === 'UP') cursor = (cursor - 9 + ALPHABET.length) % ALPHABET.length;
      if(d.btn === 'DOWN') cursor = (cursor + 9) % ALPHABET.length;
      if(d.btn === 'A' || d.btn === 'X') makeGuess(ALPHABET[cursor]);
      if(d.btn === 'START' && (gameOver || won)) nextPuzzle();
    }
  } catch(err){}
});

window.addEventListener('keydown', (e) => {
  const k = e.key.toUpperCase();
  if(ALPHABET.includes(k)) makeGuess(k);
  if(e.key === 'Enter' && (gameOver || won)) nextPuzzle();
});

canvas.addEventListener('click', (e) => {
  if(gameOver || won) { nextPuzzle(); return; }
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (canvas.width / rect.width);
  const y = (e.clientY - rect.top) * (canvas.height / rect.height);
  
  // Keyboard area
  if(y > 270) {
    const col = Math.floor((x - 10) / 36);
    const row = Math.floor((y - 275) / 45);
    const idx = row * 9 + col;
    if(idx >= 0 && idx < ALPHABET.length) {
      cursor = idx;
      makeGuess(ALPHABET[idx]);
    }
  }
});

function makeGuess(letter) {
  if(guessed.has(letter) || gameOver || won) return;
  guessed.add(letter);

  if(current.phrase.includes(letter)) {
    speechText = "Good on ya, mate!";
    // Check win
    const allGuessed = current.phrase.split('').every(ch => ch === ' ' || guessed.has(ch));
    if(allGuessed) {
      won = true;
      speechText = "YOU SAVED ME, LEGEND!";
    }
  } else {
    strikes++;
    document.getElementById('strikes').innerText = strikes + " / 4";
    const comments = ["Ouch! Wrong one!", "Fair dinkum, try again!", "I'm sweating over here!", "Gallows are creaking!"];
    speechText = comments[strikes-1] || "Curtains for me!";
    if(strikes >= 4) {
      gameOver = true;
      speechText = "CRIPES! TELL MUM I LOVE HER!";
    }
  }
}

function nextPuzzle() {
  puzzleIdx = (puzzleIdx + 1) % PUZZLES.length;
  current = PUZZLES[puzzleIdx];
  guessed.clear();
  strikes = 0;
  gameOver = false; won = false;
  speechText = "Ready for another round, cobber?";
  document.getElementById('cat').innerText = current.cat;
  document.getElementById('strikes').innerText = "0 / 4";
}

function draw() {
  ctx.fillStyle = '#10210C';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw Gallows & Kangaroo Platform
  ctx.strokeStyle = '#5B3916';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(30, 200); ctx.lineTo(120, 200); // base
  ctx.moveTo(70, 200); ctx.lineTo(70, 40); // pole
  ctx.lineTo(160, 40); // beam
  ctx.lineTo(160, 65); // rope
  ctx.stroke();

  // Draw Kangaroo (Roo)
  const rooY = gameOver ? 110 : 80;
  ctx.fillStyle = '#C87820'; // fur
  // Body
  ctx.beginPath();
  ctx.ellipse(160, rooY + 45, 18, 25, 0, 0, Math.PI*2);
  ctx.fill();
  // Head
  ctx.beginPath();
  ctx.arc(160, rooY + 15, 15, 0, Math.PI*2);
  ctx.fill();
  // Ears
  ctx.beginPath();
  ctx.ellipse(152, rooY - 2, 4, 10, -0.2, 0, Math.PI*2);
  ctx.ellipse(168, rooY - 2, 4, 10, 0.2, 0, Math.PI*2);
  ctx.fill();
  // Eyes & Nose
  ctx.fillStyle = '#000';
  ctx.beginPath();
  if(!gameOver) {
    ctx.arc(155, rooY + 12, 2.5, 0, Math.PI*2);
    ctx.arc(165, rooY + 12, 2.5, 0, Math.PI*2);
  } else {
    // X eyes
    ctx.fillText('x', 152, rooY + 15);
    ctx.fillText('x', 164, rooY + 15);
  }
  ctx.arc(160, rooY + 18, 3, 0, Math.PI*2);
  ctx.fill();

  // Speech Bubble
  ctx.fillStyle = '#FFF';
  ctx.fillRect(195, 30, 140, 44);
  ctx.fillStyle = '#000';
  ctx.font = '10px monospace';
  ctx.fillText(speechText.slice(0, 20), 200, 48);
  ctx.fillText(speechText.slice(20, 42), 200, 62);

  // Phrase Blanks
  ctx.fillStyle = '#00F59B';
  ctx.font = 'bold 18px monospace';
  ctx.textAlign = 'center';
  let display = current.phrase.split('').map(ch => ch === ' ' ? '  ' : (guessed.has(ch) ? ch + ' ' : '_ ')).join('');
  ctx.fillText(display, 175, 230);
  ctx.textAlign = 'left';

  // On-screen Alphabet Keypad
  ctx.font = '12px monospace';
  ALPHABET.forEach((letter, i) => {
    const col = i % 9;
    const row = Math.floor(i / 9);
    const kx = 16 + col * 36;
    const ky = 275 + row * 45;

    const isGuessed = guessed.has(letter);
    const isSelected = cursor === i;

    ctx.fillStyle = isSelected ? '#00D2FF' : (isGuessed ? '#1E3618' : '#2A5222');
    ctx.fillRect(kx, ky, 30, 36);

    ctx.fillStyle = isGuessed ? '#5A7553' : (isSelected ? '#0A1208' : '#FFF');
    ctx.font = 'bold 14px monospace';
    ctx.fillText(letter, kx + 10, ky + 23);
  });

  if(gameOver || won) {
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = won ? '#00F59B' : '#FF3366';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(won ? 'YOU WON!' : 'GAME OVER', 175, 180);
    ctx.fillStyle = '#FFF';
    ctx.font = '13px monospace';
    ctx.fillText('Phrase: ' + current.phrase, 175, 215);
    ctx.fillText('PRESS START TO CONTINUE', 175, 250);
    ctx.textAlign = 'left';
  }

  requestAnimationFrame(draw);
}
draw();
</script>
</body>
</html>
`;

// 3. DREAM LEAGUE SOCCER 2026 (Full Pitch Action)
export const HTML_DLS_2026 = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#0D2E14; overflow:hidden; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:sans-serif; }
  #scoreboard { width:350px; background:#111; color:#FFF; display:flex; justify-content:space-between; padding:8px 12px; font-weight:bold; font-size:13px; border-radius:6px 6px 0 0; }
  canvas { border:2px solid #1E5C2A; background:#1B7A33; border-radius:0 0 6px 6px; max-width:100%; max-height:85vh; }
</style>
</head>
<body>
<div id="scoreboard"><span>OMNI FC <span id="s1" style="color:#00D2FF;">0</span> - <span id="s2" style="color:#FF3366;">0</span> RIVAL UTD</span><span style="color:#FFCC00;">⏱ <span id="clock">12'</span></span></div>
<canvas id="c" width="350" height="420"></canvas>
<script>
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
let s1 = 0, s2 = 0, minutes = 12;

let ball = { x: 175, y: 210, vx: 0, vy: 0 };
let player = { x: 175, y: 260, speed: 4, team: 'omni' };
let teammates = [
  { x: 90, y: 240 }, { x: 260, y: 240 }, { x: 175, y: 340 }
];
let rivals = [
  { x: 130, y: 150 }, { x: 220, y: 150 }, { x: 175, y: 70 }
];
let goalie = { x: 175, y: 25, vx: 1.5 };
let celebration = 0;

window.addEventListener('message', (e) => {
  try {
    const d = JSON.parse(e.data);
    if(d.type === 'BTN_DOWN') {
      if(d.btn === 'UP') player.y = Math.max(30, player.y - 12);
      if(d.btn === 'DOWN') player.y = Math.min(390, player.y + 12);
      if(d.btn === 'LEFT') player.x = Math.max(20, player.x - 12);
      if(d.btn === 'RIGHT') player.x = Math.min(330, player.x + 12);
      if(d.btn === 'A') shoot(); // Shoot power
      if(d.btn === 'B') pass(); // Pass
      if(d.btn === 'X') sprint();
    }
  } catch(err){}
});

window.addEventListener('keydown', (e) => {
  if(e.key==='ArrowUp') player.y = Math.max(30, player.y - 10);
  if(e.key==='ArrowDown') player.y = Math.min(390, player.y + 10);
  if(e.key==='ArrowLeft') player.x = Math.max(20, player.x - 10);
  if(e.key==='ArrowRight') player.x = Math.min(330, player.x + 10);
  if(e.key===' ' || e.key==='z') shoot();
  if(e.key==='x') pass();
});

canvas.addEventListener('touchstart', (e) => {
  const t = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const tx = (t.clientX - rect.left) * (canvas.width / rect.width);
  const ty = (t.clientY - rect.top) * (canvas.height / rect.height);
  if(ty < 150) shoot();
  else {
    player.x = tx; player.y = ty;
  }
});

function shoot() {
  const dist = Math.hypot(ball.x - player.x, ball.y - player.y);
  if(dist < 28) {
    const angle = Math.atan2(25 - ball.y, 175 - ball.x);
    ball.vx = Math.cos(angle) * 11;
    ball.vy = Math.sin(angle) * 11;
  }
}

function pass() {
  const nearest = teammates[0];
  const angle = Math.atan2(nearest.y - ball.y, nearest.x - ball.x);
  ball.vx = Math.cos(angle) * 8;
  ball.vy = Math.sin(angle) * 8;
}

function sprint() {
  player.speed = 7;
  setTimeout(() => player.speed = 4, 1500);
}

function update() {
  // Ball friction
  ball.x += ball.vx; ball.y += ball.vy;
  ball.vx *= 0.94; ball.vy *= 0.94;

  // Dribble
  const pDist = Math.hypot(ball.x - player.x, ball.y - player.y);
  if(pDist < 16) {
    ball.x = player.x + (ball.vx * 0.5);
    ball.y = player.y - 12;
  }

  // Goalie AI
  goalie.x += goalie.vx;
  if(goalie.x > 215 || goalie.x < 135) goalie.vx = -goalie.vx;

  // Goal check (top net: x 120-230, y < 20)
  if(ball.y < 25 && ball.x > 125 && ball.x < 225) {
    s1++;
    document.getElementById('s1').innerText = s1;
    celebration = 100;
    ball.x = 175; ball.y = 210; ball.vx = 0; ball.vy = 0;
    player.x = 175; player.y = 260;
  }

  // Clock
  if(Math.random() < 0.02 && minutes < 90) {
    minutes++;
    document.getElementById('clock').innerText = minutes + "'";
  }

  if(celebration > 0) celebration--;
}

function draw() {
  ctx.fillStyle = '#1D7A34';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Pitch Grass Stripes
  ctx.fillStyle = '#228B3B';
  for(let i=0; i<canvas.height; i+=40) {
    if((i/40)%2===0) ctx.fillRect(0, i, canvas.width, 40);
  }

  // Pitch lines
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 2;
  ctx.strokeRect(15, 15, 320, 390);
  // Halfway
  ctx.beginPath();
  ctx.moveTo(15, 210); ctx.lineTo(335, 210);
  ctx.arc(175, 210, 38, 0, Math.PI*2);
  // Penalty boxes
  ctx.strokeRect(100, 15, 150, 60);
  ctx.strokeRect(100, 345, 150, 60);
  // Goal nets
  ctx.fillStyle = '#EEE';
  ctx.fillRect(130, 5, 90, 10);
  ctx.stroke();

  // Rivals (Red)
  ctx.fillStyle = '#FF3366';
  rivals.forEach(r => {
    ctx.beginPath();
    ctx.arc(r.x, r.y, 8, 0, Math.PI*2);
    ctx.fill();
  });

  // Goalie (Yellow)
  ctx.fillStyle = '#FFCC00';
  ctx.beginPath();
  ctx.arc(goalie.x, goalie.y, 9, 0, Math.PI*2);
  ctx.fill();

  // Teammates (Blue)
  ctx.fillStyle = '#0077FF';
  teammates.forEach(tm => {
    ctx.beginPath();
    ctx.arc(tm.x, tm.y, 8, 0, Math.PI*2);
    ctx.fill();
  });

  // Active Player (Cyan + Halo)
  ctx.strokeStyle = '#00F59B';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(player.x, player.y, 13, 0, Math.PI*2);
  ctx.stroke();

  ctx.fillStyle = '#00D2FF';
  ctx.beginPath();
  ctx.arc(player.x, player.y, 8, 0, Math.PI*2);
  ctx.fill();

  // Ball
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, 5, 0, Math.PI*2);
  ctx.fill();

  if(celebration > 0) {
    ctx.fillStyle = '#00F59B';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GOOOAL!!', 175, 190);
    ctx.font = '14px sans-serif';
    ctx.fillText('OMNI FC STRIKES!', 175, 220);
    ctx.textAlign = 'left';
  }

  update();
  requestAnimationFrame(draw);
}
draw();
</script>
</body>
</html>
`;

// 4. WWE IMMORTALS (Delisted Superhero Brawler)
export const HTML_WWE_IMMORTALS = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#08070F; overflow:hidden; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:sans-serif; }
  #hud { width:350px; display:flex; justify-content:space-between; padding:6px; color:#FFF; font-weight:bold; font-size:12px; }
  .bar-bg { width:140px; height:12px; background:#222; border:1px solid #444; border-radius:3px; overflow:hidden; }
  .p1-bar { height:100%; width:100%; background:linear-gradient(90deg, #00F59B, #00D2FF); transition:width 0.1s; }
  .p2-bar { height:100%; width:100%; background:linear-gradient(90deg, #FF3366, #FF9900); transition:width 0.1s; }
  canvas { border:2px solid #5A189A; border-radius:8px; background:#120E24; max-width:100%; max-height:85vh; }
</style>
</head>
<body>
<div id="hud">
  <div><span>THE ROCK (IMMORTAL)</span><div class="bar-bg"><div id="hp1" class="p1-bar"></div></div></div>
  <div><span style="color:#FF3366;">TRIPLE H (KING)</span><div class="bar-bg"><div id="hp2" class="p2-bar"></div></div></div>
</div>
<canvas id="c" width="350" height="420"></canvas>
<script>
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

let hp1 = 100, hp2 = 100;
let adrenaline = 0;
let p1 = { x: 70, y: 280, state: 'idle', frame: 0 };
let p2 = { x: 230, y: 280, state: 'idle', frame: 0 };
let fxList = [];
let combo = 0, comboTimer = 0;
let winner = null;

window.addEventListener('message', (e) => {
  try {
    const d = JSON.parse(e.data);
    if(d.type === 'BTN_DOWN') {
      if(d.btn === 'X') lightAttack();
      if(d.btn === 'Y') heavyAttack();
      if(d.btn === 'A') signatureMove();
      if(d.btn === 'B') block();
      if(d.btn === 'LEFT') p1.x = Math.max(30, p1.x - 15);
      if(d.btn === 'RIGHT') p1.x = Math.min(p2.x - 40, p1.x + 15);
      if(d.btn === 'START' && winner) resetMatch();
    }
  } catch(err){}
});

window.addEventListener('keydown', (e) => {
  if(e.key === 'z') lightAttack();
  if(e.key === 'x') heavyAttack();
  if(e.key === 'c' || e.key === ' ') signatureMove();
  if(e.key === 'ArrowLeft') p1.x = Math.max(30, p1.x - 15);
  if(e.key === 'ArrowRight') p1.x = Math.min(p2.x - 40, p1.x + 15);
  if(e.key === 'Enter' && winner) resetMatch();
});

canvas.addEventListener('click', (e) => {
  if(winner) { resetMatch(); return; }
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (canvas.width / rect.width);
  if(x > 250) signatureMove();
  else if(x > 150) heavyAttack();
  else lightAttack();
});

function lightAttack() {
  if(winner) return;
  p1.state = 'punch';
  adrenaline = Math.min(100, adrenaline + 12);
  if(Math.abs(p1.x - p2.x) < 70) {
    hp2 = Math.max(0, hp2 - 8);
    combo++; comboTimer = 60;
    spawnFx(p2.x, p2.y, '#00D2FF', 'PUNCH!');
    checkWin();
  }
  setTimeout(() => p1.state = 'idle', 200);
}

function heavyAttack() {
  if(winner) return;
  p1.state = 'smash';
  adrenaline = Math.min(100, adrenaline + 20);
  if(Math.abs(p1.x - p2.x) < 80) {
    hp2 = Math.max(0, hp2 - 16);
    combo++; comboTimer = 60;
    spawnFx(p2.x, p2.y, '#FFCC00', 'THUNDER SLAM!');
    checkWin();
  }
  setTimeout(() => p1.state = 'idle', 300);
}

function signatureMove() {
  if(winner || adrenaline < 60) return;
  adrenaline -= 60;
  p1.state = 'special';
  hp2 = Math.max(0, hp2 - 32);
  combo += 3; comboTimer = 80;
  spawnFx(p2.x, p2.y - 20, '#00F59B', "PEOPLE'S ELBOW!");
  checkWin();
  setTimeout(() => p1.state = 'idle', 500);
}

function block() {
  p1.state = 'block';
  setTimeout(() => p1.state = 'idle', 300);
}

function checkWin() {
  document.getElementById('hp2').style.width = hp2 + '%';
  if(hp2 <= 0) winner = 'THE ROCK';
}

function resetMatch() {
  hp1 = 100; hp2 = 100; adrenaline = 0; winner = null; combo = 0;
  document.getElementById('hp1').style.width = '100%';
  document.getElementById('hp2').style.width = '100%';
}

function spawnFx(x, y, color, text) {
  fxList.push({ x, y, color, text, life: 30 });
}

function update() {
  // Opponent AI
  if(!winner && Math.random() < 0.03) {
    if(p1.state !== 'block') {
      hp1 = Math.max(0, hp1 - 7);
      document.getElementById('hp1').style.width = hp1 + '%';
      spawnFx(p1.x, p1.y, '#FF3366', 'SLEDGEHAMMER!');
      if(hp1 <= 0) winner = 'TRIPLE H';
    }
  }

  if(comboTimer > 0) comboTimer--;
  else combo = 0;

  fxList.forEach((fx, i) => {
    fx.y -= 1;
    fx.life--;
    if(fx.life <= 0) fxList.splice(i, 1);
  });
}

function draw() {
  ctx.fillStyle = '#0F0B1E';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Mystic Arena Ring
  ctx.strokeStyle = '#7928CA';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(20, 340); ctx.lineTo(330, 340);
  ctx.moveTo(20, 310); ctx.lineTo(330, 310);
  ctx.stroke();

  // P1 (The Rock - Glowing Bronze & Gold Golem)
  ctx.fillStyle = '#FFB800';
  ctx.beginPath();
  ctx.arc(p1.x + 20, p1.y - 20, 16, 0, Math.PI*2); // head
  ctx.fill();
  ctx.fillStyle = '#D97706';
  ctx.fillRect(p1.x, p1.y, 40, 60); // torso
  if(p1.state === 'punch' || p1.state === 'special') {
    ctx.fillStyle = '#00F59B';
    ctx.fillRect(p1.x + 35, p1.y + 10, 35, 14); // electric punch
  }

  // P2 (Triple H - Mystic Dark King)
  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.arc(p2.x + 20, p2.y - 20, 16, 0, Math.PI*2);
  ctx.fill();
  ctx.fillStyle = '#7F1D1D';
  ctx.fillRect(p2.x, p2.y, 40, 60);

  // Adrenaline Gauge
  ctx.fillStyle = '#222';
  ctx.fillRect(20, 385, 310, 14);
  ctx.fillStyle = adrenaline >= 60 ? '#00F59B' : '#7928CA';
  ctx.fillRect(20, 385, (adrenaline / 100) * 310, 14);
  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 9px monospace';
  ctx.fillText(adrenaline >= 60 ? 'SIGNATURE MOVE READY (PRESS A)' : 'ADRENALINE GAUGE', 25, 396);

  // FX Texts
  fxList.forEach(fx => {
    ctx.fillStyle = fx.color;
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(fx.text, fx.x - 20, fx.y);
  });

  if(combo > 1) {
    ctx.fillStyle = '#FFCC00';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(combo + ' HITS COMBO!', 120, 130);
  }

  if(winner) {
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = winner === 'THE ROCK' ? '#00F59B' : '#FF3366';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(winner + ' WINS!', 175, 190);
    ctx.fillStyle = '#FFF';
    ctx.font = '14px sans-serif';
    ctx.fillText('PRESS START TO PLAY AGAIN', 175, 230);
    ctx.textAlign = 'left';
  }

  update();
  requestAnimationFrame(draw);
}
draw();
</script>
</body>
</html>
`;

// 5. INJUSTICE: GODS AMONG US (Injustice 1)
export const HTML_INJUSTICE_1 = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#0A0C14; overflow:hidden; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:sans-serif; }
  #hud { width:350px; display:flex; justify-content:space-between; padding:6px; color:#FFF; font-weight:bold; font-size:12px; }
  .hp-bg { width:140px; height:12px; background:#222; border:1px solid #444; border-radius:3px; overflow:hidden; }
  .hp-fill { height:100%; width:100%; background:#00D2FF; }
  canvas { border:2px solid #1E293B; border-radius:8px; background:#0F172A; max-width:100%; max-height:85vh; }
</style>
</head>
<body>
<div id="hud">
  <div><span>BATMAN</span><div class="hp-bg"><div id="hp1" class="hp-fill"></div></div></div>
  <div><span style="color:#EF4444;">SUPERMAN</span><div class="hp-bg"><div id="hp2" class="hp-fill" style="background:#EF4444;"></div></div></div>
</div>
<canvas id="c" width="350" height="420"></canvas>
<script>
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
let hp1 = 100, hp2 = 100, meter = 0, winner = null;
let p1 = { x: 70, y: 280, state: 'idle' };
let p2 = { x: 230, y: 280, state: 'idle' };
let batarangs = [];
let comboCount = 0;

window.addEventListener('message', (e) => {
  try {
    const d = JSON.parse(e.data);
    if(d.type === 'BTN_DOWN') {
      if(d.btn === 'X') punch();
      if(d.btn === 'Y') throwBatarang();
      if(d.btn === 'A') superMove();
      if(d.btn === 'LEFT') p1.x = Math.max(30, p1.x - 15);
      if(d.btn === 'RIGHT') p1.x = Math.min(p2.x - 35, p1.x + 15);
      if(d.btn === 'START' && winner) reset();
    }
  } catch(err){}
});

window.addEventListener('keydown', (e) => {
  if(e.key === 'z') punch();
  if(e.key === 'x') throwBatarang();
  if(e.key === 'c' || e.key === ' ') superMove();
  if(e.key === 'ArrowLeft') p1.x = Math.max(30, p1.x - 15);
  if(e.key === 'ArrowRight') p1.x = Math.min(p2.x - 35, p1.x + 15);
  if(e.key === 'Enter' && winner) reset();
});

function punch() {
  if(winner) return;
  p1.state = 'punch';
  meter = Math.min(100, meter + 15);
  if(Math.abs(p1.x - p2.x) < 70) {
    hp2 = Math.max(0, hp2 - 9);
    comboCount++;
    document.getElementById('hp2').style.width = hp2 + '%';
    if(hp2 <= 0) winner = 'BATMAN';
  }
  setTimeout(() => p1.state = 'idle', 200);
}

function throwBatarang() {
  if(winner) return;
  batarangs.push({ x: p1.x + 30, y: p1.y + 15, vx: 8 });
  meter = Math.min(100, meter + 10);
}

function superMove() {
  if(winner || meter < 80) return;
  meter = 0;
  hp2 = Math.max(0, hp2 - 35);
  document.getElementById('hp2').style.width = hp2 + '%';
  if(hp2 <= 0) winner = 'BATMAN';
}

function reset() {
  hp1 = 100; hp2 = 100; meter = 0; winner = null; comboCount = 0;
  document.getElementById('hp1').style.width = '100%';
  document.getElementById('hp2').style.width = '100%';
}

function update() {
  // Batarangs
  batarangs.forEach((b, i) => {
    b.x += b.vx;
    if(Math.abs(b.x - p2.x) < 20) {
      hp2 = Math.max(0, hp2 - 12);
      document.getElementById('hp2').style.width = hp2 + '%';
      batarangs.splice(i, 1);
      if(hp2 <= 0) winner = 'BATMAN';
    }
    if(b.x > 350) batarangs.splice(i, 1);
  });

  // Superman AI
  if(!winner && Math.random() < 0.025) {
    hp1 = Math.max(0, hp1 - 8);
    document.getElementById('hp1').style.width = hp1 + '%';
    if(hp1 <= 0) winner = 'SUPERMAN';
  }
}

function draw() {
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Gotham skyline backdrop
  ctx.fillStyle = '#090D1A';
  ctx.fillRect(20, 100, 60, 240);
  ctx.fillRect(90, 80, 50, 260);
  ctx.fillRect(160, 120, 70, 220);
  ctx.fillRect(240, 70, 80, 270);

  // Ground line
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(0, 340, canvas.width, 80);

  // Batman (P1)
  ctx.fillStyle = '#1E222D';
  ctx.fillRect(p1.x, p1.y, 35, 60);
  ctx.fillStyle = '#64748B';
  ctx.beginPath();
  ctx.arc(p1.x + 17, p1.y - 12, 12, 0, Math.PI*2);
  ctx.fill();

  // Superman (P2)
  ctx.fillStyle = '#1D4ED8';
  ctx.fillRect(p2.x, p2.y, 35, 60);
  ctx.fillStyle = '#DC2626';
  ctx.fillRect(p2.x + 30, p2.y, 10, 50); // Cape
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.arc(p2.x + 17, p2.y - 12, 12, 0, Math.PI*2);
  ctx.fill();

  // Batarangs
  ctx.fillStyle = '#00D2FF';
  batarangs.forEach(b => {
    ctx.fillRect(b.x, b.y, 14, 5);
  });

  // Super Meter
  ctx.fillStyle = '#222';
  ctx.fillRect(20, 390, 310, 12);
  ctx.fillStyle = meter >= 80 ? '#00F59B' : '#00D2FF';
  ctx.fillRect(20, 390, (meter / 100) * 310, 12);

  if(winner) {
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = winner === 'BATMAN' ? '#00D2FF' : '#EF4444';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(winner + ' WINS!', 175, 190);
    ctx.fillStyle = '#FFF';
    ctx.font = '13px sans-serif';
    ctx.fillText('PRESS START TO PLAY AGAIN', 175, 230);
    ctx.textAlign = 'left';
  }

  update();
  requestAnimationFrame(draw);
}
draw();
</script>
</body>
</html>
`;

// 6. INJUSTICE 2 (Multiverse Gear Clash)
export const HTML_INJUSTICE_2 = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#030712; overflow:hidden; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:sans-serif; }
  #hud { width:350px; display:flex; justify-content:space-between; padding:6px; color:#FFF; font-weight:bold; font-size:12px; }
  .hp-bg { width:140px; height:12px; background:#111; border:1px solid #374151; border-radius:3px; overflow:hidden; }
  .hp-fill { height:100%; width:100%; background:linear-gradient(90deg, #EAB308, #EF4444); }
  canvas { border:2px solid #1F2937; border-radius:8px; background:#111827; max-width:100%; max-height:85vh; }
</style>
</head>
<body>
<div id="hud">
  <div><span>FLASH (SPEEDFORCE)</span><div class="hp-bg"><div id="hp1" class="hp-fill"></div></div></div>
  <div><span style="color:#A855F7;">BRAINIAC (CYBER)</span><div class="hp-bg"><div id="hp2" class="hp-fill" style="background:#A855F7;"></div></div></div>
</div>
<canvas id="c" width="350" height="420"></canvas>
<script>
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
let hp1 = 100, hp2 = 100, speedGauge = 0, winner = null;
let p1 = { x: 70, y: 280, blur: 0 };
let p2 = { x: 230, y: 280 };

window.addEventListener('message', (e) => {
  try {
    const d = JSON.parse(e.data);
    if(d.type === 'BTN_DOWN') {
      if(d.btn === 'X') speedFlurry();
      if(d.btn === 'Y') lightningDash();
      if(d.btn === 'A') multiverseSuper();
      if(d.btn === 'LEFT') p1.x = Math.max(30, p1.x - 20);
      if(d.btn === 'RIGHT') p1.x = Math.min(p2.x - 35, p1.x + 20);
      if(d.btn === 'START' && winner) reset();
    }
  } catch(err){}
});

window.addEventListener('keydown', (e) => {
  if(e.key === 'z') speedFlurry();
  if(e.key === 'x') lightningDash();
  if(e.key === 'c' || e.key === ' ') multiverseSuper();
  if(e.key === 'ArrowLeft') p1.x = Math.max(30, p1.x - 20);
  if(e.key === 'ArrowRight') p1.x = Math.min(p2.x - 35, p1.x + 20);
  if(e.key === 'Enter' && winner) reset();
});

function speedFlurry() {
  if(winner) return;
  p1.blur = 15;
  speedGauge = Math.min(100, speedGauge + 15);
  if(Math.abs(p1.x - p2.x) < 80) {
    hp2 = Math.max(0, hp2 - 10);
    document.getElementById('hp2').style.width = hp2 + '%';
    if(hp2 <= 0) winner = 'THE FLASH';
  }
}

function lightningDash() {
  if(winner) return;
  p1.blur = 30;
  speedGauge = Math.min(100, speedGauge + 25);
  hp2 = Math.max(0, hp2 - 18);
  document.getElementById('hp2').style.width = hp2 + '%';
  if(hp2 <= 0) winner = 'THE FLASH';
}

function multiverseSuper() {
  if(winner || speedGauge < 70) return;
  speedGauge = 0;
  hp2 = Math.max(0, hp2 - 38);
  document.getElementById('hp2').style.width = hp2 + '%';
  if(hp2 <= 0) winner = 'THE FLASH';
}

function reset() {
  hp1 = 100; hp2 = 100; speedGauge = 0; winner = null;
  document.getElementById('hp1').style.width = '100%';
  document.getElementById('hp2').style.width = '100%';
}

function update() {
  if(p1.blur > 0) p1.blur--;
  if(!winner && Math.random() < 0.03) {
    hp1 = Math.max(0, hp1 - 9);
    document.getElementById('hp1').style.width = hp1 + '%';
    if(hp1 <= 0) winner = 'BRAINIAC';
  }
}

function draw() {
  ctx.fillStyle = '#0B0F19';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Cybernetic Metropolis Grid
  ctx.strokeStyle = '#1E293B';
  ctx.lineWidth = 1;
  for(let x=0; x<canvas.width; x+=30) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
  }

  // Flash (Red + Yellow Speed Trails)
  if(p1.blur > 0) {
    ctx.fillStyle = 'rgba(234, 179, 8, 0.4)';
    ctx.fillRect(p1.x - 15, p1.y, 35, 60);
  }
  ctx.fillStyle = '#DC2626';
  ctx.fillRect(p1.x, p1.y, 35, 60);
  ctx.fillStyle = '#EAB308';
  ctx.beginPath();
  ctx.arc(p1.x + 17, p1.y - 12, 12, 0, Math.PI*2);
  ctx.fill();

  // Brainiac (Purple + Green tendrils)
  ctx.fillStyle = '#7E22CE';
  ctx.fillRect(p2.x, p2.y, 35, 60);
  ctx.fillStyle = '#22C55E';
  ctx.beginPath();
  ctx.arc(p2.x + 17, p2.y - 12, 12, 0, Math.PI*2);
  ctx.fill();

  // Speed Force Bar
  ctx.fillStyle = '#222';
  ctx.fillRect(20, 390, 310, 12);
  ctx.fillStyle = speedGauge >= 70 ? '#EAB308' : '#3B82F6';
  ctx.fillRect(20, 390, (speedGauge / 100) * 310, 12);

  if(winner) {
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = winner === 'THE FLASH' ? '#EAB308' : '#A855F7';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(winner + ' WINS!', 175, 190);
    ctx.fillStyle = '#FFF';
    ctx.font = '13px sans-serif';
    ctx.fillText('PRESS START TO PLAY AGAIN', 175, 230);
    ctx.textAlign = 'left';
  }

  update();
  requestAnimationFrame(draw);
}
draw();
</script>
</body>
</html>
`;

// 7. MORTAL KOMBAT (Tournament of Champions)
export const HTML_MORTAL_KOMBAT = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#0A0505; overflow:hidden; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:sans-serif; }
  #hud { width:350px; display:flex; justify-content:space-between; padding:6px; color:#FFF; font-weight:bold; font-size:12px; }
  .hp-bg { width:140px; height:13px; background:#1C1010; border:2px solid #5A1010; border-radius:2px; overflow:hidden; }
  .hp-fill { height:100%; width:100%; background:linear-gradient(90deg, #F59E0B, #DC2626); }
  canvas { border:2px solid #881337; border-radius:8px; background:#1A0808; max-width:100%; max-height:85vh; }
</style>
</head>
<body>
<div id="hud">
  <div><span style="color:#F59E0B;">SCORPION</span><div class="hp-bg"><div id="hp1" class="hp-fill"></div></div></div>
  <div><span style="color:#00D2FF;">SUB-ZERO</span><div class="hp-bg"><div id="hp2" class="hp-fill" style="background:linear-gradient(90deg,#00D2FF,#1D4ED8);"></div></div></div>
</div>
<canvas id="c" width="350" height="420"></canvas>
<script>
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
let hp1 = 100, hp2 = 100, winner = null;
let p1 = { x: 70, y: 280, spear: false };
let p2 = { x: 230, y: 280, frozen: 0 };
let bloodParticles = [];
let callout = "FIGHT!";
let calloutTimer = 80;

window.addEventListener('message', (e) => {
  try {
    const d = JSON.parse(e.data);
    if(d.type === 'BTN_DOWN') {
      if(d.btn === 'X') spear(); // "GET OVER HERE!"
      if(d.btn === 'Y') uppercut();
      if(d.btn === 'A') fatality();
      if(d.btn === 'LEFT') p1.x = Math.max(30, p1.x - 15);
      if(d.btn === 'RIGHT') p1.x = Math.min(p2.x - 35, p1.x + 15);
      if(d.btn === 'START' && winner) reset();
    }
  } catch(err){}
});

window.addEventListener('keydown', (e) => {
  if(e.key === 'z') spear();
  if(e.key === 'x') uppercut();
  if(e.key === 'c' || e.key === ' ') fatality();
  if(e.key === 'ArrowLeft') p1.x = Math.max(30, p1.x - 15);
  if(e.key === 'ArrowRight') p1.x = Math.min(p2.x - 35, p1.x + 15);
  if(e.key === 'Enter' && winner) reset();
});

function spear() {
  if(winner) return;
  p1.spear = true;
  callout = "GET OVER HERE!";
  calloutTimer = 60;
  spawnBlood(p2.x, p2.y + 20);
  hp2 = Math.max(0, hp2 - 14);
  document.getElementById('hp2').style.width = hp2 + '%';
  p2.x = Math.max(120, p2.x - 50);
  setTimeout(() => p1.spear = false, 300);
  if(hp2 <= 0) triggerFinish();
}

function uppercut() {
  if(winner) return;
  if(Math.abs(p1.x - p2.x) < 70) {
    hp2 = Math.max(0, hp2 - 18);
    document.getElementById('hp2').style.width = hp2 + '%';
    spawnBlood(p2.x, p2.y);
    callout = "TOASTY!";
    calloutTimer = 50;
    if(hp2 <= 0) triggerFinish();
  }
}

function fatality() {
  if(winner || hp2 > 20) return;
  hp2 = 0;
  document.getElementById('hp2').style.width = '0%';
  callout = "FATALITY!";
  calloutTimer = 120;
  for(let i=0; i<30; i++) spawnBlood(p2.x + Math.random()*20, p2.y + Math.random()*40);
  winner = 'SCORPION';
}

function triggerFinish() {
  callout = "FINISH HIM!";
  calloutTimer = 120;
  winner = 'SCORPION';
}

function spawnBlood(x, y) {
  for(let i=0; i<8; i++) {
    bloodParticles.push({
      x, y,
      vx: (Math.random() - 0.5) * 6,
      vy: Math.random() * -5 - 2,
      life: 25
    });
  }
}

function reset() {
  hp1 = 100; hp2 = 100; winner = null;
  callout = "ROUND 1 - FIGHT!"; calloutTimer = 80;
  document.getElementById('hp1').style.width = '100%';
  document.getElementById('hp2').style.width = '100%';
}

function update() {
  if(calloutTimer > 0) calloutTimer--;

  // Subzero AI
  if(!winner && Math.random() < 0.025) {
    hp1 = Math.max(0, hp1 - 10);
    document.getElementById('hp1').style.width = hp1 + '%';
    spawnBlood(p1.x, p1.y + 10);
    if(hp1 <= 0) {
      callout = "SUB-ZERO WINS!";
      winner = 'SUB-ZERO';
    }
  }

  bloodParticles.forEach((b, i) => {
    b.x += b.vx;
    b.y += b.vy;
    b.vy += 0.4;
    b.life--;
    if(b.life <= 0) bloodParticles.splice(i, 1);
  });
}

function draw() {
  ctx.fillStyle = '#170909';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Netherrealm Courtyard Stone Floor
  ctx.fillStyle = '#2A1111';
  ctx.fillRect(0, 340, canvas.width, 80);
  ctx.strokeStyle = '#4A1D1D';
  ctx.strokeRect(0, 340, canvas.width, 2);

  // Scorpion (Yellow Ninja)
  ctx.fillStyle = '#F59E0B';
  ctx.fillRect(p1.x, p1.y, 35, 60);
  ctx.fillStyle = '#111';
  ctx.fillRect(p1.x + 8, p1.y + 15, 18, 30);
  ctx.fillStyle = '#FBBF24';
  ctx.beginPath();
  ctx.arc(p1.x + 17, p1.y - 12, 12, 0, Math.PI*2);
  ctx.fill();

  // Spear Chain
  if(p1.spear) {
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(p1.x + 35, p1.y + 20);
    ctx.lineTo(p2.x, p2.y + 20);
    ctx.stroke();
  }

  // Sub-Zero (Cyan Ninja)
  ctx.fillStyle = '#00D2FF';
  ctx.fillRect(p2.x, p2.y, 35, 60);
  ctx.fillStyle = '#111';
  ctx.fillRect(p2.x + 8, p2.y + 15, 18, 30);
  ctx.fillStyle = '#38BDF8';
  ctx.beginPath();
  ctx.arc(p2.x + 17, p2.y - 12, 12, 0, Math.PI*2);
  ctx.fill();

  // Blood
  ctx.fillStyle = '#EF4444';
  bloodParticles.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, 3, 0, Math.PI*2);
    ctx.fill();
  });

  // Announcer Callout Banner
  if(calloutTimer > 0) {
    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(callout, 175, 170);
    ctx.textAlign = 'left';
  }

  if(winner) {
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = winner === 'SCORPION' ? '#F59E0B' : '#00D2FF';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(winner + ' WINS!', 175, 190);
    ctx.fillStyle = '#FFF';
    ctx.font = '14px sans-serif';
    ctx.fillText('PRESS START TO PLAY AGAIN', 175, 230);
    ctx.textAlign = 'left';
  }

  update();
  requestAnimationFrame(draw);
}
draw();
</script>
</body>
</html>
`;
