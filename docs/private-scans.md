# Private Scans

Use private scan mode for internal repositories, client projects, portfolio
research tools, or operational systems that may include local paths, customer
context, private configuration, or sensitive-file findings.

```bash
maintainer-radar scan /path/to/private-repo --out /path/to/private-report --private
```

Private mode writes the normal report pack plus:

```text
00-private-report-notice.md
```

## Recommended Workflow

1. Write private reports outside the scanned repository.
2. Do not commit private reports.
3. Review every Markdown file and `manifest.json`.
4. Share only aggregate scores or manually redacted excerpts.
5. Use findings to create public-safe issues or maintenance tasks.

## Why This Matters

Health reports can include local paths, sensitive-file labels, project names, or
operational structure. These details may be useful internally but unsafe to
publish without review.
