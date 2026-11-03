import { readdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

import type { MatrixClient, MatrixEvent, Room } from 'matrix-js-sdk';
import type { Command, CommandContext } from '../types/Command.ts';

export class CommandHandler {
  private commands = new Map<string, Command>();

  constructor(private client: MatrixClient, private prefix = '!') {}

  async loadCommands(): Promise<void> {
    const commandsDir = fileURLToPath(new URL('../commands/', import.meta.url));
    const files = await readdir(commandsDir);

    for (const file of files) {
      if (!file.endsWith('.ts')) {
        continue;
      }

      const fileUrl = pathToFileURL(path.join(commandsDir, file));
      const module = await import(fileUrl.href);

      const command = module.default as Command;

      if (!command?.name || typeof command.execute !== 'function') {
        console.warn(`Skipping invalid command: ${file}`);
        continue;
      }

      this.register(command);

      console.log(`Loaded command: ${command.name}`);
    }
  }

  register(command: Command) {
    this.commands.set(command.name.toLowerCase(), command);

    for (const alias of command.aliases ?? []) {
      this.commands.set(alias.toLowerCase(), command);
    }
  }

  async handleMessage(event: MatrixEvent, room: Room): Promise<void> {
    if (event.getType() !== 'm.room.message') return;

    const content = event.getContent();
    const body = content.body;

    if (typeof body !== 'string') return;
    if (!body.startsWith(this.prefix)) return;
    if (event.getSender() === this.client.getUserId()) return;

    const input = body.slice(this.prefix.length).trim();
    if (!input) return;

    const [name, ...args] = input.split(/\s+/);
    const command = this.commands.get(name.toLowerCase());

    if (!command) return;

    const context: CommandContext = {
      client: this.client,
      event,
      room,
      args,
      prefix: this.prefix,
    };

    try {
      await command.execute(context);
    } catch (error) {
      console.error(`Error executing command "${name}":`, error);
    }
  }

  getCommands(): Command[] {
    return [...new Set(this.commands.values())];
  }
}