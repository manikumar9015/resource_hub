// frontend/src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import resourceService from '../api/resource';
import ResourceCard from '../components/ResourceCard';
import { FiLoader } from 'react-icons/fi';

const HomePage = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get('search') || '';

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        const response = await resourceService.getAll(searchTerm);
        setResources(response.data);
      } catch (err) {
        setError('Could not fetch resources. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [searchTerm]);

  if (loading) {
    return (
        <div className="flex justify-center items-center mt-20">
            <FiLoader className="animate-spin text-4xl text-white" />
        </div>
    );
  }

  if (error) {
    return (
        <div className="max-w-5xl mx-auto text-center mt-10 bg-[#181818] p-8 rounded-lg border border-[#282828]">
            <h2 className="text-xl font-bold text-white">An Error Occurred</h2>
            <p className="text-gray-400">{error}</p>
        </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-center mb-8 text-white">
        {searchTerm ? `Search Results for "${searchTerm}"` : 'Available Study Resources'}
      </h1>

      {resources.length === 0 ? (
        <div className="text-center bg-[#181818] p-12 rounded-lg border border-[#282828]">
            {searchTerm
                ? <p className="text-gray-400">No resources found matching your search. Try different keywords!</p>
                : <p className="text-gray-400">No approved resources are available yet. Check back later!</p>
            }
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1">
          {resources.map((resource) => (
            // Added shadow, z-index, and updated transition for a complete hover effect
            <div 
              key={resource._id} 
              className="transition-all duration-300 hover:scale-[1.02] hover:z-10 hover:shadow-2xl hover:shadow-white/5"
            >
                <ResourceCard resource={resource} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;  