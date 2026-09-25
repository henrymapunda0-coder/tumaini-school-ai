<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: public, max-age=300');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function extractSchoolResultStats(string $html): array {
    $document = new DOMDocument();
    libxml_use_internal_errors(true);
    $document->loadHTML($html);
    libxml_clear_errors();

    $stats = [
        'divisionI' => 0,
        'divisionII' => 0,
        'divisionIII' => 0,
        'divisionIV' => 0,
        'divisionZero' => 0,
        'totalCandidates' => 0,
        'passCandidates' => 0,
        'passRate' => 0.0,
    ];

    $rows = $document->getElementsByTagName('tr');
    for ($i = 0; $i < $rows->length; $i++) {
        $row = $rows->item($i);
        if (!$row) {
            continue;
        }

        $cells = [];
        foreach ($row->getElementsByTagName('td') as $cell) {
            $text = trim(preg_replace('/\s+/', ' ', strip_tags($cell->textContent ?? '')));
            $cells[] = $text;
        }

        $combined = implode(' ', $cells);
        if (!preg_match('/\bT\b/i', $combined) && !preg_match('/\bTOTAL\b/i', $combined) && !preg_match('/\bS5493\b/i', $combined)) {
            continue;
        }

        preg_match_all('/(\d+)/', $combined, $numberMatches);
        $numbers = array_map('intval', $numberMatches[1]);
        if (count($numbers) < 5) {
            continue;
        }

        $values = array_slice($numbers, -5);
        $stats['divisionI'] = (int) ($values[0] ?? 0);
        $stats['divisionII'] = (int) ($values[1] ?? 0);
        $stats['divisionIII'] = (int) ($values[2] ?? 0);
        $stats['divisionIV'] = (int) ($values[3] ?? 0);
        $stats['divisionZero'] = (int) ($values[4] ?? 0);
        $stats['totalCandidates'] = $stats['divisionI'] + $stats['divisionII'] + $stats['divisionIII'] + $stats['divisionIV'] + $stats['divisionZero'];
        $stats['passCandidates'] = $stats['divisionI'] + $stats['divisionII'] + $stats['divisionIII'];
        $stats['passRate'] = $stats['totalCandidates'] > 0 ? round(($stats['passCandidates'] / $stats['totalCandidates']) * 100, 2) : 0.0;
        break;
    }

    return $stats;
}

$year = filter_input(INPUT_GET, 'year', FILTER_VALIDATE_INT);
if (!$year || $year < 2000 || $year > 2099) {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'error' => 'Provide a valid NECTA year, for example 2025.'
    ]);
    exit;
}

$requestedType = strtolower((string) ($_GET['type'] ?? 'csee'));
$allowedTypes = ['csee', 'ftna', 'acsee'];
$examType = in_array($requestedType, $allowedTypes, true) ? $requestedType : 'csee';
$examFolder = strtoupper($examType);
$resultsUrl = sprintf(
    'https://onlinesys.necta.go.tz/results/%d/%s/results/s5493.htm',
    $year,
    $examType
);

$localFile = __DIR__ . '/SCHOOL RESULTS/' . $examFolder . '/' . $year . '.htm';
if (!is_file($localFile)) {
    $localFile = __DIR__ . '/SCHOOL RESULTS/' . $examFolder . '/' . $year . '.HTML';
}

if (is_file($localFile)) {
    $html = file_get_contents($localFile);
    if ($html === false) {
        http_response_code(500);
        echo json_encode([
            'ok' => false,
            'error' => 'The local results file could not be opened.',
            'source' => $localFile,
        ]);
        exit;
    }

    $document = new DOMDocument();
    libxml_use_internal_errors(true);
    $document->loadHTML($html);
    libxml_clear_errors();
    $plainText = preg_replace('/\s+/', ' ', $document->textContent ?? '');
    $stats = extractSchoolResultStats($html);

    if (!$plainText || stripos($plainText, 'TUMAINI') === false) {
        http_response_code(404);
        echo json_encode([
            'ok' => false,
            'error' => 'No Tumaini School result record was found in the local files for that year and exam type.',
            'source' => $localFile,
        ]);
        exit;
    }

    $divisionI = $stats['divisionI'];
    $divisionII = $stats['divisionII'];
    $divisionIII = $stats['divisionIII'];
    $divisionIV = $stats['divisionIV'];
    $divisionZero = $stats['divisionZero'];
    $totalCandidates = $stats['totalCandidates'];
    $passCandidates = $stats['passCandidates'];
    $passRate = $stats['passRate'];

    $examLabel = strtoupper($examType);
    $summary = sprintf(
        "Matokeo ya %s %d kwa TUMAINI SENIOR HIGH SCHOOL (S5493):\n\nWanafunzi wote: %d\nDivision I: %d\nDivision II: %d\nDivision III: %d\nDivision IV: %d\nDivision 0: %d\nPass candidates: %d\nPass rate: %.2f%%\n\nAina ya mtihani: %s\nChanzo: %s",
        $examLabel,
        $year,
        $totalCandidates,
        $divisionI,
        $divisionII,
        $divisionIII,
        $divisionIV,
        $divisionZero,
        $passCandidates,
        $passRate,
        $examLabel,
        $localFile
    );

    $payload = [
        'ok' => true,
        'school' => 'TUMAINI SENIOR HIGH SCHOOL',
        'centre' => 'S5493',
        'year' => $year,
        'examType' => $examLabel,
        'source' => $localFile,
        'summary' => $summary,
        'stats' => [
            'divisionI' => $divisionI,
            'divisionII' => $divisionII,
            'divisionIII' => $divisionIII,
            'divisionIV' => $divisionIV,
            'divisionZero' => $divisionZero,
            'totalCandidates' => $totalCandidates,
            'passCandidates' => $passCandidates,
            'passRate' => $passRate,
        ],
        'content' => trim($plainText),
    ];

    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

$cacheFile = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'tumaini-necta-' . $year . '-' . $examType . '.json';
$cached = is_file($cacheFile) ? json_decode((string) file_get_contents($cacheFile), true) : null;
if (is_array($cached) && ($cached['cachedAt'] ?? 0) > time() - 3600) {
    unset($cached['cachedAt']);
    echo json_encode($cached, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

$curl = curl_init($resultsUrl);
curl_setopt_array($curl, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_TIMEOUT => 20,
    CURLOPT_USERAGENT => 'Tumaini Schools AI results reader/1.0',
]);
$html = curl_exec($curl);
$curlError = curl_error($curl);
$statusCode = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
curl_close($curl);

if ($html === false || $statusCode >= 400 || $statusCode === 0) {
    if (is_array($cached) && ($cached['ok'] ?? false) === true) {
        unset($cached['cachedAt']);
        $cached['stale'] = true;
        echo json_encode($cached, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit;
    }
    http_response_code(502);
    echo json_encode([
        'ok' => false,
        'error' => 'NECTA results could not be reached for that year.',
        'source' => $resultsUrl,
        'details' => $curlError ?: 'NECTA returned HTTP ' . $statusCode,
    ]);
    exit;
}

$document = new DOMDocument();
libxml_use_internal_errors(true);
$loaded = $document->loadHTML($html);
libxml_clear_errors();
$plainText = preg_replace('/\s+/', ' ', $document->textContent ?? '');
$stats = extractSchoolResultStats($html);

if (!$loaded || !$plainText || stripos($plainText, 'TUMAINI') === false) {
    http_response_code(404);
    echo json_encode([
        'ok' => false,
        'error' => 'No Tumaini School result record was found for that year.',
        'source' => $resultsUrl,
    ]);
    exit;
}

$divisionI = $stats['divisionI'];
$divisionII = $stats['divisionII'];
$divisionIII = $stats['divisionIII'];
$divisionIV = $stats['divisionIV'];
$divisionZero = $stats['divisionZero'];
$totalCandidates = $stats['totalCandidates'];
$passCandidates = $stats['passCandidates'];
$passRate = $stats['passRate'];

$payload = [
    'ok' => true,
    'school' => 'TUMAINI SENIOR HIGH SCHOOL',
    'centre' => 'S5493',
    'year' => $year,
    'examType' => $examFolder,
    'source' => $resultsUrl,
    'content' => trim($plainText),
    'summary' => sprintf(
        "Matokeo ya %s %d kwa TUMAINI SENIOR HIGH SCHOOL (S5493):\n\nWanafunzi wote: %d\nDivision I: %d\nDivision II: %d\nDivision III: %d\nDivision IV: %d\nDivision 0: %d\nPass candidates: %d\nPass rate: %.2f%%",
        $examFolder,
        $year,
        $totalCandidates,
        $divisionI,
        $divisionII,
        $divisionIII,
        $divisionIV,
        $divisionZero,
        $passCandidates,
        $passRate
    ),
    'stats' => [
        'divisionI' => $divisionI,
        'divisionII' => $divisionII,
        'divisionIII' => $divisionIII,
        'divisionIV' => $divisionIV,
        'divisionZero' => $divisionZero,
        'totalCandidates' => $totalCandidates,
        'passCandidates' => $passCandidates,
        'passRate' => $passRate,
    ],
];

@file_put_contents($cacheFile, json_encode($payload + ['cachedAt' => time()], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), LOCK_EX);
echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
