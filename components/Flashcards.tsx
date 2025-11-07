'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import GlassCard from './GlassCard';

interface Flashcard {
  id: number;
  subject: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  last_reviewed: string;
  review_count: number;
  success_rate: number;
}

export default function Flashcards() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [newCard, setNewCard] = useState({
    subject: '',
    question: '',
    answer: '',
    difficulty: 'medium' as const
  });

  useEffect(() => {
    fetchFlashcards();
  }, []);

  const fetchFlashcards = async () => {
    try {
      const response = await fetch('/api/flashcards');
      const data = await response.json();
      setFlashcards(data.data || []);
    } catch (error) {
      console.error('Failed to fetch flashcards:', error);
    }
  };

  const saveCard = async () => {
    try {
      const response = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCard)
      });

      if (response.ok) {
        fetchFlashcards();
        setShowAddCard(false);
        setNewCard({ subject: '', question: '', answer: '', difficulty: 'medium' });
      }
    } catch (error) {
      console.error('Failed to save flashcard:', error);
    }
  };

  const deleteCard = async (id: number) => {
    try {
      await fetch(`/api/flashcards?id=${id}`, { method: 'DELETE' });
      fetchFlashcards();
      if (currentIndex >= flashcards.length - 1) {
        setCurrentIndex(Math.max(0, flashcards.length - 2));
      }
    } catch (error) {
      console.error('Failed to delete flashcard:', error);
    }
  };

  const markReview = async (correct: boolean) => {
    if (flashcards.length === 0) return;
    
    try {
      await fetch('/api/flashcards/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: flashcards[currentIndex].id,
          correct
        })
      });
      
      nextCard();
    } catch (error) {
      console.error('Failed to mark review:', error);
    }
  };

  const nextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    setIsFlipped(false);
  };

  const prevCard = () => {
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    setIsFlipped(false);
  };

  const filteredCards = selectedSubject 
    ? flashcards.filter(card => card.subject === selectedSubject)
    : flashcards;

  const subjects = Array.from(new Set(flashcards.map(card => card.subject)));
  const currentCard = filteredCards[currentIndex];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'hard': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <GlassCard className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-400/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.div
              className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/20"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <RotateCcw className="w-8 h-8 text-purple-400" />
            </motion.div>
            <div>
              <h3 className="text-2xl font-bold gradient-text-primary">Flashcards</h3>
              <p className="text-sm text-neutral-400">Interactive revision cards</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-purple-400/50 focus:outline-none"
            >
              <option value="">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
            <button
              onClick={() => setShowAddCard(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Card
            </button>
          </div>
        </div>

        {filteredCards.length > 0 ? (
          <div className="space-y-6">
            {/* Card Display */}
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ rotateY: 0 }}
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6 }}
                  className="relative h-64 cursor-pointer"
                  onClick={() => setIsFlipped(!isFlipped)}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Front Side */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-xl p-6 flex flex-col justify-center"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(currentCard?.difficulty || 'medium')}`}>
                        {currentCard?.difficulty?.toUpperCase()}
                      </span>
                      <span className="text-xs text-purple-400 bg-purple-500/20 px-2 py-1 rounded-full">
                        {currentCard?.subject}
                      </span>
                    </div>
                    <div className="text-center">
                      <h4 className="text-lg font-semibold text-white mb-4">Question</h4>
                      <p className="text-neutral-200 text-lg leading-relaxed">
                        {currentCard?.question}
                      </p>
                    </div>
                    <div className="text-center mt-4 text-xs text-neutral-400">
                      Click to reveal answer
                    </div>
                  </div>

                  {/* Back Side */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-green-400/30 rounded-xl p-6 flex flex-col justify-center"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    <div className="text-center">
                      <h4 className="text-lg font-semibold text-green-400 mb-4">Answer</h4>
                      <p className="text-neutral-200 text-lg leading-relaxed">
                        {currentCard?.answer}
                      </p>
                    </div>
                    <div className="flex justify-center gap-4 mt-6">
                      <button
                        onClick={(e) => { e.stopPropagation(); markReview(false); }}
                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 rounded-lg text-red-400 transition-colors"
                      >
                        Incorrect
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); markReview(true); }}
                        className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 rounded-lg text-green-400 transition-colors"
                      >
                        Correct
                      </button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={prevCard}
                  disabled={filteredCards.length <= 1}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                
                <div className="text-center">
                  <div className="text-sm text-neutral-400">
                    {currentIndex + 1} of {filteredCards.length}
                  </div>
                  {currentCard && (
                    <div className="text-xs text-neutral-500 mt-1">
                      Success Rate: {Math.round(currentCard.success_rate)}% • 
                      Reviewed: {currentCard.review_count} times
                    </div>
                  )}
                </div>
                
                <button
                  onClick={nextCard}
                  disabled={filteredCards.length <= 1}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-neutral-400">
            <RotateCcw className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No flashcards available</p>
            <p className="text-sm">Create your first flashcard to start studying!</p>
          </div>
        )}
      </GlassCard>

      {/* Add Card Modal */}
      {showAddCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <GlassCard className="w-full max-w-2xl">
            <h3 className="text-xl font-semibold text-purple-400 mb-4">Create New Flashcard</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Subject"
                  value={newCard.subject}
                  onChange={(e) => setNewCard({...newCard, subject: e.target.value})}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-400 focus:border-purple-400/50 focus:outline-none"
                />
                <select
                  value={newCard.difficulty}
                  onChange={(e) => setNewCard({...newCard, difficulty: e.target.value as any})}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-purple-400/50 focus:outline-none"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              
              <textarea
                placeholder="Question"
                value={newCard.question}
                onChange={(e) => setNewCard({...newCard, question: e.target.value})}
                rows={3}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-400 focus:border-purple-400/50 focus:outline-none resize-none"
              />
              
              <textarea
                placeholder="Answer"
                value={newCard.answer}
                onChange={(e) => setNewCard({...newCard, answer: e.target.value})}
                rows={4}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-400 focus:border-purple-400/50 focus:outline-none resize-none"
              />
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddCard(false)}
                className="px-4 py-2 text-sm bg-gray-500/20 hover:bg-gray-500/30 border border-gray-400/30 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveCard}
                className="px-4 py-2 text-sm bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 rounded-lg transition-colors"
              >
                Create Card
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}