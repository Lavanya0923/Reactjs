import { useState, useEffect, useRef } from "react";

const INITIAL_STUDENTS = [
  { id: 1, name: "Lavanya", email: "Lavanya@university.edu", age: 21 },
  { id: 2, name: "Priya", email: "Priya@university.edu", age: 23 },
  { id: 3, name: "Steve", email: "Steve@university.edu", age: 20 },
  { id: 4, name: "Pradeep", email: "Pradeep@university.edu", age: 22 },
  { id: 5, name: "Mamitha", email: "Mamitha@university.edu", age: 24 },
];

let nextId = 6;

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = "Name is required";
  if (!form.email.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = "Enter a valid email";
  if (!form.age) errors.age = "Age is required";
  else if (isNaN(form.age) || Number(form.age) < 1 || Number(form.age) > 120)
    errors.age = "Enter a valid age (1–120)";
  return errors;
}

function downloadExcel(students) {
  const header = ["Name", "Email", "Age"];
  const rows = students.map((s) => [s.name, s.email, s.age]);
  const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "students.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
      <div className="spinner" />
    </div>
  );
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`toast toast-${type}`}>
      <span>{message}</span>
      <button onClick={onClose} className="toast-close">×</button>
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function StudentForm({ initial, onSubmit, onCancel, submitLabel }) {
  const [form, setForm] = useState(
    initial || { name: "", email: "", age: "" }
  );
  const [errors, setErrors] = useState({});

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="student-form">
      {["name", "email", "age"].map((field) => (
        <div key={field} className="form-group">
          <label htmlFor={field} className="form-label">
            {field.charAt(0).toUpperCase() + field.slice(1)}
          </label>
          <input
            id={field}
            name={field}
            type={field === "age" ? "number" : field === "email" ? "email" : "text"}
            value={form[field]}
            onChange={handleChange}
            className={`form-input${errors[field] ? " form-input-error" : ""}`}
            placeholder={
              field === "name" ? "Full name" :
              field === "email" ? "student@university.edu" : "Age"
            }
            autoComplete="off"
          />
          {errors[field] && <span className="form-error">{errors[field]}</span>}
        </div>
      ))}
      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn btn-ghost">Cancel</button>
        <button type="submit" className="btn btn-primary">{submitLabel}</button>
      </div>
    </form>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <Modal title="Confirm Delete" onClose={onCancel}>
      <p className="confirm-msg">{message}</p>
      <div className="form-actions">
        <button onClick={onCancel} className="btn btn-ghost">Cancel</button>
        <button onClick={onConfirm} className="btn btn-danger">Delete</button>
      </div>
    </Modal>
  );
}

export default function App() {
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | {type:'add'} | {type:'edit',student} | {type:'delete',student}
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      String(s.age).includes(search)
  );

  function showToast(message, type = "success") {
    setToast({ message, type });
  }

  function handleAdd(form) {
    const student = { id: nextId++, name: form.name.trim(), email: form.email.trim(), age: Number(form.age) };
    setStudents([...students, student]);
    setModal(null);
    showToast(`${student.name} added successfully`);
  }

  function handleEdit(form) {
    setStudents(students.map((s) =>
      s.id === modal.student.id
        ? { ...s, name: form.name.trim(), email: form.email.trim(), age: Number(form.age) }
        : s
    ));
    setModal(null);
    showToast(`Student updated successfully`);
  }

  function handleDelete() {
    const name = modal.student.name;
    setStudents(students.filter((s) => s.id !== modal.student.id));
    setModal(null);
    showToast(`${name} removed`, "error");
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #0d0d10;
          --surface: #13131a;
          --surface2: #1a1a24;
          --border: rgba(255,255,255,0.07);
          --accent: #7effc4;
          --accent2: #ff6b6b;
          --accent3: #6b8cff;
          --text: #f0f0f5;
          --muted: #6b6b80;
          --font-head: 'Syne', sans-serif;
          --font-mono: 'DM Mono', monospace;
          --radius: 12px;
          --radius-sm: 8px;
        }

        body { background: var(--bg); color: var(--text); font-family: var(--font-mono); min-height: 100vh; }

        .app-wrap {
          max-width: 1100px;
          margin: 0 auto;
          padding: 48px 24px 80px;
          animation: fadeUp 0.5s ease both;
        }

        @keyframes fadeUp {
          from { opacity:0; transform: translateY(16px); }
          to { opacity:1; transform: translateY(0); }
        }

        .header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 40px;
          gap: 16px;
          flex-wrap: wrap;
        }
        .header-left { display: flex; flex-direction: column; gap: 6px; }
        .header-eyebrow {
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 500;
          color: var(--accent);
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }
        .header-title {
          font-family: var(--font-head);
          font-size: clamp(28px, 4vw, 42px);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.03em;
        }
        .header-title span { color: var(--accent); }

        .toolbar {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }
        .search-wrap { position: relative; flex: 1; min-width: 200px; }
        .search-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: var(--muted); font-size: 14px; pointer-events: none;
        }
        .search-input {
          width: 100%;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          color: var(--text);
          font-family: var(--font-mono);
          font-size: 13px;
          padding: 10px 14px 10px 38px;
          outline: none;
          transition: border-color 0.2s;
        }
        .search-input::placeholder { color: var(--muted); }
        .search-input:focus { border-color: var(--accent); }

        .btn {
          font-family: var(--font-head);
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 0.04em;
          border: none;
          border-radius: var(--radius-sm);
          padding: 10px 20px;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .btn-primary {
          background: var(--accent);
          color: #0d0d10;
        }
        .btn-primary:hover { background: #a0ffdc; transform: translateY(-1px); }
        .btn-ghost {
          background: var(--surface2);
          color: var(--text);
          border: 1px solid var(--border);
        }
        .btn-ghost:hover { border-color: var(--muted); }
        .btn-danger { background: var(--accent2); color: #fff; }
        .btn-danger:hover { background: #ff8989; }
        .btn-outline {
          background: transparent;
          color: var(--accent3);
          border: 1px solid var(--accent3);
        }
        .btn-outline:hover { background: rgba(107,140,255,0.1); }

        .stats-row {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .stat-chip {
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 999px;
          padding: 5px 14px;
          font-size: 12px;
          color: var(--muted);
        }
        .stat-chip strong { color: var(--text); }

        .table-wrap {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
        }
        table { width: 100%; border-collapse: collapse; }
        thead tr {
          background: var(--surface2);
          border-bottom: 1px solid var(--border);
        }
        th {
          font-family: var(--font-head);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--muted);
          text-align: left;
          padding: 14px 20px;
        }
        tbody tr {
          border-bottom: 1px solid var(--border);
          transition: background 0.15s;
        }
        tbody tr:last-child { border-bottom: none; }
        tbody tr:hover { background: var(--surface2); }
        td {
          padding: 15px 20px;
          font-size: 13px;
          vertical-align: middle;
        }
        .td-name { font-weight: 500; color: var(--text); }
        .td-email { color: var(--muted); }
        .td-age {
          font-family: var(--font-mono);
          color: var(--accent3);
          font-size: 12px;
        }
        .td-actions { display: flex; gap: 8px; }

        .action-btn {
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.05em;
          padding: 5px 12px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          transition: all 0.15s;
        }
        .action-edit {
          background: rgba(107,140,255,0.12);
          color: var(--accent3);
          border: 1px solid rgba(107,140,255,0.25);
        }
        .action-edit:hover { background: rgba(107,140,255,0.22); }
        .action-delete {
          background: rgba(255,107,107,0.1);
          color: var(--accent2);
          border: 1px solid rgba(255,107,107,0.2);
        }
        .action-delete:hover { background: rgba(255,107,107,0.2); }

        .empty-state {
          text-align: center;
          padding: 64px 24px;
          color: var(--muted);
        }
        .empty-icon { font-size: 36px; margin-bottom: 12px; opacity: 0.4; }
        .empty-label { font-size: 14px; }

        .spinner {
          width: 32px; height: 32px;
          border: 2px solid var(--border);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Modal */
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          z-index: 100;
          animation: fadeIn 0.15s ease;
        }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        .modal-box {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          width: 100%; max-width: 460px;
          padding: 28px;
          animation: slideUp 0.2s ease;
        }
        @keyframes slideUp {
          from { opacity:0; transform: translateY(20px); }
          to { opacity:1; transform: translateY(0); }
        }
        .modal-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 24px;
        }
        .modal-title {
          font-family: var(--font-head);
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.02em;
        }
        .modal-close {
          background: none; border: none; color: var(--muted);
          font-size: 20px; cursor: pointer; line-height: 1;
          transition: color 0.15s;
        }
        .modal-close:hover { color: var(--text); }

        .student-form { display: flex; flex-direction: column; gap: 16px; }
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-label {
          font-size: 11px; font-weight: 500;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--muted);
        }
        .form-input {
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          color: var(--text);
          font-family: var(--font-mono);
          font-size: 13px;
          padding: 10px 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        .form-input:focus { border-color: var(--accent); }
        .form-input-error { border-color: var(--accent2) !important; }
        .form-error { font-size: 11px; color: var(--accent2); }
        .form-actions {
          display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px;
        }

        .confirm-msg {
          font-size: 14px; color: var(--muted);
          line-height: 1.6; margin-bottom: 24px;
        }

        /* Toast */
        .toast {
          position: fixed; bottom: 24px; right: 24px;
          display: flex; align-items: center; gap: 12px;
          padding: 12px 18px;
          border-radius: var(--radius-sm);
          font-size: 13px;
          z-index: 200;
          animation: slideIn 0.25s ease;
          max-width: 320px;
        }
        @keyframes slideIn {
          from { opacity:0; transform: translateX(20px); }
          to { opacity:1; transform: translateX(0); }
        }
        .toast-success {
          background: rgba(126,255,196,0.12);
          border: 1px solid rgba(126,255,196,0.3);
          color: var(--accent);
        }
        .toast-error {
          background: rgba(255,107,107,0.12);
          border: 1px solid rgba(255,107,107,0.3);
          color: var(--accent2);
        }
        .toast-close {
          background: none; border: none;
          font-size: 16px; cursor: pointer;
          color: inherit; opacity: 0.6;
          margin-left: auto;
        }
        .toast-close:hover { opacity: 1; }

        @media (max-width: 640px) {
          th:nth-child(2), td:nth-child(2) { display: none; }
          .header { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <div className="app-wrap">
        {/* Header */}
        <div className="header">
          <div className="header-left">
            <span className="header-eyebrow">// student registry</span>
            <h1 className="header-title">Students<span>.</span></h1>
          </div>
          <button className="btn btn-primary" onClick={() => setModal({ type: "add" })}>
            + Add Student
          </button>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="search-wrap">
            <span className="search-icon">⌕</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search by name, email, or age…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            className="btn btn-outline"
            onClick={() => downloadExcel(filtered)}
            title="Download visible rows as CSV/Excel"
          >
            ↓ Export
          </button>
        </div>

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-chip">Total: <strong>{students.length}</strong></div>
          <div className="stat-chip">Showing: <strong>{filtered.length}</strong></div>
          {search && (
            <div className="stat-chip">
              Filter: <strong>"{search}"</strong>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="table-wrap">
          {loading ? (
            <Spinner />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Age</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="empty-state">
                        <div className="empty-icon">◎</div>
                        <div className="empty-label">No students found</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((s, i) => (
                    <tr key={s.id}>
                      <td style={{ color: "var(--muted)", fontSize: "11px", fontFamily: "var(--font-mono)" }}>
                        {String(i + 1).padStart(2, "0")}
                      </td>
                      <td className="td-name">{s.name}</td>
                      <td className="td-email">{s.email}</td>
                      <td className="td-age">{s.age}y</td>
                      <td className="td-actions">
                        <button
                          className="action-btn action-edit"
                          onClick={() => setModal({ type: "edit", student: s })}
                        >
                          edit
                        </button>
                        <button
                          className="action-btn action-delete"
                          onClick={() => setModal({ type: "delete", student: s })}
                        >
                          del
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modals */}
      {modal?.type === "add" && (
        <Modal title="Add Student" onClose={() => setModal(null)}>
          <StudentForm
            onSubmit={handleAdd}
            onCancel={() => setModal(null)}
            submitLabel="Add Student"
          />
        </Modal>
      )}

      {modal?.type === "edit" && (
        <Modal title="Edit Student" onClose={() => setModal(null)}>
          <StudentForm
            initial={{ name: modal.student.name, email: modal.student.email, age: String(modal.student.age) }}
            onSubmit={handleEdit}
            onCancel={() => setModal(null)}
            submitLabel="Save Changes"
          />
        </Modal>
      )}

      {modal?.type === "delete" && (
        <ConfirmDialog
          message={`Are you sure you want to remove "${modal.student.name}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setModal(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
