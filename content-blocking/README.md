# Content Blocking Tests

Privacy Feature: <https://app.asana.com/0/1198207348643509/1199103718890844>

## Goals

This set of tests verifies how the `contentBlocking` privacy feature interacts
with the tracker blocklist (TDS), tracker allowlist, request blocklist, content
blocking exceptions, the global `unprotectedTemporary` exception list, and the
user allowlist (per-site protection toggle).

In particular it focuses on verifying that:

- Trackers on the blocklist are blocked when `contentBlocking` is enabled.
- Trackers are not blocked when `contentBlocking` is globally disabled.
- Trackers are not blocked on sites listed in `contentBlocking.exceptions`.
- Trackers are not blocked on sites listed in `unprotectedTemporary`.
- Trackers are not blocked on user-allowlisted sites.
- The tracker allowlist correctly exempts specific resources on specific sites
  while continuing to block other requests to the same tracker.
- First-party requests are not blocked by tracker blocking.
- CNAME-aliased trackers are blocked.
- Trackers with `default: "ignore"` are only blocked when an explicit rule
  matches.
- The `requestBlocklist` feature is gated by `contentBlocking`: matches block
  when `contentBlocking` is active for the site, but do not block when
  `contentBlocking` is globally disabled, when the site is in
  `contentBlocking.exceptions`, when the site is in `unprotectedTemporary`, or
  when the site is user-allowlisted.

## Files

```
.
├── config-reference.json           # Reference config with contentBlocking enabled.
├── config-disabled-reference.json  # Reference config with contentBlocking disabled.
├── tds-reference.json              # Reference Tracker Blocklist (TDS).
├── tests.json                      # The test cases.
└── user-allowlist-reference.json   # Reference list of user-allowlisted domains.
```

## Structure

There are multiple sets of tests in `tests.json`. Each set declares which
configuration file should be loaded via the `referenceConfig` field. All sets
share the same `tds-reference.json` and `user-allowlist-reference.json`.

Test suite specific fields:

- `siteURL` - URL - page where the request in question is made.
- `requestURL` - URL - the request being evaluated.
- `requestType` - string - the resource type, one of the values from
  <https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/ResourceType>.
- `expectAction` - one of:
  - `null` - request is not on any blocklist (allowed by default).
  - `"ignore"` - request matches the blocklist but is exempt (e.g. content
    blocking disabled, site in exceptions, tracker allowlisted).
  - `"block"` - request is blocked.

## Pseudo-code implementation

```
for $testSet in tests.json
    loadRemoteConfig($testSet.referenceConfig)
    loadTrackerBlocklist('tds-reference.json')
    loadUserAllowlist('user-allowlist-reference.json')

    for $test in $testSet.tests
        if $test.exceptPlatforms includes 'current-platform'
            skip

        $action = evaluateRequest(
            site=$test.siteURL,
            request=$test.requestURL,
            type=$test.requestType,
        )

        expect($action === $test.expectAction)
```
