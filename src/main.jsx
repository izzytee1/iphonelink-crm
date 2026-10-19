import '@fontsource/share-tech-mono/400.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';
import './shell/topbar/topbar.css';
import './shell/topbar/navigation.css';
import './shell/topbar/search.css';
import './shell/topbar/actions.css';
import './shell/notifications/notifications.css';
import './shell/settings/settings.css';
import './pages/leads/leads.css';
import './pages/leads/iphone.css';
import './communications/comms.css';
import './shell/responsive.css';
import './pages/email/email.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><div className="crm-scroll-viewport"><App /></div></React.StrictMode>,
);
