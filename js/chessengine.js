// Chess Engine using Minimax with Alpha-Beta Pruning
var ChessEngine = (function() {
    var game = null;

    function evaluateBoard(board) {
        var totalEvaluation = 0;

  
        for (var i = 0; i < board.length; i++) {
            for (var j = 0; j < board[i].length; j++) {
                totalEvaluation += getPieceValue(board[i][j], i, j);
            }
        }
        totalEvaluation += evaluateKingSafety(board);     
      totalEvaluation += evaluatePieceActivity(board); 
       totalEvaluation += evaluateCentralControl(board); 
       //totalEvaluation += evaluatePieceDevelopment(board); 
       totalEvaluation += evaluateSpace(board); 
       totalEvaluation += checkNotLosingPieces(board);
      


        return totalEvaluation;
    }

    function checkNotLosingPieces(board) {
        var losingPiecePenalty = 0;
    
        // Check for each piece on the board
        for (var i = 0; i < board.length; i++) {
            for (var j = 0; j < board[i].length; j++) {
                var piece = board[i][j];
                if (piece) {
                    var possibleMoves = game.moves({ square: `${String.fromCharCode(97 + j)}${8 - i}`, verbose: true });
                    if (possibleMoves.length === 0) {
                        // If there are no possible moves, the piece is likely lost
                        losingPiecePenalty += getPieceValue(piece, i, j); // Penalize the piece's value
                    }
                }
            }
        }
    
        return -losingPiecePenalty; // Return negative penalty to decrease evaluation
    }

    function getPieceValue(piece, x, y) {
        if (piece === null) return 0;
        var getAbsoluteValue = function(piece) {
            if (piece.type === 'p') return 1;
            if (piece.type === 'r') return 5;
            if (piece.type === 'n' || piece.type === 'b') return 3;
            if (piece.type === 'q') return 9;
            if (piece.type === 'k') return 0;
            return 0;
        };
        var absoluteValue = getAbsoluteValue(piece);
        return piece.color === 'w' ? absoluteValue : -absoluteValue;
    }

    function evaluateKingSafety(board) {
        var whiteKingSafe = evaluateKingSafetyForColor(board, 'w');
        var blackKingSafe = evaluateKingSafetyForColor(board, 'b');
        return whiteKingSafe - blackKingSafe; // Positive for white's safety, negative for black's
    }

    function evaluateKingSafetyForColor(board, color) {
        var kingSafetyScore = 0;
        var kingSquare = findKingSquare(board, color);

        // Basic safety check: count attacking pieces around the king
        var attackingMoves = getAttackingMoves(kingSquare, board, color);
        kingSafetyScore += attackingMoves.length * 10; // Penalize for each attacking piece

        return -kingSafetyScore;
    }

    function findKingSquare(board, color) {
        for (var i = 0; i < board.length; i++) {
            for (var j = 0; j < board[i].length; j++) {
                var piece = board[i][j];
                if (piece && piece.type === 'k' && piece.color === color) {
                    return { x: j, y: i };
                }
            }
        }
        return null; // King not found (shouldn't happen)
    }

    function getAttackingMoves(kingSquare, board, color) {
        var attackingMoves = [];
        var opponentColor = color === 'w' ? 'b' : 'w';
        var possibleMoves = [];

        // Check all pieces of the opponent
        for (var i = 0; i < board.length; i++) {
            for (var j = 0; j < board[i].length; j++) {
                var piece = board[i][j];
                if (piece && piece.color === opponentColor) {
                    possibleMoves = game.moves({ square: `${String.fromCharCode(97 + j)}${8 - i}`, verbose: true });
                    attackingMoves.push(...possibleMoves);
                }
            }
        }
        return attackingMoves;
    }

    function evaluatePieceActivity(board) {
        var activityScore = 0;

        // Evaluate activity for each piece
        for (var i = 0; i < board.length; i++) {
            for (var j = 0; j < board[i].length; j++) {
                var piece = board[i][j];
                if (piece) {
                    activityScore += getPieceActivityScore(piece, i, j);
                }
            }
        }

        return activityScore;
    }

    function getPieceActivityScore(piece, x, y) {
        var activityScore = 0;
        var pieceType = piece.type;

        // Each piece contributes differently to the activity score
        if (pieceType === 'p') {
            // Pawns are more active when advanced
            activityScore += (piece.color === 'w' ? y : 7 - y) * 1; // Score based on rank
        } else if (pieceType === 'r') {
            activityScore += 2; // Rooks are generally more active on open files
        } else if (pieceType === 'n') {
            activityScore += 0.5; // Knights have potential for activity in the center
        } else if (pieceType === 'b') {
            activityScore += 1; // Bishops can control diagonals
        } else if (pieceType === 'q') {
            activityScore += 3; // Queens are the most active piece
        }

        return piece.color === 'w' ? activityScore : -activityScore; // Reverse score for black pieces
    }

    function evaluateCentralControl(board) {
        var centralControlScore = 0;

        // Central squares are d4, d5, e4, e5
        var centralSquares = ['d4', 'd5', 'e4', 'e5'];

        centralSquares.forEach(function(square) {
            var piece = getPieceAtSquare(square, board);
            if (piece) {
                centralControlScore += piece.color === 'w' ? 1 : -1; // Positive for white controlling, negative for black
            }
        });

        return centralControlScore;
    }

    function getPieceAtSquare(square, board) {
        var file = square.charCodeAt(0) - 97; // Convert 'a' - 'h' to 0 - 7
        var rank = 8 - parseInt(square.charAt(1)); // Convert '1' - '8' to 7 - 0
        return board[rank][file];
    }

    function evaluateSpace(board) {
        var whiteSpaceScore = 0;
        var blackSpaceScore = 0;

        // Count pieces and their positions to evaluate space
        for (var i = 0; i < board.length; i++) {
            for (var j = 0; j < board[i].length; j++) {
                var piece = board[i][j];
                if (piece) {
                    if (piece.color === 'w') {
                        whiteSpaceScore += (7 - i); // Score based on how far back the piece is
                    } else {
                        blackSpaceScore += i; // Score based on how far forward the piece is
                    }
                }
            }
        }

        return whiteSpaceScore - blackSpaceScore; // Positive for white's space, negative for black's
    }

    function evaluatePieceDevelopment(board) {
        var developmentScore = 0;
        
        // Define starting positions for each piece type
        const startingPositions = {
            'p': [6, 1], // Pawns
            'r': [0, 7], // Rooks
            'n': [1, 6], // Knights
            'b': [2, 5], // Bishops
            'q': [3],    // Queens
            'k': [4]     // Kings
        };
    
        // Loop through the board and check piece development
        for (var i = 0; i < board.length; i++) {
            for (var j = 0; j < board[i].length; j++) {
                var piece = board[i][j];
                if (piece) {
                    developmentScore += getPieceDevelopmentScore(piece, i, j, startingPositions);
                }
            }
        }
    
        return developmentScore;
    }
    
    function getPieceDevelopmentScore(piece, x, y, startingPositions) {
        var score = 0;
    
        // Check if the piece has moved from its starting position
        if (piece.color === 'w') {
            if (piece.type === 'p' && y === 6) score += 1; // Pawns can move from 6 to 4 or 5
            if (piece.type === 'r' && (y === 0 || y === 7)) score += 0; // Rooks haven't moved
            if (piece.type === 'n' && (y === 1 || y === 6)) score += 0; // Knights haven't moved
            if (piece.type === 'b' && (y === 2 || y === 5)) score += 0; // Bishops haven't moved
            if (piece.type === 'q' && y === 3) score += 0; // Queen hasn't moved
            if (piece.type === 'k' && y === 4) score += 0; // King hasn't moved
        } else {
            if (piece.type === 'p' && y === 1) score += 1; // Pawns can move from 1 to 3 or 2
            if (piece.type === 'r' && (y === 0 || y === 7)) score += 0; // Rooks haven't moved
            if (piece.type === 'n' && (y === 1 || y === 6)) score += 0; // Knights haven't moved
            if (piece.type === 'b' && (y === 2 || y === 5)) score += 0; // Bishops haven't moved
            if (piece.type === 'q' && y === 3) score += 0; // Queen hasn't moved
            if (piece.type === 'k' && y === 4) score += 0; // King hasn't moved
        }
    
        return piece.color === 'w' ? score : -score; // Reverse score for black pieces
    }
    

    function minimax(depth, game, isMaximizingPlayer, alpha, beta) {
        if (depth === 0 || game.game_over()) {
            return evaluateBoard(game.board());
        }

        var possibleMoves = game.moves();

        if (isMaximizingPlayer) {
            var bestValue = -Infinity;
            for (var i = 0; i < possibleMoves.length; i++) {
                game.move(possibleMoves[i]);
                bestValue = Math.max(bestValue, minimax(depth - 1, game, false, alpha, beta));
                game.undo();
                alpha = Math.max(alpha, bestValue);
                if (beta <= alpha) break;
            }
            return bestValue;
        } else {
            var bestValue = Infinity;
            for (var i = 0; i < possibleMoves.length; i++) {
                game.move(possibleMoves[i]);
                bestValue = Math.min(bestValue, minimax(depth - 1, game, true, alpha, beta));
                game.undo();
                beta = Math.min(beta, bestValue);
                if (beta <= alpha) break;
            }
            return bestValue;
        }
    }

    function getBestMove(depth, gameInstance) {
        game = gameInstance;
        var possibleMoves = game.moves();
        var bestMove = null;
        var bestValue = -Infinity;

        for (var i = 0; i < possibleMoves.length; i++) {
            game.move(possibleMoves[i]);
            var boardValue = minimax(depth - 1, game, true, Infinity, -Infinity);
            console.log(`jugada: ${possibleMoves[i]}  eval: ${boardValue}`);
            game.undo();
            if (boardValue > bestValue) {
                bestValue = boardValue;
                bestMove = possibleMoves[i];
            }
           
        }
        return bestMove;
    }

    return {
        getBestMove: getBestMove
    };
})();
