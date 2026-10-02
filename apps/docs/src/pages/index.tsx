import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';

const features = [
  [
    '🧭',
    'Arquitetura',
    'Entenda o monorepo, as fronteiras entre aplicações e as decisões técnicas.',
    '/docs/architecture/overview',
  ],
  [
    '⚡',
    'Desenvolvimento',
    'Prepare o ambiente e execute web, API, banco e Redis localmente.',
    '/docs/getting-started/installation',
  ],
  [
    '📚',
    'Referência',
    'Consulte contratos compartilhados, domínio, variáveis e endpoints.',
    '/docs/reference/api',
  ],
];
export default function Home() {
  return (
    <Layout title="Documentação" description="Documentação técnica do KaukaMed">
      <header className={clsx('hero', styles.hero)}>
        <div className="container">
          <span className={styles.eyebrow}>PLATAFORMA DE GESTÃO CLÍNICA</span>
          <Heading as="h1" className={styles.title}>
            Construa saúde com contexto.
          </Heading>
          <p className={styles.subtitle}>
            Um guia único para desenvolver, operar e evoluir o KaukaMed com segurança.
          </p>
          <div className={styles.actions}>
            <Link className="button button--primary button--lg" to="/docs/intro">
              Explorar documentação
            </Link>
            <Link
              className="button button--secondary button--lg"
              to="/docs/getting-started/installation"
            >
              Começar agora
            </Link>
          </div>
        </div>
      </header>
      <main>
        <section className={styles.features}>
          <div className="container">
            <div className="row">
              {features.map(([icon, title, text, to]) => (
                <div className="col col--4" key={title}>
                  <Link className={styles.card} to={to}>
                    <span>{icon}</span>
                    <Heading as="h2">{title}</Heading>
                    <p>{text}</p>
                    <b>Ler guia →</b>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
