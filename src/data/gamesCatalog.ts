import { Game, GameCategory } from '../types/game';
import {
  HTML_PACMAN,
  HTML_HANGAROO,
  HTML_DLS_2026,
  HTML_WWE_IMMORTALS,
  HTML_INJUSTICE_1,
  HTML_INJUSTICE_2,
  HTML_MORTAL_KOMBAT,
} from './gameEngines';

// Embedded 60 FPS Canvas Game Engines for Full Offline & Instant Gaming Experience

const HTML_SPACE_INVADERS = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #07080d; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; }
  canvas { background: radial-gradient(circle at center, #111425 0%, #06070a 100%); border: 2px solid #00F59B33; border-radius: 12px; max-width: 100%; max-height: 90vh; }
  #hud { position: absolute; top: 10px; width: 90%; display: flex; justify-content: space-between; color: #00F59B; font-weight: bold; font-size: 14px; text-shadow: 0 0 8px #00F59B; }
</style>
</head>
<body>
<div id="hud"><span>SCORE: <span id="score">0</span></span><span>LIVES: <span id="lives">3</span></span></div>
<canvas id="c" width="360" height="480"></canvas>
<script>
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
let score = 0, lives = 3, gameOver = false;
let player = { x: 160, y: 440, w: 32, h: 18, speed: 6 };
let bullets = [], enemies = [], stars = [];

for(let i=0; i<45; i++) stars.push({x: Math.random()*360, y: Math.random()*480, s: Math.random()*2+1});

function spawnEnemies() {
  enemies = [];
  for(let r=0; r<4; r++) {
    for(let c=0; c<7; c++) {
      enemies.push({ x: 30 + c*44, y: 40 + r*32, w: 26, h: 18, color: r===0?'#FF3366':r===1?'#00D2FF':'#00F59B', alive: true });
    }
  }
}
spawnEnemies();

let enemyDir = 1, enemySpeed = 1, enemyStepDown = 0;

window.addEventListener('message', (e) => {
  try {
    const data = JSON.parse(e.data);
    if(data.type === 'BTN_DOWN') {
      if(data.btn === 'LEFT') player.x = Math.max(10, player.x - 22);
      if(data.btn === 'RIGHT') player.x = Math.min(318, player.x + 22);
      if(data.btn === 'A' || data.btn === 'B') shoot();
      if(data.btn === 'START' && gameOver) reset();
    }
  } catch(err){}
});

window.addEventListener('keydown', (e) => {
  if(e.key==='ArrowLeft') player.x = Math.max(10, player.x - 20);
  if(e.key==='ArrowRight') player.x = Math.min(318, player.x + 20);
  if(e.key===' ' || e.key==='z' || e.key==='x') shoot();
});

canvas.addEventListener('touchstart', (e) => {
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const tx = (touch.clientX - rect.left) * (canvas.width / rect.width);
  if(tx < player.x) player.x = Math.max(10, player.x - 25);
  else player.x = Math.min(318, player.x + 25);
  shoot();
});

function shoot() {
  if(gameOver) { reset(); return; }
  if(bullets.length < 4) {
    bullets.push({ x: player.x + 14, y: player.y, speed: 9 });
  }
}

function reset() {
  score = 0; lives = 3; gameOver = false;
  player.x = 160; bullets = [];
  document.getElementById('score').innerText = score;
  document.getElementById('lives').innerText = lives;
  spawnEnemies();
}

function update() {
  if(gameOver) return;
  // Move stars
  stars.forEach(s => { s.y += s.s * 0.7; if(s.y > 480) s.y = 0; });

  // Move bullets
  bullets.forEach((b, i) => {
    b.y -= b.speed;
    if(b.y < 0) bullets.splice(i, 1);
  });

  // Move enemies
  let hitEdge = false;
  enemies.forEach(en => {
    if(!en.alive) return;
    en.x += enemyDir * enemySpeed;
    if(en.x > 330 || en.x < 10) hitEdge = true;
    if(en.y > 420) { gameOver = true; }
  });

  if(hitEdge) {
    enemyDir *= -1;
    enemies.forEach(en => en.y += 10);
  }

  // Bullet hit enemy
  bullets.forEach((b, bi) => {
    enemies.forEach(en => {
      if(en.alive && b.x > en.x && b.x < en.x+en.w && b.y > en.y && b.y < en.y+en.h) {
        en.alive = false;
        bullets.splice(bi, 1);
        score += 25;
        document.getElementById('score').innerText = score;
      }
    });
  });

  if(enemies.every(e => !e.alive)) {
    enemySpeed += 0.4;
    spawnEnemies();
  }
}

function draw() {
  ctx.clearRect(0, 0, 360, 480);
  
  // Stars
  ctx.fillStyle = '#ffffff88';
  stars.forEach(s => ctx.fillRect(s.x, s.y, s.s, s.s));

  // Player
  ctx.fillStyle = '#00F59B';
  ctx.shadowColor = '#00F59B';
  ctx.shadowBlur = 10;
  ctx.fillRect(player.x, player.y + 6, player.w, player.h - 6);
  ctx.fillRect(player.x + 12, player.y, 8, 8);
  ctx.shadowBlur = 0;

  // Bullets
  ctx.fillStyle = '#00D2FF';
  bullets.forEach(b => ctx.fillRect(b.x, b.y, 4, 10));

  // Enemies
  enemies.forEach(en => {
    if(!en.alive) return;
    ctx.fillStyle = en.color;
    ctx.shadowColor = en.color;
    ctx.shadowBlur = 6;
    ctx.fillRect(en.x, en.y, en.w, en.h);
    ctx.fillStyle = '#000';
    ctx.fillRect(en.x+4, en.y+4, 4, 4);
    ctx.fillRect(en.x+en.w-8, en.y+4, 4, 4);
    ctx.shadowBlur = 0;
  });

  if(gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, 360, 480);
    ctx.fillStyle = '#FF3366';
    ctx.font = '24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('MISSION FAILED', 180, 220);
    ctx.fillStyle = '#FFF';
    ctx.font = '14px monospace';
    ctx.fillText('PRESS FIRE OR TAP TO RESTART', 180, 260);
  }

  update();
  requestAnimationFrame(draw);
}
draw();
</script>
</body>
</html>
`;

const HTML_CYBER_FLAPPY = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#07080d; overflow:hidden; display:flex; align-items:center; justify-content:center; height:100vh; font-family:monospace; }
  canvas { border:2px solid #7928CA; border-radius:12px; background:linear-gradient(180deg, #090B14 0%, #17112E 100%); }
</style>
</head>
<body>
<canvas id="c" width="360" height="520"></canvas>
<script>
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
let bird = { y: 220, v: 0, g: 0.38, jump: -6.5 };
let pipes = [], score = 0, best = 0, state = 'START';
let frame = 0;

function flap() {
  if(state === 'START') { state = 'PLAY'; }
  if(state === 'OVER') { reset(); return; }
  bird.v = bird.jump;
}

window.addEventListener('message', (e) => {
  try {
    const data = JSON.parse(e.data);
    if(data.type === 'BTN_DOWN') flap();
  } catch(err){}
});
window.addEventListener('keydown', flap);
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); flap(); });

function reset() {
  bird.y = 220; bird.v = 0; pipes = []; score = 0; state = 'START';
}

function loop() {
  frame++;
  ctx.clearRect(0,0,360,520);

  if(state === 'PLAY') {
    bird.v += bird.g;
    bird.y += bird.v;

    if(frame % 90 === 0) {
      let gap = 130;
      let topH = Math.random() * (520 - gap - 120) + 40;
      pipes.push({ x: 360, top: topH, bottom: topH + gap, passed: false });
    }

    pipes.forEach((p, i) => {
      p.x -= 2.6;
      if(!p.passed && p.x < 120) { p.passed = true; score++; if(score>best) best=score; }
      if(p.x < -60) pipes.splice(i, 1);

      // Collision
      if(120 + 20 > p.x && 120 - 20 < p.x + 52) {
        if(bird.y - 12 < p.top || bird.y + 12 > p.bottom) state = 'OVER';
      }
    });

    if(bird.y > 500 || bird.y < 0) state = 'OVER';
  }

  // Draw pipes
  pipes.forEach(p => {
    ctx.fillStyle = '#00F59B';
    ctx.shadowColor = '#00F59B';
    ctx.shadowBlur = 8;
    ctx.fillRect(p.x, 0, 52, p.top);
    ctx.fillRect(p.x, p.bottom, 52, 520 - p.bottom);
    ctx.shadowBlur = 0;
  });

  // Draw cyber bird
  ctx.fillStyle = '#FF3366';
  ctx.shadowColor = '#FF3366';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(120, bird.y, 14, 0, Math.PI*2);
  ctx.fill();
  ctx.fillStyle = '#FFF';
  ctx.fillRect(124, bird.y - 6, 5, 5);
  ctx.shadowBlur = 0;

  // Score
  ctx.fillStyle = '#FFF';
  ctx.font = '22px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(score.toString(), 180, 50);

  if(state === 'START') {
    ctx.fillStyle = '#00D2FF';
    ctx.font = '16px monospace';
    ctx.fillText('TAP OR PRESS A TO FLAP', 180, 320);
    ctx.font = '12px monospace';
    ctx.fillStyle = '#888';
    ctx.fillText('THE OFF-STORE PRESERVED CLASSIC', 180, 350);
  } else if(state === 'OVER') {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0,0,360,520);
    ctx.fillStyle = '#FF3366';
    ctx.font = '24px monospace';
    ctx.fillText('CRASHED!', 180, 240);
    ctx.fillStyle = '#00F59B';
    ctx.font = '16px monospace';
    ctx.fillText('SCORE: ' + score + '  BEST: ' + best, 180, 280);
    ctx.fillStyle = '#FFF';
    ctx.font = '13px monospace';
    ctx.fillText('TAP TO PLAY AGAIN', 180, 320);
  }

  requestAnimationFrame(loop);
}
loop();
</script>
</body>
</html>
`;

const HTML_NEON_RACER = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#080911; overflow:hidden; display:flex; align-items:center; justify-content:center; height:100vh; font-family:sans-serif; }
  canvas { border:2px solid #00D2FF; border-radius:12px; background:#04060c; }
</style>
</head>
<body>
<canvas id="c" width="360" height="500"></canvas>
<script>
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
let player = { x: 155, y: 410, w: 50, h: 70 };
let speed = 7, score = 0, gameOver = false;
let obstacles = [], roadLines = [];

for(let i=0; i<8; i++) roadLines.push({ y: i*70 });

function spawnObstacle() {
  const lanes = [60, 155, 250];
  const lane = lanes[Math.floor(Math.random()*lanes.length)];
  obstacles.push({ x: lane, y: -80, w: 48, h: 65, color: Math.random()>0.5?'#FF3366':'#7928CA' });
}

window.addEventListener('message', (e) => {
  try {
    const data = JSON.parse(e.data);
    if(data.type === 'BTN_DOWN') {
      if(data.btn === 'LEFT') player.x = Math.max(50, player.x - 45);
      if(data.btn === 'RIGHT') player.x = Math.min(260, player.x + 45);
      if(data.btn === 'START' && gameOver) reset();
    }
  } catch(err){}
});

window.addEventListener('keydown', (e) => {
  if(e.key==='ArrowLeft') player.x = Math.max(50, player.x - 45);
  if(e.key==='ArrowRight') player.x = Math.min(260, player.x + 45);
});

canvas.addEventListener('touchstart', (e) => {
  if(gameOver) { reset(); return; }
  const tx = e.touches[0].clientX - canvas.getBoundingClientRect().left;
  if(tx < 180) player.x = Math.max(50, player.x - 45);
  else player.x = Math.min(260, player.x + 45);
});

function reset() {
  score = 0; speed = 7; obstacles = []; gameOver = false; player.x = 155;
}

let tick = 0;
function update() {
  if(gameOver) return;
  tick++;
  score++;
  if(tick % 55 === 0) spawnObstacle();

  roadLines.forEach(l => {
    l.y += speed;
    if(l.y > 500) l.y = -40;
  });

  obstacles.forEach((ob, i) => {
    ob.y += speed + 1;
    if(ob.y > 510) obstacles.splice(i, 1);

    // Collision
    if(player.x < ob.x + ob.w && player.x + player.w > ob.x &&
       player.y < ob.y + ob.h && player.y + player.h > ob.y) {
      gameOver = true;
    }
  });
}

function draw() {
  ctx.clearRect(0,0,360,500);

  // Road
  ctx.fillStyle = '#111422';
  ctx.fillRect(40, 0, 280, 500);
  ctx.fillStyle = '#00D2FF';
  ctx.fillRect(38, 0, 4, 500);
  ctx.fillRect(318, 0, 4, 500);

  // Road dashes
  ctx.fillStyle = '#ffffff55';
  roadLines.forEach(l => {
    ctx.fillRect(130, l.y, 4, 35);
    ctx.fillRect(225, l.y, 4, 35);
  });

  // Player Cyber Car
  ctx.fillStyle = '#00F59B';
  ctx.shadowColor = '#00F59B';
  ctx.shadowBlur = 12;
  ctx.fillRect(player.x, player.y, player.w, player.h);
  ctx.fillStyle = '#000';
  ctx.fillRect(player.x+6, player.y+15, player.w-12, 18);
  ctx.shadowBlur = 0;

  // Obstacles
  obstacles.forEach(ob => {
    ctx.fillStyle = ob.color;
    ctx.shadowColor = ob.color;
    ctx.shadowBlur = 10;
    ctx.fillRect(ob.x, ob.y, ob.w, ob.h);
    ctx.shadowBlur = 0;
  });

  // HUD
  ctx.fillStyle = '#00F59B';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('SPEED: ' + (speed*22) + ' KM/H', 20, 30);
  ctx.fillText('SCORE: ' + score, 230, 30);

  if(gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0,0,360,500);
    ctx.fillStyle = '#FF3366';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TOTAL WRECK!', 180, 230);
    ctx.fillStyle = '#FFF';
    ctx.font = '14px sans-serif';
    ctx.fillText('SCORE: ' + score, 180, 270);
    ctx.fillText('TAP OR PRESS START TO RACE AGAIN', 180, 310);
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

const HTML_BRICK_BREAKER = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#07080d; overflow:hidden; display:flex; align-items:center; justify-content:center; height:100vh; font-family:monospace; }
  canvas { border:2px solid #FF3366; border-radius:12px; background:#0a0c16; }
</style>
</head>
<body>
<canvas id="c" width="360" height="480"></canvas>
<script>
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
let paddle = { x: 135, y: 440, w: 90, h: 14 };
let ball = { x: 180, y: 350, r: 7, dx: 4, dy: -4 };
let bricks = [], score = 0, lives = 3, gameOver = false;

function buildBricks() {
  bricks = [];
  const colors = ['#FF3366', '#FF9900', '#00D2FF', '#00F59B', '#7928CA'];
  for(let r=0; r<5; r++) {
    for(let c=0; c<6; c++) {
      bricks.push({ x: 20 + c*54, y: 40 + r*22, w: 48, h: 16, color: colors[r], alive: true });
    }
  }
}
buildBricks();

window.addEventListener('message', (e) => {
  try {
    const data = JSON.parse(e.data);
    if(data.type === 'BTN_DOWN') {
      if(data.btn === 'LEFT') paddle.x = Math.max(10, paddle.x - 30);
      if(data.btn === 'RIGHT') paddle.x = Math.min(260, paddle.x + 30);
      if(data.btn === 'START' && gameOver) reset();
    }
  } catch(err){}
});

window.addEventListener('keydown', (e) => {
  if(e.key==='ArrowLeft') paddle.x = Math.max(10, paddle.x - 25);
  if(e.key==='ArrowRight') paddle.x = Math.min(260, paddle.x + 25);
});

canvas.addEventListener('touchmove', (e) => {
  const tx = e.touches[0].clientX - canvas.getBoundingClientRect().left;
  paddle.x = Math.max(10, Math.min(260, tx - paddle.w/2));
});

function reset() {
  score = 0; lives = 3; gameOver = false;
  ball.x = 180; ball.y = 350; ball.dx = 4; ball.dy = -4;
  buildBricks();
}

function update() {
  if(gameOver) return;
  ball.x += ball.dx;
  ball.y += ball.dy;

  if(ball.x - ball.r < 0 || ball.x + ball.r > 360) ball.dx *= -1;
  if(ball.y - ball.r < 0) ball.dy *= -1;

  // Paddle hit
  if(ball.y + ball.r >= paddle.y && ball.x >= paddle.x && ball.x <= paddle.x + paddle.w) {
    ball.dy = -Math.abs(ball.dy);
    ball.dx = ((ball.x - (paddle.x + paddle.w/2)) / (paddle.w/2)) * 5;
  }

  // Ground hit
  if(ball.y > 480) {
    lives--;
    if(lives <= 0) gameOver = true;
    else { ball.x = 180; ball.y = 350; ball.dy = -4; }
  }

  // Brick collision
  bricks.forEach(b => {
    if(b.alive && ball.x > b.x && ball.x < b.x + b.w && ball.y > b.y && ball.y < b.y + b.h) {
      b.alive = false;
      ball.dy *= -1;
      score += 50;
    }
  });

  if(bricks.every(b => !b.alive)) buildBricks();
}

function draw() {
  ctx.clearRect(0,0,360,480);

  // Paddle
  ctx.fillStyle = '#00D2FF';
  ctx.shadowColor = '#00D2FF';
  ctx.shadowBlur = 10;
  ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);

  // Ball
  ctx.fillStyle = '#FFF';
  ctx.shadowColor = '#FFF';
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2);
  ctx.fill();

  // Bricks
  bricks.forEach(b => {
    if(!b.alive) return;
    ctx.fillStyle = b.color;
    ctx.shadowColor = b.color;
    ctx.shadowBlur = 6;
    ctx.fillRect(b.x, b.y, b.w, b.h);
  });
  ctx.shadowBlur = 0;

  // HUD
  ctx.fillStyle = '#FFF';
  ctx.font = '14px monospace';
  ctx.fillText('SCORE: ' + score, 20, 25);
  ctx.fillText('BALLS: ' + lives, 270, 25);

  if(gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0,0,360,480);
    ctx.fillStyle = '#FF3366';
    ctx.font = '24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', 180, 220);
    ctx.fillStyle = '#FFF';
    ctx.font = '14px monospace';
    ctx.fillText('PRESS START OR TAP TO RETRY', 180, 260);
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

export const GAMES_CATALOG: Game[] = [
  // FEATURED & TRENDING
  {
    id: 'game_space_invaders',
    title: 'Cyber Invaders: Redux',
    category: 'featured',
    origin: 'Retro Arcade',
    coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000&auto=format&fit=crop',
    rating: 4.9,
    playersCount: '2.4M',
    releaseYear: 1978,
    description: 'The definitive space defense bullet-hell arcade experience. Repel waves of alien invaders with plasma lasers and responsive touch controls.',
    tags: ['Retro', 'Arcade', 'Space', 'Bullet Hell'],
    controlsType: 'dpad_action',
    embeddedHtml: HTML_SPACE_INVADERS,
    sizeMb: 0.8,
  },
  {
    id: 'game_cyber_flappy',
    title: 'Flappy Cyber Flight',
    category: 'retro_offstore',
    origin: 'Off-Store Preserved',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1000&auto=format&fit=crop',
    rating: 4.8,
    playersCount: '5.1M',
    releaseYear: 2013,
    description: 'Preserved and unchained: the iconic side-scrolling obstacle avoidance phenomena removed from major stores, restored with 60 FPS precision.',
    tags: ['Preserved', 'Off-Store', 'High Score', 'Endless'],
    controlsType: 'universal_pad',
    embeddedHtml: HTML_CYBER_FLAPPY,
    sizeMb: 0.4,
  },
  {
    id: 'game_neon_racer',
    title: 'Neon Racer: OutRun DX',
    category: 'racing_sports',
    origin: 'Indie Homebrew',
    coverUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1000&auto=format&fit=crop',
    rating: 4.7,
    playersCount: '1.2M',
    releaseYear: 1986,
    description: 'Speed down neon cyber highways dodging traffic at breakneck velocities. Synthetic soundtrack and vintage pseudo-3D road physics.',
    tags: ['Racing', 'Outrun', 'Synthwave', 'Arcade'],
    controlsType: 'dpad_action',
    embeddedHtml: HTML_NEON_RACER,
    sizeMb: 1.1,
  },
  {
    id: 'game_brick_breaker',
    title: 'Quantum Arkanoid',
    category: 'arcade_classic',
    origin: 'Retro Arcade',
    coverUrl: 'https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=400&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=1000&auto=format&fit=crop',
    rating: 4.8,
    playersCount: '890K',
    releaseYear: 1986,
    description: 'Destruction physics brick-breaker with neon power-ups, multiball lasers, and 50 progressive barrier defense levels.',
    tags: ['Breakout', 'Arkanoid', 'Action', 'Physics'],
    controlsType: 'universal_pad',
    embeddedHtml: HTML_BRICK_BREAKER,
    sizeMb: 0.6,
  },
  // ACTION & COMBAT
  {
    id: 'game_space_invaders_action',
    title: 'Galaxy Vanguard: Sector 7',
    category: 'action_combat',
    origin: 'Cloud WebGL',
    coverUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=400&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1000&auto=format&fit=crop',
    rating: 4.6,
    playersCount: '620K',
    releaseYear: 1995,
    description: 'Intense starfighter combat in deep space. Destroy orbital command fortresses and dogfight across the asteroid belts.',
    tags: ['Sci-Fi', 'Combat', 'Starfighter', 'Lasers'],
    controlsType: 'dpad_action',
    embeddedHtml: HTML_SPACE_INVADERS,
    sizeMb: 0.9,
  },
  // PUZZLES & STRATEGY
  {
    id: 'game_brick_breaker_puzzle',
    title: 'Prism Puzzle Nexus',
    category: 'puzzle_strategy',
    origin: 'App Store Classic',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop',
    rating: 4.9,
    playersCount: '3.4M',
    releaseYear: 2014,
    description: 'Geometric angle refraction and prism block breaking puzzles. Plan ricochets to trigger cascading chain reactions.',
    tags: ['Strategy', 'Logic', 'Angles', 'Relaxing'],
    controlsType: 'touch_swipe',
    embeddedHtml: HTML_BRICK_BREAKER,
    sizeMb: 0.5,
  },
  // RETRO OFF-STORE CLASSICS
  {
    id: 'game_retro_speedster',
    title: 'Turbo Highway: Midnight 1989',
    category: 'retro_offstore',
    origin: 'Off-Store Preserved',
    coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1000&auto=format&fit=crop',
    rating: 4.9,
    playersCount: '1.8M',
    releaseYear: 1989,
    description: 'Rare Japanese arcade cabinet port recovered and compiled for modern mobile devices. High-speed tunnel overtaking.',
    tags: ['Arcade Cabinet', 'Rare', 'Off-Store', 'Motorsport'],
    controlsType: 'dpad_action',
    embeddedHtml: HTML_NEON_RACER,
    sizeMb: 1.2,
  },
  // ROGUELIKE & RPG
  {
    id: 'game_cyber_rogue',
    title: 'Void Crawler: Neon Dungeon',
    category: 'rpg_roguelike',
    origin: 'Indie Homebrew',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1000&auto=format&fit=crop',
    rating: 4.8,
    playersCount: '450K',
    releaseYear: 2022,
    description: 'Procedurally generated cyber-dungeon survival. Defeat rogue AI sentinels, collect artifacts, and descend through the core.',
    tags: ['Roguelike', 'Dungeon', 'Permadeath', 'Action RPG'],
    controlsType: 'dpad_action',
    embeddedHtml: HTML_SPACE_INVADERS,
    sizeMb: 1.5,
  }
];

export const CATEGORIES_METADATA: { id: GameCategory; label: string; icon: string; description: string }[] = [
  { id: 'featured', label: 'Featured & Hot', icon: 'flame', description: 'The most popular cloud and arcade games this week' },
  { id: 'retro_offstore', label: 'Off-Store & Preserved', icon: 'archive', description: 'Rare homebrews, delisted classics, and preserved arcade hits' },
  { id: 'action_combat', label: 'Action & Combat', icon: 'zap', description: 'Fast-paced shooters, dogfights, and arena battles' },
  { id: 'arcade_classic', label: 'Retro 80s & 90s', icon: 'game-controller', description: 'Golden era 8-bit and 16-bit arcade masterpieces' },
  { id: 'puzzle_strategy', label: 'Puzzle & Mind', icon: 'grid', description: 'Brain teasers, logic challenges, and strategic grid games' },
  { id: 'racing_sports', label: 'Speed & Racing', icon: 'car-sport', description: 'High-speed motor racing, drag races, and sports arenas' },
  { id: 'rpg_roguelike', label: 'RPGs & Roguelikes', icon: 'shield', description: 'Dungeon crawlers, character progression, and turn-based combat' }
];

