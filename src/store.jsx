import React, { createContext, useState } from 'react';

export const Context = createContext(['jp', () => {}]);

export function Provider({ children }) {
  const [store, setStore] = useState('jp');

  return (
    <Context.Provider value={[store, setStore]}>{children}</Context.Provider>
  );
}
