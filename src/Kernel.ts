/**
 * 
 */
export class Kernel {

    public data : number[] = [];

    public width = 0;

    public height = 0;

    /**
     * 
     * @param w 
     * @param h 
     * @param data 
     * @param normalize 
     */
    constructor(w : number, h : number, data :number[], normalize:boolean = false){
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
        this.width = w;
        this.height = h;
        this.data = data;
    }

    /**
     * 
     * @param x 
     * @param y 
     * @returns 
     */
    at(x : number , y : number) {
	    return this.data[x + y * this.width];
    }
}