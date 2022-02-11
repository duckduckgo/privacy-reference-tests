# Fingerprinting Protection Tests

Privacy Feature: https://app.asana.com/0/1198207348643509/1199583771657237/f

## Goals

This set of tests verifies implementation of fingerprinting protections. In particular it focuses on verifying that:

- exceptions from configuration file are respected,
- values of properites are modified correctly.

## Structure

Test suite specific files:

- `init.js` - set of API mocks that should be loaded into the page before protections are initialized. This allows us to normalize default/unprotected values.

Test suite specific fields:

- `siteURL` - string - currently loaded website's URL (as seen in the URL bar) 
- `property` - string - JavaScript code extracting value of given property/API. Note that in some cases this code is async, please wait for returned promise to resolve.
- `expectPropertyValue` - string - expected value of the property

## Pseudo-code implementation

```
for $testSet in test.json
  loadReferenceConfig('config_reference.json')

    for $test in $testSet
        if $test.exceptPlatforms includes 'current-platform'
            skip

        $page = createPage(
            siteURL = $test.siteURL,
        )

        $page.load('init.js')

        $value = $page.eval($test.property)

        expect($value.toSting()).toBe($test.expectPropertyValue)
```

## Platform exceptions

- "ports are ignored when matching rules" disabled for web extensions ([bug report](https://app.asana.com/0/892838074342800/1201806214352982/f))