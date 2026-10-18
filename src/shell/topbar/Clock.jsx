export default function Clock() {
 const now = new Date();
 return (
        <time id="topbarDateTime" className="crm-topbar-time">
          <span>{now.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
          <small>{now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</small>
        </time>
 );
}
