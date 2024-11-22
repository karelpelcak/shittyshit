import { useContextSelector } from 'use-context-selector';
import { StoreContext } from '../store/rootReducer';
import { REFRESH_COOLDOWN, REFUSE_UPSELL } from '../store/upsell/types';
import { api } from './consts';
import { SeatClass, TicketType } from './types';
import { PriceClass } from './useConnectionRoute';
import { getMoreExpensiveClass, gtmPush } from './utils';

let acceptedClass: SeatClass;
let priceDifference: number;

export interface UpsellData {
  priceDiff: number;
  upsellClass: PriceClass;
}

/**
 * Call any function only after shouldBeShown is true
 */
const useUpsell = () => {
  const dispatch = useContextSelector(StoreContext, c => c.dispatch.upsellDispatch);
  const cooldownTs = useContextSelector(StoreContext, c => c.state.upsell.cooldownTs);

  const refuseUpsell = () => dispatch({ type: REFUSE_UPSELL });

  const acceptUpsell = () =>
    gtmPush({
      event: 'ACCEPT_UPSELL',
      ACCEPT_UPSELL: {
        acceptedClass,
        priceDiff: priceDifference,
        currency: api.defaults.headers.common['X-Currency'],
      },
    });

  const shouldShowUpsell = (
    selectedClassKey: SeatClass,
    priceClasses: PriceClass[],
    ticketType: TicketType,
  ): UpsellData | null => {
    dispatch({ type: REFRESH_COOLDOWN });
    const upsellClass = getMoreExpensiveClass(selectedClassKey, priceClasses);

    if (
      !upsellClass ||
      cooldownTs > new Date().valueOf() ||
      ticketType !== 'RJ_SEAT'
    ) {
      return null;
    }

    const priceDiff =
      upsellClass.price -
      (priceClasses.find((pc) => pc.seatClassKey === selectedClassKey)?.price ||
        0);

    acceptedClass = upsellClass.seatClassKey;
    priceDifference = priceDiff;

    return { priceDiff, upsellClass };
  };

  return { acceptUpsell, refuseUpsell, shouldShowUpsell };
};

export default useUpsell;
