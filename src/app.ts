import express, { Application, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { Mp3Controller } from './controllers/Mp3Controller';

export class App {
    private app: Application;
    private mp3Controller: Mp3Controller;

    constructor() {
        this.app = express();
        this.mp3Controller = new Mp3Controller();
        this.configureMiddlewares();
        this.configureRoutes();
    }

    private configureMiddlewares(): void {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        const storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, 'uploads/');
            },
            filename: function (req, file, cb) {
                cb(null, file.originalname);
            }
        });

        this.app.use(multer({ storage: storage }).single('mp3File'));
    }

    private configureRoutes(): void {
        this.app.post('/file-upload', this.mp3Controller.analyzeMp3.bind(this.mp3Controller));
        this.app.use((req: Request, res: Response, next: NextFunction) => {
            const error = new Error('Not Found!');
            next(error);
        });
        this.app.use(this.errorHandler.bind(this));
    }

    private errorHandler(error: Error, req: Request, res: Response): void {
        res.status(500).json({ error: error.message });
    }

    public start(port: number): void {
        this.app.listen(port, () => {
            console.log(`Server is listening on port ${port}`);
        });
    }
}
