import React, { Dispatch, FC, ReactNode, useEffect, useMemo } from 'react';
import equal from 'fast-deep-equal';
import type { Draft } from 'immer';
import { createContext } from 'use-context-selector';
import { useImmerReducer } from 'use-immer';
import { PersistConfig } from '../../hooks';
import { api, resInterceptor } from '../../hooks/consts';
import { gtmPush } from '../../hooks/utils';
import {
  BookingActions,
  BookingReducerProps,
  ClearBookingPayload,
  CLEAR_BOOKING,
  REPLACE_TARIFFS,
  SAVE_CONNECTION,
  SELECT_ADDONS,
  SELECT_CLASS,
  SELECT_CODE_DISCOUNT,
  SELECT_PERC_DISCOUNT,
  SELECT_ROUTE,
  SELECT_SEATS,
  SET_PRICE,
  UPSELL_ADDONS,
} from './types';

const bookingInitialState: BookingReducerProps = {
  booking: null,
  fav: [],
};

interface BookingProviderType {
  children?: ReactNode;
  persistConfig?: PersistConfig;
  persist?: boolean;
  transportHash?: string;
}

interface BookingContextType {
  state: BookingReducerProps;
  dispatch: Dispatch<BookingActions>;
}

export const BookingContext = createContext({} as BookingContextType);

const bookingReducer = (draft: Draft<BookingReducerProps>, action: BookingActions) => {
  // default GTM
  if (typeof window !== 'undefined') {
    gtmPush({
      event: action.type + ((action?.payload as ClearBookingPayload)?.direction || ''),
      [action.type]: {
        ...action.payload,
        currency: api.defaults.headers.common['X-Currency'],
      },
    });
  }

  switch (action.type) {
    case REPLACE_TARIFFS: {
      if (draft?.booking?.[action.payload.direction]?.tariffs) {
        draft.booking[action.payload.direction]!.tariffs =
          action.payload.tariffs;
      }
      break;
    }
    case SAVE_CONNECTION: {
      draft.booking = {
        connection: action.payload,
        isReturn: !!action.payload.returnDepartureDate,
        there: null,
        back: null,
      };

      if (
        !action.payload.ignoreFavorite &&
        action.payload.fromLocationId &&
        action.payload.fromLocationType &&
        action.payload.toLocationId &&
        action.payload.toLocationType
      ) {
        const favoriteIndex = draft.fav.findIndex(
          (i) =>
            i.fromLocationId === action.payload.fromLocationId &&
            i.toLocationId === action.payload.toLocationId,
        );
        if (favoriteIndex !== -1) {
          draft.fav.splice(favoriteIndex, 1);
        }

        draft.fav.unshift({
          fromLocationId: action.payload.fromLocationId,
          fromLocationType: action.payload.fromLocationType,
          toLocationId: action.payload.toLocationId,
          toLocationType: action.payload.toLocationType,
        });
      }

      break;
    }
    case SELECT_ROUTE: {
      const { direction, ...rest } = action.payload;

      if (draft.booking) {
        const nextBooking = {
          ...rest,
          bookingState: 'ROUTE_SELECTED' as const,
          seatClass: undefined,
          sections: undefined,
          price: undefined,
          priceSource: undefined,
          selectedAddons: undefined,
          passengers: undefined,
        };
        if (!equal(nextBooking, draft.booking[direction])) {
          draft.booking[direction] = nextBooking;
        }
      }

      break;
    }
    case UPSELL_ADDONS: {
      const { direction, ...rest } = action.payload;

      if (draft.booking) {
        const nextBooking = {
          ...draft.booking?.[direction],
          ...rest,
          bookingState: draft.booking[direction]!.bookingState,
        };
        if (!equal(nextBooking, draft.booking[direction])) {
          draft.booking[direction] = nextBooking;
        }
      }

      break;
    }
    case SELECT_CLASS: {
      const { direction, ...rest } = action.payload;
      if (draft.booking) {
        const nextBooking = {
          ...(draft.booking?.[direction] || {}),
          ...rest,
          bookingState: 'CLASS_SELECTED' as const,
          passengers: undefined,
        };
        if (!equal(nextBooking, draft.booking[direction])) {
          draft.booking[direction] = nextBooking;
        }
      }

      break;
    }
    case SELECT_SEATS: {
      const { direction, seats } = action.payload;
      if (draft.booking) {
        const nextBooking = {
          ...(draft.booking?.[direction]),
          sections: draft.booking?.[direction]?.sections?.map((s) => ({
            ...s,
            selectedSeats: seats.filter(
              (seat) => seat.sectionId === s.sectionId,
            ),
          })),
          bookingState: 'SEAT_SELECTED' as const,
        };
        if (!equal(nextBooking, draft.booking[direction])) {
          draft.booking[direction] = nextBooking;
        }
      }

      break;
    }
    case SELECT_ADDONS: {
      const { direction, ...rest } = action.payload;

      if (draft.booking) {
        const nextBooking = {
          ...draft.booking?.[direction],
          ...rest,
          bookingState: 'ADDONS_SELECTED' as const,
        };
        if (!equal(nextBooking, draft.booking[direction])) {
          draft.booking[direction] = nextBooking;
        }
      }

      break;
    }
    case SELECT_PERC_DISCOUNT: {
      const { direction, percentualDiscountIds, discountAmount } =
        action.payload;
      if (draft.booking?.[direction]?.bookingState) {
        const nextBooking = {
          ...draft.booking?.[direction],
          percentualDiscountIds,
          discountAmount,
          bookingState: draft.booking[direction]!.bookingState,
        };
        if (!equal(nextBooking, draft.booking[direction])) {
          draft.booking[direction] = nextBooking;
        }
      }
      break;
    }
    case SELECT_CODE_DISCOUNT: {
      const { direction, codeDiscount, discountAmount } = action.payload;
      if (draft.booking?.[direction]?.bookingState) {
        draft.booking[direction] = {
          ...(draft.booking?.[direction] || {}),
          codeDiscount,
          discountAmount,
          bookingState: draft.booking[direction]!.bookingState,
        };
      }
      break;
    }
    case SET_PRICE: {
      const { direction, price } = action.payload;
      if (draft.booking?.[direction]) {
        const nextBooking = {
          ...(draft.booking?.[direction] || {}),
          price,
          bookingState: draft.booking[direction]!.bookingState,
        };
        if (!equal(nextBooking, draft.booking[direction])) {
          draft.booking[direction] = nextBooking;
        }
      }
      break;
    }
    case CLEAR_BOOKING: {
      // Clear on new search
      if (!action?.payload?.direction && draft.booking) {
        draft.booking = null;

        // Delete manually
      } else if (action?.payload?.direction && draft.booking) {
        if (action.payload.direction === 'there') {
          draft.booking.there = draft.booking.back;
        }

        if (!draft.booking?.there) {
          draft.booking = null;
        } else if (draft.booking.back || draft.booking.isReturn) {
          draft.booking.back = null;
          draft.booking.isReturn = false;
        }
      }
      break;
    }
  }
};

const BookingProvider: FC<BookingProviderType> = ({
  children,
  persistConfig,
  persist,
}) => {
  const [state, dispatch] = useImmerReducer(
    bookingReducer,
    (persist && persistConfig?.getItem().bookings) || bookingInitialState,
  );

  useEffect(() => {
    if (!persist) {
      return;
    }
    persistConfig?.setItem({ bookings: state });
  }, [state]);

  useEffect(() => {
    const interceptorId = resInterceptor(() => {
      dispatch({ type: 'CLEAR_BOOKING', payload: {} });
    });

    return () => {
      api.interceptors.response.eject(interceptorId);
    };
  }, []);

  const value = useMemo(() => ({ dispatch, state }), [dispatch, state]);

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};

export default BookingProvider;
