// DOM references
const character = document.getElementById('character');
const ground = document.getElementById('ground');
const displayScore = document.getElementById('score');

const homeScreen = document.getElementById('home-screen');
const gameContainer = document.getElementById('game-container');
const startBtn = document.getElementById('start-btn');
const homeBtn = document.getElementById('home-btn');

// Game state
let isJumping = false;
let upTime;
let downTime;

let characterBottom;
let characterRight;
let characterWidth;

let groundBottom;
let groundHeight;

let score = 0;
let scoreInterval;
let gameRunning = false;

// ---- UI: Start & Home ----
startBtn.addEventListener('click', () => {
  homeScreen.style.display = 'none';
  gameContainer.style.display = 'block';
  startGame();
});

homeBtn.addEventListener('click', () => {
  // Quick way to return to the home screen and reset everything
  location.reload();
});

// ---- Game Setup & Loop ----
function initValues() {
  characterBottom = parseInt(getComputedStyle(character).getPropertyValue('bottom'));
  characterRight = parseInt(getComputedStyle(character).getPropertyValue('right'));
  characterWidth = parseInt(getComputedStyle(character).getPropertyValue('width'));

  groundBottom = parseInt(getComputedStyle(ground).getPropertyValue('bottom'));
  groundHeight = parseInt(getComputedStyle(ground).getPropertyValue('height'));

  score = 0;
  displayScore.innerText = score;
}

function jump() {
  if (isJumping) return;

  upTime = setInterval(() => {
    if (characterBottom >= groundHeight + 250) {
      clearInterval(upTime);
      downTime = setInterval(() => {
        if (characterBottom <= groundHeight + 10) {
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

function showScore() {
  score++;
  displayScore.innerText = score;
}

function generateObstacle() {
  if (!gameRunning) return;

  const obstacles = document.querySelector('.obstacles');
  const obstacle = document.createElement('div');
  obstacle.setAttribute('class', 'obstacle');
  obstacles.appendChild(obstacle);

  const randomTimeout = Math.floor(Math.random() * 1000) + 1000;
  let obstacleRight = -30;
  const obstacleBottom = 100;
  const obstacleWidth = 30;
  const obstacleHeight = Math.floor(Math.random() * 50) + 50;

  obstacle.style.backgroundColor = `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;

  function moveObstacle() {
    obstacleRight += 5;
    obstacle.style.right = obstacleRight + 'px';
    obstacle.style.bottom = obstacleBottom + 'px';
    obstacle.style.width = obstacleWidth + 'px';
    obstacle.style.height = obstacleHeight + 'px';

    // Collision (character is stationary horizontally)
    if (
      characterRight >= obstacleRight - characterWidth &&
      characterRight <= obstacleRight + obstacleWidth &&
      characterBottom <= obstacleBottom + obstacleHeight
    ) {
      alert('You got hit! Game Over! Your score is: ' + score);
      clearInterval(obstacleInterval);
      clearTimeout(obstacleTimeout);
      location.reload(); // immediate restart as requested
    }
  }

  const obstacleInterval = setInterval(moveObstacle, 20);
  const obstacleTimeout = setTimeout(generateObstacle, randomTimeout);
}

function control(e) {
  if (e.key === 'ArrowUp' || e.key === ' ') {
    jump();
  }
}

function startGame() {
  initValues();
  gameRunning = true;

  // Input listeners
  document.addEventListener('keydown', control);

  // If you prefer clicks to jump, keep this. (Optional improvement below to scope to game area)
  gameContainer.addEventListener('click', jump);

  // Start score & obstacles
  scoreInterval = setInterval(showScore, 100);
  generateObstacle();
}