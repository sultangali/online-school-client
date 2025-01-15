// src/pages/SubmitTask.jsx
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col } from 'react-bootstrap'

import { submitTask, fetchTaskDetails } from '../../redux/slices/submission';
import { toast } from 'react-toastify';
import SimpleMDE from 'react-simplemde-editor';
import 'simplemde/dist/simplemde.min.css';

export const SubmitTask = () => {
  const { lessonId, taskId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { lessons, status, error } = useSelector(state => state.lessons);
  const lesson = lessons.find(l => l._id === lessonId);
  const task = lesson?.tasks.find(t => t._id === taskId);

  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!lesson) {
      dispatch(fetchTaskDetails({ lessonId, taskId }))
        .unwrap()
        .catch(err => {
          toast.error(`Тапсырманы жүктеу қатесі: ${err.message}`);
        });
    }
  }, [lesson, dispatch, lessonId, taskId]);

  useEffect(() => {
    if (task) {
      // Здесь можно предзаполнить ответ, если есть предыдущие отправки
      setAnswer(task.previousAnswer || '');
    }
  }, [task]);

  // Обработчик изменения ответа
  const handleAnswerChange = useCallback((value) => {
    setAnswer(value);
  }, []);

  // Опции для SimpleMDE
  const mdeOptions = useMemo(() => ({
    spellChecker: false,
    placeholder: "Өзіңіздің жауабыңызды осында жазыңыз...",
    toolbar: [
      "bold", "italic", "heading", "|",
      "quote", "unordered-list", "ordered-list", "|",
      "link", "image", "|",
      "preview", "side-by-side", "fullscreen", "|",
      "guide"
    ],
  }), []);

  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!answer.trim()) {
      toast.error('Өтінеміз, жауабыңызды жазыңыз.');
      return;
    }

    setIsSubmitting(true);

    try {
      await dispatch(submitTask({ lessonId, taskId, answer })).unwrap();
      toast.success('Сіздің шешіміңіз сәтті жіберілді және тексеруді күтуде.');
      navigate(`/lessons/${lessonId}`);
    } catch (error) {
      toast.error(`Шешімді жіберу қатесі: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return <Container> <Row style={{ height: '90vh' }}><Col md={12}>
    </Col> <h4 className='text-center'>Тапсырма көшірілуде...</h4></Row> </Container>;
  }

  if (status === 'failed') {
    return <Container> <Row style={{ height: '90vh' }}><Col md={12}>
    </Col> <h4 className='text-center'>Қате: {error}</h4></Row> </Container>;
  }

  if (!lesson || !task) {
    return <Container> <Row style={{ height: '90vh' }}><Col md={12}>
    </Col> <h4 className='text-center'>Тапсырма табылмады.</h4></Row> </Container>;
  }

  return (
    <Container  > 
      <Row style={{ height: '90vh' }}>
        <Col className='d-flex row align-items-center ' md={12}>
          <div className="submit-task-container w-100">
            <h2>Тапсырма жауабын жіберу</h2>
            <hr />
            <p style={{ fontWeight: '500', fontSize: '18px' }}><strong>Тапсырма:</strong> {task.question}</p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label style={{fontSize: '18px', fontWeight: '500'}} htmlFor="answer">Сіздің жауабыңыз:</label>
                <SimpleMDE
                  value={answer}
                  onChange={handleAnswerChange}
                  options={mdeOptions}
                  className='simple-mde '
                />
              </div>
              <button type="submit" style={{
                padding: '10px 28px',
                fontWeight: '700',
                borderRadius: '28px'
              }} className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Жіберілуде...' : 'Жауапты жіберу'}
              </button>
            </form>
          </div>
        </Col>
      </Row>
    </Container>

  );
};