import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';
import './shell/topbar/topbar.css';
import './shell/topbar/navigation.css';
import './shell/topbar/search.css';
import './shell/topbar/actions.css';
import './shell/notifications/notifications.css';
import './shell/topbar/clock.css';
import './shell/dialer/dialer.css';
import './shell/settings/settings.css';
import './pages/leads/leads.css';
import './pages/leads/iphone.css';
import './communications/panel/panel.css';
import './communications/hub/hub.css';
import './communications/messages/messages.css';
import './communications/whatsapp/whatsapp.css';
import './communications/calls/calls.css';
import './communications/contacts/contacts.css';
import './shell/responsive.css';
import './pages/email/email.css';
import './communications/email/email.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
