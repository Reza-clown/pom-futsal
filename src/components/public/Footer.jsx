import "../../styles/Footer.css"

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Identitas */}
        <div className="footer-brand">
          <h3>POM FUTSAL</h3>

          <p>
            Pekan Olahraga Mahasiswa
            Universitas Teknologi Ronggolawe.
          </p>
        </div>

        {/* Navigasi */}
        <div className="footer-navigation">
          <h4>Navigasi</h4>

          <a href="#beranda">Beranda</a>
          <a href="#live-score">Live Score</a>
          <a href="#klasemen">Klasemen</a>
          <a href="#jadwal">Jadwal</a>
        </div>

        {/* Informasi */}
        <div className="footer-information">
          <h4>Informasi</h4>

          <p>Pekan Olahraga Mahasiswa</p>
          <p>Universitas Teknologi Ronggolawe</p>
          <p>UKM Olahraga</p>
          <p>Turnamen Futsal</p>
        </div>

      </div>

      {/* Copyright */}
      <div className="footer-bottom">
        <p>
          © 2026 POM Futsal. UKM Olahraga.
        </p>
      </div>
    </footer>
  )
}

export default Footer
