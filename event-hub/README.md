# EventHub Pixel Building Tests

Privacy Feature: https://app.asana.com/1/137249556945/task/1215278429546162

## Goals

This set of tests verifies how a client builds an EventHub aggregate pixel's output from a
resolved period state: given a pixel `config` and the normalized per-parameter state for a period,
they assert **whether the pixel fires** and the **exact output parameters** it carries.

The tests are scoped to the **pure pixel-building contract** across all parameter templates
(`counter`, `data`, `experiments`). They do **not** cover event counting/dedup, enrolment
resolution, or the stateful lifecycle (period-start snapshot, config-persist re-resolve,
best-effort leave detection, fire scheduling) — those depend on each platform's frameworks, clock
and scheduler and are validated by per-platform integration tests. `immediate`-trigger pixels are
also out of scope (aggregate/period pixels only).

## Structure

`pixel_building_tests.json` is validated by the custom schema `event-hub-pixel-building-schema.json`
(referenced via its `$schema` field). It is an object of test sets; each set has `name`, optional
`desc`, and a `tests` array.

Test suite specific fields:

- `config` - object - a full telemetry pixel config (`state`, `trigger.period`, `parameters` with
  mixed `counter` / `data` / `experiments` templates). Specified inline per test.
- `parameterState` - object (optional) - map of a `counter`/`data` parameter name to its normalized
  end-of-period state:
    - counter: `{ "count": int }` (the accumulated count for the period)
    - data: `{ "value": <JSON value> }` (the captured value; any JSON type)
    - a parameter absent from `parameterState` is treated as not populated.
- `enrolledExperiments` - array (optional) - the experiments the user was enrolled in at any point
  during the period (the candidate set for `experiments` params, before `matchExperiments`
  filtering). Each entry is exactly one of two shapes (never mixed):
    - stable: `{ "name": string, "cohort": string, "enrollmentUnixSeconds": int }`
    - partial: `{ "name": string, "enrollmentChanged": true }`
  The discriminator is the presence of `enrollmentChanged: true` (partial); otherwise the entry is
  stable. A stable entry must have `enrollmentUnixSeconds <= periodStartUnixSeconds` (an enrolment
  after `periodStart` is a mid-period join, i.e. partial). It follows that a stable enrolment's
  tenure at `periodEnd` is always at least the period duration, so bucket boundaries below the
  period length are unreachable by stable enrolments.
- `periodStartUnixSeconds` - int - the period's start. `periodEnd = periodStart + trigger.period`
  (mirrors the client). Drives enrolment-duration buckets (anchored to `periodEnd`) and
  `attributionPeriod` (derived from `periodStart`).
- `expectFires` - bool - whether the pixel should fire this period.
- `expectParameters` - object - map of output parameter name to expected value (all emitted
  params, including `attributionPeriod`). Present only when `expectFires` is true.

### Firing

Firing is driven by measurement parameters only: a pixel fires if at least one `counter` parameter
matched a bucket or one `data` parameter captured a value. The `experiments` template is
dimensional and never causes (or suppresses) a fire; its value rides along on pixels that fire for
measurement reasons.

### Result comparison

Each emitted parameter value is transported as compact JSON (where applicable) then percent-encoded;
output key order is not significant. Compare per parameter, after a single percent-decode of the
actual value:

- `counter` bucket names and `attributionPeriod` compare as strings.
- `data` and `experiments` values are JSON-parsed and deep-compared.

The consumer determines each parameter's template from `config`. `attributionPeriod` is authored
manually in `expectParameters` (`floor(periodStartSeconds / periodSeconds) * periodSeconds`); the
consumer asserts the client's computed value against it.

## Pseudo-code implementation

```
for $testSet in pixel_building_tests.json
  for $test in $testSet.tests
    if $test.exceptPlatforms includes 'current-platform'
        skip

    ($fires, $params) = buildPixelOutput(
        config=$test.config,
        parameterState=$test.parameterState,
        enrolledExperiments=$test.enrolledExperiments,
        periodStartUnixSeconds=$test.periodStartUnixSeconds
    )

    expect($fires == $test.expectFires)
    if $fires:
        expect(keys($params) == keys($test.expectParameters))
        for ($name, $expected) in $test.expectParameters:
            $actual = percentDecodeOnce($params[$name])
            if templateOf($name) in ('data', 'experiments'):
                expect(parseJson($actual) deepEquals $expected)
            else:
                expect($actual == $expected)
```

Where the builder follows the design contract: `counter` -> bucket name for the count; `data` ->
the captured value; `experiments` -> `{ "<name>": {"cohort": ...} | {"enrollmentChanged": true} }`
per matching experiment (with `enrollmentBucket` when configured), or `{}` when none match;
`attributionPeriod` added when firing; fires iff a measurement (counter/data) parameter is
populated.

## Platform exceptions

EventHub is only implemented on some platforms, and template support differs. `exceptPlatforms` is
set per test according to this matrix (skip = listed in `exceptPlatforms`):

- `counter`: Android + Windows. Skipped on `ios-browser`, `macos-browser`, `web-extension`,
  `web-extension-mv3`, `safari-extension`.
- `data`: Windows only. Skipped on all others.
- `experiments`: Android only. Skipped on all others.

As EventHub and these templates land on more platforms, the corresponding `exceptPlatforms` entries
should be removed.
