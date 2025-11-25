import { themes as prismThemes } from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Zarr-Cesium',
  tagline: 'Visualize multidimensional Zarr datasets in Cesium',
  url: 'https://noc-oi.github.io',
  baseUrl: '/zarr-cesium/docs/',

  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'NOC-OI',
  projectName: 'zarr-cesium',
  onBrokenLinks: 'warn',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn'
    }
  },
  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en']
  },
  // staticDirectories: ["static"],
  plugins: [
    [
      'docusaurus-plugin-typedoc',
      {
        entryPoints: ['../src/index.ts'],
        tsconfig: '../tsconfig.json',
        plugin: ['./typedoc-plugin.mjs'],
        readme: 'none',
        indexFormat: 'table',
        disableSources: true,
        excludeCategories: ['Variables'],
        groupOrder: ['Classes', 'Interfaces', 'type-aliases', 'functions'],
        // groupOrder: ['Classes', 'Interfaces', 'type-aliases', 'functions', 'variables'],
        sidebar: { pretty: true },
        textContentMappings: {
          'title.indexPage': 'API Reference',
          'title.memberPage': '{name}'
        },
        parametersFormat: 'table',
        enumMembersFormat: 'table',
        useCodeBlocks: true,
        cleanOutputDir: true,
        externalSymbolLinkMappings: {
          cesium: {
            '"cesium".Rectangle': 'https://cesium.com/learn/cesiumjs/ref-doc/Rectangle.html',
            '"cesium".TilingScheme': 'https://cesium.com/learn/cesiumjs/ref-doc/TilingScheme.html',
            '"cesium".WebMercatorTilingScheme':
              'https://cesium.com/learn/cesiumjs/ref-doc/WebMercatorTilingScheme.html',
            '"cesium".GeographicTilingScheme':
              'https://cesium.com/learn/cesiumjs/ref-doc/GeographicTilingScheme.html',
            '"cesium".SplitDirection':
              'https://cesium.com/learn/cesiumjs/ref-doc/SplitDirection.html',
            '"cesium".TextureMinificationFilter':
              'https://cesium.com/learn/cesiumjs/ref-doc/TextureMinificationFilter.html',
            '"cesium".TextureMagnificationFilter':
              'https://cesium.com/learn/cesiumjs/ref-doc/TextureMagnificationFilter.html',
            '"cesium".ImageryProvider':
              'https://cesium.com/learn/cesiumjs/ref-doc/ImageryProvider.html',
            '"cesium".ImageryLayerCollection':
              'https://cesium.com/learn/cesiumjs/ref-doc/ImageryLayerCollection.html',
            '"cesium".DeveloperError':
              'https://cesium.com/learn/cesiumjs/ref-doc/DeveloperError.html',
            '"cesium".TileProviderError':
              'https://cesium.com/learn/cesiumjs/ref-doc/TileProviderError.html',
            '"cesium".ImageryLayerFeatureInfo':
              'https://cesium.com/learn/cesiumjs/ref-doc/ImageryLayerFeatureInfo.html',
            '"cesium".Globe.enableLighting':
              'https://cesium.com/learn/cesiumjs/ref-doc/Globe.html#enableLighting',
            '"cesium".TextureMinificationFilter.LINEAR':
              'https://cesium.com/learn/cesiumjs/ref-doc/TextureMinificationFilter.html#linear',
            '"cesium".TextureMinificationFilter.NEAREST':
              'https://cesium.com/learn/cesiumjs/ref-doc/TextureMinificationFilter.html#nearest',
            '"cesium".TextureMagnificationFilter.LINEAR':
              'https://cesium.com/learn/cesiumjs/ref-doc/TextureMagnificationFilter.html#linear',
            '"cesium".TextureMagnificationFilter.NEAREST':
              'https://cesium.com/learn/cesiumjs/ref-doc/TextureMagnificationFilter.html#nearest'
          },
          typescript: {
            WebGLShader: 'https://developer.mozilla.org/en-US/docs/Web/API/WebGLShader',
            WebGLProgram: 'https://developer.mozilla.org/en-US/docs/Web/API/WebGLProgram',
            WebGLTexture: 'https://developer.mozilla.org/en-US/docs/Web/API/WebGLTexture',
            ImageData: 'https://developer.mozilla.org/en-US/docs/Web/API/ImageData'
          }
        }
      }
    ]
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js'
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/'
        },
        theme: {
          customCss: './assets/custom.css'
        }
      })
    ]
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'assets/favicon.ico',
      navbar: {
        items: [
          {
            type: 'doc',
            docId: 'index',
            position: 'left',
            label: 'Docs'
          },
          {
            href: 'https://github.com/tgreyuk/typedoc-plugin-markdown/tree/next/packages/docusaurus-plugin-typedoc',
            label: 'GitHub',
            position: 'right'
          }
        ]
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Tutorial',
                to: '/docs/intro'
              }
            ]
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/facebook/docusaurus'
              }
            ]
          }
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Zarr-Cesium, Inc. Built with Docusaurus.`
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula
      }
    })
};

export default config;
