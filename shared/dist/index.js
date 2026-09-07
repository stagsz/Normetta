"use strict";
// =============================================================================
// ISO 9001 Self-Assessment & Audit Management - Shared Types
// =============================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvidenceType = exports.ISOSection = exports.ActionPriority = exports.ActionStatus = exports.AssessmentStatus = exports.ComplianceScore = exports.UserRole = void 0;
// -----------------------------------------------------------------------------
// Enums
// -----------------------------------------------------------------------------
var UserRole;
(function (UserRole) {
    UserRole["SYSTEM_ADMIN"] = "SYSTEM_ADMIN";
    UserRole["QUALITY_MANAGER"] = "QUALITY_MANAGER";
    UserRole["INTERNAL_AUDITOR"] = "INTERNAL_AUDITOR";
    UserRole["DEPARTMENT_HEAD"] = "DEPARTMENT_HEAD";
    UserRole["VIEWER"] = "VIEWER";
})(UserRole || (exports.UserRole = UserRole = {}));
var ComplianceScore;
(function (ComplianceScore) {
    ComplianceScore[ComplianceScore["NON_COMPLIANT"] = 1] = "NON_COMPLIANT";
    ComplianceScore[ComplianceScore["PARTIALLY_COMPLIANT"] = 2] = "PARTIALLY_COMPLIANT";
    ComplianceScore[ComplianceScore["FULLY_COMPLIANT"] = 3] = "FULLY_COMPLIANT";
})(ComplianceScore || (exports.ComplianceScore = ComplianceScore = {}));
var AssessmentStatus;
(function (AssessmentStatus) {
    AssessmentStatus["DRAFT"] = "DRAFT";
    AssessmentStatus["IN_PROGRESS"] = "IN_PROGRESS";
    AssessmentStatus["UNDER_REVIEW"] = "UNDER_REVIEW";
    AssessmentStatus["COMPLETED"] = "COMPLETED";
    AssessmentStatus["ARCHIVED"] = "ARCHIVED";
})(AssessmentStatus || (exports.AssessmentStatus = AssessmentStatus = {}));
var ActionStatus;
(function (ActionStatus) {
    ActionStatus["OPEN"] = "OPEN";
    ActionStatus["IN_PROGRESS"] = "IN_PROGRESS";
    ActionStatus["COMPLETED"] = "COMPLETED";
    ActionStatus["VERIFIED"] = "VERIFIED";
    ActionStatus["CLOSED"] = "CLOSED";
})(ActionStatus || (exports.ActionStatus = ActionStatus = {}));
var ActionPriority;
(function (ActionPriority) {
    ActionPriority["LOW"] = "LOW";
    ActionPriority["MEDIUM"] = "MEDIUM";
    ActionPriority["HIGH"] = "HIGH";
    ActionPriority["CRITICAL"] = "CRITICAL";
})(ActionPriority || (exports.ActionPriority = ActionPriority = {}));
var ISOSection;
(function (ISOSection) {
    ISOSection["CONTEXT"] = "4";
    ISOSection["LEADERSHIP"] = "5";
    ISOSection["PLANNING"] = "6";
    ISOSection["SUPPORT"] = "7";
    ISOSection["OPERATION"] = "8";
    ISOSection["PERFORMANCE"] = "9";
    ISOSection["IMPROVEMENT"] = "10";
})(ISOSection || (exports.ISOSection = ISOSection = {}));
var EvidenceType;
(function (EvidenceType) {
    EvidenceType["DOCUMENT"] = "DOCUMENT";
    EvidenceType["IMAGE"] = "IMAGE";
    EvidenceType["URL"] = "URL";
    EvidenceType["VIDEO"] = "VIDEO";
})(EvidenceType || (exports.EvidenceType = EvidenceType = {}));
//# sourceMappingURL=index.js.map