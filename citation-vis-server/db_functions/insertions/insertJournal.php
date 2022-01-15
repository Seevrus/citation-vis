<?php
require_once(dirname(__FILE__) . '/isJournalInDb.php');

function insertJournal(PDO $pdo, string $title, $publisher): int {
  $journal_id = isJournalInDb($pdo, $title);

  if (!$journal_id) {
    $insertJournalQuery = 'INSERT
      INTO journal (title, publisher)
      VALUES (:ttl, :pbs)';
    $insertJournalStmt = $pdo->prepare($insertJournalQuery);
    $insertJournalStmt->execute(
      array(
        ':ttl' => $title,
        ':pbs' => $publisher,
      )
    );

    return $pdo->lastInsertId();
  }

  return $journal_id;
}
?>
