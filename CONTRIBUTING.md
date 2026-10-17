# Contributing

Thank you for helping with the Common Agent Standards. GOVERNANCE.md says how
changes are decided; this file says how to make one.

## Before you start

- Read the standard you want to change, and its CHANGELOG.md.
- For anything larger than a correction, open an issue first so the editor can
  say whether the change fits the standard.

## Making a change

1. Fork the repository and create a branch.
2. Edit the specification in its folder. Write plain, complete sentences.
3. If the change alters what the standard requires, raise the version line at
   the top of the specification, add an entry at the top of the standard's
   CHANGELOG.md, and change its version in standards.json.
4. If the standard has conformance fixtures, change them in the same pull
   request, so the fixtures and the text agree.
5. Run the checks:

   ```
   node tools/check-registry.mjs
   node tools/check-links.mjs
   ```

   A standard with a `site/` folder can be rendered locally:

   ```
   common-agent/site/deploy.sh draft --dry-run
   tools/render-site.sh messaging draft --dry-run
   ```

6. Open a pull request. The workflow runs the same checks and renders the
   sites.

## Files and line endings

Every text file uses LF line endings (.gitattributes enforces this). Keep
specification text in Markdown.

## Licences

By contributing, you agree that your contribution to specification text is
licensed under CC BY 4.0 (LICENSE-SPEC) and your contribution to code under
Apache-2.0 (LICENSE).
