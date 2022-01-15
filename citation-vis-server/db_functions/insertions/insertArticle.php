<?php
require_once(dirname(__FILE__) . '/isArticleInDb.php');

function insertArticle(
  PDO $pdo,
  $doi,
  $scopus_id,
  $sgr,
  $title,
  $abstract,
  $itsyear,
  $journal_id,
  $volume,
  $issue,
  $page_start,
  $page_end,
  $citations = NULL
): int {
  $article_id = isArticleInDb($pdo, $doi, $sgr);

  if (!$article_id) {
    $insertArticleQuery = 'INSERT
      INTO article
      (
        doi,
        scopus_id,
        sgr,
        title,
        abstract,
        itsyear,
        journal_id,
        volume,
        issue,
        page_start,
        page_end,
        citations
      )
      VALUES
      (
        :doi,
        :scid,
        :sgr,
        :ttl,
        :abst,
        :y,
        :jnl,
        :vol,
        :iss,
        :pst,
        :pe,
        :cit
      )';
    $insertArticleStmt = $pdo->prepare($insertArticleQuery);
    $insertArticleStmt->execute(
      array(
        ':doi' => $doi,
        ':scid' => $scopus_id,
        ':sgr' => $sgr,
        ':ttl' => $title,
        ':abst' => $abstract,
        ':y' => $itsyear,
        ':jnl' => $journal_id,
        ':vol' => $volume,
        ':iss' => $issue,
        ':pst' => $page_start,
        ':pe' => $page_end,
        ':cit' => $citations
      )
    );

    return $pdo->lastInsertId();
  }

  return $article_id;
}
