//https://github.com/websockets/ws/
import WebSocket, { WebSocketServer } from 'ws';

const port = process.env.PORT || 8080

const server = new WebSocketServer({
    port: port,
    perMessageDeflate: {
        zlibDeflateOptions: {
            chunkSize: 1024,
            memLevel: 7,
            level: 3,
        },
        zlibInflateOptions: {
            chunkSize: 10 * 1024,
        },
        clientNoContextTakeover: true,
        serverNoContextTakeover: true,
        serverMaxWindowBits: 10,
        concurrencyLimit: 10,
        threshold: 1024,
    },
})

const getIp = (request) =>
    request.headers['x-forwarded-for']?.split(',')[0]?.trim() || request.socket.remoteAddress

server.on('connection', (socket, request) => {
    socket.on('error', console.error)
    const ip = getIp(request)
    console.log(`connection: remote="${ip}"`)

    socket.on('message', (data, isBinary) => {
        console.log(`message: data="${data.toString()}", isBinary=${isBinary}`)

        server.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN)
                client.send(data)
        })
    })

    socket.on('close', (code, reason) => {
        console.log(`close: code=${code}, reason="${reason.toString()}"`)
    })
})

console.log(`WebSocketServer running on port ${port}`)
