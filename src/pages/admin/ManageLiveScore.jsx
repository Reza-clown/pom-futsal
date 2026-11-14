import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

const STATUS_OPTIONS = [
  { value: "scheduled", label: "Terjadwal" },
  { value: "live", label: "Live" },
  { value: "finished", label: "Selesai" },
]

function ManageLiveScore() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ home_score: 0, away_score: 0, status: "live" })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    fetchMatches()

    // Realtime subscription
    const channel = supabase
      .channel("admin-live-score")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "matches" },
        () => fetchMatches()
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  async function fetchMatches() {
    const { data, error } = await supabase
      .from("matches")
      .select(`
        id, status, home_score, away_score, venue, scheduled_at,
        home_team:teams!matches_home_team_id_fkey(id, name),
        away_team:teams!matches_away_team_id_fkey(id, name)
      `)
      .order("scheduled_at", { ascending: true })

    if (!error) setMatches(data || [])
    setLoading(false)
  }

  function startEdit(match) {
    setEditingId(match.id)
    setForm({
      home_score: match.home_score ?? 0,
      away_score: match.away_score ?? 0,
      status: match.status || "scheduled",
    })
    setError("")
  }

  function cancelEdit() {
    setEditingId(null)
    setError("")
  }

  async function saveScore(matchId) {
    setError("")
    setSaving(true)

    const { error } = await supabase
      .from("matches")
      .update({
        home_score: parseInt(form.home_score) || 0,
        away_score: parseInt(form.away_score) || 0,
        status: form.status,
      })
      .eq("id", matchId)

    if (error) {
      setError("Gagal menyimpan: " + error.message)
    } else {
      setEditingId(null)
      fetchMatches()
    }

    setSaving(false)
  }

  function formatDateTime(dateStr) {
    if (!dateStr) return "-"
    return new Date(dateStr).toLocaleString("id-ID", {
      day: "numeric", month: "short",
      hour: "2-digit", minute: "2-digit",
    })
  }

  const filtered = filter === "all"
    ? matches
    : matches.filter((m) => m.status === filter)

  return (
    <div>
      <div className="admin-header-bar">
        <div>
          <h2>Manajemen Live Score</h2>
          <p>Update skor pertandingan secara real-time</p>
        </div>
      </div>

      <div className="admin-content">

        <div className="page-header">
          <div className="page-header-left">
            <h1>Kelola Skor</h1>
            <p>Perubahan skor akan langsung tampil di halaman publik</p>
          </div>

          {/* Filter status */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {["all", "live", "scheduled", "finished"].map((f) => (
              <button
                key={f}
                className={`btn ${filter === f ? "btn-primary" : "btn-secondary"}`}
                style={{ padding: "8px 14px", fontSize: "13px" }}
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "Semua" : f === "live" ? "● Live" : f === "scheduled" ? "Terjadwal" : "Selesai"}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="form-error" style={{ marginBottom: "16px" }}>{error}</div>}

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <span>Memuat data...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <p>Tidak ada pertandingan pada filter ini.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {filtered.map((match) => (
              <div key={match.id} className="live-score-admin-card">

                {/* Header */}
                <div className="live-score-admin-header">
                  <div>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>
                      {match.venue || "Lapangan"} · {formatDateTime(match.scheduled_at)}
                    </span>
                  </div>
                  {match.status === "live" && (
                    <span className="badge badge-live">● LIVE</span>
                  )}
                  {match.status === "finished" && (
                    <span className="badge badge-finished">Selesai</span>
                  )}
                  {match.status === "scheduled" && (
                    <span className="badge badge-scheduled">Terjadwal</span>
                  )}
                </div>

                {/* Konten skor */}
                <div className="live-score-admin-body">

                  <div className="live-score-team">
                    <div className="team-logo team-a">
                      {match.home_team?.name?.charAt(0) || "?"}
                    </div>
                    <span>{match.home_team?.name || "-"}</span>
                  </div>

                  {editingId === match.id ? (
                    <div className="live-score-edit-form">
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <input
                          type="number"
                          min="0"
                          max="99"
                          value={form.home_score}
                          onChange={(e) => setForm({ ...form, home_score: e.target.value })}
                          style={{ width: "60px", textAlign: "center", padding: "8px", border: "2px solid #2563eb", borderRadius: "8px", fontSize: "20px", fontWeight: "700" }}
                        />
                        <span style={{ color: "#94a3b8", fontWeight: "700" }}>–</span>
                        <input
                          type="number"
                          min="0"
                          max="99"
                          value={form.away_score}
                          onChange={(e) => setForm({ ...form, away_score: e.target.value })}
                          style={{ width: "60px", textAlign: "center", padding: "8px", border: "2px solid #2563eb", borderRadius: "8px", fontSize: "20px", fontWeight: "700" }}
                        />
                      </div>

                      <div className="form-group" style={{ marginTop: "12px" }}>
                        <select
                          value={form.status}
                          onChange={(e) => setForm({ ...form, status: e.target.value })}
                          style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                        >
                          {STATUS_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      </div>

                      <div style={{ display: "flex", gap: "8px", marginTop: "12px", justifyContent: "center" }}>
                        <button
                          className="btn btn-success"
                          onClick={() => saveScore(match.id)}
                          disabled={saving}
                        >
                          {saving ? "Menyimpan..." : "✓ Simpan"}
                        </button>
                        <button className="btn btn-secondary" onClick={cancelEdit} disabled={saving}>
                          Batal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="live-score-display">
                      <span className="live-score-number">
                        {match.home_score ?? 0} – {match.away_score ?? 0}
                      </span>
                    </div>
                  )}

                  <div className="live-score-team">
                    <div className="team-logo team-b">
                      {match.away_team?.name?.charAt(0) || "?"}
                    </div>
                    <span>{match.away_team?.name || "-"}</span>
                  </div>

                </div>

                {/* Tombol edit */}
                {editingId !== match.id && (
                  <div className="live-score-admin-footer">
                    <button
                      className="btn btn-primary"
                      style={{ padding: "8px 20px", fontSize: "13px" }}
                      onClick={() => startEdit(match)}
                    >
                      ✏️ Update Skor
                    </button>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default ManageLiveScore
