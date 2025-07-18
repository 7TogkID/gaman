import http from "k6/http";
import { check } from "k6";

export let options = {
  vus: 2000,
  duration: "1m",
  thresholds: {
    http_req_duration: ["p(95)<100"],
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  const res1 = http.get("http://localhost:3000/");
  check(res1, {
    "GET status 200": (r) => r.status === 200,
  });

  const payload = JSON.stringify({ name: "Oxarion", version: "1.0" });
  const res2 = http.post("http://localhost:3000/api/test", payload, {
    headers: { "Content-Type": "application/json" },
  });
  check(res2, {
    "POST status 200": (r) => r.status === 200,
  });
}
