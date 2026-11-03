import { ClientEvent, MatrixClient, MatrixEvent, MatrixEventEvent, Room, RoomEvent, SyncState } from 'matrix-js-sdk';

export function setupMessageHandler(client: MatrixClient) {
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

    const process = (decryptedEvent: MatrixEvent, room: Room, client: MatrixClient) => {
      if (!processedEvents.has(event)) return;

      if (decryptedEvent.getType() !== 'm.room.message') return;
      if (decryptedEvent.getSender() === client.getUserId()) return;

      const content = decryptedEvent.getContent();

      if (content.body === '!ping') {
        client.sendTextMessage(room.roomId, 'Pong!');
      }
    }

    if (event.getType() === 'm.room.message') {
      process(event, room, client);
      return;
    }

    if (!event.isEncrypted()) return;

    event.on(MatrixEventEvent.Decrypted, (decryptedEvent, error) => {
      if (error) {
        console.error('Failed to decrypt event:', error);
        return;
      }

      process(decryptedEvent, room, client);
    });
  });
}