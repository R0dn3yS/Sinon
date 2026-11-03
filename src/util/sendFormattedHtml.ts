import { MatrixClient, Room } from 'matrix-js-sdk';

export function sendFormattedHtml(client: MatrixClient, room: Room, html: string) {
  const body = html.replace(/<[^>]*>/g, '');
  html = html.replace('\n', '<br/>');

  client.sendHtmlMessage(room.roomId, body, html);
}