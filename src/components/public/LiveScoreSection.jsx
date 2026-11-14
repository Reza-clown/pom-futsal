import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import "../../styles/LiveScoreSection.css"

function LiveScoreSection() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchLiveMatches()

    // Supabase Realtime — subscribe perubahan skor
    const channel = supabase
      .channel("live-score-public")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "matches" },
        () => fetchLiveMatches()
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  async function fetchLiveMatches() {
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
      .eq("status", "live")
      .order("scheduled_at", { ascending: true })

    if (error) {
      console.error("Gagal memuat live score:", error)
      setError("Live score gagal dimuat. Silakan coba lagi nanti.")
    } else {
      setMatches(data || [])
      setError("")
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <section className="live-score" id="live-score">
        <div className="live-score-container">
          <div className="section-heading">
            <span>PERTANDINGAN</span>
            <h2>Live Score</h2>
          </div>
          <div className="loading-spinner">
            <div className="spinner"></div>
            <span>Memuat data...</span>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="live-score" id="live-score">
      <div className="live-score-container">

        <div className="section-heading">
          <span>PERTANDINGAN</span>
          <h2>Live Score</h2>
          <p>
            Pantau pertandingan POM Futsal secara langsung.
          </p>
        </div>

        {error ? (
          <div className="error-state" role="alert">{error}</div>
        ) : matches.length === 0 ? (
          <div className="match-card">
            <div className="match-no-live">
              <p>Tidak ada pertandingan yang sedang berlangsung.</p>
              <span>Cek kembali saat pertandingan dimulai.</span>
            </div>
          </div>
        ) : (
          matches.map((match) => (
            <div key={match.id} className="match-card">

              <div className="match-header">
                <span className="match-label">{match.venue || "LAPANGAN"}</span>
                <span className="live-status">● LIVE</span>
              </div>

              <div className="match-content">

                <div className="team">
                  <div className="team-logo team-a">
                    {match.home_team?.name?.charAt(0) || "?"}
                  </div>
                  <h3>{match.home_team?.name || "-"}</h3>
                </div>

                <div className="match-score">
                  <h2>{match.home_score ?? 0} - {match.away_score ?? 0}</h2>
                  <p>Sedang Berlangsung</p>
                </div>

                <div className="team">
                  <div className="team-logo team-b">
                    {match.away_team?.name?.charAt(0) || "?"}
                  </div>
                  <h3>{match.away_team?.name || "-"}</h3>
                </div>

              </div>

              <div className="match-footer">
                <span>Live dari database</span>
                <a href="#jadwal">Lihat Jadwal →</a>
              </div>

            </div>
          ))
        )}

      </div>
    </section>
  )
}

export default LiveScoreSection
