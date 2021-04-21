import {LoggrepHandler, FilterFunction} from '../types/log'

export const handler: LoggrepHandler = async () => {
  const filters: FilterFunction[] = []

  return {
    filters,
  }
}
