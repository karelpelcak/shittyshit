import { useEffect, useMemo } from 'react';
import type { GenericAbortSignal } from 'axios';
import { AxiosRequestConfig } from 'axios';
import { useContextSelector } from 'use-context-selector';
import { ResponseStateContext } from '../store/responseState/reducer';
import { ResponseStateCategory } from '../store/responseState/types';
import { StoreContext } from '../store/rootReducer';
import {
  DateString,
  PaymentMethod,
  PaymentType,
  TicketState,
  TicketType,
} from './types';
import { useHeadersActions } from './useHeaders';
import { useManualApi } from './useManualApi';
import {
  PassengerFieldsFromApi,
  PassengerFieldsToSend,
} from './usePassengersData';
import useSetResponseState from './useSetResponseState';
import { useUserActions } from './useUser';
import { emptyTickets, Tickets } from './useUserTickets';
import { basketItemsToTicketTypes, createTxToken, gtmPush } from './utils';

export interface TicketTypeId {
  id: number;
  type: TicketType;
}

export interface Payment {
  paymentMethodCode: PaymentMethod;
  paymentType: PaymentType | null;
  rememberCardEnabled: boolean;
  active: boolean;
  description: string;
  deadline: DateString | null;
  deadlineAt: number | null;
}

export interface PaymentForm {
  fieldName: string;
  fieldType: PassengerFieldsFromApi;
}

export interface PayResponse {
  payRedirectUrl: string;
  regiojetRedirectUrl: string;
}

export interface AddGiftPayload {
  certificate: string;
  email: string;
}

export type BuyTicketsType = 'credit' | 'payment';

export interface BuyTicketsResponse {
  type: BuyTicketsType;
  url: string | null;
}

const API_CONFIG: AxiosRequestConfig = {
  headers: { 'Content-Type': 'application/1.2.0+json' },
  method: 'POST' as const,
};

const usePayment = (
  tickets: Tickets = emptyTickets,
  credit = false,
  ticketState: TicketState = 'UNPAID',
) => {
  const { authorize } = useHeadersActions();
  const { setPaymentCode } = useUserActions();
  const { user, paymentMethodCode } = useContextSelector(
    StoreContext,
    (c) => c.state.user,
  );
  const setState = useSetResponseState(ResponseStateCategory.payment);
  const categoryState = useContextSelector(
    ResponseStateContext,
    (c) => c.state[ResponseStateCategory.payment],
  );

  const ticketIds = basketItemsToTicketTypes(
    ticketState === 'UNPAID'
      ? tickets
      : {
          RJ_SEAT: tickets.RJ_SEAT.filter((t) => t.unpaid),
          RJ_SRO: [],
          RJ_TIME: [],
        },
  );

  const [
    {
      data: paymentMethods,
      error: paymentMethodsError,
      loading: paymentMethodsLoading,
    },
    fetchPaymentMethods,
  ] = useManualApi<Payment[]>({
    headers: { 'Content-Type': 'application/1.1.0+json' },
    method: 'POST',
    url: '/payments/methods',
  });

  const [
    { data: paymentForm, error: paymentFormError, loading: paymentFormLoading },
    fetchPaymentForm,
  ] = useManualApi<PaymentForm[]>({ method: 'POST', url: '/payments/form' });

  const [{ error: payError, loading: payLoading }, fetchPay] =
    useManualApi<PayResponse>({
      url: '/payments/pay',
      ...API_CONFIG,
    });

  const [{ error: giftAddError, loading: giftAddLoading }, fetchGiftAdd] =
    useManualApi({
      url: '/payments/credit/giftCertificate/add',
      method: 'POST',
    });

  const [
    { error: chargeCreditError, loading: chargeCreditLoading },
    fetchChargeFromCredit,
  ] = useManualApi<PaymentForm[]>({
    url: '/payments/credit/charge',
    ...API_CONFIG,
  });

  const getPaymentMethods = async (
    ticketsTypeIds?: TicketTypeId[],
    signal?: GenericAbortSignal,
  ) => {
    try {
      await fetchPaymentMethods({
        data: { ticketIds: credit ? [] : ticketsTypeIds || ticketIds },
        signal,
      });
    } catch {}
  };

  const getPaymentForm = async (
    ticket?: TicketTypeId,
    manualPaymentMethodCode?: PaymentMethod,
    signal?: GenericAbortSignal,
  ) => {
    try {
      const { data } = await fetchPaymentForm({
        data: {
          paymentMethodCode: manualPaymentMethodCode || paymentMethodCode,
          ...(credit
            ? { tickets: [] }
            : { ticketIds: ticket ? [ticket] : ticketIds }),
        },
        headers: {
          ...(!credit ? { 'Content-Type': 'application/1.1.0+json' } : {}),
        },
        signal,
      });
      return data;
    } catch {}
  };

  const buyTickets = async (
    rememberCard = false,
    fields: Partial<Record<PassengerFieldsToSend, string>> = {},
    boughtTickets: TicketTypeId[] | undefined = ticketIds,
    fromCredit = false,
    signal?: GenericAbortSignal,
    useCreditChargeWithFormFields?: boolean
  ): Promise<BuyTicketsResponse | null> => {
    try {
      const headers = { ...API_CONFIG.headers, 'X-TxToken': createTxToken() };

      const { email = user?.email, ...restFields } = fields;

      const formFields = [
        { fieldType: PassengerFieldsFromApi.email, fieldValue: email },
        ...Object.entries(restFields)
          .filter(([, fieldValue]) => fieldValue)
          .map(([k, fieldValue]) => ({
            fieldType: PassengerFieldsFromApi[k as PassengerFieldsToSend],
            fieldValue,
          })),
      ];

      const correlationId = `tickets&${boughtTickets
        .map((t) => `${t.type}=${t.id}`)
        .join('&')}`;

      if (user && fromCredit) {
        await fetchChargeFromCredit({
          data: { tickets: boughtTickets, ...(formFields?.length && useCreditChargeWithFormFields ? {formFields} : {}) },
          headers,
          signal,
        });
        await authorize(signal);

        return { type: 'credit', url: correlationId };
      }

      const payload = {
        correlationId,
        formFields,
        paymentMethodCode,
        rememberCard,
        tickets: boughtTickets,
      };

      gtmPush({ event: 'PAY', PAY: payload });

      const { data } = await fetchPay({ data: payload, headers, signal });

      return { type: 'payment', url: data.payRedirectUrl };
    } catch {}

    return null;
  };

  const addCreditByGift = async (
    data: AddGiftPayload,
    signal?: GenericAbortSignal,
  ) => {
    try {
      await fetchGiftAdd({ data, signal });
      return true;
    } catch {
      return false;
    }
  };

  const filteredPaymentMethods = useMemo(
    () => paymentMethods?.filter((m) => m.active && m.paymentType),
    [paymentMethods],
  );

  const error =
    paymentMethodsError ||
    paymentFormError ||
    payError ||
    giftAddError ||
    chargeCreditError;

  const loading =
    paymentMethodsLoading ||
    paymentFormLoading ||
    payLoading ||
    giftAddLoading ||
    chargeCreditLoading;

  useEffect(() => {
    setState(error?.response?.data?.message, loading);
  }, [error, loading]);

  useEffect(() => {
    if (
      paymentMethodCode &&
      filteredPaymentMethods?.length &&
      !filteredPaymentMethods.some(
        (m) => m.paymentMethodCode === paymentMethodCode,
      )
    ) {
      setPaymentCode(null);
    }
  }, [filteredPaymentMethods]);

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;
    if (!credit && ticketIds?.length) {
      fetchPaymentMethods({ data: { ticketIds }, signal });
    } else if (credit) {
      fetchPaymentMethods({ data: { ticketIds: [] }, signal });
    }
    return () => {
      abortController.abort();
    };
  }, [tickets, credit]);

  return {
    addCreditByGift,
    buyTickets,
    getPaymentForm,
    getPaymentMethods,
    paymentForm,
    paymentFormLoading,
    paymentMethodsLoading,
    paymentMethods: filteredPaymentMethods,
    ticketsAvailable: !!ticketIds?.length,
    ...categoryState,
  };
};

export default usePayment;
