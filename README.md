# loggrep

Compose TypeScript and JavaScript modules to inspect Android logcat streams or replay saved logs. Modules can match tags, messages, levels and process IDs, or keep state across events to recognize a scenario.

Inspired by [pidcat](https://github.com/JakeWharton/pidcat).

## Requirements and setup

Use **Bun 1.4.3**, pinned in `.tool-versions` (for example, `asdf install`). Live input also requires Android platform tools (`adb`) and a connected device/emulator.

```sh
bun install --frozen-lockfile
bun run dev -- --help
bun run dev -- -m @all
```

To register the `loggrep` command globally from this checkout (the Bun global bin directory must be on PATH):

```sh
bun link
```

The package registers a `loggrep` executable with a Bun shebang. No compilation or Node.js runtime is required. Bun must remain available on PATH.

## CLI

```sh
loggrep -m performance_issues.ts
loggrep -m ./performance_issues.ts -m ./app_start.js
loggrep -m ./scenario.ts -i recorded.txt
loggrep -m @pidcat -c config.json
```

| Option | Behavior |
| --- | --- |
| `-m`, `--module <path>` | Repeat to combine modules; defaults to `@all` when omitted. |
| `-i`, `--input <path>` | Read a saved logcat recording instead of live adb. |
| `-c`, `--config <path>` | Pass a JSON object to every handler; defaults to `{}`. |
| `-R`, `--reset` | Clear live device logs before reading; incompatible with `--input`. |
| `-h`, `--help` | Show usage. |
| `-v`, `--version` | Show package version. |

Module, input and config paths resolve from the caller's working directory. Modules may also use absolute paths. Internal modules are `@all`, `@none`, `@banana`, `@pidcat` and `@time_error`.

Configuration for pidcat, for example:

```json
{"packages": ["com.example.app"]}
```

`@pidcat` queries current device PIDs through adb. Its existing lifecycle markers are `ADD_APP_START` and `ADD_APP_END`; it is not a general Android process-lifecycle tracker. Modules that query adb still require a device when used with a recording. Use predicates on recorded entries for offline-only analysis.

## Write a module

```ts
import type {LoggrepHandler} from 'loggrep'

export const handler: LoggrepHandler = async config => {
  let checkoutActive = false
  return {
    hooks: {
      onNewLine: ({tag, message}) => {
        if (tag !== 'Scenario') return
        if (message === 'BEGIN checkout') checkoutActive = true
        if (message === 'END checkout') checkoutActive = false
      },
    },
    filters: [
      entry => checkoutActive && entry.level === 'E',
      {tag: /^Choreographer$/, message: /Skipped/},
    ],
  }
}
```

JavaScript modules use the same named `handler` export without the type annotations. Handler factories are asynchronous; predicates and hooks are synchronous. Keep per-run state inside the factory.

Fields within a regex object combine with **AND**. Filters within a module and modules within a run combine with **OR**. An empty filter array or omitted `filters` matches nothing; `{}` matches everything. Global/sticky regexes are reset for each match. Predicates receive the complete parsed entry, including timestamp and thread ID.

For each parsed entry, all `onNewLine` hooks run in module order **before** matching. If any filter matches, all modules' `onLineMatch` hooks run, then the entry is printed once. These are global-match hooks, not module-local hooks. A hook-only module can observe every entry without making it visible.

The public exports currently provide types from `loggrep`, the existing default formatter from `loggrep/format`, and the pidcat handler from `loggrep/filters/pidcat`. A programmatic processing API will be designed in the subsequent architecture review. See the sibling `loggrep-client` repository for runnable modules.

## Record and replay

```sh
adb logcat -v threadtime -v epoch > recorded.txt
loggrep -m ./scenario.ts -i recorded.txt
```

Input uses epoch/threadtime logcat format:

```text
1729512000.400 100 101 E Network: checkout timed out
```

Banners and unrecognized lines are skipped. Files are streamed in recorded order, without replay timing delays or loading the entire file into memory. Module hooks can produce their own reports; CLI and adb diagnostics go to stderr. EOF closes normally, failures return exit code 1, and SIGINT/SIGTERM stop the child adb process.

## Development

```sh
bun check
bun test
```

Tests cover module loading, composition, streaming, replay and subprocess cleanup using a fake adb. No device is needed for automated tests. CI uses Bun 1.4.3 and frozen lockfiles. Lint/format tooling is deferred; follow `.editorconfig` and the surrounding code style.

Version 3 replaces the oclif CLI: there is no `logcat` subcommand, `-f` is replaced by `-m`, and imports from `loggrep/dist/...` are removed. Installation, execution and tests use Bun; there is no build step. This migration preserves the existing filter model. A separate architecture review will address the library API, state, composition and lifecycle.
