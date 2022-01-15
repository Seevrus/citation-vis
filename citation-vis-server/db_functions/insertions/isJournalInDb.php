<?php
function isJournalInDb(PDO $pdo, string $title) {
  $selectJournalQuery = 'SELECT *
    FROM journal
    WHERE title = :ttl';
  $selectJournalStmt = $pdo->prepare($selectJournalQuery);
  $selectJournalStmt->execute(
    array(
      ':ttl' => $title
    )
  );

  $journalRow = $selectJournalStmt->fetch(PDO::FETCH_OBJ);

  if (!$journalRow) return false;

  return $journalRow->id;
}
?>
