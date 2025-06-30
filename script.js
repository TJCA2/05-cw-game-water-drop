// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let dropMaker; // Will store our timer that creates drops regularly
let score = 0;
let timeLeft = 30;
let timerInterval;

// Difficulty settings
const difficultySettings = {
  easy:   { time: 40, winScore: 12, dropInterval: 1200, dropSpeed: 4.5 },
  normal: { time: 30, winScore: 20, dropInterval: 1000, dropSpeed: 4 },
  hard:   { time: 20, winScore: 28, dropInterval: 700,  dropSpeed: 2.8 }
};

let currentDifficulty = 'normal';
let winScore = difficultySettings.normal.winScore;
let dropIntervalMs = difficultySettings.normal.dropInterval;
let dropSpeed = difficultySettings.normal.dropSpeed;

// Milestone messages
const milestones = [
  { score: 1, message: "Great start! Keep going!" },
  { score: 5, message: "5 points! You're making a difference!" },
  { score: 10, message: "Halfway there!" },
  { score: 15, message: "15 points! Almost at your goal!" }
];
let milestonesShown = {};

// Wait for button click to start the game
document.getElementById("start-btn").addEventListener("click", function(e) {
  startGame();
});
document.getElementById("reset-btn").addEventListener("click", function(e) {
  resetGame();
});
document.getElementById('difficulty-select').addEventListener('change', function(e) {
  currentDifficulty = this.value;
  winScore = difficultySettings[currentDifficulty].winScore;
  dropIntervalMs = difficultySettings[currentDifficulty].dropInterval;
  dropSpeed = difficultySettings[currentDifficulty].dropSpeed;
  resetGame();
});

// Utility: show milestone message
function showMilestone(msg) {
  let milestoneDiv = document.getElementById('milestone-message');
  if (!milestoneDiv) {
    milestoneDiv = document.createElement('div');
    milestoneDiv.id = 'milestone-message';
    milestoneDiv.style.position = 'fixed';
    milestoneDiv.style.top = '60px';
    milestoneDiv.style.left = '50%';
    milestoneDiv.style.transform = 'translateX(-50%)';
    milestoneDiv.style.background = '#FFC907';
    milestoneDiv.style.color = '#222';
    milestoneDiv.style.padding = '14px 32px';
    milestoneDiv.style.borderRadius = '8px';
    milestoneDiv.style.fontSize = '22px';
    milestoneDiv.style.fontWeight = 'bold';
    milestoneDiv.style.boxShadow = '0 2px 12px rgba(0,0,0,0.12)';
    milestoneDiv.style.zIndex = '10001';
    document.body.appendChild(milestoneDiv);
  }
  milestoneDiv.textContent = msg;
  milestoneDiv.style.display = 'block';
  setTimeout(() => {
    milestoneDiv.style.display = 'none';
  }, 1700);
}

let winAudioUnlocked = false;
const winAudio = new Audio('sounds/brass-fanfare-with-timpani-and-winchimes-reverberated-146260.mp3');

// Unlock audio on first user gesture
function unlockWinAudio() {
  winAudio.play().then(() => {
    winAudio.pause();
    winAudio.currentTime = 0;
    winAudioUnlocked = true;
  }).catch(() => {});
  window.removeEventListener('pointerdown', unlockWinAudio);
  window.removeEventListener('keydown', unlockWinAudio);
}
window.addEventListener('pointerdown', unlockWinAudio);
window.addEventListener('keydown', unlockWinAudio);

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;

  // Set difficulty-based values
  winScore = difficultySettings[currentDifficulty].winScore;
  dropIntervalMs = difficultySettings[currentDifficulty].dropInterval;
  dropSpeed = difficultySettings[currentDifficulty].dropSpeed;
  timeLeft = difficultySettings[currentDifficulty].time;

  gameRunning = true;
  score = 0;
  document.getElementById("score").textContent = score;
  document.getElementById("time").textContent = timeLeft;
  document.getElementById("start-btn").disabled = true;
  document.getElementById("start-btn").textContent = "Game Running...";

  // Ensure game container keeps water drop cursor during gameplay
  const gameContainer = document.getElementById("game-container");
  gameContainer.style.cursor = "url('data:image/svg+xml;charset=utf-8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\"><path fill=\"%2300bfff\" d=\"M16 2C16 2 6 14.5 6 21a10 10 0 0 0 20 0C26 14.5 16 2 16 2zm0 26a6 6 0 0 1-6-6c0-2.5 2.5-7.5 6-13.1C19.5 14.5 22 19.5 22 22a6 6 0 0 1-6 6z\"/></svg>') 16 16, pointer";

  // Create new drops at difficulty-based interval
  dropMaker = setInterval(createDrop, dropIntervalMs);
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
  // Set timeLeft based on difficulty
  timeLeft = difficultySettings[currentDifficulty].time;
  document.getElementById("score").textContent = score;
  document.getElementById("time").textContent = timeLeft;
  document.getElementById("start-btn").disabled = false;
  document.getElementById("start-btn").textContent = "Start Game";
  document.querySelectorAll('.water-drop').forEach(drop => drop.remove());
  removeConfetti();
  milestonesShown = {}; // Reset milestone tracking
  const milestoneDiv = document.getElementById('milestone-message');
  if (milestoneDiv) milestoneDiv.style.display = 'none';
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
  if (score >= winScore) {
    message = "You win! Amazing job bringing clean water!";
    showConfetti();
    confetti = true;
    // Play brass fanfare sound (only if unlocked)
    if (winAudioUnlocked) {
      winAudio.currentTime = 0;
      winAudio.play();
    }
  } else {
    message = `Game Over! Try again to reach ${winScore} points.`;
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
    // Explicitly set sponge cursor for bucket drops
    drop.style.cursor = "url('data:image/svg+xml;charset=utf-8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\"><rect x=\"4\" y=\"10\" width=\"24\" height=\"12\" rx=\"6\" fill=\"%23FFEB3B\" stroke=\"%23FFC107\" stroke-width=\"2\"/><circle cx=\"10\" cy=\"16\" r=\"2\" fill=\"%23FFC107\"/><circle cx=\"22\" cy=\"16\" r=\"2\" fill=\"%23FFC107\"/><circle cx=\"16\" cy=\"14\" r=\"1.5\" fill=\"%23FFF59D\"/></svg>') 16 16, pointer";
  } else if (rand < 0.3) {
    isBad = true;
    drop.className = "water-drop bad-drop";
    // Explicitly set water drop cursor for bad drops
    drop.style.cursor = "url('data:image/svg+xml;charset=utf-8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\"><path fill=\"%2300bfff\" d=\"M16 2C16 2 6 14.5 6 21a10 10 0 0 0 20 0C26 14.5 16 2 16 2zm0 26a6 6 0 0 1-6-6c0-2.5 2.5-7.5 6-13.1C19.5 14.5 22 19.5 22 22a6 6 0 0 1-6 6z\"/></svg>') 16 16, pointer";
  } else {
    drop.className = "water-drop";
    // Explicitly set water drop cursor for good drops
    drop.style.cursor = "url('data:image/svg+xml;charset=utf-8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\"><path fill=\"%2300bfff\" d=\"M16 2C16 2 6 14.5 6 21a10 10 0 0 0 20 0C26 14.5 16 2 16 2zm0 26a6 6 0 0 1-6-6c0-2.5 2.5-7.5 6-13.1C19.5 14.5 22 19.5 22 22a6 6 0 0 1-6 6z\"/></svg>') 16 16, pointer";
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

  // Make drops fall for difficulty-based duration
  drop.style.animationDuration = dropSpeed + "s";

  // Add the image
  const img = document.createElement('img');
  if (isBucket) {
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
    // Prevent double execution
    drop.removeEventListener("click", handleDropClick);

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

    // Milestone check
    for (const m of milestones) {
      if (score === m.score && !milestonesShown[m.score]) {
        showMilestone(m.message);
        milestonesShown[m.score] = true;
      }
    }

    setTimeout(() => drop.remove(), 150);
  });
}

// Remove the event listener that penalizes background clicks
// document.getElementById("game-container").addEventListener("click", function(e) {
//   // Only trigger if the click is directly on the background, not a drop
//   if (!gameRunning) return;
//   if (e.target === this) {
//     if (score > 0) score--;
//     document.getElementById("score").textContent = score;
//     const container = this;
//     const originalColor = container.style.backgroundColor;
//     container.style.backgroundColor = '#F5402C'; // charity: water red
//     setTimeout(() => {
//       container.style.backgroundColor = '';
//     }, 150);
//   }
// });

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
