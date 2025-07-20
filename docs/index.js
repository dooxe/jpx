(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(self, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./app/index.ts":
/*!**********************!*\
  !*** ./app/index.ts ***!
  \**********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const jpx = __importStar(__webpack_require__(/*! ../src/index */ "./src/index.ts"));
jpx.config.logPerformances = true;
const main = async () => {
    const image = await jpx.Image.load('Lenna.png');
    //image.fill(125);
    //image.blutify();
    const htmlImage = new Image();
    const content = document.querySelector('#content');
    htmlImage.src = image.toDataURL();
    content.appendChild(htmlImage);
    const filters = [
        {
            id: 'blutify',
            name: 'Blutify',
        },
        {
            id: 'grungy',
            name: 'Grungy',
        },
        {
            id: 'desaturate',
            name: 'Desaturate',
        },
        {
            id: 'negative',
            name: 'Negative',
            parameters: []
        },
        {
            id: 'pixelate',
            name: 'Pixelate',
            parameters: [
                10
            ]
        },
        {
            id: 'sharpen',
            name: 'Sharpen',
            parameters: [5]
        },
        {
            id: 'sepia',
            name: 'Sepia',
        },
        {
            id: 'brightnessContrast',
            name: 'Brightness / Contrast',
            parameters: [
                {
                    brightness: -0.2,
                    //contrast: 0.5
                }
            ]
        },
        {
            id: 'lighten',
            name: 'Lighten',
            parameters: [0.25]
        },
        {
            id: 'equalize',
            name: 'Equalize',
            parameters: []
        },
        {
            id: 'saturation',
            name: 'Saturation',
            parameters: [0.5]
        },
        {
            id: 'vintage',
            name: 'Vintage',
            parameters: []
        },
        {
            id: 'love',
            name: 'Love',
            parameters: []
        },
        {
            id: 'lightVintage',
            name: 'Light vintage',
            parameters: []
        },
        {
            id: 'bloom',
            name: 'Bloom',
            parameters: []
        }
    ];
    const links = [];
    const menuList = document.querySelector('.menu .list');
    for (const filter of filters) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.textContent = filter.name;
        a.href = '#';
        a.onclick = () => {
            for (const l of links) {
                l.classList.remove('selected');
            }
            const fun = filter.id;
            const img = image.clone();
            img[fun].call(img, ...(filter.parameters || []));
            htmlImage.src = img.toDataURL();
            a.classList.add('selected');
        };
        links.push(a);
        li.appendChild(a);
        menuList.appendChild(li);
    }
};
document.addEventListener('DOMContentLoaded', () => {
    main().catch((e) => {
        console.error(e);
    });
});


/***/ }),

/***/ "./src/Error.ts":
/*!**********************!*\
  !*** ./src/Error.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Error = void 0;
/**
 * A basic error with a title and a message
 */
class JpxError extends Error {
    /**
     * Create a new error
     * @param title     The error title
     * @param message   The error message
     */
    constructor(title, message) {
        super(`[jpx.error] ${title} - ${message}`);
    }
}
exports.Error = JpxError;


/***/ }),

/***/ "./src/Image.ts":
/*!**********************!*\
  !*** ./src/Image.ts ***!
  \**********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Image = void 0;
const Error_1 = __webpack_require__(/*! ./Error */ "./src/Error.ts");
const filters_1 = __webpack_require__(/*! ./filters */ "./src/filters.ts");
const Kernel_1 = __webpack_require__(/*! ./Kernel */ "./src/Kernel.ts");
const logPerformance_1 = __webpack_require__(/*! ./logPerformance */ "./src/logPerformance.ts");
const loops_1 = __webpack_require__(/*! ./loops */ "./src/loops.ts");
const GRAY = [0.299, 0.587, 0.114], SEPIA = [0.799, 0.387, 0.114], BLOOM_KERNEL = new Kernel_1.Kernel(3, 3, [1, 1, 1, 1, 1, 1, 1, 1, 1], true), SHARPEN_KERNEL = new Kernel_1.Kernel(3, 3, [1, 1, 1, 1, 1, 1, 1, 1, 1], true);
var canvas = document.createElement('canvas');
var context = canvas.getContext('2d');
var PixelArray = Array;
var createDataFromCanvas = function (w, h) {
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
class Image {
    /**
     *
     * @param width
     * @param height
     * @param spectrum
     */
    constructor(width = 1, height = 1, spectrum = 1) {
        this.imageBase = null;
        this.loaded = false;
        this._width = 1;
        this._height = 1;
        this._spectrum = 1;
        this._length = 1;
        this._data = [];
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
    create(w = 1, h = 1, s = 1) {
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
    async load(src) {
        return new Promise((resolve) => {
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
    clone() {
        var clone = new Image(this.width, this.height, this.spectrum);
        clone.imageBase = this.imageBase;
        return clone.copy(this);
    }
    /**
     *
     * @param image
     * @returns
     */
    copy(image) {
        if (!image._data || !this._data) {
            throw new Error_1.Error();
        }
        if (image._data.length !== this._data.length) {
            throw new Error_1.Error('Image.copy', 'images must have the same dimension');
        }
        for (var i = 0, v = 0; i < image._data.length; ++i, v = image._data[i]) {
            this._data[i] = v;
        }
        return this;
    }
    /**
     * Get the index given the specified value coordinate
     * @param x x-coordinate
     * @param y y-coordinate
     * @param c spectrum layer
     * @returns
     */
    index(x, y = 0, c = 0) {
        return (x + y * this.width) * this.spectrum + c;
    }
    /**
     *
     * @param w
     * @param h
     * @returns
     */
    resize(w, h) {
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
                var x = p.x, y = p.y, i = this.index(x, y), ox = Math.round(x * W / w), oy = Math.round(y * H / h), oi = (ox + oy * W) * this.spectrum;
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
    crop(x, y, w, h) {
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
    crop2(x1, y1, x2, y2) {
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
    fill(data) {
        if (typeof data === 'number') {
            data = [data];
        }
        return (0, loops_1.forXY)(this, (p) => {
            for (var c = 0; c < this.spectrum; ++c) {
                this.data[p.i + c] = data[c % data.length];
            }
        });
    }
    /**
     *
     * @returns
     */
    toDataURL() {
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
            throw new Error_1.Error();
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
    getHTMLImage() {
        const image = document.createElement('img');
        image.src = this.toDataURL();
        return image;
    }
    /**
     * @param canvas The HTMLCanvasElement, or its id.
     * @returns
     */
    output(canvas) {
        if (typeof canvas === 'string') {
            const c = document.getElementById(canvas);
            if (c && c instanceof HTMLCanvasElement) {
                canvas = c;
                ;
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
            throw new Error_1.Error('output', 'Given canvas must not be null.');
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
    convolve(kernel) {
        var r = Math.floor(kernel.width / 2);
        return (0, loops_1.forXY2)(this, (x, y, data) => {
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
    //#MARK: Loops
    forXY(callback) {
        return (0, loops_1.forXY)(this, callback);
    }
    forXY2(callback) {
        return (0, loops_1.forXY2)(this, callback);
    }
    /**
     *
     */
    forInXY(mx, my, Mx, My, _forInXY) {
        return (0, loops_1.forInXY)(this, mx, my, Mx, My, _forInXY);
    }
    forXYC(forxyc) {
        return (0, loops_1.forXYC)(this, forxyc);
    }
    forC(imgForC) {
        return (0, loops_1.forC)(this, imgForC);
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
    subtract(other) {
        var self = this;
        if (typeof other === 'number') {
            return self.add(-other);
        }
        self._data.forEach(function (d, i) { self._data[i] -= other._data[i]; });
        return self;
    }
    multiply(other) {
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
        for (let i = 0; i < this._data.length; ++i) {
            this._data[i] = max - this._data[i];
        }
    }
    /**
     *
     * @param params
     * @returns
     */
    desaturate(params) {
        params = ((typeof params === 'undefined') ? {} : params);
        var m = ((typeof params.method === 'undefined') ? "mean" : params.method);
        switch (m) {
            case "mean": {
                return (0, loops_1.forXY2)(this, (x, y, data) => {
                    var g = 0;
                    for (var i = 0; i < 3; ++i)
                        g += data[i] / 3;
                    for (var i = 0; i < 3; ++i)
                        data[i] = g;
                });
            }
            case "luminance": {
                return (0, loops_1.forXY2)(this, (x, y, data) => {
                    var g = 0;
                    for (var i = 0; i < 3; ++i)
                        g += (GRAY[i] * data[i]);
                    for (var i = 0; i < 3; ++i)
                        data[i] = g;
                });
            }
            default:
                {
                    throw new Error_1.Error('desaturate', 'No method "' + m + '" for desaturation');
                }
        }
    }
    pixelate(p = 5) {
        if (typeof p !== 'number') {
            p = p.pixelSize || 5;
        }
        var $data = [];
        for (var i = 0; i < this._data.length; ++i) {
            $data[i] = this._data[i];
        }
        return (0, loops_1.forXY2)(this, (x, y, data) => {
            var xx = p * Math.floor((0.5 + x + p / 2) / p);
            var yy = p * Math.floor((0.5 + y + p / 2) / p);
            var ii = (xx + yy * this.width) * 4;
            for (var c = 0; c < 3; ++c) {
                data[c] = $data[ii + c];
            }
        });
    }
    sepia() {
        return (0, loops_1.forXY2)(this.desaturate(), (x, y, data) => {
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
    lighten(factor = 0.1) {
        return this.forXY2((x, y, data) => {
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
            .forXY2((x, y, data) => {
            var r = data[0];
            var g = data[1];
            var b = data[2];
            if (Imin.r > r)
                Imin.r = r;
            if (Imin.g > g)
                Imin.g = g;
            if (Imin.b > b)
                Imin.b = b;
            if (Imax.r < r)
                Imax.r = r;
            if (Imax.g < g)
                Imax.g = g;
            if (Imax.b < b)
                Imax.b = b;
        })
            .forXY2((x, y, data) => {
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
    saturation(p = 1) {
        return (0, filters_1.saturation)(this, p);
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
        return this.forXY2(function (x, y, data) {
            var p = Math.sqrt(Math.pow(data[0], 2) * GRAY[0] +
                Math.pow(data[1], 2) * GRAY[1] +
                Math.pow(data[2], 2) * GRAY[2]);
            for (var i = 0; i < 3; ++i) {
                var val = data[i];
                var w = data[i] / 255;
                data[i] = (w * val) + (1 - saturation / 2) * (p + (data[i] - p) * saturation);
            }
        });
    }
    colorAdjust(rgb) {
        if (!Array.isArray(rgb)) {
            rgb = [rgb.r, rgb.g, rgb.b];
        }
        return this.forXY2(function (x, y, data) {
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
            .lighten(0.2);
    }
    love() {
        return this
            .saturation(0.5)
            .lighten(0.1)
            .colorAdjust([0.2, 0, 0.2])
            .brightnessContrast({ contrast: 0.1 })
            .lighten(0.1);
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
            .brightnessContrast({ contrast: 0.25 });
    }
    lightVintage() {
        return this
            .brightnessContrast({ contrast: 0.1 })
            .sepia()
            .love()
            .lighten(0.2);
    }
    bloom() {
        var kernel = BLOOM_KERNEL;
        var lowPass = this.clone().repeat('convolve', 20, kernel);
        var coarse = this.clone().subtract(lowPass);
        return this.fill(0).add(lowPass.multiply(1.4)).add(coarse.multiply(1));
    }
    sharpen(amount, ker) {
        if ((typeof amount) !== 'number') {
            ker = amount.ker || ker;
            amount = amount.amount || 1;
        }
        var kernel = ker || SHARPEN_KERNEL;
        var lowPass = this.clone().repeat('convolve', 1, kernel);
        var coarse = this.clone().subtract(lowPass);
        return this.fill(0).add(lowPass).add(coarse.multiply(amount));
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
            if (!self[command])
                return;
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
                    if (pi < paramsstr.length - 1) {
                        code += ',';
                    }
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
    static async load(src) {
        return new Image().load(src);
    }
}
exports.Image = Image;
__decorate([
    (0, logPerformance_1.logPerformance)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], Image.prototype, "negative", null);
__decorate([
    (0, logPerformance_1.logPerformance)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], Image.prototype, "desaturate", null);
__decorate([
    (0, logPerformance_1.logPerformance)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], Image.prototype, "pixelate", null);
__decorate([
    (0, logPerformance_1.logPerformance)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Image.prototype, "sepia", null);
__decorate([
    (0, logPerformance_1.logPerformance)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], Image.prototype, "brightnessContrast", null);
__decorate([
    (0, logPerformance_1.logPerformance)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Image)
], Image.prototype, "lighten", null);
__decorate([
    (0, logPerformance_1.logPerformance)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Image.prototype, "equalize", null);
__decorate([
    (0, logPerformance_1.logPerformance)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Image)
], Image.prototype, "saturation", null);
__decorate([
    (0, logPerformance_1.logPerformance)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], Image.prototype, "selectiveSaturation", null);
__decorate([
    (0, logPerformance_1.logPerformance)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], Image.prototype, "colorAdjust", null);
__decorate([
    (0, logPerformance_1.logPerformance)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Image.prototype, "vintage", null);
__decorate([
    (0, logPerformance_1.logPerformance)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Image.prototype, "love", null);
__decorate([
    (0, logPerformance_1.logPerformance)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Image.prototype, "blutify", null);
__decorate([
    (0, logPerformance_1.logPerformance)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Image.prototype, "grungy", null);
__decorate([
    (0, logPerformance_1.logPerformance)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Image.prototype, "lightVintage", null);
__decorate([
    (0, logPerformance_1.logPerformance)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Image.prototype, "bloom", null);
__decorate([
    (0, logPerformance_1.logPerformance)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_a = typeof Kernel_1.Kernel !== "undefined" && Kernel_1.Kernel) === "function" ? _a : Object]),
    __metadata("design:returntype", void 0)
], Image.prototype, "sharpen", null);


/***/ }),

/***/ "./src/Kernel.ts":
/*!***********************!*\
  !*** ./src/Kernel.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Kernel = void 0;
const Error_1 = __webpack_require__(/*! ./Error */ "./src/Error.ts");
/**
 * A basic kernel class for convolution-based operations
 */
class Kernel {
    /**
     *
     * @param w
     * @param h
     * @param data
     * @param normalize
     */
    constructor(w, h, data, normalize = false) {
        this._data = [];
        this._width = 0;
        this._height = 0;
        if (data.length != (w * h)) {
            throw new Error_1.Error('Kernel', 'w*h != data.length');
        }
        if (normalize) {
            var min = Infinity, max = 0;
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
    get width() {
        return this._width;
    }
    /**
     * The kernel height
     */
    get height() {
        return this._height;
    }
    /**
     *
     */
    get data() {
        return this._data;
    }
    /**
     *
     * @param x
     * @param y
     * @returns
     */
    at(x, y) {
        return this._data[x + y * this._width];
    }
}
exports.Kernel = Kernel;


/***/ }),

/***/ "./src/config.ts":
/*!***********************!*\
  !*** ./src/config.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.config = void 0;
/**
 * @example
 * ```
 * jpx.config.logPerformance = true;
 * myImage.sharpen();
 * // [jpx] sharpen()      - 80ms
 * ```
 */
exports.config = {
    /**
     * If true, log the performance in the console
     */
    logPerformances: false
};


/***/ }),

/***/ "./src/filters.ts":
/*!************************!*\
  !*** ./src/filters.ts ***!
  \************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.saturation = void 0;
const loops_1 = __webpack_require__(/*! ./loops */ "./src/loops.ts");
const GRAY = [0.299, 0.587, 0.114];
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
const saturation = (image, options = 1) => {
    let saturation = options;
    if (typeof saturation !== 'number') {
        saturation = saturation.amount || 1;
    }
    return (0, loops_1.forXY2)(image, function (x, y, data) {
        var p = Math.sqrt(Math.pow(data[0], 2) * GRAY[0] +
            Math.pow(data[1], 2) * GRAY[1] +
            Math.pow(data[2], 2) * GRAY[2]);
        for (var i = 0; i < 3; ++i) {
            data[i] = p + (data[i] - p) * saturation;
        }
    });
};
exports.saturation = saturation;


/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.loops = exports.filters = exports.config = void 0;
/**
 * @module jpx
 */
__exportStar(__webpack_require__(/*! ./Error */ "./src/Error.ts"), exports);
__exportStar(__webpack_require__(/*! ./Image */ "./src/Image.ts"), exports);
__exportStar(__webpack_require__(/*! ./Kernel */ "./src/Kernel.ts"), exports);
/**
 * Some configuration
 */
var config_1 = __webpack_require__(/*! ./config */ "./src/config.ts");
Object.defineProperty(exports, "config", ({ enumerable: true, get: function () { return config_1.config; } }));
/**
 * Some filters
 */
exports.filters = __importStar(__webpack_require__(/*! ./filters */ "./src/filters.ts"));
/**
 * Several loops utilities.
 *
 * > [!WARNING] Those loops a time expensive.
 * >
 * > If you are into performance, use javascript loops instead
 */
exports.loops = __importStar(__webpack_require__(/*! ./loops */ "./src/loops.ts"));


/***/ }),

/***/ "./src/logPerformance.ts":
/*!*******************************!*\
  !*** ./src/logPerformance.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.logPerformance = void 0;
const config_1 = __webpack_require__(/*! ./config */ "./src/config.ts");
/**
 * Decorator to log performance if needed.
 * @returns
 */
const logPerformance = () => {
    return (o, k, t) => {
        const method = t.value;
        t.value = function (...args) {
            const t1 = Date.now();
            const result = method.call(this, ...args);
            const t2 = Date.now();
            if (config_1.config.logPerformances) {
                console.log(`[jpx] ${(k + '()').padEnd(25, ' ')} - ${t2 - t1}ms`);
            }
            return result;
        };
    };
};
exports.logPerformance = logPerformance;


/***/ }),

/***/ "./src/loops.ts":
/*!**********************!*\
  !*** ./src/loops.ts ***!
  \**********************/
/***/ (function(__unused_webpack_module, exports) {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.forInXY = exports.forXYC = exports.forC = exports.forXY2 = exports.forXY = void 0;
/**
 * Loop on all (x;y) positions
 * @param image The image to be iterated
 * @param forxy The callback
 * @returns The input image for chaining
 */
const forXY = (image, forxy) => {
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
};
exports.forXY = forXY;
/**
 *
 * @param forxy2
 * @returns The input image for chaining
 */
const forXY2 = (image, forxy2) => {
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
};
exports.forXY2 = forXY2;
/**
 * Iterate over the image spectrum.
 * @param image
 * @param forC
 * @returns The input image for chaining
 */
const forC = (image, forC) => {
    for (var c = 0; c < image.spectrum; ++c) {
        forC.call(null, c);
    }
    return image;
};
exports.forC = forC;
/**
 * Iterate over each value of the data buffer
 * @param image
 * @param forxyc
 * @returns The input image for chaining
 */
const forXYC = (image, forxyc) => {
    for (var y = 0; y < image.height; ++y) {
        for (var x = 0; x < image.width; ++x) {
            for (var c = 0; c < 4; ++c) {
                forxyc.call(this, x, y, c);
            }
        }
    }
    return image;
};
exports.forXYC = forXYC;
/**
 * Iterate over positions inside a rectangle
 * @param mx Rectangle x
 * @param my Rectangle y
 * @param Mx Rectangle x + Rectangle width
 * @param My Rectangle y + Rectangle height
 * @param forInXY
 * @returns
 */
const forInXY = (image, mx, my, Mx, My, forInXY) => {
    for (var y = my; y < My; ++y) {
        for (var x = mx; x < Mx; ++x) {
            forInXY.call(this, x, y);
        }
    }
    return image;
};
exports.forInXY = forInXY;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./app/index.ts");
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});
/*! generated with (nova) */
//# sourceMappingURL=index.js.map