const typedocSidebar = require('./docs/api/typedoc-sidebar.cjs');

module.exports = {
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Zarr-Cesium',
      collapsed: false,
      collapsible: false,
      link: { type: 'doc', id: 'index' },
      items: [
        'getting-started',
        'providers/zarr-layer-provider',
        'providers/zarr-cube-provider',
        'providers/zarr-cube-velocity-provider',
        'data',
        {
          type: 'category',
          label: 'API Reference',
          collapsed: false,
          collapsible: false,
          link: { type: 'doc', id: 'api/index' },
          items: typedocSidebar
        }
      ]
    }
  ]
};
