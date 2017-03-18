<?php

$page = 'home';
if(isset($_GET['p']))
{
    $page = $_GET['p'];
}

$page_file = 'pages/' . $page . '.php';
if(!file_exists($page_file))
{
    $page_file = 'pages/404.php';
}

require_once('include/header.php');
require_once($page_file);
require_once('include/footer.php');
?>
