import './board.css';
import React, { useState, useEffect } from 'react';
import { Button } from "@mui/material";
import { ImCross } from "react-icons/im";


interface Trello {
    id: number;
    name: string;
    creationDate: string;
    email: string;
}

// interface Task {
//     setTrelloId: React.Dispatch<React.SetStateAction<number>>;
// }

function Board({ setpageIndex, authToken, userEmail, setTrelloId, handleLogout }: { setpageIndex: React.Dispatch<React.SetStateAction<number>>, authToken: string, userEmail: string, setTrelloId: React.Dispatch<React.SetStateAction<number>>, handleLogout: () => void }) {
    const [trelloName, setTrelloName] = useState('');
    const [trellos, setTrellos] = useState<Trello[]>([]);

    const createTrello = async () => {
        if (!trelloName) {
            alert('Please enter a name for the Trello');
            return;
        }

        const creationDate = new Date().toISOString();

        try {
            const response = await fetch('http://localhost:3000/api/trello', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({ name: trelloName, creationDate, email: userEmail }),
            });

            if (!response.ok) {
                console.log('Response status:', response.status);
                throw new Error('Trello creation failed');
            }

            const data = await response.json();
            console.log('Trello created:', data);

            setTrelloName('');
            fetchTrellos();
        } catch (error) {
            console.error('Error during trello creation:', error);
        }
    };

    const fetchTrellos = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/trello?email=${userEmail}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (!response.ok) {
                console.log('Response status:', response.status);
                throw new Error('Trellos fetching failed');
            }

            const data = await response.json();
            setTrellos(data);
            console.log('Trellos fetched:', data);
        } catch (error) {
            console.error('Error during trellos fetching:', error);
        }
    };

    useEffect(() => {
        fetchTrellos();
    }, [userEmail]);

    const goToTrello = (id: number) => {
        setTrelloId(id);
        setpageIndex(2);
    };

    const deleteTrello = async (id: number) => {
        try {
            const response = await fetch(`http://localhost:3000/api/trello/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (!response.ok) {
                console.log('Response status:', response.status);
                throw new Error('Trello deletion failed');
            }

            console.log('Trello deleted:', id);
            fetchTrellos();
        } catch (error) {
            console.error('Error during trello deletion:', error);
        }
    }

    return (
        <div className='board-container'>
            <div className='create-trello-container'>
                <input
                    type="text"
                    placeholder='Create a new Trello'
                    value={trelloName}
                    onChange={(e) => setTrelloName(e.target.value)}
                />
                <button onClick={createTrello}>Add</button>
            </div>
            <div className='title-board'>
                <h1>List of your trello :</h1>
            </div>
            <div className='list-of-board-container'>
                {trellos.map((trello) => (
                    <div key={trello.id} className='trello-item'>
                        <div className='trello-item-content' onClick={() => goToTrello(trello.id)}>
                            <h3>{trello.name}</h3>
                            <p>Created on: {new Date(trello.creationDate).toLocaleDateString()}</p>
                            <p>Create by: {trello.email}</p>
                        </div>
                        <Button className='delete-button' onClick={() => deleteTrello(trello.id)} style={{ padding: "0", margin: "0" }}>
                            <ImCross style={{ backgroundColor: "#fff", color: "#3b3b3b", width: "20", height: "20" }} />
                        </Button>
                    </div>
                ))}
            </div>
            <div className='logout-btn'>
                <button onClick={handleLogout}>Logout</button>
            </div>
        </div>
    );
}

export default Board;