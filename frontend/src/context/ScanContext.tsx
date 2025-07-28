import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { ScanResult, Vulnerability } from '../api';

interface ScanContextType {
  currentScan: ScanResult | null;
  setCurrentScan: (scan: ScanResult | null) => void;
  vulnerabilities: Vulnerability[];
  setVulnerabilities: (vulns: Vulnerability[]) => void;
  clearScanData: () => void;
  hasScanData: boolean;
}

const ScanContext = createContext<ScanContextType | undefined>(undefined);

export const useScanContext = () => {
  const context = useContext(ScanContext);
  if (context === undefined) {
    throw new Error('useScanContext must be used within a ScanProvider');
  }
  return context;
};

interface ScanProviderProps {
  children: ReactNode;
}

export const ScanProvider: React.FC<ScanProviderProps> = ({ children }) => {
  console.log("ScanProvider rendered");
  
  const [currentScan, setCurrentScan] = useState<ScanResult | null>(null);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);

  const clearScanData = () => {
    console.log('Clearing scan data');
    setCurrentScan(null);
    setVulnerabilities([]);
  };

  // Compute hasScanData using useMemo for better performance and reliability
  const hasScanData = useMemo(() => {
    const hasCurrentScan = currentScan !== null;
    const hasVulnerabilities = vulnerabilities.length > 0;
    const result = hasCurrentScan && hasVulnerabilities;
    console.log('hasScanData computed:', { hasCurrentScan, hasVulnerabilities, result });
    return result;
  }, [currentScan, vulnerabilities]);
  
  console.log("ScanProvider state:", { currentScan: !!currentScan, vulnerabilities: vulnerabilities.length, hasScanData });

  const value: ScanContextType = {
    currentScan,
    setCurrentScan,
    vulnerabilities,
    setVulnerabilities,
    clearScanData,
    hasScanData,
  };

  return (
    <ScanContext.Provider value={value}>
      {children}
    </ScanContext.Provider>
  );
}; 