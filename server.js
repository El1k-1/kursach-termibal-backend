
import ws from "ws";
import { WebSocketServer } from 'ws';
import { APPEAL_TYPE_PREFIX } from "./utils/constants.js";

let clientsCount = 0;
let i = 100
let x = 1
const activeQueries = []

const queriesSubscribers = {}

const wss = new WebSocketServer({port: 8080,});

console.log('Сервер запущен: 127.0.0.1:8080')
wss.on("connection", (ws, request) => {
    const userId = x++
    const queryParams = Object.fromEntries(new URL('http:/zxc'+request.url).searchParams)
    console.log('Client connected from:', queryParams.screen);
    clientsCount++;

    ws.send(JSON.stringify({type:'hello', data: 'Server Hello'}))

    if (['requests','employee'].includes(queryParams.screen)) {
      queriesSubscribers[userId] = ws
      ws.send(JSON.stringify({type:'getLists', data: {code: 1, rows: activeQueries}}))

    }

    ws.on('message', (rawMessage) => {
      let {type,data} = JSON.parse(rawMessage);
      console.log(data);
      if (type === 'updateList' ) {
        const item = activeQueries.find((x) => x.id === data.id)
        item.status = data.status
        ws.send(JSON.stringify({type:'updateList', data: 'success'}))
        if (data.status === 'Завершено') {
          setTimeout(() => {
            deleteItem(data.id)
            for (const user in queriesSubscribers) {
              updateList(queriesSubscribers[user], 'delete', item)
           }
          }, 10000)
        }
        for (const user in queriesSubscribers) {
           updateList(queriesSubscribers[user], 'update', item)
        }
      }
      if (type === 'createQuery' ) {
        const index = ++i
        const item = {id: `${APPEAL_TYPE_PREFIX[data]}${index}`, status: 'В ожидании', service: data}
        activeQueries.push(item)
        ws.send(JSON.stringify({type:'createQuery', data: 'success'}))
        for (const user in queriesSubscribers) {
           updateList(queriesSubscribers[user], 'add', item)
        }
      }
    })

    ws.on('close', () => {
      if (queryParams.screen === 'requests') {
        delete queriesSubscribers[userId]
  
      }
      console.log(`Client is closed `)
      clientsCount--;
    })
    
  })

  function updateList(client, type, payload) {
    client.send(JSON.stringify({type:'updateList', data: {
      type, row: payload
    },}))
  }
  function deleteItem(id) {
    const index = activeQueries.findIndex((x) => x.id === id)
    activeQueries.splice(index, 1)
  }