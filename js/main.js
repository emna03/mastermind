// Object containing DOM element selectors
const selectors = {
  boardContainer: document.querySelector('.board-container'),
  board: document.querySelector('.board'),
  moves: document.querySelector('.moves'),
  timer: document.querySelector('.timer'),
  start: document.querySelector('.button'),
  win: document.querySelector('.win'),
  reset: document.querySelector('.reset-button'),
};

// Game state variables
const state = {
  gameStarted: false,
  flippedCards: 0,
  totalFlips: 0,
  totalTime: 0,
  loop: null,
};

// Function to shuffle an array using the Fisher-Yates algorithm
const shuffle = array => {
  const clonedArray = [...array];

  for (let i = clonedArray.length - 1; i > 0; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      const original = clonedArray[i];

      clonedArray[i] = clonedArray[randomIndex];
      clonedArray[randomIndex] = original;
  }
  return clonedArray;
};

// Function to pick random items from an array
const pickRandom = (array, items) => {
  const clonedArray = [...array];
  const randomPicks = [];

  for (let i = 0; i < items; i++) {
      const randomIndex = Math.floor(Math.random() * clonedArray.length);
      randomPicks.push(clonedArray[randomIndex]);
      clonedArray.splice(randomIndex, 1);
  }
  return randomPicks;
};

// Function to generate the game board
const generateGame = () => {
  const dimensions = selectors.board.getAttribute('data-dimension');

  if (dimensions % 2 !== 0) {
      throw new Error("The dimension of the board must be an even number.");
  }
  
  // Generate emoji picks and shuffle them
  const emojis = ['😄', '🚀', '🌟', '🎉', '🔥', '🌈', '👍', '💡', '🌺', '🎈']
  const picks = pickRandom(emojis, (dimensions * dimensions) / 2);
  const items = shuffle([...picks, ...picks]);
  
  // Generate card elements and replace the board
  const cards = `
    <div class="board" style="grid-template-columns : repeat(${dimensions}, auto)">
     ${items.map(item => `
     <div class="card">
     <div class="card-front"></div>
     <div class="card-back">${item}</div>
     </div>
     `).join('')}
     </div>
     `
  const parser = new DOMParser().parseFromString(cards, 'text/html');
  selectors.board.replaceWith(parser.querySelector('.board'));
};

// Function to start the game
const startGame = () => {
  state.gameStarted = true;
  selectors.start.classList.add('disabled');

  state.loop = setInterval(() => {
      state.totalTime++;

      selectors.moves.innerText = `${state.totalFlips} moves`;
      selectors.timer.innerText = `Time: ${state.totalTime} sec`
  }, 1000);
};

// Function to flip cards back
const flipBackCards = () => {
  document.querySelectorAll('.card:not(.matched)').forEach(card => {
      card.classList.remove('flipped');
  });
  state.flippedCards = 0;
};

// Function to flip a card
const flipCard = card => {
  state.flippedCards++;
  state.totalFlips++;

  if (!state.gameStarted) {
      startGame();
  }

  if (state.flippedCards <= 2) {
      card.classList.add('flipped');
  }
  if (state.flippedCards === 2) {
      const flippedCards = document.querySelectorAll('.flipped:not(.matched)');
      if (flippedCards[0].innerText === flippedCards[1].innerText) {
          flippedCards[0].classList.add('matched');
          flippedCards[1].classList.add('matched');
      }

      setTimeout(() => {
          flipBackCards();
      }, 1000);

      if (!document.querySelectorAll('.card:not(.flipped)').length) {
          setTimeout(() => {
              selectors.boardContainer.classList.add('flipped');
              selectors.win.innerHTML = `
                <span class="win-text">
                you won!<br />
                with <span class="highlight">${state.totalFlips}</span>
                moves <br />
                under <span class="highlight">${state.totalTime}</span>
                seconds
                </span>
              `;
              clearInterval(state.loop);
          }, 1000);
      }
  }
};

// Function to enable or disable buttons based on game state
const updateButtonStates = () => {
  if (state.gameStarted) {
      selectors.start.classList.add('disabled');
      selectors.reset.classList.remove('disabled');
  
  } else {
      selectors.start.classList.remove('disabled');
      selectors.reset.classList.add('disabled');

  }
};
// Function to reset the game state
const resetGame = () => {
  selectors.boardContainer.classList.remove('flipped');
  selectors.win.innerHTML = '';
};

// Function to attach event listeners
const attachEventListeners = () => {
  document.addEventListener('click', event => {
      const eventTarget = event.target;
      const eventParent = eventTarget.parentElement;

      if (eventTarget.className.includes('card') && !eventParent.className.includes('flipped')) {
          flipCard(eventParent);
      } else if (eventTarget.nodeName === 'BUTTON' && !eventTarget.className.includes('disabled')) {
          startGame();
      }
  });
  // Event listener for the reset button
  selectors.reset.addEventListener('click', () => {
    resetGame();
    location.reload();
});

};

// Generate the game and attach event listeners
generateGame();
attachEventListeners();
