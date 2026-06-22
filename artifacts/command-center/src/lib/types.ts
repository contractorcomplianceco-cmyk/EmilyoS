export const AGENCY_TYPES = [
  "Licensing Board",
  "Contractor Licensing Board",
  "Department of Revenue",
  "Department of Transportation",
  "Environmental Agency / EPA",
  "Secretary of State",
  "Tax Agency",
  "Local Permitting Office",
  "Other Government Agency",
] as const;

export const COMMUNICATION_METHODS = [
  "Phone",
  "Email",
  "Portal Message",
  "Letter",
  "Website / Public Search",
  "Internal Note",
  "Other",
] as const;

export const MATTER_TYPES = [
  "License Application",
  "License Renewal",
  "Registration",
  "Tax / Revenue",
  "DOT",
  "Environmental / EPA",
  "Secretary of State",
  "Permit",
  "Deficiency Response",
  "Status Follow-Up",
  "Agency Research",
  "Compliance Issue",
  "Other",
] as const;

export const MATTER_STATUSES = [
  "Not Started",
  "Preparing",
  "Submitted",
  "Waiting on Agency",
  "Waiting on Client",
  "Waiting on Internal Team",
  "Deficiency Received",
  "In Review",
  "Escalated",
  "Approved / Completed",
  "Closed",
  "On Hold",
] as const;

export const RISK_LEVELS = ["Low", "Medium", "High", "Critical"] as const;

export const DEFICIENCY_STATUSES = [
  "New",
  "Assigned",
  "Waiting on Client",
  "Waiting on Internal Team",
  "Ready to Respond",
  "Submitted to Agency",
  "Resolved",
  "Escalated",
] as const;

export const ESCALATION_REASONS = [
  "Legal review needed",
  "Compliance interpretation needed",
  "Tax review needed",
  "Leadership decision needed",
  "Deadline risk",
  "Agency delay",
  "Client impact",
  "Missing critical document",
  "Conflicting agency information",
  "Other",
] as const;

export const ESCALATION_STATUSES = [
  "Open",
  "In Review",
  "Awaiting Decision",
  "Resolved",
  "Closed",
] as const;

export const SOP_CATEGORIES = [
  "Agency Communication SOP",
  "Documentation Standards",
  "Deficiency Routing SOP",
  "Escalation Rules",
  "Portal Check Procedure",
  "Approved Status Language",
  "New Team Member Training",
  "Quality Review Checklist",
] as const;

export const SOP_STATUSES = ["Draft", "Active", "Under Review", "Archived"] as const;

export const ACTIVE_STATUSES = ["Active", "Inactive"] as const;

export const BONUS_TONES = ["blue", "purple", "amber", "green", "slate"] as const;

export type AgencyType = (typeof AGENCY_TYPES)[number];
export type CommunicationMethod = (typeof COMMUNICATION_METHODS)[number];
export type MatterType = (typeof MATTER_TYPES)[number];
export type MatterStatus = (typeof MATTER_STATUSES)[number];
export type RiskLevel = (typeof RISK_LEVELS)[number];
export type DeficiencyStatus = (typeof DEFICIENCY_STATUSES)[number];
export type EscalationReason = (typeof ESCALATION_REASONS)[number];
export type EscalationStatus = (typeof ESCALATION_STATUSES)[number];
export type SopCategory = (typeof SOP_CATEGORIES)[number];
export type SopStatus = (typeof SOP_STATUSES)[number];
export type ActiveStatus = (typeof ACTIVE_STATUSES)[number];
export type BonusTone = (typeof BONUS_TONES)[number];

export interface Agency {
  id: string;
  name: string;
  agencyType: AgencyType;
  stateRegion: string;
  departmentCategory: string;
  website: string;
  portalLink: string;
  loginAccessNotes: string;
  mainPhone: string;
  mainEmail: string;
  contactPerson: string;
  preferredCommunicationMethod: CommunicationMethod;
  followUpTimingRules: string;
  knownProcessingPatterns: string;
  commonIssues: string;
  escalationNotes: string;
  activeStatus: ActiveStatus;
  createdAt: string;
}

export interface Matter {
  id: string;
  title: string;
  clientOrCompanyName: string;
  agencyId: string;
  matterType: MatterType;
  stateJurisdiction: string;
  currentStatus: MatterStatus;
  priorityRiskLevel: RiskLevel;
  internalOwner: string;
  emilyOwnerStatus: string;
  dateOpened: string;
  lastContactDate: string;
  nextFollowUpDate: string;
  deadlineRenewalDate: string;
  submissionDate: string;
  waitingOn: string;
  nextAction: string;
  notes: string;
  referenceLinks: string;
  createdAt: string;
}

export interface Communication {
  id: string;
  dateTime: string;
  agencyId: string;
  matterId: string;
  contactMethod: CommunicationMethod;
  personContacted: string;
  summary: string;
  outcome: string;
  nextStep: string;
  followUpNeeded: boolean;
  followUpDate: string;
  loggedBy: string;
  attachmentsOrLinks: string;
  createdAt: string;
}

export interface Deficiency {
  id: string;
  matterId: string;
  agencyId: string;
  requestOrDeficiencyType: string;
  description: string;
  dateReceived: string;
  dueDate: string;
  assignedInternalOwner: string;
  status: DeficiencyStatus;
  requiredResponse: string;
  documentsNeeded: string;
  riskLevel: RiskLevel;
  resolutionNotes: string;
  createdAt: string;
}

export interface Escalation {
  id: string;
  matterId: string;
  reasonForEscalation: EscalationReason;
  summary: string;
  recommendedNextStep: string;
  assignedReviewer: string;
  dateEscalated: string;
  dueDate: string;
  status: EscalationStatus;
  resolutionNotes: string;
  createdAt: string;
}

export interface KnowledgeEntry {
  id: string;
  agencyId: string;
  stateJurisdiction: string;
  topic: string;
  summary: string;
  detailedNotes: string;
  portalInstructions: string;
  followUpTimingGuidance: string;
  commonDeficiencies: string;
  requiredFormsOrLinks: string;
  contactPreferences: string;
  internalTips: string;
  lastVerifiedDate: string;
  verifiedBy: string;
  createdAt: string;
}

export interface Sop {
  id: string;
  title: string;
  category: SopCategory;
  purpose: string;
  steps: string;
  owner: string;
  lastUpdated: string;
  status: SopStatus;
  notes: string;
  createdAt: string;
}

export type TaskPriority = "Low" | "Medium" | "High";
export type TaskStatus = "Open" | "In Progress" | "Completed" | "Blocked";

export interface Task {
  id: string;
  title: string;
  priority: TaskPriority;
  dueDate: string;
  status: TaskStatus;
  assignedTo: string;
  relatedAgencyId: string;
  createdAt: string;
}

export type AlertType = "New" | "Update" | "Overdue" | "Deadline";
export type AlertSeverity = "Info" | "Warning" | "Critical";

export interface Alert {
  id: string;
  title: string;
  detail: string;
  severity: AlertSeverity;
  type: AlertType;
  date: string;
  createdAt: string;
}

export interface BonusOpportunity {
  id: string;
  name: string;
  amount: string;
  criteria: string;
  status: string;
  tone: BonusTone;
  meta: string;
  /** When true, the card meta is computed live from contributions (not user-edited). */
  dataDerived?: boolean;
  createdAt: string;
}

export interface Compensation {
  id: string;
  baseRate: string;
  schedule: string;
  createdAt: string;
}

export interface ReviewTarget {
  id: string;
  label: string;
  value: string;
  detail: string;
  targetDate?: string;
  createdAt: string;
}

export interface EmployeeProfile {
  id: string;
  name: string;
  title: string;
  department: string;
  employeeId: string;
  email: string;
  phone: string;
  location: string;
  manager: string;
  startDate: string;
  employmentType: string;
  emergencyContact: string;
  createdAt: string;
}

export interface EmployeeDocument {
  id: string;
  name: string;
  type: string;
  date: string;
  /** Original file name of the attached file, e.g. "agreement.pdf". */
  fileName?: string;
  /** IndexedDB key for the attachment's binary contents (preferred store). */
  fileRef?: string;
  /**
   * Legacy: attachment contents stored inline as a data URL (base64).
   * Newer uploads live in IndexedDB (see `fileRef`); kept for backward
   * compatibility so previously attached files still load and download.
   */
  fileData?: string;
  /** MIME type of the attached file. */
  mimeType?: string;
  /** Size of the attached file in bytes. */
  fileSize?: number;
  createdAt: string;
}

export interface Database {
  agencies: Agency[];
  matters: Matter[];
  communications: Communication[];
  deficiencies: Deficiency[];
  escalations: Escalation[];
  knowledge: KnowledgeEntry[];
  sops: Sop[];
  tasks: Task[];
  alerts: Alert[];
  bonusOpportunities: BonusOpportunity[];
  compensation: Compensation[];
  reviewTargets: ReviewTarget[];
  employeeProfile: EmployeeProfile[];
  documents: EmployeeDocument[];
}

export type Collection = keyof Database;

export const OPEN_MATTER_STATUSES: MatterStatus[] = [
  "Not Started",
  "Preparing",
  "Submitted",
  "Waiting on Agency",
  "Waiting on Client",
  "Waiting on Internal Team",
  "Deficiency Received",
  "In Review",
  "Escalated",
  "On Hold",
];

export const OPEN_DEFICIENCY_STATUSES: DeficiencyStatus[] = [
  "New",
  "Assigned",
  "Waiting on Client",
  "Waiting on Internal Team",
  "Ready to Respond",
  "Submitted to Agency",
  "Escalated",
];

export const OPEN_ESCALATION_STATUSES: EscalationStatus[] = [
  "Open",
  "In Review",
  "Awaiting Decision",
];
