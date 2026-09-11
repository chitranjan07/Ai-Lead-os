import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from './services/api';
import StatCard from './components/StatCard';
import LeadList from './components/LeadList';
import AnalysisPanel from './components/AnalysisPanel';

export default function App() {
  const [dashboard, setDashboard] = useState(null);
  const [leads, setLeads] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [selectedId, setSelectedId] = useState('L001');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const selectedLead = useMemo(() => leads.find(l => l.leadId === selectedId), [leads, selectedId]);
  const selectedFollowUp = useMemo(() => [...followUps].find(f => f.leadId === selectedId), [followUps, selectedId]);

  async function load() {
    setError('');
    try {
      const [d, l, f] = await Promise.all([api.dashboard(), api.leads(), api.followUps()]);
      setDashboard(d);
      setLeads(l);
      setFollowUps(f);
    } catch (e) { setError(e.message); }
  }

  useEffect(() => { load(); }, []);

  async function analyze(leadId) {
    setLoading(true); setError('');
    try {
      await api.analyze(leadId);
      await load();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function approve(payload) {
    if (!selectedFollowUp) return;
    setLoading(true); setError('');
    try {
      await api.approve(selectedFollowUp._id, payload);
      await load();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function reject(reason) {
    if (!selectedFollowUp) return;
    setLoading(true); setError('');
    try {
      await api.reject(selectedFollowUp._id, reason);
      await load();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  function importCsv() {
    setError('');
    fileInputRef.current?.click();
  }

  async function handleCsvFile(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please choose a .csv file.');
      return;
    }

    try {
      const csv = await file.text();
      if (!csv.trim()) throw new Error('The selected CSV file is empty.');
      setLoading(true);
      setError('');
      await api.importLeads(csv);
      await load();
    } catch (e) {
      setError(e.message || 'CSV import failed.');
    } finally {
      setLoading(false);
    }
  }

  async function analyzeVisible() {
    setLoading(true); setError('');
    try {
      const selected = leads.filter((lead) => {
        const queryStage = true;
        return queryStage;
      });
      for (const lead of selected.slice(0, 12)) await api.analyze(lead.leadId);
      await load();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function deleteLead(leadId) {
    setLoading(true); setError('');
    try {
      await api.deleteLead(leadId);
      if (selectedId === leadId) setSelectedId('');
      await load();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function deleteAllLeads() {
    setLoading(true); setError('');
    try {
      await api.deleteAllLeads();
      setSelectedId('');
      await load();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <div className="eyebrow">AI OPERATIONS</div>
          <h1>Lead Follow-up OS</h1>
        </div>
        <div className="topbar-note">Approval-first · Synthetic data · Email + WhatsApp</div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleCsvFile}
        style={{ display: 'none' }}
      />

      <main>
        <section className="hero">
          <div>
            <div className="eyebrow">TODAY</div>
            <h2>Turn fragmented lead work into a follow-up queue.</h2>
            <p>Analyze context, prioritize the next action, draft channel-specific outreach, and keep the counselor in control of the send.</p>
          </div>
          <div className="hero-chip">~200 leads/day workload model</div>
        </section>

        <section className="stats">
          <StatCard label="Total leads" value={dashboard?.total ?? '—'} hint="Synthetic demo dataset" />
          <StatCard label="Active" value={dashboard?.active ?? '—'} hint="Currently actionable" />
          <StatCard label="High priority" value={dashboard?.highPriority ?? '—'} hint="Needs attention" />
          <StatCard label="Awaiting approval" value={dashboard?.pendingApproval ?? '—'} hint="Human gate" />
        </section>

        <section className="workspace">
          <LeadList leads={leads} selectedId={selectedId} onSelect={setSelectedId} onImport={importCsv} onAnalyzeAll={analyzeVisible} onDelete={deleteLead} onDeleteAll={deleteAllLeads} busy={loading} />
          <AnalysisPanel lead={selectedLead} followUp={selectedFollowUp} loading={loading} onAnalyze={() => analyze(selectedId)} onApprove={approve} onReject={reject} />
        </section>
      </main>
      <footer>AI provider + communication channels are configurable. Real external messages are sent only when the provider is configured and the counselor approves.</footer>
    </div>
  );
}
