const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Request failed: ${response.status}`);
  return body;
}

export const api = {
  dashboard: () => request('/dashboard'),
  leads: (status = '') => request(`/leads${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  lead: (leadId) => request(`/leads/${leadId}`),
  importLeads: (csv) => request('/leads/import', { method: 'POST', body: JSON.stringify({ csv }) }),
  deleteLead: (leadId) => request(`/leads/${encodeURIComponent(leadId)}`, { method: 'DELETE' }),
  deleteAllLeads: () => request('/leads/all', { method: 'DELETE' }),
  followUps: () => request('/followups'),
  analyze: (leadId) => request(`/followups/analyze/${leadId}`, { method: 'POST' }),
  approve: (id, payload = {}) => request(`/followups/${id}/approve`, { method: 'POST', body: JSON.stringify(payload) }),
  reject: (id, reason) => request(`/followups/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) })
};
