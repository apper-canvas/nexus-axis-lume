import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import QuoteList from '@/components/organisms/QuoteList';
import QuoteModal from '@/components/organisms/QuoteModal';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import { getQuotes, createQuote, updateQuote, deleteQuote } from '@/services/api/quoteService';

const QuotePage = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getQuotes();
      setQuotes(data);
    } catch (err) {
      setError('Failed to fetch quotes');
      console.error('Error fetching quotes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuote = () => {
    setSelectedQuote(null);
    setModalOpen(true);
  };

  const handleEditQuote = (quote) => {
    setSelectedQuote(quote);
    setModalOpen(true);
  };

  const handleDeleteQuote = async (quoteId) => {
    if (window.confirm('Are you sure you want to delete this quote?')) {
      try {
        const success = await deleteQuote(quoteId);
        if (success) {
          toast.success('Quote deleted successfully');
          setQuotes(quotes.filter(quote => quote.Id !== quoteId));
        } else {
          toast.error('Failed to delete quote');
        }
      } catch (error) {
        console.error('Error deleting quote:', error);
        toast.error('Failed to delete quote');
      }
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedQuote(null);
  };

  const handleQuoteSave = async (quoteData) => {
    try {
      let result;
      if (selectedQuote) {
        result = await updateQuote(selectedQuote.Id, quoteData);
        if (result) {
          toast.success('Quote updated successfully');
          setQuotes(quotes.map(quote => 
            quote.Id === selectedQuote.Id ? result : quote
          ));
        }
      } else {
        result = await createQuote(quoteData);
        if (result) {
          toast.success('Quote created successfully');
          setQuotes([result, ...quotes]);
        }
      }
      
      if (result) {
        handleModalClose();
      }
    } catch (error) {
      console.error('Error saving quote:', error);
      toast.error('Failed to save quote');
    }
  };

const filteredQuotes = quotes.filter(quote => 
    (quote.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (quote.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (quote.status || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.amount.toString().includes(searchTerm)
  );

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} onRetry={fetchQuotes} />;
  }

  return (
    <div className="p-6">
      <QuoteList
        quotes={filteredQuotes}
        onAddQuote={handleAddQuote}
        onEditQuote={handleEditQuote}
        onDeleteQuote={handleDeleteQuote}
        onSearch={setSearchTerm}
        searchTerm={searchTerm}
      />
      
      {modalOpen && (
        <QuoteModal
          quote={selectedQuote}
          onClose={handleModalClose}
          onSave={handleQuoteSave}
        />
      )}
    </div>
  );
};

export default QuotePage;