// pieceLogic.js

export function getValidMoves(board, row, col, enPassantTarget = null, hasKingsMoved = {}, hasRooksMoved = {}) {
    const piece = board[row][col];
    if (!piece) return [];

    const type = piece[1];
    const color = piece[0];

    switch (type) {
        case 'P':
            return getPawnMoves(board, row, col, color, enPassantTarget);
        case 'R':
            return getRookMoves(board, row, col, color);
        case 'N':
            return getKnightMoves(board, row, col, color);
        case 'B':
            return getBishopMoves(board, row, col, color);
        case 'Q':
            return getQueenMoves(board, row, col, color);
        case 'K':
            return getKingMoves(board, row, col, color, hasKingsMoved, hasRooksMoved);
        default:
            return [];
    }
}


function getPawnMoves(board, row, col, color, enPassantTarget) {
    // Debugging output
    // console.log("getPawnMoves called for", row, col, color); console.log("enPassantTarget:", enPassantTarget);

    const direction = color === 'w' ? -1 : 1;
    const startRow = color === 'w' ? 6 : 1;
    const moves = [];

    const oneStep = row + direction;
    const twoStep = row + 2 * direction;

    // 1-square forward
    if (board[oneStep]?.[col] === null) {
        moves.push({ row: oneStep, col });

        // 2-square forward from starting row
        if (row === startRow && board[twoStep]?.[col] === null) {
            moves.push({ row: twoStep, col, doubleStep: true });
        }
    }

    // Diagonal captures
    for (const dc of [-1, 1]) {
        const newCol = col + dc;
        const target = board[oneStep]?.[newCol];
        if (target && target[0] !== color) {
            moves.push({ row: oneStep, col: newCol });
        }
    }

    // En passant capture
    if (enPassantTarget) {
        const enRow = row + direction;
        const enCol = enPassantTarget.col;
        if (enPassantTarget.row === enRow && Math.abs(enCol - col) === 1) {
            moves.push({ row: enRow, col: enCol, enPassant: true });
        }
    }

    return moves;
}

function getRookMoves(board, row, col, color) {
    const moves = [];
    const directions = [
        { dr: -1, dc: 0 }, // Up
        { dr: 1, dc: 0 },  // Down
        { dr: 0, dc: -1 }, // Left
        { dr: 0, dc: 1 }   // Right
    ];

    for (const { dr, dc } of directions) {
        let r = row + dr;
        let c = col + dc;

        while (r >= 0 && r < board.length && c >= 0 && c < board[r].length) {
            const target = board[r][c];
            if (target === null) {
                moves.push({ row: r, col: c });
            } else {
                if (target[0] !== color) {
                    moves.push({ row: r, col: c });
                }
                break; // Stop at first piece encountered
            }
            r += dr;
            c += dc;
        }
    }

    return moves;
}

function getKnightMoves(board, row, col, color) {
    const moves = [];
    const knightMoves = [
        { dr: -2, dc: -1 }, { dr: -2, dc: 1 },
        { dr: -1, dc: -2 }, { dr: -1, dc: 2 },
        { dr: 1, dc: -2 }, { dr: 1, dc: 2 },
        { dr: 2, dc: -1 }, { dr: 2, dc: 1 }
    ];

    for (const { dr, dc } of knightMoves) {
        const r = row + dr;
        const c = col + dc;

        if (r >= 0 && r < board.length && c >= 0 && c < board[r].length) {
            const target = board[r][c];
            if (target === null || target[0] !== color) {
                moves.push({ row: r, col: c });
            }
        }
    }

    return moves;
}

function getBishopMoves(board, row, col, color) {
    const moves = [];
    const directions = [
        { dr: -1, dc: -1 }, // Up-Left
        { dr: -1, dc: 1 },  // Up-Right
        { dr: 1, dc: -1 },  // Down-Left
        { dr: 1, dc: 1 }    // Down-Right
    ];

    for (const { dr, dc } of directions) {
        let r = row + dr;
        let c = col + dc;

        while (r >= 0 && r < board.length && c >= 0 && c < board[r].length) {
            const target = board[r][c];
            if (target === null) {
                moves.push({ row: r, col: c });
            } else {
                if (target[0] !== color) {
                    moves.push({ row: r, col: c });
                }
                break; // Stop at first piece encountered
            }
            r += dr;
            c += dc;
        }
    }

    return moves;
}

function getQueenMoves(board, row, col, color) {
    return [...getRookMoves(board, row, col, color), ...getBishopMoves(board, row, col, color)];
}

function getKingMoves(board, row, col, color, hasKingsMoved, hasRooksMoved) {

    const moves = [];
    const kingMoves = [
        { dr: -1, dc: -1 }, { dr: -1, dc: 0 }, { dr: -1, dc: 1 },
        { dr: 0, dc: -1 },                     { dr: 0, dc: 1 },
        { dr: 1, dc: -1 }, { dr: 1, dc: 0 }, { dr: 1, dc: 1 }
    ];

    for (const { dr, dc } of kingMoves) {
        const r = row + dr;
        const c = col + dc;

        if (r >= 0 && r < board.length && c >= 0 && c < board[r].length) {
            const target = board[r][c];
            if (target === null || target[0] !== color) {
                moves.push({ row: r, col: c });
            }
        }
    }

    // Castling logic
    const castlingRow = color === 'w' ? 7 : 0;

    if (!hasKingsMoved[color]) {
        // King-side castling (short)
        if (
            board[castlingRow][5] === null &&
            board[castlingRow][6] === null &&
            board[castlingRow][7] === color + 'R' &&
            !hasRooksMoved[color]?.right
        ) {
            moves.push({ row: castlingRow, col: 6, castle: 'kingSide' });
        }

        // Queen-side castling (long)
        if (
            board[castlingRow][1] === null &&
            board[castlingRow][2] === null &&
            board[castlingRow][3] === null &&
            board[castlingRow][0] === color + 'R' &&
            !hasRooksMoved[color]?.left
        ) {
            moves.push({ row: castlingRow, col: 2, castle: 'queenSide' });
        }
    }

    return moves;
}