# Third Party Cookies Bocking Tests

Privacy Feature: https://app.asana.com/0/1198207348643509/1199093921854081/f

## Goals

This set of tests verifies implementation of third party tracker cookie blocking. In particular it focuses on verifying that:

- `cookie` and `set-cookie` headers are being removed from requests to known trackers
- multiple `cookie` headers are handled
- remote config exceptions are taken into account
- `document.cookie` disallows setting / reading cookies in tracking contexts

## Structure

Files in the folder:
- `config_reference.json` - reference remote configuration file
- `tracker_radar_reference.json` - reference blocklist file

Test suite specific fields:

- `siteURL` - string - name of the privacy feature as defined in the config
- `requestURL` - string - 
- `requestHeaders` - string - 
- `expectCookieHeadersRemoved` - boolean - 
- `responseHeaders` - Array of `{name: string, value:string}` objects - 
- `expectSetCookieHeadersRemoved` - boolean - 
- `setDocumentCookie` - string - 
- `expectDocumentCookieSet` - boolean - 


## Pseudo-code implementation

```
for $testSet in test.json
  loadReferenceConfig('config_reference.json')
  loadReferenceBlocklist('tracker_radar_reference.json')

  for $test in $testSet
    if $test.exceptPlatforms includes 'current-platform'
        skip

    $enabled = isFeatureEnabled(
        feature=$test.featureName,
    )

    expect($enabled === $test.expectFeatureEnabled)
```