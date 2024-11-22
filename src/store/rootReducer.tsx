import React, {
  Dispatch,
  PropsWithChildren,
  useEffect,
  useState,
} from 'react';
import { createContext } from 'use-context-selector';
import { useImmerReducer } from 'use-immer';
import { PersistConfig } from '../hooks';
import { api, reqInterceptor, resInterceptor } from '../hooks/consts';
import { Currency, Language } from '../hooks/types';
import BookingProvider from './booking/reducer';
import { BookingReducerProps } from './booking/types';
import ResponseStateProvider from './responseState/reducer';
import { ResponseStateReducerProps } from './responseState/types';
import upsellReducer, { upsellInitialState } from './upsell/reducer';
import { UpsellActions, UpsellReducerProps } from './upsell/types';
import userReducer, {
  generateUserInitialState,
  userInitialState,
} from './user/reducer';
import { UserActions, UserReducerProps } from './user/types';

export interface RootReducerProps {
  user: UserReducerProps;
  upsell: UpsellReducerProps;
}

export interface PersistedState extends RootReducerProps {
  bookings?: BookingReducerProps;
  responseState?: ResponseStateReducerProps;
}

const initialStoreContent: {
  state: RootReducerProps;
  interceptorsMounted: boolean;
  dispatch: {
    upsellDispatch: Dispatch<UpsellActions>;
    userDispatch: Dispatch<UserActions>;
  };
} = {
  dispatch: {
    upsellDispatch: () => { },
    userDispatch: () => { },
  },
  interceptorsMounted: false,
  state: {
    upsell: upsellInitialState,
    user: userInitialState,
  },
};

export const StoreContext = createContext(initialStoreContent);

export interface StoreProviderProps {
  lang?: Language;
  currency: Currency;
  transportHash?: string;
  persistConfig?: PersistConfig;
  persist?: { booking?: boolean; responseState?: boolean };
  saveConnection?: boolean;
}

const StoreProvider = ({
  children,
  currency,
  transportHash,
  lang = 'cs',
  persistConfig,
  persist,
}: PropsWithChildren<StoreProviderProps>) => {
  const [upsell, upsellDispatch] = useImmerReducer(
    upsellReducer,
    persistConfig?.getItem().upsell || upsellInitialState,
  );
  const [user, userDispatch] = useImmerReducer(
    userReducer,
    persistConfig?.getItem().user || generateUserInitialState(currency, lang),
  );
  const [interceptorsMounted, setInterceptorsMounted] = useState(false);

  useEffect(() => {
    persistConfig?.setItem({ upsell });
  }, [upsell]);

  useEffect(() => {
    persistConfig?.setItem({ user });
  }, [user]);

  useEffect(() => {
    if (user.token) {
      api.defaults.headers.Authorization = `Bearer ${user.token}`;
    } else {
      delete api.defaults.headers.Authorization;
    }
  }, [user.token]);

  useEffect(() => {
    if (user.currency) {
      api.defaults.headers.common['X-Currency'] = user.currency;
    }
  }, [user.currency]);

  useEffect(() => {
    const reqIID = transportHash ? reqInterceptor(transportHash) : undefined;
    const resIID = resInterceptor(() => {
      userDispatch({ type: 'CLEAR_USER' });
    });

    // it was happening that requests would fail because the interceptors weren't mounted
    setInterceptorsMounted(true);

    return () => {
      if (reqIID) {
        api.interceptors.request.eject(reqIID);
      }
      api.interceptors.response.eject(resIID);
    };
  }, []);

  return (
    <StoreContext.Provider
      value={{
        dispatch: {
          upsellDispatch,
          userDispatch,
        },
        interceptorsMounted,
        state: { upsell, user },
      }}
    >
      <ResponseStateProvider
        persistConfig={persistConfig}
        persist={persist?.responseState}>
        <BookingProvider
          persistConfig={persistConfig}
          persist={persist?.booking}>
          {children}
        </BookingProvider>
      </ResponseStateProvider>
    </StoreContext.Provider>
  );
};

export default StoreProvider;
