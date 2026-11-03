import { MatchInfo } from '@r0dn3ys/mcsr-api';
import { MatrixClient, Room } from 'matrix-js-sdk';
import { getMxcUrl } from './getMxcUrl.ts';
import { miliToMinutes } from './time.ts';
import { sendFormattedHtml } from './sendFormattedHtml.ts';

export async function sendMatchData(client: MatrixClient, room: Room, matchData: MatchInfo) {
  const winnerUuid = matchData.result.uuid;
  const winner = matchData.players[0].uuid === winnerUuid ? matchData.players[0] : matchData.players[1];

  const imageUrl = await getMxcUrl(client, `https://api.mcheads.org/head/${winner.nickname}/256`);

  const html = `<h3><b>${matchData.players[0].nickname} vs ${matchData.players[1].nickname}</b></h3>
    <b>Winner:</b> <img data-mx-emoticon height="16" src="${imageUrl}" alt="${winner.nickname}" title="${winner.nickname}"> ${winner.nickname}<br/>
    <b>Time:</b> ${miliToMinutes(matchData.result.time)}<br/>
    <b>Seed type:</b> ${matchData.seed?.overworld}<br/>
    <b>Nether:</b> ${matchData.seed?.nether}
  `;

  sendFormattedHtml(client, room, html);
};