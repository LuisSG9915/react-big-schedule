import { useEffect, useState, useRef, useCallback } from "react";
import { peinadosApi } from "../../api/peinadosApi";

export const useListaEspera = ({ id, sucursal, refreshInterval = 60000 }) => {
  const [dataListaEspera, setDataListaEspera] = useState([]);
  const intervalRef = useRef(null);
  const lastFetchTimeRef = useRef(0);
  
  // Store the parameters in refs to avoid unnecessary re-renders
  const paramsRef = useRef({ id, sucursal, refreshInterval });
  
  // Update the params ref when props change
  useEffect(() => {
    paramsRef.current = { id, sucursal, refreshInterval };
  }, [id, sucursal, refreshInterval]);

  // Use useCallback to memoize the fetchListaEspera function
  const fetchListaEspera = useCallback(async (force = false) => {
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTimeRef.current;
    
    // Always fetch if forced, otherwise check time since last fetch
    if (force || timeSinceLastFetch >= paramsRef.current.refreshInterval / 2) {
      try {
        const { id, sucursal } = paramsRef.current;
        
        // Add a cache-busting parameter to prevent browser caching
        const cacheBuster = `_t=${now}`;
        const response = await peinadosApi.get(`/ListaEspera9?id=${id}&sucursal=${sucursal}&${cacheBuster}`);
        
        // Update the state with the new data
        setDataListaEspera(response.data);
        lastFetchTimeRef.current = now;
        
        // Return the response for promise chaining
        return response;
      } catch (error) {
        console.error("Error fetching lista espera:", error);
        throw error; // Re-throw to allow error handling by callers
      }
    }
    return null; // Return null if no fetch was performed
  }, []); // No dependencies to ensure stability

  useEffect(() => {
    // Fetch data immediately on mount
    fetchListaEspera(true);
    
    // Set up interval for periodic fetching
    intervalRef.current = setInterval(() => {
      fetchListaEspera();
    }, paramsRef.current.refreshInterval);
    
    // Clean up interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []); // Empty dependency array - only run on mount/unmount

  return { dataListaEspera, fetchListaEspera };
};
