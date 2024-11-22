import { makeUseAxios } from 'axios-hooks';
import { api as axios } from './consts';

export const useApi = makeUseAxios({ axios });

export const useManualApi = makeUseAxios({
  axios,
  defaultOptions: { manual: true },
});
