import { describe, it, expect } from "vitest";
import { Buffer } from "node:buffer";
import { parseMultipart } from "./multipart-parser";
import { MultipartForm } from "./fake-multipart";
import fs from "fs";

const form = new MultipartForm("WebKitFormBoundaryABC123");
form.append("avatar", {
  filename: "avatar.png",
  contentType: "image/png", 
  content: fs.readFileSync("./test/images/gaman.png"), 
});

describe("Multipart Parser", () => {
  it("benchmark parser", () => {
    const input = Buffer.from(form.toString());
    const boundary = form.getBoundary();

    const start = performance.now();
    const result = parseMultipart(input, boundary);
    const end = performance.now();

    console.log(`⏱️ Multipart parsed in ${(end - start).toFixed(3)} ms`);
    expect(result).toBeDefined();
  });
  it("benchmark parser", () => {
    const input = Buffer.from(form.toString());
    const boundary = form.getBoundary();

    const start = performance.now();
    const result = parseMultipart(input, boundary);
    const end = performance.now();

    console.log(`⏱️ Multipart parsed in ${(end - start).toFixed(3)} ms`);
    expect(result).toBeDefined();
  });
  it("benchmark parser", () => {
    const input = Buffer.from(form.toString());
    const boundary = form.getBoundary();

    const start = performance.now();
    const result = parseMultipart(input, boundary);
    const end = performance.now();

    console.log(`⏱️ Multipart parsed in ${(end - start).toFixed(3)} ms`);
    expect(result).toBeDefined();  
  }); 
});
