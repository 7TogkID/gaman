import nodemailer from 'nodemailer';
import { Mail, MailerSentOptions, Transport } from './types';
import {
	DEFAULT_SMTP_HOST,
	DEFAULT_SMTP_PORT,
	DEFAULT_SMTP_SECURE,
} from './config';

export default class Mailer {
	private transporter: Transport;

	constructor(private trans: Transport) {
		this.transporter = {
			host: trans.host || DEFAULT_SMTP_HOST,
			port: trans.port || DEFAULT_SMTP_PORT,
			secure: trans.secure || DEFAULT_SMTP_SECURE,
			auth: {
				user: trans.auth.user,
				password: trans.auth.password,
			},
		};
	}

	async wait(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	async sendMail(mail: Mail, options: MailerSentOptions): Promise<boolean> {
		return new Promise(async (resolve, reject) => {
			if (!this.transporter) {
				reject(new Error('Transport not initialized'));
				return;
			}

			const transport = nodemailer.createTransport(this.transporter);

			if (options.delay) {
				await this.wait(options.delay);
			}

			if (options.timeout) {
				setTimeout(() => {
					console.error('Timeout');
					reject(false);
				}, options.timeout);
			}

			if (options.scheduled_at) {
				const scheduledDate = new Date(options.scheduled_at);
				const now = new Date();

				setTimeout(async () => {
					await this.sendMail(mail, options);
				}, scheduledDate.getTime() - now.getTime());
			}

			transport.sendMail(
				{
					from: mail.from,
					to: mail.to,
					subject: mail.subject,
					text: mail.text,
					html: mail.body as string,
				},
				(error, info) => {
					if (error) {
						if (options.debug) {
							console.error(error);
						}

						reject(false);
					} else {
						if (options.debug) {
							console.table(info);
						}

						resolve(true);
					}
				},
			);

			// end method
		});
	}
}
