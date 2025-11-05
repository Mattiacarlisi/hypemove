import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Lock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

const PRIMARY = "#335DFF";

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isValidToken, setIsValidToken] = useState(false);

  useEffect(() => {
    // Leggi token_hash e type dai query params (non dall'hash)
    const params = new URLSearchParams(window.location.search);
    const tokenHash = params.get('token_hash');
    const type = params.get('type');

    if (tokenHash && type === 'recovery') {
      // Verifica il token con Supabase
      supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: 'recovery'
      }).then(({ data, error }) => {
        if (error) {
          setError('Link non valido o scaduto. Richiedi un nuovo link di reset password.');
          setIsValidToken(false);
        } else {
          setIsValidToken(true);
        }
      });
    } else {
      setError('Link non valido. Richiedi un nuovo link di reset password.');
      setIsValidToken(false);
    }
  }, []);

  const validatePassword = (pass) => {
    if (pass.length < 8) {
      return 'La password deve essere di almeno 8 caratteri';
    }
    if (!/(?=.*[a-z])/.test(pass)) {
      return 'La password deve contenere almeno una lettera minuscola';
    }
    if (!/(?=.*[A-Z])/.test(pass)) {
      return 'La password deve contenere almeno una lettera maiuscola';
    }
    if (!/(?=.*\d)/.test(pass)) {
      return 'La password deve contenere almeno un numero';
    }
    return null;
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validazione
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError('Le password non coincidono');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setMessage('Password aggiornata con successo! Puoi ora tornare all\'app e fare login.');
      setPassword('');
      setConfirmPassword('');

      // Reindirizza all'app dopo 3 secondi (opzionale)
      setTimeout(() => {
        // Puoi configurare un deep link alla tua app mobile
        // window.location.href = 'hypemove://login';
      }, 3000);

    } catch (error) {
      setError(error.message || 'Errore durante il reset della password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-3 mb-4">
            <img 
              src="/images/logo1.png" 
              alt="Hypemove logo" 
              className="h-16 w-16 rounded-xl" 
            />
            <span className="font-bold text-2xl tracking-tight">Hypemove</span>
          </a>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">
            Reimposta la tua password
          </h1>
          <p className="text-gray-600 mt-2">
            Inserisci la tua nuova password qui sotto
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {!isValidToken ? (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-800">
                {error || 'Link non valido o scaduto'}
              </div>
            </div>
          ) : message ? (
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-green-800">{message}</div>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-800">{error}</div>
                </div>
              )}

              {/* Nuova Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Nuova Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-offset-0 focus:border-transparent text-gray-900"
                    style={{ focusRingColor: PRIMARY }}
                    placeholder="Inserisci la nuova password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Conferma Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Conferma Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-offset-0 focus:border-transparent text-gray-900"
                    style={{ focusRingColor: PRIMARY }}
                    placeholder="Conferma la nuova password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Info sui requisiti */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-700 mb-2">La password deve contenere:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li className="flex items-center gap-2">
                    <span className="text-gray-400">•</span>
                    Almeno 8 caratteri
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-gray-400">•</span>
                    Una lettera maiuscola
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-gray-400">•</span>
                    Una lettera minuscola
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-gray-400">•</span>
                    Un numero
                  </li>
                </ul>
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 rounded-xl text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: PRIMARY }}
              >
                {loading ? 'Aggiornamento in corso...' : 'Reimposta Password'}
              </button>
            </form>
          )}

          {/* Link di ritorno */}
          <div className="mt-6 text-center">
            <a 
              href="/" 
              className="text-sm font-medium hover:underline"
              style={{ color: PRIMARY }}
            >
              Torna alla home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
