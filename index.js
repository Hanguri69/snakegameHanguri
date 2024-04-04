const physicsFPS = 10; // Frames per second for physics updates
const playerSizeAndSpeed = 30; // Size and speed of the player
const maxHorizontal = 40; // Maximum horizontal positions
const maxVertical = 20; // Maximum vertical positions
const edgePadding = 10; // Padding around the canvas
const canvasWidth = edgePadding * 2 + playerSizeAndSpeed * maxHorizontal; // Width of the canvas
const canvasHeight = edgePadding * 2 + playerSizeAndSpeed * maxVertical; // Height of the canvas

// Setting up the main canvas and context
const mainCanvas = document.querySelector("canvas");
mainCanvas.width = canvasWidth;
mainCanvas.height = canvasHeight;
const mainContext = mainCanvas.getContext("2d", { alpha: false });
mainContext.imageSmoothingEnabled = false;

// Creating a background canvas and context
const backgroundCanvas = document.createElement("canvas");
backgroundCanvas.width = canvasWidth;
backgroundCanvas.height = canvasHeight;
const backgroundContext = backgroundCanvas.getContext("2d", { alpha: false });
backgroundContext.imageSmoothingEnabled = false;

// Matrix to keep track of available food spawn locations
const allLocationsMatrix = getAllPlaceToSpawnFood();

// Directions enumeration
const Directions = {
  Up: "up",
  Down: "down",
  Left: "left",
  Right: "right",
};

// Class representing Food objects
class Food {
  constructor(position) {
    this.position = position;
  }

  // Method to draw the food
  draw() {
    drawRoundedRectangle("red", this.position.x, this.position.y, 30);
  }
}

// Class representing the Snake
class Snake {
  constructor() {
    // Initializing the snake with its initial position and direction
    this.snakeBodies = [
      {
        position: {
          x: edgePadding,
          y: edgePadding,
        },
        goingDirection: Directions.Right,
      },
    ];
    this.canAddBody = false; // Flag to determine if a body part can be added
  }

  // Method to update the status of food spawn location
  setCanFoodSpawnLocationStatus(index) {
    const snakeBody = this.snakeBodies[index];

    // Calculating horizontal and vertical indices
    const horizontalIndex =
      (snakeBody.position.x - edgePadding) / playerSizeAndSpeed;
    const verticalIndex =
      (snakeBody.position.y - edgePadding) / playerSizeAndSpeed;

    // Checking if the snake is out of bounds
    if (horizontalIndex > maxHorizontal - 1 || verticalIndex > maxVertical - 1)
      return;

    // Calculating location index in the matrix
    const locationIndex = horizontalIndex + verticalIndex * maxHorizontal;

    // Updating the status of the location in the matrix
    if (0 <= locationIndex && locationIndex < maxHorizontal * maxVertical) {
      allLocationsMatrix[locationIndex].canSpawn = false;
    }
  }

  // Method to check collision between the snake's head and its body
  checkCollisionBetweenItself(index) {
    const headPosition = this.snakeBodies[0].position;
    const bodyPosition = this.snakeBodies[index].position;

    // Checking for collision in X and Y axes
    const collisionX =
      headPosition.x + playerSizeAndSpeed > bodyPosition.x &&
      headPosition.x < bodyPosition.x + playerSizeAndSpeed;
    const collisionY =
      headPosition.y < bodyPosition.y + playerSizeAndSpeed &&
      headPosition.y + playerSizeAndSpeed > bodyPosition.y;

    // If there is a collision and the body part is not the head, reset the game
    if (index > 0 && collisionX && collisionY) {
      initGame();
    }
  }

  // Method to check collision with the canvas walls
  checkCollisionToWall() {
    const headPosition = this.snakeBodies[0].position;
    const xCollision =
      headPosition.x <= 0 || headPosition.x + playerSizeAndSpeed >= canvasWidth;
    const yCollision =
      headPosition.y <= 0 ||
      headPosition.y + playerSizeAndSpeed >= canvasHeight;

    // If there is a collision with the wall, reset the game
    if (xCollision || yCollision) {
      initGame();
    }
  }

  // Method to update the direction of the snake's body parts
  updateGoingDirectionOfTails() {
    for (let index = this.snakeBodies.length - 1; index > 0; index -= 1) {
      this.snakeBodies[index].goingDirection =
        this.snakeBodies[index - 1].goingDirection;
    }
  }

  // Method to update the snake's position and status
  update() {
    if (this.canAddBody) this.addBody(); // If a body part can be added, add it

    // Iterate through each body part of the snake
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
      // Update the status of food spawn location and check collision with body parts
      this.setCanFoodSpawnLocationStatus(index);
      this.checkCollisionBetweenItself(index);
    }

    // Check collision with the canvas walls
    this.checkCollisionToWall();

    // Update the direction of the snake's body parts
    this.updateGoingDirectionOfTails();
  }

  // Method to draw the snake
  draw() {
    this.snakeBodies.forEach((snake) => {
      drawRoundedRectangle("green", snake.position.x, snake.position.y, 10);
    });
  }

  // Method to set the direction of the snake
  setDirection(direction) {
    if (this.snakeBodies[0].goingDirection != direction) {
      this.snakeBodies[0].goingDirection = direction;
    }
  }

  // Method to add a body part to the snake
  addBody() {
    this.snakeBodies.push({
      position: {
        x: this.snakeBodies[this.snakeBodies.length - 1].position.x,
        y: this.snakeBodies[this.snakeBodies.length - 1].position.y,
      },
      goingDirection:
        this.snakeBodies[this.snakeBodies.length - 1].goingDirection,
    });

    // Adjust the position of the new body part based on the direction
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

    this.canAddBody = false; // Reset the flag
  }
}

// Object to keep track of the previous milliseconds
let msPrevs = {};

// Function to determine if the loop can run based on FPS
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

// Function to draw a rounded rectangle
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

// Function to generate a random number
function randomNumber(to) {
  return Math.floor(Math.random() * to);
}

// Function to draw the game board
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

// Function to draw the background
function drawBackground() {
  // Drawing gray background
  backgroundContext.fillStyle = "gray";
  backgroundContext.fillRect(
    0,
    0,
    backgroundCanvas.width,
    backgroundCanvas.height
  );

  // Drawing white play area
  backgroundContext.fillStyle = "white";
  backgroundContext.fillRect(
    edgePadding,
    edgePadding,
    backgroundCanvas.width - edgePadding * 2,
    backgroundCanvas.height - edgePadding * 2
  );

  // Drawing score
  backgroundContext.font = "20px Arial";
  backgroundContext.fillStyle = "black";
  backgroundContext.fillText(`Score: ${score}`, edgePadding, 25);

  // Drawing high score
  backgroundContext.font = "20px Arial";
  backgroundContext.fillStyle = "black";
  backgroundContext.fillText(`High Score: ${highScore}`, edgePadding * 20, 30);
}

// Function to configure snake direction based on keyboard input
function configureSnakeDirectionByKey() {
  const directionMap = {
    w: Directions.Up,
    a: Directions.Left,
    s: Directions.Down,
    d: Directions.Right,
  };

  const currentDirection = snake.snakeBodies[0].goingDirection;
  const newDirection = directionMap[lastKeyPressed];

  // Setting the new direction if it's valid and different from the current direction
  if (newDirection && newDirection !== currentDirection) {
    snake.setDirection(newDirection);
  }
}

// Function to get all possible locations to spawn food
function getAllPlaceToSpawnFood() {
  let allLocationsMatrix = [];

  // Generating positions for all locations
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

// Function to add food if there's none on the board
function addFoodIfEmpty() {
  if (foods.length == 0) {
    // Filtering available locations to spawn food
    const allPossiblePlaceToPutFood = allLocationsMatrix.filter(
      (place) => place.canSpawn
    );

    // Checking if all locations are occupied
    if (allPossiblePlaceToPutFood.length == 0) {
      console.log("You won");
      initGame();
    } else {
      // Selecting a random available location to spawn food
      const placeToPutFood =
        allPossiblePlaceToPutFood[
          randomNumber(allPossiblePlaceToPutFood.length)
        ];
      foods.push(new Food(placeToPutFood.position));
    }
  }
}

// Function to check if there's a collision between the snake's head and food
function isFoodCollision(snakeHead, foodPosition) {
  return (
    snakeHead.x + playerSizeAndSpeed > foodPosition.x &&
    snakeHead.x < foodPosition.x + playerSizeAndSpeed &&
    snakeHead.y < foodPosition.y + playerSizeAndSpeed &&
    snakeHead.y + playerSizeAndSpeed > foodPosition.y
  );
}

// Function to handle collision with food
function handleFoodCollision() {
  snake.canAddBody = true; // Allowing addition of a body part
  foods.pop(); // Removing the consumed food
  score++; // Increasing score

  // Updating high score if necessary
  if (score > highScore) {
    highScore = score;
  }
}

// Function to check for collision with food
function checkFoodCollision() {
  const food = foods[0];
  const snakeHead = snake.snakeBodies[0].position;
  const foodPosition = food ? food.position : null;

  // If there's food and collision with snake's head, handle the collision
  if (food && isFoodCollision(snakeHead, foodPosition)) {
    handleFoodCollision();
  }
}

// Animation loop function
function animationLoop() {
  requestAnimationFrame(animationLoop); // Requesting next animation frame

  drawBackground(); // Drawing the background
  drawBoard(); // Drawing the game board

  // Drawing all the foods and the snake
  foods.forEach((food) => food.draw());
  snake.draw();

  mainContext.drawImage(backgroundCanvas, 0, 0); // Rendering the background canvas
}

// Physics loop function
function physicsLoop() {
  requestAnimationFrame(physicsLoop); // Requesting next animation frame

  if (!canRunLoop(physicsFPS, 0)) return; // Checking if the loop can run based on FPS

  configureSnakeDirectionByKey(); // Configuring snake direction based on keyboard input

  allLocationsMatrix.forEach((place) => (place.canSpawn = true)); // Resetting spawn locations

  snake.update(); // Updating snake position and status

  addFoodIfEmpty(); // Adding food if there's none on the board

  checkFoodCollision(); // Checking for collision with food
}

// Variables to keep track of game state
let lastKeyPressed = ""; // Last key pressed
let snake = new Snake(); // Snake object
let score = 0; // Current score
let highScore = 0; // High score
let foods = []; // Array to store food objects

// Function to initialize the game
function initGame() {
  allLocationsMatrix.forEach((place) => (place.canSpawn = true)); // Resetting spawn locations
  lastKeyPressed = "d"; // Setting default direction
  foods = []; // Clearing existing foods
  score = 0; // Resetting score
  snake = new Snake(); // Creating a new snake
  animationLoop(); // Starting animation loop
  physicsLoop(); // Starting physics loop
}

initGame(); // Initializing the game

// Event listener to handle keyboard input
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
