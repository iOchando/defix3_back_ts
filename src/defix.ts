import "dotenv/config";
import "reflect-metadata"
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { router } from "./routes";
import dbConnect from "./config/postgres";
import AppDataSource from "./config/data.source";
import { Server, Socket } from "socket.io";
// import startWebSocket from "./websockets/websocket";
import * as http from 'http';
import * as https from 'https';
const fs = require('fs');

import swaggerUi, { serve } from "swagger-ui-express";
import swaggerSetup from "./docs/swagger";

import { startDemons } from "./demons";
import { testnet } from "bitcoinjs-lib/src/networks";

const PORT = 3072

const privateKey = fs.readFileSync('/etc/letsencrypt/live/defix3.com/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/defix3.com/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/defix3.com/chain.pem', 'utf8');

const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca
};

const app = express();

app.use(morgan('dev'))
app.use(cors({
  origin: '*'
}));
app.use(express.json());

app.use('/api/v2', router)
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSetup))

dbConnect().then(() => console.log("Conexion DB Ready"));

AppDataSource.initialize().then(() => console.log("Conexion ORM Ready"));

const server = https.createServer(credentials, app);

server.listen(PORT, () => console.log(`Listo por el puerto ${PORT}`));

const io = new Server(server, {
  cors: {
    origin: "*",
  }
});

// setInterval(async () => {
//   io.emit('messageTest')
// }, 5000)

io.on("connection", (socket: Socket) => {
  console.log('User APP ' + socket.id + ' connected');

  // console.log(io.sockets.emit('message2'))
});

startDemons(io)


