"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swaggerDefinition = {
    "openapi": "3.0.3",
    "info": {
        "title": "Defix3 - Api V2",
        "description": "End Points for Defix3 API V2",
        "contact": {
            "email": "juanochando00@gmail.com"
        },
        "version": "2.0.0"
    },
    "servers": [
        {
            "url": "http://localhost:3080/api/v2/"
        },
        {
            "url": "https://defix3.com/api/v2/"
        },
        {
            "url": "https://testnet.defix3.com/api/v2/"
        }
    ],
    "tags": [{
            "name": "Wallet",
            "description": "EndPoints asociados a la creacion y funciones basicas de las wallets."
        }, {
            "name": "pet",
            "description": "Everything about your Pets"
        }, {
            "name": "store",
            "description": "Access to Petstore orders"
        }, {
            "name": "user",
            "description": "Operations about user"
        }],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
            },
        },
        schemas: {
            user: {
                type: "object",
                required: ["name", "album", "cover", "artist", "duration", "mediaId"],
                properties: {
                    name: {
                        type: "string",
                    },
                    email: {
                        type: "string",
                    },
                },
            },
            item: {
                type: "object",
                required: ["price", "qty"],
                properties: {
                    price: {
                        type: "string",
                    },
                    qty: {
                        type: "string",
                    },
                },
            },
        },
    },
};
const swaggerOptions = {
    swaggerDefinition,
    apis: ["./src/routes/*.ts"],
};
exports.default = (0, swagger_jsdoc_1.default)(swaggerOptions);
