# HTTPS Upgreades

Privacy Feature: https://app.asana.com/0/1198207348643509/1199103718890894/f

## Goals

This set of tests verifies implementation of HTTPS upgrading (Smarter Encryption). In particular it focuses on verifying that:

- domains from the main bloom filter are upgraded,
- domains from the main allowlist are not upgraded,
- domains from the negative bloom filter are not upgraded,
- domains from the nagetive allowlist are upgraded,
- domains allowlisted in the remote config are not upgraded,
- local urls (localhost and friends) are not upgraded.

## Structure

Test suite specific fields:

- `requestURL` - string - 
- `expectURL` - string - 

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