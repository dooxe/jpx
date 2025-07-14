
/**
 * 
 */
export class JpxError extends Error {

    /**
     * 
     * @param message 
     */
    constructor(title?:string, message?:string){
        super(`[jpx.error] ${title} - ${message}`);
    }
}