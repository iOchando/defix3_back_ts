import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { router } from "./routes";
import dbConnect from "./config/postgres";
import { Server, Socket } from "socket.io";
// import startWebSocket from "./websockets/websocket";
import * as http from 'http';
import * as https from 'https';


import swaggerUi, { serve } from "swagger-ui-express";
import swaggerSetup from "./docs/swagger";

import { startDemons } from "./demons";
import { testnet } from "bitcoinjs-lib/src/networks";

const PORT = 3080;
const app = express();

app.use(morgan('dev'))
app.use(cors());
app.use(express.json());

app.use('/api/v2', router)
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSetup))

dbConnect().then(() => console.log("Conexion Ready"));

const server = http.createServer(app);

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


