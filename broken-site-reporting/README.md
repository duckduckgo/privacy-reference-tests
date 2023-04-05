# Broken Site Reporting Tests

Privacy Feature: https://app.asana.com/0/1198207348643509/1200191185434196/f

## Goals

This set of tests verifies implementation of broken site reporting. In particular it focuses on verifying that the report generated is sent to a correct url and includes all data needed (which differs between platforms).

## Structure

Test suite specific fields:

- `siteURL` - string - currently loaded website's URL (as seen in the URL bar)
- `wasUpgraded` - bool - if request was upgraded to HTTPS by us or not
- `category` - string - user picked breakage category e.g. 'content', 'images', 'paywall', 'login'
- `blockedTrackers` - array of strings - array of hostnames of trackers that were blocked
- `noActionRequests` - array of strings - array of hostnames of requests that were not on the blocklist
- `adAttributionRequests` - array of strings - array of hostnames of requests that were ignored due to ad-attribution
- `ignoredByUserRequests` - array of strings - array of hostnames of requests that were allowed due to protections disabled by the user
- `ignoreRequests` - array of strings - array of hostnames of requests that were ignored for other reasons (e.g., blocklist ignore)
- `surrogates` - array of strings - array of hostnames of trackers that were replaced with a surrogate
- `atb` - string - ATB cohort
- `blocklistVersion` - string - version of the blocklist
- `manufacturer` - string - name of the device manufacturer (native apps only)
- `model` - string - name of the device model (native apps only)
- `os` - string - operating system name (native apps only)
- `gpcEnabled` - boolean - if GPC is enabled or not (native apps only) - GPC can be disabled by user or by remote config
- `expectReportURLPrefix` - string - resulting report URL should be prefixed with this string
- `expectReportURLParams` - Array of `{name: '', value: ''}` objects - resulting report URL should have the following set of URL parameters with matching values
- `remoteConfigEtag` - string - string representation of remote configuration etag
- `remoteConfigVersion` - string - string representation of remote configuration version (note, this is the numeric version found in the remote config (e.g, `1680178584671`, not `v1` or `v2`))
- `providedDescription` - string - user-provided breakage description

## Pseudo-code implementation

```
for $testSet in test.json

  for $test in $testSet
    if $test.exceptPlatforms includes 'current-platform'
        skip

    $url = getReportURL(
        siteURL=$test.siteURL,
        wasUpgraded=$test.wasUpgraded,
        reportCategory=$test.category,
        blockedTrackers=$test.blockedTrackers,
        surrogates=$test.surrogates,
        atb=$test.atb,
        blocklistVersion=$test.blocklistVersion,
        manufacturer=$test.manufacturer,
        model=$test.model,
        os=$test.os,
        gpcEnabled=$test.gpcEnabled
    )

    if $test.expectReportURLPrefix
        expect($url.startsWith($test.expectReportURLPrefix))

    if $test.expectReportURLParams
        for $param in $test.expectReportURLParams
            expect($url.matchesRegex(/[?&] + $param.name + '=' + $param.value + [&$]/))
```

## Platform exceptions

Please see https://app.asana.com/0/1198207348643509/1200191185434196/f for
current platform support and further links. A summary of exceptions affecting
the reference tests is provided below:

- description tests:
  - the following platforms do not currently allow users to provide a description:
    - `android-browser`, see https://app.asana.com/0/1163321984198618/1203936449485101/f
    - `ios-browser`, see https://app.asana.com/0/1163321984198618/1203944813756141
    - `safari-extension`, see https://app.asana.com/0/1201602070177732/1204307004967346
- truncation tests:
  - the following platforms do not currently implement the optional `noActionRequests`, `adAttributionRequests`, `ignoredByUserRequests`, or `ignoreRequests` truncatable parameters: `android-browser`, `ios-browser`, `macos-browser`, `safari-extension`, `windows-browser`
  - see https://app.asana.com/0/0/1204271046995906/f for more information about truncation and implementation requirements
