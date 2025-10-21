
import React from 'react';

const partners = [
  'Local Government Units (LGUs) in Cagayan towns',
  'Department of Agriculture (DA) and DTI Livelihood Programs',
  'Private agri-supply chains and training institutions',
  'Community cooperatives and youth groups',
];

const activeAreas = ['Tuguegarao City', 'Solana', 'Enrile', 'Peñablanca'];

const coreValues = [
    { value: 'Empowerment', description: 'We teach, train, and trust our partners to grow independently.' },
    { value: 'Integrity', description: 'Every deal, every egg, every promise — handled with honesty.' },
    { value: 'Community', description: 'We rise together. Farmers, families, and partners are one.' },
    { value: 'Innovation', description: 'We embrace technology and sustainable methods that work.' },
    { value: 'Stewardship', description: 'We protect our animals, our land, and our people.' },
];

const CommunityPage: React.FC = () => {
  return (
    <div>
      <div className="bg-primary text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-extrabold">Our Community</h1>
          <p className="mt-2 text-lg text-gray-200">We rise together. Farmers, families, and partners are one.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
          {/* Partners & Reach */}
          <div>
            <h2 className="text-3xl font-bold text-text-dark mb-6">Network & Reach</h2>
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-secondary">
                <h3 className="text-xl font-bold text-primary mb-3">Active Collaborations</h3>
                <ul className="space-y-2">
                  {partners.map(partner => <li key={partner} className="flex items-start"><span className="text-secondary font-bold mr-2">✓</span> {partner}</li>)}
                </ul>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-accent">
                <h3 className="text-xl font-bold text-primary mb-3">Our Growing Reach</h3>
                <p className="text-gray-600 mb-4">We are expanding across Cagayan Valley, organizing farmers into "Farmer Clusters" for efficient mentoring and resource sharing.</p>
                <div className="grid grid-cols-2 gap-2">
                  {activeAreas.map(area => <div key={area} className="flex items-center"><span className="text-accent mr-2">📍</span> {area}</div>)}
                </div>
              </div>
            </div>
          </div>

          {/* Core Values */}
          <div>
            <h2 className="text-3xl font-bold text-text-dark mb-6">Our Core Values</h2>
            <div className="space-y-4">
                {coreValues.map(v => (
                    <div key={v.value} className="bg-white p-4 rounded-lg shadow-md">
                        <h4 className="font-bold text-secondary">{v.value}</h4>
                        <p className="text-gray-600">{v.description}</p>
                    </div>
                ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
