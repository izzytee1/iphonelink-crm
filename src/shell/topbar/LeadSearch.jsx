import CrmIcon from '../../components/CrmIcons.jsx';

export default function LeadSearch({ globalSearch, setGlobalSearch }) {
 return (
          <div className="crm-search-wrap">
            <CrmIcon name="search" size={13} />
            <input id="globalSearch" type="search" value={globalSearch} onChange={(event) => setGlobalSearch(event.target.value)} placeholder="Search leads…" />
          </div>
 );
}
