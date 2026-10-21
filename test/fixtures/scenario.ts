import type {LoggrepHandler} from '../../src/types/log'

export const handler: LoggrepHandler = async () => {
  let active = false
  return {
    hooks: {
      onNewLine: entry => {
        if (entry.tag !== 'Scenario') return
        if (entry.message === 'BEGIN checkout') active = true
        if (entry.message === 'END checkout') active = false
      },
    },
    filters: [entry => active && entry.level === 'E'],
  }
}
