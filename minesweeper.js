const board = [];
let rows = 16;
let colums = 16;
let allMines = 40;
let minesCount = allMines;
const minesLocation = [];
let bomsSet = false;
let tilesClicked = 0;
let flagEnable = false;
let gameOver = false;
let firstClick = false;
let timer = null;
let startTime = 0;
let elapsedTime = 0;
let isRunning = false;

window.onload = function () {
  startGame();
};

function setMines() {
  while (minesLocation.length > 0) {
    minesLocation.pop();
  }

  for (let i = 0; i < allMines; ) {
    let r = Math.trunc(Math.random() * rows);
    let c = Math.trunc(Math.random() * colums);
    let location = `${r}-${c}`;
    let tile = document.getElementById(location);
    if (
      !minesLocation.includes(location) &&
      !tile.classList.contains("first-clicked")
    ) {
      minesLocation.push(location);
      //console.log(minesLocation[i]); //shows mines location
      i++;
    }
  }
  bomsSet = true;
}
function startGame() {
  document.getElementById("mines-count").innerText = minesCount;

  // making the board
  createBoard();

  //console.log(board); // shows the board
}

function createBoard() {
  for (let i = 0; i < rows; i++) {
    let row = [];
    for (let j = 0; j < colums; j++) {
      let tile = document.createElement("div");
      tile.id = i.toString() + "-" + j.toString();
      tile.addEventListener("click", clickTile);
      tile.addEventListener("contextmenu", addFlag);
      document.getElementById("board").append(tile);
      row.push(tile);
    }
    board.push(row);
  }
}

function addFlag(event) {
  event.preventDefault();
  let tile = this;
  if (gameOver) {
    return;
  }
  if (tile.innerText === "" && !tile.classList.contains("tile-clicked")) {
    tile.innerText = "🚩";
    minesCount--;
    document.getElementById("mines-count").textContent = minesCount;
    tile.classList.add("flagged");
  } else if (tile.innerText === "🚩") {
    minesCount++;
    document.getElementById("mines-count").textContent = minesCount;
    tile.innerText = "";
    tile.classList.remove("flagged");
  }
}

function clickTile() {
  if (
    gameOver ||
    this.classList.contains("tile-clicked") ||
    this.classList.contains("flagged")
  ) {
    return;
  }
  startTimer();
  let tile = this;
  if (!firstClick) {
    tile.classList.add("first-clicked");
    firstClick = true;
  }
  if (minesLocation.includes(tile.id)) {
    revealMines();
    return;
  }
  if (!bomsSet) {
    setMines();
  }
  let coords = tile.id.split("-");
  let r = parseInt(coords[0]);
  let c = parseInt(coords[1]);
  checkMine(r, c);
}

function revealMines() {
  if (!gameOver) {
    alert("GAME OVER");
  }
  stopTimer();
  gameOver = true;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < colums; j++) {
      let tile = board[i][j];
      if (minesLocation.includes(`${i}-${j}`) && tile.innerText != "🚩") {
        tile.innerText = "💣";
        tile.classList.add("detonated-bomb");
      }

      if (tile.innerText === "🚩" && minesLocation.includes(`${i}-${j}`)) {
        tile.classList.add("flagged-tile");
      }
      if (tile.innerText === "🚩" && !minesLocation.includes(`${i}-${j}`)) {
        tile.innerText = "❌";
      }
    }
  }
}

function checkMine(r, c) {
  if (r < 0 || r >= rows || c < 0 || c >= colums) {
    return;
  }
  if (board[r][c].classList.contains("flagged")) {
    return;
  }
  if (board[r][c].classList.contains("tile-clicked")) {
    return;
  }

  board[r][c].classList.add("tile-clicked");
  tilesClicked += 1;

  let minesFound = 0;

  // top 3
  minesFound += checkTile(r - 1, c - 1); //top left
  minesFound += checkTile(r - 1, c); //top center
  minesFound += checkTile(r - 1, c + 1); //top right

  // left and right
  minesFound += checkTile(r, c - 1); //left
  minesFound += checkTile(r, c + 1); //right

  // top 3
  minesFound += checkTile(r + 1, c - 1); //bot left
  minesFound += checkTile(r + 1, c); //bot center
  minesFound += checkTile(r + 1, c + 1); //bot right
  if (minesFound > 0) {
    board[r][c].innerText = minesFound;
    board[r][c].classList.add(`x${minesFound}`);
  } else {
    // top 3
    checkMine(r - 1, c - 1);
    checkMine(r - 1, c);
    checkMine(r - 1, c + 1);

    // left and right
    checkMine(r, c - 1);
    checkMine(r, c + 1);

    checkMine(r + 1, c - 1);
    checkMine(r + 1, c);
    checkMine(r + 1, c + 1);
  }

  if (tilesClicked === rows * colums - allMines) {
    document.getElementById("mines-count").innerText = "Cleared";
    gameOver = true;
    stopTimer();
  }
}

function checkTile(r, c) {
  if (r < 0 || r >= rows || c < 0 || c >= colums) {
    return 0;
  }

  if (minesLocation.includes(`${r}-${c}`)) {
    return 1;
  }
  return 0;
}

document.getElementById("reset-button").addEventListener("click", resetGame);

function resetGame() {
  gameOver = false;
  firstClick = false;
  resetTimer();
  // set the mines counter to original
  minesCount = allMines;
  document.getElementById("mines-count").textContent = minesCount;

  // remove all mines
  for (let i = 0; i < allMines; i++) {
    minesLocation.pop();
  }

  // set every tile to default
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < colums; j++) {
      let tile = document.getElementById(`${i}-${j}`);
      tile.innerText = "";
      tile.className = "";
    }
  }
  tilesClicked = 0;
  bomsSet = false;
}

document.getElementById("easy").addEventListener("click", setMode);
document.getElementById("medium").addEventListener("click", setMode);
document.getElementById("hard").addEventListener("click", setMode);

function setMode() {
  let boardWidth,
    boardHeight,
    mines,
    col,
    row,
    tileWidth,
    tileHeight,
    tileFontSize;

  if (this.id === "easy") {
    boardWidth = "600px";
    boardHeight = "600px";
    mines = 9;
    col = 10;
    row = 10;
    tileWidth = "58px";
    tileHeight = "58px";
    tileFontSize = "30px";
  } else if (this.id === "medium") {
    boardWidth = "720px";
    boardHeight = "720px";
    mines = 40;
    col = 16;
    row = 16;
    tileWidth = "43px";
    tileHeight = "43px";
    tileFontSize = "25px";
  } else if (this.id === "hard") {
    boardWidth = "1350px";
    boardHeight = "720px";
    mines = 100;
    col = 30;
    row = 16;
    tileWidth = "43px";
    tileHeight = "43px";
    tileFontSize = "20px";
  }

  //change board size
  document.getElementById("board").style.width = boardWidth;
  document.getElementById("board").style.height = boardHeight;

  // remove every tile
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < colums; c++) {
      document.getElementById(`${r}-${c}`).remove();
    }
  }
  // empty the boards array
  while (board.length > 0) {
    board.pop();
  }

  // set the new board

  allMines = mines;
  minesCount = allMines;
  colums = col;
  rows = row;
  bomsSet = false;
  gameOver = false;
  tilesClicked = 0;
  firstClick = false;
  for (let i = 0; i < allMines; i++) {
    minesLocation.pop();
  }
  startGame();
  resetTimer();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < colums; c++) {
      document.getElementById(`${r}-${c}`).style.width = tileWidth;
      document.getElementById(`${r}-${c}`).style.height = tileHeight;
      document.getElementById(`${r}-${c}`).style.fontSize = tileFontSize;
    }
  }
}

function startTimer() {
  if (isRunning) {
    return;
  }
  startTime = Date.now() - elapsedTime;
  timer = setInterval(update, 10);
  isRunning = true;
}

function update() {
  const currentTime = Date.now();
  elapsedTime = currentTime - startTime;

  let minutes = Math.floor((elapsedTime / (1000 * 60)) % 60);
  let seconds = Math.floor((elapsedTime / 1000) % 60);
  let milliseconds = Math.floor((elapsedTime % 1000) / 10);

  minutes = String(minutes).padStart(2, "0");
  seconds = String(seconds).padStart(2, "0");
  milliseconds = String(milliseconds).padStart(2, "0");

  document.getElementById(
    "timer"
  ).innerText = `${minutes}:${seconds}:${milliseconds}`;
}

function stopTimer() {
  if (isRunning) {
    clearInterval(timer);
    elapsedTime = Date.now() - startTime;
    isRunning = false;
  }
}
function resetTimer() {
  clearInterval(timer);
  startTime = 0;
  elapsedTime = 0;
  isRunning = false;
  document.getElementById("timer").innerText = "00:00:00";
}
