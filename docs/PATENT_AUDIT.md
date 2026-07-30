---
role: patent-audit
status: active
authority: authoritative
update-boundary: Update when patent search, family handling, document status, attribution, handoff, or audit-refresh requirements change.
---

# Patent Coverage Audit

This procedure is the patent-specific third canonical research track. It checks
a declared roster of stored Programs and a bounded queue of stored Platforms
for attributable public patent evidence, and hands patent-discovered absent
candidates to the existing discovery track. The Platform queue is part of this
track, not a fourth canonical track. The audit does not repeat sponsor and
registry reconciliation from `program refresh` or candidate qualification from
`program discovery`.

## 1. Boundary and baseline

Declare the stored Program slugs in scope and freeze their current names,
aliases, payload components, delivery technology, sponsor and known
predecessor, licensor, partner, or rights-holder names. The initial full audit
must include every Program in the starting roster. Also freeze the bounded
Platform queue, which includes:

- every Platform whose `patentEvidence` array is empty;
- every Platform created since the baseline, or whose canonical identifier,
  aliases, official URL, or Company-rights relationship changed since it;
- every prior platform-level `ATTRIBUTION_DEFERRED` finding whose re-entry
  condition is met or remains unresolved.

A later audit may use the minimum delta scope in section 7 only when a reliable
accepted baseline exists.

The units of coverage are the stored Program and, separately, the queued
Platform. The unit of patent deduplication is the patent family. The audit
reports search coverage and attribution; it is not a freedom-to-operate,
validity, infringement, enforceability, ownership, or complete portfolio
opinion.

## 2. Search matrix

Use public patent full text, bibliographic data, family data, and legal-event
records. Prefer an official patent office or register for bibliographic and
legal-status claims. An aggregator may provide cross-jurisdiction search and
family discovery, but confirm any material status or rights claim against the
applicable official record when available.

For each Program, search all applicable combinations below, varying synonyms,
transliterations, former names, and spelling:

1. exact Program name, public code, historical code, and stored aliases;
2. each payload INN/generic name and public compound code, plus obesity or
   overweight terms and sustained-release, extended-release, long-acting,
   depot, implant, injectable, microsphere, microparticle, hydrogel,
   suspension, crystal, conjugate, or platform-specific terms;
3. the full ordered payload combination and each component separately, so a
   family that covers a combination is not confused with a component family;
4. stored delivery-platform names and aliases, searched both alone and with
   the Program and payload identifiers;
5. sponsor, predecessor, licensor, partner, original applicant, and current or
   historical assignee names, each combined with Program, payload, and platform
   terms;
6. relevant inventor, citation, priority, continuation, divisional, and
   national-phase links surfaced by the preceding searches.

At least one identifier-led path and one assignee/platform-led path must be
completed for every Program. Search-result snippets may surface documents but
never support attribution or canonical fields without reviewing the document
and bibliographic record.

## 3. Families and document status

Group publications that share the same priority chain and substantially the
same disclosed invention as one family finding. Record continuations,
divisionals, continuations-in-part, and distinct priority branches separately
when their claims or disclosure materially change the Program attribution.
Do not use a simple title match as a family key.

Distinguish:

- `application`: a jurisdictional filing; it may not yet be public;
- `publication`: a public application document, not a grant;
- `grant`: a jurisdiction-specific granted patent, not proof that every family
  member was granted or remains in force.

Legal status and an assignee observation belong to a specific jurisdiction,
document, and as-of date. `currentAssignee` records the assignee observed for
the reviewed representative record; it is not a global family owner or
chain-of-title conclusion. Do not infer pending, active, expired, abandoned,
lapsed, revoked, enforceable, ownership, or current rights from an A/B kind
code, a family member, an aggregator banner, or the existence of a grant alone.
Confirm material status and rights claims in the applicable official register
or assignment record. Aggregators may discover a lead, but an aggregator-only
display must remain explicitly unconfirmed and must not be promoted as a
current-rights or validity conclusion.

Count one attributable family once in the audit report. In Program `sources`,
link a representative public document that best supports the attribution,
normally the earliest accessible publication or the most directly relevant
grant. Add another family member only when it supports a distinct material
claim; do not create one source entry per jurisdiction merely to inflate
coverage.

## 4. Attribution

A family is attributable to a specific stored Program only when reviewed
evidence supports the identity with no unresolved collision. Sufficient routes
are:

- the document explicitly names the Program or unique public code; or
- claims, examples, or detailed embodiments identify the exact payload
  combination and delivery platform, and the applicant/assignee or documented
  rights chain aligns with the Program sponsor; or
- a direct sponsor, partner, licensing, or registry source explicitly maps the
  Program to the family.

Assignee or sponsor overlap alone is insufficient. A payload mention in a broad
list, a generic obesity indication, a platform title, an inventor overlap, or a
search-result hit alone is insufficient. When the same platform supports
several Programs, attribute a family only to the Program(s) whose exact payload
and identity meet the threshold. Otherwise report the finding as platform-level
and do not attach it to every Program using that platform.

Use `ATTRIBUTION_DEFERRED` when a likely link depends on an unresolved code,
payload, rights transfer, family relationship, translation, or inaccessible
material source. Create a source-access handover only for a stable stored
Program when access blocks a material decision under the existing handover
template.

## 5. Claim limits and discovery handoff

A patent can establish what an applicant disclosed or claimed by a filing or
publication date. By itself it does not establish:

- that a sponsor Program exists, remains active, or entered development;
- a current or intended `developmentStage` or `developmentStatus`;
- a current `productTarget`, demonstrated dosing interval, efficacy, safety,
  clinical readiness, or regulatory status;
- that every claimed payload or interval was made, tested, selected, or
  licensed.

Apply `docs/SOURCE_AND_ENTRY_POLICY.md` before using a patent for any Program
field. A patent-only interval remains platform/design potential in qualified
prose and never becomes `productTarget`. Patent publication or grant is not a
material Program Event unless direct non-patent evidence establishes a
Program-level change defined by the Event contract.

When a reviewed family identifies a potentially in-scope sustained-release,
depot, long-acting injectable, or implant obesity candidate absent from the
starting roster, record a `DISCOVERY_HANDOFF` in the selected durable run
surface with:

- applicant/assignee and candidate, payload, or platform identifiers;
- family representative, earliest priority, and reviewed public document;
- the exact passage or evidence location suggesting scope;
- why it does not map to a stored Program;
- missing non-patent evidence and the discovery re-entry query.

Do not assign `STORED`, `EXCLUDED`, or `DEFERRED` in the patent audit. Those are
discovery dispositions and require an explicit bounded `program discovery`
track with its independent coverage pass. Patent evidence alone never creates
a sponsor Program; a generic platform may become a `technology-watch` only
after the ordinary discovery evidence and entry gates are satisfied.

A pure Platform, rights-holder, license, access, or ownership finding that does
not identify a Program candidate uses `PLATFORM_RIGHTS_HANDOFF`, with the
representative family, applicant/assignee names, exact passage and location,
unresolved identifier or rights fact, and re-entry query. It re-enters the next
bounded Platform queue and is never stored in the internal `other` Company
bucket.

## 6. Audit output and storage boundary

For each Program and, in a separate Platform result table, each queued
Platform, report `PATENT_LINKED`, `NO_LINK_FOUND`, or
`ATTRIBUTION_DEFERRED`, representative family identifiers, search paths used,
and the as-of date. `NO_LINK_FOUND` means the required search surface returned
no attributable family; it does not assert patent absence. Platform results
must not be merged into Program outcomes or KPI reporting.

The Program Source model can store representative patent documents and is
adequate for Program-specific evidence. The static Platform model can store a
reviewed representative family and Company-Platform rights relationship. It
does not replace a complete family ledger or legal-status history. Therefore:

- add or reconfirm only attributable representative documents as
  `sourceType: "patent"`;
- for a platform-level finding, update `src/data/platforms/` only when an
  existing public Company, official platform identifier, current rights
  holder, and `ownership`/`license`/`access` relationship are directly
  supported;
- patent audit never creates `src/data/companies/` records; an absent or
  unresolved company identity remains a discovery handoff;
- never copy platform-level patent evidence into `Program.sources` or count it
  in `PATENT-LINKED PROGRAMS`;
- do not encode family count, audit outcome, assignee, legal status, or audit
  completion in labels or unrelated Program fields;
- preserve the audit matrix, family deduplication, no-link outcomes, and
  handoffs in the selected durable run-review surface;
- do not add a schema field, registry, Event, or permanent narrative audit
  report solely to record an audit run.

The default durable run surface is a draft PR. When the operator explicitly
requires commit/push without a PR, the alternative is an accepted
patent-audit baseline commit reachable from `main`. Its commit body is the
manifest and must contain:

- `Patent-Audit-Baseline`, prior baseline commit or `FULL`, and as-of date;
- exact Program roster and bounded Platform queue;
- separate Program and Platform outcome tables or compact outcome lists;
- family IDs after deduplication, unaudited counts, and search boundary;
- every `DISCOVERY_HANDOFF`, `PLATFORM_RIGHTS_HANDOFF`, and attribution
  deferral with source location and re-entry condition;
- validation result and GO/NO-GO.

Canonical positive links remain machine-readable in Program or Platform data;
the commit manifest preserves run coverage, negative search outcomes, and
handoffs without creating a permanent narrative report. A branch-only commit
is not an accepted baseline until it is reachable from `main`. If neither an
accepted PR nor a conforming accepted baseline commit can be identified, the
baseline is not reliable and the next audit must be a full Program-roster and
full bounded-Platform-queue audit, not a periodic delta audit.

`PATENT-LINKED PROGRAMS` remains a source-link KPI, not an audit-completeness or
portfolio KPI. A full audit can be GO even when some Programs are
`NO_LINK_FOUND`, but not when any Program is unaudited or attribution remains
unreported.

## 7. Periodic minimum refresh

After an accepted full-roster audit with a reliable durable baseline, a
periodic patent audit must at minimum:

1. use the last accepted patent-audit PR or conforming accepted baseline commit
   and its as-of date as the baseline;
2. include Programs added since that baseline and Programs whose name, aliases,
   payload, sponsor/rights chain, or delivery platform changed;
3. include the bounded Platform queue from section 1, including empty evidence,
   new or identity/alias/rights-changed Platforms, and prior platform
   attribution deferrals;
4. rerun exact identifier and assignee/platform searches for new publications,
   grants, continuations, divisionals, national phases, and material official
   legal events since the baseline;
5. recheck every prior `ATTRIBUTION_DEFERRED` finding and unresolved patent
   source-access handover whose re-entry condition is met;
6. verify that stored representative patent links still resolve and still
   support the attributed Program;
7. verify queued and already linked Platform evidence still supports the
   specific Platform rather than only a Program or general Company portfolio;
8. route newly surfaced absent candidates as fresh `DISCOVERY_HANDOFF` entries
   and pure platform/rights findings as `PLATFORM_RIGHTS_HANDOFF`.

Unchanged Programs need not repeat the initial full historical search when all
eight minimum checks are complete. If no reliable accepted baseline can be
identified, the audit reverts to a full-roster and full
bounded-Platform-queue audit.

## 8. Validation and GO/NO-GO

Review the final diff for accidental Program-field assertions, duplicate family
links, platform over-attribution, and unsupported legal status. Run the common
validation commands in `docs/RESEARCH_WORKFLOW.md`; schema validation cannot
prove search completeness or attribution.

The audit is GO only when its declared Program roster and bounded Platform
queue have zero unaudited entries, Program and Platform outcomes are reported
separately, every outcome and handoff is preserved in the selected durable run
surface, every linked patent passes section 4, document types and legal status
follow section 3, and all common checks pass.
It is NO-GO when required search paths were skipped, a family collision or
Program attribution remains silently unresolved, patent-only evidence was
promoted into a prohibited Program claim, a required fact cannot be represented
without misleading readers, or validation fails. Report the precise blocker
and prerequisite for a later GO.
