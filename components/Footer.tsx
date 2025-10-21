
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} Legal Chicks Empowerment Network (LCEN). All Rights Reserved.</p>
        <p className="mt-1">Livelihood and Agribusiness Movement | Built with a Hybrid Model.</p>
      </div>
    </footer>
  );
};

export default Footer;
