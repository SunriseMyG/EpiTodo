import React, { useEffect } from 'react';
import './App.css';
import Header from './components/header/header';
import LandingPage from './components/landingpage/landingpage';
import Board from './components/board/board';
import Trello from './components/trello/trello';

function App() {
  const [userconnected, setUserConnected] = React.useState(true);
  const [pageindex, setPageIndex] = React.useState(0);
  const [emaillogger, setEmailLogger] = React.useState('');
  const [authToken, setAuthToken] = React.useState('');
  const [trelloId, setTrelloId] = React.useState(0);

  useEffect(() => {
    // Vérifier si un jeton d'authentification est stocké dans localStorage
    const storedToken = localStorage.getItem('authToken');
    const storedEmail = localStorage.getItem('emailLogger');
    if (storedToken && storedEmail) {
      setAuthToken(storedToken);
      setEmailLogger(storedEmail);
      setPageIndex(1); // Rediriger vers la page Board
    }
  }, []);

  const handleLogin = (token: string, email: string) => {
    setAuthToken(token);
    setEmailLogger(email);
    localStorage.setItem('authToken', token);
    localStorage.setItem('emailLogger', email);
    setPageIndex(1); // Rediriger vers la page Board après la connexion
  };

  const handleLogout = () => {
    setAuthToken('');
    setEmailLogger('');
    localStorage.removeItem('authToken');
    localStorage.removeItem('emailLogger');
    setPageIndex(0); // Rediriger vers la page de connexion après la déconnexion
  };

  return (
    <div className="App">
      {pageindex === 0 &&
        <LandingPage
          setpageIndex={setPageIndex}
          setAuthToken={handleLogin}
          setEmailLogger={setEmailLogger}
        />
      }
      {pageindex === 1 &&
        <Board
          setpageIndex={setPageIndex}
          authToken={authToken}
          userEmail={emaillogger}
          setTrelloId={setTrelloId}
          handleLogout={handleLogout}
        />
      }
      {pageindex === 2 && trelloId !== null && (
        <Trello
          setpageIndex={setPageIndex}
          authToken={authToken}
          trelloId={trelloId}
        />
      )}
      {/* <button onClick={handleLogout}>Logout</button> */}
    </div>
  );
}

export default App;