(function ()
{
	'use strict';

    /**
	*	jipl stands for
	*	<b style="color:#4499DD">J</b>avascript
	*	<b style="color:#4499DD">I</b>mage
	*	<b style="color:#4499DD">P</b>rocessing
	*	<b style="color:#4499DD">L</b>anguage.
	*
	*	It provides a specific syntax to make image processing tasks easier,
    *   and more efficient.
	*
	*	<h2>Loops</h2>
	*
	*	<h3>`foreach(position p) in image`</h3>
	*	Loops over image pixel positions.
	*	```javascript
	*	foreach(position p) in image
	*		// Do something with p.x, p.y
	*	/foreach
	*	```
	*
	*	<h3>`foreach(channel c) in image`</h3>
	*	Loops over image channels.
	*	```javascript
	*	foreach(channel c) in image
	*		// Do something with c
	*	/foreach
	*	```
	*
	*	<h3>`foreach(pixel p) in image`</h3>
	*	Loops over all image pixels.
	*	```javascript
	*	foreach(pixel p) in image
	*		// Do something with p.x, p.y, p.c, p.index
	*	/foreach
	*	```
	*
	*	<h2>Helpers</h2>
	*	<h3>`@` as `this.`</h3>
	*	Within a function, you can use the symbol `@` that aliases "`this.`".
	*
	*	Example:
	*	```javascript
	*	var image = new jpx.Image('my/super/image.png',function()
	*	{
	*		foreach(pixel p) in this
	*			var index = index;
	*			var value = `@`data[index]; // this.data[index]
	*			`@`data[index] = value / 2 + 10 * p.c;
	*		/foreach
	*	});
	*	```
    *   @class jipl
	*/
    /**
    *   `jipl` to `javascript` compiler.
	*  @class jiplc
	*/
    var jiplc =
    {
        /**
		*	Compile from jipl to javascript.
		*	@static
		*	@method compile
		*	@param {String}	jipl The script to be compiled
		*	@return {String} Javascript code resulting of the compilation
		*	@example
		*		var image = new jpx.Image('my/super/image.png', function()
		*		{
		*			var code = jiplc.compile(
		*				"foreach(channel c) in image\n"	+
		*				"	console.log(c);\n"			+
		*				"/foreach \n"
		*			);
		*			eval(code);
		*		});
		*/
        compile : function(jipl)
        {
            return jipl

				//	Remove comments
				.replace(/(\/\*([\s\S]*?)\*\/)|(\/\/(.*)$)/gm, '')

				//	@ -> this.
                .replace(/@/gm, 'this.')

				//
				//	foreach position p in image
				//		//
				//	/foreach
				//
                .replace(/foreach[ \t]position[ \t]+([a-zA-Z_]+)[ \t]+in[ \t]+([a-zA-Z_]+[a-zA-Z0-9_]*)/gm,
                    "for(var $1 = {x:0,y:0}; $1.y<$2.height;++$1.y)\n\t"+
                    "for($1.x=0;$1.x<$2.width;++$1.x){")

				//
				//	foreach channel c in image
				//		//
				//	/foreach
				//
				.replace(/foreach[ \t]+channel[ \t]+([a-zA-Z_]+)[ \t]+in[ \t]+([a-zA-Z_]+[a-zA-Z0-9_]*)/gm, 'for(var $1=0;$1<$2.spectrum;++$1){')

				//
				.replace(/foreach[ \t]+pixel[ \t]+([a-zA-Z_]+)[ \t]+in[ \t]+([a-zA-Z_]+[a-zA-Z0-9_]*)/gm,
                    "for(var $1 = {x:0,y:0,c:0,index:0,data:[]};$1.y<$2.height;++$1.y)\n"+
                    "for($1.x=0;$1.x<$2.width;++$1.x)\n"+
                    "for($1.c=0;$1.c<$2.spectrum;++$1.c){\n"+
                    "$1.index=($1.x+$1.y*$2.width)*$2.spectrum+$1.c;\n")

				//
				//	foreach value index,v in image
				//
				//	/foreach
				//
                .replace(/foreach[ \t]+value[ \t]+(([a-zA-Z_]+),)?([a-zA-Z_]+)[ \t]+in[ \t]+([a-zA-Z_]+[a-zA-Z0-9_]*)/gm,
                    'for(var $2 = 0, $3=0; $2 < $4.data.length; ++$2,$3=$4.data[$2]){')


				//.replace(/foreach\(position[ \t]+([a-zA-Z_]+)[ \t]+within\(([$A-Z_][0-9A-Z_$]*),([$A-Z_][0-9A-Z_$]*),([$A-Z_][0-9A-Z_$]*),([$A-Z_][0-9A-Z_$]*)\)\)[ \t]+in[ \t]+([a-zA-Z_]+[a-zA-Z0-9_]*)/gm,
                //    "for(var $1 = {x:$2,y:$3}; $1.y<$5.height;++$1.y)\n\t"+
                //    "for($1.x=0;$1.x<$4;++$1.x){")

				//
				//	<value|defaultvalue>
				//	if 'value' not defined, use 'defaultvalue'
				//
				.replace(/\(\((.*)\|(.*)\)\)/g,"((typeof $1==='undefined')?$2:$1)")

				//	/foreach => }
				.replace(/\/foreach/g,'}');
        }
    };

	//
    //  NodeJS
	//
    if(typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    {
        module.exports = jiplc;
    }
	//
    //  Browser
	//
    else
    {
        /**
        *   <b>[ BROWSER ONLY ]</b>
        *   <p>
		*	Compile each jipl script within the page.
		*	`jpx-jipl` scripts must have type `text/jpx-jipl`.
        *   </p>
		*	@static
		*	@method run
		*	@example
		*		<script type="text/jpx-jipl">
		*			var I = new jpx.Image('my/super/image.jpg', function()
		*			{
		*				foreach(pixel p) in this
		*					var i = p.index;
		*					var d = `@`data[i];
		*					`@`data[i] = d / 2;
		*				/foreach
		*			});
		*		</script>
		*		<script>
		*			jpx.jipl.run();
		*		</script>
		*/
		jiplc.run = function()
		{
			var scripts = document.getElementsByTagName('script');
			for(var i = 0; i < scripts.length; ++i)
			{
				var s    = scripts[i];
				var type = s.getAttribute('type');
				if(type == 'text/jpx-jipl')
				{
					var newJS = document.createElement('script');
					newJS.setAttribute('type', 'text/javascript');
					var js = jiplc.compile(s.innerHTML);
					var text = document.createTextNode(js);
					newJS.appendChild(text);
					s.parentNode.insertBefore(newJS,s.nextSibling);
				}
			}
		};
        window.jiplc = jiplc;
    }
})();
