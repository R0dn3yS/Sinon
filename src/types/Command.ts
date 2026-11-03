import type { MatrixClient, MatrixEvent, Room } from 'matrix-js-sdk';

export interface CommandContext {
  client: MatrixClient;
  event: MatrixEvent;
  room: Room;
  args: string[];
  prefix: string;
}

export interface Command {
  name: string;
  aliases?: string[];
  description?: string;

  execute(ctx: CommandContext): Promise<void>;
}