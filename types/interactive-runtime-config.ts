export interface InteractiveRuntimeConfig {
  version?: number;
  fullscreen?: boolean;
  allowReset?: boolean;
  showProgress?: boolean;
  showPoints?: boolean;
  showAchievements?: boolean;
  settings?: Record<string, string | number | boolean>;
}
