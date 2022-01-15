<?php
require_once(dirname(__FILE__) . '/isUniversityInDb.php');

function insertUniversity(
  PDO $pdo,
  string $u_name,
  $country,
  $city
): int {
  $university_id = isUniversityInDb($pdo, $u_name);

  if (!$university_id) {
    $insertUniversityQuery = 'INSERT
      INTO university (u_name, country, city)
      VALUES (:un, :ctr, :cty)';
    $insertUniversityStmt = $pdo->prepare($insertUniversityQuery);
    $insertUniversityStmt->execute(
      array(
        ':un' => $u_name,
        ':ctr' => $country,
        ':cty' => $city,
      )
    );

    return $pdo->lastInsertId();
  }

  return $university_id;
}
?>
