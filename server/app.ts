import * as WebSocket from 'ws';



class WebRTCSignaler {
    wss: WebSocket.Server
    clients: WebSocket[] = []
    
    constructor(port: number = 9090) {
        this.wss =  new WebSocket.Server({ port: port })
        console.log('starting at', port)

        this.wss.on('connection', (ws: WebSocket) => {
            const cws = ws;
            this.clients.push(ws)
            console.log('connection size=', this.clients.length)

            if (this.clients.length == 2) {
                this.clients[0].send('initiator')
                this.clients[1].send('polite')
            }

            ws.on('message', data => {
                console.log('received', data)
                this.broadcast(data, ws)
            })

            ws.on('close', () => {
                const index = this.clients.indexOf(cws)
                if (index < 0) return;

                this.clients.splice(index, 1)
            })
        });
    }


    broadcast(message: any, except: WebSocket) {
        if(!this.wss) return;


        this.wss.clients.forEach( 
            ws => {
                if (ws === except) {return}
                ws.send(message)
            }
        )
    }
}

class Client {
    ws: WebSocket
    initiator: boolean
    roleAssigned = false

    constructor(ws: WebSocket, initiator: boolean) {
        this.initiator = initiator
        this.ws = ws
    }

    onClose(listener: () => void) {
        this.ws.on('close', listener)
    }
    
}

const server = new WebRTCSignaler()

console.log('here')