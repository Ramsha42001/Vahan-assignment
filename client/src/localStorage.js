
export const loadState = () => {
    try {
      const serializedState = localStorage.getItem('appState');
      return serializedState ? JSON.parse(serializedState) : undefined;
    } catch (e) {
      console.warn("Could not load state from localStorage:", e);
      return undefined;
    }
  };
  
  export const saveState = (state) => {
    try {
      const serializedState = JSON.stringify(state);
      localStorage.setItem('appState', serializedState);
    } catch (e) {
      console.warn("Could not save state to localStorage:", e);
    }
  };
  