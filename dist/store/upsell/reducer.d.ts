import type { Draft } from 'immer';
import { UpsellActions, UpsellReducerProps } from './types';
export declare const upsellInitialState: UpsellReducerProps;
declare const upsellReducer: (draft: Draft<UpsellReducerProps>, action: UpsellActions) => void;
export default upsellReducer;
