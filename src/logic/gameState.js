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
};
