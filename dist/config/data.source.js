"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const path_1 = __importDefault(require("path"));
const typeorm_1 = require("typeorm");
const AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: process.env.HOST_ORM,
    port: Number(process.env.PORT),
    username: process.env.USER_ORM,
    password: process.env.PASSWORD_ORM,
    database: process.env.DATABASE_ORM,
    synchronize: false,
    logging: true,
    entities: [path_1.default.join(__dirname, "../entities/*")],
    subscribers: [],
    migrations: [path_1.default.join(__dirname, "../migrations/*")],
});
// const AppDataSource = new DataSource({
//   type: "postgres",
//   host: process.env.HOST_DB,
//   port: Number(process.env.PORT),
//   username: process.env.USER_DB,
//   password: process.env.PASSWORD_DB,
//   database: process.env.DATABASE_ORM,
//   synchronize: false,
//   logging: true,
//   entities: [path.join(__dirname, "../entities/*")],
//   subscribers: [],
//   migrations: [path.join(__dirname, "../migrations/*.ts")],
// })
exports.default = AppDataSource;
