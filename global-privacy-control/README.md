# Feature Name Tests

Privacy Feature: https://app.asana.com/0/1198207348643509/1199115248606508/f

## Goals

This set of tests verifies implementation of Global Privacy Control signal. In particular it focuses on verifying that:

- that the GPC header appears on all requests
- that `navigator.globalPrivacyControl` API is available in all frames and
- that excluded domains, as defined in the privacy remote configuration, are taken into account.

## Structure

Test suite specific fields:

- `siteURL` - string - currently loaded website's URL (as seen in the URL bar)
- `frameURL` - string - URL of an iframe in which the feature is operating (optional - if not set assume main frame context)
- `requestType` - mostly "image" or "main_frame" (navigational request), but can be any of https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/ResourceType - type of the resource being fetched
- `expectGPCAPI` - boolean - if we expect GPC API to be available in given conditions
- `expectGPCHeader` - boolean - if we expect GPC header to be included with given request
- `expectHeaderName` - string - expected name of the GPC header
- `expectHeaderValue` - string - expected value of the GPC header
- `expectJavaScriptToBeTrue` - string - JavaScript code that can be evaluated 

## Pseudo-code implementation

```
loadReferenceConfig('config_reference.json')

for $testSet in test.json

  for $test in $testSet
    if $test.exceptPlatforms includes 'current-platform'
        skip

    if $test has 'expectGPCHeader'
        $gpcHeader = getGPCHeader($test.siteURL, $test.frameURL, $test.requestType)
        $enabled = ($gpcHeader !== null)

        expect($enabled === $test.expectGPCHeader)

        if $test has 'expectHeaderName'
            expect($gpcHeader.name === $test.expectHeaderName)

        if $test has 'expectHeaderValue'
            expect($gpcHeader.value === $test.expectHeaderValue)

    else if $test has 'expectGPCAPI'
        $gpcAPIInjected = isGPCInjected($test.siteURL, $test.frameURL)

        expect($gpcAPIInjected === $test.expectGPCAPI)

        if $test has 'expectJavaScriptToBeTrue'
            expect(evalInFrame($test.expectJavaScriptToBeTrue) === true)

```