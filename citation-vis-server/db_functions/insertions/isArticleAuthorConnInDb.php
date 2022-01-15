<?php
function isArticleAuthorConnInDb(PDO $pdo, int $article_id, int $author_id) {
  $selectConnQuery = 'SELECT *
    FROM conn_article_author
    WHERE article_id = :aid AND author_id = :auid';
  $selectConnStmt = $pdo->prepare($selectConnQuery);
  $selectConnStmt->execute(
    array(
      ':aid' => $article_id,
      ':auid' => $author_id,
    )
  );

  $connRow = $selectConnStmt->fetch(PDO::FETCH_OBJ);

  if (!$connRow) return false;

  return $connRow->id;
}
?>
