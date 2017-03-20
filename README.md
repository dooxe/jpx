![jpx logo](http://dooxe-creative.net/projects/jpx/assets/images/logo.png)

# jpx

**jpx** is a javascript image processing toolkit.

* [API documentation](http://dooxe-creative.net/projects/jpx/docs/api/index.html)

## Get started

```html
<!DOCTYPE html>
<html>
    <head>
        <script src="jpx.js"/>
    </head>
    <body>
        <canvas id="output-canvas"></canvas>
        <script>
            var image = new jpx.Image("my/super/image.png",function()
            {
                this.sepia().output('output-canvas');
            });
        </script>
    </body>
</html>
```

## jipl : javascript image processing language

This "pre-processor" language for javascript introduce several commands that makes
the image processing development with jpx easier.

See [the language](http://dooxe-creative.net/projects/jpx/docs/api/classes/jipl.html) for more details about this language.

### Use jipl in webpages

jpx toolkit provider a small jipl compiler that translate jipl to javascript. You 
can use it inside your own web pages like the following:

```html
<!DOCTYPE html>
<html>
    <head>
        <script src="jpx/jpx.js"/>
        <script src="jpx/jiplc.js"/>
    </head>
    <body>
        <script type="text/jpx-jipl">
            var image = new jpx.Image("my/super/image.png",function()
            {
                foreach pixel p in image
                    var data = @data[p.index];
                    @data[p.index] = Math.max(0,Math.min(data,255));
                /foreach
            });
        </script>
        <script type="text/javascript">
            jiplc.run();
        </script>
    </body>
</html>
```
