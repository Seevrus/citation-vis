<?php
function shouldFetch(PDO $pdo, string $doi, int $depth): bool
{
  if ($depth == -1) return false;

  $article = retrieveArticle($pdo, $doi, $depth, 0);

  if (!$article) return true;

  if ($depth > 0 && empty($article->references)) return true;

  foreach ($article->references as $reference) {
    if (shouldFetch($pdo, $reference->doi, $depth - 1)) return true;
  }

  return false;
}
