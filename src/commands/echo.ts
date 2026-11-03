import type { Command } from '../types/Command.ts';

const echo: Command = {
  name: "echo",
  description: "Repeat a message",
  aliases: ["say"],
  ownerOnly: true,

  async execute({ client, room, args }) {
    if (args.length === 0) {
      await client.sendTextMessage(room.roomId, "Usage: !echo <message>");
      return;
    }

    await client.sendTextMessage(room.roomId, args.join(" "));
  },
};

export default echo;