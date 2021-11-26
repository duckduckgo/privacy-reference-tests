# Referrer Trimming Tests

Privacy Feature: https://app.asana.com/0/1198207348643509/1199093921854084/f

## Goals

This set of tests verifies implementation of referrer trimming protection. In particular it focuses on verifying that:

- referrer is modified (trimmed) correctly in various scenarios,
- that both header (`Referer`) and the API (`document.referrer`) are modified and
- that excluded domains (via remote config or turning off protections by the user) are taken into account.

## Structure

Test suite specific fields:

- `featureName` - string - name of the privacy feature as defined in the config
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