import React, { useState, useEffect } from 'react';
import { useOfferHub, VerificationLevel } from '@/hooks/contracts';
import { getContractConfig } from '@/config/contracts';

/**
 * Example component demonstrating how to use OfferHub contract hooks
 * This component shows basic interactions with all contract types
 */
export const ContractExample: React.FC = () => {
  const [userAddress, setUserAddress] = useState<string>('');
  const [contractStatuses, setContractStatuses] = useState<any[]>([]);
  const [isAnyPaused, setIsAnyPaused] = useState<boolean>(false);
  
  // Get contract configuration
  const config = getContractConfig();
  
  // Use the main OfferHub hook
  const {
    userRegistry,
    escrow,
    publication,
    rating,
    dispute,
    loading,
    error,
    refreshAll,
    isAnyContractPaused,
    getContractStatuses,
  } = useOfferHub();

  // Load contract statuses on component mount
  useEffect(() => {
    const loadStatuses = async () => {
      try {
        const statuses = await getContractStatuses();
        setContractStatuses(statuses);
        
        const paused = await isAnyContractPaused();
        setIsAnyPaused(paused);
      } catch (err) {
        console.error('Error loading contract statuses:', err);
      }
    };

    loadStatuses();
  }, [getContractStatuses, isAnyContractPaused]);

  // Example: Verify a user
  const handleVerifyUser = async () => {
    if (!userAddress) {
      alert('Please enter a user address');
      return;
    }

    try {
      const success = await userRegistry.verifyUser(
        userAddress,
        VerificationLevel.VERIFIED,
        Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // 1 year from now
        'Example verification'
      );

      if (success) {
        alert('User verified successfully!');
      } else {
        alert('Failed to verify user');
      }
    } catch (err) {
      console.error('Error verifying user:', err);
      alert('Error verifying user');
    }
  };

  // Example: Get user profile
  const handleGetUserProfile = async () => {
    if (!userAddress) {
      alert('Please enter a user address');
      return;
    }

    try {
      const profile = await userRegistry.getUserProfile(userAddress);
      console.log('User profile:', profile);
      alert(`User profile loaded. Check console for details.`);
    } catch (err) {
      console.error('Error getting user profile:', err);
      alert('Error getting user profile');
    }
  };

  // Example: Submit a rating
  const handleSubmitRating = async () => {
    if (!userAddress) {
      alert('Please enter a user address');
      return;
    }

    try {
      const ratingId = await rating.submitRating(
        userAddress,
        5, // 5-star rating
        'Great work!',
        'service',
        'Example rating metadata'
      );

      if (ratingId) {
        alert(`Rating submitted with ID: ${ratingId}`);
      } else {
        alert('Failed to submit rating');
      }
    } catch (err) {
      console.error('Error submitting rating:', err);
      alert('Error submitting rating');
    }
  };

  // Example: Publish a service
  const handlePublishService = async () => {
    if (!userAddress) {
      alert('Please enter a user address');
      return;
    }

    try {
      const publicationId = await publication.publish(
        userAddress,
        'service',
        'Example Service',
        'web-development',
        1000000000, // 10 XLM in stroops
        Math.floor(Date.now() / 1000)
      );

      if (publicationId) {
        alert(`Service published with ID: ${publicationId}`);
      } else {
        alert('Failed to publish service');
      }
    } catch (err) {
      console.error('Error publishing service:', err);
      alert('Error publishing service');
    }
  };

  // Example: Get total users
  const handleGetTotalUsers = async () => {
    try {
      const totalUsers = await userRegistry.getTotalUsers();
      alert(`Total users: ${totalUsers}`);
    } catch (err) {
      console.error('Error getting total users:', err);
      alert('Error getting total users');
    }
  };

  // Example: Get platform rating stats
  const handleGetRatingStats = async () => {
    try {
      const stats = await rating.getPlatformRatingStats();
      console.log('Platform rating stats:', stats);
      alert('Rating stats loaded. Check console for details.');
    } catch (err) {
      console.error('Error getting rating stats:', err);
      alert('Error getting rating stats');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">OfferHub Contract Example</h1>
      
      {/* Configuration Display */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Configuration</h2>
        <p><strong>Network:</strong> {config.network}</p>
        <p><strong>Admin Address:</strong> {config.adminAddress}</p>
        <p><strong>Any Contract Paused:</strong> {isAnyPaused ? 'Yes' : 'No'}</p>
      </div>

      {/* Contract Statuses */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Contract Statuses</h2>
        {contractStatuses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contractStatuses.map((status, index) => (
              <div key={index} className="p-3 bg-white rounded border">
                <h3 className="font-semibold">{status.name}</h3>
                <p><strong>Address:</strong> {status.address}</p>
                <p><strong>Paused:</strong> {status.paused ? 'Yes' : 'No'}</p>
                <p><strong>Admin:</strong> {status.admin || 'None'}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>Loading contract statuses...</p>
        )}
      </div>

      {/* User Input */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">User Address</h2>
        <input
          type="text"
          value={userAddress}
          onChange={(e) => setUserAddress(e.target.value)}
          placeholder="Enter Stellar address (e.g., GB...)"
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="mb-4 p-4 bg-blue-100 text-blue-800 rounded">
          Loading...
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-800 rounded">
          Error: {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* User Registry Actions */}
        <div className="p-4 border rounded">
          <h3 className="font-semibold mb-2">User Registry</h3>
          <button
            onClick={handleVerifyUser}
            disabled={loading}
            className="w-full mb-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Verify User
          </button>
          <button
            onClick={handleGetUserProfile}
            disabled={loading}
            className="w-full mb-2 p-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            Get User Profile
          </button>
          <button
            onClick={handleGetTotalUsers}
            disabled={loading}
            className="w-full p-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
          >
            Get Total Users
          </button>
        </div>

        {/* Rating Actions */}
        <div className="p-4 border rounded">
          <h3 className="font-semibold mb-2">Rating System</h3>
          <button
            onClick={handleSubmitRating}
            disabled={loading}
            className="w-full mb-2 p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
          >
            Submit Rating
          </button>
          <button
            onClick={handleGetRatingStats}
            disabled={loading}
            className="w-full p-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
          >
            Get Rating Stats
          </button>
        </div>

        {/* Publication Actions */}
        <div className="p-4 border rounded">
          <h3 className="font-semibold mb-2">Publications</h3>
          <button
            onClick={handlePublishService}
            disabled={loading}
            className="w-full p-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-50"
          >
            Publish Service
          </button>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="mt-6 text-center">
        <button
          onClick={refreshAll}
          disabled={loading}
          className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
        >
          Refresh All Data
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Instructions</h2>
        <ol className="list-decimal list-inside space-y-1">
          <li>Enter a valid Stellar address in the input field</li>
          <li>Click any button to test contract interactions</li>
          <li>Check the browser console for detailed logs</li>
          <li>Use the refresh button to reload contract data</li>
        </ol>
        <p className="mt-2 text-sm text-gray-600">
          <strong>Note:</strong> This is a demo component. In production, you would implement proper error handling, loading states, and user authentication.
        </p>
      </div>
    </div>
  );
};

export default ContractExample;
