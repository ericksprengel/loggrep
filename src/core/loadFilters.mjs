import log from '../utils/log.mjs'

const loadFilters = async (config, filterPaths) => {
  try {
    const mods = await Promise.all(filterPaths.map((filterPath) => {
      if (filterPath.startsWith('@')) {
        return import(`../filters/${filterPath.substr(1)}.mjs`)
      }
      return import(`${process.cwd()}/${filterPath}`)
    }))
    return Promise.all(mods.map(mod => mod.default(config)))
  } catch (error) {
    log.e('Failed to load filters')
    log.e(`error message (${error.name}): ${error.message}`)
    if (error instanceof SyntaxError) {
      log.e('linha:', error.lineNumber)
    }
    process.exit(1)
  }
}

export default loadFilters
