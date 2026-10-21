import type {LoggrepHandler} from '../types/log'

export const handler: LoggrepHandler = async () => {
  let lastTime: number | undefined
  return {
    filters: [entry => entry.level === 'E'],
    hooks: {
      onLineMatch: entry => {
        if (!entry.epoch || entry.level !== 'E') return
        const time = entry.epoch.getTime()
        if (lastTime !== undefined) console.log(time - lastTime)
        lastTime = time
      },
    },
  }
}
