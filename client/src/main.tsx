import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'cesium/Build/Cesium/Widgets/widgets.css';
import './index.css'
import App from './components/App/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
