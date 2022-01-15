<?php
function isArticleSubjectConnInDb(PDO $pdo, int $article_id, int $subject_id) {
  $selectConnQuery = 'SELECT *
    FROM conn_article_subject
    WHERE article_id = :aid AND subject_id = :stid';
  $selectConnStmt = $pdo->prepare($selectConnQuery);
  $selectConnStmt->execute(
    array(
      ':aid' => $article_id,
      ':stid' => $subject_id,
    )
  );

  $connRow = $selectConnStmt->fetch(PDO::FETCH_OBJ);

  if (!$connRow) return false;

  return $connRow->id;
}
?>
