export type Player = {
  name: string;
  password: string;
  index?: string;
};

export type Room = {
  roomId: string;
  roomUsers: Player[];
};

export type Ship = {
  position: { x: number; y: number };
  direction: boolean;
  length: 1 | 2 | 3 | 4;
  type: "small" | "medium" | "large" | "huge";
};

export type ShipDefinition = {
  type: "small" | "medium" | "large" | "huge";
  length: 1 | 2 | 3 | 4;
};

export type Game = {
  idGame: string;
  idPlayer: string;
  ships?: Ship[];
};

export type Attack = {
  gameId: string;
  x: number;
  y: number;
  indexPlayer: string;
};
