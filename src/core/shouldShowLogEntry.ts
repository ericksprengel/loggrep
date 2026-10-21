import type {FilterRegExp, LogEntry, LoggrepHandlerInstance} from '../types/log'

const fields = ['line', 'level', 'tag', 'pid', 'message'] as const

const shouldShowLogEntry = (modules: LoggrepHandlerInstance[], entry: LogEntry): boolean => {
  for (const module of modules) {
    for (const filter of module.filters ?? []) {
      if (typeof filter === 'function') {
        if (filter(entry)) return true
        continue
      }
      if (fields.every(field => matches(filter, field, entry[field] ?? ''))) return true
    }
  }
  return false
}

function matches(filter: FilterRegExp, field: keyof FilterRegExp, value: string): boolean {
  const regex = filter[field]
  if (!regex) return true
  regex.lastIndex = 0
  const result = regex.test(value)
  regex.lastIndex = 0
  return result
}

export default shouldShowLogEntry
