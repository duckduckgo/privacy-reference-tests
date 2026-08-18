# Experiment metrics — reference tests

These tests specify the behaviour required by the [remotely-configured event-driven metrics design](https://app.asana.com/1/137249556945/project/72649045549333/task/1217052832008956?focus=true).

## What is being tested

Whether a client, given experiment subfeatures whose `settings.metrics` declare metrics, and a set of experiments the user is already enrolled in, reports the right conversions to the Native Apps experiment framework when events arrive.

Metrics are declared **inside the experiment they measure** — content scope experiments (`contentScopeExperiments.features.*`) and TDS experiments (`blockList.features.*` on Android, `contentBlocking.features.*` elsewhere). There is no selector: declaration is attachment. The reference configuration carries identical TDS experiment definitions under both parent spellings; **a client must read exactly the parent it ships against, never both.**

The tests deliberately stop at the framework boundary. They assert **what the client reports** — metric name, experiment, cohort, conversion window and value — and not what the framework then does with it. Framework-internal counters, storage keys and outgoing pixels are exactly where the platforms differ, and pinning them down here would encode one platform's implementation as the contract. Likewise nothing here prescribes *how* events reach the matching logic (scanning, subscription, or anything else); only the reported conversions are observable.

Cohort assignment and experiment enrollment are also out of scope. Each experiment type owns its own enrollment, so tests declare enrolled experiments directly rather than deriving them from cohort weights.

## Files

| File | Contents |
|---|---|
| `config_reference.json` | Experiment subfeatures under both parent features, each declaring `settings.metrics` keyed by metric name with an `event` and one or more `conversions` groups |
| `tests.json` | `selection`, `conversionWindows`, `thresholds`, `dedup` |
| `lifecycle_tests.json` | Metrics and experiments appearing in and disappearing from the configuration |

## Test format

A set has an optional `configReference` naming its configuration fixture; sets in the same file may use different fixtures.

Each test provides:

| Field | Meaning |
|---|---|
| `activeExperiments` | Experiments the user is enrolled in: `experiment`, `cohort`, `enrollmentDate`, and `daysSinceEnrollment` giving the simulated current day |
| `events` | Ordered events. `type` is the only required field; `tabId` and `url` are present for web events and absent for native ones. A `navigation` event signals a tab moving to a new page, including a reload of the same URL. |
| `expectConversions` | Every expected conversion, and only those. Compared as an unordered set. |

Lifecycle tests replace `events` with ordered `phases`. A phase may set `activeExperiments` and `experimentMetrics` — a map from experiment name to the list of metric keys present in that experiment's `settings.metrics` for the phase — carrying forward the previous phase's values where omitted, and then delivers its `events`, each carrying a `day` offset from enrollment. Experiments never named in `experimentMetrics` keep their reference-configuration metrics. Conversions accumulate across all phases.

A conversion is `{ metric, experiment, cohort, conversionWindowDays, value }`, using the wire shapes the framework already uses: `conversionWindowDays` is `"N"` for a single-day window and `"low-high"` otherwise, and `value` is a string carrying the configured threshold. `enrollmentDate` appears in expectations only where a test spans more than one enrollment.

## Notable expectations

- **Declaration is attachment.** A metric converts only for the experiment whose settings declare it, and only while the user is enrolled in that experiment. An enrolled experiment declaring no metrics converts nothing; a declared metric on an unenrolled experiment converts nothing; a user enrolled in nothing produces nothing.
- **Both experiment types must work.** `pageLoad` is declared by a content scope experiment and a TDS experiment; a platform that only wired one parent feature fails the cross-parent selection test.
- **Metric names are scoped to their experiment.** Several experiments may declare the same name — bound to the same event (each converts on that one event) or to different events (each converts on exactly the event its own declaration names). A conversion must be reported per (experiment, metric), never fanned out by name alone.
- Windows are inclusive at both ends, day 0 is the enrollment day, and a group with several windows converts once per window independently.
- **`windows` and `thresholds` form a product within a conversion group**; several groups under one metric express the partial product production retention metrics use. A group omitting `thresholds` defaults to `[1]`.
- **Web events de-duplicate exactly like aggregate counters.** Events carrying a tab context count at most once per page per event type; the tab's de-duplication state clears when it navigates to a **different URL**, so a same-URL reload does not produce a new occurrence, while returning to a page after navigating away does. Events without tab context are not de-duplicated. Only thresholds above 1 observe any of this.
- **Definitions are read live at conversion time.** Removing a metric from its experiment's settings stops conversions as soon as the new configuration is applied — deletion is the kill switch — and platforms that snapshot definitions at enrollment must consult current configuration when matching. A later experiment declaring the same metric name converts fresh.
- **Metrics never join a running experiment.** Config validation rejects adding metrics to an experiment that is already enabled, so that state is invalid rather than reference-tested: metrics arrive with their experiment and only ever leave.

## Two things these tests cannot assert

**Day boundaries.** Platforms count a day differently — calendar days in Eastern time on Android, calendar days in the device's local timezone on Apple, elapsed 24-hour periods from the enrollment instant on Windows, and 24-hour buckets from EST midnight on the extension. This is pre-existing framework behaviour. Tests therefore use whole-day offsets well away from midnight and never assert on what happens at a boundary.

**Whether a pixel leaves the device.** Sampling, pixel de-duplication and network behaviour sit beyond the reported conversion.
