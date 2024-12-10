const menuScreen = document.getElementById("menuScreen");
const gameScreen = document.getElementById("gameScreen");
const startGameButton = document.getElementById("startGameButton");
const backToMenuButton = document.getElementById("backToMenuButton");
const gameBoard = document.getElementById("gameBoard");
const scoreElement = document.getElementById("score");
const difficultySelect = document.getElementById("difficulty");
const scores2x2 = document.getElementById("scores-2x2");
const scores4x4 = document.getElementById("scores-4x4");
const scores6x6 = document.getElementById("scores-6x6");
const winnerScreen = document.getElementById("winnerScreen");
const backToMenuWinnerButton = document.getElementById("backToMenuWinnerButton");


let flipCount = 0;
let firstCard = null;
let secondCard = null;
let matchedPairs = 0;
let totalPairs = 0;

// Pool of all available images
const allImages = [
    "images/1.png", "images/2.png", "images/3.png", "images/4.png",
    "images/5.png", "images/6.png", "images/7.png", "images/8.png",
    "images/9.png", "images/10.png", "images/11.png", "images/12.png",
    "images/13.png", "images/14.png", "images/15.png", "images/16.png",
    "images/17.png", "images/18.png"
];

// Get theme switch toggle
const themeSwitch = document.getElementById("themeSwitch");

// Load saved theme preference
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeSwitch.checked = true;
}

// Add event listener to toggle theme
themeSwitch.addEventListener("change", () => {
    if (themeSwitch.checked) {
        document.body.classList.add("dark-mode");
        localStorage.setItem("theme", "dark"); // Save preference
    } else {
        document.body.classList.remove("dark-mode");
        localStorage.setItem("theme", "light"); // Save preference
    }
});


const correctAudio = new Audio("audio/correct.mp3");

// Retrieve and manage scores
const getScores = () => ({
    "2x2": JSON.parse(localStorage.getItem("scores-2x2")) || [],
    "4x4": JSON.parse(localStorage.getItem("scores-4x4")) || [],
    "6x6": JSON.parse(localStorage.getItem("scores-6x6")) || [],
});

const saveScores = (difficulty, score) => {
    const scores = getScores();
    scores[difficulty].push(score);
    scores[difficulty] = scores[difficulty].sort((a, b) => a - b).slice(0, 3);
    localStorage.setItem(`scores-${difficulty}`, JSON.stringify(scores[difficulty]));
};

const updateScoreboard = () => {
    const scores = getScores();

    const updateList = (difficulty, element) => {
        element.innerHTML = scores[difficulty]
            .map((score, index) => `<li>${index + 1}. ${score} flips</li>`)
            .join("");
    };

    updateList("2x2", document.getElementById("scores-2x2"));
    updateList("4x4", document.getElementById("scores-4x4"));
    updateList("6x6", document.getElementById("scores-6x6"));
};

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function getRandomImages(numPairs) {
    shuffle(allImages);
    return allImages.slice(0, numPairs);
}

function updateScore() {
    scoreElement.textContent = `Flips: ${flipCount}`;
}

function createBoard(size) {
    gameBoard.innerHTML = "";
    flipCount = 0;
    matchedPairs = 0;
    firstCard = null;
    secondCard = null;
    updateScore();

    gameBoard.style.gridTemplateColumns = `repeat(${size}, 100px)`;

    const numPairs = (size * size) / 2;

    // Get random images based on difficulty
    const selectedImages = getRandomImages(numPairs);
    const images = [...selectedImages, ...selectedImages];
    shuffle(images);

    images.forEach((image) => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.dataset.image = image;

        const imgElement = document.createElement("img");
        imgElement.src = image;
        card.appendChild(imgElement);
        gameBoard.appendChild(card);
    });

    totalPairs = numPairs;

    document.querySelectorAll(".card").forEach((card) => {
        card.addEventListener("click", handleCardClick);
    });
}

function handleCardClick(e) {
    const clickedCard = e.target.closest(".card");

    if (!clickedCard || clickedCard.classList.contains("flipped") || secondCard) return;

    clickedCard.classList.add("flipped");

    if (!firstCard) {
        firstCard = clickedCard;
    } else {
        secondCard = clickedCard;

        flipCount++;
        updateScore();

        if (firstCard.dataset.image === secondCard.dataset.image) {
            matchedPairs++;
            firstCard = null;
            secondCard = null;

            if (matchedPairs === totalPairs) {
                setTimeout(() => alert(`You won! Total flips: ${flipCount}`), 500);
            }
        } else {
            setTimeout(() => {
                firstCard.classList.remove("flipped");
                secondCard.classList.remove("flipped");
                firstCard = null;
                secondCard = null;
            }, 750);
        }
    }
}

// Switch Screens
startGameButton.addEventListener("click", () => {
    const difficulty = document.getElementById("difficulty").value;

    menuScreen.classList.remove("active");
    menuScreen.classList.add("hidden");

    gameScreen.classList.remove("hidden");
    gameScreen.classList.add("active");

    if (difficulty === "2x2") createBoard(2);
    else if (difficulty === "4x4") createBoard(4);
    else if (difficulty === "6x6") createBoard(6);
});

// Back to Menu
backToMenuButton.addEventListener("click", () => {
    gameScreen.classList.remove("active");
    gameScreen.classList.add("hidden");

    menuScreen.classList.remove("hidden");
    menuScreen.classList.add("active");
});


function showWinnerScreen(score, difficulty) {
    // Hide game screen and show winner screen
    gameScreen.classList.remove("active");
    gameScreen.classList.add("hidden");
    winnerScreen.classList.remove("hidden");
    winnerScreen.classList.add("active");

    // Update final score message
    const finalScoreMessage = document.getElementById("finalScoreMessage");
    finalScoreMessage.textContent = `You completed the game in ${score} flips!`;

    // Play winning audio
    const winAudio = document.getElementById("winAudio");
    winAudio.currentTime = 0; // Reset the audio to the beginning
    winAudio.play();

    // Update the leaderboard for the winner screen
    updateWinnerLeaderboard();
}


backToMenuWinnerButton.addEventListener("click", () => {
    const winAudio = document.getElementById("winAudio");
    winAudio.pause(); // Stop the audio
    winAudio.currentTime = 0; // Reset the audio

    // Transition screens
    winnerScreen.classList.remove("active");
    winnerScreen.classList.add("hidden");
    menuScreen.classList.remove("hidden");
    menuScreen.classList.add("active");
});

function updateWinnerLeaderboard() {
    const scores = getScores();

    const updateList = (difficulty, elementId) => {
        const element = document.getElementById(elementId);
        element.innerHTML = scores[difficulty]
            .map((score, index) => `<li>${index + 1}. ${score} flips</li>`)
            .join("");
    };

    updateList("2x2", "scores-2x2-winner");
    updateList("4x4", "scores-4x4-winner");
    updateList("6x6", "scores-6x6-winner");
}

backToMenuWinnerButton.addEventListener("click", () => {
    winnerScreen.classList.remove("active");
    winnerScreen.classList.add("hidden");
    menuScreen.classList.remove("hidden");
    menuScreen.classList.add("active");
});

// Modify game win logic to use the winner screen
function handleCardClick(e) {
    const clickedCard = e.target.closest(".card");

    if (!clickedCard || clickedCard.classList.contains("flipped") || secondCard) return;

    clickedCard.classList.add("flipped");

    if (!firstCard) {
        firstCard = clickedCard;
    } else {
        secondCard = clickedCard;

        flipCount++;
        updateScore();

        if (firstCard.dataset.image === secondCard.dataset.image) {
            matchedPairs++;
            correctAudio.play();
            firstCard = null;
            secondCard = null;

            if (matchedPairs === totalPairs) {
                const difficulty = difficultySelect.value;
                saveScores(difficulty, flipCount);
                updateScoreboard();
                showWinnerScreen(flipCount, difficulty);
            }
        } else {
            setTimeout(() => {
                firstCard.classList.remove("flipped");
                secondCard.classList.remove("flipped");
                firstCard = null;
                secondCard = null;
            }, 750);
        }
    }
}

// Initialize scoreboard
updateScoreboard();
