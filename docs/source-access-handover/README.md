---
role: source-access-handover-template
status: active
authority: authoritative
update-boundary: Update when the handover fields or lifecycle change.
---

# Source-access handover

Create one Markdown file per program only when a source-access failure leaves a
material claim unresolved:

```text
docs/source-access-handover/<programSlug>.md
```

A handover entry records:

- program and affected claim;
- highest-priority known source and URL;
- access state: `FULL_SOURCE_REVIEWED`, `PARTIAL_SOURCE_REVIEWED`,
  `SOURCE_IDENTIFIED_NOT_ACCESSED`, or `SOURCE_NOT_LOCATED`;
- blocker reason, such as paywall, authentication, bot block, dead link,
  supplement unavailable, or other;
- scope confirmed and scope still missing;
- alternative direct sources attempted and what they did not support;
- current operating-data treatment;
- re-entry condition;
- last checked date.

Do not delete a resolved entry. Mark it resolved in place with the resolving
source and date, then keep the file as a compact audit trail. Do not create a
handover for a search that simply found no new material change after all
required surfaces were successfully checked.
