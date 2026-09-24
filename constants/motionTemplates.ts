
export interface MotionTemplate {
  id: string;
  title: string;
  description: string;
  fields: MotionField[];
  template: string;
}

export interface MotionField {
  id: string;
  label: string;
  placeholder: string;
  type: 'text' | 'textarea' | 'date';
  description?: string;
}

export const MOTION_TEMPLATES: MotionTemplate[] = [
  {
    id: 'motion-to-dismiss',
    title: 'Motion to Dismiss',
    description: 'Request the court to dismiss the case based on procedural or jurisdictional defects.',
    fields: [
      { id: 'courtName', label: 'Court Name', placeholder: 'e.g. Denver District Court', type: 'text' },
      { id: 'caseNumber', label: 'Case Number', placeholder: 'e.g. 2023CV30123', type: 'text' },
      { id: 'plaintiff', label: 'Plaintiff/Petitioner', placeholder: 'Name of party suing', type: 'text' },
      { id: 'defendant', label: 'Defendant/Respondent', placeholder: 'Your name or client name', type: 'text' },
      { id: 'grounds', label: 'Grounds for Dismissal', placeholder: 'e.g. Lack of subject matter jurisdiction', type: 'textarea', description: 'The specific legal reason why the case should be dismissed.' },
      { id: 'argument', label: 'Legal Argument', placeholder: 'Explain why the law supports dismissal...', type: 'textarea' }
    ],
    template: `[COURT_NAME]
STATE OF COLORADO

[PLAINTIFF],
Plaintiff,

v.

[DEFENDANT],
Defendant.

Case No: [CASE_NUMBER]

MOTION TO DISMISS

Defendant, [DEFENDANT], by and through counsel, hereby moves this Court to dismiss the above-captioned matter.

As grounds for this Motion, Defendant states as follows:
1. [GROUNDS]

ARGUMENT
[ARGUMENT]

WHEREFORE, Defendant respectfully requests that this Court enter an order dismissing this action with prejudice.

Respectfully submitted,
/s/ 500_IQ_Architect
`
  },
  {
    id: 'motion-to-suppress',
    title: 'Motion to Suppress Evidence',
    description: 'Request to exclude evidence obtained in violation of constitutional rights.',
    fields: [
      { id: 'courtName', label: 'Court Name', placeholder: 'e.g. Denver District Court', type: 'text' },
      { id: 'caseNumber', label: 'Case Number', placeholder: 'e.g. 2023CR100', type: 'text' },
      { id: 'defendant', label: 'Defendant', placeholder: 'Name of the accused', type: 'text' },
      { id: 'evidence', label: 'Evidence to Suppress', placeholder: 'e.g. Statements made during arrest', type: 'text' },
      { id: 'violation', label: 'Constitutional Violation', placeholder: 'e.g. Fourth Amendment violation (unlawful search)', type: 'textarea' }
    ],
    template: `[COURT_NAME]
STATE OF COLORADO

PEOPLE OF THE STATE OF COLORADO,
Plaintiff,

v.

[DEFENDANT],
Defendant.

Case No: [CASE_NUMBER]

MOTION TO SUPPRESS EVIDENCE ([EVIDENCE])

Defendant, [DEFENDANT], moves to suppress [EVIDENCE] on the following grounds:

1. The evidence was obtained in violation of the Defendant's rights under the [VIOLATION].
2. [ADDITIONAL_DETAILS]

WHEREFORE, Defendant requests a hearing on this matter and that the Court suppress the aforementioned evidence.
`
  },
  {
    id: 'motion-for-continuance',
    title: 'Motion for Continuance',
    description: 'Request to postpone a hearing or trial date.',
    fields: [
      { id: 'courtName', label: 'Court Name', placeholder: 'e.g. Denver District Court', type: 'text' },
      { id: 'caseNumber', label: 'Case Number', placeholder: 'e.g. 2023CV30123', type: 'text' },
      { id: 'currentDate', label: 'Current Date', placeholder: 'YYYY-MM-DD', type: 'date' },
      { id: 'reason', label: 'Reason for Request', placeholder: 'e.g. Unavailability of key witness', type: 'textarea' }
    ],
    template: `[COURT_NAME]
STATE OF COLORADO

Case No: [CASE_NUMBER]

MOTION FOR CONTINUANCE

The parties hereby move to continue the hearing currently scheduled for [CURRENT_DATE].

The reason for this request is:
[REASON]

The parties have conferred and [OPPOSING_PARTY_POSITION].
`
  },
  {
    id: 'motion-to-disqualify',
    title: 'Motion to Disqualify Judge',
    description: 'NUCLEAR OPTION: Request removal of a judge based on actual or perceived bias (C.R.C.P. 97).',
    fields: [
      { id: 'courtName', label: 'Court Name', placeholder: 'e.g. Denver District Court', type: 'text' },
      { id: 'caseNumber', label: 'Case Number', placeholder: 'e.g. 2023CV30123', type: 'text' },
      { id: 'judgeName', label: 'Judge Name', placeholder: 'Name of the judge to disqualify', type: 'text' },
      { id: 'biasEvidence', label: 'Evidence of Bias', placeholder: 'Specific instances of partiality or conflict...', type: 'textarea' }
    ],
    template: `[COURT_NAME]
STATE OF COLORADO

Case No: [CASE_NUMBER]

MOTION TO DISQUALIFY JUDGE [JUDGE_NAME]

Defendant, by and through counsel, moves this Court pursuant to C.R.C.P. 97 to disqualify the Honorable [JUDGE_NAME] from presiding over this matter.

As grounds for this Motion, Defendant states:
1. The Court's impartiality is reasonably questioned based on the following: [BIAS_EVIDENCE].
2. Under Colorado law, the mere appearance of bias is sufficient to require disqualification to maintain the integrity of the judicial process.

WHEREFORE, Defendant requests that Judge [JUDGE_NAME] recuse themselves immediately.
`
  },
  {
    id: 'motion-for-sanctions',
    title: 'Motion for Sanctions (Bad Faith)',
    description: 'AGGRESSIVE: Request sanctions against opposing counsel for bad faith or frivolous conduct.',
    fields: [
      { id: 'courtName', label: 'Court Name', placeholder: 'e.g. Denver District Court', type: 'text' },
      { id: 'caseNumber', label: 'Case Number', placeholder: 'e.g. 2023CV30123', type: 'text' },
      { id: 'opposingCounsel', label: 'Opposing Counsel', placeholder: 'Name of the attorney', type: 'text' },
      { id: 'conduct', label: 'Description of Conduct', placeholder: 'Detail the bad faith actions...', type: 'textarea' }
    ],
    template: `[COURT_NAME]
STATE OF COLORADO

Case No: [CASE_NUMBER]

MOTION FOR SANCTIONS AGAINST [OPPOSING_COUNSEL]

Defendant moves for sanctions against [OPPOSING_COUNSEL] pursuant to C.R.C.P. 11 and the Court's inherent authority.

As grounds, Defendant states:
1. [OPPOSING_COUNSEL] has engaged in bad faith litigation conduct, specifically: [CONDUCT].
2. This conduct has caused unnecessary delay and expense, and serves no legitimate legal purpose.

WHEREFORE, Defendant requests an order for attorney fees and other appropriate sanctions.
`
  },
  {
    id: 'answer-and-defenses',
    title: 'Answer & Affirmative Defenses',
    description: 'PLEADING: Respond to a complaint, admit/deny allegations, and assert affirmative legal defenses.',
    fields: [
      { id: 'courtName', label: 'Court Name', placeholder: 'e.g. Denver District Court', type: 'text' },
      { id: 'caseNumber', label: 'Case Number', placeholder: 'e.g. 2023CV30123', type: 'text' },
      { id: 'plaintiff', label: 'Plaintiff/Petitioner', placeholder: 'Name of party suing', type: 'text' },
      { id: 'defendant', label: 'Defendant/Respondent', placeholder: 'Your name or client name', type: 'text' },
      { id: 'admissions', label: 'Paragraphs Admitted', placeholder: 'e.g., Paragraphs 1, 2, and 5...', type: 'textarea' },
      { id: 'denials', label: 'Paragraphs Denied', placeholder: 'e.g., Paragraphs 3, 4, and 6-12...', type: 'textarea' },
      { id: 'affirmativeDefenses', label: 'Affirmative Defenses', placeholder: 'e.g., Statute of limitations, laches, failure to state a claim...', type: 'textarea' }
    ],
    template: `[COURT_NAME]
STATE OF COLORADO

[PLAINTIFF],
Plaintiff,

v.

[DEFENDANT],
Defendant.

Case No: [CASE_NUMBER]

ANSWER AND AFFIRMATIVE DEFENSES

Defendant, [DEFENDANT], hereby answers Plaintiff's Complaint as follows:

1. Defendant admits the allegations contained in paragraphs: [ADMISSIONS].
2. Defendant denies the allegations contained in paragraphs: [DENIALS].
3. Defendant is without knowledge or information sufficient to form a belief as to the truth of the remaining allegations and therefore denies them.

AFFIRMATIVE DEFENSES

As separate and affirmative defenses, Defendant asserts:
1. Plaintiff's Complaint fails to state a claim upon which relief can be granted.
2. [AFFIRMATIVE_DEFENSES]

WHEREFORE, Defendant respectfully requests that the Court enter judgment in Defendant's favor, dismiss Plaintiff's Complaint with prejudice, and award Defendant its costs and reasonable attorney fees.

Respectfully submitted,
/s/ 500_IQ_Architect
`
  },
  {
    id: 'motion-for-summary-judgment',
    title: 'Motion for Summary Judgment',
    description: 'DISPOSITIVE MOTION: Request judgment as a matter of law based on undisputed material facts (C.R.C.P. 56).',
    fields: [
      { id: 'courtName', label: 'Court Name', placeholder: 'e.g. Denver District Court', type: 'text' },
      { id: 'caseNumber', label: 'Case Number', placeholder: 'e.g. 2023CV30123', type: 'text' },
      { id: 'plaintiff', label: 'Plaintiff', placeholder: 'Name of plaintiff', type: 'text' },
      { id: 'defendant', label: 'Defendant', placeholder: 'Name of defendant', type: 'text' },
      { id: 'materialFacts', label: 'Undisputed Facts', placeholder: '1. On June 1, 2023, the parties signed...\n2. No dispute exists that...', type: 'textarea' },
      { id: 'legalArgument', label: 'Legal Argument', placeholder: 'Explain why the law requires summary judgment in your favor...', type: 'textarea' }
    ],
    template: `[COURT_NAME]
STATE OF COLORADO

[PLAINTIFF],
Plaintiff,

v.

[DEFENDANT],
Defendant.

Case No: [CASE_NUMBER]

MOTION FOR SUMMARY JUDGMENT

Defendant, [DEFENDANT], pursuant to C.R.C.P. 56, respectfully moves the Court to enter summary judgment in its favor on all claims.

STATEMENT OF UNDISPUTED MATERIAL FACTS
The following facts are undisputed and supported by the record:
[MATERIAL_FACTS]

ARGUMENT
Summary judgment is appropriate when there is no genuine dispute as to any material fact and the moving party is entitled to judgment as a matter of law. Here, the law and facts mandate judgment in Defendant's favor:
[LEGAL_ARGUMENT]

WHEREFORE, Defendant respectfully requests that the Court grant this Motion and enter summary judgment in favor of Defendant.

Respectfully submitted,
/s/ 500_IQ_Architect
`
  },
  {
    id: 'motion-to-compel',
    title: 'Motion to Compel Discovery',
    description: 'PROCEDURAL MOTION: Ask the court to force the opposing party to hand over outstanding discovery (C.R.C.P. 37).',
    fields: [
      { id: 'courtName', label: 'Court Name', placeholder: 'e.g. Denver District Court', type: 'text' },
      { id: 'caseNumber', label: 'Case Number', placeholder: 'e.g. 2023CV30123', type: 'text' },
      { id: 'discoveryRequests', label: 'Discovery Requests Owed', placeholder: 'e.g., Defendant\'s First Request for Production of Documents', type: 'textarea' },
      { id: 'conferralDetails', label: 'Good Faith Conferral', placeholder: 'Detail phone call or email exchange showing attempt to resolve this (C.R.C.P. 121 § 1-15)...', type: 'textarea' }
    ],
    template: `[COURT_NAME]
STATE OF COLORADO

Case No: [CASE_NUMBER]

MOTION TO COMPEL DISCOVERY

Defendant, by and through counsel, pursuant to C.R.C.P. 37, respectfully moves this Court to order Plaintiff to fully respond to outstanding discovery requests.

As grounds, Defendant states:
1. Defendant served the following discovery requests on Plaintiff: [DISCOVERY_REQUESTS].
2. Plaintiff failed to timely respond, or provided incomplete and evasive objections.
3. Pursuant to C.R.C.P. 121 § 1-15, counsel for Defendant participated in a good faith conference to resolve this dispute without court intervention, but was unsuccessful: [CONFERRAL_DETAILS].

WHEREFORE, Defendant respectfully requests that this Court enter an order compelling Plaintiff to produce complete and unobjected responses.

Respectfully submitted,
/s/ 500_IQ_Architect
`
  },
  {
    id: 'motion-in-limine',
    title: 'Motion in Limine',
    description: 'EVIDENTIARY MOTION: Exclude prejudicial, irrelevant, or improper evidence from being raised at trial.',
    fields: [
      { id: 'courtName', label: 'Court Name', placeholder: 'e.g. Denver District Court', type: 'text' },
      { id: 'caseNumber', label: 'Case Number', placeholder: 'e.g. 2023CV30123', type: 'text' },
      { id: 'evidenceExcluded', label: 'Evidence to Exclude', placeholder: 'e.g., References to unrelated police contacts or hearsay emails...', type: 'text' },
      { id: 'prejudiceExplanation', label: 'Prejudicial Impact Strategy', placeholder: 'Explain why this evidence is highly prejudicial or irrelevant and will mislead the jury...', type: 'textarea' }
    ],
    template: `[COURT_NAME]
STATE OF COLORADO

Case No: [CASE_NUMBER]

MOTION IN LIMINE RE: EXCLUSION OF [EVIDENCE_EXCLUDED]

Defendant, pursuant to Colorado Rules of Evidence (C.R.E.) 401, 402, and 403, hereby moves to exclude any reference to, argument about, or presentation of [EVIDENCE_EXCLUDED] at trial.

ARGUMENT
1. The evidence is irrelevant under C.R.E. 401, as it has no bearing on any valid claim or defense.
2. Even if marginally relevant, its probative value is substantially outweighed by the danger of unfair prejudice, confusion of the issues, or misleading the jury under C.R.E. 403.
3. [PREJUDICE_EXPLANATION]

WHEREFORE, Defendant requests that the Court grant this Motion in Limine and instruct Plaintiff and its witnesses not to mention or refer to this evidence at trial.

Respectfully submitted,
/s/ 500_IQ_Architect
`
  },
  {
    id: 'notice-of-appeal',
    title: 'Notice of Appeal',
    description: 'APPELLATE: Initiate an appeal of a final trial court order or judgment to a higher court.',
    fields: [
      { id: 'trialCourt', label: 'Trial Court', placeholder: 'e.g., Denver District Court', type: 'text' },
      { id: 'appellateCourt', label: 'Appellate Court', placeholder: 'e.g., Colorado Court of Appeals', type: 'text' },
      { id: 'caseNumber', label: 'Trial Court Case Number', placeholder: 'e.g. 2023CV30123', type: 'text' },
      { id: 'partyAppealing', label: 'Party Appealing', placeholder: 'Your name or client name', type: 'text' },
      { id: 'judgmentDate', label: 'Date of Judgment', placeholder: 'e.g. October 15, 2025', type: 'text' }
    ],
    template: `IN THE [TRIAL_COURT]
STATE OF COLORADO

Case No: [CASE_NUMBER]

NOTICE OF APPEAL

Notice is hereby given that Defendant, [PARTY_APPEALING], appeals to the [APPELLATE_COURT] from the final judgment/order entered in this action on [JUDGMENT_DATE].

A copy of the order/judgment being appealed is attached hereto.

Respectfully submitted,
/s/ 500_IQ_Architect
`
  },
  {
    id: 'notice-of-appearance',
    title: 'Notice of Counsel Appearance',
    description: 'FORMAL NOTICE: Counsel formally enters the case as the attorney of record representing a party.',
    fields: [
      { id: 'courtName', label: 'Court Name', placeholder: 'e.g. Denver District Court', type: 'text' },
      { id: 'caseNumber', label: 'Case Number', placeholder: 'e.g. 2023CV30123', type: 'text' },
      { id: 'plaintiff', label: 'Plaintiff/Petitioner', placeholder: 'Name of the plaintiff', type: 'text' },
      { id: 'defendant', label: 'Defendant/Respondent', placeholder: 'Name of the defendant', type: 'text' },
      { id: 'attorneyName', label: 'Attorney Name', placeholder: 'Full legal name of attorney', type: 'text' },
      { id: 'partyRepresented', label: 'Party Represented', placeholder: 'e.g., Defendant [DEFENDANT]', type: 'text' }
    ],
    template: `[COURT_NAME]
STATE OF COLORADO

[PLAINTIFF],
Plaintiff,

v.

[DEFENDANT],
Defendant.

Case No: [CASE_NUMBER]

ENTRY / NOTICE OF APPEARANCE

Please take notice that attorney [ATTORNEY_NAME] hereby enters their appearance as counsel of record on behalf of [PARTY_REPRESENTED] in the above-captioned matter.

The undersigned requests that copies of all future pleadings, notices, motions, and court communications be served upon them directly.

Respectfully submitted,
/s/ [ATTORNEY_NAME]
`
  },
  {
    id: 'motion-for-leave-to-amend',
    title: 'Motion for Leave to Amend Pleading',
    description: 'PROCEDURAL PLEADING: Request the court\'s permission to modify your complaint or answer.',
    fields: [
      { id: 'courtName', label: 'Court Name', placeholder: 'e.g. Denver District Court', type: 'text' },
      { id: 'caseNumber', label: 'Case Number', placeholder: 'e.g. 2023CV30123', type: 'text' },
      { id: 'pleadingToAmend', label: 'Pleading to Amend', placeholder: 'e.g. Answer or Counterclaims', type: 'text' },
      { id: 'rationale', label: 'Reason for Amendment', placeholder: 'e.g., To introduce newly discovered relevant email correspondence...', type: 'textarea' }
    ],
    template: `[COURT_NAME]
STATE OF COLORADO

Case No: [CASE_NUMBER]

MOTION FOR LEAVE TO AMEND [PLEADING_TO_AMEND]

Defendant, pursuant to C.R.C.P. 15(a), respectfully requests leave of this Court to file their Amended [PLEADING_TO_AMEND].

As grounds, Defendant states:
1. Under C.R.C.P. 15(a), leave to amend "shall be freely given when justice so requires."
2. Amendment is necessary and justified because: [RATIONALE].
3. The opposing party will suffered no unfair surprise or prejudice, nor does this motion cause undue trial delay.

WHEREFORE, Defendant requests that this Court grant leave to file the Amended [PLEADING_TO_AMEND] attached hereto.

Respectfully submitted,
/s/ 500_IQ_Architect
`
  },
  {
    id: 'certificate-of-service',
    title: 'Certificate of Service',
    description: 'AFFIDAVIT: Serve of process documentation certifying that papers were served on opposition.',
    fields: [
      { id: 'courtName', label: 'Court Name', placeholder: 'e.g. Denver District Court', type: 'text' },
      { id: 'caseNumber', label: 'Case Number', placeholder: 'e.g. 2023CV30123', type: 'text' },
      { id: 'documentServed', label: 'Document(s) Served', placeholder: 'e.g., Defendant\'s Motion to Dismiss', type: 'text' },
      { id: 'serviceDate', label: 'Date of Service', placeholder: 'e.g., June 9, 2026', type: 'text' },
      { id: 'serviceMethod', label: 'Service Method', placeholder: 'e.g., Colorado Courts E-Filing System (ICCES)', type: 'text' },
      { id: 'partiesServed', label: 'Parties Served', placeholder: 'Opposing counsel name and address / email...', type: 'textarea' }
    ],
    template: `[COURT_NAME]
STATE OF COLORADO

Case No: [CASE_NUMBER]

CERTIFICATE OF SERVICE

I hereby certify that on [SERVICE_DATE], a true and correct copy of [DOCUMENT_SERVED] was served upon the following parties or their counsel of record:

Served Parties:
[PARTIES_SERVED]

Method of service utilized: [SERVICE_METHOD].

Respectfully submitted,
/s/ 500_IQ_Architect
`
  },
  {
    id: 'respondents-response-parenting-time',
    title: "Respondent's Response to Motion to Clarify Parenting Time",
    description: "FAMILY LAW: Respond to Petitioner's motion requesting clarification or modification of the parenting time schedule.",
    fields: [
      { id: 'courtName', label: 'Court Name', placeholder: 'e.g. Denver County District Court - DR Division', type: 'text' },
      { id: 'caseNumber', label: 'Case Number', placeholder: 'e.g. 2022DR30456', type: 'text' },
      { id: 'petitioner', label: 'Petitioner Name', placeholder: 'Name of the Petitioner', type: 'text' },
      { id: 'respondent', label: 'Respondent Name (You)', placeholder: 'Name of the Respondent', type: 'text' },
      { id: 'motionDate', label: 'Motion Date', placeholder: 'Date Petitioner filed their motion to clarify', type: 'text' },
      { id: 'arguments', label: 'Respondent\'s Response & Arguments', placeholder: 'Explain why the petitioner\'s interpretation is incorrect or why their schedule violates child\'s best interests...', type: 'textarea' },
      { id: 'proposedSchedule', label: 'Respondent\'s Proposed Schedule', placeholder: 'Detail your proposed parenting time clarification...', type: 'textarea' }
    ],
    template: `[COURT_NAME]
STATE OF COLORADO

In re the Parental Responsibilities concerning:

[PETITIONER],
Petitioner,

and

[RESPONDENT],
Respondent.

Case No: [CASE_NUMBER]

RESPONDENT'S RESPONSE TO PETITIONER'S MOTION FOR/TO CLARIFY PARENTING TIME

Respondent, [RESPONDENT], respectfully submits this Response to Petitioner's Motion to Clarify Parenting Time, filed on [MOTION_DATE], and states as follows:

1. INTRODUCTION
Respondent agrees that clarification of parenting time is necessary to prevent ongoing disputes, but objects to the specific allocations and schedules proposed by Petitioner.

2. RESPONDENT'S RESPONSE AND ARGUMENTS
Petitioner's proposed clarification does not reflect the original intent of the parenting plan, nor does it serve the child(ren)'s best interests. Specifically:
[ARGUMENTS]

3. RESPONDENT'S PROPOSED RESOLUTION
To promote stability and consistent parenting guidelines, Respondent requests that the parenting time schedule be clarified/modified to order the following:
[PROPOSED_SCHEDULE]

WHEREFORE, Respondent respectfully requests that this Court deny Petitioner's requested schedule/clarification, adopt Respondent's proposal for parenting time clarification, and award such other relief as is appropriate in the best interests of the child(ren).

Respectfully submitted,
/s/ [RESPONDENT]
`
  }
];
