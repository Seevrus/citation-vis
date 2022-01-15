<?php
function isUniversityInDb(PDO $pdo, string $university_name) {
  $selectUniversityQuery = 'SELECT *
    FROM university
    WHERE u_name = :un';
  $selectUniversityStmt = $pdo->prepare($selectUniversityQuery);
  $selectUniversityStmt->execute(
    array(
      ':un' => $university_name
    )
  );

  $universityRow = $selectUniversityStmt->fetch(PDO::FETCH_OBJ);

  if (!$universityRow) return false;

  return $universityRow->id;
}
?>
