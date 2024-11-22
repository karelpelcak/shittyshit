import React from 'react';
import { useUser } from '@regiojet/shop-logic';

const App = () => {
  const { login, loading } = useUser();

  return (
    <div>
      <button
        onClick={() => {
          login({ accountCode: '1896194979', password: 'asdfgh' });
        }}
      >
        test
      </button>
      {!loading && <div>LOADING</div>}
    </div>
  );
};

export default App;
