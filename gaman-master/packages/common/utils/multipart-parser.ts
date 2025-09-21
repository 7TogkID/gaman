import { Buffer } from "node:buffer";

export interface ParsedMultipart {
  name: string;
  isText: boolean;
  isFile: boolean;
  filename?: string;
  text?: string;
  mediaType?: string;
  content: Buffer;
}

export function parseMultipart(
  data: Buffer,
  boundary: string
): ParsedMultipart[] {
  const rawData = data.toString("latin1");
  const parts = rawData.split(`--${boundary}`).slice(1, -1);

  const multipart: ParsedMultipart[] = [];

  let i = 0;
  while (i < parts.length) {
    const part = parts[i].trim();
    const [rawHeaders, ...rest] = part.split("\r\n\r\n");
    const body = rest.join("\r\n\r\n");

    const headers = rawHeaders.split("\r\n");

    let name = "";
    let filename: string | undefined;
    let contentType: string | undefined;

    let j = 0;
    while (j < headers.length) {
      const header = headers[j];
      const [key, ...valueParts] = header.split(":");
      const lowerKey = key.trim().toLowerCase();
      const value = valueParts.join(":").trim();

      if (lowerKey === "content-disposition") {
        const attrs = value.split(";");
        let k = 0;
        while (k < attrs.length) {
          const attr = attrs[k].trim();
          const [attrKey, attrValRaw] = attr.split("=");
          const attrVal = attrValRaw?.trim().replace(/^"|"$/g, "");
          if (attrKey === "name") name = attrVal;
          if (attrKey === "filename") filename = attrVal;
          k++;
        }
      }

      if (lowerKey === "content-type") {
        contentType = value;
      }

      j++;
    }

    if (filename) {
      multipart.push({
        name,
        isText: false,
        isFile: true,
        filename,
        mediaType: contentType ?? "application/octet-stream",
        content: Buffer.from(body, "latin1"),
      });
    } else {
      multipart.push({
        name,
        isText: true,
        isFile: false,
        text: body,
        content: Buffer.from(body, "latin1")
      });
    }

    i++;
  }

  return multipart;
}
