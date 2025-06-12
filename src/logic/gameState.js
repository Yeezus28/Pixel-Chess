// gameState.js

import { initialBoard } from './initialBoard.js';

export const initialGameState = {
  board: initialBoard,
  turn: 'white',
  validMoves: [],
  enPassantTarget: null,
  promotion: null,
  hasKingsMoved: { w: false, b: false },
  hasRooksMoved: {
    w: { left: false, right: false },
    b: { left: false, right: false },
  },
  check: false,
  checkmate: false,
  stalemate: false,
  drawByRepetition: false,
  timer: {
    white: 0,
    black: 0,
    increment: 0,
    startTime: null,
    elapsedTime: 0,
  },
  gameOver: false,
  gameResult: { winner: null, reason: null },
};
