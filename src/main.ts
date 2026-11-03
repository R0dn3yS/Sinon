import { ClientEvent, createClient } from 'matrix-js-sdk';
import { setupIndexedDB } from './setup-indexeddb.ts';
import { config } from 'dotenv';
import { setupVerification } from './verification.ts';
import { setupMessageHandler } from './message.ts';
import { CommandHandler } from './handlers/CommandHandler.ts';

config();

const homeserver = process.env.MATRIX_HOMESERVER!;
const userId = process.env.MATRIX_USER_ID!;
const accessToken = process.env.MATRIX_ACCESS_TOKEN!;
const deviceId = process.env.MATRIX_DEVICE_ID!;
const cryptoPassword = process.env.MATRIX_CRYPTO_PASSWORD!;
const prefix = process.env.PREFIX!;

await setupIndexedDB();

const client = createClient({
  baseUrl: homeserver,
  userId,
  accessToken,
  deviceId,

  logger: {
    trace: () => {},
    debug: () => {},
    info: () => {},
    warn: (...args) => console.warn("[Matrix]", ...args),
    error: (...args) => console.error("[Matrix]", ...args),
    getChild() {
      return this;
    },
  },
});

console.log('Initializing Matrix Rust Crypto...');

await client.initRustCrypto({
  useIndexedDB: true,
  storagePassword: cryptoPassword,
});

setupVerification(client);

const commandHandler = new CommandHandler(client, prefix);
await commandHandler.loadCommands();

setupMessageHandler(client, commandHandler);

client.on(ClientEvent.Sync, (state) => {
  if (state === 'PREPARED') {
    console.log('Bot is ready!');
  }
});

console.log('Starting Matrix Sync...');

await client.startClient({
  initialSyncLimit: 10,
});

process.on("SIGINT", () => {
  console.log("Stopping Matrix bot...");
  client.stopClient();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("Stopping Matrix bot...");
  client.stopClient();
  process.exit(0);
});