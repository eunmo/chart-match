import React, { createContext, useContext, useState } from 'react';

export const Context = createContext(['jp', () => {}]);

export function useStore() {
  const [store] = useContext(Context);
  return store;
}

export function Provider({ children }) {
  const storeState = useState('jp');

  return <Context.Provider value={storeState}>{children}</Context.Provider>;
}
