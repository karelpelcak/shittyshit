import type { AxiosRequestConfig, GenericAbortSignal } from 'axios';
import { useContextSelector } from 'use-context-selector';
import { StoreContext } from '../store/rootReducer';
import {
  CLEAR_USER,
  PersistedUser,
  SET_CURRENCY,
  SET_LANG,
  SET_LOGIN_NR,
  SET_TOKEN,
  SET_USER,
} from '../store/user/types';
import { api } from './consts';
import { Currency, Language } from './types';

const fetchAuthorize = (config?: AxiosRequestConfig) => api.get<PersistedUser | null>('/users/authenticate', config);

export const useHeadersActions = () => {
  const dispatch = useContextSelector(StoreContext, c => c.dispatch.userDispatch);
  const isLoggedIn = useContextSelector(StoreContext, c => !!c.state.user.user);

  const setCurrency = (currency: Currency) => {
    if (currency !== api.defaults.headers.common['X-Currency']) {
      dispatch({ type: SET_CURRENCY, payload: { currency } });
    }
  };

  const authorize = async (signal?: GenericAbortSignal) => {
    let response;
    try {
      response = await fetchAuthorize({ signal });
    } catch {
      // @ts-expect-error hideTokenHash
      response = await fetchAuthorize({ hideTokenHash: true, signal });
    }
    const data = response.data;
    if (!data) {
      return;
    }
    dispatch({ type: SET_USER, payload: { user: data } });
    if (data.creditPrice) {
      dispatch({
        type: SET_LOGIN_NR,
        payload: { loginNr: data.accountCode },
      });
    }
    setCurrency(data.currency);
    return data;
  };

  const setCaptcha = (hash: string) => {
    if (!isLoggedIn) {
      api.defaults.headers.common['X-ReCaptcha-Token'] = hash;
    }
  };

  const setLanguage = (language: Language) => {
    if (language !== api.defaults.headers.common['X-Lang']) {
      dispatch({ type: SET_LANG, payload: { language } });
    }
  };

  const setToken = async (token: string | null) => {
    if (token) {
      api.defaults.headers.Authorization = `Bearer ${token}`;
      dispatch({ type: SET_TOKEN, payload: { token } });
      // eslint-disable-next-line @typescript-eslint/return-await
      return await authorize();
    } else {
      delete api.defaults.headers.Authorization;
      dispatch({ type: CLEAR_USER });
    }
  };

  return {
    authorize,
    setCaptcha,
    setCurrency,
    setLanguage,
    setToken,
  };
};

const useHeaders = () => {
  const { currency, language, token } = useContextSelector(StoreContext, c => c.state.user);

  return {
    currency,
    language: language || 'cs',
    token,
  };
};

export default useHeaders;
