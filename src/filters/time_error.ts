import { LogEntry, LoggrepHandler } from '../types/log'

export const handler: LoggrepHandler = async () => {
    const filters = [
        (logEntry: LogEntry) => {
            return logEntry.level == "E"
        },
    ]

    var lastTime = new Date().getTime();

    const onLineMatch = (logEntry: LogEntry) => {
        console.log(logEntry.epoch!.getTime() - lastTime);
        lastTime = logEntry.epoch!.getTime();
    }

    const hooks = {
        onLineMatch,
    }

    return {
        filters,
        hooks
    }
}
