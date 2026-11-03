import { Room } from 'colyseus';
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

// Схема комнаты (всё, что синхронизируется с клиентами)
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
    this.state.players.set(client.sessionId, new Player());
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
