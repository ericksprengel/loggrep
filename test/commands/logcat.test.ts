import {expect, test} from '@oclif/test'

describe('logcat', () => {
  test
  .stdout()
  .command(['logcat'])
  .it('runs default', ctx => {
    expect(ctx.stdout).to.contain('config \'{"packages":["br.com.comunicap","br.com.stone.ton.development","br.com.stone.ton"]}\'\n')
    expect(ctx.stdout).to.contain('filters: @all')
  })

  test
  .stdout()
  .command(['logcat', '-f', '@banana', '@batata'])
  .it('runs with -f @banana @batata', ctx => {
    expect(ctx.stdout).to.contain('filters: @banana, @batata')
  })
})
