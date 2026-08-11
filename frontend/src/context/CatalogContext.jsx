import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";

const CatalogContext = createContext({
  loading: true,
  verticals: [],
  featured: [],
  totalBrands: 0,
});

export function CatalogProvider({ children }) {
  const [state, setState] = useState({
    loading: true,
    verticals: [],
    featured: [],
    totalBrands: 0,
  });

  useEffect(() => {
    api.get("/mart/catalog-showcase")
      .then(({ data }) => setState({
        loading: false,
        verticals: data.verticals || [],
        featured: data.featured || [],
        totalBrands: data.total_brands || 0,
      }))
      .catch(() => setState((s) => ({ ...s, loading: false })));
  }, []);

  return (
    <CatalogContext.Provider value={state}>
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  return useContext(CatalogContext);
}
