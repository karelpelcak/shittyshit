import { Dispatch, PropsWithChildren } from 'react';
import { PersistConfig } from '../hooks';
import { Currency, Language } from '../hooks/types';
import { BookingReducerProps } from './booking/types';
import { ResponseStateReducerProps } from './responseState/types';
import { UpsellActions, UpsellReducerProps } from './upsell/types';
import { UserActions, UserReducerProps } from './user/types';
export interface RootReducerProps {
    user: UserReducerProps;
    upsell: UpsellReducerProps;
}
export interface PersistedState extends RootReducerProps {
    bookings?: BookingReducerProps;
    responseState?: ResponseStateReducerProps;
}
export declare const StoreContext: import("use-context-selector").Context<{
    state: RootReducerProps;
    interceptorsMounted: boolean;
    dispatch: {
        upsellDispatch: Dispatch<UpsellActions>;
        userDispatch: Dispatch<UserActions>;
    };
}>;
export interface StoreProviderProps {
    lang?: Language;
    currency: Currency;
    transportHash?: string;
    persistConfig?: PersistConfig;
    persist?: {
        booking?: boolean;
        responseState?: boolean;
    };
    saveConnection?: boolean;
}
declare const StoreProvider: ({ children, currency, transportHash, lang, persistConfig, persist, }: PropsWithChildren<StoreProviderProps>) => JSX.Element;
export default StoreProvider;
