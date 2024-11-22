import { useEffect } from 'react';
import { useContextSelector } from 'use-context-selector';
import { ResponseStateContext } from '../store/responseState/reducer';
import { ResponseStateCategory } from '../store/responseState/types';
import PersistContext from './PersistContext';
import { SeatClass } from './types';
import useSetResponseState from './useSetResponseState';

export interface SeatClassData {
  vehicleClass: '1' | '2' | 'undefined';
  key: SeatClass;
  title: string;
  shortDescription: string;
  description: string;
  imageUrl: null | string;
  galleryUrl: null | string;
}

type FormattedSeatClasses = Record<SeatClass, SeatClassData>;

const useSeatClasses = () => {
  const setState = useSetResponseState(
    ResponseStateCategory.seatClasses,
  );
  const categoryState = useContextSelector(ResponseStateContext, c =>
    c.state[ResponseStateCategory.seatClasses],
  );

  const { error, loading } = useContextSelector(PersistContext, c =>
    c.seatClassesResponse,
  );
  const data = useContextSelector(PersistContext, c =>
    c.seatClasses,
  );

  const formattedData = data?.reduce((
    acc: FormattedSeatClasses,
    seatClass: SeatClassData,
  ) => {
    acc[seatClass.key] = seatClass;

    return acc;
  }, {} as FormattedSeatClasses);

  useEffect(() => {
    setState(error?.response?.data.message, !!loading);
  }, [setState, error, loading]);

  return { data: formattedData, ...categoryState };
};

export default useSeatClasses;
