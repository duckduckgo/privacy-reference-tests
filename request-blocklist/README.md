# Request Blocklist tests

## Intro

These are test cases for the Request Blocklist feature, that lets us block
requests where necessary, e.g. to fix website breakage. There are also test
cases included for how the Request Blocking feature interacts with other
features such as the Tracker Allowlist and the Tracker Blocklist.


## Files

```
.
├── config-reference.json          # Reference configuration.
├── surrogates-reference.txt       # Reference surrogates.txt
├── tds-reference.json             # Reference Tracker Blocklist.
├── tests.json                     # The test cases.
└── user-allowlist-reference.json  # Reference list of user-allowlisted domains.
```


## Test structure

```js
{
    // Test name
    "name": "matching rule, <all> domains",

    // Details of the test request
    "requestUrl": "https://request-blocklist.example/block",
    "requestType": "image",
    "websiteUrl": "https://website.example",

    // Expected action (either "block" or "allow")
    "expectAction": "block"

    // Platform exceptions for the test
    "exceptPlatforms": []
}
```
