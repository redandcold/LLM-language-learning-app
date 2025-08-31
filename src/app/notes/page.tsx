'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Edit, Trash2, Save, X } from 'lucide-react'
import Link from 'next/link'

interface Note {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNote, setSelectedNote] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [editForm, setEditForm] = useState({ title: '', content: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadNotes()
  }, [])

  const loadNotes = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/notes')
      if (response.ok) {
        const data = await response.json()
        const notesWithDates = data.notes.map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt)
        }))
        setNotes(notesWithDates)
      } else {
        throw new Error('메모를 불러오는데 실패했습니다')
      }
    } catch (error) {
      console.error('Failed to load notes:', error)
      setError('메모를 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const createNewNote = () => {
    setIsCreating(true)
    setIsEditing(false)
    setSelectedNote(null)
    setEditForm({ title: '', content: '' })
  }

  const editNote = (note: Note) => {
    setIsEditing(true)
    setIsCreating(false)
    setSelectedNote(note.id)
    setEditForm({ title: note.title, content: note.content })
  }

  const saveNote = async () => {
    if (!editForm.title.trim() || !editForm.content.trim()) {
      setError('제목과 내용을 모두 입력해주세요')
      return
    }

    try {
      setLoading(true)
      setError(null)

      if (isCreating) {
        // 새 메모 생성
        const response = await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editForm)
        })

        if (response.ok) {
          const data = await response.json()
          const newNote = {
            ...data.note,
            createdAt: new Date(data.note.createdAt),
            updatedAt: new Date(data.note.updatedAt)
          }
          setNotes([newNote, ...notes])
          setSelectedNote(newNote.id)
        } else {
          throw new Error('메모 생성에 실패했습니다')
        }
      } else if (selectedNote) {
        // 기존 메모 수정
        const response = await fetch(`/api/notes/${selectedNote}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editForm)
        })

        if (response.ok) {
          const data = await response.json()
          const updatedNote = {
            ...data.note,
            createdAt: new Date(data.note.createdAt),
            updatedAt: new Date(data.note.updatedAt)
          }
          setNotes(notes.map(note => 
            note.id === selectedNote ? updatedNote : note
          ))
        } else {
          throw new Error('메모 수정에 실패했습니다')
        }
      }

      setIsCreating(false)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save note:', error)
      setError(error instanceof Error ? error.message : '저장에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const deleteNote = async (noteId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      setLoading(true)
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setNotes(notes.filter(note => note.id !== noteId))
        if (selectedNote === noteId) {
          setSelectedNote(null)
          setIsEditing(false)
          setIsCreating(false)
        }
      } else {
        throw new Error('메모 삭제에 실패했습니다')
      }
    } catch (error) {
      console.error('Failed to delete note:', error)
      setError(error instanceof Error ? error.message : '삭제에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setIsCreating(false)
    setEditForm({ title: '', content: '' })
    setError(null)
  }

  const selectedNoteData = selectedNote ? notes.find(note => note.id === selectedNote) : null

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Notes List */}
      <div className="fixed left-0 top-0 bottom-0 w-80 bg-white border-r border-gray-200 flex flex-col z-40">
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5 mr-2" />
              홈으로
            </Link>
          </div>
          <button
            onClick={createNewNote}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            새 메모
          </button>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="p-4 bg-red-100 border border-red-300 text-red-700 text-sm">
              {error}
            </div>
          )}
          
          {loading && notes.length === 0 ? (
            <div className="p-4 text-center text-gray-500">메모를 불러오는 중...</div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                onClick={() => setSelectedNote(note.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedNote === note.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1 truncate">{note.title}</h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {note.content.replace(/\n/g, ' ').substring(0, 100)}...
                    </p>
                    <p className="text-xs text-gray-400">
                      {note.updatedAt.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-1 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        editNote(note)
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNote(note.id)
                      }}
                      disabled={loading}
                      className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {!loading && notes.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <p className="mb-2">메모가 없습니다</p>
              <p className="text-sm">새 메모 버튼을 눌러서 첫 번째 메모를 작성해보세요</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-80">
        {(isEditing || isCreating) ? (
          <div className="flex-1 flex flex-col">
            {/* Edit Header */}
            <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {isCreating ? '새 메모 작성' : '메모 수정'}
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={saveNote}
                  disabled={loading || !editForm.title.trim() || !editForm.content.trim()}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <Save className="w-4 h-4 mr-2" />
                  저장
                </button>
                <button
                  onClick={cancelEdit}
                  disabled={loading}
                  className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 transition-colors"
                >
                  <X className="w-4 h-4 mr-2" />
                  취소
                </button>
              </div>
            </div>

            {/* Edit Form */}
            <div className="flex-1 p-4 space-y-4">
              <input
                type="text"
                placeholder="제목을 입력하세요"
                value={editForm.title}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full text-xl font-semibold border-none outline-none bg-transparent placeholder-gray-400"
                disabled={loading}
              />
              <textarea
                placeholder="내용을 입력하세요..."
                value={editForm.content}
                onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                className="w-full h-full resize-none border-none outline-none bg-transparent placeholder-gray-400"
                disabled={loading}
              />
            </div>
          </div>
        ) : selectedNoteData ? (
          <div className="flex-1 flex flex-col">
            {/* View Header */}
            <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 truncate">
                {selectedNoteData.title}
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {selectedNoteData.updatedAt.toLocaleString()}
                </span>
                <button
                  onClick={() => editNote(selectedNoteData)}
                  className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  수정
                </button>
              </div>
            </div>

            {/* Content View */}
            <div className="flex-1 p-4">
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-gray-900 leading-relaxed">
                  {selectedNoteData.content}
                </pre>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">메모를 선택하세요</h3>
              <p className="text-gray-600 mb-4">
                왼쪽에서 메모를 선택하거나 새 메모를 작성해보세요
              </p>
              <button
                onClick={createNewNote}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                첫 번째 메모 작성하기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}