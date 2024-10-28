export class Room {
  roomId: string;
  players: string[];
  gameStarted: boolean;

  constructor(roomId: string) {
    this.roomId = roomId;
    this.players = [];
    this.gameStarted = false;
  }
}
