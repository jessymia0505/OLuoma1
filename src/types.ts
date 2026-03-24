export type GameStatus = 'idle' | 'playing' | 'lost';

export interface Entity {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  type: 'player' | 'obstacle' | 'coin' | 'powerup';
  color?: string;
  powerupType?: 'shield' | 'speed' | 'coinBoost';
}

export interface GameState {
  distance: number;
  coins: number;
  highScore: number;
  status: GameStatus;
  speed: number;
  shieldActive: boolean;
}
