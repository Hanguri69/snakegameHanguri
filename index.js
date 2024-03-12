const physicsFPS = 10;
const playerSizeAndSpeed = 30;
const maxHorizontal = 40;
const maxVertical = 20;
const edgePadding = 10;
const canvasWidth = edgePadding * 2 + playerSizeAndSpeed * maxHorizontal;
const canvasHeight = edgePadding * 2 + playerSizeAndSpeed * maxVertical;

const mainCanvas = document.querySelector("canvas");
mainCanvas.width = canvasWidth;
mainCanvas.height = canvasHeight;
const mainContext = mainCanvas.getContext("2d", { alpha: false });
mainContext.imageSmoothingEnabled = false;
const backgroundCanvas = document.createElement("canvas");
backgroundCanvas.width = canvasWidth;
backgroundCanvas.height = canvasHeight;
const backgroundContext = backgroundCanvas.getContext("2d", { alpha: false });
backgroundContext.imageSmoothingEnabled = false;

const allLocationsMatrix = getAllPlaceToSpawnFood();

const Directions = {
  Up: "up",
  Down: "down",
  Left: "left",
  Right: "right",
};

class Food {
  constructor(position) {
    this.position = position;
  }

  draw() {
    drawRoundedRectangle("red", this.position.x, this.position.y, 30);
  }
}

class Snake {
  constructor() {
    // const randomX = randomNumber(maxHorizontal) * playerSizeAndSpeed + edgePadding;
    // const randomY = randomNumber(maxVertical) * playerSizeAndSpeed + edgePadding;
    this.snakeBodies = [
      {
        position: {
          x: edgePadding,
          y: edgePadding,
        },
        goingDirection: Directions.Right,
      },
    ];
    this.canAddBody = false;
  }

  setCanFoodSpawnLocationStatus(index) {
    const snakeBody = this.snakeBodies[index];

    const horizontalIndex =
      (snakeBody.position.x - edgePadding) / playerSizeAndSpeed;
    const verticalIndex =
      (snakeBody.position.y - edgePadding) / playerSizeAndSpeed;

    if (horizontalIndex > maxHorizontal - 1 || verticalIndex > maxVertical - 1)
      return;

    const locationIndex = horizontalIndex + verticalIndex * maxHorizontal;

    if (0 <= locationIndex && locationIndex < maxHorizontal * maxVertical) {
      allLocationsMatrix[locationIndex].canSpawn = false;
    }
  }

  checkCollisionBetweenItself(index) {
    if (
      index > 0 &&
      this.snakeBodies[0].position.x + playerSizeAndSpeed >
        this.snakeBodies[index].position.x &&
      this.snakeBodies[0].position.x <
        this.snakeBodies[index].position.x + playerSizeAndSpeed &&
      this.snakeBodies[0].position.y <
        this.snakeBodies[index].position.y + playerSizeAndSpeed &&
      this.snakeBodies[0].position.y + playerSizeAndSpeed >
        this.snakeBodies[index].position.y
    ) {
      initGame();
    }
  }

  checkCollisionToWall() {
    if (
      this.snakeBodies[0].position.x <= 0 ||
      this.snakeBodies[0].position.x + playerSizeAndSpeed >= canvasWidth ||
      this.snakeBodies[0].position.y <= 0 ||
      this.snakeBodies[0].position.y + playerSizeAndSpeed >= canvasHeight
    ) {
      initGame();
    }
  }

  // most efficient and clean way until now inspired by Hangol's way
  updateGoingDirectionOfTails() {
    for (let index = this.snakeBodies.length - 1; index > 0; index -= 1) {
      this.snakeBodies[index].goingDirection =
        this.snakeBodies[index - 1].goingDirection;
    }
  }

  update() {
    if (this.canAddBody) this.addBody();

    for (let index = 0; index < this.snakeBodies.length; index++) {
      switch (this.snakeBodies[index].goingDirection) {
        case Directions.Right:
          this.snakeBodies[index].position.x += playerSizeAndSpeed;
          break;
        case Directions.Left:
          this.snakeBodies[index].position.x -= playerSizeAndSpeed;
          break;
        case Directions.Up:
          this.snakeBodies[index].position.y -= playerSizeAndSpeed;
          break;
        case Directions.Down:
          this.snakeBodies[index].position.y += playerSizeAndSpeed;
          break;
      }
      this.setCanFoodSpawnLocationStatus(index);
      this.checkCollisionBetweenItself(index);
    }

    this.checkCollisionToWall();

    this.updateGoingDirectionOfTails();
  }

  draw() {
    this.snakeBodies.forEach((snake) => {
      drawRoundedRectangle("green", snake.position.x, snake.position.y, 10);
    });
  }

  setDirection(direction) {
    if (this.snakeBodies[0].goingDirection != direction) {
      this.snakeBodies[0].goingDirection = direction;
    }
  }

  addBody() {
    this.snakeBodies.push({
      position: {
        x: this.snakeBodies[this.snakeBodies.length - 1].position.x,
        y: this.snakeBodies[this.snakeBodies.length - 1].position.y,
      },
      goingDirection:
        this.snakeBodies[this.snakeBodies.length - 1].goingDirection,
    });

    if (
      this.snakeBodies[this.snakeBodies.length - 1].goingDirection ==
      Directions.Up
    ) {
      this.snakeBodies[this.snakeBodies.length - 1].position.y +=
        playerSizeAndSpeed;
    } else if (
      this.snakeBodies[this.snakeBodies.length - 1].goingDirection ==
      Directions.Down
    ) {
      this.snakeBodies[this.snakeBodies.length - 1].position.y -=
        playerSizeAndSpeed;
    } else if (
      this.snakeBodies[this.snakeBodies.length - 1].goingDirection ==
      Directions.Left
    ) {
      this.snakeBodies[this.snakeBodies.length - 1].position.x +=
        playerSizeAndSpeed;
    } else if (
      this.snakeBodies[this.snakeBodies.length - 1].goingDirection ==
      Directions.Right
    ) {
      this.snakeBodies[this.snakeBodies.length - 1].position.x -=
        playerSizeAndSpeed;
    }

    this.canAddBody = false;
  }
}

let msPrevs = {};
function canRunLoop(fps, id) {
  if (!(id.toString() in msPrevs)) {
    msPrevs[id.toString()] = performance.now();
  }
  const msPerFrame = 1000 / fps;

  const msNow = performance.now();
  const msPassed = msNow - msPrevs[id.toString()];

  if (msPassed < msPerFrame) return false;

  const excessTime = msPassed % msPerFrame;
  msPrevs[id.toString()] = msNow - excessTime;

  return true;
}

function drawRoundedRectangle(color, posX, posY, borderRadius) {
  backgroundContext.beginPath();
  backgroundContext.fillStyle = color;
  backgroundContext.roundRect(
    posX,
    posY,
    playerSizeAndSpeed,
    playerSizeAndSpeed,
    borderRadius
  );
  backgroundContext.fill();
}

function randomNumber(to) {
  return Math.floor(Math.random() * to);
}

function drawBoard() {
  backgroundContext.lineWidth = 1;
  backgroundContext.strokeStyle = "rgba(0, 0, 0, 0.1)";
  for (var x = 0; x < canvasWidth - edgePadding * 2; x += playerSizeAndSpeed) {
    for (
      var y = 0;
      y < canvasHeight - edgePadding * 2;
      y += playerSizeAndSpeed
    ) {
      backgroundContext.strokeRect(
        x + edgePadding,
        y + edgePadding,
        playerSizeAndSpeed,
        playerSizeAndSpeed
      );
    }
  }
}

function drawBackground() {
  backgroundContext.fillStyle = "gray";
  backgroundContext.fillRect(
    0,
    0,
    backgroundCanvas.width,
    backgroundCanvas.height
  );

  backgroundContext.fillStyle = "white";
  backgroundContext.fillRect(
    edgePadding,
    edgePadding,
    backgroundCanvas.width - edgePadding * 2,
    backgroundCanvas.height - edgePadding * 2
  );
  backgroundContext.font = "20px Arial";
  backgroundContext.fillStyle = "black";
  backgroundContext.fillText(`Score: ${score}`, edgePadding, 25);

  backgroundContext.font = "20px Arial";
  backgroundContext.fillStyle = "black";
  backgroundContext.fillText(`High Score: ${highScore}`, edgePadding * 20, 30);
}

function configureSnakeDirectionByKey() {
  if (
    lastKeyPressed == "w" &&
    snake.snakeBodies[0].goingDirection != Directions.Down
  )
    snake.setDirection(Directions.Up);
  else if (
    lastKeyPressed == "a" &&
    snake.snakeBodies[0].goingDirection != Directions.Right
  )
    snake.setDirection(Directions.Left);
  else if (
    lastKeyPressed == "s" &&
    snake.snakeBodies[0].goingDirection != Directions.Up
  )
    snake.setDirection(Directions.Down);
  else if (
    lastKeyPressed == "d" &&
    snake.snakeBodies[0].goingDirection != Directions.Left
  )
    snake.setDirection(Directions.Right);
}

function getAllPlaceToSpawnFood() {
  let allLocationsMatrix = [];

  for (let i = 0; i < maxVertical; i++) {
    for (let j = 0; j < maxHorizontal; j++) {
      const posX = edgePadding + playerSizeAndSpeed * j;
      const posY = edgePadding + playerSizeAndSpeed * i;
      allLocationsMatrix.push({
        position: {
          x: posX,
          y: posY,
        },
        canSpawn: true,
      });
    }
  }

  return allLocationsMatrix;
}

function addFoodIfEmpty() {
  if (foods.length == 0) {
    const allPossiblePlaceToPutFood = allLocationsMatrix.filter(
      (place) => place.canSpawn
    );

    console.log(allPossiblePlaceToPutFood.length);

    if (allPossiblePlaceToPutFood.length == 0) {
      console.log("You won");
      initGame();
    } else {
      const placeToPutFood =
        allPossiblePlaceToPutFood[
          randomNumber(allPossiblePlaceToPutFood.length)
        ];
      foods.push(new Food(placeToPutFood.position));
    }
  }
}

function checkFoodCollision() {
  if (
    foods[0] &&
    snake.snakeBodies[0].position.x + playerSizeAndSpeed >
      foods[0].position.x &&
    snake.snakeBodies[0].position.x <
      foods[0].position.x + playerSizeAndSpeed &&
    snake.snakeBodies[0].position.y <
      foods[0].position.y + playerSizeAndSpeed &&
    snake.snakeBodies[0].position.y + playerSizeAndSpeed > foods[0].position.y
  ) {
    snake.canAddBody = true;
    foods.pop();
    score++;
    if (score > highScore) {
      highScore = score;
    }
  }
}

function animationLoop() {
  requestAnimationFrame(animationLoop);

  drawBackground();

  drawBoard();

  foods.forEach((food) => food.draw());
  snake.draw();

  mainContext.drawImage(backgroundCanvas, 0, 0);
}

function physicsLoop() {
  requestAnimationFrame(physicsLoop);

  if (!canRunLoop(physicsFPS, 0)) return;

  configureSnakeDirectionByKey();

  allLocationsMatrix.forEach((place) => (place.canSpawn = true));

  snake.update();

  addFoodIfEmpty();

  checkFoodCollision();
}

let lastKeyPressed = "";
let snake = new Snake();
let score = 0;
let highScore = 0;
let foods = [];

function initGame() {
  allLocationsMatrix.forEach((place) => (place.canSpawn = true));
  lastKeyPressed = "d";
  foods = [];
  score = 0;
  snake = new Snake();
  animationLoop();
  physicsLoop();
}

initGame();

document.addEventListener("keydown", (event) => {
  event.preventDefault();
  switch (event.key.toLowerCase()) {
    case "w":
    case "a":
    case "s":
    case "d":
      lastKeyPressed = event.key.toLowerCase();
      break;
  }
});
