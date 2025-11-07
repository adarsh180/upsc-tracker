'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Upload, FileText, Sparkles, Download } from 'lucide-react';
import GlassCard from './GlassCard';

export default function SmartQuestionGenerator() {
  const [inputText, setInputText] = useState('');
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const generateQuestions = async () => {
    if (!inputText.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/questions/generate-from-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText })
      });
      
      const data = await response.json();
      if (data.success) {
        setGeneratedQuestions(data.questions);
      }
    } catch (error) {
      console.error('Failed to generate questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    
    if (file.type === 'text/plain') {
      const text = await file.text();
      setInputText(text);
    }
  };

  return (
    <div className="space-y-6">
      <GlassCard className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-400/20">
        <div className="flex items-center gap-4 mb-6">
          <motion.div
            className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/20"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <Brain className="w-8 h-8 text-purple-400" />
          </motion.div>
          <div>
            <h3 className="text-2xl font-bold gradient-text-primary">Smart Question Generator</h3>
            <p className="text-sm text-neutral-400">AI-powered UPSC question creation from any text</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <label className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/30 rounded-lg cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                Upload Text File
                <input
                  type="file"
                  accept=".txt,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              {selectedFile && (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm">
                  <FileText className="w-4 h-4" />
                  {selectedFile.name}
                </div>
              )}
            </div>
            
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your study material, notes, or current affairs content here..."
              className="w-full h-40 p-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-400 focus:border-purple-400/50 focus:outline-none resize-none"
            />
            
            <button
              onClick={generateQuestions}
              disabled={!inputText.trim() || loading}
              className="flex items-center gap-2 px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 rounded-lg text-purple-400 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-5 h-5" />
                </motion.div>
              ) : (
                <Brain className="w-5 h-5" />
              )}
              {loading ? 'Generating Questions...' : 'Generate UPSC Questions'}
            </button>
          </div>

          {/* Generated Questions */}
          {generatedQuestions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-white">Generated Questions</h4>
                <button className="flex items-center gap-2 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 rounded-lg text-green-400 text-sm transition-colors">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
              
              {generatedQuestions.map((q, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-white/5 border border-white/10 rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                      Question {index + 1}
                    </span>
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">
                      {q.difficulty?.toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-white mb-4 leading-relaxed">{q.question}</p>
                  
                  <div className="space-y-2 mb-4">
                    {q.options?.map((option: string, optIndex: number) => (
                      <div key={optIndex} className="text-neutral-300 text-sm">
                        {String.fromCharCode(65 + optIndex)}. {option}
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-green-400 font-medium">Answer: {q.correct_answer}</span>
                  </div>
                  
                  <div className="mt-3 p-3 bg-blue-500/10 border border-blue-400/20 rounded">
                    <p className="text-blue-400 text-sm font-medium mb-1">Explanation:</p>
                    <p className="text-neutral-300 text-sm">{q.explanation}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}