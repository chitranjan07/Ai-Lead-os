import { FollowUp } from '../models/FollowUp.js';
import { FollowUpWorkflow } from '../services/workflow/FollowUpWorkflow.js';

export async function analyzeLead(req, res, next) {
  try {
    res.json(await FollowUpWorkflow.analyze(req.params.leadId));
  } catch (error) { next(error); }
}

export async function listFollowUps(req, res, next) {
  try {
    const followUps = await FollowUp.find({ state: { $in: ['AWAITING_APPROVAL', 'EDITED', 'MANUAL_REVIEW', 'FAILED', 'PARTIAL_FAILURE', 'COMPLETED', 'REJECTED'] } }).sort({ updatedAt: -1, followUpDate: 1 }).lean();
    res.json(followUps);
  } catch (error) { next(error); }
}

export async function approveFollowUp(req, res, next) {
  try {
    res.json(await FollowUpWorkflow.approve(req.params.id, req.body || {}));
  } catch (error) { next(error); }
}

export async function rejectFollowUp(req, res, next) {
  try {
    res.json(await FollowUpWorkflow.reject(req.params.id, req.body?.reason));
  } catch (error) { next(error); }
}
