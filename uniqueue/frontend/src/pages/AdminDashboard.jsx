/**
 * Admin Dashboard Component
 */
const AdminDashboard = () => {
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
            <div className="text-sm text-gray-600">Admin Dashboard</div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Dashboard</h2>
            <p className="text-gray-600 mb-6">Admin features include:</p>
            <ul className="text-left text-gray-700 space-y-2 mb-8">
              <li>✓ Manage users (students, staff, admins)</li>
              <li>✓ Create and configure services</li>
              <li>✓ View queue statistics and reports</li>
              <li>✓ Open/close queues for services</li>
              <li>✓ Manage feedback and responses</li>
              <li>✓ Generate daily/weekly reports</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
