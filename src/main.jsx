import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux';
import './styles/index.scss'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import store from '../src/redux/store.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
  <Provider store={store}>
    <App />
  </Provider>
  </StrictMode>
)
