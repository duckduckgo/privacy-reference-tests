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

- `featureName` - string - name of the privacy feature as defined in the config
- …
- `expectFeatureEnabled` - bool - if feature is expected to be disabled or not

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