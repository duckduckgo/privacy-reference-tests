# Feature Name Tests

Privacy Feature: https://app.asana.com/0/1198207348643509/1200040513378697/f

## Goals

This set of tests verifies implementation of expiring first party cookies set by trackers. In particular it focuses on verifying that:

- cookie policy from the configuration file is correctly extracted and applied,
- only first party cookies set by trackers are affected,
- exceptions from the config are respected,
- reduced expiry time is correctly calculated and applied.

## Structure

Test suite specific fields:

- `siteURL` - string - currently loaded website's URL (as seen in the URL bar)
- `scriptURL` - string - URL of the script setting the cookie
- `cookieString` - string - cookie creation string, as assigned to `document.cookie`
- `expectCookieSet` - boolean - if cookie is expected to be created/stored
- `expectExpiryToBe` - number - expeced expiry date in seconds from when the cookie was set

## Pseudo-code implementation

```
for $testSet in test.json
  loadReferenceConfig('config_reference.json')

  for $test in $testSet
    if $test.exceptPlatforms includes 'current-platform'
        skip

    $enabled = isFeatureEnabled(
        feature=$test.featureName,
    )

    expect($enabled === $test.expectFeatureEnabled)
```

## Platform exceptions

- Explanations for any platform exceptions (`exceptPlatforms`)