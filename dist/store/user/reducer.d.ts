import type { Draft } from 'immer';
import { Currency, Language } from '../../hooks/types';
import { UserActions, UserReducerProps } from './types';
export declare const userInitialState: UserReducerProps;
export declare const generateUserInitialState: (currency: Currency, language?: Language) => UserReducerProps;
declare const userReducer: (draft: Draft<UserReducerProps>, action: UserActions) => void;
export default userReducer;
