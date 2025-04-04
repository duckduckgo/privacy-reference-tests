# Suggestions Tests

[Feature: Shared Address Bar Suggestions algorithm Tests for macOS and Windows](https://app.asana.com/0/1202406491309510/1209464112525114)

## Goals

This set of tests verifies implementation of address bar suggestions across platforms. In particular it focuses on verifying that:

- correct suggestions are shown based on user input
- suggestions are properly filtered and ordered

## Structure

Test suite specific fields:

- `description` - string - describes the test case scenario
- `input` - object containing:
  - `query` - string - user input in the address bar
  - `tabIdInitiatingSearch` - string (UUID) - ID of tab where search is initiated
  - `bookmarks` - array of bookmark objects with title, url, and isFavorite properties
  - `history` - array of history entry objects
  - `pinnedTabs` - array of pinned tab objects with tabId, title and uri
  - `windows` - array of window objects containing:
    - `type` - string - window type ("fullyFeatured", "fireWindow", "popup")
    - `tabs` - array of tab objects with tabId, title and uri
  - `apiSuggestions` - array of API suggestion results or error object
- `expectation` - object containing:
  - `topHits` - array of expected top hit suggestions (best matches across all sources)
  - `searchSuggestions` - array of expected DuckDuckGo API suggestions
  - `localSuggestions` - array of expected local suggestions (bookmarks, history, tabs, settings pages)

## Pseudo-code implementation

for $testSet in tests.json
  initializeTestEnvironment(
    bookmarks = $testSet.input.bookmarks,
    history = $testSet.input.history,
    pinnedTabs = $testSet.input.pinnedTabs,
    windows = $testSet.input.windows
  )

  mockAPIResponse($testSet.input.apiSuggestions)

  $suggestions = getSuggestions(query = $testSet.input.query)

  expect($suggestions.topHits).toEqual($testSet.expectation.topHits)
  expect($suggestions.searchSuggestions).toEqual($testSet.expectation.searchSuggestions)
  expect($suggestions.localSuggestions).toEqual($testSet.expectation.localSuggestions)
