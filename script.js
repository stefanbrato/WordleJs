let currentRow = 1;
let nextBoxToFill = 0;
let lastFilledBox = -1;
let wordFull = false;
let word = "";
let isLoading = false;

loading();
document.querySelector("div.word-boxes").addEventListener("keydown", (e) => {
  if (!isLetter(e.key)) {
    switch (e.key) {
      case "Backspace":
        deleteLetter();
        break;
      case "Enter":
        validateWord();
        break;
    }
    e.preventDefault();
  } else processletter(e.key);
});

function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
}

function processletter(letter) {
  if (nextBoxToFill < 4) {
    setBoxValue(letter, nextBoxToFill);
    lastFilledBox = nextBoxToFill;
    nextBoxToFill++;
  } else if (nextBoxToFill === 4) {
    setBoxValue(letter, nextBoxToFill);
    lastFilledBox = nextBoxToFill;
    wordFull = true;
  }
}

function deleteLetter() {
  if (lastFilledBox === 4) {
    setBoxValue("", lastFilledBox);
    lastFilledBox--;
    wordFull = false;
  } else if (lastFilledBox < 4 && lastFilledBox > 0) {
    setBoxValue("", lastFilledBox);
    lastFilledBox--;
    nextBoxToFill--;
    wordFull = false;
  } else if (lastFilledBox === 0) {
    setBoxValue("", lastFilledBox);
    lastFilledBox = -1;
    nextBoxToFill = 0;
  } else if (lastFilledBox < 0) return;
}

function setBoxValue(letter, boxNumber) {
  const boxes = document.querySelector(`.row${currentRow}`).children;
  boxes[boxNumber].value = letter.toUpperCase();
}

async function getWordOfTheDay() {
  let word = await fetch("https://words.dev-apis.com/word-of-the-day");
  let processedWord = await word.json();
  return processedWord.word;
}

async function validateWord() {
  let correctWord = await getWordOfTheDay();
  let row = document.querySelector(`.row${currentRow}`);
  if (wordFull === true) {
    loading();
    let wordToCheck = getWordFromScreen().toLowerCase();
    dataToSend = { word: wordToCheck };
    let result = await fetch("https://words.dev-apis.com/validate-word", {
      method: "POST",
      body: JSON.stringify(dataToSend),
    });
    let validation = await result.json();
    if (validation.validWord === true) {
      if (currentRow < 6) {
        showMistakes(wordToCheck, correctWord);
      } else {
        alert("you lose!");
      }
      nextRow();
    } else {
      row.classList.add("wrong");
    }
    loading();
    await sleep(2000);
    row.classList.remove("wrong");
  }
}

function getWordFromScreen() {
  const boxes = document.querySelector(`.row${currentRow}`).children;
  let wordToCheck = "";
  for (let i = 0; i < boxes.length; i++) {
    wordToCheck += boxes[i].value;
  }
  return wordToCheck;
}

function showMistakes(guess, correctWord) {
  let aparitions = [];
  let boxesOnCurrentRow = document.querySelector(`.row${currentRow}`).children;
  for (let j = 0; j < correctWord.length; j++) {
    let char = guess.charAt(j);
    let count = 0;
    let position = correctWord.indexOf(char);

    if (!aparitions.find((el) => el.letter === char)) {
      while (position !== -1) {
        count++;
        position = correctWord.indexOf(char, position + 1);
      }

      aparitions.push({
        letter: char,
        numberofAparitions: count,
      });
    }
  }

  let rightGuesses = 0;
  aparitions.forEach((el) => {
    if (el.numberofAparitions > 0) {
      let positionOfCurrentChar = guess.indexOf(el.letter);
      while (el.numberofAparitions > 0 && positionOfCurrentChar >= 0) {
        if (
          guess.charAt(positionOfCurrentChar) ===
          correctWord.charAt(positionOfCurrentChar)
        ) {
          boxesOnCurrentRow[positionOfCurrentChar].style.background = "green";
          rightGuesses++;
          positionOfCurrentChar = guess.indexOf(
            el.letter,
            positionOfCurrentChar + 1
          );
          el.numberofAparitions--;
        } else if (correctWord.includes(guess.charAt(positionOfCurrentChar))) {
          boxesOnCurrentRow[positionOfCurrentChar].style.background =
            "goldenrod";
          positionOfCurrentChar = guess.indexOf(
            el.letter,
            positionOfCurrentChar + 1
          );
          el.numberofAparitions--;
        }
      }
    }
  });

  if (rightGuesses === 5) {
    alert("You won");
  }
}

function nextRow() {
  currentRow += 1;
  nextBoxToFill = 0;
  lastFilledBox = -1;
  wordFull = false;
  word = "";
}

function loading() {
  const container = document.querySelector(".loadingContainer");
  if (isLoading === true) {
    container.style.display = "initial";
    isLoading = false;
  } else {
    container.style.display = "none";
    isLoading = true;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
