export async function loadPids(packages: string[]): Promise<string[]> {
  if (packages.length === 0) return []
  const child = Bun.spawn(['adb', 'shell', 'ps'], {stdout: 'pipe', stderr: 'pipe'})
  const [stdout, stderr, code] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
    child.exited,
  ])
  if (code !== 0) throw new Error(`adb shell ps exited with code ${code}: ${stderr.trim()}`)
  const lines = stdout.trim().split(/\r?\n/)
  const headers = (lines.shift() ?? '').trim().split(/\s+/)
  const pidColumn = headers.indexOf('PID')
  const nameColumn = headers.indexOf('NAME') === -1 ? headers.indexOf('CMD') : headers.indexOf('NAME')
  if (pidColumn === -1 || nameColumn === -1) throw new Error('Unrecognized adb shell ps header')
  return lines.flatMap(line => {
    const columns = line.trim().split(/\s+/)
    return packages.includes(columns[nameColumn]) ? [columns[pidColumn]] : []
  })
}
