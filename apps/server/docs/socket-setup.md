Create a websocket server using WebSocketServer from ws. This creates its own internal
http server for handshake, it does nothing else. Generally this is not done in production apps.

In production apps the websocket server is attached to an existing http server on the same port.

Then you deal with events

- First is the connection event. In the callback we receive socket and request.
  Socket contains the individual socket information and request contains the request info
  like headers, cookies, etc.

- After handling the connection event then we can handle further events like "message",
  "disconnect", "error" and so on.

- WS server has a list containing all the socket connections called clients and you can access
  them. Each client or socket has a readyState parameter that tells us the state of current socket
  0: Connecting
  1: Open (The only state where you can safely use .send())
  2: Closing
  3: Closed
