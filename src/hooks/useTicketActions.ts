import { useEffect, useState } from 'react';
import type { AxiosError, GenericAbortSignal } from 'axios';
import { useContextSelector } from 'use-context-selector';
import { ResponseStateContext } from '../store/responseState/reducer';
import { ResponseStateCategory } from '../store/responseState/types';
import { api } from './consts';
import { SelectedSeat, Tariff } from './types';
import { Passenger } from './useCreateTickets';
import { useHeadersActions } from './useHeaders';
import { useApi, useManualApi } from './useManualApi';
import { TicketTypeId } from './usePayment';
import useSetResponseState from './useSetResponseState';
import { createTxToken } from './utils';

interface OrderPlatformParams {
  email: string;
  phone: string;
}

export type PassengersToStorno = Pick<Passenger, 'id' | 'tariff'>;

const useTicketActions = ({ id, type }: TicketTypeId, ticketCode?: string) => {
  const { authorize } = useHeadersActions();
  const setState = useSetResponseState(ResponseStateCategory.ticketAction);
  const categoryState = useContextSelector(
    ResponseStateContext,
    (c) => c.state[ResponseStateCategory.ticketAction],
  );
  const [customLoading, setCustomLoading] = useState(false);
  const [customError, setCustomError] = useState<AxiosError<any>>();

  const [{ error: sendMailError, loading: sendMailLoading }, fetchSendMail] =
    useManualApi({ url: `/tickets/${type}/${id}/sendByEmail`, method: 'POST' });

  const [{ error: getPdfError, loading: getPdfLoading }, getPdf] = useManualApi(
    { url: `/tickets/${type}/${id}/pdf`, method: 'GET', responseType: 'blob' },
  );

  const [
    { error: wheelChairPlatformError, loading: wheelChairPlatformLoading },
    submitWheelChairPlatformOrder,
  ] = useManualApi({
    method: 'PUT',
    url: `/tickets/${id}/submitWheelChairPlatformOrder`,
  });

  const [{ error: getQrError, loading: getQrLoading }, getQr] = useManualApi({
    url: `/tickets${type === 'RJ_TIME' ? '/timeticket' : ''}/${id}/qrcode`,
    method: 'GET',
  });

  const [{ data: questionnaireUrls }] = (ticketCode ? useApi : useManualApi)<
  string[]
  >({
    url: `/tickets/${ticketCode}/questionnaireUrls`,
    method: 'GET',
  });

  const [
    { error: cancelSeatError, loading: cancelSeatLoading },
    fetchCancelSeatTicket,
  ] = useManualApi({
    url: `/tickets/${id}/cancel`,
    method: 'PUT',
  });

  const [
    { error: cancelTimeError, loading: cancelTimeLoading },
    fetchCancelTimeTicket,
  ] = useManualApi({
    url: `/tickets/timeticket/${id}`,
    method: 'DELETE',
  });

  const [
    { error: cancelSroError, loading: cancelSroLoading },
    fetchCancelSroTicket,
  ] = useManualApi({
    url: `/tickets/RJ_SRO/${id}`,
    method: 'DELETE',
  });

  const [
    { error: refetchSeatTicketError, loading: refetchSeatTicketLoading },
    refetchSeatTicket,
  ] = useManualApi({
    url: `/tickets/${id}`,
    method: 'GET',
    headers: {
      Accept: 'application/1.2.0+json',
    },
  });

  const qrText: string = [2, type, id].join(';');

  const sendByEmail = async (email: string, signal?: GenericAbortSignal) => {
    try {
      await fetchSendMail({ data: { email }, signal });
      return true;
    } catch (e) {
      return false;
    }
  };

  /**
   * @param ticketId
   * @param passengersIds
   * @param seatsForCancel
   * [
   * {sect[0].passenger[0].seats, sect[0].passenger[1].seats },
   * {sect[1].passenger[0].seats, sect[1].passenger[1].seats }
   * ]
   * @param refundToOriginalSource
   * For the first passenger we assign from seatsForCancel from the first routesection
   * the first selectedSeat,
   * from the second routesection we assign again the first selectedSeat.
   * For the second passenger we assign from the first routesection second selectedSeat,
   * from the second routesection we assign again the second selectedSeat and so on.
   */
  const partialCancel = async (
    ticketId: number,
    passengers: PassengersToStorno[],
    seatsForCancel: SelectedSeat[][],
    refundToOriginalSource = false,
    signal?: GenericAbortSignal,
  ) => {
    try {
      setCustomLoading(true);
      let success = true;

      const sendRequest = async (
        passenger: PassengersToStorno,
        index: number,
      ): Promise<void> => {
        try {
          const data = seatsForCancel.map((seat) => seat[index]);
          const response = await api.delete(
            `/tickets/${ticketId}/passengers/${passenger.id}`,
            {
              data: { refundToOriginalSource, seats: data },
              signal,
            },
          );
          if (response.status < 200 || response.status >= 300) {
            success = false;
          }
        } catch (e) {
          success = false;
        }
      };

      const disabledPassengers = passengers.filter(
        (pass) => pass.tariff === Tariff.DisabledAttendance,
      );
      const otherPassengers = passengers.filter(
        (pass) => pass.tariff !== Tariff.DisabledAttendance,
      );
      // Send requests for passengers with DisabledAttendance tariff first
      await Promise.all(
        disabledPassengers.map((passenger, index) =>
          sendRequest(passenger, index),
        ),
      );
      // Then send requests for the rest of the passengers
      await Promise.all(
        otherPassengers.map((passenger, index) =>
          sendRequest(passenger, index + disabledPassengers.length),
        ),
      );
      return { status: success };
    } catch (e) {
      setCustomError(e as AxiosError<any>);
      return { status: false };
    } finally {
      setCustomLoading(false);
    }
  };

  /**
   * @param controlHash Required for seat reservation
   * @param refundToOriginalSource should refund to credit or bank account
   */
  const cancel = async (
    controlHash?: string,
    refundToOriginalSource = false,
    signal?: GenericAbortSignal,
  ) => {
    try {
      const data = { controlHash, refundToOriginalSource };
      let statusCode = 500;

      switch (type) {
        case 'RJ_SEAT': {
          const { data: rjSeatData, status: refetchStatus } = await refetchSeatTicket({ signal });
          const rjSeatDataToSend = refetchStatus >= 200 && refetchStatus < 300
            ? {
              controlHash: rjSeatData.conditions.code,
              refundToOriginalSource,
            }
            : data;

          const { status } = await fetchCancelSeatTicket({
            data: rjSeatDataToSend,
            signal,
          });
          statusCode = status;
          break;
        }
        case 'RJ_TIME': {
          const { status } = await fetchCancelTimeTicket({ signal });
          statusCode = status;
          break;
        }
        case 'RJ_SRO': {
          const { status } = await fetchCancelSroTicket({
            data,
            headers: { 'X-TxToken': createTxToken() },
            signal,
          });
          statusCode = status;
          break;
        }
      }
      await authorize(signal);

      return { status: statusCode >= 200 && statusCode < 300 };
    } catch (e) {
    }
  };

  const getAppleWalletFile = async (
    sectionId: number,
    signal?: GenericAbortSignal,
  ) => {
    setCustomLoading(true);
    try {
      const { data } = await api.get(
        `/apple-wallet/${ticketCode}/${sectionId}`,
        {
          headers: { Accept: 'application/vnd.apple.pkpass' },
          responseType: 'blob',
          signal,
        },
      );
      return data;
    } catch (e) {
      setCustomError(e as AxiosError<any>);
    } finally {
      setCustomLoading(false);
    }
  };

  const orderWheelChairPlatform = async (
    data: OrderPlatformParams,
    signal?: GenericAbortSignal,
  ) => {
    try {
      submitWheelChairPlatformOrder({ data, signal });
      return true;
    } catch (e) {
      return false;
    }
  };

  const error =
    sendMailError ||
    getPdfError ||
    getQrError ||
    wheelChairPlatformError ||
    cancelSeatError ||
    cancelTimeError ||
    cancelSroError ||
    customError ||
    refetchSeatTicketError;

  const loading =
    sendMailLoading ||
    getPdfLoading ||
    getQrLoading ||
    wheelChairPlatformLoading ||
    cancelSeatLoading ||
    cancelTimeLoading ||
    cancelSroLoading ||
    customLoading ||
    refetchSeatTicketLoading;

  useEffect(() => {
    setState(error?.response?.data?.message, loading);
  }, [error, loading]);

  return {
    cancel,
    getAppleWalletFile,
    getPdf,
    getQr,
    orderWheelChairPlatform,
    partialCancel,
    qrText,
    questionnaireUrls,
    sendByEmail,
    ...categoryState,
  };
};

export default useTicketActions;
