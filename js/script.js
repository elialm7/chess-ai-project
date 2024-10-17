var boardConfig = {
  position: 'start',
  draggable: true,
  onDrop: handleMove
};

var board1 = ChessBoard('board1', boardConfig);
var game = new Chess();


function makeEngineMove() {
  var bestMove = ChessEngine.getBestMove(10, game); 
  
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
    promotion: 'q' 
  });

  if (move === null) {
    return 'snapback'; 
  }

  updateMoveHistory(move);
  window.setTimeout(function () {
    makeEngineMove();
    checkGameStatus();
  }, 500);
}


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
      alert("JAQUE MATE, PERDISTE."); 
    } else {
      alert("JAQUE MATE, GANASTE"); 
    }
    resetGame();
  } else if (game.in_draw()) {
    alert("tablas! La partida termino en tablas ");
    resetGame();
  } else if (game.in_stalemate()) {
    alert("Ahogado, La partida termino en ahogado");
    resetGame();
  } else if (game.in_threefold_repetition()) {
    alert("Tablas, La partida termino en tablas");
    resetGame();
  } else if (game.insufficient_material()) {
    alert("Tablas, La partida termino por triple repeticion");
    resetGame();
  } 
}

function resetGame() {
  game.reset();
  board1.start();
  document.getElementById('moves-list').innerHTML = ''; // Clear move history
}

boardConfig.onSnapEnd = onSnapEnd;
