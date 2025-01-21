import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const Navbar = () => {
  const { user, signOut } = useAuthStore()

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-gray-800">
                Carrom Tracker
              </span>
            </Link>
          </div>

          <div className="flex items-center">
            {user && (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">
                  {user.displayName}
                </span>
                <img
                  src={user.photoURL || undefined}
                  alt="Profile"
                  className="h-8 w-8 rounded-full"
                />
                <button
                  onClick={() => signOut()}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar