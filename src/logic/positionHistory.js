// positionHistory.js

export class PositionHistory {
  constructor() {
    this.positions = new Map();  // key: position string, value: count
  }

  getPositionKey(gameState) {
    // Customize to include all info necessary for repetition
    return JSON.stringify({
      board: gameState.board,
      turn: gameState.turn,
      enPassantTarget: gameState.enPassantTarget,
      hasKingsMoved: gameState.hasKingsMoved,
      hasRooksMoved: gameState.hasRooksMoved
    });
  }

  addPosition(gameState) {
    const key = this.getPositionKey(gameState);
    const count = this.positions.get(key) || 0;
    this.positions.set(key, count + 1);
    return this.positions.get(key);
  }

  clear() {
    this.positions.clear();
  }
}
