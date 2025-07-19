import { Error as JpxError } from "./Error";
import { Kernel } from "./Kernel";

const
    GRAY = [0.299, 0.587, 0.114],
    SEPIA = [0.799, 0.387, 0.114],
    BLOOM_KERNEL = new Kernel(3, 3, [1, 1, 1, 1, 1, 1, 1, 1, 1], true),
    SHARPEN_KERNEL = new Kernel(3, 3, [1, 1, 1, 1, 1, 1, 1, 1, 1], true)
    ;

var canvas = document.createElement('canvas');
var context = canvas.getContext('2d');
var plugins = [];
var PixelArray = Array;

var createDataFromCanvas = function (w: number, h: number) {
    canvas.width = w;
    canvas.height = h;
    if (!context) {
        throw new Error("No context!");
    }
    var img = context.getImageData(0, 0, w, h);
    return img.data;
};

/**
 * @group jpx
 */
export class Image {

    imageBase: any = null;

    loaded: boolean = false;

    private _width: number = 1;

    private _height: number = 1;

    private _spectrum: number = 1;

    private _length: number = 1;

    private _data: number[] = [];

    /**
     * 
     * @param width 
     * @param height 
     * @param spectrum 
     */
    constructor(
        width: number = 1,
        height: number = 1,
        spectrum: number = 1
    ) {
        this.create(width, height, spectrum);
    }

    //#MARK: getters

    /**
     * The image width
     */
    get width() {
        return this._width;
    }

    /**
     * The image height
     */
    get height() {
        return this._height;
    }

    /**
     * The image spectrum
     */
    get spectrum() {
        return this._spectrum;
    }

    /**
     * The image data buffer length
     */
    get length() {
        return this._length;
    }

    /**
     * The data buffer
     */
    get data() {
        return this._data;
    }

    //#MARK: Ops

    /**
     * (Re)Create the image given its dimension
     * @param w 
     * @param h 
     * @param s 
     * @returns this
     */
    create(w: number = 1, h: number = 1, s: number = 1): Image {
        this._width = w;
        this._height = h;
        this._spectrum = s;
        this._length = w * h * s;
        if (this.spectrum === 4) {
            const canvasData = createDataFromCanvas(w, h);
            this._data = [...canvasData];
        }
        else {
            this._data = new PixelArray(this.length);
        }
        return this.fill(0);
    }

    /**
     * Load an image from the given source file
     * @param src
     * @returns 
     */
    async load(src: string): Promise<Image> {
        return new Promise<Image>((resolve) => {
            var self = this;
            var image = document.createElement('img');
            image.onload = function () {
                var w = image.width;
                var h = image.height;
                canvas.width = w;
                canvas.height = h;
                if (context) {
                    context.drawImage(image, 0, 0);
                    var data = context.getImageData(0, 0, w, h).data;
                    self._data = new Array(data.length);
                    for (var i = 0; i < data.length; ++i) {
                        self._data[i] = data[i];
                    }
                    self._width = w;
                    self._height = h;
                    self._spectrum = 4;
                    self.loaded = true;
                    resolve(self);
                }
            };
            image.src = src;
            this.imageBase = image;
        });
    }

    /**
     * 
     * @returns 
     */
    clone(): Image {
        var clone = new Image(this.width, this.height, this.spectrum);
        clone.imageBase = this.imageBase;
        return clone.copy(this);
    }

    /**
     * 
     * @param image 
     * @returns 
     */
    copy(image: Image): Image {
        if (!image._data || !this._data) {
            throw new JpxError();
        }
        if (image._data.length !== this._data.length) {
            throw new JpxError('Image.copy', 'images must have the same dimension');
        }
        for (var i = 0, v = 0; i < image._data.length; ++i, v = image._data[i]) {
            this._data[i] = v;
        }
        return this;
    }

    /**
     * 
     * @param x 
     * @param y 
     * @param c 
     * @returns 
     */
    index(x: number, y: number = 0, c: number = 0) {
        return (x + y * this.width) * this.spectrum + c;
    }

    /**
     * 
     * @param w 
     * @param h 
     * @returns 
     */
    resize(w: number, h: number) {
        w = Math.floor(w);
        h = Math.floor(h);
        var pixels = new Array(this.length);
        for (var i = 0; i < this.length; ++i) {
            pixels[i] = this._data[i];
        }

        var W = this.width;
        var H = this.height;
        this._width = w;
        this._height = h;
        this._data = new Array(w * h * this.spectrum);

        for (var p = { x: 0, y: 0 }; p.y < this.height; ++p.y)
            for (p.x = 0; p.x < this.width; ++p.x) {
                var
                    x = p.x,
                    y = p.y,
                    i = this.index(x, y),
                    ox = Math.round(x * W / w),
                    oy = Math.round(y * H / h),
                    oi = (ox + oy * W) * this.spectrum
                    ;
                for (var c = 0; c < this.spectrum; ++c) {
                    this._data[i + c] = pixels[oi + c];
                }
            }
        return this;
    }

    /**
     * 
     * @param x 
     * @param y 
     * @param w 
     * @param h 
     * @returns 
     */
    crop(x: number, y: number, w: number, h: number) {
        var data = new Array(w * h * this.spectrum);
        this.forInXY(x, y, x + w, y + h, function (p) {
            var ni = ((p.x - x) + (p.y - y) * w) * this.spectrum;
            for (var c = 0; c < this.spectrum; ++c) {
                data[ni + c] = this.data[p.i + c];
            }
        });
        this._data = data;
        this._width = w;
        this._height = h;
        return this;
    }

    /**
     * 
     * @param x1 
     * @param y1 
     * @param x2 
     * @param y2 
     * @returns 
     */
    crop2(x1: number, y1: number, x2: number, y2: number) {
        var x = Math.min(x1, x2);
        var y = Math.min(y1, y2);
        var w = Math.abs(x2 - x1);
        var h = Math.abs(y2 - y1);
        return this.crop(x, y, w, h);
    }

    /**
     * 
     * @param data 
     * @returns 
     */
    fill(data: number | number[]) {
        if (typeof data === 'number') {
            data = [data];
        }
        return this.forXY(function (p) {
            for (var c = 0; c < this.spectrum; ++c) {
                this.data[p.i + c] = data[c % data.length];
            }
        });
    }

    /**
     * 
     * @returns 
     */
    toDataURL(): string {
        canvas.width = this.width;
        canvas.height = this.height;
        if (context) {
            context.putImageData(this.getImageData(), 0, 0);
        }
        return canvas.toDataURL();
    }

    /**
     * 
     * @returns 
     */
    getImageData() {
        if (!context) {
            throw new JpxError();
        }
        var imageData = context.createImageData(this.width, this.height);
        var pixels = imageData.data;
        for (var p = { x: 0, y: 0 }; p.y < this.height; ++p.y)
            for (p.x = 0; p.x < this.width; ++p.x) {
                var i = (p.x + p.y * this.width);
                for (var c = 0; c < this.spectrum; ++c) {
                    pixels[i * 4 + c] = this._data[i * this.spectrum + c];
                }
                pixels[i * 4 + 3] = 255;
            }
        return imageData;
    }

    /**
     * 
     * @returns 
     */
    getHTMLImage(): HTMLImageElement {
        const image = document.createElement('img');
        image.src = this.toDataURL();
        return image;
    }

    /**
     * @param canvas The HTMLCanvasElement, or its id.
     * @returns 
     */
    output(canvas: string | HTMLCanvasElement) {
        if (typeof canvas === 'string') {
            const c = document.getElementById(canvas);
            if (c && c instanceof HTMLCanvasElement) {
                canvas = c;;
            }
        }
        if (canvas instanceof HTMLCanvasElement) {
            canvas.width = this.width;
            canvas.height = this.height;
            var ctx = canvas.getContext('2d');
            if (ctx) {
                var data = this.getImageData();
                ctx.putImageData(data, 0, 0);
            }
        }
        else {
            throw new JpxError('output', 'Given canvas must not be null.');
        }
        return this;
    }

    /**
     * 
     * @param forxy 
     * @returns 
     */
    forXY(forxy): Image {
        var p = {
            x: 0,
            y: 0,
            i: 0
        };
        var data = this._data;
        for (var y = 0; y < this.height; ++y) {
            for (var x = 0; x < this.width; ++x) {
                var i = (x + y * this.width) * this.spectrum;
                p.x = x;
                p.y = y;
                p.i = i;
                forxy.call(this, p);
            }
        }
        return this;
    }

    /**
     * 
     * @param forxy2 
     * @returns 
     */
    forXY2(forxy2: (x: number, y: number, data: number[]) => void): Image {
        var vector = [0, 0, 0, 0];
        var data = this._data;
        for (var y = 0; y < this.height; ++y) {
            for (var x = 0; x < this.width; ++x) {
                var i = (x + y * this.width) * 4;
                vector[0] = data[i + 0];
                vector[1] = data[i + 1];
                vector[2] = data[i + 2];
                vector[3] = data[i + 3];
                forxy2.call(this, x, y, vector);
                data[i + 0] = vector[0];
                data[i + 1] = vector[1];
                data[i + 2] = vector[2];
                data[i + 3] = vector[3];
            }
        }
        return this;
    }

    /**
     * 
     */
    forInXY(mx, my, Mx, My, forInXY): Image {
        for (var y = my; y < My; ++y) {
            for (var x = mx; x < Mx; ++x) {
                forInXY.call(this, x, y);
            }
        }
        return this;
    }

    /**
     * 
     */
    forXYC(forxyc): Image {
        for (var y = 0; y < this.height; ++y) {
            for (var x = 0; x < this.width; ++x) {
                for (var c = 0; c < 4; ++c) {
                    forxyc.call(this, x, y, c);
                }
            }
        }
        return this;
    }

    /**
     * 
     */
    forC(forC): Image {
        if (!forC) return this;
        for (var c = 0; c < this.spectrum; ++c) {
            forC.call(this, c);
        }
        return this;
    }

    /**
     * 
     */
    getHistogram(length) {
        var H = new Array(this.spectrum);
        for (var c = 0; c < this.spectrum; ++c) {
            H[c] = new Array(length);
        }
        for (var p = { x: 0, y: 0, c: 0, index: 0, data: [] }; p.y < this.height; ++p.y) {
            for (p.x = 0; p.x < this.width; ++p.x) {
                for (p.c = 0; p.c < this.spectrum; ++p.c) {
                    p.index = (p.x + p.y * this.width) * this.spectrum + p.c;
                    H[p.c][Math.floor(this._data[p.index])]++;
                }
            }
        }
    }

    /**
     * 
     */
    convolve(kernel: Kernel): Image {
        var r = Math.floor(kernel.width / 2);
        return this.forXY2(function (x, y, data) {
            data[0] = 0;
            data[1] = 0;
            data[2] = 0;
            var wsum = 1e-8;
            for (var dy = -r; dy <= r; ++dy) {
                for (var dx = -r; dx <= r; ++dx) {
                    var rx = x + dx;
                    var ry = y + dy;
                    if (rx >= 0 && rx < this.width && ry >= 0 && ry < this.height) {
                        var ki = (dx + r) + (dy + r) * kernel.width;
                        var w = kernel.data[ki];
                        var i = (rx + ry * this.width) * 4;
                        data[0] += w * this._data[i + 0];
                        data[1] += w * this._data[i + 1];
                        data[2] += w * this._data[i + 2];
                        wsum += w;
                    }
                }
            }
            if (wsum > 0) {
                data[0] /= wsum;
                data[1] /= wsum;
                data[2] /= wsum;
            }
        });
    }

    /**
     * 
     * @param filter 
     * @param n 
     * @param params 
     * @returns 
     */
    repeat(filter, n, params) {
        for (var i = 0; i < n; ++i) {
            this[filter](params);
        }
        return this;
    }

    /**
     * 
     * @param filters 
     * @returns 
     */
    applyFilters(filters) {
        for (var filterName in filters) {
            this[filterName](filters[filterName]);
        }
        return this;
    }

    /**
     * 
     */
    dispose() {
        this._data = [];
        this.imageBase = null;
    }

    //#MARK: Maths 

    add(other) {
        var self = this;
        if (typeof other === 'number') {
            self._data.forEach(function (d, i) { self._data[i] += other; });
            return this;
        }
        self._data.forEach(function (d, i) { self._data[i] += other._data[i]; });
        return self;
    }


    sub(other) {
        var self = this;
        if (typeof other === 'number') {
            return self.add(-other);
        }
        self._data.forEach(function (d, i) { self._data[i] -= other._data[i]; });
        return self;
    }


    mul(other) {
        var self = this;
        if (typeof other === 'number') {
            self._data.forEach(function (d, i) { self._data[i] *= other; });
            return this;
        }
        self._data.forEach(function (d, i) { self._data[i] *= other._data[i]; });
        return self;
    }

    //#MARK: Filters

    negative(max = 255) {
        return this.forXY2(function (x, y, data) {
            for (var i = 0; i < 3; ++i) {
                data[i] = max - data[i];
            }
        });
    }

    /**
     * 
     * @param params 
     * @returns 
     */
    desaturate(params?: any) {
        params = ((typeof params === 'undefined') ? {} : params);
        var m = ((typeof params.method === 'undefined') ? "mean" : params.method);
        switch (m) {
            case "mean": {
                return this.forXY2(function (x, y, data) {
                    var g = 0;
                    for (var i = 0; i < 3; ++i) g += data[i] / 3;
                    for (var i = 0; i < 3; ++i) data[i] = g;
                });
            }
            case "luminance": {
                return this.forXY2(function (x, y, data) {
                    var g = 0;
                    for (var i = 0; i < 3; ++i) g += (GRAY[i] * data[i]);
                    for (var i = 0; i < 3; ++i) data[i] = g;
                });
            }
            default:
                {
                    throw new JpxError('desaturate', 'No method "' + m + '" for desaturation');
                }
        }
        return this;
    }


    pixelate(p: number | { pixelSize: number } = 5) {
        if (typeof p !== 'number') {
            p = p.pixelSize || 5;
        }
        var $data: number[] = [];
        for (var i = 0; i < this._data.length; ++i) {
            $data[i] = this._data[i];
        }
        return this.forXY2(function (x, y, data) {
            var xx = p * Math.floor((0.5 + x + p / 2) / p);
            var yy = p * Math.floor((0.5 + y + p / 2) / p);
            var ii = (xx + yy * this.width) * 4;
            for (var c = 0; c < 3; ++c) {
                data[c] = $data[ii + c];
            }
        });
    }


    sepia() {
        return this.desaturate().forXY2(function (x, y, data) {
            for (var i = 0; i < 3; ++i) {
                var v = data[i];
                data[i] = SEPIA[i] * data[i];
                data[i] += 0.5 * v;
            }
        });
    }


    brightnessContrast(properties) {
        properties = ((typeof properties === 'undefined') ? {} : properties);
        var C = ((typeof properties.contrast === 'undefined') ? 0 : properties.contrast);
        var B = ((typeof properties.brightness === 'undefined') ? 0 : properties.brightness);
        return this.forXY2(function (x, y, data) {
            for (var i = 0; i < 3; ++i) {
                data[i] = (B * 255) + (1 + C) * data[i];
            }
        });
    }


    /**
     * Lighten the image by a specific factor
     * @param factor The lightening factor
     * @returns this
     */
    lighten(factor: number = 0.1): Image {
        return this.forXY2((x: number, y: number, data) => {
            for (var i = 0; i < 3; ++i) {
                data[i] = (1 + factor) * data[i];
            }
        });
    }

    /**
     * Histogram equalization
     * @returns 
     */
    equalize() {
        var Imin = { r: 255, g: 255, b: 255 };
        var Imax = { r: 0, g: 0, b: 0 };
        return this
            .forXY2(function (x: number, y: number, data: number[]) {
                var r = data[0];
                var g = data[1];
                var b = data[2];
                if (Imin.r > r) Imin.r = r;
                if (Imin.g > g) Imin.g = g;
                if (Imin.b > b) Imin.b = b;
                if (Imax.r < r) Imax.r = r;
                if (Imax.g < g) Imax.g = g;
                if (Imax.b < b) Imax.b = b;
            })
            .forXY2(function (x: number, y: number, data: number[]) {
                data[0] = (255 / (Imax.r - Imin.r)) * (data[0] - Imin.r);
                data[1] = (255 / (Imax.g - Imin.g)) * (data[1] - Imin.g);
                data[2] = (255 / (Imax.b - Imin.b)) * (data[2] - Imin.b);
            });
    }

    /**
     * Change the image saturation
     * @param p 
     * @returns 
     */
    saturation(p: number | { amount: number } = 1): Image {
        var saturation = p;
        if (typeof saturation !== 'number') {
            saturation = saturation.amount || 1;
            if (saturation.amount === 0) {
                saturation = 0;
            }
        }
        return this.forXY2(function (x, y, data) {
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

    selectiveSaturation(p) {
        var saturation = (typeof p.saturation === 'undefined') ? 1 : p.saturation;
        var filter = [
            ((typeof p.r === 'undefined') ? 1 : p.r),
            ((typeof p.g === 'undefined') ? 1 : p.g),
            ((typeof p.b === 'undefined') ? 1 : p.b)
        ];
        if (p.amount === 0) {
            saturation = 0;
        }
        return this.forXY2(function (x: number, y: number, data: number[]) {
            var p = Math.sqrt(
                Math.pow(data[0], 2) * GRAY[0] +
                Math.pow(data[1], 2) * GRAY[1] +
                Math.pow(data[2], 2) * GRAY[2]
            );
            for (var i = 0; i < 3; ++i) {
                var val = data[i];
                var w = data[i] / 255;
                data[i] = (w * val) + (1 - saturation / 2) * (p + (data[i] - p) * saturation);
            }
        });
    }


    colorAdjust(rgb: number[] | { r: number, g: number, b: number }) {
        if (!Array.isArray(rgb)) {
            rgb = [rgb.r, rgb.g, rgb.b];
        }
        return this.forXY2(function (x: number, y: number, data: number[]) {
            for (var i = 0; i < 3; ++i) {
                data[i] *= (1 + rgb[i]);
            }
        });
    }


    vintage() {
        return this
            .desaturate()
            .brightnessContrast({ contrast: 0.3 })
            .sepia()
            .lighten(0.2)
            ;
    }


    love() {
        return this
            .saturation(0.5)
            .lighten(0.1)
            .colorAdjust([0.2, 0, 0.2])
            .brightnessContrast({ contrast: 0.1 })
            .lighten(0.1)
            ;
    }


    blutify() {
        return this.forXY2(function (x, y, data) {
            var G = 0;
            for (var i = 0; i < 3; ++i) {
                G += 0.3 * data[i];
            }
            data[0] += data[0] / 25;
            data[1] += data[1] / 25;
            data[2] += (255 - G) / 10;
        });
    }


    grungy() {
        return this
            .brightnessContrast({ luminosity: 0.5 }).lighten(0.5)
            .saturation(1 - 15 / 255)
            .brightnessContrast({ contrast: 0.25 })
            ;
    }


    lightVintage() {
        return this
            .brightnessContrast({ contrast: 0.1 })
            .sepia()
            .love()
            .lighten(0.2)
            ;
    }


    bloom() {
        var kernel = BLOOM_KERNEL;
        var lowPass = this.clone().repeat('convolve', 20, kernel);
        var coarse = this.clone().sub(lowPass);
        return this.fill(0).add(lowPass.mul(1.4)).add(coarse.mul(1));
    }


    sharpen(amount, ker) {
        if ((typeof amount) !== 'number') {
            ker = amount.ker || ker;
            amount = amount.amount || 1;
        }
        var kernel = ker || SHARPEN_KERNEL;
        var lowPass = this.clone().repeat('convolve', 1, kernel);
        var coarse = this.clone().sub(lowPass);
        return this.fill(0).add(lowPass).add(coarse.mul(amount));
    }


    eval(filters, codes) {
        var name = '';
        var code = 'var ';
        var lines = filters.split("\n");
        console.info('Filters : ', lines);
        var self = this;
        lines.forEach(function (line, i) {
            if (line[0] === '#') {
                name = line.substr(1);
                code += (name + ' = function(){ return this');
                return;
            }

            var split = line.split(":");
            var command = split[0].trim();


            if (!self[command]) return;

            code += '.' + command + '(';


            if (split.length > 1) {
                var paramsstr = split[1].trim().split(",");
                var params = {};
                code += '{';
                paramsstr.forEach(function (param, pi) {
                    var s = param.split("=");
                    var name = s[0];
                    var val = parseFloat(s[1]);
                    params[name] = val;
                    code += '"' + name + '" : ' + val;
                    if (pi < paramsstr.length - 1) { code += ','; }
                });
                self[command](params);
                code += '}';
            }

            else {
                self[command]();
            }

            code += ')';
        });
        code += ';};';
        codes[0] = code;
        return this;
    }

    //#MARK: static 
    /**
     * Load an image 
     * @param src 
     * @returns 
     */
    static async load(src: string) {
        return new Image().load(src);
    }
}