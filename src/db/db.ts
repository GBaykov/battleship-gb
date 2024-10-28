import { Game } from "../classes/games";
import { Player } from "../classes/player";
import { Room } from "../classes/room";

export const rooms = new Map<string, Room>();
export const players = new Map<string, Player>();
export const games = new Map<string, Game>();
