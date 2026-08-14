export interface GenerateMinutesOptions {
  transcript: string;
  meetingId?: string;
  meetingTitle?: string;
  meetingDate?: string;
  participants?: string[];
  additionalContext?: string;
  languageHint?: string;
}

export interface ActionItemData {
  task: string;
  responsible_person: string;
  deadline: string;
  priority: 'High' | 'Medium' | 'Low' | 'Critical';
  status: 'Pending' | 'In Progress' | 'Completed';
}

export interface MinutesOutput {
  success: boolean;
  provider: 'openai' | 'gemini';
  model_used?: string;
  summary: string;
  discussion_points: string[];
  decisions: string[];
  action_items: ActionItemData[];
  pending_issues: string[];
  next_meeting: string;
}

export interface AIProvider {
  name: 'openai' | 'gemini' | string;
  generateMinutes(options: GenerateMinutesOptions): Promise<MinutesOutput>;
}
