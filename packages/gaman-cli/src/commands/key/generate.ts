import { randomBytes } from "crypto";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";

export default async function generateKey() {
	const envPath = resolve(process.cwd(), ".env");
	const key = randomBytes(32).toString("hex");

	let envContent = "";
	if (existsSync(envPath)) {
		envContent = readFileSync(envPath, "utf-8");
		// Hapus baris GAMAN_KEY jika sudah ada
		envContent = envContent
			.split("\n")
			.filter((line) => !line.trim().startsWith("GAMAN_KEY="))
			.join("\n");
	}

	envContent += `\nGAMAN_KEY=${key}\n`;

	writeFileSync(envPath, envContent.trim() + "\n");
	console.log(`🔐 GAMAN_KEY generated and written to .env`);
}
