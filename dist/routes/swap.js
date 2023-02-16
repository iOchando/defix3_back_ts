"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const swap_1 = require("../controllers/swap");
const router = (0, express_1.Router)();
exports.router = router;
router.post('/swap-preview/', swap_1.swapPreview);
