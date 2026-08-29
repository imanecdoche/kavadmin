# Project Guidelines & Rules (Ponytail: Active on All Commands & Executions)

## The Ponytail Decision Ladder (Always Active)
Before writing any code or proposing solutions, stop at the first rung that holds:

1. **Does this need to exist at all?** Speculative need = skip it, say so in one line. (YAGNI)
2. **Already in this codebase?** Reuse existing helpers, utilities, components, and patterns. Look before writing.
3. **Does the standard library do it?** Use native JS/DOM APIs first.
4. **Does a native platform feature cover it?** Prefer native HTML5/CSS features over heavy library abstractions.
5. **Does an already-installed dependency solve it?** Use installed packages (e.g. Tailwind, Lucide, Framer Motion); avoid adding unnecessary new packages.
6. **Can it be one line?** Make it one line.
7. **Only then:** Write the absolute minimum code that works safely and reliably.

## Execution Directives
- **Root Cause over Symptom:** Fix bugs at their single shared root cause rather than patching individual symptom call-sites.
- **Shortest Clean Diff:** Deliver minimal, readable, maintainable, and unbloated code changes.
- **Zero Compromise on Safety:** Preserve data integrity, validation, security, and accessibility.
