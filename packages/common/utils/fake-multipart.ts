// multipart.ts
type FilePart = {
  filename: string;
  contentType: string;
  content: string | Buffer;
};

type FormValue = string | FilePart;

export class MultipartForm {
  private boundary: string;
  private parts: [string, FormValue][] = [];

  constructor(boundary?: string) {
    this.boundary = boundary || `----MultipartBoundary${Math.random().toString(16).slice(2)}`;
  }

  public append(name: string, value: FormValue) {
    this.parts.push([name, value]);
  }

  public getBoundary(): string {
    return this.boundary;
  }

  public toString(): string {
    const lines: string[] = [];

    for (const [name, value] of this.parts) {
      lines.push(`--${this.boundary}`);

      if (typeof value === 'string') {
        lines.push(`Content-Disposition: form-data; name="${name}"`);
        lines.push('');
        lines.push(value);
      } else {
        lines.push(
          `Content-Disposition: form-data; name="${name}"; filename="${value.filename}"`
        );
        lines.push(`Content-Type: ${value.contentType}`);
        lines.push('');
        lines.push(typeof value.content === 'string' ? value.content : value.content.toString());
      }
    }

    lines.push(`--${this.boundary}--`);
    lines.push('');

    return lines.join('\r\n');
  }
}
