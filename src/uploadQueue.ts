import * as admin from 'firebase-admin';
import {promise} from 'fastq';

const queue = promise(worker, 1);

async function worker(value: string) {
    await admin.firestore()
        .collection('sd_captions')
        .doc()
        .set({
            // text to Review
            t: value,
            // time Created at
            c: admin.firestore.Timestamp.now(),
        });
}

const deletionQueue = promise(deletionWorker, 1);
async function deletionWorker(_: any) {
    const oldCaptions = await admin.firestore()
        .collection('sd_captions')
        .orderBy('c', 'asc')
        .limit(5).get();
    if (oldCaptions.size !== 5) return;

    await oldCaptions.docs[0].ref.delete();
}

export default function uploadText(value: string) {
    queue.push(value).then(() => {});
    deletionQueue.push(undefined).then(() => {})
}
