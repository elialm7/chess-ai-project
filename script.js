var boardConfig = {
  position: 'start',
  draggable: true,
  onDrop: handleMove
};

var board1 = ChessBoard('board1', boardConfig);
var game = new Chess();

function makeRandomMove() {
  var possibleMoves = game.moves();

  // Exit if the game is over
  if (game.game_over() === true || possibleMoves.length === 0) return;

  // Pick a random move from possible moves
  var randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
  
  // Make the random move
  game.move(randomMove);
  
  // Update the board with the new position
  board1.position(game.fen());
  
  // Update the move history
  updateMoveHistory(game.history({ verbose: true }).slice(-1)[0]);
}
function makeEngineMove() {
  var bestMove = ChessEngine.getBestMove(3, game); // Set depth to 3 (adjust as needed)
  
  if (bestMove !== null) {
    game.move(bestMove);
    board1.position(game.fen());
    updateMoveHistory(game.history({ verbose: true }).slice(-1)[0]);
  }
}
function handleMove(source, target, piece, newPos, oldPos, orientation) {
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // always promote to queen for simplicity
  });

  if (move === null) {
    return 'snapback'; // illegal move
  }

  updateMoveHistory(move);
  window.setTimeout(function () {
    makeEngineMove();
    checkGameStatus();
  }, 500);
}

// Update the board position after the piece snap for castling, etc.
function onSnapEnd() {
  board1.position(game.fen());
}

function updateMoveHistory(move) {
  var movesList = document.getElementById('moves-list');
  var newMove = document.createElement('li');
  newMove.textContent = move.san;
  movesList.appendChild(newMove);
}

function checkGameStatus() {
  if (game.in_checkmate()) {
    if (game.turn() === 'w') {
      alert("Checkmate! You lost."); // Opponent (engine) made the checkmate
    } else {
      alert("Checkmate! You won!"); // User made the checkmate
    }
    resetGame();
  } else if (game.in_draw()) {
    alert("Draw! The game ended in a draw.");
    resetGame();
  } else if (game.in_stalemate()) {
    alert("Stalemate! The game ended in a stalemate.");
    resetGame();
  } else if (game.in_threefold_repetition()) {
    alert("Draw! Threefold repetition.");
    resetGame();
  } else if (game.insufficient_material()) {
    alert("Draw! Insufficient material to continue.");
    resetGame();
  } else if (game.in_check()) {
    alert("Check!");
  }
}

function resetGame() {
  game.reset();
  board1.start();
  document.getElementById('moves-list').innerHTML = ''; // Clear move history
}

boardConfig.onSnapEnd = onSnapEnd;
