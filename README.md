# jpx

**jpx** is a javascript image processing toolkit

* [API documentation](http://dooxe-creative.net/projects/jpx/api/)

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

## jiplc: an image processing compiler

### Use it in webpages

```html
<!DOCTYPE html>
<html>
    <head>
        <script src="jpx/jpx.js"/>
        <script src="jpx/jiplc.js"/>
    </head>
    <body>
        <script type="text/jipl">
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
