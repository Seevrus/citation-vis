<?php
function isArticleInDb(PDO $pdo, string $doi = null, string $sgr = null)
{
  if (!is_null($doi) && is_null($sgr)) {
    $selectArticleQuery = 'SELECT *
      FROM article
      WHERE doi = :doi';
    $selectArticleStmt = $pdo->prepare($selectArticleQuery);
    $selectArticleStmt->execute(
      array(
        ':doi' => $doi,
      )
    );
  } else if (is_null($doi) && !is_null($sgr)) {
    $selectArticleQuery = 'SELECT *
      FROM article
      WHERE sgr = :sgr';
    $selectArticleStmt = $pdo->prepare($selectArticleQuery);
    $selectArticleStmt->execute(
      array(
        ':sgr' => $sgr,
      )
    );
  } else {
    $selectArticleQuery = 'SELECT *
      FROM article
      WHERE doi = :doi AND sgr = :sgr';
    $selectArticleStmt = $pdo->prepare($selectArticleQuery);
    $selectArticleStmt->execute(
      array(
        ':doi' => $doi,
        ':sgr' => $sgr,
      )
    );
  }

  $articleRow = $selectArticleStmt->fetch(PDO::FETCH_OBJ);

  if (!$articleRow) return false;

  return $articleRow->id;
}
