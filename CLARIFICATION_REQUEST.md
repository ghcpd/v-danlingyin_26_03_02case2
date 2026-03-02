# Clarification Request — Plugin System

This document captures questions and uncertainties uncovered while reviewing the plugin system implementation (`src/plugin.ts` + `src/pluginManager.ts`) and the high-level documentation (`README.md`).

---

## 1) What the code actually does (brief)

- `src/plugin.ts` defines a `Plugin` interface with:
  - a required `name: string`
  - three optional lifecycle methods: `onInit`, `onStart`, and `onStop`.
- `src/pluginManager.ts` defines a `PluginManager` that:
  - stores plugins in a private array
  - exposes `register(plugin)` to add a plugin to that array
  - exposes `start()` which loops through all registered plugins and calls:
    - `onInit()` (if present)
    - then `onStart()` (if present)
  - exposes `stop()` which loops through all registered plugins and calls `onStop()` (if present)

---

## 2) What’s unclear / undocumented

### A) “Automatically register and execute plugins”
- There is no code that discovers, loads, or auto-registers plugins.
- The README says the system will “automatically register and execute plugins,” but `PluginManager` requires explicit calls to `register(plugin)`.

### B) Plugin lifecycle semantics
- The README says plugins “hook into the system lifecycle,” but the lifecycle phases are not documented beyond method names.
- It is unclear whether `onInit` and `onStart` are expected to be called in sequence per-plugin (as implemented) or if there should be two distinct phases (all `onInit` first, then all `onStart`).
- There is no guidance on when `stop()` should be called and whether it should always run (e.g., on error or shutdown).

### C) Asynchronous/Promise behavior
- The lifecycle methods are typed as synchronous (`void`).
- It is unclear whether plugins are allowed (or expected) to perform async initialization/cleanup and whether the framework should await those operations.

### D) Required vs optional methods
- README states: “To create a plugin, implement the required lifecycle methods.”
- In code, all lifecycle methods are optional (`?`).
- It is unclear which methods are actually required for a valid plugin.

### E) Plugin identity and uniqueness
- `Plugin` has a `name` field, but: 
  - Is it required to be unique?
  - Is it used anywhere by the system (for logging, deduplication, etc.)?
- There is no mechanism to prevent registering the same plugin multiple times.

### F) Error handling and plugin isolation
- If one plugin throws inside `onInit`, `onStart`, or `onStop`, the manager will propagate the exception and stop iterating.
- It is unclear whether the intended behavior is to fail fast, continue with other plugins, or log and move on.

---

## 3) Specific numbered questions for the maintainers

1. **How are plugins discovered and registered in practice?**
   - Is there an expected convention (e.g., file naming, directory scan, dependency injection) that automatically registers plugins, or is the consumer always responsible for calling `register()`?

2. **What does “automatically register” mean in this context?**
   - The README claims automatic registration, but the implementation requires manual registration. Is there missing code or documentation for the auto-registration mechanism?

3. **What are the intended lifecycle phases and their semantics?**
   - Should `onInit` and `onStart` be executed per-plugin (current implementation), or should all `onInit` run first for every plugin and then all `onStart` (two-phase)?
   - When should `stop()` be invoked, and should it be guaranteed to run even if `start()` fails partway through?

4. **Are lifecycle methods allowed to be asynchronous (return a Promise)?**
   - If yes, should the manager await them (and potentially expose `start()`/`stop()` as async)?

5. **Which lifecycle methods are required vs optional?**
   - The README implies there are required methods, but the TypeScript interface marks all methods optional.

6. **What is the purpose of the `name` property on `Plugin`?**
   - Is it used for logging, uniqueness checks, debugging, or something else?
   - Are there constraints (e.g., uniqueness) that plugin authors should follow?

7. **How should errors in plugin hooks be handled?**
   - Should one plugin failure prevent other plugins from running? 
   - Should the manager catch errors and continue (and if so, should it report them)?

---

## 4) Why it matters if these remain unanswered

- ✅ **Correct usage**: Without clarity, plugin authors may implement plugins in a way that never runs (e.g., expecting automatic registration) or that breaks the host app (e.g., throwing from lifecycle hooks).
- ✅ **Reliability & stability**: Undefined error handling could lead to crashes or partial startup/shutdown sequences.
- ✅ **Consistency**: Different consumers may make different assumptions (sync vs async lifecycle, hook ordering), leading to hard-to-debug behavior.
- ✅ **Maintainability**: Clear expectations around required methods, naming, and lifecycle order reduce onboarding friction and make it easier to extend the system.
