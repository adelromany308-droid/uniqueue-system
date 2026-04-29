import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Home Page Component
 * Landing page with navigation to login/register
 */
const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-primary-600 font-bold text-xl">U</span>
            </div>
            <h1 className="text-white text-2xl font-bold">UniQueue</h1>
          </div>
          
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="bg-white text-primary-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <div className="space-x-4">
              <Link
                to="/login"
                className="text-white hover:text-gray-200 font-medium transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-white text-primary-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Smart Queue Management for Universities
          </h2>
          <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
            Skip the long lines. Book your spot, track your position in real-time, 
            and get notified when it's your turn. Perfect for student services, 
            admissions, and more.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/register"
                  className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/login"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-primary-600 transition-all"
                >
                  Sign In
                </Link>
              </>
            ) : (
              <Link
                to="/dashboard"
                className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105"
              >
                Go to Dashboard
              </Link>
            )}
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
              <div className="w-14 h-14 bg-white/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">Save Time</h3>
              <p className="text-primary-100">Book your spot and arrive just when it's your turn. No more waiting in long queues.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
              <div className="w-14 h-14 bg-white/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">Real-Time Updates</h3>
              <p className="text-primary-100">Track your position live and get instant notifications when your turn is approaching.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
              <div className="w-14 h-14 bg-white/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">Easy Management</h3>
              <p className="text-primary-100">Simple interface for both students and staff. Manage queues efficiently.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-20 border-t border-white/20">
        <div className="text-center text-primary-200">
          <p>&copy; 2024 UniQueue. Smart Queue Management System.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
