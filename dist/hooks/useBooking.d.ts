import type { GenericAbortSignal } from 'axios';
import { ConnectionDirection, SaveConnectionPayload, SelectClassPayload, SelectRoutePayload } from '../store/booking/types';
import { Currency, SelectedSeat, Tariff } from './types';
import { SelectedAddon } from './useAddons';
export interface DiscountResponse {
    amount: number;
    currency: Currency;
    discountedTicketPrice: number;
}
export declare const useBookingDiscount: (directionProp?: ConnectionDirection) => {
    data: DiscountResponse | undefined;
    error: import("axios").AxiosError<any, any> | null;
    selectCodeDiscount: (codeDiscount: string | number | undefined, signal?: GenericAbortSignal) => Promise<void>;
};
declare const useBookingActions: (directionProp?: ConnectionDirection) => {
    clearBooking: (dir?: ConnectionDirection) => void;
    createBooking: (payload: SaveConnectionPayload) => void;
    replaceTariffs: (tariffs: Tariff[]) => void;
    selectAddons: (selectedAddons: SelectedAddon[]) => void;
    selectClass: (payload: Omit<SelectClassPayload, 'direction'>) => void;
    selectRoute: (payload: Omit<SelectRoutePayload, 'direction'>) => void;
    selectSeats: (seats: SelectedSeat[]) => void;
    upsellAddons: (selectedAddons: SelectedAddon[]) => void;
};
export default useBookingActions;
