import pkg from 'colyseus';
const { Server } = pkg;
import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import { ArenaRoom } from './ArenaRoom.js';

const port = Number(process.env.PORT || 3000);
const app = express();
app.use(cors());

app.get('/', (req, res) => {
  res.send('Tactical Arena Server is running!');
});

const httpServer = createServer(app);
const gameServer = new Server({ server: httpServer });
gameServer.define('arena', ArenaRoom);

gameServer.listen(port).then(() => console.log('Server listening on port', port));
