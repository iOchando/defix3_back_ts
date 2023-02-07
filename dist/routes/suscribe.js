"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const suscribe_1 = require("../controllers/suscribe");
const router = (0, express_1.Router)();
exports.router = router;
router.post('/set-email-suscribe/', suscribe_1.setEmailSuscribe);
