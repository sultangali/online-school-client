// src/pages/LessonDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Row, Col, Table } from 'react-bootstrap'

import { fetchLessons, deleteLesson } from '../../redux/slices/lesson';
import { submitTest, getSubmissions, reviewSubmission } from '../../redux/slices/submission'
import { LessonTheoryView } from '../../components/Lesson/LessonTheoryView';
import { toast } from 'react-toastify';

export const LessonDetail = () => {
  const { lessonId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { lessons, status, error } = useSelector(state => state.lessons);
  const { submissions } = useSelector(state => state.submissions);
  const { user } = useSelector(state => state); // Предполагается, что auth слайс содержит объект user

  // Состояние для теста
  const [testAnswers, setTestAnswers] = useState({}); // { testId: selectedOption }


  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchLessons())
        .unwrap()
        .catch(err => {
          toast.error(`Сабақтарды жүктеу қатесі: ${err}`);
        });
    }

    // Получение решений задач для урока
    dispatch(getSubmissions({ lessonId }))
      .unwrap()
      .catch(err => {
        toast.error(`Мәселелердің шешімін алу кезіндегі қате: ${err}`);
      });
  }, [status, dispatch, lessonId]);

  const lesson = lessons.find(l => l._id === lessonId);

  const handleDelete = () => {
    if (window.confirm('Осы сабақты шынымен жойғыңыз келе ме?')) {
      dispatch(deleteLesson(lessonId))
        .unwrap()
        .then(() => {
          toast.success('Сабақ сәтті жойылды');
          navigate('/lessons');
        })
        .catch(err => {
          toast.error(`Сабақты жою кезіндегі қате: ${err.message}`);
        });
    }
  };

  const handleTestChange = (testId, selectedOption) => {
    setTestAnswers(prev => ({
      ...prev,
      [testId]: selectedOption,
    }));
  };
  const handleTestSubmit = async (e) => {
    e.preventDefault();

    // Проверяем, что все 5 вопросов отвечены
    const unanswered = lesson.tests.slice(0, 5).some(test => !testAnswers[test._id]);
    if (unanswered) {
      toast.error('Тест бойынша барлық сұрақтарға жауап беріңіз.');
      return;
    }

    // Подготовка данных для отправки
    const formattedAnswers = Object.entries(testAnswers).map(([testId, selectedAnswer]) => ({
      questionId: testId,
      selectedAnswer,
    }));

    try {
      // Отправка данных на сервер через Redux-экшен
      const response = await dispatch(submitTest({ lessonId, answers: formattedAnswers })).unwrap();
      
      toast.success(`Тест сынағы сәтті жіберілді. Сіздің ұпайыңыз: ${response.totalScore}`);
     
      window.location.assign(`/lessons/${lessonId}/test-result`);
    } catch (err) {
      console.log(err)
      window.alert(err)
      toast.error(`Тест сынағы жіберу қатесі: ${err}`);
    }
  };

  // Фильтрация отправок, относящихся к задачам этого урока
  const lessonSubmissions = submissions.filter(sub =>
    sub.task && lesson?.tasks.some(task => task._id.toString() === sub.task._id.toString())
  );

  if (status === 'loading') {
    return <Container> <Row style={{ height: '90vh'}}><Col md={12}>
      </Col> <h4 className='text-center'>Сабақ жүктелуде...</h4></Row> </Container>;
  }

  if (status === 'failed') {
    return <Container> <Row style={{ height: '90vh'}}><Col md={12}>
      </Col> <h4 className='text-center'>Қате: {error}</h4></Row> </Container>;
  }

  if (!lesson) {
    return <Container> <Row style={{ height: '90vh'}}><Col md={12}>
      </Col> <h4 className='text-center'>Сабақ табылмады.</h4></Row> </Container>;
  }

  // Определение ролей пользователя
  const isTeacher = user.role === 'teacher' || user.role === 'admin';
  // Функция для обработки проверки отправки
  const handleReview = async (submissionId) => {
    const scoreInput = prompt('Оқушыға орындаған есебі үшін баға қойыңыз (0-100):');
    if (scoreInput === null) return; // Пользователь отменил

    const score = Number(scoreInput);
    if (isNaN(score) || score < 0) {
      toast.error('Өтінеміз, бағаны қою үшін дұрыс санды енгізіңіз.');
      return;
    }

    const feedback = prompt('Пікір қалдырыңыз (қосымша):');

    try {
      await dispatch(reviewSubmission({ lessonId, submissionId, score, feedback })).unwrap();
      toast.success('Есеп жауабы сәтті тексерілді.');
    } catch (err) {
      toast.error(`Есеп жауабын тексеруде қате шықты: ${err}`);
    }
  };

  // Функция для расчета среднего балла за задачи
  const calculateAverageTaskScore = (lesson) => {
    const scores = lesson.submissions
      .filter(sub => sub.task && sub.task.toString() === sub.task.toString())
      .map(sub => sub.score);
    if (scores.length === 0) return 0;
    const average = scores.reduce((acc, score) => acc + score, 0) / scores.length;
    return Math.round(average);
  };

  const ABCD = ["A", "B", "C", "D"]

  return (
    <Container>
      <Row>
        <Col md={12}>
          <div className="lesson-detail">
            <br />
            <h1>{lesson.title}</h1>
            <hr />
            <p>{lesson.description}</p>
            {/* Теория урока */}
            <LessonTheoryView theory={lesson.theory} />
            {/* Видео урока */}
            <hr />
            {lesson.videoUrl && (
              <div className="lesson-video ">
                <h3>Сабақ видео бейнесі:</h3>
                <video width="auto" className='w-100' style={{ border: '1px solid gray', height: '730px' }} controls>
                  <source src={`http://34.116.228.89${lesson.videoUrl}`} type="video/mp4" />
                  Сіздің браузеріңіз видео форматын көтермейді.
                </video>
              </div>
            )}
            <hr />
            {/* Раздел Задач */}
            {isTeacher ?
              <div className="lesson-tasks">
                <h3>Есептер (Мұғалімдер үшін):</h3>
                <ul>
                  {lesson.tasks.slice(0, 3).map((task, index) => (
                    <li key={task._id}>
                      <div className="task-item mb-3">
                        <p>{task.question}</p>
                        <p><strong>Дұрыс жауабы: </strong>{task.correctAnswer}</p>
                        <h6>Бағалар:</h6>
                        <Table striped bordered hover>
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Фамилиясы</th>
                              <th>Аты</th>
                              <th>Әкесінің аты</th>
                              <th>Қолданушы аты</th>
                              <th>Бағасы</th>
                            </tr>
                          </thead>
                          <tbody>
                            {lesson.submissions
                              .filter(sub => sub.task.toString() === task._id.toString())
                              .map((sub, i) => (
                                  <tr key={sub._id}>
                                    <td>{(sub.student._id).substring(17, 23)}</td>
                                    <td>{sub.student.lastName}</td>
                                    <td>{sub.student.firstName}</td>
                                    <td>{sub.student.patronymic}</td>
                                    <td>{sub.student.username}</td>
                                    <td>{sub.score}</td>
                                  </tr>
                              ))}
                          </tbody>

                        </Table>
                        {/* <p><strong>Тапсырма бойынша орташа баға: </strong>{calculateAverageTaskScore(lesson)}%</p> */}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              :
              <div className="lesson-tasks">
                <h3>Есептер:</h3>
                <Row>
                  {lesson.tasks.slice(0, 3).map((task, index) => (
                    <Col md={4}>
                      <div key={task._id} className="task-item mb-3">
                        <p><strong>Тапсырма №{index + 1}:</strong> {task.question}</p>
                        <Link style={{
                          padding: '10px 28px',
                          fontWeight: '700',
                          borderRadius: '30px'
                        }} to={`/lessons/${lesson._id}/submit-task/${task._id}`} className="btn btn-primary">
                          Жауап жіберу
                        </Link>
                      </div>
                    </Col>

                  ))}
                </Row>


              </div>
            }
            <hr />

            {/* Раздел Тестов */}
            {

            }
            {lesson.tests && lesson.tests.length > 0 && (
              <div className="lesson-test">
                <h3>Тест сұрақтары:</h3>
                <form onSubmit={handleTestSubmit}>
                  {lesson.tests.slice(0, 5).map((test, index) => (
                    <div key={test._id} className="test-question mb-3">
                      <p ><strong>{index + 1}. </strong> {test.question}</p>
                      {test.options.map((option, optIndex) => (
                        <>
                          <div key={optIndex} className="form-check">
                            <span style={{ fontWeight: '500' }}>{ABCD[optIndex]})&nbsp;</span> <input
                              className="form-check-input"
                              type="radio"
                              name={test._id}
                              id={`${test._id}-${optIndex}`}
                              value={option}
                              checked={testAnswers[test._id] === option}
                              onChange={() => handleTestChange(test._id, option)}
                              required
                            />
                            <label className="form-check-label" htmlFor={`${test._id}-${optIndex}`}>
                              {option}
                            </label>
                          </div>
                        </>
                      ))}
                    </div>
                  ))}
                  <button type="submit" disabled={isTeacher} style={{ padding: '10px 30px', borderRadius: '28px', fontWeight: '700' }} className="btn btn-success">{isTeacher ? `Тек оқушылар тест жауаптарын тексеруге жібере алады` : `Тест жауабын жіберу`}</button>
                  <button style={{
                    padding: '10px 28px',
                    borderRadius: '28px',
                    marginLeft: '12px'
                  }} className='btn btn-secondary' onClick={() => {window.location.assign(`/lessons/${lessonId}/test-result`)}}>Тест жауабын қарау</button>
                </form>
                {/* Удаляем ссылку "Показать все тесты", так как у нас только 5 вопросов */}
              </div>
            )}

            {/* Раздел Решений Задач (для учителей) */}
            {isTeacher && (
              <div className="lesson-submissions mt-5">
                <h3>Есептер жауаптары (Мұғалімдер үшін):</h3>
                {lessonSubmissions.length === 0 ? (
                  <p>Келген жауаптар жоқ.</p>
                ) : (
                  <table className="table table-striped" style={{ border: '1px solid gray' }}>
                    <thead>
                      <tr>
                        <th>Студент</th>
                        <th>Есеп</th>
                        <th>Жауап</th>
                        <th>Баға</th>
                        <th>Статус</th>
                        <th>Уақыты</th>
                        <th>Әрекет</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lessonSubmissions.map(submission => (
                        <tr key={submission._id}>
                          <td>{submission.student.username} ({submission.student.email})</td>
                          <td>{submission.task ? submission.task.question : 'Тапсырма табылмады'}</td>
                          <td>{submission.answer}</td>
                          <td>{submission.score}</td>
                          <td>{submission.status == 'approved' ? 'рұқсат етілді' : 'рұқсат жоқ'}</td>
                          <td>{new Date(submission.submittedAt).toLocaleString()}</td>
                          <td>
                            {submission.status === 'pending' ? (
                              <button onClick={() => handleReview(submission._id)} className="btn btn-sm btn-primary">
                                Тексеру
                              </button>
                            ) : (
                              <span>Тексерілді</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
            {/* Кнопки для учителей и админов */}
            {isTeacher && (
              <div className="lesson-actions mt-4 mb-5" >
                <Link to={`/lessons/${lesson._id}/edit`} style={{
                  padding: '10px 26px',
                  fontWeight: '700',
                  borderRadius: '28px'
                }} className="btn btn-warning mr-2">
                  Сабақты өзгерту
                </Link>
                <button style={{
                  marginLeft: '12px', 
                  padding: '10px 26px',
                  fontWeight: '700',
                  borderRadius: '28px'
                }} onClick={handleDelete} className="btn btn-danger">
                  Сабақты жою
                </button>
              </div>
            )}
          </div>
          <br />
        </Col>
      </Row>
    </Container>

  );
};

