import { createContext, type Dispatch, type ReactNode, useContext, useReducer } from 'react';

type DefaultValues = {
  focusedRow: number | null;
};

const defaultValues: DefaultValues = {
  focusedRow: null,
};

export interface SetFocusedRow {
  focusedRow: number | null;
}

export type RowAction = SetFocusedRow;

const RowsContext = createContext<DefaultValues>(defaultValues);

const RowsDispatchContext = createContext(null as unknown as Dispatch<RowAction>);

export function RowsProvider({ children }: { children: ReactNode }): JSX.Element {
  const [breadcrumbKeys, dispatch] = useReducer(rowsReducer, defaultValues);

  return (
    <RowsContext.Provider value={breadcrumbKeys}>
      <RowsDispatchContext.Provider value={dispatch}>{children}</RowsDispatchContext.Provider>
    </RowsContext.Provider>
  );
}

export function useRowsContext(): DefaultValues {
  return useContext(RowsContext);
}

export function useRowsDispatch(): Dispatch<RowAction> {
  return useContext(RowsDispatchContext);
}

function rowsReducer(state: DefaultValues, action: RowAction): DefaultValues {
  return {
    ...state,
    ...action,
  };
}
