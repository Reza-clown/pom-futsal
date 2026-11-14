import { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import BrandLogo from "../common/BrandLogo"

const menuItems = [
  { to: "/admin", label: "Dashboard", icon: "📊", end: true },
  { to: "/admin/teams", label: "Kelola Tim", icon: "👥" },
  { to: "/admin/matches", label: "Jadwal Pertandingan", icon: "📅" },
  { to: "/admin/live-score", label: "Live Score", icon: "🔴" },
]

function AdminSidebar() {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  async function handleLogout() {
    const { error } = await signOut()
    if (!error) navigate("/admin/login")
  }

  return (
    <>
      {/* Tombol toggle mobile */}
      <button
        className="admin-mobile-toggle"
        onClick={() => setOpen(true)}
        aria-label="Buka menu"
      >
        ☰
      </button>

      {/* Overlay saat mobile */}
      {open && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar${open ? " open" : ""}`}>

        <div className="admin-sidebar-brand">
          <BrandLogo />
          <div>
            <h2>POM Futsal</h2>
            <p>Admin Panel</p>
          </div>
        </div>

        <nav className="admin-sidebar-menu">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => isActive ? "active" : ""}
              onClick={() => setOpen(false)}
            >
              <span className="admin-sidebar-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          {user && (
            <div className="admin-sidebar-user">
              <span>{user.email}</span>
            </div>
          )}
          <button className="admin-sidebar-logout" onClick={handleLogout}>
            <span className="admin-sidebar-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>

      </aside>
    </>
  )
}

export default AdminSidebar
