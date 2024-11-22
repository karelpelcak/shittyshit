import type { GenericAbortSignal } from 'axios';
import { SelectedSeat } from './types';
import { Passenger } from './useCreateTickets';
import { TicketTypeId } from './usePayment';
interface OrderPlatformParams {
    email: string;
    phone: string;
}
export type PassengersToStorno = Pick<Passenger, 'id' | 'tariff'>;
declare const useTicketActions: ({ id, type }: TicketTypeId, ticketCode?: string) => {
    error?: {
        message?: string | undefined;
        errorFields?: import("../store/responseState/types").ErrorFields[] | undefined;
    } | undefined;
    loading: boolean;
    cancel: (controlHash?: string, refundToOriginalSource?: boolean, signal?: GenericAbortSignal) => Promise<{
        status: boolean;
    } | undefined>;
    getAppleWalletFile: (sectionId: number, signal?: GenericAbortSignal) => Promise<any>;
    getPdf: import("axios-hooks").RefetchFunction<any, any>;
    getQr: import("axios-hooks").RefetchFunction<any, any>;
    orderWheelChairPlatform: (data: OrderPlatformParams, signal?: GenericAbortSignal) => Promise<boolean>;
    partialCancel: (ticketId: number, passengers: PassengersToStorno[], seatsForCancel: SelectedSeat[][], refundToOriginalSource?: boolean, signal?: GenericAbortSignal) => Promise<{
        status: boolean;
    }>;
    qrText: string;
    questionnaireUrls: string[] | undefined;
    sendByEmail: (email: string, signal?: GenericAbortSignal) => Promise<boolean>;
};
export default useTicketActions;
