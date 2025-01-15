// pages/CreateEditLesson.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addLesson, updateLesson, fetchLessons } from '../../redux/slices/lesson';
import { Container, Row, Col, Button, Table } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom';
import { LessonForm } from '../../components/Lesson/LessonForm';

export const CreateEditLesson = () => {
  const { lessonId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const lessons = useSelector(state => state.lessons.lessons);

  const initialData = lessonId ? lessons.find(l => l._id === lessonId) : null;

  const handleSubmit = async (data) => {
    try {
      if (lessonId) {
        await dispatch(updateLesson({ lessonId, updatedData: data })).unwrap();
        alert('Сабақ сәтті жаңартылды!');
      } else {
        const newLesson = await dispatch(addLesson(data)).unwrap();
        alert('Сабақ сәтті жасалды!');
        navigate(`/lessons/${newLesson._id}`);
        return;
      }
      navigate(`/lessons/${lessonId}`);
    } catch (error) {
      alert(`Ошибка: ${error.message}`);
    }
  };

  return (
    <Container>
      <Row>
        <Col md={12}>
        <br />
          <h1>{lessonId ? 'Сабақты өзгерту' : 'Сабақты құру'}</h1>
          <hr />
          <LessonForm onSubmit={handleSubmit} initialData={initialData} />
        </Col>
      </Row>
    </Container>
  );
};
