import { useMemo } from 'react';
import { useContextSelector } from 'use-context-selector';
import { BookingContext } from '../store/booking/reducer';

const useBookingPrice = () => {
  const thereAddons = useContextSelector(
    BookingContext,
    (c) => c.state.booking?.there?.selectedAddons,
  );
  const backAddons = useContextSelector(
    BookingContext,
    (c) => c.state.booking?.back?.selectedAddons,
  );
  const therePrice = useContextSelector(
    BookingContext,
    (c) => c.state.booking?.there?.price,
  );
  const backPrice = useContextSelector(
    BookingContext,
    (c) => c.state.booking?.back?.price,
  );

  const addonsPrice = useMemo(
    () =>
      [...(thereAddons || []), ...(backAddons || [])].reduce(
        (prev, curr) => prev + (curr.price * curr.count),
        0,
      ),
    [thereAddons, backAddons],
  );

  const bookingPrice = (therePrice ?? 0) + (backPrice ?? 0);

  const totalPrice = bookingPrice + addonsPrice;

  return { addonsPrice, backPrice, bookingPrice, therePrice, totalPrice };
};

export default useBookingPrice;
