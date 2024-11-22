import { useCallback, useEffect, useMemo } from 'react';
import type { GenericAbortSignal } from 'axios';
import { useContextSelector } from 'use-context-selector';
import { ResponseStateCategory } from '../store/responseState/types';
import { StoreContext } from '../store/rootReducer';
import { getErrorMessage } from './consts';
import {
  DateString,
  FlexiType,
  RouteId,
  SeatClass,
  Tariff,
  TicketType,
  VehicleKey,
  VehicleType,
} from './types';
import { Descriptions } from './useAddons';
import { ActionPrice } from './useCreateTickets';
import { useManualApi } from './useManualApi';
import useSetResponseState from './useSetResponseState';

export type Service =
  | 'typy_vozidel_astra'
  | 'typy_vozidel_automaty'
  | 'typy_vozidel_bezp_sluzba'
  | 'typy_vozidel_bez_dotykove_obrazovky'
  | 'typy_vozidel_chlazene_napoje'
  | 'typy_vozidel_denni_tisk'
  | 'typy_vozidel_detske_kupe'
  | 'typy_vozidel_dotykova_obrazovka'
  | 'typy_vozidel_dzus'
  | 'typy_vozidel_imobilni'
  | 'typy_vozidel_imobilni_rampa'
  | 'typy_vozidel_klidova_zona'
  | 'typy_vozidel_klimatizace'
  | 'typy_vozidel_kocarky'
  | 'typy_vozidel_kresilko'
  | 'typy_vozidel_low_cost'
  | 'typy_vozidel_obcerstveni'
  | 'typy_vozidel_online_catering'
  | 'typy_vozidel_prednostni_servis'
  | 'typy_vozidel_preprava_kola'
  | 'typy_vozidel_restauracni_vuz'
  | 'typy_vozidel_sekt'
  | 'typy_vozidel_sluchatka'
  | 'typy_vozidel_snidane'
  | 'typy_vozidel_spaci_vuz'
  | 'typy_vozidel_spaci_vuz_zeny'
  | 'typy_vozidel_stevardka'
  | 'typy_vozidel_teple_napoje_zdarma'
  | 'typy_vozidel_tiche_kupe'
  | 'typy_vozidel_wifi_ano'
  | 'typy_vozidel_wifi_ne'
  | 'typy_vozidel_zabavni_portal_ano'
  | 'typy_vozidel_zasuvka'
  | 'typy_vozidel_zastuvka_ne'; // Yeah, there's typo

export interface Line {
  id: number;
  code: string | null;
  from: string;
  to: string;
  lineGroupCode: string;
  lineNumber: number;
}

export interface TransferTime {
  days: number;
  hours: number;
  minutes: number;
}

export interface Transfer {
  fromStationId: number;
  toStationId: number;
  calculatedTransferTime: TransferTime;
  determinedTransferTime: TransferTime | null;
  description: string | null;
}

export interface TariffNotifications {
  title: string;
  description: string;
  content: string[];
}

export interface PriceClass {
  actionPrice: null | ActionPrice;
  bookable: boolean;
  conditions: { descriptions: Descriptions };
  creditPrice: number;
  customerNotifications: string[];
  flexiType?: FlexiType;
  freeSeatsCount: number;
  lineGroupCode?: string;
  lineNumber?: number;
  price: number;
  priceSource: string;
  seatClassKey: SeatClass;
  services: Service[];
  tariffNotifications: TariffNotifications;
  tariffs: Tariff[];
  type: TicketType;
}

export interface TransfersInfo {
  info: string;
  transfers: Transfer[];
}

export interface RouteSectionCommons {
  arrivalCityName: string;
  arrivalStationId: number;
  arrivalCityId: number;
  arrivalStationName: string;
  arrivalTime: DateString;
  delay: string | null;
  departureCityName: string;
  departureStationId: number;
  departureCityId: number;
  departureStationName: string;
  departureTime: DateString;
  estimatedArrivalTime: DateString;
  freeSeatsCount: number;
  support: boolean;
  travelTime: string;
}

export interface Section extends RouteSectionCommons {
  departurePlatform: string | null;
  id: number;
  line: Line;
  notices: string[] | null;
  vehicleType: VehicleType;
  services: Service[];
  vehicleStandardKey: VehicleKey;
}

export interface RouteOverview extends RouteSectionCommons {
  bookable: boolean;
  creditPriceFrom: number;
  creditPriceTo: number;
  id: RouteId;
  mainSectionId: number;
  notices: boolean;
  priceFrom: number;
  priceTo: number;
  transfersCount: number;
  vehicleTypes: VehicleType[];
}

export interface Surcharge {
  price: number;
  notification: string;
}

export interface RouteDetail extends RouteOverview {
  nationalTrip: boolean;
  priceClasses: PriceClass[];
  sections: Section[];
  transfersInfo: TransfersInfo | null;
  surcharge: null | Surcharge;
  vehicleStandardKey: VehicleKey;
}

export interface FlexiResponse {
  flexiType?: FlexiType;
  lineGroupCode: string;
  lineNumber: number;
  price: number;
  seatClassKey: SeatClass;
}

export interface RoutePayload {
  routeId: string | number;
  fromStationId: number;
  toStationId: number;
  tariffs: Tariff[];
}

export interface SroPriceClass {
  conditions: SroConditions;
  freeSeatsCount: number;
  numberOfPassengers: number;
  price: number;
  priceSource: string;
  seatClassKey: SeatClass;
}

export interface SroPriceClassSelectable extends SroPriceClass {
  tariffs: Tariff[];
  type: TicketType;
}

export interface SroConditions {
  cancelCharge: number;
  code: string;
  refundToOriginalSourcePossible: boolean;
}

export interface SroRouteResponse {
  priceClasses: SroPriceClass[];
  routeId: string;
}

const emptyArr: any[] = [];

const departureDate = '2022-01-01';

const useConnectionRoute = (ignoreErrors = false) => {
  const setState = useSetResponseState(ResponseStateCategory.connectionRoute);
  const isCreditPrice = useContextSelector(
    StoreContext,
    (c) => c.state.user.user?.creditPrice,
  );
  const [{ data, error, loading }, fetchRjSeat] = useManualApi<RouteDetail>({});

  const [{ loading: sroLoading1, error: sroError1, data: sroData1 }, callSro1] =
    useManualApi<SroRouteResponse>({});

  const [{ loading: sroLoading2, error: sroError2, data: sroData2 }, callSro2] =
    useManualApi<SroRouteResponse>({});
  const rjSroLoading = sroLoading1 || sroLoading2;
  const rjSroError = sroError1 || sroError2;

  const dataWithPrice: RouteDetail | undefined = useMemo(
    () =>
      data && {
        ...data,
        priceFrom: isCreditPrice ? data.creditPriceFrom : data.priceFrom,
        priceClasses: data.priceClasses.map((pc) => ({
          ...pc,
          price: isCreditPrice ? pc.creditPrice : pc.price,
          type: 'RJ_SEAT' as TicketType,
        })),
      },
    [data, isCreditPrice],
  );

  const fetchRoute = useCallback(
    async (params: RoutePayload, signal?: GenericAbortSignal) => {
      try {
        // causes some weird bug in the app with memoizing even when not using any memoizing ...
        // if (
        //   params.fromStationId === data?.departureStationId
        //   && params.toStationId === data.arrivalStationId
        //   && params.routeId === data.id
        //   && unorderedArrayEqual(params.tariffs, data.priceClasses[0]?.tariffs)
        // ) return data;
        const response = await fetchRjSeat({
          url: `/routes/${params.routeId}/simple`,
          params,
          signal,
        });

        return response.data;
      } catch {
        return undefined;
      }
    },
    [fetchRjSeat],
  );

  const fetchSroRoutes = useCallback(
    async (
      { routeId, ...payload }: RoutePayload,
      signal?: GenericAbortSignal,
    ) => {
      // if (
      //   sroData1?.routeId === routeId &&
      //   sroData2?.routeId === routeId
      // ) return [sroData2, sroData1].flatMap((sro) => sro.priceClasses);
      const params = {
        ...payload,
        numberOfPassengers: payload.tariffs.length,
      };
      const url = `/routes/${routeId}/RJ_SRO`;
      try {
        const sroPriceClasses = await Promise.all([
          callSro2({
            params: {
              ...params,
              departureDate,
              seatClass: 2,
            },
            signal,
            url,
          }),
          callSro1({
            params: {
              ...params,
              departureDate,
              seatClass: 1,
            },
            signal,
            url,
          }),
        ]);
        return sroPriceClasses.flatMap((sro) => sro.data.priceClasses);
      } catch {
        return undefined;
      }
    },
    [callSro1, callSro2],
  );

  const routeLoading = loading || rjSroLoading;
  const routeError = error || rjSroError;

  useEffect(() => {
    if (!ignoreErrors) {
      setState(
        routeError?.response?.data?.message || getErrorMessage(routeError),
        routeLoading,
        routeError?.response?.data?.errorFields,
      );
    }
  }, [routeLoading, routeError]);

  const rjSroClasses = useMemo(
    () =>
      sroData1?.priceClasses.length || sroData2?.priceClasses.length
        ? [
          ...(sroData1?.priceClasses ?? []),
          ...(sroData2?.priceClasses ?? []),
        ].map<SroPriceClassSelectable>((sroCl) => ({
          ...sroCl,
          tariffs: new Array<Tariff>(sroCl.numberOfPassengers).fill(
            Tariff.Regular,
          ),
          price: sroCl.price * sroCl.numberOfPassengers,
          type: 'RJ_SRO',
        }))
        : (emptyArr as SroPriceClassSelectable[]),
    [sroData1, sroData2],
  );

  return {
    data: dataWithPrice,
    fetchRoute,
    fetchSroRoutes,
    rjSroClasses,
    routeError,
    routeLoading,
  };
};

export default useConnectionRoute;
