import React from "react";
import { Container, Navbar, Nav, Button } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { selectIsAuth, logout, fetchAuthMe } from "../redux/slices/user.js"

const Header = () => {

  const isAuth = useSelector(selectIsAuth);

  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(fetchAuthMe())
  }, [dispatch])

  const userData = useSelector((state) => state.user.data);

  const onClickLogout = () => {
    dispatch(logout());
    window.localStorage.removeItem("token");
    window.location.assign('/')
  };

  return (
    <>
      <Navbar collapseOnSelect expand="lg" className="header" >
        <Container>
          <Link to={"/"} style={{ textDecoration: 'none' }}>
            <Navbar.Brand className="brand-text" style={{ fontSize: '32px', fontWeight: '900', }}>
              ONLINE SCHOOL
            </Navbar.Brand>
          </Link>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto ">
              {userData?.role === 'teacher' && <Link to="/admin" className="navigation-link">Мұғалімдер үшін</Link>}
              
            </Nav>
            <Nav>
              {isAuth ? (
                <>
                  {userData  ?
                    (<Link className="navigation-link" to="/profile"><Button variant="" className="login-btn" style={{ color: 'white' }}> Қош келдіңіз,&nbsp;
                      {userData && userData.username && userData.username}</Button>
                    </Link>) : ''}
                  <Link
                    className="navigation-link"
                    eventKey={2}
                    onClick={() => onClickLogout()}>
                    <Button className="register-btn">Шығу</Button>
                  </Link>
                </>
              ) : (
                <><Link className="navigation-link" to="/login">
                  <Button variant="" className="login-btn" style={{ color: 'white' }}>Кіру</Button>
                </Link>
                  <Link className="navigation-link" to="/registration">
                    <Button className="register-btn">Тіркелу</Button>
                  </Link> </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};

export default Header;
