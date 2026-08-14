import { MeetingData } from '../types';

export const SAMPLE_MEETINGS: MeetingData[] = [
  {
    id: 'sample-1',
    title: 'Q3 Product Architecture & Mobile App Launch Sync',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    meetingDate: 'Today, 2:30 PM',
    duration: '24 mins 18 secs',
    meetingType: 'Sprint Planning & Architecture',
    languageDetected: 'Hinglish / English (Mixed)',
    sentiment: 'Highly Collaborative & Productive',
    participants: ['Rahul Sharma (Lead Architect)', 'Priya Mehta (Product Manager)', 'Vikram Singh (Backend Dev)', 'Ananya Roy (UI/UX)'],
    executiveSummary: 'The team finalized the Q3 mobile app release roadmap. Key decisions were made to prioritize offline caching, integrate Firebase for real-time notifications, and finalize the payment gateway integration by Friday. Rahul will lead the load testing, while Ananya submits the revised design tokens.',
    keyTopics: [
      {
        topic: 'Offline-First Architecture & Sync Strategy',
        summary: 'Discussion on how the mobile app should handle weak 4G/5G connections in tier-2/3 cities.',
        keyPoints: [
          'Agreed to use local SQLite/WatermelonDB with background delta-sync.',
          'Vikram raised concern on conflict resolution when multiple devices sync simultaneously.',
          'Decided on Last-Write-Wins (LWW) with server timestamp verification.'
        ],
        speakersInvolved: ['Rahul Sharma', 'Vikram Singh']
      },
      {
        topic: 'Payment Gateway Integration & UPI Deep-Linking',
        summary: 'Reviewing Razorpay vs Stripe fee structures and checkout drop-off rates.',
        keyPoints: [
          'Razorpay chosen for Indian domestic UPI intent flows.',
          'Priya highlighted that UPI autopay mandate is required for recurring subscriptions.',
          'Sandbox credentials already configured in staging environment.'
        ],
        speakersInvolved: ['Priya Mehta', 'Rahul Sharma']
      },
      {
        topic: 'Design System & Accessibility Audits',
        summary: 'Final review of color contrast ratios and dark mode tokens.',
        keyPoints: [
          'WCAG AA compliance verified on all primary transaction screens.',
          'New typography hierarchy scales smoothly across Android & iOS.'
        ],
        speakersInvolved: ['Ananya Roy', 'Priya Mehta']
      }
    ],
    decisions: [
      'Approved offline-first caching policy with 48-hour local retention.',
      'Selected Razorpay UPI Intent SDK for primary Indian checkout flows.',
      'Hard code freeze for Beta release scheduled for next Tuesday at 6:00 PM.'
    ],
    actionItems: [
      {
        id: 'task-101',
        task: 'Implement background sync worker for offline queue in React Native',
        owner: 'Vikram Singh',
        priority: 'High',
        deadline: 'This Friday, 5 PM',
        status: 'In Progress'
      },
      {
        id: 'task-102',
        task: 'Conduct load testing for 10,000 concurrent socket connections on staging',
        owner: 'Rahul Sharma',
        priority: 'High',
        deadline: 'Monday, 2 PM',
        status: 'Pending'
      },
      {
        id: 'task-103',
        task: 'Deliver finalized SVG icon set and Dark Mode Figma tokens to developers',
        owner: 'Ananya Roy',
        priority: 'Medium',
        deadline: 'Tomorrow, 12 PM',
        status: 'Completed'
      },
      {
        id: 'task-104',
        task: 'Draft beta user onboarding documentation and feedback survey',
        owner: 'Priya Mehta',
        priority: 'Low',
        deadline: 'Next Wednesday',
        status: 'Pending'
      }
    ],
    risksAndBlockers: [
      'Apple App Store review guidelines might take up to 48 hours for crypto/payment compliance.',
      'Third-party SMS OTP gateway latency during peak evening traffic.'
    ],
    openQuestions: [
      'Should we enable biometric face unlock in v1.0 or defer to v1.1?',
      'What is the refund SLA policy during payment gateway timeouts?'
    ],
    transcript: [
      {
        speaker: 'Priya Mehta',
        timestamp: '00:01',
        text: 'Hi everyone, shuru karte hain. Aaj ka main agenda hai Q3 mobile app launch aur backend architecture sync.'
      },
      {
        speaker: 'Rahul Sharma',
        timestamp: '00:45',
        text: 'Haan Priya. So technical side se humne offline caching evaluate kiya. Agar network intermittent ho, to user ka data drop nahi hona chahiye. We will use local queue with auto retry.'
      },
      {
        speaker: 'Vikram Singh',
        timestamp: '02:15',
        text: 'Rahul bhai, sync conflict kaise handle hoga? If two devices update same list at once?'
      },
      {
        speaker: 'Rahul Sharma',
        timestamp: '03:10',
        text: 'Server timestamp LWW (Last-Write-Wins) best rahega for v1. Vikram, can you write the sync worker by Friday?'
      },
      {
        speaker: 'Vikram Singh',
        timestamp: '04:02',
        text: 'Sure, I will take ownership of the background sync worker. Friday 5 PM tak staging ready ho jayega.'
      },
      {
        speaker: 'Ananya Roy',
        timestamp: '05:30',
        text: 'From UI/UX perspective, Dark Mode Figma tokens are ready and passed WCAG AA contrast checks. I am pushing the export now.'
      },
      {
        speaker: 'Priya Mehta',
        timestamp: '07:20',
        text: 'Awesome! So Razorpay integration is locked for UPI, and code freeze is next Tuesday 6 PM. Let us wrap up.'
      }
    ]
  },
  {
    id: 'sample-2',
    title: 'Enterprise Client Onboarding & Security Review',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    meetingDate: 'Yesterday, 11:00 AM',
    duration: '38 mins 10 secs',
    meetingType: 'Client & Security Sync',
    languageDetected: 'English',
    sentiment: 'Decisive & Rigorous',
    participants: ['David Miller (Client VP of Tech)', 'Sarah Jenkins (Solutions Lead)', 'Marcus Vance (Chief InfoSec Officer)', 'Elena Rostova (Customer Success)'],
    executiveSummary: 'Security compliance review concluded with approval for SOC2 Type II report handover. Single Sign-On (SSO via Okta/SAML) and Role-Based Access Control (RBAC) configurations were finalized. Enterprise SLA agreement signed for 99.95% uptime with 1-hour priority support.',
    keyTopics: [
      {
        topic: 'SAML 2.0 / Okta SSO Integration',
        summary: 'Configuring enterprise user directory synchronization and automated provisioning.',
        keyPoints: [
          'SCIM protocol to be enabled for automatic employee offboarding.',
          'Enforced multi-factor authentication (MFA) across all tenant admin seats.'
        ],
        speakersInvolved: ['David Miller', 'Sarah Jenkins']
      },
      {
        topic: 'Data Encryption at Rest & in Transit',
        summary: 'Infosec audit requirements for customer managed encryption keys (CMEK).',
        keyPoints: [
          'AES-256 GCM encryption confirmed for all stored document vaults.',
          'TLS 1.3 enforced for all client-to-API communication.'
        ],
        speakersInvolved: ['Marcus Vance', 'Sarah Jenkins']
      }
    ],
    decisions: [
      'Approved Okta SAML 2.0 integration for enterprise tenant rollout.',
      'Infosec team cleared SOC2 Type II compliance audit without reservations.',
      'Pilot rollout slated for 250 internal users on November 1st.'
    ],
    actionItems: [
      {
        id: 'task-201',
        task: 'Provide Okta metadata XML and ACS URL to client IT admin',
        owner: 'Sarah Jenkins',
        priority: 'High',
        deadline: 'Thursday, 3 PM',
        status: 'Completed'
      },
      {
        id: 'task-202',
        task: 'Execute Data Processing Addendum (DPA) and GDPR compliance schedule',
        owner: 'Marcus Vance',
        priority: 'Medium',
        deadline: 'Friday COB',
        status: 'In Progress'
      },
      {
        id: 'task-203',
        task: 'Setup dedicated Slack Connect channel for live pilot support',
        owner: 'Elena Rostova',
        priority: 'Low',
        deadline: 'Next Monday',
        status: 'Pending'
      }
    ],
    risksAndBlockers: [
      'Client firewall rules require static IP whitelist for webhook events.'
    ],
    openQuestions: [
      'Will audit logs retention requirement extend beyond standard 365 days?'
    ],
    transcript: [
      {
        speaker: 'Sarah Jenkins',
        timestamp: '00:10',
        text: 'Welcome David and Marcus. Today we want to finalize your security onboarding and SSO pipeline.'
      },
      {
        speaker: 'Marcus Vance',
        timestamp: '01:15',
        text: 'Our InfoSec team reviewed your SOC2 Type II report. Everything looks pristine. We need to confirm AES-256 for data at rest and TLS 1.3 for API endpoints.'
      },
      {
        speaker: 'Sarah Jenkins',
        timestamp: '02:40',
        text: 'Confirmed. All data in transit strictly requires TLS 1.3, and all databases use AES-256 at rest. I can share the compliance certificate today.'
      },
      {
        speaker: 'David Miller',
        timestamp: '04:10',
        text: 'Great. Let us proceed with Okta SAML 2.0. Sarah, please send over the ACS URL so my IT department can complete the mapping.'
      }
    ]
  }
];
