import './chessBoard.css';
import { useState } from 'react';
import { GameEngine } from '../../logic/gamEngine.js';
import Piece from '../ChessPiece/chessPiece.jsx';
import PromotionModal from '../PromotionModal/promotionModal.jsx';

const ChessBoard = () => {
  const [gameState, setGameState] = useState(GameEngine.initializeGame());

  const handleCellClick = (row, col) => {
    const newState = GameEngine.handleClick(gameState, row, col);
    setGameState(newState);
  };

  const handlePromotion = (pieceType) => {
    const newState = GameEngine.handlePromotionSelection(gameState, pieceType);
    setGameState(newState);
  };

  return (
    <div>
      <div className="chess-board">
        {gameState.board.map((boardRow, row) => (
          <div className="board-row" key={row}>
            {boardRow.map((cell, col) => {
              const isSelected = gameState.selected?.row === row && gameState.selected?.col === col;
              const isValidMove = gameState.validMoves.some(m => m.row === row && m.col === col);
              return (
                <div
                  key={col}
                  className={`cell ${(row + col) % 2 === 0 ? 'light' : 'dark'} ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleCellClick(row, col)}
                >
                  {cell && <Piece type={cell} />}
                  {isValidMove && <div className="valid-move-marker" />}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {gameState.promotion && (
        <PromotionModal color={gameState.promotion.color} onSelect={handlePromotion} />
      )}

      {gameState.gameOver && (
        <div className="game-result">
          {gameState.gameResult.reason} {gameState.gameResult.winner && `- ${gameState.gameResult.winner} wins`}
        </div>
      )}
    </div>
  );
};

export default ChessBoard;
