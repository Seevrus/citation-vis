<?php
require_once(dirname(__FILE__) . '/isCitingCitedConnInDb.php');

function insertCitingCitedConn(PDO $pdo, string $citing_id, string $cited_id): int {
  $conn_id = isCitingCitedConnInDb($pdo, $citing_id, $cited_id);

  if (!$conn_id) {
    $insertConnQuery = 'INSERT
      INTO conn_citing_cited (citing_id, cited_id)
      VALUES (:c1id, :c2id)';
    $insertConnStmt = $pdo->prepare($insertConnQuery);
    $insertConnStmt->execute(
      array(
        ':c1id' => $citing_id,
        ':c2id' => $cited_id,
      )
    );

    return $pdo->lastInsertId();
  }

  return $conn_id;
}
?>
