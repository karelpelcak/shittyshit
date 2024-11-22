import type { GenericAbortSignal } from 'axios';
import { DateString, FlexiType, RouteId, RouteSectionFromTo, SeatClass, SelectedSeat, Tariff } from './types';
import { SelectedAddon } from './useAddons';
import { Passengers } from './usePassengersData';
import { TicketTypeId } from './usePayment';
import { TicketSection } from './useUserTickets';
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
export interface RegisteredTimeTicketCreateRequest extends TimeTicketCreateRequest {
    seatClass: SeatClass;
    type: FlexiType;
}
export interface UnregisteredTimeTicketCreateRequest extends TimeTicketCreateRequest {
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
    passengers: {
        email: string;
    }[];
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
    token: {
        token: string;
    };
}
/**
 * Reserving tickets and charging credit if there's enough credit in account
 */
declare const useCreateTickets: () => {
    error?: {
        message?: string | undefined;
        errorFields?: import("../store/responseState/types").ErrorFields[] | undefined;
    } | undefined;
    loading: boolean;
    createTickets: (email: string, passengers: Passengers[], phone?: string, chargeImmediately?: boolean, signal?: GenericAbortSignal) => Promise<{
        newSeats: SelectedSeat[];
        redirect: 'tickets' | 'checkout' | 'cart' | '';
        ticketTypeId?: TicketTypeId[];
    }>;
};
export default useCreateTickets;
