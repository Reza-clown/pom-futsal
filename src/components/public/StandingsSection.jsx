import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import "../../styles/StandingsSection.css"

function StandingsSection() {
  const [standings, setStandings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchStandings()
  }, [])

  async function fetchStandings() {
    // Ambil semua tim
    const { data: teams, error: teamsError } = await supabase
      .from("teams")
      .select("id, name")

    if (teamsError || !teams) {
      console.error("Gagal memuat tim untuk klasemen:", teamsError)
      setError("Klasemen gagal dimuat. Silakan coba lagi nanti.")
      setLoading(false)
      return
    }

    // Ambil semua pertandingan yang sudah selesai
    const { data: matches, error: matchesError } = await supabase
      .from("matches")
      .select(`
        home_team_id, away_team_id, home_score, away_score,
        home_yellow_cards, home_red_cards, away_yellow_cards, away_red_cards, status
      `)
      .eq("status", "finished")

    if (matchesError) {
      console.error("Gagal memuat hasil pertandingan untuk klasemen:", matchesError)
      setError("Klasemen gagal dimuat. Silakan coba lagi nanti.")
      setLoading(false)
      return
    }

    // Hitung statistik per tim
    const stats = {}
    teams.forEach((team) => {
      stats[team.id] = {
        id: team.id,
        name: team.name,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        cards: 0,
        points: 0,
      }
    })

    ;(matches || []).forEach((m) => {
      const h = stats[m.home_team_id]
      const a = stats[m.away_team_id]
      if (!h || !a) return

      const hs = m.home_score ?? 0
      const as_ = m.away_score ?? 0

      h.played++
      a.played++
      h.goalsFor += hs
      h.goalsAgainst += as_
      h.cards += (m.home_yellow_cards ?? 0) + 2 * (m.home_red_cards ?? 0)
      a.goalsFor += as_
      a.goalsAgainst += hs
      a.cards += (m.away_yellow_cards ?? 0) + 2 * (m.away_red_cards ?? 0)

      if (hs > as_) {
        h.won++; h.points += 3
        a.lost++
      } else if (hs < as_) {
        a.won++; a.points += 3
        h.lost++
      } else {
        h.drawn++; h.points += 1
        a.drawn++; a.points += 1
      }
    })

    const sorted = Object.values(stats).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      const gdA = a.goalsFor - a.goalsAgainst
      const gdB = b.goalsFor - b.goalsAgainst
      if (gdB !== gdA) return gdB - gdA
      return a.cards - b.cards
    })

    setStandings(sorted)
    setError("")
    setLoading(false)
  }

  const formatGoalDiff = (gf, ga) => {
    const diff = gf - ga
    if (diff > 0) return `+${diff}`
    return `${diff}`
  }

  return (
    <section className="standings" id="klasemen">
      <div className="standings-container">

        <div className="section-heading">
          <span>PERINGKAT TIM</span>
          <h2>Klasemen</h2>
          <p>
            Posisi tim berdasarkan hasil pertandingan.
          </p>
        </div>

        <div className="standings-card">
          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <span>Memuat data...</span>
            </div>
          ) : error ? (
            <div className="error-state" role="alert">{error}</div>
          ) : standings.length === 0 ? (
            <div className="empty-state">
              <p>Belum ada data pertandingan.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="standings-table">
                <thead>
                  <tr>
                    <th>Pos</th>
                    <th>Tim</th>
                    <th>Main</th>
                    <th>Menang</th>
                    <th>Seri</th>
                    <th>Kalah</th>
                    <th>SG</th>
                    <th>Kartu</th>
                    <th>Poin</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((team, idx) => (
                    <tr key={team.id}>
                      <td>{idx + 1}</td>
                      <td className="team-name">{team.name}</td>
                      <td>{team.played}</td>
                      <td>{team.won}</td>
                      <td>{team.drawn}</td>
                      <td>{team.lost}</td>
                      <td>{formatGoalDiff(team.goalsFor, team.goalsAgainst)}</td>
                      <td>{team.cards}</td>
                      <td className="points">{team.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="standings-note">
            <span>* SG = Selisih Gol</span>
            <span>* Kartu = kuning 1, merah 2</span>
            <span>Data dari database</span>
          </div>
        </div>

      </div>
    </section>
  )
}

export default StandingsSection
