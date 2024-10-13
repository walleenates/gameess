const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let player;
let projectiles = [];
let enemies = [];
let powerUps = []; // Array for power-ups
let score = 0;
let difficulty = "easy";
let enemySpawnRate = 1000; // Default spawn rate
let gameInterval;
let level = 1;
let highScores = { easy: 0, medium: 0, hard: 0 }; // Leaderboard
const scoreText = document.getElementById("score"); // Score display element
const levelText = document.getElementById("level"); // Level display element
const highScoreText = document.getElementById("highScore"); // High score display element

// Player class
class Player {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height - 30;
        this.width = 30;
        this.height = 30;
        this.color = "blue";
        this.shielded = false; // To track if the player has a shield
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    move(direction) {
        if (direction === "left" && this.x > 0) {
            this.x -= 5;
        } else if (direction === "right" && this.x < canvas.width - this.width) {
            this.x += 5;
        }
    }

    activateShield() {
        this.shielded = true;
        setTimeout(() => {
            this.shielded = false; // Shield lasts for 10 seconds
        }, 10000);
    }
}

// Projectile class
class Projectile {
    constructor(x, y, target) {
        this.x = x;
        this.y = y;
        this.width = 5;
        this.height = 20;
        this.color = "yellow";
        this.target = target; // Target enemy
        this.speed = 5; // Speed of the projectile
        this.lifetime = 0; // Lifetime counter for the projectile
        this.maxLifetime = 100; // Maximum lifetime before disappearing
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        if (this.target) {
            const angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
            this.x += this.speed * Math.cos(angle);
            this.y += this.speed * Math.sin(angle);
        }
        this.lifetime++;
    }

    isOutOfBounds() {
        return this.y < 0 || this.lifetime >= this.maxLifetime;
    }
}

// Enemy class
class Enemy {
    constructor() {
        this.x = Math.random() * (canvas.width - 30);
        this.y = 0;
        this.width = 30;
        this.height = 30;
        this.color = "red";
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.y += 3; // Move down
    }
}

// Power-up class
class PowerUp {
    constructor() {
        this.x = Math.random() * (canvas.width - 30);
        this.y = Math.random() * (canvas.height - 30);
        this.width = 20;
        this.height = 20;
        this.type = Math.random() < 0.5 ? "rapidFire" : "shield"; // Randomly choose type
        this.color = this.type === "rapidFire" ? "green" : "purple"; // Different colors
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.y += 1; // Move down
    }
}

// Start Game function
function startGame() {
    document.getElementById("start-button").style.display = "none";
    document.getElementById("quit-button").style.display = "inline-block";

    player = new Player();
    projectiles = [];
    enemies = [];
    powerUps = [];
    score = 0;
    level = 1;

    // Set difficulty level
    difficulty = document.getElementById("difficulty").value;
    enemySpawnRate =
        difficulty === "easy" ? 1000 : difficulty === "medium" ? 800 : 600;

    gameInterval = setInterval(() => {
        spawnEnemy();
    }, enemySpawnRate);

    canvas.style.display = "block"; // Show the canvas
    gameLoop(); // Start the game loop
}

// Spawn Enemy
function spawnEnemy() {
    const enemy = new Enemy();
    enemies.push(enemy);
    // Chance to spawn a power-up
    if (Math.random() < 0.3) {
        const powerUp = new PowerUp();
        powerUps.push(powerUp);
    }
}

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.draw();

    // Draw projectiles and handle their updates
    projectiles.forEach((proj, projIndex) => {
        proj.update();
        proj.draw();

        // Remove if out of bounds or lifetime exceeded
        if (proj.isOutOfBounds()) {
            projectiles.splice(projIndex, 1);
        }
    });

    // Draw enemies and check for collisions
    enemies.forEach((enemy, enemyIndex) => {
        enemy.update();
        enemy.draw();

        // Check for collisions with player
        if (checkCollision(player, enemy)) {
            if (!player.shielded) {
                endGame();
            }
        }

        // Check if enemy is out of bounds
        if (enemy.y > canvas.height) {
            enemies.splice(enemyIndex, 1);
            score++;
            checkLevelUp(); // Check for level up after scoring
        }
    });

    // Draw power-ups and check for collisions
    powerUps.forEach((powerUp, powerUpIndex) => {
        powerUp.update();
        powerUp.draw();
        
        // Check for collisions with player
        if (checkCollision(player, powerUp)) {
            activatePowerUp(powerUp.type); // Activate the power-up effect
            powerUps.splice(powerUpIndex, 1); // Remove power-up after collection
        }
    });

    // Check for projectile collisions with enemies
    projectiles.forEach((proj, projIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (checkCollision(proj, enemy)) {
                enemies.splice(enemyIndex, 1); // Remove enemy
                projectiles.splice(projIndex, 1); // Remove projectile
                score++;
                checkLevelUp(); // Check for level up after scoring
            }
        });
    });

    updateScore(); // Update score display
    requestAnimationFrame(gameLoop);
}

// Check Collision
function checkCollision(rect1, rect2) {
    return !(
        rect2.x > rect1.x + rect1.width ||
        rect2.x + rect2.width < rect1.x ||
        rect2.y > rect1.y + rect1.height ||
        rect2.y + rect2.height < rect1.y
    );
}

// Check level up conditions
function checkLevelUp() {
    if (level === 1 && score >= 50) {
        level = 2;
        enemySpawnRate = 800; // Increase difficulty
        alert("Level Up! Welcome to Medium Level");
    } else if (level === 2 && score >= 100) {
        level = 3;
        enemySpawnRate = 600; // Increase difficulty
        alert("Level Up! Welcome to Hard Level");
    }
}

// Activate power-ups
function activatePowerUp(type) {
    if (type === "rapidFire") {
        player.fireRate = 150; // Increase fire rate
        setTimeout(() => {
            player.fireRate = 300; // Reset fire rate after 10 seconds
        }, 10000); // Rapid fire lasts for 10 seconds
    } else if (type === "shield") {
        player.activateShield();
    }
}

// Update score display
function updateScore() {
    scoreText.innerText = `Score: ${score}`;
    levelText.innerText = `Level: ${level}`;
    // Update high score if necessary
    if (score > highScores[difficulty]) {
        highScores[difficulty] = score;
        highScoreText.innerText = `High Score: ${highScores[difficulty]}`;
    }
}

// End Game
function endGame() {
    clearInterval(gameInterval);
    alert(`Game Over! Your score: ${score}`);
    resetGame();
}

// Reset Game
function resetGame() {
    document.getElementById("start-button").style.display = "inline-block";
    document.getElementById("quit-button").style.display = "none";
    canvas.style.display = "none"; // Hide the canvas
}

// Controls
document.addEventListener("keydown", (event) => {
    if (event.code === "ArrowLeft") {
        player.move("left");
    } else if (event.code === "ArrowRight") {
        player.move("right");
    } else if (event.code === "Space") {
        const targetEnemy = findClosestEnemy(); // Find the closest enemy to target
        const projectile = new Projectile(player.x + player.width / 2 - 2.5, player.y, targetEnemy);
        projectiles.push(projectile);
    }
});

// Function to find the closest enemy
function findClosestEnemy() {
    return enemies.length > 0 ? enemies[0] : null; // Simple targeting for now
}

// Event listeners for starting the game
document.getElementById("start-button").addEventListener("click", startGame);
document.getElementById("quit-button").addEventListener("click", resetGame);
