const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const port = 3333;

server.listen(port);

console.log(`Server running on port ${port}`);

let players = [];
let fruits = [];

const playerWidth = 15;
const playerHeight = 15;
const gameMovement = 15;
const fruitsInterval = 1000;
const canvasWidth = 600;
const canvasHeight = 300;

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function createFruit() {
  const fruit = {
    x: 0,
    y: 0
  };

  fruit.x =
    getRandomInt(0, Math.floor(canvasWidth / gameMovement)) * gameMovement;
  fruit.y =
    getRandomInt(0, Math.floor(canvasHeight / gameMovement)) * gameMovement;

  fruits.push(fruit);
}

io.on("connection", function(socket) {
  socket.emit("connected", socket.id);
  socket.emit("game_setup", {
    playerWidth,
    playerHeight,
    fruitsInterval,
    gameMovement,
    canvasHeight,
    canvasWidth
  });

  socket.on("new_player", function(player) {
    players.push(player);
    io.sockets.emit("connected_players", players);
  });

  socket.on("disconnect", function() {
    const playerIndex = players.indexOf(socket);
    players.splice(playerIndex, 1);
    io.sockets.emit("connected_players", players);
  });

  socket.on("move", function(data) {
    const player = players.find(el => el.id === data.playerId);
    if (player) {
      if (data.key === "ArrowUp") {
        if (player.y - gameMovement < 0) {
          return;
        }
        player.y = player.y - gameMovement;
      } else if (data.key === "ArrowDown") {
        if (player.y + gameMovement > canvasHeight - gameMovement) {
          return;
        }
        player.y = player.y + gameMovement;
      } else if (data.key === "ArrowRight") {
        if (player.x + gameMovement > canvasWidth - gameMovement) {
          return;
        }
        player.x = player.x + gameMovement;
      } else if (data.key === "ArrowLeft") {
        if (player.x - gameMovement < 0) {
          return;
        }
        player.x = player.x - gameMovement;
      }
      fruits.forEach((fruit, i) => {
        if (
          player.y >= fruit.y &&
          player.x >= fruit.x &&
          player.x - fruit.x < playerWidth &&
          player.y - fruit.y < playerHeight
        ) {
          player.score = player.score + 1;
          io.sockets.emit("players_scores", { players });
          fruits.splice(i, 1);
        }
      });

      io.sockets.emit("game_data", { players, fruits });
    }
  });

  setInterval(() => {
    if (fruits.length < (canvasHeight * canvasWidth) / 100) {
      createFruit();
      io.sockets.emit("new_fruits", fruits);
    }
  }, fruitsInterval);
});
