---
name: write-the-forecast
description: Turn tomorrow's forecast figures for a city into one plain sentence.
---

# Write the forecast

Run `scripts/write-forecast.mjs` with the file holding the forecast the caller
handed over and the job's records folder. It asks the model the owner bound to
say the forecast in one plain sentence, keeps the sentence in the records
folder, and prints it. Hand that sentence back to the caller as it is.

Say nothing the forecast does not say, and do not keep the forecast once the
job is done.
