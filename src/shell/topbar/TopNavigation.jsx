import CrmIcon from '../../components/CrmIcons.jsx';

// Visible pages only. Removed page components remain as empty redesign templates.
const nav = [
  { key: 'leads', label: 'Leads', icon: 'leads' },
  { key: 'email', label: 'Email', icon: 'email' },
];

export default function TopNavigation({ workspace, setWorkspace }) {
  return (
    <nav className="crm-topnav" aria-label="Main navigation">
      {nav.map((item) => (
        <button
          key={item.key}
          type="button"
          data-workspace={item.key}
          onClick={() => setWorkspace(item.key)}
          className={workspace === item.key ? 'active' : ''}
        >
          <CrmIcon name={item.icon} size={14} />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
