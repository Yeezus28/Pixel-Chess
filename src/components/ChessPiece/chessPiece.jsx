import './chessPiece.css';
import { pieceSpriteMap } from '../../logic/pieceMap';

export default function ChessPiece({ type, isSelected = false }) {
  const sprite = pieceSpriteMap[type];
  if (!sprite) return null;

  const backgroundUrl =
    sprite.color === 'black'
      ? '/ChessPiece/Chess-Black.png'
      : '/ChessPiece/Chess-White.png';

  const style = {
    '--row': sprite.row,
    '--col': sprite.col,
    '--sprite-url': `url(${backgroundUrl})`,
  };

  return <div className={`piece-sprite ${isSelected ? 'selected' : ''}`} style={style}></div>;
}
