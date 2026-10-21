import {afterAll, expect, test} from 'bun:test'
import {mkdtemp, rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import loadFilters from '../src/core/loadFilters'

const directory = await mkdtemp(join(tmpdir(), 'loggrep-modules-'))
afterAll(() => rm(directory, {recursive: true, force: true}))

async function moduleFile(name: string, source: string) {
  const path = join(directory, name)
  await Bun.write(path, source)
  return path
}

test('loads TypeScript and JavaScript using absolute paths including URL characters', async () => {
  const ts = await moduleFile('with space #.ts', 'export const handler = async (config: {tag: string}) => ({filters: [{tag: new RegExp(config.tag)}]})')
  const js = await moduleFile('custom.js', 'export const handler = async () => ({filters: [() => true]})')
  const modules = await loadFilters({tag: '^App$'}, [ts, js])
  expect(modules).toHaveLength(2)
  expect(modules[0].filters?.[0]).toEqual({tag: /^App$/})
})

test('loads builtins, relative paths and hook-only modules', async () => {
  const modules = await loadFilters({}, ['@all', '@none', './test/fixtures/scenario.ts'])
  expect(modules).toHaveLength(3)
  const hooks = await moduleFile('hooks.ts', 'export const handler = async () => ({hooks: {onNewLine() {}}})')
  expect((await loadFilters({}, [hooks]))[0].hooks?.onNewLine).toBeFunction()
})

test('errors identify the path and invalid module contract', async () => {
  for (const [name, source] of [
    ['missing-export.ts', 'export const other = 1'],
    ['bad-result.ts', 'export const handler = async () => null'],
    ['bad-filters.ts', 'export const handler = async () => ({filters: [{tag: "App"}]})'],
    ['bad-hooks.ts', 'export const handler = async () => ({hooks: {onNewLine: true}})'],
    ['throws.ts', 'export const handler = async () => { throw new Error("setup failed") }'],
  ]) {
    const path = await moduleFile(name, source)
    await expect(loadFilters({}, [path])).rejects.toThrow(`Cannot load module "${path}"`)
  }
  await expect(loadFilters({}, ['@missing'])).rejects.toThrow('unknown built-in module')
  await expect(loadFilters({}, [join(directory, 'missing.ts')])).rejects.toThrow('missing.ts')
})
