import { config } from './config';

/**
 * Decorator to log performance if needed.
 * @returns 
 */
export const logPerformance = () => {
    return (o: any, k: string, t: any) => {
        const method = t.value;
        t.value = function (...args: any[]) {
            const t1 = Date.now();
            const result = method.call(this, ...args);
            const t2 = Date.now();
            if (config.logPerformances) {
                console.log(`[jpx] ${(k + '()').padEnd(25, ' ')} - ${t2 - t1}ms`);
            }
            return result;
        };
    }
};