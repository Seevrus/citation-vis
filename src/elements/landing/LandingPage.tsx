import { isEmpty } from 'ramda';
import { useState } from 'react';
import {
  Alert,
  Button,
  Col,
  Container,
  FormControl,
  InputGroup,
  Row,
} from 'react-bootstrap';
import { fetchCitations, selectErrorMessage } from '../../store/citations/citations';

import { useAppDispatch, useAppSelector } from '../../store/hooks';

const LandingPage = () => {
  const dispatch = useAppDispatch();

  const errorMessage = useAppSelector(selectErrorMessage);
  const [doi, setDoi] = useState<string>('10.1016/j.enconman.2018.07.088');

  const handleClick = () => {
    dispatch(fetchCitations({
      doi,
      depth: 1,
    }));
  };

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col md={6}>
          <InputGroup className="mb-3">
            <FormControl
              placeholder="DOI..."
              aria-label="DOI..."
              aria-describedby="basic-addon2"
              value={doi}
              onChange={(e) => setDoi(e.target.value)}
            />
            <Button
              variant="outline-secondary"
              onClick={handleClick}
              disabled={isEmpty(doi)}
            >
              Keresés
            </Button>
          </InputGroup>
        </Col>
      </Row>
      {!!errorMessage &&
        <Row className="justify-content-md-center">
          <Col md={6}>
            <Alert variant="danger">
              {errorMessage}
            </Alert>
          </Col>
        </Row>
      }
    </Container>
  );
};

export default LandingPage;
