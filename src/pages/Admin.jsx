import { Container, Row, Col, Button } from 'react-bootstrap'

export const Admin = () => {

    return (<>
        <Container>
            <Row className='admin-btns'>
                <Col md={12}>
                    <h1 style={{
                        margin: '24px auto',
                    }}>
                        Мұғалімдер үшін
                    </h1>
                    <hr />
                    <p>Бұл бөлімде мұғалімдер оқушыларға сабақты және сабақ кестесін құрып жібере алады жәнеде баға қоя алады</p>
                    <br />
                </Col>
                <Col md={4}>
                    <Button className='w-100 ' onClick={() => {
                        window.location.assign('/lessons')
                    }}>
                        <h3>Барлық сабақтар</h3>
                        <hr />
                        <p style={{
                            fontSize: 'medium'
                        }}>Бұл бөлімде сіз барлық құрылған сабақтар тізімін көре аласыз</p>
                    </Button>
                </Col>
                <Col md={4}>
                    <Button className='w-100 btn btn-success' onClick={() => {
                        window.location.assign('/lessons/create')
                    }}>
                        <h3>Сабақ құру</h3>
                        <hr />
                        <p style={{
                            fontSize: 'medium'
                        }}>Бұл бөлімде сіз жаңа сабақты құрып, жүйеге енгізе аласыз</p>
                    </Button>
                </Col>
                <Col md={4}>
                    <Button className='w-100 btn btn-info' onClick={() => {
                        window.location.assign('/schedule')
                    }}>
                        <h3>Сабақ кестесі</h3>
                        <hr />
                        <p style={{
                            fontSize: 'medium'
                        }}>Бұл бөлімде сіз оқушыларға сабақ кестесін құра аласыз</p>
                    </Button>
                </Col>
            </Row>
        </Container>
    </>)
}