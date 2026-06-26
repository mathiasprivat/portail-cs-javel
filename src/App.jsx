import { useState, useRef, useEffect } from "react";

const C = {
  stone: "#F0EBE1", slate: "#2C3E50", steel: "#7F8C8D",
  copper: "#B87333", cream: "#FAFAF8", lightStone: "#E8E0D4",
  darkSlate: "#1a252f", green: "#4caf50", red: "#e53935",
};

const labelStyle = {
  display: "block", fontFamily: "Inter, system-ui, sans-serif",
  fontSize: 11, fontWeight: 700, color: C.steel,
  textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6,
};
const inputStyle = {
  width: "100%", boxSizing: "border-box",
  fontFamily: "Inter, system-ui, sans-serif",
  fontSize: 14, color: C.slate, border: `1px solid ${C.lightStone}`,
  borderRadius: 5, padding: "8px 12px", background: "white", outline: "none",
};
const addBtnStyle = (color = C.copper) => ({
  marginTop: 8, background: "none", border: `1px dashed ${color}`,
  color, borderRadius: 4, padding: "6px 14px", fontSize: 12,
  fontFamily: "Inter, system-ui, sans-serif", cursor: "pointer", fontWeight: 600,
});

// ── CS Members list (declared early — used by OwnerDropdown & MemberPicker) ───
const MEMBERS = [
  { name: "Mathias Privat",        role: "Président", email: "mathias.privat1@gmail.com",    phone: "+33 6 99 43 93 29" },
  { name: "Denis Barbet-Massin",   role: "Membre",    email: "denis.barbetmassin@gmail.com", phone: "" },
  { name: "Jean-Baptiste Petteni", role: "Membre",    email: "jbpetteni@me.com",             phone: "" },
  { name: "Antoine Jean",          role: "Membre",    email: "antoine.jean1110@gmail.com",   phone: "" },
  { name: "Jean-Jacques Chevalier",role: "Membre",    email: "email.jjc@gmail.com",          phone: "" },
  { name: "Philippe Monéger",      role: "Membre",    email: "phmoneger@wanadoo.fr",         phone: "" },
  { name: "Yves Ripert",           role: "Membre",    email: "yjl.ripert@gmail.com",         phone: "" },
];

// ── Persist-aware list helpers (used by all add buttons) ──────────────────────
const lsGetRaw = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
};
const lsSetRaw = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

// ── Inline adder popup (replaces all prompt() calls) ─────────────────────────
// fields: [{key, label, placeholder, multiline?}]
function InlineAdder({ fields, onAdd, color, buttonLabel }) {
  const [open, setOpen] = useState(false);
  const [vals, setVals] = useState({});
  const firstRef = useRef();

  const handleOpen = () => {
    setVals({});
    setOpen(true);
    setTimeout(() => firstRef.current?.focus(), 50);
  };
  const handleAdd = () => {
    const first = fields[0].key;
    if (!vals[first]?.trim()) return;
    onAdd(vals);
    setVals({});
    setOpen(false);
  };

  return (
    <div style={{ marginTop: 10 }}>
      {!open ? (
        <button onClick={handleOpen} style={addBtnStyle(color)}>{buttonLabel}</button>
      ) : (
        <div style={{ background: "white", border: `1px solid ${color}50`, borderRadius: 8, padding: "14px 16px", marginTop: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.steel, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
            {buttonLabel}
          </div>
          {fields.map((f, i) => (
            <div key={f.key} style={{ marginBottom: 10 }}>
              <label style={labelStyle}>{f.label}</label>
              {f.multiline ? (
                <textarea
                  ref={i === 0 ? firstRef : null}
                  value={vals[f.key] || ""}
                  onChange={e => setVals(v => ({ ...v, [f.key]: e.target.value }))}
                  rows={2}
                  style={{ ...inputStyle, resize: "vertical" }}
                  placeholder={f.placeholder || ""}
                />
              ) : (
                <input
                  ref={i === 0 ? firstRef : null}
                  value={vals[f.key] || ""}
                  onChange={e => setVals(v => ({ ...v, [f.key]: e.target.value }))}
                  onKeyDown={e => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") setOpen(false); }}
                  style={inputStyle}
                  placeholder={f.placeholder || ""}
                />
              )}
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button
              onClick={handleAdd}
              disabled={!vals[fields[0].key]?.trim()}
              style={{
                background: vals[fields[0].key]?.trim() ? color : "#ccc",
                color: "white", border: "none", borderRadius: 5,
                padding: "7px 18px", fontSize: 13, fontWeight: 600,
                fontFamily: "Inter, system-ui, sans-serif",
                cursor: vals[fields[0].key]?.trim() ? "pointer" : "default",
              }}
            >Valider</button>
            <button
              onClick={() => setOpen(false)}
              style={{ background: "none", border: `1px solid ${C.lightStone}`, borderRadius: 5, padding: "7px 14px", fontSize: 13, cursor: "pointer", color: C.steel, fontFamily: "Inter, system-ui, sans-serif" }}
            >Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Links manager (Liens utiles) ──────────────────────────────────────────────
function LinksManager() {
  const [links, setLinks] = useState(() => lsGetRaw("cs-links", []));

  const addLink = (vals) => {
    const next = [...links, { id: Date.now(), title: vals.title.trim(), url: vals.url.trim() }];
    setLinks(next);
    lsSetRaw("cs-links", next);
  };
  const removeLink = (id) => {
    const next = links.filter(l => l.id !== id);
    setLinks(next);
    lsSetRaw("cs-links", next);
  };

  return (
    <div>
      {links.length === 0 && (
        <div style={{ background: C.lightStone, borderRadius: 8, padding: "12px 16px", fontSize: 13, color: C.steel, fontStyle: "italic", marginBottom: 12 }}>
          Aucun lien enregistré. Ajoutez votre premier lien ci-dessous.
        </div>
      )}
      {links.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
          {links.map(l => (
            <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "white", borderRadius: 6, padding: "9px 14px", border: `1px solid ${C.lightStone}`, boxShadow: "0 1px 4px rgba(44,62,80,0.05)" }}>
              <span style={{ fontSize: 16 }}>🔗</span>
              <a href={l.url} target="_blank" rel="noreferrer" style={{ flex: 1, fontFamily: "Inter, system-ui, sans-serif", fontSize: 14, color: C.copper, fontWeight: 600, textDecoration: "none" }}
                onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}
              >{l.title}</a>
              <span style={{ fontSize: 11, color: C.steel, fontFamily: "Inter, system-ui, sans-serif", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.url}</span>
              <span onClick={() => removeLink(l.id)} title="Supprimer" style={{ cursor: "pointer", color: C.steel, opacity: 0.4, fontSize: 16, lineHeight: 1 }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
                onMouseLeave={e => e.currentTarget.style.opacity = "0.4"}
              >×</span>
            </div>
          ))}
        </div>
      )}
      <InlineAdder
        color={C.copper}
        buttonLabel="+ Ajouter un lien"
        fields={[
          { key: "title", label: "Titre", placeholder: "ex : Espace extranet Atrium" },
          { key: "url",   label: "Adresse URL", placeholder: "https://…" },
        ]}
        onAdd={addLink}
      />
    </div>
  );
}

// ── Building facade ────────────────────────────────────────────────────────────
function FacadeBackground() {
  const windows = [];
  for (let row = 0; row < 8; row++)
    for (let col = 0; col < 6; col++)
      windows.push({ row, col });
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, background: "linear-gradient(180deg,#1a2a3a 0%,#2C3E50 40%,#3d5166 100%)", overflow: "hidden" }}>
      {windows.map(({ row, col }) => (
        <div key={`${row}-${col}`} style={{
          position: "absolute", left: `${8 + col * 15.5}%`, top: `${5 + row * 11}%`,
          width: "8%", height: "7%",
          background: row % 3 === 0 ? "rgba(255,220,120,0.15)" : "rgba(20,40,60,0.6)",
          border: "1px solid rgba(184,115,51,0.2)", borderRadius: 1,
          boxShadow: row % 3 === 0 ? "0 0 8px rgba(255,200,80,0.3)" : "none",
        }} />
      ))}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4%", background: C.darkSlate, borderBottom: `3px solid ${C.copper}` }} />
    </div>
  );
}

function Balustrade() {
  return (
    <div style={{ width: "100%", lineHeight: 0 }}>
      <svg viewBox="0 0 800 28" preserveAspectRatio="none" style={{ width: "100%", height: 28, display: "block" }}>
        <rect x="0" y="0" width="800" height="4" fill={C.copper} />
        {Array.from({ length: 40 }).map((_, i) => (
          <rect key={i} x={i * 20 + 8} y="4" width="4" height="16" rx="2" fill={C.copper} opacity="0.65" />
        ))}
        <rect x="0" y="20" width="800" height="4" fill={C.copper} />
        <rect x="0" y="24" width="800" height="4" fill={C.darkSlate} />
      </svg>
    </div>
  );
}

// ── File zone ──────────────────────────────────────────────────────────────────
function FileZone({ files, onAdd }) {
  const ref = useRef();
  return (
    <div>
      <div onClick={() => ref.current.click()} style={{
        border: `2px dashed ${C.copper}`, borderRadius: 6, padding: "10px 16px",
        cursor: "pointer", background: "#fdf8f3", textAlign: "center",
        fontSize: 13, color: C.steel, fontFamily: "Inter, system-ui, sans-serif",
      }}
        onMouseEnter={e => e.currentTarget.style.background = "#f5ece0"}
        onMouseLeave={e => e.currentTarget.style.background = "#fdf8f3"}
      >📎 Déposer ou sélectionner un document</div>
      <input ref={ref} type="file" multiple style={{ display: "none" }}
        onChange={e => onAdd(Array.from(e.target.files).map(f => f.name))} />
      {files.length > 0 && (
        <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
          {files.map((f, i) => (
            <span key={i} style={{ background: C.lightStone, color: C.slate, borderRadius: 4, padding: "2px 10px", fontSize: 12, fontFamily: "Inter, system-ui, sans-serif", border: `1px solid ${C.copper}40` }}>📄 {f}</span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Checklist item (editable) ──────────────────────────────────────────────────
function ChecklistItem({ text, checked, onCheck, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(text);

  const commit = () => {
    if (draft.trim()) onEdit(draft.trim());
    setEditing(false);
  };

  if (editing) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <input
          autoFocus
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
          style={{ ...inputStyle, flex: 1, padding: "5px 10px", fontSize: 13 }}
        />
        <button onClick={commit} style={{ background: C.copper, color: "white", border: "none", borderRadius: 4, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>✓</button>
        <button onClick={() => setEditing(false)} style={{ background: "none", border: `1px solid ${C.steel}`, borderRadius: 4, padding: "5px 10px", fontSize: 12, cursor: "pointer", color: C.steel }}>✕</button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6, group: true }}>
      <input type="checkbox" checked={checked} onChange={onCheck}
        style={{ marginTop: 3, accentColor: C.copper, width: 16, height: 16, cursor: "pointer", flexShrink: 0 }} />
      <span style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: 14, color: checked ? C.steel : C.slate, textDecoration: checked ? "line-through" : "none", flex: 1, lineHeight: 1.5 }}>
        {text}
      </span>
      <span
        onClick={() => { setDraft(text); setEditing(true); }}
        title="Modifier"
        style={{ cursor: "pointer", fontSize: 13, opacity: 0.35, flexShrink: 0, marginTop: 2, transition: "opacity 0.15s" }}
        onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
        onMouseLeave={e => e.currentTarget.style.opacity = "0.35"}
      >✏️</span>
    </div>
  );
}

// ── Step adder popup ───────────────────────────────────────────────────────────
function StepAdder({ onAdd, accentColor }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef();

  const handleOpen = () => { setValue(""); setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); };
  const handleAdd = () => {
    if (value.trim()) { onAdd(value.trim()); setValue(""); setOpen(false); }
  };

  return (
    <div style={{ marginTop: 8 }}>
      {!open ? (
        <button onClick={handleOpen} style={addBtnStyle(accentColor)}>+ Ajouter une étape</button>
      ) : (
        <div style={{ background: "white", border: `1px solid ${accentColor}60`, borderRadius: 8, padding: "12px 14px", marginTop: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.steel, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Nouvelle étape</div>
          <input
            ref={inputRef}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") setOpen(false); }}
            placeholder="Décrire l'étape…"
            style={{ ...inputStyle, marginBottom: 10 }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleAdd} disabled={!value.trim()} style={{ background: value.trim() ? accentColor : "#ccc", color: "white", border: "none", borderRadius: 5, padding: "7px 18px", fontSize: 13, cursor: value.trim() ? "pointer" : "default", fontWeight: 600, fontFamily: "Inter, system-ui, sans-serif" }}>
              Valider
            </button>
            <button onClick={() => setOpen(false)} style={{ background: "none", border: `1px solid ${C.lightStone}`, borderRadius: 5, padding: "7px 14px", fontSize: 13, cursor: "pointer", color: C.steel, fontFamily: "Inter, system-ui, sans-serif" }}>
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Owner dropdown (CS members) ────────────────────────────────────────────────
function OwnerDropdown({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ ...inputStyle, cursor: "pointer", appearance: "auto" }}
    >
      <option value="">— Choisir un responsable —</option>
      {MEMBERS.map((m, i) => (
        <option key={i} value={m.name}>{m.name}</option>
      ))}
    </select>
  );
}

// ── Generic expandable card ────────────────────────────────────────────────────
function ProjectCard({ project, onChange, accentColor, statusLabel, showBudget = false, showResolution = false }) {
  const [open, setOpen] = useState(false);
  const done = project.steps.length > 0 && project.steps.every(s => s.checked);
  const headerBg = accentColor + "22";

  const updateStep = (i, patch) => {
    const steps = project.steps.map((s, j) => j === i ? { ...s, ...patch } : s);
    onChange({ ...project, steps });
  };

  return (
    <div style={{ border: `1px solid ${accentColor}40`, borderRadius: 8, marginBottom: 12, overflow: "hidden", boxShadow: "0 2px 8px rgba(44,62,80,0.07)" }}>
      <div onClick={() => setOpen(o => !o)} style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: headerBg, padding: "11px 16px", cursor: "pointer",
        borderLeft: `4px solid ${accentColor}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{
            background: done ? C.green : accentColor, color: "white", borderRadius: 4,
            padding: "2px 8px", fontSize: 10, fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap",
          }}>{done ? "Terminé" : (statusLabel || "En cours")}</span>
          <span style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 15, fontWeight: 700, color: C.slate }}>{project.title}</span>
          {showBudget && project.budget && (
            <span style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: 12, color: accentColor, fontWeight: 600, background: accentColor + "18", borderRadius: 4, padding: "1px 8px", whiteSpace: "nowrap" }}>
              {project.budget}
            </span>
          )}
        </div>
        <span style={{ color: C.steel, fontSize: 13, marginLeft: 8 }}>{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div style={{ padding: "16px 20px", background: C.cream }}>
          <div style={{ display: "grid", gridTemplateColumns: showBudget ? "1fr 1fr" : "1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>👤 Responsable</label>
              <OwnerDropdown value={project.owner} onChange={v => onChange({ ...project, owner: v })} />
            </div>
            {showBudget && (
              <div>
                <label style={labelStyle}>💰 Budget (TTC)</label>
                <input value={project.budget || ""} onChange={e => onChange({ ...project, budget: e.target.value })} style={inputStyle} placeholder="ex : 18 210 €" />
              </div>
            )}
          </div>
          {showResolution && (
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>📋 Résolution AG</label>
              <input value={project.resolution || ""} onChange={e => onChange({ ...project, resolution: e.target.value })} style={inputStyle} placeholder="ex : Résolution 17 — AGO juin 2025" />
            </div>
          )}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>✅ Prochaines étapes</label>
            {project.steps.map((step, i) => (
              <ChecklistItem
                key={i}
                text={step.text}
                checked={step.checked}
                onCheck={() => updateStep(i, { checked: !step.checked })}
                onEdit={text => updateStep(i, { text })}
              />
            ))}
            <StepAdder
              accentColor={accentColor}
              onAdd={text => onChange({ ...project, steps: [...project.steps, { text, checked: false }] })}
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>💬 Commentaires</label>
            <textarea value={project.comment} onChange={e => onChange({ ...project, comment: e.target.value })}
              rows={3} style={{ ...inputStyle, resize: "vertical" }} placeholder="Notes, observations…" />
          </div>
          <div>
            <label style={labelStyle}>📎 Documents</label>
            <FileZone files={project.files} onAdd={names => onChange({ ...project, files: [...project.files, ...names] })} />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Member picker (dropdown from CS list) ─────────────────────────────────────
function MemberPicker({ project, onChange }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const alreadyIn = new Set(project.members.map(m => m.name));
  const available = MEMBERS.filter(m => !alreadyIn.has(m.name));

  const addMember = (name) => {
    const isFirst = project.members.length === 0;
    onChange({ ...project, members: [...project.members, { name, lead: isFirst }] });
    setShowDropdown(false);
  };

  const removeMember = (name) => {
    const next = project.members.filter(m => m.name !== name);
    // if we removed the lead and there are others, promote the first
    const hasLead = next.some(m => m.lead);
    if (!hasLead && next.length > 0) next[0] = { ...next[0], lead: true };
    onChange({ ...project, members: next });
  };

  const toggleLead = (name) => {
    const next = project.members.map(m => ({ ...m, lead: m.name === name }));
    onChange({ ...project, members: next });
  };

  return (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle}>👥 Membres du groupe</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
        {project.members.map((m, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 5,
            background: m.lead ? C.copper : C.lightStone,
            color: m.lead ? "white" : C.slate,
            borderRadius: 20, padding: "3px 10px 3px 12px",
            fontSize: 13, fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: m.lead ? 600 : 400,
            border: `1px solid ${m.lead ? C.copper : "#ccc"}`,
          }}>
            <span
              title={m.lead ? "Responsable" : "Désigner responsable"}
              onClick={() => toggleLead(m.name)}
              style={{ cursor: "pointer", opacity: m.lead ? 1 : 0.4, fontSize: 11 }}
            >★</span>
            <span>{m.name}</span>
            <span
              onClick={() => removeMember(m.name)}
              title="Retirer"
              style={{ cursor: "pointer", marginLeft: 2, opacity: 0.6, fontSize: 13, lineHeight: 1 }}
            >×</span>
          </div>
        ))}
        {project.members.length === 0 && (
          <span style={{ fontSize: 13, color: C.steel, fontStyle: "italic", fontFamily: "Inter, system-ui, sans-serif" }}>
            Aucun membre pour l'instant
          </span>
        )}
      </div>

      {/* Dropdown trigger */}
      <div style={{ position: "relative", display: "inline-block" }}>
        <button
          onClick={() => setShowDropdown(v => !v)}
          style={{
            ...addBtnStyle(C.slate),
            display: "flex", alignItems: "center", gap: 6,
          }}
          disabled={available.length === 0}
        >
          + Ajouter un membre {available.length > 0 ? "▾" : "(tous ajoutés)"}
        </button>

        {showDropdown && available.length > 0 && (
          <div style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 100,
            background: "white", borderRadius: 8,
            border: `1px solid ${C.lightStone}`,
            boxShadow: "0 4px 16px rgba(44,62,80,0.15)",
            minWidth: 210, overflow: "hidden",
          }}>
            {available.map((m, i) => (
              <div
                key={i}
                onClick={() => addMember(m.name)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 14px", cursor: "pointer",
                  fontFamily: "Inter, system-ui, sans-serif",
                  fontSize: 13, color: C.slate,
                  borderBottom: i < available.length - 1 ? `1px solid ${C.lightStone}` : "none",
                  background: "white",
                  transition: "background 0.1s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = C.lightStone}
                onMouseLeave={e => e.currentTarget.style.background = "white"}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: C.copper, color: "white",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, flexShrink: 0,
                }}>
                  {m.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
                </div>
                <span>{m.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Long-term card ─────────────────────────────────────────────────────────────
function LongTermCard({ project, onChange }) {
  const [open, setOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState(project.comment);
  const [saveStatus, setSaveStatus] = useState("idle"); // "idle" | "saving" | "saved" | "error"
  const storageKey = `lt-note-${project.id}`;
  const savedComment = useRef(project.comment);

  const isDirty = noteDraft !== savedComment.current;

  const handleSave = () => {
    setSaveStatus("saving");
    try {
      // onChange = updateLongterm, which persists to localStorage automatically
      onChange({ ...project, comment: noteDraft });
      savedComment.current = noteDraft;
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  return (
    <div style={{ border: `1px solid #7F8C8D40`, borderRadius: 8, marginBottom: 12, overflow: "hidden", boxShadow: "0 2px 8px rgba(44,62,80,0.07)" }}>
      <div onClick={() => setOpen(o => !o)} style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "#DDE4EC", padding: "11px 16px", cursor: "pointer",
        borderLeft: `4px solid ${C.slate}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ background: C.slate, color: "white", borderRadius: 4, padding: "2px 8px", fontSize: 10, fontFamily: "Inter, system-ui, sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Groupe de travail</span>
          <span style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 15, fontWeight: 700, color: C.slate }}>{project.title}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {project.members.filter(m => m.lead).map((m, i) => (
            <span key={i} style={{ fontSize: 12, color: C.slate, fontFamily: "Inter, system-ui, sans-serif" }}>★ {m.name}</span>
          ))}
          <span style={{ color: C.steel, fontSize: 13, marginLeft: 4 }}>{open ? "▲" : "▼"}</span>
        </div>
      </div>

      {open && (
        <div style={{ padding: "16px 20px", background: C.cream }}>
          <MemberPicker project={project} onChange={onChange} />

          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>💬 Notes & avancement</label>
              {isDirty && saveStatus === "idle" && (
                <span style={{ fontSize: 11, color: C.copper, fontFamily: "Inter, system-ui, sans-serif", fontStyle: "italic" }}>
                  Modifications non enregistrées
                </span>
              )}
              {saveStatus === "saved" && (
                <span style={{ fontSize: 11, color: C.green, fontFamily: "Inter, system-ui, sans-serif", fontWeight: 600 }}>
                  ✓ Enregistré
                </span>
              )}
              {saveStatus === "error" && (
                <span style={{ fontSize: 11, color: C.red, fontFamily: "Inter, system-ui, sans-serif", fontWeight: 600 }}>
                  ✕ Erreur — réessayez
                </span>
              )}
            </div>

            <textarea
              value={noteDraft}
              onChange={e => setNoteDraft(e.target.value)}
              rows={5}
              style={{
                ...inputStyle,
                resize: "vertical",
                borderColor: isDirty ? C.copper : C.lightStone,
                transition: "border-color 0.2s",
              }}
              placeholder="Résumé des échanges, options étudiées, décisions prises…"
            />

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
              <button
                onClick={handleSave}
                disabled={!isDirty || saveStatus === "saving"}
                style={{
                  background: isDirty ? C.slate : "#c5cdd6",
                  color: "white",
                  border: "none",
                  borderRadius: 5,
                  padding: "7px 20px",
                  fontSize: 13,
                  fontFamily: "Inter, system-ui, sans-serif",
                  fontWeight: 600,
                  cursor: isDirty ? "pointer" : "default",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "background 0.2s",
                }}
              >
                {saveStatus === "saving" ? "⏳ Enregistrement…" : "💾 Enregistrer"}
              </button>
            </div>
          </div>

          <div>
            <label style={labelStyle}>📎 Documents</label>
            <FileZone files={project.files} onAdd={names => onChange({ ...project, files: [...project.files, ...names] })} />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Section block inside a tab ─────────────────────────────────────────────────
function SectionBlock({ title, icon, color, children }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, paddingBottom: 8, borderBottom: `2px solid ${color}` }}>
        <span style={{ fontSize: 17 }}>{icon}</span>
        <h3 style={{ margin: 0, fontFamily: "'Playfair Display',Georgia,serif", fontSize: 16, fontWeight: 700, color: C.slate }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ── Member card ────────────────────────────────────────────────────────────────
function MemberCard({ name, role, email, phone }) {
  return (
    <div style={{ background: "white", borderRadius: 8, border: `1px solid ${C.lightStone}`, padding: "14px 18px", boxShadow: "0 2px 6px rgba(44,62,80,0.06)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.copper, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display',Georgia,serif", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
          {name.split(" ").map(w => w[0]).slice(0, 2).join("")}
        </div>
        <div>
          <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 15, fontWeight: 700, color: C.slate }}>{name}</div>
          {role && <div style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: 10, color: C.copper, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{role}</div>}
        </div>
      </div>
      {email && <div style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: 12, color: C.steel, marginTop: 4 }}>✉️ {email}</div>}
      {phone && <div style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: 12, color: C.steel, marginTop: 2 }}>📞 {phone}</div>}
    </div>
  );
}

// ── Tab button ─────────────────────────────────────────────────────────────────
function TabBtn({ label, icon, active, onClick, color }) {
  return (
    <button onClick={onClick} style={{
      flex: "1 1 0", padding: "10px 6px 8px",
      background: active ? C.cream : "rgba(255,255,255,0.07)",
      border: "none", borderBottom: active ? `3px solid ${color}` : "3px solid transparent",
      cursor: "pointer", fontFamily: "Inter, system-ui, sans-serif",
      fontSize: 11, fontWeight: active ? 700 : 400,
      color: active ? color : "rgba(240,235,225,0.75)",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
      transition: "all 0.15s", borderRadius: active ? "4px 4px 0 0" : 0,
    }}>
      <span style={{ fontSize: 17 }}>{icon}</span>
      <span style={{ lineHeight: 1.2, textAlign: "center" }}>{label}</span>
    </button>
  );
}

// ── INITIAL DATA ───────────────────────────────────────────────────────────────
// Section A : Sinistres
const INIT_SINISTRES = [
  {
    id: 1, title: "Dégât des eaux chez Mme Bunel-Bailly Monthury", owner: "Denis Barbet-Massin",
    comment: "", files: [],
    steps: [
      { text: "Établir un diagnostic précis de l'origine du sinistre", checked: false },
      { text: "Déclarer le sinistre auprès de l'assurance de la copropriété", checked: false },
      { text: "Contacter le syndic pour désignation d'un prestataire", checked: false },
      { text: "Valider la solution retenue avec le CS", checked: false },
      { text: "Suivi des travaux de remise en état jusqu'à résolution", checked: false },
    ],
  },
];

// Section B : Travaux votés en AG (onglet 2)
const INIT_AG_VOTED = [
  {
    id: 1, title: "Garde-corps terrasse 6e étage (côté sud)",
    owner: "Denis Barbet-Massin", budget: "18 210 € TTC",
    resolution: "Résolution 17 — AGO 12 juin 2025",
    comment: "FADEM (dépose/pose) : ordre de service passé en mars 2026. ITEC (fixation plot + étanchéité) : devis ~6 266,50 €. Léger dépassement budgétaire absorbé à titre personnel par Denis.",
    files: [],
    steps: [
      { text: "FADEM : dépose de l'ancien garde-corps", checked: true },
      { text: "ITEC : fixation des plots et étanchéité", checked: false },
      { text: "FADEM : installation du nouveau garde-corps", checked: false },
      { text: "Réception des travaux et levée de réserves", checked: false },
    ],
  },
];

// Section C : Problèmes dans les parties communes
const INIT_PARTIES_COMMUNES = [
  {
    id: 1, title: "Capteur de mouvement couloir 2e étage", owner: "Mathias Privat",
    comment: "", files: [],
    steps: [
      { text: "Confirmer date d'intervention avec Atrium", checked: false },
      { text: "S'assurer de l'accès au couloir le jour J", checked: false },
      { text: "Vérifier bon fonctionnement après intervention", checked: false },
    ],
  },
];

// Section D : Prérogatives CS (sans vote AG)
const INIT_CS_PREROGA = [
  {
    id: 1, title: "Réorganisation du local à vélos — racks suspendus", owner: "Mathias Privat",
    comment: "Projet initié suite à l'étiquetage des vélos (mars 2026). Objectif : installer des racks suspendus pour optimiser l'espace. Trois étapes séquentielles : (1) obtenir 2 devis via Atrium, (2) soumettre au CS pour accord sous 7 jours, (3) donner le go au prestataire retenu.",
    files: [],
    steps: [
      { text: "Demander à Atrium de mandater 2 prestataires pour devis", checked: true },
      { text: "Réceptionner les 2 devis", checked: false },
      { text: "Soumettre les devis au CS pour accord (délai : 7 jours)", checked: false },
      { text: "Notifier Atrium du prestataire retenu et donner le go", checked: false },
      { text: "Suivi de l'intervention et réception des travaux", checked: false },
    ],
  },
  {
    id: 2, title: "Distribution des badges Vigik", owner: "Mathias Privat",
    comment: "", files: [],
    steps: [
      { text: "Lister les copropriétaires n'ayant pas reçu leur badge", checked: false },
      { text: "Relancer Atrium pour organisation de la distribution", checked: false },
      { text: "Confirmer bonne réception par tous", checked: false },
    ],
  },
];

// Section E : Travaux individuels nécessitant un vote en AG
const INIT_TRAV_INDIV = [];

// TAB 3 — Actions court terme
// Section : Actions urgentes
const INIT_URGENT_ACTIONS = [
  {
    id: 1, title: "Subvention Reanova (10 k€)", owner: "Denis Barbet-Massin",
    comment: "Subvention accordée mais non encore versée. Suivi administratif à relancer auprès d'Atrium et de Mme Cantet (Métropole du Grand Paris).",
    files: [],
    steps: [
      { text: "Identifier les pièces justificatives manquantes auprès d'Atrium", checked: false },
      { text: "Relancer Atrium pour transmission du dossier complet", checked: false },
      { text: "Relancer Mme Cantet — Métropole du Grand Paris", checked: false },
      { text: "Confirmer réception et délai de versement", checked: false },
    ],
  },
  {
    id: 2, title: "Appel d'offres gaz (échéance fin 2026)", owner: "Mathias Privat",
    comment: "Le contrat Total Énergie arrive à échéance fin 2026. Lancement de l'appel d'offres à initier dès juin 2026.",
    files: [],
    steps: [
      { text: "Récupérer les données de consommation 2025 auprès d'Atrium", checked: false },
      { text: "Solliciter des offres auprès de 3 fournisseurs minimum", checked: false },
      { text: "Présenter la comparaison au CS pour validation", checked: false },
      { text: "Notifier le choix retenu au syndic", checked: false },
    ],
  },
  {
    id: 3, title: "Recouvrement créance Mme Picovschi", owner: "Mathias Privat",
    comment: "Mme Picovschi a été condamnée par jugement à payer au syndicat : 3 092,81 € d'arriéré de charges, 177,36 € de frais de recouvrement, 300 € de dommages et intérêts, 2 400 € au titre de l'article 700. Le syndic a confirmé réception du règlement. Vérifier que le versement a bien été encaissé et que le compte est soldé.",
    files: [],
    steps: [
      { text: "Confirmer auprès d'Atrium que le paiement de Mme Picovschi a bien été encaissé", checked: false },
      { text: "Vérifier que le compte copropriétaire est soldé (charges + condamnations)", checked: false },
      { text: "S'assurer qu'aucune somme complémentaire n'est due", checked: false },
    ],
  },
  {
    id: 4, title: "Anomalies de facturation parking — Park'n Plus", owner: "Yves Ripert",
    comment: "Litiges sur la facturation des bornes de recharge électrique dans le parking. Montants et copropriétaires concernés à identifier.",
    files: [],
    steps: [
      { text: "Récupérer le détail des factures Park'n Plus auprès d'Atrium", checked: false },
      { text: "Identifier les anomalies et copropriétaires concernés", checked: false },
      { text: "Contester les montants erronés auprès de Park'n Plus", checked: false },
      { text: "Confirmer la régularisation", checked: false },
    ],
  },
];

// TAB 4 — Projets long terme
const INIT_LONGTERM = [
  {
    id: 1, title: "Remplacement des chaudières",
    members: [{ name: "Antoine Jean", lead: true }, { name: "Jean-Jacques Chevalier", lead: false }],
    comment: "Trois options à l'étude : (1) raccordement RCU/CPCU, (2) pompe à chaleur collective, (3) remplacement chaudières gaz. Études DELGY en cours. Coût annuel actuel gaz : ~26 838 € TTC ; simulation RCU : ~28 984 € TTC.",
    files: [],
  },
  {
    id: 2, title: "Mise à jour du règlement de copropriété",
    members: [{ name: "Philippe Monéger", lead: true }],
    comment: "Règlement actuel date de 1964. Mise en conformité nécessaire.",
    files: [],
  },
  {
    id: 3, title: "Équilibrage réseau chauffage + robinets thermostatiques",
    members: [{ name: "Yves Ripert", lead: true }],
    comment: "Obligation réglementaire avant fin 2027. Pose de robinets thermostatiques et tés de réglage sur l'ensemble du réseau.",
    files: [],
  },
  {
    id: 4, title: "Suivi comptabilité et réflexions financières",
    members: [{ name: "Yves Ripert", lead: true }],
    comment: "",
    files: [],
  },
];

// ── PPT DATA ───────────────────────────────────────────────────────────────────
const pptData = [
  {
    id: "ppt-1",
    title: "Réparation façade Sud (6ᵉ étage, maçonnerie + étanchéité)",
    nature: "Travaux nécessaires pour entretien immeuble",
    owner: "Denis Barbet-Massin",
    valeur: "Évite propagation d'infiltrations, supprime risque de sinistres lourds (5–15 k€/logement si réparation isolée)",
    beneficiaires: "Copropriétaires du 6ᵉ étage (exposés aux infiltrations) + copropriété entière (évite propagation)",
    status: "Fait - Déjà voté (2025–2026)",
  },
  {
    id: "ppt-2",
    title: "Remplacement / réparation des garde-corps non conformes du 6ᵉ étage",
    nature: "Travaux de sécurité",
    owner: "Denis Barbet-Massin",
    valeur: "Mise en conformité sécurité des personnes, évite responsabilité civile du syndicat",
    beneficiaires: "Copropriétaires du 6ᵉ étage (sécurité directe)",
    status: "En cours - Déjà voté (2025–2026)",
  },
  {
    id: "ppt-3",
    title: "Remplacement progressif des menuiseries privatives simple vitrage. Isolation des coffres de volets roulants.",
    nature: "Travaux de confort",
    owner: "Antoine Jean",
    valeur: "Gain énergétique (10–15%), amélioration acoustique, valorisation patrimoniale",
    beneficiaires: "Copropriétaires n'ayant pas encore remplacé leurs fenêtres",
    status: "Individuel",
  },
  {
    id: "ppt-4",
    title: "Mise à jour du règlement de copropriété",
    nature: "Travaux nécessaires pour entretien immeuble",
    owner: "Philippe Monéger",
    valeur: "Mise aux normes, et éviter conflits liés à vétusté du règlement.",
    beneficiaires: "Tous copropriétaires",
    status: "Projets en réflexion (2026-2027)",
  },
  {
    id: "ppt-5",
    title: "Remplacement des chaudières collectives (gaz, installées en 2007)",
    nature: "Travaux nécessaires pour entretien immeuble",
    owner: "Antoine Jean",
    valeur: "Sécurise le chauffage collectif, évite pannes coûteuses, baisse consommation si matériel performant ; prépare transition énergétique (PAC ou CPCU)",
    beneficiaires: "Tous copropriétaires (charges collectives et confort chauffage/eau chaude)",
    status: "Projets en réflexion (2026-2027)",
  },
  {
    id: "ppt-6",
    title: "Équilibrage du réseau chauffage + robinets thermostatiques et tés de réglage (obligatoire avant 2027)",
    nature: "Travaux nécessaires pour entretien immeuble",
    owner: "Yves Ripert",
    valeur: "Régulation fine, baisse charges collectives, conformité légale",
    beneficiaires: "Tous copropriétaires (charges collectives, confort chauffage)",
    status: "Projets en réflexion (2026-2027)",
  },
  {
    id: "ppt-7",
    title: "Diagnostic / traitement (rouille, désembouage) des colonnes d'eau (eau froide + évacuation eaux de pluie)",
    nature: "Travaux nécessaires pour entretien immeuble",
    owner: "Jean-Jacques Chevalier",
    valeur: "",
    beneficiaires: "Tous copropriétaires",
    status: "Moyen terme (2027–2029)",
  },
  {
    id: "ppt-8",
    title: "Ascenseur : mise aux normes télécoms (2G → 4G)",
    nature: "Travaux de sécurité",
    owner: "Jean-Baptiste Petteni",
    valeur: "Garantit fonctionnement de l'appel d'urgence, évite immobilisation obligatoire de l'ascenseur",
    beneficiaires: "Tous les copropriétaires, surtout personnes âgées ou dépendantes (sécurité usage)",
    status: "Moyen terme (2027–2029)",
  },
  {
    id: "ppt-9",
    title: "Rafraîchissement parties communes : hall, cages d'escalier, luminaires",
    nature: "Travaux de confort",
    owner: "Mathias Privat",
    valeur: "Valorisation immédiate du patrimoine, confort quotidien des résidents",
    beneficiaires: "Tous les copropriétaires et occupants (valeur revente + confort usage)",
    status: "Moyen terme (2027–2029)",
  },
  {
    id: "ppt-10",
    title: "Installation d'une VMC hygro B basse pression",
    nature: "Travaux nécessaires pour entretien immeuble",
    owner: "Antoine Jean",
    valeur: "Améliore qualité d'air, évite pathologies (moisissures), mise en conformité future",
    beneficiaires: "Tous copropriétaires (qualité d'air dans logements)",
    status: "Moyen terme (2027–2029)",
  },
  {
    id: "ppt-11",
    title: "Désembouage et calorifugeage des réseaux chauffage + ECS",
    nature: "Travaux nécessaires pour entretien immeuble",
    owner: "Yves Ripert",
    valeur: "Améliore rendement, évite dégradations prématurées, économies maintenance",
    beneficiaires: "Tous copropriétaires (meilleure longévité réseau collectif)",
    status: "Moyen terme (2027–2029)",
  },
  {
    id: "ppt-12",
    title: "Ravalement façade Nord",
    nature: "Travaux nécessaires pour entretien immeuble",
    owner: "Jean-Baptiste Petteni",
    valeur: "Préserve l'enveloppe extérieure, améliore isolation, améliore image de l'immeuble côté rue, homogénéité esthétique avec la façade Sud",
    beneficiaires: "Copropriétaires façade Nord (tous étages)",
    status: "Long terme (2030–2033)",
  },
  {
    id: "ppt-13",
    title: "Étanchéité et isolation des balcons et loggias (SEL, descentes EP) — à mener en même temps que le ravalement façade Nord",
    nature: "Travaux nécessaires pour entretien immeuble",
    owner: "Jean-Baptiste Petteni",
    valeur: "Évite infiltrations dans logements, supprime réparations récurrentes coûteuses",
    beneficiaires: "Copropriétaires avec balcons/loggias (façades Nord & Sud)",
    status: "Long terme (2030–2033)",
  },
  {
    id: "ppt-14",
    title: "Ravalement façade Sud",
    nature: "Travaux nécessaires pour entretien immeuble",
    owner: "Jean-Baptiste Petteni",
    valeur: "Préserve l'enveloppe, uniformise les réparations déjà votées, évite dégradation du crépi et corrosion des structures métalliques",
    beneficiaires: "Copropriétaires façade Sud (tous étages)",
    status: "Long terme (2030–2033)",
  },
  {
    id: "ppt-15",
    title: "Audit et peinture des garde-corps façade Sud — à mener en même temps que le ravalement façade Sud",
    nature: "Travaux nécessaires pour entretien immeuble",
    owner: "Jean-Baptiste Petteni",
    valeur: "Préserve garde-corps, évite corrosion/remplacement anticipé, maintient l'esthétique et valorise les biens",
    beneficiaires: "Copropriétaires exposés façade Sud (tous étages)",
    status: "Long terme (2030–2033)",
  },
  {
    id: "ppt-16",
    title: "Réfection, étanchéité et isolation du toit-terrasse (étanchéité, lanterneaux, acrotères)",
    nature: "Travaux nécessaires pour entretien immeuble",
    owner: "Denis Barbet-Massin",
    valeur: "Supprime risque d'infiltrations lourdes (5–15 k€/logement), améliore confort thermique, baisse charges chauffage",
    beneficiaires: "Copropriétaires derniers étages (6ᵉ) + copropriété entière (charges chauffage)",
    status: "Très long terme (après 2033)",
  },
  {
    id: "ppt-17",
    title: "Isolation et étanchéité des terrasses inaccessibles et attiques",
    nature: "Travaux nécessaires pour entretien immeuble",
    owner: "Denis Barbet-Massin",
    valeur: "Prévention infiltrations coûteuses, amélioration confort d'été",
    beneficiaires: "Copropriétaires des attiques (5e et 6e étage) + copropriété entière (charges chauffage)",
    status: "Très long terme (après 2033)",
  },
  {
    id: "ppt-18",
    title: "Modification de l'entrée du parking (rabotage / adaptation trottoir)",
    nature: "Travaux de confort",
    owner: "Mathias Privat",
    valeur: "Évite dommages aux véhicules, valorise les lots de parking en revente/location",
    beneficiaires: "Copropriétaires possédant un lot de parking",
    status: "Très long terme (après 2033)",
  },
  {
    id: "ppt-19",
    title: "Isolation thermique par l'extérieur (ITE) des façades Nord, Est, Ouest",
    nature: "Travaux nécessaires pour entretien immeuble",
    owner: "",
    valeur: "Réduction charges (-35 à -50%), accès subventions, évite ravalements isolés plus coûteux",
    beneficiaires: "Tous copropriétaires (charges collectives), + valorisation façade pour riverains côté rue/jardin",
    status: "A sortir du PPT",
  },
  {
    id: "ppt-20",
    title: "Isolation des planchers bas (caves, locaux techniques, parking RDC)",
    nature: "Travaux nécessaires pour entretien immeuble",
    owner: "",
    valeur: "Améliore confort rez-de-chaussée, supprime zones froides, évite condensation/mérule",
    beneficiaires: "Copropriétaires RDC, voire usagers caves/parking",
    status: "A sortir du PPT",
  },
  {
    id: "ppt-21",
    title: "Végétalisation partielle toiture / îlot de fraîcheur (écarté par Reanova)",
    nature: "Travaux nécessaires pour entretien immeuble",
    owner: "",
    valeur: "Améliore confort d'été, potentiel bonus subventions locales",
    beneficiaires: "Copropriétaires derniers étages + copropriété (valorisation image)",
    status: "A sortir du PPT",
  },
];

// ── PPT nature tag colors ──────────────────────────────────────────────────────
const NATURE_COLORS = {
  "Travaux de sécurité":                    { bg: "#fdecea", text: "#c0392b", border: "#e57373" },
  "Travaux de confort":                     { bg: "#e8f5e9", text: "#2e7d32", border: "#81c784" },
  "Travaux nécessaires pour entretien immeuble": { bg: "#e3f2fd", text: "#1565c0", border: "#64b5f6" },
};

// ── PptCard ────────────────────────────────────────────────────────────────────
function PptCard({ item, accentColor, state, setState }) {
  const s = state[item.id] || { owner: item.owner, valeur: item.valeur, beneficiaires: item.beneficiaires };
  const update = (patch) => {
    const next = { ...state, [item.id]: { ...s, ...patch } };
    setState(next);
    try { localStorage.setItem("ppt-state", JSON.stringify(next)); } catch {}
  };
  const nc = NATURE_COLORS[item.nature] || { bg: C.lightStone, text: C.steel, border: "#ccc" };

  return (
    <div style={{
      background: "white", borderRadius: 8, marginBottom: 12,
      border: `1px solid ${accentColor}30`,
      borderLeft: `4px solid ${accentColor}`,
      boxShadow: "0 1px 6px rgba(44,62,80,0.06)",
      padding: "14px 18px",
    }}>
      {/* Title + nature tag */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
        <span style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 14, fontWeight: 700, color: C.slate, flex: 1, lineHeight: 1.4 }}>
          {item.title}
        </span>
        <span style={{
          fontSize: 10, fontWeight: 700, fontFamily: "Inter, system-ui, sans-serif",
          textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap",
          background: nc.bg, color: nc.text,
          border: `1px solid ${nc.border}`,
          borderRadius: 4, padding: "2px 8px", flexShrink: 0,
        }}>{item.nature}</span>
      </div>

      {/* Fields grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        {/* Responsable */}
        <div>
          <label style={labelStyle}>👤 Responsable</label>
          <select
            value={s.owner}
            onChange={e => update({ owner: e.target.value })}
            style={{ ...inputStyle, fontSize: 12, padding: "6px 10px", cursor: "pointer", appearance: "auto" }}
          >
            <option value="">— Non assigné —</option>
            {MEMBERS.map((m, i) => <option key={i} value={m.name}>{m.name}</option>)}
            <option value="N/A">N/A</option>
          </select>
        </div>

        {/* Valeur */}
        <div>
          <label style={labelStyle}>💎 Valeur pour la copropriété</label>
          <textarea
            value={s.valeur}
            onChange={e => update({ valeur: e.target.value })}
            rows={3}
            style={{ ...inputStyle, fontSize: 12, resize: "vertical", padding: "6px 10px" }}
            placeholder="Valeur apportée…"
          />
        </div>

        {/* Bénéficiaires */}
        <div>
          <label style={labelStyle}>👥 Bénéficiaires</label>
          <textarea
            value={s.beneficiaires}
            onChange={e => update({ beneficiaires: e.target.value })}
            rows={3}
            style={{ ...inputStyle, fontSize: 12, resize: "vertical", padding: "6px 10px" }}
            placeholder="Copropriétaires concernés…"
          />
        </div>
      </div>
    </div>
  );
}

// ── PptSection ─────────────────────────────────────────────────────────────────
function PptSection({ title, icon, color, items, state, setState }) {
  const [open, setOpen] = useState(true);
  if (items.length === 0) return null;
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
          padding: "10px 14px", borderRadius: 8,
          background: color + "18",
          border: `1px solid ${color}40`,
          marginBottom: open ? 10 : 0,
          userSelect: "none",
        }}
      >
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 15, fontWeight: 700, color: C.slate, flex: 1 }}>{title}</span>
        <span style={{
          background: color, color: "white", borderRadius: 12,
          padding: "1px 9px", fontSize: 11, fontWeight: 700,
          fontFamily: "Inter, system-ui, sans-serif",
        }}>{items.length}</span>
        <span style={{ color: C.steel, fontSize: 12 }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && items.map(item => (
        <PptCard key={item.id} item={item} accentColor={color} state={state} setState={setState} />
      ))}
    </div>
  );
}

const TABS = [
  { id: "accueil",       icon: "🏛",  label: "Accueil",            color: C.copper },
  { id: "interventions", icon: "🔧",  label: "Interventions",      color: "#c0392b" },
  { id: "court-terme",   icon: "⚡",  label: "Actions court terme",color: "#e07b39" },
  { id: "longterm",      icon: "🏗",  label: "Projets long terme", color: C.slate },
  { id: "ppt",           icon: "📋",  label: "Plan pluriannuel",   color: C.steel },
];

// ── APP ────────────────────────────────────────────────────────────────────────
export default function Portal() {
  const [tab, setTab] = useState("accueil");

  // ── Persisted list states (onglets 2 & 3) ────────────────────────────────────
  const [sinistres,      setSinistresRaw]      = useState(() => lsGetRaw("cs-sinistres",   INIT_SINISTRES));
  const [agVoted,        setAgVotedRaw]        = useState(() => lsGetRaw("cs-ag-voted",    INIT_AG_VOTED));
  const [partiesCommunes,setPartiesCommunesRaw]= useState(() => lsGetRaw("cs-parties",     INIT_PARTIES_COMMUNES));
  const [csPreroga,      setCsPrerogaRaw]      = useState(() => lsGetRaw("cs-preroga",     INIT_CS_PREROGA));
  const [travIndiv,      setTravIndivRaw]      = useState(() => lsGetRaw("cs-travindiv",   INIT_TRAV_INDIV));
  const [urgentActions,  setUrgentActionsRaw]  = useState(() => lsGetRaw("cs-urgent",      INIT_URGENT_ACTIONS));

  const makeSetter = (key, raw) => (val) => {
    const next = typeof val === "function" ? val(raw) : val;
    lsSetRaw(key, next);
    raw(next);
  };
  const setSinistres       = makeSetter("cs-sinistres",  setSinistresRaw);
  const setAgVoted         = makeSetter("cs-ag-voted",   setAgVotedRaw);
  const setPartiesCommunes = makeSetter("cs-parties",    setPartiesCommunesRaw);
  const setCsPreroga       = makeSetter("cs-preroga",    setCsPrerogaRaw);
  const setTravIndiv       = makeSetter("cs-travindiv",  setTravIndivRaw);
  const setUrgentActions   = makeSetter("cs-urgent",     setUrgentActionsRaw);
  const [longterm, setLongterm] = useState(INIT_LONGTERM);

  // PPT state — keyed by item id, persists to localStorage
  const [pptState, setPptStateRaw] = useState(() => {
    try {
      const saved = localStorage.getItem("ppt-state");
      if (saved) return JSON.parse(saved);
    } catch {}
    // Build default state from pptData
    return Object.fromEntries(pptData.map(p => [p.id, { owner: p.owner, valeur: p.valeur, beneficiaires: p.beneficiaires }]));
  });
  const setPptState = (next) => {
    setPptStateRaw(next);
    try { localStorage.setItem("ppt-state", JSON.stringify(next)); } catch {}
  };
  const [agenda, setAgenda] = useState({
    date: "Octobre–Novembre 2026 (date à fixer)",
    lieu: "Locaux Atrium Gestion — 55 rue Fondary, 75015 Paris (+ Zoom)",
    points: "1. Point d'avancement sur le remplacement des chaudières\n2. Point sur la subvention Reanova\n3. Équilibrage du réseau de chauffage\n4. Questions diverses",
  });

  // ── Persistence helpers ───────────────────────────────────────────────────────
  const lsGet = (key) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; } };
  const lsSet = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

  // Restore full longterm project state from localStorage on mount
  useEffect(() => {
    const restored = INIT_LONGTERM.map(p => {
      const saved = lsGet(`lt-project-${p.id}`);
      // Merge: saved data wins, but fall back to INIT for any missing fields
      return saved ? { ...p, ...saved } : p;
    });
    setLongterm(restored);
  }, []); // eslint-disable-line

  // Updater for longterm — persists every change immediately (update or add)
  const updateLongterm = (updated) => {
    lsSet(`lt-project-${updated.id}`, updated);
    setLongterm(prev => {
      const exists = prev.some(p => p.id === updated.id);
      return exists ? prev.map(p => p.id === updated.id ? updated : p) : [...prev, updated];
    });
  };

  const mkUpdater = (list, setList) => (updated) =>
    setList(list.map(x => x.id === updated.id ? updated : x));

  return (
    <div style={{ minHeight: "100vh", position: "relative", fontFamily: "Inter, system-ui, sans-serif" }}>
      <FacadeBackground />

      {/* Header */}
      <div style={{ position: "relative", zIndex: 2, background: C.darkSlate, padding: "18px 24px 0", borderBottom: `3px solid ${C.copper}` }}>
        <div style={{ maxWidth: 920, margin: "0 auto" }}>
          <div style={{ textAlign: "center", paddingBottom: 14 }}>
            <div style={{ fontSize: 10, color: C.copper, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 4 }}>
              Copropriété · 94-96 rue de Javel · Paris 15e
            </div>
            <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 22, fontWeight: 700, color: C.stone, margin: 0 }}>
              Portail du Conseil Syndical
            </h1>
            <div style={{ fontSize: 11, color: C.steel, marginTop: 3 }}>Mandat 2026–2027 · Usage interne CS</div>
          </div>
          <div style={{ display: "flex", gap: 2 }}>
            {TABS.map(t => <TabBtn key={t.id} {...t} active={tab === t.id} onClick={() => setTab(t.id)} />)}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <Balustrade />
        <div style={{ maxWidth: 920, margin: "0 auto", background: "rgba(250,250,248,0.97)", minHeight: "calc(100vh - 160px)", padding: "28px 32px 48px" }}>

          {/* ── TAB 1 : Accueil ── */}
          {tab === "accueil" && (
            <div>
              <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 20, color: C.slate, marginTop: 0, borderBottom: `2px solid ${C.copper}`, paddingBottom: 6 }}>
                Bienvenue sur le portail du Conseil Syndical
              </h2>
              <p style={{ fontSize: 14, color: C.slate, lineHeight: 1.7, marginBottom: 24 }}>
                Ce portail est l'espace de travail partagé du Conseil Syndical de la copropriété du{" "}
                <strong>94-96 rue de Javel, 75015 Paris</strong>. Il centralise le suivi des interventions,
                des travaux votés, et des projets à long terme. Le Conseil Syndical est composé de sept membres
                élus pour la période <strong>2026–2027</strong>.
              </p>

              <h3 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 16, color: C.slate, marginBottom: 14 }}>Membres du Conseil Syndical</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 12, marginBottom: 32 }}>
                {MEMBERS.map((m, i) => <MemberCard key={i} {...m} />)}
              </div>

              <h3 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 16, color: C.slate, marginBottom: 14, borderTop: `1px solid ${C.lightStone}`, paddingTop: 20 }}>
                🗓 Prochaine réunion du CS
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Date</label>
                  <input value={agenda.date} onChange={e => setAgenda({ ...agenda, date: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Lieu</label>
                  <input value={agenda.lieu} onChange={e => setAgenda({ ...agenda, lieu: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div style={{ marginBottom: 32 }}>
                <label style={labelStyle}>Ordre du jour</label>
                <textarea value={agenda.points} onChange={e => setAgenda({ ...agenda, points: e.target.value })}
                  rows={5} style={{ ...inputStyle, resize: "vertical" }} />
              </div>

              <h3 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 16, color: C.slate, marginBottom: 12, borderTop: `1px solid ${C.lightStone}`, paddingTop: 20 }}>
                🔗 Liens utiles
              </h3>
              <LinksManager />
            </div>
          )}

          {/* ── TAB 2 : Interventions ── */}
          {tab === "interventions" && (
            <div>
              <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 20, color: C.slate, marginTop: 0, borderBottom: `2px solid #c0392b`, paddingBottom: 6, marginBottom: 24 }}>
                🔧 Interventions & suivi courant
              </h2>

              <SectionBlock title="Sinistres" icon="🚨" color="#c0392b">
                {sinistres.map(p => (
                  <ProjectCard key={p.id} project={p} onChange={mkUpdater(sinistres, setSinistres)}
                    accentColor="#c0392b" statusLabel="Sinistre ouvert" />
                ))}
                <InlineAdder color="#c0392b" buttonLabel="+ Déclarer un sinistre"
                  fields={[{ key: "title", label: "Titre du sinistre", placeholder: "ex : Dégât des eaux — appartement X" }]}
                  onAdd={v => setSinistres([...sinistres, { id: Date.now(), title: v.title, owner: "", comment: "", files: [], steps: [] }])}
                />
              </SectionBlock>

              <SectionBlock title="Travaux votés en AG — suivi chantier" icon="🗳" color="#5d8a3c">
                <p style={{ fontSize: 12, color: C.steel, marginTop: -6, marginBottom: 12 }}>
                  Travaux approuvés par l'Assemblée Générale, en cours d'exécution.
                </p>
                {agVoted.map(p => (
                  <ProjectCard key={p.id} project={p} onChange={mkUpdater(agVoted, setAgVoted)}
                    accentColor="#5d8a3c" statusLabel="En cours" showBudget showResolution />
                ))}
                <InlineAdder color="#5d8a3c" buttonLabel="+ Ajouter un chantier voté"
                  fields={[
                    { key: "title",      label: "Titre du chantier",   placeholder: "ex : Ravalement façade Nord" },
                    { key: "resolution", label: "Résolution AG",        placeholder: "ex : Résolution 5 — AGO mai 2026" },
                    { key: "budget",     label: "Budget voté (TTC)",    placeholder: "ex : 25 000 €" },
                  ]}
                  onAdd={v => setAgVoted([...agVoted, { id: Date.now(), title: v.title, owner: "", budget: v.budget || "", resolution: v.resolution || "", comment: "", files: [], steps: [] }])}
                />
              </SectionBlock>

              <SectionBlock title="Problèmes dans les parties communes" icon="🏢" color="#7b5ea7">
                <p style={{ fontSize: 12, color: C.steel, marginTop: -6, marginBottom: 12 }}>
                  Dysfonctionnements ou dégradations affectant les parties communes, hors sinistres assurance.
                </p>
                {partiesCommunes.map(p => (
                  <ProjectCard key={p.id} project={p} onChange={mkUpdater(partiesCommunes, setPartiesCommunes)}
                    accentColor="#7b5ea7" statusLabel="En cours" />
                ))}
                <InlineAdder color="#7b5ea7" buttonLabel="+ Signaler un problème"
                  fields={[{ key: "title", label: "Description du problème", placeholder: "ex : Éclairage défaillant cage B" }]}
                  onAdd={v => setPartiesCommunes([...partiesCommunes, { id: Date.now(), title: v.title, owner: "", comment: "", files: [], steps: [] }])}
                />
              </SectionBlock>

              <SectionBlock title="Prérogatives du CS — sans vote AG" icon="🔑" color={C.copper}>
                <p style={{ fontSize: 12, color: C.steel, marginTop: -6, marginBottom: 12 }}>
                  Actions relevant de la délégation de pouvoir accordée au CS (≤ 5 000 € TTC par opération).
                </p>
                {csPreroga.map(p => (
                  <ProjectCard key={p.id} project={p} onChange={mkUpdater(csPreroga, setCsPreroga)}
                    accentColor={C.copper} statusLabel="En cours" />
                ))}
                <InlineAdder color={C.copper} buttonLabel="+ Ajouter une action CS"
                  fields={[{ key: "title", label: "Titre de l'action", placeholder: "ex : Remplacement serrure local poubelles" }]}
                  onAdd={v => setCsPreroga([...csPreroga, { id: Date.now(), title: v.title, owner: "", comment: "", files: [], steps: [] }])}
                />
              </SectionBlock>

              <SectionBlock title="Travaux individuels nécessitant un vote en AG" icon="🗺" color={C.steel}>
                <p style={{ fontSize: 12, color: C.steel, marginTop: -6, marginBottom: 12 }}>
                  Demandes de copropriétaires pour des travaux privatifs affectant les parties communes ou la structure du bâtiment — à soumettre à l'AG.
                </p>
                {travIndiv.length === 0 && (
                  <div style={{ background: C.lightStone, borderRadius: 6, padding: "12px 16px", fontSize: 13, color: C.steel, fontStyle: "italic", marginBottom: 10 }}>
                    Aucune demande en cours.
                  </div>
                )}
                {travIndiv.map(p => (
                  <ProjectCard key={p.id} project={p} onChange={mkUpdater(travIndiv, setTravIndiv)}
                    accentColor={C.steel} statusLabel="À soumettre en AG" />
                ))}
                <InlineAdder color={C.steel} buttonLabel="+ Ajouter une demande"
                  fields={[
                    { key: "title",   label: "Titre de la demande",        placeholder: "ex : Création d'une porte palière — appartement 12" },
                    { key: "comment", label: "Description (optionnel)",     placeholder: "Contexte, copropriétaire concerné…", multiline: true },
                  ]}
                  onAdd={v => setTravIndiv([...travIndiv, { id: Date.now(), title: v.title, owner: "", comment: v.comment || "", files: [], steps: [] }])}
                />
              </SectionBlock>
            </div>
          )}

          {/* ── TAB 3 : Actions court terme ── */}
          {tab === "court-terme" && (
            <div>
              <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 20, color: C.slate, marginTop: 0, borderBottom: `2px solid #e07b39`, paddingBottom: 6, marginBottom: 24 }}>
                ⚡ Actions court terme
              </h2>

              <SectionBlock title="Actions urgentes" icon="🎯" color="#e07b39">
                <p style={{ fontSize: 12, color: C.steel, marginTop: -6, marginBottom: 12 }}>
                  Sujets à traiter en priorité dans les semaines à venir, hors chantiers et sinistres.
                </p>
                {urgentActions.map(p => (
                  <ProjectCard key={p.id} project={p} onChange={mkUpdater(urgentActions, setUrgentActions)}
                    accentColor="#e07b39" statusLabel="Urgent" />
                ))}
                <InlineAdder color="#e07b39" buttonLabel="+ Ajouter une action urgente"
                  fields={[
                    { key: "title",   label: "Titre de l'action",      placeholder: "ex : Relancer Atrium sur…" },
                    { key: "comment", label: "Contexte (optionnel)",    placeholder: "Détails, enjeux…", multiline: true },
                  ]}
                  onAdd={v => setUrgentActions([...urgentActions, { id: Date.now(), title: v.title, owner: "", comment: v.comment || "", files: [], steps: [] }])}
                />
              </SectionBlock>
            </div>
          )}

          {/* ── TAB 4 : Projets long terme ── */}
          {tab === "longterm" && (
            <div>
              <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 20, color: C.slate, marginTop: 0, borderBottom: `2px solid ${C.slate}`, paddingBottom: 6, marginBottom: 24 }}>
                🏗 Projets à moyen et long terme
              </h2>
              <p style={{ fontSize: 13, color: C.steel, marginBottom: 20 }}>
                Projets structurants avec groupe de travail nominé. Le responsable principal est indiqué par ★.
              </p>
              {longterm.map(p => (
                <LongTermCard key={p.id} project={p} onChange={updateLongterm} />
              ))}
              <InlineAdder color={C.slate} buttonLabel="+ Ajouter un projet"
                fields={[{ key: "title", label: "Titre du projet", placeholder: "ex : Réfection de l'ascenseur" }]}
                onAdd={v => {
                  const np = { id: Date.now(), title: v.title, members: [], comment: "", files: [] };
                  updateLongterm(np);
                }}
              />
            </div>
          )}

          {/* ── TAB 5 : Plan pluriannuel ── */}
          {tab === "ppt" && (
            <div>
              <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 20, color: C.slate, marginTop: 0, borderBottom: `2px solid ${C.steel}`, paddingBottom: 6, marginBottom: 6 }}>
                📋 Plan pluriannuel de travaux
              </h2>
              <p style={{ fontSize: 13, color: C.steel, marginBottom: 28, lineHeight: 1.6 }}>
                Élaboré à partir du dossier de restitution Reanova. Chaque section correspond à un horizon de priorisation.
                Les responsables et champs texte sont modifiables.
              </p>
              <PptSection
                title="Fait — déjà voté (2025–2026)"
                color="#4caf50"
                icon="✅"
                items={pptData.filter(p => p.status === "Fait - Déjà voté (2025–2026)")}
                state={pptState} setState={setPptState}
              />
              <PptSection
                title="En cours — déjà voté (2025–2026)"
                color="#8bc34a"
                icon="🔨"
                items={pptData.filter(p => p.status === "En cours - Déjà voté (2025–2026)")}
                state={pptState} setState={setPptState}
              />
              <PptSection
                title="Individuel"
                color={C.copper}
                icon="🏠"
                items={pptData.filter(p => p.status === "Individuel")}
                state={pptState} setState={setPptState}
              />
              <PptSection
                title="Projets en réflexion (2026–2027)"
                color="#e07b39"
                icon="💡"
                items={pptData.filter(p => p.status === "Projets en réflexion (2026-2027)")}
                state={pptState} setState={setPptState}
              />
              <PptSection
                title="Moyen terme (2027–2029)"
                color={C.slate}
                icon="🔭"
                items={pptData.filter(p => p.status === "Moyen terme (2027–2029)")}
                state={pptState} setState={setPptState}
              />
              <PptSection
                title="Long terme (2030–2033)"
                color="#5c6bc0"
                icon="🏗"
                items={pptData.filter(p => p.status === "Long terme (2030–2033)")}
                state={pptState} setState={setPptState}
              />
              <PptSection
                title="Très long terme (après 2033)"
                color="#7b5ea7"
                icon="🔮"
                items={pptData.filter(p => p.status === "Très long terme (après 2033)")}
                state={pptState} setState={setPptState}
              />
              <PptSection
                title="À sortir du PPT"
                color={C.steel}
                icon="🗂"
                items={pptData.filter(p => p.status === "A sortir du PPT")}
                state={pptState} setState={setPptState}
              />
            </div>
          )}

        </div>
        <Balustrade />
        <div style={{ background: C.darkSlate, padding: "14px 24px", textAlign: "center", fontSize: 11, color: C.steel, fontFamily: "Inter, system-ui, sans-serif" }}>
          Conseil Syndical 2026–2027 · 94 rue de Javel, 75015 Paris · Syndic : Atrium Gestion Paris 15
        </div>
      </div>
    </div>
  );
}

// ── Password (change this to your chosen password) ────────────────────────────
const PORTAL_PASSWORD = "Javel";
const SESSION_KEY = "cs-javel-auth";

// ── Login screen ──────────────────────────────────────────────────────────────
function LoginScreen({ onSuccess }) {
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef();

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = () => {
    if (pwd === PORTAL_PASSWORD) {
      try { sessionStorage.setItem(SESSION_KEY, "1"); } catch {}
      onSuccess();
    } else {
      setError(true);
      setShake(true);
      setPwd("");
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(180deg,#1a2a3a 0%,#2C3E50 60%,#3d5166 100%)",
      fontFamily: "Inter, system-ui, sans-serif",
    }}>
      {/* Subtle window grid in background */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {Array.from({ length: 48 }).map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            left: `${8 + (i % 6) * 15.5}%`,
            top: `${5 + Math.floor(i / 6) * 11}%`,
            width: "8%", height: "7%",
            background: i % 3 === 0 ? "rgba(255,220,120,0.1)" : "rgba(20,40,60,0.5)",
            border: "1px solid rgba(184,115,51,0.15)", borderRadius: 1,
          }} />
        ))}
      </div>

      <div style={{
        position: "relative", zIndex: 1,
        background: "rgba(250,250,248,0.97)",
        borderRadius: 12, padding: "40px 44px",
        width: "100%", maxWidth: 400,
        boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
        animation: shake ? "shake 0.4s ease" : "none",
      }}>
        <style>{`
          @keyframes shake {
            0%,100% { transform: translateX(0); }
            20% { transform: translateX(-10px); }
            40% { transform: translateX(10px); }
            60% { transform: translateX(-8px); }
            80% { transform: translateX(8px); }
          }
        `}</style>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: "#B87333", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 8 }}>
            Copropriété · 94-96 rue de Javel · Paris 15e
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, color: "#2C3E50", margin: 0 }}>
            Portail du Conseil Syndical
          </h1>
          <div style={{ fontSize: 12, color: "#7F8C8D", marginTop: 6 }}>
            Accès réservé aux membres du CS
          </div>
        </div>

        {/* Lock icon */}
        <div style={{ textAlign: "center", fontSize: 36, marginBottom: 24 }}>🔒</div>

        {/* Password field */}
        <div style={{ marginBottom: 16 }}>
          <label style={{
            display: "block", fontSize: 11, fontWeight: 700, color: "#7F8C8D",
            textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6,
          }}>Mot de passe</label>
          <input
            ref={inputRef}
            type="password"
            value={pwd}
            onChange={e => { setPwd(e.target.value); setError(false); }}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            placeholder="••••••••••"
            style={{
              width: "100%", boxSizing: "border-box",
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: 16, color: "#2C3E50",
              border: `1.5px solid ${error ? "#e53935" : "#E8E0D4"}`,
              borderRadius: 6, padding: "10px 14px",
              background: "white", outline: "none",
              transition: "border-color 0.2s",
            }}
          />
          {error && (
            <div style={{ fontSize: 12, color: "#e53935", marginTop: 6, fontWeight: 600 }}>
              Mot de passe incorrect. Réessayez.
            </div>
          )}
        </div>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          style={{
            width: "100%", background: "#2C3E50", color: "white",
            border: "none", borderRadius: 6, padding: "12px",
            fontSize: 14, fontWeight: 700, cursor: "pointer",
            fontFamily: "Inter, system-ui, sans-serif",
            letterSpacing: "0.04em",
            transition: "background 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#1a252f"}
          onMouseLeave={e => e.currentTarget.style.background = "#2C3E50"}
        >
          Accéder au portail →
        </button>

        <div style={{ textAlign: "center", fontSize: 11, color: "#7F8C8D", marginTop: 16 }}>
          Contactez le président du CS si vous n'avez pas le mot de passe.
        </div>
      </div>
    </div>
  );
}

// ── Root App with auth gate ───────────────────────────────────────────────────
export default function App() {
  const [authed, setAuthed] = useState(() => {
    try { return sessionStorage.getItem(SESSION_KEY) === "1"; } catch { return false; }
  });

  if (!authed) return <LoginScreen onSuccess={() => setAuthed(true)} />;
  return <Portal />;
}
