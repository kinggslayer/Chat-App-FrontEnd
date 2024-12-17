import React, { useState } from 'react';

const ForgotPassword = () => {
    const host="http://localhost:5000";
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setErrorMessage('');

    try {
      const response = await fetch(`${host}/api/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
      } else {
        setErrorMessage(data.error);
      }
    } catch (error) {
      setErrorMessage('Failed to send request. Please try again.');
    }
  };

  return (
    <div className="container my-4">
      <h2 className="text-center mb-4">Forgot Your Password?</h2>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={email}
            onChange={handleEmailChange}
            className="form-control"
            placeholder="Enter your email"
          />
        </div>

        {message && <div className="text-success mt-2">{message}</div>}
        {errorMessage && <div className="text-danger mt-2">{errorMessage}</div>}

        <button
          type="submit"
          className="btn btn-primary w-auto ms-auto d-block"
        >
          Send Reset Link
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
