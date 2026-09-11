import { Lead } from '../models/Lead.js';
import { FollowUp } from '../models/FollowUp.js';
import { AuditLog } from '../models/AuditLog.js';
import { parseCsv } from '../utils/csv.js';

export async function listLeads(req, res, next) {
  try {
    const filter = req.query.status ? { status: req.query.status } : {};
    const leads = await Lead.find(filter).sort({ nextFollowUpAt: 1, createdAt: -1 }).lean();
    res.json(leads);
  } catch (error) { next(error); }
}

export async function getLead(req, res, next) {
  try {
    const lead = await Lead.findOne({ leadId: req.params.leadId }).lean();
    if (!lead) return res.status(404).json({ error: 'Lead not found.' });
    res.json(lead);
  } catch (error) { next(error); }
}

export async function importLeads(req, res, next) {
  try {
    const rows = Array.isArray(req.body?.leads)
      ? req.body.leads
      : parseCsv(req.body?.csv || '');
    if (!rows.length) return res.status(400).json({ error: 'Provide leads[] or a non-empty csv string.' });

    const normalized = rows.map((row, index) => ({
      leadId: row.leadId || row.lead_id || `IMP-${Date.now()}-${index + 1}`,
      name: row.name || 'Unknown Lead',
      email: row.email || '',
      phone: row.phone || '',
      course: row.course || 'Unknown Course',
      source: row.source || 'CSV Import',
      stage: row.stage || 'NEW',
      status: row.status || 'ACTIVE',
      formStatus: row.formStatus || row.form_status || 'NOT_FILLED',
      conversation: Array.isArray(row.conversation)
        ? row.conversation
        : row.lastMessage || row.last_message
          ? [{ channel: row.channel || 'whatsapp', direction: 'inbound', message: row.lastMessage || row.last_message }]
          : []
    }));

    const operations = normalized.map(lead => ({
      updateOne: {
        filter: { leadId: lead.leadId },
        update: { $set: lead },
        upsert: true
      }
    }));
    await Lead.bulkWrite(operations);
    await AuditLog.create({ action: 'LEADS_IMPORTED', actor: 'operator', metadata: { count: normalized.length, source: 'csv-or-json' } });
    res.status(201).json({ imported: normalized.length, leads: normalized });
  } catch (error) { next(error); }
}

export async function deleteLead(req, res, next) {
  try {
    const { leadId } = req.params;
    const lead = await Lead.findOne({ leadId }).lean();
    if (!lead) return res.status(404).json({ error: 'Lead not found.' });

    await Promise.all([
      Lead.deleteOne({ leadId }),
      FollowUp.deleteMany({ leadId })
    ]);

    await AuditLog.create({
      action: 'LEAD_DELETED',
      actor: 'operator',
      leadId,
      metadata: { name: lead.name, course: lead.course }
    });

    res.json({ deleted: 1, leadId });
  } catch (error) { next(error); }
}

export async function deleteAllLeads(req, res, next) {
  try {
    const [leadsResult, followUpsResult] = await Promise.all([
      Lead.deleteMany({}),
      FollowUp.deleteMany({})
    ]);

    await AuditLog.create({
      action: 'ALL_LEADS_DROPPED',
      actor: 'operator',
      metadata: {
        deletedLeads: leadsResult.deletedCount || 0,
        deletedFollowUps: followUpsResult.deletedCount || 0
      }
    });

    res.json({
      deletedLeads: leadsResult.deletedCount || 0,
      deletedFollowUps: followUpsResult.deletedCount || 0
    });
  } catch (error) { next(error); }
}
