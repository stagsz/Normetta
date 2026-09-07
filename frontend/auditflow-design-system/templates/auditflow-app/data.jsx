// Normetta mock data — ISO 9001:2015 self-assessment

const CLAUSES = [
  { id: '4', title: 'Context of the organization', total: 12, conformant: 11, observation: 1, nonconformity: 0 },
  { id: '5', title: 'Leadership',                   total: 14, conformant: 13, observation: 1, nonconformity: 0 },
  { id: '6', title: 'Planning',                     total: 10, conformant: 8,  observation: 2, nonconformity: 0 },
  { id: '7', title: 'Support',                      total: 22, conformant: 16, observation: 4, nonconformity: 2 },
  { id: '8', title: 'Operation',                    total: 28, conformant: 24, observation: 3, nonconformity: 1 },
  { id: '9', title: 'Performance evaluation',       total: 18, conformant: 15, observation: 2, nonconformity: 1 },
  { id: '10', title: 'Improvement',                 total: 9,  conformant: 9,  observation: 0, nonconformity: 0 },
];

const FINDINGS = [
  { id: 'NC-2026-0184', clause: '8.5.1', status: 'nonconformity', severity: 'Major', title: 'Production work instructions not at point of use', owner: 'Marcus Reid', due: '2026-06-18', overdue: true },
  { id: 'NC-2026-0179', clause: '9.2.2', status: 'nonconformity', severity: 'Major', title: 'Internal audit programme missed Q1 cycle', owner: 'Dana Okoye', due: '2026-06-09', overdue: true },
  { id: 'OB-2026-0203', clause: '7.1.5', status: 'observation', severity: 'Minor', title: 'Calibration records lack next-due dates for 3 gauges', owner: 'Priya Nair', due: '2026-06-27', overdue: false },
  { id: 'OB-2026-0198', clause: '6.1', status: 'observation', severity: 'Minor', title: 'Risk register not reviewed since last management review', owner: 'Dana Okoye', due: '2026-07-02', overdue: false },
  { id: 'OB-2026-0191', clause: '7.2', status: 'observation', severity: 'Minor', title: 'Competence matrix missing two new hires', owner: 'Sam Whitfield', due: '2026-07-05', overdue: false },
];

// One clause's question set, used in the Assessment screen
const QUESTIONS = [
  { ref: '7.1.5', text: 'Are monitoring and measuring resources suitable, maintained, and calibrated against traceable standards?', guidance: 'Evidence: calibration certificates, equipment register, recall records for out-of-tolerance devices.' },
  { ref: '7.1.6', text: 'Has the organization determined the knowledge necessary for the operation of its processes?', guidance: 'Evidence: lessons-learned log, knowledge-capture procedure, succession notes.' },
  { ref: '7.2',   text: 'Is the competence of persons doing work under the QMS determined, evidenced, and maintained?', guidance: 'Evidence: training records, competence matrix, qualification certificates.' },
  { ref: '7.3',   text: 'Are persons aware of the quality policy, relevant objectives, and their contribution to the QMS?', guidance: 'Evidence: induction records, awareness sessions, internal comms.' },
  { ref: '7.4',   text: 'Has the organization determined internal and external communications relevant to the QMS?', guidance: 'Evidence: communication plan, stakeholder matrix.' },
];

// Recent assessment activity + upcoming audits — Dashboard row carousel
const ACTIVITY = [
  { kind: 'assessment', id: 'ASM-204', title: 'Q2 internal self-assessment', meta: 'Clauses 4–10 · 113 controls', score: 92, owner: 'Dana Okoye', when: 'Updated today' },
  { kind: 'assessment', id: 'ASM-198', title: 'Supplier evaluation review', meta: 'Clause 8.4 · 18 controls', score: 78, owner: 'Priya Nair', when: 'Updated 3 days ago' },
  { kind: 'audit', id: 'AUD-061', title: 'Stage 2 certification audit', meta: 'BSI · on-site', score: null, owner: 'External', when: 'In 14 days · 30 Jun' },
  { kind: 'assessment', id: 'ASM-186', title: 'Calibration & measurement', meta: 'Clause 7.1.5 · 9 controls', score: 88, owner: 'Marcus Reid', when: 'Updated 1 week ago' },
  { kind: 'audit', id: 'AUD-058', title: 'Internal audit — Operations', meta: 'Clause 8 · scheduled', score: null, owner: 'Sam Whitfield', when: 'In 21 days · 7 Jul' },
  { kind: 'assessment', id: 'ASM-180', title: 'Document & records control', meta: 'Clause 7.5 · 14 controls', score: 95, owner: 'Dana Okoye', when: 'Updated 2 weeks ago' },
];

window.AFData = { CLAUSES, FINDINGS, QUESTIONS, ACTIVITY };
