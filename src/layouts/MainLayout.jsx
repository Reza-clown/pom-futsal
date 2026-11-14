import { Outlet } from "react-router-dom"
import Navbar from "../components/public/Navbar"
import Footer from "../components/public/Footer"

function MainLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

export default MainLayout
