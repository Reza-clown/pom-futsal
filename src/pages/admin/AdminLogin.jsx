import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import "../../styles/AdminLogin.css"

function AdminLogin() {
  const { signIn, isAdmin, loading, user } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Redirect jika sudah login sebagai admin
  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate("/admin", { replace: true })
    }
  }, [loading, user, isAdmin, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    const { data, error: signInError } = await signIn(email.trim(), password)

    if (signInError) {
      const errorCode = signInError.code

      console.error("Supabase Auth menolak login admin:", {
        code: errorCode,
        name: signInError.name,
        status: signInError.status,
        message: signInError.message,
      })

      if (errorCode === "invalid_credentials") {
        setError("Supabase Auth menolak email atau password. Pastikan email akun Auth tepat; jika perlu, reset password akun di Supabase.")
      } else if (errorCode === "email_not_confirmed") {
        setError("Email akun Supabase Auth belum dikonfirmasi.")
      } else if (errorCode === "over_request_rate_limit" || errorCode === "too_many_requests") {
        setError("Terlalu banyak percobaan login. Tunggu beberapa menit lalu coba lagi.")
      } else {
        const errorType = signInError.name || "AuthError"
        const errorDetail = signInError.message || "detail tidak tersedia"
        setError(`Login gagal (${errorType}${errorCode ? `, kode ${errorCode}` : ""}): ${errorDetail}`)
      }

      setSubmitting(false)
      return
    }

    // Cek role setelah login berhasil
    // AuthContext akan update isAdmin otomatis via onAuthStateChange
    // Navigasi ditangani oleh useEffect di atas
    if (data?.user) {
      // Beri waktu AuthContext update state
      setTimeout(() => {
        setSubmitting(false)
      }, 500)
    }
  }

  if (loading) {
    return (
      <div className="admin-login-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <span>Memeriksa sesi...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">

        <div className="admin-login-header">
          <div className="admin-login-logo">
            POM
          </div>

          <h1>Admin Login</h1>

          <p>
            POM Futsal
            <br />
            Universitas Teknologi Ronggolawe
          </p>
        </div>

        <form className="admin-login-form" onSubmit={handleSubmit}>

          {error && (
            <div className="admin-login-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Masukkan email admin"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          <button type="submit" disabled={submitting}>
            {submitting ? "Masuk..." : "Login"}
          </button>

        </form>

        <div className="admin-login-footer">
          POM Futsal Admin Panel
        </div>

      </div>
    </div>
  )
}

export default AdminLogin
