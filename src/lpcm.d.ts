declare module 'node-record-lpcm16' {
    import {Stream} from 'stream';

    export interface RecordOptions {
        sampleRateHertz: number;

        threshold: number;
        thresholdStart: number;
        thresholdEnd: number;

        verbose: boolean;
        recorder: string;
        silence: string;
        device: string;
        audioType: 'wav';
    }
    export function record(options: Partial<RecordOptions>): Recorder;

    export interface Recorder {
        stream(): Stream
    }
}
