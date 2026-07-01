'use client';

import React, { createContext, useContext, useState } from 'react';

type ModalContextType = {
  isBrochureOpen: boolean;
  openBrochure: (vertical?: string) => void;
  closeBrochure: () => void;
  selectedVertical: string;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isBrochureOpen, setIsBrochureOpen] = useState(false);
  const [selectedVertical, setSelectedVertical] = useState('All');

  const openBrochure = (vertical?: string) => {
    if (vertical) {
      setSelectedVertical(vertical);
    } else {
      setSelectedVertical('All');
    }
    setIsBrochureOpen(true);
  };

  const closeBrochure = () => setIsBrochureOpen(false);

  return (
    <ModalContext.Provider value={{ isBrochureOpen, openBrochure, closeBrochure, selectedVertical }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}
