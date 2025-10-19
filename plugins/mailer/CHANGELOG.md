 # @gaman/mailer

 ## 1.0.0

 - Initial release of the Gaman mailer plugin
 - Added support for sending emails using SMTP via nodemailer
 - Introduced Mail class for composing email messages with from, to, subject, text, and HTML body
 - Added Mailer class with features for delayed sending, timeouts, scheduling, and debug mode
 - Configurable SMTP settings with defaults for host, port, and security
 - Peer dependencies: nodemailer and @types/nodemailer
