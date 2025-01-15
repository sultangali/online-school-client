import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
const Main = () => {
    const navigate = useNavigate()
    return (
        <>
            <Container  >
                <Row className="text-center main-page-container d-flex row  align-items-center" >
                    <Col md={12}>
                    <h1>ONLINE-SCHOOL платформасы</h1>
                    <hr />
                    <p>Біздің платформада сіз тек теориялық біліммен ғана емес, сонымен қатар практикалық дағдылармен де танысасыз. Оқытушылар мен студенттердің өзара әрекеттесуі арқылы білім алу процесі қызықты әрі тиімді болады.
                    Біз білім алудың барлығына қолжетімді әрі тиімді болуын қалаймыз. Әрбір оқушының өз потенциалын толық жүзеге асыруына көмектесу - біздің басты мақсатымыз.
                    </p>
                    <Button  onClick={() => { navigate('/registration') }}>Тіркелуге өту</Button>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default Main;
