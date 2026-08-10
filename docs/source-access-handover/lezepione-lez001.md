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

**Primary source:** ADA 2026 abstract page —
https://diabetesjournals.org/diabetes/article/75/Supplement_1/1890-P/167491/1890-P-Controlled-Release-without-Initial-Burst-in

**Access state:** `SOURCE_IDENTIFIED_NOT_ACCESSED` as of the current
(2026-08-10) check — the page returned HTTP 403 (Cloudflare bot challenge).
The source was previously `FULL_SOURCE_REVIEWED` on 2026-07-29, and the
content captured then (below) remains the operating evidence; live
re-verification is what is currently blocked, not the underlying record.
This handover is kept active until either the access blocker clears again
or the sponsor-identity re-entry condition below is independently satisfied.

**Blocker history:** the ADA page was directly accessible on 2026-07-29,
exposing the full abstract, author line, location, and disclosure statement.
On 2026-08-10 the same URL returned HTTP 403 (Cloudflare challenge) on both
WebFetch and a browser-UA curl request — the access blocker recurred.

**Scope confirmed:** abstract title and formulation results (burst reduction,
28-day release), author Jaepyoung Cho, location "Wonju, Republic of Korea",
and disclosure "None".

**Scope still missing:** institutional or company affiliation. The fully
reviewed abstract provides only the author name and city/country, so it does
not directly connect LEZ-001 to Lezepione Inc.

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
- 2026-08-10 recheck: re-opened https://bizno.net/article/7388603445 and
  found the registered representative name is "조재평" (Cho Jae-pyung),
  which romanizes identically to ADA abstract author "Jaepyoung Cho." This
  is a new circumstantial name match from a third-party registry aggregator,
  not a primary source directly tying the corporate entity to LEZ-001 or the
  abstract, so it does not satisfy the re-entry condition on its own.
  `lezepione.com` returned HTTP 503 and `lezepione.co.kr` does not resolve
  (DNS failure). No newer LEZ-001 disclosure was found.

**Current operating-data treatment:** `company` remains "Sponsor unconfirmed";
`recordType` reclassified from `sponsor-program` to `technology-watch` since
sponsor ownership is not directly established, so `productTarget` is stored as
`null`. The in vitro release profile's implied monthly design target is
preserved as caveat context (not a stored interval field, since Program no
longer carries a `platformPotential` field) without treating it as a confirmed
sponsor product target. Caveat updated with the author/location evidence and
the Lezepione Inc lead without treating the sponsor match as confirmed.
Disposition:
DEFERRED (identity/classification upgrade to sponsor-program only — the
record itself is not excluded and remains STORED as technology-watch).

**Re-entry condition:** a Lezepione Inc. company site or press release naming
LEZ-001, an author profile naming the affiliation, or another primary source
directly tying the corporate entity to this program.

**Last checked:** 2026-08-10.
