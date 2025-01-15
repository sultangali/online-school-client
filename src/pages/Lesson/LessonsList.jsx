// pages/LessonsList.jsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Row, Col, Button, Table } from 'react-bootstrap'

import { fetchLessons, deleteLesson } from '../../redux/slices/lesson.js';
import { LessonCard } from '../../components/index';
import { Link } from 'react-router-dom';

export const LessonsList = () => {
  const dispatch = useDispatch();
  const lessons = useSelector(state => state.lessons.lessons);
  const status = useSelector(state => state.lessons.status);
  const error = useSelector(state => state.lessons.error);
  const userRole = useSelector(state => state.user.role);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchLessons());
    }
  }, [status, dispatch]);

  const handleDelete = (lessonId) => {
    if (window.confirm('Осы сабақты шынымен жойғыңыз келе ме?')) {
      dispatch(deleteLesson(lessonId));
    }
  };

  let content;

  if (status === 'loading') {
    content = <Container> <Row style={{ height: '90vh' }}><Col md={12}>
    </Col> <h4 className='text-center'>Сабақтар көшірілуде...</h4></Row> </Container>;
  } else if (status === 'succeeded') {
    {
      content = lessons.map((lesson, i) => (
        <>
          <LessonCard index={i} key={lesson._id} lesson={lesson} onDelete={handleDelete} />
        </>
      ))
    }
  } else if (status === 'failed') {
    content = <Container> <Row style={{ height: '90vh' }}><Col md={12}>
    </Col> <h4 className='text-center'>{error}</h4></Row> </Container>;
  }

  return (
    <Container>
      <Row>
        <h1 style={{ marginTop: '24px', marginBottom: '24px' }}>Сабақтар</h1>
        {userRole === 'teacher' && (
          <Link to="/lessons/create" className="btn btn-primary">Жаңа сабақ қосу</Link>
        )}
        {content}
      </Row>
    </Container>

  );
};

