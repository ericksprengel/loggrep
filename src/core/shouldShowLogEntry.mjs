
const shouldShowLogEntry = ({
  filterModules,
  line,
  level,
  tag,
  pid,
  message,
}) => {
  for (const filterModule of filterModules) {
    for (const filter of filterModule.filters) {
      if (filter instanceof Function) {
        if (filter({line, level, tag, pid, message})) {
          return true
        }
        continue
      }
      if ((!filter.line || filter.line.test(line))
        && (!filter.level || filter.level.test(level))
        && (!filter.tag || filter.tag.test(tag))
        && (!filter.pid || filter.pid.test(pid))
        && (!filter.message || filter.message.test(message))) {
        return true
      }
    }
  }
  return false
}

export default shouldShowLogEntry
