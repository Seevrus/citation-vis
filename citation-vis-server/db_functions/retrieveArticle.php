<?php
require_once(dirname(__FILE__) . '/selections/selectAuthors.php');
require_once(dirname(__FILE__) . '/selections/selectCitedDois.php');
require_once(dirname(__FILE__) . '/selections/selectArticle.php');
require_once(dirname(__FILE__) . '/selections/selectJournal.php');
require_once(dirname(__FILE__) . '/selections/selectSubjects.php');

function retrieveArticle(PDO $pdo, string $doi, int $depth, int $level)
{
  /* output:
  {
    doi:
    <other data>
    references [
      same as parent --> we are aiming for a tree
    ]
  }
  */

  $article = selectArticle($pdo, $doi);

  if (!$article) {
    $response = new stdClass();
    $response->outcome = "failure";
    $response->message = "Keresett DOI nem található";
    return $response;
  }

  $journal = selectJournal($pdo, $article->id); // single object
  $subjects = selectSubjects($pdo, $article->id); // array of strings
  $authors = selectAuthors($pdo, $article->id); // array of objects, includes university data

  $extendedArticle = $article;
  $extendedArticle->level = $level;
  $extendedArticle->journal = $journal;
  $extendedArticle->subjects = $subjects;
  $extendedArticle->authors = $authors;

  $references = array();
  if ($depth > 0) {
    $citedDois = selectCitedDois($pdo, $article->id); // array of strings
    if (!empty($citedDois)) {
      foreach ($citedDois as $citedDoi) {
        $citedArticle = retrieveArticle($pdo, $citedDoi, $depth - 1, $level + 1);
        if ($citedArticle) {
          array_push($references, $citedArticle);
        }
      }
    }
  }

  $extendedArticle->references = $references;

  return $extendedArticle;
}
