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
$message = isset($_POST['message']) ? htmlspecialchars(trim($_POST['message']), ENT_QUOTES, 'UTF-8') : '';

if (empty($name)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Name is required.']);
    exit;
}

if (empty($phone)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Phone number is required.']);
    exit;
}

if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please provide a valid email address.']);
    exit;
}

if (empty($message)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Message is required.']);
    exit;
}

$to = $config['recipient_email'];
$cc = $config['cc_email'];
$site_name = $config['site_name'];
$logo_url = $config['logo_url'];
$subject = "New Contact Form Submission - $site_name";

$display_email = !empty($email) ? $email : 'Not provided';

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
  <h2>New Contact Form Submission</h2>
  <table>
    <tr><td class='label'>Name</td><td>$name</td></tr>
    <tr><td class='label'>Email</td><td>$display_email</td></tr>
    <tr><td class='label'>Phone</td><td>$phone</td></tr>
    <tr><td class='label'>Message</td><td>$message</td></tr>
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
    echo json_encode(['success' => true, 'message' => 'Thank you for contacting us. We will get back to you shortly.']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to send email. Please try again later.']);
}
