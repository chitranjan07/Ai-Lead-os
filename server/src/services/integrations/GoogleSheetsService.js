export class GoogleSheetsService {
  async upsertLeadStatus(lead) {
    return {
      provider: 'mock-google-sheets',
      mode: 'dry-run',
      leadId: lead.leadId,
      name: lead.name,
      email: lead.email,
      course: lead.course,
      status: lead.status,
      stage: lead.stage,
      formStatus: lead.formStatus,
      nextFollowUpAt: lead.nextFollowUpAt
    };
  }
}
export const sheetsService = new GoogleSheetsService();
