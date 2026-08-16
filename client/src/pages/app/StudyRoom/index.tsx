import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  FileText, Send, Sparkles, FileQuestion, BookOpen, 
  Upload, Loader2, CheckCircle2, AlertCircle, HelpCircle, Bot, User 
} from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface Document {
  id: string;
  filename: string;
  fileSize: number;
  status: 'PROCESSING' | 'READY' | 'ERROR';
  createdAt: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function StudyRoomPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  
  // Chat state
  const [chatHistories, setChatHistories] = useState<Record<string, Message[]>>({});
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchDocuments = async (silent = false) => {
    if (!silent) setIsLoadingDocs(true);
    try {
      const res = await api.get('/ai/documents');
      const docs = res.data.data || [];
      setDocuments(docs);
      
      // Keep selected document in sync with fresh data
      if (selectedDoc) {
        const updated = docs.find((d: Document) => d.id === selectedDoc.id);
        if (updated) {
          setSelectedDoc(updated);
        }
      }
    } catch (error) {
      console.error('Failed to load documents:', error);
      toast.error('Failed to load study materials.');
    } finally {
      if (!silent) setIsLoadingDocs(false);
    }
  };

  // Poll for processing documents
  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    const hasProcessing = documents.some(doc => doc.status === 'PROCESSING');
    if (!hasProcessing) return;

    const interval = setInterval(() => {
      fetchDocuments(true);
    }, 3000);

    return () => clearInterval(interval);
  }, [documents, selectedDoc]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedDoc, chatHistories, isSending]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    if (file.type !== 'application/pdf') {
      toast.error('Please upload PDF files only.');
      return;
    }

    const formData = new FormData();
    formData.append('document', file);

    try {
      setIsUploading(true);
      const res = await api.post('/ai/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Document uploaded. Processing text...');
      const newDoc = res.data.data;
      
      // Refresh documents
      await fetchDocuments(true);
      
      // Auto select the newly uploaded doc
      setSelectedDoc(newDoc);
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const currentMessages = selectedDoc ? chatHistories[selectedDoc.id] || [] : [];

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || !selectedDoc) return;

    if (selectedDoc.status !== 'READY') {
      toast.error('Please wait until the document is finished processing.');
      return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    };

    // Update local chat history immediately
    setChatHistories(prev => ({
      ...prev,
      [selectedDoc.id]: [...(prev[selectedDoc.id] || []), userMsg]
    }));
    
    if (!customText) setInputMessage('');
    setIsSending(true);

    try {
      const res = await api.post(`/ai/documents/${selectedDoc.id}/chat`, {
        message: textToSend,
      });

      const reply = res.data.data.reply;
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
      };

      setChatHistories(prev => ({
        ...prev,
        [selectedDoc.id]: [...(prev[selectedDoc.id] || []), botMsg]
      }));
    } catch (error: any) {
      console.error('Chat failed:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to get answer');
    } finally {
      setIsSending(false);
    }
  };

  const handleGenerateQuiz = () => {
    if (!selectedDoc) return;
    handleSendMessage(undefined, "Can you generate a quick multiple-choice quiz of 3 questions based on this document?");
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto h-[calc(100vh-4rem)] flex flex-col animate-in fade-in duration-500 bg-background text-foreground">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold font-heading text-foreground">RAG Study Room</h1>
          <p className="text-muted-foreground mt-2">Chat with your college syllabus and PDFs using Gemini RAG.</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* Left Sidebar - Documents */}
        <Card className="flex flex-col h-full bg-surface border-border overflow-hidden shadow-sm">
          <CardHeader className="p-4 border-b border-border flex flex-row justify-between items-center bg-surface shrink-0">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <BookOpen size={18} /> My Materials
            </CardTitle>
            <div>
              <input
                type="file"
                id="pdf-upload"
                accept=".pdf"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              <Button 
                size="sm" 
                variant="outline" 
                className="gap-2" 
                disabled={isUploading}
                onClick={() => document.getElementById('pdf-upload')?.click()}
              >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload size={14} />}
                Upload
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 flex-1 overflow-y-auto bg-surface/30">
            {isLoadingDocs && documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground mt-2">Loading documents...</span>
              </div>
            ) : documents.length === 0 ? (
              <div className="p-6 h-full flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mb-3">
                  <FileText size={24} className="text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold text-foreground mb-1">No materials yet</p>
                <p className="text-xs text-muted-foreground max-w-[200px]">
                  Upload PDF study files, syllabus or textbooks to begin.
                </p>
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {documents.map((doc) => {
                  const isSelected = selectedDoc?.id === doc.id;
                  return (
                    <button
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc)}
                      className={cn(
                        "w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3",
                        isSelected 
                          ? "bg-accent/10 border-accent/40 shadow-sm" 
                          : "border-border bg-surface hover:bg-muted/50"
                      )}
                    >
                      <div className={cn(
                        "p-2 rounded-lg shrink-0",
                        isSelected ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"
                      )}>
                        <FileText size={18} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{doc.filename}</p>
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                          <span>{formatSize(doc.fileSize)}</span>
                          <span>•</span>
                          {doc.status === 'PROCESSING' && (
                            <span className="flex items-center gap-1 text-amber-500 font-medium">
                              <Loader2 className="w-3 h-3 animate-spin" /> Processing
                            </span>
                          )}
                          {doc.status === 'READY' && (
                            <span className="flex items-center gap-1 text-emerald-500 font-medium">
                              <CheckCircle2 className="w-3 h-3" /> Ready
                            </span>
                          )}
                          {doc.status === 'ERROR' && (
                            <span className="flex items-center gap-1 text-red-500 font-medium">
                              <AlertCircle className="w-3 h-3" /> Error
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Area - Chat */}
        <Card className="lg:col-span-2 flex flex-col h-full bg-surface border-border overflow-hidden shadow-sm">
          <CardHeader className="p-4 border-b border-border bg-surface flex flex-row justify-between items-center shrink-0">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <Sparkles className="text-accent" size={18} /> Study Assistant
            </CardTitle>
            {selectedDoc && selectedDoc.status === 'READY' && (
              <Button 
                size="sm" 
                variant="outline" 
                className="gap-2 border-accent/30 text-accent hover:bg-accent/10"
                onClick={handleGenerateQuiz}
                disabled={isSending}
              >
                <FileQuestion size={16} /> Generate Quiz
              </Button>
            )}
          </CardHeader>
          
          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-surface/30 flex flex-col space-y-4">
            {!selectedDoc ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-20">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                  <Sparkles size={32} className="text-primary animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">AI Syllabus Assistant</h3>
                <p className="text-muted-foreground text-center max-w-sm">
                  Select a document from the left, or upload a new syllabus, lecture notes, or textbooks to begin questioning.
                </p>
              </div>
            ) : selectedDoc.status === 'PROCESSING' ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-accent mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-1">Indexing Material</h3>
                <p className="text-muted-foreground text-center max-w-xs text-sm">
                  We are splitting "{selectedDoc.filename}" into chunks and indexing it with vector embeddings. This will take just a few seconds...
                </p>
              </div>
            ) : selectedDoc.status === 'ERROR' ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-20">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-1">Processing Failed</h3>
                <p className="text-muted-foreground text-center max-w-xs text-sm">
                  Something went wrong while reading "{selectedDoc.filename}". Please verify it is a valid PDF and try uploading again.
                </p>
              </div>
            ) : currentMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-20">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-4 text-accent">
                  <HelpCircle size={32} />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">Ask anything!</h3>
                <p className="text-muted-foreground text-center max-w-xs text-sm">
                  "{selectedDoc.filename}" is fully indexed and ready. Ask it a question, summarize chapters, or generate practice questions!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentMessages.map((msg) => {
                  const isAssistant = msg.role === 'assistant';
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex gap-3 max-w-[85%] items-start",
                        isAssistant ? "mr-auto" : "ml-auto flex-row-reverse"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                        isAssistant ? "bg-accent/10 text-accent" : "bg-primary text-primary-foreground"
                      )}>
                        {isAssistant ? <Bot size={16} /> : <User size={16} />}
                      </div>
                      
                      <div className={cn(
                        "p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm",
                        isAssistant 
                          ? "bg-surface border border-border text-foreground rounded-tl-none" 
                          : "bg-primary text-primary-foreground rounded-tr-none"
                      )}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
                
                {isSending && (
                  <div className="flex gap-3 max-w-[85%] items-start mr-auto">
                    <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0 shadow-sm">
                      <Bot size={16} />
                    </div>
                    <div className="p-4 rounded-2xl bg-surface border border-border text-foreground rounded-tl-none shadow-sm flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-accent" />
                      <span className="text-xs text-muted-foreground">Searching context & thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>
          
          {/* Chat Input Area */}
          <div className="p-4 bg-surface border-t border-border shrink-0">
            <form className="flex gap-3" onSubmit={handleSendMessage}>
              <Input 
                placeholder={
                  !selectedDoc 
                    ? "Choose a study document first..." 
                    : selectedDoc.status !== 'READY' 
                    ? "Waiting for document to load..." 
                    : "Ask a question about your document..."
                } 
                className="flex-1 bg-surface-muted/20"
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                disabled={!selectedDoc || selectedDoc.status !== 'READY' || isSending}
              />
              <Button 
                type="submit" 
                size="icon" 
                className="shrink-0"
                disabled={!selectedDoc || selectedDoc.status !== 'READY' || isSending || !inputMessage.trim()}
              >
                {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send size={18} />}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
