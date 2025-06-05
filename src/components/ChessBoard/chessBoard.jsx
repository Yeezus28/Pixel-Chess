import { useState } from 'react';
import { initialBoard } from '../../logic/initialBoard.js';
import './chessBoard.css';
import ChessPiece from '../ChessPiece/chessPiece.jsx';
import { getValidMoves } from '../../logic/pieceLogic.js';

export default function ChessBoard({ isPlayerBlack = false }) {
  const [board, setBoard] = useState(initialBoard);
  const [selected, setSelected] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [enPassantTarget, setEnPassantTarget] = useState(null);
  const [turn, setTurn] = useState('white');

  function handleClick(rowIdx, colIdx) {
    const cell = board[rowIdx][colIdx];
    const currentPiece = selected ? board[selected.row][selected.col] : null;
    const currentColor = turn === 'white' ? 'w' : 'b';

    if (selected) {
      if (selected.row === rowIdx && selected.col === colIdx) {
        setSelected(null);
        setValidMoves([]);
        return;
      }

      const validMoves = getValidMoves(board, selected.row, selected.col);
      const move = findMove(validMoves, rowIdx, colIdx);

      if (!move) {
        setSelected(null);
        setValidMoves([]);
        return;
      }

      const targetPiece = board[rowIdx][colIdx];

      if (targetPiece && targetPiece[0] === currentColor) {
        setSelected({ row: rowIdx, col: colIdx });
        const moves = getValidMoves(board, rowIdx, colIdx, enPassantTarget);
        setValidMoves(moves);
        return;
      }

      const newBoard = board.map(row => [...row]);

      handleEnPassant(newBoard, move, currentColor);

      newBoard[rowIdx][colIdx] = currentPiece;
      newBoard[selected.row][selected.col] = null;

      const enPassant = updateEnPassantTarget(move, currentPiece, selected, currentColor);
      setEnPassantTarget(enPassant);

      setBoard(newBoard);
      setSelected(null);
      setValidMoves([]);
      setTurn(turn === 'white' ? 'black' : 'white');
    } else {
      if (cell && cell[0] === currentColor) {
        setSelected({ row: rowIdx, col: colIdx });
        const moves = getValidMoves(board, rowIdx, colIdx, enPassantTarget);
        setValidMoves(moves);
      }
    }
  }

  const displayBoard = isPlayerBlack ? [...board].reverse() : board;

  return (
    <div className={`chessboard ${isPlayerBlack ? 'flipped' : ''}`}>
      {displayBoard.map((row, rowIdx) =>
        row.map((cell, colIdx) => {
          const actualRow = isPlayerBlack ? board.length - 1 - rowIdx : rowIdx;
          const actualCol = isPlayerBlack ?colIdx : colIdx;

          const isDark = (actualRow + actualCol) % 2 === 1;
          const isSelected = selected?.row === actualRow && selected?.col === actualCol;

          return (
            <div
              key={`${actualRow}-${actualCol}`}
              className={`square ${isDark ? 'dark' : 'light'} ${isSelected ? 'selected' : ''}`}
              onClick={() => handleClick(actualRow, actualCol)}
            >
              <div className="square-content">
                {validMoves.some(move => move.row === actualRow && move.col === actualCol) && (
                  <div className="valid-move-dot"></div>
                )}
                {cell && <ChessPiece type={cell} />}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function findMove(moves, row, col) {
  return moves.find(move => move.row === row && move.col === col);
}

function updateEnPassantTarget(move, currentPiece, selected, color) {
  // Only set en passant target if it's a 2-step pawn move
  if (
    currentPiece[1] === 'p' && // pawn
    Math.abs(move.row - selected.row) === 2
  ) {
    const enPassantRow = (move.row + selected.row) / 2;
    return { row: enPassantRow, col: selected.col }; // Square passed over
  }
  return null;
}

function handleEnPassant(board, move, color) {
  if (move.enPassant) {
    console.log('Performing En Passant capture at', move.row, move.col);
    const captureRow = color === 'w' ? move.row + 1 : move.row - 1;
    board[captureRow][move.col] = null;
  }
}
