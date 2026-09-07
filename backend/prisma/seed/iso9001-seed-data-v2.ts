/**
 * ISO 9001:2015 Self-Assessment Seed Data
 * 
 * SCORING SCALE: 0-5
 * 0 = Not Applicable (N/A) - Requirement does not apply to this organization
 * 1 = Non-compliant - No evidence, not addressed
 * 2 = Initial - Awareness exists, but no formal implementation
 * 3 = Developing - Partially implemented, inconsistent application
 * 4 = Established - Fully implemented, consistent application
 * 5 = Optimizing - Exceeds requirements, continual improvement evident
 * 
 * Data Models (from PRD - updated):
 * - StandardSection: { id, sectionNumber, title, description }
 * - AuditQuestion: { id, sectionId, standardReference, standardText, auditQuestion, 
 *                    score0Criteria, score1Criteria, score2Criteria, score3Criteria, score4Criteria, score5Criteria }
 */

// ============================================
// STANDARD SECTIONS (ISO 9001:2015 Clauses)
// ============================================

export const standardSections = [
  {
    sectionNumber: "4",
    title: "Context of the Organization",
    description: "Requirements for understanding the organization's context, interested parties, scope, and QMS processes."
  },
  {
    sectionNumber: "4.1",
    title: "Understanding the organization and its context",
    description: "Determine external and internal issues relevant to purpose and strategic direction affecting QMS outcomes."
  },
  {
    sectionNumber: "4.2",
    title: "Understanding the needs and expectations of interested parties",
    description: "Determine interested parties relevant to the QMS and their requirements."
  },
  {
    sectionNumber: "4.3",
    title: "Determining the scope of the quality management system",
    description: "Determine boundaries and applicability of the QMS to establish its scope."
  },
  {
    sectionNumber: "4.4",
    title: "Quality management system and its processes",
    description: "Establish, implement, maintain and continually improve the QMS including needed processes."
  },
  {
    sectionNumber: "5",
    title: "Leadership",
    description: "Requirements for top management leadership, commitment, policy, and organizational roles."
  },
  {
    sectionNumber: "5.1",
    title: "Leadership and commitment",
    description: "Top management demonstration of leadership and commitment to the QMS."
  },
  {
    sectionNumber: "5.2",
    title: "Policy",
    description: "Establishing, implementing, and maintaining the quality policy."
  },
  {
    sectionNumber: "5.3",
    title: "Organizational roles, responsibilities and authorities",
    description: "Assignment and communication of responsibilities and authorities for relevant roles."
  },
  {
    sectionNumber: "6",
    title: "Planning",
    description: "Requirements for planning including risks/opportunities, objectives, and changes."
  },
  {
    sectionNumber: "6.1",
    title: "Actions to address risks and opportunities",
    description: "Determine and plan actions to address risks and opportunities."
  },
  {
    sectionNumber: "6.2",
    title: "Quality objectives and planning to achieve them",
    description: "Establish quality objectives at relevant functions, levels, and processes."
  },
  {
    sectionNumber: "6.3",
    title: "Planning of changes",
    description: "Carry out changes to the QMS in a planned manner."
  },
  {
    sectionNumber: "7",
    title: "Support",
    description: "Requirements for resources, competence, awareness, communication, and documented information."
  },
  {
    sectionNumber: "7.1",
    title: "Resources",
    description: "Determine and provide resources needed for QMS establishment, implementation, maintenance and improvement."
  },
  {
    sectionNumber: "7.2",
    title: "Competence",
    description: "Determine necessary competence and ensure persons are competent."
  },
  {
    sectionNumber: "7.3",
    title: "Awareness",
    description: "Ensure persons are aware of quality policy, objectives, their contribution, and implications of non-conformity."
  },
  {
    sectionNumber: "7.4",
    title: "Communication",
    description: "Determine internal and external communications relevant to the QMS."
  },
  {
    sectionNumber: "7.5",
    title: "Documented information",
    description: "QMS documented information requirements including creation, update, and control."
  },
  {
    sectionNumber: "8",
    title: "Operation",
    description: "Requirements for operational planning, product/service requirements, design, external providers, production, release, and nonconforming outputs."
  },
  {
    sectionNumber: "8.1",
    title: "Operational planning and control",
    description: "Plan, implement and control processes needed for product and service provision."
  },
  {
    sectionNumber: "8.2",
    title: "Requirements for products and services",
    description: "Customer communication and determination of product/service requirements."
  },
  {
    sectionNumber: "8.3",
    title: "Design and development of products and services",
    description: "Establish, implement and maintain design and development process."
  },
  {
    sectionNumber: "8.4",
    title: "Control of externally provided processes, products and services",
    description: "Ensure externally provided processes, products and services conform to requirements."
  },
  {
    sectionNumber: "8.5",
    title: "Production and service provision",
    description: "Implement production and service provision under controlled conditions."
  },
  {
    sectionNumber: "8.6",
    title: "Release of products and services",
    description: "Implement planned arrangements to verify product and service requirements are met."
  },
  {
    sectionNumber: "8.7",
    title: "Control of nonconforming outputs",
    description: "Ensure nonconforming outputs are identified and controlled."
  },
  {
    sectionNumber: "9",
    title: "Performance Evaluation",
    description: "Requirements for monitoring, measurement, analysis, evaluation, internal audit, and management review."
  },
  {
    sectionNumber: "9.1",
    title: "Monitoring, measurement, analysis and evaluation",
    description: "Determine what needs monitoring and measuring, methods, timing, and evaluation."
  },
  {
    sectionNumber: "9.2",
    title: "Internal audit",
    description: "Conduct internal audits at planned intervals."
  },
  {
    sectionNumber: "9.3",
    title: "Management review",
    description: "Top management review of QMS at planned intervals."
  },
  {
    sectionNumber: "10",
    title: "Improvement",
    description: "Requirements for general improvement, nonconformity/corrective action, and continual improvement."
  },
  {
    sectionNumber: "10.1",
    title: "General",
    description: "Determine and select opportunities for improvement and implement necessary actions."
  },
  {
    sectionNumber: "10.2",
    title: "Nonconformity and corrective action",
    description: "React to nonconformities, evaluate, take action, review effectiveness."
  },
  {
    sectionNumber: "10.3",
    title: "Continual improvement",
    description: "Continually improve QMS suitability, adequacy and effectiveness."
  }
];

// ============================================
// AUDIT QUESTIONS (with 0-5 scoring criteria)
// ============================================

export const auditQuestions = [
  // ----------------------------------------
  // CLAUSE 4.1 - Understanding the organization and its context
  // ----------------------------------------
  {
    sectionNumber: "4.1",
    standardReference: "ISO 9001:2015 Clause 4.1",
    standardText: "The organization shall determine external and internal issues that are relevant to its purpose and strategic direction and that affect its ability to achieve the intended result(s) of its quality management system. The organization shall monitor and review information about these external and internal issues.",
    auditQuestion: "Has the organization identified and documented external issues (legal, technological, competitive, market, cultural, social, economic) that affect its ability to achieve QMS results?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "No external issues have been identified or documented.",
    score2Criteria: "Awareness of external issues exists but they are not formally documented.",
    score3Criteria: "Some external issues are documented but coverage is incomplete or not linked to strategy.",
    score4Criteria: "External issues are comprehensively documented and linked to strategic direction.",
    score5Criteria: "External issues are documented, regularly reviewed, proactively monitored with trend analysis, and drive strategic decisions."
  },
  {
    sectionNumber: "4.1",
    standardReference: "ISO 9001:2015 Clause 4.1",
    standardText: "The organization shall determine external and internal issues that are relevant to its purpose and strategic direction and that affect its ability to achieve the intended result(s) of its quality management system. The organization shall monitor and review information about these external and internal issues.",
    auditQuestion: "Has the organization identified and documented internal issues (values, culture, knowledge, performance) that affect its ability to achieve QMS results?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "No internal issues have been identified or documented.",
    score2Criteria: "Awareness of internal issues exists but they are not formally documented.",
    score3Criteria: "Some internal issues are documented but coverage is incomplete or inconsistent.",
    score4Criteria: "Internal issues are comprehensively documented with clear ownership.",
    score5Criteria: "Internal issues are documented, regularly monitored, with proactive improvement actions and measurable outcomes."
  },
  {
    sectionNumber: "4.1",
    standardReference: "ISO 9001:2015 Clause 4.1",
    standardText: "The organization shall determine external and internal issues that are relevant to its purpose and strategic direction and that affect its ability to achieve the intended result(s) of its quality management system. The organization shall monitor and review information about these external and internal issues.",
    auditQuestion: "Is there evidence that external and internal issues are monitored and reviewed at planned intervals?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "No monitoring or review process exists for context issues.",
    score2Criteria: "Issues are occasionally discussed but not at planned intervals.",
    score3Criteria: "Issues are reviewed periodically but without documented outcomes or actions.",
    score4Criteria: "Issues are monitored and reviewed at defined intervals with documented evidence.",
    score5Criteria: "Systematic monitoring with real-time indicators, predictive analysis, and proactive response mechanisms."
  },

  // ----------------------------------------
  // CLAUSE 4.2 - Understanding the needs and expectations of interested parties
  // ----------------------------------------
  {
    sectionNumber: "4.2",
    standardReference: "ISO 9001:2015 Clause 4.2",
    standardText: "The organization shall determine: a) the interested parties that are relevant to the quality management system; b) the requirements of these interested parties that are relevant to the quality management system. The organization shall monitor and review information about these interested parties and their relevant requirements.",
    auditQuestion: "Has the organization identified all relevant interested parties (customers, employees, suppliers, regulators, shareholders, community)?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "Interested parties have not been identified.",
    score2Criteria: "Some interested parties are informally recognized but not documented.",
    score3Criteria: "Key interested parties are identified but the list may be incomplete.",
    score4Criteria: "All relevant interested parties are identified, documented, and categorized.",
    score5Criteria: "Interested parties are comprehensively mapped with influence/impact analysis and engagement strategies."
  },
  {
    sectionNumber: "4.2",
    standardReference: "ISO 9001:2015 Clause 4.2",
    standardText: "The organization shall determine: a) the interested parties that are relevant to the quality management system; b) the requirements of these interested parties that are relevant to the quality management system. The organization shall monitor and review information about these interested parties and their relevant requirements.",
    auditQuestion: "Are the requirements and expectations of each interested party documented and monitored?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "Requirements of interested parties are not documented.",
    score2Criteria: "Some requirements are known but not formally documented.",
    score3Criteria: "Requirements are partially documented but monitoring is inconsistent.",
    score4Criteria: "Requirements are fully documented and regularly monitored with evidence of review.",
    score5Criteria: "Requirements are proactively managed with satisfaction measurement, trend analysis, and predictive engagement."
  },

  // ----------------------------------------
  // CLAUSE 4.3 - Determining the scope of the QMS
  // ----------------------------------------
  {
    sectionNumber: "4.3",
    standardReference: "ISO 9001:2015 Clause 4.3",
    standardText: "The organization shall determine the boundaries and applicability of the quality management system to establish its scope. When determining this scope, the organization shall consider: a) the external and internal issues referred to in 4.1; b) the requirements of relevant interested parties referred to in 4.2; c) the products and services of the organization.",
    auditQuestion: "Is the QMS scope clearly defined, documented, and available as documented information?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "QMS scope is not defined or documented.",
    score2Criteria: "Scope is informally understood but not documented.",
    score3Criteria: "Scope is documented but may be incomplete or unclear.",
    score4Criteria: "Scope is clearly defined, documented, and readily available.",
    score5Criteria: "Scope is comprehensive, regularly reviewed, aligned with business changes, and communicated to all stakeholders."
  },
  {
    sectionNumber: "4.3",
    standardReference: "ISO 9001:2015 Clause 4.3",
    standardText: "The organization shall determine the boundaries and applicability of the quality management system to establish its scope. When determining this scope, the organization shall consider: a) the external and internal issues referred to in 4.1; b) the requirements of relevant interested parties referred to in 4.2; c) the products and services of the organization.",
    auditQuestion: "If any ISO 9001 requirements are determined not applicable, is there valid justification that does not affect conformity of products/services?",
    score0Criteria: "No exclusions exist - all requirements are applicable.",
    score1Criteria: "Exclusions exist without any justification.",
    score2Criteria: "Exclusions exist with informal reasoning but not documented.",
    score3Criteria: "Exclusions are justified but documentation is incomplete.",
    score4Criteria: "All exclusions are properly justified and documented.",
    score5Criteria: "Exclusions are justified, documented, periodically reviewed for continued validity, and clearly communicated."
  },

  // ----------------------------------------
  // CLAUSE 4.4 - Quality management system and its processes
  // ----------------------------------------
  {
    sectionNumber: "4.4",
    standardReference: "ISO 9001:2015 Clause 4.4",
    standardText: "The organization shall establish, implement, maintain and continually improve a quality management system, including the processes needed and their interactions, in accordance with the requirements of this International Standard.",
    auditQuestion: "Are QMS processes identified with their inputs, outputs, sequence, and interactions documented?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "QMS processes are not identified or documented.",
    score2Criteria: "Key processes are informally known but not documented.",
    score3Criteria: "Processes are identified but interactions or documentation is incomplete.",
    score4Criteria: "All processes are documented with inputs, outputs, and interactions.",
    score5Criteria: "Process map is comprehensive, digitized, with real-time monitoring and automated workflow management."
  },
  {
    sectionNumber: "4.4",
    standardReference: "ISO 9001:2015 Clause 4.4",
    standardText: "The organization shall establish, implement, maintain and continually improve a quality management system, including the processes needed and their interactions, in accordance with the requirements of this International Standard.",
    auditQuestion: "Are criteria, methods, and performance indicators established for each process to ensure effective operation and control?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "No criteria or performance indicators exist for processes.",
    score2Criteria: "Some informal measures exist but not systematically defined.",
    score3Criteria: "Criteria/indicators exist for some processes but coverage is inconsistent.",
    score4Criteria: "All processes have defined criteria, methods, and KPIs that are monitored.",
    score5Criteria: "Process KPIs are integrated into dashboards with real-time monitoring, trend analysis, and automated alerts."
  },
  {
    sectionNumber: "4.4",
    standardReference: "ISO 9001:2015 Clause 4.4",
    standardText: "The organization shall establish, implement, maintain and continually improve a quality management system, including the processes needed and their interactions, in accordance with the requirements of this International Standard.",
    auditQuestion: "Are resources, responsibilities, and authorities assigned for each QMS process?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "Resources and responsibilities are not assigned to processes.",
    score2Criteria: "Informal understanding exists but not documented.",
    score3Criteria: "Some processes have assigned responsibilities but gaps exist.",
    score4Criteria: "All processes have clearly assigned resources, responsibilities, and authorities.",
    score5Criteria: "RACI matrices are complete, regularly reviewed, with competency mapping and succession planning."
  },
  {
    sectionNumber: "4.4",
    standardReference: "ISO 9001:2015 Clause 4.4",
    standardText: "The organization shall establish, implement, maintain and continually improve a quality management system, including the processes needed and their interactions, in accordance with the requirements of this International Standard.",
    auditQuestion: "Are risks and opportunities addressed for each process and are processes evaluated for improvement?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "Risks and opportunities are not considered for processes.",
    score2Criteria: "Informal risk awareness exists but not documented.",
    score3Criteria: "Risks/opportunities are addressed for some processes but evaluation is inconsistent.",
    score4Criteria: "All processes have documented risks/opportunities with improvement evaluation.",
    score5Criteria: "Integrated risk management with predictive analytics, automated risk scoring, and continuous improvement culture."
  },

  // ----------------------------------------
  // CLAUSE 5.1 - Leadership and commitment
  // ----------------------------------------
  {
    sectionNumber: "5.1",
    standardReference: "ISO 9001:2015 Clause 5.1.1",
    standardText: "Top management shall demonstrate leadership and commitment with respect to the quality management system by: a) taking accountability for the effectiveness of the quality management system; b) ensuring that the quality policy and quality objectives are established for the quality management system and are compatible with the context and strategic direction of the organization.",
    auditQuestion: "Does top management demonstrate accountability for QMS effectiveness through active engagement and decision-making?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "No evidence of top management accountability or engagement with the QMS.",
    score2Criteria: "Top management is aware of QMS but shows minimal active engagement.",
    score3Criteria: "Some involvement exists but accountability is unclear or inconsistent.",
    score4Criteria: "Top management actively demonstrates accountability with documented decisions and reviews.",
    score5Criteria: "Top management champions quality culture, leads by example, with visible commitment and innovation sponsorship."
  },
  {
    sectionNumber: "5.1",
    standardReference: "ISO 9001:2015 Clause 5.1.1",
    standardText: "Top management shall demonstrate leadership and commitment with respect to the quality management system by: c) ensuring the integration of the quality management system requirements into the organization's business processes; d) promoting the use of the process approach and risk-based thinking.",
    auditQuestion: "Are QMS requirements integrated into business processes rather than treated as a separate system?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "QMS operates as a separate system disconnected from business processes.",
    score2Criteria: "Minimal integration; QMS is seen as a compliance burden.",
    score3Criteria: "Partial integration exists but QMS is still perceived as separate.",
    score4Criteria: "QMS requirements are fully integrated into business processes.",
    score5Criteria: "QMS is seamlessly embedded in operations with quality as a core business value driving competitive advantage."
  },
  {
    sectionNumber: "5.1",
    standardReference: "ISO 9001:2015 Clause 5.1.1",
    standardText: "Top management shall demonstrate leadership and commitment with respect to the quality management system by: e) ensuring that the resources needed for the quality management system are available; f) communicating the importance of effective quality management and of conforming to the quality management system requirements.",
    auditQuestion: "Are adequate resources provided for the QMS and is the importance of quality management communicated throughout the organization?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "Resources are inadequate and quality importance is not communicated.",
    score2Criteria: "Limited resources; quality communication is minimal.",
    score3Criteria: "Resources are partially adequate; communication is inconsistent.",
    score4Criteria: "Adequate resources provided; quality importance consistently communicated.",
    score5Criteria: "Resources optimized; quality culture is pervasive with engaged workforce and recognition programs."
  },
  {
    sectionNumber: "5.1",
    standardReference: "ISO 9001:2015 Clause 5.1.1",
    standardText: "Top management shall demonstrate leadership and commitment with respect to the quality management system by: g) ensuring that the quality management system achieves its intended results; h) engaging, directing and supporting persons to contribute to the effectiveness of the quality management system.",
    auditQuestion: "Does top management engage, direct, and support persons to contribute to QMS effectiveness and continual improvement?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "No evidence of top management engaging or supporting personnel.",
    score2Criteria: "Minimal engagement; support is reactive rather than proactive.",
    score3Criteria: "Some engagement exists but support is limited or inconsistent.",
    score4Criteria: "Top management actively engages and supports personnel with documented initiatives.",
    score5Criteria: "Empowered workforce with innovation programs, recognition, and continuous learning culture led by management."
  },
  {
    sectionNumber: "5.1",
    standardReference: "ISO 9001:2015 Clause 5.1.2",
    standardText: "Top management shall demonstrate leadership and commitment with respect to customer focus by ensuring that: a) customer and applicable statutory and regulatory requirements are determined, understood and consistently met; b) the risks and opportunities that can affect conformity of products and services and the ability to enhance customer satisfaction are determined and addressed.",
    auditQuestion: "Are customer requirements and applicable statutory/regulatory requirements determined, understood, and consistently met?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "Customer and regulatory requirements are not systematically determined.",
    score2Criteria: "Some requirements are known but understanding is incomplete.",
    score3Criteria: "Requirements are determined but consistent compliance has gaps.",
    score4Criteria: "All requirements are determined, understood, and consistently met.",
    score5Criteria: "Proactive requirement management with regulatory intelligence, customer co-creation, and compliance excellence."
  },
  {
    sectionNumber: "5.1",
    standardReference: "ISO 9001:2015 Clause 5.1.2",
    standardText: "Top management shall demonstrate leadership and commitment with respect to customer focus by ensuring that: c) the focus on enhancing customer satisfaction is maintained.",
    auditQuestion: "Is there a maintained focus on enhancing customer satisfaction with measurable actions and improvements?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "No focus on customer satisfaction enhancement.",
    score2Criteria: "Customer satisfaction is occasionally discussed but not measured.",
    score3Criteria: "Customer satisfaction is considered but enhancement is ad-hoc.",
    score4Criteria: "Systematic focus on customer satisfaction with measured improvements.",
    score5Criteria: "Customer-centric culture with NPS tracking, journey mapping, predictive satisfaction models, and loyalty programs."
  },

  // ----------------------------------------
  // CLAUSE 5.2 - Policy
  // ----------------------------------------
  {
    sectionNumber: "5.2",
    standardReference: "ISO 9001:2015 Clause 5.2.1",
    standardText: "Top management shall establish, implement and maintain a quality policy that: a) is appropriate to the purpose and context of the organization and supports its strategic direction; b) provides a framework for setting quality objectives; c) includes a commitment to satisfy applicable requirements; d) includes a commitment to continual improvement of the quality management system.",
    auditQuestion: "Is a quality policy established that is appropriate to the organization's purpose, context, and strategic direction?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "No quality policy exists.",
    score2Criteria: "A generic policy exists but is not tailored to the organization.",
    score3Criteria: "Policy exists but alignment with context and strategy is unclear.",
    score4Criteria: "Quality policy is appropriate, context-specific, and supports strategic direction.",
    score5Criteria: "Policy is inspirational, regularly refreshed, embedded in culture, and drives organizational behavior."
  },
  {
    sectionNumber: "5.2",
    standardReference: "ISO 9001:2015 Clause 5.2.1",
    standardText: "Top management shall establish, implement and maintain a quality policy that: a) is appropriate to the purpose and context of the organization and supports its strategic direction; b) provides a framework for setting quality objectives; c) includes a commitment to satisfy applicable requirements; d) includes a commitment to continual improvement of the quality management system.",
    auditQuestion: "Does the quality policy provide a framework for setting objectives and include commitments to meeting requirements and continual improvement?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "Policy does not provide framework for objectives or lacks commitments.",
    score2Criteria: "Policy mentions objectives but framework is unclear.",
    score3Criteria: "Policy partially addresses objectives framework; commitments exist but are vague.",
    score4Criteria: "Policy clearly provides objectives framework with explicit commitments.",
    score5Criteria: "Policy drives measurable objectives cascade with clear line-of-sight from strategy to individual goals."
  },
  {
    sectionNumber: "5.2",
    standardReference: "ISO 9001:2015 Clause 5.2.2",
    standardText: "The quality policy shall: a) be available and be maintained as documented information; b) be communicated, understood and applied within the organization; c) be available to relevant interested parties, as appropriate.",
    auditQuestion: "Is the quality policy documented, communicated, understood within the organization, and available to relevant interested parties?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "Policy is not documented or communicated.",
    score2Criteria: "Policy is documented but communication is limited.",
    score3Criteria: "Policy is communicated but understanding varies across the organization.",
    score4Criteria: "Policy is documented, communicated, understood, and available to interested parties.",
    score5Criteria: "Policy is actively lived, reinforced through multiple channels, with verified understanding and stakeholder engagement."
  },

  // ----------------------------------------
  // CLAUSE 5.3 - Organizational roles, responsibilities and authorities
  // ----------------------------------------
  {
    sectionNumber: "5.3",
    standardReference: "ISO 9001:2015 Clause 5.3",
    standardText: "Top management shall ensure that the responsibilities and authorities for relevant roles are assigned, communicated and understood within the organization. Top management shall assign the responsibility and authority for: a) ensuring that the quality management system conforms to the requirements of this International Standard; b) ensuring that the processes are delivering their intended outputs.",
    auditQuestion: "Are responsibilities and authorities for QMS roles clearly assigned, communicated, and understood?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "Responsibilities and authorities are not defined.",
    score2Criteria: "Informal understanding exists but nothing is documented.",
    score3Criteria: "Some responsibilities are assigned but communication is incomplete.",
    score4Criteria: "All responsibilities and authorities are assigned, documented, and understood.",
    score5Criteria: "Clear accountability with RACI matrices, competency frameworks, and empowerment culture."
  },
  {
    sectionNumber: "5.3",
    standardReference: "ISO 9001:2015 Clause 5.3",
    standardText: "Top management shall assign the responsibility and authority for: c) reporting on the performance of the quality management system and on opportunities for improvement in particular to top management; d) ensuring the promotion of customer focus throughout the organization; e) ensuring that the integrity of the quality management system is maintained when changes to the quality management system are planned and implemented.",
    auditQuestion: "Is there assigned responsibility for reporting QMS performance to top management and ensuring customer focus throughout the organization?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "No assigned responsibility for QMS reporting or customer focus.",
    score2Criteria: "Informal responsibility exists but not clearly assigned.",
    score3Criteria: "Responsibilities exist but reporting or customer focus promotion is inconsistent.",
    score4Criteria: "Clear responsibilities with regular QMS reporting and customer focus promotion.",
    score5Criteria: "Dedicated quality leadership with executive dashboards, customer advocacy programs, and change management excellence."
  },

  // ----------------------------------------
  // CLAUSE 6.1 - Actions to address risks and opportunities
  // ----------------------------------------
  {
    sectionNumber: "6.1",
    standardReference: "ISO 9001:2015 Clause 6.1.1",
    standardText: "When planning for the quality management system, the organization shall consider the issues referred to in 4.1 and the requirements referred to in 4.2 and determine the risks and opportunities that need to be addressed to: a) give assurance that the quality management system can achieve its intended result(s); b) enhance desirable effects; c) prevent, or reduce, undesired effects; d) achieve improvement.",
    auditQuestion: "Has the organization determined risks and opportunities considering the context (4.1) and interested party requirements (4.2)?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "No formal risk and opportunity assessment exists.",
    score2Criteria: "Informal risk awareness exists but not documented.",
    score3Criteria: "Some risks/opportunities identified but not linked to context or interested parties.",
    score4Criteria: "Comprehensive risk and opportunity assessment with clear links to context.",
    score5Criteria: "Enterprise risk management integrated with QMS, predictive risk analytics, and opportunity exploitation strategies."
  },
  {
    sectionNumber: "6.1",
    standardReference: "ISO 9001:2015 Clause 6.1.2",
    standardText: "The organization shall plan: a) actions to address these risks and opportunities; b) how to: 1) integrate and implement the actions into its quality management system processes; 2) evaluate the effectiveness of these actions.",
    auditQuestion: "Are actions planned to address risks and opportunities, integrated into QMS processes, and evaluated for effectiveness?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "No actions planned for risks and opportunities.",
    score2Criteria: "Some informal actions taken but not systematically planned.",
    score3Criteria: "Actions exist but integration or effectiveness evaluation is incomplete.",
    score4Criteria: "Actions are planned, integrated, and regularly evaluated for effectiveness.",
    score5Criteria: "Dynamic risk response with automated triggers, real-time effectiveness monitoring, and lessons learned integration."
  },

  // ----------------------------------------
  // CLAUSE 6.2 - Quality objectives and planning to achieve them
  // ----------------------------------------
  {
    sectionNumber: "6.2",
    standardReference: "ISO 9001:2015 Clause 6.2.1",
    standardText: "The organization shall establish quality objectives at relevant functions, levels and processes needed for the quality management system. The quality objectives shall: a) be consistent with the quality policy; b) be measurable; c) take into account applicable requirements; d) be relevant to conformity of products and services and to enhancement of customer satisfaction; e) be monitored; f) be communicated; g) be updated as appropriate.",
    auditQuestion: "Are quality objectives established that are consistent with policy, measurable, and relevant to product/service conformity and customer satisfaction?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "Quality objectives are not established.",
    score2Criteria: "Vague objectives exist but are not measurable.",
    score3Criteria: "Objectives exist but alignment with policy or measurability has gaps.",
    score4Criteria: "SMART objectives established, consistent with policy, relevant to conformity and satisfaction.",
    score5Criteria: "Objectives cascaded to all levels with balanced scorecard approach, real-time tracking, and stretch targets."
  },
  {
    sectionNumber: "6.2",
    standardReference: "ISO 9001:2015 Clause 6.2.2",
    standardText: "When planning how to achieve its quality objectives, the organization shall determine: a) what will be done; b) what resources will be required; c) who will be responsible; d) when it will be completed; e) how the results will be evaluated.",
    auditQuestion: "Is planning documented for achieving quality objectives including actions, resources, responsibilities, timeframes, and evaluation methods?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "No planning exists for achieving quality objectives.",
    score2Criteria: "Informal plans exist but not documented.",
    score3Criteria: "Partial planning exists but key elements are missing.",
    score4Criteria: "Complete planning documented with all required elements.",
    score5Criteria: "Comprehensive action plans with project management rigor, milestone tracking, and agile adaptation."
  },
  {
    sectionNumber: "6.2",
    standardReference: "ISO 9001:2015 Clause 6.2.1",
    standardText: "The quality objectives shall: e) be monitored; f) be communicated; g) be updated as appropriate.",
    auditQuestion: "Are quality objectives monitored, communicated throughout the organization, and updated when appropriate?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "Objectives are not monitored or communicated.",
    score2Criteria: "Minimal monitoring; communication is sporadic.",
    score3Criteria: "Some monitoring occurs but communication is limited or updates are irregular.",
    score4Criteria: "Objectives are systematically monitored, communicated, and updated.",
    score5Criteria: "Real-time objective dashboards visible to all, with automated alerts and dynamic recalibration."
  },

  // ----------------------------------------
  // CLAUSE 6.3 - Planning of changes
  // ----------------------------------------
  {
    sectionNumber: "6.3",
    standardReference: "ISO 9001:2015 Clause 6.3",
    standardText: "When the organization determines the need for changes to the quality management system, the changes shall be carried out in a planned manner. The organization shall consider: a) the purpose of the changes and their potential consequences; b) the integrity of the quality management system; c) the availability of resources; d) the allocation or reallocation of responsibilities and authorities.",
    auditQuestion: "When changes to the QMS are needed, are they planned considering purpose, consequences, system integrity, resources, and responsibilities?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "Changes are made without planning or consideration.",
    score2Criteria: "Some consideration given but planning is informal.",
    score3Criteria: "Planning occurs but not all factors are systematically considered.",
    score4Criteria: "All QMS changes are systematically planned with documented consideration.",
    score5Criteria: "Mature change management with impact assessment, stakeholder engagement, rollback plans, and post-implementation review."
  },

  // ----------------------------------------
  // CLAUSE 7.1 - Resources
  // ----------------------------------------
  {
    sectionNumber: "7.1",
    standardReference: "ISO 9001:2015 Clause 7.1.1",
    standardText: "The organization shall determine and provide the resources needed for the establishment, implementation, maintenance and continual improvement of the quality management system. The organization shall consider: a) the capabilities of, and constraints on, existing internal resources; b) what needs to be obtained from external providers.",
    auditQuestion: "Has the organization determined and provided adequate resources for QMS establishment, implementation, maintenance, and improvement?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "Resources are not systematically determined.",
    score2Criteria: "Some resource consideration but significant gaps exist.",
    score3Criteria: "Resources are partially determined but constraints not fully addressed.",
    score4Criteria: "Resources are systematically determined and provided.",
    score5Criteria: "Strategic resource planning with capacity modeling, investment optimization, and make-vs-buy analysis."
  },
  {
    sectionNumber: "7.1",
    standardReference: "ISO 9001:2015 Clause 7.1.2",
    standardText: "The organization shall determine and provide the persons necessary for the effective implementation of its quality management system and for the operation and control of its processes.",
    auditQuestion: "Are adequate personnel determined and provided for effective QMS implementation and process operation?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "Personnel needs are not determined.",
    score2Criteria: "Informal understanding of needs but significant gaps exist.",
    score3Criteria: "Personnel needs are determined but staffing is not always adequate.",
    score4Criteria: "Personnel needs are determined and consistently met.",
    score5Criteria: "Workforce planning with competency matrices, succession planning, and talent development programs."
  },
  {
    sectionNumber: "7.1",
    standardReference: "ISO 9001:2015 Clause 7.1.3",
    standardText: "The organization shall determine, provide and maintain the infrastructure necessary for the operation of its processes and to achieve conformity of products and services. NOTE Infrastructure can include: a) buildings and associated utilities; b) equipment, including hardware and software; c) transportation resources; d) information and communication technology.",
    auditQuestion: "Is infrastructure (buildings, equipment, IT systems, transportation) determined, provided, and maintained for process operation and product/service conformity?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "Infrastructure needs are not determined.",
    score2Criteria: "Basic infrastructure exists but maintenance is reactive.",
    score3Criteria: "Infrastructure is determined but provision or maintenance has gaps.",
    score4Criteria: "Infrastructure is systematically determined, provided, and maintained.",
    score5Criteria: "Predictive maintenance programs, asset lifecycle management, and continuous infrastructure optimization."
  },
  {
    sectionNumber: "7.1",
    standardReference: "ISO 9001:2015 Clause 7.1.4",
    standardText: "The organization shall determine, provide and maintain the environment necessary for the operation of its processes and to achieve conformity of products and services. NOTE A suitable environment can be a combination of human and physical factors, such as: a) social (e.g. non-discriminatory, calm, non-confrontational); b) psychological (e.g. stress-reducing, burnout prevention, emotionally protective); c) physical (e.g. temperature, heat, humidity, light, airflow, hygiene, noise).",
    auditQuestion: "Is the work environment (social, psychological, physical factors) determined, provided, and maintained for process operation and product/service conformity?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "Work environment factors are not considered.",
    score2Criteria: "Basic physical environment addressed but social/psychological factors ignored.",
    score3Criteria: "Environment is partially addressed but some factors are not controlled.",
    score4Criteria: "Work environment is systematically determined and maintained.",
    score5Criteria: "Holistic workplace wellbeing program with ergonomics, mental health support, and employee engagement initiatives."
  },
  {
    sectionNumber: "7.1",
    standardReference: "ISO 9001:2015 Clause 7.1.5.1",
    standardText: "The organization shall determine and provide the resources needed to ensure valid and reliable results when monitoring or measuring is used to verify the conformity of products and services to requirements. The organization shall ensure that the resources provided: a) are suitable for the specific type of monitoring and measurement activities being undertaken; b) are maintained to ensure their continued fitness for their purpose.",
    auditQuestion: "Are monitoring and measuring resources determined, suitable for their purpose, and maintained to ensure continued fitness?",
    score0Criteria: "Not applicable - no monitoring or measuring required.",
    score1Criteria: "Monitoring/measuring resources are not controlled.",
    score2Criteria: "Resources exist but suitability or maintenance is ad-hoc.",
    score3Criteria: "Resources are identified but calibration or maintenance has gaps.",
    score4Criteria: "Resources are determined, suitable, and maintained with documented evidence.",
    score5Criteria: "Automated calibration tracking, measurement system analysis, and continuous measurement capability improvement."
  },
  {
    sectionNumber: "7.1",
    standardReference: "ISO 9001:2015 Clause 7.1.5.2",
    standardText: "When measurement traceability is a requirement, or is considered by the organization to be an essential part of providing confidence in the validity of measurement results, measuring equipment shall be: a) calibrated or verified, or both, at specified intervals, or prior to use, against measurement standards traceable to international or national measurement standards; b) identified to determine their status; c) safeguarded from adjustments, damage or deterioration that would invalidate the calibration status and subsequent measurement results.",
    auditQuestion: "Where measurement traceability is required, is equipment calibrated/verified against traceable standards, identified for status, and safeguarded from damage?",
    score0Criteria: "Not applicable - no measurement traceability required.",
    score1Criteria: "Calibration is not performed or traceability is not established.",
    score2Criteria: "Some calibration occurs but traceability is incomplete.",
    score3Criteria: "Calibration occurs but status identification or safeguarding is incomplete.",
    score4Criteria: "Equipment is calibrated, identified, and safeguarded with documented records.",
    score5Criteria: "Automated calibration management system with alerts, audit trails, and continuous measurement assurance."
  },
  {
    sectionNumber: "7.1",
    standardReference: "ISO 9001:2015 Clause 7.1.6",
    standardText: "The organization shall determine the knowledge necessary for the operation of its processes and to achieve conformity of products and services. This knowledge shall be maintained and be made available to the extent necessary. When addressing changing needs and trends, the organization shall consider its current knowledge and determine how to acquire or access any necessary additional knowledge and required updates.",
    auditQuestion: "Is organizational knowledge determined, maintained, made available, and updated to address changing needs?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "Organizational knowledge is not systematically managed.",
    score2Criteria: "Key knowledge exists in individuals but is not captured.",
    score3Criteria: "Some knowledge management but gaps in capture or availability.",
    score4Criteria: "Knowledge is systematically determined, maintained, and made available.",
    score5Criteria: "Knowledge management system with lessons learned, best practice sharing, communities of practice, and AI-assisted knowledge discovery."
  },

  // ----------------------------------------
  // CLAUSE 7.2 - Competence
  // ----------------------------------------
  {
    sectionNumber: "7.2",
    standardReference: "ISO 9001:2015 Clause 7.2",
    standardText: "The organization shall: a) determine the necessary competence of person(s) doing work under its control that affects the performance and effectiveness of the quality management system; b) ensure that these persons are competent on the basis of appropriate education, training, or experience; c) where applicable, take actions to acquire the necessary competence, and evaluate the effectiveness of the actions taken; d) retain appropriate documented information as evidence of competence.",
    auditQuestion: "Is competence determined for persons affecting QMS performance, and are persons ensured competent through education, training, or experience?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "Competence requirements are not defined.",
    score2Criteria: "Informal understanding of competence needs but not documented.",
    score3Criteria: "Competence is partially managed but gaps exist.",
    score4Criteria: "Competence is systematically determined and verified with documented evidence.",
    score5Criteria: "Competency framework with skill matrices, career paths, personalized development plans, and continuous learning culture."
  },
  {
    sectionNumber: "7.2",
    standardReference: "ISO 9001:2015 Clause 7.2",
    standardText: "The organization shall: a) determine the necessary competence of person(s) doing work under its control that affects the performance and effectiveness of the quality management system; b) ensure that these persons are competent on the basis of appropriate education, training, or experience; c) where applicable, take actions to acquire the necessary competence, and evaluate the effectiveness of the actions taken; d) retain appropriate documented information as evidence of competence.",
    auditQuestion: "Are actions taken to acquire necessary competence evaluated for effectiveness, with documented information retained as evidence?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "No actions taken to address competence gaps.",
    score2Criteria: "Training occurs but effectiveness is not evaluated.",
    score3Criteria: "Actions are taken but effectiveness evaluation is incomplete.",
    score4Criteria: "Actions are taken, evaluated for effectiveness, and documented.",
    score5Criteria: "Learning effectiveness measured at multiple levels (Kirkpatrick model), with ROI analysis and continuous curriculum improvement."
  },

  // ----------------------------------------
  // CLAUSE 7.3 - Awareness
  // ----------------------------------------
  {
    sectionNumber: "7.3",
    standardReference: "ISO 9001:2015 Clause 7.3",
    standardText: "The organization shall ensure that persons doing work under the organization's control are aware of: a) the quality policy; b) relevant quality objectives; c) their contribution to the effectiveness of the quality management system, including the benefits of improved performance; d) the implications of not conforming with the quality management system requirements.",
    auditQuestion: "Are persons aware of the quality policy, relevant objectives, their contribution to QMS effectiveness, and implications of non-conformity?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "Personnel are not aware of QMS requirements.",
    score2Criteria: "Limited awareness; policy may be posted but not understood.",
    score3Criteria: "Some awareness exists but not consistently demonstrated.",
    score4Criteria: "Personnel demonstrate clear awareness of policy, objectives, and their role.",
    score5Criteria: "Quality awareness embedded in culture with regular reinforcement, gamification, and demonstrated behavioral change."
  },

  // ----------------------------------------
  // CLAUSE 7.4 - Communication
  // ----------------------------------------
  {
    sectionNumber: "7.4",
    standardReference: "ISO 9001:2015 Clause 7.4",
    standardText: "The organization shall determine the internal and external communications relevant to the quality management system, including: a) on what it will communicate; b) when to communicate; c) with whom to communicate; d) how to communicate; e) who communicates.",
    auditQuestion: "Has the organization determined what, when, with whom, how, and who communicates regarding QMS matters internally and externally?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "QMS communication is ad-hoc and not planned.",
    score2Criteria: "Some communication occurs but is not systematically planned.",
    score3Criteria: "Communication planning exists but not all elements are addressed.",
    score4Criteria: "Communication is systematically planned covering all required elements.",
    score5Criteria: "Integrated communication strategy with multi-channel approach, feedback loops, and effectiveness measurement."
  },

  // ----------------------------------------
  // CLAUSE 7.5 - Documented information
  // ----------------------------------------
  {
    sectionNumber: "7.5",
    standardReference: "ISO 9001:2015 Clause 7.5.1",
    standardText: "The organization's quality management system shall include: a) documented information required by this International Standard; b) documented information determined by the organization as being necessary for the effectiveness of the quality management system.",
    auditQuestion: "Does the QMS include all documented information required by ISO 9001 and additional documentation determined necessary for effectiveness?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "Required documented information is missing.",
    score2Criteria: "Some documentation exists but significant gaps.",
    score3Criteria: "Most required documentation exists but inadequacies identified.",
    score4Criteria: "All required documented information exists with supporting documentation.",
    score5Criteria: "Right-sized documentation with digital document management, version control, and continuous relevance review."
  },
  {
    sectionNumber: "7.5",
    standardReference: "ISO 9001:2015 Clause 7.5.2",
    standardText: "When creating and updating documented information, the organization shall ensure appropriate: a) identification and description (e.g. a title, date, author, or reference number); b) format (e.g. language, software version, graphics) and media (e.g. paper, electronic); c) review and approval for suitability and adequacy.",
    auditQuestion: "Is documented information appropriately identified, described, formatted, and reviewed/approved for suitability and adequacy?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "Documentation lacks identification or approval controls.",
    score2Criteria: "Basic identification exists but format or approval is inconsistent.",
    score3Criteria: "Some controls exist but identification, format, or approval has gaps.",
    score4Criteria: "All documentation is properly identified, formatted, and approved.",
    score5Criteria: "Automated document workflow with templates, approval routing, and compliance checking."
  },
  {
    sectionNumber: "7.5",
    standardReference: "ISO 9001:2015 Clause 7.5.3",
    standardText: "Documented information required by the quality management system and by this International Standard shall be controlled to ensure: a) it is available and suitable for use, where and when it is needed; b) it is adequately protected (e.g. from loss of confidentiality, improper use, or loss of integrity).",
    auditQuestion: "Is documented information controlled to ensure availability, suitability for use, and adequate protection from loss or improper use?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "Document control is inadequate.",
    score2Criteria: "Basic control exists but availability or protection issues.",
    score3Criteria: "Document control exists but gaps in availability or protection.",
    score4Criteria: "Comprehensive document control with availability and protection.",
    score5Criteria: "Enterprise content management with role-based access, audit trails, disaster recovery, and mobile accessibility."
  },

  // ----------------------------------------
  // CLAUSE 8.1 - Operational planning and control
  // ----------------------------------------
  {
    sectionNumber: "8.1",
    standardReference: "ISO 9001:2015 Clause 8.1",
    standardText: "The organization shall plan, implement and control the processes needed to meet the requirements for the provision of products and services, and to implement the actions determined in Clause 6, by: a) determining the requirements for the products and services; b) establishing criteria for the processes and the acceptance of products and services; c) determining the resources needed to achieve conformity to the product and service requirements; d) implementing control of the processes in accordance with the criteria; e) determining, maintaining and retaining documented information.",
    auditQuestion: "Are operational processes planned and controlled with determined requirements, criteria, resources, and documented information?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "Operational planning is inadequate.",
    score2Criteria: "Some planning exists but is informal or incomplete.",
    score3Criteria: "Planning exists but gaps in criteria, control, or documentation.",
    score4Criteria: "Comprehensive operational planning with all required elements.",
    score5Criteria: "Integrated operational excellence with lean principles, process automation, and continuous optimization."
  },
  {
    sectionNumber: "8.1",
    standardReference: "ISO 9001:2015 Clause 8.1",
    standardText: "The organization shall control planned changes and review the consequences of unintended changes, taking action to mitigate any adverse effects, as necessary. The organization shall ensure that outsourced processes are controlled.",
    auditQuestion: "Are planned changes controlled, unintended changes reviewed with mitigating actions, and outsourced processes controlled?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "Changes are not controlled; outsourced processes unmanaged.",
    score2Criteria: "Some change awareness but control is reactive.",
    score3Criteria: "Some change control but unintended changes or outsourcing has gaps.",
    score4Criteria: "Changes are controlled with documented actions; outsourcing effectively managed.",
    score5Criteria: "Mature change control with risk assessment, automated impact analysis, and supplier integration."
  },

  // ----------------------------------------
  // CLAUSE 8.2 - Requirements for products and services
  // ----------------------------------------
  {
    sectionNumber: "8.2",
    standardReference: "ISO 9001:2015 Clause 8.2.1",
    standardText: "Communication with customers shall include: a) providing information relating to products and services; b) handling enquiries, contracts or orders, including changes; c) obtaining customer feedback relating to products and services, including customer complaints; d) handling or controlling customer property; e) establishing specific requirements for contingency actions, when relevant.",
    auditQuestion: "Is customer communication effective covering product information, enquiries, feedback, complaints, customer property, and contingency requirements?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "Customer communication is inadequate.",
    score2Criteria: "Basic communication exists but is reactive.",
    score3Criteria: "Some communication exists but gaps in feedback or complaints.",
    score4Criteria: "Comprehensive customer communication covering all elements.",
    score5Criteria: "Omnichannel customer engagement with CRM integration, proactive communication, and sentiment analysis."
  },
  {
    sectionNumber: "8.2",
    standardReference: "ISO 9001:2015 Clause 8.2.2",
    standardText: "When determining the requirements for the products and services to be offered to customers, the organization shall ensure that: a) the requirements for the products and services are defined, including any applicable statutory and regulatory requirements and those considered necessary by the organization; b) the organization can meet the claims for the products and services it offers.",
    auditQuestion: "Are product/service requirements determined including statutory, regulatory, and organization-determined requirements with confidence in meeting claims?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "Product/service requirements are not systematically determined.",
    score2Criteria: "Basic requirements known but gaps in regulatory or claims.",
    score3Criteria: "Requirements determined but gaps in documentation or verification.",
    score4Criteria: "All requirements comprehensively determined with confidence in claims.",
    score5Criteria: "Requirements management system with regulatory tracking, automated compliance checks, and voice-of-customer integration."
  },
  {
    sectionNumber: "8.2",
    standardReference: "ISO 9001:2015 Clause 8.2.3",
    standardText: "The organization shall ensure that it has the ability to meet the requirements for products and services to be offered to customers. The organization shall conduct a review before committing to supply products and services to a customer.",
    auditQuestion: "Is a review conducted before commitment to supply, ensuring ability to meet requirements and resolving any differences?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "No review before commitment.",
    score2Criteria: "Informal review occurs but not documented.",
    score3Criteria: "Reviews occur but are not comprehensive or differences not always resolved.",
    score4Criteria: "Comprehensive review before commitment with documented resolution.",
    score5Criteria: "Automated order review with feasibility checking, capacity planning integration, and customer portal visibility."
  },

  // ----------------------------------------
  // CLAUSE 8.3 - Design and development
  // ----------------------------------------
  {
    sectionNumber: "8.3",
    standardReference: "ISO 9001:2015 Clause 8.3.1",
    standardText: "The organization shall establish, implement and maintain a design and development process that is appropriate to ensure the subsequent provision of products and services.",
    auditQuestion: "Is a design and development process established that is appropriate for ensuring subsequent product/service provision?",
    score0Criteria: "Not applicable - organization does not perform design and development.",
    score1Criteria: "No design and development process exists.",
    score2Criteria: "Informal design process exists but not documented.",
    score3Criteria: "Process exists but is not comprehensive or appropriately controlled.",
    score4Criteria: "Comprehensive design and development process established and maintained.",
    score5Criteria: "Stage-gate process with digital PLM, cross-functional collaboration, and innovation pipeline management."
  },
  {
    sectionNumber: "8.3",
    standardReference: "ISO 9001:2015 Clause 8.3.2",
    standardText: "In determining the stages and controls for design and development, the organization shall consider: a) the nature, duration and complexity of the design and development activities; b) the required process stages, including applicable design and development reviews; c) the required design and development verification and validation activities; d) the responsibilities and authorities involved in the design and development process.",
    auditQuestion: "Does design planning consider nature/duration/complexity, required stages, verification/validation, and responsibilities?",
    score0Criteria: "Not applicable - organization does not perform design and development.",
    score1Criteria: "Design planning does not consider required elements.",
    score2Criteria: "Some planning exists but is informal.",
    score3Criteria: "Planning addresses some elements but has gaps.",
    score4Criteria: "Comprehensive design planning considering all elements.",
    score5Criteria: "Design for excellence (DFX) methodology with concurrent engineering, risk-based planning, and agile adaptation."
  },
  {
    sectionNumber: "8.3",
    standardReference: "ISO 9001:2015 Clause 8.3.3",
    standardText: "The organization shall determine the requirements essential for the specific types of products and services to be designed and developed.",
    auditQuestion: "Are design inputs determined including functional, performance, statutory, regulatory requirements, and consequences of failure?",
    score0Criteria: "Not applicable - organization does not perform design and development.",
    score1Criteria: "Design inputs are not determined.",
    score2Criteria: "Some inputs identified but incomplete.",
    score3Criteria: "Inputs determined but gaps in regulatory or failure considerations.",
    score4Criteria: "All design inputs comprehensively determined and documented.",
    score5Criteria: "Requirements traceability matrix with FMEA integration, regulatory intelligence, and customer needs analysis."
  },
  {
    sectionNumber: "8.3",
    standardReference: "ISO 9001:2015 Clause 8.3.4",
    standardText: "The organization shall apply controls to the design and development process to ensure that: a) the results to be achieved are defined; b) reviews are conducted to evaluate the ability of the results of design and development to meet requirements; c) verification activities are conducted to ensure that the design and development outputs meet the input requirements; d) validation activities are conducted to ensure that the resulting products and services meet the requirements for the specified application or intended use.",
    auditQuestion: "Are design controls applied including reviews, verification that outputs meet inputs, and validation that products/services meet intended use?",
    score0Criteria: "Not applicable - organization does not perform design and development.",
    score1Criteria: "Design controls are not applied.",
    score2Criteria: "Some informal reviews occur but not systematic.",
    score3Criteria: "Some controls exist but gaps in review, verification, or validation.",
    score4Criteria: "Comprehensive design controls with documented activities.",
    score5Criteria: "Integrated V&V with simulation, prototyping, user testing, and design analytics."
  },
  {
    sectionNumber: "8.3",
    standardReference: "ISO 9001:2015 Clause 8.3.6",
    standardText: "The organization shall identify, review and control changes made during, or subsequent to, the design and development of products and services, to the extent necessary to ensure that there is no adverse impact on conformity to requirements.",
    auditQuestion: "Are design changes identified, reviewed, controlled, and documented to ensure no adverse impact on conformity?",
    score0Criteria: "Not applicable - organization does not perform design and development.",
    score1Criteria: "Design changes are not controlled.",
    score2Criteria: "Informal change awareness but no systematic control.",
    score3Criteria: "Some change control but review or documentation incomplete.",
    score4Criteria: "Design changes systematically controlled and documented.",
    score5Criteria: "Engineering change management system with impact analysis, approval workflow, and configuration management."
  },

  // ----------------------------------------
  // CLAUSE 8.4 - Control of externally provided processes, products and services
  // ----------------------------------------
  {
    sectionNumber: "8.4",
    standardReference: "ISO 9001:2015 Clause 8.4.1",
    standardText: "The organization shall ensure that externally provided processes, products and services conform to requirements. The organization shall determine the controls to be applied to externally provided processes, products and services.",
    auditQuestion: "Are controls determined for externally provided processes, products, and services to ensure conformity to requirements?",
    score0Criteria: "Not applicable - no externally provided processes, products, or services.",
    score1Criteria: "No controls exist for external providers.",
    score2Criteria: "Minimal controls; reliance on provider claims.",
    score3Criteria: "Some controls exist but not comprehensive or consistent.",
    score4Criteria: "Comprehensive controls determined and applied.",
    score5Criteria: "Risk-based supplier control with tiered management, real-time monitoring, and collaborative quality agreements."
  },
  {
    sectionNumber: "8.4",
    standardReference: "ISO 9001:2015 Clause 8.4.1",
    standardText: "The organization shall determine and apply criteria for the evaluation, selection, monitoring of performance, and re-evaluation of external providers, based on their ability to provide processes or products and services in accordance with requirements. The organization shall retain documented information of these activities.",
    auditQuestion: "Are criteria established for evaluation, selection, performance monitoring, and re-evaluation of external providers with documented information retained?",
    score0Criteria: "Not applicable - no externally provided processes, products, or services.",
    score1Criteria: "No evaluation criteria or documentation.",
    score2Criteria: "Informal evaluation without documented criteria.",
    score3Criteria: "Some evaluation but criteria incomplete or documentation gaps.",
    score4Criteria: "Comprehensive criteria with documented evaluation and monitoring.",
    score5Criteria: "Supplier scorecard system with automated performance tracking, development programs, and strategic partnerships."
  },
  {
    sectionNumber: "8.4",
    standardReference: "ISO 9001:2015 Clause 8.4.3",
    standardText: "The organization shall ensure the adequacy of requirements prior to their communication to the external provider. The organization shall communicate to external providers its requirements for: a) the processes, products and services to be provided; b) the approval of products and services, methods, processes and equipment, and release of products and services; c) competence, including any required qualification of persons; d) the external providers' interactions with the organization; e) control and monitoring of the external providers' performance to be applied by the organization; f) verification or validation activities that the organization, or its customer, intends to perform at the external providers' premises.",
    auditQuestion: "Are requirements adequately communicated to external providers including approval methods, competence, interactions, and verification activities?",
    score0Criteria: "Not applicable - no externally provided processes, products, or services.",
    score1Criteria: "Requirements are not communicated to external providers.",
    score2Criteria: "Basic requirements communicated but incomplete.",
    score3Criteria: "Requirements communicated but gaps in some areas.",
    score4Criteria: "All requirements comprehensively communicated with confirmation.",
    score5Criteria: "Supplier portal with requirement flow-down, acknowledgment tracking, and collaborative specification development."
  },

  // ----------------------------------------
  // CLAUSE 8.5 - Production and service provision
  // ----------------------------------------
  {
    sectionNumber: "8.5",
    standardReference: "ISO 9001:2015 Clause 8.5.1",
    standardText: "The organization shall implement production and service provision under controlled conditions. Controlled conditions shall include, as applicable: a) the availability of documented information that defines the characteristics of the products to be produced, the services to be provided, or the activities to be performed and the results to be achieved; b) the availability and use of suitable monitoring and measuring resources; c) the implementation of monitoring and measurement activities at appropriate stages.",
    auditQuestion: "Is production/service provision implemented under controlled conditions with documented information, monitoring resources, and measurement activities?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "Production/service provision is not controlled.",
    score2Criteria: "Basic controls exist but documentation or monitoring is weak.",
    score3Criteria: "Controls exist but gaps in documentation or monitoring.",
    score4Criteria: "Comprehensive controlled conditions with systematic monitoring.",
    score5Criteria: "Smart manufacturing/service operations with IoT monitoring, statistical process control, and predictive quality."
  },
  {
    sectionNumber: "8.5",
    standardReference: "ISO 9001:2015 Clause 8.5.1",
    standardText: "Controlled conditions shall include, as applicable: d) the use of suitable infrastructure and environment for the operation of processes; e) the appointment of competent persons, including any required qualification; f) the validation, and periodic revalidation, of the ability to achieve planned results for any processes for production and service provision, where the resulting output cannot be verified by subsequent monitoring or measurement; g) the implementation of actions to prevent human error; h) the implementation of release, delivery and post-delivery activities.",
    auditQuestion: "Are suitable infrastructure, competent persons, process validation, human error prevention, and release/delivery activities controlled?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "Key controlled conditions are not addressed.",
    score2Criteria: "Some conditions addressed but significant gaps.",
    score3Criteria: "Conditions controlled but gaps in validation or error prevention.",
    score4Criteria: "All controlled conditions systematically addressed.",
    score5Criteria: "Human factors engineering, poka-yoke implementation, and end-to-end delivery excellence."
  },
  {
    sectionNumber: "8.5",
    standardReference: "ISO 9001:2015 Clause 8.5.2",
    standardText: "The organization shall use suitable means to identify outputs when it is necessary to ensure the conformity of products and services. The organization shall identify the status of outputs with respect to monitoring and measurement requirements throughout production and service provision. The organization shall control the unique identification of the outputs when traceability is a requirement, and shall retain the documented information necessary to enable traceability.",
    auditQuestion: "Are outputs identified, status tracked through production/service provision, and traceability maintained where required?",
    score0Criteria: "Not applicable - no identification or traceability required.",
    score1Criteria: "Output identification and traceability are not managed.",
    score2Criteria: "Basic identification exists but status tracking is weak.",
    score3Criteria: "Identification exists but traceability or status tracking has gaps.",
    score4Criteria: "Outputs systematically identified with status tracking and traceability.",
    score5Criteria: "Digital traceability with serialization, blockchain where applicable, and real-time tracking visibility."
  },
  {
    sectionNumber: "8.5",
    standardReference: "ISO 9001:2015 Clause 8.5.3",
    standardText: "The organization shall exercise care with property belonging to customers or external providers while it is under the organization's control or being used by the organization. The organization shall identify, verify, protect and safeguard customers' or external providers' property provided for use or incorporation into the products and services.",
    auditQuestion: "Is customer or external provider property identified, verified, protected, and safeguarded while under the organization's control?",
    score0Criteria: "Not applicable - no customer or external provider property handled.",
    score1Criteria: "Customer/external provider property is not controlled.",
    score2Criteria: "Basic awareness but controls are informal.",
    score3Criteria: "Some controls exist but identification or protection has gaps.",
    score4Criteria: "Property systematically identified, verified, protected, and safeguarded.",
    score5Criteria: "Property management system with digital tracking, condition monitoring, and proactive customer communication."
  },
  {
    sectionNumber: "8.5",
    standardReference: "ISO 9001:2015 Clause 8.5.4",
    standardText: "The organization shall preserve the outputs during production and service provision, to the extent necessary to ensure conformity to requirements. NOTE Preservation can include identification, handling, contamination control, packaging, storage, transmission or transportation, and protection.",
    auditQuestion: "Are outputs preserved during production and service provision to ensure conformity (handling, storage, packaging, protection)?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "Preservation of outputs is not controlled.",
    score2Criteria: "Basic preservation but some areas are weak.",
    score3Criteria: "Preservation exists but gaps in handling, storage, or protection.",
    score4Criteria: "Outputs systematically preserved with documented controls.",
    score5Criteria: "Environmental monitoring, automated handling systems, and preservation optimization."
  },
  {
    sectionNumber: "8.5",
    standardReference: "ISO 9001:2015 Clause 8.5.5",
    standardText: "The organization shall meet the requirements for post-delivery activities associated with the products and services. In determining the extent of post-delivery activities that are required, the organization shall consider: a) statutory and regulatory requirements; b) the potential undesired consequences associated with its products and services; c) the nature, use and intended lifetime of its products and services; d) customer requirements; e) customer feedback.",
    auditQuestion: "Are post-delivery activities determined and implemented considering statutory requirements, potential consequences, product nature, and customer feedback?",
    score0Criteria: "Not applicable - no post-delivery activities required.",
    score1Criteria: "Post-delivery activities are not considered.",
    score2Criteria: "Basic warranty/support exists but not systematic.",
    score3Criteria: "Some post-delivery activities but not all factors considered.",
    score4Criteria: "Post-delivery activities comprehensively determined and implemented.",
    score5Criteria: "Lifecycle management with predictive maintenance, proactive support, and customer success programs."
  },
  {
    sectionNumber: "8.5",
    standardReference: "ISO 9001:2015 Clause 8.5.6",
    standardText: "The organization shall review and control changes for production or service provision, to the extent necessary to ensure continuing conformity with requirements. The organization shall retain documented information describing the results of the review of changes, the person(s) authorizing the change, and any necessary actions arising from the review.",
    auditQuestion: "Are changes to production/service provision reviewed and controlled with documented results, authorization, and necessary actions?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "Production/service changes are not reviewed or controlled.",
    score2Criteria: "Informal change awareness but no systematic control.",
    score3Criteria: "Some change control but documentation or authorization incomplete.",
    score4Criteria: "Changes systematically reviewed and controlled with documentation.",
    score5Criteria: "Manufacturing/service change control with impact assessment, validation requirements, and lessons learned."
  },

  // ----------------------------------------
  // CLAUSE 8.6 - Release of products and services
  // ----------------------------------------
  {
    sectionNumber: "8.6",
    standardReference: "ISO 9001:2015 Clause 8.6",
    standardText: "The organization shall implement planned arrangements, at appropriate stages, to verify that the product and service requirements have been met. The release of products and services to the customer shall not proceed until the planned arrangements have been satisfactorily completed, unless otherwise approved by a relevant authority and, as applicable, by the customer. The organization shall retain documented information on the release of products and services.",
    auditQuestion: "Are planned arrangements implemented to verify requirements are met, with release held until completion and documented information retained?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "Release controls are not implemented.",
    score2Criteria: "Basic release checks exist but not systematic.",
    score3Criteria: "Release controls exist but verification or documentation has gaps.",
    score4Criteria: "Comprehensive release controls with documented verification.",
    score5Criteria: "Automated release gates with quality checkpoints, electronic signatures, and certificate of conformance generation."
  },

  // ----------------------------------------
  // CLAUSE 8.7 - Control of nonconforming outputs
  // ----------------------------------------
  {
    sectionNumber: "8.7",
    standardReference: "ISO 9001:2015 Clause 8.7.1",
    standardText: "The organization shall ensure that outputs that do not conform to their requirements are identified and controlled to prevent their unintended use or delivery. The organization shall take appropriate action based on the nature of the nonconformity and its effect on the conformity of products and services. This shall also apply to nonconforming products and services detected after delivery of products, during or after the provision of services.",
    auditQuestion: "Are nonconforming outputs identified and controlled to prevent unintended use or delivery, with appropriate action taken?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "Nonconforming outputs are not identified or controlled.",
    score2Criteria: "Some awareness but control is inconsistent.",
    score3Criteria: "Control exists but identification or action is inconsistent.",
    score4Criteria: "Nonconforming outputs systematically identified and controlled.",
    score5Criteria: "Real-time nonconformance detection with automated segregation, escalation, and disposition workflow."
  },
  {
    sectionNumber: "8.7",
    standardReference: "ISO 9001:2015 Clause 8.7.2",
    standardText: "The organization shall retain documented information that: a) describes the nonconformity; b) describes the actions taken; c) describes any concessions obtained; d) identifies the authority deciding the action in respect of the nonconformity.",
    auditQuestion: "Is documented information retained describing nonconformities, actions taken, concessions, and decision authority?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "No documented information on nonconformities.",
    score2Criteria: "Basic records exist but incomplete.",
    score3Criteria: "Documentation exists but descriptions or authority incomplete.",
    score4Criteria: "Comprehensive documentation on all nonconformities.",
    score5Criteria: "NCR system with trend analysis, cost of poor quality tracking, and integration with corrective action."
  },

  // ----------------------------------------
  // CLAUSE 9.1 - Monitoring, measurement, analysis and evaluation
  // ----------------------------------------
  {
    sectionNumber: "9.1",
    standardReference: "ISO 9001:2015 Clause 9.1.1",
    standardText: "The organization shall determine: a) what needs to be monitored and measured; b) the methods for monitoring, measurement, analysis and evaluation needed to ensure valid results; c) when the monitoring and measuring shall be performed; d) when the results from monitoring and measurement shall be analysed and evaluated. The organization shall evaluate the performance and the effectiveness of the quality management system. The organization shall retain appropriate documented information as evidence of the results.",
    auditQuestion: "Has the organization determined what to monitor/measure, methods, timing, and analysis/evaluation with documented results?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "Monitoring and measurement is not systematically determined.",
    score2Criteria: "Some monitoring exists but methods or timing unclear.",
    score3Criteria: "Monitoring exists but methods, timing, or analysis incomplete.",
    score4Criteria: "Comprehensive monitoring with defined methods, timing, and analysis.",
    score5Criteria: "Integrated performance management system with dashboards, predictive analytics, and automated reporting."
  },
  {
    sectionNumber: "9.1",
    standardReference: "ISO 9001:2015 Clause 9.1.2",
    standardText: "The organization shall monitor customers' perceptions of the degree to which their needs and expectations have been fulfilled. The organization shall determine the methods for obtaining, monitoring and reviewing this information. NOTE Examples of monitoring customer perceptions can include customer surveys, customer feedback on delivered products and services, meetings with customers, market-share analysis, compliments, warranty claims and dealer reports.",
    auditQuestion: "Does the organization monitor customer perceptions using determined methods (surveys, feedback, meetings, complaints, compliments)?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "Customer satisfaction is not monitored.",
    score2Criteria: "Occasional feedback collected but not systematic.",
    score3Criteria: "Some monitoring but methods are limited or inconsistent.",
    score4Criteria: "Systematic monitoring using multiple methods with analysis.",
    score5Criteria: "Voice of customer program with NPS, journey mapping, sentiment analysis, and customer advisory boards."
  },
  {
    sectionNumber: "9.1",
    standardReference: "ISO 9001:2015 Clause 9.1.3",
    standardText: "The organization shall analyse and evaluate appropriate data and information arising from monitoring and measurement. The results of analysis shall be used to evaluate: a) conformity of products and services; b) the degree of customer satisfaction; c) the performance and effectiveness of the quality management system; d) if planning has been implemented effectively; e) the effectiveness of actions taken to address risks and opportunities; f) the performance of external providers; g) the need for improvements to the quality management system.",
    auditQuestion: "Is data analyzed and evaluated to assess conformity, customer satisfaction, QMS effectiveness, planning, risk actions, and external provider performance?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "Data analysis is not performed.",
    score2Criteria: "Basic data collection but analysis is limited.",
    score3Criteria: "Some analysis but not all required areas evaluated.",
    score4Criteria: "Comprehensive analysis covering all required areas.",
    score5Criteria: "Advanced analytics with data visualization, benchmarking, predictive insights, and automated improvement identification."
  },

  // ----------------------------------------
  // CLAUSE 9.2 - Internal audit
  // ----------------------------------------
  {
    sectionNumber: "9.2",
    standardReference: "ISO 9001:2015 Clause 9.2.1",
    standardText: "The organization shall conduct internal audits at planned intervals to provide information on whether the quality management system: a) conforms to the organization's own requirements for its quality management system and the requirements of this International Standard; b) is effectively implemented and maintained.",
    auditQuestion: "Are internal audits conducted at planned intervals to verify QMS conformity to organizational requirements and ISO 9001, and effective implementation?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "Internal audits are not conducted.",
    score2Criteria: "Audits occur but not at planned intervals.",
    score3Criteria: "Audits conducted but scope incomplete or intervals inconsistent.",
    score4Criteria: "Internal audits conducted at planned intervals with comprehensive scope.",
    score5Criteria: "Risk-based audit program with auditor development, continuous auditing techniques, and audit analytics."
  },
  {
    sectionNumber: "9.2",
    standardReference: "ISO 9001:2015 Clause 9.2.2",
    standardText: "The organization shall: a) plan, establish, implement and maintain an audit programme(s) including the frequency, methods, responsibilities, planning requirements and reporting, which shall take into consideration the importance of the processes concerned, changes affecting the organization, and the results of previous audits; b) define the audit criteria and scope for each audit; c) select auditors and conduct audits to ensure objectivity and the impartiality of the audit process; d) ensure that the results of the audits are reported to relevant management; e) take appropriate correction and corrective actions without undue delay; f) retain documented information as evidence of the implementation of the audit programme and the audit results.",
    auditQuestion: "Is an audit program established with defined criteria, objective auditors, reported results, timely actions, and documented information?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "No audit program exists.",
    score2Criteria: "Basic audits occur but program is informal.",
    score3Criteria: "Program exists but gaps in objectivity, reporting, or follow-up.",
    score4Criteria: "Comprehensive audit program with all required elements.",
    score5Criteria: "Mature audit program with certified auditors, root cause focus, value-added findings, and continuous program improvement."
  },

  // ----------------------------------------
  // CLAUSE 9.3 - Management review
  // ----------------------------------------
  {
    sectionNumber: "9.3",
    standardReference: "ISO 9001:2015 Clause 9.3.1",
    standardText: "Top management shall review the organization's quality management system, at planned intervals, to ensure its continuing suitability, adequacy, effectiveness and alignment with the strategic direction of the organization.",
    auditQuestion: "Does top management review the QMS at planned intervals to ensure suitability, adequacy, effectiveness, and strategic alignment?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "Management reviews are not conducted.",
    score2Criteria: "Reviews occur occasionally but not at planned intervals.",
    score3Criteria: "Reviews occur but strategic alignment not considered.",
    score4Criteria: "Management reviews conducted at planned intervals with strategic alignment.",
    score5Criteria: "Strategic quality reviews integrated with business planning, with forward-looking analysis and scenario planning."
  },
  {
    sectionNumber: "9.3",
    standardReference: "ISO 9001:2015 Clause 9.3.2",
    standardText: "The management review shall be planned and carried out taking into consideration: a) the status of actions from previous management reviews; b) changes in external and internal issues that are relevant to the quality management system; c) information on the performance and effectiveness of the quality management system, including trends in customer satisfaction, objective achievement, process performance, nonconformities, monitoring results, audit results, and external provider performance; d) the adequacy of resources; e) the effectiveness of actions taken to address risks and opportunities; f) opportunities for improvement.",
    auditQuestion: "Does management review consider previous actions, context changes, QMS performance (customer satisfaction, objectives, processes, nonconformities, audits), resources, and risk actions?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "Management review inputs are inadequate.",
    score2Criteria: "Some inputs considered but coverage is limited.",
    score3Criteria: "Most inputs considered but not all elements addressed.",
    score4Criteria: "All required inputs comprehensively considered.",
    score5Criteria: "Executive dashboard with real-time KPIs, trend analysis, benchmarking, and strategic recommendations."
  },
  {
    sectionNumber: "9.3",
    standardReference: "ISO 9001:2015 Clause 9.3.3",
    standardText: "The outputs of the management review shall include decisions and actions related to: a) opportunities for improvement; b) any need for changes to the quality management system; c) resource needs. The organization shall retain documented information as evidence of the results of management reviews.",
    auditQuestion: "Do management review outputs include decisions on improvement opportunities, QMS changes, and resource needs with documented information retained?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "Management review outputs are not documented.",
    score2Criteria: "Some outputs documented but incomplete.",
    score3Criteria: "Outputs exist but not all decisions documented or actioned.",
    score4Criteria: "All outputs documented with decisions and actions tracked.",
    score5Criteria: "Action tracking system with accountability, progress monitoring, and effectiveness verification."
  },

  // ----------------------------------------
  // CLAUSE 10.1 - Improvement - General
  // ----------------------------------------
  {
    sectionNumber: "10.1",
    standardReference: "ISO 9001:2015 Clause 10.1",
    standardText: "The organization shall determine and select opportunities for improvement and implement any necessary actions to meet customer requirements and enhance customer satisfaction. These shall include: a) improving products and services to meet requirements as well as to address future needs and expectations; b) correcting, preventing or reducing undesired effects; c) improving the performance and effectiveness of the quality management system.",
    auditQuestion: "Does the organization determine, select, and implement improvement opportunities to enhance customer satisfaction and QMS performance?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "Improvement is not systematically addressed.",
    score2Criteria: "Reactive improvements occur but not proactive.",
    score3Criteria: "Some improvement activities but not systematic or comprehensive.",
    score4Criteria: "Improvement opportunities systematically determined and implemented.",
    score5Criteria: "Continuous improvement culture with innovation programs, Kaizen events, and breakthrough improvement initiatives."
  },

  // ----------------------------------------
  // CLAUSE 10.2 - Nonconformity and corrective action
  // ----------------------------------------
  {
    sectionNumber: "10.2",
    standardReference: "ISO 9001:2015 Clause 10.2.1",
    standardText: "When a nonconformity occurs, including any arising from complaints, the organization shall: a) react to the nonconformity and, as applicable take action to control and correct it and deal with the consequences; b) evaluate the need for action to eliminate the cause(s) of the nonconformity, in order that it does not recur or occur elsewhere; c) implement any action needed; d) review the effectiveness of any corrective action taken; e) update risks and opportunities determined during planning, if necessary; f) make changes to the quality management system, if necessary.",
    auditQuestion: "When nonconformities occur, is there reaction, cause evaluation, action implementation, effectiveness review, and risk/QMS updates?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "Nonconformity and corrective action process is inadequate.",
    score2Criteria: "Basic correction occurs but root cause not addressed.",
    score3Criteria: "Process exists but gaps in root cause or effectiveness review.",
    score4Criteria: "Comprehensive process with root cause analysis and effectiveness review.",
    score5Criteria: "8D or A3 methodology with systemic root cause analysis, horizontal deployment, and prevention focus."
  },
  {
    sectionNumber: "10.2",
    standardReference: "ISO 9001:2015 Clause 10.2.2",
    standardText: "The organization shall retain documented information as evidence of: a) the nature of the nonconformities and any subsequent actions taken; b) the results of any corrective action.",
    auditQuestion: "Is documented information retained on nonconformity nature, actions taken, and corrective action results?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "No documented information on corrective actions.",
    score2Criteria: "Basic records exist but incomplete.",
    score3Criteria: "Documentation exists but is inconsistent.",
    score4Criteria: "Comprehensive documentation on all corrective actions.",
    score5Criteria: "CAPA system with trend analysis, effectiveness metrics, and integration with risk management."
  },

  // ----------------------------------------
  // CLAUSE 10.3 - Continual improvement
  // ----------------------------------------
  {
    sectionNumber: "10.3",
    standardReference: "ISO 9001:2015 Clause 10.3",
    standardText: "The organization shall continually improve the suitability, adequacy and effectiveness of the quality management system. The organization shall consider the results of analysis and evaluation, and the outputs from management review, to determine if there are needs or opportunities that shall be addressed as part of continual improvement.",
    auditQuestion: "Does the organization continually improve QMS suitability, adequacy, and effectiveness considering analysis results and management review outputs?",
    score0Criteria: "Not applicable to this organization's context.",
    score1Criteria: "Continual improvement is not evident.",
    score2Criteria: "Occasional improvements but not systematic.",
    score3Criteria: "Some improvement but not linked to analysis and management review.",
    score4Criteria: "Systematic continual improvement linked to analysis and review.",
    score5Criteria: "Excellence culture with maturity assessments, benchmarking, innovation pipeline, and organizational learning."
  }
];


// ============================================
// HELPER FUNCTION: Get section ID by number
// ============================================
export function getSectionNumberMap(sections: typeof standardSections) {
  return sections.reduce((map, section, index) => {
    map[section.sectionNumber] = index + 1;
    return map;
  }, {} as Record<string, number>);
}
