import React, { useState, useEffect } from 'react';
import { User as UserIcon, Shield, Key, Save, AlertCircle, CheckCircle } from 'lucide-react';
import apiClient, { UserUpdateRequest } from '../api';

const Settings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  
  const [formData, setFormData] = useState<UserUpdateRequest>({
    username: '',
    email: '',
    current_password: '',
    new_password: ''
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await apiClient.getCurrentUser();
        setFormData({
          username: userData.username,
          email: userData.email,
          current_password: '',
          new_password: ''
        });
      } catch (error) {
        setError('Failed to load user information');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(undefined);
    setSuccess(undefined);

    try {
      await apiClient.updateUser(formData);
      setSuccess('Profile updated successfully');
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        current_password: '',
        new_password: ''
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-textSecondary">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-textPrimary mb-2">Settings</h1>
        <p className="text-textSecondary">Manage your account and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <UserIcon className="h-5 w-5 text-primary mr-2" />
            <h2 className="text-lg font-semibold text-textPrimary">Profile Information</h2>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-status-critical/10 border border-status-critical/20 rounded-md text-status-critical mb-4">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-100 border border-green-200 rounded-md text-green-700 mb-4">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-textPrimary mb-1">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-textPrimary mb-1">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-md font-medium text-textPrimary mb-3">Change Password</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="current_password" className="block text-sm font-medium text-textPrimary mb-1">
                    Current Password
                  </label>
                  <input
                    id="current_password"
                    name="current_password"
                    type="password"
                    value={formData.current_password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label htmlFor="new_password" className="block text-sm font-medium text-textPrimary mb-1">
                    New Password
                  </label>
                  <input
                    id="new_password"
                    name="new_password"
                    type="password"
                    value={formData.new_password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter new password"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* API Configuration */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Key className="h-5 w-5 text-primary mr-2" />
            <h2 className="text-lg font-semibold text-textPrimary">API Configuration</h2>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-textPrimary mb-1">
                API Base URL
              </label>
              <input
                type="text"
                value="http://localhost:8000"
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-textSecondary mt-1">
                Backend server URL (read-only)
              </p>
            </div>
          </div>
        </div>

        {/* Security Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Shield className="h-5 w-5 text-primary mr-2" />
            <h2 className="text-lg font-semibold text-textPrimary">Security</h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
              <div>
                <p className="text-sm font-medium text-green-800">Account Status</p>
                <p className="text-xs text-green-600">Your account is active and secure</p>
              </div>
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            </div>
            
            <div className="text-sm text-textSecondary">
              <p>• Passwords are securely hashed using bcrypt</p>
              <p>• JWT tokens are used for authentication</p>
              <p>• All API requests are protected with HTTPS</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 