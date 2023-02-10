"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startDemons = void 0;
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const PATH_ROUTER = `${__dirname}`;
const cleanFileName = (fileName) => {
    let file;
    console.log(fileName);
    if (fileName.includes(".ts")) {
        file = fileName.split(".ts").shift();
    }
    else {
        file = fileName.split(".js").shift();
    }
    return file;
};
const Demon = (routeDemon, io) => {
    console.log('Starting demon...');
    const demon = (0, child_process_1.fork)(routeDemon);
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
};
const startDemons = (io) => {
    (0, fs_1.readdirSync)(PATH_ROUTER).filter((fileName) => {
        const cleanName = cleanFileName(fileName);
        if (cleanName !== "index") {
            console.log(PATH_ROUTER);
            Demon(PATH_ROUTER + "/" + cleanName, io);
        }
    });
};
exports.startDemons = startDemons;
