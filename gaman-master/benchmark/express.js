import http from "k6/http";
import { check } from "k6";

export const options = {
  scenarios: {
    overload_test: {
      executor: "ramping-arrival-rate",
      startRate: 100,
      timeUnit: "1s",
      preAllocatedVUs: 500,
      maxVUs: 10000,
      stages: [
        { target: 1000, duration: "5s" },
        { target: 2000, duration: "5s" },
        { target: 3000, duration: "5s" },
        { target: 4000, duration: "5s" },
        { target: 5000, duration: "5s" },
        { target: 0, duration: "5s" },
      ],
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<1000"], // 95% requests < 1s
    http_req_failed: ["rate<0.05"],    // < 5% failed requests
  },
};

// Base URLs
const BASE_URL = "http://localhost:3000";
const API_URL = `${BASE_URL}/api/test`;

// Static payload
const payload = JSON.stringify({ name: "Oxarion", version: "1.0" });
const headers = { headers: { "Content-Type": "application/json" } };

export default function () {
  // GET /
  const resGet = http.get(BASE_URL, { tags: { name: "GET Root" } });
  check(resGet, { "GET / status 200": (r) => r.status === 200 });

  // POST /api/test
  const resPost = http.post(API_URL, payload, headers, { tags: { name: "POST API" } });
  check(resPost, { "POST /api/test status 200": (r) => r.status === 200 });
}
