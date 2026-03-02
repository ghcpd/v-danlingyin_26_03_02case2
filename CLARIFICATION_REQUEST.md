# Clarification Request: Plugin System Implementation

## What the Code Actually Does

The plugin system consists of:
- **Plugin interface** (`plugin.ts`): Defines three optional lifecycle hooks (`onInit`, `onStart`, `onStop`)
- **PluginManager** (`pluginManager.ts`): A manager class that stores plugins in an array, provides a manual `register()` method, and executes hooks via `start()` (which calls both `onInit` and `onStart` sequentially) and `stop()` (which calls `onStop`)

---

## What's Unclear or Undocumented

### 1. Plugin Registration Mechanism
**Issue**: The README states plugins will be "automatically registered," but the code shows manual registration via `register()`.

**Questions for Maintainers**:

1. Does "automatically register" mean plugins are discovered at runtime from a specific directory or manifest? Or is the current manual `register()` approach the intended behavior, and the docs are misleading?

2. If automatic discovery is required, what's the mechanism? (filesystem scanning, entry points file, environment variable, etc.)

3. Should users manually call `register()` or is there a bootstrap process that handles this?

---

### 2. Lifecycle Hook Execution & Order
**Issue**: `onInit` and `onStart` are called back-to-back in the `start()` method without explanation of why they're separate.

**Questions for Maintainers**:

4. What's the semantic difference between `onInit` and `onStart`? When should a plugin author use one vs. the other?

5. Is the sequential execution order (`onInit` → `onStart`) guaranteed and intentional? Should plugins be able to depend on this order?

6. Why doesn't `stop()` call `onInit` again? Is the asymmetry (start calls both, stop calls only onStop) intentional?

---

### 3. Error Handling & Plugin Isolation
**Issue**: There's no error handling in the PluginManager lifecycle methods. If one plugin throws, what happens?

**Questions for Maintainers**:

7. If `p.onInit()` throws an error, does the manager catch it, log it, and continue with the next plugin? Or does the entire `start()` sequence fail?

8. Should plugins be isolated from each other, or is tight coupling expected?

9. What should happen if a plugin hook throws an error during `stop()`—should it prevent other plugins from stopping?

---

### 4. Plugin Dependencies & Constraints
**Issue**: There's no mechanism for plugins to depend on each other or for the manager to sequence them.

**Questions for Maintainers**:

10. Can plugins depend on other plugins? If so, how should dependency order be specified or validated?

11. Is the order of plugin execution deterministic? Should it be based on registration order, or is reordering allowed?

12. Can the same plugin be registered multiple times, and if so, will its hooks fire multiple times?

---

### 5. Plugin Lifecycle Context & Parameters
**Issue**: Lifecycle hooks take no parameters, so plugins can't receive context or configuration.

**Questions for Maintainers**:

13. How should plugins access configuration, logging, or shared services? Should the PluginManager pass itself (or a context object) to the hooks?

14. Should lifecycle hooks accept parameters like `(context: PluginContext)` or similar?

15. Is there a pattern for plugins to communicate with each other or with the host system?

---

### 6. Plugin Removal & Lifecycle Termination
**Issue**: There's no `unregister()` or plugin removal mechanism.

**Questions for Maintainers**:

16. Can plugins be removed after registration? If not, should this functionality be added?

17. If a plugin is unregistered, should its `onStop()` be called automatically?

18. Does `stop()` actually unload/destroy plugins, or just pause them?

---

### 7. Plugin Naming & Identification
**Issue**: The `name` field exists but is never used in the code.

**Questions for Maintainers**:

19. What is the `name` field used for? (logging, identification, lookup, documentation?)

20. Should plugin names be unique? Is there validation for duplicate names?

21. Should the PluginManager provide a way to look up plugins by name or get a list of registered plugins?

---

### 8. Plugin Type Safety & Documentation
**Issue**: There's no JSDoc or inline documentation explaining when/how to implement each hook.

**Questions for Maintainers**:

22. Should there be required vs. optional hooks? Currently all are optional, but is that safe?

23. Should hooks have timeout constraints or resource limits?

24. Are there any best practices documented for plugin authors (e.g., should `onInit` be synchronous only, or can it be async)?

---

## Why This Matters

- **User Adoption**: Plugin authors need clear guidance on when and how to use each hook. Ambiguity leads to misuse and bugs.
- **System Reliability**: Without error handling, a single bad plugin can crash the entire system.
- **Feature Completeness**: "Automatic registration" suggests the system is more flexible than the code indicates—this mismatch erodes trust.
- **Maintainability**: Plugin dependencies and ordering aren't handled, which becomes a blocker as the plugin ecosystem grows.
- **Debugging**: Lack of plugin introspection (listing plugins, checking status) makes troubleshooting production issues harder.

---

## Summary

The current implementation is a minimal proof-of-concept, but the documentation overpromises "automatic registration" and doesn't explain the lifecycle model or error handling strategy. Before adoption, these gaps should be clarified so users understand the actual guarantees and constraints.
