import { promises } from "dns";

export interface Role {initiator: boolean, ice_servers: any}



export default class Signaler {
    ws: WebSocket;
   
    role?: Role

    roleCallback?: (r: Role) => any
    rolePromise: Promise<Role>

    signalListener?: (s: string) => any

    constructor() {
        const wsUrl = `${location.protocol == 'http:' ? 'ws' : 'wss'}://${location.host}`
        this.ws = new WebSocket(wsUrl)
        this.rolePromise = new Promise(r => {
            if(this.role) return r(this.role)

            this.roleCallback = r
        })

        this.ws.onmessage = (e) => this.onMessage(e.data)
    }

    onMessage(m: string) {
        if(!this.role) {
            this.role = JSON.parse(m)

            if(this.roleCallback && this.role) this.roleCallback(this.role)
        } else if(this.signalListener) {
            this.signalListener(m)
        }
    }

    set onsignal( listener:  (s: string) => any ) {
        this.signalListener = listener
    }

    signal(s: any) {
        this.ws.send(JSON.stringify(s))
    }

    close() {
        this.ws.close()
    }


    getRole() {
        return this.rolePromise
    }
}