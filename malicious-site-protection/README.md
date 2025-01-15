# Feature Name Tests

Privacy Feature: <https://app.asana.com/0/1208717418466383/1199621914667995/f>

## Goals

This set of tests verifies implementation of malicious site protection. In particular it focuses on verifying that:
- local entries stored in the `hashPrefix` and `filterSet` datasets result in blocked navigations
- entries in both the `phishing` and `malware` categories are independently blocked
- entries that should not be blocked are not: ensuring low chance of false positives
- unexpected situations are handled gracefully, i.e. invalid regular expressions, duplicate entries, overlapping data for different categories, etc. 

## Structure

Test suite specific fields:

- `featureName` - string - name of the privacy feature as defined in the config
- `siteURL` - string - the URL of the site we are testing protections for
- `expectedAction` - string - `"block"` or `"allow"`

## Pseudo-code implementation

### Block Test
```
for $testSet in test.json
  loadReferenceHashPrefixes('hashPrefixes_reference.json')
  loadReferenceFilterSet('filterSet_reference.json')

  for $test in $testSet
    if $test.exceptPlatforms includes 'current-platform'
        skip

    $action = loadSiteInWebView(
        url=$test.siteURL,
    )

    expect($action === $test.expectedAction)
```

## Platform exceptions

- Currently, malicious site protection is only available on the browser platforms:
  - macOS
  - iOS
  - Android
  - Windows
- The feature doesn't make sense to be enabled on extensions, as they will mostly run on browsers that already provide their own malicious site protections.