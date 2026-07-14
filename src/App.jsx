import React, { useState, useEffect, useMemo } from "react";
import {
  LayoutDashboard, Wrench, ClipboardList, Boxes, CalendarClock,
  AlertTriangle, CheckCircle2, Clock, Plus, X, ChevronRight, ChevronLeft,
  Search, Gauge, TrendingUp, TrendingDown, Factory, Sun, Moon,
  Pencil, Save, Trash2, ArrowLeft, History, Link2, ShieldAlert, HelpCircle, Info
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

/* ===================================================
   THEME: "Industrial Steel & Ember"
=================================================== */
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

/* ===================================================
   ID GENERATOR — counter global murni naik, tidak pernah
   dihitung ulang dari isi array (itu penyebab bug lama:
   filter+length salah sehingga mentok di angka yang sama).
=================================================== */
function createIdCounter(prefix, startAt) {
  let counter = startAt;
  return () => {
    const year = new Date().getFullYear();
    const num = String(counter).padStart(3, "0");
    counter += 1;
    return `${prefix}-${year}-${num}`;
  };
}

/* ===================================================
   SEED DATA
=================================================== */
const seedAssets = [
  { id: "AST-101", name: "CNC Milling Machine #1", location: "Line A - Bay 3", status: "running", health: 92, lastMaint: "2026-06-15", nextMaint: "2026-07-15", criticality: "high" },
  { id: "AST-102", name: "Hydraulic Press #2", location: "Line A - Bay 5", status: "running", health: 78, lastMaint: "2026-06-01", nextMaint: "2026-07-10", criticality: "high" },
  { id: "AST-103", name: "Conveyor Belt Unit 4", location: "Line B - Bay 1", status: "down", health: 34, lastMaint: "2026-05-20", nextMaint: "2026-07-05", criticality: "medium" },
  { id: "AST-104", name: "Air Compressor Unit A", location: "Utility Room", status: "running", health: 88, lastMaint: "2026-06-20", nextMaint: "2026-08-01", criticality: "medium" },
  { id: "AST-105", name: "Lathe Machine #3", location: "Line A - Bay 2", status: "maintenance", health: 55, lastMaint: "2026-07-08", nextMaint: "2026-07-18", criticality: "low" },
  { id: "AST-106", name: "Cooling Tower System", location: "Utility Yard", status: "running", health: 95, lastMaint: "2026-06-25", nextMaint: "2026-08-10", criticality: "high" },
];

const seedWorkOrders = [
  { id: "WO-2026-041", asset: "AST-103", title: "Belt tracking misalignment", type: "corrective", priority: "critical", status: "open", assignee: "Andi P.", created: "2026-07-10", startedAt: "2026-07-10", completedAt: "", sourcePmId: null },
  { id: "WO-2026-040", asset: "AST-105", title: "Scheduled spindle inspection", type: "preventive", priority: "medium", status: "in_progress", assignee: "Budi S.", created: "2026-07-08", startedAt: "2026-07-08", completedAt: "", sourcePmId: null },
  { id: "WO-2026-039", asset: "AST-102", title: "Hydraulic fluid replacement", type: "preventive", priority: "low", status: "in_progress", assignee: "Citra W.", created: "2026-07-07", startedAt: "2026-07-07", completedAt: "", sourcePmId: null },
  { id: "WO-2026-038", asset: "AST-101", title: "Vibration anomaly check", type: "predictive", priority: "high", status: "open", assignee: "Unassigned", created: "2026-07-09", startedAt: "2026-07-09", completedAt: "", sourcePmId: null },
  { id: "WO-2026-037", asset: "AST-104", title: "Monthly filter replacement", type: "preventive", priority: "low", status: "completed", assignee: "Andi P.", created: "2026-06-28", startedAt: "2026-06-28", completedAt: "2026-06-28", sourcePmId: null },
  { id: "WO-2026-036", asset: "AST-106", title: "Quarterly water treatment check", type: "preventive", priority: "medium", status: "completed", assignee: "Dedi R.", created: "2026-06-25", startedAt: "2026-06-25", completedAt: "2026-06-25", sourcePmId: null },
  { id: "WO-2026-035", asset: "AST-103", title: "Conveyor motor overheating", type: "corrective", priority: "critical", status: "completed", assignee: "Andi P.", created: "2026-06-14", startedAt: "2026-06-14 08:00", completedAt: "2026-06-14 13:30", sourcePmId: null },
  { id: "WO-2026-034", asset: "AST-102", title: "Hydraulic seal leak", type: "corrective", priority: "high", status: "completed", assignee: "Citra W.", created: "2026-06-02", startedAt: "2026-06-02 09:15", completedAt: "2026-06-02 12:45", sourcePmId: null },
  { id: "WO-2026-033", asset: "AST-105", title: "Chuck jamming during operation", type: "corrective", priority: "high", status: "completed", assignee: "Budi S.", created: "2026-05-20", startedAt: "2026-05-20 07:30", completedAt: "2026-05-20 12:00", sourcePmId: null },
  { id: "WO-2026-032", asset: "AST-103", title: "Belt tear — emergency stop", type: "corrective", priority: "critical", status: "completed", assignee: "Andi P.", created: "2026-05-08", startedAt: "2026-05-08 10:00", completedAt: "2026-05-08 16:15", sourcePmId: null },
  { id: "WO-2026-031", asset: "AST-104", title: "Compressor pressure drop", type: "corrective", priority: "medium", status: "completed", assignee: "Dedi R.", created: "2026-04-22", startedAt: "2026-04-22 08:45", completedAt: "2026-04-22 11:20", sourcePmId: null },
  { id: "WO-2026-030", asset: "AST-102", title: "Hydraulic pressure irregular", type: "corrective", priority: "high", status: "completed", assignee: "Citra W.", created: "2026-04-05", startedAt: "2026-04-05 09:00", completedAt: "2026-04-05 15:40", sourcePmId: null },
  { id: "WO-2026-029", asset: "AST-103", title: "Roller bearing failure", type: "corrective", priority: "critical", status: "completed", assignee: "Andi P.", created: "2026-03-18", startedAt: "2026-03-18 07:00", completedAt: "2026-03-18 14:20", sourcePmId: null },
  { id: "WO-2026-028", asset: "AST-101", title: "Spindle vibration excessive", type: "corrective", priority: "medium", status: "completed", assignee: "Budi S.", created: "2026-03-02", startedAt: "2026-03-02 09:30", completedAt: "2026-03-02 12:10", sourcePmId: null },
].map(w => ({ ...w, cycleProcessed: true, assetImpactOpened: true, assetImpactCompleted: true }));
// ^ Data historis awal ditandai "sudah diproses" supaya efek otomatis
//   (auto-cycle PM & dampak ke status/health aset) hanya berlaku untuk
//   WO yang dibuat/diselesaikan lewat interaksi pengguna setelah app berjalan,
//   bukan menimpa kondisi aset yang sudah sengaja diatur di seed data.

const seedPM = [
  { id: "PM-2026-001", asset: "AST-101", task: "Pelumasan spindle & pemeriksaan alignment", freq: "Bulanan", due: "2026-07-15", pic: "Andi P.", linkedWO: null },
  { id: "PM-2026-002", asset: "AST-102", task: "Penggantian oli hidrolik", freq: "Bulanan", due: "2026-07-10", pic: "Citra W.", linkedWO: null },
  { id: "PM-2026-003", asset: "AST-103", task: "Inspeksi belt & roller conveyor", freq: "Mingguan", due: "2026-07-05", pic: "Andi P.", linkedWO: null },
  { id: "PM-2026-004", asset: "AST-104", task: "Penggantian filter udara", freq: "Bulanan", due: "2026-08-01", pic: "Dedi R.", linkedWO: null },
  { id: "PM-2026-005", asset: "AST-105", task: "Kalibrasi tailstock & pemeriksaan chuck", freq: "3 Bulanan", due: "2026-07-18", pic: "Budi S.", linkedWO: null },
  { id: "PM-2026-006", asset: "AST-106", task: "Pemeriksaan kualitas air pendingin", freq: "3 Bulanan", due: "2026-08-10", pic: "Dedi R.", linkedWO: null },
];

/* ---------------------------------------------------
   FMEA — Failure Mode and Effects Analysis.
   Skenario dipilih agar selaras dengan riwayat WO korektif
   yang sudah ada di seedWorkOrders (mis. AST-103 sering
   bermasalah di bagian belt — cocok dengan failure mode-nya).
   RPN = Severity x Occurrence x Detection (skala 1-10).
   linkedPmId: diisi kalau sudah dibuatkan jadwal PM mitigasi.
--------------------------------------------------- */
const seedFMEA = [
  {
    id: "FM-2026-001", asset: "AST-103",
    component: "Belt & Roller Conveyor",
    failureMode: "Belt bergeser / tidak center (misalignment)",
    effect: "Material macet, line berhenti, berpotensi kerusakan roller",
    cause: "Tension belt tidak terjaga, roller aus",
    severity: 8, occurrence: 7, detection: 4,
    linkedPmId: "PM-2026-003",
  },
  {
    id: "FM-2026-002", asset: "AST-103",
    component: "Motor Penggerak Conveyor",
    failureMode: "Motor overheating",
    effect: "Line berhenti total, motor berpotensi terbakar",
    cause: "Beban berlebih, ventilasi motor tersumbat debu",
    severity: 9, occurrence: 4, detection: 5,
    linkedPmId: null,
  },
  {
    id: "FM-2026-003", asset: "AST-102",
    component: "Sistem Hidrolik",
    failureMode: "Kebocoran seal hidrolik",
    effect: "Tekanan turun, hasil pengepresan tidak presisi",
    cause: "Seal aus karena usia pakai, kualitas oli menurun",
    severity: 6, occurrence: 6, detection: 5,
    linkedPmId: "PM-2026-002",
  },
  {
    id: "FM-2026-004", asset: "AST-101",
    component: "Spindle",
    failureMode: "Vibrasi berlebih saat operasi",
    effect: "Hasil machining tidak presisi, permukaan produk cacat",
    cause: "Bearing spindle aus, ketidakseimbangan alat potong",
    severity: 7, occurrence: 3, detection: 3,
    linkedPmId: "PM-2026-001",
  },
  {
    id: "FM-2026-005", asset: "AST-105",
    component: "Chuck",
    failureMode: "Chuck macet / tidak mencekam sempurna",
    effect: "Benda kerja lepas saat operasi, risiko keselamatan",
    cause: "Kotoran/serpihan menumpuk, pelumasan kurang",
    severity: 9, occurrence: 3, detection: 6,
    linkedPmId: "PM-2026-005",
  },
  {
    id: "FM-2026-006", asset: "AST-104",
    component: "Kompresor",
    failureMode: "Tekanan udara turun drastis",
    effect: "Alat pneumatik di line tidak berfungsi optimal",
    cause: "Filter udara tersumbat, kebocoran pada pipa",
    severity: 5, occurrence: 5, detection: 3,
    linkedPmId: "PM-2026-004",
  },
];

/* ---------------------------------------------------
   DATA HISTORIS 6 BULAN — untuk grafik tren di KPI & Laporan
--------------------------------------------------- */
const healthTrend = [
  { bulan: "Feb", "AST-101": 97, "AST-102": 88, "AST-103": 72, rata2: 86 },
  { bulan: "Mar", "AST-101": 96, "AST-102": 86, "AST-103": 65, rata2: 82 },
  { bulan: "Apr", "AST-101": 95, "AST-102": 83, "AST-103": 58, rata2: 79 },
  { bulan: "Mei", "AST-101": 94, "AST-102": 81, "AST-103": 47, rata2: 74 },
  { bulan: "Jun", "AST-101": 93, "AST-102": 79, "AST-103": 40, rata2: 71 },
  { bulan: "Jul", "AST-101": 92, "AST-102": 78, "AST-103": 34, rata2: 68 },
];

const reliabilityTrend = [
  { bulan: "Feb", mttr: 6.8, mtbf: 132 },
  { bulan: "Mar", mttr: 6.1, mtbf: 145 },
  { bulan: "Apr", mttr: 5.5, mtbf: 158 },
  { bulan: "Mei", mttr: 5.0, mtbf: 168 },
  { bulan: "Jun", mttr: 4.6, mtbf: 176 },
  { bulan: "Jul", mttr: 4.2, mtbf: 186 },
];

const woTrend = [
  { bulan: "Feb", korektif: 14, preventif: 6 },
  { bulan: "Mar", korektif: 12, preventif: 8 },
  { bulan: "Apr", korektif: 10, preventif: 10 },
  { bulan: "Mei", korektif: 8, preventif: 12 },
  { bulan: "Jun", korektif: 6, preventif: 14 },
  { bulan: "Jul", korektif: 5, preventif: 15 },
];

/* ===================================================
   METADATA & KALKULASI
=================================================== */
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

function calcMTTR(workOrders) {
  const finished = workOrders.filter(
    w => w.type === "corrective" && w.status === "completed" && w.startedAt && w.completedAt
  );
  if (finished.length === 0) return null;
  const totalHours = finished.reduce((sum, w) => {
    const start = new Date(w.startedAt.length > 10 ? w.startedAt : w.startedAt + " 00:00");
    const end = new Date(w.completedAt.length > 10 ? w.completedAt : w.completedAt + " 00:00");
    const hours = (end - start) / (1000 * 60 * 60);
    return sum + Math.max(hours, 0);
  }, 0);
  return { value: totalHours / finished.length, sampleSize: finished.length };
}

function calcMTBF(workOrders) {
  const corrective = workOrders.filter(w => w.type === "corrective" && w.status === "completed" && w.startedAt);
  const byAsset = {};
  corrective.forEach(w => {
    if (!byAsset[w.asset]) byAsset[w.asset] = [];
    byAsset[w.asset].push(new Date(w.startedAt.length > 10 ? w.startedAt : w.startedAt + " 00:00"));
  });
  const gaps = [];
  Object.values(byAsset).forEach(dates => {
    dates.sort((a, b) => a - b);
    for (let i = 1; i < dates.length; i++) {
      const hours = (dates[i] - dates[i - 1]) / (1000 * 60 * 60);
      if (hours > 0) gaps.push(hours);
    }
  });
  if (gaps.length === 0) return null;
  const avgHours = gaps.reduce((s, h) => s + h, 0) / gaps.length;
  return { value: avgHours, sampleSize: gaps.length };
}

const DUE_SOON_WINDOW_DAYS = 7;

function computeAutoPmStatus(due) {
  if (!due) return "upcoming";
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const dueDate = new Date(due + "T00:00:00");
  const diffDays = Math.round((dueDate - today) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "overdue";
  if (diffDays <= DUE_SOON_WINDOW_DAYS) return "due_soon";
  return "upcoming";
}

function freqToDays(freq) {
  const f = (freq || "").toLowerCase();
  const m = f.match(/(\d+)/);
  const multiplier = m ? parseInt(m[1], 10) : 1;
  if (f.includes("minggu")) return 7 * multiplier;
  if (f.includes("tahun")) return 365 * multiplier;
  return 30 * multiplier;
}

function addDays(dateStr, days) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  const pad = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function nowStamp() {
  const d = new Date();
  const pad = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function todayStr() {
  return nowStamp().split(" ")[0];
}

/* ===================================================
   FMEA — kalkulasi RPN (Risk Priority Number)
=================================================== */
function calcRPN(severity, occurrence, detection) {
  return Number(severity) * Number(occurrence) * Number(detection);
}

// Kategori risiko berdasarkan RPN (skala umum 1-1000, S/O/D masing-masing 1-10)
function rpnCategory(rpn, C) {
  if (rpn >= 200) return { label: "Kritis", color: C.danger };
  if (rpn >= 100) return { label: "Tinggi", color: C.emberSoft };
  if (rpn >= 50) return { label: "Sedang", color: C.warn };
  return { label: "Rendah", color: C.steel };
}

/* ===================================================
   SKALA SOD — panduan penilaian Severity, Occurrence,
   Detection (adaptasi standar AIAG, skala 1-10).
   Dipakai sebagai referensi visual saat mengisi form FMEA
   supaya peserta training paham dasar penilaiannya,
   bukan sekadar menebak angka.
=================================================== */
const severityScale = [
  { range: "9-10", label: "Berbahaya", desc: "Membahayakan keselamatan operator/pengguna, melanggar regulasi, tanpa peringatan" },
  { range: "7-8",  label: "Sangat Tinggi", desc: "Line produksi berhenti total, produk tidak bisa dipakai sama sekali" },
  { range: "5-6",  label: "Sedang", desc: "Sebagian fungsi terganggu, produk masih bisa dipakai dengan penurunan performa" },
  { range: "3-4",  label: "Rendah", desc: "Gangguan ringan, hampir tidak terasa oleh operasi/pengguna" },
  { range: "1-2",  label: "Minor", desc: "Tidak ada dampak nyata terhadap fungsi atau keselamatan" },
];

const occurrenceScale = [
  { range: "9-10", label: "Sangat Sering", desc: "Hampir pasti terjadi — lebih dari sekali per minggu" },
  { range: "7-8",  label: "Sering", desc: "Terjadi berulang — sekitar sekali per bulan" },
  { range: "5-6",  label: "Cukup Sering", desc: "Terjadi sesekali — beberapa kali per tahun" },
  { range: "3-4",  label: "Jarang", desc: "Pernah terjadi — sekali dalam 1-2 tahun" },
  { range: "1-2",  label: "Sangat Jarang", desc: "Hampir tidak pernah terjadi dalam riwayat operasi" },
];

const detectionScale = [
  { range: "9-10", label: "Hampir Tidak Terdeteksi", desc: "Tidak ada metode deteksi, gagal tanpa tanda sama sekali" },
  { range: "7-8",  label: "Sulit Terdeteksi", desc: "Deteksi hanya lewat inspeksi manual sesekali, mudah terlewat" },
  { range: "5-6",  label: "Cukup Terdeteksi", desc: "Ada metode deteksi (visual/manual check rutin), tapi tidak selalu konsisten" },
  { range: "3-4",  label: "Mudah Terdeteksi", desc: "Ada sensor/indikator otomatis, terdeteksi sebelum berdampak besar" },
  { range: "1-2",  label: "Hampir Pasti Terdeteksi", desc: "Sistem deteksi otomatis andal, gagal langsung terlihat sebelum menyebar" },
];

// Menerjemahkan nilai 1-10 yang diinput jadi label kualitatif dari tabel skala,
// supaya peserta training langsung lihat makna angkanya secara real-time.
function scaleLabelFor(scale, value) {
  const n = Number(value);
  if (isNaN(n)) return "";
  for (const s of scale) {
    const [lo, hi] = s.range.split("-").map(Number);
    if (n >= lo && n <= hi) return `${n} — ${s.label}`;
  }
  return "";
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

function StatCard({ icon: Icon, label, value, sub, accent, C, onClick }) {
  return (
    <Card C={C} style={{ display: "flex", flexDirection: "column", gap: 10, cursor: onClick ? "pointer" : "default" }}>
      <div onClick={onClick} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
      </div>
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

function SectionHeader({ title, subtitle, action, C, onBack }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
      <div>
        {onBack && (
          <button onClick={onBack} style={{
            display: "flex", alignItems: "center", gap: 5, marginBottom: 8,
            background: "transparent", border: "none", color: C.textDim,
            fontSize: 12.5, fontWeight: 600, cursor: "pointer", padding: 0
          }}>
            <ArrowLeft size={14} /> Kembali
          </button>
        )}
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

// Tombol berupa teks yang berperilaku seperti link, dipakai untuk
// membuat ID/nama entitas (aset, WO, PM) bisa diklik untuk navigasi
// ke halaman detail terkait — inti dari "korelasi antar menu".
// Underline hanya muncul saat hover, supaya tabel/list tidak ramai visual.
function LinkButton({ children, onClick, C, icon: Icon }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        background: "transparent", border: "none", padding: 0,
        color: C.emberSoft, fontSize: "inherit", fontWeight: 600,
        cursor: "pointer",
        textDecoration: hover ? "underline" : "none",
        textUnderlineOffset: 2,
        transition: "color 0.12s"
      }}
    >
      {Icon && <Icon size={12} />}
      {children}
    </button>
  );
}

/* ===================================================
   TENTANG APLIKASI — pengantar konsep CMMS secara umum
   dan konteks materi training, ditampilkan lewat tombol
   "Tentang" di sidebar bawah.
=================================================== */
const cmmsPillars = [
  {
    icon: ClipboardList,
    title: "Work Order Management",
    desc: "Mencatat, menugaskan, dan melacak setiap pekerjaan maintenance — baik yang sifatnya korektif (perbaikan setelah rusak), preventif (terjadwal), maupun prediktif (berdasarkan kondisi)."
  },
  {
    icon: Boxes,
    title: "Asset Registry",
    desc: "Basis data induk seluruh mesin dan peralatan — lokasi, status, tingkat kritikalitas, dan kondisi kesehatannya (health score)."
  },
  {
    icon: CalendarClock,
    title: "Preventive Maintenance",
    desc: "Jadwal perawatan berkala supaya kerusakan dicegah sebelum terjadi, bukan ditangani setelah mesin berhenti beroperasi."
  },
  {
    icon: ShieldAlert,
    title: "FMEA (Risk Analysis)",
    desc: "Pendekatan berbasis risiko — mengidentifikasi cara suatu komponen bisa gagal, lalu memprioritaskan mitigasi berdasarkan tingkat risikonya (RPN)."
  },
  {
    icon: Gauge,
    title: "KPI & Reporting",
    desc: "Indikator kinerja seperti MTTR, MTBF, dan PM Compliance Rate untuk mengukur efektivitas program maintenance dari waktu ke waktu."
  },
];

function AboutModal({ C, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: 20
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12,
          maxWidth: 640, width: "100%", maxHeight: "85vh", overflowY: "auto",
          padding: 24, boxShadow: "0 20px 60px rgba(0,0,0,0.4)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8, background: C.ember,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Wrench size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: C.text }}>Tentang WLDN-CMMS</div>
              <div style={{ fontSize: 11.5, color: C.textDim }}>Materi Training — Maintenance of Machine Tools</div>
            </div>
          </div>
          <button onClick={onClose} style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 28, height: 28, borderRadius: 7, border: `1px solid ${C.border}`,
            background: "transparent", color: C.textDim, cursor: "pointer", flexShrink: 0
          }}>
            <X size={15} />
          </button>
        </div>

        <p style={{ fontSize: 13, color: C.textDim, lineHeight: 1.6, margin: "14px 0 6px" }}>
          <b style={{ color: C.text }}>CMMS (Computerized Maintenance Management System)</b> adalah
          perangkat lunak yang membantu tim maintenance mengelola seluruh siklus perawatan aset —
          mulai dari pencatatan aset, penjadwalan perawatan, penugasan pekerjaan, hingga pelaporan
          kinerja — secara terpusat dan terdokumentasi, menggantikan pencatatan manual di kertas
          atau spreadsheet yang mudah tercecer.
        </p>
        <p style={{ fontSize: 13, color: C.textDim, lineHeight: 1.6, margin: "0 0 18px" }}>
          <b style={{ color: C.text }}>WLDN-CMMS</b> ini adalah aplikasi demo interaktif yang dibangun
          khusus untuk keperluan pelatihan — menyimulasikan bagaimana modul-modul dalam CMMS
          sungguhan saling terhubung satu sama lain dalam alur kerja maintenance sehari-hari.
        </p>

        <div style={{ fontSize: 12.5, fontWeight: 700, color: C.text, marginBottom: 10 }}>
          Modul yang Tercakup
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
          {cmmsPillars.map(p => (
            <div key={p.title} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{
                width: 30, height: 30, borderRadius: 7, background: C.ember + "18",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1
              }}>
                <p.icon size={15} color={C.emberSoft} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 2 }}>{p.title}</div>
                <div style={{ fontSize: 12, color: C.textDim, lineHeight: 1.5 }}>{p.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          padding: 14, borderRadius: 8,
          background: C.panel2, border: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", gap: 12
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%", background: C.ember,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 700, fontSize: 15, flexShrink: 0
          }}>
            WM
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Wildan Maradona, S.T.</div>
            <div style={{ fontSize: 12, color: C.textDim }}>Pemateri — WM Training</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================================================
   PENJELASAN MTTR & MTBF — modal popup dengan ilustrasi
   garis waktu sederhana, supaya peserta training langsung
   paham maknanya tanpa perlu menghafal rumus dulu.
=================================================== */
function MTTRMTBFTimeline({ C }) {
  // Ilustrasi: Beroperasi -> Rusak -> Diperbaiki (MTTR) -> Beroperasi lagi (MTBF) -> Rusak lagi
  const W = 560, H = 120;
  const segments = [
    { x: 10,  w: 150, color: C.ok,     label: "Beroperasi" },
    { x: 160, w: 60,   color: C.danger, label: "MTTR" },
    { x: 220, w: 240, color: C.ok,     label: "Beroperasi (MTBF)" },
    { x: 460, w: 60,   color: C.danger, label: "MTTR" },
  ];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: "block" }}>
      {/* garis dasar waktu */}
      <line x1={10} y1={60} x2={W - 10} y2={60} stroke={C.border} strokeWidth={2} />
      {segments.map((s, i) => (
        <g key={i}>
          <rect x={s.x} y={48} width={s.w} height={24} rx={5} fill={s.color} opacity={0.85} />
          <text x={s.x + s.w / 2} y={40} textAnchor="middle" fontSize="10.5" fontWeight="700" fill={C.text}>
            {s.label}
          </text>
        </g>
      ))}
      {/* penanda kejadian breakdown */}
      <circle cx={160} cy={60} r={4} fill={C.danger} />
      <text x={160} y={90} textAnchor="middle" fontSize="10" fill={C.textDim}>Breakdown #1</text>
      <circle cx={460} cy={60} r={4} fill={C.danger} />
      <text x={460} y={90} textAnchor="middle" fontSize="10" fill={C.textDim}>Breakdown #2</text>

      <text x={190} y={112} textAnchor="middle" fontSize="10.5" fontWeight="700" fill={C.danger}>
        ← MTTR: waktu perbaikan →
      </text>
      <text x={340} y={112} textAnchor="middle" fontSize="10.5" fontWeight="700" fill={C.ok}>
        ← MTBF: jarak antar breakdown →
      </text>
    </svg>
  );
}

function MTTRMTBFInfoModal({ C, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: 20
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12,
          maxWidth: 640, width: "100%", maxHeight: "85vh", overflowY: "auto",
          padding: 24, boxShadow: "0 20px 60px rgba(0,0,0,0.4)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8, background: C.ember + "20",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Gauge size={18} color={C.emberSoft} />
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: C.text }}>Apa itu MTTR & MTBF?</div>
          </div>
          <button onClick={onClose} style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 28, height: 28, borderRadius: 7, border: `1px solid ${C.border}`,
            background: "transparent", color: C.textDim, cursor: "pointer", flexShrink: 0
          }}>
            <X size={15} />
          </button>
        </div>

        <p style={{ fontSize: 13, color: C.textDim, lineHeight: 1.6, margin: "10px 0 16px" }}>
          Keduanya adalah indikator standar untuk mengukur <b style={{ color: C.text }}>keandalan</b> (reliability)
          dan <b style={{ color: C.text }}>kecepatan respons</b> tim maintenance. Cara termudah memahaminya:
          bayangkan garis waktu operasi sebuah mesin di bawah ini.
        </p>

        <div style={{
          padding: "14px 8px", borderRadius: 8, background: C.panel2,
          border: `1px solid ${C.border}`, marginBottom: 18
        }}>
          <MTTRMTBFTimeline C={C} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ paddingBottom: 12, borderBottom: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.warn, marginBottom: 4 }}>
              MTTR — Mean Time To Repair
            </div>
            <div style={{ fontSize: 12.5, color: C.textDim, lineHeight: 1.6 }}>
              <b style={{ color: C.text }}>"Begitu mesin rusak, rata-rata berapa lama sampai kembali normal?"</b>
              <br />
              Dihitung dari rata-rata (waktu selesai − waktu mulai dikerjakan) pada seluruh Work Order
              korektif yang sudah selesai. <b style={{ color: C.ok }}>Semakin kecil, semakin baik</b> — artinya
              tim maintenance makin cekatan menangani kerusakan.
            </div>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.ok, marginBottom: 4 }}>
              MTBF — Mean Time Between Failure
            </div>
            <div style={{ fontSize: 12.5, color: C.textDim, lineHeight: 1.6 }}>
              <b style={{ color: C.text }}>"Rata-rata mesin bisa beroperasi berapa lama sebelum rusak lagi?"</b>
              <br />
              Dihitung dari rata-rata jarak waktu antar kejadian breakdown yang berurutan pada satu aset.
              <b style={{ color: C.ok }}> Semakin besar, semakin baik</b> — artinya mesin makin andal dan
              jarang mengalami kegagalan mendadak.
            </div>
          </div>
        </div>

        <div style={{
          marginTop: 16, padding: 12, borderRadius: 8,
          background: C.panel2, border: `1px solid ${C.border}`
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 4 }}>Cara membacanya bersamaan</div>
          <div style={{ fontSize: 12, color: C.textDim, lineHeight: 1.6 }}>
            <b style={{ color: C.text }}>MTTR turun + MTBF naik</b> = program maintenance yang membaik: kerusakan
            makin jarang terjadi (MTBF naik), dan ketika toh terjadi, penanganannya makin cepat (MTTR turun).
            Ini pola yang ingin dicapai lewat penerapan preventive maintenance dan FMEA secara konsisten.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================================================
   PENJELASAN KONSEP FMEA — modal popup berisi pemaparan
   dasar FMEA, RPN, dan istilah-istilah terkait untuk
   peserta training yang baru mengenal metode ini.
=================================================== */
const fmeaGlossary = [
  { term: "FMEA", def: "Failure Mode and Effects Analysis — metode sistematis untuk mengidentifikasi cara suatu komponen bisa gagal (failure mode), dampaknya (effect), dan penyebabnya (cause), sebelum kegagalan itu benar-benar terjadi." },
  { term: "Failure Mode", def: "Cara spesifik suatu komponen gagal menjalankan fungsinya. Contoh: \"belt bergeser dari jalurnya\", bukan sekadar \"belt rusak\"." },
  { term: "Effect", def: "Dampak yang dirasakan jika failure mode itu terjadi — bisa ke proses produksi, kualitas produk, atau keselamatan operator." },
  { term: "Cause", def: "Akar penyebab yang memicu failure mode terjadi. Satu failure mode bisa punya lebih dari satu penyebab." },
  { term: "Severity (S)", def: "Seberapa parah dampak (effect) yang ditimbulkan, dinilai 1 (nyaris tidak berdampak) sampai 10 (membahayakan keselamatan)." },
  { term: "Occurrence (O)", def: "Seberapa sering failure mode ini diperkirakan/pernah terjadi, dinilai 1 (sangat jarang) sampai 10 (sangat sering)." },
  { term: "Detection (D)", def: "Seberapa besar kemungkinan failure mode ini terdeteksi SEBELUM berdampak besar, dinilai 1 (hampir pasti terdeteksi lebih dulu) sampai 10 (hampir mustahil terdeteksi lebih dulu). Catatan: semakin SULIT dideteksi, semakin TINGGI angkanya." },
  { term: "RPN", def: "Risk Priority Number = Severity x Occurrence x Detection. Rentang teoretis 1-1000. Semakin tinggi RPN, semakin prioritas untuk segera dimitigasi." },
  { term: "Mitigasi", def: "Tindakan pencegahan yang diambil untuk menurunkan risiko — di aplikasi ini direpresentasikan dengan membuat Jadwal PM yang menyasar failure mode tersebut." },
];

function FMEAInfoModal({ C, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: 20
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12,
          maxWidth: 640, width: "100%", maxHeight: "85vh", overflowY: "auto",
          padding: 24, boxShadow: "0 20px 60px rgba(0,0,0,0.4)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8, background: C.ember + "20",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <ShieldAlert size={18} color={C.emberSoft} />
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: C.text }}>Apa itu FMEA?</div>
          </div>
          <button onClick={onClose} style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 28, height: 28, borderRadius: 7, border: `1px solid ${C.border}`,
            background: "transparent", color: C.textDim, cursor: "pointer", flexShrink: 0
          }}>
            <X size={15} />
          </button>
        </div>

        <p style={{ fontSize: 13, color: C.textDim, lineHeight: 1.6, margin: "10px 0 18px" }}>
          FMEA adalah pendekatan <b style={{ color: C.text }}>risk-based maintenance</b> — alih-alih menunggu
          kerusakan terjadi (reactive) atau merawat berdasarkan jadwal tetap saja (preventive), FMEA membantu
          tim maintenance mengidentifikasi <b style={{ color: C.text }}>risiko kegagalan mana yang paling perlu
          diprioritaskan</b> berdasarkan keparahan, frekuensi, dan kemudahan deteksinya.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {fmeaGlossary.map(g => (
            <div key={g.term} style={{ paddingBottom: 10, borderBottom: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.emberSoft, marginBottom: 3 }}>{g.term}</div>
              <div style={{ fontSize: 12.5, color: C.textDim, lineHeight: 1.55 }}>{g.def}</div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 16, padding: 12, borderRadius: 8,
          background: C.panel2, border: `1px solid ${C.border}`
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 4 }}>Contoh sederhana</div>
          <div style={{ fontSize: 12, color: C.textDim, lineHeight: 1.6 }}>
            Belt conveyor bisa <b style={{ color: C.text }}>bergeser dari jalurnya</b> (failure mode).
            Dampaknya, <b style={{ color: C.text }}>line berhenti dan berpotensi merusak roller</b> (effect) — Severity 8.
            Ini <b style={{ color: C.text }}>sering terjadi</b>, sekitar sekali per bulan (occurrence) — Occurrence 7.
            Deteksinya <b style={{ color: C.text }}>cukup sulit</b> karena hanya lewat inspeksi visual sesekali (detection) — Detection 4.
            <br /><br />
            RPN = 8 × 7 × 4 = <b style={{ color: C.danger }}>224</b> → kategori <b style={{ color: C.danger }}>Kritis</b>,
            sehingga perlu segera dibuatkan jadwal PM pencegahan.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================================================
   PANDUAN SKALA SOD — tabel referensi ringkas untuk
   membantu peserta training memahami cara menilai
   Severity, Occurrence, dan Detection saat mengisi FMEA.
=================================================== */
function ScaleGuideTable({ title, scale, C }) {
  return (
    <div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.text, marginBottom: 6 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {scale.map(s => (
          <div key={s.range} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
            <span style={{
              minWidth: 34, textAlign: "center", fontSize: 11, fontWeight: 700,
              color: C.emberSoft, background: C.ember + "18", borderRadius: 5, padding: "1px 4px"
            }}>{s.range}</span>
            <div>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{s.label}</span>
              <span style={{ fontSize: 11.5, color: C.textDim }}> — {s.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SODScaleGuide({ C }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: 6 }}>
      <button onClick={() => setOpen(!open)} style={{
        display: "flex", alignItems: "center", gap: 6, padding: "6px 10px",
        background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7,
        color: C.emberSoft, fontSize: 12, fontWeight: 600, cursor: "pointer"
      }}>
        <ShieldAlert size={13} />
        {open ? "Sembunyikan panduan skala S-O-D" : "Lihat panduan skala S-O-D (Severity, Occurrence, Detection)"}
      </button>
      {open && (
        <div style={{
          marginTop: 10, padding: 14, borderRadius: 8,
          background: C.panel2, border: `1px solid ${C.border}`
        }}>
          <div style={{ fontSize: 11.5, color: C.textDim, marginBottom: 12, lineHeight: 1.5 }}>
            Setiap faktor dinilai pada skala <b style={{ color: C.text }}>1 (terbaik) sampai 10 (terburuk)</b>.
            RPN = Severity × Occurrence × Detection — semakin tinggi RPN, semakin prioritas untuk dimitigasi.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <ScaleGuideTable title="Severity (Keparahan Dampak)" scale={severityScale} C={C} />
            <ScaleGuideTable title="Occurrence (Frekuensi Kejadian)" scale={occurrenceScale} C={C} />
            <ScaleGuideTable title="Detection (Kemudahan Deteksi)" scale={detectionScale} C={C} />
          </div>
        </div>
      )}
    </div>
  );
}

function getInputStyle(C) {
  return {
    padding: "8px 12px", background: C.panel2, border: `1px solid ${C.border}`,
    borderRadius: 7, color: C.text, fontSize: 13, outline: "none",
    boxSizing: "border-box"
  };
}
function getThStyle(C) {
  return { textAlign: "left", padding: "10px 14px", fontSize: 11.5, color: C.textDim, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 };
}
function getTdStyle(C) {
  return { padding: "11px 14px", color: C.steelLight };
}
/* ================== DASHBOARD ================== */
function Dashboard({ assets, workOrders, pms, C, onOpenAsset, onOpenWO, onNavigateTab }) {
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
        <StatCard C={C} icon={Factory} label="Aset Beroperasi" value={`${running}/${assets.length}`} sub={`${down} unit breakdown`} accent={C.ok} onClick={() => onNavigateTab("assets")} />
        <StatCard C={C} icon={ClipboardList} label="Work Order Aktif" value={openWO} sub="Perlu tindak lanjut" accent={C.ember} onClick={() => onNavigateTab("wo")} />
        <StatCard C={C} icon={AlertTriangle} label="PM Terlambat" value={overduePM} sub="Melewati jadwal" accent={C.danger} onClick={() => onNavigateTab("pm")} />
        <StatCard C={C} icon={Gauge} label="Rata-rata Health Score" value={`${avgHealth}%`} sub="Seluruh aset" accent={C.warn} onClick={() => onNavigateTab("kpi")} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
        <Card C={C}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 14 }}>Kondisi Aset (Health Score)</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {assets.map(a => (
              <div key={a.id}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <LinkButton C={C} onClick={() => onOpenAsset(a.id)}>{a.name}</LinkButton>
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
                  <LinkButton C={C} onClick={() => onOpenWO(w.id)}>{w.title}</LinkButton>
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
/* ================== WORK ORDERS ================== */
function WorkOrders({ workOrders, setWorkOrders, assets, pms, C, genWoId, onOpenAsset, onOpenPm, filterAssetId, onClearAssetFilter }) {
  const { statusMeta, priorityMeta } = getMeta(C);
  const inputStyle = getInputStyle(C);
  const thStyle = getThStyle(C);
  const tdStyle = getTdStyle(C);
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", asset: assets[0]?.id || "", type: "corrective", priority: "medium", assignee: "" });

  const scoped = filterAssetId ? workOrders.filter(w => w.asset === filterAssetId) : workOrders;
  const filtered = filter === "all" ? scoped : scoped.filter(w => w.status === filter);

  const addWO = () => {
    if (!form.title.trim()) return;
    const stamp = nowStamp();
    const newWO = {
      ...form, id: genWoId(), status: "open",
      assignee: form.assignee.trim() || "Unassigned",
      created: stamp.split(" ")[0], startedAt: stamp, completedAt: "",
      sourcePmId: null,
      cycleProcessed: false, assetImpactOpened: false, assetImpactCompleted: false,
    };
    setWorkOrders(prev => [newWO, ...prev]);
    setForm({ title: "", asset: assets[0]?.id || "", type: "corrective", priority: "medium", assignee: "" });
    setShowForm(false);
  };

  const advanceStatus = (id) => {
    setWorkOrders(prev => prev.map(w => {
      if (w.id !== id) return w;
      const next = w.status === "open" ? "in_progress" : w.status === "in_progress" ? "completed" : "completed";
      const patch = { status: next };
      if (next === "completed" && !w.completedAt) patch.completedAt = nowStamp();
      if (next === "in_progress" && !w.startedAt) patch.startedAt = nowStamp();
      return { ...w, ...patch };
    }));
  };

  const updateAssignee = (id, name) => {
    setWorkOrders(prev => prev.map(w => w.id === id ? { ...w, assignee: name || "Unassigned" } : w));
  };

  const assetName = (id) => assets.find(a => a.id === id)?.name || id;

  return (
    <div>
      <SectionHeader
        C={C}
        title="Work Order Management"
        subtitle={filterAssetId
          ? `Menampilkan WO untuk ${assetName(filterAssetId)} saja`
          : "Kelola permintaan kerja korektif, preventif, dan prediktif"}
        onBack={filterAssetId ? onClearAssetFilter : undefined}
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
          <div style={{ marginTop: 10 }}>
            <input placeholder="PIC (Penanggung Jawab) — kosongkan jika belum ditentukan" value={form.assignee}
              onChange={e => setForm({ ...form, assignee: e.target.value })}
              style={{ ...inputStyle, width: "100%", maxWidth: 380 }} />
          </div>
          {form.type === "corrective" && (
            <div style={{ fontSize: 11.5, color: C.warn, marginTop: 8, display: "flex", alignItems: "center", gap: 5 }}>
              <AlertTriangle size={12} /> WO korektif akan otomatis mengubah status aset menjadi "Breakdown" saat disimpan.
            </div>
          )}
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
              {["ID", "Pekerjaan", "Aset", "Sumber", "Tipe", "Prioritas", "Status", "PIC", ""].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(w => {
              const linkedPm = w.sourcePmId ? pms.find(p => p.id === w.sourcePmId) : null;
              return (
                <tr key={w.id} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={tdStyle}><span style={{ color: C.textDim }}>{w.id}</span></td>
                  <td style={{ ...tdStyle, color: C.text, fontWeight: 500 }}>{w.title}</td>
                  <td style={tdStyle}>
                    <LinkButton C={C} onClick={() => onOpenAsset(w.asset)}>{w.asset}</LinkButton>
                  </td>
                  <td style={tdStyle}>
                    {w.sourcePmId ? (
                      <LinkButton C={C} icon={Link2} onClick={() => onOpenPm(w.sourcePmId)}>
                        {w.sourcePmId}
                      </LinkButton>
                    ) : (
                      <span style={{ fontSize: 11.5, color: C.textDim }}>Manual</span>
                    )}
                  </td>
                  <td style={{ ...tdStyle, textTransform: "capitalize" }}>{w.type}</td>
                  <td style={tdStyle}><Badge color={priorityMeta[w.priority].color}>{priorityMeta[w.priority].label}</Badge></td>
                  <td style={tdStyle}><Badge color={statusMeta[w.status].color}>{statusMeta[w.status].label}</Badge></td>
                  <td style={tdStyle}>
                    <input
                      defaultValue={w.assignee === "Unassigned" ? "" : w.assignee}
                      placeholder="Unassigned"
                      onBlur={e => updateAssignee(w.id, e.target.value.trim())}
                      style={{ ...inputStyle, width: 100, padding: "5px 8px", fontSize: 12.5 }}
                    />
                  </td>
                  <td style={tdStyle}>
                    {w.status !== "completed" && (
                      <button onClick={() => advanceStatus(w.id)} style={{
                        display: "flex", alignItems: "center", gap: 4, padding: "5px 10px",
                        background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6,
                        color: C.emberSoft, fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap"
                      }}>
                        {w.status === "open" ? "Mulai" : "Selesaikan"} <ChevronRight size={13} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} style={{ padding: "24px 14px", textAlign: "center", color: C.textDim, fontSize: 13 }}>
                  Tidak ada work order yang cocok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
/* ================== ASSET DETAIL PAGE ================== */
function AssetDetail({ asset, workOrders, pms, fmea, C, onBack, onOpenWO, onOpenFmeaTab }) {
  const { statusMeta, priorityMeta } = getMeta(C);
  const relatedWO = workOrders.filter(w => w.asset === asset.id).sort((a, b) => (a.created < b.created ? 1 : -1));
  const relatedPM = pms.filter(p => p.asset === asset.id);
  const relatedFmea = fmea.filter(f => f.asset === asset.id);
  const correctiveCount = relatedWO.filter(w => w.type === "corrective").length;
  const openCount = relatedWO.filter(w => w.status !== "completed").length;
  const highestRpn = relatedFmea.length > 0
    ? Math.max(...relatedFmea.map(f => calcRPN(f.severity, f.occurrence, f.detection)))
    : null;

  return (
    <div>
      <SectionHeader C={C} title={asset.name} subtitle={`${asset.id} • ${asset.location}`} onBack={onBack} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        <Card C={C}>
          <div style={{ fontSize: 12, color: C.textDim, marginBottom: 8 }}>Status Saat Ini</div>
          <Badge color={statusMeta[asset.status].color}>{statusMeta[asset.status].label}</Badge>
        </Card>
        <Card C={C}>
          <div style={{ fontSize: 12, color: C.textDim, marginBottom: 8 }}>Health Score</div>
          <HealthBar C={C} value={asset.health} />
        </Card>
        <Card C={C}>
          <div style={{ fontSize: 12, color: C.textDim, marginBottom: 6 }}>Total WO Korektif</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.text }}>{correctiveCount}</div>
        </Card>
        <Card C={C}>
          <div style={{ fontSize: 12, color: C.textDim, marginBottom: 6 }}>WO Masih Aktif</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: openCount > 0 ? C.warn : C.ok }}>{openCount}</div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
        <Card C={C}>
          <div style={{ fontSize: 12, color: C.textDim, marginBottom: 4 }}>Kritikalitas</div>
          <div style={{ fontSize: 14, color: C.text, fontWeight: 600, textTransform: "capitalize" }}>{asset.criticality}</div>
        </Card>
        <Card C={C}>
          <div style={{ fontSize: 12, color: C.textDim, marginBottom: 4 }}>Jadwal PM Terkait</div>
          <div style={{ fontSize: 14, color: C.text, fontWeight: 600 }}>{relatedPM.length} jadwal aktif</div>
        </Card>
        <Card C={C}>
          <div style={{ fontSize: 12, color: C.textDim, marginBottom: 4 }}>Risiko FMEA Tertinggi</div>
          {highestRpn !== null ? (
            <LinkButton C={C} icon={ShieldAlert} onClick={onOpenFmeaTab}>
              RPN {highestRpn} — {rpnCategory(highestRpn, C).label} ({relatedFmea.length} failure mode)
            </LinkButton>
          ) : (
            <div style={{ fontSize: 13, color: C.textDim }}>Belum ada analisis FMEA</div>
          )}
        </Card>
      </div>

      <Card C={C} style={{ padding: 0, overflow: "hidden", marginBottom: 14 }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, fontSize: 14, fontWeight: 600, color: C.text }}>
          Riwayat Work Order — {asset.name}
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: C.panel2 }}>
              {["ID", "Pekerjaan", "Tipe", "Prioritas", "Status", "Dibuat", "Selesai"].map(h => (
                <th key={h} style={getThStyle(C)}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {relatedWO.map(w => (
              <tr key={w.id} style={{ borderTop: `1px solid ${C.border}` }}>
                <td style={getTdStyle(C)}>
                  <LinkButton C={C} onClick={() => onOpenWO(w.id)}>{w.id}</LinkButton>
                </td>
                <td style={{ ...getTdStyle(C), color: C.text, fontWeight: 500 }}>{w.title}</td>
                <td style={{ ...getTdStyle(C), textTransform: "capitalize" }}>{w.type}</td>
                <td style={getTdStyle(C)}><Badge color={priorityMeta[w.priority].color}>{priorityMeta[w.priority].label}</Badge></td>
                <td style={getTdStyle(C)}><Badge color={statusMeta[w.status].color}>{statusMeta[w.status].label}</Badge></td>
                <td style={getTdStyle(C)}>{w.created}</td>
                <td style={getTdStyle(C)}>{w.completedAt ? w.completedAt.split(" ")[0] : "—"}</td>
              </tr>
            ))}
            {relatedWO.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: "24px 14px", textAlign: "center", color: C.textDim, fontSize: 13 }}>
                  Belum ada riwayat Work Order untuk aset ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <Card C={C} style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, fontSize: 14, fontWeight: 600, color: C.text }}>
          Analisis FMEA — {asset.name}
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: C.panel2 }}>
              {["Komponen", "Failure Mode", "Effect", "RPN"].map(h => (
                <th key={h} style={getThStyle(C)}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {relatedFmea.map(f => {
              const rpn = calcRPN(f.severity, f.occurrence, f.detection);
              const cat = rpnCategory(rpn, C);
              return (
                <tr key={f.id} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={{ ...getTdStyle(C), color: C.text, fontWeight: 500 }}>{f.component}</td>
                  <td style={getTdStyle(C)}>{f.failureMode}</td>
                  <td style={getTdStyle(C)}>{f.effect}</td>
                  <td style={getTdStyle(C)}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontWeight: 700, color: cat.color }}>{rpn}</span>
                      <Badge color={cat.color}>{cat.label}</Badge>
                    </div>
                  </td>
                </tr>
              );
            })}
            {relatedFmea.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: "24px 14px", textAlign: "center", color: C.textDim, fontSize: 13 }}>
                  Belum ada analisis FMEA untuk aset ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ================== ASSET CARD (list view) ================== */
function AssetCard({ asset, C, onSave, onDelete, isEditing, onStartEdit, onStopEdit, onOpenDetail }) {
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
        <LinkButton C={C} onClick={() => onOpenDetail(asset.id)}>
          <span style={{ fontSize: 14.5, fontWeight: 600 }}>{asset.name}</span>
        </LinkButton>
        <div style={{ fontSize: 12, color: C.textDim, margin: "2px 0 12px" }}>{asset.id} • {asset.location}</div>
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

/* ================== ASSET LIST ================== */
function Assets({ assets, setAssets, C, onOpenDetail }) {
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
    setAssets(prev => prev.map(a => a.id === updated.id ? updated : a));
  };

  const deleteAsset = (id) => {
    setAssets(prev => prev.filter(a => a.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const addAsset = () => {
    if (!form.name.trim()) return;
    setAssets(prev => {
      const nums = prev
        .map(a => parseInt(a.id.replace("AST-", ""), 10))
        .filter(n => !isNaN(n));
      const nextNum = (nums.length ? Math.max(...nums) : 100) + 1;
      const newId = "AST-" + nextNum;
      return [...prev, { ...form, id: newId, health: Number(form.health) }];
    });
    setForm({ name: "", location: "", status: "running", criticality: "medium", health: 100, lastMaint: "", nextMaint: "" });
    setShowForm(false);
  };

  return (
    <div>
      <SectionHeader
        C={C}
        title="Asset / Equipment Registry"
        subtitle="Data induk mesin dan peralatan produksi — klik nama aset untuk lihat riwayat lengkap"
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
            onOpenDetail={onOpenDetail}
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
/* ================== PM ROW ================== */
function PMRow({ pm, C, onSave, onDelete, assetIds, isEditing, onStartEdit, onStopEdit, onGenerateWO, onOpenAsset, onOpenWO }) {
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
        <td style={tdStyle}><LinkButton C={C} onClick={() => onOpenAsset(pm.asset)}>{pm.asset}</LinkButton></td>
        <td style={{ ...tdStyle, color: C.text, fontWeight: 500 }}>{pm.task}</td>
        <td style={tdStyle}>{pm.freq}</td>
        <td style={tdStyle}>{pm.pic || "Belum ditentukan"}</td>
        <td style={tdStyle}>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <CalendarClock size={13} color={C.textDim} /> {pm.due}
          </span>
        </td>
        <td style={tdStyle}><Badge color={statusMeta[pm.status].color}>{statusMeta[pm.status].label}</Badge></td>
        <td style={tdStyle}>
          {pm.linkedWO ? (
            <LinkButton C={C} icon={ClipboardList} onClick={() => onOpenWO(pm.linkedWO)}>{pm.linkedWO}</LinkButton>
          ) : (
            <button onClick={() => onGenerateWO(pm)} style={{
              display: "flex", alignItems: "center", gap: 4, padding: "5px 9px",
              background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6,
              color: C.textDim, fontSize: 11.5, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap"
            }}>
              <Plus size={12} /> Buat WO
            </button>
          )}
        </td>
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
        <input value={draft.pic || ""} onChange={e => setDraft({ ...draft, pic: e.target.value })} placeholder="Nama PIC" style={{ ...inputStyle, width: 110 }} />
      </td>
      <td style={tdStyle}>
        <input type="date" value={draft.due} onChange={e => setDraft({ ...draft, due: e.target.value })} style={inputStyle} />
      </td>
      <td style={tdStyle}>
        <Badge color={statusMeta[computeAutoPmStatus(draft.due)].color}>{statusMeta[computeAutoPmStatus(draft.due)].label}</Badge>
        <div style={{ fontSize: 10, color: C.textDim, marginTop: 3 }}>otomatis dari tanggal</div>
      </td>
      <td style={tdStyle}>
        {pm.linkedWO && <span style={{ fontSize: 11.5, color: C.textDim }}>{pm.linkedWO}</span>}
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

/* ================== PM SCHEDULE ================== */
function PMSchedule({ pms, setPms, assets, C, onGenerateWO, onOpenAsset, onOpenWO, genPmId }) {
  const thStyle = getThStyle(C);
  const inputStyle = getInputStyle(C);
  const assetIds = assets.map(a => a.id);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    asset: assetIds[0] || "", task: "", freq: "Bulanan", due: "", pic: ""
  });

  const savePm = (updated) => {
    setPms(prev => prev.map(p => p.id === updated.id ? { ...updated, status: computeAutoPmStatus(updated.due) } : p));
  };

  const deletePm = (id) => {
    setPms(prev => prev.filter(p => p.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const addPm = () => {
    if (!form.task.trim() || !form.due) return;
    const newId = genPmId();
    setPms(prev => [...prev, { ...form, id: newId, linkedWO: null, pic: form.pic.trim() || "Belum ditentukan", status: computeAutoPmStatus(form.due) }]);
    setForm({ asset: assetIds[0] || "", task: "", freq: "Bulanan", due: "", pic: "" });
    setShowForm(false);
  };

  return (
    <div>
      <SectionHeader
        C={C}
        title="Preventive Maintenance Schedule"
        subtitle="Jadwal perawatan berkala — status otomatis dari tanggal, siklus baru dibuat otomatis saat WO selesai"
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr 1fr", gap: 10 }}>
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
          </div>
          <div style={{ marginTop: 10 }}>
            <input placeholder="PIC (Penanggung Jawab) — mis. Andi P." value={form.pic}
              onChange={e => setForm({ ...form, pic: e.target.value })}
              style={{ ...inputStyle, width: "100%", maxWidth: 320 }} />
          </div>
          <div style={{ fontSize: 11, color: C.textDim, marginTop: 6 }}>
            Status akan dihitung otomatis dari tanggal jatuh tempo setelah disimpan.
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
              {["ID", "Aset", "Tugas", "Frekuensi", "PIC", "Jatuh Tempo", "Status", "WO Terkait", ""].map(h => (
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
                onGenerateWO={onGenerateWO}
                onOpenAsset={onOpenAsset}
                onOpenWO={onOpenWO}
              />
            ))}
            {pms.length === 0 && (
              <tr>
                <td colSpan={9} style={{ padding: "24px 14px", textAlign: "center", color: C.textDim, fontSize: 13 }}>
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

/* ================== RIWAYAT PM ================== */
function PMHistory({ history, C, onOpenAsset, onOpenWO }) {
  const thStyle = getThStyle(C);
  const tdStyle = getTdStyle(C);

  return (
    <div>
      <SectionHeader
        C={C}
        title="Riwayat Preventive Maintenance"
        subtitle="Siklus PM yang sudah selesai dikerjakan — setiap siklus baru otomatis dijadwalkan ulang"
      />
      <Card C={C} style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: C.panel2 }}>
              {["ID Siklus", "Aset", "Tugas", "PIC", "Jatuh Tempo Awal", "Selesai Pada", "WO Terkait"].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.map((h, idx) => (
              <tr key={`${h.id}-${h.completedWO}-${idx}`} style={{ borderTop: `1px solid ${C.border}` }}>
                <td style={tdStyle}><span style={{ color: C.textDim }}>{h.id}</span></td>
                <td style={tdStyle}><LinkButton C={C} onClick={() => onOpenAsset(h.asset)}>{h.asset}</LinkButton></td>
                <td style={{ ...tdStyle, color: C.text, fontWeight: 500 }}>{h.task}</td>
                <td style={tdStyle}>{h.pic || "—"}</td>
                <td style={tdStyle}>{h.due}</td>
                <td style={tdStyle}>
                  <span style={{ display: "flex", alignItems: "center", gap: 5, color: C.ok }}>
                    <CheckCircle2 size={13} /> {h.completedAt}
                  </span>
                </td>
                <td style={tdStyle}>
                  <LinkButton C={C} onClick={() => onOpenWO(h.completedWO)}>{h.completedWO}</LinkButton>
                </td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: "24px 14px", textAlign: "center", color: C.textDim, fontSize: 13 }}>
                  Belum ada siklus PM yang selesai. Selesaikan Work Order hasil generate dari Jadwal PM untuk melihat riwayatnya di sini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
/* ================== KPI / REPORTING ================== */
function KPIReport({ assets, workOrders, C }) {
  const { statusMeta } = getMeta(C);
  const [showMttrInfo, setShowMttrInfo] = useState(false);
  const completed = workOrders.filter(w => w.status === "completed").length;
  const total = workOrders.length;
  const complianceRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const mttrResult = calcMTTR(workOrders);
  const mtbfResult = calcMTBF(workOrders);
  const mttr = mttrResult ? mttrResult.value.toFixed(1) : "—";
  const mtbfDisplay = mtbfResult
    ? (mtbfResult.value >= 72
        ? `${(mtbfResult.value / 24).toFixed(1)} hari`
        : `${Math.round(mtbfResult.value)} jam`)
    : null;
  const avgHealth = assets.length > 0 ? Math.round(assets.reduce((s, a) => s + a.health, 0) / assets.length) : 0;

  const kpis = [
    { label: "PM Compliance Rate", value: `${complianceRate}%`, trend: "up", icon: CheckCircle2, color: C.ok },
    { label: "MTTR (Mean Time to Repair)", value: mttrResult ? `${mttr} jam` : "Belum ada data", sub: mttrResult ? `dari ${mttrResult.sampleSize} WO korektif selesai` : null, trend: "down", icon: Clock, color: C.warn, showInfo: true },
    { label: "MTBF (Mean Time Between Failure)", value: mtbfDisplay || "Belum ada data", sub: mtbfResult ? `dari ${mtbfResult.sampleSize} jeda breakdown` : null, trend: "up", icon: TrendingUp, color: C.ok, showInfo: true },
    { label: "Overall Equipment Health", value: `${avgHealth}%`, trend: "up", icon: Gauge, color: C.emberSoft },
  ];

  const byCriticality = ["high", "medium", "low"].map(c => ({
    level: c, count: assets.filter(a => a.criticality === c).length
  }));

  return (
    <div>
      <SectionHeader C={C} title="Dashboard & Reporting KPI" subtitle="Indikator kinerja utama aktivitas maintenance" />
      {showMttrInfo && <MTTRMTBFInfoModal C={C} onClose={() => setShowMttrInfo(false)} />}
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
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}>
              <div style={{ fontSize: 12, color: C.textDim }}>{k.label}</div>
              {k.showInfo && (
                <button
                  onClick={() => setShowMttrInfo(true)}
                  aria-label="Penjelasan MTTR & MTBF"
                  title="Apa itu MTTR & MTBF?"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: 16, height: 16, borderRadius: "50%", border: `1px solid ${C.border}`,
                    background: "transparent", color: C.textDim, cursor: "pointer", flexShrink: 0, padding: 0
                  }}
                >
                  <HelpCircle size={10} />
                </button>
              )}
            </div>
            {k.sub && <div style={{ fontSize: 10.5, color: C.textDim, marginTop: 2, opacity: 0.75 }}>{k.sub}</div>}
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
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
                  width: `${assets.length > 0 ? (b.count / assets.length) * 100 : 0}%`, height: "100%", borderRadius: 4,
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

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Card C={C}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>Tren Health Score per Aset (6 Bulan Terakhir)</div>
          <div style={{ fontSize: 12, color: C.textDim, marginBottom: 14 }}>Ilustrasi tren — menunjukkan pola degradasi kondisi aset, dasar untuk predictive maintenance</div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={healthTrend} margin={{ top: 4, right: 12, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="bulan" stroke={C.textDim} fontSize={12} tickLine={false} />
              <YAxis stroke={C.textDim} fontSize={12} tickLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, color: C.text }} />
              <Legend wrapperStyle={{ fontSize: 12, color: C.textDim }} />
              <Line type="monotone" dataKey="AST-101" stroke={C.ok} strokeWidth={2} dot={{ r: 3 }} name="CNC Milling #1" />
              <Line type="monotone" dataKey="AST-102" stroke={C.warn} strokeWidth={2} dot={{ r: 3 }} name="Hydraulic Press #2" />
              <Line type="monotone" dataKey="AST-103" stroke={C.danger} strokeWidth={2} dot={{ r: 3 }} name="Conveyor Belt Unit 4" />
              <Line type="monotone" dataKey="rata2" stroke={C.steel} strokeWidth={2} strokeDasharray="4 3" dot={false} name="Rata-rata Semua Aset" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Card C={C}>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>Tren MTTR & MTBF</div>
            <div style={{ fontSize: 12, color: C.textDim, marginBottom: 14 }}>Ilustrasi tren 6 bulan — MTTR turun & MTBF naik menandakan program maintenance yang membaik</div>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={reliabilityTrend} margin={{ top: 4, right: 12, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="bulan" stroke={C.textDim} fontSize={12} tickLine={false} />
                <YAxis yAxisId="left" stroke={C.warn} fontSize={12} tickLine={false} label={{ value: "Jam", angle: -90, position: "insideLeft", fontSize: 11, fill: C.textDim }} />
                <YAxis yAxisId="right" orientation="right" stroke={C.ok} fontSize={12} tickLine={false} />
                <Tooltip contentStyle={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, color: C.text }} />
                <Legend wrapperStyle={{ fontSize: 12, color: C.textDim }} />
                <Line yAxisId="left" type="monotone" dataKey="mttr" stroke={C.warn} strokeWidth={2} dot={{ r: 3 }} name="MTTR (jam)" />
                <Line yAxisId="right" type="monotone" dataKey="mtbf" stroke={C.ok} strokeWidth={2} dot={{ r: 3 }} name="MTBF (jam)" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card C={C}>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>Tren Work Order: Korektif vs Preventif</div>
            <div style={{ fontSize: 12, color: C.textDim, marginBottom: 14 }}>Ilustrasi tren — pergeseran dari reactive menuju proactive maintenance</div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={woTrend} margin={{ top: 4, right: 12, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="bulan" stroke={C.textDim} fontSize={12} tickLine={false} />
                <YAxis stroke={C.textDim} fontSize={12} tickLine={false} />
                <Tooltip contentStyle={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, color: C.text }} />
                <Legend wrapperStyle={{ fontSize: 12, color: C.textDim }} />
                <Bar dataKey="korektif" stackId="a" fill={C.danger} name="Korektif" radius={[0, 0, 0, 0]} />
                <Bar dataKey="preventif" stackId="a" fill={C.ok} name="Preventif" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </div>
  );
}
/* ================== WO DETAIL PAGE ================== */
/* ================== FMEA ================== */
function FMEARow({ fm, C, onSave, onDelete, assetIds, isEditing, onStartEdit, onStopEdit, onOpenAsset, onOpenPm, onGeneratePM, pms }) {
  const tdStyle = getTdStyle(C);
  const inputStyle = getInputStyle(C);
  const [draft, setDraft] = useState(fm);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const startEdit = () => { setDraft(fm); onStartEdit(fm.id); };
  const save = () => {
    onSave({
      ...draft,
      severity: Number(draft.severity), occurrence: Number(draft.occurrence), detection: Number(draft.detection)
    });
    onStopEdit();
  };

  const handleDeleteClick = () => {
    if (confirmDelete) {
      onDelete(fm.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  const rpn = calcRPN(fm.severity, fm.occurrence, fm.detection);
  const cat = rpnCategory(rpn, C);
  const hasPmAlready = !!fm.linkedPmId;
  const pmExists = fm.linkedPmId ? pms.some(p => p.id === fm.linkedPmId) : false;

  if (!isEditing) {
    return (
      <tr style={{ borderTop: `1px solid ${C.border}` }}>
        <td style={tdStyle}><span style={{ color: C.textDim }}>{fm.id}</span></td>
        <td style={tdStyle}><LinkButton C={C} onClick={() => onOpenAsset(fm.asset)}>{fm.asset}</LinkButton></td>
        <td style={{ ...tdStyle, color: C.text, fontWeight: 500 }}>{fm.component}</td>
        <td style={tdStyle}>{fm.failureMode}</td>
        <td style={tdStyle}>{fm.effect}</td>
        <td style={{ ...tdStyle, textAlign: "center" }}>{fm.severity}</td>
        <td style={{ ...tdStyle, textAlign: "center" }}>{fm.occurrence}</td>
        <td style={{ ...tdStyle, textAlign: "center" }}>{fm.detection}</td>
        <td style={tdStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontWeight: 700, color: cat.color, fontSize: 14 }}>{rpn}</span>
            <Badge color={cat.color}>{cat.label}</Badge>
          </div>
        </td>
        <td style={tdStyle}>
          {hasPmAlready && pmExists ? (
            <LinkButton C={C} icon={CalendarClock} onClick={() => onOpenPm(fm.linkedPmId)}>{fm.linkedPmId}</LinkButton>
          ) : (
            <button onClick={() => onGeneratePM(fm)} style={{
              display: "flex", alignItems: "center", gap: 4, padding: "5px 9px",
              background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6,
              color: C.textDim, fontSize: 11.5, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap"
            }}>
              <Plus size={12} /> Buat PM
            </button>
          )}
        </td>
        <td style={tdStyle}>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={startEdit} aria-label="Edit FMEA" style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 26, height: 26, borderRadius: 6, border: `1px solid ${C.border}`,
              background: "transparent", color: C.textDim, cursor: "pointer"
            }}>
              <Pencil size={13} />
            </button>
            <button onClick={handleDeleteClick} aria-label="Hapus FMEA" style={{
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
      <td style={tdStyle}><span style={{ color: C.textDim }}>{fm.id}</span></td>
      <td style={tdStyle}>
        <select value={draft.asset} onChange={e => setDraft({ ...draft, asset: e.target.value })} style={inputStyle}>
          {assetIds.map(id => <option key={id} value={id}>{id}</option>)}
        </select>
      </td>
      <td style={tdStyle}>
        <input value={draft.component} onChange={e => setDraft({ ...draft, component: e.target.value })} style={{ ...inputStyle, width: "100%" }} />
      </td>
      <td style={tdStyle}>
        <input value={draft.failureMode} onChange={e => setDraft({ ...draft, failureMode: e.target.value })} style={{ ...inputStyle, width: "100%" }} />
      </td>
      <td style={tdStyle}>
        <input value={draft.effect} onChange={e => setDraft({ ...draft, effect: e.target.value })} style={{ ...inputStyle, width: "100%" }} />
      </td>
      <td style={tdStyle}>
        <input type="number" min={1} max={10} value={draft.severity} onChange={e => setDraft({ ...draft, severity: e.target.value })}
          title="Severity 1-10: seberapa parah dampaknya jika kegagalan terjadi. 1-2=minor, 9-10=berbahaya/melanggar keselamatan."
          style={{ ...inputStyle, width: 50, textAlign: "center" }} />
      </td>
      <td style={tdStyle}>
        <input type="number" min={1} max={10} value={draft.occurrence} onChange={e => setDraft({ ...draft, occurrence: e.target.value })}
          title="Occurrence 1-10: seberapa sering kegagalan ini terjadi. 1-2=hampir tidak pernah, 9-10=sangat sering (>1x/minggu)."
          style={{ ...inputStyle, width: 50, textAlign: "center" }} />
      </td>
      <td style={tdStyle}>
        <input type="number" min={1} max={10} value={draft.detection} onChange={e => setDraft({ ...draft, detection: e.target.value })}
          title="Detection 1-10: seberapa mudah kegagalan ini terdeteksi sebelum berdampak. 1-2=hampir pasti terdeteksi otomatis, 9-10=hampir tidak terdeteksi."
          style={{ ...inputStyle, width: 50, textAlign: "center" }} />
      </td>
      <td style={tdStyle}>
        <span style={{ fontWeight: 700, color: rpnCategory(calcRPN(draft.severity, draft.occurrence, draft.detection), C).color }}>
          {calcRPN(draft.severity, draft.occurrence, draft.detection)}
        </span>
      </td>
      <td style={tdStyle}>{fm.linkedPmId || "—"}</td>
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

function FMEA({ fmea, setFmea, assets, pms, C, onOpenAsset, onOpenPm, onGeneratePM, genFmId }) {
  const thStyle = getThStyle(C);
  const inputStyle = getInputStyle(C);
  const assetIds = assets.map(a => a.id);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [sortByRpn, setSortByRpn] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [form, setForm] = useState({
    asset: assetIds[0] || "", component: "", failureMode: "", effect: "", cause: "",
    severity: 5, occurrence: 5, detection: 5
  });

  const saveFm = (updated) => {
    setFmea(prev => prev.map(f => f.id === updated.id ? updated : f));
  };

  const deleteFm = (id) => {
    setFmea(prev => prev.filter(f => f.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const addFm = () => {
    if (!form.component.trim() || !form.failureMode.trim()) return;
    const newId = genFmId();
    setFmea(prev => [...prev, {
      ...form, id: newId,
      severity: Number(form.severity), occurrence: Number(form.occurrence), detection: Number(form.detection),
      linkedPmId: null,
    }]);
    setForm({ asset: assetIds[0] || "", component: "", failureMode: "", effect: "", cause: "", severity: 5, occurrence: 5, detection: 5 });
    setShowForm(false);
  };

  const displayedFmea = sortByRpn
    ? [...fmea].sort((a, b) => calcRPN(b.severity, b.occurrence, b.detection) - calcRPN(a.severity, a.occurrence, a.detection))
    : fmea;

  const criticalCount = fmea.filter(f => calcRPN(f.severity, f.occurrence, f.detection) >= 200).length;
  const highCount = fmea.filter(f => {
    const r = calcRPN(f.severity, f.occurrence, f.detection);
    return r >= 100 && r < 200;
  }).length;

  return (
    <div>
      <SectionHeader
        C={C}
        title={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            FMEA — Failure Mode and Effects Analysis
            <button
              onClick={() => setShowInfo(true)}
              aria-label="Penjelasan FMEA"
              title="Apa itu FMEA?"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 22, height: 22, borderRadius: "50%", border: `1px solid ${C.border}`,
                background: "transparent", color: C.textDim, cursor: "pointer", flexShrink: 0
              }}
            >
              <HelpCircle size={13} />
            </button>
          </span>
        }
        subtitle="Analisis risiko kegagalan per komponen aset — RPN tinggi berarti prioritas mitigasi tinggi"
        action={
          <button onClick={() => setShowForm(!showForm)} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
            background: C.ember, color: "#fff", border: "none", borderRadius: 8,
            fontSize: 13, fontWeight: 600, cursor: "pointer"
          }}>
            <Plus size={15} /> Analisis FMEA Baru
          </button>
        }
      />

      {showInfo && <FMEAInfoModal C={C} onClose={() => setShowInfo(false)} />}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 18 }}>
        <StatCard C={C} icon={ShieldAlert} label="Risiko Kritis (RPN ≥ 200)" value={criticalCount} accent={C.danger} />
        <StatCard C={C} icon={AlertTriangle} label="Risiko Tinggi (RPN 100-199)" value={highCount} accent={C.emberSoft} />
        <StatCard C={C} icon={ClipboardList} label="Total Failure Mode Teridentifikasi" value={fmea.length} accent={C.steel} />
      </div>

      {showForm && (
        <Card C={C} style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Tambah Analisis FMEA</div>
            <X size={16} color={C.textDim} style={{ cursor: "pointer" }} onClick={() => setShowForm(false)} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 8 }}>
              <select value={form.asset} onChange={e => setForm({ ...form, asset: e.target.value })} style={inputStyle}>
                {assetIds.map(id => <option key={id} value={id}>{id}</option>)}
              </select>
              <input placeholder="Komponen (mis. Belt & Roller Conveyor)" value={form.component}
                onChange={e => setForm({ ...form, component: e.target.value })} style={inputStyle} />
            </div>
            <input placeholder="Failure Mode — cara komponen ini bisa gagal" value={form.failureMode}
              onChange={e => setForm({ ...form, failureMode: e.target.value })} style={inputStyle} />
            <input placeholder="Effect — dampak jika kegagalan terjadi" value={form.effect}
              onChange={e => setForm({ ...form, effect: e.target.value })} style={inputStyle} />
            <input placeholder="Cause — kemungkinan penyebab" value={form.cause}
              onChange={e => setForm({ ...form, cause: e.target.value })} style={inputStyle} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 4 }}>
              <div>
                <div style={{ fontSize: 11, color: C.textDim, marginBottom: 4 }}>Severity — Keparahan (1-10)</div>
                <input type="number" min={1} max={10} value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })} style={{ ...inputStyle, width: "100%" }} />
                <div style={{ fontSize: 10.5, color: C.emberSoft, marginTop: 3, fontWeight: 600 }}>
                  {scaleLabelFor(severityScale, form.severity)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.textDim, marginBottom: 4 }}>Occurrence — Frekuensi (1-10)</div>
                <input type="number" min={1} max={10} value={form.occurrence} onChange={e => setForm({ ...form, occurrence: e.target.value })} style={{ ...inputStyle, width: "100%" }} />
                <div style={{ fontSize: 10.5, color: C.emberSoft, marginTop: 3, fontWeight: 600 }}>
                  {scaleLabelFor(occurrenceScale, form.occurrence)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.textDim, marginBottom: 4 }}>Detection — Deteksi (1-10)</div>
                <input type="number" min={1} max={10} value={form.detection} onChange={e => setForm({ ...form, detection: e.target.value })} style={{ ...inputStyle, width: "100%" }} />
                <div style={{ fontSize: 10.5, color: C.emberSoft, marginTop: 3, fontWeight: 600 }}>
                  {scaleLabelFor(detectionScale, form.detection)}
                </div>
              </div>
            </div>
            <SODScaleGuide C={C} />
            <div style={{ fontSize: 12, color: C.textDim, marginTop: 10 }}>
              RPN akan dihitung otomatis: <b style={{ color: C.text }}>{calcRPN(form.severity, form.occurrence, form.detection)}</b>
              {" "}({rpnCategory(calcRPN(form.severity, form.occurrence, form.detection), C).label})
            </div>
          </div>
          <button onClick={addFm} style={{
            marginTop: 12, padding: "8px 16px", background: C.ember, color: "#fff",
            border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer"
          }}>Simpan</button>
        </Card>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
        <button onClick={() => setSortByRpn(!sortByRpn)} style={{
          display: "flex", alignItems: "center", gap: 6, padding: "6px 12px",
          background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8,
          color: C.textDim, fontSize: 12, fontWeight: 600, cursor: "pointer"
        }}>
          {sortByRpn ? "Diurutkan: RPN Tertinggi" : "Diurutkan: Sesuai Input"}
        </button>
      </div>

      <Card C={C} style={{ padding: 0, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 1100 }}>
          <thead>
            <tr style={{ background: C.panel2 }}>
              {[
                { h: "ID" }, { h: "Aset" }, { h: "Komponen" }, { h: "Failure Mode" }, { h: "Effect" },
                { h: "S", title: "Severity — keparahan dampak (1-10)" },
                { h: "O", title: "Occurrence — frekuensi kejadian (1-10)" },
                { h: "D", title: "Detection — kemudahan deteksi (1-10)" },
                { h: "RPN", title: "Risk Priority Number = S x O x D" },
                { h: "PM Mitigasi" }, { h: "" },
              ].map(col => (
                <th key={col.h} title={col.title} style={{ ...thStyle, cursor: col.title ? "help" : "default" }}>{col.h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayedFmea.map(fm => (
              <FMEARow
                key={fm.id}
                fm={fm}
                C={C}
                onSave={saveFm}
                onDelete={deleteFm}
                assetIds={assetIds}
                isEditing={editingId === fm.id}
                onStartEdit={setEditingId}
                onStopEdit={() => setEditingId(null)}
                onOpenAsset={onOpenAsset}
                onOpenPm={onOpenPm}
                onGeneratePM={onGeneratePM}
                pms={pms}
              />
            ))}
            {displayedFmea.length === 0 && (
              <tr>
                <td colSpan={11} style={{ padding: "24px 14px", textAlign: "center", color: C.textDim, fontSize: 13 }}>
                  Belum ada analisis FMEA. Klik "Analisis FMEA Baru" untuk menambahkan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function WODetail({ wo, asset, linkedPm, C, onBack, onOpenAsset, onOpenPm }) {
  const { statusMeta, priorityMeta } = getMeta(C);
  return (
    <div>
      <SectionHeader C={C} title={wo.title} subtitle={wo.id} onBack={onBack} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        <Card C={C}>
          <div style={{ fontSize: 12, color: C.textDim, marginBottom: 8 }}>Status</div>
          <Badge color={statusMeta[wo.status].color}>{statusMeta[wo.status].label}</Badge>
        </Card>
        <Card C={C}>
          <div style={{ fontSize: 12, color: C.textDim, marginBottom: 8 }}>Prioritas</div>
          <Badge color={priorityMeta[wo.priority].color}>{priorityMeta[wo.priority].label}</Badge>
        </Card>
        <Card C={C}>
          <div style={{ fontSize: 12, color: C.textDim, marginBottom: 6 }}>Tipe</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: C.text, textTransform: "capitalize" }}>{wo.type}</div>
        </Card>
        <Card C={C}>
          <div style={{ fontSize: 12, color: C.textDim, marginBottom: 6 }}>PIC</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: C.text }}>{wo.assignee}</div>
        </Card>
      </div>
      <Card C={C}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 14 }}>Detail & Keterkaitan</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
            <span style={{ color: C.textDim }}>Aset Terkait</span>
            {asset ? <LinkButton C={C} onClick={() => onOpenAsset(asset.id)}>{asset.name} ({asset.id})</LinkButton> : <span>{wo.asset}</span>}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
            <span style={{ color: C.textDim }}>Sumber</span>
            {linkedPm
              ? <LinkButton C={C} icon={Link2} onClick={() => onOpenPm(linkedPm.id)}>Jadwal PM {linkedPm.id}</LinkButton>
              : <span style={{ color: C.text }}>Dibuat manual</span>}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
            <span style={{ color: C.textDim }}>Dibuat</span>
            <span style={{ color: C.text }}>{wo.created}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
            <span style={{ color: C.textDim }}>Mulai Dikerjakan</span>
            <span style={{ color: C.text }}>{wo.startedAt || "—"}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
            <span style={{ color: C.textDim }}>Selesai</span>
            <span style={{ color: C.text }}>{wo.completedAt || "Belum selesai"}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ================== ROOT APP ================== */
export default function CMMSDemo() {
  const [themeName, setThemeName] = useState("dark");
  const C = THEMES[themeName];
  const [tab, setTab] = useState("dashboard");

  const [assets, setAssets] = useState(seedAssets);
  const [workOrders, setWorkOrders] = useState(seedWorkOrders);
  const [pms, setPms] = useState(() => seedPM.map(p => ({ ...p, status: computeAutoPmStatus(p.due) })));
  const [pmHistory, setPmHistory] = useState([]);
  const [fmea, setFmea] = useState(seedFMEA);

  // Halaman detail yang sedang dibuka (null = tidak ada, tampilkan list biasa)
  const [openAssetId, setOpenAssetId] = useState(null);
  const [openWOId, setOpenWOId] = useState(null);
  const [showAbout, setShowAbout] = useState(false);

  // ID counters — dibuat sekali via useMemo, counter murni naik terus,
  // tidak pernah dihitung ulang dari isi array (itu penyebab bug lama).
  const genWoId = useMemo(() => createIdCounter("WO", 42), []);
  const genPmId = useMemo(() => createIdCounter("PM", 7), []);
  const genFmId = useMemo(() => createIdCounter("FM", 7), []);

  const priorityFromPmStatus = (status) => status === "overdue" ? "high" : "medium";

  /* -------------------------------------------------
     NAVIGASI ANTAR HALAMAN DETAIL
  ------------------------------------------------- */
  const openAssetDetail = (id) => { setOpenAssetId(id); setOpenWOId(null); setTab("assets"); };
  const openWODetail = (id) => { setOpenWOId(id); setOpenAssetId(null); setTab("wo"); };
  const openPmFromAnywhere = (id) => { setTab("pm"); setOpenAssetId(null); setOpenWOId(null); };
  const navigateTab = (t) => { setOpenAssetId(null); setOpenWOId(null); setTab(t); };

  /* -------------------------------------------------
     KORELASI: PM -> Work Order
  ------------------------------------------------- */
  const generateWOFromPM = (pm) => {
    if (pm.linkedWO) return;
    const stamp = nowStamp();
    const newId = genWoId();
    const newWO = {
      id: newId,
      asset: pm.asset,
      title: `[PM ${pm.freq}] ${pm.task}`,
      type: "preventive",
      priority: priorityFromPmStatus(pm.status),
      status: "open",
      assignee: pm.pic && pm.pic !== "Belum ditentukan" ? pm.pic : "Unassigned",
      created: stamp.split(" ")[0],
      startedAt: stamp,
      completedAt: "",
      sourcePmId: pm.id,
      cycleProcessed: false, assetImpactOpened: false, assetImpactCompleted: false,
    };
    setWorkOrders(prev => [newWO, ...prev]);
    setPms(prev => prev.map(p => p.id === pm.id ? { ...p, linkedWO: newId } : p));
  };

  /* -------------------------------------------------
     KORELASI: FMEA -> Jadwal PM (mitigasi risiko)
     Membuat jadwal PM baru dari suatu failure mode, lalu
     menandai entri FMEA itu sebagai sudah punya PM mitigasi.
  ------------------------------------------------- */
  const generatePMFromFMEA = (fm) => {
    if (fm.linkedPmId) return;
    const newPmId = genPmId();
    const due = addDays(todayStr(), 14); // default: mitigasi dijadwalkan 2 minggu dari sekarang
    const newPM = {
      id: newPmId,
      asset: fm.asset,
      task: `[Mitigasi FMEA ${fm.id}] Inspeksi ${fm.component} — cegah: ${fm.failureMode}`,
      freq: "Bulanan",
      due,
      pic: "Belum ditentukan",
      linkedWO: null,
      status: computeAutoPmStatus(due),
    };
    setPms(prev => [...prev, newPM]);
    setFmea(prev => prev.map(f => f.id === fm.id ? { ...f, linkedPmId: newPmId } : f));
  };

  /* -------------------------------------------------
     KORELASI: Work Order (korektif) -> status & health Asset
     - WO korektif baru dibuat (prioritas tinggi/kritis) -> aset jadi Breakdown
     - WO korektif diselesaikan -> aset kembali Beroperasi, health naik sedikit
  ------------------------------------------------- */
  const applyAssetImpact = (wo, phase) => {
    if (wo.type !== "corrective") return;
    setAssets(prev => prev.map(a => {
      if (a.id !== wo.asset) return a;
      if (phase === "opened") {
        const shouldBreakdown = wo.priority === "critical" || wo.priority === "high";
        return shouldBreakdown ? { ...a, status: "down" } : { ...a, status: "maintenance" };
      }
      if (phase === "completed") {
        const boosted = Math.min(100, a.health + 8);
        return { ...a, status: "running", health: boosted, lastMaint: todayStr() };
      }
      return a;
    }));
  };

  /* -------------------------------------------------
     STATUS PM OTOMATIS — dihitung ulang tiap hari berganti
  ------------------------------------------------- */
  useEffect(() => {
    setPms(prev => {
      let changed = false;
      const next = prev.map(pm => {
        const autoStatus = computeAutoPmStatus(pm.due);
        if (autoStatus !== pm.status) { changed = true; return { ...pm, status: autoStatus }; }
        return pm;
      });
      return changed ? next : prev;
    });
  }, [todayStr()]);

  /* -------------------------------------------------
     AUTO-GENERATE WO saat PM due_soon/overdue tanpa linkedWO
  ------------------------------------------------- */
  useEffect(() => {
    pms.forEach(pm => {
      if ((pm.status === "due_soon" || pm.status === "overdue") && !pm.linkedWO) {
        generateWOFromPM(pm);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pms.map(p => `${p.id}:${p.status}:${p.linkedWO}`).join("|")]);

  /* -------------------------------------------------
     SIKLUS PM: saat WO bersumber dari PM selesai -> riwayat + siklus baru.
     Setiap WO hanya diproses SEKALI (cycleProcessed) supaya tidak
     menggeser siklus berulang-ulang setiap re-render (bug lama).
  ------------------------------------------------- */
  useEffect(() => {
    const justCompleted = workOrders.filter(
      w => w.sourcePmId && w.status === "completed" && !w.cycleProcessed
    );
    if (justCompleted.length === 0) return;

    const processedPmIds = new Set();

    justCompleted.forEach(wo => {
      setWorkOrders(prev => prev.map(w => w.id === wo.id ? { ...w, cycleProcessed: true } : w));

      const pm = pms.find(p => p.id === wo.sourcePmId);
      if (!pm || processedPmIds.has(pm.id)) return;
      processedPmIds.add(pm.id);

      const completedDate = (wo.completedAt || todayStr()).split(" ")[0];
      const nextDue = addDays(completedDate, freqToDays(pm.freq));

      setPmHistory(prev => [
        { ...pm, status: "completed", completedAt: wo.completedAt || completedDate, completedWO: wo.id },
        ...prev,
      ]);

      setPms(prev => prev.map(p =>
        p.id === pm.id
          ? { ...p, due: nextDue, status: computeAutoPmStatus(nextDue), linkedWO: null }
          : p
      ));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workOrders.map(w => `${w.id}:${w.status}:${w.cycleProcessed}`).join("|")]);

  /* -------------------------------------------------
     KORELASI: WO korektif dibuka/diselesaikan -> dampak ke Asset.
     Dipantau lewat perubahan status WO korektif, ditandai
     assetImpactProcessed supaya tidak diterapkan berulang.
  ------------------------------------------------- */
  useEffect(() => {
    const needsOpenImpact = workOrders.filter(
      w => w.type === "corrective" && w.status !== "completed" && !w.assetImpactOpened
    );
    const needsCompleteImpact = workOrders.filter(
      w => w.type === "corrective" && w.status === "completed" && !w.assetImpactCompleted
    );
    if (needsOpenImpact.length === 0 && needsCompleteImpact.length === 0) return;

    needsOpenImpact.forEach(wo => {
      applyAssetImpact(wo, "opened");
      setWorkOrders(prev => prev.map(w => w.id === wo.id ? { ...w, assetImpactOpened: true } : w));
    });
    needsCompleteImpact.forEach(wo => {
      applyAssetImpact(wo, "completed");
      setWorkOrders(prev => prev.map(w => w.id === wo.id ? { ...w, assetImpactCompleted: true } : w));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workOrders.map(w => `${w.id}:${w.status}:${w.assetImpactOpened}:${w.assetImpactCompleted}`).join("|")]);

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "wo", label: "Work Order", icon: ClipboardList },
    { id: "assets", label: "Aset / Peralatan", icon: Boxes },
    { id: "pm", label: "Jadwal PM", icon: CalendarClock },
    { id: "pmhistory", label: "Riwayat PM", icon: History },
    { id: "fmea", label: "FMEA", icon: ShieldAlert },
    { id: "kpi", label: "KPI & Laporan", icon: Gauge },
  ];

  const openAsset = openAssetId ? assets.find(a => a.id === openAssetId) : null;
  const openWO = openWOId ? workOrders.find(w => w.id === openWOId) : null;
  const openWOAsset = openWO ? assets.find(a => a.id === openWO.asset) : null;
  const openWOLinkedPm = openWO?.sourcePmId ? pms.find(p => p.id === openWO.sourcePmId) : null;

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
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>WLDN-CMMS</div>
            <div style={{ fontSize: 10.5, color: C.textDim }}>WM Training</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {tabs.map(t => (
            <NavItem C={C} key={t.id} icon={t.icon} label={t.label} active={tab === t.id} onClick={() => navigateTab(t.id)} />
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
          <div style={{ fontSize: 11, color: C.textDim, lineHeight: 1.5, marginBottom: 10 }}>
            Materi Training<br />
            <span style={{ color: C.steelLight }}>Maintenance of Machine Tools</span>
          </div>
          <button
            onClick={() => setShowAbout(true)}
            style={{
              display: "flex", alignItems: "center", gap: 8, width: "100%",
              padding: "8px 10px", borderRadius: 7, border: `1px solid ${C.border}`,
              background: "transparent", color: C.textDim, fontSize: 12.5, fontWeight: 600,
              cursor: "pointer"
            }}
          >
            <Info size={14} /> Tentang
          </button>
        </div>
      </div>

      {showAbout && <AboutModal C={C} onClose={() => setShowAbout(false)} />}

      {/* Main content */}
      <div style={{ flex: 1, padding: 26, overflowY: "auto" }}>
        {tab === "dashboard" && (
          <Dashboard C={C} assets={assets} workOrders={workOrders} pms={pms}
            onOpenAsset={openAssetDetail} onOpenWO={openWODetail} onNavigateTab={navigateTab} />
        )}

        {tab === "wo" && !openWO && (
          <WorkOrders C={C} workOrders={workOrders} setWorkOrders={setWorkOrders} assets={assets} pms={pms}
            genWoId={genWoId} onOpenAsset={openAssetDetail} onOpenPm={openPmFromAnywhere}
            filterAssetId={null} onClearAssetFilter={() => {}} />
        )}
        {tab === "wo" && openWO && (
          <WODetail wo={openWO} asset={openWOAsset} linkedPm={openWOLinkedPm} C={C}
            onBack={() => setOpenWOId(null)} onOpenAsset={openAssetDetail} onOpenPm={openPmFromAnywhere} />
        )}

        {tab === "assets" && !openAsset && (
          <Assets C={C} assets={assets} setAssets={setAssets} onOpenDetail={openAssetDetail} />
        )}
        {tab === "assets" && openAsset && (
          <AssetDetail asset={openAsset} workOrders={workOrders} pms={pms} fmea={fmea} C={C}
            onBack={() => setOpenAssetId(null)} onOpenWO={openWODetail}
            onOpenFmeaTab={() => navigateTab("fmea")} />
        )}

        {tab === "pm" && (
          <PMSchedule C={C} pms={pms} setPms={setPms} assets={assets} onGenerateWO={generateWOFromPM}
            onOpenAsset={openAssetDetail} onOpenWO={openWODetail} genPmId={genPmId} />
        )}
        {tab === "pmhistory" && (
          <PMHistory C={C} history={pmHistory} onOpenAsset={openAssetDetail} onOpenWO={openWODetail} />
        )}
        {tab === "fmea" && (
          <FMEA C={C} fmea={fmea} setFmea={setFmea} assets={assets} pms={pms}
            onOpenAsset={openAssetDetail} onOpenPm={openPmFromAnywhere}
            onGeneratePM={generatePMFromFMEA} genFmId={genFmId} />
        )}
        {tab === "kpi" && <KPIReport C={C} assets={assets} workOrders={workOrders} />}
      </div>
    </div>
  );
}