import { Dispatch, FC, ReactNode } from 'react';
import { PersistConfig } from '../../hooks';
import { ResponseStateReducerProps, ResponseStateActions } from './types';
interface ResponseStateProviderType {
    children?: ReactNode;
    persistConfig?: PersistConfig;
    persist?: boolean;
}
interface ResponseStateType {
    state: ResponseStateReducerProps;
    dispatch: Dispatch<ResponseStateActions>;
}
export declare const ResponseStateContext: import("use-context-selector").Context<ResponseStateType>;
declare const ResponseStateProvider: FC<ResponseStateProviderType>;
export default ResponseStateProvider;
