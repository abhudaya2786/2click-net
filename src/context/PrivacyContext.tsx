import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  RetentionPolicyEntity,
  ConsentEntity,
  AuditLogEntity,
  UserRole,
  AuditEventType,
  SignedUrlResponse,
  AutoPurgeResult,
} from '../types';
import { meetingDb } from '../utils/meetingDatabase';

interface PrivacyContextType {
  policy: RetentionPolicyEntity | null;
  consents: ConsentEntity[];
  auditLogs: AuditLogEntity[];
  currentRole: UserRole;
  currentEmail: string;
  isLoading: boolean;
  setCurrentRole: (role: UserRole) => void;
  setCurrentEmail: (email: string) => void;
  updatePolicy: (updates: Partial<RetentionPolicyEntity>) => Promise<RetentionPolicyEntity | null>;
  recordConsent: (consent: Partial<ConsentEntity>) => Promise<ConsentEntity | null>;
  revokeConsent: (id: string) => Promise<ConsentEntity | null>;
  deleteConsent: (id: string) => Promise<boolean>;
  logAuditEvent: (event: {
    event_type: AuditEventType;
    target_type?: 'meeting' | 'recording' | 'transcript' | 'minutes' | 'consent' | 'policy' | 'system';
    target_id?: string;
    target_title?: string;
    details?: Record<string, any>;
  }) => Promise<AuditLogEntity | null>;
  runAutoPurge: (dryRun?: boolean) => Promise<AutoPurgeResult | null>;
  generateSignedUrl: (recordingId?: string, meetingId?: string) => Promise<SignedUrlResponse | null>;
  exportMeetingData: (meetingId?: string) => Promise<any>;
  deleteRecordingOnly: (meetingId: string) => Promise<{ success: boolean; message: string; deletedCount: number }>;
  deleteTranscriptOnly: (meetingId: string) => Promise<{ success: boolean; message: string; deletedCount: number }>;
  deleteEntireMeeting: (meetingId: string) => Promise<boolean>;
  refreshConsents: () => Promise<void>;
  refreshAuditLogs: () => Promise<void>;
  refreshPolicy: () => Promise<void>;
}

const PrivacyContext = createContext<PrivacyContextType | null>(null);

export function PrivacyProvider({ children }: { children: React.ReactNode }) {
  const [policy, setPolicy] = useState<RetentionPolicyEntity | null>(null);
  const [consents, setConsents] = useState<ConsentEntity[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntity[]>([]);
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [currentEmail, setCurrentEmail] = useState<string>('shrinet.info@gmail.com');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshPolicy = useCallback(async () => {
    try {
      const pol = await meetingDb.getRetentionPolicy();
      if (pol) setPolicy(pol);
    } catch (err) {
      console.error('Failed to fetch privacy policy:', err);
    }
  }, []);

  const refreshConsents = useCallback(async () => {
    try {
      const list = await meetingDb.getConsents();
      setConsents(list);
    } catch (err) {
      console.error('Failed to fetch consents:', err);
    }
  }, []);

  const refreshAuditLogs = useCallback(async () => {
    try {
      const list = await meetingDb.getAuditLogs({ limit: 200 });
      setAuditLogs(list);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([refreshPolicy(), refreshConsents(), refreshAuditLogs()]);
      setIsLoading(false);
    };
    init();
  }, [refreshPolicy, refreshConsents, refreshAuditLogs]);

  const updatePolicy = async (updates: Partial<RetentionPolicyEntity>) => {
    try {
      const updated = await meetingDb.updateRetentionPolicy(updates);
      if (updated) {
        setPolicy(updated);
        await refreshAuditLogs();
        return updated;
      }
    } catch (err) {
      console.error('Failed to update retention policy:', err);
    }
    return null;
  };

  const recordConsent = async (consentData: Partial<ConsentEntity>) => {
    try {
      const res = await meetingDb.recordConsent(consentData);
      if (res) {
        await refreshConsents();
        await refreshAuditLogs();
        return res;
      }
    } catch (err) {
      console.error('Failed to record consent:', err);
    }
    return null;
  };

  const revokeConsent = async (id: string) => {
    try {
      const res = await meetingDb.updateConsent(id, { consent_status: 'REVOKED' });
      if (res) {
        await refreshConsents();
        await refreshAuditLogs();
        return res;
      }
    } catch (err) {
      console.error('Failed to revoke consent:', err);
    }
    return null;
  };

  const deleteConsent = async (id: string) => {
    try {
      const res = await fetch(`/api/consents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await refreshConsents();
        return true;
      }
    } catch (err) {
      console.error('Failed to delete consent:', err);
    }
    return false;
  };

  const logAuditEvent = async (event: {
    event_type: AuditEventType;
    target_type?: 'meeting' | 'recording' | 'transcript' | 'minutes' | 'consent' | 'policy' | 'system';
    target_id?: string;
    target_title?: string;
    details?: Record<string, any>;
  }) => {
    try {
      const res = await meetingDb.logAuditEvent({
        ...event,
        user_email: currentEmail,
        user_role: currentRole,
      });
      if (res) {
        await refreshAuditLogs();
        return res;
      }
    } catch (err) {
      console.error('Failed to log audit event:', err);
    }
    return null;
  };

  const runAutoPurge = async (dryRun: boolean = false): Promise<AutoPurgeResult | null> => {
    try {
      const res = await meetingDb.executeAutoPurge(dryRun);
      if (res && res.result) {
        if (!dryRun) {
          await refreshAuditLogs();
        }
        return res.result;
      }
    } catch (err) {
      console.error('Failed to run auto purge:', err);
    }
    return null;
  };

  const generateSignedUrl = async (recordingId?: string, meetingId?: string): Promise<SignedUrlResponse | null> => {
    try {
      const res = await meetingDb.requestSignedUrl(recordingId, meetingId, currentRole, currentEmail);
      if (res && res.success) {
        await refreshAuditLogs();
        return res;
      }
    } catch (err) {
      console.error('Failed to generate signed url:', err);
    }
    return null;
  };

  const exportMeetingData = async (meetingId?: string) => {
    try {
      const data = await meetingDb.exportMeetingData(meetingId, currentEmail);
      if (data) {
        await refreshAuditLogs();
        return data;
      }
    } catch (err) {
      console.error('Failed to export meeting data:', err);
    }
    return null;
  };

  const deleteRecordingOnly = async (meetingId: string) => {
    try {
      const res = await meetingDb.deleteMeetingRecording(meetingId);
      await refreshAuditLogs();
      return res;
    } catch (err) {
      console.error('Failed to delete recording:', err);
      return { success: false, message: 'Failed to delete recording', deletedCount: 0 };
    }
  };

  const deleteTranscriptOnly = async (meetingId: string) => {
    try {
      const res = await meetingDb.deleteMeetingTranscript(meetingId);
      await refreshAuditLogs();
      return res;
    } catch (err) {
      console.error('Failed to delete transcript:', err);
      return { success: false, message: 'Failed to delete transcript', deletedCount: 0 };
    }
  };

  const deleteEntireMeeting = async (meetingId: string) => {
    try {
      const success = await meetingDb.deleteMeeting(meetingId);
      await refreshAuditLogs();
      await refreshConsents();
      return success;
    } catch (err) {
      console.error('Failed to delete meeting:', err);
      return false;
    }
  };

  return (
    <PrivacyContext.Provider
      value={{
        policy,
        consents,
        auditLogs,
        currentRole,
        currentEmail,
        isLoading,
        setCurrentRole,
        setCurrentEmail,
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
      }}
    >
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  const ctx = useContext(PrivacyContext);
  if (!ctx) {
    throw new Error('usePrivacy must be used within a PrivacyProvider');
  }
  return ctx;
}
