<h1>How should I start ?</h1>

<ol id="jpx-summary"></ol>



<h2 id="download" class="summary-title">
    1. <span class="title">Download</span>
</h2>
If not already done, <a href="?p=download" target="_blank">download</a>
the jpx version you need.

<h2 id="create-webpage" class="summary-title">
    2. <span class="title">Create a web page</span>
</h2>
Create a basic web page like the following:
<xmp id="jpx-simple-webpage" class="prettyprint linenums lang-xml"><!DOCTYPE html>
<html>
    <head>
        <title>My super web page</title>
        <script src="you/path/to/libs/jpx/jpx.js"></script>
    </head>
    <body>
        <canvas id="my-output-canvas"></canvas>
        <script>
            // my scripts can go here !
        </script>
    </body>
</html>
</xmp>

<h2 id="begin-scripting" class="summary-title">
    3. <span class="title">First script</span>
</h2>
<pre class="prettyprint linenums">var image = jpx.Image.load('my/super/image.png', function()
{
    this.sepia().output('my-output-canvas');
});</pre>

<h2 id="create-plugin" class="summary-title">
    4. <span class="title">Implement your own filters : create a plugin !</span>
</h2>
<pre class="prettyprint linenums"><!--
-->// Create a new plugin
var myPlugin = {
    /**
    *   Fill the image with random values
    *   @param {Number} min The minimal value
    *   @param {Number} max The maximal value
    *   @chainable
    */
    myRandom      : function(min,max)
    {
        return this.forXY2(function(x,y,data)
        {
            // keep the alpha channel as is
            for(var i = 0; i < data.length-1; ++i)
            {
                data[i] = min + (max - min) * Math.random();
            }
        });
    }
};
jpx.addPlugin(myPlugin);

var image = jpx.Image.load('my/super/image.png', function()
{
    this.myRandom().output('my-output-canvas');
});</pre>


<script>
//
//  Create a summary automatically
//
$(document).ready(function()
{
    var $summary = $('#jpx-summary');
    $('.summary-title').each(function(i,e)
    {
        var $this   = $(e);
        var $li     = $('<li/>');
        var $a      = $('<a/>');
        var title   = $this.find('.title').html();
        $a.html(title);
        $a.attr('href', '#'+$this.attr('id'));
        $li.append($a);
        $summary.append($li);
    });
});
</script>
