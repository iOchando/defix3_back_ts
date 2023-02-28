"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const admin_1 = require("../controllers/admin");
const admin_2 = __importDefault(require("../middleware/admin"));
const router = (0, express_1.Router)();
exports.router = router;
router.get("/get-users-defix", admin_2.default, admin_1.getUsersDefix);
