import { useState } from 'react';
import './App.css';
import ChessBoard from './components/ChessBoard/chessBoard.jsx';
import TopNavBar from './components/TopNavBar/topNavBar.jsx';

function App() {
  const [showChess, setShowChess] = useState(false);
  
  return (
    <div>
      <TopNavBar isSideBar={showChess} />
      <div className="centered-container">
        {!showChess ? (
            <button className="menu-button" onClick={() => setShowChess(true)}>
              Play
            </button>
        ) : (
          <ChessBoard />
        )}
      </div>
    </div>
  );
}

export default App;

