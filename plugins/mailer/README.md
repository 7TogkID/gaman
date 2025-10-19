# @gaman/mailer

A plugin for the Gaman framework to send emails using SMTP via nodemailer.

## Installation

Ensure you have the required peer dependencies installed:

```bash
npm install @gaman/mailer
```

## Configuration

Configure your SMTP settings in your Gaman application. You can customize the transport options:

```typescript
import { Transport } from '@gaman/mailer';

const transport: Transport = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'your-email@example.com',
    password: 'your-password',
  },
};
```

Defaults are provided if not specified:
- Host: `smtp.example.com`
- Port: `587`
- Secure: `false`

## Usage

### Step 1: Create a Mail Instance

Use the `Mail` class to compose your email:

```typescript
import Mail from '@gaman/mailer/Mail';

const mail = new Mail();
await mail.create({
  from: 'sender@example.com',
  to: 'recipient@example.com',
  subject: 'Test Email',
  text: 'This is a plain text email.',
  body: '<h1>This is an HTML email.</h1>', // or a Response object for dynamic content
});
```

### Step 2: Send the Email

Use the `Mailer` class to send the email:

```typescript
import Mailer from '@gaman/mailer/Mailer';
import { MailerSentOptions } from '@gaman/mailer';

const mailer = new Mailer(transport);

const options: MailerSentOptions = {
  debug: true, // Enable debug logging
  delay: 1000, // Delay sending by 1 second (optional)
  timeout: 5000, // Timeout after 5 seconds (optional)
  scheduled_at: '2023-10-01T10:00:00Z', // Schedule for later (optional)
};

try {
  const success = await mailer.sendMail(mail, options);
  if (success) {
    console.log('Email sent successfully');
  }
} catch (error) {
  console.error('Failed to send email:', error);
}
```

### API Reference

- **Mail Class**: Composes email messages.
  - `create(mail: LikeMail): Promise<void>`: Initializes the mail object.

- **Mailer Class**: Handles sending emails.
  - `sendMail(mail: Mail, options: MailerSentOptions): Promise<boolean>`: Sends the email and returns success status.

For more details, refer to the source code in `Mail.ts` and `Mailer.ts`.
