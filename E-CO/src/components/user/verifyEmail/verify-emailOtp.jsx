'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { resendVerificationCode, verifyEmailWithOtp } from '../../../services/api/verifyEmail-Api.js';

const VerifyEmailOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Extraire l'email et l'ID de l'URL
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get('id');
  const email = searchParams.get('email');

  const inputRefs = useMemo(() => Array(6).fill(0).map(() => React.createRef()), []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (!id || !email) {
      setError('Informations de vérification manquantes');
    }
  }, [id, email]);

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Le code doit contenir 6 chiffres');
      return;
    }
    if (!email || !id) {
      setError('Informations de vérification manquantes');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await verifyEmailWithOtp(email, code, id);
      if (result.success) {
        setSuccess('Email vérifié avec succès');
        setTimeout(() => navigate('/sign-in'), 2000);
      }
    } catch (err) {
      setError(err.message || 'Une erreur est survenue lors de la vérification du code');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0 || !email || !id) return;
    setLoading(true);
    setError('');
    try {
      const result = await resendVerificationCode(email, id);
      if (result.success) {
        setSuccess('Code de vérification renvoyé avec succès');
        setCountdown(60);
      }
    } catch (err) {
      setError(err.message || 'Une erreur est survenue lors de l\'envoi du code');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (index, value) => {
    if (value.length > 1) value = value.charAt(0);
    if (!/^\d*$/.test(value)) return;
    const newCode = code.split('');
    newCode[index] = value;
    setCode(newCode.join(''));
    if (value && index < 5) inputRefs[index + 1].current?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    if (/^\d{6}$/.test(pastedData)) {
      setCode(pastedData);
      pastedData.split('').forEach((digit, index) => {
        if (inputRefs[index].current) inputRefs[index].current.value = digit;
      });
      inputRefs[5].current?.focus();
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Vérification du code</h2>
      <form onSubmit={handleVerifyCode} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Entrez le code de vérification
          </label>
          <div className="flex justify-between gap-2">
            {Array(6).fill(0).map((_, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                maxLength={1}
                value={code[index] || ''}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                disabled={loading}
                aria-label={`Chiffre ${index + 1} du code de vérification`}
              />
            ))}
          </div>
        </div>
        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Vérification...' : 'Vérifier le code'}
        </button>
        {error && <p className="mt-2 text-red-600 text-center">{error}</p>}
        {success && <p className="mt-2 text-green-600 text-center">{success}</p>}
        <div className="flex justify-between items-center mt-4">
          <button
            type="button"
            onClick={handleResendCode}
            disabled={loading || countdown > 0}
            className="text-blue-600 hover:text-blue-800 disabled:text-gray-400 transition-colors"
          >
            {countdown > 0 ? `Renvoyer le code (${countdown}s)` : 'Renvoyer le code'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            Retour
          </button>
        </div>
      </form>
    </div>
  );
};

export default VerifyEmailOtp;