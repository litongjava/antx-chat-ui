import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import 'antd/dist/reset.css'
import App from './App.tsx';
import {UserProvider} from "./context/UserContext.tsx";
import {HashRouter} from "react-router-dom";


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserProvider>
      <HashRouter>
        <App/>
      </HashRouter>
    </UserProvider>
  </StrictMode>,
);