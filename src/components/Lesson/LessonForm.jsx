// components/LessonForm.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import SimpleMDE from 'react-simplemde-editor';
import 'simplemde/dist/simplemde.min.css';
import PropTypes from 'prop-types';
import { Container, Row, Col, Button } from 'react-bootstrap'
import { useDispatch } from 'react-redux';
import { fetchLessons } from '../../redux/slices/lesson';
import axios from '../../tools/axios'

export const LessonForm = ({ onSubmit, initialData }) => {

  const dispatch = useDispatch()
  // Отдельное состояние для поля 'theory'
  const [theory, setTheory] = useState(initialData?.theory || '');

  // Состояние для управления загрузкой видео
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [videoUploadError, setVideoUploadError] = useState(null);

  // Реф для скрытого инпута файла видео
  const videoInputRef = useRef(null);

  // Состояние для остальных полей формы
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    videoUrl: initialData?.videoUrl || '',
    tasks: initialData?.tasks || [
      { question: '', correctAnswer: '' },
      { question: '', correctAnswer: '' },
      { question: '', correctAnswer: '' },
    ],
    task: {
      question: initialData?.task?.question || '',
      correctAnswer: initialData?.task?.correctAnswer || '',
    },
    tests: initialData?.tests || [
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
      },
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
      },
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
      },
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
      },
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
      },
    ],
  });


  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    if (name.startsWith('task.')) {
      const taskField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        task: {
          ...prev.task,
          [taskField]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  }, []);

  // Обработчик изменений для поля 'theory'
  const handleTheoryChange = useCallback((value) => {
    setTheory(value);
  }, []);

  const handleVideoUploadClick = () => {
    if (videoInputRef.current) {
      videoInputRef.current.click();
    }
  };

  const handleVideoChange = async (event) => {
    try {
      setIsUploadingVideo(true);
      setVideoUploadError(null);

      const file = event.target.files[0];
      if (!file) return;

      // Проверка типа файла
      const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
      if (!allowedTypes.includes(file.type)) {
        setVideoUploadError('Недопустимый тип файла. Разрешены MP4, WEBM, OGG.');
        setIsUploadingVideo(false);
        return;
      }

      // Проверка размера файла (например, не более 100MB)
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        setVideoUploadError('Файл слишком большой. Максимальный размер 100MB.');
        setIsUploadingVideo(false);
        return;
      }

      const formDataVideo = new FormData();
      formDataVideo.append("video", file);

      const { data } = await axios.post("/api/upload/lesson", formDataVideo, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Загрузка видео: ${percentCompleted}%`);
          // Вы можете сохранить percentCompleted в состоянии и отобразить прогресс-бар
        },
      });

      // Предполагается, что сервер возвращает объект с полем 'url'
      setFormData(prev => ({
        ...prev,
        videoUrl: data.url, // Измените на соответствующее поле из ответа сервера
      }));
    } catch (error) {
      console.warn(error);
      setVideoUploadError("Бейнені көшіру кезінде қате шықты");
    } finally {
      setIsUploadingVideo(false);
      // Если необходимо обновить данные после загрузки видео, можно вызвать действие
      dispatch(fetchLessons());
    }
  };
  const handleTestChange = useCallback((index, field, value) => {
    setFormData(prev => {
      const updatedTests = [...prev.tests];
      if (field.startsWith('options.')) {
        const optionIndex = parseInt(field.split('.')[1], 10);
        updatedTests[index].options[optionIndex] = value;
      } else {
        updatedTests[index][field] = value;
      }
      return { ...prev, tests: updatedTests };
    });
  }, []);

  const handleTaskChange = useCallback((index, field, value) => {
    setFormData(prev => {
      const updatedTasks = [...prev.tasks];
      updatedTasks[index][field] = value;
      return { ...prev, tasks: updatedTasks };
    });
  }, []);

  // Оптимизация опций для SimpleMDE с помощью useMemo
  const mdeOptions = useMemo(() => ({
    spellChecker: false,
    placeholder: "Сабақтың теориясын енгізіңіз...",
    toolbar: [
      "bold", "italic", "heading", "|",
      "quote", "unordered-list", "ordered-list", "|",
      "link", "image", "|",
      {
        name: "center",
        action: function customFunction(editor) {
          const cm = editor.codemirror;
          const selectedText = cm.getSelection();
          const centeredText = `<div class="text-center">\n${selectedText}\n</div>`;
          cm.replaceSelection(centeredText);
        },
        className: "fa fa-align-center",
        title: "Ортаға қою"
      },
      "|",
      "preview", "side-by-side", "fullscreen", "|",
      "guide"
    ]
  }), []);
  
  

  // Обработчик отправки формы
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    // Проверка всех задач на заполненность
    for (let i = 0; i < formData.tasks.length; i++) {
      const task = formData.tasks[i];
      if (!task.question.trim() || !task.correctAnswer.trim()) {
        alert(`Тапсырманың барлық өрістерін толтырыңыз ${i + 1}.`);
        return;
      }
    }
    // Проверка тестовых вопросов (если необходимо)
    for (let i = 0; i < formData.tests.length; i++) {
      const test = formData.tests[i];
      if (!test.question.trim() || test.options.some(opt => !opt.trim()) || !test.correctAnswer.trim()) {
        alert(`Тест сұрағы үшін барлық өрістерді толтырыңыз ${i + 1}.`);
        return;
      }
    }
    // Объединение теории с остальными данными формы
    onSubmit({ ...formData, theory });
  }, [onSubmit, formData, theory]);
  
  return (
    <Container>
      <form onSubmit={handleSubmit}>
        {/* Поля заголовка, описания и т.д. */}
        <div>
          <input
            className=' lesson-title-input w-100'
            type="text"
            name="title"
            placeholder='Сабақтың тақырыбы...'
            style={{
              border: 'none',
              padding: '0',
              fontSize: '2rem'
            }}
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <SimpleMDE
            className='simple-mde'
            value={theory}
            onChange={handleTheoryChange}
            options={mdeOptions}
          />
        </div>
        {/* Поле загрузки видео */}
        <div className="form-group">
          <div className='videoupload-div' style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              onClick={handleVideoUploadClick}
              className=""
              disabled={isUploadingVideo}>
              {isUploadingVideo ? 'Көшірілуде...' : 'Видеоны көшіру'}
            </Button>

          </div>
          {videoUploadError && <p className="text-danger">{videoUploadError}</p>}
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            hidden
            ref={videoInputRef}
          />
          {formData.videoUrl && (
            <div className="mt-2 uploadedvideo-div">
              <video className=" w-100" width="auto" height="auto" controls>
                <source src={`http://34.116.228.89${formData.videoUrl}`} type="video/mp4" />
                Ваш браузер не поддерживает видео тег.
              </video>
            </div>
          )}
        </div>
        <br />
        <div>
          <h5>Есептер</h5>
          {formData.tasks.map((task, index) => (
            <div key={index} className="task-section">
              <h6>Есеп №{index + 1}</h6>
              <div>
                <textarea
                  placeholder='Есептің берілгені'
                  className='form-control'
                  name={`tasks.${index}.question`}
                  value={task.question}
                  onChange={(e) => handleTaskChange(index, 'question', e.target.value)}
                  style={{
                    borderBottomLeftRadius: '1px',
                    borderBottomRightRadius: '1px'
                  }}
                  required
                  rows={3}
                />
              </div>
              <div>
                <input
                  type="text"
                  className='form-control'
                  placeholder='Дұрыс жауабы'
                  name={`tasks.${index}.correctAnswer`}
                  value={task.correctAnswer}
                  onChange={(e) => handleTaskChange(index, 'correctAnswer', e.target.value)}
                  style={{
                    borderTopLeftRadius: '1px',
                    borderTopRightRadius: '1px',
                    borderTop: 'none'
                  }}
                  required
                />
              </div>
              <hr />
            </div>
          ))}
        </div>
        {/* Секция для тестов */}
        <br />
        <div>
          <h5>Тест cұрақтары</h5>
          {formData.tests.map((test, index) => (
            <div key={index} className="test-question">
              <h5>Сұрақ №{index + 1}</h5>
              <div>
                <textarea
                  type="text"
                  rows={3}
                  placeholder='Тест сұрағының мәтіні'
                  className='form-control'
                  value={test.question}
                  onChange={(e) => handleTestChange(index, 'question', e.target.value)}
                  required
                />
              </div>
              <br />
              <Row>
                <Col md={6} className='d-flex col align-items-center mb-2'>
                  <label style={{ fontSize: 'x-large' }}>A)&nbsp;</label>
                  <input
                    className='form-control'
                    type="text"
                    value={test.options[0]}
                    onChange={(e) => handleTestChange(index, 'options.0', e.target.value)}
                    required
                  />
                </Col>
                <Col md={6} className='d-flex col align-items-center mb-2'>
                  <label style={{ fontSize: 'x-large' }}>B)&nbsp;</label>
                  <input
                    className='form-control'
                    type="text"
                    value={test.options[1]}
                    onChange={(e) => handleTestChange(index, 'options.1', e.target.value)}
                    required
                  />
                </Col>
                <Col md={6} className='d-flex col align-items-center mb-2'>
                  <label style={{ fontSize: 'x-large' }}>C)&nbsp;</label>
                  <input
                    className='form-control'
                    type="text"
                    value={test.options[2]}
                    onChange={(e) => handleTestChange(index, 'options.2', e.target.value)}
                    required
                  />
                </Col>
                <Col md={6} className='d-flex col align-items-center mb-2'>
                  <label style={{ fontSize: 'x-large' }}>D)&nbsp;</label>
                  <input
                    className='form-control'
                    type="text"
                    value={test.options[3]}
                    onChange={(e) => handleTestChange(index, 'options.3', e.target.value)}
                    required
                  />
                </Col>

              </Row>
              <Row>
                <Col md={6} className='mt-2'>
                  <select
                    className='form-select '
                    value={test.correctAnswer}
                    onChange={(e) => handleTestChange(index, 'correctAnswer', e.target.value)}
                    required
                  >
                    <option value="">Дұрыс жауабын таңдаңыз</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </Col>
              </Row>



              <hr />
            </div>
          ))}
        </div>
        <Row >
          <Col md={12} className='text-center'>
            <button type="submit" className="btn btn-primary mb-4" style={{
              fontSize: 'larger',
              borderRadius: '28px',
              padding: '10px 26px'
            }} >
              {initialData ? 'өзгертулерді сақтау' : 'Сабақты құру'}
            </button>
          </Col>
        </Row>

      </form>
    </Container>

  );
};

LessonForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object,
};


