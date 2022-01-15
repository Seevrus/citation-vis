import {
  Container,
  Nav,
  Navbar,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { isDataAvailable } from '../../store/citations/citations';
import { useAppSelector } from '../../store/hooks';

const Header = () => {
  const hasData = useAppSelector(isDataAvailable);

  return (
    <Container className="mb-5">
      <Navbar collapseOnSelect bg="light" expand="lg">
        <Container>
          <Nav className="home-page-link">
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Link to="/" className="navbar-brand">
              Kezdőlap
            </Link>
          </Nav>
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {hasData && <Link to="/graph" className="nav-link">Cikkek</Link>}
              {hasData && <Link to="/bubbles" className="nav-link">Témakörök</Link>}
              {hasData && <Link to="/treemap" className="nav-link">Folyóiratok</Link>}
              {hasData && <Link to="/bar" className="nav-link">Szerzők</Link>}
            </Nav>
            <Nav>
              <Link to="/profile" className="nav-link">Visszaállítás</Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </Container>
  );
};

export default Header;
