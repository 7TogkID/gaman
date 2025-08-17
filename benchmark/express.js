import http from "k6/http";
import { check } from "k6";

export let options = {
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
    http_req_duration: ["p(95)<1000"],
    http_req_failed: ["rate<0.05"],
  },
};

export default function () {
  const res1 = http.get("http://localhost:3000/");
  check(res1, {
    "GET 200": (r) => r.status === 200,
  });
  
  const payload = JSON.stringify({ name: "Oxarion", version: "1.0" });
  const res2 = http.post("http://localhost:3000/api/test", payload, {
    headers: { "Content-Type": "application/json" },
  });
  check(res2, {
    "POST 200": (r) => r.status === 200,
  });
}
