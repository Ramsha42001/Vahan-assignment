# State Management

## Redux Implementation Overview

Application uses Redux Toolkit for state management, with a well-organized structure following modern Redux best practices. The implementation includes persistent storage for authentication state and separate feature slices for different domains of the application.

### Store Configuration

The Redux store is configured in `src/redux/store.js` with the following key features:

1. **Feature Slices**:
   - Authentication (`auth`)
   - Metrics (`metrics`)
   - Documents (`documents`)

2. **Local Storage Persistence**:
   - Implements state persistence for authentication data
   - Uses local storage to maintain user session across page reloads
   - Includes error handling for storage operations

### Feature Organization

The state management is organized into feature slices under `src/redux/features/`:

1. **Authentication (`/auth`)**: 
   - Manages user authentication state
   - Handles login/logout operations
   - Persists across sessions

2. **Metrics (`/metrics`)**:
   - Handles application metrics and analytics
   - Manages performance monitoring data

3. **Documents (`/document`)**:
   - Manages document-related state
   - Handles document operations and status

4. **WebSocket (`/webSocket`)**:
   - Manages real-time communication state
   - Handles WebSocket connections and events

### Store Implementation Details

```javascript
// Store Configuration
const store = configureStore({
  reducer: {
    auth: authReducer,
    metrics: metricsReducer,
    documents: documentReducer
  },
  preloadedState: loadState()
});
```

### State Persistence

The application implements state persistence with the following features:

1. **Load State**:
```javascript
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('state');
    return serializedState ? JSON.parse(serializedState) : undefined;
  } catch (err) {
    return undefined;
  }
};
```

2. **Save State**:
```javascript
const saveState = (state) => {
  try {
    localStorage.setItem('state', JSON.stringify(state));
  } catch (err) {
    console.error('Error saving state:', err);
  }
};
```

3. **Persistence Strategy**:
   - Only authentication state is persisted
   - State is saved on every store update
   - Implements error handling for storage operations

### Best Practices Implemented

1. **Redux Toolkit Usage**:
   - Uses `configureStore` for simplified store setup
   - Implements slice pattern for state management
   - Includes built-in immutability checks

2. **Feature-Based Organization**:
   - State logic is separated by feature
   - Each feature has its own directory
   - Clear separation of concerns

3. **Selective Persistence**:
   - Only essential data (auth) is persisted
   - Implements proper error handling
   - Uses efficient storage methods

4. **Real-time Updates**:
   - WebSocket integration for real-time features
   - Separate slice for WebSocket state management

### Usage in Components

To use Redux in your components:

```javascript
// Selecting state
import { useSelector } from 'react-redux';
const authState = useSelector((state) => state.auth);

// Dispatching actions
import { useDispatch } from 'react-redux';
const dispatch = useDispatch();
dispatch(yourAction());
```

### State Updates

The store is configured to automatically save authentication state to localStorage whenever it changes:

```javascript
store.subscribe(() => {
  saveState({
    auth: store.getState().auth,
  });
});
```

This ensures that user sessions persist across page reloads while maintaining other state in memory only.