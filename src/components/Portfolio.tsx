'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ArrowTopRightOnSquareIcon, CodeBracketIcon } from '@heroicons/react/24/outline';

const Portfolio = () => {
  const projects = [
    {
      id: 1,
      title: 'E-commerce Platform',
      description: 'Modern e-commerce solution with payment integration',
      image: '🛍️',
      technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      category: 'Website',
      color: 'from-neon-green to-emerald-500',
    },
    {
      id: 2,
      title: 'Restaurant Chatbot',
      description: 'WhatsApp chatbot for restaurant orders and reservations',
      image: '🍕',
      technologies: ['Python', 'WhatsApp API', 'Google Sheets'],
      category: 'Chatbot',
      color: 'from-neon-cyan to-blue-500',
    },
    {
      id: 3,
      title: 'Corporate Website',
      description: 'Professional corporate website with CMS',
      image: '🏢',
      technologies: ['Next.js', 'TypeScript', 'Tailwind CSS'],
      category: 'Website',
      color: 'from-neon-pink to-purple-500',
    },
    {
      id: 4,
      title: 'Customer Support Bot',
      description: 'AI-powered customer support integration',
      image: '🤖',
      technologies: ['Python', 'OpenAI', 'Telegram API'],
      category: 'Chatbot',
      color: 'from-neon-yellow to-orange-500',
    },
    {
      id: 5,
      title: 'Landing Page Pro',
      description: 'High-conversion landing page for SaaS',
      image: '🚀',
      technologies: ['React', 'Framer Motion', 'Analytics'],
      category: 'Website',
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 6,
      title: 'Booking System Bot',
      description: 'Automated booking system with calendar integration',
      image: '📅',
      technologies: ['Node.js', 'Google Calendar', 'WhatsApp'],
      category: 'Integration',
      color: 'from-green-500 to-teal-500',
    },
  ];

  const categories = ['All', 'Website', 'Chatbot', 'Integration'];
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredProjects = activeCategory === 'All' 
    ? projects 
    : projects.filter(project => project.category === activeCategory);

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-neon-green to-neon-cyan bg-clip-text text-transparent">
              Our Portfolio
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Discover our latest projects and successful implementations
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex justify-center mb-12"
        >
          <div className="flex space-x-4 bg-gray-800/50 rounded-lg p-2 border border-gray-700">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                  activeCategory === category
                    ? 'bg-neon-green text-black'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-gray-800/50 backdrop-blur-md rounded-xl overflow-hidden border border-gray-700 hover:border-neon-green/50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-neon-green/20">
                {/* Project Image/Icon */}
                <div className={`h-48 bg-gradient-to-r ${project.color} flex items-center justify-center text-6xl`}>
                  {project.image}
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r ${project.color} text-white`}>
                      {project.category}
                    </span>
                    <div className="flex space-x-2">
                      <button className="p-2 bg-gray-700 rounded-lg hover:bg-neon-green hover:text-black transition-colors">
                        <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                      </button>
                      <button className="p-2 bg-gray-700 rounded-lg hover:bg-neon-green hover:text-black transition-colors">
                        <CodeBracketIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3">
                    {project.title}
                  </h3>

                  <p className="text-gray-300 mb-4 leading-relaxed">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded-lg"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-16"
        >
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready to Start Your Project?
          </h3>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Let&apos;s discuss how we can help bring your digital vision to life with our expertise in web development and chatbot solutions.
          </p>
          <button className="px-8 py-4 bg-gradient-to-r from-neon-green to-emerald-500 text-black font-bold rounded-lg hover:shadow-lg hover:shadow-neon-green/50 transition-all duration-300 transform hover:scale-105">
            Start Your Project
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Portfolio;
