<?php
function isAuthorUniversityConnInDb(PDO $pdo, int $author_id, int $u_id) {
  $selectConnQuery = 'SELECT *
    FROM conn_author_university
    WHERE author_id = :auid AND university_id = :unid';
  $selectConnStmt = $pdo->prepare($selectConnQuery);
  $selectConnStmt->execute(
    array(
      ':auid' => $author_id,
      ':unid' => $u_id,
    )
  );

  $connRow = $selectConnStmt->fetch(PDO::FETCH_OBJ);

  if (!$connRow) return false;

  return $connRow->id;
}
?>
