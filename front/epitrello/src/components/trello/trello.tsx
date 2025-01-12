import React, { useEffect, useState } from "react";
import "./trello.css";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { Button } from "@mui/material";
import { ImCross } from "react-icons/im";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

interface Column {
    id: number;
    name: string;
}

interface Task {
    id: number;
    title: string;
    description: string;
    assign_to: string;
    created_at: string;
    columnId: number;
    userId?: number;
}

interface User {
    id: number;
    email: string;
}

function Trello({ setpageIndex, authToken, trelloId }: { setpageIndex: React.Dispatch<React.SetStateAction<number>>, authToken: string, trelloId: number }) {

    const [tasks, setTasks] = useState<Task[]>([]);
    const [trelloName, setTrelloName] = useState('');
    const [columns, setColumns] = useState<Column[]>([]);
    const [invite, setInvite] = useState('');
    const [invitedEmail, setInvitedEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [alreadyInvited, setAlreadyInvited] = useState(false);
    const [isEmailValid, setIsEmailValid] = useState(true);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const [selectedColumnId, setSelectedColumnId] = useState<number | null>(null);
    const [allInvited, setAllInvited] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

    useEffect(() => {
        if (!trelloId) {
            console.error('trelloId is not defined');
            return;
        }

        const fetchTasks = () => {
            fetch(`http://localhost:3000/api/trello/${trelloId}/tasks`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            })
                .then((response) => response.json())
                .then((data) => {
                    const mappedTasks = data.map((task: any) => ({
                        id: task.task_id,
                        title: task.title,
                        description: task.description,
                        assign_to: task.assign_to ?? 'Unassigned',
                        created_at: task.created_at,
                        columnId: task.column_id ?? null,
                    }));
                    setTasks(mappedTasks);
                    console.log('Tasks fetched:', mappedTasks);
                })
                .catch((error) => {
                    console.error('Error during tasks fetching:', error);
                });
        };

        fetchTasks();
        const intervalId = setInterval(fetchTasks, 1000);
        return () => clearInterval(intervalId);
    }, [authToken, trelloId]);

    useEffect(() => {
        fetch(`http://localhost:3000/api/trello/${trelloId}/columns`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        })
            .then((response) => response.json())
            .then((data) => {
                setColumns(data);
            })
            .catch((error) => {
                console.error('Error during columns fetching:', error);
            });

        fetch(`http://localhost:3000/api/trello/${trelloId}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        })
            .then((response) => response.json())
            .then((data) => {
                setTrelloName(data.name);
            })
            .catch((error) => {
                console.error('Error during trello name fetching:', error);
            });

        const fetchInvitedUsers = () => {
            fetch(`http://localhost:3000/api/trello/${trelloId}/invite`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            })
                .then((response) => response.json())
                .then((data) => {
                    setAllInvited(data);
                })
                .catch((error) => {
                    console.error('Error during all invited fetching:', error);
                });
        };
        fetchInvitedUsers();
        const intervalId = setInterval(fetchInvitedUsers, 1000);
        return () => clearInterval(intervalId);

    }, [authToken, trelloId]);

    const goBack = () => {
        setpageIndex(1);
    }

    const addColumn = () => {
        const newColumn: Column = { id: columns.length + 1, name: "" };
        setColumns([...columns, newColumn]);
    };

    const handleColumnNameChange = (id: number, name: string) => {
        setColumns(columns.map(column => column.id === id ? { ...column, name } : column));
    };

    const handleInvite = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(invite)) {
            setIsEmailValid(false);
            return;
        }
        setIsEmailValid(true);

        fetch(`http://localhost:3000/api/trello/${trelloId}/invite`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ email: invite }),
        })
            .then((response) => {
                if (!response.ok) {
                    if (response.status === 409) {
                        setAlreadyInvited(true);
                    } else {
                        throw new Error('Failed to invite user');
                    }
                }
                return response.json();
            })
            .then((data) => {
                setInvitedEmail(data.email);
                setInvite('');
                setErrorMessage('');
                setAlreadyInvited(false);
            })
            .catch((error) => {
                console.error('Error during user invitation:', error);
            });
    };

    const handleAddColumn = (column: Column) => {
        fetch(`http://localhost:3000/api/trello/${trelloId}/check-column`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ name: column.name }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.exists) {
                    setErrorMessage('Column name already exists');
                } else {
                    fetch(`http://localhost:3000/api/trello/${trelloId}/column`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${authToken}`,
                        },
                        body: JSON.stringify({ name: column.name }),
                    })
                        .then((response) => {
                            if (!response.ok) {
                                throw new Error('Failed to add column');
                            }
                            return response.json();
                        })
                        .then((data) => {
                            setErrorMessage('');
                        })
                        .catch((error) => {
                            console.error('Error during column addition:', error);
                        });
                }
            })
            .catch((error) => {
                console.error('Error during column name check:', error);
            });
    };

    const handleRemoveColumn = (column: Column) => {
        fetch(`http://localhost:3000/api/trello/${trelloId}/column/${column.id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to delete column');
                }
                return response.json();
            })
            .then((data) => {
                setColumns(columns.filter(col => col.id !== column.id));
            })
            .catch((error) => {
                console.error('Error during column deletion:', error);
            });
    };

    const handleDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;

        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const startColumn = columns.find(col => col.id.toString() === source.droppableId);
        const endColumn = columns.find(col => col.id.toString() === destination.droppableId);

        if (startColumn && endColumn) {
            const startTasks = tasks.filter(task => task.columnId === startColumn.id);
            const endTasks = tasks.filter(task => task.columnId === endColumn.id);

            const [movedTask] = startTasks.splice(source.index, 1);
            endTasks.splice(destination.index, 0, movedTask);

            const newTasks = tasks.map(task => {
                if (task.id === parseInt(draggableId)) {
                    return { ...task, columnId: endColumn.id };
                }
                return task;
            });

            setTasks(newTasks);

            fetch(`http://localhost:3000/api/trello/${trelloId}/task/${draggableId}/column`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({ columnId: endColumn.id }),
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Failed to update task column');
                    }
                    return response.json();
                })
                .then((data) => {
                    console.log('Task column updated:', data);
                })
                .catch((error) => {
                    console.error('Error during task column update:', error);
                });
        }
    };

    const handleAddTask = () => {
        if (selectedColumnId === null) {
            setErrorMessage('Please select a column');
            return;
        }

        const selectedUser = allInvited.find(user => user.id === selectedUserId);
        const userEmail = selectedUser ? selectedUser.email : '';

        const newTask: Task = {
            id: tasks.length + 1,
            title: newTaskTitle,
            description: newTaskDescription,
            assign_to: userEmail,
            created_at: new Date().toISOString(),
            columnId: selectedColumnId,
            userId: selectedUserId ?? undefined,
        };

        fetch(`http://localhost:3000/api/trello/${trelloId}/task`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ ...newTask, assign_to: userEmail }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to add task');
                }
                return response.json();
            })
            .then((data) => {
                setTasks([...tasks, data]);
                setNewTaskTitle('');
                setNewTaskDescription('');
                setSelectedColumnId(null);
                setSelectedUserId(null);
                setErrorMessage('');
            })
            .catch((error) => {
                console.error('Error during task addition:', error);
            });
    };

    const handleRemoveTask = (task: Task) => {
        fetch(`http://localhost:3000/api/trello/${trelloId}/task/${task.id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to delete task');
                }
                return response.json();
            })
            .then((data) => {
                setTasks(tasks.filter(t => t.id !== task.id));
            })
            .catch((error) => {
                console.error('Error during task deletion:', error);
            }
        );
    }

    return (
        <div className="trello">
            <div className="trello-top-container">
                <h1 className="trello-title">{trelloName || "No trello name fetched"}</h1>
                <button className="back-btn" onClick={goBack}>
                    <MdKeyboardArrowLeft className="back-icon" />
                    <span className="back-text">Go back to the board</span>
                </button>
            </div>
            <div className="invite-btn">
                <input
                    type="text"
                    placeholder="Invite someone"
                    value={invite}
                    onChange={(e) => setInvite(e.target.value)}
                    className="invite-input"
                />
                <Button onClick={handleInvite} style={{ color: "white", width: "100%" }}>Invite</Button>
                {invitedEmail && <p style={{ color: 'green', padding: "5", fontWeight: "bold", textAlign: "center" }}>Invited User: {invitedEmail}</p>}
                {alreadyInvited && <p style={{ color: 'red', padding: "5", fontWeight: "bold", textAlign: "center" }}>User already invited</p>}
                {!isEmailValid && <p style={{ color: 'red', padding: "5", fontWeight: "bold", textAlign: "center" }}>Invalid email</p>}
            </div>
            <div className="column-btn">
                <Button onClick={addColumn} style={{ color: "white", width: "100%" }}>Add Column</Button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", margin: "10px" }}>
                <div className="add-task-form">
                    <input
                        type="text"
                        placeholder="Task Title"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="task-title"
                    />
                    <input
                        type="text"
                        placeholder="Task Description"
                        value={newTaskDescription}
                        onChange={(e) => setNewTaskDescription(e.target.value)}
                        className="task-description"
                    />
                    <select
                        value={selectedColumnId || ''}
                        onChange={(e) => setSelectedColumnId(Number(e.target.value))}
                        className="task-column"
                    >
                        <option value="" disabled>Select Column</option>
                        {columns.map((column) => (
                            <option key={column.id} value={column.id}>{column.name}</option>
                        ))}
                    </select>
                    <select
                        value={selectedUserId || ''}
                        onChange={(e) => setSelectedUserId(Number(e.target.value))}
                        className="task-user"
                    >
                        <option value="" disabled>Select User</option>
                        {allInvited.map((user) => (
                            <option key={user.id} value={user.id}>{user.email}</option>
                        ))}
                    </select>
                </div>
                <Button onClick={handleAddTask} style={{ color: "white", width: "16%", backgroundColor: "#3b3b3b" }}>Add Task</Button>
                {errorMessage && <p style={{ color: 'red', padding: "5", fontWeight: "bold", textAlign: "center" }}>{errorMessage}</p>}
            </div>
            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="column" style={{ width: "auto" }}>
                    {columns.map((column) => (
                        <Droppable droppableId={column.id.toString()} key={column.id}>
                            {(provided) => (
                                <div
                                    className="column-item"
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                >
                                    <div style={{ display: "flex", flexDirection: "row", height: "5%", width: "100%" }}>
                                        <input
                                            type="text"
                                            value={column.name}
                                            onChange={(e) => handleColumnNameChange(column.id, e.target.value)}
                                            onBlur={() => handleAddColumn(column)}
                                            placeholder="Column Name"
                                        />
                                        <Button onClick={() => handleRemoveColumn(column)}>
                                            <ImCross style={{ backgroundColor: "#3b3b3b", color: "#fff" }} />
                                        </Button>
                                    </div>
                                    {tasks.filter(task => task.columnId === column.id).map((task, index) => {
                                        console.log('Task:', task); // Ajout du console.log pour afficher les tâches
                                        return (
                                            <Draggable key={task.id.toString()} draggableId={task.id.toString()} index={index}>
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className="tasks"
                                                    >
                                                        <div className="tasks-information">
                                                            <div className="tasks-information-title">
                                                                <p className="tasks-title">Title:</p>
                                                                <p className="tasks-title-data">{task.title}</p>
                                                            </div>
                                                            <div className="tasks-information-description">
                                                                <p className="tasks-description">Description:</p>
                                                                <p className="tasks-description-data">{task.description}</p>
                                                            </div>
                                                            <div className="tasks-information-assign">
                                                                <p className="tasks-assign">Assign to:</p>
                                                                <p className="tasks-assign-data">{task.assign_to}</p>
                                                            </div>
                                                            <div className="tasks-information-creation">
                                                                <p className="tasks-creation">Creation:</p>
                                                                <p className="tasks-creation-data">{new Date(task.created_at).toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                        <Button onClick={() => handleRemoveTask(task)}>
                                                            <ImCross style={{ backgroundColor: "#3b3b3b", color: "#fff" }} />
                                                        </Button>
                                                    </div>
                                                )}
                                            </Draggable>
                                        );
                                    })}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    ))}
                </div>
            </DragDropContext>
        </div>
    );
}

export default Trello;