export class MultipartForm {
    constructor(boundary) {
        this.parts = [];
        this.boundary = boundary || `----MultipartBoundary${Math.random().toString(16).slice(2)}`;
    }
    append(name, value) {
        this.parts.push([name, value]);
    }
    getBoundary() {
        return this.boundary;
    }
    toString() {
        const lines = [];
        for (const [name, value] of this.parts) {
            lines.push(`--${this.boundary}`);
            if (typeof value === 'string') {
                lines.push(`Content-Disposition: form-data; name="${name}"`);
                lines.push('');
                lines.push(value);
            }
            else {
                lines.push(`Content-Disposition: form-data; name="${name}"; filename="${value.filename}"`);
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
