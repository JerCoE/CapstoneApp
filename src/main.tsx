import './index.css';

import App from './App';
import { AuthProvider } from './Frontend/lib/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import React from 'react';
import { createRoot } from 'react-dom/client';
import msalConfig from './authConfig';

const msalInstance = new PublicClientApplication(msalConfig);

const container = document.getElementById('root');
if (!container) throw new Error('Root container not found');

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <MsalProvider instance={msalInstance}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MsalProvider>
    </BrowserRouter>
  </React.StrictMode>
);
