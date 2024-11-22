import type { GenericAbortSignal } from 'axios';
import { Currency, DateString, PaymentMethod, StationCountry, Tariff } from './types';
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
export declare const useUserActions: () => {
    error?: {
        message?: string | undefined;
        errorFields?: import("../store/responseState/types").ErrorFields[] | undefined;
    } | undefined;
    loading: boolean;
    addLoginNumber: (loginNr: string) => Promise<void>;
    changeUserInfo: (changeInfoPayload: ChangeInfoPayload, signal?: GenericAbortSignal) => Promise<boolean | undefined>;
    changeUserPassword: (changeInfoPayload: ChangePasswordPayload, signal?: GenericAbortSignal) => Promise<boolean>;
    login: (payload: LoginPayload, signal?: GenericAbortSignal) => Promise<{
        response: import("axios").AxiosResponse<SignupData, any>;
        user: import("../store/user/types").PersistedUser | undefined;
    } | undefined>;
    loginTicket: (accountCode: string, signal?: GenericAbortSignal) => Promise<{
        response: import("axios").AxiosResponse<SignupData, any>;
        user: import("../store/user/types").PersistedUser | undefined;
    } | undefined>;
    logout: (signal?: GenericAbortSignal) => Promise<boolean>;
    registerOpenTicket: (data: SimpleSignupPayload, signal?: GenericAbortSignal) => Promise<boolean>;
    requestPasswordReset: (data: ForgottenPasswordData, signal?: GenericAbortSignal) => Promise<boolean>;
    register: (payload: RegisterPayload, signal?: GenericAbortSignal) => Promise<boolean>;
    resetPassword: (newPassword: string, token: string, signal?: GenericAbortSignal) => Promise<boolean>;
    setPaymentCode: (paymentMethodCode: PaymentMethod | null) => false | void;
    accountQr: {
        getAccountQr: import("axios-hooks").RefetchFunction<any, any>;
        qrData: any;
    };
    percDiscounts: {
        getPercDiscounts: import("axios-hooks").RefetchFunction<any, PercentualDiscount[]>;
        percDiscountsData: PercentualDiscount[] | undefined;
    };
};
declare const useUser: () => {
    isCreditPrice: boolean;
    isLoggedIn: boolean;
    loginNumbers: string[];
    user: import("../store/user/types").UserReducerProps;
};
export default useUser;
