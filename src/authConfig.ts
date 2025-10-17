import type { Configuration } from '@azure/msal-browser';
 
const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_MSAL_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_MSAL_TENANT_ID}`,
    redirectUri: import.meta.env.VITE_REDIRECT_URI || window.location.origin,
  },
  system: {
    loggerOptions: {
      loggerCallback: () => {},
      logLevel: 0,
    },
  },
};
 
export const loginRequest = {
  scopes: ['openid', 'profile', 'User.Read', 'Calendars.Read']
};
 
export default msalConfig;
 