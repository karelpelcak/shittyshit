import axios, { AxiosError, ParamsSerializerOptions } from 'axios';
import JsSHA from 'jssha';
import qs from 'qs';
import { Language, PaymentMethod, StationCountry } from './types';

export enum Env {
  PROD = 'prod',
  QA = 'qa',
  DEV = 'dev',
}

export const envUrls = Object.freeze({
  [Env.PROD]: 'https://brn-ybus-pubapi.sa.cz/restapi',
  [Env.QA]: 'https://brn-qa-ybus-pubapi.sa.cz/restapi',
  [Env.DEV]: 'https://brn-dev-ybus-pubapi.sa.cz/restapi',
});

export const paramsSerializer: ParamsSerializerOptions = {
  serialize: (params) => qs.stringify(params, { indices: false }),
};

const TIMEOUT = 30000;

export const api = axios.create({
  baseURL: envUrls[Env.QA],
  timeout: TIMEOUT,
  headers: { 'Cache-Control': 'no-cache' },
  paramsSerializer,
  transitional: {
    clarifyTimeoutError: true,
  },
});

export const resInterceptor = (onUnauthorized: () => void) =>
  api.interceptors.response.use(
    (response) => {
      delete api.defaults.headers.common['X-ReCaptcha-Token'];
      return response;
    },
    async (error) => {
      if (axios.isCancel(error)) {
        return;
      }
      if (error?.response?.status === 401) {
        onUnauthorized();
      }

      return Promise.reject(error);
    },
  );

const bodyHashEndpoints = [
  '/tickets/create/unregistered',
  '/users/login/registeredAccount',
  '/users/login/unregisteredAccount',
  '/users/login/email',
  '/users/signup/registeredAccount',
  '/users/forgottenPassword/email',
  '/tickets/timetickets/unregistered',
];

export const getHashedData = (data: unknown, hash: string): string => {
  const shaObj = new JsSHA('SHA3-512', 'TEXT');
  const cleanedData = typeof data === 'string' ? data : JSON.stringify(data);
  shaObj.setHMACKey(hash, 'TEXT');
  shaObj.update(cleanedData);
  return shaObj.getHMAC('HEX');
};

export const reqInterceptor = (hash: string) =>
  api.interceptors.request.use((req) => {
    const token = (req.headers?.Authorization as string | undefined)?.split(
      ' ',
    )[1];

    // @ts-expect-error workaround for hiding token hash
    // YBUS is requiring the token hash once and doesn't want it the other time ... ¯\_(ツ)_/¯
    const hideTokenHash = req.hideTokenHash;

    if (!req.headers) {
      req.headers = {};
    }

    if (!req.url?.includes('const') && !hideTokenHash) {
      if (token && !bodyHashEndpoints.includes(req.url || '')) {
        req.headers['X-Token-Hash'] = getHashedData(token, hash);
      } else if (req.data) {
        req.headers['X-Body-Hash'] = getHashedData(req.data, hash);
      }
    }

    if (hideTokenHash) {
      // @ts-expect-error hideTokenHash
      delete req.hideTokenHash;
    }

    req.headers.Referer = 'regiojet:///';
    return req;
  });

export const TIMEOUT_MESSAGE = 'alert.outage';
export const FAIL_MESSAGE = 'alert.fail';
export const NETWORK_MESSAGE = 'alert.network';

export const getErrorMessage = (error?: AxiosError | null) => {
  if (!error) {
    return;
  }
  switch (error.code) {
    // we want to ignore canceled requests
    case AxiosError.ERR_CANCELED:
      return;
    case AxiosError.ETIMEDOUT:
    case AxiosError.ECONNABORTED:
      return TIMEOUT_MESSAGE;
    case AxiosError.ERR_NETWORK:
    case 'ENOTFOUND':
      return NETWORK_MESSAGE;
  }
  return FAIL_MESSAGE;
};

export const langPriorityCountries = Object.freeze<
Record<Language, StationCountry[]>
>({
  cs: ['CZ', 'SK'],
  de: ['DE', 'AT', 'CZ'],
  'de-AT': ['AT', 'DE', 'CZ'],
  en: ['UK', 'BE', 'NL', 'LU', 'DE'],
  hu: ['HU', 'SK', 'AT'],
  pl: ['PL', 'CZ', 'SK', 'UA'],
  sk: ['SK', 'CZ', 'AT'],
  uk: ['UA', 'CZ', 'PL', 'SK', 'HU'],
});

export const unusablePaymentMethods = [
  PaymentMethod.Cash,
  PaymentMethod.Transfer,
  PaymentMethod.Giftcertificate,
];
