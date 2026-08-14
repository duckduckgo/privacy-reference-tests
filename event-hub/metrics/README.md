# Event Hub — remotely-configured metrics reference tests

**Status: proposal.** These tests accompany the [remotely-configured event-driven metrics design](https://app.asana.com/1/137249556945/project/72649045549333/task/1217052832008956?focus=true) and are for review alongside it. No platform implements them yet.

## What is being tested

Whether a client, given a `metrics` map in `eventHub.settings` and a set of experiments the user is already enrolled in, reports the right conversions to the Native Apps experiment framework when events arrive.

The tests deliberately stop at the framework boundary. They assert **what the client reports** — metric name, experiment, cohort, conversion window and value — and not what the framework then does with it. Framework-internal counters, storage keys, dedup tags and outgoing pixels are exactly where the platforms differ, and pinning them down here would encode one platform's implementation as the contract.

Cohort assignment and experiment enrollment are also out of scope. Each experiment type owns its own enrollment, so tests declare enrolled experiments directly rather than deriving them from cohort weights.

## Files

| File | Contents |
|---|---|
| `config_reference.json` | Primary configuration: nine metrics using full-match regular expression selectors, plus the experiments they select across two parent features |
| `tests.json` | `selection`, `conversionWindows`, `thresholds`, `eventStream` |
| `lifecycle_tests.json` | Metrics and experiments appearing in and disappearing from the configuration |
| `config_explicit_reference.json` | Alternative configuration using explicit names and prefixes instead of regular expressions |
| `alternatives_tests.json` | `explicitSelector` and `tabDeduplicatedStream` — the two alternatives still open in the design |

`alternatives_tests.json` specifies options that are **not** the recommendation. It exists so the trade-offs are testable rather than merely described, and so that whichever option is chosen already has coverage. Only one selector form and one de-duplication semantic should ultimately be adopted.

## Test format

A set has an optional `configReference` naming its configuration fixture; sets in the same file may use different fixtures.

Each test provides:

| Field | Meaning |
|---|---|
| `activeExperiments` | Experiments the user is enrolled in: `experiment`, `cohort`, `enrollmentDate`, and `daysSinceEnrollment` giving the simulated current day |
| `events` | Ordered events. `type` is the only required field; `tabId` and `url` are present for web events and absent for native ones. A `navigation` event signals a tab moving to a new URL. |
| `expectConversions` | Every expected conversion, and only those. Compared as an unordered set. |

Lifecycle tests replace `events` with ordered `phases`. A phase may set `activeExperiments`, `enabledMetrics` and `disabledMetrics` — carrying forward the previous phase's values where omitted — and then delivers its `events`, each carrying a `day` offset from enrollment. Conversions accumulate across all phases.

A conversion is `{ metric, experiment, cohort, conversionWindowDays, value }`, using the same wire shapes the framework already uses: `conversionWindowDays` is `"N"` for a single-day window and `"low-high"` otherwise, and `value` is a string. `enrollmentDate` appears in expectations only where a test spans more than one enrollment.

## Two things these tests cannot assert

**Day boundaries.** Platforms count a day differently — calendar days in Eastern time on Android, calendar days in the device's local timezone on Apple, elapsed 24-hour periods from the enrollment instant on Windows, and 24-hour buckets from EST midnight on the extension. This is pre-existing framework behaviour. Tests therefore use whole-day offsets well away from midnight and never assert on what happens at a boundary.

**Whether a pixel leaves the device.** Sampling, pixel deduplication and network behaviour sit beyond the reported conversion.

## Notable expectations

- A selector without metacharacters is a **full-string** match. `contentScopeExperiment1` does not select `contentScopeExperiment10`; `contentScopeExperiment1.*` does. Java's `Pattern.matches` is full-match by default while `NSRegularExpression`, .NET `Regex.IsMatch` and JavaScript `RegExp.test` are not, so this needs asserting.
- Selectors ignore the parent feature. One pattern may select both a content scope experiment and a TDS experiment.
- Windows are inclusive at both ends, day 0 is the enrollment day, and a metric with several windows converts once per window independently.
- Two metric entries sharing a `name` with different `value`s form a cumulative histogram: three occurrences cross both the value 1 and value 3 thresholds, each reporting once.
- Occurrences outside the window do not count towards a threshold.
- Metrics observe the raw event stream with no de-duplication, matching immediate-trigger telemetry rather than aggregate counters. This only affects metrics with a value above 1.
- Removing a metric stops conversions immediately rather than at the end of the experiment, and `state: disabled` is identical to absence.
- Re-adding a metric does not let a converted user convert again, but a new experiment enrollment does.
- Enabling an experiment and its metrics in a single configuration change works. The extension is excepted from the tests that depend on post-enrollment metric changes, because it snapshots the metric list at enrollment.
