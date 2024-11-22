import type { Draft } from 'immer';
import { api } from '../../hooks/consts';
import { Currency, Language } from '../../hooks/types';
import { UserActions, UserReducerProps } from './types';

export const userInitialState: UserReducerProps = {
  loginNrs: [],
  user: null,
  token: null,
  currency: 'CZK',
  language: 'cs',
  paymentMethodCode: null,
};

export const generateUserInitialState = (
  currency: Currency,
  language: Language = 'cs',
): UserReducerProps => ({
  loginNrs: [],
  user: null,
  token: null,
  currency,
  language,
  paymentMethodCode: null,
});

const userReducer = (draft: Draft<UserReducerProps>, action: UserActions) => {
  switch (action.type) {
    case 'CLEAR_USER':
      draft.user = null;
      draft.token = null;
      break;
    case 'SET_LANG':
      if (action.payload.language) {
        draft.language = action.payload.language;
      }
      break;
    case 'SET_TOKEN':
      draft.token = action.payload.token;
      break;
    case 'SET_USER':
      draft.user = action.payload.user;
      break;
    case 'SET_CURRENCY':
      api.defaults.headers.common['X-Currency'] = action.payload.currency;
      draft.currency = action.payload.currency;
      break;
    case 'SET_PAYMENT_CODE':
      draft.paymentMethodCode = action.payload.paymentMethodCode;
      break;
    case 'SET_LOGIN_NR':
      draft.loginNrs = Array.from(
        new Set([action.payload.loginNr, ...(draft.loginNrs || [])]),
      ).slice(0, 6);
      break;
  }
};

export default userReducer;
