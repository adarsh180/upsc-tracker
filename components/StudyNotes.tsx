'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Search, Tag, Edit, Trash2 } from 'lucide-react';
import GlassCard from './GlassCard';

interface Note {
  id: number;
  subject: string;
  topic: string;
  content: string;
  tags: string[];
  created_at: string;
}

export default function StudyNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [showAddNote, setShowAddNote] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [newNote, setNewNote] = useState({
    subject: '',
    topic: '',
    content: '',
    tags: ''
  });

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/notes');
      const data = await response.json();
      setNotes(data.data || []);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    }
  };

  const saveNote = async () => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newNote,
          tags: newNote.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        })
      });

      if (response.ok) {
        fetchNotes();
        setShowAddNote(false);
        setNewNote({ subject: '', topic: '', content: '', tags: '' });
      }
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  };

  const deleteNote = async (id: number) => {
    try {
      await fetch(`/api/notes?id=${id}`, { method: 'DELETE' });
      fetchNotes();
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = !selectedSubject || note.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const subjects = Array.from(new Set(notes.map(note => note.subject)));

  return (
    <GlassCard className="bg-gradient-to-br from-green-500/10 to-blue-500/10 border-green-400/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <motion.div
            className="p-3 rounded-2xl bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-green-400/20"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <BookOpen className="w-8 h-8 text-green-400" />
          </motion.div>
          <div>
            <h3 className="text-2xl font-bold gradient-text-primary">Study Notes</h3>
            <p className="text-sm text-neutral-400">Organize your study materials</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddNote(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Note
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-400 focus:border-green-400/50 focus:outline-none"
          />
        </div>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-green-400/50 focus:outline-none"
        >
          <option value="">All Subjects</option>
          {subjects.map(subject => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.map((note, index) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-green-400/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-white mb-1">{note.topic}</h4>
                <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-full">
                  {note.subject}
                </span>
              </div>
              <button
                onClick={() => deleteNote(note.id)}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-sm text-neutral-300 mb-3 line-clamp-3">
              {note.content}
            </p>
            
            {note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {note.tags.map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="text-xs text-blue-400 bg-blue-500/20 px-2 py-1 rounded-full flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            <div className="text-xs text-neutral-500">
              {new Date(note.created_at).toLocaleDateString()}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Note Modal */}
      {showAddNote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <GlassCard className="w-full max-w-2xl">
            <h3 className="text-xl font-semibold text-green-400 mb-4">Add New Note</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Subject"
                  value={newNote.subject}
                  onChange={(e) => setNewNote({...newNote, subject: e.target.value})}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-400 focus:border-green-400/50 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Topic"
                  value={newNote.topic}
                  onChange={(e) => setNewNote({...newNote, topic: e.target.value})}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-400 focus:border-green-400/50 focus:outline-none"
                />
              </div>
              
              <textarea
                placeholder="Note content..."
                value={newNote.content}
                onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                rows={6}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-400 focus:border-green-400/50 focus:outline-none resize-none"
              />
              
              <input
                type="text"
                placeholder="Tags (comma separated)"
                value={newNote.tags}
                onChange={(e) => setNewNote({...newNote, tags: e.target.value})}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-400 focus:border-green-400/50 focus:outline-none"
              />
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddNote(false)}
                className="px-4 py-2 text-sm bg-gray-500/20 hover:bg-gray-500/30 border border-gray-400/30 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveNote}
                className="px-4 py-2 text-sm bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 rounded-lg transition-colors"
              >
                Save Note
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </GlassCard>
  );
}