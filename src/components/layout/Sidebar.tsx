import { Link, useLocation } from 'react-router-dom'

const navigation = [
  { name: 'Dashboard', path: '/' },
  { name: 'Matches', path: '/matches' },
  { name: 'Players', path: '/players' },
  { name: 'Statistics', path: '/stats' },
]

const Sidebar = () => {
  const location = useLocation()

  return (
    <div className="w-64 bg-white shadow-lg min-h-screen">
      <nav className="mt-8">
        <div className="px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`
                  group flex items-center px-4 py-3 text-sm font-medium rounded-md
                  ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export default Sidebar