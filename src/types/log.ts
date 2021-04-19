
export type LogLevel = 'V' | 'D' | 'I' | 'W' | 'E' | 'F'

export interface LogEntry {
  line: string;
  level: LogLevel;
  tag: string;
  pid: string;
  message?: string;
}

export type FilterFunction = () => boolean

export type Filter = RegExp | FilterFunction

export interface LoggrepHandlerInstance {
  filters: Filter[];
}

export type LoggrepHandler = (config: object) => Promise<LoggrepHandlerInstance>

export type LoggrepConfig = object
