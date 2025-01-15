// src/pages/SchedulePage.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Row, Col, Button, Table } from 'react-bootstrap'
import { fetchSchedule, addLessonToSchedule, removeLessonFromSchedule } from '../redux/slices/schedule';
import { fetchLessons } from '../redux/slices/lesson'; // Предполагается, что есть слайс для уроков
import { toast } from 'react-toastify';

export const SchedulePage = () => {
  const dispatch = useDispatch();
  const { schedules, status, error, addStatus, addError, removeStatus, removeError } = useSelector(state => state.schedule);
  const { lessons } = useSelector(state => state.lessons); // Предполагается, что уроки уже загружены

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('');

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchSchedule());
    }
    if (lessons.length === 0) {
      dispatch(fetchLessons());
    }
  }, [status, dispatch, lessons.length]);

  useEffect(() => {
    if (addStatus === 'succeeded') {
      toast.success('Сабақ кестеге сәтті қосылды');
      dispatch(fetchSchedule());
    }
    if (addStatus === 'failed') {
      toast.error(`Сабақты қосу қатесі: ${addError}`);
    }
  }, [addStatus, addError, dispatch]);

  useEffect(() => {
    if (removeStatus === 'succeeded') {
      toast.success('Сабақ кестеден сәтті жойылды');
    }
    if (removeStatus === 'failed') {
      toast.error(`Сабақты жою кезіндегі қате: ${removeError}`);
    }
  }, [removeStatus, removeError]);

  const handleAddLesson = (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedLesson) {
      toast.error('Күн мен сабақты таңдаңыз');
      return;
    }
    dispatch(addLessonToSchedule({ date: selectedDate, lessonId: selectedLesson }));
    setSelectedDate('');
    setSelectedLesson('');
  };

  const handleRemoveLesson = (scheduleId, lessonId) => {
    if (window.confirm('Бұл сабақты кестеңізден шынымен өшіргіңіз келе ме?')) {
      dispatch(removeLessonFromSchedule({ scheduleId, lessonId }));
    }
  };

  return (
    <div className="container mt-5">
      <h2>Сабақ кестесі</h2>
      
      {/* Форма добавления урока в расписание */}
      <form onSubmit={handleAddLesson} className="mb-4">
        <div className="form-row">
          <div className="form-group col-md-5">
            <label htmlFor="date">Уақыт</label>
            <input
              type="date"
              className="form-control"
              id="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              required
            />
          </div>
          <br />
          <div className="form-group col-md-5">
            <label htmlFor="lesson">Сабақ</label>
            <select
              id="lesson"
              className="form-control"
              value={selectedLesson}
              onChange={(e) => setSelectedLesson(e.target.value)}
              required>
              <option value="">Сабақты таңдаңыз</option>
              {lessons.map(lesson => (
                <option key={lesson._id} value={lesson._id}>{lesson.title}</option>
              ))}
            </select>
          </div>
          <br />
          <div  className="form-group col-md-2 align-self-end">
            <button style={{
            padding: '10px 28px',
            borderRadius: '28px',
            fontWeight: '700'
          }} type="submit" className="btn btn-primary btn-block">
              Сабақты қосу
            </button>
          </div>
        </div>
      </form>
      {/* Отображение расписания */}
      {status === 'loading' ? (
        <Container> <Row ><Col md={12}>
    </Col> <h4 className='text-center'>Сабақ кестесі көшірілуде...</h4></Row> </Container>
      ) : status === 'failed' ? (
        <Container> <Row ><Col md={12}>
    </Col> <h4 className='text-center'>Қате: {error}</h4></Row> </Container>
      ) : schedules.length === 0 ? (
        <Container> <Row ><Col md={12}>
    </Col> <h4 className='text-center'>Сабақ кестесі бос.</h4></Row> </Container>
      ) : (
        schedules.map(schedule => (
          <div key={schedule._id} className="card mb-3">
            <div className="card-header">
              {new Date(schedule.date).toLocaleDateString()}
            </div>
            <ul className="list-group list-group-flush">
              {schedule.lessons.length === 0 ? (
                <li className="list-group-item">Бұл күнге сабақ жоқ.</li>
              ) : (
                schedule.lessons.map(lesson => (
                  <li key={lesson._id} className="list-group-item d-flex justify-content-between align-items-center">
                    {lesson.title}
                    <button
                      className="btn btn-sm btn-danger"
                      style={{
                        padding: '8px 28px',
                        borderRadius: '28px'
                      }}
                      onClick={() => handleRemoveLesson(schedule._id, lesson._id)}
                    >
                      Сабақты кестеден өшіру
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        ))
      )}
    </div>
  );
};

