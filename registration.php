<?php
include("config.php");
$sqlString = $_POST["sqlString"];
$_Q = mysqli_query($connections, $sqlString);
?>