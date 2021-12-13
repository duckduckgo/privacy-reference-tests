# Broken Site Reporting Tests

Privacy Feature: https://app.asana.com/0/1198207348643509/1200191185434196/f

## Goals

This set of tests verifies implementation of broken site reporting. In particular it focuses on verifying that the report generated is sent to a correct url and includes all data needed (which differs between platforms).

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