import { useState } from "react";
import { Button, EmptyState, Icon, PageHeader, Status, go } from "../shared";
import { getPatient, patients, type Patient } from "./data";
import { FichaClinica } from "./Consultations";
import { FilterSelect, PetPhoto, useVet } from "./vetkit";

const stateTone = (s: Patient["state"]) => (s === "Activo" ? "teal" : s === "En seguimiento" ? "amber" : "gray");

export function PatientsPage() {
  const { forceEmpty } = useVet();
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("Todas");
  const [tutor, setTutor] = useState("Todos");
  const [last, setLast] = useState("Cualquiera");
  const base = forceEmpty ? [] : patients;
  const shown = base.filter((p) => (p.name + " " + p.tutor).toLowerCase().includes(q.toLowerCase())
    && (kind === "Todas" || p.kind === kind) && (tutor === "Todos" || p.tutor === tutor)
    && (last === "Cualquiera" || (last === "Últimos 7 días" ? p.lastDays <= 7 : last === "Últimos 30 días" ? p.lastDays <= 30 : p.lastDays > 30)));
  const filtered = q || kind !== "Todas" || tutor !== "Todos" || last !== "Cualquiera";
  return <>
    <PageHeader eyebrow="Historias clínicas" title="Pacientes" description="Buscá por mascota o tutor y abrí la ficha clínica."/>
    <div className="v-filters v-filters--search" role="search">
      <div className="search-field v-search"><Icon name="search" size={18}/><input aria-label="Buscar paciente o tutor" placeholder="Buscar por mascota o tutor" value={q} onChange={(e) => setQ(e.target.value)}/></div>
      <FilterSelect label="Especie" value={kind} onChange={setKind} options={["Todas", ...Array.from(new Set(patients.map((p) => p.kind)))]}/>
      <FilterSelect label="Tutor" value={tutor} onChange={setTutor} options={["Todos", ...Array.from(new Set(patients.map((p) => p.tutor)))]}/>
      <FilterSelect label="Última consulta" value={last} onChange={setLast} options={["Cualquiera", "Últimos 7 días", "Últimos 30 días", "Más de 30 días"]}/>
      {filtered && <button className="v-link" onClick={() => { setQ(""); setKind("Todas"); setTutor("Todos"); setLast("Cualquiera"); }}>Limpiar</button>}
    </div>
    {shown.length === 0 ? <div className="panel"><EmptyState icon="paw" title={filtered ? "No encontramos pacientes con esos filtros." : "Todavía no tenés pacientes asociados."} text={filtered ? "Revisá la búsqueda o limpiá los filtros." : "Cuando atiendas a un paciente, vas a verlo acá."}/></div> : <>
      <div className="v-table-wrap"><table className="v-table">
        <caption className="sr-only">Pacientes asociados</caption>
        <thead><tr><th scope="col">Paciente</th><th scope="col">Especie</th><th scope="col">Tutor</th><th scope="col">Última consulta</th><th scope="col">Estado</th><th scope="col"><span className="sr-only">Acción</span></th></tr></thead>
        <tbody>{shown.map((p) => <tr key={p.id}>
          <td><div className="v-cell"><PetPhoto pet={p} size={40}/><div><b>{p.name}</b><small>{p.age} · {p.weight}</small></div></div></td>
          <td>{p.kind}<small>{p.breed}</small></td><td>{p.tutor}</td><td>{p.last}</td>
          <td><Status tone={stateTone(p.state)}>{p.state}</Status></td>
          <td><Button variant="secondary" onClick={() => go(`/vet/patients/${p.id}`)}>Abrir ficha</Button></td>
        </tr>)}</tbody>
      </table></div>
      <div className="v-cards" role="list">{shown.map((p) => <article role="listitem" className="v-card" key={p.id}>
        <PetPhoto pet={p} size={56}/><div><h3>{p.name}</h3><p>{p.kind} · {p.breed}</p><small>Tutor: {p.tutor}</small><small>Última consulta: {p.last}</small></div><Status tone={stateTone(p.state)}>{p.state}</Status>
        <Button variant="secondary" onClick={() => go(`/vet/patients/${p.id}`)}>Abrir ficha</Button>
      </article>)}</div>
    </>}
  </>;
}

export function PatientDetail({ id }: { id: string }) {
  const p = getPatient(id);
  return <>
    <button className="back-link" onClick={() => go("/vet/patients")}><Icon name="arrow" size={17}/> Volver a pacientes</button>
    <section className="v-case v-case--patient">
      <PetPhoto pet={p} size={72}/>
      <div className="v-case__who"><span className="eyebrow">Ficha clínica</span><h1>{p.name}</h1><p>{p.kind} · {p.breed} · {p.age}</p></div>
      <div className="v-case__cell"><span className="v-label">Tutor</span><b>{p.tutor}</b><small>{p.tutorPhone}</small></div>
      <div className="v-case__cell"><span className="v-label">Última consulta</span><b>{p.last}</b><Status tone={stateTone(p.state)}>{p.state}</Status></div>
      <div className="v-case__actions"><Button variant="secondary" icon="message" onClick={() => go("/vet/messages")}>Mensaje</Button><Button icon="pill" onClick={() => go(`/vet/prescriptions/new?pet=${p.id}`)}>Nueva receta</Button></div>
    </section>
    <section className="panel v-panel-flush"><FichaClinica p={p} showEvolution/></section>
  </>;
}
