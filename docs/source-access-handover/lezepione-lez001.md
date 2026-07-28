---
role: source-access-handover
status: active
authority: informational
program: lezepione-lez001
---

# lezepione-lez001

**Affected claim:** sponsor identity behind the LEZ-001 semaglutide microsphere
formulation disclosed at ADA 2026 (abstract 1890-P). `company` is currently
stored as "Sponsor unconfirmed".

**Highest-priority known source:** ADA 2026 abstract page —
https://diabetesjournals.org/diabetes/article/75/Supplement_1/1890-P/167491/1890-P-Controlled-Release-without-Initial-Burst-in
(author affiliations would resolve this directly).

**Access state:** `SOURCE_IDENTIFIED_NOT_ACCESSED` — the abstract page returned
HTTP 403 on 2026-07-28.

**Blocker reason:** bot block / access restriction on diabetesjournals.org.

**Scope confirmed:** abstract title, headline formulation results (burst
reduction, 28-day release), already captured in the Program record from a
prior successful access.

**Scope still missing:** author list and institutional/company affiliations
as printed on the abstract.

**Alternative sources attempted:**
- General web search for "Lezepione" turned up a real, active Korean
  corporation, 주식회사 레제피온 (Lezepione Inc), business registration
  738-86-03445, based in the Wonju medical-device industrial complex
  (Gangwon-do), classified in medical/pharmaceutical R&D. See
  https://bizno.net/article/7388603445. The name plausibly matches the
  LEZ-001 code, but this registry entry alone does not establish that this
  entity sponsored the specific ADA 2026 abstract.
- No company website, pipeline page, or press release for Lezepione Inc was
  located confirming a LEZ-001 / semaglutide program.

**Current operating-data treatment:** `company` remains "Sponsor unconfirmed";
`recordType` reclassified from `sponsor-program` to `technology-watch` since
sponsor ownership is not directly established, so `productTarget` is stored as
`null`. The in vitro release profile's implied monthly design target is
preserved as caveat context (not a stored interval field, since Program no
longer carries a `platformPotential` field) without treating it as a confirmed
sponsor product target. Caveat updated to record the Lezepione Inc lead
without treating it as confirmed. Disposition:
DEFERRED (identity/classification upgrade to sponsor-program only — the
record itself is not excluded and remains STORED as technology-watch).

**Re-entry condition:** direct access to the ADA abstract's author/affiliation
block, a Lezepione Inc. company site or press release naming LEZ-001, or
another primary source directly tying the corporate entity to this program.

**Last checked:** 2026-07-28.
