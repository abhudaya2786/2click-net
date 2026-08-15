export type PriorityLevel = 'High' | 'Medium' | 'Low';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';

// Meeting Lifecycle States
export type MeetingState = 
  | 'IDLE' 
  | 'READY' 
  | 'RECORDING' 
  | 'PAUSED' 
  | 'PROCESSING' 
  | 'COMPLETED' 
  | 'ERROR';

// Database Table: meetings
export interface MeetingEntity {
  id: string;
  title: string;
  organizer: string;
  organizerEmail?: string;
  department: string;
  project: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  duration: string; // e.g. "45 mins" or "30m"
  status: MeetingState;
  location?: string;
  agenda?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Database Table: meeting_participants
export interface MeetingParticipantEntity {
  id: string;
  meetingId: string;
  name: string;
  email?: string;
  role: 'Organizer' | 'Presenter' | 'Attendee' | 'Note Taker' | 'Guest';
  department?: string;
  attended: boolean;
  avatarColor?: string;
}

// Database Table: recordings
export interface RecordingEntity {
  id: string;
  meetingId: string;
  userId?: string;
  fileName: string;
  mimeType: string;
  durationSeconds: number;
  fileSizeBytes: number;
  audioData?: string; // base64 / blob object url (may be omitted when blobKey is set)
  blobKey?: string;
  /** User-visible path e.g. Documents/2ClickMoM/Recordings/... or Downloads/... */
  localPath?: string;
  savedToDevice?: boolean;
  status: 'Saved' | 'Processing' | 'Failed' | 'Ready';
  recordedAt: string;
}

// Database Table: transcript_segments
export interface TranscriptSegmentEntity {
  id: string;
  meeting_id: string;
  meetingId?: string; // friendly alias
  start_time: string; // e.g. "00:05" or "5.2s"
  end_time: string;   // e.g. "00:18" or "18.5s"
  speaker: string;
  text: string;
  language: 'Hindi' | 'English' | 'Hinglish' | string;
  created_at?: string;
}

// Database Table: meeting_minutes
export interface MeetingMinutesEntity {
  id: string;
  meeting_id: string;
  summary: string;
  discussion_points: string[];
  pending_issues: string[];
  next_meeting: string;
  provider?: string;
  model_used?: string;
  created_at: string;
  updated_at?: string;
}

// Database Table: decisions
export interface DecisionEntity {
  id: string;
  meeting_id: string;
  minute_id?: string;
  decision_text: string;
  context?: string;
  decided_by?: string;
  created_at: string;
}

// Database Table: action_items
export interface ActionItemEntity {
  id: string;
  meeting_id: string;
  minute_id?: string;
  task: string;
  responsible_person: string;
  deadline: string;
  priority: 'High' | 'Medium' | 'Low' | 'Critical';
  status: 'Pending' | 'In Progress' | 'Completed';
  created_at: string;
  updated_at?: string;
}

// Full Composite Meeting Record (meetings + meeting_participants + recordings + transcript_segments + minutes + decisions + action_items)
export interface FullMeetingRecord extends MeetingEntity {
  participants: MeetingParticipantEntity[];
  recordings: RecordingEntity[];
  transcriptSegments?: TranscriptSegmentEntity[];
  minutes?: MeetingMinutesEntity[];
  decisions?: DecisionEntity[];
  actionItems?: ActionItemEntity[];
}

// AI Intelligence & Minutes Generation Request/Response Types
export interface GenerateMinutesRequest {
  meetingId?: string;
  transcript: string;
  meetingTitle?: string;
  meetingDate?: string;
  participants?: string[];
  userEmail?: string;
  provider?: 'openai' | 'gemini';
  additionalContext?: string;
  languageHint?: string;
}

export interface GeneratedActionItem {
  id?: string;
  task: string;
  responsible_person: string;
  deadline: string;
  priority: 'High' | 'Medium' | 'Low' | 'Critical';
  status: 'Pending' | 'In Progress' | 'Completed';
}

export interface GeneratedDecision {
  id?: string;
  decision_text: string;
  context?: string;
  decided_by?: string;
}

export interface GenerateMinutesResponse {
  success: boolean;
  meeting_id?: string;
  minute_id?: string;
  summary: string;
  discussion_points: string[];
  decisions: string[] | GeneratedDecision[];
  raw_decisions?: any[];
  action_items: GeneratedActionItem[];
  pending_issues: string[];
  next_meeting: string;
  provider: 'openai' | 'gemini';
  model_used?: string;
  error?: string;
}

// Speech Provider Types
export type SupportedSpeechLanguage = 'en' | 'hi' | 'hinglish' | 'auto';

export interface SpeechTranscribeRequest {
  audioBase64: string;
  mimeType?: string;
  language?: SupportedSpeechLanguage | string;
  meetingId: string;
  userEmail?: string;
  speakerHint?: string[];
  contextPrompt?: string;
}

export interface SpeechSegmentResult {
  id?: string;
  meeting_id?: string;
  start_time: string;
  end_time: string;
  speaker: string;
  text: string;
  language: string;
}

export interface SpeechTranscribeResponse {
  success: boolean;
  provider: 'openai' | 'gemini';
  fullTranscript: string;
  detectedLanguage: string;
  segments: SpeechSegmentResult[];
  modelUsed?: string;
  error?: string;
}

export interface SpeechProvider {
  name: string;
  transcribe(request: SpeechTranscribeRequest): Promise<SpeechTranscribeResponse>;
}

export interface ActionItem {
  id: string;
  task: string;
  owner: string;
  priority: PriorityLevel;
  deadline: string;
  status: TaskStatus;
}

export interface TopicDiscussion {
  topic: string;
  summary: string;
  keyPoints: string[];
  speakersInvolved?: string[];
}

export interface TranscriptSegment {
  speaker: string;
  text: string;
  timestamp?: string;
}

export interface MeetingData {
  id: string;
  title: string;
  createdAt: string;
  meetingDate: string;
  duration?: string;
  meetingType: string;
  languageDetected?: string;
  participants: string[];
  executiveSummary: string;
  sentiment?: string;
  keyTopics: TopicDiscussion[];
  decisions: string[];
  actionItems: ActionItem[];
  risksAndBlockers: string[];
  openQuestions: string[];
  transcript: TranscriptSegment[];
  audioUrl?: string; // Blob or sample URL if present
}

export interface MeetingContextOptions {
  title?: string;
  meetingType?: string;
  participants?: string;
  language?: string;
  additionalNotes?: string;
}

export interface ScheduledEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm (24h or 12h)
  durationMinutes: number;
  description: string;
  attendees: string[];
  meetingType?: string;
  isAutoDetected?: boolean;
  monitoringArmed?: boolean;
  status: 'Scheduled' | 'Monitoring Armed' | 'Completed';
}

export interface PrivacySettings {
  enablePiiRedaction: boolean; // Auto mask emails, phone numbers, confidential numbers
  autoPurgeAudioBuffer: boolean; // Wipe audio data from browser memory immediately after processing
  localOnlyStorage: boolean; // Keep minutes strictly in browser storage
  anonymizeSpeakers: boolean; // Replace real names with generic speaker tags if desired
  ephemeralMode: boolean; // Private incognito session (do not persist to localStorage)
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// ==========================================
// VOICE COMMAND & WAKE WORD SYSTEM TYPES
// ==========================================

export type VoiceLanguageMode = 'hi-IN' | 'en-US' | 'en-IN' | 'hinglish' | 'auto';

export type VoiceListeningStatus = 
  | 'idle' 
  | 'listening' 
  | 'detected' 
  | 'processing' 
  | 'permission_needed' 
  | 'unsupported' 
  | 'error' 
  | 'disabled';

export type VoiceCommandAction =
  | 'START_RECORDING'
  | 'STOP_RECORDING'
  | 'CANCEL_RECORDING'
  | 'SAVE_NOTE'
  | 'GENERATE_MINUTES'
  | 'PAUSE_RECORDING'
  | 'RESUME_RECORDING'
  | 'OPEN_SETTINGS'
  | 'OPEN_MEETINGS'
  | 'NEW_MEETING'
  | 'ADD_DECISION'
  | 'ADD_ACTION_ITEM'
  | 'TOGGLE_MUTE'
  | 'CUSTOM_SCRIPT';

export interface WakeWordItem {
  id: string;
  word: string;
  aliases: string[];
  language: 'hindi' | 'english' | 'hinglish' | 'multilingual';
  enabled: boolean;
  isDefault?: boolean;
  sensitivity?: number; // 0.1 to 1.0
  detectedCount: number;
  lastDetectedAt?: string;
  description?: string;
}

export interface VoiceCommandItem {
  id: string;
  phrase: string;
  aliases: string[];
  action: VoiceCommandAction;
  language: 'hindi' | 'english' | 'hinglish' | 'multilingual';
  enabled: boolean;
  isDefault?: boolean;
  description?: string;
  executionCount: number;
  lastExecutedAt?: string;
}

export interface VoiceSystemConfig {
  wakeWords: WakeWordItem[];
  commands: VoiceCommandItem[];
  isWakeWordEnabled: boolean;
  isVoiceCommandEnabled: boolean;
  languageMode: VoiceLanguageMode;
  continuousListening: boolean;
  /** When true, start mic listening automatically when the app opens */
  autoStartListening: boolean;
  audioFeedback: boolean;
  visualFeedback: boolean;
  hapticFeedback: boolean;
  requireExplicitConfirmationForRecording: boolean;
  /** Instant-save endpoint for command sessions (optional). */
  commandSessionSaveUrl?: string;
}

export interface WakeWordDetectionEvent {
  wakeWord: WakeWordItem;
  rawTranscript: string;
  confidence: number;
  timestamp: string;
}

export interface VoiceCommandExecutionEvent {
  command: VoiceCommandItem;
  action: VoiceCommandAction;
  rawTranscript: string;
  timestamp: string;
}

// ==========================================
// MEETING RECORDING SCHEDULE TYPES
// ==========================================

export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export interface MeetingScheduleEntity {
  id: string;
  name: string;
  workingDays: DayOfWeek[];
  startTime: string; // "09:30" (24h format HH:mm)
  endTime: string;   // "18:30" (24h format HH:mm)
  timezone: string;  // e.g. "Asia/Kolkata", "America/New_York", "UTC"
  enabled: boolean;
  autoReadyState?: boolean;
  notifyOnReady?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleStatusInfo {
  isWithinSchedule: boolean;
  activeSchedule: MeetingScheduleEntity | null;
  currentDayInTz: DayOfWeek;
  currentTimeInTz: string;
  currentTime24InTz: string;
  currentDateInTz: string;
  timezone: string;
  statusMessage: string;
  timeRemainingText?: string;
}

// ==========================================
// PRIVACY, SECURITY, CONSENT & AUDIT TYPES
// ==========================================

export type RetentionOption = '7_days' | '30_days' | '90_days' | '180_days' | 'custom';

export type DownloadPermissionLevel =
  | 'all_participants'
  | 'organizer_and_admins'
  | 'admins_only'
  | 'compliance_only';

export type RecordingAccessLevel =
  | 'private_organizer'
  | 'meeting_participants'
  | 'company_internal'
  | 'restricted_roles';

export type UserRole =
  | 'admin'
  | 'compliance_officer'
  | 'organizer'
  | 'participant'
  | 'viewer';

export type ConsentStatus = 'GRANTED' | 'REVOKED' | 'PENDING' | 'DECLINED';

export type ConsentMethod =
  | 'IN_APP_MODAL'
  | 'VERBAL'
  | 'DIGITAL_SIGNATURE'
  | 'EMAIL_INVITE';

// Database Table: consents
export interface ConsentEntity {
  id: string;
  meeting_id: string;
  meeting_title?: string;
  participant_id?: string;
  participant_email: string;
  participant_name: string;
  consent_status: ConsentStatus;
  consent_method: ConsentMethod;
  notice_acknowledged: boolean;
  ip_address: string;
  user_agent: string;
  org_id: string;
  consented_at: string;
  revoked_at?: string;
}

// Database Table: retention_policies
export interface RetentionPolicyEntity {
  id: string;
  org_id: string;
  // Audio Retention
  audio_retention_days: number;
  audio_retention_type: RetentionOption;
  custom_audio_days?: number;
  // Transcript Retention
  transcript_retention_days: number;
  transcript_retention_type: RetentionOption;
  custom_transcript_days?: number;
  // Minutes of Meeting (MoM) Retention
  mom_retention_days: number;
  mom_retention_type: RetentionOption;
  custom_mom_days?: number;
  // Auto Deletion
  auto_delete_enabled: boolean;
  // Permissions
  download_permission_level: DownloadPermissionLevel;
  recording_access_level: RecordingAccessLevel;
  // Recording Notice & Consent
  recording_notice_template: string;
  require_explicit_consent: boolean;
  allow_verbal_consent: boolean;
  allow_in_app_consent: boolean;
  // Storage & Security
  private_storage_enabled: boolean;
  signed_url_ttl_minutes: number;
  supabase_rls_enabled: boolean;
  storage_encryption_standard: 'AES-256-GCM' | 'KMS-Managed';
  created_at: string;
  updated_at: string;
}

export type AuditEventType =
  | 'RECORDING_STARTED'
  | 'RECORDING_STOPPED'
  | 'TRANSCRIPT_GENERATED'
  | 'MINUTES_GENERATED'
  | 'AUDIO_ACCESSED'
  | 'PDF_DOWNLOADED'
  | 'MEETING_DELETED'
  | 'RECORDING_DELETED'
  | 'TRANSCRIPT_DELETED'
  | 'CONSENT_RECORDED'
  | 'CONSENT_REVOKED'
  | 'RETENTION_POLICY_UPDATED'
  | 'AUTO_PURGE_EXECUTED'
  | 'DATA_EXPORTED'
  | 'SUBSCRIPTION_UPGRADED'
  | 'SUBSCRIPTION_CANCELED'
  | 'PAYMENT_SUCCEEDED'
  | 'USAGE_LIMIT_ALERT';

// Database Table: audit_logs
export interface AuditLogEntity {
  id: string;
  org_id: string;
  user_id: string;
  user_email: string;
  user_role: UserRole;
  event_type: AuditEventType;
  target_type: 'meeting' | 'recording' | 'transcript' | 'minutes' | 'consent' | 'policy' | 'system' | 'subscription' | 'billing';
  target_id: string;
  target_title?: string;
  details: Record<string, any>;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface SignedUrlResponse {
  success: boolean;
  signedUrl: string;
  expiresAt: string;
  expiresInSeconds: number;
  recordingId: string;
  meetingId: string;
  token: string;
}

export interface AutoPurgeResult {
  purgedRecordings: number;
  purgedTranscripts: number;
  purgedMeetings: number;
  affectedMeetingIds: string[];
  executedAt: string;
}

// ==========================================
// SAAS SUBSCRIPTION & USAGE ARCHITECTURE
// ==========================================

export type PlanTier = 'FREE' | 'STARTER' | 'BUSINESS' | 'ENTERPRISE';
export type BillingCycle = 'monthly' | 'yearly';
export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIALING' | 'INCOMPLETE';
export type PaymentProviderType = 'NONE' | 'STRIPE' | 'RAZORPAY' | 'MANUAL';

export interface PlanLimits {
  maxUsers: number; // -1 for unlimited
  maxMeetingsPerMonth: number; // -1 for unlimited
  maxRecordingMinutesPerMonth: number;
  maxTranscriptionMinutesPerMonth: number;
  maxAiRequestsPerMonth: number;
  maxStorageBytes: number; // in bytes (e.g. 500MB = 500 * 1024 * 1024)
}

export interface PlanDefinition {
  tier: PlanTier;
  name: string;
  tagline: string;
  monthlyPriceUsd: number;
  yearlyPriceUsd: number; // per month billed annually
  monthlyPriceInr: number;
  yearlyPriceInr: number;
  limits: PlanLimits;
  features: string[];
  badge?: string;
  popular?: boolean;
}

// Database Table: subscriptions
export interface SubscriptionEntity {
  id: string;
  org_id: string;
  plan_tier: PlanTier;
  status: SubscriptionStatus;
  billing_cycle: BillingCycle;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  payment_provider: PaymentProviderType;
  customer_id?: string;
  subscription_id?: string;
  payment_method?: {
    brand?: string;
    last4?: string;
    exp_month?: number;
    exp_year?: number;
    type?: string;
    upi_id?: string;
  };
  created_at: string;
  updated_at: string;
}

// Database Table: usage
export interface UsageEntity {
  id: string;
  org_id: string;
  billing_period: string; // YYYY-MM
  users_count: number;
  meetings_count: number;
  recording_seconds: number;
  transcription_seconds: number;
  ai_requests_count: number;
  storage_bytes: number;
  last_calculated_at: string;
}

export interface UsageMetricDetail {
  used: number;
  limit: number;
  remaining: number;
  percent: number;
  unit: string;
  formattedUsed: string;
  formattedLimit: string;
  formattedRemaining: string;
  isNearLimit: boolean; // >= 80%
  isOverLimit: boolean; // >= 100%
}

export interface UsageSummary {
  period: string;
  currentPlanTier: PlanTier;
  limits: PlanLimits;
  metrics: {
    users: UsageMetricDetail;
    meetings: UsageMetricDetail;
    recordingMinutes: UsageMetricDetail;
    transcriptionMinutes: UsageMetricDetail;
    aiRequests: UsageMetricDetail;
    storage: UsageMetricDetail;
  };
  remainingRecordingMinutes: number;
  remainingTranscriptionMinutes: number;
  isAnyLimitReached: boolean;
  lastCalculatedAt: string;
}

// Database Table: billing_history (Invoices)
export interface InvoiceEntity {
  id: string;
  org_id: string;
  subscription_id: string;
  invoice_number: string;
  amount: number;
  currency: 'USD' | 'INR';
  status: 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED';
  payment_provider: PaymentProviderType;
  plan_name: string;
  billing_cycle: BillingCycle;
  period_start: string;
  period_end: string;
  paid_at: string;
  receipt_url?: string;
  created_at: string;
}

export interface BillingProviderConfig {
  stripe: {
    isConfigured: boolean;
    publishableKeyConfigured: boolean;
    secretKeyConfigured: boolean;
    webhookConfigured: boolean;
    testMode: boolean;
  };
  razorpay: {
    isConfigured: boolean;
    keyIdConfigured: boolean;
    keySecretConfigured: boolean;
    webhookConfigured: boolean;
    testMode: boolean;
  };
  activeProvider: 'STRIPE' | 'RAZORPAY' | 'SANDBOX';
}

// ==========================================
// LOCATION GEOFENCING & AUTO-RECORDING TYPES
// ==========================================

export type GeofenceTrackingStatus =
  | 'IDLE'
  | 'MONITORING'
  | 'INSIDE_GEOFENCE'
  | 'RECORDING_TRIGGERED'
  | 'MOM_GENERATING'
  | 'PERMISSION_DENIED'
  | 'POSITION_UNAVAILABLE'
  | 'UNSUPPORTED';

export interface GeofenceLocationEntity {
  id: string;
  name: string;
  category: 'Office' | 'Conference Room' | 'Client Site' | 'Home' | 'Cafe' | 'Other';
  address?: string;
  latitude: number;
  longitude: number;
  radiusMeters: number; // e.g. 50, 100, 250
  enabled: boolean;
  autoRecordOnArrival: boolean; // Auto start recording upon entering
  autoGenerateMoMOnCompletion: boolean; // Automatically process audio and build Minutes of Meeting (MoM)
  defaultMeetingTitle?: string;
  defaultDepartment?: string;
  color?: string;
  lastArrivedAt?: string;
  arrivalCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserCoordinates {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  altitude?: number | null;
  speed?: number | null;
  heading?: number | null;
  timestamp: number;
}

export interface GeofenceAutoModeConfig {
  isAutoModeEnabled: boolean; // Master ON / OFF switch for Location Auto-Mode
  autoStartDelaySeconds: number; // Countdown before starting recording (e.g. 5s)
  autoStopOnExit: boolean; // Stop recording when stepping out of geofence perimeter
  autoTriggerMoM: boolean; // Immediately trigger AI Minutes generation when recording stops
  audioChimeEnabled: boolean; // Audio chime upon arrival / auto-record launch
  vibrationAlerts: boolean; // Mobile vibration feedback
  minAccuracyMeters: number; // Minimum GPS accuracy required (e.g. 100m)
  highAccuracyGps: boolean; // Enable GPS high accuracy
  notifyOnArrival: boolean; // Toast / notification when geofence entered
  simulationActive: boolean; // Simulated location for testing without moving
}

export interface GeofenceEvaluationResult {
  isInsideAnyGeofence: boolean;
  matchedLocation: GeofenceLocationEntity | null;
  nearestLocation: GeofenceLocationEntity | null;
  distanceToNearestMeters: number | null;
  distanceToMatchedMeters: number | null;
  trackingStatus: GeofenceTrackingStatus;
  currentCoords: UserCoordinates | null;
  statusMessage: string;
}

