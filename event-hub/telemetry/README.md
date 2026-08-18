# EventHub telemetry — reference tests

These tests pin the **shipped behaviour** of eventHub telemetry pixels — counter aggregation, bucketing, per-page de-duplication and immediate triggers — as specified in the eventHub core design. They exist so that work touching shared hub paths (notably event ingestion and de-duplication, which experiment metrics also rely on) has to prove existing telemetry behaviour is preserved.

## Model

Each test delivers an ordered list of events, then the harness ends the current period of every period pixel **exactly once**. `expectPixels` is the complete set of pixels enqueued during the test — immediate pixels as events arrive, period pixels at period end — compared as an unordered set of `{ pixel, params }`.

- Events carry `type`, and `tabId`/`url` for web events. A `navigation` event signals the tab moving to a URL (the hub's navigation tracking), which is what clears de-duplication state when the URL differs from the tab's previous one.
- `params` lists the parameters the pixel must carry with exactly these values. **Time-derived parameters (`attributionPeriod`) are excluded from comparison** — asserting them would drag period-boundary arithmetic into scope.
- A pixel absent from `expectPixels` must not fire. This is how the no-matching-bucket and disabled-pixel cases are expressed.

## Notable expectations

- **Counters de-duplicate per page per tab, scoped per pixel and parameter.** A tab's state clears on navigation to a *different* URL; a same-URL reload does not clear it. These are the same semantics experiment metric conversions specify, so a shared implementation satisfies both suites.
- **Bucketing is first-match-wins at period end**, and a pixel with no parameter values does not fire — a config without a zero bucket is silent for an idle period, one with a zero bucket reports `count=0`.
- **Immediate pixels fire per occurrence, without de-duplication**, forwarding `data` payload fields via their `dataKey` parameters.
- **Disabled pixels never fire.**

## Deliberately out of scope

These are real behaviours of the shipped system that this suite does not currently assert, either because they are platform-lifecycle concerns or to keep the initial suite reviewable:

- **Persistence and restart** (state surviving app closure, timers re-arming, fire-on-restore) — platform lifecycle, covered by platform unit tests.
- **Foreground gating of new periods** and multi-period cadence.
- **Mid-cycle config changes** (the period-start config snapshot). Assertable with a phase mechanism like the metrics lifecycle tests; a candidate extension.
- **Pixel transport** — enqueueing, retry, network.
