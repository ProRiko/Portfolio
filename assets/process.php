<?php

// Get form data
$name = $_POST['name'];
$email = $_POST['email'];
$message = $_POST['message'];

// Create email subject and body
$subject = "New Contact Form Submission";
$body = "Name: $name\nEmail: $email\n\nMessage:\n$message";

// Configure email sending (replace with your preferred method)
// - You can use a third-party email service provider or PHP's mail function
// Replace 'your_email@example.com' with your actual email address
$to = 'reebhu26@gmail.com.com';
$headers = "From: $email";
mail($to, $subject, $body, $headers);
//header("Location: contact.html?message=success");
//exit();

?>