<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

$config = require __DIR__ . '/config.php';

if (!empty($_POST['website'])) {
    echo json_encode(['success' => false, 'message' => 'Spam detected.']);
    exit;
}

$name = isset($_POST['name']) ? htmlspecialchars(trim($_POST['name']), ENT_QUOTES, 'UTF-8') : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$phone = isset($_POST['phone']) ? htmlspecialchars(trim($_POST['phone']), ENT_QUOTES, 'UTF-8') : '';
$service = isset($_POST['service']) ? htmlspecialchars(trim($_POST['service']), ENT_QUOTES, 'UTF-8') : '';
$date = isset($_POST['date']) ? htmlspecialchars(trim($_POST['date']), ENT_QUOTES, 'UTF-8') : '';

if (empty($name)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Name is required.']);
    exit;
}

if (empty($email)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email address is required.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please provide a valid email address.']);
    exit;
}

if (empty($phone)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Phone number is required.']);
    exit;
}

if (empty($service)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please select a service.']);
    exit;
}

if (empty($date)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please select a preferred date.']);
    exit;
}

$service_lower = strtolower($service);
if (strpos($service_lower, 'dental') !== false) {
    $to = $config['dental_email'];
} elseif (strpos($service_lower, 'medical') !== false || strpos($service_lower, 'vaccination') !== false) {
    $to = $config['medical_email'];
} else {
    $to = $config['recipient_email'];
}

$cc = $config['cc_email'];
$site_name = $config['site_name'];
$logo_url = $config['logo_url'];
$subject = "New Appointment Request - $service - $site_name";

$display_date = !empty($date) ? $date : 'Not specified';

$html = "
<html>
<head>
<style>
  body { font-family: Arial, sans-serif; color: #333; }
  .header { text-align: center; padding: 20px 0; }
  .header img { max-width: 200px; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  td { padding: 10px; border: 1px solid #ddd; }
  td.label { background-color: #f5f5f5; font-weight: bold; width: 30%; }
  .footer { text-align: center; font-size: 12px; color: #999; margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; }
</style>
</head>
<body>
  <div class='header'>
    <img src='$logo_url' alt='$site_name'>
  </div>
  <h2>New Appointment Request</h2>
  <table>
    <tr><td class='label'>Name</td><td>$name</td></tr>
    <tr><td class='label'>Email</td><td>$email</td></tr>
    <tr><td class='label'>Phone</td><td>$phone</td></tr>
    <tr><td class='label'>Service</td><td>$service</td></tr>
    <tr><td class='label'>Preferred Date</td><td>$date</td></tr>
  </table>
  <div class='footer'>$site_name &copy; " . date('Y') . ". All rights reserved.</div>
</body>
</html>
";

$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-type: text/html; charset=UTF-8\r\n";
$headers .= "From: $site_name <noreply@venushealthcare.co.zw>\r\n";
$headers .= "CC: $cc\r\n";

if (mail($to, $subject, $html, $headers)) {
    echo json_encode(['success' => true, 'message' => 'Your appointment request has been received. We will confirm your booking shortly.']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to send appointment request. Please try again later.']);
}
