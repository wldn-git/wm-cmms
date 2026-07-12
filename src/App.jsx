import React, { useState } from "react";
import {
  LayoutDashboard, Wrench, ClipboardList, Boxes, CalendarClock,
  AlertTriangle, CheckCircle2, Clock, Plus, X, ChevronRight,
  Search, Gauge, TrendingUp, TrendingDown, Factory, Sun, Moon,
  Pencil, Save, Trash2
} from "lucide-react";

/* ---------------------------------------------------
   THEME: "Industrial Steel & Ember"
   Steel grays + ember orange accent, consistent with
   WM - Training brand materials. Toggle between a
   workshop-floor dark mode and a projector-friendly
   light mode.
--------------------------------------------------- */
const THEMES = {
  dark: {
    bg: "#15181c", panel: "#1c2126", panel2: "#22272d", border: "#2f363d",
    steel: "#8a94a3", steelLight: "#c3cad4",
    ember: "#e8622c", emberSoft: "#f2874f",
    ok: "#4caf6e", warn: "#e8b13c", danger: "#e85c4a",
    text: "#eef1f4", textDim: "#9aa3ad",
  },
  light: {
    bg: "#f2efe8", panel: "#ffffff", panel2: "#f6f3ec", border: "#ddd7c9",
    steel: "#726d61", steelLight: "#433f36",
    ember: "#c8531f", emberSoft: "#a8451c",
    ok: "#2c7a4b", warn: "#a56c0c", danger: "#b73c2a",
    text: "#221f19", textDim: "#726c5f",
  },
};

const seedAssets = [
  { id: "AST-101", name: "CNC Milling Machine #1", location: "Line A - Bay 3", status: "running", health: 92, lastMaint: "2026-06-15", nextMaint: "2026-07-15", criticality: "high" },
  { id: "AST-102", name: "Hydraulic Press #2", location: "Line A - Bay 5", status: "running", health: 78, lastMaint: "2026-06-01", nextMaint: "2026-07-10", criticality: "high" },
  { id: "AST-103", name: "Conveyor Belt Unit 4", location: "Line B - Bay 1", status: "down", health: 34, lastMaint: "2026-05-20", nextMaint: "2026-07-05", criticality: "medium" },
  { id: "AST-104", name: "Air Compressor Unit A", location: "Utility Room", status: "running", health: 88, lastMaint: "2026-06-20", nextMaint: "2026-08-01", criticality: "medium" },
  { id: "AST-105", name: "Lathe Machine #3", location: "Line A - Bay 2", status: "maintenance", health: 55, lastMaint: "2026-07-08", nextMaint: "2026-07-18", criticality: "low" },
  { id: "AST-106", name: "Cooling Tower System", location: "Utility Yard", status: "running", health: 95, lastMaint: "2026-06-25", nextMaint: "2026-08-10", criticality: "high" },
];

const seedWorkOrders = [
  { id: "WO-2041", asset: "AST-103", title: "Belt tracking misalignment", type: "corrective", priority: "critical", status: "open", assignee: "Andi P.", created: "2026-07-10" },
  { id: "WO-2040", asset: "AST-105", title: "Scheduled spindle inspection", type: "preventive", priority: "medium", status: "in_progress", assignee: "Budi S.", created: "2026-07-08" },
  { id: "WO-2039", asset: "AST-102", title: "Hydraulic fluid replacement", type: "preventive", priority: "low", status: "in_progress", assignee: "Citra W.", created: "2026-07-07" },
  { id: "WO-2038", asset: "AST-101", title: "Vibration anomaly check", type: "predictive", priority: "high", status: "open", assignee: "Unassigned", created: "2026-07-09" },
  { id: "WO-2037", asset: "AST-104", title: "Monthly filter replacement", type: "preventive", priority: "low", status: "completed", assignee: "Andi P.", created: "2026-06-28" },
  { id: "WO-2036", asset: "AST-106", title: "Quarterly water treatment check", type: "preventive", priority: "medium", status: "completed", assignee: "Dedi R.", created: "2026-06-25" },
];

const seedPM = [
  { id: "PM-01", asset: "AST-101", task: "Pelumasan spindle & pemeriksaan alignment", freq: "Bulanan", due: "2026-07-15", status: "upcoming" },
  { id: "PM-02", asset: "AST-102", task: "Penggantian oli hidrolik", freq: "Bulanan", due: "2026-07-10", status: "due_soon" },
  { id: "PM-03", asset: "AST-103", task: "Inspeksi belt & roller conveyor", freq: "Mingguan", due: "2026-07-05", status: "overdue" },
  { id: "PM-04", asset: "AST-104", task: "Penggantian filter udara", freq: "Bulanan", due: "2026-08-01", status: "upcoming" },
  { id: "PM-05", asset: "AST-105", task: "Kalibrasi tailstock & pemeriksaan chuck", freq: "3 Bulanan", due: "2026-07-18", status: "due_soon" },
  { id: "PM-06", asset: "AST-106", task: "Pemeriksaan kualitas air pendingin", freq: "3 Bulanan", due: "2026-08-10", status: "upcoming" },
];

function getMeta(C) {
  const statusMeta = {
    running:     { label: "Beroperasi",  color: C.ok },
    down:        { label: "Breakdown",   color: C.danger },
    maintenance: { label: "Maintenance", color: C.warn },
    open:        { label: "Terbuka",     color: C.danger },
    in_progress: { label: "Dikerjakan",  color: C.warn },
    completed:   { label: "Selesai",     color: C.ok },
    overdue:     { label: "Terlambat",   color: C.danger },
    due_soon:    { label: "Segera Jatuh Tempo", color: C.warn },
    upcoming:    { label: "Terjadwal",   color: C.steel },
  };
  const priorityMeta = {
    critical: { label: "Kritis", color: C.danger },
    high:     { label: "Tinggi", color: C.emberSoft },
    medium:   { label: "Sedang", color: C.warn },
    low:      { label: "Rendah", color: C.steel },
  };
  return { statusMeta, priorityMeta };
}

function Badge({ color, children }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
      color, background: color + "22", border: `1px solid ${color}55`,
      whiteSpace: "nowrap"
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
      {children}
    </span>
  );
}

function Card({ children, style, C }) {
  return (
    <div style={{
      background: C.panel, border: `1px solid ${C.border}`,
      borderRadius: 10, padding: 18, ...style
    }}>
      {children}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, accent, C }) {
  return (
    <Card C={C} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontSize: 13, color: C.textDim, fontWeight: 500 }}>{label}</div>
        <div style={{
          width: 32, height: 32, borderRadius: 8, background: (accent || C.ember) + "20",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <Icon size={17} color={accent || C.ember} />
        </div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: C.text, letterSpacing: -0.5 }}>{value}</div>
      {sub && <div style={{ fontSize: 12.5, color: C.textDim }}>{sub}</div>}
    </Card>
  );
}

function HealthBar({ value, C }) {
  const color = value >= 75 ? C.ok : value >= 50 ? C.warn : C.danger;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 6, borderRadius: 4, background: C.panel2, overflow: "hidden" }}>
        <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 4 }} />
      </div>
      <span style={{ fontSize: 12, color, fontWeight: 700, minWidth: 30 }}>{value}%</span>
    </div>
  );
}

function SectionHeader({ title, subtitle, action, C }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
      <div>
        <h2 style={{ fontSize: 19, fontWeight: 700, color: C.text, margin: 0 }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 13, color: C.textDim, margin: "4px 0 0" }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function NavItem({ icon: Icon, label, active, onClick, C }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 11, width: "100%",
      padding: "10px 14px", borderRadius: 8, border: "none", cursor: "pointer",
      background: active ? C.ember + "1c" : "transparent",
      color: active ? C.emberSoft : C.steel,
      fontSize: 14, fontWeight: active ? 600 : 500, textAlign: "left",
      transition: "background 0.15s"
    }}>
      <Icon size={17} />
      {label}
    </button>
  );
}

function getInputStyle(C) {
  return {
    padding: "8px 12px", background: C.panel2, border: `1px solid ${C.border}`,
    borderRadius: 7, color: C.text, fontSize: 13, outline: "none"
  };
}
function getThStyle(C) {
  return { textAlign: "left", padding: "10px 14px", fontSize: 11.5, color: C.textDim, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 };
}
function getTdStyle(C) {
  return { padding: "11px 14px", color: C.steelLight };
}

/* ---------------- DASHBOARD ---------------- */
function Dashboard({ assets, workOrders, pms, C }) {
  const { statusMeta, priorityMeta } = getMeta(C);
  const running = assets.filter(a => a.status === "running").length;
  const down = assets.filter(a => a.status === "down").length;
  const openWO = workOrders.filter(w => w.status !== "completed").length;
  const overduePM = pms.filter(p => p.status === "overdue").length;
  const avgHealth = Math.round(assets.reduce((s, a) => s + a.health, 0) / assets.length);

  return (
    <div>
      <SectionHeader C={C} title="Dashboard Maintenance" subtitle="Ringkasan performa aset & aktivitas maintenance hari ini" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        <StatCard C={C} icon={Factory} label="Aset Beroperasi" value={`${running}/${assets.length}`} sub={`${down} unit breakdown`} accent={C.ok} />
        <StatCard C={C} icon={ClipboardList} label="Work Order Aktif" value={openWO} sub="Perlu tindak lanjut" accent={C.ember} />
        <StatCard C={C} icon={AlertTriangle} label="PM Terlambat" value={overduePM} sub="Melewati jadwal" accent={C.danger} />
        <StatCard C={C} icon={Gauge} label="Rata-rata Health Score" value={`${avgHealth}%`} sub="Seluruh aset" accent={C.warn} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
        <Card C={C}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 14 }}>Kondisi Aset (Health Score)</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {assets.map(a => (
              <div key={a.id}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{a.name}</span>
                  <Badge color={statusMeta[a.status].color}>{statusMeta[a.status].label}</Badge>
                </div>
                <HealthBar C={C} value={a.health} />
              </div>
            ))}
          </div>
        </Card>

        <Card C={C}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 14 }}>Work Order Terbaru</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {workOrders.slice(0, 5).map(w => (
              <div key={w.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "9px 0", borderBottom: `1px solid ${C.border}`
              }}>
                <div>
                  <div style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{w.title}</div>
                  <div style={{ fontSize: 11.5, color: C.textDim, marginTop: 2 }}>{w.id} • {w.asset}</div>
                </div>
                <Badge color={priorityMeta[w.priority].color}>{priorityMeta[w.priority].label}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---------------- WORK ORDERS ---------------- */
function WorkOrders({ workOrders, setWorkOrders, assets, C }) {
  const { statusMeta, priorityMeta } = getMeta(C);
  const inputStyle = getInputStyle(C);
  const thStyle = getThStyle(C);
  const tdStyle = getTdStyle(C);
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", asset: assets[0].id, type: "corrective", priority: "medium" });

  const filtered = filter === "all" ? workOrders : workOrders.filter(w => w.status === filter);

  const addWO = () => {
    if (!form.title.trim()) return;
    const newId = "WO-" + (2042 + workOrders.filter(w => w.id.startsWith("WO-204")).length);
    setWorkOrders([{ ...form, id: newId, status: "open", assignee: "Unassigned", created: "2026-07-11" }, ...workOrders]);
    setForm({ title: "", asset: assets[0].id, type: "corrective", priority: "medium" });
    setShowForm(false);
  };

  const advanceStatus = (id) => {
    setWorkOrders(workOrders.map(w => {
      if (w.id !== id) return w;
      const next = w.status === "open" ? "in_progress" : w.status === "in_progress" ? "completed" : "completed";
      return { ...w, status: next };
    }));
  };

  return (
    <div>
      <SectionHeader
        C={C}
        title="Work Order Management"
        subtitle="Kelola permintaan kerja korektif, preventif, dan prediktif"
        action={
          <button onClick={() => setShowForm(!showForm)} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
            background: C.ember, color: "#fff", border: "none", borderRadius: 8,
            fontSize: 13, fontWeight: 600, cursor: "pointer"
          }}>
            <Plus size={15} /> Work Order Baru
          </button>
        }
      />

      {showForm && (
        <Card C={C} style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Buat Work Order</div>
            <X size={16} color={C.textDim} style={{ cursor: "pointer" }} onClick={() => setShowForm(false)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 10 }}>
            <input placeholder="Judul pekerjaan..." value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              style={inputStyle} />
            <select value={form.asset} onChange={e => setForm({ ...form, asset: e.target.value })} style={inputStyle}>
              {assets.map(a => <option key={a.id} value={a.id}>{a.id}</option>)}
            </select>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={inputStyle}>
              <option value="corrective">Korektif</option>
              <option value="preventive">Preventif</option>
              <option value="predictive">Prediktif</option>
            </select>
            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} style={inputStyle}>
              <option value="low">Rendah</option>
              <option value="medium">Sedang</option>
              <option value="high">Tinggi</option>
              <option value="critical">Kritis</option>
            </select>
          </div>
          <button onClick={addWO} style={{
            marginTop: 12, padding: "8px 16px", background: C.ember, color: "#fff",
            border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer"
          }}>Simpan</button>
        </Card>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {["all", "open", "in_progress", "completed"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "6px 13px", borderRadius: 20, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
            border: `1px solid ${filter === f ? C.ember : C.border}`,
            background: filter === f ? C.ember + "22" : "transparent",
            color: filter === f ? C.emberSoft : C.textDim
          }}>
            {f === "all" ? "Semua" : statusMeta[f].label}
          </button>
        ))}
      </div>

      <Card C={C} style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: C.panel2 }}>
              {["ID", "Pekerjaan", "Aset", "Tipe", "Prioritas", "Status", "PIC", ""].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(w => (
              <tr key={w.id} style={{ borderTop: `1px solid ${C.border}` }}>
                <td style={tdStyle}><span style={{ color: C.textDim }}>{w.id}</span></td>
                <td style={{ ...tdStyle, color: C.text, fontWeight: 500 }}>{w.title}</td>
                <td style={tdStyle}>{w.asset}</td>
                <td style={{ ...tdStyle, textTransform: "capitalize" }}>{w.type}</td>
                <td style={tdStyle}><Badge color={priorityMeta[w.priority].color}>{priorityMeta[w.priority].label}</Badge></td>
                <td style={tdStyle}><Badge color={statusMeta[w.status].color}>{statusMeta[w.status].label}</Badge></td>
                <td style={tdStyle}>{w.assignee}</td>
                <td style={tdStyle}>
                  {w.status !== "completed" && (
                    <button onClick={() => advanceStatus(w.id)} style={{
                      display: "flex", alignItems: "center", gap: 4, padding: "5px 10px",
                      background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6,
                      color: C.emberSoft, fontSize: 12, fontWeight: 600, cursor: "pointer"
                    }}>
                      {w.status === "open" ? "Mulai" : "Selesaikan"} <ChevronRight size={13} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ---------------- ASSETS ---------------- */
function AssetCard({ asset, C, onSave, onDelete, isEditing, onStartEdit, onStopEdit }) {
  const { statusMeta } = getMeta(C);
  const inputStyle = getInputStyle(C);
  const [draft, setDraft] = useState(asset);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const startEdit = () => { setDraft(asset); onStartEdit(asset.id); };
  const save = () => { onSave({ ...draft, health: Number(draft.health) }); onStopEdit(); };
  const cancel = () => onStopEdit();

  const handleDeleteClick = () => {
    if (confirmDelete) {
      onDelete(asset.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  if (!isEditing) {
    return (
      <Card C={C}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, background: C.ember + "20",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Wrench size={17} color={C.emberSoft} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Badge color={statusMeta[asset.status].color}>{statusMeta[asset.status].label}</Badge>
            <button onClick={startEdit} aria-label="Edit aset" style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 26, height: 26, borderRadius: 6, border: `1px solid ${C.border}`,
              background: "transparent", color: C.textDim, cursor: "pointer"
            }}>
              <Pencil size={13} />
            </button>
            <button onClick={handleDeleteClick} aria-label="Hapus aset" style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 4, height: 26, padding: confirmDelete ? "0 8px" : 0,
              width: confirmDelete ? "auto" : 26, borderRadius: 6,
              border: `1px solid ${confirmDelete ? C.danger : C.border}`,
              background: confirmDelete ? C.danger + "1c" : "transparent",
              color: confirmDelete ? C.danger : C.textDim, cursor: "pointer",
              fontSize: 11.5, fontWeight: 600, whiteSpace: "nowrap"
            }}>
              <Trash2 size={13} />
              {confirmDelete && "Yakin?"}
            </button>
          </div>
        </div>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: C.text, marginBottom: 2 }}>{asset.name}</div>
        <div style={{ fontSize: 12, color: C.textDim, marginBottom: 12 }}>{asset.id} • {asset.location}</div>
        <HealthBar C={C} value={asset.health} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 11.5, color: C.textDim }}>
          <span>Maint. terakhir: {asset.lastMaint}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3, fontSize: 11.5, color: C.textDim }}>
          <span>Maint. berikutnya: {asset.nextMaint}</span>
        </div>
      </Card>
    );
  }

  return (
    <Card C={C} style={{ border: `1px solid ${C.ember}66` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: C.textDim }}>{asset.id}</span>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={save} aria-label="Simpan" style={{
            display: "flex", alignItems: "center", gap: 4, padding: "5px 9px",
            background: C.ember, color: "#fff", border: "none", borderRadius: 6,
            fontSize: 12, fontWeight: 600, cursor: "pointer"
          }}><Save size={12} /> Simpan</button>
          <button onClick={cancel} aria-label="Batal" style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 26, height: 26, borderRadius: 6, border: `1px solid ${C.border}`,
            background: "transparent", color: C.textDim, cursor: "pointer"
          }}><X size={13} /></button>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} style={{ ...inputStyle, width: "100%" }} placeholder="Nama aset" />
        <input value={draft.location} onChange={e => setDraft({ ...draft, location: e.target.value })} style={{ ...inputStyle, width: "100%" }} placeholder="Lokasi" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <select value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value })} style={inputStyle}>
            <option value="running">Beroperasi</option>
            <option value="down">Breakdown</option>
            <option value="maintenance">Maintenance</option>
          </select>
          <select value={draft.criticality} onChange={e => setDraft({ ...draft, criticality: e.target.value })} style={inputStyle}>
            <option value="high">Kritikalitas: Tinggi</option>
            <option value="medium">Kritikalitas: Sedang</option>
            <option value="low">Kritikalitas: Rendah</option>
          </select>
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: C.textDim }}>Health score</span>
            <span style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>{draft.health}%</span>
          </div>
          <input type="range" min={0} max={100} value={draft.health}
            onChange={e => setDraft({ ...draft, health: e.target.value })}
            style={{ width: "100%", accentColor: C.ember }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div>
            <div style={{ fontSize: 11, color: C.textDim, marginBottom: 3 }}>Maint. terakhir</div>
            <input type="date" value={draft.lastMaint} onChange={e => setDraft({ ...draft, lastMaint: e.target.value })} style={{ ...inputStyle, width: "100%" }} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: C.textDim, marginBottom: 3 }}>Maint. berikutnya</div>
            <input type="date" value={draft.nextMaint} onChange={e => setDraft({ ...draft, nextMaint: e.target.value })} style={{ ...inputStyle, width: "100%" }} />
          </div>
        </div>
      </div>
    </Card>
  );
}

function Assets({ assets, setAssets, C }) {
  const inputStyle = getInputStyle(C);
  const [q, setQ] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "", location: "", status: "running", criticality: "medium",
    health: 100, lastMaint: "", nextMaint: ""
  });
  const filtered = assets.filter(a =>
    a.name.toLowerCase().includes(q.toLowerCase()) || a.id.toLowerCase().includes(q.toLowerCase())
  );

  const saveAsset = (updated) => {
    setAssets(assets.map(a => a.id === updated.id ? updated : a));
  };

  const deleteAsset = (id) => {
    setAssets(assets.filter(a => a.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const addAsset = () => {
    if (!form.name.trim()) return;
    const nums = assets
      .map(a => parseInt(a.id.replace("AST-", ""), 10))
      .filter(n => !isNaN(n));
    const nextNum = (nums.length ? Math.max(...nums) : 100) + 1;
    const newId = "AST-" + nextNum;
    setAssets([...assets, { ...form, id: newId, health: Number(form.health) }]);
    setForm({ name: "", location: "", status: "running", criticality: "medium", health: 100, lastMaint: "", nextMaint: "" });
    setShowForm(false);
  };

  return (
    <div>
      <SectionHeader
        C={C}
        title="Asset / Equipment Registry"
        subtitle="Data induk mesin dan peralatan produksi — klik ikon pensil untuk mengubah, tempat sampah untuk hapus"
        action={
          <button onClick={() => setShowForm(!showForm)} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
            background: C.ember, color: "#fff", border: "none", borderRadius: 8,
            fontSize: 13, fontWeight: 600, cursor: "pointer"
          }}>
            <Plus size={15} /> Aset Baru
          </button>
        }
      />

      {showForm && (
        <Card C={C} style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Tambah Aset</div>
            <X size={16} color={C.textDim} style={{ cursor: "pointer" }} onClick={() => setShowForm(false)} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <input placeholder="Nama aset" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
              <input placeholder="Lokasi" value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={inputStyle}>
                <option value="running">Beroperasi</option>
                <option value="down">Breakdown</option>
                <option value="maintenance">Maintenance</option>
              </select>
              <select value={form.criticality} onChange={e => setForm({ ...form, criticality: e.target.value })} style={inputStyle}>
                <option value="high">Kritikalitas: Tinggi</option>
                <option value="medium">Kritikalitas: Sedang</option>
                <option value="low">Kritikalitas: Rendah</option>
              </select>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: C.textDim }}>Health score</span>
                <span style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>{form.health}%</span>
              </div>
              <input type="range" min={0} max={100} value={form.health}
                onChange={e => setForm({ ...form, health: e.target.value })}
                style={{ width: "100%", accentColor: C.ember }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <div style={{ fontSize: 11, color: C.textDim, marginBottom: 3 }}>Maint. terakhir</div>
                <input type="date" value={form.lastMaint} onChange={e => setForm({ ...form, lastMaint: e.target.value })} style={{ ...inputStyle, width: "100%" }} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.textDim, marginBottom: 3 }}>Maint. berikutnya</div>
                <input type="date" value={form.nextMaint} onChange={e => setForm({ ...form, nextMaint: e.target.value })} style={{ ...inputStyle, width: "100%" }} />
              </div>
            </div>
          </div>
          <button onClick={addAsset} style={{
            marginTop: 12, padding: "8px 16px", background: C.ember, color: "#fff",
            border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer"
          }}>Simpan</button>
        </Card>
      )}

      <div style={{ position: "relative", marginBottom: 16, maxWidth: 320 }}>
        <Search size={15} color={C.textDim} style={{ position: "absolute", left: 12, top: 11 }} />
        <input placeholder="Cari aset..." value={q} onChange={e => setQ(e.target.value)}
          style={{ ...inputStyle, paddingLeft: 34, width: "100%" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, alignItems: "start" }}>
        {filtered.map(a => (
          <AssetCard
            key={a.id}
            asset={a}
            C={C}
            onSave={saveAsset}
            onDelete={deleteAsset}
            isEditing={editingId === a.id}
            onStartEdit={setEditingId}
            onStopEdit={() => setEditingId(null)}
          />
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: "1 / -1", padding: "24px 14px", textAlign: "center", color: C.textDim, fontSize: 13 }}>
            Tidak ada aset yang cocok dengan pencarian.
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- PREVENTIVE MAINTENANCE ---------------- */
function PMRow({ pm, C, onSave, onDelete, assetIds, isEditing, onStartEdit, onStopEdit }) {
  const { statusMeta } = getMeta(C);
  const tdStyle = getTdStyle(C);
  const inputStyle = getInputStyle(C);
  const [draft, setDraft] = useState(pm);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const startEdit = () => { setDraft(pm); onStartEdit(pm.id); };
  const save = () => { onSave(draft); onStopEdit(); };

  const handleDeleteClick = () => {
    if (confirmDelete) {
      onDelete(pm.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  if (!isEditing) {
    return (
      <tr style={{ borderTop: `1px solid ${C.border}` }}>
        <td style={tdStyle}><span style={{ color: C.textDim }}>{pm.id}</span></td>
        <td style={tdStyle}>{pm.asset}</td>
        <td style={{ ...tdStyle, color: C.text, fontWeight: 500 }}>{pm.task}</td>
        <td style={tdStyle}>{pm.freq}</td>
        <td style={tdStyle}>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <CalendarClock size={13} color={C.textDim} /> {pm.due}
          </span>
        </td>
        <td style={tdStyle}><Badge color={statusMeta[pm.status].color}>{statusMeta[pm.status].label}</Badge></td>
        <td style={tdStyle}>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={startEdit} aria-label="Edit jadwal" style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 26, height: 26, borderRadius: 6, border: `1px solid ${C.border}`,
              background: "transparent", color: C.textDim, cursor: "pointer"
            }}>
              <Pencil size={13} />
            </button>
            <button onClick={handleDeleteClick} aria-label="Hapus jadwal" style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 4, height: 26, padding: confirmDelete ? "0 8px" : 0,
              width: confirmDelete ? "auto" : 26, borderRadius: 6,
              border: `1px solid ${confirmDelete ? C.danger : C.border}`,
              background: confirmDelete ? C.danger + "1c" : "transparent",
              color: confirmDelete ? C.danger : C.textDim, cursor: "pointer",
              fontSize: 11.5, fontWeight: 600, whiteSpace: "nowrap"
            }}>
              <Trash2 size={13} />
              {confirmDelete && "Yakin?"}
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr style={{ borderTop: `1px solid ${C.border}`, background: C.panel2 }}>
      <td style={tdStyle}><span style={{ color: C.textDim }}>{pm.id}</span></td>
      <td style={tdStyle}>
        <select value={draft.asset} onChange={e => setDraft({ ...draft, asset: e.target.value })} style={inputStyle}>
          {assetIds.map(id => <option key={id} value={id}>{id}</option>)}
        </select>
      </td>
      <td style={tdStyle}>
        <input value={draft.task} onChange={e => setDraft({ ...draft, task: e.target.value })} style={{ ...inputStyle, width: "100%" }} />
      </td>
      <td style={tdStyle}>
        <input value={draft.freq} onChange={e => setDraft({ ...draft, freq: e.target.value })} style={{ ...inputStyle, width: 100 }} />
      </td>
      <td style={tdStyle}>
        <input type="date" value={draft.due} onChange={e => setDraft({ ...draft, due: e.target.value })} style={inputStyle} />
      </td>
      <td style={tdStyle}>
        <select value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value })} style={inputStyle}>
          <option value="upcoming">Terjadwal</option>
          <option value="due_soon">Segera Jatuh Tempo</option>
          <option value="overdue">Terlambat</option>
        </select>
      </td>
      <td style={tdStyle}>
        <button onClick={save} aria-label="Simpan" style={{
          display: "flex", alignItems: "center", gap: 4, padding: "5px 9px",
          background: C.ember, color: "#fff", border: "none", borderRadius: 6,
          fontSize: 12, fontWeight: 600, cursor: "pointer"
        }}><Save size={12} /> Simpan</button>
      </td>
    </tr>
  );
}

function PMSchedule({ pms, setPms, assets, C }) {
  const thStyle = getThStyle(C);
  const inputStyle = getInputStyle(C);
  const assetIds = assets.map(a => a.id);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    asset: assetIds[0], task: "", freq: "Bulanan", due: "", status: "upcoming"
  });

  const savePm = (updated) => {
    setPms(pms.map(p => p.id === updated.id ? updated : p));
  };

  const deletePm = (id) => {
    setPms(pms.filter(p => p.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const addPm = () => {
    if (!form.task.trim() || !form.due) return;
    const nums = pms
      .map(p => parseInt(p.id.replace("PM-", ""), 10))
      .filter(n => !isNaN(n));
    const nextNum = (nums.length ? Math.max(...nums) : 0) + 1;
    const newId = "PM-" + String(nextNum).padStart(2, "0");
    setPms([...pms, { ...form, id: newId }]);
    setForm({ asset: assetIds[0], task: "", freq: "Bulanan", due: "", status: "upcoming" });
    setShowForm(false);
  };

  return (
    <div>
      <SectionHeader
        C={C}
        title="Preventive Maintenance Schedule"
        subtitle="Jadwal perawatan berkala — klik ikon pensil untuk mengubah, tempat sampah untuk hapus"
        action={
          <button onClick={() => setShowForm(!showForm)} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
            background: C.ember, color: "#fff", border: "none", borderRadius: 8,
            fontSize: 13, fontWeight: 600, cursor: "pointer"
          }}>
            <Plus size={15} /> Jadwal PM Baru
          </button>
        }
      />

      {showForm && (
        <Card C={C} style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Tambah Jadwal PM</div>
            <X size={16} color={C.textDim} style={{ cursor: "pointer" }} onClick={() => setShowForm(false)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr 1fr 1fr", gap: 10 }}>
            <select value={form.asset} onChange={e => setForm({ ...form, asset: e.target.value })} style={inputStyle}>
              {assetIds.map(id => <option key={id} value={id}>{id}</option>)}
            </select>
            <input placeholder="Nama tugas maintenance..." value={form.task}
              onChange={e => setForm({ ...form, task: e.target.value })}
              style={{ ...inputStyle, width: "100%" }} />
            <input placeholder="Frekuensi (mis. Bulanan)" value={form.freq}
              onChange={e => setForm({ ...form, freq: e.target.value })}
              style={inputStyle} />
            <input type="date" value={form.due}
              onChange={e => setForm({ ...form, due: e.target.value })}
              style={inputStyle} />
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={inputStyle}>
              <option value="upcoming">Terjadwal</option>
              <option value="due_soon">Segera Jatuh Tempo</option>
              <option value="overdue">Terlambat</option>
            </select>
          </div>
          <button onClick={addPm} style={{
            marginTop: 12, padding: "8px 16px", background: C.ember, color: "#fff",
            border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer"
          }}>Simpan</button>
        </Card>
      )}

      <Card C={C} style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: C.panel2 }}>
              {["ID", "Aset", "Tugas", "Frekuensi", "Jatuh Tempo", "Status", ""].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pms.map(p => (
              <PMRow
                key={p.id}
                pm={p}
                C={C}
                onSave={savePm}
                onDelete={deletePm}
                assetIds={assetIds}
                isEditing={editingId === p.id}
                onStartEdit={setEditingId}
                onStopEdit={() => setEditingId(null)}
              />
            ))}
            {pms.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: "24px 14px", textAlign: "center", color: C.textDim, fontSize: 13 }}>
                  Belum ada jadwal PM. Klik "Jadwal PM Baru" untuk menambahkan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ---------------- KPI / REPORTING ---------------- */
function KPIReport({ assets, workOrders, C }) {
  const { statusMeta } = getMeta(C);
  const completed = workOrders.filter(w => w.status === "completed").length;
  const total = workOrders.length;
  const complianceRate = Math.round((completed / total) * 100);
  const mttr = 4.2;
  const mtbf = 186;
  const avgHealth = Math.round(assets.reduce((s, a) => s + a.health, 0) / assets.length);

  const kpis = [
    { label: "PM Compliance Rate", value: `${complianceRate}%`, trend: "up", icon: CheckCircle2, color: C.ok },
    { label: "MTTR (Mean Time to Repair)", value: `${mttr} jam`, trend: "down", icon: Clock, color: C.warn },
    { label: "MTBF (Mean Time Between Failure)", value: `${mtbf} jam`, trend: "up", icon: TrendingUp, color: C.ok },
    { label: "Overall Equipment Health", value: `${avgHealth}%`, trend: "up", icon: Gauge, color: C.emberSoft },
  ];

  const byCriticality = ["high", "medium", "low"].map(c => ({
    level: c, count: assets.filter(a => a.criticality === c).length
  }));

  return (
    <div>
      <SectionHeader C={C} title="Dashboard & Reporting KPI" subtitle="Indikator kinerja utama aktivitas maintenance" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        {kpis.map(k => (
          <Card C={C} key={k.label}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, background: k.color + "20",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <k.icon size={16} color={k.color} />
              </div>
              {k.trend === "up"
                ? <TrendingUp size={15} color={C.ok} />
                : <TrendingDown size={15} color={C.danger} />}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: C.text }}>{k.value}</div>
            <div style={{ fontSize: 12, color: C.textDim, marginTop: 4 }}>{k.label}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Card C={C}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 14 }}>Distribusi Kritikalitas Aset</div>
          {byCriticality.map(b => (
            <div key={b.level} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 13 }}>
                <span style={{ color: C.text, textTransform: "capitalize" }}>{b.level === "high" ? "Tinggi" : b.level === "medium" ? "Sedang" : "Rendah"}</span>
                <span style={{ color: C.textDim }}>{b.count} aset</span>
              </div>
              <div style={{ height: 6, borderRadius: 4, background: C.panel2 }}>
                <div style={{
                  width: `${(b.count / assets.length) * 100}%`, height: "100%", borderRadius: 4,
                  background: b.level === "high" ? C.danger : b.level === "medium" ? C.warn : C.steel
                }} />
              </div>
            </div>
          ))}
        </Card>

        <Card C={C}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 14 }}>Status Work Order</div>
          {["open", "in_progress", "completed"].map(s => {
            const count = workOrders.filter(w => w.status === s).length;
            return (
              <div key={s} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                <Badge color={statusMeta[s].color}>{statusMeta[s].label}</Badge>
                <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{count}</span>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}

export default function CMMSDemo() {
  const [themeName, setThemeName] = useState("dark");
  const C = THEMES[themeName];
  const [tab, setTab] = useState("dashboard");
  const [assets, setAssets] = useState(seedAssets);
  const [workOrders, setWorkOrders] = useState(seedWorkOrders);
  const [pms, setPms] = useState(seedPM);

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "wo", label: "Work Order", icon: ClipboardList },
    { id: "assets", label: "Aset / Peralatan", icon: Boxes },
    { id: "pm", label: "Jadwal PM", icon: CalendarClock },
    { id: "kpi", label: "KPI & Laporan", icon: Gauge },
  ];

  return (
    <div style={{
      display: "flex", minHeight: "100vh", width: "100%", background: C.bg,
      fontFamily: "'Inter', -apple-system, sans-serif"
    }}>
      {/* Sidebar */}
      <div style={{ width: 224, flexShrink: 0, background: C.panel, borderRight: `1px solid ${C.border}`, padding: "20px 14px", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 6px", marginBottom: 26 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8, background: C.ember,
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Wrench size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>WMCMMS</div>
            <div style={{ fontSize: 10.5, color: C.textDim }}>WM Factory</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {tabs.map(t => (
            <NavItem C={C} key={t.id} icon={t.icon} label={t.label} active={tab === t.id} onClick={() => setTab(t.id)} />
          ))}
        </div>

        <button
          onClick={() => setThemeName(themeName === "dark" ? "light" : "dark")}
          style={{
            display: "flex", alignItems: "center", gap: 9, marginTop: 16,
            padding: "9px 14px", borderRadius: 8, border: `1px solid ${C.border}`,
            background: "transparent", color: C.steel, fontSize: 13, fontWeight: 500,
            cursor: "pointer"
          }}
        >
          {themeName === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          {themeName === "dark" ? "Mode terang" : "Mode gelap"}
        </button>

        <div style={{ marginTop: "auto", padding: "12px 6px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 11, color: C.textDim, lineHeight: 1.5 }}>
            WM - Training<br />
            <span style={{ color: C.steelLight }}>Maintenance of Machine Tools</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: 26, overflowY: "auto" }}>
        {tab === "dashboard" && <Dashboard C={C} assets={assets} workOrders={workOrders} pms={pms} />}
        {tab === "wo" && <WorkOrders C={C} workOrders={workOrders} setWorkOrders={setWorkOrders} assets={assets} />}
        {tab === "assets" && <Assets C={C} assets={assets} setAssets={setAssets} />}
        {tab === "pm" && <PMSchedule C={C} pms={pms} setPms={setPms} assets={assets} />}
        {tab === "kpi" && <KPIReport C={C} assets={assets} workOrders={workOrders} />}
      </div>
    </div>
  );
}