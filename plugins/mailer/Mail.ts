export interface LikeMail {
	from: string;
	to: string;
	subject: string;
	text: string;
	body: string | Response;
}

export default class Mail {
	from: string;
	to: string;
	subject: string;
	text: string;
	body: string | Response;

	async create(mail: LikeMail) {
		this.from = mail.from;
		this.to = mail.to;
		this.subject = mail.subject;
		this.text = mail.text;

		if (typeof mail.body !== 'string') {
			this.body = await mail.body.text();
		}

		this.body = mail.body;
	}
}
