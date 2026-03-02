export interface Plugin {
  name: string;
  onInit?(): void;
  onStart?(): void;
  onStop?(): void;
}