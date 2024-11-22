import { AxiosError, ParamsSerializerOptions } from 'axios';
import { Language, PaymentMethod, StationCountry } from './types';
export declare enum Env {
    PROD = "prod",
    QA = "qa",
    DEV = "dev"
}
export declare const envUrls: Readonly<{
    prod: "https://brn-ybus-pubapi.sa.cz/restapi";
    qa: "https://brn-qa-ybus-pubapi.sa.cz/restapi";
    dev: "https://brn-dev-ybus-pubapi.sa.cz/restapi";
}>;
export declare const paramsSerializer: ParamsSerializerOptions;
export declare const api: import("axios").AxiosInstance;
export declare const resInterceptor: (onUnauthorized: () => void) => number;
export declare const getHashedData: (data: unknown, hash: string) => string;
export declare const reqInterceptor: (hash: string) => number;
export declare const TIMEOUT_MESSAGE = "alert.outage";
export declare const FAIL_MESSAGE = "alert.fail";
export declare const NETWORK_MESSAGE = "alert.network";
export declare const getErrorMessage: (error?: AxiosError | null) => "alert.outage" | "alert.fail" | "alert.network" | undefined;
export declare const langPriorityCountries: Readonly<Record<Language, StationCountry[]>>;
export declare const unusablePaymentMethods: PaymentMethod[];
