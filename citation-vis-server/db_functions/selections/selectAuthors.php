<?php
function selectAuthors(PDO $pdo, int $article_id) {
  $selectAuthorsQuery = 'SELECT
      au.id,
      au.author_id as authorId,
      au.author_given_name as givenName,
      au.author_surname as surName,
      au.citations
    FROM author au
    JOIN conn_article_author caa ON au.id = caa.author_id
    JOIN article a ON caa.article_id = a.id
    WHERE a.id = :aid';
  
  $selectAuthorsStmt = $pdo->prepare($selectAuthorsQuery);
  $selectAuthorsStmt->execute(
    array(
      ':aid' => $article_id,
    )
  );

  // enrich author data with universities
  $authors = $selectAuthorsStmt->fetchAll(PDO::FETCH_OBJ);

  if (!$authors) return $authors;

  $selectUniversitiesQuery = 'SELECT
      u.u_name as universityName,
      u.country,
      u.city
    FROM university u
    JOIN conn_author_university cau ON u.id = cau.university_id
    JOIN author au ON au.id = cau.author_id
    WHERE au.id = :auid';
  $selectUniversitiesStmt = $pdo->prepare($selectUniversitiesQuery);

  $authorsResult = array();
  foreach ($authors as $author) {
    $selectUniversitiesStmt->execute(
      array(
        ':auid' => $author->id,
      )
    );
    $universities = $selectUniversitiesStmt->fetchAll(PDO::FETCH_OBJ);
    
    $extendedAuthor = $author;
    $extendedAuthor->university = $universities ?? array();
    unset($extendedAuthor->id);
    array_push($authorsResult, $extendedAuthor);
  }

  return $authorsResult;
}
