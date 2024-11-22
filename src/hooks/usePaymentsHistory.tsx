import type { GenericAbortSignal } from 'axios';
import { api } from './consts';
import { Currency, DateString, TicketType } from './types';
import { useManualApi } from './useManualApi';

type PaymentType = 'DIRECT' | 'CREDIT';

export enum Method {
  ACCOUNT = 'ACCOUNT',
  BANK_TRANSFER = 'BANK_TRANSFER',
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

const LINES_PER_PAGE = 10;

const usePaymentsHistory = () => {
  const [{ data, loading, error, response }, fetchPayments] = useManualApi<
  PaymentData[]
  >({
    url: '/payments',
    method: 'GET',
    headers: { Accept: 'application/1.1.0+json' },
  });
  const pagination = +(response?.headers['x-pagination-total'] || 0);

  const pages = Math.floor(pagination / LINES_PER_PAGE) + 1;

  const fetchPaymentsHistory = async (
    params: PaymentsHistoryQuery,
    page = 0,
    signal?: GenericAbortSignal,
  ) => {
    try {
      await fetchPayments({
        params: {
          ...params,
          limit: LINES_PER_PAGE,
          offset: page * LINES_PER_PAGE,
        },
        signal,
      });
    } catch (e) {}
  };

  const fetchInvoice = async (
    paymentId: number,
    routeType?: InvoiceType,
    signal?: GenericAbortSignal,
  ) => {
    try {
      const matchedPayment = data?.find((p) => p.paymentId === paymentId);

      const route =
        routeType || (matchedPayment?.ticketId ? 'invoice' : 'receipt');
      const url = `/payments/${paymentId}/print/${route}`;

      const { data: invoiceData } = await api.get(url, { signal });
      return invoiceData;
    } catch (e) {}
  };

  const fetchInvoices = async (
    paymentIds: number[],
    signal?: GenericAbortSignal,
  ) => {
    try {
      const { data: invoicesData } = await api.post(
        '/payments/print/invoice',
        { invoices: paymentIds },
        { signal },
      );
      return invoicesData;
    } catch (e) { }
  };

  return {
    data,
    error,
    fetchInvoice,
    fetchInvoices,
    fetchPaymentsHistory,
    loading,
    pages,
  };
};

export default usePaymentsHistory;