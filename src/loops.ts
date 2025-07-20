import { Image } from "./Image";

export type LoopIndices = {
    /**
     * x-coordinate of the current pixel
     */
    x: number,
    /**
     * y-coordinate of the current pixel
     */
    y: number,
    /**
     * index of the current pixel
     */
    i: number
};

/**
 * Loop on all (x;y) positions
 * @param image The image to be iterated
 * @param forxy The callback
 * @returns The input image for chaining  
 */
export const forXY = (image: Image, forxy: (index: LoopIndices) => void): Image => {
    var p = {
        x: 0,
        y: 0,
        i: 0
    };
    for (var y = 0; y < image.height; ++y) {
        for (var x = 0; x < image.width; ++x) {
            var i = (x + y * image.width) * image.spectrum;
            p.x = x;
            p.y = y;
            p.i = i;
            forxy.call(this, p);
        }
    }
    return image;
}

/**
 * 
 * @param forxy2 
 * @returns The input image for chaining  
 */
export const forXY2 = (image: Image, forxy2: (x: number, y: number, data: number[]) => void): Image => {
    var vector = [0, 0, 0, 0];
    var data = image.data;
    for (var y = 0; y < image.height; ++y) {
        for (var x = 0; x < image.width; ++x) {
            var i = (x + y * image.width) * image.spectrum;
            vector[0] = data[i + 0];
            vector[1] = data[i + 1];
            vector[2] = data[i + 2];
            vector[3] = data[i + 3];
            forxy2.call(null, x, y, vector);
            data[i + 0] = vector[0];
            data[i + 1] = vector[1];
            data[i + 2] = vector[2];
            data[i + 3] = vector[3];
        }
    }
    return image;
}

/**
 * Iterate over the image spectrum.
 * @param image 
 * @param forC 
 * @returns The input image for chaining 
 */
export const forC = (image: Image, forC: (c: number) => void): Image => {
    for (var c = 0; c < image.spectrum; ++c) {
        forC.call(null, c);
    }
    return image;
};

/**
 * Iterate over each value of the data buffer
 * @param image 
 * @param forxyc 
 * @returns The input image for chaining 
 */
export const forXYC = (image: Image, forxyc: (x: number, y: number, c: number) => void): Image => {
    for (var y = 0; y < image.height; ++y) {
        for (var x = 0; x < image.width; ++x) {
            for (var c = 0; c < 4; ++c) {
                forxyc.call(this, x, y, c);
            }
        }
    }
    return image;
}

/**
 * Iterate over positions inside a rectangle
 * @param mx Rectangle x
 * @param my Rectangle y
 * @param Mx Rectangle x + Rectangle width
 * @param My Rectangle y + Rectangle height
 * @param forInXY 
 * @returns 
 */
export const forInXY = (image: Image, mx: number, my: number, Mx: number, My: number, forInXY): Image => {
    for (var y = my; y < My; ++y) {
        for (var x = mx; x < Mx; ++x) {
            forInXY.call(this, x, y);
        }
    }
    return image;
}