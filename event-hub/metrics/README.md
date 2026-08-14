# Event Hub — remotely-configured metrics reference tests

**Status: proposal.** These tests accompany the [remotely-configured event-driven metrics design](https://app.asana.com/1/137249556945/project/72649045549333/task/1217052832008956?focus=true) and are for review alongside it. No platform implements them yet.

## What is being tested

Whether a client, given a `metrics` map in `eventHub.settings` and a set of experiments the user is already enrolled in, reports the right conversions to the Native Apps experiment framework when events arrive.

The tests deliberately stop at the framework boundary. They assert **what the client reports** — metric name, experiment, cohort, conversion window and value — and not what the framework then does with it. Framework-internal counters, storage keys, dedup tags and outgoing pixels are exactly where the platforms differ, and pinning them down here would encode one platform's implementation as the contract.

Cohort assignment and experiment enrollment are also out of scope. Each experiment type owns its own enrollment, so tests declare enrolled experiments directly rather than deriving them from cohort weights.

Fixtures use the **compiled** configuration shape, which is what clients receive. In particular `experiments` is a list of literal experiment names: the user-facing config uses regular expressions, but they are expanded during the remote-config build, so no client performs pattern matching and expansion is tested in `remote-config` rather than here.

## Files

| File | Contents |
|---|---|
| `config_reference.json` | Primary configuration: metric names mapping to a `source`, an experiments list and one or more `conversions` groups, plus the experiments they select across two parent features |
| `tests.json` | `selection`, `conversionWindows`, `thresholds`, `eventStream` |
| `lifecycle_tests.json` | Metrics and experiments appearing in and disappearing from the configuration |

These specify the recommended semantics only. The one behaviour still open in the design is de-duplication: if it resolves towards the tab-scoped semantics used by aggregate counters, the expectations in the `eventStream` set change, and no separate set is added. That decision only affects thresholds above 1.

## Test format

A set has an optional `configReference` naming its configuration fixture; sets in the same file may use different fixtures.

Each test provides:

| Field | Meaning |
|---|---|
| `activeExperiments` | Experiments the user is enrolled in: `experiment`, `cohort`, `enrollmentDate`, and `daysSinceEnrollment` giving the simulated current day |
| `events` | Ordered events. `type` is the only required field; `tabId` and `url` are present for web events and absent for native ones. A `navigation` event signals a tab moving to a new URL. |
| `expectConversions` | Every expected conversion, and only those. Compared as an unordered set. |

Lifecycle tests replace `events` with ordered `phases`. A phase may set `activeExperiments`, `enabledMetrics` and `metricExperiments` — carrying forward the previous phase's values where omitted — and then delivers its `events`, each carrying a `day` offset from enrollment. `enabledMetrics` names keys under `metrics`; `metricExperiments` replaces a named metric's experiments list, standing in for a narrowed selector in the source config. Conversions accumulate across all phases.

A conversion is `{ metric, experiment, cohort, conversionWindowDays, value }`, using the wire shapes the framework already uses: `conversionWindowDays` is `"N"` for a single-day window and `"low-high"` otherwise, and `value` is a string carrying the configured threshold. `enrollmentDate` appears in expectations only where a test spans more than one enrollment.

## Two things these tests cannot assert

**Day boundaries.** Platforms count a day differently — calendar days in Eastern time on Android, calendar days in the device's local timezone on Apple, elapsed 24-hour periods from the enrollment instant on Windows, and 24-hour buckets from EST midnight on the extension. This is pre-existing framework behaviour. Tests therefore use whole-day offsets well away from midnight and never assert on what happens at a boundary.

**Whether a pixel leaves the device.** Sampling, pixel de-duplication and network behaviour sit beyond the reported conversion.

## Notable expectations

- Selection is **set membership** against the experiments the user is enrolled in. There is no pattern matching on the client.
- Selection ignores the parent feature. One list may name both a content scope experiment and a TDS experiment.
- A user enrolled in no listed experiment produces nothing, as does a user enrolled in nothing at all. This is the main reason a metric cannot convert outside its experiments.
- **`source` and `experiments` belong to the metric name**, not to individual conversion groups, so one metric name means exactly one measurement.
- Windows are inclusive at both ends, day 0 is the enrollment day, and a group with several windows converts once per window independently.
- **`windows` and `thresholds` form a product within a conversion group.** Thresholds `[1, 3]` over one window give a cumulative histogram: three occurrences cross both, each converting once.
- **Several `conversions` groups under one metric name are independent**, which is how the partial product used by production retention metrics is expressed — per-day windows at threshold 1 in one group, range windows at higher thresholds in another.
- A group omitting `thresholds` defaults to `[1]`.
- Occurrences outside the window do not count towards a threshold.
- Metrics observe the raw event stream with no de-duplication, matching immediate-trigger telemetry rather than aggregate counters. This only affects thresholds above 1.
- Removing a metric stops conversions immediately, on every platform. There is no `state` field, so absence is the only off switch.
- Re-adding a metric does not let a converted user convert again, but a new experiment enrollment does.
- A metric defined before its experiment is inert rather than an error, and starts converting when the experiment enrolls. Enabling both in a single configuration change also works; the extension is excepted only from tests that **add** a metric after enrollment, because it snapshots the metric list at enrollment. Removal needs no exception.
