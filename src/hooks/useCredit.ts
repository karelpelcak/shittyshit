import { useEffect } from 'react';
import type { GenericAbortSignal } from 'axios';
import { useContextSelector } from 'use-context-selector';
import { ResponseStateContext } from '../store/responseState/reducer';
import { ResponseStateCategory } from '../store/responseState/types';
import { StoreContext } from '../store/rootReducer';
import { useManualApi } from './useManualApi';
import {
  PassengerFieldsFromApi,
  PassengerFieldsToSend,
} from './usePassengersData';
import { TicketTypeId } from './usePayment';
import useSetResponseState from './useSetResponseState';
import { Tickets } from './useUserTickets';
import { basketItemsToTicketTypes, gtmPush } from './utils';

/**
 * Adding user credit
 */
const useCredit = (
  unpaidTickets: Tickets,
) => {
  const user = useContextSelector(StoreContext, c => c.state.user);
  const currency = useContextSelector(StoreContext, c => c.state.user.currency);
  const setState = useSetResponseState(
    ResponseStateCategory.credit,
  );
  const categoryState = useContextSelector(
    ResponseStateContext,
    c => c.state[ResponseStateCategory.credit],
  );

  const [{ error, loading }, fetchAddCredit] = useManualApi<{
    payRedirectUrl: string;
  }>({
    url: '/payments/credit/add',
    method: 'POST',
  });

  const addCredit = async (
    amount: number,
    rememberCard: boolean,
    chargeTickets = false,
    tickets: TicketTypeId[] | undefined = undefined,
    fields: Partial<Record<PassengerFieldsToSend, string>> = {},
    signal?: GenericAbortSignal,
  ) => {
    if (user.user) {
      const ticketsCorrelation = chargeTickets
        ? (tickets ? tickets : basketItemsToTicketTypes(unpaidTickets))
          .map((t) => `${t.type}=${t.id}`)
          .join('&')
        : null;

      try {
        const payload = {
          amount: currency === 'EUR' ? parseFloat(amount.toFixed(1)) : amount,
          currency,
          paymentMethodCode: user.paymentMethodCode,
          correlationId: `credit${ticketsCorrelation ? `&${ticketsCorrelation}` : ''
          }`,
          formFields: [
            {
              fieldType: PassengerFieldsFromApi.email,
              fieldValue: fields?.email || user.user.email,
            },
            fields.firstName && {
              fieldType: PassengerFieldsFromApi.firstName,
              fieldValue: fields.firstName,
            },
            fields.surname && {
              fieldType: PassengerFieldsFromApi.surname,
              fieldValue: fields.surname,
            }, fields.customerName && {
              fieldType: PassengerFieldsFromApi.customerName,
              fieldValue: fields.customerName,
            }, fields.customerAddress && {
              fieldType: PassengerFieldsFromApi.customerAddress,
              fieldValue: fields.customerAddress,
            },
          ].filter(Boolean),
          rememberCard,
        };

        gtmPush({ event: 'ADD_CREDIT', ADD_CREDIT: payload });

        const { data } = await fetchAddCredit({ data: payload, signal });

        return data.payRedirectUrl;
      } catch (e) { }
    }
  };

  useEffect(() => {
    setState(error?.response?.data?.message, loading);
  }, [error, loading]);

  return { addCredit, ...categoryState };
};

export default useCredit;
