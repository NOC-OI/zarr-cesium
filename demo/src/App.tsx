import { ContextHandleProvider } from './application/context-handle';
import { layersJson } from './application/data/layers-json';
import { LayersManagementHandleProvider } from './application/layers-management';
import { MapHome } from './Components/map-home';
import { SideBar } from './Components/side-bar';
import { FlashMessages } from './Components/ui/flash-messages';
import { Loading } from './Components/ui/loading';
import type { LayersJsonType } from './types';

export function App() {
  const listLayers: LayersJsonType = layersJson;
  return (
    <ContextHandleProvider>
      <LayersManagementHandleProvider>
        <SideBar listLayers={listLayers} />
        <MapHome listLayers={listLayers} />
        <FlashMessages width="medium" duration={3000} position="tright" />
        <Loading />
      </LayersManagementHandleProvider>
    </ContextHandleProvider>
  );
}

export default App;
