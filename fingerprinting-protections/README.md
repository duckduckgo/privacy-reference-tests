# Feature Name Tests

Privacy Feature: https://app.asana.com/0/1198207348643509/1199583771657237/f

## Goals

This set of tests verifies implementation of fingerprinting protections. In particular it focuses on verifying that:

- …

## Structure

Test suite specific fields:

- `property` - string - 
- `expectPropertyValue` - string - 

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