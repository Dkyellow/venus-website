# Venus Healthcare Website

Static website for Venus Healthcare Services - a medical & dental solution company in Zimbabwe.

## Requirements

- Apache web server (cPanel/shared hosting)
- PHP 8.0 or higher
- `mail()` function enabled for form submissions

## Installation

1. Upload all files to your `public_html` directory
2. Edit `forms/config.php` to set your email addresses
3. Ensure PHP is enabled on your hosting account
4. Open the website in a browser

## File Structure

```
public_html/
├── index.html          # Home page
├── about.html          # About/Team page
├── contact.html        # Contact page
├── dental.html         # Dental Health Service
├── medical.html        # Medical Health Service
├── mental.html         # Mental Health Service
├── consultation.html   # Business Consultations
├── 404.html            # Page not found
├── .htaccess           # Apache configuration
├── favicon.ico         # Favicon
├── favicon.svg         # SVG Favicon
├── logo.png            # Company logo
├── manifest.json       # PWA manifest
├── site.webmanifest    # PWA manifest
│
├── assets/
│   ├── css/
│   │   └── style.css   # All styles
│   ├── js/
│   │   └── main.js     # All JavaScript
│   ├── fonts/
│   │   └── BebasNeue-Regular.*  # Custom font
│   └── images/         # (symlinked from /images)
│
├── forms/
│   ├── config.php      # Email configuration
│   ├── contact.php     # Contact form handler
│   └── appointment.php # Appointment form handler
│
├── images/             # All image assets
│   ├── about/          # Staff photos
│   ├── appointments/   # Appointment section bg
│   ├── home-page/      # Hero carousel images
│   ├── icons/          # Service & social icons
│   ├── services/       # Service page headers
│   └── testimonies/    # Testimonial images
│
└── data/               # JSON data files
    ├── services.json
    ├── faqs.json
    └── employees.json
```

## Configuration

Edit `forms/config.php` to change email recipients:

```php
return [
    'recipient_email' => 'admin@venushealthcare.co.zw',
    'cc_email' => 'venusbymike@gmail.com',
    'dental_email' => 'dental@venushealthcare.co.zw',
    'medical_email' => 'medical@venushealthcare.co.zw',
    'site_name' => 'Venus Healthcare Services',
    'logo_url' => 'https://venushealthcare.co.zw/logo.png',
];
```

## Form Routing

- **Contact Form**: Sends to `admin@venushealthcare.co.zw`
- **Dental Appointments**: Sends to `dental@venushealthcare.co.zw`
- **Medical/Vaccination Appointments**: Sends to `medical@venushealthcare.co.zw`
- **Mental Health/Business Consultancy**: Sends to `admin@venushealthcare.co.zw`
- All forms CC: `venusbymike@gmail.com`

## Notes

- No database required
- No build process required
- No Node.js or npm required
- Pure HTML, CSS, JavaScript, and minimal PHP
