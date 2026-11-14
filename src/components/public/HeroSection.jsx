import "../../styles/HeroSection.css"

function HeroSection() {
  return (
    <section className="hero" id="beranda">
      <div className="hero-container">

        <span className="hero-label">
          POM FUTSAL 2026
        </span>

        <h1>
          COMPETE. PLAY. WIN.
        </h1>

        <h2>
          Pekan Olahraga Mahasiswa
        </h2>

        <p>
          Turnamen Futsal Universitas Teknologi Ronggolawe
        </p>

        <div className="hero-info">
          <span>5 Tim</span>
          <span>10 Pertandingan</span>
          <span>Round Robin</span>
        </div>

        <a href="#live-score" className="hero-button">
          Lihat Live Score
        </a>

      </div>
    </section>
  )
}

export default HeroSection
