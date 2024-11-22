import { SeatClass, TicketType } from './types';
import { PriceClass } from './useConnectionRoute';
export interface UpsellData {
    priceDiff: number;
    upsellClass: PriceClass;
}
/**
 * Call any function only after shouldBeShown is true
 */
declare const useUpsell: () => {
    acceptUpsell: () => void;
    refuseUpsell: () => void;
    shouldShowUpsell: (selectedClassKey: SeatClass, priceClasses: PriceClass[], ticketType: TicketType) => UpsellData | null;
};
export default useUpsell;
