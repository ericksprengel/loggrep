loggrep
=======

Loggrep is a awesome tool to analyze logs with custom filters and views

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/loggrep.svg)](https://npmjs.org/package/loggrep)
[![Downloads/week](https://img.shields.io/npm/dw/loggrep.svg)](https://npmjs.org/package/loggrep)
[![License](https://img.shields.io/npm/l/loggrep.svg)](https://github.com/ericksprengel/loggrep/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g loggrep
$ loggrep COMMAND
running command...
$ loggrep (-v|--version|version)
loggrep/1.0.0 darwin-x64 node-v15.3.0
$ loggrep --help [COMMAND]
USAGE
  $ loggrep COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`loggrep hello [FILE]`](#loggrep-hello-file)
* [`loggrep help [COMMAND]`](#loggrep-help-command)
* [`loggrep logcat`](#loggrep-logcat)

## `loggrep hello [FILE]`

describe the command here

```
USAGE
  $ loggrep hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ loggrep hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/ericksprengel/loggrep/blob/v1.0.0/src/commands/hello.ts)_

## `loggrep help [COMMAND]`

display help for loggrep

```
USAGE
  $ loggrep help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.2/src/commands/help.ts)_

## `loggrep logcat`

describe the command here

```
USAGE
  $ loggrep logcat

OPTIONS
  -c, --config=config    config file
  -f, --filters=filters  [default: @all] filters
  -h, --help             show CLI help
```

_See code: [src/commands/logcat.ts](https://github.com/ericksprengel/loggrep/blob/v1.0.0/src/commands/logcat.ts)_
<!-- commandsstop -->
