<?php
function isSubjectInDb(PDO $pdo, string $code) {
  $selectSubjectQuery = 'SELECT *
    FROM csubject
    WHERE code = :cd';
  $selectSubjectStmt = $pdo->prepare($selectSubjectQuery);
  $selectSubjectStmt->execute(
    array(
      ':cd' => $code
    )
  );

  $subjectRow = $selectSubjectStmt->fetch(PDO::FETCH_OBJ);

  if (!$subjectRow) return false;

  return $subjectRow->id;
}
?>
