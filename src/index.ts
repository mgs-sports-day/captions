import * as recorder from 'node-record-lpcm16';
import * as speech from '@google-cloud/speech';
import * as protos from '@google-cloud/speech/build/protos/protos';
import * as admin from 'firebase-admin';
import {sentences} from 'sbd';
import uploadText from './uploadQueue';

admin.initializeApp();
const client = new speech.SpeechClient();

const sampleRateHertz = 16000;
const request = {
    config: {
        encoding: 'LINEAR16',
        sampleRateHertz,
        languageCode: 'en-GB',
        profanityFilter: true,
    },
    interimResults: true,
} as protos.google.cloud.speech.v1.IStreamingRecognitionConfig;

const recordingStream = recorder
    .record({
        sampleRateHertz,
        threshold: 0,
        verbose: false,
        recorder: 'rec',
        silence: '10.0',
    })
    .stream()
    .on('error', console.error);

function init(): Promise<void> {
    return new Promise((resolve) => {
        const recognitionStream = client
            .streamingRecognize(request)
            .on('error', console.error)
            .on('data', data => {
                const result = data.results[0];
                const transcript = result.alternatives[0]?.transcript;

                if (!transcript) {
                    console.log("END REACHED!!");
                    recognitionStream.destroy();
                    resolve();
                } else {
                    const sentenceBoundaries = sentences(transcript);
                    const formattedSentences = sentenceBoundaries.map(e => {
                        return e[0].toUpperCase() + e.slice(1);
                    });

                    const caption = formattedSentences.join('. ');
                    console.log(caption);
                    uploadText(caption);
                }
            });

        recordingStream.pipe(recognitionStream);
    });
}

async function run() {
    while (true) {
        await init();
    }
}

run();
console.log("Recognition is running.");
