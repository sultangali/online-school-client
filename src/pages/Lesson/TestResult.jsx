// src/pages/TestResult.jsx
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Row, Col } from 'react-bootstrap'

import { fetchLessons } from '../../redux/slices/lesson';
import { toast } from 'react-toastify';

export const TestResult = () => {
  const { lessonId } = useParams();
  const dispatch = useDispatch();

  const { lessons, status, error } = useSelector(state => state.lessons);
  const { user } = useSelector(state => state); // Предполагается, что auth слайс содержит объект user

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchLessons())
        .unwrap()
        .catch(err => {
          toast.error(`Cабақтарды көшіру кезіндегі қате: ${err}`);
        });
    }
  }, [status, dispatch]);

  const lesson = lessons.find(l => l._id === lessonId);
  // Исправленное сравнение:
  const testResult = lesson?.testResults.find(tr => tr.student.$oid === user._id);

  if (status === 'loading') {
    return <Container> <Row style={{ height: '90vh'}}><Col md={12}>
      </Col> <h4 className='text-center'>Сабақтар мәліметі көшірілуде...</h4></Row> </Container>;
  }

  if (status === 'failed') {
    return  <Container> <Row style={{ height: '90vh'}}><Col md={12}>
      </Col> <h4 className='text-center'>Қате: {error}</h4></Row> </Container> ;
  }

  if (!lesson) {
    return <Container> <Row style={{ height: '90vh'}}><Col md={12}>
      </Col> <h4 className='text-center'>Сабақ табылмады.</h4></Row> </Container>;
  }

  if (!testResult) {
    return <Container> <Row style={{ height: '90vh'}}><Col md={12}>
      </Col> <h4 className='text-center'>Сіз бұл тест сынағынан әлі өткен жоқсыз немесе нәтижелер қолжетімді емес.</h4></Row> </Container>;
  }

  const switchSet = (answer) => {
    switch (answer) {
      case 'A':
        return 0;
      case 'B':
        return 1;
      case 'C':
        return 2;
      case 'D':
        return 3;
      default:
        return 0;
    }
  }

  return (
    <Container>
      <Row>
        <Col md={12}>
          <div className="test-result">
            <br />
            <h2 style={{ fontWeight: '700' }}>{lesson.title}</h2>
            <h4>Сабақтың тест нәтижелері</h4>
            <p><strong>Сіздің бағаңыз:</strong> {testResult.totalScore} / {lesson.tests.length * 10}</p>
            <ul>
              {testResult.answers.map((ans, index) => {
                const testQuestion = lesson.tests.find(test => test._id === ans.question.toString());
                const ABCD = ["A", "B", "C", "D"]
                let options = []

                testQuestion.options.map((tq, ind) => {
                  options.push({ abcd: ABCD[ind], text: tq  })
                })
                return (
                  <li key={index} >
                    <strong>Сұрақ {index + 1}:</strong> {testQuestion?.question || 'Вопрос не найден'}
                    <br />
                    <span className={ans.isCorrect ? 'text-success' : 'text-danger'}><strong>Сіздің жауабыңыз:</strong> 
                    {options.map( op => op.text == ans.selectedAnswer && ( <span> {op.abcd}) {op.text}</span>   )  ) } {ans.isCorrect ? '✅' : '❌'}</span>
                    <br />
                    <span><strong>Дұрыс жауабы:</strong> {testQuestion.correctAnswer}) {testQuestion.options[switchSet(testQuestion.correctAnswer)]}</span>
                    <hr />
                  </li>
                );
              })}
            </ul>
            <button style={{
              padding: '10px 26px',
              borderRadius: '28px',
              fontWeight: '700'
            }} onClick={() => window.history.back()} className="btn btn-primary mt-3">
              Артқа қайту
            </button>
          </div>
        </Col>
      </Row>
    </Container>

  );
};
