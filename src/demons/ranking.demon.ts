import axios from "axios";
import { Server, Socket, ServerOptions } from "socket.io";
import * as http from 'http';

// process.on('message', message => {
//   // const lo = message as any
//   const emits = eval(`(${message})`);

//   console.log(emits)
//   emits.emitToSockets()
// })

const DemonFn = async () => {
  const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=tron%2Cbitcoin%2Cethereum%2Ctether%2Cbinancecoin%2Cusdc-coin%2Cdai&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d')

  if (response.data) {
    console.log(response.data)
  }
}

const startDemon = () => {
  DemonFn()
  setInterval(async () => {
    console.log('Demonio de Ranking');
    DemonFn()
  }, 60000)
}

startDemon()