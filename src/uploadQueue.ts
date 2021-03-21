import * as admin from 'firebase-admin';
import {promise} from 'fastq';

const queue = promise(worker, 1);

async function worker(value: string) {
    await admin.firestore()
        .collection('sd_captions')
        .doc('latest')
        .set({
            t: value,
        });
}

export default function uploadText(value: string) {
    queue.push(value).then(() => {});
}
