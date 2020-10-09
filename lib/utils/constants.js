"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Constants = void 0;
class Constants {
}
exports.Constants = Constants;
Constants.endPoints = {
    AddPublicAddress: 'add_pub_address',
    SetFioDomainVisibility: 'set_fio_domain_public',
    RecordObtData: 'record_obt_data',
    RegisterFioAddress: 'register_fio_address',
    RegisterFioDomain: 'register_fio_domain',
    RejectFundsRequest: 'reject_funds_request',
    RequestNewFunds: 'new_funds_request',
    TransferTokensKey: 'transfer_tokens_pub_key',
    TransferTokensFioAddress: 'transfer_tokens_fio_address',
};
Constants.feeNoAddressOperation = [
    Constants.endPoints.RegisterFioDomain,
    Constants.endPoints.RegisterFioAddress,
    Constants.endPoints.TransferTokensKey,
    Constants.endPoints.TransferTokensFioAddress,
];
Constants.actionNames = {
    regaddress: 'regaddress',
    renewaddress: 'renewaddress',
    regdomain: 'regdomain',
    renewdomain: 'renewdomain',
    setdomainpub: 'setdomainpub',
    xferdomain: 'xferdomain',
    addaddress: 'addaddress',
    remaddress: 'remaddress',
    remalladdr: 'remalladdr',
    newfundsreq: 'newfundsreq',
    recordobt: 'recordobt',
};
Constants.abiAccounts = {
    fio_address: 'fio.address',
    fio_reqobt: 'fio.reqobt',
    fio_token: 'fio.token',
    eosio: 'eosio',
    fio_fee: 'fio.fee',
    eosio_msig: 'eosio.msig',
};
Constants.rawAbiAccountName = [
    Constants.abiAccounts.fio_address,
    Constants.abiAccounts.fio_reqobt,
    Constants.abiAccounts.fio_token,
    Constants.abiAccounts.eosio,
    Constants.abiAccounts.fio_fee,
    Constants.abiAccounts.eosio_msig,
];
Constants.multiplier = 1000000000;
Constants.defaultAccount = Constants.abiAccounts.fio_address;
Constants.CipherContentTypes = {
    new_funds_content: 'new_funds_content',
    record_obt_data_content: 'record_obt_data_content',
};
Constants.TrxStatuses = {
    sent_to_blockchain: 'sent_to_blockchain',
};
