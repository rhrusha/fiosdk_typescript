import { Transactions } from './transactions/Transactions'
import * as queries from './transactions/queries'
import  * as  SignedTransactions  from './transactions/signed'
import { Constants } from './utils/constants'
import { MockRegisterFioName } from './transactions/signed/MockRegisterFioName'
import { Fio } from 'fiojs'
import { AbiResponse } from './entities/AbiResponse';

/**
 * @ignore
 */
const { Ecc } = require('fiojs') 

/**
 * @ignore
 */
type FetchJson = (uri: string, opts?: Object) => Object


export class FIOSDK {
    /**
     * @ignore
     */
    static ReactNativeFio:any

    transactions:Transactions 

    io:{fetch(param:any,param2:any):any}

    /**
     * @ignore
     */
    registerMockUrl:string

    /**
     * the fio private key of the client sending requests to FIO API.
     */
    privateKey:string

    /**
     * the fio public key of the client sending requests to FIO API.
     */
    publicKey:string

    /**
     * @param privateKey the fio private key of the client sending requests to FIO API.
     * @param publicKey the fio public key of the client sending requests to FIO API.
     * @param baseUrl the url to the FIO API.
     * @param io 
     * @param fetchjson 
     * @param registerMockUrl the url to the mock server
     */
    constructor(privateKey:string,publicKey:string,baseUrl:string,io:any,fetchjson:FetchJson,registerMockUrl='') {
        this.transactions = new Transactions()
        this.io = io
        Transactions.baseUrl = baseUrl
        Transactions.FioProvider = Fio
        Transactions.io = io
        Transactions.fetchJson = fetchjson
        this.registerMockUrl = registerMockUrl
        this.privateKey = privateKey
        this.publicKey = publicKey

        for (let accountName of Constants.rawAbiAccountName) {
            this.getAbi(accountName).then(response => {
                Transactions.abiMap.set(response.account_name, response)
            }).catch(error => {
                throw error    
            })
        }
    }
    
    /**
     * @ignore
     */
    static async createPrivateKey(entropy:Buffer):Promise<any> {        
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
    static async createPrivateKeyMnemonic(mnemonic:string) {
        const hdkey = require('hdkey')
        const wif = require('wif')
        const bip39 = require('bip39')
        const seedBytes = await bip39.mnemonicToSeed(mnemonic)
        const seed = await seedBytes.toString('hex')
        const master = hdkey.fromMasterSeed(new Buffer(seed, 'hex'))
        const node = master.derive("m/44'/235'/0'/0/0")
        const fioKey = wif.encode(128, node._privateKey, false)
        return {fioKey, mnemonic}
    }

    /**
     * Create a FIO public key.
     *
     * @param fioPrivateKey FIO private key.
     * 
     * @returns FIO public key derived from the FIO private key.
     */
    static derivedPublicKey(fioPrivateKey:string) {
        const publicKey = Ecc.privateToPublic(fioPrivateKey)
        return { publicKey }
    }

    /**
     * Retrieves the FIO public key assigned to the FIOSDK instance.
     */
    getFioPublicKey():string {
        return this.publicKey
    }

    /**
     * Registers a FIO Address on the FIO blockchain.  The owner will be the public key associated with the FIO SDK instance.
     *
     * @param fioAddress FIO Address to register.
     * @param maxFee Maximum amount of SUFs the user is willing to pay for fee. Should be preceded by @ [getFee] for correct value.
     * @param walletFioAddress FIO Address of the wallet which generates this transaction.
     */
    registerFioAddress(fioAddress:string, maxFee:number,walletFioAddress:string=""):Promise<any>{
        let registerFioAddress =  new SignedTransactions.RegisterFioAddress(fioAddress, maxFee,walletFioAddress);
        return registerFioAddress.execute(this.privateKey, this.publicKey)
    }

    /**
     * Registers a FIO Domain on the FIO blockchain.
     *
     * @param fioDomain FIO Domain to register. The owner will be the public key associated with the FIO SDK instance.
     * @param maxFee Maximum amount of SUFs the user is willing to pay for fee. Should be preceded by @ [getFee] for correct value.
     * @param walletFioAddress FIO Address of the wallet which generates this transaction.
     */
    registerFioDomain(fioDomain:string, maxFee:number,walletFioAddress:string=""):Promise<any>{
        let registerFioDomain =  new SignedTransactions.RegisterFioDomain(fioDomain, maxFee,walletFioAddress);
        return registerFioDomain.execute(this.privateKey, this.publicKey)
    }

    /**
     * Renew a FIO Address on the FIO blockchain.
     *
     * @param fioAddress FIO Address to renew.
     * @param maxFee Maximum amount of SUFs the user is willing to pay for fee. Should be preceded by @ [getFee] for correct value.
     * @param walletFioAddress FIO Address of the wallet which generates this transaction.
     */
    renewFioAddress(fioAddress:string, maxFee:number,walletFioAddress:string=""):Promise<any>{
        let renewFioAddress =  new SignedTransactions.RenewFioAddress(fioAddress, maxFee,walletFioAddress);
        return renewFioAddress.execute(this.privateKey, this.publicKey)
    }

    /**
     * Renew a FIO Domain on the FIO blockchain.
     *
     * @param fioDomain FIO Domain to renew.
     * @param maxFee Maximum amount of SUFs the user is willing to pay for fee. Should be preceded by @ [getFee] for correct value.
     * @param walletFioAddress FIO Address of the wallet which generates this transaction.
     */
    renewFioDomain(fioDomain:string, maxFee:number,walletFioAddress:string=""):Promise<any>{
        let renewFioDomain =  new SignedTransactions.RenewFioDomain(fioDomain, maxFee,walletFioAddress);
        return renewFioDomain.execute(this.privateKey, this.publicKey)
    }

    addPublicAddress(fioAddress:string,tokenCode:string,publicAddress:string,maxFee:number):Promise<any>{
        let addPublicAddress = new SignedTransactions.AddPublicAddress(fioAddress,tokenCode,publicAddress,maxFee);
        return addPublicAddress.execute(this.privateKey, this.publicKey)
    }

    /**
     *
     * Records information on the FIO blockchain about a transaction that occurred on other blockchain, i.e. 1 BTC was sent on Bitcoin Blockchain, and both
     * sender and receiver have FIO Addresses. OBT stands for Other Blockchain Transaction
     *
     * @param fioRequestId ID of funds request, if this Record Send transaction is in response to a previously received funds request.  Send empty if no FIO Request ID
     * @param payerFIOAddress FIO Address of the payer. This address initiated payment.
     * @param payeeFIOAddress FIO Address of the payee. This address is receiving payment.
     * @param payerTokenPublicAddress Public address on other blockchain of user sending funds.
     * @param payeeTokenPublicAddress Public address on other blockchain of user receiving funds.
     * @param amount Amount sent.
     * @param tokenCode Code of the token represented in Amount requested, i.e. BTC.
     * @param status Status of this OBT. Allowed statuses are: sent_to_blockchain.
     * @param obtId Other Blockchain Transaction ID (OBT ID), i.e Bitcoin transaction ID.
     * @param maxFee Maximum amount of SUFs the user is willing to pay for fee. Should be preceded by /get_fee for correct value.
     * @param walletFioAddress FIO Address of the wallet which generates this transaction.
     * @param payeeFioPublicKey
     * @param memo
     * @param hash
     * @param offlineUrl
     */
    async recordSend(
    fioRequestId:string,        
    payerFIOAddress:string,
    payeeFIOAddress:string,
    payerTokenPublicAddress:string,
    payeeTokenPublicAddress:string,
    amount:number,
    tokenCode:string,
    status:string,
    obtId:string,
    maxFee:number,
    walletFioAddress:string='',
    payeeFioPublicKey:string|null = null,
    memo:string|null = null,
    hash:string|null = null,
    offLineUrl:string|null = null
    ):Promise<any>{
        let payeeKey:any = {public_address:''}
        if(!payeeFioPublicKey && typeof payeeFioPublicKey !== 'string'){
            payeeKey = await this.getPublicAddress(payeeFIOAddress,'FIO')
        }else{
            payeeKey.public_address = payeeFioPublicKey
        }
        let recordSend = new SignedTransactions.RecordSend(fioRequestId,
        payerFIOAddress, payeeFIOAddress, payerTokenPublicAddress, payeeTokenPublicAddress,
        amount, tokenCode, obtId, maxFee, status, walletFioAddress, payeeKey.public_address,memo,hash,offLineUrl);
        return recordSend.execute(this.privateKey, this.publicKey);
    }

    /**
     * Reject funds request.
     *
     * @param fioRequestId Existing funds request Id
     * @param maxFee Maximum amount of SUFs the user is willing to pay for fee. Should be preceded by [getFee] for correct value.
     * @param walletFioAddress FIO Address of the wallet which generates this transaction.
     */
    rejectFundsRequest(fioRequestId: string,maxFee:number,walletFioAddress:string=""):Promise<any>{
        let rejectFundsRequest = new SignedTransactions.RejectFundsRequest(fioRequestId,maxFee,walletFioAddress)
        return rejectFundsRequest.execute(this.privateKey, this.publicKey);
    }

    /**
     * Create a new funds request on the FIO chain.
     *
     * @param payerFioAddress FIO Address of the payer. This address will receive the request and will initiate payment.
     * @param payeeFioAddress FIO Address of the payee. This address is sending the request and will receive payment.
     * @param payeePublicAddress Payee's public address where they want funds sent.
     * @param amount Amount requested.
     * @param tokenCode Code of the token represented in amount requested.
     * @param memo
     * @param maxFee Maximum amount of SUFs the user is willing to pay for fee. Should be preceded by [getFee] for correct value.
     * @param payerFioPublicKey
     * @param walletFioAddress FIO Address of the wallet which generates this transaction.
     * @param hash
     * @param offlineUrl 
     */
    async requestFunds(payerFioAddress: string, 
        payeeFioAddress: string,payeePublicAddress: string, 
        amount: number,tokenCode: string, memo: string,maxFee:number, 
        payerFioPublicKey:string|null = null,
        walletFioAddress:string='', 
        hash?:string, offlineUrl?:string):Promise<any>{
        let payerKey:any = {public_address:''}
        if(!payerFioPublicKey && typeof payerFioPublicKey !== 'string'){
            payerKey = await this.getPublicAddress(payerFioAddress,'FIO')
        }else{
            payerKey.public_address = payerFioPublicKey
        }
        let requestNewFunds = new SignedTransactions.RequestNewFunds(payerFioAddress,payerKey.public_address,payeeFioAddress,walletFioAddress,maxFee,payeePublicAddress,amount,tokenCode,memo,hash,offlineUrl);
        return requestNewFunds.execute(this.privateKey, this.publicKey);
    }

    /**
     * Checks if a FIO Address or FIO Domain is available for registration.
     *
     * @param fioName FIO Address or FIO Domain to check.
     */
    isAvailable(fioName:string):Promise<any>{
        let availabilityCheck = new queries.AvailabilityCheck(fioName);
        return availabilityCheck.execute(this.publicKey);
    }
    
    /**
     * Retrieves balance of FIO tokens
     *
     * @param fioPublicKey FIO public key.
     */
    getFioBalance(fioPublicKey?:string):Promise<any>{
        let getFioBalance = new queries.GetFioBalance(fioPublicKey);
        return getFioBalance.execute(this.publicKey);
    }

    /**
     * Returns FIO Addresses and FIO Domains owned by this public key.
     *
     * @param fioPublicKey FIO public key of owner.
     */
    getFioNames(fioPublicKey:string):Promise<any>{
        let getNames = new queries.GetNames(fioPublicKey);
        return getNames.execute(this.publicKey)

    }

    /**
     * Polls for any pending requests sent to public key associated with the FIO SDK instance.
     */
    getPendingFioRequests():Promise<any>{
        let pendingFioRequests = new queries.PendingFioRequests(this.publicKey);
        return pendingFioRequests.execute(this.publicKey,this.privateKey)
    }

    /**
     * Polls for any sent requests sent by public key associated with the FIO SDK instance.
     */
    getSentFioRequests():Promise<any>{
        let sentFioRequest = new queries.SentFioRequests(this.publicKey);
        return sentFioRequest.execute(this.publicKey,this.privateKey)
    }

    /**
     * Returns a token public address for specified token code and FIO Address.
     *
     * @param fioAddress FIO Address for which the token public address is to be returned.
     * @param tokenCode Token code for which public address is to be returned.
     */
    getPublicAddress(fioAddress:string, tokenCode:string):Promise<any>{
        let publicAddressLookUp = new queries.PublicAddressLookUp(fioAddress, tokenCode);
        return publicAddressLookUp.execute(this.publicKey);
    }

    /**
     * Returns the FIO token public address for specified FIO Address.
     *
     * @param fioAddress FIO Address for which fio token public address is to be returned.
     */
    getFioPublicAddress(fioAddress:string):Promise<any>{
        let publicAddressLookUp = new queries.PublicAddressLookUp(fioAddress, "FIO");
        return publicAddressLookUp.execute(this.publicKey);
    }

    /**
     *
     * Transfers FIO tokens from public key associated with the FIO SDK instance to
     * the payeePublicKey.
     *
     * @param payeeFioPublicKey FIO public Address of the one receiving the tokens.
     * @param amount Amount sent in SUFs.
     * @param maxFee Maximum amount of SUFs the user is willing to pay for fee. Should be preceded by /get_fee for correct value.
     * @param walletFioAddress FIO Address of the wallet which generates this transaction.
     */
    transferTokens(payeeFioPublicKey:string,amount:number,maxFee:number,walletFioAddress:string=""):Promise<any>{
        let transferTokens = new SignedTransactions.TransferTokens(payeeFioPublicKey,amount,maxFee,walletFioAddress);
        return transferTokens.execute(this.privateKey, this.publicKey)
    }

    /**
     * Compute and return fee amount for specific call and specific user
     *
     * @param endPoint Name of API call end point, e.g. add_pub_address.
     * @param fioAddress
     *        if endPointName is RenewFioAddress, FIO Address incurring the fee and owned by signer.
     *        if endPointName is RenewFioDomain, FIO Domain incurring the fee and owned by signer.
     *        if endPointName is RecordSend, Payee FIO Address incurring the fee and owned by signer.
     */
    getFee(endPoint:string,fioAddress=""):Promise<any>{
        let fioFee = new queries.GetFee(endPoint,fioAddress);
        return fioFee.execute(this.publicKey)                                                    
    }

    /**
     * @ignore
     */
    registerFioNameOnBehalfOfUser(fioName:string,publicKey:string){
        let server = this.registerMockUrl // "mock.dapix.io/mockd/DEV2"
        let mockRegisterFioName = new MockRegisterFioName(fioName,publicKey,server)
        return mockRegisterFioName.execute();
    }

    /**
     * @ignore
     */
    getMultiplier(){
        return Constants.multiplier;
    }

    /**
     * @ignore
     */
    genericAction(action:string,params:any):any{
        switch(action){
            case 'getFioPublicKey':
                return this.getFioPublicKey()
            case 'registerFioAddress':
                return this.registerFioAddress(params.fioAddress, params.maxFee,params.walletFioAddress || "")
            case 'registerFioDomain':
                return this.registerFioDomain(params.FioDomain,  params.maxFee,params.walletFioAddress || "")
            case 'renewFioAddress':
                return this.renewFioAddress(params.fioAddress,  params.maxFee,params.walletFioAddress || "")
            case 'addPublicAddress':
                return this.addPublicAddress(params.fioAddress,params.tokenCode,params.publicAddress,params.maxFee)    
            case 'recordSend':
                return this.recordSend(
                    params.fioRequestId,
                    params.payerFIOAddress,
                    params.payeeFIOAddress, 
                    params.payerTokenPublicAddress,
                    params.payeeTokenPublicAddress, 
                    params.amount, 
                    params.tokenCode, 
                    params.status, 
                    params.obtId, 
                    params.maxFee,
                    params.walletFioAddress || "",
                    params.payerFioPublicKey,  
                    params.memo, 
                    params.hash, 
                    params.offLineUrl)
            case 'rejectFundsRequest':
                return this.rejectFundsRequest(params.fioRequestId,params.maxFee,params.walletFioAddress || "")
            case 'requestFunds':
                return this.requestFunds(params.payerFioAddress, params.payeeFioAddress, params.payeePublicAddress,
                    params.amount, params.tokenCode, params.memo, params.maxFee,params.payerFioPublicKey, params.walletFioAddress || "", params.hash, params.offlineUrl)
            case 'isAvailable':
                return this.isAvailable(params.fioName)
            case 'getFioBalance':
                if(params){
                    return this.getFioBalance(params.fioPublicKey)
                }else{
                    return this.getFioBalance()
                }
            case 'getFioNames':
                return this.getFioNames(params.fioPublicKey)
            case 'getPendingFioRequests':
                return this.getPendingFioRequests()
            case 'getSentFioRequests':
                return this.getSentFioRequests()
            case 'getPublicAddress':
                return this.getPublicAddress(params.fioAddress, params.tokenCode)
            case 'transferTokens':
                return this.transferTokens(params.payeeFioPublicKey,params.amount,params.maxFee,params.walletFioAddress || "")
            case 'getAbi':
                return this.getAbi(params.accountName)
            case 'getFee':
                return this.getFee(params.endPoint,params.fioAddress)
            case 'getMultiplier':
                    return this.getMultiplier()
        }
    }

        /**
     * @ignore
     */
    getAbi(accountName:string):Promise<AbiResponse>{
        let abi = new queries.GetAbi(accountName);
        return abi.execute(this.publicKey)
    }
}