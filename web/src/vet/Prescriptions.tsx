import { useMemo, useState } from "react";
import { Button, EmptyState, Icon, PageHeader, Tabs, go } from "../shared";
import { getPatient, patients, type Rx } from "./data";
import { ConsultStatus, PetPhoto, useVet } from "./vetkit";

export function PrescriptionsPage() {
  const { rx } = useVet();
  const [tab, setTab] = useState("Todas");
  const shown = rx.filter((r) => tab === "Todas" || (tab === "Emitidas" ? r.status === "Emitida" : tab === "Borradores" ? r.status === "Borrador" : r.status === "Finalizada"));
  return <>
    <PageHeader eyebrow="Indicaciones médicas" title="Recetas" description="Recetas emitidas y borradores en preparación." action={<Button icon="plus" onClick={() => go("/vet/prescriptions/new")}>Nueva receta</Button>}/>
    <Tabs tabs={["Todas", "Emitidas", "Borradores", "Finalizadas"]} active={tab} onChange={setTab}/>
    {shown.length === 0 ? <div className="panel"><EmptyState icon="file" title="No hay recetas para mostrar." text="Las recetas que emitas o guardes como borrador aparecerán acá."/></div> :
      <div className="v-rows" role="list">{shown.map((r) => { const p = getPatient(r.petId); return <article role="listitem" className="v-row v-row--rx" key={r.id}>
        <div className="v-row__time"><b>{r.id.slice(-4)}</b><span>{r.date}</span></div>
        <PetPhoto pet={p} size={44}/>
        <div className="v-row__main"><h3>{r.med} <small>{p.name}</small></h3><p>{r.dose} · {r.freq} · {r.duration}</p><small>Tutor: {p.tutor} · {r.id}</small></div>
        <span className="v-row__meta"/>
        <ConsultStatus status={r.status}/>
        <Button variant="secondary" onClick={() => go(r.status === "Borrador" ? `/vet/prescriptions/new?draft=${r.id}` : `/vet/prescriptions/${r.id}`)}>{r.status === "Borrador" ? "Continuar borrador" : "Ver receta"}</Button>
      </article>; })}</div>}
  </>;
}

type Form = { pet: string; med: string; dose: string; freq: string; duration: string; notes: string };
const required: (keyof Form)[] = ["pet", "med", "dose", "freq", "duration"];
const labels: Record<keyof Form, string> = { pet: "Paciente", med: "Medicamento", dose: "Dosis", freq: "Frecuencia", duration: "Duración", notes: "Indicaciones" };

export function NewPrescription() {
  const { rx, setRx, notify } = useVet();
  const params = new URLSearchParams(window.location.search);
  const draft = rx.find((r) => r.id === params.get("draft"));
  const [f, setF] = useState<Form>(draft ? { pet: draft.petId, med: draft.med, dose: draft.dose, freq: draft.freq, duration: draft.duration, notes: draft.notes } : { pet: params.get("pet") ?? "", med: "", dose: "", freq: "", duration: "", notes: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [confirm, setConfirm] = useState(false);
  const set = (k: keyof Form, v: string) => { setF({ ...f, [k]: v }); if (errors[k]) setErrors({ ...errors, [k]: undefined }); };
  const validate = (keys: (keyof Form)[]) => { const e: typeof errors = {}; keys.forEach((k) => { if (!f[k].trim()) e[k] = `Completá ${labels[k].toLowerCase()}.`; }); setErrors(e); return Object.keys(e).length === 0; };
  const save = (status: Rx["status"]) => {
    const id = draft?.id ?? `RX-2025-${String(430 + rx.length).padStart(4, "0")}`;
    const entry: Rx = { id, petId: f.pet, med: f.med, dose: f.dose, freq: f.freq, duration: f.duration, notes: f.notes, status, date: "Hoy" };
    setRx((l) => draft ? l.map((r) => r.id === id ? entry : r) : [entry, ...l]);
    return id;
  };
  const p = f.pet ? getPatient(f.pet) : null;
  return <>
    <button className="back-link" onClick={() => go("/vet/prescriptions")}><Icon name="arrow" size={17}/> Volver a recetas</button>
    <PageHeader eyebrow="Indicación médica" title="Nueva receta" description="Completá los datos. Vas a poder revisarlos antes de emitir."/>
    <form className="panel v-form" noValidate onSubmit={(e) => { e.preventDefault(); if (validate(required)) setConfirm(true); }}>
      <div className="v-form__grid">
        <label className={`v-field v-field--wide ${errors.pet ? "has-error" : ""}`}><span>Paciente</span>
          <select value={f.pet} onChange={(e) => set("pet", e.target.value)} aria-invalid={!!errors.pet}><option value="">Elegí un paciente</option>{patients.map((x) => <option key={x.id} value={x.id}>{x.name} · {x.kind} · {x.tutor}</option>)}</select>{errors.pet && <em role="alert">{errors.pet}</em>}</label>
        {p && <div className="v-form__ctx"><Icon name="alert" size={16}/><span><b>Alergias:</b> {p.allergies.join(", ")}</span><span><b>Medicación actual:</b> {p.meds.join(", ")}</span></div>}
        {(["med", "dose", "freq", "duration"] as const).map((k) => <label key={k} className={`v-field ${k === "med" ? "v-field--wide" : ""} ${errors[k] ? "has-error" : ""}`}><span>{labels[k]}</span>
          <input value={f[k]} onChange={(e) => set(k, e.target.value)} aria-invalid={!!errors[k]} placeholder={{ med: "Ej.: Meloxicam 1,5 mg/ml", dose: "Ej.: 0,2 ml", freq: "Ej.: Cada 12 horas", duration: "Ej.: 5 días" }[k]}/>{errors[k] && <em role="alert">{errors[k]}</em>}</label>)}
        <label className="v-field v-field--wide"><span>Indicaciones</span><textarea className="v-textarea" rows={4} value={f.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Cómo administrar, precauciones, cuándo consultar nuevamente…"/></label>
      </div>
      <div className="v-form__bar">
        <Button variant="secondary" onClick={() => { if (validate(["pet", "med"])) { save("Borrador"); notify("Borrador guardado"); go("/vet/prescriptions"); } }}>Guardar borrador</Button>
        <button type="submit" className="button button--primary"><Icon name="check" size={18}/> Emitir receta</button>
      </div>
    </form>
    {confirm && p && <div className="modal-layer" role="presentation"><button className="modal-scrim" aria-label="Cerrar" onClick={() => setConfirm(false)}/><div className="modal v-modal-form" role="dialog" aria-modal="true" aria-labelledby="cf-t">
      <span className="modal__icon"><Icon name="file"/></span><h2 id="cf-t">Confirmar receta</h2><p>Revisá los datos antes de emitir la receta.</p>
      <dl className="v-summary"><div><dt>Paciente</dt><dd>{p.name} · {p.tutor}</dd></div><div><dt>Medicamento</dt><dd>{f.med}</dd></div><div><dt>Dosis</dt><dd>{f.dose}</dd></div><div><dt>Frecuencia</dt><dd>{f.freq}</dd></div><div><dt>Duración</dt><dd>{f.duration}</dd></div>{f.notes && <div><dt>Indicaciones</dt><dd>{f.notes}</dd></div>}</dl>
      <div><Button variant="secondary" onClick={() => setConfirm(false)}>Volver a editar</Button><Button onClick={() => { const id = save("Emitida"); notify("Receta emitida"); go(`/vet/prescriptions/${id}`); }}>Confirmar emisión</Button></div>
    </div></div>}
  </>;
}

function ReferenceCode({ id }: { id: string }) {
  const cells = useMemo(() => {
    let h = 0; for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    const n = 21; const out: [number, number][] = [];
    const finder = (x: number, y: number) => (x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      if (finder(x, y)) { const lx = x % 13, ly = y % 13; const edge = lx === 0 || ly === 0 || lx === 6 || ly === 6; const core = lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4; if ((lx < 7 && ly < 7) && (edge || core)) out.push([x, y]); continue; }
      h = (h * 1103515245 + 12345) >>> 0; if ((h >> 16) & 1) out.push([x, y]);
    }
    return out;
  }, [id]);
  return <svg viewBox="0 0 21 21" role="img" aria-label="Código de referencia conceptual" className="v-qr" shapeRendering="crispEdges">{cells.map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1"/>)}</svg>;
}

export function PrescriptionDetail({ id }: { id: string }) {
  const { rx, notify } = useVet();
  const r = rx.find((x) => x.id === id);
  if (!r) return <><button className="back-link" onClick={() => go("/vet/prescriptions")}><Icon name="arrow" size={17}/> Volver a recetas</button><div className="panel"><EmptyState icon="file" title="No encontramos esta receta." text="Puede haber sido movida o no existir."/></div></>;
  const p = getPatient(r.petId);
  const issued = r.status !== "Borrador";
  return <>
    <button className="back-link" onClick={() => go("/vet/prescriptions")}><Icon name="arrow" size={17}/> Volver a recetas</button>
    <div className="v-issued-head" role="status"><span><Icon name={issued ? "check" : "edit"} size={24}/></span><div><span className="eyebrow">{issued ? "Operación completada" : "En preparación"}</span><h1>{issued ? "Receta emitida" : "Receta en borrador"}</h1><p>{issued ? "La receta quedó registrada en la ficha de " + p.name + "." : "Todavía no fue emitida."}</p></div></div>
    <article className="v-rx" aria-label={`Receta ${r.id}`}>
      <header><div><span className="eyebrow">Receta veterinaria</span><h2>{r.id}</h2></div><ConsultStatus status={r.status}/></header>
      <div className="v-rx__grid">
        <div><span className="v-label">Veterinario</span><b>Dr. Santiago Mendoza</b><small>Clínica general · MP 12.884</small></div>
        <div><span className="v-label">Fecha de emisión</span><b>{r.date === "Hoy" ? "15 de julio de 2025" : r.date}</b></div>
        <div><span className="v-label">Paciente</span><b>{p.name}</b><small>{p.kind} · {p.breed} · {p.weight}</small></div>
        <div><span className="v-label">Tutor</span><b>{p.tutor}</b><small>{p.tutorEmail}</small></div>
      </div>
      <div className="v-rx__med"><Icon name="pill" size={22}/><div><span className="v-label">Medicamento</span><h3>{r.med}</h3><p>{r.dose} · {r.freq} · durante {r.duration}</p></div></div>
      <div className="v-rx__notes"><span className="v-label">Indicaciones</span><p>{r.notes || "Sin indicaciones adicionales."}</p></div>
      <footer><ReferenceCode id={r.id}/><p><b>Identificador {r.id}</b><br/>Código de referencia interno de VetConnect, a modo ilustrativo. No constituye una validación externa.</p></footer>
    </article>
    <div className="v-inline-actions v-inline-actions--left">
      <Button variant="secondary" onClick={() => go("/vet/prescriptions")}>Volver a recetas</Button>
      <Button variant="soft" icon="paperclip" onClick={() => { void navigator.clipboard?.writeText(r.id); notify("Identificador copiado"); }}>Copiar identificador</Button>
      {!issued && <Button onClick={() => go(`/vet/prescriptions/new?draft=${r.id}`)}>Continuar borrador</Button>}
    </div>
  </>;
}
