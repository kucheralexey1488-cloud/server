import pkg from 'colyseus';
const { Room } = pkg;
import { Schema, MapSchema, type } from '@colyseus/schema';

// Схема игрока
export class Player extends Schema {}
type(Player, {
  x: 'number',
  z: 'number',
  yaw: 'number',
  hp: 'number'
});

// Схема бота
export class Bot extends Schema {}
type(Bot, {
  x: 'number',
  z: 'number',
  hp: 'number',
  type: 'string',
  alive: 'boolean'
});

// Схема комнаты
export class RoomState extends Schema {}
type(RoomState, {
  players: { map: Player },
  bots: { map: Bot },
  round: 'number'
});

export class ArenaRoom extends Room {
  maxClients = 4;

  onCreate() {
    this.setState(new RoomState());
    
    // Инициализируем пустые карты (это исправит ошибку)
    this.state.players = new MapSchema();
    this.state.bots = new MapSchema();
    this.state.round = 1;
    
    this.spawnBot();
    
    // Игровой цикл сервера (20 тиков в секунду)
    this.setSimulationInterval((dt) => this.update(dt), 1000 / 20);

    // Обработка движения от клиента
    this.onMessage('move', (client, data) => {
      const p = this.state.players.get(client.sessionId);
      if (p) {
        p.x = data.x;
        p.z = data.z;
        p.yaw = data.yaw;
      }
    });
  }

  onJoin(client) {
    console.log(client.sessionId, 'joined!');
    // Создаём игрока и задаём ему стартовые координаты
    const p = new Player();
    p.x = 0;
    p.z = 20;
    p.yaw = 0;
    p.hp = 100;
    this.state.players.set(client.sessionId, p);
  }

  onLeave(client) {
    console.log(client.sessionId, 'left!');
    this.state.players.delete(client.sessionId);
  }

  spawnBot() {
    const b = new Bot();
    b.x = Math.random() * 20 - 10;
    b.z = Math.random() * 20 - 10;
    b.hp = 100;
    b.type = 'assault';
    b.alive = true;
    this.state.bots.set('bot1', b);
  }

  update(dt) {
    // Тут будет логика движения ботов (пока просто стоит)
  }
}
