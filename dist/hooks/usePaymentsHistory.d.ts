import type { GenericAbortSignal } from 'axios';
import { Currency, DateString, TicketType } from './types';
type PaymentType = 'DIRECT' | 'CREDIT';
export declare enum Method {
    ACCOUNT = "ACCOUNT",
    BANK_TRANSFER = "BANK_TRANSFER"
}
export interface PaymentData {
    amount: number;
    currency: Currency;
    dateTransaction: DateString;
    description: string;
    isInvoiceAvailable: boolean;
    isReceiptAvailable: boolean;
    method: Method;
    paymentId: number;
    ticketId: number | null;
    ticketType: TicketType | null;
}
export interface PaymentsHistoryQuery {
    dateFrom: DateString;
    dateTo: DateString;
    sortDirection: 'ASC' | 'DESC';
    type: PaymentType[];
}
export type InvoiceType = 'invoice' | 'receipt';
declare const usePaymentsHistory: () => {
    data: PaymentData[] | undefined;
    error: import("axios").AxiosError<any, any> | null;
    fetchInvoice: (paymentId: number, routeType?: InvoiceType, signal?: GenericAbortSignal) => Promise<any>;
    fetchInvoices: (paymentIds: number[], signal?: GenericAbortSignal) => Promise<any>;
    fetchPaymentsHistory: (params: PaymentsHistoryQuery, page?: number, signal?: GenericAbortSignal) => Promise<void>;
    loading: boolean;
    pages: number;
};
export default usePaymentsHistory;
