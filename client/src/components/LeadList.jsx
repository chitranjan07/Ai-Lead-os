import { useMemo, useState } from 'react';

export default function LeadList({ leads, selectedId, onSelect, onImport, onAnalyzeAll, onDelete, onDeleteAll, busy }) {
  const [query, setQuery] = useState('');
  const [stage, setStage] = useState('ALL');

  const visible = useMemo(() => leads.filter((lead) => {
    const matchesQuery = `${lead.name} ${lead.course} ${lead.leadId}`.toLowerCase().includes(query.toLowerCase());
    const matchesStage = stage === 'ALL' || lead.stage === stage;
    return matchesQuery && matchesStage;
  }), [leads, query, stage]);

  return (
    <div className="panel lead-list">
      <div className="panel-header">
        <div>
          <div className="eyebrow">QUEUE</div>
          <h2>Leads</h2>
        </div>
        <span className="badge">{visible.length}/{leads.length}</span>
      </div>
      <div className="queue-tools">
        <input placeholder="Search lead, course or ID" value={query} onChange={e => setQuery(e.target.value)} />
        <select value={stage} onChange={e => setStage(e.target.value)}>
          <option value="ALL">All stages</option>
          <option>NEW</option>
          <option>CONTACTED</option>
          <option>INTERESTED</option>
          <option>DISCUSSION_PENDING</option>
          <option>FORM_FILLED</option>
          <option>REGISTRATION_PENDING</option>
          <option>REGISTERED</option>
          <option>NOT_INTERESTED</option>
        </select>
        <div className="queue-actions">
          <button className="secondary" disabled={busy} onClick={onImport}>Choose CSV File</button>
          <button className="secondary" disabled={busy || !visible.length} onClick={onAnalyzeAll}>Analyze visible</button>
          <button
            className="secondary drop-all"
            disabled={busy || !leads.length}
            onClick={() => window.confirm('Drop all leads and their follow-up records? This cannot be undone.') && onDeleteAll()}
            title="Delete all leads"
          >
            Drop all
          </button>
        </div>
      </div>
      <div className="lead-items">
        {visible.map((lead) => (
          <div key={lead.leadId} className={`lead-item ${selectedId === lead.leadId ? 'active' : ''}`}>
            <button className="lead-main" onClick={() => onSelect(lead.leadId)}>
              <div className="lead-topline">
                <strong>{lead.name}</strong>
                <span>{lead.leadId}</span>
              </div>
              <div className="lead-course">{lead.course}</div>
              <div className="lead-meta">
                <span>{lead.stage}</span>
                <span>{lead.source}</span>
                {lead.nextFollowUpAt && <span>{new Date(lead.nextFollowUpAt).toLocaleDateString()}</span>}
              </div>
            </button>
            <button
              className="lead-delete"
              aria-label={`Delete ${lead.name}`}
              title="Delete lead"
              disabled={busy}
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Delete ${lead.name}? This also removes its follow-up records.`)) onDelete(lead.leadId);
              }}
            >
              ×
            </button>
          </div>
        ))}
        {!visible.length && <div className="empty compact">No matching leads.</div>}
      </div>
    </div>
  );
}
