<?php
require_once(dirname(__FILE__) . '/isArticleSubjectConnInDb.php');

function insertArticleSubjectConn(PDO $pdo, string $article_id, string $subject_id): int {
  $conn_id = isArticleSubjectConnInDb($pdo, $article_id, $subject_id);

  if (!$conn_id) {
    $insertConnQuery = 'INSERT
      INTO conn_article_subject (article_id, subject_id)
      VALUES (:aid, :stid)';
    $insertConnStmt = $pdo->prepare($insertConnQuery);
    $insertConnStmt->execute(
      array(
        ':aid' => $article_id,
        ':stid' => $subject_id,
      )
    );

    return $pdo->lastInsertId();
  }

  return $conn_id;
}
?>
