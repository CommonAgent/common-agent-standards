// Write tomorrow's forecast for a city as one plain sentence.
//   node write-forecast.mjs <forecast.json> <records folder for this job>
//
// The model is the agent's model system, text-reasoning. Which model, where it
// answers, its key and its format are the four settings MODEL_NAME,
// MODEL_ENDPOINT, MODEL_KEY and MODEL_PROTOCOL, read on every run. This
// program carries none of them.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export async function writeSentence(forecast) {
  const model = process.env.MODEL_NAME;
  const endpoint = process.env.MODEL_ENDPOINT;
  const key = process.env.MODEL_KEY;
  const protocol = process.env.MODEL_PROTOCOL;
  for (const [name, value] of [["MODEL_NAME", model], ["MODEL_ENDPOINT", endpoint], ["MODEL_PROTOCOL", protocol]]) {
    if (!value) throw new Error(`${name} is not set`);
  }
  if (protocol !== "anthropic-messages") throw new Error(`MODEL_PROTOCOL is ${protocol}, and this package speaks anthropic-messages`);
  const r = await fetch(`${endpoint.replace(/\/$/, "")}/v1/messages`, {
    method: "POST",
    headers: { "content-type": "application/json", "anthropic-version": "2023-06-01", ...(key ? { "x-api-key": key } : {}) },
    body: JSON.stringify({
      model,
      max_tokens: 200,
      messages: [{ role: "user", content: `Say this forecast in one plain sentence, and nothing it does not say: ${JSON.stringify(forecast)}` }],
    }),
  });
  if (!r.ok) throw new Error(`the model answered ${r.status}`);
  const answer = await r.json();
  return answer.content.map((part) => part.text ?? "").join("").trim();
}

const [file, records] = process.argv.slice(2);
if (file && records) {
  const sentence = await writeSentence(JSON.parse(readFileSync(file, "utf8")));
  mkdirSync(records, { recursive: true });
  writeFileSync(join(records, "sentence.txt"), sentence + "\n");
  console.log(sentence);
}
