import '../../colors.css';
import './TopNavBar.css';

export default function TopNavBar({ isSideBar }) {
  return (
    <nav className={`top-nav-bar ${isSideBar ? 'sidebar' : 'topbar'}`}>
      <h2>Pixel Chess</h2>
      <div className="nav-links">
        <a href="#home">Home</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>        
      </div>
    </nav>
  );
}
