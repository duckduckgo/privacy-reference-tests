# EventHub Tests

Privacy Feature: <https://app.asana.com/1/137249556945/task/1212993781157339>

EventHub is a reusable, config-driven telemetry framework for web-side signals. A content-scope-scripts
detector emits a named `webEvent { type, data }`; the native client processes it per the remote
`eventHub` configuration and fires a telemetry pixel — either aggregated (a bucketed counter over a
period) or immediate (one pixel per event).

## Goals

These tests verify the **pure, deterministic** parts of EventHub that must behave identically on every
platform, independent of timers, scheduling, persistence or app lifecycle:

- **Bucket assignment** — mapping a counter value onto a configured, ordered set of named buckets.
- **Stop-counting** — deciding when a counter has reached the open-ended bucket and need not keep counting.
- **Attribution period** — rounding a period-start timestamp down to the start of its interval.
- **Data parameter encoding** — turning a forwarded `webEvent.data` value into a pixel parameter.

The stateful runtime (per-tab de-duplication, period windowing, timer scheduling, foreground gating,
write-behind persistence and restart behaviour) is **out of scope** here because it is inherently
time- and platform-mechanism-specific; each platform covers it with native tests.

## Structure

`tests.json` contains four independent sets.

### `bucketAssignment`

- `count` — int — the current counter value.
- `buckets` — object — ordered map of bucket name → `{ "gte": int, "lt": int? }`. A bucket matches when
  `count >= gte` and (`lt` is absent OR `count < lt`). Iteration follows the JSON insertion order.
- `expectBucket` — string | null — the name of the first matching bucket, or `null` if none match.

### `stopCounting`

- `count` — int — the current counter value.
- `buckets` — object — as above.
- `expectShouldStopCounting` — bool — `true` when no bucket has a `gte` greater than `count` (the value
  is in the highest, open-ended bucket and further counting cannot change the outcome). An empty bucket
  set yields `true`.

### `attributionPeriod`

- `periodStartMillis` — int — the period start as a UTC epoch timestamp in milliseconds.
- `periodSeconds` — int — the period length in seconds.
- `expectAttributionPeriod` — int — the interval start as UTC epoch **seconds**:
  `floor((periodStartMillis / 1000) / periodSeconds) * periodSeconds`.

### `dataParameterEncoding`

- `dataValue` — any JSON value — the value taken from `webEvent.data[dataKey]`.
- `expectEncodedParameter` — string — `dataValue` serialized to compact JSON (no insignificant
  whitespace) and then percent-encoded. Test values are chosen so the result is identical across
  standard component encoders (e.g. `encodeURIComponent` / `Uri.EscapeDataString`).

## Pseudo-code implementation

```python
for $set in tests.json
  for $test in $set.tests
    if $test.exceptPlatforms includes 'current-platform'
        skip

    switch $set:
      bucketAssignment:
        expect(bucketCount($test.count, $test.buckets) === $test.expectBucket)
      stopCounting:
        expect(shouldStopCounting($test.count, $test.buckets) === $test.expectShouldStopCounting)
      attributionPeriod:
        expect(attributionPeriod($test.periodStartMillis, $test.periodSeconds) === $test.expectAttributionPeriod)
      dataParameterEncoding:
        expect(encodeDataParameter($test.dataValue) === $test.expectEncodedParameter)
```

## Platform exceptions

None — every supported behaviour is identical across platforms, so all `exceptPlatforms` lists are empty.
