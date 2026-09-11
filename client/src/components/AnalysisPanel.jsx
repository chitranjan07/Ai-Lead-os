import { useEffect, useState } from 'react';

export default function AnalysisPanel({ lead, followUp, loading, onAnalyze, onApprove, onReject }) {
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [whatsappBody, setWhatsappBody] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setEmailSubject(followUp?.messages?.email?.subject || '');
    setEmailBody(followUp?.messages?.email?.body || '');
    setWhatsappBody(followUp?.messages?.whatsapp?.body || '');
    setCopied(false);
  }, [followUp?._id]);

  if (!lead) return <div className="panel empty">Select a lead to inspect its context.</div>;

  const analysis = followUp;
  const hasWhatsAppDraft = Boolean(analysis?.messages?.whatsapp?.body?.trim());
  const hasEmailDraft = Boolean(analysis?.messages?.email?.subject?.trim() && analysis?.messages?.email?.body?.trim());
  const hasSendableDraft = hasWhatsAppDraft || hasEmailDraft;
  const canAct = analysis && ['AWAITING_APPROVAL', 'EDITED', 'FAILED'].includes(analysis.state);
  const manualReviewCanApprove = analysis?.state === 'MANUAL_REVIEW' && analysis?.recommendedChannel !== 'NONE' && hasSendableDraft;
  const copyWhatsApp = async () => {
    await navigator.clipboard?.writeText(whatsappBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="panel analysis-panel">
      <div className="panel-header">
        <div>
          <div className="eyebrow">LEAD DETAIL</div>
          <h2>{lead.name}</h2>
          <div className="muted">{lead.course} · {lead.source} · {lead.email || 'No email on record'}</div>
        </div>
        <div className={`priority priority-${analysis?.priority?.toLowerCase() || 'none'}`}>{analysis?.priority || 'UNANALYZED'}</div>
      </div>

      <div className="conversation">
        <div className="section-title">Conversation context</div>
        {lead.conversation?.length ? lead.conversation.map((m, i) => (
          <div className={`message ${m.direction}`} key={`${m.timestamp || i}-${i}`}>
            <span className="message-channel">{m.channel} · {m.direction}</span>
            <div>{m.message}</div>
          </div>
        )) : <div className="muted">No conversation history available.</div>}
      </div>

      {!analysis ? (
        <div className="analyze-cta">
          <p>Run the AI workflow to extract intent, stage, priority, next action, follow-up date, and the best outreach channel. Instruction-like lead text is isolated for manual review.</p>
          <button className="primary" disabled={loading} onClick={onAnalyze}>{loading ? 'Analyzing…' : 'Analyze lead'}</button>
        </div>
      ) : (
        <>
          <div className="insight-grid">
            <div><span>Stage</span><strong>{analysis.stage}</strong></div>
            <div><span>Intent</span><strong>{analysis.intent}</strong></div>
            <div><span>Channel</span><strong>{analysis.recommendedChannel}</strong></div>
            <div><span>Follow-up</span><strong>{new Date(analysis.followUpDate).toLocaleDateString()}</strong></div>
            <div><span>Confidence</span><strong>{Math.round(analysis.confidence * 100)}%</strong></div>
            <div><span>State</span><strong>{analysis.state}</strong></div>
          </div>

          <div className="reason-box">
            <div className="section-title">Why?</div>
            <p>{analysis.reason}</p>
            <div className="section-title">Recommended action</div>
            <p>{analysis.recommendedAction}</p>
            {analysis.failureReason && <><div className="section-title">Execution note</div><p>{analysis.failureReason}</p></>}
          </div>

          {analysis.recommendedChannel !== 'NONE' && (
            <div className="drafts">
              <div className="section-title">Channel drafts — review before approval</div>
              {(analysis.recommendedChannel === 'WHATSAPP' || analysis.recommendedChannel === 'BOTH') && (
                <label>WhatsApp<textarea value={whatsappBody} onChange={e => setWhatsappBody(e.target.value)} /></label>
              )}
              {(analysis.recommendedChannel === 'EMAIL' || analysis.recommendedChannel === 'BOTH') && (
                <>
                  <label>Email subject<input value={emailSubject} onChange={e => setEmailSubject(e.target.value)} /></label>
                  <label>Email body<textarea value={emailBody} onChange={e => setEmailBody(e.target.value)} /></label>
                </>
              )}
            </div>
          )}

          <div className="action-row">
            {analysis.recommendedChannel === 'WHATSAPP' && <button className="secondary" onClick={copyWhatsApp}>{copied ? 'Copied' : 'Copy WhatsApp'}</button>}
            {canAct && <button className="primary" disabled={loading} onClick={() => onApprove({ emailSubject, emailBody, whatsappBody })}>{loading ? 'Sending…' : 'Approve & send'}</button>}
            {manualReviewCanApprove && <button className="primary" disabled={loading} onClick={() => onApprove({ emailSubject, emailBody, whatsappBody })}>{loading ? 'Sending…' : 'Review complete — approve & send'}</button>}
            {(canAct || analysis.state === 'MANUAL_REVIEW') && <button className="danger" disabled={loading} onClick={() => onReject('Rejected in review UI')}>Reject</button>}
            {analysis.state === 'COMPLETED' && <span className="sent">✓ Execution recorded</span>}
            {analysis.state === 'MANUAL_REVIEW' && analysis.recommendedChannel !== 'NONE' && hasSendableDraft && <span className="review">Manual review required — inspect the draft, then approve or reject.</span>}
            {analysis.state === 'MANUAL_REVIEW' && analysis.recommendedChannel === 'NONE' && <span className="review">Manual review required. Sending is disabled because this case was safety-blocked or has no sendable outreach.</span>}
            {analysis.state === 'FAILED' && <span className="failed">Execution failed — fix/review before retry.</span>}
            {analysis.state === 'PARTIAL_FAILURE' && <span className="failed">Partial failure — one channel succeeded; retry will target failed channels only.</span>}
            {analysis.execution?.email?.status && <span className="status-note">Email: {analysis.execution.email.status}</span>}
            {analysis.execution?.whatsapp?.status && <span className="status-note">WhatsApp: {analysis.execution.whatsapp.status}</span>}
          </div>
        </>
      )}
    </div>
  );
}
