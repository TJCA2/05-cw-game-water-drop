// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let dropMaker; // Will store our timer that creates drops regularly
let score = 0;
let timeLeft = 30;
let timerInterval;

// Wait for button click to start the game
document.getElementById("start-btn").addEventListener("click", startGame);
document.getElementById("reset-btn").addEventListener("click", resetGame);

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;

  gameRunning = true;
  score = 0;
  timeLeft = 30;
  document.getElementById("score").textContent = score;
  document.getElementById("time").textContent = timeLeft;
  document.getElementById("start-btn").disabled = true;
  document.getElementById("start-btn").textContent = "Game Running...";

  // Create new drops every second (1000 milliseconds)
  dropMaker = setInterval(createDrop, 1000);
  timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
  timeLeft--;
  document.getElementById("time").textContent = timeLeft;
  if (timeLeft <= 0) {
    endGame();
  }
}

function resetGame() {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(timerInterval);
  score = 0;
  timeLeft = 30;
  document.getElementById("score").textContent = score;
  document.getElementById("time").textContent = timeLeft;
  document.getElementById("start-btn").disabled = false;
  document.getElementById("start-btn").textContent = "Start Game";
  document.querySelectorAll('.water-drop').forEach(drop => drop.remove());
  removeConfetti();
}

function endGame() {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(timerInterval);
  document.getElementById("start-btn").disabled = false;
  document.getElementById("start-btn").textContent = "Start Game";
  // Remove all drops
  document.querySelectorAll('.water-drop').forEach(drop => drop.remove());
  let message, confetti = false;
  if (score >= 20) {
    message = "You win! Amazing job bringing clean water!";
    showConfetti();
    confetti = true;
  } else {
    message = "Game Over! Try again to reach 20 points.";
  }
  showModal(message, score, confetti);
}

function showModal(message, score, confetti) {
  const modal = document.getElementById('game-modal');
  document.getElementById('modal-message').textContent = message;
  document.getElementById('modal-score').textContent = `Your score: ${score}`;
  modal.style.display = 'flex';
  if (!confetti) removeConfetti();
}

document.getElementById('modal-restart-btn').addEventListener('click', () => {
  document.getElementById('game-modal').style.display = 'none';
  resetGame();
});

function createDrop() {
  if (!gameRunning) return;
  // Create a new div element that will be our water drop
  const drop = document.createElement("div");
  // 10% chance to be a special bucket drop, 20% bad, else good
  const rand = Math.random();
  let isBad = false, isBucket = false;
  if (rand < 0.1) {
    isBucket = true;
    drop.className = "water-drop bucket-drop";
  } else if (rand < 0.3) {
    isBad = true;
    drop.className = "water-drop bad-drop";
  } else {
    drop.className = "water-drop";
  }

  // Make drops different sizes for visual variety
  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;

  // Position the drop randomly across the game width
  const gameWidth = document.getElementById("game-container").offsetWidth;
  const xPosition = Math.random() * (gameWidth - 60);
  drop.style.left = xPosition + "px";

  // Make drops fall for 4 seconds
  drop.style.animationDuration = "4s";

  // Add the image
  const img = document.createElement('img');
  if (isBucket) {
    // Use a black water droplet SVG as the image for the time bonus drop
    img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="black" d="M16 2C16 2 6 14.5 6 21a10 10 0 0 0 20 0C26 14.5 16 2 16 2zm0 26a6 6 0 0 1-6-6c0-2.5 2.5-7.5 6-13.1C19.5 14.5 22 19.5 22 22a6 6 0 0 1-6 6z"/></svg>';
    img.alt = 'Oil Drop (Time Bonus)';
    img.className = 'jerry-can-img';
    img.style.filter = '';
  } else if (isBad) {
    img.src = 'img/water-can-transparent.png';
    img.alt = 'Bad Jerry Can';
    img.className = 'jerry-can-img';
    img.style.filter = 'brightness(0) saturate(100%) invert(17%) sepia(99%) saturate(7492%) hue-rotate(357deg) brightness(97%) contrast(108%)'; // red
  } else {
    img.src = 'img/water-can-transparent.png';
    img.alt = 'Good Jerry Can';
    img.className = 'jerry-can-img';
    img.style.filter = 'brightness(0) saturate(100%) invert(87%) sepia(97%) saturate(749%) hue-rotate(359deg) brightness(104%) contrast(104%)'; // yellow
  }
  img.style.width = '100%';
  img.style.height = '100%';
  img.style.objectFit = 'contain';
  drop.appendChild(img);

  document.getElementById("game-container").appendChild(drop);

  drop.addEventListener("animationend", () => {
    drop.remove();
  });

  drop.addEventListener("click", function handleDropClick(e) {
    if (!gameRunning) return;
    if (isBucket) {
      timeLeft += 7;
      document.getElementById("time").textContent = timeLeft;
      img.style.filter = 'brightness(0) saturate(100%) invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0.5) contrast(200%) drop-shadow(0 0 10px #222)';
      drop.style.transform = "scale(1.3)";
    } else if (isBad) {
      score = Math.max(0, score - 2);
      img.style.filter = 'brightness(0) saturate(100%) invert(17%) sepia(99%) saturate(7492%) hue-rotate(357deg) brightness(97%) contrast(108%) drop-shadow(0 0 10px #F5402C)';
      drop.style.transform = "scale(1.3)";
    } else {
      score++;
      img.style.filter = 'brightness(0) saturate(100%) invert(87%) sepia(97%) saturate(749%) hue-rotate(359deg) brightness(104%) contrast(104%) drop-shadow(0 0 10px #FFC907)';
      drop.style.transform = "scale(1.3)";
    }
    document.getElementById("score").textContent = score;
    setTimeout(() => drop.remove(), 150);
    drop.removeEventListener("click", handleDropClick);
  });
}

document.getElementById("game-container").addEventListener("click", function(e) {
  // Only trigger if the click is directly on the background, not a drop
  if (!gameRunning) return;
  if (e.target === this) {
    if (score > 0) score--;
    document.getElementById("score").textContent = score;
    const container = this;
    const originalColor = container.style.backgroundColor;
    container.style.backgroundColor = '#F5402C'; // charity: water red
    setTimeout(() => {
      container.style.backgroundColor = '';
    }, 150);
  }
});

function showConfetti() {
  const confetti = document.createElement('div');
  confetti.id = 'confetti';
  confetti.style.position = 'fixed';
  confetti.style.top = '0';
  confetti.style.left = '0';
  confetti.style.width = '100vw';
  confetti.style.height = '100vh';
  confetti.style.pointerEvents = 'none';
  confetti.style.zIndex = '9999';
  confetti.innerHTML = Array.from({length: 80}, () => `<span style="font-size:${Math.random()*24+24}px; position:absolute; left:${Math.random()*100}vw; top:${Math.random()*100}vh;">🎉</span>`).join('');
  document.body.appendChild(confetti);
}

function removeConfetti() {
  const confetti = document.getElementById('confetti');
  if (confetti) confetti.remove();
}
