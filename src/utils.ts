
/**
 * 
 * @param object 
 * @param defaultValue 
 * @returns 
 */
export const getDefault = (object, defaultValue) =>{
    if (typeof object === 'undefined') {
        return defaultValue;
    }
    return object;
};