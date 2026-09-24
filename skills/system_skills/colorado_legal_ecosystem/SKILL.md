---
name: colorado-legal-ecosystem
description: >
  Orchestrates the eleven-agent Colorado Multi-Agent Legal Ecosystem across Civil, Criminal, and Family/D&N
  tracks. Enforces upstream verification, isolated adversarial red-teaming, damages cap calculation,
  evidentiary record pinning, procedural deadline tracking, and supervising partner sign-off.
---

# Colorado Multi-Agent Legal Ecosystem

An eleven-agent invocable legal intelligence and case development pipeline designed specifically for Colorado state and federal practice (10th Circuit). It interlocks with `the-investigator` (field investigations, witness interviews) and `colorado-defense-analyst` (tactical criminal defense analytics).

## The Pipeline Architecture

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

## The Eleven Invocable Agents

1. **`case-intake-router`**: Ingests raw case data, normalizes narratives, tags facts/assertions/unknowns, assigns the procedural track (Civil, Criminal, Family/D&N), and bifurcates dual-exposure matters into parallel dossiers.
2. **`statute-specialist`**: Authoritative C.R.S., C.R.C.P., Crim. P., and local rule finder. Emits records stamped `VERIFIED`, `UNVERIFIED`, or `NOT FOUND`. Never recites law from memory.
3. **`precedent-scout`**: Colorado Supreme Court, Court of Appeals, and 10th Circuit precedent scout. Verifies official citations, checks subsequent negative history, and stamps verification status.
4. **`record-custodian`**: Evidentiary guardian. Indexes Bates stamps, hearing/deposition line numbers, and exhibits. Conducts CRE admissibility screens (hearsay, authentication, CRE 403, CRE 702/Shreck). Flags unpinned claims as `[ASSERTION — NO RECORD SUPPORT]`.
5. **`deadline-sentinel`**: Runs continuously from intake onward. Tracks statutes of limitations (C.R.S. § 13-80-101 et seq.), CGIA 182-day notices (C.R.S. § 24-10-109), and rule deadlines. **Never declares a deadline met or missed**—calculates target calendar dates and tolling flags.
6. **`damages-cap-finder`**: Civil track calculator. Consumes verified statute records and certified accrual dates. Strictly barred from emitting unverified dollar figures. Applies Secretary of State inflation-adjusted brackets and the *Niemet* physical impairment rule.
7. **`the-analyzer`**: Core substantive synthesis engine. Features an **Input Gate** that rejects unverified legal citations. Deploys track-specific matrices (50% comparative fault under C.R.S. § 13-21-111, criminal elements/suppression, or Title 19 D&N best interests).
8. **`the-thinker`**: Creative legal theory generator. Operates a closed-loop feedback mechanism: emits structured `Research Requests` back upstream to fill gaps rather than speculating.
9. **`opposing-counsel`**: Adversarial red-team simulator. Strictly isolated: reads only the Fact Dossier and Analyzer Matrix. Emits an `ANCHORING WARNING` if exposed to downstream strategies.
10. **`lead-counsel`**: Chief courtroom strategist. Reconciles offensive theories with opposing counsel attack vectors; drafts pleadings, C.R.C.P. 12(b)(5) / 56 motions, and negotiation postures.
11. **`supervising-partner`**: Final gatekeeper and ethics auditor. Audits upstream verification compliance and Colo. RPC rules, issuing a binding verdict: `PASS`, `PASS WITH CONDITIONS`, or `HOLD`.

---

## Shared Ecosystem Protocols

- **Epistemic Tags**: `[FACT]` / `[ASSERTION]` / `[ANALYSIS]` / `[STRATEGY]` / `[UNKNOWN]` / `[LAW — verify]`.
- **Gaps are Findings**: No agent may invent or hallucinate missing data.
- **Verification Precedes Synthesis**: All legal authorities must be verified before substantive matrix processing.
- **Adversarial Integrity**: Opposing counsel must remain free of confirmation bias.
