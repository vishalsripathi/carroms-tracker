import { TestFirebase } from './components/auth/TestFirebase'

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Carrom Tournament Tracker</h1>
        <TestFirebase />
      </div>
    </div>
  )
}

export default App