# GitHub Action Artifact Mode

Maintainer Radar can run inside GitHub Actions and upload the generated
Markdown report pack as an artifact.

This mode is designed for maintainer workflows where the report should stay
inside the GitHub Actions run rather than being posted directly into pull
request comments. That is safer for private repositories because reports may
include local paths, project context, or sensitive-file findings.

## Example

```yaml
name: Maintainer Radar

on:
  pull_request:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  report:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@v4
      - uses: ts370102633-hue/maintainer-radar@v0.1.5
        with:
          output-dir: maintainer-radar-report
          artifact-name: maintainer-radar-report
          private: "false"
```

## Inputs

| Input | Default | Purpose |
| --- | --- | --- |
| `repo-path` | `.` | Repository path to scan. |
| `output-dir` | `maintainer-radar-report` | Directory where the report pack is written. |
| `private` | `false` | Adds a private report notice for internal repositories. |
| `upload-artifact` | `true` | Uploads the report directory as a GitHub Actions artifact. |
| `artifact-name` | `maintainer-radar-report` | Artifact name shown in the workflow run. |

## Data Handling

The action runs the scanner on the GitHub Actions runner. Maintainer Radar does
not upload repository content to a third-party service. If artifact upload is
enabled, the generated report pack is stored as a GitHub Actions artifact.

For private repositories, use `private: "true"` and review the artifact before
sharing it outside the repository.
