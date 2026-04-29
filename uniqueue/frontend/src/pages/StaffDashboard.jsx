/**
 * Staff Dashboard Component
 */
const StaffDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">U</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">UniQueue</h1>
            </div>
            <div className="text-sm text-gray-600">Staff Dashboard</div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Staff Dashboard</h2>
            <p className="text-gray-600 mb-6">Features for staff members:</p>
            <ul className="text-left text-gray-700 space-y-2 mb-8">
              <li>✓ View and manage queue for assigned services</li>
              <li>✓ Call next token in queue</li>
              <li>✓ Update token status (calling → serving → completed)</li>
              <li>✓ View student information</li>
              <li>✓ Monitor wait times and queue statistics</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StaffDashboard;
