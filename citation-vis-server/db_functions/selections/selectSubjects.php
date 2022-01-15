<?php
function selectSubjects(PDO $pdo, int $article_id) {
  $selectSubjectsQuery = 'SELECT
    s.csubject
    FROM csubject s
    JOIN conn_article_subject cas ON s.id = cas.subject_id
    JOIN article a ON cas.article_id = a.id
    WHERE a.id = :aid';
  
  $selectSubjectsStmt = $pdo->prepare($selectSubjectsQuery);
  $selectSubjectsStmt->execute(
    array(
      ':aid' => $article_id,
    )
  );

  return $selectSubjectsStmt->fetchAll(PDO::FETCH_COLUMN);
}
?>
