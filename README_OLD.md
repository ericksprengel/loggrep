# loggrep
Loggrep is a awesome tool to analyze logs with custom filters and views.

It's totally inspired on [pidcat from Jake Wharton](https://github.com/JakeWharton/pidcat)

# Why loggrep?

Filter adb logcat output is a painful task.
If you'd like to filter by tag, message, log level or pid; you probably already used a combination of grep commands.
But if you are debugging Android OS (framework, applications, radio etc.) in debug mode, you know that it's impossible to handle it.

`loggrep` is a tool with powerful and customizable filters/formatters that will help you.


P.S.: if you're trying to filter only your application log, you just need [Jake Wharton's pidcat](https://github.com/JakeWharton/pidcat)

# Install

```shell
$ npm install -g loggrep
```

# Usage

### Log everything:
```shell
$ loggrep logcat @all
```

### Custom log:

Create `myLog.mjs`
```js
export default async (config) => {
  /**
   * Here you can initialize your module
   * with `config` param.
   * 
   * In this example all log lines
   * with tag `Choreographer`
   * OR with messages containing
   * `leak` word will be printed.
   **/
  return {
    filters: [
      { tag: /^Choreographer$/ },
      { message: /leak/ },
    ],
  }
}
```
Run:
```shell
$ loggrep logcat ./mylog.mjs
```

## Advanced

### Combining filter modules

```shell
$ loggrep logcat ./mylog1.mjs ./mylog2.mjs
```

P.S.: a log line is printed if at least one filter accepts it. Remember it's always using `OR` logic operator

### Custom filter functions

```js
export default async (config) => {
  /**
   * In this example all log lines
   * with tag `Choreographer`
   * AND skipping 50 frames are shown.
   * It could be improved to check
   * if more than 50 frames were
   * skipped, but it's just an
   * example.
   **/
  const wasSkippedTooManyFrames = ({
    line,
    level,
    tag,
    pid,
    message,
  }) => {
    return (
      tag === 'Choreographer'
      && message.startsWith('Skipped 50 frames!')
    )
  }

  return {
    filters: [
      wasSkippedTooManyFrames,
    ],
  }
}
```