const { expect } = require('chai')
const { EndPoint } = require('../../lib/entities/EndPoint')
const { SignedTransaction } = require('../../lib/transactions/signed/SignedTransaction')
const { Constants } = require('../../lib/utils/constants')

const rejectRequest = (fioSdk, fioSdk2, {
  publicKey,
  publicKey2,
  testFioAddressName,
  testFioAddressName2,
  fioChainCode,
  fioTokenCode,
  defaultFee,
  timeout
}) => {
  const fundsAmount = 4
  let requestId
  const memo = 'testing fund request'

  it(`requestFunds`, async () => {
    const content = {
      payer_fio_public_key: publicKey,
      payee_public_address: publicKey2,
      amount: `${fundsAmount}`,
      chain_code: fioChainCode,
      token_code: fioTokenCode,
      memo,
      hash: '',
      offline_url: '',
    }
    const trx = new SignedTransaction()
    const result = await fioSdk2.pushTransaction(Constants.actionNames.newfundsreq, {
      payer_fio_address: testFioAddressName,
      payee_fio_address: testFioAddressName2,
      max_fee: defaultFee,
      content: trx.getCipherContent(Constants.CipherContentTypes.new_funds_content, content, fioSdk2.privateKey, publicKey)
    })

    requestId = result.fio_request_id
    expect(result).to.have.all.keys('fio_request_id', 'status', 'fee_collected')
    expect(result.fio_request_id).to.be.a('number')
    expect(result.status).to.be.a('string')
    expect(result.fee_collected).to.be.a('number')
  })

  it(`getPendingFioRequests`, async () => {
    await timeout(4000)
    const result = await fioSdk.get(EndPoint.pendingFioRequests, {
      fio_public_key: fioSdk.publicKey
    }, {
      decrypt: {
        key: 'requests',
        contentType: Constants.CipherContentTypes.new_funds_content
      }
    })

    expect(result).to.have.all.keys('requests', 'more')
    expect(result.requests).to.be.a('array')
    expect(result.more).to.be.a('number')
    const pendingReq = result.requests.find(pr => parseInt(pr.fio_request_id) === parseInt(requestId))
    expect(pendingReq).to.have.all.keys('fio_request_id', 'payer_fio_address', 'payee_fio_address', 'payee_fio_public_key', 'payer_fio_public_key', 'time_stamp', 'content')
    expect(pendingReq.fio_request_id).to.be.a('number')
    expect(pendingReq.fio_request_id).to.equal(requestId)
    expect(pendingReq.payer_fio_address).to.be.a('string')
    expect(pendingReq.payer_fio_address).to.equal(testFioAddressName)
    expect(pendingReq.payee_fio_address).to.be.a('string')
    expect(pendingReq.payee_fio_address).to.equal(testFioAddressName2)
  })

  it(`getFee for rejectFundsRequest`, async () => {
    const result = await fioSdk.getFee('getFeeForRejectFundsRequest', testFioAddressName2) // payerFioAddress

    expect(result).to.have.all.keys('fee')
    expect(result.fee).to.be.a('number')
  })

  it(`rejectFundsRequest`, async () => {
    const result = await fioSdk.pushTransaction(Constants.actionNames.rejectfndreq, {
      fio_request_id: requestId,
      maxFee: defaultFee,
    })

    expect(result).to.have.all.keys('status', 'fee_collected')
    expect(result.status).to.be.a('string')
    expect(result.fee_collected).to.be.a('number')
  })
}

module.exports = {
  rejectRequest
}
