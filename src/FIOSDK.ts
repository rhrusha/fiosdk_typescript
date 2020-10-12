import { Fio } from '@fioprotocol/fiojs'
import {
  AbiResponse,
  AvailabilityResponse,
  BalanceResponse,
  FioFeeResponse,
  FioNamesResponse,
  PendingFioRequestsResponse,
  PublicAddressResponse,
  SentFioRequestResponse,
  GetObtDataResponse,
  FioAddressesResponse,
} from './entities/responses'
import { EndPoint } from './entities/EndPoint'
import * as queries from './transactions/queries'
import * as SignedTransactions from './transactions/signed'
import { SignedTransaction } from './transactions/signed/SignedTransaction'
import { Transactions } from './transactions/Transactions'
import { Constants } from './utils/constants'
import { validate, allRules } from './utils/validation'
import { ValidationError } from './entities/ValidationError'

/**
 * @ignore
 */
const { Ecc } = require('@fioprotocol/fiojs')

/**
 * @ignore
 */
type FetchJson = (uri: string, opts?: object) => Promise<object>

export class FIOSDK {
  /**
   * @ignore
   */
  public static ReactNativeFio: any

  /**
   * @ignore
   */
  public static async createPrivateKey(entropy: Buffer): Promise<any> {
    const bip39 = require('bip39')
    const mnemonic = bip39.entropyToMnemonic(entropy)
    return await FIOSDK.createPrivateKeyMnemonic(mnemonic)
  }

  /**
   * Create a FIO private key.
   *
   * @param mnemonic mnemonic used to generate a random unique private key.
   * @example real flame win provide layer trigger soda erode upset rate beef wrist fame design merit
   *
   * @returns New FIO private key
   */
  public static async createPrivateKeyMnemonic(mnemonic: string) {
    const hdkey = require('hdkey')
    const wif = require('wif')
    const bip39 = require('bip39')
    const seedBytes = await bip39.mnemonicToSeed(mnemonic)
    const seed = await seedBytes.toString('hex')
    const master = hdkey.fromMasterSeed(new Buffer(seed, 'hex'))
    const node = master.derive('m/44\'/235\'/0\'/0/0')
    const fioKey = wif.encode(128, node._privateKey, false)
    return { fioKey, mnemonic }
  }

  /**
   * Create a FIO public key.
   *
   * @param fioPrivateKey FIO private key.
   *
   * @returns FIO public key derived from the FIO private key.
   */
  public static derivedPublicKey(fioPrivateKey: string) {
    const publicKey = Ecc.privateToPublic(fioPrivateKey)
    return { publicKey }
  }

  /**
   * Is the Chain Code Valid?
   *
   * @param chainCode
   *
   * @returns Chain Code is Valid
   */
  public static isChainCodeValid(chainCode: string) {
    const validation = validate({ chainCode }, { chainCode: allRules.chain })
    if (!validation.isValid) {
      throw new ValidationError(validation.errors, `Validation error`)
    }

    return true
  }

  /**
   * Is the Token Code Valid?
   *
   * @param tokenCode
   *
   * @returns Token Code is Valid
   */
  public static isTokenCodeValid(tokenCode: string) {
    const validation = validate({ tokenCode }, { tokenCode: allRules.chain })
    if (!validation.isValid) {
      throw new ValidationError(validation.errors)
    }

    return true
  }

  /**
   * Is the FIO Address Valid?
   *
   * @param fioAddress
   *
   * @returns Fio Address is Valid
   */
  public static isFioAddressValid(fioAddress: string) {
    const validation = validate({ fioAddress }, { fioAddress: allRules.fioAddress })
    if (!validation.isValid) {
      throw new ValidationError(validation.errors)
    }

    return true
  }

  /**
   * Is the FIO Domain Valid?
   *
   * @param fioDomain
   *
   * @returns FIO Domain is Valid
   */
  public static isFioDomainValid(fioDomain: string) {
    const validation = validate({ fioDomain }, { fioDomain: allRules.fioDomain })
    if (!validation.isValid) {
      throw new ValidationError(validation.errors)
    }

    return true
  }

  /**
   * Is the FIO Public Key Valid?
   *
   * @param fioPublicKey
   *
   * @returns FIO Public Key is Valid
   */
  public static isFioPublicKeyValid(fioPublicKey: string) {
    const validation = validate({ fioPublicKey }, { fioPublicKey: allRules.fioPublicKey })
    if (!validation.isValid) {
      throw new ValidationError(validation.errors)
    }

    return true
  }

  /**
   * Is the Public Address Valid?
   *
   * @param publicAddress
   *
   * @returns Public Address is Valid
   */
  public static isPublicAddressValid(publicAddress: string) {
    const validation = validate({ publicAddress }, { publicAddress: allRules.nativeBlockchainPublicAddress })
    if (!validation.isValid) {
      throw new ValidationError(validation.errors)
    }

    return true
  }


  /**
   * Convert a FIO Token Amount to FIO SUFs
   *
   * @param amount
   *
   * 2.568 FIO should be 2568000000 SUFs
   *
   * @returns FIO SUFs
   */
  public static amountToSUF(amount: number): number {

    // get integer part
    const floor = Math.floor(amount)
    const tempResult = floor * this.SUFUnit

    // get remainder
    const remainder = (amount % 1)
    const remainderResult = remainder * (this.SUFUnit)
    const floorRemainder = Math.floor(remainderResult)

    // add integer and remainder
    return tempResult + floorRemainder
  }

  /**
   * Convert FIO SUFs to a FIO Token amount
   *
   * @param suf
   *
   * @returns FIO Token amount
   */
  public static SUFToAmount(suf: number): number {
    return parseInt(`${suf}`) / this.SUFUnit
  }

  public transactions: Transactions

  /**
   * @ignore
   */
  public registerMockUrl: string

  /**
   * the fio private key of the client sending requests to FIO API.
   */
  public privateKey: string

  /**
   * the fio public key of the client sending requests to FIO API.
   */
  public publicKey: string

  /**
   * Default FIO Address of the wallet which generates transactions.
   */
  public technologyProviderId: string

  /**
   * SUFs = Smallest Units of FIO
   */
  public static SUFUnit: number = 1000000000

  /**
   * Defines whether SignedTransaction would execute or return prepared transaction
   */
  private returnPreparedTrx: boolean = false

  /**
   * // how to instantiate fetchJson parameter
   * i.e.
   * fetch = require('node-fetch')
   *
   * const fetchJson = async (uri, opts = {}) => {
   *  return fetch(uri, opts)
   * }
   *
   * @param privateKey the fio private key of the client sending requests to FIO API.
   * @param publicKey the fio public key of the client sending requests to FIO API.
   * @param baseUrl the url to the FIO API.
   * @param fetchjson - the module to use for HTTP Post/Get calls (see above for example)
   * @param registerMockUrl the url to the mock server
   * @param technologyProviderId Default FIO Address of the wallet which generates transactions.
   */
  constructor(
    privateKey: string,
    publicKey: string,
    baseUrl: string,
    fetchjson: FetchJson,
    registerMockUrl = '',
    technologyProviderId: string = '',
    returnPreparedTrx: boolean = false,
  ) {
    this.transactions = new Transactions()
    Transactions.baseUrl = baseUrl
    Transactions.FioProvider = Fio
    Transactions.fetchJson = fetchjson
    this.registerMockUrl = registerMockUrl
    this.privateKey = privateKey
    this.publicKey = publicKey
    this.technologyProviderId = technologyProviderId
    this.returnPreparedTrx = returnPreparedTrx

    for (const accountName of Constants.rawAbiAccountName) {
      this.getAbi(accountName)
        .then((response) => {
          Transactions.abiMap.set(response.account_name, response)
        })
        .catch((error) => {
          throw error
        })
    }
  }

  /**
   * Retrieves the FIO public key assigned to the FIOSDK instance.
   */
  public getFioPublicKey(): string {
    return this.publicKey
  }

  /**
   * Returns technologyProviderId or default
   */
  public getTechnologyProviderId(technologyProviderId: string | null): string {
    return technologyProviderId !== null ? technologyProviderId : this.technologyProviderId
  }

  /**
   * Set returnPreparedTrx
   */
  public setSignedTrxReturnOption(returnPreparedTrx: boolean): void {
    this.returnPreparedTrx = returnPreparedTrx
  }

  /**
   * @ignore
   */
  private getAbi(accountName: string): Promise<AbiResponse> {
    const abi = new queries.GetAbi(accountName)
    return abi.execute(this.publicKey)
  }

  /**
   * Execute prepared transaction.
   *
   * @param endPoint endpoint.
   * @param preparedTrx
   */
  public async executePreparedTrx(
    endPoint: string,
    preparedTrx: object
  ): Promise<any> {
    const response = await this.transactions.executeCall(`chain/${endPoint}`, JSON.stringify(preparedTrx))
    return SignedTransaction.prepareResponse(response)
  }

  /**
   * Retrives OBT metadata data stored using record send.
   *
   * @param limit Number of request to return. If omitted, all requests will be returned.
   * @param offset First request from list to return. If omitted, 0 is assumed.
   * @param tokenCode Code of the token to filter results
   */
  public getObtData(limit?: number, offset?: number, tokenCode?: string): Promise<GetObtDataResponse> {
    const getObtDataRequest = new queries.GetObtData(this.publicKey, limit, offset, tokenCode)
    return getObtDataRequest.execute(this.publicKey, this.privateKey)
  }

  /**
   * Checks if a FIO Address or FIO Domain is available for registration.
   *
   * @param fioName FIO Address or FIO Domain to check.
   */
  public isAvailable(fioName: string): Promise<AvailabilityResponse> {
    const availabilityCheck = new queries.AvailabilityCheck(fioName)
    return availabilityCheck.execute(this.publicKey)
  }

  /**
   * Retrieves balance of FIO tokens
   *
   * @param fioPublicKey FIO public key.
   */
  public getFioBalance(fioPublicKey?: string): Promise<BalanceResponse> {
    const getFioBalance = new queries.GetFioBalance(fioPublicKey)
    return getFioBalance.execute(this.publicKey)
  }

  /**
   * Returns FIO Addresses and FIO Domains owned by this public key.
   *
   * @param fioPublicKey FIO public key of owner.
   */
  public getFioNames(fioPublicKey: string): Promise<FioNamesResponse> {
    const getNames = new queries.GetNames(fioPublicKey)
    return getNames.execute(this.publicKey)
  }

  /**
   * Returns FIO Addresses  owned by this public key.
   *
   * @param fioPublicKey FIO public key of owner.
   * @param limit Number of request to return. If omitted, all requests will be returned.
   * @param offset First request from list to return. If omitted, 0 is assumed.
   */
  public getFioAddresses(fioPublicKey: string, limit?: number, offset?: number): Promise<FioAddressesResponse> {
    const getNames = new queries.GetAddresses(fioPublicKey, limit, offset)
    return getNames.execute(this.publicKey)
  }

  /**
   * Returns FIO domains  owned by this public key.
   *
   * @param fioPublicKey FIO public key of owner.
   * @param limit Number of request to return. If omitted, all requests will be returned.
   * @param offset First request from list to return. If omitted, 0 is assumed.
   */
  public getFioDomains(fioPublicKey: string, limit?: number, offset?: number): Promise<FioAddressesResponse> {
    const getNames = new queries.GetDomains(fioPublicKey, limit, offset)
    return getNames.execute(this.publicKey)
  }

  /**
   * Polls for any pending requests sent to public key associated with the FIO SDK instance.
   *
   * @param limit Number of request to return. If omitted, all requests will be returned.
   * @param offset First request from list to return. If omitted, 0 is assumed.
   */
  public getPendingFioRequests(limit?: number, offset?: number): Promise<PendingFioRequestsResponse> {
    const pendingFioRequests = new queries.PendingFioRequests(this.publicKey, limit, offset)
    return pendingFioRequests.execute(this.publicKey, this.privateKey)
  }

  /**
   * Polls for any sent requests sent by public key associated with the FIO SDK instance.
   *
   * @param limit Number of request to return. If omitted, all requests will be returned.
   * @param offset First request from list to return. If omitted, 0 is assumed.
   */
  public getSentFioRequests(limit?: number, offset?: number): Promise<SentFioRequestResponse> {
    const sentFioRequest = new queries.SentFioRequests(this.publicKey, limit, offset)
    return sentFioRequest.execute(this.publicKey, this.privateKey)
  }

  /**
   * Polls for any cancelled requests sent by public key associated with the FIO SDK instance.
   *
   * @param limit Number of request to return. If omitted, all requests will be returned.
   * @param offset First request from list to return. If omitted, 0 is assumed.
   */
  public getCancelledFioRequests(limit?: number, offset?: number): Promise<any> {
    const cancelledFioRequest = new queries.CancelledFioRequests(this.publicKey, limit, offset)
    return cancelledFioRequest.execute(this.publicKey, this.privateKey)
  }

  /**
   * Returns a token public address for specified token code and FIO Address.
   *
   * @param fioAddress FIO Address for which the token public address is to be returned.
   * @param chainCode Blockchain code for which public address is to be returned.
   * @param tokenCode Token code for which public address is to be returned.
   */
  public getPublicAddress(
    fioAddress: string,
    chainCode: string,
    tokenCode: string,
  ): Promise<PublicAddressResponse> {
    const publicAddressLookUp = new queries.GetPublicAddress(
      fioAddress,
      chainCode,
      tokenCode,
    )
    return publicAddressLookUp.execute(this.publicKey)
  }

  /**
   * Returns the FIO token public address for specified FIO Address.
   *
   * @param fioAddress FIO Address for which fio token public address is to be returned.
   */
  public getFioPublicAddress(fioAddress: string): Promise<PublicAddressResponse> {
    return this.getPublicAddress(fioAddress, 'FIO', 'FIO')
  }

  /**
   * Compute and return fee amount for specific call and specific user
   *
   * @param endPoint Name of API call end point, e.g. add_pub_address.
   * @param fioAddress
   *        if endPointName is RenewFioAddress, FIO Address incurring the fee and owned by signer.
   *        if endPointName is RenewFioDomain, FIO Domain incurring the fee and owned by signer.
   *        if endPointName is RecordObtData, Payer FIO Address incurring the fee and owned by signer.
   *
   *        Omit for:
   *        - register_fio_domain
   *        - register_fio_address
   *        - transfer_tokens_pub_key
   */
  public getFee(endPoint: EndPoint, fioAddress: string = ''): Promise<FioFeeResponse> {
    const fioFee = new queries.GetFee(endPoint, fioAddress)
    return fioFee.execute(this.publicKey)
  }

  /**
   * Compute and return fee amount for specific call and specific user
   *
   * @param payerFioAddress, Payer FIO Address incurring the fee and owned by signer.
   */
  public getFeeForRecordObtData(payerFioAddress: string): Promise<FioFeeResponse> {
    return this.getFee(EndPoint.recordObtData, payerFioAddress)
  }

  /**
   * Compute and return fee amount for specific call and specific user
   *
   * @param payeeFioAddress Payee FIO Address incurring the fee and owned by signer.
   */
  public getFeeForNewFundsRequest(payeeFioAddress: string): Promise<FioFeeResponse> {
    return this.getFee(EndPoint.newFundsRequest, payeeFioAddress)
  }

  /**
   * Compute and return fee amount for specific call and specific user
   *
   * @param payerFioAddress Payer FIO Address incurring the fee and owned by signer.
   */
  public getFeeForRejectFundsRequest(payerFioAddress: string): Promise<FioFeeResponse> {
    return this.getFee(EndPoint.rejectFundsRequest, payerFioAddress)
  }

  /**
   * Compute and return fee amount for specific call and specific user
   *
   * @param fioAddress FIO Address incurring the fee and owned by signer.
   */
  public getFeeForAddPublicAddress(fioAddress: string): Promise<FioFeeResponse> {
    return this.getFee(EndPoint.addPubAddress, fioAddress)
  }

  /**
   * Compute and return fee amount for specific call and specific user
   *
   * @param fioAddress FIO Address incurring the fee and owned by signer.
   */
  public getFeeForCancelFundsRequest(fioAddress: string): Promise<FioFeeResponse> {
    return this.getFee(EndPoint.cancelFundsRequest, fioAddress)
  }

  /**
   * Compute and return fee amount for specific call and specific user
   *
   * @param fioAddress FIO Address incurring the fee and owned by signer.
   */
  public getFeeForRemovePublicAddresses(fioAddress: string): Promise<FioFeeResponse> {
    return this.getFee(EndPoint.removePubAddress, fioAddress)
  }

  /**
   * Compute and return fee amount for specific call and specific user
   *
   * @param fioAddress FIO Address incurring the fee and owned by signer.
   */
  public getFeeForRemoveAllPublicAddresses(fioAddress: string): Promise<FioFeeResponse> {
    return this.getFee(EndPoint.removeAllPubAddresses, fioAddress)
  }

    /**
     * Compute and return fee amount for specific call and specific user
     *
     * @param fioAddress FIO Address incurring the fee and owned by signer.
     */
    public getFeeForBurnFioAddress(fioAddress: string): Promise<FioFeeResponse> {
        return this.getFee(EndPoint.burnFioAddress, fioAddress)
    }

  /**
   * Compute and return fee amount for specific call and specific user
   *
   * @param fioAddress FIO Address incurring the fee and owned by signer.
   */
  public getFeeForTransferFioAddress(fioAddress: string): Promise<FioFeeResponse> {
    return this.getFee(EndPoint.transferFioAddress, fioAddress)
  }

  /**
   * Compute and return fee amount for specific call and specific user
   *
   * @param fioAddress FIO Address incurring the fee and owned by signer.
   */
  public getFeeForTransferFioDomain(fioAddress: string): Promise<FioFeeResponse> {
    return this.getFee(EndPoint.transferFioDomain, fioAddress)
  }

  /**
   * @ignore
   */
  public registerFioNameOnBehalfOfUser(fioName: string, publicKey: string) {
    const server = this.registerMockUrl // "mock.dapix.io/mockd/DEV2"
    const mockRegisterFioName = new SignedTransactions.MockRegisterFioName(
      fioName,
      publicKey,
      server,
    )
    return mockRegisterFioName.execute()
  }

  /**
   * @ignore
   */
  public getMultiplier() {
    return Constants.multiplier
  }

  /**
   * Allows advance user to send their own content directly to FIO contracts
   *
   * @param action Name of action
   * @param data JSON object with params for action
   * @param options Options
   * @param options.account Account name
   * @param options.additionalReturnKeys Additional keys for response object from api result
   */
  public pushTransaction(
    action: string,
    data: any,
    options: {
      account?: string,
      additionalReturnKeys?: { [key: string]: string[] }
    } = {}
  ): Promise<any> {
    data.tpid = this.getTechnologyProviderId(data.tpid)
    const pushTransaction = new SignedTransactions.PushTransaction(
      action,
      data,
      options
    )
    return pushTransaction.execute(this.privateKey, this.publicKey, this.returnPreparedTrx)
  }

  // public genericAction(action: string, params: any): any {
  //   switch (action) {
  //     case 'getFioPublicKey':
  //       return this.getFioPublicKey()
  //     case 'getObtData':
  //       return this.getObtData(params.limit, params.offset, params.tokenCode)
  //     case 'isAvailable':
  //       return this.isAvailable(params.fioName)
  //     case 'getFioBalance':
  //       if (params) {
  //         return this.getFioBalance(params.fioPublicKey)
  //       } else {
  //         return this.getFioBalance()
  //       }
  //     case 'getFioNames':
  //       return this.getFioNames(params.fioPublicKey)
  //       case 'getFioDomains':
  //           return this.getFioDomains(params.fioPublicKey, params.limit, params.offset)
  //       case 'getFioAddresses':
  //           return this.getFioAddresses(params.fioPublicKey, params.limit, params.offset)
  //     case 'getPendingFioRequests':
  //       return this.getPendingFioRequests(params.limit, params.offset)
  //     case 'getCancelledFioRequests':
  //       return this.getCancelledFioRequests(params.limit, params.offset)
  //     case 'getSentFioRequests':
  //       return this.getSentFioRequests(params.limit, params.offset)
  //     case 'getPublicAddress':
  //       return this.getPublicAddress(params.fioAddress, params.chainCode, params.tokenCode)
  //   }
  // }
}
