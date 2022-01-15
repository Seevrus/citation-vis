<?php
function isCitingCitedConnInDb(PDO $pdo, int $citing_id, int $cited_id) {
  $selectConnQuery = 'SELECT *
    FROM conn_citing_cited
    WHERE citing_id = :c1id AND cited_id = :c2id';
  $selectConnStmt = $pdo->prepare($selectConnQuery);
  $selectConnStmt->execute(
    array(
      ':c1id' => $citing_id,
      ':c2id' => $cited_id,
    )
  );

  $connRow = $selectConnStmt->fetch(PDO::FETCH_OBJ);

  if (!$connRow) return false;

  return $connRow->id;
}
?>
