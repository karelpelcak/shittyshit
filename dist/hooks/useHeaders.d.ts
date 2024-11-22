import type { GenericAbortSignal } from 'axios';
import { PersistedUser } from '../store/user/types';
import { Currency, Language } from './types';
export declare const useHeadersActions: () => {
    authorize: (signal?: GenericAbortSignal) => Promise<PersistedUser | undefined>;
    setCaptcha: (hash: string) => void;
    setCurrency: (currency: Currency) => void;
    setLanguage: (language: Language) => void;
    setToken: (token: string | null) => Promise<PersistedUser | undefined>;
};
declare const useHeaders: () => {
    currency: Currency;
    language: Language;
    token: string | null;
};
export default useHeaders;
