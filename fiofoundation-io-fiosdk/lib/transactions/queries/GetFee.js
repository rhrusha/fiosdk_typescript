"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Query_1 = require("./Query");
const constants_1 = require("../../utils/constants");
class GetFee extends Query_1.Query {
    constructor(endPoint, fioAddress = "") {
        super();
        this.ENDPOINT = "chain/get_fee";
        this.endPoint = endPoint;
        this.fioAddress = fioAddress;
        if (constants_1.Constants.feeNoAddressOperation.findIndex(element => element === endPoint) == -1 && fioAddress.length > 0) {
            throw new Error("End point " + endPoint + " should not have any fio address, when requesting fee");
        }
    }
    getData() {
        return {
            end_point: this.endPoint,
            fio_address: this.fioAddress
        };
    }
}
exports.GetFee = GetFee;