export interface LogsStreamState<T = any> {
  logs: T[];
  paused: boolean;
  pause: () => void;
  resume: () => void;
  clear: () => void;
}
