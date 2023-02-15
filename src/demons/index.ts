import { fork } from 'child_process'
import { readdirSync } from "fs";
import { Server, Socket, ServerOptions } from "socket.io";
import serialize from 'serialize-javascript';
import * as http from 'http';

const PATH_ROUTER = `${__dirname}`;

const cleanFileName = (fileName: string) => {
  let file
  console.log(fileName)
  if (fileName.includes(".ts")) {
    file = fileName.split(".ts").shift()
  } else {
    file = fileName.split(".js").shift()
  }
  return file;
};

const Demon = (routeDemon: string, io: Server) => {
  console.log('Starting demon...');
  const demon = fork(routeDemon);

  demon.on("message", (message) => {
    io.emit('getRanking', message)
  });

  demon.on('exit', () => {
    console.log('Demon died. Restarting demon ' + routeDemon);
    Demon(routeDemon, io);
  });
}

const startDemons = (io: Server) => {
  readdirSync(PATH_ROUTER).filter((fileName) => {
    const cleanName = cleanFileName(fileName);
    if (cleanName !== "index") {
      Demon(PATH_ROUTER+ "/" +cleanName, io)
    }
  });
}

export { startDemons };
