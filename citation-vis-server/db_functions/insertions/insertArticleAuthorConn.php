<?php
require_once(dirname(__FILE__) . '/isArticleAuthorConnInDb.php');

function insertArticleAuthorConn(PDO $pdo, string $article_id, string $author_id): int {
  $conn_id = isArticleAuthorConnInDb($pdo, $article_id, $author_id);

  if (!$conn_id) {
    $insertConnQuery = 'INSERT
      INTO conn_article_author (article_id, author_id)
      VALUES (:aid, :auid)';
    $insertConnStmt = $pdo->prepare($insertConnQuery);
    $insertConnStmt->execute(
      array(
        ':aid' => $article_id,
        ':auid' => $author_id,
      )
    );

    return $pdo->lastInsertId();
  }

  return $conn_id;
}
?>
