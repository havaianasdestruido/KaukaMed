import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import { themes as prismThemes } from 'prism-react-renderer';

const config: Config = {
  title: 'KaukaMed Docs',
  tagline: 'Documentação técnica da plataforma de gestão clínica',
  favicon: 'img/favicon.svg',
  url: process.env.DOCS_URL ?? 'https://havaianasdestruido.github.io',
  baseUrl: process.env.DOCS_BASE_URL ?? '/KaukaMed/',
  organizationName: 'havaianasdestruido',
  projectName: 'KaukaMed',
  onBrokenLinks: 'throw',
  markdown: { hooks: { onBrokenMarkdownLinks: 'warn' } },
  i18n: { defaultLocale: 'pt-BR', locales: ['pt-BR'] },
  presets: [
    [
      'classic',
      {
        docs: {
          path: '../../docs',
          routeBasePath: 'docs',
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/havaianasdestruido/KaukaMed/edit/main/',
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
        },
        blog: false,
        theme: { customCss: './src/css/custom.css' },
      } satisfies Preset.Options,
    ],
  ],
  themeConfig: {
    image: 'img/social-card.svg',
    navbar: {
      title: 'KaukaMed',
      logo: { alt: 'KaukaMed', src: 'img/logo.svg' },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentação',
        },
        { to: '/docs/reference/api', label: 'API', position: 'left' },
        { to: '/docs/tasks/', label: 'Roadmap', position: 'left' },
        {
          href: 'https://github.com/havaianasdestruido/KaukaMed',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Começar',
          items: [
            { label: 'Instalação', to: '/docs/getting-started/installation' },
            { label: 'Configuração', to: '/docs/getting-started/configuration' },
          ],
        },
        {
          title: 'Código',
          items: [
            { label: 'Arquitetura', to: '/docs/architecture/overview' },
            { label: 'Contribuição', to: '/docs/operations/contributing' },
          ],
        },
        {
          title: 'Comunidade',
          items: [{ label: 'GitHub', href: 'https://github.com/havaianasdestruido/KaukaMed' }],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} KaukaMed. Licença MIT.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'sql'],
    },
    colorMode: { defaultMode: 'light', respectPrefersColorScheme: true },
  } satisfies Preset.ThemeConfig,
};
export default config;
