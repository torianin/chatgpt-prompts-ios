const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(__dirname));

const prompts = [];
let nextPromptId = 1;

wss.on('connection', (socket) => {
  socket.on('message', (message) => {
    const data = JSON.parse(message);

  switch (data.type) {
      case 'submit':
        prompts.push({ id: nextPromptId, text: data.text, votes: 0 });
        nextPromptId++;
        broadcastUpdate();
        break;

      case 'vote':
        const prompt = prompts.find((p) => p.id === data.id);
        if (prompt) {
          prompt.votes += data.delta;
          broadcastUpdate();
        }
        break;
    }
  });

  socket.send(JSON.stringify({ type: 'init', prompts }));
});

function broadcastUpdate() {
  const updateMessage = JSON.stringify({ type: 'update', prompts });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(updateMessage);
    }
  });
}


const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});