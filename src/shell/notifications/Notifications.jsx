import CrmIcon from '../../components/CrmIcons.jsx';

export default function Notifications({ unreadMail, onOpenEmail }) {
 return (
        <button id="crmNotificationsBtn" type="button" onClick={() => onOpenEmail()} className="crm-topbar-icon relative" title="Email notifications" aria-label="Open email notifications">
          <CrmIcon name="bell" size={15} />
          {unreadMail ? <span className="crm-notification-count">{unreadMail}</span> : null}
        </button>
 );
}
