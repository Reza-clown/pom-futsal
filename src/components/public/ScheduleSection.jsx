import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import "../../styles/ScheduleSection.css"

function ScheduleSection() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMatches()
  }, [])

  async function fetchMatches() {
    const { data, error } = await supabase
      .from("matches")
      .select(`
        id,
        status,
        home_score,
        away_score,
        venue,
        scheduled_at,
        home_team:teams!matches_home_team_id_fkey(id, name),
        away_team:teams!matches_away_team_id_fkey(id, name)
      `)
      .order("scheduled_at", { ascending: true })

    if (!error) setMatches(data || [])
    setLoading(false)
  }

  function formatTime(dateStr) {
    if (!dateStr) return "-"
    const d = new Date(dateStr)
    return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB"
  }

  function formatDate(dateStr) {
    if (!dateStr) return "-"
    const d = new Date(dateStr)
    return d.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  function getStatusLabel(status) {
    switch (status) {
      case "live": return "● Live"
      case "finished": return "Selesai"
      case "scheduled": return "Terjadwal"
      default: return status || "Terjadwal"
    }
  }

  function getStatusClass(status) {
    switch (status) {
      case "live": return "schedule-status status-live"
      case "finished": return "schedule-status status-finished"
      default: return "schedule-status status-scheduled"
    }
  }

  // Kelompokkan pertandingan berdasarkan tanggal
  const grouped = matches.reduce((acc, match) => {
    const date = match.scheduled_at
      ? new Date(match.scheduled_at).toDateString()
      : "Tanggal belum ditentukan"
    if (!acc[date]) acc[date] = []
    acc[date].push(match)
    return acc
  }, {})

  return (
    <section className="schedule" id="jadwal">
      <div className="schedule-container">

        <div className="section-heading">
          <span>AGENDA PERTANDINGAN</span>
          <h2>Jadwal Pertandingan</h2>
          <p>
            Lihat seluruh jadwal pertandingan POM Futsal.
          </p>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <span>Memuat jadwal...</span>
          </div>
        ) : matches.length === 0 ? (
          <div className="empty-state">
            <p>Belum ada jadwal pertandingan.</p>
          </div>
        ) : (
          Object.entries(grouped).map(([date, dayMatches]) => (
            <div key={date} className="matchday">

              <div className="matchday-header">
                <h3>{date === "Tanggal belum ditentukan" ? date : formatDate(dayMatches[0]?.scheduled_at)}</h3>
                <span>{dayMatches.length} Pertandingan</span>
              </div>

              {dayMatches.map((match) => (
                <div key={match.id} className="schedule-card">

                  <div className="schedule-time">
                    <span>{formatTime(match.scheduled_at)}</span>
                    <small>{match.venue || "Lapangan"}</small>
                  </div>

                  <div className="schedule-teams">
                    <span>{match.home_team?.name || "-"}</span>
                    {match.status === "finished" ? (
                      <strong className="schedule-score">
                        {match.home_score ?? 0} - {match.away_score ?? 0}
                      </strong>
                    ) : (
                      <strong>VS</strong>
                    )}
                    <span>{match.away_team?.name || "-"}</span>
                  </div>

                  <div className={getStatusClass(match.status)}>
                    {getStatusLabel(match.status)}
                  </div>

                </div>
              ))}

            </div>
          ))
        )}

      </div>
    </section>
  )
}

export default ScheduleSection
