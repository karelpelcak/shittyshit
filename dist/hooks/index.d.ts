import React, { ReactNode } from 'react';
import { PersistedState, StoreProviderProps } from '../store/rootReducer';
import { Env } from './consts';
import { PersistContextCache } from './PersistContext';
export interface PersistConfig {
    getItem: () => PersistedState;
    setItem: (o: Partial<PersistedState>) => void;
}
interface ShopProviderProps extends StoreProviderProps {
    children?: ReactNode;
    env?: Env;
    verbose?: boolean;
    cache?: PersistContextCache;
    applicationOrigin?: string;
}
declare const ShopProvider: React.FC<ShopProviderProps>;
export default ShopProvider;
