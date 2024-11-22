import { useEffect, useMemo } from 'react';
import { useContextSelector } from 'use-context-selector';
import { BookingContext } from '../store/booking/reducer';
import { ResponseStateCategory } from '../store/responseState/types';
import { Tariff, TicketType } from './types';
import { useManualApi } from './useManualApi';
import useSetResponseState from './useSetResponseState';

export enum PassengerFieldsFromApi {
  email = 'EMAIL',
  firstName = 'FIRST_NAME',
  surname = 'SURNAME',
  phone = 'PHONE',
  customerName = 'CUSTOMER_NAME',
  customerAddress = 'CUSTOMER_ADDRESS',
  dateOfBirth = 'BIRTHDAY',
}

export enum PassengerFieldsToSend {
  email = 'email',
  firstName = 'firstName',
  phone = 'phone',
  surname = 'surname',
  customerName = 'customerName',
  customerAddress = 'customerAddress',
  dateOfBirth = 'dateOfBirth',
}

export const mapPassengerData: {
  [key in PassengerFieldsFromApi]: PassengerFieldsToSend;
} = {
  CUSTOMER_ADDRESS: PassengerFieldsToSend.customerAddress,
  CUSTOMER_NAME: PassengerFieldsToSend.customerName,
  EMAIL: PassengerFieldsToSend.email,
  FIRST_NAME: PassengerFieldsToSend.firstName,
  PHONE: PassengerFieldsToSend.phone,
  SURNAME: PassengerFieldsToSend.surname,
  BIRTHDAY: PassengerFieldsToSend.dateOfBirth,
};

export interface ContactData {
  email: true;
  phone: boolean;
}

export interface PassengerField {
  name: PassengerFieldsToSend;
  value: string;
  error?: string;
}

export interface Passengers {
  tariff: Tariff;
  fields: Record<PassengerFieldsToSend, string>;
}

export interface PersonalDataPassengers {
  tariff?: Tariff;
  fields: PassengerField[];
}

export interface PersonalData {
  from: string;
  to: string;
  passengers: PersonalDataPassengers[];
}

export interface PassengersData {
  contactData: ContactData;
  personalData: PersonalData;
}

export interface PassengersApiData {
  firstPassengerData: PassengerFieldsFromApi[];
  otherPassengersData: PassengerFieldsFromApi[];
}

const typesToIgnore: TicketType[] = ['RJ_TIME', 'FLEXI'];

const usePassengersData = () => {
  const connection = useContextSelector(BookingContext, c => c.state.booking?.connection);
  const bookingThere = useContextSelector(BookingContext, c => c.state.booking?.there);
  const bookingBack = useContextSelector(BookingContext, c => c.state.booking?.back);
  const setState = useSetResponseState(
    ResponseStateCategory.passengersData,
  );
  const [
    { data: thereData, loading: thereLoading, error: thereError },
    fetchThere,
  ] = useManualApi<PassengersApiData>({});
  const [
    { data: backData, loading: backLoading, error: backError },
    fetchBack,
  ] = useManualApi<PassengersApiData>({});

  const loading = thereLoading || backLoading;
  const error = thereError || backError;

  const data = useMemo(() => {
    if (!thereData || (bookingBack?.routeId && !backData) || !connection) {
      return {
        contactData: { email: true } as ContactData,
        personalData: {
          from: connection?.fromLocationName,
          passengers: [],
          to: connection?.toLocationName,
        } as PersonalData,
      };
    }
    const morePreciseData = !backData ||
      thereData.otherPassengersData.length > backData.otherPassengersData.length ?
      thereData :
      backData;

    const contactData: ContactData = {
      email: true,
      phone: morePreciseData.firstPassengerData.some((pd) =>
        pd.includes(PassengerFieldsFromApi.phone),
      ),
    };

    const personalData: PersonalData = {
      from: connection.fromLocationName!,
      to: connection.toLocationName!,
      passengers: Array.from({ length: (bookingThere || bookingBack)?.tariffs?.length ?? 1 })
        .map((_, i) => ({
          fields: (i
            ? morePreciseData.otherPassengersData
            : morePreciseData.firstPassengerData.filter(
              (p) => !['EMAIL', 'PHONE'].includes(p),
            )
          ).map((passData) => ({
            name: mapPassengerData[passData],
            value: '',
          })),
          tariff: (bookingThere || bookingBack)?.tariffs?.[i],
        })),
    };

    return { contactData, personalData };
  }, [thereData, backData]);

  useEffect(() => {
    setState(error?.response?.data?.message, loading);
  }, [loading, error]);

  useEffect(() => {
    if (!bookingBack?.routeId || !bookingBack.type || typesToIgnore.includes(bookingBack.type)) {
      return;
    }
    const abortController = new AbortController();
    const signal = abortController.signal;

    if (bookingBack?.type === 'RJ_SRO') {
      fetchBack({
        params: {
          departureDate: new Date(),
          fromStationId: bookingBack?.fromStationId,
          numberOfPassenger: bookingBack?.tariffs?.length,
          routeId: bookingBack?.routeId,
          seatClass: 1,
          toStationId: bookingBack?.toStationId,
        },
        signal,
        url: `/routes/${bookingBack?.routeId}/passengersData/RJ_SRO`,
      });
    } else {
      fetchBack({
        data: {
          priceSource: bookingBack?.priceSource,
          seatClass: bookingBack?.seatClass,
          sections: (bookingBack?.sections || []).map(
            ({ selectedSeats, ...section }) => section,
          ),
          tariffs: bookingBack?.tariffs,
        },
        method: 'POST',
        signal,
        url: `/routes/${bookingBack?.routeId}/passengersData`,
      });
    }

    return () => {
      abortController.abort();
    };
  }, [bookingBack?.routeId]);

  useEffect(() => {
    if (!bookingThere?.routeId || !bookingThere.type || typesToIgnore.includes(bookingThere.type)) {
      return;
    }

    const abortController = new AbortController();
    const signal = abortController.signal;

    if (bookingThere?.type === 'RJ_SRO') {
      fetchThere({
        params: {
          departureDate: new Date(),
          fromStationId: bookingThere?.fromStationId,
          numberOfPassenger: bookingThere?.tariffs?.length,
          routeId: bookingThere?.routeId,
          seatClass: 1,
          toStationId: bookingThere?.toStationId,
        },
        signal,
        url: `/routes/${bookingThere?.routeId}/passengersData/RJ_SRO`,
      });
    } else {
      fetchThere({
        data: {
          priceSource: bookingThere?.priceSource,
          seatClass: bookingThere?.seatClass,
          sections: (bookingThere?.sections || []).map(
            ({ selectedSeats, ...section }) => section,
          ),
          tariffs: bookingThere?.tariffs,
        },
        method: 'POST',
        signal,
        url: `/routes/${bookingThere?.routeId}/passengersData`,
      });
    }

    return () => {
      abortController.abort();
    };
  }, [bookingThere?.routeId]);

  return {
    data,
    error: error?.response?.data.message,
    loading,
  };
};

export default usePassengersData;
