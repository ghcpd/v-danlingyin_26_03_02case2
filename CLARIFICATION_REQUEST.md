# Clarification Request: Plugin System

## ✅ What the code actually does (brief)
- `src/plugin.ts` defines a `Plugin` interface with:
  - `name` (required string)
  - optional lifecycle hooks: `onInit()`, `onStart()`, `onStop()`
- `src/pluginManager.ts` provides a `PluginManager` class that:
  - holds a list of registered plugins
  - registers plugins via `register(plugin)` (pushes to array)
  - calls `onInit()` then `onStart()` for each plugin in `start()`
  - calls `onStop()` for each plugin in `stop()`

## ❓ What's unclear or undocumented
- The README says plugins will "automatically register and execute" but there is no code showing **how plugins are discovered/loaded** or where they are registered.
- It is not clear what guarantees exist around the order in which plugin hooks are invoked.
- It is unclear whether lifecycle methods are allowed to be async (return `Promise`) and how the manager handles that.
- There is no mention of error handling: what happens if a plugin throws in `onInit`, `onStart`, or `onStop`?
- There is no guidance on expected plugin naming conventions, metadata, or how to prevent duplicate registration.
- The scope of plugin lifecycle phases is not defined: what should be done in `onInit` vs. `onStart` vs. `onStop`?

## 🧾 Specific questions for maintainers
1. **Plugin registration mechanism**: How and where are plugins expected to be registered with `PluginManager`? Is there an automatic discovery mechanism, or must consumers call `register()` manually? If automatic, what file structure / conventions are required?
2. **Execution ordering**: Is plugin execution order important? Should `PluginManager` preserve registration order, or is there a different expected ordering (e.g., by name, dependency)?
3. **Async lifecycle hooks**: Are `onInit`, `onStart`, and `onStop` expected to support async behavior (return `Promise`)? If so, should `PluginManager` `await` them, and should it run them in series or in parallel?
4. **Error handling**: What should happen if a plugin throws an exception during a lifecycle hook? Should that prevent other plugins from running, or should it be isolated/logged and allow continuation?
5. **Plugin identity and uniqueness**: Is `name` intended to be unique across plugins? If so, is there any enforcement or recommendations to avoid duplicate names?
6. **Lifecycle contract definition**: Can you clarify the intended responsibilities for each hook (`onInit`, `onStart`, `onStop`)? For example, should `onInit` be used for configuration/loading, while `onStart` is for starting background tasks?

## ⚠️ Why it matters if these stay unanswered
- **Incorrect usage**: Consumers might implement plugins incorrectly (e.g., async logic in hooks without awaiting), leading to subtle bugs.
- **Hidden assumptions**: If plugins are expected to register automatically but no mechanism is documented, it creates confusion and potentially broken setups.
- **Stability risks**: Without clear error handling rules, a single faulty plugin could inadvertently break the entire system or prevent shutdown.
- **Maintainability**: Future contributors may add plugins with inconsistent assumptions about hook ordering and lifecycle semantics, making behavior unpredictable.
