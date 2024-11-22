import { useState } from 'react';
import { Axios, AxiosError, isAxiosError, type GenericAbortSignal } from 'axios';
import { useContextSelector } from 'use-context-selector';
import { ResponseStateContext } from '../store/responseState/reducer';
import { ResponseStateCategory } from '../store/responseState/types';
import { FAIL_MESSAGE, api, getErrorMessage } from './consts';
import { TicketType } from './types';
import { TicketTypeId } from './usePayment';
import useSetResponseState from './useSetResponseState';
import { Tickets } from './useUserTickets';
import { gtmPush } from './utils';

const typeToUrl = Object.freeze({
  FLEXI: '/',
  RJ_SEAT: '/tickets/',
  RJ_SRO: '/tickets/RJ_SRO/',
  RJ_TIME: '/tickets/timetickets/',
});

const useTickets = () => {
  const setState = useSetResponseState(
    ResponseStateCategory.ticket,
  );
  const categoryState = useContextSelector(
    ResponseStateContext,
    c => c.state[ResponseStateCategory.ticket],
  );
  const [tickets, setTickets] = useState<Tickets>();

  const fetchTickets = async (ticketTypes: TicketTypeId[], signal?: GenericAbortSignal) => {
    setState(undefined, true);

    if (!ticketTypes.length) {
      setTickets(undefined);
      setState(undefined, false);
      return true;
    }

    const ticketIndices: Record<TicketType, number[]> =
      { RJ_SEAT: [], RJ_TIME: [], RJ_SRO: [], FLEXI: [] };
    ticketTypes.forEach((ticketType, i) => ticketIndices[ticketType.type].push(i));

    try {
      const ticketResponses = await Promise.all(
        ticketTypes.map(({ id, type }) => api.get(typeToUrl[type] + id, {
          signal,
          headers: type === 'RJ_SEAT' ? { 'Accept': 'application/1.3.0+json' } : undefined,
        })),
      );

      const responses = ticketResponses.map((response) => response.data);

      const fetchedTickets: Tickets = {
        RJ_SEAT: responses.filter((_, i) => ticketIndices.RJ_SEAT.includes(i)),
        RJ_TIME: responses.filter((_, i) => ticketIndices.RJ_TIME.includes(i)),
        RJ_SRO: responses.filter((_, i) => ticketIndices.RJ_SRO.includes(i)),
      };

      gtmPush({ event: 'BOUGHT_TICKETS', BOUGHT_TICKETS: fetchedTickets });

      setTickets(fetchedTickets);
      setState(undefined, false);

      return true;
    } catch (e) {
      setState(
        isAxiosError(e) ?
          e.response?.data.message || getErrorMessage(e)
          : FAIL_MESSAGE, false);

      return false;
    }
  };

  return { fetchTickets, tickets, ...categoryState };
};

export default useTickets;
