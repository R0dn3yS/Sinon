import { ClientEvent, MatrixClient, MatrixEvent, MatrixEventEvent, Room, RoomEvent, SyncState } from 'matrix-js-sdk';
import { CommandHandler } from './handlers/CommandHandler.ts';

export function setupMessageHandler(client: MatrixClient, commandHandler: CommandHandler) {
  let initialSyncComplete = false;

  const processedEvents = new WeakSet<MatrixEvent>();

  client.on(ClientEvent.Sync, (state) => {
    if (state === SyncState.Prepared || state === SyncState.Syncing) {
      initialSyncComplete = true;
    }
  });

  client.on(RoomEvent.Timeline, (event, room, toStartOfTimeline, removed, data) => {
    if (!initialSyncComplete) return;
    if (!room || toStartOfTimeline || removed || !data?.liveEvent) return;

    processedEvents.add(event);

    const process = (decryptedEvent: MatrixEvent, room: Room, commandHandler: CommandHandler) => {
      commandHandler.handleMessage(decryptedEvent, room)
    }

    if (event.getType() === 'm.room.message') {
      process(event, room, commandHandler);
      return;
    }

    if (!event.isEncrypted()) return;

    event.on(MatrixEventEvent.Decrypted, (decryptedEvent, error) => {
      if (error) {
        console.error('Failed to decrypt event:', error);
        return;
      }

      process(decryptedEvent, room, commandHandler);
    });
  });
}