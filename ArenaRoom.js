import pkg from 'colyseus';
const { Room } = pkg;
import { Schema, MapSchema, type } from '@colyseus/schema';

export class Player extends Schema {}
type(Player, { x: 'number', z: 'number', yaw: 'number', hp: 'number' });

export class Bot extends Schema {}
type(Bot, { x: 'number', z: 'number', hp: 'number', type: 'string', alive: 'boolean' });

export class RoomState extends Schema {}
type(RoomState, { players: { map: Player }, bots: { map: Bot }, round: 'number' });

export class ArenaRoom extends Room {
  maxClients = 4;

  onCreate() {
    this.setState(new RoomState());
    this.state.players = new MapSchema();
    this.state.bots = new MapSchema();
    this.state.round = 1;
    this.spawnBot();
    
    this.setSimulationInterval((dt) => this.update(dt), 1000 / 20);

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
    const p = new Player();
    p.x = 0; p.z = 20; p.yaw = 0; p.hp = 100;
    this.state.players.set(client.sessionId, p);
  }

  onLeave(client) {
    this.state.players.delete(client.sessionId);
  }

  spawnBot() {
    const b = new Bot();
    b.x = 0; b.z = -15; b.hp = 100; b.type = 'assault'; b.alive = true;
    this.state.bots.set('bot1', b);
  }

  update(dt) {
    // Логика движения бота
    this.state.bots.forEach((bot) => {
      if (!bot.alive) return;

      // Ищем ближайшего игрока
      let nearest = null;
      let nearestDist = Infinity;
      this.state.players.forEach((p) => {
        const d = Math.hypot(p.x - bot.x, p.z - bot.z);
        if (d < nearestDist) { nearestDist = d; nearest = p; }
      });

      if (nearest) {
        // Если игрок далеко - бежим к нему
        if (nearestDist > 5) {
          const dx = nearest.x - bot.x;
          const dz = nearest.z - bot.z;
          bot.x += (dx / nearestDist) * 3 * dt; // Скорость 3
          bot.z += (dz / nearestDist) * 3 * dt;
        } 
        // Если близко - наносим урон
        else {
          nearest.hp -= 5; // 5 урона в тик
          if (nearest.hp <= 0) {
            nearest.hp = 100; // Респавн игрока
            nearest.x = 0; nearest.z = 20;
          }
        }
      }
    });
  }
}
