import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

const STATUS_OPTIONS = [
  { value: "scheduled", label: "Terjadwal" },
  { value: "live", label: "Live" },
  { value: "finished", label: "Selesai" },
]

const EMPTY_FORM = {
  home_team_id: "",
  away_team_id: "",
  matchday: "",
  scheduled_at: "",
  venue: "",
  status: "scheduled",
}

function ManageMatches() {
  const [matches, setMatches] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    setLoading(true)
    const [matchesRes, teamsRes] = await Promise.all([
      supabase
        .from("matches")
        .select(`
          id, status, matchday, home_score, away_score, venue, scheduled_at,
          home_team:teams!matches_home_team_id_fkey(id, name),
          away_team:teams!matches_away_team_id_fkey(id, name)
        `)
        .order("scheduled_at", { ascending: true }),
      supabase.from("teams").select("id, name").order("name"),
    ])

    if (!matchesRes.error) setMatches(matchesRes.data || [])
    if (!teamsRes.error) setTeams(teamsRes.data || [])
    setLoading(false)
  }

  function formatDateTime(dateStr) {
    if (!dateStr) return "-"
    return new Date(dateStr).toLocaleString("id-ID", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    })
  }

  function toInputDate(dateStr) {
    if (!dateStr) return ""
    const d = new Date(dateStr)
    return d.toISOString().slice(0, 16)
  }

  function getStatusBadge(status) {
    switch (status) {
      case "live": return <span className="badge badge-live">● Live</span>
      case "finished": return <span className="badge badge-finished">Selesai</span>
      default: return <span className="badge badge-scheduled">Terjadwal</span>
    }
  }

  function openAddModal() {
    setForm(EMPTY_FORM)
    setEditId(null)
    setError("")
    setModalOpen(true)
  }

  function openEditModal(match) {
    setForm({
      home_team_id: match.home_team?.id || "",
      away_team_id: match.away_team?.id || "",
      matchday: match.matchday ?? "",
      scheduled_at: toInputDate(match.scheduled_at),
      venue: match.venue || "",
      status: match.status || "scheduled",
    })
    setEditId(match.id)
    setError("")
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setForm(EMPTY_FORM)
    setEditId(null)
    setError("")
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")

    if (!form.home_team_id || !form.away_team_id) {
      setError("Tim kandang dan tim tandang wajib dipilih.")
      return
    }
    if (form.home_team_id === form.away_team_id) {
      setError("Tim kandang dan tim tandang tidak boleh sama.")
      return
    }
    if (!form.matchday || isNaN(parseInt(form.matchday)) || parseInt(form.matchday) < 1) {
      setError("Matchday wajib diisi dengan angka positif.")
      return
    }

    setSubmitting(true)

    const payload = {
      home_team_id: form.home_team_id,
      away_team_id: form.away_team_id,
      matchday: parseInt(form.matchday),
      scheduled_at: form.scheduled_at || null,
      venue: form.venue.trim() || null,
      status: form.status,
    }

    let dbError
    if (editId) {
      const res = await supabase.from("matches").update(payload).eq("id", editId)
      dbError = res.error
    } else {
      const res = await supabase.from("matches").insert({
        ...payload,
        home_score: 0,
        away_score: 0,
      })
      dbError = res.error
    }

    if (dbError) {
      setError("Gagal menyimpan: " + dbError.message)
      setSubmitting(false)
      return
    }

    setSubmitting(false)
    closeModal()
    fetchAll()
  }

  async function handleDelete(match) {
    const label = `${match.home_team?.name || "?"} vs ${match.away_team?.name || "?"}`
    if (!confirm(`Hapus pertandingan "${label}"? Tindakan ini tidak dapat dibatalkan.`)) return

    const { error } = await supabase.from("matches").delete().eq("id", match.id)
    if (error) {
      alert("Gagal menghapus: " + error.message)
      return
    }
    fetchAll()
  }

  return (
    <div>
      <div className="admin-header-bar">
        <div>
          <h2>Jadwal Pertandingan</h2>
          <p>Manajemen pertandingan POM Futsal</p>
        </div>
      </div>

      <div className="admin-content">

        <div className="page-header">
          <div className="page-header-left">
            <h1>Daftar Pertandingan</h1>
            <p>Total {matches.length} pertandingan</p>
          </div>
          <button className="btn btn-primary" onClick={openAddModal}>
            + Tambah Pertandingan
          </button>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <span>Memuat data...</span>
          </div>
        ) : matches.length === 0 ? (
          <div className="empty-state">
            <p>Belum ada pertandingan. Klik "Tambah Pertandingan" untuk mulai.</p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>MD</th>
                  <th>Tim Kandang</th>
                  <th>Skor</th>
                  <th>Tim Tandang</th>
                  <th>Waktu</th>
                  <th>Lapangan</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((match, idx) => (
                  <tr key={match.id}>
                    <td>{idx + 1}</td>
                    <td style={{ fontWeight: 600, color: "#64748b" }}>MD {match.matchday}</td>
                    <td style={{ fontWeight: 600, color: "#172554" }}>
                      {match.home_team?.name || "-"}
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {match.status !== "scheduled"
                        ? `${match.home_score ?? 0} - ${match.away_score ?? 0}`
                        : "vs"}
                    </td>
                    <td style={{ fontWeight: 600, color: "#172554" }}>
                      {match.away_team?.name || "-"}
                    </td>
                    <td>{formatDateTime(match.scheduled_at)}</td>
                    <td>{match.venue || "-"}</td>
                    <td>{getStatusBadge(match.status)}</td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: "6px 12px", fontSize: "13px" }}
                          onClick={() => openEditModal(match)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: "6px 12px", fontSize: "13px" }}
                          onClick={() => handleDelete(match)}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId ? "Edit Pertandingan" : "Tambah Pertandingan Baru"}</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="form-error">{error}</div>}

                <div className="form-group">
                  <label>Matchday *</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Contoh: 1"
                    value={form.matchday}
                    onChange={(e) => setForm({ ...form, matchday: e.target.value })}
                    disabled={submitting}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="form-group">
                    <label>Tim Kandang *</label>
                    <select
                      value={form.home_team_id}
                      onChange={(e) => setForm({ ...form, home_team_id: e.target.value })}
                      disabled={submitting}
                    >
                      <option value="">Pilih tim...</option>
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Tim Tandang *</label>
                    <select
                      value={form.away_team_id}
                      onChange={(e) => setForm({ ...form, away_team_id: e.target.value })}
                      disabled={submitting}
                    >
                      <option value="">Pilih tim...</option>
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="form-group">
                    <label>Waktu Pertandingan</label>
                    <input
                      type="datetime-local"
                      value={form.scheduled_at}
                      onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                      disabled={submitting}
                    />
                  </div>

                  <div className="form-group">
                    <label>Lapangan</label>
                    <input
                      type="text"
                      placeholder="Contoh: Lapangan 1"
                      value={form.venue}
                      onChange={(e) => setForm({ ...form, venue: e.target.value })}
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    disabled={submitting}
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                  disabled={submitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Menyimpan..." : editId ? "Simpan Perubahan" : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default ManageMatches
