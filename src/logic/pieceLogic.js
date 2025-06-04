export function getValidMoves(board, row, col, enPassantTarget = null) {
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
        default:
            return [];
    }
}

function getPawnMoves(board, row, col, color, enPassantTarget) {
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
