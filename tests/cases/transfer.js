const { expect } = require('chai')
const { FIOSDK } = require('../../lib/FIOSDK')
const { Constants } = require('../../lib/utils/constants')

const transfer = (fioSdk, fioSdk2, {
  publicKey2,
  timeout
}) => {
  const fundsAmount = FIOSDK.SUFUnit
  let fioBalance = 0
  let fioBalanceAfter = 0

  it(`Check balance before transfer`, async () => {
    const result = await fioSdk2.genericAction('getFioBalance', {})

    fioBalance = result.balance
  })

  it(`Transfer tokens`, async () => {
    const result = await fioSdk.pushTransaction(Constants.actionNames.trnsfiopubky, {
      payee_public_key: publicKey2,
      amount: `${fundsAmount}`,
      max_fee: defaultFee,
    }, {
      additionalReturnKeys: {
        transaction_id: ['transaction_id'],
        block_num: ['processed', 'block_num']
      }
    })

    expect(result).to.have.all.keys('status', 'fee_collected', 'transaction_id', 'block_num')
    expect(result.status).to.be.a('string')
    expect(result.transaction_id).to.be.a('string')
    expect(result.block_num).to.be.a('number')
    expect(result.fee_collected).to.be.a('number')
  })

  it(`Check balance and balance change`, async () => {
    await timeout(10000)
    const result = await fioSdk2.genericAction('getFioBalance', {})
    fioBalanceAfter = result.balance
    expect(fundsAmount).to.equal(fioBalanceAfter - fioBalance)
  })
}

module.exports = {
  transfer
}
