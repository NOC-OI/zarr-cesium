import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { Provider } from 'react-redux';
import { store } from './application/store';

const isProd = import.meta.env.MODE === 'production';

createRoot(document.getElementById('root')!).render(
  isProd ? (
    <StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </StrictMode>
  ) : (
    <Provider store={store}>
      <App />
    </Provider>
  )
);
