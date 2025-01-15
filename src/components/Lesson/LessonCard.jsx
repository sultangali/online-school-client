// components/LessonCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Container, Row, Col, Button, Table } from 'react-bootstrap'

export const LessonCard = ({ index, lesson, onDelete }) => {
  return (

    <tr>
      <Container fluid>
        <Row style={{
          borderTop: '1px solid gray',
          padding: '18px'
        }}>
          <Col md={6}>
            <h4>{index + 1}. {lesson.title}</h4>
          </Col>
          <Col md={6} className='text-end'>
            
              <Link style={{
                borderTopLeftRadius: '20px',
                paddingLeft: '20px',
                borderBottomLeftRadius: '20px',
                borderTopRightRadius: '0px',
                borderBottomRightRadius: '0px'
              }} to={`/lessons/${lesson._id}`} className="btn btn-secondary">Толығырақ</Link>
              {lesson.videoUrl && (
                <a style={{ borderRadius: '0px' }} href={`http://localhost:5000${lesson.videoUrl}`} target="_blank" rel="noopener noreferrer" className="btn btn-info">Бейне</a>
              )}
              {/* Отображение действий только для учителей и админов */}
              {(localStorage.getItem('role') !== 'teacher' || localStorage.getItem('role') === 'admin') && (
                <>
                  <Link style={{ borderRadius: '0px' }} to={`/lessons/${lesson._id}/edit`} className="btn btn-warning">Өзгерту</Link>
                  <button style={{
                    paddingRight: '20px',
                    borderTopRightRadius: '20px',
                    borderBottomRightRadius: '20px',
                    borderTopLeftRadius: '0px',
                    borderBottomLeftRadius: '0px'
                  }} onClick={() => onDelete(lesson._id)} className="btn btn-danger">Өшіру</button>
                </>
              )}
          </Col>
        </Row>
      </Container>
    </tr>
  );
};

LessonCard.propTypes = {
  lesson: PropTypes.object.isRequired,
  onDelete: PropTypes.func.isRequired,
};

