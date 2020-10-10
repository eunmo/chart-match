import React, { createContext, useContext, useState } from 'react';

export const Context = createContext(['jp', () => {}]);

export function useStore() {
  const [store] = useContext(Context);
  return store;
}

export function Provider({ children }) {
  const [store, setStore] = useState('jp');

  return (
    <Context.Provider value={[store, setStore]}>{children}</Context.Provider>
  );
}
