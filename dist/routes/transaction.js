"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const transaction_1 = require("../controllers/transaction");
const router = (0, express_1.Router)();
exports.router = router;
router.post('/transaction/', transaction_1.transaction);
