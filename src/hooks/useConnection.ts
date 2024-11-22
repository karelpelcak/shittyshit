import { useMemo, useRef, useState } from 'react';
import type { GenericAbortSignal } from 'axios';
import { useContextSelector } from 'use-context-selector';
import { StoreContext } from '../store/rootReducer';
import { api } from './consts';
import { DateString, StationCountry, Tariff, VehicleKey } from './types';
import { RouteOverview } from './useConnectionRoute';
import { ActionPrice } from './useCreateTickets';
import useLocations, { LocationType } from './useLocations';
import { useManualApi } from './useManualApi';

export const croatiaNotSroStations = [
  5577656005, 5577656007, 5577656006, 5362691025,
];

const additionalStationsMap = Object.freeze<Record<number, number>>({
  10202001: 3088864005,
});

const routesURL = '/routes/search/simple';
const versionHeaders = { Accept: 'application/1.2.0+json' };

const additionalStationsArrivalCountries: (StationCountry | undefined)[] = [
  'HR',
];

export interface ConnectionLocations {
  fromLocationId: number;
  fromLocationName?: string;
  fromLocationType: LocationType;
  toLocationId: number;
  toLocationName?: string;
  toLocationType: LocationType;
}

export interface ConnectionPayload extends ConnectionLocations {
  departureDate: DateString;
  returnDepartureDate?: DateString;
  tariffs: Tariff[];
}

export interface SroConnectionPayload {
  departureDate: DateString;
  fromLocationType: LocationType;
  fromLocation: number;
  numberOfPassengers: number;
  toLocationType: LocationType;
  toLocation: number;
}

type ConnectionState =
  | Omit<ConnectionPayload, 'fromLocationName' | 'toLocationName'>
  | undefined;

export interface ConnectionRoute extends RouteOverview {
  actionPrice?: ActionPrice;
  surcharge: boolean;
  pricesCount: number;
  nationalTrip: boolean;
  vehicleStandards: VehicleKey[];
}

export interface Connection {
  routes: ConnectionRoute[];
  routesMessage: string | null;
  textBubbles: { id: number; text: string }[];
}

const useConnection = () => {
  const isCreditPrice = useContextSelector(
    StoreContext,
    (c) => c.state.user.user?.creditPrice,
  );

  const connection = useRef<ConnectionState>();
  const headersRef = useRef<Record<string, string | undefined>>({});

  const [{ data, loading }, callConnectionSearch] = useManualApi<Connection>({
    url: routesURL,
    method: 'GET',
    headers: versionHeaders,
  });
  const [additionalData, setAdditionalData] = useState<Connection>();
  const { getCity, getStation } = useLocations();

  const [sroLoading, setSroLoading] = useState(false);

  const shouldFindSro = useMemo(
    () =>
      !!data?.routes.some(
        ({
          transfersCount,
          vehicleTypes,
          arrivalStationId,
          departureStationId,
        }) =>
          !transfersCount &&
          vehicleTypes.includes('TRAIN') &&
          !(
            croatiaNotSroStations.includes(arrivalStationId) ||
            croatiaNotSroStations.includes(departureStationId)
          ),
      ),
    [data],
  );

  const correctPriceData: Connection | undefined = data && {
    routesMessage:
      additionalData?.routesMessage &&
      data.routesMessage &&
      additionalData?.routesMessage !== data.routesMessage
        ? [data.routesMessage, additionalData?.routesMessage].join('\n')
        : data.routesMessage || additionalData?.routesMessage || null,
    textBubbles: additionalData?.textBubbles.length
      ? [...data.textBubbles, ...additionalData.textBubbles].filter(
        (bubble, index, self) =>
          index ===
            self.findIndex((t) => t.id === bubble.id && t.text === bubble.text),
      )
      : data.textBubbles,
    routes: (additionalData
      ? [...data.routes, ...additionalData.routes]
      : data.routes
    )
      .sort(
        (a, b) =>
          new Date(a.departureTime).valueOf() -
          new Date(b.departureTime).valueOf(),
      )
      .map((ar) => ({
        ...ar,
        priceFrom: isCreditPrice ? ar.creditPriceFrom : ar.priceFrom,
        priceTo: isCreditPrice ? ar.creditPriceTo : ar.priceTo,
      })),
  };

  const fetchConnectionData = async (
    params: ConnectionPayload,
    headers: Record<string, string | undefined>,
    move?: 'BACKWARD' | 'FORWARD',
    signal?: GenericAbortSignal,
  ) => {
    try {
      if (additionalData) {
        setAdditionalData(undefined);
      }

      const additionalStation =
        !!additionalStationsMap[params.fromLocationId] &&
        additionalStationsArrivalCountries.includes(
          params.toLocationType === 'CITY'
            ? getCity(params.toLocationId)?.code
            : getStation(params.toLocationId)?.countryCode,
        );

      const [{ headers: responseHeaders }, additionalRes] = await Promise.all([
        callConnectionSearch({
          headers: { ...headers, ...versionHeaders },
          params: {
            ...params,
            departureDate: params.departureDate.slice(0, 10),
            ...(move && { move }),
          },
          signal,
        }),
        additionalStation &&
          api.get<Connection>(routesURL, {
            headers,
            signal,
            params: {
              ...params,
              fromLocationId: additionalStationsMap[params.fromLocationId],
              fromLocationType: 'STATION',
              departureDate: params.departureDate.slice(0, 10),
              ...(move && { move }),
            },
          }),
      ]);

      if (additionalRes) {
        setAdditionalData(additionalRes.data);
      }

      headersRef.current = {
        'x-used-departurefromdatetime':
          responseHeaders['x-used-departurefromdatetime'],
        'x-used-departuretodatetime':
          responseHeaders['x-used-departuretodatetime'],
      };
      return true;
    } catch (e) {
      return false;
    }
  };

  const fetchConnection = async (
    {
      returnDepartureDate,
      fromLocationName,
      toLocationName,
      departureDate,
      ...params
    }: ConnectionPayload,
    signal?: GenericAbortSignal,
  ) => {
    try {
      connection.current = { ...params, departureDate };
      const apiParams = {
        ...params,
        departureDate,
        returnDepartureDate,
        fromLocationName,
        toLocationName,
      };
      return await fetchConnectionData(apiParams, {}, undefined, signal);
    } catch (e) {
      return false;
    }
  };

  const fetchForwardRoutes = async (
    headers?: Record<string, string | undefined>,
    signal?: GenericAbortSignal,
  ) => {
    try {
      return await fetchConnectionData(
        connection.current as ConnectionPayload,
        {
          ...headersRef.current,
          ...headers,
        },
        'FORWARD',
        signal,
      );
    } catch (e) {
      return false;
    }
  };

  const fetchBackwardRoutes = async (
    headers?: Record<string, string | undefined>,
    signal?: GenericAbortSignal,
  ) => {
    try {
      return await fetchConnectionData(
        connection.current as ConnectionPayload,
        {
          ...headersRef.current,
          ...headers,
        },
        'BACKWARD',
        signal,
      );
    } catch (e) {
      return false;
    }
  };

  const fetchSroRoutes = async (
    payload: SroConnectionPayload,
    signal?: GenericAbortSignal,
  ): Promise<ConnectionRoute[]> => {
    setSroLoading(true);
    const [firstRoute, secondRoute] = await Promise.all(
      [2, 1].map((seatClass) =>
        api.get<ConnectionRoute[]>('/routes/search/RJ_SRO', {
          params: { ...payload, seatClass },
          signal,
        }),
      ),
    );
    setSroLoading(false);

    return firstRoute.data.map((route, i) => {
      const currentRoute = secondRoute.data[i];
      if (!currentRoute) {
        return {
          ...route,
          /* YBUS returns prices only for 1 passenger in SRO - to unify it with seat tickets,
           * we need to multiply by no of passengers */
          creditPriceFrom: route.creditPriceFrom * payload.numberOfPassengers,
          creditPriceTo: route.creditPriceTo * payload.numberOfPassengers,
          priceFrom: route.priceFrom * payload.numberOfPassengers,
          priceTo: route.priceTo * payload.numberOfPassengers,
        };
      }
      return {
        ...route,
        /* Some props has to be calculated to be merged correctly */
        pricesCount: route.pricesCount + currentRoute.pricesCount,
        creditPriceFrom:
          Math.min(route.creditPriceFrom, currentRoute.creditPriceFrom) *
          payload.numberOfPassengers,
        creditPriceTo:
          Math.max(route.creditPriceTo, currentRoute.creditPriceTo) *
          payload.numberOfPassengers,
        priceFrom:
          Math.min(route.priceFrom, currentRoute.priceFrom) *
          payload.numberOfPassengers,
        priceTo:
          Math.max(route.priceTo, currentRoute.priceTo) *
          payload.numberOfPassengers,
        freeSeatsCount: route.freeSeatsCount + currentRoute.freeSeatsCount,
      };
    });
  };

  return {
    data: correctPriceData,
    fetchBackwardRoutes,
    fetchConnection,
    fetchForwardRoutes,
    fetchSroRoutes,
    loading: loading || sroLoading,
    shouldFindSro,
  };
};

export default useConnection;
