import React, { useState, useEffect } from 'react';
import './chessBoard.css';
import ChessPiece from '../ChessPiece/chessPiece.jsx';
import { getValidMoves } from '../../logic/pieceLogic.js';
import { initialGameState } from '../../logic/gameState.js';

export default function ChessBoard({ isPlayerBlack = false }) {
  const [gameState, setGameState] = useState(initialGameState);
  const { board, turn, selected, validMoves, enPassantTarget, hasKingsMoved, hasRooksMoved, promotion } = gameState;

  useEffect(() => {
    if (gameState.selected) {
      //console.log('Selected piece:', gameState.selected);
    } else {
      console.log('Board updated.', gameState);
    }
  }, [gameState]);

  function handleClick(rowIdx, colIdx) {
    if (promotion) return; // Prevent interaction during promotion

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
      const moves = getValidMoves(board, rowIdx, colIdx, enPassantTarget, hasKingsMoved, hasRooksMoved);
      setGameState(prev => ({
        ...prev,
        selected: { row: rowIdx, col: colIdx },
        validMoves: moves,
      }));
      return;
    }

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
      newBoard[rowIdx][colIdx] = currentPiece;
      newBoard[selected.row][selected.col] = null;

      // Special handling: en passant, castling, etc.
      const enPassant = updateEnPassantTarget(move, currentPiece, selected);
      const promotion = updatePromotionTarget(move, currentPiece);
      const kingOrRookMoved = checkForKingAndRookMoveFromOriginal(currentPiece, currentColor, selected, gameState);

      handleEnPassant(newBoard, move, currentColor);
      const didCastle = handleCastling(newBoard, move, currentPiece, selected, gameState);

      setGameState(prev => ({
        ...prev,
        board: newBoard,
        selected: null,
        validMoves: [],
        turn: prev.turn === 'white' ? 'black' : 'white',
        enPassantTarget: enPassant,
        promotion: promotion,
        hasKingsMoved: {
          ...prev.hasKingsMoved,
          ...(kingOrRookMoved?.kings ?? {}),
          ...(didCastle ? { [currentColor]: true } : {}),
        },
        hasRooksMoved: {
          ...prev.hasRooksMoved,
          [currentColor]: {
            ...prev.hasRooksMoved[currentColor],
            ...(kingOrRookMoved?.rooks?.[currentColor] ?? {}),
            ...(didCastle === 'kingSide' ? { right: true } : {}),
            ...(didCastle === 'queenSide' ? { left: true } : {}),
          },
        },
      }));
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
      {promotion && (
        <div className="promotion-menu">
          {['Q', 'R', 'B', 'N'].map(pieceType => (
            <div
              key={pieceType}
              className="promotion-piece"
              onClick={() => handlePromotionSelection(pieceType, gameState, setGameState)}
            >
              <ChessPiece type={`${promotion.color}${pieceType}`} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function findMove(moves, row, col) {
  return moves.find(move => move.row === row && move.col === col);
}

function updateEnPassantTarget(move, currentPiece, selected) {
  if (currentPiece[1] === 'P' && Math.abs(move.row - selected.row) === 2) {
    const nextRow = (move.row + selected.row) / 2;
    return { row: nextRow, col: selected.col };
  }
  return null;
}

function handleEnPassant(board, move, color) {
  if (move.enPassant) {
    const captureRow = color === 'w' ? move.row + 1 : move.row - 1;
    board[captureRow][move.col] = null;
  }
}

function checkForKingAndRookMoveFromOriginal(currentPiece, color, selected, prevState = { kings: {}, rooks: {} }) {
  if (!currentPiece || !selected) return prevState;

  const kings = { ...prevState.kings };
  const rooks = { ...prevState.rooks };

  if (isOriginalKingMove(currentPiece, color, selected)) {
    kings[color] = true;
  } else if (isOriginalRookMove(currentPiece, color, selected)) {
    const rookSide = selected.col === 0 ? 'left' : 'right';

    rooks[color] = {
      ...rooks[color],
      [rookSide]: true,
    };
  }

  return { kings, rooks };

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

function handleCastling(board, move, currentPiece, selected, gameState) {
  if (!move.castle) return false;

  const row = selected.row;
  const color = currentPiece[0];
  const hasKingsMoved = gameState.hasKingsMoved[color];
  const rookStatus = gameState.hasRooksMoved[color];

  // Prevent castling if the king or the involved rook has moved
  if (hasKingsMoved) return false;

  if (move.castle === 'kingSide') {
    if (rookStatus.right) return false;

    board[row][6] = currentPiece;
    board[row][4] = null;
    board[row][5] = board[row][7];
    board[row][7] = null;

    gameState.hasKingsMoved[color] = true;
    gameState.hasRooksMoved[color].right = true;

    return true;
  }

  if (move.castle === 'queenSide') {
    if (rookStatus.left) return false;

    board[row][2] = currentPiece;
    board[row][4] = null;
    board[row][3] = board[row][0];
    board[row][0] = null;

    // Update castling status
    gameState.hasKingsMoved[color] = true;
    gameState.hasRooksMoved[color].left = true;

    return true;
  }

  return false;
}

function updatePromotionTarget(move, currentPiece) {
  const promotionRow = currentPiece[0] === 'w' ? 0 : 7;
  if (currentPiece[1] === 'P' && move.row === promotionRow) {
    return { row: promotionRow, col: move.col, color: currentPiece[0] };
  }
  return null;
}

function handlePromotionSelection(pieceType, gameState, setGameState) {
  const newBoard = gameState.board.map(row => [...row]);
  newBoard[gameState.promotion.row][gameState.promotion.col] = `${gameState.promotion.color}${pieceType}`;

  setGameState(prev => ({
    ...prev,
    board: newBoard,
    promotion: null,
  }));
}

