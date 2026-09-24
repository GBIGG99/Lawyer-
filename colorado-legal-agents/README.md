# Colorado Multi-Agent Legal Ecosystem

Eleven invocable skills implementing an end-to-end legal intelligence and case development pipeline for Colorado jurisdiction, featuring strict routing for Civil, Criminal, and Family/D&N (Dependency & Neglect) tracks.

Designed to seamlessly interlock with `the-investigator` and `colorado-defense-analyst`.

---

## Architecture & Flow

```
              [ case-intake-router ]  ← Fact Dossier + Track Selection (Civil / Crim / Family-D&N)
                        │
         ┌──────────────┼──────────────┬───────────────────┐
         ▼              ▼              ▼                   ▼
  [statute-        [precedent-   [record-          [deadline-sentinel]
   specialist]      scout]        custodian]        (runs in parallel,
         │              │              │             from intake onward)
         │              │              │
         ▼              │              │
  [damages-cap-         │              │   ← civil track only; consumes
   finder]              │              │      statute records, never retrieves
         └──────────────┼──────────────┘
                        ▼
                 [ the-analyzer ]  ← INPUT GATE: rejects any UNVERIFIED authority
                        │              Track matrix: Civil fault / Criminal elements / D&N best interests
         ┌──────────────┴──────────────┐
         ▼                             ▼
  [ the-thinker ]              [ opposing-counsel ]
         │  │                    (ISOLATED — reads ONLY dossier + analyzer;
         │  └──── research ──┐     warns on anchoring if exposed downstream)
         ▼       request     │
  [ lead-counsel ]  ────────►┘ back to statute-specialist / precedent-scout / record-custodian
         │
         └──────────────┬──────────────┘
                        ▼
              [ supervising-partner ]
         Verdict: PASS / PASS WITH CONDITIONS / HOLD
```

---

## Agent Directory & Invocable Skills

| Skill Folder | Role | Key Constraints / Gates |
| :--- | :--- | :--- |
| `case-intake-router` | Ingestion, fact normalization, track assignment | Splits dual civil/criminal matters; tags `[FACT]`, `[ASSERTION]`, `[UNKNOWN]`. |
| `statute-specialist` | Colorado Revised Statutes, C.R.C.P., Crim. P., local rules | Never quotes from memory; stamps `VERIFIED`, `UNVERIFIED`, or `NOT FOUND`. |
| `precedent-scout` | CO Supreme Court, CO Court of Appeals, 10th Circuit | Authoritative reporter retrieval; Shepard's/KeyCite negative treatment audits. |
| `record-custodian` | Bates logs, transcript pins, CRE admissibility screen | Distinguishes record evidence from argument; catches unpinned assertions. |
| `deadline-sentinel` | Limitations, conditions precedent, notice deadlines | Runs from intake onward; **never declares a deadline met or missed** (calculates targets). |
| `damages-cap-finder` | Civil statutory damages caps calculator | Strictly consumes verified statute records & accrual dates; zero unverified numbers. |
| `the-analyzer` | Deep comparative fault, elements, or parental fitness matrix | **Input gate**: rejects unverified authority; enforces track-specific analytical schemas. |
| `the-thinker` | Creative legal theory and tactical hypothesis generation | Emits structured `Research Request` back upstream; marks incomplete theories provisional. |
| `opposing-counsel` | Red team adversarial simulation | **Strict isolation**: reads dossier and analyzer only; emits `ANCHORING WARNING` if exposed downstream. |
| `lead-counsel` | Master litigation strategy, motions, pleadings, settlement | Reconciles the thinker's avenues with opposing counsel's vulnerabilities; drafts filings. |
| `supervising-partner` | Final quality gatekeeper and ethics audit | Emits `PASS`, `PASS WITH CONDITIONS`, or `HOLD` based on strict compliance standards. |

---

## Core Operational Conventions Across All 11 Agents

1. **Mandatory Disclaimer**: First substantive output in any matter begins with:
   > *"LEGAL WORK PRODUCT PRIVILEGE / NON-LEGAL ADVICE NOTICE: Generated for licensed attorney workflow assistance. Does not constitute formal legal representation, independent legal practice, or guarantee judicial outcomes under Colorado law."*
2. **Strict Epistemic Tagging**:
   - `[FACT]`: Verified by tangible record pin (Bates, transcript line, admitted exhibit).
   - `[ASSERTION]`: Stated by a party, client, or witness without independent documentary verification.
   - `[ANALYSIS]`: Objective legal synthesis applying verified law to facts.
   - `[STRATEGY]`: Tactical litigation recommendation, motion play, or negotiation posture.
   - `[UNKNOWN]`: Missing factual or legal datum. **Gaps are findings — never hallucinate or fill with placeholders.**
   - `[LAW — verify]`: Unconfirmed or pending statutory/case authority.
3. **Upstream Verification Before Synthesis**: No agent downstream of `the-analyzer` may rely on unverified authority.
4. **No Law from Memory**: All Colorado statutes, rules, and precedents must be retrieved or marked `NOT FOUND`.
