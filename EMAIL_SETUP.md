# Email Integration Setup Guide

This guide will help you set up email functionality for your contact form using EmailJS.

## Why EmailJS?

EmailJS is the easiest and fastest way to integrate email functionality:
- ✅ No backend required
- ✅ Free tier (200 emails/month)
- ✅ Easy setup (5 minutes)
- ✅ Reliable delivery
- ✅ Support for multiple email providers

## Setup Instructions

### 1. Create EmailJS Account

1. Go to [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

### 2. Add Email Service

1. In your EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the authentication steps
5. Note down your **Service ID**

### 3. Create Email Template

1. Go to **Email Templates** in your dashboard
2. Click **Create New Template**
3. Use this template structure:

```html
Subject: New Contact Form Submission from {{from_name}}

From: {{from_name}} ({{from_email}})
Phone: {{phone}}

Message:
{{message}}

---
This email was sent from your NevoChat landing page contact form.
```

4. Note down your **Template ID**

### 4. Get Public Key

1. Go to **Account** → **General**
2. Find your **Public Key**
3. Copy it

### 5. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Update the EmailJS variables in `.env.local`:
```env
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_actual_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_actual_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_actual_public_key
```

### 6. Test the Integration

1. Start your development server:
```bash
npm run dev
```

2. Go to the contact section on your website
3. Fill out and submit the form
4. Check your email for the message

## Alternative Solutions

If you prefer other email services:

### 1. Resend (Modern & Developer-Friendly)
- Professional email API
- Great deliverability
- Need backend API route

### 2. Formspree
- No-code solution
- Form handling service
- Simple integration

### 3. Nodemailer + SMTP
- Complete control
- Requires backend setup
- More configuration needed

## Troubleshooting

### Common Issues:

1. **Form not sending emails**
   - Check environment variables are set correctly
   - Verify EmailJS service is active
   - Check browser console for errors

2. **Emails going to spam**
   - Set up SPF/DKIM records in EmailJS
   - Use a professional email address
   - Avoid spam trigger words

3. **Rate limiting**
   - Free tier: 200 emails/month
   - Upgrade plan if needed

## Security Notes

- Environment variables are public (NEXT_PUBLIC_*)
- EmailJS public key is safe to expose
- No sensitive data in client-side code
- Form validation happens on submit

## Features Included

- ✅ Form validation
- ✅ Loading states
- ✅ Success/error messages
- ✅ Professional email template
- ✅ Responsive design
- ✅ Animation effects

Your contact form is now ready to receive emails! 🚀
