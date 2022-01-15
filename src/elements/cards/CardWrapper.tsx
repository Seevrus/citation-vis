import { isEmpty } from 'ramda';
import { selectArticle, selectArticleList } from '../../store/citations/citations';
import { useAppSelector } from '../../store/hooks';
import ArticleCard from './ArticleCard';
import ArticleListCard from './ArticleListCard';

const CardWrapper = () => {
  const articleList = useAppSelector(selectArticleList);
  const selectedArticle = useAppSelector(selectArticle);

  if (articleList && !isEmpty(articleList)) {
    return <ArticleListCard />;
  }

  if (selectedArticle) {
    return <ArticleCard />;
  }

  return <div></div>;
};

export default CardWrapper;
