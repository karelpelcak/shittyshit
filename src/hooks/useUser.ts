import { useEffect } from 'react';
import type { GenericAbortSignal } from 'axios';
import { useContextSelector } from 'use-context-selector';
import { ResponseStateContext } from '../store/responseState/reducer';
import { ResponseStateCategory } from '../store/responseState/types';
import { StoreContext } from '../store/rootReducer';
import { SET_LOGIN_NR, SET_PAYMENT_CODE, SET_USER } from '../store/user/types';
import { getErrorMessage, unusablePaymentMethods } from './consts';
import {
  Currency,
  DateString,
  PaymentMethod,
  StationCountry,
  Tariff,
} from './types';
import useBookingActions from './useBooking';
import { useHeadersActions } from './useHeaders';
import { useManualApi } from './useManualApi';
import useSetResponseState from './useSetResponseState';

export interface UserRegisterCommons {
  firstName: string;
  surname: string;
  phoneNumber: string;
  email: string;
  company?: Company;
  currency: Currency;
}

export interface User extends UserRegisterCommons {
  id: number;
  accountCode: string;
  restrictPhoneNumbers: boolean;
  credit: number;
  creditPrice: boolean;
  defaultTariffKey: Tariff;
  notifications: Notifications;
  companyInformation: boolean;
  conditionsAcceptance: boolean;
  employeeNumber: null | string;
}

export interface SimpleSignupPayload {
  firstName: string;
  surname: string;
  email: string;
  phoneNumber: string;
  password: string;
  notifications: Notifications;
  agreeWithTerms: boolean;
}

export interface RegisterPayload extends UserRegisterCommons {
  companyInformation: boolean;
  defaultTariff: Tariff;
  password: string;
  notifications: Notifications;
  agreeWithTerms: boolean;
}

export interface LoginPayload {
  accountCode: string;
  password: string;
}

export interface ChangeInfoPayload {
  phoneNumber?: string;
  restrictPhoneNumbers?: boolean;
  companyInformation?: boolean;
  company?: Company;
  defaultTariffKey?: Tariff;
  notifications?: Notifications;
}

export interface ChangePasswordPayload {
  newPassword: string;
  oldPassword: string;
}

export interface SignupData {
  token: string;
}

export interface ForgottenPasswordData {
  accountCode: string;
  email: string;
  correlationId: string;
}

export interface Company {
  companyName: string;
  address: string;
  registrationNumber: string;
  vatNumber: string;
}

export interface Notifications {
  newsletter: boolean;
  reservationChange: boolean;
  routeRatingSurvey: boolean;
}

export interface PercentualDiscount {
  dateFrom: DateString | null;
  dateTo: DateString | null;
  fromCityId: number | null;
  fromCountry: null | StationCountry | 'EU';
  fromStationId: number | null;
  id: number;
  passengers: number;
  percentage: number;
  state: 'VALID' | 'USED';
  ticketId: number | null;
  toCityId: number | null;
  toCountry: null | StationCountry | 'EU';
  toStationId: number | null;
}

export const useUserActions = () => {
  const setState = useSetResponseState(ResponseStateCategory.user);
  const categoryState = useContextSelector(
    ResponseStateContext,
    (c) => c.state[ResponseStateCategory.user],
  );
  const dispatch = useContextSelector(
    StoreContext,
    (c) => c.dispatch.userDispatch,
  );
  const user = useContextSelector(StoreContext, (c) => c.state.user.user);
  const { setToken } = useHeadersActions();
  const { clearBooking } = useBookingActions();

  const [{ error: signupError, loading: signupLoading }, callRegistration] =
    useManualApi<SignupData>({
      url: '/users/signup/registeredAccount',
      method: 'POST',
    });

  const [{ error: loginError, loading: loginLoading }, callLogin] =
    useManualApi<SignupData>({
      url: '/users/login/registeredAccount',
      method: 'POST',
    });
  const [
    { error: forgottenPasswordError, loading: forgottenPasswordLoading },
    callForgottenPassword,
  ] = useManualApi<ForgottenPasswordData>({
    url: '/users/forgottenPassword',
    method: 'POST',
  });

  const [
    { error: loginTicketError, loading: loginTicketLoading },
    callLoginTicket,
  ] = useManualApi<SignupData>({
    url: '/users/login/unregisteredAccount',
    method: 'POST',
  });

  const [{ error: logoutError, loading: logoutLoading }, callLogout] =
    useManualApi(
      {
        url: '/users/logout',
        method: 'POST',
        data: {},
      },
      { manual: true },
    );

  const [
    { error: changeInfoError, loading: changeInfoLoading },
    callChangeInfo,
  ] = useManualApi({
    url: '/users/settings/changeUserInformation',
    method: 'PUT',
  });

  const [
    { error: changePassError, loading: changePassLoading },
    callChangePassword,
  ] = useManualApi({
    url: '/users/settings/changePassword',
    method: 'PUT',
  });

  const [
    { error: resetPassError, loading: resetPassLoading },
    callResetPassword,
  ] = useManualApi({
    url: '/users/resetPassword',
    method: 'POST',
  });

  const [
    { error: resetPassVerifyError, loading: resetPassVerifyLoading },
    callResetPasswordVerify,
  ] = useManualApi({
    url: '/users/resetPassword/verify',
    method: 'GET',
  });

  const [{ error: qrError, loading: qrLoading, data: qrData }, getAccountQr] =
    useManualApi({ url: '/tickets/account/qrcode', method: 'GET' });

  const [
    {
      error: percDiscountsError,
      loading: percDiscountsLoading,
      data: percDiscountsData,
    },
    getPercDiscounts,
  ] = useManualApi<PercentualDiscount[]>({
    url: '/discounts/percentual',
    method: 'GET',
    headers: { Accept: 'application/1.1.0+json' },
  });

  const [
    { error: registerOpenError, loading: registerOpenLoading },
    callRegisterOpen,
  ] = useManualApi<{ token: string }>({
    url: '/users/signup/registeredAccount/simple',
    method: 'POST',
  });

  const addLoginNumber = async (loginNr: string) =>
    dispatch({ type: SET_LOGIN_NR, payload: { loginNr } });

  const register = async (
    payload: RegisterPayload,
    signal?: GenericAbortSignal,
  ) => {
    try {
      const { data, status } = await callRegistration({
        data: payload,
        signal,
      });
      if (status !== 200) {
        return false;
      }
      await setToken(data.token);
      return true;
    } catch (e) {
      return false;
    }
  };

  const login = async (payload: LoginPayload, signal?: GenericAbortSignal) => {
    try {
      const response = await callLogin({ data: payload, signal });
      const userData = await setToken(response.data.token);
      return { response, user: userData };
    } catch (e) {
    }
  };

  const loginTicket = async (
    accountCode: string,
    signal?: GenericAbortSignal,
  ) => {
    try {
      const response = await callLoginTicket({ data: { accountCode }, signal });
      const userData = await setToken(response.data.token);
      return { response, user: userData };
    } catch (e) {
    }
  };

  const logout = async (signal?: GenericAbortSignal) => {
    try {
      await callLogout({ signal });
      await setToken(null);
      clearBooking();
      return true;
    } catch {
      return false;
    }
  };

  const registerOpenTicket = async (
    data: SimpleSignupPayload,
    signal?: GenericAbortSignal,
  ) => {
    try {
      const response = await callRegisterOpen({ data, signal });
      if (response.data.token) {
        await setToken(response.data.token);
      }

      return true;
    } catch {
      return false;
    }
  };

  const changeUserInfo = async (
    changeInfoPayload: ChangeInfoPayload,
    signal?: GenericAbortSignal,
  ) => {
    try {
      if (user) {
        const {
          companyInformation,
          company,
          defaultTariffKey,
          notifications,
          phoneNumber,
        } = user;

        await callChangeInfo({
          data: {
            companyInformation,
            company,
            defaultTariffKey,
            notifications,
            phoneNumber,
            ...changeInfoPayload,
          },
          signal,
        });

        dispatch({
          type: SET_USER,
          payload: {
            user: user && {
              ...user,
              ...changeInfoPayload,
              company: changeInfoPayload.company
                ? changeInfoPayload.company
                : company,
            },
          },
        });
        return true;
      }
    } catch (e) {
      return false;
    }
  };

  const changeUserPassword = async (
    changeInfoPayload: ChangePasswordPayload,
    signal?: GenericAbortSignal,
  ) => {
    try {
      await callChangePassword({ data: changeInfoPayload, signal });
      return true;
    } catch (e) {
      return false;
    }
  };

  const requestPasswordReset = async (
    data: ForgottenPasswordData,
    signal?: GenericAbortSignal,
  ) => {
    try {
      await callForgottenPassword({ data, signal });
      return true;
    } catch (e) {
      return false;
    }
  };

  const resetPassword = async (
    newPassword: string,
    token: string,
    signal?: GenericAbortSignal,
  ) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const { status: crpvStatus } = await callResetPasswordVerify({
        headers,
        signal,
      });
      const { status: crpStatus } = await callResetPassword({
        data: { newPassword },
        headers,
        signal,
      });
      return crpvStatus === 200 && crpStatus === 200;
    } catch (e) {
      return false;
    }
  };

  const setPaymentCode = (paymentMethodCode: PaymentMethod | null) =>
    (!paymentMethodCode ||
      !unusablePaymentMethods.includes(paymentMethodCode)) &&
    dispatch({ type: SET_PAYMENT_CODE, payload: { paymentMethodCode } });

  const loading =
    changeInfoLoading ||
    changePassLoading ||
    forgottenPasswordLoading ||
    loginLoading ||
    loginTicketLoading ||
    logoutLoading ||
    percDiscountsLoading ||
    qrLoading ||
    registerOpenLoading ||
    resetPassLoading ||
    resetPassVerifyLoading ||
    signupLoading;

  const error =
    changeInfoError ||
    changePassError ||
    forgottenPasswordError ||
    loginError ||
    loginTicketError ||
    logoutError ||
    percDiscountsError ||
    qrError ||
    registerOpenError ||
    resetPassError ||
    resetPassVerifyError ||
    signupError;

  useEffect(() => {
    setState(
      error?.response?.data?.message || getErrorMessage(error),
      loading,
      error?.response?.data?.errorFields,
    );
  }, [error, loading]);

  return {
    addLoginNumber,
    changeUserInfo,
    changeUserPassword,
    login,
    loginTicket,
    logout,
    registerOpenTicket,
    requestPasswordReset,
    register,
    resetPassword,
    setPaymentCode,
    accountQr: { getAccountQr, qrData },
    percDiscounts: { getPercDiscounts, percDiscountsData },
    ...categoryState,
  };
};

const useUser = () => {
  const userObj = useContextSelector(StoreContext, (c) => c.state.user);

  const { user } = userObj;
  const isLoggedIn = !!user;
  const isCreditPrice = !!user?.creditPrice;
  const loginNumbers = userObj.loginNrs;

  return {
    isCreditPrice,
    isLoggedIn,
    loginNumbers,
    user: userObj,
  };
};

export default useUser;
