<?php
function selectCitedDois(PDO $pdo, int $article_id) {
  $selectCitedDoisQuery = 'SELECT
    cited.doi
    FROM article cited
    JOIN conn_citing_cited ccc ON cited.id = ccc.cited_id
    JOIN article citing ON citing.id = ccc.citing_id
    WHERE citing.id = :cid';
  
  $selectCitedDoisStmt = $pdo->prepare($selectCitedDoisQuery);
  $selectCitedDoisStmt->execute(
    array(
      ':cid' => $article_id,
    )
  );

  return $selectCitedDoisStmt->fetchAll(PDO::FETCH_COLUMN);
}
?>
