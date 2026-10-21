export type LogLevel = 'V' | 'D' | 'I' | 'W' | 'E' | 'F'

export interface LogEntry {
  line: string
  epoch?: Date
  tid?: string
  level: LogLevel
  tag: string
  pid: string
  message?: string
}

export type FilterFunction = (entry: LogEntry) => boolean

export interface FilterRegExp {
  line?: RegExp
  level?: RegExp
  tag?: RegExp
  pid?: RegExp
  message?: RegExp
}

export type Filter = FilterRegExp | FilterFunction
export type LoggrepConfig = Record<string, unknown>

export interface LoggrepHandlerInstance {
  filters?: Filter[]
  hooks?: {
    onNewLine?: (entry: LogEntry) => void
    onLineMatch?: (entry: LogEntry) => void
  }
}

export type LoggrepHandler = (config: LoggrepConfig) => Promise<LoggrepHandlerInstance>
