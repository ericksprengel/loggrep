/* eslint-disable unicorn/filename-case */
import log from '../utils/log'
import {LoggrepConfig, LoggrepHandler, LoggrepHandlerInstance} from '../types/log'

const loadFilters = async (
  config: LoggrepConfig,
  filterPaths: string[],
): Promise<LoggrepHandlerInstance[]> => {
  try {
    const handlers = await Promise.all(filterPaths.map(async (filterPath: string): Promise<LoggrepHandler> => {
      if (filterPath.startsWith('@')) {
        return (await import(`../filters/${filterPath.substr(1)}`)).handler
      }
      return (await import(`${process.cwd()}/${filterPath}`)).handler
    }))
    return Promise.all(handlers.map(handler => handler(config)))
  } catch (error) {
    log.e('Failed to load filters')
    log.e(`error message (${error.name}): ${error.message}`)
    // if (error instanceof SyntaxError) {
    //   log.e('linha:', error.lineNumber)
    // }
    throw new Error(`Failed to load filter (${error.name}): ${error.message}`)
  }
}

export default loadFilters
