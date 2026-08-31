---
role: source-access-handover
status: resolved
authority: informational
program: lezepione-lez001
---

# lezepione-lez001

**Affected claim:** sponsor identity behind the LEZ-001 semaglutide microsphere
formulation disclosed at ADA 2026 (abstract 1890-P). `company` is currently
stored as "Sponsor unconfirmed".

**Primary source:** ADA 2026 abstract page —
https://diabetesjournals.org/diabetes/article/75/Supplement_1/1890-P/167491/1890-P-Controlled-Release-without-Initial-Burst-in

**Access state:** `FULL_SOURCE_REVIEWED` — automated access (WebFetch/curl)
remains blocked (HTTP 403, Cloudflare bot challenge, recurred on 2026-08-10),
but the operator supplied a verbatim excerpt of the abstract directly in
conversation on 2026-08-10, which independently confirms the content already
captured by the 2026-07-29 automated review is accurate. The blocker is
resolved for this claim's evidentiary purposes because the actual source
content is now in hand via two independent channels; it is not resolved as
a *technical* access path — a future automated recheck should expect the
same Cloudflare block and may need the same operator-assisted fallback.

**Blocker history:** the ADA page was directly accessible on 2026-07-29,
exposing the full abstract, author line, location, and disclosure statement.
On 2026-08-10 the same URL returned HTTP 403 (Cloudflare challenge) on both
WebFetch and a browser-UA curl request. The same day, the operator pasted a
verbatim excerpt of the abstract (session "New Technology—Insulin Delivery
Systems," presented 2026-06-05; title; author line; full Introduction/
Objective, Methods, Results, Conclusion; and the disclosure line "J. Cho:
None"). The pasted figures (15%/25% drug loading, 5-10% release at 72h,
>80% cumulative release by day 28) and the disclosure statement match the
2026-07-29 capture exactly, corroborating that the automated review was
accurate.

**Scope confirmed:** abstract title, session/presentation date (2026-06-05,
"New Technology—Insulin Delivery Systems"), full Methods/Results/Conclusion
text, formulation results (burst reduction, 28-day release), sole author
Jaepyoung Cho, location "Wonju, Republic of Korea" (from the 2026-07-29
capture; not present in the 2026-08-10 excerpt, which did not include the
affiliation footer), and disclosure "J. Cho: None" (confirmed via both
channels).

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

**2026-08-31 recheck:** the ADA abstract page loaded directly in a browser
session with no Cloudflare challenge this time (the automated WebFetch/curl
path was not retried since the browser path succeeded). Clicking the author
name "JAEPYOUNG CHO" opens the site's own author-info popup, which shows only
"Wonju, Republic of Korea" — no institution or company affiliation field is
present anywhere on the page. This matches the 2026-07-29 capture exactly; no
new scope was found.

A general web search this session returned an AI-generated summary flatly
asserting "Lezepione, Inc. is the sponsor/developer of LEZ-001," citing (among
other links) a paywalled Substack post ("ADA 2026: New stuff is fun...,"
onthepen.substack.com, 2026-06-07). The Substack article was fetched directly
(both via WebFetch and via browser `get_page_text`): the visible free portion
cuts off after "Researchers are unveiling…" and never mentions Lezepione or
LEZ-001 in the accessible text. No other underlying link in that search
contained a Lezepione/LEZ-001 sponsor statement either. The sponsor-attribution
sentence therefore appears to be the search summarizer's own inference from
the name/code similarity, not a claim traceable to any primary or verifiable
secondary source — it does not satisfy the re-entry condition and is not used
to change `company` or `recordType`.

`lezepione.com` was retried and still fails to load (browser shows an error
page); `lezepione.co.kr` was not retested this round. No newer LEZ-001
disclosure was found. Disposition unchanged: DEFERRED, technology-watch,
`company` remains "Sponsor unconfirmed."

**2026-08-31 event-scan recheck (domestic Core media pass):** located a
2026-08-25 VentureSquare profile of "레제피온 대표 조재평" (Lezepione Inc CEO Jo
Jae-pyeong) — https://www.venturesquare.net/1108329 — describing the company's
long-acting drug-delivery platform "RevoNMT" (nanoparticle/microsphere/hydrogel
multi-stage burst control) and a GLP-1 (semaglutide/tirzepatide) pipeline
targeting weekly-to-monthly dosing, still in lab/early-preclinical stage with
major animal studies planned through H1 2027. The article confirms the company
name, CEO name (matching the bizno.net registrant), and a thematically
consistent burst-control platform, but the full text (checked via WebFetch,
searched for "LEZ-001," "LEZ001," "ADA," "미국당뇨병학회") contains no mention
of LEZ-001, the ADA abstract, or any named drug candidate code, and does not
state that Lezepione Inc sponsors a specific filed program. It does not meet
the re-entry condition (a source directly tying the corporate entity to
LEZ-001 or the ADA abstract). Disposition unchanged: DEFERRED, technology-watch,
`company` remains "Sponsor unconfirmed."

**Last checked:** 2026-08-31.
