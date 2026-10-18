import CrmIcon from '../../components/CrmIcons.jsx';

export default function ActionButton({ title, icon, onClick, dataProps = {} }) {
  if (!onClick) return null;
  return (
    <button type="button" {...dataProps} title={title} aria-label={title} onClick={(event) => { event.stopPropagation(); onClick(); }} className="comm-action-icon">
      <CrmIcon name={icon} size={14} />
    </button>
  );
}
