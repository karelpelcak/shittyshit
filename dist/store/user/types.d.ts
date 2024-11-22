import { Currency, Language, PaymentMethod, Tariff } from '../../hooks/types';
import { Company, Notifications } from '../../hooks/useUser';
export declare const SET_CURRENCY = "SET_CURRENCY";
export declare const SET_CLASS = "SET_CLASS";
export declare const SET_LANG = "SET_LANG";
export declare const SET_LOGIN_NR = "SET_LOGIN_NR";
export declare const SET_PAYMENT_CODE = "SET_PAYMENT_CODE";
export declare const SET_TOKEN = "SET_TOKEN";
export declare const SET_USER = "SET_USER";
export declare const CLEAR_USER = "CLEAR_USER";
export interface PersistedUser {
    id: number;
    accountCode: string;
    company?: Company;
    companyInformation: boolean;
    credit: number;
    creditPrice: boolean;
    currency: Currency;
    defaultTariffKey: Tariff;
    email: string;
    employeeNumber: null | string;
    firstName: string | null;
    notifications: Notifications;
    phoneNumber: string | null;
    surname: string | null;
}
export interface UserReducerProps {
    currency: Currency;
    language: Language;
    loginNrs: string[];
    paymentMethodCode: PaymentMethod | null;
    token: string | null;
    user: PersistedUser | null;
}
interface SetTokenAction {
    type: typeof SET_TOKEN;
    payload: {
        token: string | null;
    };
}
interface SetLoginNrAction {
    type: typeof SET_LOGIN_NR;
    payload: {
        loginNr: string;
    };
}
interface SetLangAction {
    type: typeof SET_LANG;
    payload: {
        language: Language;
    };
}
interface SetCurrencyAction {
    type: typeof SET_CURRENCY;
    payload: {
        currency: Currency;
    };
}
interface SetPaymentCodeAction {
    type: typeof SET_PAYMENT_CODE;
    payload: {
        paymentMethodCode: PaymentMethod | null;
    };
}
interface SetUserAction {
    type: typeof SET_USER;
    payload: {
        user: PersistedUser | null;
    };
}
interface SetClearUserAction {
    type: typeof CLEAR_USER;
}
export type UserActions = SetClearUserAction | SetCurrencyAction | SetLangAction | SetLoginNrAction | SetPaymentCodeAction | SetTokenAction | SetUserAction;
export {};
