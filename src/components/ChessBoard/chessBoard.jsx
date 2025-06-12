import './chessBoard.css';
import { useState } from 'react';
import { ChessEngine } from '../../logic/chessEngine.js';
import Piece from '../ChessPiece/chessPiece.jsx';
import PromotionModal from '../PromotionModal/promotionModal.jsx';

const ChessBoard = (isPlayerBlack) => {
  const [gameState, setGameState] = useState(ChessEngine.initializeGame());

  const handleCellClick = (row, col) => {
    const newState = ChessEngine.handleClick(gameState, row, col);
    setGameState(newState);
  };

  const handlePromotion = (pieceType) => {
    const newState = ChessEngine.handlePromotionSelection(gameState, pieceType);
    setGameState(newState);
  };

  const boardToRender = isPlayerBlack 
    ? [...gameState.board].reverse() 
    : gameState.board;

  return (
    <div>
      <div className="chessboard">
      {boardToRender.flatMap((boardRow, rowIndex) =>
        boardRow.map((cell, colIndex) => {
          const actualRow = isPlayerBlack ? 7 - rowIndex : rowIndex;
          const actualCol = isPlayerBlack ? colIndex : colIndex;

          const isSelected = gameState.selected?.row === actualRow && gameState.selected?.col === actualCol;
          const isValidMove = gameState.validMoves.some(m => m.row === actualRow && m.col === actualCol);

          return (
            <div
              key={`${actualRow}-${actualCol}`}
              className={`square ${(actualRow + actualCol) % 2 === 0 ? 'light' : 'dark'} ${isSelected ? 'selected' : ''}`}
              onClick={() => handleCellClick(actualRow, actualCol)}
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
