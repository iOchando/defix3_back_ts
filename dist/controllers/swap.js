"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swapPreview = void 0;
const eth_services_1 = require("../services/eth.services");
const bsc_services_1 = require("../services/bsc.services");
function swapPreview(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { fromCoin, toCoin, amount, blockchain } = req.body;
            let priceRoute;
            if (!fromCoin || !toCoin || !amount || !blockchain)
                return res.status(400).send();
            if (blockchain === "ETH") {
                priceRoute = yield (0, eth_services_1.swapPreviewETH)(fromCoin, toCoin, amount, blockchain);
                console.log(priceRoute);
            }
            else if (blockchain === "BNB") {
                priceRoute = yield (0, bsc_services_1.swapPreviewBNB)(fromCoin, toCoin, amount, blockchain);
            }
            else {
                priceRoute = false;
            }
            if (!priceRoute)
                return res.status(400).send();
            return res.send({ priceRoute: priceRoute });
        }
        catch (error) {
            return res.status(500).send();
        }
    });
}
exports.swapPreview = swapPreview;
