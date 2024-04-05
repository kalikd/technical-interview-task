import * as fs from 'fs';

export default class Mp3Service {
    private readonly bitrates = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0];
    private readonly samplingRates = [44100, 48000, 32000, 0];

    public countFrames(filePath: string): Promise<number> {
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, (err, data) => {
                if (err) reject(err);

                let frameCount = 0;
                let index = 0;

                while (index < data.length) {
                    if (data[index] === 0xFF && (data[index + 1] & 0xE0) === 0xE0) {
                        const version = (data[index + 1] & 0x18) >> 3;
                        const layer = (data[index + 1] & 0x06) >> 1;

                        if (version === 3 && layer === 1) {
                            const header = data.slice(index, index + 4);
                            const { bitrate, samplingRate, padding } = this.parseFrameHeader(header);

                            if (bitrate === 0 || samplingRate === 0) {
                                reject(new Error('Invalid bitrate or sampling rate.'));
                                return;
                            }

                            const frameLength = Math.floor((144 * bitrate) / samplingRate) + padding;
                            index += frameLength;
                            frameCount++;
                        } else {
                            index++;
                        }
                    } else {
                        index++;
                    }
                }

                resolve(frameCount);
            });
        });
    }

    private parseFrameHeader(header: Buffer): { bitrate: number; samplingRate: number; padding: number } {
        const bitrateIndex = (header[2] >> 4) & 0x0F;
        const samplingRateIndex = (header[2] >> 2) & 0x03;
        const padding = (header[2] >> 1) & 0x01;

        const bitrate = this.bitrates[bitrateIndex] * 1000;
        const samplingRate = this.samplingRates[samplingRateIndex];

        return { bitrate, samplingRate, padding };
    }
}

// <<<<<< What further improvements can be done? >>>>>>
// 1. Avoid loading of entire file: Instead of loading a complete file we can stream the file using fs.createReadStream to read in chunks, this will reduce memory usage and will not take that much time as loading entire file takes time.
// 2. Avoid byte-by-byte processing: After finding a frame, calculate its length and jump to the next frame position instead of inspecting every single byte.
