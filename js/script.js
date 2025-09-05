// DOM references
const homeScreen = document.getElementById('home-screen');
const gameContainer = document.getElementById('game-container');
const startBtn = document.getElementById('start-btn');
const homeBtn = document.getElementById('home-btn');

const character = document.getElementById('character');
const ground = document.getElementById('ground');
const obstaclesContainer = document.querySelector('.obstacles');
const displayScore = document.getElementById('score');

const gameOverOverlay = document.getElementById('game-over');
const finalScoreText = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');
const goHomeBtn = document.getElementById('go-home-btn');

// Game state
let isJumping = false;
let upTime, downTime;
let characterBottom, characterRight, characterWidth;
let groundBottom, groundHeight;
let score = 0;
let scoreInterval;
let gameRunning = false;
let gameOverActive = false;

// Keep track of obstacle timers so we can clear them all at game over
let activeObstacleIntervals = [];
let activeObstacleTimeouts = [];

// ----------------- UI: Start & Home -----------------
startBtn.addEventListener('click', () => {
  // Fade out home screen
  homeScreen.classList.remove('active');
  // Start game after fade transition
  setTimeout(startGame, 500);
});

homeBtn.addEventListener('click', () => {
  // reloads back to home
  location.reload();
});

goHomeBtn.addEventListener('click', () => {
  location.reload();
});

// Restart button restarts the game without reloading
restartBtn.addEventListener('click', () => {
  restartGame();
});

// ----------------- Game Helpers -----------------
function initValues() {
  characterBottom = parseInt(getComputedStyle(character).getPropertyValue('bottom'));
  characterRight = parseInt(getComputedStyle(character).getPropertyValue('right'));
  characterWidth = parseInt(getComputedStyle(character).getPropertyValue('width'));
  groundBottom = parseInt(getComputedStyle(ground).getPropertyValue('bottom'));
  groundHeight = parseInt(getComputedStyle(ground).getPropertyValue('height'));
  score = 0;
  displayScore.innerText = score;
  isJumping = false;
  gameOverActive = false;
}

function jump(){
  if(isJumping) return;
  upTime = setInterval(() => {
    if(characterBottom >= groundHeight + 250){
      clearInterval(upTime);
      downTime = setInterval(() => {
        if(characterBottom <= groundHeight + 10){
          clearInterval(downTime);
          isJumping = false;
        }
        characterBottom -= 10;
        character.style.bottom = characterBottom + 'px';
      }, 20);
    }
    characterBottom += 10;
    character.style.bottom = characterBottom + 'px';
    isJumping = true;
  }, 20);
}

function showScore(){
  score++;
  displayScore.innerText = score;
}

// ----------------- Obstacles -----------------
function generateObstacle(){
  if (!gameRunning) return;

  let obstacle = document.createElement('div');
  obstacle.setAttribute('class', 'obstacle');
  obstaclesContainer.appendChild(obstacle);

  let randomTimeout = Math.floor(Math.random() * 1000) + 1000;
  let obstacleRight = -30;
  let obstacleBottom = 100;
  let obstacleWidth = 30;
  let obstacleHeight = Math.floor(Math.random() * 50) + 50;
  obstacle.style.backgroundColor = `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;

  function moveObstacle(){
    obstacleRight += 5;
    obstacle.style.right = obstacleRight + 'px';
    obstacle.style.bottom = obstacleBottom + 'px';
    obstacle.style.width = obstacleWidth + 'px';
    obstacle.style.height = obstacleHeight + 'px';

    // collision detection (characterRight is constant since character doesn't move horizontally)
     if (
      gameRunning &&
      characterRight >= obstacleRight - characterWidth &&
      characterRight <= obstacleRight + obstacleWidth &&
      characterBottom <= obstacleBottom + obstacleHeight
    ) {
      gameOver();
    }
  }

  // Save the interval/timeout IDs so we can clear them at game over
  const obstacleInterval = setInterval(moveObstacle, 20);
  const obstacleTimeout = setTimeout(generateObstacle, randomTimeout);
  activeObstacleIntervals.push(obstacleInterval);
  activeObstacleTimeouts.push(obstacleTimeout);
}

// ----------------- Controls -----------------
function control(e){
  if(e.key === 'ArrowUp' || e.key === ' '){
    jump();
  }
}

// ----------------- Game Over + Restart -----------------
function gameOver(){
  if (gameOverActive) return; // guard to prevent multiple calls
  gameOverActive = true;
  gameRunning = false;

  // stop spawning & moving
  gameRunning = false;

  // Stop any active jump timers
  if (upTime) clearInterval(upTime);
  if (downTime) clearInterval(downTime);

  // Clear all obstacle intervals/timeouts
  activeObstacleIntervals.forEach(id => clearInterval(id));
  activeObstacleTimeouts.forEach(id => clearTimeout(id));
  activeObstacleIntervals = [];
  activeObstacleTimeouts = [];

  // Stop score counter
  if (scoreInterval) clearInterval(scoreInterval);

  // Remove input listeners (so clicks/keys don't affect things while overlay is visible)
  document.removeEventListener('keydown', control);
  gameContainer.removeEventListener('click', jump);

  // Show overlay with final score
  finalScoreText.innerText = 'Your score: ' + score;
  gameOverOverlay.classList.add('active');
}

function restartGame(){
  // Hide Game Over overlay
  gameOverOverlay.classList.remove('active');

  // Clear obstacles
  obstaclesContainer.innerHTML = '';

  // Reset character position
  character.style.bottom = '100px';

  // Reset and start
  initValues();
  setTimeout(startGame, 500); // wait for overlay fade out
}

// ----------------- Start game -----------------
function startGame(){
  initValues();
  gameRunning = true;

  // attach input listeners
  document.addEventListener('keydown', control);
  gameContainer.addEventListener('click', jump);

  // start score + obstacles
  scoreInterval = setInterval(showScore, 100);
  generateObstacle();
}