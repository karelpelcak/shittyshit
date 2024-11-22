import { useEffect } from 'react';
import { useContextSelector } from 'use-context-selector';
import { ResponseStateContext } from '../store/responseState/reducer';
import { ResponseStateCategory } from '../store/responseState/types';
import PersistContext from './PersistContext';
import { Tariff } from './types';
import useSetResponseState from './useSetResponseState';

export interface TariffResponse {
  key: Tariff;
  value: string;
}

const useTariffs = () => {
  const setState = useSetResponseState(
    ResponseStateCategory.tariffs,
  );
  const categoryState = useContextSelector(
    ResponseStateContext,
    c => c.state[ResponseStateCategory.tariffs],
  );

  const { error, loading } = useContextSelector(PersistContext, c => c.tariffsResponse);
  const data = useContextSelector(PersistContext, c => c.tariffs);

  useEffect(() => {
    setState(error?.response?.data?.message, !!loading);
  }, [error, loading]);

  return { data, ...categoryState };
};

export default useTariffs;
