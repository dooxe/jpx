<h1>Examples</h1>
<style>
#jpx-demos
{
    font-size                   : 0.85em;
}
</style>
<div id="jpx-examples">
    <?php require_once('views/examples.html'); ?>
</div>


<?php
/*
<div style="width:48%;float:left;text-align:center;">
    Input<br/>
    <img style="max-width:100%" src="assets/images/sample.jpg"/>
</div>
<div style="width:48%;float:right;text-align:center;">
    Output<br/>
    <canvas id="output" style="max-width:100%" width="480" height="320"></canvas>
</div>
<div style="clear:both"></div>
<script>
var image = new jpx.Image();
image.load('assets/images/sample.jpg', function()
{
    image.output('output');
});

var apply = function(name)
{
    var clone = image.clone();
    clone[name].call(clone).output('output');
};

</script>
<div style="background-color:#113955;padding:5px;text-align:center">
<button onclick="apply('sepia')">Sepia</button>
<button onclick="apply('love')">Love</button>
<button onclick="apply('lightVintage')">Light vintage</button>
<button onclick="apply('grungy')">Grungy</button>
<button onclick="apply('blutify')">Blutify</button>
</div>
<p>
    You can try event more filter with
    <a href="https://daisy.users.greyc.fr/projects/impix/">impix</a>
    image editor.
</p>
*/
?>
