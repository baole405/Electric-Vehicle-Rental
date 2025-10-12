import React from 'react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          About EV Rental
        </h1>
        <div className="max-w-3xl mx-auto">
          <p className="text-lg text-gray-600 mb-6">
            We are committed to providing sustainable transportation solutions
            through our electric vehicle rental service.
          </p>
          <p className="text-lg text-gray-600">
            Join us in creating a cleaner, greener future for transportation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
