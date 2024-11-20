<?php
include("config.php");
// $sqlString = $_POST["sqlString"];
$_Q = mysqli_query($connections, "SELECT * FROM `users` ");
$row = mysqli_fetch_assoc($_Q);
while ($row = mysqli_fetch_assoc($_Q)) {
    echo "ID: " . $row['id'] . "<br>";
    echo "Имя: " . $row['name'] . "<br>";
    echo "Email: " . $row['email'] . "<br>";
    echo "<hr>";
}

?>