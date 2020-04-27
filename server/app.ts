import express from 'express'
import http from 'http';

import {WebRTCSignaler} from './webrtc_signaling'

const app = express()

const server = http.createServer(app);

const rtcSignaler = new WebRTCSignaler(server)


app.use(express.static('static'))
app.use(express.static('static/dist'))

console.log('here')

server.listen(8080)