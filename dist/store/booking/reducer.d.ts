import { Dispatch, FC, ReactNode } from 'react';
import { PersistConfig } from '../../hooks';
import { BookingActions, BookingReducerProps } from './types';
interface BookingProviderType {
    children?: ReactNode;
    persistConfig?: PersistConfig;
    persist?: boolean;
    transportHash?: string;
}
interface BookingContextType {
    state: BookingReducerProps;
    dispatch: Dispatch<BookingActions>;
}
export declare const BookingContext: import("use-context-selector").Context<BookingContextType>;
declare const BookingProvider: FC<BookingProviderType>;
export default BookingProvider;
