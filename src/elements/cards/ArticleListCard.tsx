import { isEmpty } from 'ramda';
import { Card, Col } from 'react-bootstrap';
import { 
  selectArticle,
  selectArticleList,
  setArticleList,
  setSelectedArticleId,
} from '../../store/citations/citations';
import { useAppDispatch, useAppSelector } from '../../store/hooks';

const ArticleListCard = () => {
  const dispatch = useAppDispatch();
  const articleList = useAppSelector(selectArticleList);
  const selectedArticle = useAppSelector(selectArticle);

  const onLinkClicked = (e, id) => {
    e.stopPropagation();
    dispatch(setArticleList(null));
    dispatch(setSelectedArticleId(id));
  };

  return (
    <Col lg={4}>
      {!selectedArticle && articleList && !isEmpty(articleList) &&
        <Card>
          <Card.Header>
            {articleList[0].author ?? articleList[0].subject}
          </Card.Header>
          <Card.Body>
            {articleList.map((article) => (
              <Card.Text key={article.id} onClick={(e) => onLinkClicked(e, article.id)}>
                {article.title}
              </Card.Text>
            ))}
          </Card.Body>
        </Card>
      }
    </Col>
  );
};

export default ArticleListCard;
