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

    const { data, error: signInError } = await signIn(email, password)

    if (signInError) {
      setError("Email atau password salah.")
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
