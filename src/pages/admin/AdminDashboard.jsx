import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import { formatJakartaDateTime } from "../../lib/dateTime"
import "../../styles/AdminDashboard.css"

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalTeams: 0,
    totalMatches: 0,
    liveMatches: 0,
    finishedMatches: 0,
    scheduledMatches: 0,
  })
  const [recentMatches, setRecentMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    const [teamsRes, matchesRes] = await Promise.all([
      supabase.from("teams").select("id", { count: "exact" }),
      supabase.from("matches").select(`
        id, status, scheduled_at, home_score, away_score,
        home_team:teams!matches_home_team_id_fkey(name),
        away_team:teams!matches_away_team_id_fkey(name)
      `).order("scheduled_at", { ascending: false }),
    ])

    const matches = matchesRes.data || []
    const totalTeams = teamsRes.count || 0
    const totalMatches = matches.length

    setStats({
      totalTeams,
      totalMatches,
      liveMatches: matches.filter((m) => m.status === "live").length,
      finishedMatches: matches.filter((m) => m.status === "finished").length,
      scheduledMatches: matches.filter((m) => m.status === "scheduled").length,
    })

    setRecentMatches(matches.slice(0, 5))
    setLoading(false)
  }

  function getStatusBadge(status) {
    switch (status) {
      case "live": return <span className="badge badge-live">● Live</span>
      case "finished": return <span className="badge badge-finished">Selesai</span>
      default: return <span className="badge badge-scheduled">Terjadwal</span>
    }
  }

  function formatDateTime(dateStr) {
    return formatJakartaDateTime(dateStr, {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    })
  }

  const statCards = [
    { label: "Total Tim", value: stats.totalTeams, color: "#2563eb" },
    { label: "Total Pertandingan", value: stats.totalMatches, color: "#7c3aed" },
    { label: "Pertandingan Live", value: stats.liveMatches, color: "#dc2626" },
    { label: "Pertandingan Selesai", value: stats.finishedMatches, color: "#16a34a" },
    { label: "Pertandingan Terjadwal", value: stats.scheduledMatches, color: "#d97706" },
  ]

  return (
    <div className="admin-dashboard">

      <div className="admin-header-bar">
        <div>
          <h2>Dashboard Admin</h2>
          <p>Pengelolaan POM Futsal</p>
        </div>
      </div>

      <div className="admin-content">

        <div className="admin-dashboard-welcome">
          <h2>Selamat Datang, Admin!</h2>
          <p>Kelola seluruh kebutuhan pertandingan POM Futsal melalui halaman admin.</p>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <span>Memuat data...</span>
          </div>
        ) : (
          <>
            {/* Kartu statistik */}
            <div className="admin-dashboard-cards">
              {statCards.map((card) => (
                <div key={card.label} className="admin-dashboard-card">
                  <span>{card.label}</span>
                  <h3 style={{ color: card.color }}>{card.value}</h3>
                </div>
              ))}
            </div>

            {/* Pertandingan terbaru */}
            {recentMatches.length > 0 && (
              <div className="admin-recent-matches">
                <h3>Pertandingan Terbaru</h3>
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Tim Kandang</th>
                        <th>Skor</th>
                        <th>Tim Tandang</th>
                        <th>Waktu</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentMatches.map((m) => (
                        <tr key={m.id}>
                          <td>{m.home_team?.name || "-"}</td>
                          <td>
                            {m.status !== "scheduled"
                              ? `${m.home_score ?? 0} - ${m.away_score ?? 0}`
                              : "vs"}
                          </td>
                          <td>{m.away_team?.name || "-"}</td>
                          <td>{formatDateTime(m.scheduled_at)}</td>
                          <td>{getStatusBadge(m.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  )
}

export default AdminDashboard
