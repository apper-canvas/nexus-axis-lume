import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import Input from '@/components/atoms/Input';
import Label from '@/components/atoms/Label';
import Loading from '@/components/ui/Loading';
import Empty from '@/components/ui/Empty';
import Error from '@/components/ui/Error';
import SearchBar from '@/components/molecules/SearchBar';
import StatusFilter from '@/components/molecules/StatusFilter';
import { 
  getEmailTrackings, 
  getEmailTrackingById, 
  createEmailTracking, 
  updateEmailTracking, 
  deleteEmailTracking 
} from '@/services/api/emailTrackingService';

const EmailTrackingPage = () => {
  const [emailTrackings, setEmailTrackings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingEmail, setEditingEmail] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Form state
  const [formData, setFormData] = useState({
    Name: '',
    Tags: '',
    recipient_c: '',
    subject_c: '',
    status_c: 'Sent',
    sent_date_c: '',
    open_date_c: '',
    click_count_c: 0,
    last_clicked_date_c: '',
    email_body_c: '',
    related_to_type_c: '',
    related_to_id_c: ''
  });

  const statusOptions = [
    { value: 'All', label: 'All Status' },
    { value: 'Sent', label: 'Sent' },
    { value: 'Delivered', label: 'Delivered' },
    { value: 'Opened', label: 'Opened' },
    { value: 'Clicked', label: 'Clicked' },
    { value: 'Bounced', label: 'Bounced' },
    { value: 'Failed', label: 'Failed' }
  ];

  const relatedToOptions = [
    { value: '', label: 'Select Type' },
    { value: 'Contact', label: 'Contact' },
    { value: 'Deal', label: 'Deal' },
    { value: 'Company', label: 'Company' }
  ];

  useEffect(() => {
    fetchEmailTrackings();
  }, [statusFilter, searchTerm]);

  const fetchEmailTrackings = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {
        status: statusFilter !== 'All' ? statusFilter : null,
        search: searchTerm || null
      };
      const data = await getEmailTrackings(filters);
      setEmailTrackings(data);
    } catch (err) {
      setError('Failed to load email trackings');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmail = () => {
    setEditingEmail(null);
    setFormData({
      Name: '',
      Tags: '',
      recipient_c: '',
      subject_c: '',
      status_c: 'Sent',
      sent_date_c: new Date().toISOString().slice(0, 16),
      open_date_c: '',
      click_count_c: 0,
      last_clicked_date_c: '',
      email_body_c: '',
      related_to_type_c: '',
      related_to_id_c: ''
    });
    setShowModal(true);
  };

  const handleEditEmail = async (email) => {
    const fullEmailData = await getEmailTrackingById(email.Id);
    if (fullEmailData) {
      setEditingEmail(fullEmailData);
      setFormData({
        Name: fullEmailData.Name || '',
        Tags: fullEmailData.Tags || '',
        recipient_c: fullEmailData.recipient_c || '',
        subject_c: fullEmailData.subject_c || '',
        status_c: fullEmailData.status_c || 'Sent',
        sent_date_c: fullEmailData.sent_date_c ? new Date(fullEmailData.sent_date_c).toISOString().slice(0, 16) : '',
        open_date_c: fullEmailData.open_date_c ? new Date(fullEmailData.open_date_c).toISOString().slice(0, 16) : '',
        click_count_c: fullEmailData.click_count_c || 0,
        last_clicked_date_c: fullEmailData.last_clicked_date_c ? new Date(fullEmailData.last_clicked_date_c).toISOString().slice(0, 16) : '',
        email_body_c: fullEmailData.email_body_c || '',
        related_to_type_c: fullEmailData.related_to_type_c || '',
        related_to_id_c: fullEmailData.related_to_id_c || ''
      });
      setShowModal(true);
    }
  };

  const handleDeleteEmail = async (email) => {
    if (window.confirm(`Are you sure you want to delete the email tracking for "${email.recipient_c}"?`)) {
      const success = await deleteEmailTracking(email.Id);
      if (success) {
        await fetchEmailTrackings();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let success = false;
      
      if (editingEmail) {
        success = await updateEmailTracking(editingEmail.Id, formData);
      } else {
        const result = await createEmailTracking(formData);
        success = !!result;
      }
      
      if (success) {
        setShowModal(false);
        await fetchEmailTrackings();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Sent': return 'secondary';
      case 'Delivered': return 'primary';
      case 'Opened': return 'success';
      case 'Clicked': return 'success';
      case 'Bounced': return 'warning';
      case 'Failed': return 'error';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return dateString;
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Tracking</h1>
          <p className="text-gray-600">Monitor email campaign performance and engagement</p>
        </div>
        <Button onClick={handleAddEmail} className="flex items-center gap-2">
          <ApperIcon name="Plus" size={16} />
          Add Email
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search by recipient or subject..."
              />
            </div>
            <div className="sm:w-48">
              <StatusFilter
                value={statusFilter}
                onChange={setStatusFilter}
                options={statusOptions}
              />
            </div>
          </div>
        </div>

        {emailTrackings.length === 0 ? (
          <Empty 
            title="No email trackings found"
            description="Start tracking your email campaigns by adding your first email."
            actionLabel="Add Email"
            onAction={handleAddEmail}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Recipient</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Subject</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Sent Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Opens</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Clicks</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Related To</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {emailTrackings.map((email) => (
                  <tr key={email.Id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{email.recipient_c}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-gray-900 truncate max-w-xs" title={email.subject_c}>
                        {email.subject_c}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={getStatusBadgeVariant(email.status_c)}>
                        {email.status_c}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {formatDate(email.sent_date_c)}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {email.open_date_c ? formatDate(email.open_date_c) : '-'}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {email.click_count_c || 0}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {email.related_to_type_c ? `${email.related_to_type_c} #${email.related_to_id_c}` : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditEmail(email)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <ApperIcon name="Edit2" size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEmail(email)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <ApperIcon name="Trash2" size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingEmail ? 'Edit Email Tracking' : 'Add Email Tracking'}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <ApperIcon name="X" size={20} />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="Name">Name</Label>
                  <Input
                    id="Name"
                    name="Name"
                    value={formData.Name}
                    onChange={handleInputChange}
                    placeholder="Email tracking name"
                  />
                </div>
                <div>
                  <Label htmlFor="Tags">Tags</Label>
                  <Input
                    id="Tags"
                    name="Tags"
                    value={formData.Tags}
                    onChange={handleInputChange}
                    placeholder="Comma-separated tags"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="recipient_c">Recipient Email *</Label>
                  <Input
                    id="recipient_c"
                    name="recipient_c"
                    type="email"
                    value={formData.recipient_c}
                    onChange={handleInputChange}
                    placeholder="recipient@example.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status_c">Status</Label>
                  <select
                    id="status_c"
                    name="status_c"
                    value={formData.status_c}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="Sent">Sent</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Opened">Opened</option>
                    <option value="Clicked">Clicked</option>
                    <option value="Bounced">Bounced</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="subject_c">Subject *</Label>
                <Input
                  id="subject_c"
                  name="subject_c"
                  value={formData.subject_c}
                  onChange={handleInputChange}
                  placeholder="Email subject line"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sent_date_c">Sent Date</Label>
                  <Input
                    id="sent_date_c"
                    name="sent_date_c"
                    type="datetime-local"
                    value={formData.sent_date_c}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="open_date_c">Open Date</Label>
                  <Input
                    id="open_date_c"
                    name="open_date_c"
                    type="datetime-local"
                    value={formData.open_date_c}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="click_count_c">Click Count</Label>
                  <Input
                    id="click_count_c"
                    name="click_count_c"
                    type="number"
                    min="0"
                    value={formData.click_count_c}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="last_clicked_date_c">Last Clicked Date</Label>
                  <Input
                    id="last_clicked_date_c"
                    name="last_clicked_date_c"
                    type="datetime-local"
                    value={formData.last_clicked_date_c}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="related_to_type_c">Related To Type</Label>
                  <select
                    id="related_to_type_c"
                    name="related_to_type_c"
                    value={formData.related_to_type_c}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {relatedToOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="related_to_id_c">Related To ID</Label>
                  <Input
                    id="related_to_id_c"
                    name="related_to_id_c"
                    type="number"
                    value={formData.related_to_id_c}
                    onChange={handleInputChange}
                    placeholder="Enter related record ID"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email_body_c">Email Body</Label>
                <textarea
                  id="email_body_c"
                  name="email_body_c"
                  value={formData.email_body_c}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-vertical"
                  placeholder="Email content..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingEmail ? 'Update' : 'Create'} Email Tracking
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailTrackingPage;