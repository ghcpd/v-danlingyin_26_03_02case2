import { Plugin } from "./plugin";

export class PluginManager {
  private plugins: Plugin[] = [];

  register(plugin: Plugin) {
    this.plugins.push(plugin);
  }

  start() {
    this.plugins.forEach((p) => {
      p.onInit?.();
      p.onStart?.();
    });
  }

  stop() {
    this.plugins.forEach((p) => {
      p.onStop?.();
    });
  }
}