import React, { useState } from 'react';
import './landingpage.css';
import { useTranslation } from 'react-i18next';
import { FaRegUser } from "react-icons/fa";
import { MdLockOutline } from "react-icons/md";
import { FaRegEnvelope } from "react-icons/fa6";

interface LoginProps {
    setpageIndex: React.Dispatch<React.SetStateAction<number>>;
    setAuthToken: React.Dispatch<React.SetStateAction<string>>;
    setEmailLogger: React.Dispatch<React.SetStateAction<string>>;
}

function LandingPage({ setpageIndex, setAuthToken, setEmailLogger }: { setpageIndex: React.Dispatch<React.SetStateAction<number>>, setAuthToken: (token: string, email: string) => void, setEmailLogger: React.Dispatch<React.SetStateAction<string>> }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [badLogs, setBadLogs] = useState(false);
    const [loggingIn, setLoggingIn] = useState(false);
    const { t } = useTranslation();

    const handleLogin = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const data = await response.json();
            setAuthToken(data.accessToken, email);
        } catch (error) {
            console.error('Error during login:', error);
        }
    };

    const handleRegister = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();

        setLoggingIn(true);
        setBadLogs(false);

        try {
            const response = await fetch('http://localhost:3000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email, password }),
            });
            if (!response.ok) {
                console.log('Response status:', response.status);
                setBadLogs(true);
                throw new Error('Register failed');
            }
            const data = await response.json();
            console.log('Register successful:', data);
            // Rediriger vers le formulaire de connexion après un enregistrement réussi
            setEmail('');
            setPassword('');
            setIsRegistering(false);
        } catch (error) {
            console.error('Error during register:', error);
            setBadLogs(true);
        } finally {
            setLoggingIn(false);
        }
    };

    return (
        <div className='bodylanding'>
            <div className="login-box">
                <h2>{isRegistering ? t('Register') : t('Login')}</h2>
                <form onSubmit={isRegistering ? handleRegister : handleLogin}>
                    {badLogs && <p style={{ color: 'red', fontSize: '0.5em', marginBottom: '15px' }}>{t('errorlog')}</p>}
                    <div className="user-box">
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <label>
                            <FaRegEnvelope className="icon" />
                            {t('Type your email')}
                        </label>
                    </div>
                    <div className="user-box">
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <label>
                            <MdLockOutline className="icon" />
                            {t('Type your password')}
                        </label>
                    </div>
                    {loggingIn ? (
                        <p>{t('loading')}</p>
                    ) : (
                        <>
                            <button type="submit" className="btn-login">
                                {isRegistering ? t('Register') : t('Login')}
                            </button>
                            <button
                                type="button"
                                className="btn-toggle"
                                onClick={() => {
                                    setIsRegistering(!isRegistering);
                                    setEmail('');
                                    setPassword('');
                                }}
                            >
                                {isRegistering ? t('Already have an account? Login') : t('Don\'t have an account? Register')}
                            </button>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
}

export default LandingPage;