import { useParams } from 'react-router-dom';

/**
 * Queue Status Page Component
 */
const QueueStatus = () => {
  const { serviceId } = useParams();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Queue Status</h1>
        <p className="text-center text-gray-600">Service ID: {serviceId}</p>
        <p className="text-center text-gray-500 mt-4">Real-time queue status would be displayed here</p>
      </div>
    </div>
  );
};

export default QueueStatus;
