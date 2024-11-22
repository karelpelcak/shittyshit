import React, { Dispatch, FC, ReactNode, useEffect, useMemo } from 'react';
import equal from 'fast-deep-equal';
import type { Draft } from 'immer';
import { createContext } from 'use-context-selector';
import { useImmerReducer } from 'use-immer';
import { PersistConfig } from '../../hooks';
import {
  ResponseStateReducerProps,
  ResponseStateActions,
  ResponseStateCategory,
} from './types';

const responseStateInitialState: ResponseStateReducerProps = {
  [ResponseStateCategory.addons]: { loading: false },
  [ResponseStateCategory.connection]: { loading: false },
  [ResponseStateCategory.connectionRoute]: { loading: false },
  [ResponseStateCategory.createTickets]: { loading: false },
  [ResponseStateCategory.credit]: { loading: false },
  [ResponseStateCategory.locations]: { loading: true },
  [ResponseStateCategory.passengersData]: { loading: false },
  [ResponseStateCategory.payment]: { loading: false },
  [ResponseStateCategory.seats]: { loading: false },
  [ResponseStateCategory.ticket]: { loading: false },
  [ResponseStateCategory.tariffs]: { loading: true },
  [ResponseStateCategory.ticketAction]: { loading: false },
  [ResponseStateCategory.userTickets]: { loading: false },
  [ResponseStateCategory.useTicketsType]: { loading: false },
  [ResponseStateCategory.user]: { loading: false },
  [ResponseStateCategory.ticketReview]: { loading: false },
  [ResponseStateCategory.vehicleStandards]: { loading: false },
  [ResponseStateCategory.seatClasses]: { loading: false },
};

interface ResponseStateProviderType {
  children?: ReactNode;
  persistConfig?: PersistConfig;
  persist?: boolean;
}

interface ResponseStateType {
  state: ResponseStateReducerProps;
  dispatch: Dispatch<ResponseStateActions>;
}

export const ResponseStateContext = createContext({} as ResponseStateType);

const responseStateReducer =
  (draft: Draft<ResponseStateReducerProps>, action: ResponseStateActions) => {
    switch (action.type) {
      case 'SET_RESPONSE_STATE': {
        const { error, loading, type } = action.payload;

        if (type !== undefined) {
          const newState = { error, loading };
          if (!equal(draft[type], newState)) {
            draft[type] = newState;
          }
        } else {
          Object.keys(draft).forEach((s) => {
            const newState = { error, loading };
            if (!equal(draft[+s as ResponseStateCategory], newState)) {
              draft[+s as ResponseStateCategory] = newState;
            }
          });
        }
        break;
      }
    }
  };

const ResponseStateProvider: FC<ResponseStateProviderType> =
  ({ children, persistConfig, persist }) => {
    const [state, dispatch] = useImmerReducer(
      responseStateReducer,
      (persist && persistConfig?.getItem().responseState) || responseStateInitialState,
    );

    useEffect(() => {
      if (!persist) {
        return;
      }
      persistConfig?.setItem({ responseState: state });
    }, [state]);

    const value = useMemo(() => ({ dispatch, state }), [dispatch, state]);

    return <ResponseStateContext.Provider value={value}>{children}</ResponseStateContext.Provider>;
  };

export default ResponseStateProvider;
