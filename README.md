# nodeJS-chat
A nodeJS chat app using WebSocket (socket.io).
Check live example here: [https://zoran-chat.herokuapp.com/](https://zoran-chat.herokuapp.com/)

### Running locally

```
cd nodejs-chat
npm install
npm start
```

### WebSocket and Socket.IO
WebSocket is a protocol providing full-duplex communications channels over a single TCP connection. Socket.IO is a JavaScript library for bi-directional communication between web clients and servers.
Socket.IO handles the connection transparently, so it will automatically "upgrade" to WebSocket if possible.
Socket.IO connections start with an HTTP request that is then "upgraded" to the WebSocket protocol, if both sides agree (server and client). If one or the other does not, Socket.IO will negotiate another transport, such as long polling (xhr-polling, json-polling). 
You can easily configure Socket.IO to use only WebSocket.
E.g.
```
io.set('transports', ['websocket']);
```
