import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { CryptoEvent, VerificationPhase, VerificationRequest, VerificationRequestEvent, Verifier, VerifierEvent } from 'matrix-js-sdk/lib/crypto-api/index.js';
import { MatrixClient } from 'matrix-js-sdk';

const rl = createInterface({
  input: stdin,
  output: stdout,
});

function waitForVerifier(request: VerificationRequest): Promise<Verifier> {
  return new Promise((resolve, reject) => {
    const onChange = () => {
      if (request.verifier) {
        request.off(VerificationRequestEvent.Change, onChange);
        resolve(request.verifier);
        return;
      }

      if (request.phase === VerificationPhase.Cancelled) {
        request.off(VerificationRequestEvent.Change, onChange);
        reject(new Error('Verification cancelled'));
      }
    }

    request.on(VerificationRequestEvent.Change, onChange);
    onChange();
  });
}

async function handleVerification(request: VerificationRequest): Promise<void> {
  const userId = request.otherUserId;

  console.log(`Verification request from ${userId}`);

  try {
    await request.accept();

    console.log('Accepted verification request.');

    const verifier = await waitForVerifier(request);

    verifier.on(VerifierEvent.ShowSas, async (data) => {
      const { sas, confirm, mismatch, cancel } = data;

      console.log("\n================================");
      console.log(`Verification with ${userId}`);
      console.log("================================");

      if (!sas.emoji) {
        console.log('Emoji verification was not negotiated.');
        cancel();
        return;
      }

      console.log('\nCompare these emojis\n');

      for (const item of sas.emoji) {
        console.log(`${item[0]} ${item[1]}`);
      }

      console.log("\n================================");

      const answer = await rl.question('Do all seven emoji match? [y/N]');

      if (answer.trim().toLowerCase() === 'y') {
        await confirm();
        console.log('You confirmed the SAS.');
      } else {
        mismatch();
        console.log('Verification rejected.');
      }
    });

    await verifier.verify();

    console.log(`Successfully verified ${userId}`);
  } catch (error) {
    console.error('Verification failed:', error);
  }
}

export function setupVerification(client: MatrixClient) {
  client.on(CryptoEvent.VerificationRequestReceived, (request: VerificationRequest) => {
    void handleVerification(request);
  });

  console.log('Emoji verification handler initialized.');
}