import { McsrClient } from '@r0dn3ys/mcsr-api';
import type { Command } from '../types/Command.ts';
import { sendMatchData } from '../util/sendMatchData.ts';

const match: Command = {
  name: 'latestmatch',
  description: 'Get latest match info from user',

  async execute(ctx) {
    if (ctx.args.length === 0) {
      await ctx.client.sendTextMessage(ctx.room.roomId, 'Specify a user');
      return;
    }

    const mcsrClient = new McsrClient();

    const matchData = (await mcsrClient.getUserMatches(ctx.args[0], { sort: 'newest' }))[0];

    if (!matchData || matchData.forfeited) return;

    sendMatchData(ctx.client, ctx.room, matchData);
  },
};

export default match;