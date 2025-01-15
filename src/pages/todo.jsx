import React, { useState } from "react";
import { Container, Row, Col, Button, Table } from "react-bootstrap";

import { fetchAll, fetchCreate, fetchDelete, fetchPatch, fetchUpdate } from '../redux/slices/todo.js';
import { useDispatch, useSelector } from "react-redux";

const Todo = () => {
    const dispatch = useDispatch();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedTask, setSelectedTask] = useState(null);
    
    const { items } = useSelector((state) => state.todo) || { items: [] };
    const todoItems = Array.isArray(items) ? items : [];

    React.useEffect(() => {
        dispatch(fetchAll());
    }, [dispatch]);

    const setVariant = (task, status) => {
        if (task.status === status) {
            switch (task.status) {
                case 'todo':
                    return 'btn-primary';
                case 'in progress':
                    return 'btn-warning';
                case 'done':
                    return 'btn-success';
                default:
                    return 'btn-primary';
            }
        } else {
            return '';
        }
    };

    const setStyle = (task, status) => {
        if (status.includes(task.status)) {
            switch (task.status) {
                case 'todo':
                    return 'status-todo';
                case 'in progress':
                    return 'status-in-progress';
                case 'done':
                    return 'status-done';
                default:
                    return '';
            }
        } else {
            return '';
        }
    };

    const setStatus = async (id, status) => {
        await dispatch(fetchPatch({ id, status }));
        dispatch(fetchAll());
    };


    const create = async () => {
        await dispatch(fetchCreate({ title, description }));
        setTitle('');
        setDescription('');
        dispatch(fetchAll());
    };

    const update = async () => {
        if (selectedTask) {
            await dispatch(fetchUpdate({ id: selectedTask._id, title, description }));
            setSelectedTask(null);
            setTitle('');
            setDescription('');
            dispatch(fetchAll());
        }
    };

    const deleteTask = async () => {
        if (selectedTask) {
            await dispatch(fetchDelete({ id: selectedTask._id }));
            setSelectedTask(null);
            setTitle('');
            setDescription('');
            dispatch(fetchAll());
        }
    };

    const selectTask = (task) => {
        setSelectedTask(task);
        setTitle(task.title);
        setDescription(task.description);
    };


    return (
        <Container>
            <br />
            <Row className="d-flex row align-items-center justify-content-center" style={{ height: '80vh' }}>
                <h2>TODO LIST</h2>
                <Col lg={8} md={8}>
                    <div style={{ maxHeight: '500px', overflowY: 'auto', position: 'relative' }}>
                        <Table striped bordered hover size="sm">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>title</th>
                                    <th>description</th>
                                    <th>status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {todoItems.map((task, i) => (
                                     <tr key={i} onClick={() => selectTask(task)}>
                                        <td className={`${setStyle(task, ['todo', 'in progress', 'done'])}`}>{i + 1}</td>
                                        <td className={`${setStyle(task, ['todo', 'in progress', 'done'])}`}>{task.title}</td>
                                        <td className={`${setStyle(task, ['todo', 'in progress', 'done'])}`}>{task.description}</td>
                                        <td width={'240'}>
                                            <button
                                                id="todo"
                                                className={`btn status-btn ${setVariant(task, 'todo')}`}
                                                onClick={() => { setStatus(task._id, 'todo') }}>todo</button>
                                            <button
                                                id="progress"
                                                className={`btn status-btn ${setVariant(task, 'in progress')}`}
                                                onClick={() => { setStatus(task._id, 'in progress') }}>in progress</button>
                                            <button
                                                id="done"
                                                className={`btn status-btn ${setVariant(task, 'done')}`}
                                                onClick={() => { setStatus(task._id, 'done') }}>done</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '20px',
                        background: 'linear-gradient(to top, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0))'
                    }}></div>
                </Col>
                <Col lg={4} md={4} style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
                    <input
                        className="form-control mb-2"
                        type="text"
                        value={title}
                        onChange={(event) => { setTitle(event.target.value) }}
                        style={{ flexGrow: 0, borderRadius: '1px' }}
                    />
                    <textarea
                        className="form-control mb-2"
                        value={description}
                        onChange={(event) => { setDescription(event.target.value) }}
                        style={{ flexGrow: 1, borderRadius: '1px' }}
                        rows={6}
                    />
                    <div style={{ flexGrow: 0 }}>
                        <Button style={{ borderRadius: '1px' }} variant="success" onClick={create}>Add task</Button>{' '}
                        <Button style={{ borderRadius: '1px' }} variant="warning" onClick={update} disabled={!selectedTask}>Update task</Button>{' '}
                        <Button style={{ borderRadius: '1px' }} variant="danger" onClick={deleteTask} disabled={!selectedTask}>Delete task</Button>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}

export default Todo;
