import '../../colors.css';
import './promotionModal.css';
import ChessPiece from '../ChessPiece/chessPiece.jsx';

const PromotionModal = ({ color, onSelect }) => {
  const promotionPieces = ['Q', 'R', 'B', 'N'];

  return (
    <div className="promotion-menu">
      {promotionPieces.map(pieceType => (
        <div
          key={pieceType}
          className="promotion-piece"
          onClick={() => onSelect(pieceType)}
        >
          <ChessPiece type={`${color}${pieceType}`} />
        </div>
      ))}
    </div>
  );
};

export default PromotionModal;