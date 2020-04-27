import { promises } from "dns";

export enum Role {
    polite = 1,
    initiator = 2
}



export default class Signaler {
    ws: WebSocket;
   
    role?: Role

    roleCallback?: (r: Role) => any
    rolePromise: Promise<Role>

    signalListener?: (s: string) => any

    constructor() {
        this.ws = new WebSocket('ws://localhost:9090/')
        this.rolePromise = new Promise(r => {
            if(this.role) return r(this.role)

            this.roleCallback = r
        })

        this.ws.onmessage = (e) => this.onMessage(e.data)
    }

    onMessage(m: string) {
        if(!this.role) {
            this.role = m == 'initiator' ? Role.initiator : Role.polite
            
            if(this.roleCallback) this.roleCallback(this.role)
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