<?php
require_once(dirname(__FILE__) . '/isSubjectInDb.php');

function insertSubject(PDO $pdo, string $code, string $subject): int {
  try {
    $subject_id = isSubjectInDb($pdo, $code);

    if (!$subject_id) {
      $insertSubjectQuery = 'INSERT
        INTO csubject (code, csubject)
        VALUES (:cd, :sb)';
      $insertSubjectStmt = $pdo->prepare($insertSubjectQuery);
      $insertSubjectStmt->execute(
        array(
          ':cd' => $code,
          ':sb' => $subject,
        )
      );
  
      return $pdo->lastInsertId();
    }
  
    return $subject_id;
  } catch (Exception $e) {
    echo $e->getMessage();
  }
}
?>
