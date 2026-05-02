import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { SyncProvider } from './contexts/SyncContext'

// SyncProvider 持有 AppState，App 通过 useSync() 消费
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SyncProvider>
      <App />
    </SyncProvider>
  </StrictMode>,
)
