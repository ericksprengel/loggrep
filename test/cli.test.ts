import {afterAll, describe, expect, test} from 'bun:test'
import {chmod, mkdtemp, rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {loadPids} from '../src/utils/adb/loadPids'

const cli = join(import.meta.dir, '../src/cli.ts')
const directory = await mkdtemp(join(tmpdir(), 'loggrep-cli-'))
afterAll(() => rm(directory, {recursive: true, force: true}))
let caseNumber = 0

async function run(args: string[], options: {cwd?: string, env?: Record<string, string | undefined>} = {}) {
  const child = Bun.spawn([process.execPath, cli, ...args], {
    cwd: options.cwd, env: {...process.env, NO_COLOR: '1', ...options.env}, stdout: 'pipe', stderr: 'pipe',
  })
  const [stdout, stderr, code] = await Promise.all([
    new Response(child.stdout).text(), new Response(child.stderr).text(), child.exited,
  ])
  return {stdout, stderr, code}
}

async function fakeAdb(mode = '') {
  const path = join(directory, String(caseNumber++))
  await Bun.write(join(path, 'adb'), Bun.file(new URL('./fixtures/adb.ts', import.meta.url)))
  await chmod(join(path, 'adb'), 0o755)
  return {
    path,
    env: {
      PATH: `${path}:${process.env.PATH}`,
      LOGGREP_TEST_MODE: mode,
      LOGGREP_TEST_CALLS: join(path, 'calls'),
      LOGGREP_TEST_READY: join(path, 'ready'),
      LOGGREP_TEST_STOPPED: join(path, 'stopped'),
    },
  }
}

async function waitForFile(path: string) {
  for (let attempt = 0; attempt < 150; attempt++) {
    if (await Bun.file(path).exists()) return
    await Bun.sleep(20)
  }
  throw new Error(`Timed out waiting for ${path}`)
}

describe('CLI', () => {
  test('help and version work without adb', async () => {
    expect(await run(['--help'])).toMatchObject({code: 0, stderr: ''})
    expect((await run(['--help'])).stdout).toContain('loggrep -m performance_issues.ts')
    expect((await run(['--version'])).stdout.trim()).toBe('3.0.0')
  })
  test('replays a stateful scenario from the caller directory', async () => {
    const result = await run(['-m', 'scenario.ts', '-i', 'scenario.txt'], {cwd: join(import.meta.dir, 'fixtures')})
    expect(result.code).toBe(0)
    expect(result.stderr).toBe('')
    expect(result.stdout).toContain('checkout timed out')
    expect(result.stdout).not.toContain('outside-')
    expect(result.stdout).not.toContain('Skipped')
  })
  test('combines modules with OR and supports no modules and @none', async () => {
    const input = join(import.meta.dir, 'fixtures/scenario.txt')
    const result = await run(['-m', join(import.meta.dir, 'fixtures/scenario.ts'), '-m', '@banana', '-i', input])
    expect(result.code).toBe(0)
    expect(result.stdout).toContain('checkout timed out')
    expect((await run(['-i', input])).stdout).toContain('outside-before')
    expect(await run(['-m', '@none', '-i', input])).toMatchObject({code: 0, stdout: ''})
  })
  test('runs onNewLine before matching and calls all onLineMatch hooks on a global match', async () => {
    const hooks = join(directory, 'hooks.ts')
    await Bun.write(hooks, `export const handler = async () => ({
      hooks: {
        onNewLine: entry => console.log('NEW:' + entry.message),
        onLineMatch: entry => console.log('MATCH:' + entry.message),
      },
    })`)
    const result = await run(['-m', hooks, '-m', join(import.meta.dir, 'fixtures/scenario.ts'), '-i', join(import.meta.dir, 'fixtures/scenario.txt')])
    expect(result.code).toBe(0)
    expect(result.stdout.indexOf('NEW:checkout timed out')).toBeLessThan(result.stdout.indexOf('MATCH:checkout timed out'))
    expect(result.stdout.match(/MATCH:/g)).toHaveLength(1)
    expect(result.stdout).toContain('NEW:outside-before')
    expect(result.stdout).toContain('NEW:outside-after')
  })
  test('passes JSON config to a JavaScript module', async () => {
    const module = join(directory, 'configured.js')
    const config = join(directory, 'config.json')
    await Bun.write(module, 'export const handler = async config => ({filters: [{tag: new RegExp(config.tag)}]})')
    await Bun.write(config, JSON.stringify({tag: '^Choreographer$'}))
    const result = await run(['-m', module, '-c', config, '-i', join(import.meta.dir, 'fixtures/scenario.txt')])
    expect(result.code).toBe(0)
    expect(result.stdout).toContain('Skipped 42 frames!')
    expect(result.stdout).not.toContain('timed out')
  })
  test('rejects bad arguments, config, modules and missing files', async () => {
    const bad = join(directory, 'bad.json')
    const array = join(directory, 'array.json')
    await Bun.write(bad, '{bad')
    await Bun.write(array, '[]')
    for (const args of [
      ['--unknown'], ['logcat'], ['-m'], ['-R', '-i', 'anything'],
      ['-c', bad], ['-c', array], ['-c', join(directory, 'absent.json')],
      ['-m', '@missing'], ['-i', join(directory, 'absent.txt')],
    ]) {
      const result = await run(args)
      expect(result.code).toBe(1)
      expect(result.stdout).toBe('')
      expect(result.stderr).toContain('loggrep:')
    }
  })
})

describe('adb integration', () => {
  test('resets before reading and keeps diagnostics on stderr', async () => {
    const adb = await fakeAdb()
    const result = await run(['-R'], {env: adb.env})
    expect(result).toMatchObject({code: 0})
    expect(result.stdout).toContain('live failure')
    expect(result.stdout).not.toContain('diagnostic')
    expect(result.stderr).toContain('diagnostic from device')
    const calls = (await Bun.file(adb.env.LOGGREP_TEST_CALLS).text()).trim().split('\n').map(line => JSON.parse(line))
    expect(calls).toEqual([['logcat', '-c'], ['logcat', '-v', 'threadtime', '-v', 'epoch']])
  })
  test('propagates reset and streaming errors', async () => {
    for (const [mode, args, error] of [
      ['resetfail', ['-R'], 'reset denied'],
      ['readfail', [], 'device unauthorized'],
    ] as const) {
      const adb = await fakeAdb(mode)
      const result = await run([...args], {env: adb.env})
      expect(result.code).toBe(1)
      expect(result.stderr).toContain(error)
      expect(result.stdout).toBe('')
      if (mode === 'resetfail') expect((await Bun.file(adb.env.LOGGREP_TEST_CALLS).text()).trim().split('\n')).toHaveLength(1)
    }
    const result = await run([], {env: {PATH: directory}})
    expect(result.code).toBe(1)
    expect(result.stderr).toContain('adb')
  })
  test.each(['SIGINT', 'SIGTERM'] as const)('%s closes the waiting adb child', async signal => {
    const adb = await fakeAdb('live')
    const child = Bun.spawn([process.execPath, cli], {env: {...process.env, ...adb.env}, stdout: 'pipe', stderr: 'pipe'})
    const output = new Response(child.stdout).text()
    const errors = new Response(child.stderr).text()
    try {
      await waitForFile(adb.env.LOGGREP_TEST_READY)
      child.kill(signal)
      expect(await child.exited).toBe(signal === 'SIGINT' ? 130 : 143)
      await waitForFile(adb.env.LOGGREP_TEST_STOPPED)
      const pid = Number(await Bun.file(adb.env.LOGGREP_TEST_READY).text())
      expect(() => process.kill(pid, 0)).toThrow()
      await Promise.all([output, errors])
    } finally {
      child.kill()
      await child.exited
    }
  })
  test('a throwing filter stops adb and reports failure', async () => {
    const adb = await fakeAdb('live')
    const module = join(directory, 'throws-on-line.ts')
    await Bun.write(module, 'export const handler = async () => ({filters: [() => { throw new Error("filter failed") }]})')
    const result = await run(['-m', module], {env: adb.env})
    expect(result.code).toBe(1)
    expect(result.stderr).toContain('filter failed')
    await waitForFile(adb.env.LOGGREP_TEST_STOPPED)
  })
  test('pidcat resolves process IDs from adb output', async () => {
    const adb = await fakeAdb()
    const config = join(directory, 'pidcat.json')
    await Bun.write(config, JSON.stringify({packages: ['com.example.app']}))
    const result = await run(['-m', '@pidcat', '-c', config], {env: adb.env})
    expect(result.code).toBe(0)
    expect(result.stdout).toContain('live failure')
    const failure = await fakeAdb('psfail')
    expect((await run(['-m', '@pidcat', '-c', config], {env: failure.env})).stderr).toContain('device offline')
    expect(await loadPids([])).toEqual([])
  })
})
