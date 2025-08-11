import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import 'antd/dist/reset.css'
import App from './App.tsx';
import {App as AntApp} from 'antd';
import {UserProvider} from "./context/UserContext.tsx";
import {HashRouter} from "react-router-dom";
import '@ant-design/v5-patch-for-react-19';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AntApp>
      <UserProvider>
        <HashRouter>
          <App/>
        </HashRouter>
      </UserProvider>
    </AntApp>
  </StrictMode>,
);