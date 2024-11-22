import { FlexiType, RouteId, SeatClass, SeatPosition, SeatSectionBasic, SelectedSeat, Tariff, TicketType } from '../../hooks/types';
import { SelectedAddon } from '../../hooks/useAddons';
import { ConnectionLocations, ConnectionPayload } from '../../hooks/useConnection';
import { CarbonOffset } from '../../hooks/useConnectionRoute';
import { PassengerData } from '../../hooks/useCreateTickets';
export interface SectionWithSeats extends SeatSectionBasic {
    selectedSeats?: SeatPosition[];
}
export type ConnectionDirection = 'there' | 'back';
export declare const CLEAR_BOOKING = "CLEAR_BOOKING";
export declare const REPLACE_TARIFFS = "REPLACE_TARIFFS";
export declare const SAVE_CONNECTION = "SAVE_CONNECTION";
export declare const SELECT_ADDONS = "SELECT_ADDONS";
export declare const SELECT_CLASS = "SELECT_CLASS";
export declare const SELECT_CODE_DISCOUNT = "SELECT_CODE_DISCOUNT";
export declare const SELECT_PERC_DISCOUNT = "SELECT_PERC_DISCOUNT";
export declare const SELECT_ROUTE = "SELECT_ROUTE";
export declare const SELECT_SEATS = "SELECT_SEATS";
export declare const SET_PRICE = "SET_PRICE";
export declare const UPSELL_ADDONS = "UPSELL_ADDONS";
export interface PayloadCommons {
    direction: ConnectionDirection;
}
export interface SelectRoutePayload extends PayloadCommons {
    fromStationId: number;
    routeId: RouteId;
    tariffs: Tariff[];
    toStationId: number;
    type?: TicketType;
}
export interface ReplaceTariffsPayload extends PayloadCommons {
    tariffs: Tariff[];
}
export interface SelectClassPayload extends PayloadCommons {
    flexiType?: FlexiType;
    lineGroupCode?: string;
    lineNumber?: number;
    price: number;
    priceSource?: string;
    seatClass: SeatClass;
    sections: SectionWithSeats[];
    type: TicketType;
}
export interface SelectSeatsPayload extends PayloadCommons {
    seats: SelectedSeat[];
}
export interface SelectAddonsPayload extends PayloadCommons {
    selectedAddons: SelectedAddon[];
}
export interface SelectPercentualDiscountPayload extends PayloadCommons {
    percentualDiscountIds?: number[];
    discountAmount?: number;
}
export interface SelectCodeDiscountPayload extends PayloadCommons {
    codeDiscount?: string;
    discountAmount?: number;
}
export interface SetPricePayload extends PayloadCommons {
    price: number;
}
export interface SaveConnectionPayload extends Partial<ConnectionPayload> {
    ignoreFavorite?: boolean;
}
export interface ClearBookingPayload {
    direction?: ConnectionDirection;
}
interface SaveConnectionAction {
    type: typeof SAVE_CONNECTION;
    payload: SaveConnectionPayload;
}
interface ReplaceTariffsAction {
    type: typeof REPLACE_TARIFFS;
    payload: ReplaceTariffsPayload;
}
interface SelectRouteAction {
    type: typeof SELECT_ROUTE;
    payload: SelectRoutePayload;
}
interface SelectClassAction {
    type: typeof SELECT_CLASS;
    payload: SelectClassPayload;
}
interface SelectSeatsAction {
    type: typeof SELECT_SEATS;
    payload: SelectSeatsPayload;
}
interface UpsellAddonsAction {
    type: typeof UPSELL_ADDONS;
    payload: SelectAddonsPayload;
}
interface SelectAddonsAction {
    type: typeof SELECT_ADDONS;
    payload: SelectAddonsPayload;
}
interface ClearBookingAction {
    type: typeof CLEAR_BOOKING;
    payload: ClearBookingPayload;
}
interface SelectPercentualDiscountAction {
    type: typeof SELECT_PERC_DISCOUNT;
    payload: SelectPercentualDiscountPayload;
}
interface SelectCodeDiscountAction {
    type: typeof SELECT_CODE_DISCOUNT;
    payload: SelectCodeDiscountPayload;
}
interface SetPriceAction {
    type: typeof SET_PRICE;
    payload: SetPricePayload;
}
export type BookingState = 'ADDONS_SELECTED' | 'CLASS_SELECTED' | 'ROUTE_SELECTED' | 'SEAT_SELECTED';
export interface BookingProps {
    carbonOffset?: CarbonOffset;
    bookingState: BookingState;
    codeDiscount?: string;
    flexiType?: FlexiType;
    fromStationId?: number;
    lineGroupCode?: string;
    lineNumber?: number;
    passengers?: PassengerData[];
    percentualDiscountIds?: number[];
    price?: number;
    discountAmount?: number;
    priceSource?: string;
    routeId?: RouteId;
    seatClass?: SeatClass;
    sections?: SectionWithSeats[];
    selectedAddons?: SelectedAddon[];
    tariffs?: Tariff[];
    toStationId?: number;
    type?: TicketType;
}
export interface Booking {
    back: BookingProps | null;
    connection: Partial<ConnectionPayload>;
    isReturn: boolean;
    there: BookingProps | null;
}
export interface BookingReducerProps {
    booking: Booking | null;
    fav: ConnectionLocations[];
}
export type BookingActions = ClearBookingAction | ReplaceTariffsAction | SaveConnectionAction | SelectAddonsAction | SelectClassAction | SelectCodeDiscountAction | SelectPercentualDiscountAction | SelectRouteAction | SelectSeatsAction | SetPriceAction | UpsellAddonsAction;
export {};
