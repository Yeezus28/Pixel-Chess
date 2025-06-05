import { useState } from 'react';
import './chessBoard.css';
import ChessPiece from '../ChessPiece/chessPiece.jsx';
import { getValidMoves } from '../../logic/pieceLogic.js';
import { initialGameState } from '../../logic/gameState.js';

export default function ChessBoard({ isPlayerBlack = false }) {
  const [gameState, setGameState] = useState(initialGameState);
  const { board, turn, selected, validMoves, enPassantTarget, hasKingsMoved, hasRooksMoved } = gameState;

  function handleClick(rowIdx, colIdx) {
    const cell = board[rowIdx][colIdx];
    const currentPiece = selected ? board[selected.row][selected.col] : null;
    const currentColor = turn === 'white' ? 'w' : 'b';

    // Clicked on currently selected piece: deselect
    if (selected && selected.row === rowIdx && selected.col === colIdx) {
      setGameState(prev => ({
        ...prev,
        selected: null,
        validMoves: [],
      }));
      return;
    }

    // Clicked on own piece: select it (regardless of previous selection)
    if (cell && cell[0] === currentColor) {
      const moves = getValidMoves(board, rowIdx, colIdx, enPassantTarget);
      setGameState(prev => ({
        ...prev,
        selected: { row: rowIdx, col: colIdx },
        validMoves: moves,
      }));
      return;
    }

    // Trying to move selected piece to a new location
    if (selected) {
      const move = findMove(validMoves, rowIdx, colIdx);

      if (!move) {
        setGameState(prev => ({
          ...prev,
          selected: null,
          validMoves: [],
        }));
        return;
      }

      const newBoard = board.map(row => [...row]);
      handleEnPassant(newBoard, move, currentColor);

      newBoard[rowIdx][colIdx] = currentPiece;
      newBoard[selected.row][selected.col] = null;

      const enPassant = updateEnPassantTarget(move, currentPiece, selected);

      const kingOrRookMoved = checkForKingAndRookMoveFromOriginal(currentPiece, currentColor, selected);

      setGameState(prev => ({
        ...prev,
        board: newBoard,
        selected: null,
        validMoves: [],
        turn: prev.turn === 'white' ? 'black' : 'white',
        enPassantTarget: enPassant,
        hasKingsMoved: {
          ...prev.hasKingsMoved,
          ...kingOrRookMoved?.kings || {},
        },
        hasRooksMoved: {
          ...prev.hasRooksMoved,
          ...kingOrRookMoved?.rooks || {},
        },
      }));

    console.log(gameState);
    
    }
  }

  const displayBoard = isPlayerBlack ? [...board].reverse() : board;

  return (
    <div className={`chessboard ${isPlayerBlack ? 'flipped' : ''}`}>
      {displayBoard.map((row, rowIdx) =>
        row.map((cell, colIdx) => {
          const actualRow = isPlayerBlack ? board.length - 1 - rowIdx : rowIdx;
          const actualCol = isPlayerBlack ? colIdx : colIdx;

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
                {cell && <ChessPiece type={cell} isSelected={isSelected} />}
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

function updateEnPassantTarget(move, currentPiece, selected) {
  // Only set en passant target if it's a 2-step pawn move
  if (
    currentPiece[1] === 'P' && // pawn
    Math.abs(move.row - selected.row) === 2
  ) {
    const enPassantRow = (move.row + selected.row) / 2;
    return { row: enPassantRow, col: selected.col }; // Square passed over
  }
  return null;
}

function handleEnPassant(board, move, color) {
  if (move.enPassant) {
    const captureRow = color === 'w' ? move.row + 1 : move.row - 1;
    board[captureRow][move.col] = null;
  }
}

function checkForKingAndRookMoveFromOriginal(currentPiece, color, selected) {
  if (!currentPiece || !selected) return null;

  const kings = {};
  const rooks = {};

  if (isOriginalKingMove(currentPiece, color, selected)) {
    console.log('King moved from original position');
    kings[color] = true;
  } else if (isOriginalRookMove(currentPiece, color, selected)) {
    console.log('Rook moved from original position');
    const rookSide = selected.col === 0 ? 'left' : 'right';
    rooks[color] = { left: false, right: false, ...{} };
    rooks[color][rookSide] = true;
  }

  return { kings, rooks };

  // Helpers
  function isOriginalKingMove(piece, color, selected) {
    const isKing = piece[1] === 'K';
    const kingRow = color === 'w' ? 7 : 0;
    return isKing && selected.row === kingRow && selected.col === 4;
  }

  function isOriginalRookMove(piece, color, selected) {
    const isRook = piece[1] === 'R';
    const rookRow = color === 'w' ? 7 : 0;
    const col = selected.col;
    const isStartingRookCol = col === 0 || col === 7;
    return isRook && selected.row === rookRow && isStartingRookCol;
  }
}

