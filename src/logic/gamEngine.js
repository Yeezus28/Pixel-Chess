// /logic/GameEngine.js
import { getValidMoves } from './pieceLogic';
import { PositionHistory } from './positionHistory';
import { initialGameState } from './gameState';

export class GameEngine {
  static initializeGame() {
    return {
      ...initialGameState,
      positionHistory: new PositionHistory(),
    };
  }

  static handleClick(gameState, row, col) {
    const {
      board, turn, selected, validMoves,
      enPassantTarget, hasKingsMoved, hasRooksMoved,
      promotion, gameOver
    } = gameState;

    if (gameOver || promotion) return gameState;

    const cell = board[row][col];
    const currentPiece = selected ? board[selected.row][selected.col] : null;
    const currentColor = turn === 'white' ? 'w' : 'b';
    const opponentColor = currentColor === 'w' ? 'b' : 'w';

    // Clicked same piece: deselect
    if (selected && selected.row === row && selected.col === col) {
      return { ...gameState, selected: null, validMoves: [] };
    }

    // Clicked own piece: select
    if (cell && cell[0] === currentColor) {
      const moves = getValidMoves(board, row, col, enPassantTarget, hasKingsMoved, hasRooksMoved);
      const legalMoves = moves.filter(move => {
        const simulated = GameEngine.simulateMove(board, { row, col }, move);
        return !GameEngine.isKingInCheck(simulated, currentColor);
      });
      return { ...gameState, selected: { row, col }, validMoves: legalMoves };
    }

    if (selected) {
      const move = validMoves.find(m => m.row === row && m.col === col);
      if (!move) return { ...gameState, selected: null, validMoves: [] };

      const newBoard = board.map(r => [...r]);
      newBoard[row][col] = currentPiece;
      newBoard[selected.row][selected.col] = null;

      const enPassant = GameEngine.updateEnPassant(move, currentPiece, selected);
      const promotionTarget = GameEngine.updatePromotion(move, currentPiece);
      const movedFlags = GameEngine.updateMovedFlags(currentPiece, currentColor, selected, hasKingsMoved, hasRooksMoved);

      GameEngine.handleEnPassant(newBoard, move, currentColor);
      const didCastle = GameEngine.handleCastling(newBoard, move, currentPiece, selected, hasRooksMoved);

      const status = GameEngine.evaluateBoard(newBoard, opponentColor);
      const result = GameEngine.getResultMessage(status, currentColor);

      const newGameState = {
        board: newBoard,
        selected: null,
        validMoves: [],
        turn: turn === 'white' ? 'black' : 'white',
        enPassantTarget: enPassant,
        promotion: promotionTarget,
        hasKingsMoved: movedFlags.kings,
        hasRooksMoved: movedFlags.rooks,
        check: status.check,
        checkmate: status.checkmate,
        stalemate: status.stalemate,
        gameOver: status.checkmate || status.stalemate,
        gameResult: { winner: result.color, reason: result.reason },
        positionHistory: gameState.positionHistory,
      };

      // Update repetition history
      const count = gameState.positionHistory.addPosition(newGameState);
      if (count >= 3) {
        newGameState.drawByRepetition = true;
        newGameState.gameOver = true;
        newGameState.gameResult = { winner: null, reason: 'Draw by threefold repetition' };
      }

      return newGameState;
    }

    return gameState;
  }

  // Helpers

  static simulateMove(board, from, to) {
    const clone = board.map(r => [...r]);
    clone[to.row][to.col] = clone[from.row][from.col];
    clone[from.row][from.col] = null;
    return clone;
  }

  static isKingInCheck(board, color) {
    let kingPos = null;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece === `${color}K`) {
          kingPos = { row, col };
          break;
        }
      }
    }
    if (!kingPos) return false;
    const opponent = color === 'w' ? 'b' : 'w';
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece[0] === opponent) {
          const moves = getValidMoves(board, row, col, null, {}, {});
          if (moves.some(m => m.row === kingPos.row && m.col === kingPos.col)) return true;
        }
      }
    }
    return false;
  }

  static hasAnyLegalMoves(board, color) {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (!piece || piece[0] !== color) continue;
        const moves = getValidMoves(board, row, col, null, {}, {});
        for (const move of moves) {
          const simulated = GameEngine.simulateMove(board, { row, col }, move);
          if (!GameEngine.isKingInCheck(simulated, color)) return true;
        }
      }
    }
    return false;
  }

  static evaluateBoard(board, color) {
    const check = GameEngine.isKingInCheck(board, color);
    const legal = GameEngine.hasAnyLegalMoves(board, color);
    return {
      check, checkmate: check && !legal, stalemate: !check && !legal
    };
  }

  static getResultMessage(status, color) {
    if (status.checkmate) return { color: color === 'w' ? 'white' : 'black', reason: 'Checkmate' };
    if (status.stalemate) return { color: null, reason: 'Stalemate' };
    return { color: null, reason: '' };
  }

  static updateEnPassant(move, piece, selected) {
    if (piece[1] === 'P' && Math.abs(move.row - selected.row) === 2) {
      return { row: (move.row + selected.row) / 2, col: selected.col };
    }
    return null;
  }

  static handleEnPassant(board, move, color) {
    if (move.enPassant) {
      const captureRow = color === 'w' ? move.row + 1 : move.row - 1;
      board[captureRow][move.col] = null;
    }
  }

  static updatePromotion(move, piece) {
    const row = piece[0] === 'w' ? 0 : 7;
    if (piece[1] === 'P' && move.row === row) {
      return { row, col: move.col, color: piece[0] };
    }
    return null;
  }

  static updateMovedFlags(piece, color, selected, prevKings, prevRooks) {
    const kings = { ...prevKings };
    const rooks = { ...prevRooks };

    if (piece[1] === 'K') {
      kings[color] = true;
    } else if (piece[1] === 'R') {
      const side = selected.col === 0 ? 'left' : 'right';
      rooks[color] = { ...rooks[color], [side]: true };
    }

    return { kings, rooks };
  }

  static handleCastling(board, move, piece, selected, rookStatus) {
    if (!move.castle) return false;
    const row = selected.row;
    const color = piece[0];
    if (move.castle === 'kingSide' && !rookStatus[color].right) {
      board[row][6] = piece; board[row][4] = null;
      board[row][5] = board[row][7]; board[row][7] = null;
      return { kingMoved: true, rookMoved: { right: true } };
    }
    if (move.castle === 'queenSide' && !rookStatus[color].left) {
      board[row][2] = piece; board[row][4] = null;
      board[row][3] = board[row][0]; board[row][0] = null;
      return { kingMoved: true, rookMoved: { left: true } };
    }
    return false;
  }

  static handlePromotionSelection(gameState, pieceType) {
    const { board, promotion } = gameState;
    const newBoard = board.map(row => [...row]);
    newBoard[promotion.row][promotion.col] = `${promotion.color}${pieceType}`;

    const opponentColor = promotion.color === 'w' ? 'b' : 'w';
    const status = GameEngine.evaluateBoard(newBoard, opponentColor);
    const result = GameEngine.getResultMessage(status, promotion.color);

    return {
      ...gameState,
      board: newBoard,
      promotion: null,
      check: status.check,
      checkmate: status.checkmate,
      stalemate: status.stalemate,
      gameOver: status.checkmate || status.stalemate,
      gameResult: { winner: result.color, reason: result.reason }
    };
  }
}
