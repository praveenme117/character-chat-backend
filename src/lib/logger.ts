export interface Logger {
    info(message: string, meta?: any): void;
    error(message: string, error?: any): void;
    warn(message: string, meta?: any): void;
    debug(message: string, meta?: any): void;
  }
  
  class ConsoleLogger implements Logger {
    info(message: string, meta?: any) {
      console.log(`[INFO] ${message}`, meta ? JSON.stringify(meta) : '');
    }
    error(message: string, error?: any) {
      console.error(`[ERROR] ${message}`, error);
    }
    warn(message: string, meta?: any) {
      console.warn(`[WARN] ${message}`, meta ? JSON.stringify(meta) : '');
    }
    debug(message: string, meta?: any) {
      console.debug(`[DEBUG] ${message}`, meta ? JSON.stringify(meta) : '');
    }
  }
  
  export const logger: Logger = new ConsoleLogger();
  