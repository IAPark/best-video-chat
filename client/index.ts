import Peer from 'simple-peer';
import Signaler, {Role} from './signaler'

const s = new Signaler()
const video: HTMLVideoElement = document.getElementById('video') as HTMLVideoElement;

function messagePromise(websocket: WebSocket): Promise<string> {
    return new Promise( resolve => {
        websocket.onmessage = (e) => {
            resolve(e.data)
        } 
    })
}

async function main() {
    const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});

    const role = await s.getRole()
    console.log('got role', role)

    var peer = new Peer({initiator: role == Role.initiator, stream: stream})
    peer.on('close', () => s.close())

    peer.on('signal', data => {
        s.signal(data)
    })
    s.onsignal = (s) => {
        peer.signal(s)
    }

    peer.on('connect', () => console.log('connected'))

    peer.on('stream', (stream: MediaStream) => {

        video.srcObject = stream;
        video.play()
    })
}

main()