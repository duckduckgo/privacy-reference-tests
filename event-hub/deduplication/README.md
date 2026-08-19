# EventHub de-duplication — reference tests

These tests pin the EventHub's **ingestion de-duplication**: one decision per web event, made at the hub before events fan out to handlers. A web event that passes is delivered to every handler; a duplicate is delivered to none. Handlers — aggregate counters, immediate pixels, experiment metrics — receive occurrences and implement no de-duplication of their own. The authoritative descriptive form of these cases (stable IDs `D-DEL-*`, `D-NAV-*`, `D-NAT-*`) lives in the ddg-workflow repo at `docs/event-hub/tests/deduplication.md`; these fixtures are its machine-readable interpretation. If the two disagree, the specification wins and these fixtures get fixed.

## Model

Same harness model as the sibling [`telemetry`](../telemetry/README.md) suite: each test delivers an ordered list of events, then the harness ends the current period of every period pixel exactly once. `expectPixels` is the complete set of pixels enqueued during the test, compared as an unordered set of `{ pixel, params }`; a pixel absent from it must not fire.

- Events carry `type`, and `tabId`/`url` for web events; `appLaunch` events carry neither (native). A `navigation` event signals the tab moving to a URL, which is what clears de-duplication state when the URL differs from the tab's previous one.
- Every expected pixel in a test is distinct (payloads vary per occurrence) so set comparison observes each delivery individually.

## Observers

De-duplication is asserted through its observable effect on handlers, never through internal state:

- **`dedupProbe_immediate`** fires once per **delivered** `probeDetected` event, forwarding the payload's `reason` — the direct delivery observer.
- **`dedupProbe_day`** counts the same stream with single-value buckets (`1`, `2`, `3+`; no zero bucket, so it is silent when nothing was counted) — proving the counter observes exactly the deliveries the immediate pixel does: one decision at the hub, not per-handler bookkeeping.
- **`dedupOther_immediate`** observes a second web event type (`otherDetected`) for type independence.
- **`dedupAppLaunch_immediate`** observes native `appLaunch` events, which are never de-duplicated.

The experiment-metrics handler's evidence that it consumes the same de-duplicated stream lives in the [`metrics`](../metrics/README.md) suite (its `dedup` set), which shares this suite's semantics by construction.

## Notable expectations

- **The key is `(event type, tab)`, checked against the tab's current page.** The first occurrence is delivered to every handler; later same-type occurrences on the same page reach none.
- **The payload is not part of the key.** Two same-type events with different payloads on one page are one delivery; the second payload is dropped with its event. Per-occurrence payload signal belongs in the detector.
- **Navigation to a different URL resets; a same-URL reload does not.** Returning to a previously seen URL counts again — state is per current page, not per URL ever seen. Tabs are independent; event types are independent.
- **Native events (no tab context) are never de-duplicated.** Every occurrence is delivered.

## Deliberately out of scope

- **Where the de-duplication state lives and how it is stored** — internal mechanics; only delivery is observable.
- **Persistence** — de-duplication state is in-memory by design; process-restart behaviour is a platform concern.
- **Per-source configuration and cooldowns** — future directions of the hub's delivery layer, not current behaviour.
