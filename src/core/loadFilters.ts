import {resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
import type {FilterRegExp, LoggrepConfig, LoggrepHandlerInstance} from '../types/log'

const builtins = new Set(['all', 'none', 'pidcat', 'banana', 'time_error'])
const fields: (keyof FilterRegExp)[] = ['line', 'level', 'tag', 'pid', 'message']

const loadFilters = async (
  config: LoggrepConfig,
  paths: string[],
): Promise<LoggrepHandlerInstance[]> => {
  return Promise.all(paths.map(async path => {
    try {
      if (path.startsWith('@') && !builtins.has(path.slice(1))) {
        throw new Error('unknown built-in module')
      }
      const url = path.startsWith('@')
        ? new URL(`../filters/${path.slice(1)}.ts`, import.meta.url).href
        : pathToFileURL(resolve(path)).href
      const module = await import(url)
      if (typeof module.handler !== 'function') {
        throw new Error('expected an exported handler function')
      }
      const instance: unknown = await module.handler(config)
      validate(instance)
      return instance
    } catch (cause) {
      const reason = cause instanceof Error ? cause.message : String(cause)
      throw new Error(`Cannot load module "${path}": ${reason}`)
    }
  }))
}

function validate(instance: unknown): asserts instance is LoggrepHandlerInstance {
  if (!instance || typeof instance !== 'object' || Array.isArray(instance)) {
    throw new Error('handler must return an object')
  }
  const {filters, hooks} = instance as LoggrepHandlerInstance
  if (filters !== undefined && (!Array.isArray(filters) || !filters.every(filter =>
    typeof filter === 'function' || (
      filter !== null && typeof filter === 'object' && !Array.isArray(filter) &&
      Object.keys(filter).every(key => fields.includes(key as keyof FilterRegExp)) &&
      fields.every(field => filter[field] === undefined || filter[field] instanceof RegExp)
    )
  ))) {
    throw new Error('filters must be an array of predicates or regular-expression objects')
  }
  if (hooks !== undefined && (
    !hooks || typeof hooks !== 'object' || Array.isArray(hooks) ||
    ['onNewLine', 'onLineMatch'].some(key => {
      const hook = hooks[key as keyof typeof hooks]
      return hook !== undefined && typeof hook !== 'function'
    })
  )) {
    throw new Error('hooks must contain onNewLine/onLineMatch functions')
  }
}

export default loadFilters
