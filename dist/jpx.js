/*
* MIT License
*
* Copyright (c) 2017 Maxime Daisy
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*/

var jpx = (function()
{
	'use strict';

	
	var canvas		= document.createElement('canvas');

	
	var context		= canvas.getContext('2d');

	
	var HTMLImage	= Image;

	
	var plugins		= [];

	
	var PixelArray	= Array;

	
	var createDataFromCanvas	= function(w,h)
	{
		canvas.width	= w;
		canvas.height	= h;
		var img = context.getImageData(0,0,w,h);
		return img.data;
	};

	
	var jpx = {

		
		GRAY 		: [0.299,0.587,0.114],

		
		SEPIA		: [0.799,0.387,0.114],

		
		
		
		Error : (function(){
			var jpxError = function(f,message)
			{
				this.name		= 'jpx.Error';
				this.message	= '[' + f + ']' + (message? ' - ' + message : '');
			};
			jpxError.prototype = Error.prototype;
			return jpxError;
		})(),

		
		time 		: function()
		{
			return Date.now();
		},

		
		exit			: function()
		{
			throw new jpx.Error('Exiting');
		},

		
		addPlugin		: function(plugin){
			
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

		
		defineFilter : function(name, parameters,filterCode)
		{
			jpx.addPlugin((function(name,params,filterCode)
			{
				var defaults = {};
				for(var i = 0; i < params.length; ++i)
				{
					var p = params[i];
					defaults[p.name] = p.defaultValue;
				}
				var plugin = {};
				plugin[name] = function(P)
				{
					var p = defaults;
					for(var n in P)
					{
						p[n] = jpx.utils.getDefault(P[n],defaults[n]);
					}
					return filterCode.call(this,p);
				};
				return plugin;
			})(name,parameters,filterCode));
		},

		
		Kernel : function(w,h,data,normalize){
			if(normalize)
			{
				var
					min = Infinity,
					max = 0
				;
				for(var i = 0; i < data.length; ++i)
				{
					var d = data[i];
					if(d < min){
						min = d;
					}
					if(d > max){
						max = d;
					}
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

		
		utils 		: {
			
			derive			: function(o1,o2){
				for(var p in o2)
				{
					o1[p] = o2[p];
				}
				return o1;
			},

			
			isArray 		: function(suspect)
			{
				return (Object.prototype.toString.call(suspect) === '[object Array]');
			},

			
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

	
	jpx.Kernel.prototype.at = function(x,y)
	{
		return this.data[x+y*this.width];
	};

	
	var
		BLOOM_KERNEL	= new jpx.Kernel(3,3,[1,1,1,1,1,1,1,1,1],true),
		SHARPEN_KERNEL	= new jpx.Kernel(3,3,[1,1,1,1,1,1,1,1,1],true)
	;

	
	jpx.utils.derive(jpx, {
		
		Image 			: (function()
		{
			var Image	= function(init)
			{
				init = jpx.utils.getDefault(init,{});
				jpx.utils.derive(this,
				{
					
					data			: [],

					
					imageBase		: null,
				});

				
				if(typeof init === 'number')
				{
					var w = jpx.utils.getDefault(arguments[0],1);
					var h = jpx.utils.getDefault(arguments[1],1);
					var s = jpx.utils.getDefault(arguments[2],1);
					this.create(w,h,s);
				}
				
				else if(typeof init === 'string')
				{
					var onload = arguments[1];
					this.load(init, onload? onload : null);
				}
			};

			
			jpx.utils.derive(Image.prototype, {
				
				create 		: function(w,h,s)
				{
					this.width		= w? w : 1;
					this.height 	= h? h : 1;
					this.spectrum	= s? s : 1;
					this.length		= w*h*s;
					if(this.spectrum === 4)
					{
						this.data = createDataFromCanvas(w,h);
					}
					else
					{
						this.data = new PixelArray(this.length);
					}
					return this.fill(0);
				},

				
				load		: function(src, complete){
					var self	= this;
					var image	= new HTMLImage();
					image.onload = function()
					{
						var w = this.width;
						var h = this.height;
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
						if(complete)
						{
							complete.call(self, null);
						}
					};
					image.src = src;
					this.imageBase = image;
					return self;
				},

				
				clone 			: function(){
					var clone = new jpx.Image(this.width,this.height,this.spectrum);
					clone.imageBase = this.imageBase;
					return clone.copy(this);
				},

				
				copy 			: function(image){
					if(image.data.length !== this.data.length)
					{
						throw new jpx.Error('Image.copy', 'images must have the same dimension');
					}
					for(var i = 0, v=0; i < image.data.length; ++i,v=image.data[i]){
						this.data[i] = v;
					}
					return this;
				},

				
				index 		: function(x,y,c){
					return (x+jpx.utils.getDefault(y,0)*this.width)*this.spectrum + jpx.utils.getDefault(c,0);
				},

				
				resize 			: function(w,h){
					w = Math.floor(w);
					h = Math.floor(h);
					var pixels = new Array(this.length);
					for(var i = 0; i < this.length; ++i){
						pixels[i] = this.data[i];
					}

					var W	= this.width;
					var H	= this.height;
					this.width 	= w;
					this.height = h;
					this.data	= new Array(w*h*this.spectrum);

					for(var p = {x:0,y:0}; p.y<this.height;++p.y)
	for(p.x=0;p.x<this.width;++p.x){
						var
							x = p.x,
							y = p.y,
							i = this.index(x,y),
							ox = Math.round(x*W/w),
							oy = Math.round(y*H/h),
							oi = (ox+oy*W)*this.spectrum
						;
						for(var c=0;c<this.spectrum;++c){
							this.data[i+c] = pixels[oi+c];
						}
					}
					return this;
				},

				
				crop 			: function(x,y,w,h){
					var data = new Array(w*h*this.spectrum);
					this.forInXY(x,y,x+w,y+h,function(p)
					{
						var ni = ((p.x-x) + (p.y-y)*w) * this.spectrum;
						for(var c = 0; c < this.spectrum; ++c)
						{
							data[ni+c] = this.data[p.i+c];
						}
					});
					this.data	= data;
					this.width	= w;
					this.height	= h;
					return this;
				},

				
				crop2 			: function(x1,y1,x2,y2){
					var x = Math.min(x1,x2);
					var y = Math.min(y1,y2);
					var w = Math.abs(x2-x1);
					var h = Math.abs(y2-y1);
					return this.crop(x,y,w,h);
				},

				
				
				fill 		: function(data){
					if(typeof data === 'number'){
						data = [data];
					}
					return this.forXY(function(p)
					{
						for(var c = 0; c < this.spectrum; ++c)
						{
							this.data[p.i+c] = data[c%data.length];
						}
					});
				},

				
				toDataURL		: function(){
					canvas.width = this.width;
					canvas.height= this.height;
					context.putImageData(this.getImageData(),0,0);
					return canvas.toDataURL();
				},

				
				getImageData 	: function(){
					var imageData	= context.createImageData(this.width,this.height);
					var pixels		= imageData.data;
					for(var p = {x:0,y:0}; p.y<this.height;++p.y)
	for(p.x=0;p.x<this.width;++p.x){
						var i = (p.x+p.y*this.width);
						for(var c=0;c<this.spectrum;++c){
							pixels[i*4+c] = this.data[i*this.spectrum+c];
						}
						pixels[i*4+3] = 255;
					}
					return imageData;
				},

				
				getHTMLImage		: function()
				{
					var image = new HTMLImage();
					image.src = this.toDataURL();
					return image;
				},

				
				
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

				
				forXY			: function(forxy){
					var p = {
						x : 0,
						y : 0,
						i : 0
					};
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

				
				forC		: function(forC){
					if(!forC) return;
					for(var c=0;c<this.spectrum;++c){
						forC.call(this,c);
					}
					
					return this;
				},

				
				getHistogram		: function(length)
				{
					var H = new Array(this.spectrum);
					for(var c=0;c<this.spectrum;++c){
						var hc = H[c] = new Array(length);
					}
					for(var p = {x:0,y:0,c:0,index:0,data:[]};p.y<this.height;++p.y)
for(p.x=0;p.x<this.width;++p.x)
for(p.c=0;p.c<this.spectrum;++p.c){
p.index=(p.x+p.y*this.width)*this.spectrum+p.c;

						H[p.c][parseInt(this.data[p.index])]++;
					}
				},

				
				convolve            : function(kernel)
                {
                    var r = parseInt(kernel.width / 2);
					return this.forXY2(function(x,y,data)
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

				
				repeat 			: function(filter,n,params)
				{
					for(var i = 0; i < n; ++i)
					{
						this[filter](params);
					}
					return this;
				},

				
				applyFilters	: function(filters)
				{
					for(var filterName in filters)
					{
						this[filterName](filters[filterName]);
					}
					return this;
				},

				
				dispose 		: function()
				{
					this.data		= null;
					this.imageBase	= null;
				}
			});

			
			jpx.utils.derive(Image, {
				
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

	
	
	
	jpx.addPlugin({
		
		
		add	: function(other)
		{
			var self = this;
			if(typeof other === 'number')
			{
				self.data.forEach(function(d,i){self.data[i]+=other;});
				return this;
			}
			self.data.forEach(function(d,i){self.data[i]+=other.data[i];});
			return self;
		},
		
		
		sub : function(other)
		{
			var self = this;
			if(typeof other === 'number')
			{
				return self.add(-other);
			}
			self.data.forEach(function(d,i){self.data[i]-=other.data[i];});
			return self;
		},
		
		
		mul : function(other)
		{
			var self = this;
			if(typeof other === 'number')
			{
				self.data.forEach(function(d,i){self.data[i]*=other;});
				return this;
			}
			self.data.forEach(function(d,i){self.data[i]*=other.data[i];});
			return self;
		}
	});

	
	jpx.addPlugin({
	    
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

		
	    desaturate		: function(params){
			params	= ((typeof params==='undefined')?{}:params);
	        var m	= ((typeof params.method==='undefined')?"mean":params.method);
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

	    
	    pixelate		: function(p){
	        if(typeof p !== 'number')
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

	    
	    sepia 			: function(){
	        return this.desaturate().forXY2(function(x,y,data)
	        {
	            for(var i = 0; i < 3; ++i)
	            {
					var v = data[i];
	                data[i] = jpx.SEPIA[i] * data[i];
					data[i] += 0.5 * v;
	            }
	        });
	    },

	    
	    brightnessContrast 		: function(properties){
	        properties = ((typeof properties==='undefined')?{}:properties);
	        var C = ((typeof properties.contrast==='undefined')?0:properties.contrast);
			var B = ((typeof properties.brightness==='undefined')?0:properties.brightness);
	        return this.forXY2(function(x,y,data)
	        {
	            for(var i = 0; i < 3; ++i)
	            {
	                data[i] = (B * 255) + (1 + C) * data[i];
	            }
	        });
	    },

	    
	    lighten 		: function(factor){
	        if(typeof factor !== 'number')
	        {
	            factor = jpx.utils.getDefault(factor.factor,0.1);
	        }
	        return this.forXY2(function(x,y,data)
	        {
	            for(var i = 0; i < 3; ++i)
	            {
	                data[i] = (1+factor)*data[i];
	            }
	        });
	    },

	    
	    equalize		: function(){
	        var Imin = {r:255,g:255,b:255};
	        var Imax = {r:0,g:0,b:0};
	        return this.forXY2(function(x,y,data)
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

	    
	    saturation 		: function(p){
	        var saturation = p;
	        if(typeof saturation !== 'number')
	        {
	            saturation = p.amount || 1;
	            if(p.amount === 0)
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

	    
	    
	    
	    
	    
	    
	    
	    
	    
	    
	    selectiveSaturation		: function(p){
	        var saturation = (typeof p.saturation === 'undefined')? 1 : p.saturation;
	        var filter = [
	            ((typeof p.r === 'undefined')? 1 : p.r),
	            ((typeof p.g === 'undefined')? 1 : p.g),
	            ((typeof p.b === 'undefined')? 1 : p.b)
	        ];
	        if(p.amount === 0)
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
	                var w	= data[i] / 255;
	                data[i] = (w * val) + (1-saturation/2) * (p + (data[i]-p) * saturation);
	            }
	        });
	    },

	    
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

	    
	    vintage 		: function(){
	        return this
	            .desaturate()
	            .brightness({contrast:0.3})
	            .sepia()
	            .lighten(0.4)
	            ;
	    },

	    
	    love 			: function(){
	        return this
	            .saturation(0.5)
	            .lighten(0.1)
	            .colorAdjust([0.2,0,0.2])
	            .brightness({contrast:0.1})
	            .lighten(0.1)
	            ;
	    },

	    
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

	    
	    grungy 			: function(){
	        return this
	            .brightness({luminosity:0.5}).lighten(0.5)
	            .saturation(1-15/255)
	            .brightness({contrast:0.25})
	            ;
	    },

	    
	    lightVintage 	: function(){
	        return this
	            .brightness({contrast:0.1})
	            .sepia()
	            .love()
	            .lighten(0.2)
	            ;
	    },

		
		bloom 		: function()
		{
			var kernel = BLOOM_KERNEL;
			var lowPass = this.clone().repeat('convolve', 10, kernel);
			var coarse  = this.clone().sub(lowPass);
			return this.fill(0).add(lowPass.mul(1.4)).add(coarse.mul(1));
		},

		
		sharpen 		: function(amount, ker)
		{
			if((typeof amount) !== 'number')
			{
				ker		= amount.ker || ker;
				amount	= amount.amount || 1;
			}
			var kernel = ker || SHARPEN_KERNEL;
			var lowPass = this.clone().repeat('convolve', 1, kernel);
			var coarse  = this.clone().sub(lowPass);
			return this.fill(0).add(lowPass).add(coarse.mul(amount));
		},

	    
	    eval 			: function(filters, codes){
	        var name	= '';
	        var code	= 'var ';
	        var lines = filters.split("\n");
	        console.info('Filters : ', lines);
	        var self = this;
	        lines.forEach(function(line,i)
	        {
	            if(line[0] === '#')
	            {
	                name = line.substr(1);
	                code += (name + ' = function(){ return this');
	                return;
	            }

	            var split		= line.split(":");
	            var command		= split[0].trim();

	            
	            if(!self[command]) return;

	            code += '.' + command + '(';

	            
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
