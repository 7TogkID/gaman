import { Mail as LikeMail } from './types';

export default class Mail {
	from: string;
	to: string;
	subject: string;
	text: string;
	body: string;

	async create(mail: LikeMail) {
		this.from = mail.from;
		this.to = mail.to;
		this.subject = mail.subject;
		this.text = mail.text;

		if (typeof mail.body !== 'string') {
			this.body = await mail.body.text();
		} else {
			this.body = mail.body;
		}
	}
}
