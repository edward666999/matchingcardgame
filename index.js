const gridContainer = document.querySelector(".grid-container");
let cards = [];
let firstCard, secondCard;
let lockBoard = false;
let score = 0;
let timer = 60; // Timer in seconds
let timerInterval;

document.querySelector(".score").textContent = score;

// Load sound effects
const flipSound = new Audio('s1.mp3');
const matchSound = new Audio('s2.mp3');
const noMatchSound = new Audio('s3.mp3');

// Fetch card data
fetch("./data/cards.json")
.then((res) => {
   if (!res.ok) throw new Error("Network response was not ok");
   return res.json();
})
.then((data) => {
   cards = [...data, ...data];
   shuffleCards();
   generateCards();
   startTimer();
})
.catch((error) => {
   console.error("Error loading card data:", error);
   document.querySelector(".loading").textContent = "Failed to load cards.";
});

// Shuffle cards function
function shuffleCards() {
   let currentIndex = cards.length,
       randomIndex,
       temporaryValue;

   while (currentIndex !== 0) {
       randomIndex = Math.floor(Math.random() * currentIndex);
       currentIndex -= 1;

       // Swap elements
       temporaryValue = cards[currentIndex];
       cards[currentIndex] = cards[randomIndex];
       cards[randomIndex] = temporaryValue;
   }
}

// Generate card elements
function generateCards() {
   for (let card of cards) {
       const cardElement = document.createElement("div");
       cardElement.classList.add("card");
       cardElement.setAttribute("data-name", card.name);
       cardElement.innerHTML = `
           <div class="front">
               <img class="front-image" src=${card.image} />
           </div>
           <div class="back"></div>
       `;
       gridContainer.appendChild(cardElement);
       cardElement.addEventListener("click", flipCard);
   }
}

// Flip card function
function flipCard() {
   if (lockBoard) return; // Prevent flipping if board is locked
   if (this === firstCard) return; // Prevent flipping the same card

   this.classList.add("flipped");
   flipSound.play(); // Play flip sound

   if (!firstCard) {
       firstCard = this; // Store first flipped card
       return; 
   }

   secondCard = this; // Store second flipped card
   score++;
   document.querySelector(".score").textContent = score;

   lockBoard = true; // Lock board until match check is complete
   checkForMatch();
}

// Check for match function
function checkForMatch() {
   let isMatch = firstCard.dataset.name === secondCard.dataset.name;

   isMatch ? disableCards() : unflipCards();
}

// Disable matched cards function
function disableCards() {
   matchSound.play(); // Play match sound
   firstCard.removeEventListener("click", flipCard);
   secondCard.removeEventListener("click", flipCard);
   
   resetBoard();
}

// Unflip unmatched cards function
function unflipCards() {
   noMatchSound.play(); // Play no match sound
   setTimeout(() => {
       firstCard.classList.remove("flipped");
       secondCard.classList.remove("flipped");
       resetBoard();
   }, 1000);
}

// Reset board function
function resetBoard() {
   [firstCard, secondCard] = [null, null];
   lockBoard = false; // Unlock board for next turn
}

// Start timer function
function startTimer() {
   timerInterval = setInterval(() => {
       timer--;
       document.querySelector(".timer").textContent = timer;

       if (timer <= 0) { 
           clearInterval(timerInterval); 
           alert("Time's up! Your score is " + score); 
           gridContainer.innerHTML = ""; 
           restart(); 
       }
       
   }, 1000);
}

// Restart game function
function restart() {
   resetBoard();
   shuffleCards();
   score = 0; // Reset score
   timer = 60; // Reset timer
   document.querySelector(".score").textContent = score; 
   
   gridContainer.innerHTML = ""; // Clear existing cards
   generateCards(); // Generate new cards
   
}

