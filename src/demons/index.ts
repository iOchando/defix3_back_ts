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

const Demon = (routeDemon: string, io: any) => {
  console.log('Starting demon...');
  const demon = fork(routeDemon);

  // const emitToSockets = (event: string, data: any, sockets: any = io) => {
  //   console.log("entro")
  //   sockets.sockets.emit(event, data);
  // };

  // const logData = () => {
  //   console.log("Parent process received data:")
  // };

  // demon.send(serialize({ emitToSockets }));

  demon.on('exit', () => {
    console.log('Demon died. Restarting demon ' + routeDemon);
    Demon(routeDemon, io);
  });
}

const startDemons = (io: any) => {
  readdirSync(PATH_ROUTER).filter((fileName) => {
    const cleanName = cleanFileName(fileName);
    if (cleanName !== "index") {
      console.log(PATH_ROUTER)
      Demon(PATH_ROUTER+ "/" +cleanName, io)
    }
  });
}

export { startDemons };
