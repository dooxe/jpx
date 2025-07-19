import { Error as JpxError } from "./Error";

/**
 * A basic kernel class for convolution-based operations
 */
export class Kernel {

    private _data : number[] = [];

    private _width = 0;

    private _height = 0;

    /**
     * 
     * @param w 
     * @param h 
     * @param data 
     * @param normalize 
     */
    constructor(w : number, h : number, data :number[], normalize:boolean = false){
        if(data.length != (w*h)){
            throw new JpxError('Kernel', 'w*h != data.length');
        }
        if (normalize) {
			var
				min = Infinity,
				max = 0
				;
			for (var i = 0; i < data.length; ++i) {
				var d = data[i];
				if (d < min) {
					min = d;
				}
				if (d > max) {
					max = d;
				}
			}
			var N = Math.max(Math.abs(min), Math.abs(max));
			for (var i = 0; i < data.length; ++i) {
				data[i] /= (1e-8 + N);
			}
		}
        this._width = w;
        this._height = h;
        this._data = data;
    }

    /**
     * The kernel width
     */
    get width(){
        return this._width;
    }

    /**
     * The kernel height
     */
    get height(){
        return this._height;
    }

    /**
     * 
     */
    get data(){
        return this._data;
    }

    /**
     * 
     * @param x 
     * @param y 
     * @returns 
     */
    at(x : number , y : number) {
	    return this._data[x + y * this._width];
    }
}