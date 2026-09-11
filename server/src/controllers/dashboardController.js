import { Lead } from '../models/Lead.js';
import { FollowUp } from '../models/FollowUp.js';

export async function dashboard(req, res, next) { 
  try {
    const [total, active, highPriority, pendingApproval, sent] = await Promise.all([
      Lead.countDocuments(),
      Lead.countDocuments({ status: 'ACTIVE' }),
      FollowUp.countDocuments({ priority: 'HIGH', state: { $in: ['AWAITING_APPROVAL', 'MANUAL_REVIEW'] } }),
      FollowUp.countDocuments({ state: { $in: ['AWAITING_APPROVAL', 'MANUAL_REVIEW'] } }),
      FollowUp.countDocuments({ state: 'SENT' })
    ]);
    res.json({ total, active, highPriority, pendingApproval, sent });
  } catch (error) { next(error); }
}
