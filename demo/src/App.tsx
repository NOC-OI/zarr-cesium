import { ContextHandleProvider } from './application/context-handle';
import { LayersManagementHandleProvider } from './application/layers-management';
import { MapHome } from './components/map-home';
import { SideBar } from './components/side-bar';
import { FlashMessages } from './components/ui/flash-messages';
import { Loading } from './components/ui/loading';

export function App() {
  return (
    <ContextHandleProvider>
      <LayersManagementHandleProvider>
        <SideBar />
        <MapHome />
        <FlashMessages width="medium" duration={3000} position="tright" />
        <Loading />
      </LayersManagementHandleProvider>
    </ContextHandleProvider>
  );
}

export default App;
