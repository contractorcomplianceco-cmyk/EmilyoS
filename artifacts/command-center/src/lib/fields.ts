import type { FieldDef, Option } from "@/components/shared/RecordFormDialog";
import {
  AGENCY_TYPES,
  ACTIVE_STATUSES,
  COMMUNICATION_METHODS,
  MATTER_TYPES,
  MATTER_STATUSES,
  RISK_LEVELS,
  DEFICIENCY_STATUSES,
  ESCALATION_REASONS,
  ESCALATION_STATUSES,
  SOP_CATEGORIES,
  SOP_STATUSES,
  BONUS_TONES,
} from "./types";

export const agencyFields: FieldDef[] = [
  { key: "name", label: "Agency Name", type: "text", required: true, full: true },
  { key: "agencyType", label: "Agency Type", type: "select", options: AGENCY_TYPES, required: true },
  { key: "stateRegion", label: "State / Region", type: "text" },
  { key: "departmentCategory", label: "Department Category", type: "text" },
  { key: "activeStatus", label: "Status", type: "select", options: ACTIVE_STATUSES, required: true },
  { key: "contactPerson", label: "Contact Person", type: "text" },
  { key: "preferredCommunicationMethod", label: "Preferred Method", type: "select", options: COMMUNICATION_METHODS },
  { key: "mainPhone", label: "Main Phone", type: "text" },
  { key: "mainEmail", label: "Main Email", type: "text" },
  { key: "website", label: "Website", type: "text" },
  { key: "portalLink", label: "Portal Link", type: "text" },
  { key: "loginAccessNotes", label: "Login / Access Notes", type: "textarea" },
  { key: "followUpTimingRules", label: "Follow-Up Timing Rules", type: "textarea" },
  { key: "knownProcessingPatterns", label: "Known Processing Patterns", type: "textarea" },
  { key: "commonIssues", label: "Common Issues", type: "textarea" },
  { key: "escalationNotes", label: "Escalation Notes", type: "textarea" },
];

export function matterFields(agencyOptions: Option[]): FieldDef[] {
  return [
    { key: "title", label: "Matter Title", type: "text", required: true, full: true },
    { key: "clientOrCompanyName", label: "Client / Company", type: "text", required: true },
    { key: "agencyId", label: "Agency", type: "select", options: agencyOptions, required: true },
    { key: "matterType", label: "Matter Type", type: "select", options: MATTER_TYPES, required: true },
    { key: "stateJurisdiction", label: "State / Jurisdiction", type: "text" },
    { key: "currentStatus", label: "Current Status", type: "select", options: MATTER_STATUSES, required: true },
    { key: "priorityRiskLevel", label: "Priority / Risk", type: "select", options: RISK_LEVELS, required: true },
    { key: "internalOwner", label: "Internal Owner", type: "text" },
    { key: "emilyOwnerStatus", label: "Emily Owner Status", type: "text" },
    { key: "waitingOn", label: "Waiting On", type: "text" },
    { key: "dateOpened", label: "Date Opened", type: "date" },
    { key: "lastContactDate", label: "Last Contact Date", type: "date" },
    { key: "nextFollowUpDate", label: "Next Follow-Up Date", type: "date" },
    { key: "deadlineRenewalDate", label: "Deadline / Renewal Date", type: "date" },
    { key: "submissionDate", label: "Submission Date", type: "date" },
    { key: "nextAction", label: "Next Action", type: "textarea" },
    { key: "notes", label: "Notes", type: "textarea" },
    { key: "referenceLinks", label: "Documents / Reference Links", type: "textarea" },
  ];
}

export function communicationFields(
  agencyOptions: Option[],
  matterOptions: Option[],
): FieldDef[] {
  return [
    { key: "dateTime", label: "Date & Time", type: "datetime", required: true },
    { key: "contactMethod", label: "Contact Method", type: "select", options: COMMUNICATION_METHODS, required: true },
    { key: "agencyId", label: "Agency", type: "select", options: agencyOptions },
    { key: "matterId", label: "Related Matter", type: "select", options: matterOptions },
    { key: "personContacted", label: "Person Contacted", type: "text" },
    { key: "loggedBy", label: "Logged By", type: "text" },
    { key: "summary", label: "Summary", type: "textarea", required: true },
    { key: "outcome", label: "Outcome", type: "textarea" },
    { key: "nextStep", label: "Next Step", type: "textarea" },
    { key: "followUpNeeded", label: "Follow-Up Needed", type: "boolean" },
    { key: "followUpDate", label: "Follow-Up Date", type: "date" },
    { key: "attachmentsOrLinks", label: "Attachments / Reference Links", type: "textarea" },
  ];
}

export function deficiencyFields(
  agencyOptions: Option[],
  matterOptions: Option[],
): FieldDef[] {
  return [
    { key: "matterId", label: "Related Matter", type: "select", options: matterOptions, required: true },
    { key: "agencyId", label: "Agency", type: "select", options: agencyOptions },
    { key: "requestOrDeficiencyType", label: "Request / Deficiency Type", type: "text", required: true },
    { key: "status", label: "Status", type: "select", options: DEFICIENCY_STATUSES, required: true },
    { key: "assignedInternalOwner", label: "Assigned Internal Owner", type: "text" },
    { key: "riskLevel", label: "Risk Level", type: "select", options: RISK_LEVELS, required: true },
    { key: "dateReceived", label: "Date Received", type: "date" },
    { key: "dueDate", label: "Due Date", type: "date" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "requiredResponse", label: "Required Response", type: "textarea" },
    { key: "documentsNeeded", label: "Documents Needed", type: "textarea" },
    { key: "resolutionNotes", label: "Resolution Notes", type: "textarea" },
  ];
}

export function escalationFields(matterOptions: Option[]): FieldDef[] {
  return [
    { key: "matterId", label: "Related Matter", type: "select", options: matterOptions, required: true },
    { key: "reasonForEscalation", label: "Reason for Escalation", type: "select", options: ESCALATION_REASONS, required: true },
    { key: "status", label: "Status", type: "select", options: ESCALATION_STATUSES, required: true },
    { key: "assignedReviewer", label: "Assigned Reviewer", type: "text" },
    { key: "dateEscalated", label: "Date Escalated", type: "date" },
    { key: "dueDate", label: "Due Date", type: "date" },
    { key: "summary", label: "Summary", type: "textarea", required: true },
    { key: "recommendedNextStep", label: "Recommended Next Step", type: "textarea" },
    { key: "resolutionNotes", label: "Resolution Notes", type: "textarea" },
  ];
}

export function knowledgeFields(agencyOptions: Option[]): FieldDef[] {
  return [
    { key: "topic", label: "Topic", type: "text", required: true, full: true },
    { key: "agencyId", label: "Agency", type: "select", options: agencyOptions, required: true },
    { key: "stateJurisdiction", label: "State / Jurisdiction", type: "text" },
    { key: "summary", label: "Summary", type: "textarea" },
    { key: "detailedNotes", label: "Detailed Notes", type: "textarea" },
    { key: "portalInstructions", label: "Portal Instructions", type: "textarea" },
    { key: "followUpTimingGuidance", label: "Follow-Up Timing Guidance", type: "textarea" },
    { key: "commonDeficiencies", label: "Common Deficiencies", type: "textarea" },
    { key: "requiredFormsOrLinks", label: "Required Forms / Links", type: "textarea" },
    { key: "contactPreferences", label: "Contact Preferences", type: "textarea" },
    { key: "internalTips", label: "Internal Tips", type: "textarea" },
    { key: "lastVerifiedDate", label: "Last Verified Date", type: "date" },
    { key: "verifiedBy", label: "Verified By", type: "text" },
  ];
}

export const sopFields: FieldDef[] = [
  { key: "title", label: "Title", type: "text", required: true, full: true },
  { key: "category", label: "Category", type: "select", options: SOP_CATEGORIES, required: true },
  { key: "owner", label: "Owner", type: "text" },
  { key: "status", label: "Status", type: "select", options: SOP_STATUSES, required: true },
  { key: "lastUpdated", label: "Last Updated", type: "date" },
  { key: "purpose", label: "Purpose", type: "textarea" },
  { key: "steps", label: "Steps", type: "textarea" },
  { key: "notes", label: "Notes", type: "textarea" },
];

export function taskFields(agencyOptions: Option[]): FieldDef[] {
  return [
    { key: "title", label: "Task Title", type: "text", required: true, full: true },
    { key: "priority", label: "Priority", type: "select", options: ["Low", "Medium", "High"], required: true },
    { key: "status", label: "Status", type: "select", options: ["Open", "In Progress", "Completed", "Blocked"], required: true },
    { key: "dueDate", label: "Due Date", type: "date", required: true },
    { key: "assignedTo", label: "Assigned To", type: "text", required: true },
    { key: "relatedAgencyId", label: "Related Agency", type: "select", options: agencyOptions },
  ];
}

export const alertFields: FieldDef[] = [
  { key: "title", label: "Alert Title", type: "text", required: true, full: true },
  { key: "type", label: "Type", type: "select", options: ["New", "Update", "Overdue", "Deadline"], required: true },
  { key: "severity", label: "Severity", type: "select", options: ["Info", "Warning", "Critical"], required: true },
  { key: "date", label: "Date", type: "date", required: true },
  { key: "detail", label: "Details", type: "textarea", required: true },
];

export const bonusOpportunityFields: FieldDef[] = [
  { key: "name", label: "Bonus Name", type: "text", required: true, full: true },
  { key: "amount", label: "Amount", type: "text", required: true },
  { key: "status", label: "Status Label", type: "text", required: true },
  { key: "tone", label: "Accent Color", type: "select", options: BONUS_TONES, required: true },
  { key: "criteria", label: "Criteria", type: "textarea" },
  { key: "meta", label: "Footnote", type: "text", full: true },
];

export const compensationFields: FieldDef[] = [
  { key: "baseRate", label: "Base Hourly Rate", type: "text", required: true },
  { key: "schedule", label: "Weekly Schedule", type: "text", required: true },
];

export const reviewTargetFields: FieldDef[] = [
  { key: "label", label: "Milestone", type: "text", required: true, full: true },
  { key: "value", label: "Target Rate", type: "text", required: true },
  { key: "targetDate", label: "Target Date", type: "date" },
  { key: "detail", label: "Detail", type: "textarea" },
];

export const employeeProfileFields: FieldDef[] = [
  { key: "name", label: "Full Name", type: "text", required: true },
  { key: "employeeId", label: "Employee ID", type: "text", required: true },
  { key: "title", label: "Title", type: "text", required: true, full: true },
  { key: "department", label: "Department", type: "text" },
  { key: "email", label: "Work Email", type: "text" },
  { key: "phone", label: "Work Phone", type: "text" },
  { key: "location", label: "Location", type: "text" },
  { key: "manager", label: "Reports To", type: "text" },
  { key: "startDate", label: "Start Date", type: "date" },
  { key: "employmentType", label: "Employment Type", type: "text" },
  { key: "emergencyContact", label: "Emergency Contact", type: "text", full: true },
];

export const documentFields: FieldDef[] = [
  { key: "name", label: "Document Name", type: "text", required: true, full: true },
  { key: "type", label: "Type / Label", type: "text", required: true, placeholder: "e.g. PDF · Signed" },
  { key: "date", label: "Updated Date", type: "date", required: true },
  {
    key: "fileData",
    label: "Attached File",
    type: "file",
    full: true,
    fileNameKey: "fileName",
    fileSizeKey: "fileSize",
    mimeTypeKey: "mimeType",
    maxSizeMB: 1,
  },
];
