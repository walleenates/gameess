const startButton = document.getElementById('start-button');
const easyLevel = document.getElementById('easy-level');
const hardLevel = document.getElementById('hard-level');
const welcomeScreen = document.getElementById('welcome-screen');
const gameContainer = document.getElementById('game-container');
const gameOverScreen = document.getElementById('game-over');
const restartButton = document.getElementById('restart-button');
const scoreDisplay = document.getElementById('score');

let canvas, ctx, player, enemies, bullets, gameOver, score, difficulty, enemySpeed;

startButton.addEventListener('click', startGame);
easyLevel.addEventListener('click', () => startGame('easy'));
hardLevel.addEventListener('click', () => startGame('hard'));
restartButton.addEventListener('click', restartGame);

function startGame(level = 'easy') {
    welcomeScreen.style.display = 'none';
    gameContainer.style.display = 'block';
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;

    player = {
        x: canvas.width / 2 - 25,
        y: canvas.height - 70,
        width: 50,
        height: 50,
        color: 'blue',
        speed: 5
    };

    bullets = [];
    enemies = [];
    gameOver = false;
    score = 0;
    enemySpeed = level === 'hard' ? 4 : 2; // Harder level increases speed
    difficulty = level;

    requestAnimationFrame(gameLoop);
}

function restartGame() {
    gameOverScreen.style.display = 'none';
    startGame(difficulty);
}

function gameLoop() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Move and draw bullets
    bullets.forEach((bullet, index) => {
        bullet.y -= 7;
        if (bullet.y < 0) bullets.splice(index, 1);
        ctx.fillStyle = 'red';
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });

    // Move and draw enemies
    enemies.forEach((enemy, index) => {
        enemy.x += enemy.vx;
        enemy.y += enemy.vy;

        // Check if enemy hits player
        if (checkCollision(player, enemy)) {
            endGame();
        }

        // Remove enemies out of bounds
        if (enemy.y > canvas.height || enemy.x > canvas.width || enemy.x < -enemy.width) {
            enemies.splice(index, 1);
        }

        // Check if bullet hits enemy
        bullets.forEach((bullet, bIndex) => {
            if (checkCollision(bullet, enemy)) {
                score++;
                bullets.splice(bIndex, 1);
                enemies.splice(index, 1);
            }
        });

        ctx.fillStyle = 'green';
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });

    // Player movement
    if (keys.ArrowLeft && player.x > 0) player.x -= player.speed;
    if (keys.ArrowRight && player.x + player.width < canvas.width) player.x += player.speed;
    if (keys.ArrowUp && player.y > 0) player.y -= player.speed;
    if (keys.ArrowDown && player.y + player.height < canvas.height) player.y += player.speed;

    // Generate enemies
    if (Math.random() < 0.02) {
        const side = Math.random() > 0.5 ? 'left' : 'right';
        let x = side === 'left' ? -50 : canvas.width + 50;
        let y = Math.random() * (canvas.height - 100);
        let vx = side === 'left' ? enemySpeed : -enemySpeed;
        enemies.push({ x, y, width: 50, height: 50, vx, vy: enemySpeed });
    }

    requestAnimationFrame(gameLoop);
}

// Key handling
const keys = {};
window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

// Shooting bullets
window.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
        bullets.push({ x: player.x + player.width / 2 - 2.5, y: player.y, width: 5, height: 10 });
    }
});

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function endGame() {
    gameOver = true;
    gameOverScreen.style.display = 'block';
    scoreDisplay.innerText = score;
}
