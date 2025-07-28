declare global {
    var Res: typeof import('./response').Response;
    var r: typeof import('./response').Response;
    var next: typeof import('./next').next;
    var Log: typeof import('@gaman/common/utils/logger').Logger;
    var Logger: typeof import('@gaman/common/utils/logger').Logger;
    namespace NodeJS {
        interface ProcessEnv extends Gaman.Env {
        }
    }
    namespace Gaman {
        interface Locals {
        }
        interface Env {
            NODE_ENV?: 'development' | 'production';
            PORT?: string;
            GAMAN_KEY?: string;
        }
        interface Context {
        }
    }
}
export {};
