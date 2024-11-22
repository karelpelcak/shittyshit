import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios, { isAxiosError } from 'axios';
import type { GenericAbortSignal } from 'axios';
import { useContextSelector } from 'use-context-selector';
import { useImmer } from 'use-immer';
import { ResponseStateContext } from '../store/responseState/reducer';
import { ResponseStateCategory } from '../store/responseState/types';
import { StoreContext } from '../store/rootReducer';
import { FAIL_MESSAGE, api, getErrorMessage } from './consts';
import {
  Currency,
  DateString,
  FlexiType,
  RouteId,
  SeatClass,
  Tariff,
  TicketState,
  TicketType,
} from './types';
import { TicketAddon } from './useAddons';
import { Section, TransfersInfo } from './useConnectionRoute';
import { Passenger } from './useCreateTickets';
import { SectionCommons } from './useSeats';
import useSetResponseState from './useSetResponseState';
import { PercentualDiscount } from './useUser';

export interface Bill {
  amount: number;
  currency: Currency;
  label: string;
}

export interface CustomerActions {
  additionalServices: boolean;
  cancel: boolean;
  editPassengers: boolean;
  evaluate: boolean;
  pay: boolean;
  payRemaining: boolean;
  printInvoice: boolean;
  printTicket: boolean;
  rebook: boolean;
  requiredToFillInQuestionnaire: boolean;
  sentToMail: boolean;
  showDetail: boolean;
  storno: boolean;
}

export interface TicketDescriptions {
  cancel: string;
  expiration: string;
  rebook: string;
}

export interface Conditions {
  cancel?: DateString;
  expireAt?: DateString;
  coolingOff?: DateString;
  departureCancel?: DateString;
  expiration?: DateString;
  cancellationFee?: number;
  refundToOriginalSourcePossible?: boolean;
}

export interface CodeDiscount {
  code: string;
  discount: number;
  id: number;
}

export interface TicketSection extends SectionCommons {
  section: Section;
}

export interface TimeTicket {
  accountCode: string;
  bills: Bill[];
  conditions: Conditions;
  customerActions: CustomerActions;
  customerNotifications: string[] | null;
  id: number;
  name: string;
  price: number;
  seatClass: SeatClass;
  state: TicketState;
  station1Id: number;
  station2Id: number;
  surname: string;
  tariff: { value: Tariff | null };
  ticketCode: string;
  type: FlexiType;
  unpaid: number;
  validFrom: DateString;
  validTo: DateString;
}

export interface SeatSroTicketCommons {
  bills: Bill[];
  currency: Currency;
  customerActions: CustomerActions;
  delay: string | null;
  estimatedArrivalTime: DateString;
  passengersInfo: { passengers: Passenger[] };
  paymentId: number;
  price: number;
  routeSections: TicketSection[];
  seatClassKey: SeatClass;
  state: TicketState;
  travelTime: string;
  unpaid: number;
}

export interface SeatTicket extends SeatSroTicketCommons {
  addons: TicketAddon[] | null;
  affiliateTicket: boolean | null;
  cancelChargeSum: number | null;
  cancelMoneyBackSum: number | null;
  conditions: null | { descriptions: TicketDescriptions; code: string };
  customerNotifications: string[] | null;
  expirateAt: null | { days: number; hours: number; minutes: number };
  expirationDate: DateString | null;
  id: number;
  routeId: RouteId;
  surcharge: number;
  ticketCode: string;
  transfersInfo: TransfersInfo | null;
  usedCodeDiscount: CodeDiscount | null;
  usedPercentualDiscounts: PercentualDiscount[] | null;
  wheelChairPlatformOrderPossible: boolean;
  wheelChairPlatformOrdered: boolean;
}

export interface SroTicket extends SeatSroTicketCommons {
  affiliateTicket: boolean;
  conditions: Conditions;
  sroTicketId: number;
}

export interface UserTicketsOptions {
  limit: number;
  sortDirection?: 'ASC' | 'DESC';
}

export type FetchableTicketType = Exclude<TicketType, 'FLEXI'>;

export interface Tickets {
  RJ_SEAT: SeatTicket[];
  RJ_SRO: SroTicket[];
  RJ_TIME: TimeTicket[];
}

export type TicketsResponse =
  | SeatTicket[]
  | SroTicket[]
  | { tickets: TimeTicket[] };

export const emptyTickets: Tickets = {
  RJ_SEAT: [],
  RJ_SRO: [],
  RJ_TIME: [],
};

export const emptyOffsets: Record<FetchableTicketType, number> = Object.freeze({
  RJ_SEAT: 0,
  RJ_SRO: 0,
  RJ_TIME: 0,
});

export const defaultOptions: Record<TicketState, UserTicketsOptions> = Object.freeze({
  CANCELED: { limit: 10 },
  UNPAID: { limit: 99, sortDirection: 'ASC' },
  USED: { limit: 5 },
  VALID: { limit: 10, sortDirection: 'ASC' },
});

const ticketTypeToUrlPath = {
  RJ_SEAT: '/tickets',
  RJ_SRO: '/tickets/RJ_SRO',
  RJ_TIME: '/tickets/RJ_TIME',
};

const priceReducer =
  (acc: number, { unpaid }: Tickets[FetchableTicketType][number]) =>
    unpaid + acc;

const filterExpired = (t: Pick<SeatTicket, 'expirationDate'> & Pick<SroTicket, 'conditions'> & Pick<TimeTicket, 'conditions'>) =>
  +new Date(t.expirationDate || t.conditions.expireAt || t.conditions.expiration || 0) >
  +new Date().valueOf();

const polishData = (state: TicketState, { RJ_SEAT, RJ_SRO, RJ_TIME }: Tickets) => {
  const addStateToTicket = (t: any) => ({ ...t, state });
  if (state !== 'UNPAID') {
    return {
      RJ_SEAT: RJ_SEAT.map(addStateToTicket),
      RJ_SRO: RJ_SRO.map(addStateToTicket),
      RJ_TIME: RJ_TIME.map(addStateToTicket),
    };
  }
  return {
    RJ_SEAT: RJ_SEAT.map(addStateToTicket).filter(filterExpired),
    RJ_SRO: RJ_SRO.map(addStateToTicket).filter(filterExpired),
    RJ_TIME: RJ_TIME.map(addStateToTicket).filter(filterExpired),
  };
};

const polishSingleType = (state: TicketState, type: FetchableTicketType, tickets: any[]) => {
  const addStateToTicket = (t: any) => ({ ...t, state });
  if (state !== 'UNPAID') {
    return tickets.map(addStateToTicket);
  }
  return tickets.filter(filterExpired).map(addStateToTicket);
};

const useUserTickets = (
  state: TicketState,
  autoFetch = true,
  options?: Partial<UserTicketsOptions>,
) => {
  const token = useContextSelector(StoreContext, c => c.state.user.token);
  const interceptorsMounted = useContextSelector(StoreContext, c => c.interceptorsMounted);
  const setState = useSetResponseState(
    ResponseStateCategory.userTickets,
  );
  const error = useContextSelector(
    ResponseStateContext,
    c => c.state[ResponseStateCategory.userTickets].error,
  );

  const [tickets, setTickets] = useImmer<Tickets | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const maxTickets =
    useRef<Record<FetchableTicketType, number>>(emptyOffsets);
  const ticketsCount = useRef({ ...emptyOffsets });

  if (tickets) {
    ticketsCount.current.RJ_SEAT = tickets.RJ_SEAT.length;
    ticketsCount.current.RJ_SRO = tickets.RJ_SRO.length;
    ticketsCount.current.RJ_TIME = tickets.RJ_TIME.length;
  }

  const defaultParams = useMemo(() => ({
    ...defaultOptions[state],
    ...options,
    ticketStates: [state],
  }), [state]);

  const shouldFetchMore = tickets ? {
    RJ_SEAT: tickets.RJ_SEAT.length < maxTickets.current.RJ_SEAT,
    RJ_SRO: tickets.RJ_SRO.length < maxTickets.current.RJ_SRO,
    RJ_TIME: tickets.RJ_TIME.length < maxTickets.current.RJ_TIME,
  } : {};

  const totalPrice = useMemo(() =>
    tickets ?
      tickets.RJ_SEAT.reduce(priceReducer, 0) +
      tickets.RJ_SRO.reduce(priceReducer, 0) +
      tickets.RJ_TIME.reduce(priceReducer, 0)
      : 0, [tickets],
  );

  const totalCount = maxTickets.current.RJ_SEAT +
    maxTickets.current.RJ_SRO +
    maxTickets.current.RJ_TIME;

  const fetchedCount = loading || !tickets ? 0 :
    tickets.RJ_SEAT.length + tickets.RJ_SRO.length + tickets.RJ_TIME.length;

  const fetchTickets = useCallback(async (signal?: GenericAbortSignal, noLimitReset?: boolean) => {
    try {
      if (api.defaults.headers.Authorization) {
        setState(undefined, false);
        setLoading(true);
        const [
          { data: RJ_SEAT, headers: seatHeaders },
          { data: RJ_SRO, headers: sroHeaders },
          { data: rjTimeData, headers: timeHeaders },
        ] = await Promise.all([
          api.get<SeatTicket[]>(ticketTypeToUrlPath.RJ_SEAT, {
            headers: {
              'Accept': 'application/1.2.0+json',
            },
            params: noLimitReset && ticketsCount.current.RJ_SEAT ? {
              ...defaultParams,
              limit: ticketsCount.current.RJ_SEAT,
            } : defaultParams,
            signal,
          }),
          api.get<SroTicket[]>(ticketTypeToUrlPath.RJ_SRO, {
            params: noLimitReset && ticketsCount.current.RJ_SRO ? {
              ...defaultParams,
              limit: ticketsCount.current.RJ_SRO,
            } : defaultParams,
            signal,
          }),
          api.get<{ tickets: TimeTicket[] }>(ticketTypeToUrlPath.RJ_TIME, {
            params: noLimitReset && ticketsCount.current.RJ_TIME ? {
              ...defaultParams,
              limit: ticketsCount.current.RJ_TIME,
            } : defaultParams,
            signal,
          }),
        ]);

        maxTickets.current = {
          RJ_SEAT: parseInt(seatHeaders['x-pagination-total']!),
          RJ_SRO: parseInt(sroHeaders['x-pagination-total']!),
          RJ_TIME: parseInt(timeHeaders['x-pagination-total']!),
        };
        setTickets(polishData(state, { RJ_SEAT, RJ_SRO, RJ_TIME: rjTimeData.tickets }));
        setLoading(false);
      } else {
        maxTickets.current = emptyOffsets;
        setTickets(emptyTickets);
      }
      return true;
    } catch (e) {
      setLoading(false);
      if (axios.isCancel(e)) {
        return false;
      }
      maxTickets.current = emptyOffsets;
      setTickets(undefined);
      setState(isAxiosError(e) ?
        e.response?.data.message || getErrorMessage(e)
        : FAIL_MESSAGE, false);
      return false;
    }
  }, [state]);

  const fetchMore = useCallback(async (type: FetchableTicketType, signal?: GenericAbortSignal) => {
    try {
      if (api.defaults.headers.Authorization && tickets?.[type].length) {
        setLoadingMore(true);
        const { data } = await api.get(ticketTypeToUrlPath[type], {
          params: { ...defaultParams, offset: tickets[type].length },
          headers: type === 'RJ_SEAT' ? { 'Accept': 'application/1.2.0+json' } : undefined,
          signal,
        });

        const fetchedTickets = polishSingleType(state, type, type === 'RJ_TIME' ? data.tickets : data);
        if (!fetchedTickets.length) {
          return;
        }

        setTickets(draft => {
          draft?.[type].push(...fetchedTickets as any[]);
        });
        setLoadingMore(false);
      } else {
        maxTickets.current = emptyOffsets;
        setTickets(undefined);
      }
    } catch (e) {
      setTickets(undefined);
      setState(isAxiosError(e) ?
        e.response?.data.message || getErrorMessage(e)
        : FAIL_MESSAGE, false);
    }
  }, [tickets, state]);

  useEffect(() => {
    if (autoFetch && api.defaults.headers.Authorization && interceptorsMounted) {
      maxTickets.current = emptyOffsets;
      setTickets(undefined);
      fetchTickets();
    } else if (!api.defaults.headers.Authorization) {
      maxTickets.current = emptyOffsets;
      setTickets(undefined);
    }
  }, [state, token, interceptorsMounted]);

  return {
    error,
    fetchMore,
    fetchTickets,
    fetchedCount,
    loading,
    loadingMore,
    shouldFetchMore,
    tickets,
    totalCount,
    totalPrice,
  };
};

export default useUserTickets;
