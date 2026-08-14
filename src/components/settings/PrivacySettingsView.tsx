import React, { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  Trash2,
  Download,
  Clock,
  FileText,
  Mic,
  Eye,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  RefreshCw,
  Sparkles,
  Search,
  ExternalLink,
  ChevronRight,
  Database,
  Key,
  ShieldAlert,
  Server,
  FileSpreadsheet,
  Layers,
  ArrowLeft,
  X,
  Info,
  Check,
  Ban,
  FileCheck,
  Activity,
  Filter
} from 'lucide-react';
import { usePrivacy } from '../../context/PrivacyContext';
import {
  RetentionOption,
  DownloadPermissionLevel,
  RecordingAccessLevel,
  UserRole,
  AuditEventType,
  ConsentStatus,
  ConsentMethod,
  FullMeetingRecord,
  MeetingEntity
} from '../../types';
import { meetingDb } from '../../utils/meetingDatabase';

interface PrivacySettingsViewProps {
  onNavigate: (route: string) => void;
}

export function PrivacySettingsView({ onNavigate }: PrivacySettingsViewProps) {
  const {
    policy,
    consents,
    auditLogs,
    currentRole,
    currentEmail,
    isLoading,
    setCurrentRole,
    updatePolicy,
    recordConsent,
    revokeConsent,
    deleteConsent,
    logAuditEvent,
    runAutoPurge,
    generateSignedUrl,
    exportMeetingData,
    deleteRecordingOnly,
    deleteTranscriptOnly,
    deleteEntireMeeting,
    refreshConsents,
    refreshAuditLogs,
    refreshPolicy,
  } = usePrivacy();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'notice_consents' | 'retention_policy' | 'permissions_storage' | 'meeting_deletion_export' | 'audit_trail'>('notice_consents');

  // Local form state for policy editing
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [audioRetention, setAudioRetention] = useState<RetentionOption>('30_days');
  const [customAudioDays, setCustomAudioDays] = useState<number>(30);
  const [transcriptRetention, setTranscriptRetention] = useState<RetentionOption>('90_days');
  const [customTranscriptDays, setCustomTranscriptDays] = useState<number>(90);
  const [momRetention, setMomRetention] = useState<RetentionOption>('180_days');
  const [customMomDays, setCustomMomDays] = useState<number>(180);
  const [autoDeleteEnabled, setAutoDeleteEnabled] = useState(true);
  const [downloadPermission, setDownloadPermission] = useState<DownloadPermissionLevel>('organizer_and_admins');
  const [recordingAccess, setRecordingAccess] = useState<RecordingAccessLevel>('meeting_participants');
  const [noticeTemplate, setNoticeTemplate] = useState('');
  const [requireExplicitConsent, setRequireExplicitConsent] = useState(true);
  const [allowVerbalConsent, setAllowVerbalConsent] = useState(true);
  const [allowInAppConsent, setAllowInAppConsent] = useState(true);
  const [privateStorage, setPrivateStorage] = useState(true);
  const [signedUrlTtl, setSignedUrlTtl] = useState(15);
  const [supabaseRls, setSupabaseRls] = useState(true);

  // Meetings list for granular deletion & export
  const [meetings, setMeetings] = useState<FullMeetingRecord[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(false);
  const [meetingSearch, setMeetingSearch] = useState('');

  // Consent Filter & Simulator State
  const [consentSearch, setConsentSearch] = useState('');
  const [consentStatusFilter, setConsentStatusFilter] = useState<string>('ALL');
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [simulatedMeetingId, setSimulatedMeetingId] = useState<string>('');

  // Signed URL Generator State
  const [signedUrlResult, setSignedUrlResult] = useState<any>(null);
  const [generatingSignedUrl, setGeneratingSignedUrl] = useState(false);
  const [selectedMeetingForSignedUrl, setSelectedMeetingForSignedUrl] = useState('');

  // Auto Purge State
  const [purgeScanning, setPurgeScanning] = useState(false);
  const [purgeResult, setPurgeResult] = useState<any>(null);

  // Audit Logs Filter & Modal State
  const [auditSearch, setAuditSearch] = useState('');
  const [auditEventFilter, setAuditEventFilter] = useState<string>('ALL');
  const [selectedAuditLog, setSelectedAuditLog] = useState<any>(null);

  // Action status message
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Populate local form when policy changes
  useEffect(() => {
    if (policy) {
      setAudioRetention(policy.audio_retention_type || '30_days');
      setCustomAudioDays(policy.custom_audio_days || policy.audio_retention_days || 30);
      setTranscriptRetention(policy.transcript_retention_type || '90_days');
      setCustomTranscriptDays(policy.custom_transcript_days || policy.transcript_retention_days || 90);
      setMomRetention(policy.mom_retention_type || '180_days');
      setCustomMomDays(policy.custom_mom_days || policy.mom_retention_days || 180);
      setAutoDeleteEnabled(policy.auto_delete_enabled !== undefined ? policy.auto_delete_enabled : true);
      setDownloadPermission(policy.download_permission_level || 'organizer_and_admins');
      setRecordingAccess(policy.recording_access_level || 'meeting_participants');
      setNoticeTemplate(policy.recording_notice_template || 'This meeting is being transcribed for official Minutes of Meeting generation.');
      setRequireExplicitConsent(policy.require_explicit_consent !== undefined ? policy.require_explicit_consent : true);
      setAllowVerbalConsent(policy.allow_verbal_consent !== undefined ? policy.allow_verbal_consent : true);
      setAllowInAppConsent(policy.allow_in_app_consent !== undefined ? policy.allow_in_app_consent : true);
      setPrivateStorage(policy.private_storage_enabled !== undefined ? policy.private_storage_enabled : true);
      setSignedUrlTtl(policy.signed_url_ttl_minutes || 15);
      setSupabaseRls(policy.supabase_rls_enabled !== undefined ? policy.supabase_rls_enabled : true);
    }
  }, [policy]);

  // Load meetings
  const fetchMeetings = async () => {
    setLoadingMeetings(true);
    try {
      const list = await meetingDb.getMeetings();
      setMeetings(list);
      if (list.length > 0 && !selectedMeetingForSignedUrl) {
        setSelectedMeetingForSignedUrl(list[0].id);
        setSimulatedMeetingId(list[0].id);
      }
    } catch (err) {
      console.error('Failed to load meetings:', err);
    } finally {
      setLoadingMeetings(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleSavePolicy = async () => {
    setSavingPolicy(true);
    setSaveSuccess(false);
    setActionNotice(null);

    const resolveDays = (type: RetentionOption, customVal: number) => {
      switch (type) {
        case '7_days': return 7;
        case '30_days': return 30;
        case '90_days': return 90;
        case '180_days': return 180;
        case 'custom': return Number(customVal) || 30;
      }
    };

    const payload = {
      audio_retention_type: audioRetention,
      audio_retention_days: resolveDays(audioRetention, customAudioDays),
      custom_audio_days: customAudioDays,
      transcript_retention_type: transcriptRetention,
      transcript_retention_days: resolveDays(transcriptRetention, customTranscriptDays),
      custom_transcript_days: customTranscriptDays,
      mom_retention_type: momRetention,
      mom_retention_days: resolveDays(momRetention, customMomDays),
      custom_mom_days: customMomDays,
      auto_delete_enabled: autoDeleteEnabled,
      download_permission_level: downloadPermission,
      recording_access_level: recordingAccess,
      recording_notice_template: noticeTemplate,
      require_explicit_consent: requireExplicitConsent,
      allow_verbal_consent: allowVerbalConsent,
      allow_in_app_consent: allowInAppConsent,
      private_storage_enabled: privateStorage,
      signed_url_ttl_minutes: Number(signedUrlTtl) || 15,
      supabase_rls_enabled: supabaseRls,
    };

    const res = await updatePolicy(payload);
    setSavingPolicy(false);
    if (res) {
      setSaveSuccess(true);
      setActionNotice({ type: 'success', text: 'Privacy & Retention policy successfully updated and logged to audit trail.' });
      setTimeout(() => setSaveSuccess(false), 4000);
    } else {
      setActionNotice({ type: 'error', text: 'Failed to update privacy policy.' });
    }
  };

  // Helper for quick retention days
  const retentionOptions: { value: RetentionOption; label: string }[] = [
    { value: '7_days', label: '7 Days' },
    { value: '30_days', label: '30 Days' },
    { value: '90_days', label: '90 Days' },
    { value: '180_days', label: '180 Days' },
    { value: 'custom', label: 'Custom' },
  ];

  // Consent simulator grant handler
  const handleSimulateConsent = async (status: ConsentStatus, method: ConsentMethod) => {
    const meeting = meetings.find((m) => m.id === simulatedMeetingId) || meetings[0];
    const res = await recordConsent({
      meeting_id: meeting?.id || 'mtg-simulated',
      meeting_title: meeting?.title || 'Simulated Meeting',
      participant_email: currentEmail,
      participant_name: currentEmail.split('@')[0],
      consent_status: status,
      consent_method: method,
      notice_acknowledged: true,
      org_id: 'org-default-enterprise',
    });

    setIsConsentModalOpen(false);
    if (res) {
      setActionNotice({
        type: 'success',
        text: `Consent recorded as ${status} (${method}) for ${currentEmail}. Audit log created.`,
      });
    }
  };

  // Run Auto Purge
  const handleRunPurge = async (dryRun: boolean) => {
    setPurgeScanning(true);
    setActionNotice(null);
    const res = await runAutoPurge(dryRun);
    setPurgeScanning(false);
    if (res) {
      setPurgeResult(res);
      if (!dryRun) {
        await fetchMeetings();
        setActionNotice({
          type: 'success',
          text: `Auto-purge executed: ${res.purgedRecordings} recordings, ${res.purgedTranscripts} transcripts, and ${res.purgedMeetings} meetings purged.`,
        });
      }
    }
  };

  // Request Signed URL
  const handleGenerateSignedUrl = async () => {
    if (!selectedMeetingForSignedUrl) return;
    setGeneratingSignedUrl(true);
    const res = await generateSignedUrl(undefined, selectedMeetingForSignedUrl);
    setGeneratingSignedUrl(false);
    if (res) {
      setSignedUrlResult(res);
    }
  };

  // Granular Deletion Handlers
  const handleDeleteRec = async (meetingId: string, title: string) => {
    if (!confirm(`Delete audio recording for "${title}"? Transcripts and Minutes of Meeting will be safely preserved.`)) return;
    const res = await deleteRecordingOnly(meetingId);
    if (res.success) {
      await fetchMeetings();
      setActionNotice({ type: 'success', text: `Audio recording deleted for "${title}". Transcripts and MoM preserved.` });
    }
  };

  const handleDeleteTranscript = async (meetingId: string, title: string) => {
    if (!confirm(`Delete transcript for "${title}"? Minutes of Meeting and action items will remain intact.`)) return;
    const res = await deleteTranscriptOnly(meetingId);
    if (res.success) {
      await fetchMeetings();
      setActionNotice({ type: 'success', text: `Transcript deleted for "${title}". Meeting summary and decisions preserved.` });
    }
  };

  const handleDeleteMeeting = async (meetingId: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete meeting "${title}" and all associated data? This action is irreversible.`)) return;
    const success = await deleteEntireMeeting(meetingId);
    if (success) {
      await fetchMeetings();
      setActionNotice({ type: 'success', text: `Meeting "${title}" and all records permanently removed.` });
    }
  };

  // Export handler
  const handleExportData = async (meetingId?: string) => {
    const data = await exportMeetingData(meetingId);
    if (data) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `VoiceMoM-Compliance-Export-${meetingId || 'Full-Org'}-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setActionNotice({ type: 'success', text: 'GDPR / DPDP Compliance Data Package successfully generated and downloaded.' });
    }
  };

  // Filtered consents
  const filteredConsents = consents.filter((c) => {
    const matchSearch =
      c.participant_email.toLowerCase().includes(consentSearch.toLowerCase()) ||
      c.participant_name.toLowerCase().includes(consentSearch.toLowerCase()) ||
      (c.meeting_title && c.meeting_title.toLowerCase().includes(consentSearch.toLowerCase())) ||
      c.ip_address.includes(consentSearch);
    const matchStatus = consentStatusFilter === 'ALL' || c.consent_status === consentStatusFilter;
    return matchSearch && matchStatus;
  });

  // Filtered audit logs
  const filteredAuditLogs = auditLogs.filter((l) => {
    const matchSearch =
      l.event_type.toLowerCase().includes(auditSearch.toLowerCase()) ||
      l.user_email.toLowerCase().includes(auditSearch.toLowerCase()) ||
      (l.target_title && l.target_title.toLowerCase().includes(auditSearch.toLowerCase())) ||
      JSON.stringify(l.details).toLowerCase().includes(auditSearch.toLowerCase());
    const matchEvent = auditEventFilter === 'ALL' || l.event_type === auditEventFilter;
    return matchSearch && matchEvent;
  });

  // Filtered meetings
  const filteredMeetings = meetings.filter((m) => {
    const q = meetingSearch.toLowerCase();
    return (
      m.title.toLowerCase().includes(q) ||
      m.organizer.toLowerCase().includes(q) ||
      m.department.toLowerCase().includes(q) ||
      m.project.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header & Context */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-start gap-3.5">
          <button
            onClick={() => onNavigate('/meetings')}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer mt-0.5"
            title="Back to Meetings"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Privacy, Security & Data Governance
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <Shield className="w-3 h-3" />
                GDPR & DPDP Ready
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Configure strict recording notices, participant consent tracking, granular retention lifecycles, and cryptographic signed storage.
            </p>
          </div>
        </div>

        {/* Role & Org Context Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <Server className="w-3.5 h-3.5 text-indigo-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">Org:</span>
            <span className="font-mono text-slate-900 dark:text-white font-bold">org-default-enterprise</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs">
            <Key className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="font-bold text-indigo-900 dark:text-indigo-200">Role:</span>
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value as UserRole)}
              className="bg-transparent font-bold text-indigo-700 dark:text-indigo-300 outline-none cursor-pointer"
            >
              <option value="admin">Admin (Full Control)</option>
              <option value="compliance_officer">Compliance Officer</option>
              <option value="organizer">Meeting Organizer</option>
              <option value="participant">Participant</option>
              <option value="viewer">Viewer (Read-Only)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Strict Privacy Non-Negotiable Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-blue-500/10 border border-emerald-500/20 dark:border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500 text-white flex-shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              Privacy Architecture Guarantee
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 font-bold">
                Zero Covert Recording
              </span>
            </h4>
            <p className="text-slate-600 dark:text-slate-300 mt-0.5">
              Audio is captured <strong>only after explicit affirmative user consent</strong>. No hidden background microphones, no covert surveillance, and no bypassing browser/OS security boundaries.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsConsentModalOpen(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer flex-shrink-0"
        >
          <UserCheck className="w-3.5 h-3.5" />
          Test Consent Dialog
        </button>
      </div>

      {/* Action Notification Alert */}
      {actionNotice && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between gap-2 shadow-xs transition-all ${
            actionNotice.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionNotice.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
            <span className="font-semibold">{actionNotice.text}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl overflow-x-auto text-xs font-bold border border-slate-200 dark:border-slate-750">
        <button
          onClick={() => setActiveTab('notice_consents')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
            activeTab === 'notice_consents'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Notice & Consent Tracking</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {consents.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('retention_policy')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
            activeTab === 'retention_policy'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Retention & Auto Deletion</span>
        </button>

        <button
          onClick={() => setActiveTab('permissions_storage')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
            activeTab === 'permissions_storage'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Permissions & Storage</span>
        </button>

        <button
          onClick={() => setActiveTab('meeting_deletion_export')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
            activeTab === 'meeting_deletion_export'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Trash2 className="w-4 h-4" />
          <span>Granular Deletion & Export</span>
        </button>

        <button
          onClick={() => setActiveTab('audit_trail')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
            activeTab === 'audit_trail'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Audit Logs</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {auditLogs.length}
          </span>
        </button>
      </div>

      {/* TAB 1: RECORDING NOTICE & CONSENT TRACKING */}
      {activeTab === 'notice_consents' && (
        <div className="space-y-6">
          {/* Notice Template & Enforcement Options */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    Recording Notice Announcement Template
                  </h3>
                </div>
                <button
                  onClick={handleSavePolicy}
                  disabled={savingPolicy}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {savingPolicy ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Save Policy
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                This notice is displayed to all meeting participants before microphone activation or recording commences.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Notice Text
                </label>
                <textarea
                  value={noticeTemplate}
                  onChange={(e) => setNoticeTemplate(e.target.value)}
                  rows={4}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
                  placeholder="Enter standard recording notice..."
                />
              </div>

              {/* Live Preview Box */}
              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
                <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
                  Live Participant Preview
                </span>
                <p className="text-slate-700 dark:text-slate-300 mt-1 italic leading-relaxed">
                  "{noticeTemplate}"
                </p>
              </div>
            </div>

            {/* Consent Requirements & Rules */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Consent Verification
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requireExplicitConsent}
                    onChange={(e) => setRequireExplicitConsent(e.target.checked)}
                    className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      Require Explicit Consent
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                      Microphone capture remains blocked until affirmative opt-in.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowInAppConsent}
                    onChange={(e) => setAllowInAppConsent(e.target.checked)}
                    className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      In-App Interactive Modal
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                      Present clear clickable terms and opt-in modal before recording.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowVerbalConsent}
                    onChange={(e) => setAllowVerbalConsent(e.target.checked)}
                    className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      Verbal Consent Logging
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                      Allow verbal roll-call acknowledgment with meeting timestamp.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Consents Database Table */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    Participant Consents Register (`consents`)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Cryptographic audit trail of participant acknowledgments, IP addresses, and consent timestamps.
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={consentSearch}
                    onChange={(e) => setConsentSearch(e.target.value)}
                    placeholder="Search participant or IP..."
                    className="text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <select
                  value={consentStatusFilter}
                  onChange={(e) => setConsentStatusFilter(e.target.value)}
                  className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="GRANTED">Granted</option>
                  <option value="REVOKED">Revoked</option>
                  <option value="DECLINED">Declined</option>
                </select>

                <button
                  onClick={refreshConsents}
                  className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer"
                  title="Refresh consents"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Participant</th>
                    <th className="py-2.5 px-3">Meeting</th>
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">IP & Client</th>
                    <th className="py-2.5 px-3">Consented At</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredConsents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                        No participant consent records found.
                      </td>
                    </tr>
                  ) : (
                    filteredConsents.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                        <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                          <div>{c.participant_name}</div>
                          <div className="text-[11px] text-slate-400 font-normal">{c.participant_email}</div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 font-medium max-w-[180px] truncate">
                          {c.meeting_title || c.meeting_id}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800">
                            {c.consent_method}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              c.consent_status === 'GRANTED'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                            }`}
                          >
                            {c.consent_status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                          <div>{c.ip_address}</div>
                          <div className="text-[9px] truncate max-w-[120px]">{c.user_agent}</div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap">
                          {new Date(c.consented_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {c.consent_status === 'GRANTED' ? (
                              <button
                                onClick={() => revokeConsent(c.id)}
                                className="px-2 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-[11px] font-bold transition cursor-pointer"
                              >
                                Revoke
                              </button>
                            ) : (
                              <button
                                onClick={() => recordConsent({ ...c, consent_status: 'GRANTED' })}
                                className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-[11px] font-bold transition cursor-pointer"
                              >
                                Re-grant
                              </button>
                            )}
                            <button
                              onClick={() => deleteConsent(c.id)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition cursor-pointer"
                              title="Delete record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RETENTION POLICIES & AUTO DELETION */}
      {activeTab === 'retention_policy' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  Granular Retention Policies (`retention_policies`)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Set independent lifecycle retention periods for Audio recordings, Transcripts, and Minutes of Meeting.
                </p>
              </div>

              <button
                onClick={handleSavePolicy}
                disabled={savingPolicy}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {savingPolicy ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Save Retention Policy
              </button>
            </div>

            {/* Retention Matrix Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* 1. Audio Retention */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">Audio Recording Retention</h4>
                    <span className="text-[11px] text-slate-500">Raw voice waveforms & audio blobs</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  {retentionOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition ${
                        audioRetention === opt.value
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 font-bold text-indigo-900 dark:text-indigo-200'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{opt.label}</span>
                      <input
                        type="radio"
                        name="audio_retention"
                        value={opt.value}
                        checked={audioRetention === opt.value}
                        onChange={() => setAudioRetention(opt.value)}
                        className="text-indigo-600"
                      />
                    </label>
                  ))}

                  {audioRetention === 'custom' && (
                    <div className="pt-2 flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={3650}
                        value={customAudioDays}
                        onChange={(e) => setCustomAudioDays(Number(e.target.value))}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        placeholder="Days (e.g. 45)"
                      />
                      <span className="text-xs text-slate-500 font-bold">Days</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Transcript Retention */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">Transcript Retention</h4>
                    <span className="text-[11px] text-slate-500">Speech-to-text text segments</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  {retentionOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition ${
                        transcriptRetention === opt.value
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 font-bold text-indigo-900 dark:text-indigo-200'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{opt.label}</span>
                      <input
                        type="radio"
                        name="transcript_retention"
                        value={opt.value}
                        checked={transcriptRetention === opt.value}
                        onChange={() => setTranscriptRetention(opt.value)}
                        className="text-indigo-600"
                      />
                    </label>
                  ))}

                  {transcriptRetention === 'custom' && (
                    <div className="pt-2 flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={3650}
                        value={customTranscriptDays}
                        onChange={(e) => setCustomTranscriptDays(Number(e.target.value))}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        placeholder="Days (e.g. 60)"
                      />
                      <span className="text-xs text-slate-500 font-bold">Days</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. MoM Retention */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">Minutes of Meeting (MoM)</h4>
                    <span className="text-[11px] text-slate-500">Executive summaries & Action Items</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  {retentionOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition ${
                        momRetention === opt.value
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 font-bold text-indigo-900 dark:text-indigo-200'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{opt.label}</span>
                      <input
                        type="radio"
                        name="mom_retention"
                        value={opt.value}
                        checked={momRetention === opt.value}
                        onChange={() => setMomRetention(opt.value)}
                        className="text-indigo-600"
                      />
                    </label>
                  ))}

                  {momRetention === 'custom' && (
                    <div className="pt-2 flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={3650}
                        value={customMomDays}
                        onChange={(e) => setCustomMomDays(Number(e.target.value))}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        placeholder="Days (e.g. 365)"
                      />
                      <span className="text-xs text-slate-500 font-bold">Days</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Auto Deletion Engine Controls */}
            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="auto-delete-toggle"
                    checked={autoDeleteEnabled}
                    onChange={(e) => setAutoDeleteEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="auto-delete-toggle" className="font-extrabold text-slate-900 dark:text-white text-xs cursor-pointer">
                    Enable Automated Lifecycle Purge
                  </label>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 ml-6">
                  Automatically purges recordings older than audio retention, transcripts older than transcript retention, and full records exceeding MoM threshold.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRunPurge(true)}
                  disabled={purgeScanning}
                  className="px-3 py-1.5 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 font-bold text-xs hover:bg-indigo-50 transition cursor-pointer disabled:opacity-50"
                >
                  {purgeScanning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Run Dry-Run Scan'}
                </button>

                <button
                  onClick={() => handleRunPurge(false)}
                  disabled={purgeScanning}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Execute Auto-Purge Now
                </button>
              </div>
            </div>

            {/* Dry run scan output if present */}
            {purgeResult && (
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs space-y-2 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">
                  {purgeResult.dryRun ? 'Dry-Run Evaluation Report' : 'Auto-Purge Execution Result'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-800 dark:text-slate-200">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <div className="text-slate-400 text-[11px]">Recordings to Purge</div>
                    <div className="text-base font-extrabold text-rose-600">{purgeResult.purgedRecordings}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <div className="text-slate-400 text-[11px]">Transcripts to Purge</div>
                    <div className="text-base font-extrabold text-amber-600">{purgeResult.purgedTranscripts}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <div className="text-slate-400 text-[11px]">Meetings to Purge</div>
                    <div className="text-base font-extrabold text-blue-600">{purgeResult.purgedMeetings}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PERMISSIONS & STORAGE */}
      {activeTab === 'permissions_storage' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Access & Download Permissions */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    Access & Download Permissions
                  </h3>
                </div>
                <button
                  onClick={handleSavePolicy}
                  disabled={savingPolicy}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Download Permissions (Audio & PDF Exports)
                  </label>
                  <select
                    value={downloadPermission}
                    onChange={(e) => setDownloadPermission(e.target.value as DownloadPermissionLevel)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="all_participants">All Meeting Participants</option>
                    <option value="organizer_and_admins">Organizer & Admins Only</option>
                    <option value="admins_only">Admins Only</option>
                    <option value="compliance_only">Compliance Officers Only</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Recording Audio Access Level
                  </label>
                  <select
                    value={recordingAccess}
                    onChange={(e) => setRecordingAccess(e.target.value as RecordingAccessLevel)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="private_organizer">Private to Meeting Organizer</option>
                    <option value="meeting_participants">Meeting Participants Only</option>
                    <option value="company_internal">Company Internal (All Authenticated)</option>
                    <option value="restricted_roles">Restricted Roles (Admin & Compliance)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Private Storage & Signed URL Generator */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Private Cloud Storage & Signed URLs
                </h3>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Audio recordings reside in private storage buckets. Public access is disabled. Playback strictly requires a time-limited signed URL token with automatic audit logging (`AUDIO_ACCESSED`).
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Signed URL Expiration TTL (Minutes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={signedUrlTtl}
                    onChange={(e) => setSignedUrlTtl(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-xs"
                  />
                </div>

                {/* Generator Simulator */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">
                    Interactive Signed URL Request Tester
                  </span>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedMeetingForSignedUrl}
                      onChange={(e) => setSelectedMeetingForSignedUrl(e.target.value)}
                      className="flex-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                    >
                      {meetings.map((m) => (
                        <option key={m.id} value={m.id}>{m.title}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleGenerateSignedUrl}
                      disabled={generatingSignedUrl}
                      className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer disabled:opacity-50"
                    >
                      {generatingSignedUrl ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Generate Token'}
                    </button>
                  </div>

                  {signedUrlResult && (
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-mono space-y-1 break-all">
                      <div className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Signed Token Active (Expires in {signedUrlResult.expiresInSeconds}s)</div>
                      <div className="text-slate-500">{signedUrlResult.signedUrl}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Supabase Row Level Security (RLS) SQL Architecture */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Supabase Row Level Security (RLS) Policies
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                RLS ENABLED
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Multi-tenant company isolation and role restrictions enforced at the PostgreSQL database engine level:
            </p>

            <pre className="p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
{`-- Supabase PostgreSQL Row Level Security (RLS) Policies
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcript_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Company Multi-Tenant Isolation
CREATE POLICY "Company Multi-Tenant Isolation" ON meetings
  FOR ALL USING (org_id = auth.jwt() ->> 'org_id');

-- 2. Recording Access Policy
CREATE POLICY "Recording Read Access" ON recordings
  FOR SELECT USING (
    org_id = auth.jwt() ->> 'org_id' AND (
      auth.jwt() ->> 'role' IN ('admin', 'compliance_officer') OR
      meeting_id IN (SELECT id FROM meetings WHERE organizer_email = auth.jwt() ->> 'email')
    )
  );

-- 3. Immutable Audit Trail Insert Only
CREATE POLICY "Audit Trail Append Only" ON audit_logs
  FOR INSERT WITH CHECK (org_id = auth.jwt() ->> 'org_id');`}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 4: GRANULAR DELETION & DATA EXPORT */}
      {activeTab === 'meeting_deletion_export' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-rose-600" />
                  Granular Meeting Data Deletion & GDPR Export
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Selectively wipe audio recordings, transcripts, or entire meetings while maintaining compliance audit logs.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportData()}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Full Org Archive
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={meetingSearch}
                onChange={(e) => setMeetingSearch(e.target.value)}
                placeholder="Search meeting title, organizer, or department..."
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Meetings Cards Grid */}
            <div className="grid grid-cols-1 gap-3.5">
              {filteredMeetings.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No matching meetings found.
                </div>
              ) : (
                filteredMeetings.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                          {m.title}
                        </h4>
                        <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {m.department}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span>Organizer: <strong>{m.organizer}</strong></span>
                        <span>•</span>
                        <span>Date: <strong>{m.date}</strong></span>
                        <span>•</span>
                        <span>Status: <strong>{m.status}</strong></span>
                      </div>
                    </div>

                    {/* Granular Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Delete Recording only */}
                      <button
                        onClick={() => handleDeleteRec(m.id, m.title)}
                        className="px-2.5 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        title="Delete audio file only, preserving transcript & MoM"
                      >
                        <Mic className="w-3 h-3 text-amber-600" />
                        Delete Audio
                      </button>

                      {/* Delete Transcript only */}
                      <button
                        onClick={() => handleDeleteTranscript(m.id, m.title)}
                        className="px-2.5 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        title="Delete transcript only, preserving MoM summary"
                      >
                        <FileText className="w-3 h-3 text-amber-600" />
                        Delete Transcript
                      </button>

                      {/* Export Data */}
                      <button
                        onClick={() => handleExportData(m.id)}
                        className="px-2.5 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        title="Download GDPR-compliant JSON Data Package"
                      >
                        <Download className="w-3 h-3 text-indigo-600" />
                        Export
                      </button>

                      {/* Delete Entire Meeting */}
                      <button
                        onClick={() => handleDeleteMeeting(m.id, m.title)}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer"
                        title="Permanently remove entire meeting"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete Meeting
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: IMMUTABLE AUDIT TRAIL */}
      {activeTab === 'audit_trail' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  Immutable Security Audit Trail (`audit_logs`)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Append-only compliance log tracking recordings, audio access, transcript generation, PDF downloads, and deletions.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(auditLogs, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `VoiceMoM-AuditTrail-${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Audit JSON
                </button>
                <button
                  onClick={refreshAuditLogs}
                  className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  placeholder="Search event type, user, or details..."
                  className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <select
                value={auditEventFilter}
                onChange={(e) => setAuditEventFilter(e.target.value)}
                className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
              >
                <option value="ALL">All Event Types</option>
                <option value="RECORDING_STARTED">Recording Started</option>
                <option value="RECORDING_STOPPED">Recording Stopped</option>
                <option value="TRANSCRIPT_GENERATED">Transcript Generated</option>
                <option value="MINUTES_GENERATED">Minutes Generated</option>
                <option value="AUDIO_ACCESSED">Audio Accessed</option>
                <option value="PDF_DOWNLOADED">PDF Downloaded</option>
                <option value="MEETING_DELETED">Meeting Deleted</option>
                <option value="RECORDING_DELETED">Recording Deleted</option>
                <option value="TRANSCRIPT_DELETED">Transcript Deleted</option>
                <option value="CONSENT_RECORDED">Consent Recorded</option>
                <option value="CONSENT_REVOKED">Consent Revoked</option>
                <option value="RETENTION_POLICY_UPDATED">Policy Updated</option>
                <option value="AUTO_PURGE_EXECUTED">Auto Purge Executed</option>
                <option value="DATA_EXPORTED">Data Exported</option>
              </select>
            </div>

            {/* Audit Logs Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Event Type</th>
                    <th className="py-2.5 px-3">Target</th>
                    <th className="py-2.5 px-3">Actor / Role</th>
                    <th className="py-2.5 px-3">IP Address</th>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                        No audit events match current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-slate-200 dark:border-slate-700">
                            {log.event_type}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white max-w-[180px] truncate">
                          {log.target_title || log.target_id}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                          <div>{log.user_email}</div>
                          <div className="text-[10px] text-slate-400 font-mono uppercase">{log.user_role}</div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                          {log.ip_address}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => setSelectedAuditLog(log)}
                            className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[11px] transition cursor-pointer"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Interactive Participant Consent Dialog Simulator */}
      {isConsentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 max-w-lg w-full rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5" />
                <h3 className="font-extrabold text-base">Meeting Recording & Privacy Notice</h3>
              </div>
              <button
                onClick={() => setIsConsentModalOpen(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notice Body */}
            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 leading-relaxed space-y-2">
                <p className="font-semibold text-slate-900 dark:text-white">
                  "{noticeTemplate}"
                </p>
                <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-1 text-[11px]">
                  <li>Audio will be stored in private encrypted storage (AES-256).</li>
                  <li>Retention policy: Audio kept for {audioRetention === 'custom' ? customAudioDays : audioRetention.replace('_', ' ')}.</li>
                  <li>You may request data deletion or revoke consent at any time.</li>
                </ul>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Signing in as: <strong>{currentEmail}</strong> (IP: 192.168.1.104)
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-750 flex items-center justify-end gap-2 text-xs font-bold">
              <button
                onClick={() => handleSimulateConsent('DECLINED', 'IN_APP_MODAL')}
                className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
              >
                Decline
              </button>
              <button
                onClick={() => handleSimulateConsent('GRANTED', 'VERBAL')}
                className="px-3.5 py-2 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 cursor-pointer"
              >
                Verbal Opt-in
              </button>
              <button
                onClick={() => handleSimulateConsent('GRANTED', 'IN_APP_MODAL')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer"
              >
                Affirmative Consent & Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Audit Log JSON Inspector */}
      {selectedAuditLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 max-w-xl w-full rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Audit Log Details: {selectedAuditLog.event_type}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAuditLog(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <span className="text-slate-400 block">Log ID</span>
                  <span className="font-mono text-slate-900 dark:text-white font-bold">{selectedAuditLog.id}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <span className="text-slate-400 block">Actor Email</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedAuditLog.user_email} ({selectedAuditLog.user_role})</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Event Details & Payload
                </span>
                <pre className="p-3 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
                  {JSON.stringify(selectedAuditLog, null, 2)}
                </pre>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 text-right">
              <button
                onClick={() => setSelectedAuditLog(null)}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
