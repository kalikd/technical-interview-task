import * as fs from 'fs';

export default class Mp3Service {
    private readonly bitrates = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0];
    private readonly samplingRates = [44100, 48000, 32000, 0];

    public countFrames(filePath: string): Promise<number> {
        return new Promise((resolve, reject) => {
            const stream = fs.createReadStream(filePath, { highWaterMark: 1024 * 1024 });
            let frameCount = 0;
            let leftover = Buffer.alloc(0);
    
            stream.on('data', (chunk: Buffer) => {
                let data = Buffer.concat([leftover, chunk]);
                let index = 0;
    
                while (index + 4 <= data.length) { 
                    if (data[index] === 0xFF && (data[index + 1] & 0xE0) === 0xE0) {
                       
                        const version = (data[index + 1] & 0x18) >> 3;
                        const layer = (data[index + 1] & 0x06) >> 1;
    
                        if (version === 3 && layer === 1) {
                            if (index + 4 > data.length) {
                                break;
                            }
    
                            const header = data.slice(index, index + 4);
                            const { bitrate, samplingRate, padding } = this.parseFrameHeader(header);
    
                            if (bitrate === 0 || samplingRate === 0) {
                                reject(new Error('Invalid bitrate or sampling rate.'));
                                return;
                            }
    
                            const frameLength = Math.floor((144 * bitrate) / samplingRate) + padding;
    
                            if (index + frameLength > data.length) {
                                break;
                            }
    
                            index += frameLength; 
                            frameCount++;
                        } else {
                            index++;
                        }
                    } else {
                        index++;
                    }
                }
    
                leftover = data.slice(index);
            });
    
            stream.on('end', () => {
                resolve(frameCount);
            });
    
            stream.on('error', (err) => {
                reject(err);
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
