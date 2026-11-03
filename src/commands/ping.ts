import { performance } from 'node:perf_hooks';
import type { Command } from '../types/Command.ts';

const ping: Command = {
  name: 'ping',
  description: 'Check if the bot is online',

  async execute(ctx) {
    let homeserver: string | undefined = undefined;
    if (ctx.args[0]) homeserver = `https://${ctx.args[0]}/`

    const start = performance.now();

    try {
      if (homeserver) {
        const url = new URL(homeserver);

        await fetch(`${url.origin}/_matrix/client/v3/versions`, {
          signal: AbortSignal.timeout(10000),
        });
      } else {
        await ctx.client.getVersions();
      }

      const latency = Math.round(performance.now() - start);

      await ctx.client.sendTextMessage(ctx.room.roomId, `Latency to ${ctx.args[0] ? ctx.args[0] : 'imaretar.de'}: ${latency}ms`)
    } catch (error) {
      console.error('Homeserver ping failed:', error);

      await ctx.client.sendTextMessage(ctx.room.roomId, `Failed to reach ${ctx.args[0]}`);
    }
  }
}

export default ping;