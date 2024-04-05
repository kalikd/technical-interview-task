import { Request, Response } from 'express';
import Mp3Service from '../services/Mp3Service';

export class Mp3Controller {
    private mp3Service: Mp3Service;

    constructor() {
        this.mp3Service = new Mp3Service();
    }

    public async analyzeMp3(req: Request, res: Response): Promise<void> {
        try {

            if (!req.file) {
                throw new Error('No file uploaded!');
            }

            const frameCount = await this.mp3Service.countFrames(req.file.path);
            
            res.json({ frameCount });

        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
