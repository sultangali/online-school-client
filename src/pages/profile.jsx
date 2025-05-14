// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { Tab, Container, Row, Col, Button, Card, Tabs, Form, Table, ProgressBar } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { fetchAuthMe, selectIsAuth } from "../redux/slices/user.js";
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';

import { format, parse, startOfWeek, getDay } from 'date-fns';
import { kk } from 'date-fns/locale';

import axios from "../tools/axios.js";
import { ContentSpinner } from '../components/index.js';
import alt from '../images/alt.png';

import { fetchSchedule, addLessonToSchedule, removeLessonFromSchedule } from '../redux/slices/schedule.js';
import { fetchLessons } from '../redux/slices/lesson.js'; // Предполагается, что есть слайс для уроков
import { fetchRating } from "../redux/slices/rating.js";// Предполагается, что есть слайс для уроков
import 'react-big-calendar/lib/css/react-big-calendar.css'; // Импорт стилей календаря
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom'; // Для навигации

import { Line, Pie, Doughnut, Bar } from "react-chartjs-2"; // Для диаграммы
import { Chart as ChartJS,  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement } from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  ArcElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Profile = () => {
  const inputFileRef = React.useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userData = useSelector((state) => state.user.data);
  const isAuth = useSelector(selectIsAuth);

  const {
    schedules,
    status: scheduleStatus,
    error: scheduleError,
    addStatus,
    addError,
    removeStatus,
    removeError,
  } = useSelector((state) => state.schedule);

  const {
    lessons,
    status: lessonsStatus,
    error: lessonsError,
  } = useSelector((state) => state.lessons);

  const {
    submissions,
    testResults,
    status: ratingStatus,
    error: ratingError,
  } = useSelector((state) => state.rating);

  const locales = {
    kk,
  };

  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
  });

  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedLesson, setSelectedLesson] = useState("");
  const [ratingData, setRatingData] = useState({
    lessons: [],
    averageTaskScore: 0,
    averageTestScore: 0,
    overallAverage: 0,
  });

  useEffect(() => {
    if (scheduleStatus === "idle") {
      dispatch(fetchSchedule());
    }
    if (lessonsStatus === "idle") {
      dispatch(fetchLessons());
    }
    // Fetch authenticated user data
    dispatch(fetchAuthMe());
    // Fetch rating data
    dispatch(fetchRating());
  }, [scheduleStatus, lessonsStatus, dispatch]);

  useEffect(() => {
    if (scheduleStatus === "succeeded" && userData) {
      console.log("Schedules:", schedules);
      console.log("User Data:", userData);
      console.log("Submissions:", submissions);
      console.log("Test Results:", testResults);
  
      const mappedEvents = schedules.flatMap((schedule) =>
        schedule.lessons.map((lesson) => {
          let hasPassedTask = false;
          let hasPassedTest = false;
  
          if (userData.role === "student") {
            hasPassedTask = lesson.submissions.some(
              (sub) =>
                sub.student.toString() === userData._id &&
                sub.status === "approved"
            );
  
            // Масштабируем балл до 100%
            const passedTests = lesson.testResults.filter(
              (test) =>
                test.student.toString() === userData._id
            );
  
            hasPassedTest = passedTests.some((test) => {
              const scaledTestScore = (test.totalScore / 50) * 100; // Предполагается, что тест из 50
              return scaledTestScore >= 50; // Минимум 50% для прохождения
            });
          } else if (userData.role === "teacher") {
            hasPassedTask = lesson.submissions.length > 0;
            hasPassedTest = lesson.testResults.length > 0;
          }
  
          console.log(`Lesson ID: ${lesson._id}`);
          console.log(`hasPassedTask: ${hasPassedTask}`);
          console.log(`hasPassedTest: ${hasPassedTest}`);
  
          let color = "#FF69B4"; // Фиолетовый по умолчанию
          if (hasPassedTask) {
            color = "#28a745"; // Зеленый
          } else if (!hasPassedTask) {
            color = "#FFA500"; // Оранжевый для частичного прохождения
          } else {
            color = "#D3D3D3"; // Серый для не пройденных
          }
  
          return {
            id: lesson._id,
            title: lesson.title,
            start: new Date(schedule.date),
            end: new Date(schedule.date),
            allDay: true,
            color: color,
            desc: lesson.description || "Сабақ туралы мәлімет жоқ",
            location: lesson.videoUrl
              ? `http://34.116.228.89${lesson.videoUrl}`
              : "Место проведения отсутствует.",
            scheduleId: schedule._id,
            lessonId: lesson._id,
          };
        })
      );
      console.log("Mapped Events:", mappedEvents);
      setEvents(mappedEvents);
  
      if (userData.role === "student") {
        const calculatedRatingData = calculateRating(submissions, testResults);
        setRatingData(calculatedRatingData);
      }
    }
  }, [schedules, scheduleStatus, userData, submissions, testResults]);

  useEffect(() => {
    if (addStatus === "succeeded") {
      toast.success("Сабақ кестеге сәтті қосылды");
      dispatch(fetchSchedule()); // Обновляем расписание
    }
    if (addStatus === "failed") {
      toast.error(`Сабақты қосу қатесі: ${addError}`);
    }
  }, [addStatus, addError, dispatch]);

  useEffect(() => {
    if (removeStatus === "succeeded") {
      toast.success("Сабақ кестеден сәтті жойылды");
      // Обновление расписания уже сделано в Redux Slice
    }
    if (removeStatus === "failed") {
      toast.error(`Сабақты жою кезіндегі қате: ${removeError}`);
    }
  }, [removeStatus, removeError]);

  const calculateRating = (submissions, testResults) => {
    const lessonScores = {};
  
    // Сбор оценок по задачам
    submissions.forEach((sub) => {
      const lessonId = sub.lessonId.toString();
      if (!lessonScores[lessonId]) {
        lessonScores[lessonId] = { taskScores: [], testScores: [] };
      }
      lessonScores[lessonId].taskScores.push(sub.score);
    });
  
    // Сбор оценок по тестам и масштабирование до 100%
    testResults.forEach((test) => {
      const lessonId = test.lessonId.toString();
      if (!lessonScores[lessonId]) {
        lessonScores[lessonId] = { taskScores: [], testScores: [] };
      }
      // Масштабируем до 100%: 50 баллов = 100%
      const scaledTestScore = (test.totalScore / 50) * 100;
      lessonScores[lessonId].testScores.push(scaledTestScore > 100 ? 100 : scaledTestScore);
    });
  
    // Вычисление средних оценок по каждому уроку
    const lessonsArray = Object.keys(lessonScores).map((lessonId) => {
      const tasks = lessonScores[lessonId].taskScores;
      const tests = lessonScores[lessonId].testScores;
  
      const averageTaskScore =
        tasks.length > 0
          ? Math.round(tasks.reduce((acc, score) => acc + score, 0) / tasks.length)
          : 0;
  
      const averageTestScore =
        tests.length > 0
          ? Math.round(tests.reduce((acc, score) => acc + score, 0) / tests.length)
          : 0;
  
      return {
        lessonId,
        averageTaskScore,
        averageTestScore,
      };
    });
  
    // Сбор всех оценок для вычисления общего среднего
    const allTaskScores = lessonsArray.map((lesson) => lesson.averageTaskScore);
    const allTestScores = lessonsArray.map((lesson) => lesson.averageTestScore);
  
    const overallAverageTask =
      allTaskScores.length > 0
        ? allTaskScores.reduce((acc, score) => acc + score, 0) / allTaskScores.length
        : 0;
  
    const overallAverageTest =
      allTestScores.length > 0
        ? allTestScores.reduce((acc, score) => acc + score, 0) / allTestScores.length
        : 0;
  
    const overallAverage = Math.round((overallAverageTask + overallAverageTest) / 2);
  
    return {
      lessons: lessonsArray,
      averageTaskScore: Math.round(overallAverageTask),
      averageTestScore: Math.round(overallAverageTest),
      overallAverage: Math.min(overallAverage, 100),
    };
  };

  const handleChangeFile = async (event) => {
    try {
      const formData = new FormData();
      const file = event.target.files[0];
      formData.append("image", file);
      const { data } = await axios.post("/api/upload/avatar", formData);
      // Предполагается, что сервер возвращает путь к загруженному изображению
    } catch (error) {
      console.warn(error);
      alert("Бейнені көшіру кезінде қате шықты");
    }
    dispatch(fetchAuthMe());
  };

  const handleAddLesson = (e) => {
    e.preventDefault();
    const date = selectedDate.toISOString().split("T")[0]; // Форматирование даты YYYY-MM-DD
    if (!date || !selectedLesson) {
      toast.error("Өтінеміз, күн мен сабақты таңдаңыз");
      return;
    }
    dispatch(addLessonToSchedule({ date, lessonId: selectedLesson }));
    setSelectedLesson("");
  };

  const handleRemoveLesson = (scheduleId, lessonId) => {
    if (window.confirm("Бұл сабақты кестеңізден шынымен өшіргіңіз келе ме?")) {
      dispatch(removeLessonFromSchedule({ scheduleId, lessonId }));
    }
  };

  // Обработка клика на событие
  const handleSelectEvent = (event) => {
    // Перенаправление на страницу урока
    window.location.assign(`/lessons/${event.lessonId}`);
  };

  // Локальная дата для календаря (react-big-calendar требует объект Date)
  const handleNavigate = (date) => {
    setSelectedDate(date);
  };

  return !userData ? (
    <ContentSpinner />
  ) : (
    <Container>
      <br />
      <Container>
        <Tab.Container defaultActiveKey={"profile"}>
          <h4
            style={{
              fontWeight: "700",
              fontSize: "xx-large",
              marginBottom: "24px",
            }}
          >
            Жеке профиль
          </h4>
          <Row>
            <Col lg={3} xs={12}>
              <Card>
                <Card.Body>
                  <Row className="flex-column align-items-center">
                    <img
                      onClick={() => inputFileRef.current.click()}
                      src={
                        userData && userData.avatar
                          ? `http://34.116.228.89${userData.avatar}`
                          : alt
                      }
                      alt="Мына жерде сурет туру керек"
                      style={{
                        width: "250px",
                        height: "250px",
                        cursor: "pointer",
                        objectFit: "cover",
                      }}
                    />
                    <input
                      type="file"
                      onChange={handleChangeFile}
                      hidden
                      ref={inputFileRef}
                    />
                    <h5 className="text-center mt-3">
                      {userData && userData.username}
                    </h5>
                    {/* <Button variant="link" href="/edit-profile">
                      Профильді өңдеу
                    </Button> */}
                  </Row>
                </Card.Body>
              </Card>
            </Col>
            <Col>
              <Tabs defaultActiveKey="profile" className="mb-3" justify>
                <Tab eventKey="profile" title="Жеке мәліметтер">
                <h5>Сіздің жеке мәліметтеріңіз</h5>
                <Row>
                  <Col md={9}>
                  <Table bordered>
                    <tbody>
                      <tr>
                        <td><strong>Аты</strong></td>
                        <td>{userData.firstName}</td>
                      </tr>
                      <tr>
                        <td><strong>Фамилиясы</strong></td>
                        <td>{userData.lastName}</td>
                      </tr>
                      <tr>
                        <td><strong>Әкесінің аты</strong></td>
                        <td>{userData.patronymic}</td>
                      </tr>
                      <tr>
                        <td><strong>Қолданушы аты</strong></td>
                        <td>{userData.username}</td>
                      </tr>
                      <tr>
                        <td><strong>Email</strong></td>
                        <td>{userData.email}</td>
                      </tr>
                      <tr>
                        <td><strong>Рөлі</strong></td>
                        <td>{userData.role}</td>
                      </tr>
                      {/* <tr>
                        <td><strong>Рейтинг</strong></td>
                        <td>{ratingData.overallAverage}</td>
                      </tr> */}
                      {/* Добавьте другие поля по необходимости */}
                    </tbody>
                  </Table>
                  </Col>
                  <Col md={3}>
                        <div className="rating-card w-100 d-flex row text-center align-items-center">
                          <div>
                          <span className="rating-score">{ratingData.overallAverage}</span>
                          <hr />
                          <span className="rating-title">Рейтинг</span>
                          </div>
                        </div>
                  </Col>
                </Row>
                  
                </Tab>

                <Tab eventKey="rating" title="Рейтинг">
                  {userData.role === "student" ? (
                    ratingStatus === "loading" ? (
                      <ContentSpinner />
                    ) : ratingStatus === "failed" ? (
                      <p className="text-danger">Қате: {ratingError}</p>
                    ) : (
                      <div className="mb-4">
                        <h5>Сіздің рейтингіңіз</h5>
                        {/* Таблица оценок по урокам */}
                        

                        
                        <div className="mb-3">
                          <h6>Барлық орындалған есептер бойынша орташа баға</h6>
                          <ProgressBar
                            now={ratingData.averageTaskScore}
                            label={`${ratingData.averageTaskScore}%`}
                            
                            variant="warning"
                          />
                        </div>

                        {/* Прогресс-бар для среднего балла за все тесты */}
                        <div className="mb-3">
                          <h6>Барлық орындалған тест бойынша орташа баға</h6>
                          <ProgressBar
                            now={ratingData.averageTestScore}
                            label={`${ratingData.averageTestScore}%`}
                            style={{}}
                            variant="info"
                          />
                        </div>

                        {/* Диаграмма "пицца" для общего среднего балла */}
                        <Row>
                          <Col md={4}>
                            <div className="mb-4">
                              <h6>Жалпы орташа баға</h6>
                              <Pie
                                key={`pie-${ratingData.overallAverage}`} // Добавьте уникальный ключ
                                data={{
                                  labels: ['Есептер', 'Тесттер'],
                                  datasets: [
                                    {
                                      data: [ratingData.averageTaskScore, ratingData.averageTestScore],
                                      backgroundColor: ['#FF5722', '#1E88E5'],
                                    },
                                  ],
                                }}
                                options={{
                                  plugins: {
                                    legend: {
                                      position: 'bottom',
                                    },
                                  },
                                }}
                              />
                            </div>
                          </Col>

                          <Col md={4}>
                            <div className="mb-4">
                              <h6>&nbsp;</h6>
                              <Doughnut
                                data={{
                                  labels: ['Cіздің рейтингіңіз', 'Барлығы'],
                                  datasets: [
                                    {
                                      data: [ratingData.overallAverage, 100 - ratingData.overallAverage],
                                      backgroundColor: ['#009688', '#D3D3D3'],
                                      hoverBackgroundColor: ['#43A089', '#D3D3D3'],
                                    },
                                  ],
                                }}
                                options={{
                                  plugins: {
                                    legend: {
                                      position: 'bottom',
                                    },
                                  },
                                }}
                              />
                            </div>
                          </Col>
                          
                        </Row>
                        <Table striped bordered hover>
                          <thead>
                            <tr>
                              <th>Сабақ</th>
                              <th>Есеп бойынша баға</th>
                              <th>Тест бойынша баға</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ratingData.lessons.map((lesson, index) => {
                              const lessonDetail = lessons.find(
                                (l) => l._id.toString() === lesson.lessonId
                              );
                              return (
                                <tr key={index}>
                                  <td>
                                    {lessonDetail
                                      ? lessonDetail.title
                                      : "Сабақ табылмады"}
                                  </td>
                                  <td>{lesson.averageTaskScore}</td>
                                  <td>{lesson.averageTestScore}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </Table>          
                      </div>
                    )
                  ) : (
                    <p>Рейтинг доступен только для студентов.</p>
                  )}
                </Tab>

                <Tab eventKey="calendar" title="Күнтізбе">
                  {/* Содержимое вкладки "Күнтізбе" */}
                  {userData.role === "teacher" && (
                    <div className="mb-4">
                      <h5>Сабақ кестесіне сабақ қосыңыз</h5>
                      <Form onSubmit={handleAddLesson}>
                        <Form.Group controlId="formDate">
                          <Form.Label>Уақыт</Form.Label>
                          <Form.Control
                            type="date"
                            value={selectedDate.toISOString().split("T")[0]}
                            onChange={(e) =>
                              setSelectedDate(new Date(e.target.value))
                            }
                            required
                          />
                        </Form.Group>

                        <Form.Group controlId="formLesson" className="mt-3">
                          <Form.Label>Сабақ</Form.Label>
                          <Form.Control
                            as="select"
                            value={selectedLesson}
                            onChange={(e) =>
                              setSelectedLesson(e.target.value)
                            }
                            required
                          >
                            <option value="">Сабақты таңдаңыз</option>
                            {lessons.map((lesson) => (
                              <option key={lesson._id} value={lesson._id}>
                                {lesson.title}
                              </option>
                            ))}
                          </Form.Control>
                        </Form.Group>

                        <Button variant="primary" type="submit" className="mt-3" style={{
                          padding: '10px 28px',
                          fontWeight: '700',
                          borderRadius: '30px',
                          backgroundColor: ''
                        }}>
                          Сабақты қосу
                        </Button>
                      </Form>
                    </div>
                  )}

                  {/* Календарь */}
                  {scheduleStatus === "loading" ? (
                    <ContentSpinner />
                  ) : scheduleStatus === "failed" ? (
                    <p className="text-danger">Ошибка: {scheduleError}</p>
                  ) : (
                    <>
                    <h5>Cіздің сабақ кестеңіз</h5>
                    <Calendar
                      localizer={localizer}
                      events={events}
                      startAccessor="start"
                      endAccessor="end"
                      culture="kk"
                      views={["month", "week", "day", "agenda"]}
                      formats={{
                        timeGutterFormat: "HH:mm",
                        monthHeaderFormat: "MMMM yyyy", // Формат заголовка месяца
                        dayFormat: "EEEE", // Полные названия дней недели
                        weekdayFormat: "EEEE",
                        agendaDateFormat: "d MMMM yyyy",
                      }}
                      messages={{
                        today: "Бүгін",
                        previous: "Алдыңғы",
                        next: "Келесі",
                        month: "Ай",
                        week: "Апта",
                        day: "Күн",
                        agenda: "Кесте",
                        date: "Күні",
                        time: "Уақыты",
                        event: "Іс-шара",
                        noEventsInRange: "Іс-шаралар жоқ",
                        showMore: (total) => `+ тағы ${total}`,
                      }}
                      eventPropGetter={(event) => {
                        return {
                          style: {
                            backgroundColor: event.color,
                            color: "white",
                            borderRadius: "5px",
                            padding: "5px",
                          },
                        };
                      }}
                      defaultView="month"
                      style={{ height: "60vh" }}
                      selectable
                      onSelectEvent={handleSelectEvent}
                      onNavigate={handleNavigate}
                    />
                    <br />
                    <span style={{ backgroundColor: '#D3D3D3', padding: '6px', borderRadius: '28px', paddingLeft: '18px', paddingRight: '18px', marginTop: '10px', marginRight: '10px' }}>Әлі өтілмеген</span>
                    <span style={{ backgroundColor: '#FFA500', color: 'white',  padding: '6px', paddingLeft: '18px', paddingRight: '18px', borderRadius: '28px',  marginTop: '10px', marginRight: '10px'  }}>Жауаптар тексерілуде</span>
                    <span style={{ backgroundColor: '#28a745', color: 'white',  padding: '6px', paddingLeft: '18px', paddingRight: '18px', borderRadius: '28px',  marginTop: '10px', marginRight: '10px'  }}>Толықтай біткен</span>
                    </>
                    
                  )}
                </Tab>
              </Tabs>
            </Col>
          </Row>
        </Tab.Container>
      </Container>
    </Container>
  );
};

export default Profile;
