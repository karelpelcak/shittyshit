import { useEffect } from 'react';
import type { AxiosRequestConfig, GenericAbortSignal } from 'axios';
import { useContextSelector } from 'use-context-selector';
import { BookingContext } from '../store/booking/reducer';
import { BookingProps } from '../store/booking/types';
import { ResponseStateContext } from '../store/responseState/reducer';
import { ResponseStateCategory } from '../store/responseState/types';
import { StoreContext } from '../store/rootReducer';
import { api } from './consts';
import {
  DateString,
  FlexiType,
  RouteId,
  RouteSectionFromTo,
  SeatClass,
  SelectedSeat,
  Tariff,
} from './types';
import { SelectedAddon } from './useAddons';
import useBookingActions from './useBooking';
import { useHeadersActions } from './useHeaders';
import { useManualApi } from './useManualApi';
import { Passengers } from './usePassengersData';
import usePayment, { TicketTypeId } from './usePayment';
import useSetResponseState from './useSetResponseState';
import { SroTicket, TicketSection } from './useUserTickets';
import { createTxToken, getAffiliateCode, getNewSeats } from './utils';

export interface CreateSeatTicketData {
  ticketRequests: SeatTicketRequest[];
  affiliateCode?: string;
}

export interface TimeTicketCreateRequest {
  lineGroupCode: string;
  lineNumber: number;
  station1Id: number;
  station2Id: number;
  tariff: Tariff;
  validFrom: DateString;
}

export interface RegisteredTimeTicketCreateRequest
  extends TimeTicketCreateRequest {
  seatClass: SeatClass;
  type: FlexiType;
}

export interface UnregisteredTimeTicketCreateRequest
  extends TimeTicketCreateRequest {
  email: string;
  seatClassKey: SeatClass;
  timeTicketType: FlexiType;
}

export interface CreateUnregTimeTicketData {
  unregisteredTimeTicketCreateRequest: UnregisteredTimeTicketCreateRequest[];
}

export interface CreateRegTimeTicketData {
  timeTicketRequests: RegisteredTimeTicketCreateRequest[];
}

export interface PassengerRequest extends PassengerData {
  tariff: Tariff;
}

export interface Passenger {
  amount: number;
  dateOfBirth: null;
  email: string | null;
  firstName: string | null;
  id: number;
  moneyBack: number;
  phone: string | null;
  surname: string | null;
  tariff: Tariff;
}

export interface SeatTicketRequest {
  codeDiscount?: string;
  passengers: PassengerRequest[];
  percentualDiscountIds: number[];
  route: Route;
  selectedAddons: SelectedAddon[];
}

export interface CreateSroTicketData {
  ticketRequests: SroTicketRequest[];
}

export interface SroTicketRequest {
  passengers: { email: string }[];
  priceSourceId: string;
  routeId: string;
  seatClass: SeatClass;
  sections: SectionElement[];
}

export interface PassengerData {
  email?: string;
  firstName?: string;
  phone?: string;
  surname?: string;
  id?: number;
}

export interface Route {
  actionPrice?: ActionPrice;
  priceSource: string;
  routeId: RouteId;
  seatClass: SeatClass;
  sections: SectionElement[];
}

export interface ActionPrice {
  code: string;
  description: string;
  id: number;
  name: string;
  showIcon: boolean;
  url: string;
}

export interface SectionElement {
  section: RouteSectionFromTo;
  selectedSeats: SelectedSeat[];
}

export interface SeatSroTicket {
  id: string;
  routeSections: TicketSection[];
}

export interface UnregisteredSeatSroTicketData {
  token: string;
  tickets: SeatSroTicket[];
}

export interface RegisteredSeatTicketData {
  tickets: SeatSroTicket[];
}

export interface UnregisteredTimeTicketData {
  token: { token: string };
}

const fetchSroTickets = (config?: AxiosRequestConfig) =>
  api.get<SroTicket[]>('/tickets/RJ_SRO', {
    params: { limit: 1, ticketStates: ['UNPAID'] },
    ...config,
  });

/**
 * Reserving tickets and charging credit if there's enough credit in account
 */
const useCreateTickets = () => {
  const isLoggedIn = useContextSelector(
    StoreContext,
    (c) => !!c.state.user.user,
  );
  const { setToken } = useHeadersActions();
  const setState = useSetResponseState(ResponseStateCategory.createTickets);
  const categoryState = useContextSelector(
    ResponseStateContext,
    (c) => c.state[ResponseStateCategory.createTickets],
  );
  const { clearBooking } = useBookingActions();
  const bookingThere = useContextSelector(
    BookingContext,
    (c) => c.state.booking?.there,
  );
  const bookingBack = useContextSelector(
    BookingContext,
    (c) => c.state.booking?.back,
  );
  const connection = useContextSelector(
    BookingContext,
    (c) => c.state.booking?.connection,
  );
  const {
    buyTickets,
    loading: paymentLoading,
    error: paymentError,
  } = usePayment();

  const bookingPriceWithoutAddons =
    (bookingThere?.price ?? 0) + (bookingBack?.price ?? 0);

  const [
    {
      loading: unregisteredSeatTicketLoading,
      error: unregisteredSeatTicketError,
    },
    fetchUnregisteredSeatTicket,
  ] = useManualApi<UnregisteredSeatSroTicketData>({
    url: '/tickets/create/unregistered',
    method: 'POST',
    headers: { 'Content-Type': 'application/1.2.0+json' },
  });

  const [
    { loading: registeredSeatTicketLoading, error: registeredSeatTicketError },
    fetchRegisteredSeatTicket,
  ] = useManualApi<RegisteredSeatTicketData>({
    url: '/tickets/create/registered',
    method: 'POST',
    headers: { 'Content-Type': 'application/1.2.0+json' },
  });

  const [
    {
      loading: unregisteredTimeTicketLoading,
      error: unregisteredTimeTicketError,
    },
    fetchUnregisteredTimeTicket,
  ] = useManualApi<UnregisteredTimeTicketData>({
    url: '/tickets/timetickets/unregistered',
    method: 'POST',
  });

  const [
    { loading: registeredTimeTicketLoading, error: registeredTimeTicketError },
    fetchRegisteredTimeTicket,
  ] = useManualApi<number[]>({ url: '/tickets/timeticket', method: 'POST' });

  const [
    {
      loading: unregisteredSroTicketLoading,
      error: unregisteredSroTicketError,
    },
    fetchUnregisteredSroTicket,
  ] = useManualApi<Pick<UnregisteredSeatSroTicketData, 'token'>>({
    url: '/tickets/RJ_SRO/unregistered',
    method: 'POST',
  });

  const [
    { loading: registeredSroTicketLoading, error: registeredSroTicketError },
    fetchRegisteredSroTicket,
  ] = useManualApi<{ message: string; messageFields: string[] }>({
    url: '/tickets/RJ_SRO/registered',
    method: 'POST',
  });

  /**
   * Tries to reserve tickets on ybus from all finished bookings.
   * Returns route. If it redirects to checkout, it can also returns SelectedSeats,
   * if there's new seats selected by ybus to inform user.
   *
   * @param passengers Its length has to match booking tariffs length
   * @param chargeImmediately Set true only when user has enough credit and has fast booking
   */
  const createTickets = async (
    email: string,
    passengers: Passengers[],
    phone?: string,
    chargeImmediately?: boolean,
    signal?: GenericAbortSignal,
  ): Promise<{
    newSeats: SelectedSeat[];
    redirect: 'tickets' | 'checkout' | 'cart' | '';
    ticketTypeId?: TicketTypeId[];
  }> => {
    try {
      if (!connection) {
        throw new Error('no connection');
      }
      const allBookings = [bookingThere, bookingBack].filter(
        Boolean,
      ) as BookingProps[];
      const rjSeatBookings = allBookings.filter((b) => b.type === 'RJ_SEAT');
      const rjSroBookings = allBookings.filter((b) => b.type === 'RJ_SRO');
      const rjTimeBookings = allBookings.filter((b) =>
        ['RJ_TIME', 'FLEXI'].includes(b.type!),
      );

      let newSeats: SelectedSeat[] | null = null;
      let ticketTypeId: TicketTypeId[] | undefined = undefined;

      const getTicketPassengers = (tariffs: Tariff[]) =>
        !passengers.length
          ? tariffs.map((tariff, i) => ({
              tariff,
              ...(i ? {} : { phone, email }),
            }))
          : passengers.map(({ fields }, i) => ({
              ...fields,
              tariff: tariffs[i] || Tariff.Regular,
              phone: i ? undefined : phone,
              email: i ? undefined : email,
            }));

      const rjSeatPayload: CreateSeatTicketData = {
        ticketRequests: rjSeatBookings.map((b) => ({
          passengers: getTicketPassengers(b?.tariffs || []),
          route: {
            routeId: b?.routeId || '',
            priceSource: b?.priceSource || '',
            sections: (b?.sections || []).map(
              ({ sectionId, fromStationId, toStationId, selectedSeats }) => ({
                section: { fromStationId, sectionId, toStationId },
                selectedSeats: (selectedSeats || []).map((selectedSeat) => ({
                  ...selectedSeat,
                  sectionId,
                })),
              }),
            ),
            seatClass: b?.seatClass || SeatClass.No,
          },
          selectedAddons: (b?.selectedAddons || []).map(
            ({ addonCode, ...a }) => a,
          ),
          percentualDiscountIds: b.percentualDiscountIds || [],
          codeDiscount: b.codeDiscount,
        })),
        affiliateCode: getAffiliateCode(),
      };

      const reqSeats = rjSeatPayload.ticketRequests.flatMap((tr) =>
        tr.route.sections.flatMap((s) => s.selectedSeats),
      );

      const rjSroPayload: CreateSroTicketData = {
        ticketRequests: rjSroBookings.map((b) => ({
          routeId: b.routeId!,
          seatClass: b.seatClass!,
          passengers: (b?.tariffs || []).map(() => ({ email })),
          sections: (b?.sections || []).map(
            ({ sectionId, fromStationId, toStationId, selectedSeats }) => ({
              section: { fromStationId, sectionId, toStationId },
              selectedSeats: (selectedSeats || []).map((selectedSeat) => ({
                ...selectedSeat,
                sectionId,
              })),
            }),
          ),
          priceSourceId: b.priceSource!,
        })),
      };

      const rjTimeUnregPayload: CreateUnregTimeTicketData = {
        unregisteredTimeTicketCreateRequest: rjTimeBookings.map((b) => ({
          email,
          lineGroupCode: b.lineGroupCode!,
          lineNumber: b.lineNumber!,
          seatClassKey: b.seatClass!,
          station1Id: b.fromStationId!,
          station2Id: b.toStationId!,
          tariff: b.tariffs![0]!,
          timeTicketType: b.flexiType || 'FLEX',
          validFrom: connection.departureDate!,
        })),
      };

      const rjTimeRegPayload: CreateRegTimeTicketData = {
        timeTicketRequests: rjTimeBookings.flatMap((b) =>
          (b.tariffs || []).map((tariff) => ({
            lineGroupCode: b.lineGroupCode!,
            lineNumber: b.lineNumber!,
            seatClass: b.seatClass!,
            station1Id: b.fromStationId!,
            station2Id: b.toStationId!,
            tariff,
            type: b.flexiType || 'FLEX',
            validFrom: connection.departureDate!,
          })),
        ),
      };

      if (isLoggedIn) {
        let regRjSeatData: RegisteredSeatTicketData = { tickets: [] };

        if (rjSeatBookings.length) {
          const { data } = await fetchRegisteredSeatTicket({
            data: rjSeatPayload,
            signal,
          });
          regRjSeatData = data;

          ticketTypeId = data.tickets.map(({ id }) => ({
            type: 'RJ_SEAT',
            id: parseInt(id, 10),
          }));

          const respSeats = regRjSeatData.tickets.flatMap((t) =>
            t.routeSections.flatMap((rs) => rs.selectedSeats),
          );

          /* Don't buy if price is 0 - bookings are bought automatically */
          if (
            rjSeatBookings.reduce(
              (totalPrice, { price }) => totalPrice + (price || 0),
              0,
            ) === 0
          ) {
            return {
              redirect: 'tickets',
              newSeats: getNewSeats(reqSeats, respSeats),
              ticketTypeId,
            };
          }

          if (chargeImmediately) {
             const response = await buyTickets(
              false,
              // @ts-expect-error Override is allowed
              { email, phone, ...(passengers?.[0]?.fields || {}) },
              ticketTypeId,
              true,
              signal
            );

            clearBooking();

            if (!response) {
              return {
                redirect: 'checkout',
                newSeats: [],
                ticketTypeId,
              };
            }

            return {
              redirect: 'tickets',
              newSeats: getNewSeats(reqSeats, respSeats),
              ticketTypeId,
            };
          }
        }

        if (rjTimeBookings.length) {
          const { data } = await fetchRegisteredTimeTicket({
            data: rjTimeRegPayload,
            headers: {
              'X-TxToken': createTxToken(),
              'Content-Type': 'application/1.2.0+json',
            },
            signal,
          });
          if (chargeImmediately) {
            ticketTypeId = data.map((id) => ({ type: 'RJ_TIME', id }));
            await buyTickets(
              false,
              passengers[0].fields,
              ticketTypeId,
              true,
              signal,
            );

            clearBooking();
            return { redirect: 'tickets', newSeats: [], ticketTypeId };
          }
        }

        if (rjSroBookings.length) {
          await fetchRegisteredSroTicket({
            data: rjSroPayload,
            headers: { 'X-TxToken': createTxToken() },
            signal,
          });

          if (chargeImmediately) {
            const { data } = await fetchSroTickets();

            ticketTypeId = data.map((t) => ({
              type: 'RJ_SRO',
              id: t.sroTicketId,
            }));

            await buyTickets(
              false,
              passengers[0].fields,
              ticketTypeId,
              true,
              signal,
            );

            clearBooking();
            return { redirect: 'tickets', newSeats: [], ticketTypeId };
          }
        }

        const respSeats = regRjSeatData.tickets.flatMap((t) =>
          t.routeSections.flatMap((rs) => rs.selectedSeats),
        );

        newSeats = getNewSeats(reqSeats, respSeats);
      } else {
        let token = null;

        if (rjSeatBookings.length) {
          const { data } = await fetchUnregisteredSeatTicket({
            data: { ...rjSeatPayload, agreeWithTerms: true },
            signal,
          });

          ticketTypeId = data.tickets.map(({ id }) => ({
            id: parseInt(id, 10),
            type: 'RJ_SEAT',
          }));

          /**
           * Soft booking can book other seat than selected. We need to inform user about it
           */
          const respSeats = data.tickets.flatMap((t) =>
            t.routeSections.flatMap((rs) => rs.selectedSeats),
          );
          newSeats = getNewSeats(reqSeats, respSeats);

          token = data.token;
          api.defaults.headers.Authorization = `Bearer ${data.token}`;
        }

        if (rjTimeBookings.length) {
          if (!token) {
            const { data } = await fetchUnregisteredTimeTicket({
              data: rjTimeUnregPayload,
              headers: {
                'Content-Type': 'application/1.2.0+json',
                'X-TxToken': createTxToken(),
              },
              signal,
            });
            token = data.token.token;
            api.defaults.headers.Authorization = `Bearer ${data.token.token}`;
          } else {
            await fetchRegisteredTimeTicket({
              data: rjTimeRegPayload,
              headers: { 'X-TxToken': createTxToken() },
              signal,
            });
          }
        }

        if (rjSroBookings.length) {
          if (!token) {
            const { data } = await fetchUnregisteredSroTicket({
              data: { ...rjSroPayload, agreeWithTerms: true },
              headers: { 'X-TxToken': createTxToken() },
              signal,
            });
            token = data.token;
            api.defaults.headers.Authorization = `Bearer ${data.token}`;
          } else {
            await fetchRegisteredSroTicket({
              data: rjSroPayload,
              headers: { 'X-TxToken': createTxToken() },
              signal,
            });
          }
        }

        await setToken(token);
      }

      clearBooking();
      return {
        redirect: bookingPriceWithoutAddons ? 'cart' : 'tickets',
        newSeats: newSeats || [],
        ticketTypeId,
      };
    } catch {
      return { redirect: '', newSeats: [] };
    }
  };

  const errorData =
    unregisteredTimeTicketError ||
    unregisteredSeatTicketError ||
    unregisteredSroTicketError ||
    registeredSroTicketError ||
    registeredTimeTicketError ||
    registeredSeatTicketError;

  const loading =
    unregisteredTimeTicketLoading ||
    unregisteredSeatTicketLoading ||
    unregisteredSroTicketLoading ||
    registeredSroTicketLoading ||
    registeredTimeTicketLoading ||
    registeredSeatTicketLoading ||
    paymentLoading;

  useEffect(() => {
    setState(
      errorData?.response?.data?.message || paymentError?.message,
      loading,
    );
  }, [errorData, loading]);

  return { createTickets, ...categoryState };
};

export default useCreateTickets;
