import { describe, it, expect, vi, beforeEach } from 'vitest';
import nodemailer from 'nodemailer';
import Mailer from './Mailer';
import Mail from './Mail';
import { Transport, Mail as MailType } from './types';

// Mock nodemailer
vi.mock('nodemailer', () => ({
	default: {
		createTransport: vi.fn(),
	},
}));

const mockTransporter = {
	sendMail: vi.fn(),
};

describe('Mailer', () => {
	let mailer: Mailer;
	let transport: Transport;

	beforeEach(() => {
		transport = {
			host: 'smtp.example.com',
			port: 587,
			secure: false,
			auth: {
				user: 'test@example.com',
				password: 'password',
			},
		};

		mailer = new Mailer(transport);

		// Reset mocks
		vi.clearAllMocks();

		// Setup default mock for createTransport
		(nodemailer.createTransport as any).mockReturnValue(mockTransporter);
	});

	describe('sendMail', () => {
		it('should send an email successfully', async () => {
			const mail: MailType = {
				from: 'sender@example.com',
				to: 'recipient@example.com',
				subject: 'Test Subject',
				text: 'Test text',
				body: 'Test body',
			};

			const options = {};

			mockTransporter.sendMail.mockImplementation((_, callback) => {
				callback(null, { messageId: 'test-id' });
			});

			const result = await mailer.sendMail(mail, options);

			expect(result).toBe(true);
			expect(nodemailer.createTransport).toHaveBeenCalledWith(transport);
			expect(mockTransporter.sendMail).toHaveBeenCalledWith(
				{
					from: mail.from,
					to: mail.to,
					subject: mail.subject,
					text: mail.text,
					html: mail.body,
				},
				expect.any(Function),
			);
		});

		it('should handle send mail error', async () => {
			const mail: MailType = {
				from: 'sender@example.com',
				to: 'recipient@example.com',
				subject: 'Test Subject',
				text: 'Test text',
				body: 'Test body',
			};

			const options = {};

			const error = new Error('Send failed');
			mockTransporter.sendMail.mockImplementation((_, callback) => {
				callback(error, null);
			});

			await expect(mailer.sendMail(mail, options)).rejects.toBe(false);
		});

		it('should apply delay option', async () => {
			const mail: MailType = {
				from: 'sender@example.com',
				to: 'recipient@example.com',
				subject: 'Test Subject',
				text: 'Test text',
				body: 'Test body',
			};

			const options = { delay: 100 };

			mockTransporter.sendMail.mockImplementation((_, callback) => {
				callback(null, { messageId: 'test-id' });
			});

			const start = Date.now();
			await mailer.sendMail(mail, options);
			const end = Date.now();

			expect(end - start).toBeGreaterThanOrEqual(100);
		});

		it('should handle timeout option', async () => {
			const mail: MailType = {
				from: 'sender@example.com',
				to: 'recipient@example.com',
				subject: 'Test Subject',
				text: 'Test text',
				body: 'Test body',
			};

			const options = { timeout: 50 };

			// Mock sendMail to not call callback immediately
			mockTransporter.sendMail.mockImplementation(() => {
				// Do not call callback to trigger timeout
			});

			await expect(mailer.sendMail(mail, options)).rejects.toBe(false);
		});

		it('should handle scheduled_at option', async () => {
			const mail: MailType = {
				from: 'sender@example.com',
				to: 'recipient@example.com',
				subject: 'Test Subject',
				text: 'Test text',
				body: 'Test body',
			};

			const futureDate = new Date(Date.now() + 100).toISOString();
			const options = { scheduled_at: futureDate };

			mockTransporter.sendMail.mockImplementation((_, callback) => {
				callback(null, { messageId: 'test-id' });
			});

			// Since it's scheduled, sendMail should resolve immediately without sending
			const result = await mailer.sendMail(mail, options);
			expect(result).toBe(true);

			// The actual send should be scheduled, but in test, we can't easily verify the setTimeout
			// This test mainly checks that it doesn't throw and resolves
		});

		it('should throw if transport auth is missing', async () => {
			expect(() => new Mailer({} as Transport)).toThrow(
				"Cannot read properties of undefined (reading 'user')",
			);
		});
	});
});

describe('Mail', () => {
	it('should create mail object correctly', async () => {
		const mail = new Mail();
		const mailData = {
			from: 'sender@example.com',
			to: 'recipient@example.com',
			subject: 'Test Subject',
			text: 'Test text',
			body: 'Test body',
		};

		await mail.create(mailData);

		expect(mail.from).toBe(mailData.from);
		expect(mail.to).toBe(mailData.to);
		expect(mail.subject).toBe(mailData.subject);
		expect(mail.text).toBe(mailData.text);
		expect(mail.body).toBe(mailData.body);
	});

	it('should handle Response body', async () => {
		const mail = new Mail();
		const response = new Response('Response body text');
		const mailData = {
			from: 'sender@example.com',
			to: 'recipient@example.com',
			subject: 'Test Subject',
			text: 'Test text',
			body: response,
		};

		await mail.create(mailData);

		expect(mail.body).toBe('Response body text');
	});
});
