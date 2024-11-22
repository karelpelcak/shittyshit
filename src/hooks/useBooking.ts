import type { GenericAbortSignal } from 'axios';
import { useContextSelector } from 'use-context-selector';
import { BookingContext } from '../store/booking/reducer';
import {
  CLEAR_BOOKING,
  ConnectionDirection,
  REPLACE_TARIFFS,
  SAVE_CONNECTION,
  SaveConnectionPayload,
  SELECT_ADDONS,
  SELECT_CLASS,
  SELECT_CODE_DISCOUNT,
  SELECT_PERC_DISCOUNT,
  SELECT_ROUTE,
  SELECT_SEATS,
  SelectClassPayload,
  SelectRoutePayload,
  SET_PRICE,
  UPSELL_ADDONS,
} from '../store/booking/types';
import { Currency, SelectedSeat, Tariff } from './types';
import { SelectedAddon } from './useAddons';
import { useManualApi } from './useManualApi';

export interface DiscountResponse {
  amount: number;
  currency: Currency;
  discountedTicketPrice: number;
}

export const useBookingDiscount = (directionProp: ConnectionDirection = 'there') => {
  const isReturn = useContextSelector(BookingContext, c => c.state.booking?.isReturn);
  const direction = directionProp === 'back' && isReturn ? 'back' : 'there';
  const bookingItem = useContextSelector(BookingContext, c => c.state.booking?.[direction]);
  const dispatch = useContextSelector(BookingContext, c => c.dispatch);

  const [{ error, data }, verifyDiscount] =
    useManualApi<DiscountResponse>({
      method: 'POST',
    });
  const selectCodeDiscount = async (
    codeDiscount: string | number | undefined,
    signal?: GenericAbortSignal,
  ) => {
    if (!bookingItem) {
      return;
    }
    const { data: discountData } = await verifyDiscount({
      url:
        typeof codeDiscount === 'number'
          ? `/discounts/percentual/${codeDiscount}/verify`
          : `/discounts/code/${codeDiscount}/verify`,
      data: {
        actionPrice: null,
        passengers: bookingItem.tariffs?.map((tariff) => ({
          tariff,
        })),
        route: {
          priceSource: bookingItem.priceSource,
          routeId: bookingItem.routeId,
          seatClass: bookingItem.seatClass,
          sections: bookingItem.sections?.map(
            ({ selectedSeats, ...section }) => ({ section, selectedSeats }),
          ),
        },
        ticketPrice: bookingItem.price,
      },
      signal,
    });

    const discountAmount =
      bookingItem.price! - discountData.discountedTicketPrice;

    dispatch({
      type: SET_PRICE,
      payload: { direction, price: discountData.discountedTicketPrice },
    });

    if (typeof codeDiscount === 'number') {
      dispatch({
        type: SELECT_PERC_DISCOUNT,
        payload: {
          percentualDiscountIds: [codeDiscount],
          discountAmount,
          direction,
        },
      });
    } else {
      dispatch({
        type: SELECT_CODE_DISCOUNT,
        payload: { codeDiscount, discountAmount, direction },
      });
    }
  };

  return {
    data,
    error,
    selectCodeDiscount,
  };
};

const useBookingActions = (directionProp: ConnectionDirection = 'there') => {
  const isReturn = useContextSelector(BookingContext, c => c.state.booking?.isReturn);
  const direction = directionProp === 'back' && isReturn ? 'back' : 'there';
  const dispatch = useContextSelector(BookingContext, c => c.dispatch);

  const createBooking = (payload: SaveConnectionPayload) =>
    dispatch({ type: SAVE_CONNECTION, payload });

  const replaceTariffs = (tariffs: Tariff[]) =>
    dispatch({
      type: REPLACE_TARIFFS,
      payload: { direction, tariffs },
    });

  const selectRoute = (payload: Omit<SelectRoutePayload, 'direction'>) =>
    dispatch({
      type: SELECT_ROUTE,
      payload: { ...payload, direction },
    });

  const selectClass = (payload: Omit<SelectClassPayload, 'direction'>) =>
    dispatch({
      type: SELECT_CLASS,
      payload: { ...payload, direction },
    });

  const selectSeats = (seats: SelectedSeat[]) =>
    dispatch({ type: SELECT_SEATS, payload: { seats, direction } });

  const selectAddons = (selectedAddons: SelectedAddon[]) =>
    dispatch({
      type: SELECT_ADDONS,
      payload: { selectedAddons, direction },
    });

  const upsellAddons = (selectedAddons: SelectedAddon[]) => 
    dispatch({
      type: UPSELL_ADDONS,
      payload: { selectedAddons, direction },
    });

  const clearBooking = (dir?: ConnectionDirection) =>
    dispatch({ type: CLEAR_BOOKING, payload: { direction: dir } });

  return {
    clearBooking,
    createBooking,
    replaceTariffs,
    selectAddons,
    selectClass,
    selectRoute,
    selectSeats,
    upsellAddons,
  };
};

export default useBookingActions;
