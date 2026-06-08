# Security Policy

Maintainer Radar is a local-first CLI. It scans repository files and writes
Markdown reports to a local output directory. It does not upload repository
contents.

## Supported Versions

The current supported version is the latest release on the default branch.

## Reporting a Vulnerability

Please open a private security advisory on GitHub or email the maintainer listed
on the repository profile. Include:

- affected version or commit
- steps to reproduce
- expected and actual behavior
- whether sensitive data could be exposed

We will acknowledge reports within 7 days and publish a fix or mitigation plan
as soon as practical.

## Data Handling

- The CLI reads local files in the scanned repository.
- Reports may include paths and redacted risk labels.
- Secret values are never intentionally printed in full.
- Users should inspect generated reports before publishing them.

## Non-goals

Maintainer Radar is not a replacement for professional security review,
dependency auditing, or legal compliance review.
