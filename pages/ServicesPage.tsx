
import React from 'react';

const services = [
  {
    icon: '👨‍🏫',
    title: '1. Training & Mentorship',
    description: 'We conduct hands-on workshops and online programs on poultry raising, disease control, feed formulation, and egg management — designed for both beginners and seasoned farmers.',
    image: 'https://images.unsplash.com/photo-1587325490426-303c2a415a7a?q=80&w=800&auto=format&fit=crop',
  },
  {
    icon: '📦',
    title: '2. Starter Opportunity Packages',
    description: 'Affordable start-up kits include: Vaccinated chicks (RIR/Australorp), feeds/vitamins for the first cycle, a step-by-step care guide, and a starter coop layout plan.',
    image: 'https://images.unsplash.com/photo-1599557388485-f62d15dd00f3?q=80&w=800&auto=format&fit=crop',
  },
  {
    icon: '💊',
    title: '3. Access to Supplies & Feeds',
    description: 'Through the Legal Chicks network, farmers enjoy discounted feeds, vaccines, and pelletized nutrition produced locally — cutting costs and ensuring quality control.',
    image: 'https://images.unsplash.com/photo-1620789456903-1c3c95a5f978?q=80&w=800&auto=format&fit=crop',
  },
  {
    icon: '🛒',
    title: '4. Brand Partnership & Market Access',
    description: 'Members can market under the Legal Chicks label, gaining instant brand credibility. We also assist with bulk selling, farm-to-market connections, and digital visibility.',
    image: 'https://images.unsplash.com/photo-1578632292332-016d25244a36?q=80&w=800&auto=format&fit=crop',
  },
];

const ServicesPage: React.FC = () => {
  return (
    <div className="overflow-y-auto h-full">
      <div className="bg-primary text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-extrabold md:text-4xl">LCEN Services</h1>
          <p className="mt-2 text-lg text-gray-200">End-to-End Livelihood Solutions for Our Members.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service) => (
            <div key={service.title} className="bg-white rounded-xl shadow-lg overflow-hidden transform transition hover:-translate-y-1 duration-300">
              <img className="h-48 w-full object-cover" src={service.image} alt={service.title} />
              <div className="p-6">
                <div className="flex items-center mb-3">
                    <div className="text-3xl mr-3">{service.icon}</div>
                    <h3 className="text-xl font-bold text-primary">{service.title}</h3>
                </div>
                <p className="text-gray-600">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
