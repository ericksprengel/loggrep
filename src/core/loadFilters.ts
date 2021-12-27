/* eslint-disable unicorn/filename-case */
import log from '../utils/log'
import {LoggrepConfig, LoggrepHandler, LoggrepHandlerInstance} from '../types/log'

const loadFilters = async (
  config: LoggrepConfig,
  filterPaths: string[],
): Promise<LoggrepHandlerInstance[]> => {
  try {
    // load modules
    const handlers = await Promise.all(filterPaths.map(async (filterPath: string): Promise<LoggrepHandler> => {
      if (filterPath.startsWith('@')) {
        // load embedded filters (eg: @all, @none, @pidcat)
        return (await import(`../filters/${filterPath.substr(1)}`)).handler
      }
      // load custom filters (eg: ./myapp.ts, ./myerros.ts)
      return (await import(`${process.cwd()}/${filterPath}`)).handler
    }))

    // load filter instances
    return Promise.all(handlers.map(handler => handler(config)))
  } catch (error) {
    log.e('Failed to load filters')
    throw error
    // if (error instanceof SyntaxError) {
    //   log.e('linha:', error.lineNumber)
    // }
  }
}

export default loadFilters
