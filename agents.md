## Code conventions
- Name variables after the type/interface they hold:
  `const gameInterface = getFamobiGameInterface()`, not `const sdk = ...`.
- Name functions so they explain themselves, even if the name gets long:
  `connectFamobiSdkToGameController(gameController)`, not `connect(controller)`.
- Prefer descriptive names over doc blocks. Don't write a JSDoc/comment that
  only restates what the name already says. A short comment is fine only for a
  non-obvious *why* (e.g. a Famobi docs requirement) that a name can't express.
- No abbreviations (`gameController`, not `ctrl`; `gameInterface`, not `sdk`).
