/**
 * A basic error with a title and a message 
 */
class JpxError extends Error {

    /**
     * Create a new error
     * @param title     The error title 
     * @param message   The error message 
     */
    constructor(title?:string, message?:string){
        super(`[jpx.error] ${title} - ${message}`);
    }
}

export { JpxError as Error };