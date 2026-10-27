import { ContextHandleProvider } from './application/context-handle';
import { MapHome } from './Components/map-home';
import { SideBar } from './Components/side-bar';
import { FlashMessages } from './Components/ui/flash-messages';
import { Loading } from './Components/ui/loading';

export function App() {
  return (
    <ContextHandleProvider>
      <SideBar />
      <MapHome />
      <FlashMessages width="medium" duration={3000} position="tright" />
      <Loading />
    </ContextHandleProvider>
  );
}

export default App;
