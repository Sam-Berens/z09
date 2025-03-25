<?php
header('Content-Type: application/json');
require __DIR__ . '/Credentials.php';

// Connect to the database:
$Conn = new mysqli($Servername, $Username, $Password, $Dbname);
if ($Conn->connect_error) {
	die("Connection failed: " . $Conn->connect_error);
}

$Input = json_decode(file_get_contents('php://input'), true);

// Unpack all the inputs:
$SubjectId = $Input['SubjectId'];
$SubjectId = mysqli_real_escape_string($Conn,$SubjectId);

$SeqAFirst = $Input['SeqAFirst'];
$SeqAFirst = mysqli_real_escape_string($Conn,$SeqAFirst);

$ImgAFirst = $Input['ImgAFirst'];
$ImgAFirst = mysqli_real_escape_string($Conn,$ImgAFirst);

$ImgPermA = $Input['ImgPermA'];
$ImgPermA = mysqli_real_escape_string($Conn,$ImgPermA);

$ImgPermB = $Input['ImgPermB'];
$ImgPermB = mysqli_real_escape_string($Conn,$ImgPermB);

// Create the SQL request
$Sql = "CALL RecordRegister('$SubjectId',$SeqAFirst,$ImgAFirst,'$ImgPermA','$ImgPermB')";

// Run the query:
if (!($Conn->query($Sql))) {
    $Conn->close();
    die('Query Sql failed to execute successfully;');
}

$Conn->close();
?>