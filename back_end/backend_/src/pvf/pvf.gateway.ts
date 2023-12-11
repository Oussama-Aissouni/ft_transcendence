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
import { PrismaService } from 'src/prisma/prisma.service';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

class Player {
  id: string; //token
  playerX: number;
  playerId: string; //socket
  playerN: number;
  // playerLogin: string;
  // playerImg: string;

  constructor(_playerId: string, _playerN: number, _id: string) {
    this.id = _id;
    this.playerX = 0;
    this.playerId = _playerId;
    this.playerN = _playerN;
    // this.playerLogin = '';
    // this.playerImg = '';
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
export class PvfGateway
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

  @WebSocketServer()
  server: Server;

  roomNumbers: number = 0;
  rooms: Room[] = [];
  tokens = new Map();

  afterInit() {}

  async getOpponentData(id: string) {
    let user = await this.prisma.user.findUnique({
      where: {
        userId: id,
      },
    });
    return { login: user.username, img: user.image };
  }

  findPlayerRoom(socket: string) {
    for (let i = 0; i < this.roomNumbers; i++) {
      if (this.rooms[i].player1) {
        if (this.tokens.get(this.rooms[i].player1.id).status === 'ingame') {
          if (this.rooms[i].player1.playerId === socket) return i;
        }
      }
      if (this.rooms[i].player2) {
        if (this.tokens.get(this.rooms[i].player2.id).status === 'ingame') {
          if (this.rooms[i].player2.playerId === socket) return i;
        }
      }
    }
    return NaN;
  }

  handleConnection(@ConnectedSocket() client: any) {
    const userId = this.validateToken(client.handshake.auth.token);

    this.tokens.set(userId.sub, {
      socket: client.id,
      status: 'online',
    });
  }

  handleDisconnect(@ConnectedSocket() client: any) {
    // console.log(`${client.id} disconn from PvF`);

    const userId = this.validateToken(client.handshake.auth.token);

    let roomN = this.findPlayerRoom(client.id);
    if (!isNaN(roomN)) {
      this.server
        .to(`friendRoom ${roomN}`)
        .emit('friendUnexpectedEnding', userId.sub);
    }
  }

  @SubscribeMessage('gameInvite')
  async invite(@ConnectedSocket() client: any, @MessageBody() body: any) {
    const userId = this.validateToken(client.handshake.auth.token);

    const receiver = await this.prisma.user.findFirst({
      where: {
        userId: body.id,
      },
      select: {
        Status: true,
      },
    });

    if (receiver.Status !== 'online') {
      client.emit('notifFailed');
      return;
    }

    this.rooms.push(new Room(this.roomNumbers));
    this.rooms[this.roomNumbers].player1 = new Player(client.id, 1, userId.sub);
    client.join(`friendRoom ${this.roomNumbers}`);
    client.emit('friendJoinedRoom', this.roomNumbers);
    this.tokens.set(userId.sub, {
      socket: client.id,
      status: 'inqueue',
    });

    await this.prisma.user.update({
      where: {
        userId: userId.sub,
      },
      data: {
        Status: 'inqueue',
      },
    });
    this.server.emit('statusChanged');
    //update player status in db

    const notif = await this.prisma.notification.create({
      data: {
        senderId: userId.sub,
        type: 'game',
        roomId: this.roomNumbers,
        participant: {
          connect: {
            userId: body.id,
          },
        },
      },
    });

    this.server.to(this.tokens.get(body.id).socket).emit('gotNotif', notif);
    this.roomNumbers++;
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

  @SubscribeMessage('acceptedInvite')
  async acceptedInvite(
    @ConnectedSocket() client: any,
    @MessageBody() body: any,
  ) {
    var user1;
    var user2;
    const userId = this.validateToken(client.handshake.auth.token);

    this.rooms[body.roomN].player2 = new Player(client.id, 2, userId.sub);
    client.emit('friendJoinedRoom', body.roomN);
    client.join(`friendRoom ${body.roomN}`);

    if (this.rooms[body.roomN].player1 && this.rooms[body.roomN].player2) {
      this.getOpponentData(this.rooms[body.roomN].player1.id).then((data) => {
        user1 = data;
      });

      this.getOpponentData(this.rooms[body.roomN].player2.id).then((data) => {
        user2 = data;
      });

      setTimeout(async () => {
        this.server
          .to(this.rooms[body.roomN].player1.playerId)
          .emit('friendOpponentData', user2);
        this.server
          .to(this.rooms[body.roomN].player2.playerId)
          .emit('friendOpponentData', user1);

        this.tokens.set(this.rooms[body.roomN].player1.id, {
          socket: this.tokens.get(body.senderId).socket,
          status: 'ingame',
        });

        await this.prisma.user.update({
          where: {
            userId: this.rooms[body.roomN].player1.id,
          },
          data: {
            Status: 'ingame',
          },
        });

        await this.prisma.user.update({
          where: {
            userId: this.rooms[body.roomN].player2.id,
          },
          data: {
            Status: 'ingame',
          },
        });

        this.server.emit('statusChanged');

        this.tokens.set(this.rooms[body.roomN].player2.id, {
          socket: client.id,
          status: 'ingame',
        });

        this.server.to(`friendRoom ${body.roomN}`).emit('friendStart');
        this.rooms[body.roomN].full = true;
      }, 200);
    }

    await this.prisma.notification.deleteMany({
      where: {
        receiverId: userId.sub,
        senderId: body.senderId,
        type: body.type,
      },
    });

    client.emit('deleteNotif');
  }

  @SubscribeMessage('friendPlayerPos')
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

  @SubscribeMessage('friendUpdateBallPos')
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
          .emit('friendAFK', this.rooms[room].player1.id);
      }

      if (this.rooms[room].ball.z < -10) {
        this.server
          .to(this.rooms[room].player1.playerId)
          .emit('friendAFK', this.rooms[room].player2.id);
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
          .emit('friendUpdateOpponentPos', this.rooms[room].player2.playerX);
        this.server.to(client.id).emit('friendUpdateBallPos', {
          ball: this.rooms[room].ball,
          pos: 1,
        });
        this.server.to(client.id).emit('friendScoreBoard', {
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
          .emit('friendUpdateBallPos', { ball: this.rooms[room].ball, pos: 2 });
        this.server
          .to(client.id)
          .emit('friendUpdateOpponentPos', this.rooms[room].player1.playerX);
        this.server.to(client.id).emit('friendScoreBoard', {
          selfScore: this.rooms[room].player2Score,
          opponentScore: this.rooms[room].player1Score,
        });
      }
      if (
        this.rooms[room].player1Score === 5 ||
        this.rooms[room].player2Score === 5
      ) {
        this.server.to(`friendRoom ${room}`).emit('friendStop');

        // this.tokens.set(this.rooms[room].player1.id, {
        //   socket: this.rooms[room].player1.playerId,
        //   status: 'online',
        //   room: room,
        //   id: client.handshake.auth.token,
        // });
        // this.tokens.set(this.rooms[room].player2.id, {
        //   socket: this.rooms[room].player2.playerId,
        //   status: 'online',
        //   room: room,
        //   id: client.handshake.auth.token,
        // });

        await this.prisma.user.update({
          where: {
            userId: this.rooms[room].player1.id,
          },
          data: {
            Status: 'online',
          },
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
          this.server.to(this.rooms[room].player1.playerId).emit('friendWon');
          this.server.to(this.rooms[room].player2.playerId).emit('friendLost');
        } else {
          this.server.to(this.rooms[room].player2.playerId).emit('friendWon');
          this.server.to(this.rooms[room].player1.playerId).emit('friendLost');
        }
        this.rooms[room].game_ended = true;
      }
    }
  }

  @SubscribeMessage('friendLeftQueue')
  async leavingQueue(@ConnectedSocket() client, @MessageBody() room: number) {
    const userId = this.validateToken(client.handshake.auth.token);

    if (
      this.tokens.has(userId.sub) &&
      this.tokens.get(userId.sub).status === 'inqueue'
    ) {
      // this.tokens.delete(userId.sub);
      delete this.rooms[room];
      const notif = await this.prisma.notification.findFirst({
        where: {
          senderId: userId.sub,
          type: 'game',
        },
      });

      await this.prisma.notification.delete({
        where: {
          id: notif.id,
        },
      });

      await this.prisma.user.update({
        where: {
          userId: userId.sub,
        },
        data: {
          Status: 'online',
        },
      });

      this.server.emit('statusChanged');

      const recSock = this.tokens.get(notif.receiverId).socket;
      if (recSock) {
        this.server.to(recSock).emit('deleteNotif');
      }
    }
  }

  @SubscribeMessage('declinedInvite')
  async declinedInvite(
    @ConnectedSocket() client: any,
    @MessageBody() body: any,
  ) {
    const senSock = this.tokens.get(body.senderId).socket;
    this.server.to(senSock).emit('leave');
  }

  @SubscribeMessage('friendLeftGame')
  async leftGame(@ConnectedSocket() client: any, @MessageBody() room: number) {
    const userId = this.validateToken(client.handshake.auth.token);

    let roomN = this.findPlayerRoom(client.id);
    if (!isNaN(roomN)) {
      this.server
        .to(`friendRoom ${roomN}`)
        .emit('friendUnexpectedEnding', userId.sub);
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

  @SubscribeMessage('friendChangeStatus')
  async status(@ConnectedSocket() client: any, @MessageBody() body: any) {
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
  }

  @SubscribeMessage('friendAFK')
  async afk(@ConnectedSocket() client: any, @MessageBody() data: string) {
    const userId = this.validateToken(client.handshake.auth.token);

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

  /*data = {reply : accept ? reject, RoomId: id, } */
  // @SubscribeMessage('ReplyToInvite')
  // reply(@ConnectedSocket() client: any, @MessageBody() data: any) {}
  // accept(){
  // }
  // /* clear the queue and quick the other player of it,  */
  // decline(){
  // }
}
    