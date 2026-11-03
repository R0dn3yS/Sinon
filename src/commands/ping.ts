import type { Command } from '../types/Command.ts';

const ping: Command = {
  name: 'ping',
  description: 'Check if the bot is online',

  async execute(ctx) {
    await ctx.client.sendTextMessage(ctx.room.roomId, 'Pong!');
  }
}

export default ping;