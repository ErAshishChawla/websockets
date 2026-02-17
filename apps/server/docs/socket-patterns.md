# Socket Patterns

## Envelope Pattern

Messages sent between server and client should not be plain text, they should be intent aware. Example of a well designed message is

```json
{
  "type": "CHAT_MESSAGE", // Tells your server what logic to run
  "id": "uuid-123", // Track the message
  "payload": { "text": "Hey everyone", "roomId": "general" }, // Actual data,
  "metadata": { "sentAt": 1705622400 } // Optional Context
}
```

Now your server/client depending on the type of message routes the message to proper handler using a literal switch statement.

```javascript
switch type:
    case JOIN_ROOM:
        return handleJoinRoom(message)
    case USER_TYPING:
        return handleTyping(message)
    default:
        console.log("Unknown type detected", type, message)
```

There are two ways to implement envelope pattern

### 1. Type-based commands (If sender decides what to do)

It means your app has certain defined actions like

```json
{"type": "CHAT_MESSAGE", "payload": {...}}
{"type": "TYPING", "payload": {...}}
{"type": "USER_JOIN", "payload": {...}}
```

Perfect for Chat Apps, Dashboards, Collaborative tools

### 2. Topic-based messages (Pub/Sub patterns, If the sender decides what has changed)

It is best when your channels are dynamic

```json
{ "topic": "stock:AAPL", "data": { "price": 150.23 } }
{ "topic": "game:lakers-warriors", "data": { "score": "45-42" } }
```

Perfec for Sensors, Tickers, Live markets, Sports engines

### When to Use Which Pattern (Decision Guide)

Use this section when you are confused about **type-based vs topic-based**.

#### Ask yourself this one question

> **Is the sender telling the system to do something, or telling the system that something happened?**

---

#### Use Type-based commands when

- A **user initiates an action**
- The message represents **intent**
- You need **authorization per action**
- You want **strong validation**
- The number of actions is **finite and known**

Examples

- Send chat message
- Join or leave room
- User typing indicator
- Game movement
- Button clicks
- Form submissions

```json
{
  "type": "SEND_MESSAGE",
  "payload": {
    "roomId": "general",
    "text": "Hello"
  }
}
```

#### Use Topic-based messages when

- Data is continuously changing
- No single user “owns” the update
- Clients just want to listen
- Channels are dynamic
- The system produces events, not actions

Examples

- Stock price feeds
- Sports scores
- Sensor data
- System metrics
- Presence updates
- Live dashboards

```json
{
  "topic": "stock:AAPL",
  "data": {
    "price": 150.23
  }
}
```

Think of this as:

> **Pub/Sub over WebSockets**

#### Most real systems are hybrid

A very common and recommended pattern is:

- **Client → Server**: Type-based commands
- **Server → Client**: Topic-based broadcasts

Example

Client subscribes:

```json
{
  "type": "SUBSCRIBE",
  "payload": {
    "topic": "stock:AAPL"
  }
}
```

Server broadcasts:

```json
{
  "topic": "stock:AAPL",
  "data": {
    "price": 150.23
  }
}
```

This keeps:

- Commands explicit
- Data streams scalable

#### Quick comparison table

| Question            | Type-based  | Topic-based      |
| ------------------- | ----------- | ---------------- |
| Who decides intent? | Sender      | System           |
| Represents          | Action      | Event            |
| Best for            | Commands    | Streams          |
| Validation          | Strong      | Minimal          |
| Examples            | Chat, Games | Markets, Sensors |

#### Rule of thumb (remember this)

> **If you can phrase it as “Do X” → Type-based**
> **If you can phrase it as “X happened” → Topic-based**

#### Common mistake to avoid

❌ Using topic-based messages for user actions
❌ Encoding intent inside topic names
❌ Letting clients publish arbitrary topics without validation

## Data Transfer Format

After deciding the message structure you need to decide in what format you want to send the data

There are two formats

- Text (JSON) (Default)
- Binary (Raw bytes)

Binary is used when messages are of high frequency. Examples are

- GPS Updates
- Mouse Movements
- Audio Chunks
- Game States

Instead of sending readable text we send raw bytes. It takes **less bandwidth** and has **less latency**

Production apps often use both. Json for control messages

- Join
- Auth
- Command

and Binary for high speed data

- Movement
- Audio
- Sensors

## Message routing

After decicing the message structure and format. Next step is to decide who is to receive the message.

### Broadcast (one to all)

One message goes to every signle connected client. It is used for

- System announcements
- Global alerts
- Service status updates

**Occasional Broadcast** is fine, but **High Frequency Broadcast** is a problem.

### Unicast (one to one)

Only one client receive the message. We need to keep a registry of user to socket. It is used for

- Private messages
- User notifications
- Admin actions

### Multicast (one to many)

Group chat pattern, one message is sent to some of the selected clients. The message is sent to a specific room. It is used for

- Discord channels
- Game lobbies
- Live event chats
- Collaborative documents

## Acknowledgements

Websockets are fast but also are fire and forget. Unlike http there is no automatic 200 OK that tells the client the message was sent successfully. To solve this we add acknowlegements.

When client sends a message to server it sends an id along it. When the message is received by server, server processes it and then sends the same id back as receipt. If the client doesn't get the receipt in time client resends the same message again. This adds reliability to web sockets.

## Pub/Sub Pattern and Scaling

We only send updates to those users that are subscribed to receive those updates. Example lets say there are 3 users and 3 stocks

User1 Apple Stock
User2 Google Stock
User3 Nvidia Stock

User1 -> Apple Stock
User2 -> Google Stock
User3 -> Apple Stock

Now if Apple stock changes only User1 and User3 will receive the update not the User2. Similarly if Nvidia Stock changes none of the users will receive any update.

### Scaling

One of the challenges with websockets is scaling. Websockets are not stateless they consume memory on the server. So each server has a fixed capacity of websocket connections it can hold concurrently. We can do horizontal scaling, i.e. add new servers however this poses a new problem, the parallel servers dont share state, so clients attached to server 1 don't know about clients attached to server 2.

So, to solve this production apps use message broker like redis. One server publishes update to the message broker. Other servers are subscribed to message broker and receive the updates published other servers and route them to the users connected to them if needed.

## Guide on when to use web sockets

Websockets are great but not answer to every problem. For example, if you try to stream video on web sockets, you will face dropped connections, higher latency and dropped frames as well. It is because the binary payload will be huge.

Websockets are great for things like

- Chat
- Notifications
- Collaboration
- Dashboards

However to build something media heavy, websockets are not the answer

### WebRTC

Challenges with media intensive applications like zoom is the huge binary payload. It will consume more bandwidth, memory and ingress causing increase in latency, dropped frames and huge server bills. So, routing media through your server is not a good idea.

To solve this we have WebRTC. WebRTC allows two browsers to talk to each other directly (peer to peer, P2P) with ultra low latency. It is perfect for audio and video.

The only thing we need to provide is a match making platform. We need to provide a platform that allows the browsers to find each other and exchange the connection information. This step is called **Signaling** and this is done with web sockets.

Flow:

Client A -> Connects to websocket server and sends an offer to connect with client b. -> Client B answers with connection details. -> WebRTC connects two browsers P2P.

Production apps like zoom use
Websockets for -> Signaling + chat + join events
WebRTC for -> Audio/video streaming or File transfers

### WebTransport

When P2P is not possible but still you need ultra low latency like

- High-FPS cloud gaming
- Live media pipelines
- Competitive RT systems

Websockets are built over TCP. TCP has single stream and gurantees order. However, this causes a huge problem, if one packet is lost every other packet waits until that packet is resent. It is called **Head of line Blocking**.

WebTransport uses HTTP/3 powered by Quick. Instead of one stream WebTransport uses multiple independent streams, so, if one stream is delayed, others keep flowing.

WebTransport is new so if you are not building something very sensitive to latency stick with Websockets as they are

- Stable
- Supported everywhere
- Battle tested

### Server-Sent Events

If in your app only server needs to send events to client, then maybe websockets are overkill. In server-sent events, server sends messages to connected client. The connection is one way, server to client over http. They are

- Lightweight
- Simple
- Reconnects automatically

### Golden rule

> **Does the server needs to push updates?** SSE or Websockets
> **Does the client need to talk back?** Web Sockets
> **Is it heavy audio/video or huge data(files)?** WebRTC
