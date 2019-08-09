const pidcatFilter = (line, level, tag, pid, message) => {
  return pid === '26036'
}

const filters = [
  pidcatFilter
]

export {
  filters,
}
