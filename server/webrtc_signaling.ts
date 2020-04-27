import * as WebSocket from 'ws';
import http from 'http';



export class WebRTCSignaler {
    wss: WebSocket.Server
    clients: Client[] = []
    
    constructor(server: http.Server) {
        this.wss =  new WebSocket.Server({ server: server })
        console.log('starting ws')

        this.wss.on('connection', (ws: WebSocket) => {
            const client = new Client(ws, !this.initiatorAssigned())

            // only two people can join
            if (this.clients.length > 1) client.close()

            this.clients.push(client)

            console.log('connection size =', this.clients.length)

            if (this.clients.length == 2) {
                console.log('assigning role for each')
                this.clients.forEach( c => c.assignRole() )
            }

            client.addOnMessage( (data, client) => {
                this.broadcast(data, client)
            })

            client.addOnClose((client) => {
                console.log('closed')
                const index = this.clients.indexOf(client)
                if (index < 0) return;

                this.clients.splice(index, 1)

                this.clients.forEach( c => c.ws.close())
            })
        });
    }

    initiatorAssigned() {
        return this.clients.some( (c) => c.initiator)
    }


    broadcast(message: any, except: Client) {
        this.clients.forEach( 
            client => {
                if (client === except) {return}
                client.send(message)
            }
        )
    }
}

class Client {
    ws: WebSocket
    initiator: boolean
    roleAssigned = false
    queuedMessages: any[] = []

    constructor(ws: WebSocket, initiator: boolean) {
        this.initiator = initiator
        this.ws = ws
    }

    assignRole() {
        console.log('assignRole', this.roleAssigned, this.initiator)
        if (this.roleAssigned) return;

        this.roleAssigned = true;
        this.ws.send(this.initiator ? 'initiator' : 'polite')

        this.drainQueue()
    }

    addOnClose(listener: (client: Client) => void) {
        this.ws.on('close', () => listener(this));
    }

    addOnMessage(listener: (data: any, client: Client) => void ) {
        this.ws.on('message', (d) => listener(d, this));
    }

    send(message: any) {
        if (this.roleAssigned) {
            console.log('sending directly')
            this.ws.send(message)
        } else  {
            this.queuedMessages.push(message);
        }
    }

    drainQueue() {
        this.queuedMessages.forEach( m => {
            this.ws.send(m)
        })
        this.queuedMessages = []
    }

    close() {
        this.ws.close()
    }
}
