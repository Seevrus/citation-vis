<?php
error_reporting(E_ERROR | E_WARNING | E_PARSE);
date_default_timezone_set('Europe/Budapest');

require_once(dirname(__FILE__) . '/db_functions/connectToDb.php');
require_once(dirname(__FILE__) . '/db_functions/retrieveArticle.php');
require_once(dirname(__FILE__) . '/db_functions/storeArticle.php');

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  try {
    $abstract_uri = 'https://api.elsevier.com/content/abstract';
    $content_author_uri = 'https://api.elsevier.com/content/author?author_id=';
    $pdo = connectToDb();
    $api_keys = parse_ini_file(dirname(__FILE__) . '/api-keys.ini');
    $proxy_credentials = parse_ini_file(dirname(__FILE__) . '/proxy.ini');

    $requestBody = json_decode(file_get_contents("php://input"));
    $doi = $requestBody->doi;
    $depth = $requestBody->depth ?? 2;

    $curl_handle = curl_init();
    curl_setopt($curl_handle, CURLOPT_PROXYPORT, $proxy_credentials['proxy_port']);
    curl_setopt($curl_handle, CURLOPT_PROXYTYPE, 'HTTP');
    curl_setopt($curl_handle, CURLOPT_PROXY, $proxy_credentials['proxy_url']);
    curl_setopt($curl_handle, CURLOPT_PROXYUSERPWD, $proxy_credentials['proxy_credentials']);
    curl_setopt($curl_handle, CURLOPT_URL, $articleUrl);
    curl_setopt($curl_handle, CURLOPT_HTTPHEADER, array(
      'Accept: application/json',
      'X-ELS-APIKey: ' . $api_keys['elsevier'],
    ));
    curl_setopt($curl_handle, CURLOPT_RETURNTRANSFER, true);

    // store the article (will skip items already stored)
    storeArticle($pdo, $curl_handle, 'doi', $abstract_uri, $content_author_uri, $doi, false, $depth);
    curl_close($curl_handle);

    // select the article (recursively to the given depth)
    $article = retrieveArticle($pdo, $doi, $depth, 0);

    if ($article->outcome == "failure") {
      http_response_code(404);
    }
    echo json_encode($article);
  } catch (Exception $e) {
    http_response_code(403);
    echo json_encode(
      array(
        'outcome' => 'failure',
        'message' => $e->getMessage(),
      )
    );
  }
} else {
  http_response_code(405);
  echo json_encode(
    array(
      'outcome' => 'failure',
      'message' => 'Nem engedélyezett http metódus',
    )
  );
}
