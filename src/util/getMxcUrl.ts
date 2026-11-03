import { MatrixClient } from 'matrix-js-sdk';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

export async function getMxcUrl(client: MatrixClient, imageUrl: string) {
  if (!existsSync('./mxc.json')) {
    writeFileSync('./mxc.json', JSON.stringify({}), 'utf-8');
  }

  const mxcDb = JSON.parse(readFileSync('./mxc.json', 'utf-8'));

  const imageResponse = await fetch(imageUrl);

  const image = await imageResponse.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-1', image);
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  const hexString = convertToHexString(hashArray);
  
  if (mxcDb[hexString]) {
    console.log('Got from cache!');
    return mxcDb[hexString];
  } else {
    console.log('Uploading!');
    const imageUrl = await client.uploadContent(image);

    mxcDb[hexString] = imageUrl.content_uri;

    writeFileSync('./mxc.json', JSON.stringify(mxcDb), 'utf-8');

    return imageUrl.content_uri;
  }
}

function convertToHexString(hashArray: number[]) {
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}