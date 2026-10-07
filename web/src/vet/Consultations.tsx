import { useState } from "react";
import { Button, EmptyState, Icon, Modal, PageHeader, Tabs, go } from "../shared";
import { getPatient, patients, type ConsultStatus as CS, type Patient } from "./data";
import { ConsultStatus, ChatPanel, FilterSelect, Lightbox, PetPhoto, TriageBadge, useVet } from "./vetkit";

const tabMap: Record<string, CS> = { Próximas: "Próxima", Activas: "Activa", Finalizadas: "Finalizada", Canceladas: "Cancelada" };

export function ConsultationsPage() {
  const { consults } = useVet();
  const [tab, setTab] = useState("Próximas");
  const [day, setDay] = useState("Todas");
  const [kind, setKind] = useState("Todas");
  const [mode, setMode] = useState("Todas");
  const status = tabMap[tab];
  const count = (s: CS) => consults.filter((c) => c.status === s).length;
  const shown = consults.filter((c) => c.status === status && (day === "Todas" || c.day === day) && (kind === "Todas" || getPatient(c.petId).kind === kind) && (mode === "Todas" || c.mode === mode));
  const filtered = day !== "Todas" || kind !== "Todas" || mode !== "Todas";
  return <>
    <PageHeader eyebrow="Trabajo clínico" title="Consultas" description="Próximas, activas, finalizadas y canceladas, en un solo lugar."/>
    <Tabs tabs={Object.keys(tabMap)} active={tab} onChange={setTab}/>
    <div className="v-filters" role="group" aria-label="Filtros de consultas">
      <FilterSelect label="Fecha" value={day} onChange={setDay} options={["Todas", "Hoy", "Mañana", "Ayer"]}/>
      <FilterSelect label="Estado" value={tab} onChange={setTab} options={Object.keys(tabMap)}/>
      <FilterSelect label="Especie" value={kind} onChange={setKind} options={["Todas", ...Array.from(new Set(patients.map((p) => p.kind)))]}/>
      <FilterSelect label="Modalidad" value={mode} onChange={setMode} options={["Todas", "Videoconsulta", "Chat"]}/>
      {filtered && <button className="v-link" onClick={() => { setDay("Todas"); setKind("Todas"); setMode("Todas"); }}>Limpiar filtros</button>}
      <span className="v-filters__count" aria-live="polite">{shown.length} de {count(status)} {tab.toLowerCase()}</span>
    </div>
    {shown.length === 0 ? <div className="panel"><EmptyState icon="video" title="No tenés consultas para mostrar." text={filtered ? "Probá con otros filtros." : "Cuando haya actividad en esta categoría, aparecerá acá."}/></div> :
      <div className="v-rows" role="list">{shown.map((c) => { const p = getPatient(c.petId); return <article role="listitem" className={`v-row v-row--${c.status.toLowerCase()}`} key={c.id}>
        <div className="v-row__time"><b>{c.time}</b><span>{c.day}</span></div>
        <PetPhoto pet={p} size={44}/>
        <div className="v-row__main"><h3>{p.name} <small>{p.kind} · {p.breed}</small></h3><p>{c.reason}</p><small>Tutor: {p.tutor}</small></div>
        <div className="v-row__meta"><span className="v-chip"><Icon name={c.mode === "Chat" ? "message" : "video"} size={14}/>{c.mode}</span>{c.triage && <TriageBadge level={c.triage} compact/>}</div>
        <ConsultStatus status={c.status}/>
        <Button variant={c.status === "Activa" ? "primary" : "secondary"} onClick={() => go(`/vet/consultations/${c.id}`)}>Ver consulta</Button>
      </article>; })}</div>}
  </>;
}

export function FichaClinica({ p, showEvolution = false }: { p: Patient; showEvolution?: boolean }) {
  const kv = (k: string, v: string) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>;
  return <div className="v-ficha">
    <div className="v-alerts">
      <div className="v-alert v-alert--allergy"><Icon name="alert" size={17}/><div><span>Alergias</span><b>{p.allergies.join(" · ")}</b></div></div>
      <div className="v-alert"><Icon name="pill" size={17}/><div><span>Medicación actual</span><b>{p.meds.join(" · ")}</b></div></div>
    </div>
    <details open><summary>Datos del paciente</summary><dl className="v-kv">{[kv("Especie", p.kind), kv("Raza", p.breed), kv("Edad", p.age), kv("Peso", p.weight), kv("Sexo", p.sex), kv("Microchip", p.chip)]}</dl></details>
    <details open><summary>Datos del tutor</summary><dl className="v-kv">{[kv("Nombre", p.tutor), kv("Teléfono", p.tutorPhone), kv("Email", p.tutorEmail)]}</dl></details>
    <details open><summary>Antecedentes<em>{p.history.length}</em></summary><ul className="v-bullets">{p.history.map((h) => <li key={h}>{h}</li>)}</ul></details>
    <details><summary>Vacunas<em>{p.vaccines.length}</em></summary>{p.vaccines.length ? <table className="v-mini-table"><thead><tr><th>Vacuna</th><th>Aplicada</th><th>Próxima</th><th>Estado</th></tr></thead><tbody>{p.vaccines.map((v) => <tr key={v.name}><td>{v.name}</td><td>{v.date}</td><td>{v.next}</td><td><span className={`v-vacc v-vacc--${v.state === "Al día" ? "ok" : v.state === "Próxima" ? "soon" : "late"}`}>{v.state === "Vencida" && <Icon name="alert" size={12}/>}{v.state}</span></td></tr>)}</tbody></table> : <p className="v-none">No corresponde por la especie o no hay registros.</p>}</details>
    <details><summary>Consultas anteriores<em>{p.past.length}</em></summary><ul className="v-past">{p.past.map((c) => <li key={c.date}><b>{c.date}</b><div><strong>{c.title}</strong><p>{c.note}</p></div></li>)}</ul></details>
    <details><summary>Estudios<em>{p.studies.length}</em></summary>{p.studies.length ? <ul className="v-files">{p.studies.map((s) => <li key={s.name}><Icon name="file" size={16}/><span>{s.name}</span><small>{s.date}</small></li>)}</ul> : <p className="v-none">Sin estudios cargados.</p>}</details>
    <details><summary>Documentos<em>{p.docs.length}</em></summary>{p.docs.length ? <ul className="v-files">{p.docs.map((s) => <li key={s.name}><Icon name="file" size={16}/><span>{s.name}</span><small>{s.kind} · {s.size}</small></li>)}</ul> : <p className="v-none">Sin documentos cargados.</p>}</details>
    {showEvolution && <details open><summary>Evolución<em>{p.evolution.length}</em></summary><EvolutionList items={p.evolution}/></details>}
  </div>;
}

function EvolutionList({ items }: { items: Patient["evolution"] }) {
  return <ol className="v-evo">{items.map((e, i) => <li key={i}><header><b>{e.date}</b><span>{e.time}</span><span>{e.author}</span></header><p>{e.text}</p></li>)}</ol>;
}

type Save = "idle" | "saving" | "saved" | "error";

export function EvolutionEditor({ p }: { p: Patient }) {
  const [text, setText] = useState("");
  const [state, setState] = useState<Save>("idle");
  const [items, setItems] = useState(p.evolution);
  const save = () => {
    if (!text.trim()) { setState("error"); return; }
    setState("saving");
    window.setTimeout(() => {
      setItems((l) => [{ date: "15 Jul 2025", time: "18:44", author: "Dr. Santiago Mendoza", text: text.trim() }, ...l]);
      setText(""); setState("saved");
    }, 850);
  };
  return <section className="panel v-evolution" aria-labelledby="evo-title">
    <div className="panel__heading"><div><span className="eyebrow">Registro clínico</span><h2 id="evo-title">Evolución clínica</h2></div></div>
    <div className="v-evolution__meta"><span><b>Fecha</b>15 Jul 2025</span><span><b>Hora</b>18:44</span><span><b>Profesional</b>Dr. Santiago Mendoza</span></div>
    <label className="sr-only" htmlFor="evo-text">Contenido de la evolución</label>
    <textarea id="evo-text" className={`v-textarea ${state === "error" ? "is-error" : ""}`} rows={6} placeholder="Motivo, hallazgos, diagnóstico presuntivo e indicaciones…" value={text} onChange={(e) => { setText(e.target.value); if (state !== "saving") setState("idle"); }} aria-invalid={state === "error"} aria-describedby="evo-status"/>
    <div className="v-evolution__bar">
      <p id="evo-status" className={`v-save v-save--${state}`} role="status" aria-live="polite">
        {state === "saving" && <><span className="v-spin"/>Guardando…</>}
        {state === "saved" && <><Icon name="check" size={15}/>Guardado a las 18:44</>}
        {state === "error" && <><Icon name="alert" size={15}/>No se pudo guardar: escribí la evolución antes de guardar.</>}
        {state === "idle" && <span>{text.length ? `${text.length} caracteres sin guardar` : "Sin cambios"}</span>}
      </p>
      <Button onClick={save} disabled={state === "saving"} icon={state === "error" ? "repeat" : "check"}>{state === "error" ? "Reintentar guardado" : "Guardar evolución"}</Button>
    </div>
    {items.length > 0 ? <><h3 className="v-sub">Registros anteriores</h3><EvolutionList items={items}/></> : <p className="v-none">Todavía no hay evoluciones registradas.</p>}
  </section>;
}

export function ConsultationDetail({ id }: { id: string }) {
  const { consults, threads, finish, setFollowUps, notify } = useVet();
  const c = consults.find((x) => x.id === id);
  const [pane, setPane] = useState("Video");
  const [finishing, setFinishing] = useState(false);
  const [box, setBox] = useState<number | null>(null);
  if (!c) return <><button className="back-link" onClick={() => go("/vet/consultations")}><Icon name="arrow" size={17}/> Volver a consultas</button><div className="panel"><EmptyState icon="video" title="No encontramos esta consulta" text="Puede haber sido movida o eliminada."/></div></>;
  const p = getPatient(c.petId);
  const photos = (threads.find((t) => t.petId === p.id)?.msgs ?? []).filter((m) => m.kind === "image");
  const live = c.status === "Activa" || c.status === "Próxima";
  const show = (n: string) => `v-pane ${pane === n ? "is-active" : ""}`;
  return <>
    <button className="back-link" onClick={() => go("/vet/consultations")}><Icon name="arrow" size={17}/> Volver a consultas</button>
    <section className="v-case" aria-label="Paciente, tutor y estado">
      <PetPhoto pet={p} size={64}/>
      <div className="v-case__who"><span className="eyebrow">Paciente</span><h1>{p.name}</h1><p>{p.kind} · {p.breed} · {p.age} · {p.weight}</p></div>
      <div className="v-case__cell"><span className="v-label">Tutor</span><b>{p.tutor}</b><small>{p.tutorPhone}</small></div>
      <div className="v-case__cell"><span className="v-label">Motivo</span><b>{c.reason}</b><small>{c.mode} · {c.day} {c.time}</small></div>
      <div className="v-case__cell"><span className="v-label">Estado</span><ConsultStatus status={c.status}/>{c.triage && <TriageBadge level={c.triage} compact/>}</div>
      <div className="v-case__actions">
        {live && c.mode === "Videoconsulta" && <Button icon="video" onClick={() => go(`/call/${c.id}`)}>Entrar a videoconsulta</Button>}
        {c.status === "Activa" && <Button variant="secondary" onClick={() => setFinishing(true)}>Finalizar consulta</Button>}
      </div>
    </section>
    <div className="v-pane-tabs"><Tabs tabs={["Video", "Ficha", "Chat", "Evolución"]} active={pane} onChange={setPane}/></div>
    <div className="v-workspace">
      <section className={`${show("Video")} v-pane--video`} aria-label="Video y fotografías">
        <div className={`v-video ${live ? "" : "is-off"}`}>
          <img src={p.photo} alt="" loading="lazy"/>
          <div className="v-video__overlay">
            {c.mode === "Chat" ? <><Icon name="message" size={26}/><b>Consulta por chat</b><span>Podés pasar a video cuando lo necesites.</span></> : live ? <><Icon name="video" size={26}/><b>Sala lista</b><span>{p.tutor} {c.status === "Activa" ? "está conectado/a" : "aún no ingresó"}.</span></> : <><Icon name="video" size={26}/><b>Consulta {c.status === "Cancelada" ? "cancelada" : "finalizada"}</b><span>La videollamada ya no está disponible.</span></>}
            {live && <Button variant="secondary" icon="video" onClick={() => go(`/call/${c.id}`)}>{c.mode === "Chat" ? "Iniciar videollamada" : "Unirme a la llamada"}</Button>}
          </div>
        </div>
        <div className="panel v-photos"><div className="v-head v-head--tight"><h2>Fotografías clínicas</h2><span className="v-chip">{photos.length}</span></div>
          {photos.length ? <div className="v-photos__grid">{photos.map((m, i) => <button key={m.id} onClick={() => setBox(i)} aria-label={`Ampliar ${m.name}`}><img src={m.src} alt={m.name} style={{ objectPosition: m.pos }} loading="lazy"/><span>{m.time}</span></button>)}</div> : <p className="v-none">El tutor todavía no envió fotografías.</p>}
        </div>
      </section>
      <section className={`${show("Ficha")} v-pane--ficha`} aria-label="Ficha clínica">
        <div className="panel v-panel-flush"><div className="v-head v-head--tight"><h2>Ficha clínica</h2><button className="v-link" onClick={() => go(`/vet/patients/${p.id}`)}>Abrir completa <Icon name="arrow" size={14}/></button></div><FichaClinica p={p}/></div>
      </section>
      <section className={`${show("Chat")} v-pane--chat`} aria-label="Chat con el tutor">
        <div className="v-chat-wrap"><ChatPanel petId={p.id} header consultLabel={c.reason}/></div>
      </section>
      <div className={`${show("Evolución")} v-pane--evo`}>
        <EvolutionEditor p={p}/>
        <aside className="panel v-actions" aria-label="Acciones clínicas"><span className="eyebrow">Acciones clínicas</span>
          <Button variant="secondary" icon="pill" onClick={() => go(`/vet/prescriptions/new?pet=${p.id}`)}>Nueva receta</Button>
          <Button variant="secondary" icon="repeat" onClick={() => { setFollowUps((l) => [{ id: `f${Date.now()}`, petId: p.id, title: `Control: ${c.reason}`, when: "Mañana · 18:00", status: "Pendiente", note: "Creado desde la consulta." }, ...l]); notify("Seguimiento programado para mañana · 18:00"); }}>Programar seguimiento</Button>
          <Button variant="secondary" icon="file" onClick={() => go(`/vet/patients/${p.id}`)}>Ver ficha completa</Button>
        </aside>
      </div>
    </div>
    {finishing && <Modal title="Finalizar consulta" text={`¿Querés finalizar la consulta con ${p.name}? Revisá que la evolución clínica esté guardada.`} cancel="Seguir atendiendo" confirm="Finalizar consulta" onClose={() => setFinishing(false)} onConfirm={() => { finish(c.id); setFinishing(false); }}/>}
    {box !== null && <Lightbox items={photos.map((m) => ({ src: m.src!, caption: m.name!, pos: m.pos }))} index={box} onIndex={setBox} onClose={() => setBox(null)} pet={p.name} consult={c.reason}/>}
  </>;
}
