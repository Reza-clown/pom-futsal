import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"

// Layouts
import MainLayout from "./layouts/MainLayout"
import AdminLayout from "./layouts/AdminLayout"

// Guards
import ProtectedRoute from "./components/common/ProtectedRoute"

// Public pages
import Home from "./pages/public/Home"

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin"
import AdminDashboard from "./pages/admin/AdminDashboard"
import ManageTeams from "./pages/admin/ManageTeams"
import ManageMatches from "./pages/admin/ManageMatches"
import ManageLiveScore from "./pages/admin/ManageLiveScore"

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* =====================
              HALAMAN PUBLIK
              ===================== */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
          </Route>

          {/* =====================
              HALAMAN ADMIN
              ===================== */}

          {/* Login — tidak butuh auth */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Route admin yang dilindungi */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/teams" element={<ManageTeams />} />
              <Route path="/admin/matches" element={<ManageMatches />} />
              <Route path="/admin/live-score" element={<ManageLiveScore />} />
            </Route>
          </Route>

          {/* Redirect lama /admin/dashboard → /admin */}
          <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />

          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
