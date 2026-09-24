import styles from './page.module.css';

const FASES = [
  { nome: 'Phase 0 — Setup do projeto', status: 'Em andamento' },
  { nome: 'Phase 1 — Banco de dados & ORM', status: 'Pendente' },
  { nome: 'Phase 2 — Backend: fundação', status: 'Pendente' },
  { nome: 'Phase 3 — Backend: autenticação & autorização', status: 'Pendente' },
  { nome: 'Phase 4 — Backend: domínio & API REST', status: 'Pendente' },
  { nome: 'Phase 5 — Frontend: fundação', status: 'Pendente' },
  { nome: 'Phase 6 — Frontend: telas & fluxos', status: 'Pendente' },
  { nome: 'Phase 7 — Testes', status: 'Pendente' },
  { nome: 'Phase 8 — Qualidade, deploy & entrega', status: 'Pendente' },
];

export default function Home() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>KaukaMed</h1>
      <p className={styles.subtitle}>
        Plataforma de gestão clínica com agendamento de consultas, prontuário eletrônico e
        controle de convênios.
      </p>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Roadmap do projeto</h2>
        <ul className={styles.list}>
          {FASES.map((fase) => (
            <li key={fase.nome} className={styles.listItem}>
              <span>{fase.nome}</span>
              <span className={styles.badge}>{fase.status}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className={styles.footer}>
        Front-end em Next.js (App Router) — API REST em NestJS em <code>/api/v1</code>.
      </p>
    </main>
  );
}
