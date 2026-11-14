import { Link } from "react-router-dom"
import "../../styles/Navbar.css"
import BrandLogo from "../common/BrandLogo"

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">

        <div className="navbar-brand">
          <BrandLogo />

          <div className="brand-text">
            <h3>POM FUTSAL</h3>
            <p>UNIVERSITAS TEKNOLOGI RONGGOLAWE</p>
          </div>
        </div>

        <div className="navbar-menu">
          <Link to="/" className="navbar-link">Beranda</Link>
          <a href="#live-score">Live Score</a>
          <a href="#klasemen">Klasemen</a>
          <a href="#jadwal">Jadwal</a>
          <Link to="/admin/login" className="navbar-admin-link">Admin</Link>
        </div>

      </div>
    </nav>
  )
}

export default Navbar
