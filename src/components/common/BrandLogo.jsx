const logoFiles = import.meta.glob(
  "../../assets/logo-ukm-olahraga.{png,jpg,jpeg,svg,webp}",
  { eager: true, query: "?url", import: "default" }
)

const logoSrc = Object.values(logoFiles)[0]

function BrandLogo() {
  return logoSrc ? (
    <img className="navbar-logo" src={logoSrc} alt="Logo UKM Olahraga" />
  ) : (
    <div className="navbar-logo-fallback" aria-label="Logo UKM Olahraga">
      UKM
    </div>
  )
}

export default BrandLogo
