import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ResetPassword = () => {

  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const host = "http://localhost:5000";

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {

    if (!token) {
      navigate('/forgot-password');
      return;
    }

    // Optional: Validate token with backend
    const validateToken = async () => {
      try {
        const response = await fetch(`${host}/api/validate-reset-token/${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const json = await response.json();
        if (!json.success) {
          navigate('/forgot-password');
        }
      } catch (error) {
        console.error('Token validation error:', error);
        navigate('/forgot-password');
      }
    };

    validateToken();
  }, [token, navigate, host]);

  // Clear messages after a few seconds
  useEffect(() => {
    let timeoutId;
    if (message || errorMessage) {
      timeoutId = setTimeout(() => {
        setMessage('');
        setErrorMessage('');
      }, 5000);
    }
    return () => clearTimeout(timeoutId);
  }, [message, errorMessage]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    if (name === 'newPassword') {
      setNewPassword(value);
    } else if (name === 'confirmPassword') {
      setConfirmPassword(value);
    }
  };

  const validatePassword = (password) => {
    // Comprehensive password validation
    const validationRules = [
      {
        test: password.length >= 8,
        message: 'Password must be at least 8 characters long'
      },
      {
        test: /[A-Z]/.test(password),
        message: 'Password must contain at least one uppercase letter'
      },
      {
        test: /[a-z]/.test(password),
        message: 'Password must contain at least one lowercase letter'
      },
      {
        test: /\d/.test(password),
        message: 'Password must contain at least one number'
      },
      {
        test: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        message: 'Password must contain at least one special character'
      }
    ];

    const failedRule = validationRules.find(rule => !rule.test);
    return failedRule ? failedRule.message : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset previous messages
    setMessage('');
    setErrorMessage('');

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    // Validate password
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setErrorMessage(passwordError);
      return;
    }

    // Prevent multiple submissions
    if (isLoading) return;

    setIsLoading(true);

    try {
        console.log("hello");
      const response = await fetch(`${host}/api/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: newPassword,
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Password successfully reset');

        // Clear sensitive data
        setNewPassword('');
        setConfirmPassword('');

        // Store token in local storage
        localStorage.setItem('reset_token', data.token);

        // Redirect to login after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        // Handle specific error messages from backend
        setErrorMessage(data.error || 'Password reset failed');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setErrorMessage('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Reset Your Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-3">
          <label htmlFor="newPassword" className="form-label">
            New Password
          </label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            required
            value={newPassword}
            onChange={handlePasswordChange}
            className="form-control"
            placeholder="Enter new password"
          />
          <p id="password-requirements" className="text-muted-light small mt-1">
            At least 8 characters, including uppercase, lowercase, number, and special character
          </p>
        </div>

        <div className="mb-3">
          <label htmlFor="confirmPassword" className="form-label">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            required
            value={confirmPassword}
            onChange={handlePasswordChange}
            className="form-control"
            placeholder="Confirm new password"
          />
        </div>

        {message && (
          <div className="alert alert-success text-center" role="alert">
            {message}
          </div>
        )}

        {errorMessage && (
          <div className="alert alert-danger text-center" role="alert">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={`btn w-100 py-2 font-semibold ${isLoading ? 'btn-secondary' : 'btn-primary'}`}
        >
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
