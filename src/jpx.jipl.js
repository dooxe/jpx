//
//
//
//
//
var jpx = (function()
{
	'use strict';

	//
	var canvas		= document.createElement('canvas');

	//
	var context		= canvas.getContext('2d');

	//
	var HTMLImage	= Image;

	//
	var plugins		= [];

	//
	var PixelArray	= Array;

	//
	var createDataFromCanvas	= function(w,h)
	{
		canvas.width	= w;
		canvas.height	= h;
		var img = context.getImageData(0,0,w,h);
		return img.data;
	};

	/**
	*	@class jpx
	*/
	var jpx = {

		//
		GRAY 		: [0.299,0.587,0.114],

		//
		SEPIA		: [0.799,0.387,0.114],

		//
		//
		//
		Error : (function(){
			var jpxError = function(f,message)
			{
				@name		= 'jpx.Error';
				@message	= '[' + f + ']' + (message? ' - ' + message : '');
			}
			jpxError.prototype = Error.prototype;
			return jpxError;
		})(),

		/**
		*	Get the current timestamp.
		*	@static
		*	@method time
		*	@return The number of millisecond since the 1st of January 1970 00:00:00 UTC.
		*/
		time 		: function()
		{
			return Date.now();
		},

		/**
		*	Exit the program by throwing an error. Useful when one debugs loops
		*	with callback functions etc.
		*	@static
		*	@method exit
		*/
		exit			: function()
		{
			throw new jpx.Error('Exiting');
		},

		/**
		*	Add a set of filters to jpx.Image class
		*	@static
		*	@method addPlugin
		*	@param {Object} plugin Contains all image filters (see the example)
		*	@example
		*		var plugin = {
		*			redify : function(){
		*				return this.forXY2(function(x,y,data){
		*					data[0] += 25;
		*					data[0] = Math.min(255,data[0]);
		*				});
		*			}
		*		};
		*		jpx.addPlugin(plugin);
		*		var image = new jpx.Image.load('my/image.png', function()
		*		{
		*			this.redify().output('output');
		*		});
		*/
		addPlugin		: function(plugin){
			//	Apply all plugin functions to the image
			for(var name in plugin)
			{
				var p = jpx.Image.prototype[name];
				if(p)
				{
					throw new jpx.Error('addPlugin()', 'method "'+name+'" cannot be overridden');
				}
				jpx.Image.prototype[name] = plugin[name];
			}
		},

		/**
		*	Class representing a kernel (e.g. gaussian kernel)
		*	@class jpx.Kernel
		*	@constructor
		*	@param {Integer}	width		The kernel width
		*	@param {Integer}	height		The kernel height
		*	@param {Array}		data		The kernel data, a 1D array
		*	@param {Boolean}	[normalize]	Define whether the kernel should be normalized
		*/
		Kernel : function(w,h,data,normalize){
			if(normalize)
			{
				var min = Infinity;
				var max = 0;
				for(var i = 0; i < data.length; ++i)
				{
					var d = data[i];
					if(d < min) min = d;
					if(d > max) max = d;
				}
				var N = Math.max(Math.abs(min),Math.abs(max));
				for(var i = 0; i < data.length; ++i)
				{
					data[i] /= (1e-8 + N);
				}
			}
			return jpx.utils.derive(this,
			{
				width	: w,
				height	: h,
				data 	: data
			});
		},

		/**
		*	@class jpx.utils
		*/
		utils 		: {
			/**
			*	Derive an object with another one.
			*	@static
			*	@method derive
			*	@param {Object}	object1		The object to be derived
			*	@param {Object} object2		Properties to add/override in `object1`
			*	@return {Object} `object1`
			*	@example
			*		var Klass = function(id)
			*		{
			*			this.id = id;
			*		};
			*		jpx.utils.derive(Klass.prototype,
			*		{
			*			getId : function()
			*			{
			*				return this.id;
			*			}
			*		});
			*		var kobject = new Klass(5);
			*		console.log(kobject.getId()); // "5"
			*/
			derive			: function(o1,o2){
				for(var p in o2)
				{
					o1[p] = o2[p];
				}
				return o1;
			},

			/**
			*	Check whether an object is an array.
			*	@static
			*	@method isArray
			*	@param suspect The object to be checked
			*/
			isArray 		: function(suspect)
			{
				return (Object.prototype.toString.call(suspect) === '[object Array]');
			},

			/**
			*	If `object` is defined returns it, otherwise returns `defaultValue`
			*	@static
			*	@method getDefault
			*	@param {Object}	object			The object to be tested
			*	@param {Object} defaultValue	The value to be returned if `object` is not defined
			*/
			getDefault		: function(object,defaultValue)
			{
				if(typeof object === 'undefined')
				{
					return defaultValue;
				}
				return object;
			}
		}


	};

	//
	jpx.Kernel.prototype.at = function(x,y)
	{
		return this.data[x+y*@width];
	};

	//
	var
		BLOOM_KERNEL	= new jpx.Kernel(3,3,[1,1,1,1,1,1,1,1,1],true),
		SHARPEN_KERNEL	= new jpx.Kernel(3,3,[1,1,1,1,1,1,1,1,1],true)
	;

	//
	jpx.utils.derive(jpx, {
		/**
		*	An image class.
		*	@class jpx.Image
		*	@constructor
		*	@param {Arguments} constructor
		*
		*	@param {Arguments}	constructor.constructor1
		*	@param {Integer}	constructor.constructor1.width			Image.width
		*	@param {Integer}	constructor.constructor1.height			Image height
		*	@param {Integer}	[constructor.constructor1.nbChannels=1]	Number of channels of the image
		*
		*	@param {Arguments}	constructor.constructor2
		*	@param {String}		constructor.constructor2.src			The image URL
		*	@param {Function}	[constructor.constructor2.onload]		Called when the image is loaded if `src` is specified
		*	@example
		*		// Grayscale image
		*		var image1 = new jpx.Image(256,256);
		*
		*		// RGB image
		*		var image2 = new jpx.Image(256,256,3);
		*
		*		// RGBA image
		*		var image3 = new jpx.Image('my/image/file.png', function()
		*		{
		*			console.log("I'm loaded !");
		*		});
		*/
		Image 			: (function()
		{
			var Image	= function(init)
			{
				init = jpx.utils.getDefault(init,{});
				jpx.utils.derive(this,
				{
					/**
					*	Data buffer.
					*	@property	data
					*	@type 		Array
					*/
					data			: [],

					/**
					*	The source image.
					*	If no `src` was provided at construction or if
					*	no loading was performed, this value is `null`.
					*	@property	imageBase
					*	@type		HTMLImageElement
					*	@default	null
					*/
					imageBase		: null,
				});

				//	Create the image from the size
				if(typeof init === 'number')
				{
					var w = jpx.utils.getDefault(arguments[0],1);
					var h = jpx.utils.getDefault(arguments[1],1);
					var s = jpx.utils.getDefault(arguments[2],1);
					@create(w,h,s);
				}
				//	otherwise create from image source
				else if(typeof init === 'string')
				{
					var onload = arguments[1];
					@load(init, onload? onload : null);
				}
			};

			//	Create class methods
			jpx.utils.derive(Image.prototype, {
				/**
				*	Create an new image from specified dimension
				*	@method create
				*	@param {Integer} width	The image width
				*	@param {Integer} height	The image height
				*	@param {Integer} nbChannels The number of channels of the image
				*	@chainable
				*/
				create 		: function(w,h,s)
				{
					@width		= w? w : 1;
					@height 	= h? h : 1;
					@spectrum	= s? s : 1;
					@length		= w*h*s;
					if(@spectrum == 4)
					{
						@data = createDataFromCanvas(w,h);
					}
					else
					{
						@data = new PixelArray(@length);
					}
					return @fill(0);
				},

				/**
				*	Load an image from an url.
				*	The resulting image has 4 channels.
				*	@method load
				*	@chainable
				*	@param {String} src The URL of the image to be loaded.
				*	@param {Function} [onComplete] Called when the image has just finished loading.
				*/
				load		: function(src, complete){
					var self	= this;
					var image	= new HTMLImage();
					image.onload = function()
					{
						var w = @width;
						var h = @height;
						canvas.width	= w;
						canvas.height	= h;
						context.drawImage(this,0,0);
						var data		= context.getImageData(0,0,w,h).data;
						self.data		= new Array(data.length);
						for(var i = 0; i < data.length; ++i){
							self.data[i] = data[i];
						}
						self.width		= w;
						self.height		= h;
						self.spectrum	= 4;
						self.loaded		= true;
						if(complete) complete.call(self, null);
					};
					image.src = src;
					@imageBase = image;
					return self;
				},

				/**
				*	Clone the image.
				*	@method clone
				*	@return A new instance of the current image.
				*	@chainable
				*/
				clone 			: function(){
					var clone = new jpx.Image(@width,@height,@spectrum);
					clone.imageBase = @imageBase;
					return clone.copy(this);
				},

				/**
				*	Copy the contents of an image to the current image
				*	@method copy
				*	@param {jpx.Image} image The image from which data are copied
				*	@chainable
				*/
				copy 			: function(image){
					if(image.data.length != @data.length)
					{
						throw new jpx.Error('Image.copy', 'images must have the same dimension');
					}
					foreach value i,v in image
						@data[i] = v;
					/foreach
					return this;
				},

				/**
				*	Compute the index of a specified pixel position
				*	@method index
				*	@param {Integer} x		The x-coordinate of the pixel
				*	@param {Integer} [y=0]		The y-coordinate of the pixel
				*	@param {Integer} [c=0]	The channel
				*	@return {Integer} The index of the pixel inside the data buffer
				*/
				index 		: function(x,y,c){
					return (x+jpx.utils.getDefault(y,0)*@width)*@spectrum + jpx.utils.getDefault(c,0);
				},

				/**
				*	Roughfly resize the image using specified dimension and method.
				*	@method resize
				*	@param {Integer} width	The new image width
				*	@param {Integer} height	The new image height
				*	@chainable
				*/
				resize 			: function(w,h){
					w = Math.floor(w);
					h = Math.floor(h);
					var pixels = new Array(@length);
					for(var i = 0; i < @length; ++i) pixels[i] = @data[i];

					var W	= @width;
					var H	= @height;
					@width 	= w;
					@height = h;
					@data	= new Array(w*h*@spectrum);

					foreach position p in this
						var
							x = p.x,
							y = p.y,
							i = @index(x,y),
							ox = Math.round(x*W/w),
							oy = Math.round(y*H/h),
							oi = (ox+oy*W)*@spectrum
						;
						foreach channel c in this
							@data[i+c] = pixels[oi+c];
						/foreach
					/foreach
					return this;
				},

				/**
				*	Crop an image from specified position and size.
				*	@method crop
				*	@param {Integer} x		The x-coordinate of the top-left corner of the crop
				*	@param {Integer} y		The y-coordinate of the top-left corner of the crop
				*	@param {Integer} width	The width of the crop
				*	@param {Integer} height The height of the crop
				*	@chainable
				*/
				crop 			: function(x,y,w,h){
					var data = new Array(w*h*@spectrum);
					@forInXY(x,y,x+w,y+h,function(p)
					{
						var ni = ((p.x-x) + (p.y-y)*w) * @spectrum;
						for(var c = 0; c < @spectrum; ++c)
						{
							data[ni+c] = @data[p.i+c];
						}
					});
					@data	= data;
					@width	= w;
					@height	= h;
					return this;
				},

				/**
				*	Crop an image from specified corner positions.
				*	@method crop2
				*	@param {Integer} x1 The x-coordinate of the top-left corner of the crop
				*	@param {Integer} y1 The y-coordinate of the top-left corner of the crop
				*	@param {Integer} x2 The x-coordinate of the bottom-right corner of the crop
				*	@param {Integer} y2 The y-coordinate of the bottom-right corner of the crop
				*	@chainable
				*/
				crop2 			: function(x1,y1,x2,y2){
					var x = Math.min(x1,x2);
					var y = Math.min(y1,y2);
					var w = Math.abs(x2-x1);
					var h = Math.abs(y2-y1);
					return this.crop(x,y,w,h);
				},

				/**
				*	Fill the image with data.
				*	@method fill
				*	@param {Array} data The vector of data to use
				*	@chainable
				*/
				/**
				*	Fill the image with data.
				*	@method fill
				*	@param {Number} data
				*	@chainable
				*/
				fill 		: function(data){
					if(typeof data === 'number') data = [data];
					return this.forXY(function(p)
					{
						for(var c = 0; c < this.spectrum; ++c)
						{
							this.data[p.i+c] = data[c%data.length];
						}
					});
				},

				/**
				*	Convert the image to a base64 string
				*	(see HTMLcanvasElement.toDataURL() for more details).
				*	@method toDataURL
				*	@return {String} A base64-based url of the image.
				*	@example
				*		var image = jpx.Image.load('my/image.png', function()
				*		{
				*			var img = document.createElement('img');
				*			img.src = this.toDataURL();
				*			document.body.appendChild(img);
				*		});
				*/
				toDataURL		: function(){
					canvas.width = this.width;
					canvas.height= this.height;
					context.putImageData(this.getImageData(),0,0);
					return canvas.toDataURL();
				},

				/**
				*	Compute a canvas image data buffer.
				*	@method getImageData
				*	@example
				*		var canvas	= document.getElementById('mycanvas');
				*		var ctx		= canvas.getContext('2d');
				*		var image = jpx.Image.load('my/image.png', function()
				*		{
				*			ctx.putImageData(this.getImageData(),0,0);
				*		});
				*/
				getImageData 	: function(){
					var imageData	= context.createImageData(this.width,this.height);
					var pixels		= imageData.data;
					foreach position p in this
						var i = (p.x+p.y*this.width);
						foreach channel c in this
							pixels[i*4+c] = this.data[i*this.spectrum+c];
						/foreach
						pixels[i*4+3] = 255;
					/foreach
					return imageData;
				},

				/**
				*	Create an HTML image.
				*	@method getHTMLImage
				*	@return An html image
				*	@example
				*		var image = new jpx.Image(256,256,1);
				*		var img   = image.getHTMLImage();
				*		document.body.appendChild(img);
				*/
				getHTMLImage		: function()
				{
					var image = new HTMLImage();
					image.src = this.toDataURL();
					return image;
				},

				/**
				*	Output the image to the specified canvas element.
				*	@method output
				*	@param id {String} The id of the canvas on which the image will be drawn
				*	@chainable
				*/
				/**
				*	Output the image to the specified canvas element.
				*	@method output
				*	@param element {HTMLCanvasElement} The the canvas element where to
				*	draw the image
				*	@chainable
				*/
				output			: function(id){
					var c = id;
					if(typeof id === 'string')
					{
						c = document.getElementById(id);
					}
					if(c)
					{
						c.width  = this.width;
						c.height = this.height;
						var ctx = c.getContext('2d');
						var data = this.getImageData();
						ctx.putImageData(data,0,0);
					}
					else
					{
						throw new jpx.Error('output', 'Given canvas must not be null.');
					}
					return this;
				},

				/**
				*	Iterate over all image pixels from top-left to bottom-right.
				*	@method forXY
				*	@param {Function} forxy The pixel callback
				*	@param {Object} forxy.pixel
				*	@param {Integer} forxy.pixel.x The x-coordinate
				*	@param {Integer} forxy.pixel.y The y-coordinate
				*	@param {Integer} forxy.pixel.i The index of the pixel inside the data buffer
				*	@chainable
				*	@example
				*		var image = new jpx.Image(50,50,1);
				*		image.forXY(function(pixel)
				*		{
				*			this.data[pixel.x+pixel.y*this.width] = Math.random();
				*		});
				*/
				forXY			: function(forxy){
					var p = {
						x : 0,
						y : 0,
						i : 0
					}
					var data	= this.data;
					for(var y = 0; y < this.height; ++y)
					{
						for(var x = 0; x < this.width; ++x)
						{
							var i = (x + y * this.width) * this.spectrum;
							p.x = x;
							p.y = y;
							p.i = i;
							forxy.call(this,p);
						}
					}
					return this;
				},

				/**
				*	Iterate over all image pixels from top-left to bottom-right.
				*	@method forXY2
				*	@param {Function}	forxy		The pixel callback
				*	@param {Integer}	forxy.x		The pixel x-coordinate
				*	@param {Integer}	forxy.y		The pixel y-coordinate
				*	@param {Array}		forxy.data	The [I/O] pixel color
				*	@example
				*		// Apply a blueish tone to the image
				*		var image = new jpx.Image(50,50,3);
				*		image.forXY2(function(x,y,data)
				*		{
				*			data[0] *= 0.5;
				*			data[1] *= 0.8;
				*			data[2] *= 1.2;
				*		});
				*/
				forXY2			: function(forxy2){
					var vector	= [0,0,0,0];
					var data	= this.data;
					for(var y = 0; y < this.height; ++y)
					{
						for(var x = 0; x < this.width; ++x)
						{
							var i = (x + y * this.width) * 4;
							vector[0] = data[i+0];
							vector[1] = data[i+1];
							vector[2] = data[i+2];
							vector[3] = data[i+3];
							forxy2.call(this,x,y,vector);
							data[i+0] = vector[0];
							data[i+1] = vector[1];
							data[i+2] = vector[2];
							data[i+3] = vector[3];
						}
					}
					return this;
				},

				/**
				*	Iterate over all image pixels from top-left to bottom-right.
				*	@method forInXY
				*	@param {Integer}	minX
				*	@param {Integer}	minY
				*	@param {Integer}	maxX
				*	@param {Integer}	maxY
				*	@param {Function}	forInXY		The pixel callback
				*	@param {Integer}	forInXY.x	The x-coordinate of the pixel
				*	@param {Integer}	forInXY.y	The y-coordinate of the pixel
				*	@example
				*		//	Draw a white square at the top-left of the image
				*		var image = new jpx.Image(50,50,1);
				*		image.forInXY(0,0,25,25, function(x,y)
				*		{
				*			this.data[this.index(x,y)] = 255;
				*		});
				*/
				forInXY			: function(mx,my,Mx,My,forInXY){
					for(var y = my; y < My; ++y)
					{
						for(var x = mx; x < Mx; ++x)
						{
							forInXY.call(this,x,y);
						}
					}
					return this;
				},

				/**
				*	Iterate over all values inside an image.
				*	@method forXYC
				*	@param {Function} forXYC
				*	@param {Integer}	forXYC.x	The pixel y-coordinate
				*	@param {Integer}	forXYC.y	The pixel x-coordinate
				*	@param {Integer}	forXYC.c	The channel of the current pixel
				*	@chainable
				*	@example
				*		//	Make a blueish image
				*		var image = new jpx.Image(50,50,3).forXYC(function(x,y,c)
				*		{
				*			this.data[this.index(x,y,c)] = 50 + 50 * c;
				*		});
				*/
				forXYC			: function(forxyc){
					for(var y = 0; y < this.height; ++y)
					{
						for(var x = 0; x < this.width; ++x)
						{
							for(var c = 0; c < 4; ++c)
							{
								forxyc.call(this,x,y,c);
							}
						}
					}
					return this;
				},

				/**
				*	Iterate over image channels.
				*	<p class="warning">
				*	<span class="tag-warning">Warning</span>
				*	Due to performance issues, this method must NOT
				*	be used inside a `forXY` loop.
				*	Instead, you may use the `forXYC` loop.
				*	</p>
				*	@method forC
				*	@param {Function} forC `function(c){ }`
				*	@example
				*		var image = new jpx.Image(256,256,3);
				*		image.forC(function(c){
				*			// do stuff with channels
				*		});
				*/
				forC		: function(forC){
					if(!forC) return;
					foreach channel c in this
						forC.call(this,c);
					/foreach
					/*
					for(var c = 0; c < 3; ++c)
					{
						forC.call(this,c);
					}
					*/
					return this;
				},

				/**
				*
				*
				*/
				getHistogram		: function(length)
				{
					var H = new Array(@spectrum);
					foreach channel c in this
						var hc = H[c] = new Array(length);
					/foreach
					foreach pixel p in this
						H[p.c][parseInt(@data[p.index])]++;
					/foreach
				},

				/**
				*	Convolve the image with by specified kernel.
				*	@method convolve
				*	@param {Kernel}		kernel A normalized kernel.
				*	@param {Integer}	kernel.width
				*	@param {Integer}	kernel.height
				*	@param {Array}		kernel.data
				*	@chainable
				*/
				convolve            : function(kernel)
                {
                    var r = parseInt(kernel.width / 2);
					return @forXY2(function(x,y,data)
					{
						data[0] = 0;
						data[1] = 0;
						data[2] = 0;
						var wsum = 1e-8;
						for(var dy = -r; dy <= r; ++dy)
						{
							for(var dx = -r; dx <= r; ++dx)
							{
								var rx = x + dx;
								var ry = y + dy;
								if(rx >= 0 && rx < this.width && ry >= 0 && ry < this.height)
								{
									var ki = (dx + r) + (dy + r) * kernel.width;
									var w = kernel.data[ki];
									var i = (rx + ry * this.width) * 4;
									data[0] += w * this.data[i+0];
									data[1] += w * this.data[i+1];
									data[2] += w * this.data[i+2];
									wsum += w;
								}
							}
						}
						if(wsum > 0)
						{
							data[0] /= wsum;
							data[1] /= wsum;
							data[2] /= wsum;
						}
					});
                },

				/**
				*	Repeat a filter afor `n` times.
				*	@method repeat
				*	@param filter The name of the filter
				*	@param parameters The parameters of the filter,
				*	@param n The number of iterations
				*/
				repeat 			: function(filter,n,params)
				{
					for(var i = 0; i < n; ++i)
					{
						this[filter](params);
					}
					return this;
				},

				/**
				*	Apply a set of filters defined by a JSON object.
				*	@method applyFilters
				*	@param {Array} filters The set of filters to be applied
				*	@chainable
				*	@example
				*		var filters = {
				*			colorAdjust		: {
				*				r : 0.5,
				*				g : 1.1,
				*				b : 0.7
				*			},
				*			saturation 		: 0.5
				*		};
				*		var image = jpx.Image.load('my/image.png', function()
				*		{
				*			this.applyFilters(filters);
				*		});
				*/
				applyFilters	: function(filters)
				{
					for(var filterName in filters)
					{
						this[filterName](filters[filterName]);
					}
					return this;
				},

				/**
				*	Free image memory
				*	@method dispose
				*/
				dispose 		: function()
				{
					this.data		= null;
					this.imageBase	= null;
				}
			});

			// Add static properties/methods
			jpx.utils.derive(Image, {
				/**
				*	Load an image from a specified source filename.
				*	@static
				*	@method load
				*	@param {String} src The image filename
				*	@param {Function} [loaded] Called when the image has finished loading
				*	@return The new newly created image
				*/
				load : function(src, loaded)
				{
					var i = new jpx.Image();
					i.load(src,loaded);
					return i;
				}
			});

			return Image;
		})(),
	});

	//
	//
	//
	jpx.addPlugin({
		/**
		*	Pointwise addition of an image to the current image
		*	@method add
		*	@param {jpx.Image} image The image to be added to the current image
		*	@chainable
		*/
		/**
		*	Pointwise addition of the current image by a number
		*	@method add
		*	@param {Number} value The value to be added to the current image
		*	@chainable
		*/
		add	: function(other)
		{
			var self = this;
			if(typeof other == 'number')
			{
				self.data.forEach(function(d,i){self.data[i]+=other});
				return this;
			}
			self.data.forEach(function(d,i){self.data[i]+=other.data[i]});
			return self;
		},
		/**
		*	Pointwise substraction of an image to the current image
		*	@method sub
		*	@param {jpx.Image} image The image to be substracted to the current image
		*	@chainable
		*/
		/**
		*	Pointwise substraction of the current image by a number
		*	@method sub
		*	@param {Number} value The value to be substracted to the current image
		*	@chainable
		*/
		sub : function(other)
		{
			var self = this;
			if(typeof other == 'number')
			{
				return self.add(-other);
			}
			self.data.forEach(function(d,i){self.data[i]-=other.data[i]});
			return self;
		},
		/**
		*	Pointwise multiplication of an image to the current image
		*	@method mul
		*	@param {jpx.Image} image The image to be multiplied to the current image
		*	@chainable
		*/
		/**
		*	Pointwise multiplication of the current image by a number
		*	@method mul
		*	@param {Number} value The value to be multiplied to the current image
		*	@chainable
		*/
		mul : function(other)
		{
			var self = this;
			if(typeof other == 'number')
			{
				self.data.forEach(function(d,i){self.data[i]*=other});
				return this;
			}
			self.data.forEach(function(d,i){self.data[i]*=other.data[i]});
			return self;
		}
	});

	/**
	*   @class jpx.Image
	*/
	jpx.addPlugin({
	    /**
		*	Apply a negative filter on the image
	    *	@method negative
		*	@param {Number} max=255 The value from which compute the negative
	    *	@chainable
	    */
	    negative 		: function(max){
			max = jpx.utils.getDefault(max,255);
	        return this.forXY2(function(x,y,data)
	        {
	            for(var i = 0; i < 3; ++i)
	            {
	                data[i] = max - data[i];
	            }
	        });
	    },

		/**
	    *	Desaturate the image
	    *	@method desaturate
	    *	@chainable
	    */
	    desaturate		: function(params){
			params	= ((params|{}));
	        var m	= ((params.method|"mean"));
	        switch(m)
	        {
	            case "mean" : {
	                return this.forXY2(function(x,y,data)
	                {
	                    var g = 0;
	                    for(var i = 0; i < 3; ++i) g += data[i] / 3;
	                    for(var i = 0; i < 3; ++i) data[i] = g;
	                });
	            }
	            case "luminance" : {
	                return this.forXY2(function(x,y,data)
	                {
	                    var g = 0;
	                    for(var i = 0; i < 3; ++i) g += (jpx.GRAY[i]*data[i]);
	                    for(var i = 0; i < 3; ++i) data[i] = g;
	                });
	            }
	            default :
	            {
	                throw new jpx.Error('desaturate', 'No method "'+m+'" for desaturation');
	            }
	        }
	        return this;
	    },

	    /**
	    *	<span class="beta-feature">beta</span>
		*	Pixelate the image.
	    *	@method pixelate
	    *	@param p=5 The pixel size
	    *	@chainable
	    */
	    pixelate		: function(p){
	        if(typeof p != 'number')
	        {
	            p = p.pixelsize || 5;
	        }
	        var $data = [];
	        for(var i = 0; i < this.data.length; ++i)
	        {
	            $data[i] = this.data[i];
	        }
	        return this.forXY2(function(x,y,data)
	        {
	            var xx = p*Math.floor((0.5 + x + p / 2) / p );
	            var yy = p*Math.floor((0.5 + y + p / 2) / p);
	            var ii = (xx + yy * this.width) * 4;
	            for(var c = 0; c < 3; ++c)
	            {
	                data[c] = $data[ii+c];
	            }
	        });
	    },

	    /**
	    *	Apply sepia tone to the image.
	    *	@method sepia
	    *	@chainable
	    */
	    sepia 			: function(){
	        return this.desaturate().forXY2(function(x,y,data)
	        {
	            for(var i = 0; i < 3; ++i)
	            {
					var v = data[i];
	                data[i] = jpx.SEPIA[i] * data[i];// / 255;
					data[i] += 0.5 * v;
	            }
	        });
	    },

	    /**
		*	Change the brightness and/or the contrast of the image
	    *	@method brightnessContrast
	    *	@param {Object} properties
	    *	@param {Number} [properties.brighntess = 0] Brightness between -1 and 1
	    *	@param {Number} [properties.contrast = 1]   Contrast between 0 and 1
	    *	@chainable
	    */
	    brightnessContrast 		: function(properties){
	        properties = ((properties|{}));
	        var C = ((properties.contrast|0))
			var B = ((properties.brightness|0));
	        return this.forXY2(function(x,y,data)
	        {
	            for(var i = 0; i < 3; ++i)
	            {
	                data[i] = (B * 255) + (1 + C) * data[i];
	            }
	        });
	    },

	    /**
		*	Lighten the image with a specified percentage
	    *	@method lighten
		*	@param {Number} factor=0.1 The percentage of lightness to increase
	    *	@chainable
	    */
	    lighten 		: function(factor){
	        if(typeof factor !== 'number')
	        {
	            factor = jpx.utils.getDefault(factor.factor,0.1);
	        }
	        return @forXY2(function(x,y,data)
	        {
	            for(var i = 0; i < 3; ++i)
	            {
	                data[i] = (1+factor)*data[i];
	            }
	        });
	    },

	    /**
	    *   Equalize the image histogram
	    *	@method equalize
	    *	@chainable
	    */
	    equalize		: function(){
	        var Imin = {r:255,g:255,b:255};
	        var Imax = {r:0,g:0,b:0};
	        return @forXY2(function(x,y,data)
	        {
	            var r = data[0];
	            var g = data[1];
	            var b = data[2];
	            if(Imin.r > r) Imin.r = r;
	            if(Imin.g > g) Imin.g = g;
	            if(Imin.b > b) Imin.b = b;
	            if(Imax.r < r) Imax.r = r;
	            if(Imax.g < g) Imax.g = g;
	            if(Imax.b < b) Imax.b = b;
	        })
	        .forXY2(function(x,y,data)
	        {
	            data[0] = (255 / (Imax.r-Imin.r)) * (data[0]-Imin.r);
	            data[1] = (255 / (Imax.g-Imin.g)) * (data[1]-Imin.g);
	            data[2] = (255 / (Imax.b-Imin.b)) * (data[2]-Imin.b);
	        });
	    },

	    /**
	    *   Change the image saturation
	    *	@method saturation
	    *	@param {Number} saturation The new image saturation between 0 and 2
	    *	@chainable
	    */
	    saturation 		: function(p){
	        var saturation = p;
	        if(typeof saturation !== 'number')
	        {
	            saturation = p.amount || 1;
	            if(p.amount == 0)
	            {
	                saturation = 0;
	            }
	        }
	        return this.forXY2(function(x,y,data)
	        {
	            var p = Math.sqrt(
	                Math.pow(data[0],2)*jpx.GRAY[0] +
	                Math.pow(data[1],2)*jpx.GRAY[1] +
	                Math.pow(data[2],2)*jpx.GRAY[2]
	            );
	            for(var i = 0; i < 3; ++i)
	            {
	                data[i] = p + (data[i]-p) * saturation;
	            }
	        });
	    },

	    //
	    //	@method selectiveSaturation
	    //	@param {Object} properties
	    //	@param {Number} properties.saturation	The saturation to be applied
	    //	@param {Number} properties.r			The red filter
	    //	@param {Number} properties.g 			The green filter
	    //	@param {Number} properties.b			The blue filter
	    //	@todo Implement the filter
	    //	@chainable
	    //
	    selectiveSaturation		: function(p){
	        var saturation = (typeof p.saturation === 'undefined')? 1 : p.saturation;
	        var filter = [
	            ((typeof p.r === 'undefined')? 1 : p.r),
	            ((typeof p.g === 'undefined')? 1 : p.g),
	            ((typeof p.b === 'undefined')? 1 : p.b)
	        ];
	        if(p.amount == 0)
	        {
	            saturation = 0;
	        }
	        return this.forXY2(function(x,y,data)
	        {
	            var p = Math.sqrt(
	                Math.pow(data[0],2)*jpx.GRAY[0] +
	                Math.pow(data[1],2)*jpx.GRAY[1] +
	                Math.pow(data[2],2)*jpx.GRAY[2]
	            );
	            for(var i = 0; i < 3; ++i)
	            {
	                var val = data[i];
	                var w	= data[i] / 255;// > filter[i])? 1 : 0;
	                data[i] = (w * val) + (1-saturation/2) * (p + (data[i]-p) * saturation);
	            }
	        });
	    },

	    /**
	    *	Adjust RGB channels values.
	    *	@method colorAdjust
		*	@param rgb {Array|Object} The RGB correction vector
		*	@param rgb.r Correction of the red channel
		*	@param rgb.g Correction of the green channel
		*	@param rgb.b Correction of the blue channel
	    *	@chainable
		*	@example
		*		var image = ...
		*		image.colorAdjust({r:0.7,g:1.0,b:1.4});	// I'm blueish !
		*		image.colorAdjust([1.5,0.8,1.2]);		// I'm pinky !
	    */
	    colorAdjust			: function(rgb){
	        if(!jpx.utils.isArray(rgb))
	        {
	            rgb = [rgb.r, rgb.g, rgb.b];
	        }
	        return this.forXY2(function(x,y,data)
	        {
	            for(var i = 0; i < 3; ++i)
	            {
	                data[i] *= (1 + rgb[i]);
	            }
	        });
	    },

	    /**
	    *	Apply vintage effect to the image.
	    *	@method vintage
	    *	@chainable
	    */
	    vintage 		: function(){
	        return this
	            .desaturate()
	            .brightness({contrast:0.3})
	            .sepia()
	            .lighten(0.4)
	            ;
	    },

	    /**
		*	Love filter. Get ready to fall in love
	    *	@method love
	    *	@chainable
	    */
	    love 			: function(){
	        return this
	            .saturation(0.5)
	            .lighten(0.1)
	            .colorAdjust([0.2,0,0.2])
	            .brightness({contrast:0.1})
	            .lighten(0.1)
	            ;
	    },

	    /**
		*	Apply a blueish tone on the dark parts of the image
	    *	@method bluetify
	    *	@chainable
	    */
	    blutify			: function(){
	        return this.forXY2(function(x,y,data)
	        {
	            var G = 0;
	            for(var i = 0; i < 3; ++i)
	            {
	                G += 0.3*data[i];
	            }
	            data[0] += data[0] / 25;
	            data[1] += data[1] / 25;
	            data[2] += (255 - G) / 10;
	        });
	    },

	    /**
	    *
	    *	@method grungy
	    *	@chainable
	    */
	    grungy 			: function(){
	        return this
	            .lighten(0.5)
	            .saturation(1-15/255)
	            .brightness({contrast:0.25})
	            ;
	    },

	    /**
	    *	@method lightVintage
	    *	@chainable
	    */
	    lightVintage 	: function(){
	        return this
	            .brightness({contrast:0.1})
	            .sepia()
	            .love()
	            .lighten(0.2)
	            ;
	    },

		/**
		*	Apply a blooming effect on the image
		*	@method bloom
		*	@chainable
		*/
		bloom 		: function()
		{
			var kernel = BLOOM_KERNEL;
			var lowPass = this.clone().repeat('convolve', 10, kernel);
			var coarse  = this.clone().sub(lowPass);
			return this.fill(0).add(lowPass.mul(1.4)).add(coarse.mul(1));
		},

		/**
		*	Sharpen the image
		*	@method sharpen
		*	@param {Number} amount
		*	@param {Kernel}	lowPassKernel Kernel used to apply the low-pass filtering
		*	@chainable
		*/
		sharpen 		: function(amount, ker)
		{
			if((typeof amount) != 'number')
			{
				ker		= amount.ker || ker;
				amount	= amount.amount || 1;
			}
			var kernel = ker || SHARPEN_KERNEL;
			var lowPass = this.clone().repeat('convolve', 1, kernel);
			var coarse  = this.clone().sub(lowPass);
			return this.fill(0).add(lowPass).add(coarse.mul(amount));
		},

	    /**
	    *	Evaluate a filter sequence from a string.
	    *	@method eval
	    *	@param {String} filters The filter sequence.
	    *	@chainable
	    *	@example
		*		//
		*		//	Example script
		*		//-------------------------------
		*		//	brightness:brightness=0.5
		*		//	sepia
		*		//	lighten
		*		//
		*		var script	= "";
	    *		script += "brightness:brightness=0.5\n";
	    *		script += "sepia\n";
		*		script += "lighten\n";
	    *		var image	= new jpx.Image.load('my/image.png', function()
		*		{
		*			this.eval(script).output('output');
		*		});
	    */
	    eval 			: function(filters, codes){
	        var name	= '';
	        var code	= 'var ';
	        var lines = filters.split("\n");
	        console.info('Filters : ', lines);
	        var self = this;
	        lines.forEach(function(line,i)
	        {
	            if(line[0] == '#')
	            {
	                name = line.substr(1);
	                code += (name + ' = function(){ return this');
	                return;
	            }

	            var split		= line.split(":");
	            var command		= split[0].trim();

	            //	Ignore empty commands
	            if(!self[command]) return;

	            code += '.' + command + '(';

	            // Command contains parameters
	            if(split.length > 1)
	            {
	                var paramsstr = split[1].trim().split(",");
	                var params = {};
	                code += '{';
	                paramsstr.forEach(function(param,pi)
	                {
	                    var s = param.split("=");
	                    var name = s[0];
	                    var val  = parseFloat(s[1]);
	                    params[name] = val;
	                    code += '"'+name+'" : ' + val;
	                    if(pi < paramsstr.length - 1){ code += ','; }
	                });
	                self[command](params);
	                code += '}';
	            }
	            // Command without parameters
	            else
	            {
	                self[command]();
	            }

	            code += ')';
	        });
	        code += ';};';
	        codes[0] = code;
	        return this;
	    }
	});
	return jpx;
})();
