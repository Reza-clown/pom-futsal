import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

const EMPTY_FORM = { name: "", short_name: "", program_study: "" }

function ManageTeams() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchTeams()
  }, [])

  async function fetchTeams() {
    setLoading(true)
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .order("name", { ascending: true })

    if (!error) setTeams(data || [])
    setLoading(false)
  }

  function openAddModal() {
    setForm(EMPTY_FORM)
    setEditId(null)
    setError("")
    setModalOpen(true)
  }

  function openEditModal(team) {
    setForm({
      name: team.name || "",
      short_name: team.short_name || "",
      program_study: team.program_study || "",
    })
    setEditId(team.id)
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

    if (!form.name.trim()) {
      setError("Nama tim wajib diisi.")
      return
    }
    if (!form.short_name.trim()) {
      setError("Nama singkat tim wajib diisi.")
      return
    }
    if (!form.program_study.trim()) {
      setError("Program studi wajib diisi.")
      return
    }

    setSubmitting(true)
    const payload = {
      name: form.name.trim(),
      short_name: form.short_name.trim(),
      program_study: form.program_study.trim(),
    }

    if (editId) {
      const { error } = await supabase
        .from("teams")
        .update(payload)
        .eq("id", editId)

      if (error) {
        setError("Gagal mengubah tim: " + error.message)
        setSubmitting(false)
        return
      }
    } else {
      const { error } = await supabase
        .from("teams")
        .insert(payload)

      if (error) {
        setError("Gagal menambahkan tim: " + error.message)
        setSubmitting(false)
        return
      }
    }

    setSubmitting(false)
    closeModal()
    fetchTeams()
  }

  async function handleDelete(team) {
    if (!confirm(`Hapus tim "${team.name}"? Tindakan ini tidak dapat dibatalkan.`)) return

    const { error } = await supabase.from("teams").delete().eq("id", team.id)
    if (error) {
      alert("Gagal menghapus tim: " + error.message)
      return
    }
    fetchTeams()
  }

  return (
    <div>
      <div className="admin-header-bar">
        <div>
          <h2>Kelola Tim</h2>
          <p>Manajemen tim peserta POM Futsal</p>
        </div>
      </div>

      <div className="admin-content">

        <div className="page-header">
          <div className="page-header-left">
            <h1>Daftar Tim</h1>
            <p>Total {teams.length} tim terdaftar</p>
          </div>
          <button className="btn btn-primary" onClick={openAddModal}>
            + Tambah Tim
          </button>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <span>Memuat data...</span>
          </div>
        ) : teams.length === 0 ? (
          <div className="empty-state">
            <p>Belum ada tim. Klik "Tambah Tim" untuk mulai.</p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nama Tim</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team, idx) => (
                  <tr key={team.id}>
                    <td>{idx + 1}</td>
                    <td style={{ fontWeight: 600, color: "#172554" }}>{team.name}</td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: "6px 12px", fontSize: "13px" }}
                          onClick={() => openEditModal(team)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: "6px 12px", fontSize: "13px" }}
                          onClick={() => handleDelete(team)}
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

      {/* Modal tambah/edit */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId ? "Edit Tim" : "Tambah Tim Baru"}</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="form-error" style={{ fontSize: "13px" }}>{error}</div>}

                <div className="form-group">
                  <label htmlFor="team-name">Nama Tim *</label>
                  <input
                    id="team-name"
                    type="text"
                    placeholder="Masukkan nama tim"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    disabled={submitting}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="team-short-name">Nama Singkat *</label>
                  <input
                    id="team-short-name"
                    type="text"
                    placeholder="Masukkan nama singkat tim"
                    value={form.short_name}
                    onChange={(e) => setForm({ ...form, short_name: e.target.value })}
                    disabled={submitting}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="team-program-study">Program Studi *</label>
                  <input
                    id="team-program-study"
                    type="text"
                    placeholder="Masukkan program studi"
                    value={form.program_study}
                    onChange={(e) => setForm({ ...form, program_study: e.target.value })}
                    disabled={submitting}
                  />
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
                  {submitting ? "Menyimpan..." : editId ? "Simpan Perubahan" : "Tambah Tim"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default ManageTeams
