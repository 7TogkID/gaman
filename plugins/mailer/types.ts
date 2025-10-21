export interface Credentials {
	user: string;
	password: string;
}

export interface Transport {
	host?: string;
	port?: number;
	secure?: boolean;
	auth: Credentials;
}

export interface Mail {
	from: string;
	to: string;
	subject: string;
	text: string;
	body: string | Response;
}

export interface MailerSentOptions {
	debug?: boolean;
	delay?: number;
	timeout?: number;
	scheduled_at?: string;
}
