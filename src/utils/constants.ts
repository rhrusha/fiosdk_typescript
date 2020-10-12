export class Constants {
  public static endPoints: any = {
    AddPublicAddress: 'add_pub_address',
    SetFioDomainVisibility: 'set_fio_domain_public',
    RecordObtData: 'record_obt_data',
    RegisterFioAddress: 'register_fio_address',
    RegisterFioDomain: 'register_fio_domain',
    RejectFundsRequest: 'reject_funds_request',
    RequestNewFunds: 'new_funds_request',
    TransferTokensKey: 'transfer_tokens_pub_key',
    TransferTokensFioAddress: 'transfer_tokens_fio_address',
  }

  public static feeNoAddressOperation: string[] = [
    Constants.endPoints.RegisterFioDomain,
    Constants.endPoints.RegisterFioAddress,
    Constants.endPoints.TransferTokensKey,
    Constants.endPoints.TransferTokensFioAddress,
  ]

  public static actionNames: { [key: string]: string } = {
    regaddress: 'regaddress',
    renewaddress: 'renewaddress',
    regdomain: 'regdomain',
    renewdomain: 'renewdomain',
    setdomainpub: 'setdomainpub',
    xferaddress: 'xferaddress',
    xferdomain: 'xferdomain',
    addaddress: 'addaddress',
    remaddress: 'remaddress',
    remalladdr: 'remalladdr',
    newfundsreq: 'newfundsreq',
    recordobt: 'recordobt',
    cancelfndreq: 'cancelfndreq',
    rejectfndreq: 'rejectfndreq',
    trnsfiopubky: 'trnsfiopubky',
    burnaddress: 'burnaddress',
  }

  public static abiAccounts: { [key: string]: string } = {
    fio_address: 'fio.address',
    fio_reqobt: 'fio.reqobt',
    fio_token: 'fio.token',
    eosio: 'eosio',
    fio_fee: 'fio.fee',
    eosio_msig: 'eosio.msig',
  }

  public static rawAbiAccountName: string[] = [
    Constants.abiAccounts.fio_address,
    Constants.abiAccounts.fio_reqobt,
    Constants.abiAccounts.fio_token,
    Constants.abiAccounts.eosio,
    Constants.abiAccounts.fio_fee,
    Constants.abiAccounts.eosio_msig,
  ]

  public static multiplier = 1000000000

  public static defaultAccount: string = Constants.abiAccounts.fio_address

  public static CipherContentTypes: { [key: string]: string } = {
    new_funds_content: 'new_funds_content',
    record_obt_data_content: 'record_obt_data_content',
  }

  public static TrxStatuses: { [key: string]: string } = {
    sent_to_blockchain: 'sent_to_blockchain',
  }

}
