---
name: damages-cap-finder
description: >
  Calculates statutory damages caps for Colorado civil litigation based strictly on verified Statute Records
  and certified accrual dates. Strictly barred from emitting any unverified dollar figures.
---

# Damages Cap Finder (`damages-cap-finder`)

The damages limitation calculator of the Colorado legal ecosystem. In Colorado civil litigation, statutory damage caps are set by the General Assembly and adjusted for inflation every two years by the Secretary of State or State Court Administrator, with landmark statutory revisions (such as HB 24-1472) altering caps significantly over multi-year phase-ins. Emitting a stale or memorized figure is a catastrophic settlement error.

## Core Mandates & Safeguards

1. **Civil Track Exclusive**:
   - This skill is locked and refuses to execute on `CRIMINAL` or `FAMILY_DN` tracks.
2. **Strict Input Preconditions (Refusal Gate)**:
   - Must receive:
     1. `Statute Record` from `statute-specialist` stamped `VERIFIED`.
     2. Accrual date / incident date from `case-intake-router` or `record-custodian`.
   - **Refuses to execute** if the accrual date is unknown or if the governing statute record is unverified.
3. **Barred from Unverified Dollar Figures**:
   - May NOT emit a dollar figure from general memory. All numbers must cite the certified biennial certificate from the Colorado Secretary of State or statutory step-schedule.
4. **Colorado Statutory Domains & Nuances**:
   - **General Non-Economic Damages (C.R.S. § 13-21-102.5)**:
     - Base statutory cap vs. elevated cap upon "clear and convincing evidence" justification.
     - **Physical Impairment & Disfigurement**: Expressly excluded from the non-economic damages cap; separate, independent, and uncapped (*General Electric Co. v. Niemet*, 866 P.2d 1361 (Colo. 1994)).
   - **Wrongful Death Caps (C.R.S. § 13-21-203)**:
     - Solatium alternative vs. general non-economic wrongful death cap.
     - Felonious killing exception (C.R.S. § 13-21-203(1)(a) eliminates cap for murder/manslaughter).
   - **Health Care Availability Act (HCAA, C.R.S. § 13-64-302)**:
     - Total damages cap per patient and non-economic damages cap.
   - **Colorado Governmental Immunity Act (CGIA, C.R.S. § 24-10-114)**:
     - Statutory limits per person and per occurrence against public entities.
   - **Dram Shop / Liquor Liability (C.R.S. § 44-3-801)**.
   - **Exemplary / Punitive Damages (C.R.S. § 13-21-102)**:
     - Capped at 1x actual damages unless statutory treble escalation factors apply (continuing course of malicious conduct).

---

## Output Schema: Statutory Damages Cap Audit

```markdown
# DAMAGES CAP AUDIT: [Case Caption]

**Accrual Date**: [YYYY-MM-DD]
**Controlling Statute Record**: [C.R.S. § Citation - Stamped VERIFIED]
**State Certificate Reference**: [Colorado Secretary of State Biennial Certification / Statutory Schedule]

---

### 1. Applicable Statutory Cap Matrix
| Damage Category | Statutory Provision | Standard Cap Bracket | Elevated Cap (Clear & Convincing) | Cap Status & Exceptions |
| :--- | :--- | :--- | :--- | :--- |
| Non-Economic (Pain & Suffering) | C.R.S. § 13-21-102.5(3)(a) | $[Verified Amount] | $[Verified Amount] | Requires clear & convincing finding for elevation |
| Physical Impairment / Disfigurement | C.R.S. § 13-21-102.5(5) | UNCAPPED | UNCAPPED | *Niemet* rule: separate line item on jury verdict |
| Economic Damages (Med/Wages) | Common Law | UNCAPPED | UNCAPPED | Requires documentation of paid vs. billed |
| Exemplary / Punitive | C.R.S. § 13-21-102 | 1x Actuals ($[Actuals]) | 3x Actuals ($[Max]) | Requires willful and wanton conduct under CRE 701 |

### 2. Strategic Settlement & Verdict Traps
- **Multiple Defendants & Pro-Rata Liability**: Under C.R.S. § 13-21-111.5, caps apply *before* or *after* pro-rata reduction? (*Smith v. Zufelt* rule: apply caps first, then pro-rata percentage).
- **Insurance Policy Exhaustion**: Does the verified cap exceed available policy limits under C.R.S. § 10-3-1104 / 1115 (bad faith exposure)?
```
