import { useState } from 'react';
import './App.css';
import ChessBoard from './components/ChessBoard/chessBoard.jsx';
import TopNavBar from './components/TopNavBar/topNavBar.jsx';

function App() {
  const [playerSide, setPlayerSide] = useState(null); // 'white', 'black', or null

  return (
    <div>
      <TopNavBar isSideBar={!!playerSide} />
      <div className="centered-container">
        {!playerSide ? (
          <><div className="button-container">
            <button className="menu-button" onClick={() => setPlayerSide('white')}>
              Play as White
            </button>
            <button className="menu-button" onClick={() => setPlayerSide('black')}>
              Play as Black
            </button>
          </div>
          </>
        ) : (
          <ChessBoard isPlayerBlack={playerSide === 'black'} />
        )}
      </div>
    </div>
  );
}

export default App;
