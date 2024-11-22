import './index.css';

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { ShopReduxProvider } from '@regiojet/shop-logic';
import storage from 'redux-persist/lib/storage';

ReactDOM.render(
  <ShopReduxProvider
    currency="CZK"
    lang="cs"
    persistConfig={{
      key: 'root',
      storage,
    }}
  >
    <App />
  </ShopReduxProvider>,
  document.getElementById('root'),
);
