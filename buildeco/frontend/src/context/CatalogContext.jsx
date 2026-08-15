import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { DEMO_INTERIOR_VERTICALS } from "@/lib/demoData";

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
      .catch(() => setState({
        loading: false,
        verticals: DEMO_INTERIOR_VERTICALS,
        featured: DEMO_INTERIOR_VERTICALS.slice(0, 4),
        totalBrands: DEMO_INTERIOR_VERTICALS.reduce((n, v) => n + (v.brand_count || 0), 0),
      }));
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
