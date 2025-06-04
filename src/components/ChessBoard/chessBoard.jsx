import { useState } from 'react';
import { initialBoard } from '../../logic/initialBoard.js';
import './chessBoard.css';
import ChessPiece from '../ChessPiece/chessPiece.jsx';

export default function ChessBoard() {
  const [board, setBoard] = useState(initialBoard);
  const [selected, setSelected] = useState(null);
  
  // Track whose turn it is
  const [turn, setTurn] = useState('white');

  function handleClick(rowIdx, colIdx) {
  const cell = board[rowIdx][colIdx];
  const currentPiece = selected ? board[selected.row][selected.col] : null;
  const currentColor = turn === 'white' ? 'w' : 'b';

  if (selected) {
    const targetPiece = board[rowIdx][colIdx];

    // Don't allow capturing your own piece
    if (targetPiece && targetPiece[0] === currentColor) {
      setSelected({ row: rowIdx, col: colIdx }); // select a different piece
      return;
    }

    const newBoard = board.map(row => [...row]);
    newBoard[rowIdx][colIdx] = currentPiece;
    newBoard[selected.row][selected.col] = null;

    setBoard(newBoard);
    setSelected(null);
    setTurn(turn === 'white' ? 'black' : 'white');
  } else {
    if (cell && cell[0] === currentColor) {
      setSelected({ row: rowIdx, col: colIdx });
    }
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
