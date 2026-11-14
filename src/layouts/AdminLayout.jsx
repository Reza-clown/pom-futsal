import { Outlet } from "react-router-dom"
import AdminSidebar from "../components/admin/AdminSidebar"
import "../styles/AdminLayout.css"

function AdminLayout() {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-layout-main">
        <Outlet />
      </div>
    </div>
  )
}

export default AdminLayout
