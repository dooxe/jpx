import { Image } from "./Image";
import { forXY2 } from "./loops";

const
    GRAY = [0.299, 0.587, 0.114]
    ;

export type SaturationFilterOptions = number | {
    amount: number
};

/**
 * 
 * Change the image saturation (same as Image.saturation).
 * @param image The image to apply the filter on
 * @returns 
 * 
 * @example 
 * 
 * ```ts
 * const myImage = await jpx.Image.load('my/image.png');
 * jpx.filters.saturation(myImage, {
 *      amount : 0.1 // set the saturation to 0.1
 * });
 * ```
 */
export const saturation = (image: Image, options: SaturationFilterOptions = 1): Image => {
    let saturation = options;
    if (typeof saturation !== 'number') {
        saturation = saturation.amount || 1;
    }
    return forXY2(image, function (x, y, data) {
        var p = Math.sqrt(
            Math.pow(data[0], 2) * GRAY[0] +
            Math.pow(data[1], 2) * GRAY[1] +
            Math.pow(data[2], 2) * GRAY[2]
        );
        for (var i = 0; i < 3; ++i) {
            data[i] = p + (data[i] - p) * saturation;
        }
    });
}