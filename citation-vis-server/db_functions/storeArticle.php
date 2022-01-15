<?php
set_time_limit(3600);
require_once(dirname(__FILE__) . '/insertions/insertArticle.php');
require_once(dirname(__FILE__) . '/insertions/insertArticleAuthorConn.php');
require_once(dirname(__FILE__) . '/insertions/insertArticleSubjectConn.php');
require_once(dirname(__FILE__) . '/insertions/insertAuthor.php');
require_once(dirname(__FILE__) . '/insertions/insertAuthorUniversityConn.php');
require_once(dirname(__FILE__) . '/insertions/insertCitingCitedConn.php');
require_once(dirname(__FILE__) . '/insertions/insertJournal.php');
require_once(dirname(__FILE__) . '/insertions/insertSubject.php');
require_once(dirname(__FILE__) . '/insertions/insertUniversity.php');
require_once(dirname(__FILE__) . '/insertions/isArticleInDb.php');
require_once(dirname(__FILE__) . '/shouldFetch.php');

function findID($idList, string $idType)
{
  if (!$idList || empty($idList)) return null;

  if (gettype($idList) == 'object') {
    if ($idList->{'@idtype'} == $idType) {
      return $idList->{'$'};
    }
    return null;
  }

  foreach ($idList as $id_obj) {
    if ($id_obj->{'@idtype'} == $idType) {
      return $id_obj->{'$'};
    }
  }

  return null;
}

function mapOrganization($organization)
{
  if (!$organization) return null;

  if (gettype($organization) == 'object') {
    return $organization->{'$'};
  }

  return implode(
    ', ',
    array_map(
      function ($org) {
        return $org->{'$'};
      },
      $organization
    )
  );
}

/*
  This is a recursive function that stores an article and all of it citations
  up to the given depth
*/
function storeArticle(
  PDO $pdo,
  $curl_handle,
  string $abstract_uri_type,
  string $abstract_uri,
  string $content_author_uri,
  string $identifier,
  int $parent_article_id,
  int $depth
): void {
  if ($depth == -1) return;

  if ($abstract_uri_type == 'doi') {
    $article_id = isArticleInDb($pdo, $identifier);
  } else if ($abstract_uri_type == 'sgr') {
    $article_id = isArticleInDb($pdo, null, $identifier);
  }

  $shouldFetch = false;
  if (!!$article_id && $abstract_uri_type == 'doi') {
    if (shouldFetch($pdo, $identifier, $depth)) {
      $shouldFetch = true;
    }
  }

  if (!$article_id || $shouldFetch) {
    $articleUri = $abstract_uri . '/' . $abstract_uri_type . '/' . $identifier;
    curl_setopt($curl_handle, CURLOPT_URL, $articleUri);
    $articleJson = curl_exec($curl_handle);
    $articleData = json_decode($articleJson);

    if (!$articleData) return;
    if ($articleData->{'service-error'}) return;

    // store journal, retrieve its id
    $journal_title = $articleData->{'abstracts-retrieval-response'}->item->bibrecord->head->source->sourcetitle;
    $journal_publisher = $articleData->{'abstracts-retrieval-response'}->item->bibrecord->head->source->publisher->publishername;
    $journal_id = insertJournal($pdo, $journal_title, $journal_publisher);

    // store article, retrieve its id
    $a_doi = $articleData->{'abstracts-retrieval-response'}->item->bibrecord->{'item-info'}->itemidlist->{'ce:doi'};
    if (!$a_doi) return;

    $a_idList = $articleData->{'abstracts-retrieval-response'}->item->bibrecord->{'item-info'}->itemidlist->itemid;
    $a_scopus_id = findId($a_idList, 'SCOPUS');
    $a_sgr = findId($a_idList, 'SGR');
    $a_title = $articleData->{'abstracts-retrieval-response'}->item->bibrecord->head->{'citation-title'};
    $a_abstract = $articleData->{'abstracts-retrieval-response'}->item->bibrecord->head->abstracts;
    $a_year = $articleData->{'abstracts-retrieval-response'}->item->bibrecord->head->source->publicationdate->year;
    $a_volume = $articleData->{'abstracts-retrieval-response'}->item->bibrecord->head->source->volisspag->voliss->{'@volume'};
    $a_issue = $articleData->{'abstracts-retrieval-response'}->item->bibrecord->head->source->volisspag->voliss->{'@issue'};
    $a_page_start = $articleData->{'abstracts-retrieval-response'}->item->bibrecord->head->source->volisspag->pagerange->{'@first'};
    $a_page_end = $articleData->{'abstracts-retrieval-response'}->item->bibrecord->head->source->volisspag->pagerange->{'@last'};
    $a_citations = $articleData->{'abstracts-retrieval-response'}->coredata->{'citedby-count'};
    $article_id = insertArticle($pdo, $a_doi, $a_scopus_id, $a_sgr, $a_title, $a_abstract, $a_year, $journal_id, $a_volume, $a_issue, $a_page_start, $a_page_end, $a_citations);

    $authorGroup = $articleData->{'abstracts-retrieval-response'}->item->bibrecord->head->{'author-group'};
    if (gettype($authorGroup) == 'object') $authorGroup = [$authorGroup];
    foreach ($authorGroup as $group) {
      // store universities, retrieve their id
      $affiliation = $group->affiliation;
      $u_name = mapOrganization($affiliation->organization);
      if ($u_name) {
        $u_country = $affiliation->country;
        $u_city = $affiliation->city;
        $u_id = insertUniversity($pdo, $u_name, $u_country, $u_city);
      } else {
        $u_id = NULL;
      }

      $authorList = $group->author;
      if (gettype($authorList) == 'object') $authorList = [$authorList];
      foreach ($authorList as $au) {
        // store authors, retrieve their id
        $au_author_id = $au->{'@auid'};
        $au_given_name = $au->{'ce:given-name'};
        $au_surname = $au->{'ce:surname'};

        // author search gives back citation count
        $authorUri = $content_author_uri . $au_author_id;
        curl_setopt($curl_handle, CURLOPT_URL, $authorUri);
        $authorJsonData = curl_exec($curl_handle);
        $authorData = json_decode($authorJsonData);
        $au_citations = $authorData->{'author-retrieval-response'}[0]->coredata->{'citation-count'};

        $au_id = insertAuthor($pdo, $au_author_id, $au_given_name, $au_surname, $au_citations);

        // establish author-article connections
        insertArticleAuthorConn($pdo, $article_id, $au_id);

        // establish author-university connections
        if ($u_id) insertAuthorUniversityConn($pdo, $au_id, $u_id);
      }
    }

    $subjects = $articleData->{'abstracts-retrieval-response'}->{'subject-areas'}->{'subject-area'};
    foreach ($subjects as $st) {
      $subject_code = $st->{'@code'};
      $subject_name = $st->{'$'};
      $subject_id = insertSubject($pdo, $subject_code, $subject_name);
      insertArticleSubjectConn($pdo, $article_id, $subject_id);
    }

    // establish citing-cited connection with parent, if any
    if ($parent_article_id) {
      insertCitingCitedConn($pdo, $parent_article_id, $article_id);
    }

    // continue with references
    $references = $articleData->{'abstracts-retrieval-response'}->item->bibrecord->tail->bibliography->reference;
    if ($references) {
      foreach ($references as $ref) {
        $ref_doi = findId($ref->{'ref-info'}->{'refd-itemidlist'}->itemid, 'DOI');
        $ref_sgr = findId($ref->{'ref-info'}->{'refd-itemidlist'}->itemid, 'SGR');
        if ($ref_doi) {
          storeArticle($pdo, $curl_handle, 'doi', $abstract_uri, $content_author_uri, $ref_doi, $article_id, $depth - 1);
        } else if ($ref_sgr) {
          // We should use scopus_id namespace to search for this so-called sgr
          storeArticle($pdo, $curl_handle, 'scopus_id', $abstract_uri, $content_author_uri, $ref_sgr, $article_id, $depth - 1);
        }
      }
    }
  }
}
