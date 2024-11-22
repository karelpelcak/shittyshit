import type { GenericAbortSignal } from 'axios';
import { Currency, DateString, FlexiType, RouteId, SeatClass, Tariff, TicketState, TicketType } from './types';
import { TicketAddon } from './useAddons';
import { CarbonOffset, Section, TransfersInfo } from './useConnectionRoute';
import { Passenger } from './useCreateTickets';
import { SectionCommons } from './useSeats';
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
    tariff: {
        value: Tariff | null;
    };
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
    passengersInfo: {
        passengers: Passenger[];
    };
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
    carbonOffset: CarbonOffset | null;
    conditions: null | {
        descriptions: TicketDescriptions;
        code: string;
    };
    customerNotifications: string[] | null;
    expirateAt: null | {
        days: number;
        hours: number;
        minutes: number;
    };
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
export type TicketsResponse = SeatTicket[] | SroTicket[] | {
    tickets: TimeTicket[];
};
export declare const emptyTickets: Tickets;
export declare const emptyOffsets: Record<FetchableTicketType, number>;
export declare const defaultOptions: Record<TicketState, UserTicketsOptions>;
declare const useUserTickets: (state: TicketState, autoFetch?: boolean, options?: Partial<UserTicketsOptions>) => {
    error: {
        message?: string | undefined;
        errorFields?: import("../store/responseState/types").ErrorFields[] | undefined;
    } | undefined;
    fetchMore: (type: FetchableTicketType, signal?: GenericAbortSignal) => Promise<void>;
    fetchTickets: (signal?: GenericAbortSignal, noLimitReset?: boolean) => Promise<boolean>;
    fetchedCount: number;
    loading: boolean;
    loadingMore: boolean;
    shouldFetchMore: {
        RJ_SEAT: boolean;
        RJ_SRO: boolean;
        RJ_TIME: boolean;
    } | {
        RJ_SEAT?: undefined;
        RJ_SRO?: undefined;
        RJ_TIME?: undefined;
    };
    tickets: Tickets | undefined;
    totalCount: number;
    totalPrice: number;
};
export default useUserTickets;
