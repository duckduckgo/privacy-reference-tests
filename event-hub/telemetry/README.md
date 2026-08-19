# EventHub telemetry — reference tests

These tests pin the behaviour of eventHub telemetry pixels — counter aggregation, bucketing and immediate triggers — as specified in the eventHub core design. Telemetry consumes the hub's de-duplicated delivery: the de-duplication semantics themselves are pinned by the sibling [`deduplication`](../deduplication/README.md) suite, and this suite asserts what the handlers do with delivered events. The authoritative descriptive form of these cases (stable IDs `T-CNT-*`, `T-IMM-*`) lives in the ddg-workflow repo at `docs/event-hub/tests/telemetry.md`; these fixtures are its machine-readable interpretation.

Note the immediate-pixel expectations deliberately encode the hub-de-duplicated rule — one pixel per event type per page — which is a **change** from the per-occurrence firing previously shipped on Apple and Windows.

## Model

Each test delivers an ordered list of events, then the harness ends the current period of every period pixel **exactly once**. `expectPixels` is the complete set of pixels enqueued during the test — immediate pixels as events arrive, period pixels at period end — compared as an unordered set of `{ pixel, params }`.

- Events carry `type`, and `tabId`/`url` for web events.
- `params` lists the parameters the pixel must carry with exactly these values. **Time-derived parameters (`attributionPeriod`) are excluded from comparison** — asserting them would drag period-boundary arithmetic into scope.
- A pixel absent from `expectPixels` must not fire. This is how the no-matching-bucket and disabled-pixel cases are expressed.

## Notable expectations

- **Counters count delivered events.** The hub de-duplicates web events at ingestion, before fan-out ([`deduplication`](../deduplication/README.md) suite); the counter itself does no duplicate-checking.
- **Bucketing is first-match-wins at period end**, and a pixel with no parameter values does not fire — a config without a zero bucket is silent for an idle period, one with a zero bucket reports `count=0`.
- **Immediate pixels fire once per delivered event**, forwarding `data` payload fields via their `dataKey` parameters. Under the hub's de-duplication that means once per event type per page for web events; native events fire on every occurrence.
- **Disabled pixels never fire, regardless of trigger type** — a disabled period pixel and a disabled immediate pixel are equally silent, even when an enabled pixel shares the same trigger.

## Deliberately out of scope

These are real behaviours of the shipped system that this suite does not currently assert, either because they are platform-lifecycle concerns or to keep the initial suite reviewable:

- **Persistence and restart** (state surviving app closure, timers re-arming, fire-on-restore) — platform lifecycle, covered by platform unit tests.
- **Foreground gating of new periods** and multi-period cadence.
- **Mid-cycle config changes** (the period-start config snapshot). Assertable with a phase mechanism like the metrics lifecycle tests; a candidate extension.
- **Pixel transport** — enqueueing, retry, network.
