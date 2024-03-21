
import ws from "ws";
import { WebSocketServer } from 'ws';
import http from 'http'

let clientsCount = 0;

const wss = new WebSocketServer({port: 8080});

console.log('Сервер запущен: 127.0.0.1:8080')
wss.on("connection", (ws) => {

    console.log('Client connected');
    clientsCount++;

    ws.send(JSON.stringify({type:'hello', value: 'Server Hello'}))

    ws.send(JSON.stringify({type:'res', value: 'Server connected: '+ ws._socket.server._connectionKey}));

    ws.on('message', (rawMessage) => {
      let {type,value} = JSON.parse(rawMessage);
      value = value.slice(0,value.length-1)
      console.log(value);
      if(value == '/hiAll'){
        hiAll();
      }
      if(value == '/users'){
        users();
      }
    })

    ws.on('close', () => {
        console.log(`Client is closed `)
        clientsCount--;
    })
    
  })
  
  
function hiAll(){
  wss.clients.forEach((client) => {
    client.send(JSON.stringify({type:'res', value: 'Hello All'}))
    
  });
}
function users(){
  wss.clients.forEach((client) => {
    client.send(JSON.stringify({type:'res', value: 'К серверу подключено: '+clientsCount}))
    
  });
}