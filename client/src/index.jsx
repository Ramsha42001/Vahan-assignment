import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { Provider } from 'react-redux';
import { store } from './redux/store.js';
import { ChatProvider } from './ChatContext'; // Import the ChatProvider

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <ChatProvider>
        <App />
      </ChatProvider>
    </Provider>
  </React.StrictMode>
); 