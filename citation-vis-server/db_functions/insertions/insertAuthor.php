<?php
require_once(dirname(__FILE__) . '/isAuthorInDb.php');

function insertAuthor(
  PDO $pdo,
  string $a_id,
  $author_given_name,
  $author_surname,
  int $citations = NULL
): int {
  $author_id = isAuthorInDb($pdo, $a_id);

  if (!$author_id) {
    $insertAuthorQuery = 'INSERT
      INTO author (author_id, author_given_name, author_surname, citations)
      VALUES (:auid, :agn, :asn, :ct)';
    $insertAuthorStmt = $pdo->prepare($insertAuthorQuery);
    $insertAuthorStmt->execute(
      array(
        ':auid' => $a_id,
        ':agn' => $author_given_name,
        ':asn' => $author_surname,
        ':ct' => $citations,
      )
    );

    return $pdo->lastInsertId();
  }

  return $author_id;
}
?>
