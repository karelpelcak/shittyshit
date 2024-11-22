import { useEffect } from 'react';
import { useContextSelector } from 'use-context-selector';
import { ResponseStateContext } from '../store/responseState/reducer';
import { ResponseStateCategory } from '../store/responseState/types';
import PersistContext from './PersistContext';
import { VehicleKey } from './types';
import useSetResponseState from './useSetResponseState';

export interface VehicleStandard {
  key: VehicleKey;
  name: string;
  shortDescription: string;
  description: string;
  imageUrl: string;
  supportImageUrl: string;
  galleryUrl: null | string;
}

type FormattedVehicleStandards = Record<VehicleKey, VehicleStandard>;

interface UseVehicleStandardsReturnType {
  data: FormattedVehicleStandards | undefined;
  error?: { message?: string };
  loading: boolean;
}

const useVehicleStandards = (): UseVehicleStandardsReturnType => {
  const setState = useSetResponseState(
    ResponseStateCategory.vehicleStandards,
  );
  const categoryState = useContextSelector(ResponseStateContext, (c) =>
    c.state[ResponseStateCategory.vehicleStandards],
  );
  const { error, loading } = useContextSelector(PersistContext, (c) =>
    c.vehicleStandardsResponse,
  );
  const data = useContextSelector(PersistContext, (c) =>
    c.vehicleStandards,
  );

  const formattedData = data?.reduce((
    acc: FormattedVehicleStandards,
    vehicle: VehicleStandard,
  ) => {
    acc[vehicle.key] = vehicle;

    return acc;
  }, {} as FormattedVehicleStandards);

  useEffect(() => {
    setState(error?.response?.data?.message, !!loading);
  }, [setState, error, loading]);

  return { data: formattedData, ...categoryState };
};

export default useVehicleStandards;
