import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

class Player {
  id: string; //token
  playerX: number;
  playerId: string; //socket
  playerN: number;
  playerLogin: string;
  playerImg: string;
  
  constructor(_playerId: string, _playerN: number, _id: string) {
    this.id = _id;
    this.playerX = 0;
    this.playerId = _playerId;
    this.playerN = _playerN;
    this.playerLogin = '';
    this.playerImg = '';
  }
}

class Ball {
  x: number;
  y: number;
  z: number;
  dir: number;
  xDir: number;
  xVal: number;
  speed: number;

  constructor() {
    this.x = 0;
    this.y = 5;
    this.z = 0;
    this.dir = 1;
    this.xDir = 1;
    this.xVal = 0;
    this.speed = 0.1;
  }
}

class Room {
  roomId: number;
  player1: Player;
  player2: Player;
  player1Score: number;
  player2Score: number;
  game_ended: boolean;
  full: boolean;
  ball: Ball;

  constructor(_roomID: number) {
    this.roomId = _roomID;
    this.player1 = null;
    this.player2 = null;
    this.full = false;
    this.ball = new Ball();
    this.player1Score = 0;
    this.player2Score = 0;
    this.game_ended = false;
  }
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MyGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private prisma: PrismaService,
    private jwtservice: JwtService,
  ) {}

  validateToken(token: string) {
    const payload = this.jwtservice.decode(token);
    if (!payload) return null;
    return payload;
  }

  async addMatchHistory(
    id: string,
    selfScore: string,
    opponentId: string,
    opponentScore: string,
  ) {
    let win: number = 0;
    let loss: number = 0;

    if (selfScore === '5') win = 1;

    if (opponentScore === '5') loss = 1;

    let user = await this.prisma.user.update({
      where: {
        userId: id,
      },
      data: {
        matchHistory: {
          push: {
            selfScore: selfScore,
            opponentId: opponentId,
            opponentScore: opponentScore,
          },
        },
        wins: {
          increment: win,
        },
        losses: {
          increment: loss,
        },
      },
    });
  }

  async getOpponentData(id: string) {
    let user = await this.prisma.user.findUnique({
      where: {
        userId: id,
      },
    });
    return { login: user.username, img: user.image };
  }

  @WebSocketServer()
  server: Server;

  roomNumbers: number = 0;
  connectedClients: number = 0;
  rooms: Room[] = [];
  tokens = new Map();
  friendsTokens = new Map();

  afterInit() {}

  async handleConnection(@ConnectedSocket() client: any) {
    const userId = this.validateToken(client.handshake.auth.token);
    this.friendsTokens.set(userId.sub, client.id);

    await this.prisma.user.update({
      where: {
        userId: userId.sub,
      },
      data: {
        Status: 'online',
      },
    });

    this.server.emit('statusChanged');
  }

  async handleDisconnect(@ConnectedSocket() client: any) {
    const userId = this.validateToken(client.handshake.auth.token);

    if (this.tokens.has(userId.sub)) {
      if (this.tokens.get(userId.sub).status === 'ingame') {
        this.server
          .to(`room ${this.tokens.get(userId.sub).room}`)
          .emit('unexpectedEnding', userId.sub);
      }

      this.tokens.forEach((values, keys) => {
        if (client.id === values.socket && values.status == 'inqueue') {
          this.connectedClients--;
        }
        this.tokens.delete(keys);
      });
    }
    await this.prisma.user.update({
      where: {
        userId: userId.sub,
      },
      data: {
        Status: 'offline',
      },
    });

    this.server.emit('statusChanged');
  }

  @SubscribeMessage('inqueue')
  async connection(
    @ConnectedSocket() client: any,
    @MessageBody() token: string,
  ) {
    var user1;
    var user2;
    const userId = this.validateToken(client.handshake.auth.token);

    // console.log(`inqueue ${client.id}`);
    // console.log(`conn clients ==> ${this.connectedClients}`);
    if (this.connectedClients % 2 === 0) {
      this.rooms.push(new Room(this.roomNumbers));
      this.rooms[this.roomNumbers].player1 = new Player(client.id, 1, token);
    } else {
      this.rooms[this.roomNumbers].player2 = new Player(client.id, 2, token);
    }

    client.join(`room ${this.roomNumbers}`);
    client.emit('joinedRoom', this.roomNumbers);
    this.server.emit('statusChanged');

    await this.prisma.user.update({
      where: {
        userId: userId.sub,
      },
      data: {
        Status: 'inqueue',
      },
    });

    this.connectedClients++;
    this.tokens.set(token, {
      socket: client.id,
      status: 'inqueue',
      room: this.roomNumbers,
      id: userId.sub,
    });

    if (
      this.rooms[this.roomNumbers].player1 &&
      this.rooms[this.roomNumbers].player2
    ) {
      this.getOpponentData(this.rooms[this.roomNumbers].player1.id).then(
        (data) => {
          user1 = data;
        },
      );

      this.getOpponentData(this.rooms[this.roomNumbers].player2.id).then(
        (data) => {
          user2 = data;
        },
      );

      setTimeout(() => {
        this.server
          .to(this.rooms[this.roomNumbers].player1.playerId)
          .emit('opponentData', user2);
        this.server
          .to(this.rooms[this.roomNumbers].player2.playerId)
          .emit('opponentData', user1);

        this.tokens.set(this.rooms[this.roomNumbers].player1.id, {
          socket: this.rooms[this.roomNumbers].player1.playerId,
          status: 'ingame',
          room: this.roomNumbers,
          id: userId.sub,
        });
        this.tokens.set(this.rooms[this.roomNumbers].player2.id, {
          socket: this.rooms[this.roomNumbers].player2.playerId,
          status: 'ingame',
          room: this.roomNumbers,
          id: userId.sub,
        });

        this.server.to(`room ${this.roomNumbers}`).emit('start');
        this.rooms[this.roomNumbers].full = true;
        this.roomNumbers++;
      }, 200);
    }
  }

  @SubscribeMessage('leftQueue')
  async leavingQueue(@ConnectedSocket() client) {
    const userId = this.validateToken(client.handshake.auth.token);

    await this.prisma.user.update({
      where: {
        userId: userId.sub,
      },
      data: {
        Status: 'online',
      },
    });
    this.server.emit('statusChanged');
    if (
      this.tokens.has(userId.sub) &&
      this.tokens.get(userId.sub).status === 'inqueue'
    )
      this.tokens.delete(userId.sub);

    if (
      this.tokens.has(userId.sub) &&
      this.tokens.get(userId.sub).status === 'ingame'
    ) {
      await this.prisma.user.update({
        where: {
          userId: userId.sub,
        },
        data: {
          Status: 'ingame',
        },
      });
      this.server.emit('statusChanged');
    }

    this.connectedClients--;
  }

  @SubscribeMessage('playerPos')
  getPaddlePos(
    @ConnectedSocket() client: any,
    @MessageBody() data: { room: number; position: number },
  ) {
    var { room, position } = data;

    if (this.rooms[room].player1.playerId === client.id)
      this.rooms[room].player1.playerX = position;
    else if (this.rooms[room].player2.playerId === client.id)
      this.rooms[room].player2.playerX = position;
  }

  restart(ball: Ball) {
    ball.x = 0;
    ball.y = 5;
    ball.z = 0;
    ball.dir = 1;
    ball.xDir = 1;
    ball.xVal = 0;
    ball.speed = 0.1;
  }

  @SubscribeMessage('disconn')
  disconnection(@ConnectedSocket() client: any, @MessageBody() room: number) {
    this.server.to(client.id).emit('disconn');
  }

  @SubscribeMessage('updateBallPos')
  async moveBall(@ConnectedSocket() client: any, @MessageBody() room: number) {
    const userId = this.validateToken(client.handshake.auth.token);

    if (this.rooms[room].full) {
      this.rooms[room].ball.z +=
        this.rooms[room].ball.dir * this.rooms[room].ball.speed;
      this.rooms[room].ball.y =
        -0.5 * ((this.rooms[room].ball.z * this.rooms[room].ball.z) / 10) + 5;
      this.rooms[room].ball.x +=
        this.rooms[room].ball.xVal * this.rooms[room].ball.xDir;

      if (this.rooms[room].ball.x > 7.1 || this.rooms[room].ball.x < -7.1)
        this.rooms[room].ball.xDir *= -1;

      if (this.rooms[room].ball.z > 10) {
        this.server
          .to(this.rooms[room].player2.playerId)
          .emit('AFK', this.rooms[room].player1.id);
      }

      if (this.rooms[room].ball.z < -10) {
        this.server
          .to(this.rooms[room].player1.playerId)
          .emit('AFK', this.rooms[room].player2.id);
      }

      if (this.rooms[room].player1.playerId === client.id) {
        if (this.rooms[room].ball.z > 9.5) {
          if (
            Math.abs(
              this.rooms[room].ball.x - this.rooms[room].player1.playerX,
            ) < 1.5
          ) {
            this.rooms[room].ball.dir = -1;
            this.rooms[room].ball.xDir = 1;
            this.rooms[room].ball.xVal =
              (this.rooms[room].ball.x - this.rooms[room].player1.playerX) / 10;
          } else {
            this.restart(this.rooms[room].ball);
            this.rooms[room].player2Score += 1;
          }
        }
        this.server
          .to(client.id)
          .emit('updateOpponentPos', this.rooms[room].player2.playerX);
        this.server
          .to(client.id)
          .emit('updateBallPos', { ball: this.rooms[room].ball, pos: 1 });
        this.server.to(client.id).emit('scoreBoard', {
          selfScore: this.rooms[room].player1Score,
          opponentScore: this.rooms[room].player2Score,
        });
      } else if (this.rooms[room].player2.playerId === client.id) {
        if (this.rooms[room].ball.z < -9.5) {
          if (
            Math.abs(
              this.rooms[room].ball.x - this.rooms[room].player2.playerX,
            ) < 1.5
          ) {
            this.rooms[room].ball.dir = 1;
            this.rooms[room].ball.xDir = 1;
            this.rooms[room].ball.xVal =
              (this.rooms[room].ball.x - this.rooms[room].player2.playerX) / 10;
          } else {
            this.restart(this.rooms[room].ball);
            this.rooms[room].player1Score += 1;
          }
        }
        this.server
          .to(client.id)
          .emit('updateBallPos', { ball: this.rooms[room].ball, pos: 2 });
        this.server
          .to(client.id)
          .emit('updateOpponentPos', this.rooms[room].player1.playerX);
        this.server.to(client.id).emit('scoreBoard', {
          selfScore: this.rooms[room].player2Score,
          opponentScore: this.rooms[room].player1Score,
        });
      }

      if (
        this.rooms[room].player1Score === 5 ||
        this.rooms[room].player2Score === 5
      ) {
        this.rooms[room].game_ended = true;
        this.server.to(`room ${room}`).emit('stop');

        this.tokens.set(this.rooms[room].player1.id, {
          socket: this.rooms[room].player1.playerId,
          status: 'online',
          room: room,
          id: userId.sub,
        });

        await this.prisma.user.update({
          where: {
            userId: this.rooms[room].player1.id,
          },
          data: {
            Status: 'online',
          },
        });

        this.tokens.set(this.rooms[room].player2.id, {
          socket: this.rooms[room].player2.playerId,
          status: 'online',
          room: room,
          id: userId.sub,
        });

        await this.prisma.user.update({
          where: {
            userId: this.rooms[room].player2.id,
          },
          data: {
            Status: 'online',
          },
        });

        this.server.emit('statusChanged');
        if (this.rooms[room].player1Score > this.rooms[room].player2Score) {
          this.server.to(this.rooms[room].player1.playerId).emit('won');
          this.server.to(this.rooms[room].player2.playerId).emit('lost');
        } else {
          this.server.to(this.rooms[room].player2.playerId).emit('won');
          this.server.to(this.rooms[room].player1.playerId).emit('lost');
        }
      }
    }
  }

  @SubscribeMessage('forfeit')
  async forfeit(@ConnectedSocket() client: any, @MessageBody() data: number) {
    const userId = this.validateToken(client.handshake.auth.token);

    this.addMatchHistory(userId.sub, String(5), String(data), String(0));
    this.addMatchHistory(String(data), String(0), userId.sub, String(5));

    await this.prisma.user.update({
      where: {
        userId: userId.sub,
      },
      data: {
        Status: 'online',
      },
    });

    this.server.emit('statusChanged');
  }

  @SubscribeMessage('addMatchHistory')
  updateDb(@ConnectedSocket() client: any, @MessageBody() room: number) {
    if (
      client.id === this.rooms[room].player1.playerId &&
      this.rooms[room].game_ended
    ) {
      this.addMatchHistory(
        this.rooms[room].player1.id,
        String(this.rooms[room].player1Score),
        this.rooms[room].player2.id,
        String(this.rooms[room].player2Score),
      );
    }
    if (
      client.id === this.rooms[room].player2.playerId &&
      this.rooms[room].game_ended
    )
      this.addMatchHistory(
        this.rooms[room].player2.id,
        String(this.rooms[room].player2Score),
        this.rooms[room].player1.id,
        String(this.rooms[room].player1Score),
      );
  }

  @SubscribeMessage('leftGame')
  async leftGame(@ConnectedSocket() client: any, @MessageBody() room: number) {
    const userId = this.validateToken(client.handshake.auth.token);

    if (this.tokens.has(userId.sub)) {
      if (this.tokens.get(userId.sub).status === 'ingame') {
        this.server
          .to(`room ${this.tokens.get(userId.sub).room}`)
          .emit('unexpectedEnding', userId.sub);
      }
    }

    await this.prisma.user.update({
      where: {
        userId: userId.sub,
      },
      data: {
        Status: 'online',
      },
    });
    this.server.emit('statusChanged');
  }

  @SubscribeMessage('handleAFK')
  async afk(@ConnectedSocket() client: any, @MessageBody() data: string) {
    const userId = this.validateToken(client.handshake.auth.token);

    this.addMatchHistory(userId.sub, String(5), String(data), String(0));
    this.addMatchHistory(String(data), String(0), userId.sub, String(5));

    await this.prisma.user.update({
      where: {
        userId: userId.sub,
      },
      data: {
        Status: 'online',
      },
    });

    await this.prisma.user.update({
      where: {
        userId: data,
      },
      data: {
        Status: 'online',
      },
    });

    this.server.emit('statusChanged');
  }

  @SubscribeMessage('FirstTime')
  async Frist(@ConnectedSocket() client: any) {

    const userId = this.validateToken(client.handshake.auth.token);

    await this.prisma.user.update({
      where: {
        userId: userId.sub,
      },
      data: {
        FirstTime: false,
      },
    });
  }
}