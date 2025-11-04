import { Link } from 'react-router-dom';
import '../styles/NavBar.css';

export default function NavBar() {
  return (
    <nav className="navbar">
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/marketplace">Marketplace</Link>
      <Link to="/notifications">Notifications</Link>
    </nav>
  );
}
