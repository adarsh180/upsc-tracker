'use client';

import { useState, useEffect, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, Bookmark, Calendar, Star, ExternalLink, BookmarkCheck, Brain } from 'lucide-react';
import GlassCard from './GlassCard';

interface NewsArticle {
  id: number;
  title: string;
  content: string;
  category: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
  date: string;
  source: 'The Hindu' | 'Indian Express';
  source_url: string;
  tags: string[];
  upsc_relevance: number;
  is_bookmarked: boolean;
  is_read: boolean;
}

function CurrentAffairs() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedImportance, setSelectedImportance] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [showBookmarked, setShowBookmarked] = useState(false);

  useEffect(() => {
    fetchCurrentAffairs();
  }, []);

  const fetchCurrentAffairs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/current-affairs');
      const data = await response.json();
      setArticles(data.data || []);
    } catch (error) {
      console.error('Failed to fetch current affairs:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = async (id: number) => {
    try {
      await fetch('/api/current-affairs/bookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      
      setArticles(prev => prev.map(article => 
        article.id === id ? { ...article, is_bookmarked: !article.is_bookmarked } : article
      ));
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await fetch('/api/current-affairs/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      
      setArticles(prev => prev.map(article => 
        article.id === id ? { ...article, is_read: true } : article
      ));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const generateQuestions = async (articleId: number) => {
    try {
      const response = await fetch('/api/questions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId })
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`Generated ${data.questions.length} high-level UPSC questions! Check the Question Bank.`);
      } else {
        alert('Failed to generate questions. Please try again.');
      }
    } catch (error) {
      console.error('Failed to generate questions:', error);
      alert('Failed to generate questions. Please try again.');
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-400/30';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-400/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-400/30';
      case 'low': return 'text-green-400 bg-green-500/20 border-green-400/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-400/30';
    }
  };

  const getSourceColor = (source: string) => {
    return source === 'The Hindu' 
      ? 'text-blue-400 bg-blue-500/20' 
      : 'text-purple-400 bg-purple-500/20';
  };

  const filteredArticles = useMemo(() => articles.filter(article => {
    if (selectedCategory && article.category !== selectedCategory) return false;
    if (selectedImportance && article.importance !== selectedImportance) return false;
    if (selectedSource && article.source !== selectedSource) return false;
    if (showBookmarked && !article.is_bookmarked) return false;
    return true;
  }), [articles, selectedCategory, selectedImportance, selectedSource, showBookmarked]);

  const categories = useMemo(() => Array.from(new Set(articles.map(a => a.category))), [articles]);
  const todayArticles = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return articles.filter(a => a.date === today);
  }, [articles]);

  if (loading) {
    return (
      <GlassCard className="animate-pulse">
        <div className="h-96 bg-white/5 rounded-xl" />
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="text-center bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-400/20">
          <Newspaper className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-400">{todayArticles.length}</div>
          <div className="text-xs text-neutral-400">Today's News</div>
        </GlassCard>
        
        <GlassCard className="text-center bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-400/20">
          <Star className="w-6 h-6 text-red-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-red-400">
            {articles.filter(a => a.importance === 'critical').length}
          </div>
          <div className="text-xs text-neutral-400">Critical News</div>
        </GlassCard>
        
        <GlassCard className="text-center bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-400/20">
          <Bookmark className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-yellow-400">
            {articles.filter(a => a.is_bookmarked).length}
          </div>
          <div className="text-xs text-neutral-400">Bookmarked</div>
        </GlassCard>
        
        <GlassCard className="text-center bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-400/20">
          <Calendar className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-400">
            {Math.round(articles.reduce((sum, a) => sum + a.upsc_relevance, 0) / articles.length) || 0}%
          </div>
          <div className="text-xs text-neutral-400">Avg UPSC Relevance</div>
        </GlassCard>
      </div>

      {/* Main Content */}
      <GlassCard className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-400/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.div
              className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-400/20"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Newspaper className="w-8 h-8 text-indigo-400" />
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold gradient-text-primary">Current Affairs</h3>
              <p className="text-sm text-neutral-400">UPSC-relevant news from The Hindu & Indian Express</p>
            </div>
          </div>
          
          <button
            onClick={fetchCurrentAffairs}
            className="px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/30 rounded-lg transition-colors text-sm"
          >
            Refresh News
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-indigo-400/50 focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          
          <select
            value={selectedImportance}
            onChange={(e) => setSelectedImportance(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-indigo-400/50 focus:outline-none"
          >
            <option value="">All Importance</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-indigo-400/50 focus:outline-none"
          >
            <option value="">All Sources</option>
            <option value="The Hindu">The Hindu</option>
            <option value="Indian Express">Indian Express</option>
          </select>
          
          <button
            onClick={() => setShowBookmarked(!showBookmarked)}
            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
              showBookmarked 
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/30' 
                : 'bg-white/5 text-neutral-400 border border-white/10 hover:border-white/20'
            }`}
          >
            <Bookmark className="w-4 h-4 inline mr-1" />
            Bookmarked Only
          </button>
        </div>

        {/* Articles Grid */}
        <div className="space-y-4">
          {filteredArticles.slice(0, 10).map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-xl border transition-all ${
                article.is_read 
                  ? 'bg-white/5 border-white/10 opacity-75' 
                  : 'bg-white/10 border-white/20 hover:border-indigo-400/30'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${getSourceColor(article.source)}`}>
                      {article.source}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs border ${getImportanceColor(article.importance || 'medium')}`}>
                      {(article.importance || 'medium').toUpperCase()}
                    </span>
                    <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs">
                      {article.category}
                    </span>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                      {article.upsc_relevance}% UPSC Relevant
                    </span>
                    <span className="text-xs text-neutral-500">
                      {new Date(article.date).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h4 className="text-lg font-semibold text-white mb-2 leading-tight">
                    {article.title}
                  </h4>
                  
                  <p className="text-neutral-300 text-sm leading-relaxed mb-3">
                    {article.content}
                  </p>
                  
                  {article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {article.tags.slice(0, 5).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => toggleBookmark(article.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      article.is_bookmarked
                        ? 'text-yellow-400 bg-yellow-500/20 hover:bg-yellow-500/30'
                        : 'text-neutral-400 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    {article.is_bookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  </button>
                  
                  <button
                    onClick={() => generateQuestions(article.id)}
                    className="p-2 text-purple-400 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-colors"
                    title="Generate UPSC Questions"
                  >
                    <Brain className="w-4 h-4" />
                  </button>
                  
                  <a
                    href={article.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => markAsRead(article.id)}
                    className="p-2 text-indigo-400 bg-indigo-500/20 hover:bg-indigo-500/30 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12 text-neutral-400">
            <Newspaper className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No articles found</p>
            <p className="text-sm">Try adjusting your filters or refresh the news</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

export default memo(CurrentAffairs);