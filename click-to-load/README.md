# Feature Name Tests

Privacy Feature: https://app.asana.com/0/1198207348643509/1199651947726592/f

## Goals

This set of tests verifies implementation of click to load protection. In particular it focuses on verifying that:

- click to load configuration is correctly parsed,
- requests gated by click to load are blocked or surrogated by default,
- and unblocked when user unblocks the widget.

## Structure

Test specific file:

- `click_to_load_config_reference.json` - click to load configuration file

Test suite specific fields:

- `siteURL` - string - currently loaded website's URL (as seen in the URL bar)
- `requestURL` - string - URL to a request being made
- `userUnblocked` - bool - if user has engaged with click to load widget and unblocked it
- `expectAction` - "block", "redirect" or "ignore" - how request is expected to be handled ('redirect' means that surrogate was loaded instead of the original request)

## Pseudo-code implementation

```
for $testSet in test.json
  loadReferenceConfig('config_reference.json')
  loadClickToLoadConfig('click_to_load_config_reference.json')

  for $test in $testSet
    if $test.exceptPlatforms includes 'current-platform'
        skip

    if ($test.userUnblocked) {
        unblockClickToLoad(
            site=$test.siteURL
            tracker=$test.requestURL
        )
    }

    $action = handleRequest(
        site=$test.siteURL
        request=$test.requestURL
    )

    expect($action).toBe($test.expectAction)
```
