export type LeadStatus = 'new' | 'hot' | 'warm' | 'cold';

export interface Lead {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string | null;
  phone: string;
  email: string | null;
  cnic: string | null;
  interest: string | null;
  status: LeadStatus;
  tags: string[];
  budget: string | null;
  source: string;
  followup_date: string | null;
  notes: string | null;
  salesperson_email: string | null;
  salesperson_name: string | null;
}

export interface LeadFormData {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  cnic: string;
  interest: string;
  status: LeadStatus;
  tags: string[];
  budget: string;
  source: string;
  followup_date: string;
  notes: string;
}

export const LEAD_TAGS = [
  'Interested',
  'Potential Client',
  'Ready to Move',
  'Seeking Information',
  'Need Probing',
  'Need Assistance',
  'Meeting Booked',
  'Meeting Done',
  'Details Sent',
  'Will Update After Calling',
  'Busy at the Moment',
  'Future Perspective',
  'Timeline Issue',
  'Budget Issue',
  'Expensive Issue',
  'Location Issue',
  'Project Issue',
  'Not Interested',
  'Totally Not Interested',
  'Irrelevant',
  'Already Aligned with Someone',
  'Bought Somewhere Else',
  'Archive Lead',
  'Expired Lead',
  'Commercial Interested',
  'Dealer / Realtor',
  'Token Received',
] as const;
