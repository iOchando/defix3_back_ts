"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const user_1 = require("../controllers/user");
const router = (0, express_1.Router)();
exports.router = router;
router.post('/close-all-sessions/', user_1.closeAllSessions);
router.post('/get-close-all-sessions/', user_1.getCloseAllSesions);
router.post('/set-email-data/', user_1.setEmailData);
router.post('/get-email-data/', user_1.getEmailData);