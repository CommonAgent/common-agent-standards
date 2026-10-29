// check-vector.mjs: prove that this folder's signing code produces Agent
// Messaging's own signed test vector, byte for byte.
//
//   node tools/check-vector.mjs
//
// The vector is copied from messaging/conformance/inbound-protections.json
// (envelopes.addressed_to_recipient) in the Common Agent Standards
// repository. Its seed is a published test seed and controls nothing.
import { keypairFromSeed, signEnvelope, verifyEnvelope, canonical } from "./lib.mjs";

const SEED = "SUAEGDPNTWXACIF45CA23BUY36RIMWZXW5LEHSEOK2ONS5JWJ7PBC2EWBA";
const ID = "UBMBH4BK6EIHQFVMHLSABFSQXB3JXUFZOXVZQTIERO33AD4HHAI3D7QP";
const ENVELOPE = {
  v: "0.2.0", id: "019894f0-0000-7000-8000-000000000001", type: "request", ts: "2026-07-26T12:00:00.000Z",
  from: ID, trace: { trace_id: "4bf92f3577b34da6a3ce929d0e0e4736", span_id: "00f067aa0ba902b7" },
  to: "UAKQRYZBYFOC65OQZVJ3QPCIERDTRNNZPMOJUYXC3DGPRCDWSKD4HV5A",
  payload: { offering: "chat", input: { text: "hello" } },
  sig: "p-AMEZitesIWDHNirx4zz8gytHn4hFqDE6NlNxl_sHwYTC88ZOKOq8Nauxj0NSXj8xQInu2yPPmJ-e9ZIGRtAQ",
};
const CANONICAL = '{"from":"UBMBH4BK6EIHQFVMHLSABFSQXB3JXUFZOXVZQTIERO33AD4HHAI3D7QP","id":"019894f0-0000-7000-8000-000000000001","payload":{"input":{"text":"hello"},"offering":"chat"},"to":"UAKQRYZBYFOC65OQZVJ3QPCIERDTRNNZPMOJUYXC3DGPRCDWSKD4HV5A","trace":{"span_id":"00f067aa0ba902b7","trace_id":"4bf92f3577b34da6a3ce929d0e0e4736"},"ts":"2026-07-26T12:00:00.000Z","type":"request","v":"0.2.0"}';

const kp = keypairFromSeed(SEED);
const checks = {
  "agent ID from the seed": kp.id === ID,
  "canonical JSON": canonical((({ sig, ...r }) => r)(ENVELOPE)) === CANONICAL,
  "signature reproduced": signEnvelope(ENVELOPE, kp).sig === ENVELOPE.sig,
  "signature verifies": verifyEnvelope(ENVELOPE),
};
for (const [k, v] of Object.entries(checks)) console.log(`${v ? "pass" : "FAIL"}  ${k}`);
const ok = Object.values(checks).every(Boolean);
console.log(ok ? "the signature test vector matches" : "the signature test vector does not match");
process.exit(ok ? 0 : 1);
