import { initialBoard } from './initialBoard.js';

export const initialGameState = {
  board: initialBoard,
  turn: 'white',
  validMoves: [],
  enPassantTarget: null,
  hasKingsMoved: { white: false, black: false },
  hasRooksMoved: {
    white: { left: false, right: false },
    black: { left: false, right: false },
  },
};
