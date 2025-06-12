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
      <div className="chessboard">
        {gameState.board.flatMap((boardRow, row) =>
          boardRow.map((cell, col) => {
            const isSelected = gameState.selected?.row === row && gameState.selected?.col === col;
            const isValidMove = gameState.validMoves.some(m => m.row === row && m.col === col);
            return (
              <div
                key={`${row}-${col}`}
                className={`square ${(row + col) % 2 === 0 ? 'light' : 'dark'} ${isSelected ? 'selected' : ''}`}
                onClick={() => handleCellClick(row, col)}
              >
                <div className="square-content">
                  {isValidMove && <div className="valid-move-dot" />}
                  {cell && <Piece type={cell} />}
                </div>
              </div>
            );
          })
        )}
      </div>
      {(gameState.promotion || gameState.gameOver) && (
        <div className="chess-overlay">
          {
            gameState.promotion && (
              <PromotionModal color={gameState.promotion.color} onSelect={handlePromotion} />
            )
          }
          {gameState.gameOver && (
            <div className="game-result">
              {gameState.gameResult.reason} {gameState.gameResult.winner && `- ${gameState.gameResult.winner} wins`}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChessBoard;
