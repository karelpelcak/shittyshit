import { useEffect } from 'react';
import type { GenericAbortSignal } from 'axios';
import { useContextSelector } from 'use-context-selector';
import { ResponseStateContext } from '../store/responseState/reducer';
import { ResponseStateCategory } from '../store/responseState/types';
import {
  AddonsPassengersPayload,
  Currency,
  RouteSectionDepArr,
  SelectedSeat,
  TicketAddonState,
} from './types';
import { useManualApi } from './useManualApi';
import useSetResponseState from './useSetResponseState';

interface AddonCommons {
  addonId: number;
  currency: Currency;
  price: number;
}

export interface TicketAddon {
  id: number;
  name: string;
  shortDescription: string;
  description: string;
  iconUrl: string;
  infoUrl: string | null;
  infoUrlLabel: string | null;
  price: number;
  currency: Currency;
  conditions: Conditions;
  state: TicketAddonState;
}

export interface SelectedAddon extends AddonCommons {
  addonCode?: string;
  conditionsHash: string;
  count: number;
}

export interface VerifyAddonsPayload extends AddonsPassengersPayload {
  selectedAddons: SelectedAddon[];
}

export interface RouteSectionData extends RouteSectionDepArr {
  selectedSeats: SelectedSeat[];
}

export interface Addon extends AddonCommons {
  addonCode: string;
  conditions: Conditions;
  shortDescription: string;
  description: string;
  iconUrl: string;
  infoUrl: null | string;
  infoUrlLabel: null | string;
  maxCount: number;
  name: string;
}

export interface Conditions {
  descriptions: Descriptions;
  code: string;
}

export interface Descriptions {
  cancel: string;
  rebook: string;
  expiration: string;
}

const useAddons = () => {
  const setState = useSetResponseState(
    ResponseStateCategory.addons,
  );
  const categoryState = useContextSelector(
    ResponseStateContext,
    c => c.state[ResponseStateCategory.addons],
  );

  const [{ loading: addonsLoading, error: addonsError, data }, callAddons] =
    useManualApi<Addon[]>({ url: '/addons', method: 'POST' });

  const [
    { loading: verificationLoading, error: verificationError },
    callVerifyAddons,
  ] = useManualApi({ url: '/addons/verify', method: 'POST' });

  const [{ loading: putLoading, error: putError }, callPutAddons] =
    useManualApi({ url: '/addons', method: 'PUT' });

  const fetchAddons = async (payload: AddonsPassengersPayload, signal?: GenericAbortSignal) => {
    try {
      await callAddons({ data: payload, signal });

      return true;
    } catch {
      return false;
    }
  };

  const verifyAddons = async (payload: VerifyAddonsPayload, signal?: GenericAbortSignal) => {
    try {
      await callVerifyAddons({ data: payload, signal });
      return true;
    } catch {
      return false;
    }
  };

  const putAddons = async (
    ticketId: number,
    selectedAddons: SelectedAddon[],
    signal?: GenericAbortSignal,
  ) => {
    try {
      await callPutAddons({ data: { selectedAddons }, params: { ticketId }, signal });
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    setState(
      addonsError?.response?.data?.message ||
      verificationError?.response?.data?.message ||
      putError?.response?.data?.message,
      addonsLoading || verificationLoading || putLoading,
      addonsError?.response?.data?.errorFields ||
      verificationError?.response?.data?.errorFields ||
      putError?.response?.data?.errorFields,
    );
  }, [
    addonsError,
    addonsLoading,
    verificationError,
    verificationLoading,
    putError,
    putLoading,
  ]);

  return {
    fetchAddons,
    putAddons,
    verifyAddons,
    data: data?.filter((a) => a.maxCount).sort((a, b) => b.price - a.price),
    ...categoryState,
  };
};

export default useAddons;
