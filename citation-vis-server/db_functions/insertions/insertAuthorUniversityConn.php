<?php
require_once(dirname(__FILE__) . '/isAuthorUniversityConnInDb.php');

function insertAuthorUniversityConn(PDO $pdo, string $author_id, string $u_id): int {
  $conn_id = isAuthorUniversityConnInDb($pdo, $author_id, $u_id);

  if (!$conn_id) {
    $insertConnQuery = 'INSERT
      INTO conn_author_university (author_id, university_id)
      VALUES (:auid, :uid)';
    $insertConnStmt = $pdo->prepare($insertConnQuery);
    $insertConnStmt->execute(
      array(
        ':auid' => $author_id,
        ':uid' => $u_id,
      )
    );

    return $pdo->lastInsertId();
  }

  return $conn_id;
}
?>
