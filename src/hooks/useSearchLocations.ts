import { useMemo } from 'react';
import Fuse from 'fuse.js';
import deburr from 'lodash.deburr';
import { useContextSelector } from 'use-context-selector';
import { StoreContext } from '../store/rootReducer';
import { langPriorityCountries } from './consts';
import { Language } from './types';
import useLocations, { ConnectionSearchCity, LocationStation } from './useLocations';
import { getPriorityInArray } from './utils';

Fuse.config.threshold = 0.2;

type Result = {
  refIndex: number;
  score?: number;
};

const MIN_SEARCH_LENGTH = 3;
const MAX_SCORE_MATCH = 0.1;

const extractCountry = (text: string) => deburr(text.split(',')[1].trim());

const removeDashDeburr = (text: string) => {
  const [cityName, stationName] = deburr(text.split(',')[0]).split(' - ');
  if (!stationName) {
    return [cityName, ...cityName.split(/[ -]/g)];
  }
  return [cityName, ...cityName.split(/[ -]/g), stationName];
};

const startsWith = (searchString: string) => (name: string) =>
  removeDashDeburr(name.toLowerCase())
    .some(part => part.startsWith(searchString));

const nameOrAliasesStartWith =
  (location: ConnectionSearchCity | LocationStation, searchString: string) => {
    const { name, aliases } = location;
    const startsWithFn = startsWith(searchString);
    const stations: LocationStation[] | undefined = (location as ConnectionSearchCity).stations;
    return startsWithFn(name) ||
      stations?.some(s => startsWithFn(s.name)) ||
      aliases.some(a => deburr(a.toLowerCase()).startsWith(searchString));
  };

const sortStations = (locations: LocationStation[], searchString: string) =>
  (a: Result, b: Result) => {
    const locationA = locations[a.refIndex];
    const locationB = locations[b.refIndex];
    const startsWithDiff =
      +nameOrAliasesStartWith(locationB, searchString) -
      +nameOrAliasesStartWith(locationA, searchString);
    if (!!startsWithDiff) {
      return startsWithDiff;
    }
    // if the items do not match the search term enough, sort them by matching score
    if (a.score! > MAX_SCORE_MATCH || b.score! > MAX_SCORE_MATCH) {
      return a.score! - b.score!;
    }
    const significanceDiff = locationB.significance - locationA.significance;
    // if the significance is equal, sort by score
    if (!significanceDiff) {
      return a.score! - b.score!;
    }
    // else sort by significance (show Prague first over Olomouc, etc.)
    return significanceDiff;
  };

const sortCities = (searchString: string, language: Language) =>
  (a: ConnectionSearchCity & Result, b: ConnectionSearchCity & Result) => {
    const startsWithDiff =
      +nameOrAliasesStartWith(b, searchString) -
      +nameOrAliasesStartWith(a, searchString);
    if (!!startsWithDiff) {
      return startsWithDiff;
    }
    // if the items do not match the search term enough, sort them by matching score
    if (a.score! > MAX_SCORE_MATCH || b.score! > MAX_SCORE_MATCH) {
      return a.score! - b.score!;
    }
    const significanceDiff = b.significance! - a.significance!;
    // if the cities significance difference is too high (we want to prioritize Prague over Zilina,
    // even if we have SK language set)
    if (!!significanceDiff) {
      return significanceDiff;
    }
    const priorityCountries = langPriorityCountries[language];
    const priorityDiff = getPriorityInArray(priorityCountries, a.code) -
      getPriorityInArray(priorityCountries, b.code);
    // if the country has equal priority and city has equal significance, sort by score
    if (!priorityDiff && !significanceDiff) {
      return a.score! - b.score!;
    }
    // sort by country priority, based on device language set 
    // (e.g. show AT cities to AT users primarily)
    return priorityDiff;
  };

const useSearchLocations = (searchString: string) => {
  const language = useContextSelector(StoreContext, c => c.state.user.language);
  const shouldSearch = searchString.length >= MIN_SEARCH_LENGTH;
  const { data } = useLocations();

  const fuse = useMemo(
    () =>
      data ?
        new Fuse(
          data.map((c) => ({
            country: extractCountry(c.name),
            aliases: c.aliases.map(deburr),
            name: removeDashDeburr(c.name),
            fullName: deburr(c.name),
            stations: c.stations.map((s) => ({
              aliases: s.aliases.map(deburr),
              name: removeDashDeburr(s.name),
              fullName: deburr(s.name),
            })),
          })),
          {
            includeScore: true,
            keys: [
              { name: 'country', weight: 0.5 },
              { name: 'fullName', weight: 0.5 },
              { name: 'name', weight: 0.9 },
              { name: 'aliases', weight: 0.2 },
              { name: 'stations.name', weight: 0.8 },
              { name: 'stations.fullName', weight: 0.4 },
              { name: 'stations.aliases', weight: 0.2 },
            ],
          },
        ) : undefined,
    [data],
  );

  const filtered = useMemo<ConnectionSearchCity[]>(() => {
    if (!shouldSearch || !fuse || !data?.length) {
      return [];
    }
    const normalizedSearchString = deburr(searchString).trim().toLowerCase();
    return fuse
      .search(normalizedSearchString)
      .map((citySearch) => {
        const city = data![citySearch.refIndex];

        if (!city.stations.length) {
          return {
            ...city,
            refIndex: citySearch.refIndex,
            score: citySearch.score,
            significance: city.significance ?? 0,
          };
        }

        const stationsFuse = new Fuse(
          city.stations.map((s) => ({
            country: citySearch.item.country,
            aliases: s.aliases.map(deburr),
            name: removeDashDeburr(s.name),
            fullName: deburr(s.name),
          })),
          {
            includeScore: true,
            keys: ['name', 'aliases', 'fullName', 'country'],
          },
        );

        const stations = stationsFuse
          .search(normalizedSearchString)
          .sort(sortStations(city.stations, normalizedSearchString))
          .map((stationSearch) => city.stations[stationSearch.refIndex]);

        return {
          ...city,
          refIndex: citySearch.refIndex,
          score: citySearch.score,
          significance: Math.max(...stations.map(({ significance }) => significance)),
          stations,
        };
      })
      .sort(sortCities(normalizedSearchString, language))
      .slice(0, 6);
  }, [fuse, shouldSearch && searchString]);

  return {
    filtered,
    shouldSearch,
  };
};

export default useSearchLocations;