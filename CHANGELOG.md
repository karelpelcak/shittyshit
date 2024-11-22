# Changelog
All notable changes to this component will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [21.6.1] - 2024-06-20
### Fixed
- redirects in useCreateTickets

## [21.6.0] - 2024-06-19
### Changed
- redirect to checkout after credit charge at createTickets fails
### Added
- manualPaymentMethodCode arg for getPaymentForm

## [21.5.0] - 2024-04-12
### Changed
- timeout for all requests is now 30s
### Added
- network failed error type

## [21.4.0] - 2024-04-11
### Added
- Added a tariff CHILD_UNDER_12

## [21.3.0] - 2024-03-13
### Added
- option to ignore global status for useSeats

## [21.2.0] - 2024-02-13
### Added
- added Lipník nad Bečvou to R8 regional stations

## [21.1.1] - 2024-02-13
### Fixed
- fixed refundToOriginalSource for RJ_SEAT ticket cancelation

## [21.1.0] - 2024-02-06
### Added
- loading only for payment methods

## [21.0.0] - 2024-01-20
### Changed
- payments methods not being mapped redundantly

## [20.10.0] - 2024-01-20
### Added
- added refetch before cancelling seat ticket

## [20.9.1] - 2023-11-29
### Changed
- action timeout overridable by default api timeout

## [20.9.0] - 2023-11-28
### Changed
- error message for useUserTickets on timeout

## [20.8.1] - 2023-11-16
### Changed
- timeout for login/logout requests

## [20.8.0] - 2023-11-16
### Changed
- timeout for action post requests

## [20.7.0] - 2023-11-10
### Added
- option to override useConnection fetch direction headers

## [20.6.0] - 2023-11-03
### Changed
- useConnection has vehicleStandards array instead of one key

## [20.5.2] - 2023-09-29
### Changed
- added boolean return to logout function to reflect success value

## [20.5.1] - 2023-09-08
### Changed
- timetable response (carrierId)
- ticket conditions type (refundToOriginalSourcePossible added)

## [20.5.0] - 2023-09-07
### Changed
- changed timetable/time-codes and symbols endpoint

## [20.4.0] - 2023-08-24
### Added
- added BIRTHDAY / day of birth to passenger fields 

## [20.3.0] - 2023-08-22
### Added
- added services type into Section

## [20.2.0] - 2023-08-16
### Added
- differentiated timeout and general fail message

## [20.1.5] - 2023-08-10
### Fixed
- own coupe passenger form person count

## [20.1.4] - 2023-08-08
### Changed
- included EU in PercentualDiscount fromCountry/toCountry
## [20.1.3] - 2023-08-07
### Changed
- improved/optimized useTickets

## [20.1.2] - 2023-08-07
### Fixed
- fetch more tickets api version

## [20.1.1] - 2023-08-03
### Changed
- tickets api version for decks variant
- QA BE url

## [20.1.0] - 2023-08-01
### Added
- United buses key
### Changed
- dev BE url

## [20.0.3] - 2023-07-26
### Fixed 
- fixed useUserTicket state changes

## [20.0.2] - 2023-07-25
### Fixed 
- changed tickets api version for decks variant

## [20.0.1] - 2023-07-21
### Fixed
- seats in decks type

## [20.0.0] - 2023-07-14
### Added
- vehicle decks support

## [19.11.1] - 2023-06-29
### Fixed
- altering freezed object

## [19.11.0] - 2023-06-28
### Changed
- improved country stations searching

## [19.10.3] - 2023-06-28
### Fixed
- useUserTickets offset handling
### Added
- loadingMore boolean to userTickets hook

## [19.10.2] - 2023-06-27
### Fixed
- useUserTickets offset handling

## [19.10.1] - 2023-06-27
### Fixed
- useUserTickets offset handling

## [19.10.0] - 2023-06-20
### Added
- full station/city name search (city together with country or together with station)

## [19.9.0] - 2023-06-15
### Changed
- added new vehicleStandardKey GEPARD_EXPRESS

## [19.8.1] - 2023-05-31
### Fixed
- useConnection hook returning wrong messages and routes

## [19.8.0] - 2023-05-31
### Changed
- useConnection hook now can fetch additional station

## [19.7.0] - 2023-05-24
### Changed
- partialCancel function changed and return boolean, cancel function now return boolean.

## [19.6.2] - 2023-05-12
### Changed
- upsell only classes that are less than 1.5x more expensive

## [19.6.1] - 2023-04-25
### Fixed
- departure type (added vehicle standard)

## [19.6.0] - 2023-04-18
### Changed
- useCredit addCredit fn now takes array of tickets

## [19.5.0] - 2023-04-17
### Added
- useUserTickets autofetch option

## [19.4.0] - 2023-04-06
### Changed
- useUserTickets can return undefined tickets

## [19.3.2] - 2023-04-05
### Fixed
- authorize function not clearing user if no data response

## [19.3.1] - 2023-03-28
### Fixed
- connection route response state, catching errors for sro

## [19.3.0] - 2023-03-27
### Added
- created upsell addons action
### Changed
- removed undefined selected addons in SelectClass and SelectSeats actions

## [19.2.0] - 2023-03-27
### Added
- search cities/stations by country
## [19.1.1] - 2023-02-27
### Fixed
- back direction fallback, in case "there" direction is scraped/canceled
### Changed
- optimized tickets filtering

## [19.1.0] - 2023-02-27
### Changed
- no passengers data fetching for FLEXI or TIME tickets
- no pricesource for FLEXI or TIME tickets

## [19.0.3] - 2023-02-27
### Fixed 
- default tickets options sorting

## [19.0.2] - 2023-02-27
### Added
- TicketAddonType

## [19.0.1] - 2023-02-27
### Changed
- default sorting direction for canceled tickets is descending
### Added
- sorting direction option to user tickets hook

## [19.0.0] - 2023-02-16
### Changed
- option to specify application origin for communication with server

## [18.3.5] - 2023-02-08
### Fixed
- useDepartures dont longer use ref hook

## [18.3.4] - 2023-02-01
### Fixed
- fetching sro tickets bad url

## [18.3.3] - 2023-01-30
### Fixed
- rjoClasses can now only return only one priceClass if other is empty

## [18.3.2] - 2023-01-23
### Fixed
- booking price accounts for addon count

## [18.3.1] - 2023-01-11
### Fixed
- persist config for booking and response state was split

## [18.3.0] - 2023-01-11
### Changed
- persist config for booking and response state was split

## [18.2.6] - 2023-01-09
### Changed
- useTickets hook returns undefined tickets until fetched

## [18.2.5] - 2022-12-29
### Fixed
- fixed departures language sync

## [18.2.4] - 2022-12-16
### Changed
- got rid of removeStationWhenOne as we do not use it anymore anywhere

## [18.2.3] - 2022-12-14
### Added
- option to not reset offset when fetching tickets

## [18.2.2] - 2022-12-14
### Added
- sa eslint config
- auto refetch locations and tariffs on error

## [18.2.1] - 2022-12-12
### Fixed
- sorting in useLocations the stations by significance

## [18.2.0] - 2022-12-09
### Added
- locations sorting by country options

## [18.1.0] - 2022-11-30
### Changed
- persist root state now can be partial (we do merging the data in the app itself)

## [18.0.10] - 2022-11-30
### Fixed
- searching for two name location not working

## [18.0.9] - 2022-11-28
### Fixed
- tickets count removal after logout

## [18.0.8] - 2022-11-25
### Fixed
- react-types fix

## [18.0.7] - 2022-11-24
### Fixed
- split count for tickets to totalCount and fetchedCount

## [18.0.6] - 2022-11-23
### Fixed
- tickets clearing after logging out
- updated station detail search

## [18.0.5] - 2022-11-22
### Fixed
- return data for useLocations was empty

## [18.0.4] - 2022-11-22
### Changed
- response from useSearch location
### Added
- count distance util function

## [18.0.3] - 2022-11-21
### Fixed
- added startsWith sorting for useSearchLocations

## [18.0.2] - 2022-11-21
### Fixed
- line type

## [18.0.1] - 2022-11-21
### Fixed
- useLocations error with cache object type

## [18.0.0] - 2022-11-16
### Changed
- useLocations breaking change
- at language is now de-AT
### Added
- useSearchLocations hook for fuzzy search

## [17.6.7] - 2022-11-14
### Changed
- types
- small optimizations
- node/npm requirement

## [17.6.6] - 2022-11-09
### Fixed
- tickets not loading because of bad authorization
### Changed
- refactored useUserTickets
### Added
- ticket count in useUserTickets

## [17.6.5] - 2022-11-07
### Changed
- persistConfig is optional (disabled for kiosks in iframe incognite mode)

## [17.6.4] - 2022-11-04
### Fixed
- fixed mobile auth

## [17.6.3] - 2022-11-04
### Fixed
- axios params serializing
- create tickets

## [17.6.2] - 2022-11-04
### Fixed
- seats fetch content type casing
- departures language refetch

## [17.6.1] - 2022-11-02
### Fixed
- illegal invocation of abort (cannot destructure abortcontroller)

## [17.6.0] - 2022-11-01
### Updated
- support for abort controller to cleanup unneeded requests
- persist context cache getter method
### Fixed
- locations language check request infinite loop
