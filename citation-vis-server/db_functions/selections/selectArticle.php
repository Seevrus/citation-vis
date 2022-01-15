<?php
function selectArticle(PDO $pdo, string $doi)
{
  $selectArticleQuery = 'SELECT
      id,
      doi,
      scopus_id as scopusId,
      title,
      abstract,
      itsyear as year,
      volume,
      issue,
      page_start as pageStart,
      page_end as pageEnd,
      citations
    FROM article
    WHERE doi = :doi';

  $selectArticleStmt = $pdo->prepare($selectArticleQuery);
  $selectArticleStmt->execute(
    array(
      ':doi' => $doi,
    )
  );

  return $selectArticleStmt->fetch(PDO::FETCH_OBJ);
}
