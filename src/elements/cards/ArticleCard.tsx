import { isEmpty, isNil, join, or, pipe, reject } from 'ramda';
import { useEffect, useState } from 'react';
import { Card, Col } from 'react-bootstrap';
import { selectArticle } from '../../store/citations/citations';
import { useAppSelector } from '../../store/hooks';

const ArticleCard = () => {
  const article = useAppSelector(selectArticle);
  const [authors, setAuthors] = useState('');
  const [volisspag, setVolispag] = useState('');

  useEffect(() => {
    if (!!article && !isEmpty(article)) {
      setAuthors(
        article.authors
          .map((author) => {
            return `${author.givenName || ''} ${author.surName || ''}`;
          })
          .join(', '),
      );

      const y = article.year ? `(${article.year})` : '';
      const vol = article.volume ?? '';
      const iss = article.issue ?? '';
      const pages = article.pageStart;
      const pagee = article.pageEnd;
      let pager: string;
      if (pages && pagee) {
        pager = `${pages}-${pagee}`;
      } else if (pages && !pagee) {
        pager = `${pages}`;
      } else if (!pages && pagee) {
        pager = `${pagee}`;
      } else {
        pager = '';
      }
      setVolispag(
        pipe(
          reject((e) => or(isNil(e), isEmpty(e))),
          join(', '),
        )([y, vol, iss, pager]),
      );
    }
  }, [article]);

  return (
    <Col lg={4}>
      {article && !isEmpty(article) &&
        <Card>
          <Card.Header>
            {`${article.journal.title}, ${volisspag}`}
          </Card.Header>
          <Card.Body>
            <Card.Title>{article.title}</Card.Title>
            <Card.Text>{authors}</Card.Text>
            <Card.Text>{article.abstract}</Card.Text>
            <Card.Text>Hivatkozások száma: {article.citations}</Card.Text>
            <a
              href={`https://doi.org/${article.doi}`}
              className="btn btn-primary"
              target="_blank"
              rel="noreferrer"
            >Megnyitás</a>
          </Card.Body>
        </Card>
      }
    </Col>
  );
};

export default ArticleCard;
