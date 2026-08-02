import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  handleReset = () => {
    try {
      localStorage.removeItem('kavio_students')
      localStorage.removeItem('kavio_firebase_config')
    } catch (e) {}
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F3F3F3] text-[#1A1A1A] flex flex-col items-center justify-center p-6 font-sans">
          <div className="bg-white p-6 rounded border border-[#E5E5E5] shadow-lg max-w-lg w-full space-y-4">
            <h2 className="text-base font-bold text-rose-600">Kavio Edu System Diagnostics</h2>
            <p className="text-xs text-gray-600">
              Detail kesalahan yang ditangkap oleh sistem:
            </p>
            <pre className="p-3 bg-slate-100 text-rose-700 text-[11px] font-mono rounded text-left overflow-x-auto max-h-48 border border-slate-200">
              {this.state.error ? (this.state.error.stack || this.state.error.toString()) : 'Unknown Error'}
            </pre>
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-[#0078D4] text-white rounded font-medium text-xs hover:bg-[#005A9E] w-full"
            >
              Reset Cache LocalStorage & Reload
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
