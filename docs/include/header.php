<!DOCTYPE html>
<html>
    <head>
        <title>jpx - js image processing library</title>
        <meta charset="utf-8"/>
        <link href='https://fonts.googleapis.com/css?family=Droid%20Sans%20Mono|Ropa%20Sans' rel='stylesheet' type='text/css'>
        <link rel="stylesheet" type="text/css" href="css/core.css"/>
		<script src="libs/jquery.min.js"></script>
		<script src="libs/prettify/run_prettify.js?skin=sons-of-obsidian"></script>
		<link rel="stylesheet" type="text/css" href="css/prettyprint.css"/>
        <link rel="icon" type="image/png" href="jpx/yuidoc-theme-blue-dc/assets/favicon.png" />
        <script src="jpx/src/jpx.js"></script>
    </head>
    <body>
        <div id="jpx-main">
            <div id="jpx-header">
                <div style="margin-bottom:20px">
                    <a href="?p=home" style="display:inline-block;float:left;margin-right:20px">
                        <img src="jpx/yuidoc-theme-blue-dc/assets/logo.png" width="90"/>
                    </a>
                    <div>
                        <div style="font-size:2.5em;margin-bottom:10px">jpx</div>
                        <span style="font-size:1.5em">image processing ... in javascript</span>
                    </div>
                    <div style="clear:both"></div>
                </div>
                <nav>
                    <ul style="margin:0">
                        <li><a href="?p=home" <?php if($page == 'home') echo "class='active'"; ?>>Home</a></li>
                        <li><a href="?p=download" <?php if($page == 'download') echo "class='active'"; ?>>Download</a></li>
                        <li><a href="?p=getstarted" <?php if($page == 'getstarted') echo "class='active'"; ?>>Get started</a></li>
                        <li><a href="?p=examples" <?php if($page == 'examples') echo "class='active'"; ?>>Examples</a></li>
                        <li><a href="jpx/docs/api" target="_blank">Documentation</a></li>
                        <?php
                        // <li><a href="https://daisy.users.greyc.fr/projects/impix/">impix</a></li>
                        ?>
                    </ul>
                </nav>
            </div>
            <div id="jpx-body">
