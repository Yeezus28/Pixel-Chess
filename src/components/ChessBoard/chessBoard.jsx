import { useState } from 'react';
import { initialBoard } from '../../logic/initialBoard.js';
import './chessBoard.css';
import ChessPiece from '../ChessPiece/chessPiece.jsx';

export default function ChessBoard() {
  const [board, setBoard] = useState(initialBoard);
  const [selected, setSelected] = useState(null);

  function handleClick(rowIdx, colIdx) {
    const cell = board[rowIdx][colIdx];

    if (selected) {
      const newBoard = board.map(row => [...row]);

      // Move selected piece to new square
      newBoard[rowIdx][colIdx] = board[selected.row][selected.col];
      newBoard[selected.row][selected.col] = null;

      setBoard(newBoard);
      setSelected(null);
    } else {
      if (cell) setSelected({ row: rowIdx, col: colIdx });
    }
  }

  return (
    <div className="chessboard">
      {board.map((row, rowIdx) =>
        row.map((cell, colIdx) => {
          const isDark = (rowIdx + colIdx) % 2 === 1;
          const isSelected = selected?.row === rowIdx && selected?.col === colIdx;

          return (
            <div
              key={`${rowIdx}-${colIdx}`}
              className={`square ${isDark ? 'dark' : 'light'} ${isSelected ? 'selected' : ''}`}
              onClick={() => handleClick(rowIdx, colIdx)}
            >
              {cell && <ChessPiece type={cell} />}
            </div>
          );
        })
      )}
    </div>
  );
}
