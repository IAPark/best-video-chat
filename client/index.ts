import Peer from 'simple-peer';
import { fail } from 'assert';
import { type } from 'os';


const websocket = new WebSocket('ws://localhost:9090/')

function messagePromise(websocket: WebSocket): Promise<string> {
    return new Promise( resolve => {
        websocket.onmessage = (e) => {
            resolve(e.data)
        } 
    })
}

async function main() {
    //const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});

    const roleMessage = await messagePromise(websocket)

    var peer = new Peer({initiator: roleMessage == 'initiator'})

    peer.on('signal', data => {
        websocket.send(JSON.stringify(data))
    })
    websocket.onmessage = (e) => {
        const decoded = JSON.parse(e.data)
        peer.signal(e.data)
    }

    peer.on('connect', () => console.log('connected'))
}

main()