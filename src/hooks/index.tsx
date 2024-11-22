import React, { ReactNode, useEffect } from 'react';
import StoreProvider, { PersistedState, StoreProviderProps } from '../store/rootReducer';
import { api, Env, envUrls } from './consts';
import { PersistContextCache, PersistContextProvider } from './PersistContext';

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

const ShopProvider: React.FC<ShopProviderProps> = ({
  children,
  env = Env.QA,
  verbose,
  cache,
  applicationOrigin = 'WEB',
  ...rest
}) => {
  api.defaults.baseURL = envUrls[env];
  api.defaults.headers['X-Application-Origin'] = applicationOrigin;

  useEffect(() => {
    if (verbose) {
      const reqInterceptor = api.interceptors.request.use((req) => {
        const { baseURL, data, headers, params, url } = req;
        // eslint-disable-next-line no-console
        console.log('Req: ', { baseURL, data, headers, params, url });
        return req;
      });
      const resInterceptor = api.interceptors.response.use((res) => {
        const { baseURL, params, url } = res.request ?? {};
        const { status, data, headers } = res;
        // eslint-disable-next-line no-console
        console.log('Res: ', { baseURL, data, headers, params, status, url });
        return res;
      }, (e) => {
        // eslint-disable-next-line no-console
        console.log('Res error: ', e, JSON.stringify(e, null, 2));
        throw e;
      });

      return () => {
        api.interceptors.request.eject(reqInterceptor);
        api.interceptors.response.eject(resInterceptor);
      };
    }
  }, [verbose]);

  return (
    <StoreProvider {...rest}>
      <PersistContextProvider cache={cache}>{children}</PersistContextProvider>
    </StoreProvider>
  );
};

export default ShopProvider;
