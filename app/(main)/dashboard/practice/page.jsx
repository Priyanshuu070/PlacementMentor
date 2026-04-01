"use client";
import React, { useState } from 'react';
import { 
  Code, 
  Brain, 
  FileText, 
  Map, 
  Wrench, 
  ExternalLink, 
  Star, 
  Download, 
  Clock,
  Users,
  TrendingUp,
  BookOpen,
  Video,
  Github,
  Bookmark,
  Target,
  Award,
  Calendar,
  DollarSign,
  Lightbulb,
  MessageSquare,
  ChevronRight,
  Search,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';

function PracticeResources() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const resourceCategories = [
    { id: 'all', name: 'All Resources', icon: BookOpen },
    { id: 'coding', name: 'Coding & DSA', icon: Code },
    { id: 'behavioral', name: 'Behavioral', icon: Brain },
    { id: 'resume', name: 'Resume & Portfolio', icon: FileText },
    { id: 'roadmaps', name: 'Learning Paths', icon: Map },
    { id: 'tools', name: 'Bonus Tools', icon: Wrench },
    { id: 'non-tech', name: 'Non-Tech Roles', icon: Users }
  ];

  const codingResources = [
    {
      title: "Striver's A2Z DSA Sheet",
      description: "Complete Data Structures & Algorithms roadmap with 450+ problems",
      url: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/",
      type: "free",
      difficulty: "beginner-advanced",
      tags: ["DSA", "Problems", "Complete Guide"],
      icon: Target,
      category: 'coding'
    },
    {
      title: "Love Babbar's 450 DSA Questions",
      description: "Curated list of most important coding interview questions",
      url: "https://450dsa.com/",
      type: "free",
      difficulty: "intermediate",
      tags: ["DSA", "Interview Prep", "Curated"],
      icon: Code,
      category: 'coding'
    },
    {
      title: "LeetCode Top Interview Questions",
      description: "Most frequently asked coding questions in FAANG interviews",
      url: "https://leetcode.com/explore/interview/card/top-interview-questions-easy/",
      type: "freemium",
      difficulty: "all-levels",
      tags: ["Leetcode", "FAANG", "Practice"],
      icon: Award,
      category: 'coding'
    },
    {
      title: "Neetcode 150",
      description: "150 essential coding interview problems with video solutions",
      url: "https://neetcode.io/practice",
      type: "free",
      difficulty: "intermediate",
      tags: ["Video Solutions", "Curated", "Patterns"],
      icon: Video,
      category: 'coding'
    },
    {
      title: "The Algorithms - GitHub",
      description: "Open Source resource for learning Data Structures & Algorithms",
      url: "https://github.com/TheAlgorithms",
      type: "free",
      difficulty: "all-levels",
      tags: ["Open Source", "Multiple Languages", "Implementation"],
      icon: Github,
      category: 'coding'
    }
  ];

  const behavioralResources = [
    {
      title: "STAR Method Mastery Guide",
      description: "Complete framework for answering behavioral questions effectively",
      url: "#",
      type: "premium",
      difficulty: "beginner",
      tags: ["Framework", "Structure", "Examples"],
      icon: Star,
      category: 'behavioral'
    },
    {
      title: "50 Most Common HR Questions",
      description: "Comprehensive list with sample answers and tips",
      url: "#",
      type: "free",
      difficulty: "all-levels",
      tags: ["HR Questions", "Sample Answers", "Tips"],
      icon: MessageSquare,
      category: 'behavioral'
    },
    {
      title: "Amazon Leadership Principles",
      description: "Deep dive into Amazon's 16 leadership principles with examples",
      url: "https://www.amazon.jobs/content/en/our-workplace/leadership-principles",
      type: "free",
      difficulty: "intermediate",
      tags: ["Amazon", "Leadership", "Principles"],
      icon: Users,
      category: 'behavioral'
    },
    {
      title: "Google's Project Oxygen",
      description: "What makes a great manager - behavioral insights from Google",
      url: "#",
      type: "free",
      difficulty: "advanced",
      tags: ["Google", "Management", "Research"],
      icon: Lightbulb,
      category: 'behavioral'
    }
  ];

  const resumeResources = [
    {
      title: "ATS-Friendly Resume Template",
      description: "Google Docs template optimized for Applicant Tracking Systems",
      url: "#",
      type: "free",
      difficulty: "beginner",
      tags: ["ATS", "Template", "Google Docs"],
      icon: FileText,
      category: 'resume'
    },
    {
      title: "Tech Resume Checklist",
      description: "20-point checklist to make your tech resume stand out",
      url: "#",
      type: "free",
      difficulty: "all-levels",
      tags: ["Checklist", "Optimization", "Tech"],
      icon: Target,
      category: 'resume'
    },
    {
      title: "Portfolio Website Builder",
      description: "Step-by-step guide to building an impressive developer portfolio",
      url: "#",
      type: "premium",
      difficulty: "intermediate",
      tags: ["Portfolio", "Website", "Guide"],
      icon: Code,
      category: 'resume'
    },
    {
      title: "LinkedIn Profile Optimizer",
      description: "Complete guide to creating a compelling LinkedIn profile",
      url: "#",
      type: "free",
      difficulty: "beginner",
      tags: ["LinkedIn", "Profile", "Networking"],
      icon: Users,
      category: 'resume'
    }
  ];

  const roadmapResources = [
    {
      title: "Frontend Developer Roadmap 2024",
      description: "Complete learning path from beginner to senior frontend developer",
      url: "https://roadmap.sh/frontend",
      type: "free",
      difficulty: "all-levels",
      tags: ["Frontend", "Roadmap", "2024"],
      icon: Code,
      category: 'roadmaps'
    },
    {
      title: "Backend Developer Roadmap",
      description: "Comprehensive guide to becoming a backend engineer",
      url: "https://roadmap.sh/backend",
      type: "free",
      difficulty: "all-levels",
      tags: ["Backend", "Server", "APIs"],
      icon: Code,
      category: 'roadmaps'
    },
    {
      title: "DevOps Engineer Roadmap",
      description: "Path to mastering DevOps tools and practices",
      url: "https://roadmap.sh/devops",
      type: "free",
      difficulty: "intermediate",
      tags: ["DevOps", "Infrastructure", "Automation"],
      icon: Wrench,
      category: 'roadmaps'
    },
    {
      title: "System Design Primer",
      description: "Learn how to design large-scale distributed systems",
      url: "https://github.com/donnemartin/system-design-primer",
      type: "free",
      difficulty: "advanced",
      tags: ["System Design", "Architecture", "Scalability"],
      icon: Map,
      category: 'roadmaps'
    }
  ];

  const nonTechResources = [
    {
      title: "Product Manager Interview Guide",
      description: "Comprehensive guide for PM interviews at top tech companies",
      url: "#",
      type: "premium",
      difficulty: "intermediate",
      tags: ["Product Management", "Strategy", "Frameworks"],
      icon: TrendingUp,
      category: 'non-tech'
    },
    {
      title: "UX/UI Designer Portfolio Guide",
      description: "How to create a compelling design portfolio that gets interviews",
      url: "#",
      type: "free",
      difficulty: "all-levels",
      tags: ["UX", "UI", "Portfolio", "Design"],
      icon: FileText,
      category: 'non-tech'
    },
    {
      title: "Sales Interview Preparation",
      description: "Master sales methodologies and common interview scenarios",
      url: "#",
      type: "free",
      difficulty: "beginner",
      tags: ["Sales", "Methodologies", "Scenarios"],
      icon: TrendingUp,
      category: 'non-tech'
    },
    {
      title: "Marketing Case Study Framework",
      description: "Approach marketing case studies like a consultant",
      url: "#",
      type: "premium",
      difficulty: "intermediate",
      tags: ["Marketing", "Case Studies", "Framework"],
      icon: Target,
      category: 'non-tech'
    },
    {
      title: "Consulting Interview Prep",
      description: "Master case interviews for McKinsey, BCG, and Bain",
      url: "#",
      type: "premium",
      difficulty: "advanced",
      tags: ["Consulting", "Case Studies", "MBB"],
      icon: Brain,
      category: 'non-tech'
    },
    {
      title: "Finance Interview Questions",
      description: "Technical and behavioral questions for finance roles",
      url: "#",
      type: "free",
      difficulty: "intermediate",
      tags: ["Finance", "Technical", "Behavioral"],
      icon: DollarSign,
      category: 'non-tech'
    }
  ];

  const bonusTools = [
    {
      title: "Resume Analyzer",
      description: "AI-powered tool to optimize your resume for ATS systems",
      url: "#",
      type: "coming-soon",
      difficulty: "all-levels",
      tags: ["AI", "ATS", "Analysis"],
      icon: FileText,
      category: 'tools',
      comingSoon: true
    },
    {
      title: "Mock Interview Scheduler",
      description: "Schedule practice interviews with industry professionals",
      url: "#",
      type: "premium",
      difficulty: "all-levels",
      tags: ["Mock Interviews", "Scheduling", "Practice"],
      icon: Calendar,
      category: 'tools'
    },
    {
      title: "Salary Comparison Tool",
      description: "Compare salaries across companies and locations",
      url: "#",
      type: "free",
      difficulty: "all-levels",
      tags: ["Salary", "Comparison", "Market Data"],
      icon: DollarSign,
      category: 'tools'
    },
    {
      title: "Interview Progress Tracker",
      description: "Track your interview preparation progress and weak areas",
      url: "#",
      type: "free",
      difficulty: "all-levels",
      tags: ["Progress", "Tracking", "Analytics"],
      icon: TrendingUp,
      category: 'tools'
    }
  ];

  const allResources = [
    ...codingResources,
    ...behavioralResources,
    ...resumeResources,
    ...roadmapResources,
    ...nonTechResources,
    ...bonusTools
  ];

  const filteredResources = allResources.filter(resource => {
    const matchesFilter = activeFilter === 'all' || resource.category === activeFilter;
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const ResourceCard = ({ resource }) => {
    const IconComponent = resource.icon;
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <IconComponent className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {resource.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                {resource.type === 'free' && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Free</span>
                )}
                {resource.type === 'premium' && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Premium</span>
                )}
                {resource.type === 'freemium' && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">Freemium</span>
                )}
                {resource.comingSoon && (
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">Coming Soon</span>
                )}
              </div>
            </div>
          </div>
          {!resource.comingSoon && (
            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
          )}
        </div>
        
        <p className="text-gray-600 mb-4 text-sm leading-relaxed">
          {resource.description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {resource.tags.map((tag, index) => (
            <span 
              key={index}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 capitalize">
            {resource.difficulty.replace('-', ' ')}
          </span>
          {resource.comingSoon ? (
            <Button disabled variant="outline" size="sm">
              Coming Soon
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(resource.url, '_blank')}
              className="group-hover:bg-blue-50 group-hover:border-blue-300"
            >
              Access <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Practice Resources
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Your complete interview preparation vault. Curated resources, templates, and tools 
          to help you land your dream job.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="text-center p-6 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{allResources.length}+</div>
          <div className="text-sm text-blue-700">Total Resources</div>
        </div>
        <div className="text-center p-6 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {allResources.filter(r => r.type === 'free').length}
          </div>
          <div className="text-sm text-green-700">Free Resources</div>
        </div>
        <div className="text-center p-6 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">6</div>
          <div className="text-sm text-purple-700">Categories</div>
        </div>
        <div className="text-center p-6 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">Weekly</div>
          <div className="text-sm text-orange-700">Updates</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {resourceCategories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        {resourceCategories.map(category => {
          const IconComponent = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setActiveFilter(category.id)}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                activeFilter === category.id
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <IconComponent className="w-4 h-4 mr-2" />
              {category.name}
            </button>
          );
        })}
      </div>

      {/* Resources Grid */}
      {filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource, index) => (
            <ResourceCard key={index} resource={resource} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Call to Action */}
      <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-4">Ready to Start Your Interview Prep?</h2>
        <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
          Use these resources alongside NexPrep's AI-powered mock interviews to maximize your chances of success.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button className="bg-white text-blue-600 hover:bg-blue-50">
            Start Practice Interview
          </Button>
          <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
            Generate Questions
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PracticeResources;