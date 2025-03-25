<?php
header('Content-Type: application/json');
require __DIR__ . '/Credentials.php';

// Connect to the database:
$Conn = new mysqli($Servername, $Username, $Password, $Dbname);
if ($Conn->connect_error) {
	die("Connection failed: " . $Conn->connect_error);
}

$Input = json_decode(file_get_contents('php://input'), true);
if (!$Input) {
	$Input = $_POST; // Only used when testing via MATLAB's webwrite function.
}

// Unpack all the inputs:
$PoolId = $Input['PoolId'];
$PoolId = mysqli_real_escape_string($Conn,$PoolId);
$SubjectId = $Input['SubjectId'];
$SubjectId = mysqli_real_escape_string($Conn,$SubjectId);
$OS = $Input['OS'];
$OS = mysqli_real_escape_string($Conn,$OS);
$Browser = $Input['Browser'];
$Browser = mysqli_real_escape_string($Conn,$Browser);
$ScreenWidth = $Input['ScreenWidth'];
$ScreenWidth = mysqli_real_escape_string($Conn,$ScreenWidth);
$ScreenHeight = $Input['ScreenHeight'];
$ScreenHeight = mysqli_real_escape_string($Conn,$ScreenHeight);

// Generate DateTime_Exclude:
$Now = new DateTimeImmutable("now", new DateTimeZone('Europe/London'));
$DateTime_Exclude = $Now->format('Y-m-d\TH:i:s');

// Create the SQL request
$Sql = "INSERT INTO Exclusions (PoolId, SubjectId, OS, Browser, ScreenWidth, ScreenHeight, DateTime_Exclude) VALUES ('$PoolId', '$SubjectId', '$OS', '$Browser', $ScreenWidth, $ScreenHeight, '$DateTime_Exclude');";

// Run the query:
if (!($Conn->query($Sql))) {
    $Conn->close();
    die('Query Sql failed to execute successfully;');
}

?>