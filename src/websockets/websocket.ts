import { Server, Socket } from "socket.io";
import http from 'http';

const startWebSocket = async (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
    }
  });

  // io.on("connection", (socket: Socket) => {
  //   console.log('User ' + socket.id + ' connected');
  // });

  setInterval(async () => {
    io.emit('messageTest')
  }, 5000)

  return io
}

export default startWebSocket 
