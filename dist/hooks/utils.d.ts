import { SectionWithSeats } from '../store/booking/types';
import { SeatClass, SelectedSeat } from './types';
import { PriceClass, Section } from './useConnectionRoute';
import { TicketTypeId } from './usePayment';
import { Tickets } from './useUserTickets';
export declare const basketItemsToTicketTypes: (tickets: Tickets) => TicketTypeId[];
export declare const createTxToken: () => string;
export declare const mapFieldToUser: Readonly<{
    EMAIL: "email";
    FIRST_NAME: "firstName";
    SURNAME: "surname";
}>;
export declare const couchetteClasses: `${SeatClass}`[];
export declare const getMoreExpensiveClass: (baseClass: SeatClass, priceClasses: PriceClass[]) => PriceClass | null;
export declare const gtmPush: (payload: {
    [key: string]: any;
    event: string;
}) => void;
export declare const getAffiliateCode: () => string | undefined;
export declare const mapFromToSections: (depArrSections: Section[]) => SectionWithSeats[];
export declare const r8Stations: number[];
export declare const r23Stations: number[];
export declare const isRegional: (fromStationId: number, toStationId: number) => boolean;
/**
 * Soft booking can book other seat than selected. We need to inform user about it
 */
export declare const getNewSeats: (reqSeats: SelectedSeat[], respSeats: SelectedSeat[]) => SelectedSeat[];
export declare const getAddonTranslationKey: (addonCode: string, prependAll?: boolean) => string;
export declare const unorderedArrayEqual: (arr1: string[], arr2: string[]) => boolean;
export declare const calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
export declare const getPriorityInArray: <Item>(arr: Item[], item: Item) => number;
