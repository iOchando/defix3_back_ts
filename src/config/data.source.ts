import path from 'path';
import { DataSource } from 'typeorm'

const AppDataSource = new DataSource({
  type: "postgres",
  host: "157.230.2.213",
  port: 5432,
  username: "gf",
  password: "uPKsp22tBeBC506WRBv21d7kniWiELwg",
  database: "defix3_node",
  synchronize: false,
  logging: true,
  entities: [path.join(__dirname, "../entities/*")],
  subscribers: [],
  migrations: [path.join(__dirname, "../migrations/*")],
})

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

export default AppDataSource;