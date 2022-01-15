<?php
function selectJournal(PDO $pdo, int $article_id) {
  $selectJournalQuery = 'SELECT
    j.title, j.publisher
    FROM journal j
    JOIN article a ON j.id = a.journal_id
    WHERE a.id = :aid';
  
  $selectJournalStmt = $pdo->prepare($selectJournalQuery);
  $selectJournalStmt->execute(
    array(
      ':aid' => $article_id,
    )
  );

  return $selectJournalStmt->fetch(PDO::FETCH_OBJ);
}
?>
