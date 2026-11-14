import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"

function ProtectedRoute() {
  const { user, isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-spinner" style={{ minHeight: "100vh" }}>
        <div className="spinner"></div>
        <span>Memeriksa autentikasi...</span>
      </div>
    )
  }

  // Belum login → redirect ke halaman login
  if (!user) {
    return <Navigate to="/admin/login" replace />
  }

  // Sudah login tapi bukan admin → tolak akses
  if (!isAdmin) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "16px",
        background: "#f8fafc",
        padding: "24px",
        textAlign: "center"
      }}>
        <div style={{ fontSize: "48px" }}>🚫</div>
        <h2 style={{ color: "#172554", fontSize: "22px" }}>Akses Ditolak</h2>
        <p style={{ color: "#64748b", fontSize: "14px", maxWidth: "400px" }}>
          Akun Anda tidak memiliki hak akses sebagai admin.
          Hubungi administrator untuk mendapatkan akses.
        </p>
        <a
          href="/"
          style={{
            padding: "10px 20px",
            backgroundColor: "#2563eb",
            color: "#fff",
            borderRadius: "8px",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: "600"
          }}
        >
          Kembali ke Beranda
        </a>
      </div>
    )
  }

  return <Outlet />
}

export default ProtectedRoute
