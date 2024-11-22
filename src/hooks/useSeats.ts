import { useEffect } from 'react';
import type { GenericAbortSignal } from 'axios';
import { useContextSelector } from 'use-context-selector';
import { ResponseStateContext } from '../store/responseState/reducer';
import { ResponseStateCategory } from '../store/responseState/types';
import {
  SeatClass,
  SeatSectionBasic,
  SelectedSeat,
  Tariff,
  VehicleType,
  VehicleKey,
} from './types';
import { Service } from './useConnectionRoute';
import { useManualApi } from './useManualApi';
import useSetResponseState from './useSetResponseState';

export interface PreselectedSeat extends SelectedSeat {
  vehicleDeckNumber: number;
}

export interface SectionCommons {
  fixedSeatReservation: boolean;
  selectedSeats: SelectedSeat[];
  vehicles: Vehicle[];
}

export interface SeatSection extends SectionCommons {
  selectedSeats: PreselectedSeat[];
  sectionId: number;
}

export interface VehicleService {
  code: string;
  name: string;
  imageCode: Service;
}

export interface VehicleSeatClass {
  name: SeatClass;
  services: VehicleService[];
}

export interface Vehicle {
  id: number;
  code: string | null;
  type: VehicleType;
  number: number;
  seatClasses: VehicleSeatClass[];
  standard: VehicleKey;
  notifications: string[];
  cateringEnabled: boolean;
  decks: Deck[];
}

export interface Deck {
  number: number;
  name: string;
  layoutURL: string;
  freeSeats: Seat[];
  occupiedSeats: Seat[];
}

export interface Seat {
  index: number;
  seatClass: SeatClass;
  seatConstraint: null | string;
  seatNotes: string[];
}

export interface SeatsPayload {
  seatClass: SeatClass;
  sections: SeatSectionBasic[];
  tariffs: Tariff[];
}

type Options = {
  ignoreGlobalState?: boolean;
};

const useSeats = (options?: Options) => {
  const [{ data, error, loading }, fetch] = useManualApi<SeatSection[]>({
    method: 'POST',
  });
  const setState = useSetResponseState(ResponseStateCategory.seats);
  const categoryState = useContextSelector(ResponseStateContext, (c) =>
    options?.ignoreGlobalState
      ? undefined
      : c.state[ResponseStateCategory.seats],
  );

  const fetchSeats = async (
    reqData: SeatsPayload,
    signal?: GenericAbortSignal,
  ) => {
    try {
      await fetch({
        url: '/routes/freeSeats',
        data: reqData,
        headers: { 'Content-Type': 'application/json' },
        signal,
      });

      return true;
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    if (options?.ignoreGlobalState) {
      return;
    }
    setState(error?.response?.data?.message, loading);
  }, [options?.ignoreGlobalState, error, loading]);

  return {
    data,
    fetchSeats,
    error,
    loading,
    ...categoryState,
  };
};

export default useSeats;
