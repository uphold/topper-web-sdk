export type Handler<T = any, R = any> = (data?: T) => Promise<R> | R;
