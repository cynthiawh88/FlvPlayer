import { getNowTime, createWorker, readBuffer, mergeBuffer, calculationRate } from '../utils';
import workerString from './demuxer.worker';

function getProfileString(profileIdc) {
    switch (profileIdc) {
        case 66:
            return 'Baseline';
        case 77:
            return 'Main';
        case 88:
            return 'Extended';
        case 100:
            return 'High';
        case 110:
            return 'High10';
        case 122:
            return 'High422';
        case 244:
            return 'High444';
        default:
            return 'Unknown';
    }
}

function getLevelString(levelIdc) {
    return (levelIdc / 10).toFixed(1);
}

export default class Demuxer {
    constructor(flv) {
        const { options, debug } = flv;
        this.size = 0;
        this.header = null;
        this.streaming = false;
        this.demuxed = false;
        this.videoDataSize = 0;
        this.audioDataSize = 0;
        this.videoDataLength = 0;
        this.audioDataLength = 0;
        this.streamStartTime = 0;
        this.streamEndTime = 0;
        this.scripMeta = null;
        this.AudioSpecificConfig = null;
        this.AVCDecoderConfigurationRecord = null;
        this.demuxWorker = createWorker(workerString);

        const streamRate = calculationRate(rate => {
            debug.log('stream-rate', `${rate} bytes/s`);
        });

        const demuxRate = calculationRate(rate => {
            debug.log('demux-rate', `${rate} p/s`);
        });

        flv.on('destroy', () => {
            this.demuxWorker.terminate();
        });

        flv.on('streamStart', () => {
            this.streamStartTime = getNowTime();
            debug.log('stream-url', options.url);
        });

        flv.on('streaming', uint8 => {
            this.streaming = true;
            this.size += uint8.byteLength;
            streamRate(uint8.byteLength);
            this.demuxWorker.postMessage(uint8);
        });

        flv.on('streamEnd', uint8 => {
            this.streaming = false;
            this.streamEndTime = getNowTime();

            if (uint8) {
                this.index = 0;
                this.size = uint8.byteLength;
                this.demuxWorker.postMessage(uint8);
            }

            debug.log('stream-size', `${this.size} byte`);
            debug.log('stream-time', `${this.streamEndTime - this.streamStartTime} ms`);

            this.demuxed = true;
            flv.emit('demuxDone');
            debug.log('demux-done');
        });

        let sps = new Uint8Array();
        let pps = new Uint8Array();
        this.demuxWorker.onmessage = event => {
            const message = event.data;
            switch (message.type) {
                case 'flvHeader':
                    this.header = message.data;
                    flv.emit('flvHeader', this.header);
                    debug.log('flv-header', this.header);
                    break;
                case 'noAudio':
                    flv.emit('noAudio');
                    debug.log('flv-flags', 'FLV header flags not found audio');
                    break;
                case 'scripMeta':
                    this.scripMeta = message.data;
                    flv.emit('scripMeta', this.scripMeta);
                    debug.log('scrip-meta', this.scripMeta);
                    break;
                case 'AVCDecoderConfigurationRecord':
                    this.AVCDecoderConfigurationRecord = message.data;
                    flv.emit('AVCDecoderConfigurationRecord', this.AVCDecoderConfigurationRecord);
                    debug.log('AVCDecoderConfigurationRecord', this.AVCDecoderConfigurationRecord);
                    debug.log('AVC-profile', getProfileString(this.AVCDecoderConfigurationRecord.AVCProfileIndication));
                    debug.log('AVC-level', getLevelString(this.AVCDecoderConfigurationRecord.AVCLevelIndication));
                    break;
                case 'AudioSpecificConfig':
                    this.AudioSpecificConfig = message.data;
                    flv.emit('AudioSpecificConfig', this.AudioSpecificConfig);
                    debug.log('AudioSpecificConfig', this.AudioSpecificConfig);
                    break;
                case 'videoData': {
                    demuxRate(1);
                    this.videoDataLength += 1;
                    this.videoDataSize += message.data.byteLength;
                    const readNalu = readBuffer(message.data);
                    readNalu(4);
                    const naluType = readNalu(1)[0] & 31;
                    switch (naluType) {
                        case 1:
                        case 5: {
                            flv.emit('videoData', mergeBuffer(sps, pps, message.data), message.timestamp);
                            break;
                        }
                        case 7:
                            sps = message.data;
                            break;
                        case 8:
                            pps = message.data;
                            break;
                        default:
                            break;
                    }
                    break;
                }
                case 'audioData':
                    demuxRate(1);
                    this.audioDataLength += 1;
                    this.audioDataSize += message.data.byteLength;
                    flv.emit('audioData', message.data, message.timestamp);
                    break;
                default:
                    break;
            }
        };
    }
}
