<?php
function isAuthorInDb(PDO $pdo, string $a_id) {
  $selectAuthorQuery = 'SELECT *
    FROM author
    WHERE author_id = :auid';
  $selectAuthorStmt = $pdo->prepare($selectAuthorQuery);
  $selectAuthorStmt->execute(
    array(
      ':auid' => $a_id
    )
  );

  $authorRow = $selectAuthorStmt->fetch(PDO::FETCH_OBJ);

  if (!$authorRow) return false;

  return $authorRow->id;
}
?>
