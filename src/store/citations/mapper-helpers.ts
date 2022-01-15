import {
  append,
  assoc,
  findIndex,
  includes,
  isEmpty,
  map,
  propEq,
  prop,
  propOr,
  uniq,
} from 'ramda';
import {
  AuthorWithLevelT,
  CitationsGraphT,
  CitationsResponseT,
  SimpleArticleT,
  SubjectBubbleT,
  TreeMapType,
} from './citationsTypes';

export const findArticle = (
  response: CitationsResponseT,
  id: number,
): CitationsResponseT | {} => {
  if (response.id == id) return assoc('references', [], response);

  for (let reference of response.references) {
    const foundArticle = findArticle(reference, id);
    if (!isEmpty(foundArticle)) return foundArticle;
  }

  return {};
};

export const findArticlesOfAuthor = (
  response: CitationsResponseT,
  authorId: string,
  articles: SimpleArticleT[] = [],
): SimpleArticleT[] => {
  const authorIndex = findIndex(propEq('authorId', authorId), response.authors);

  if (authorIndex !== -1) {
    const author = response.authors[authorIndex];
    articles.push({
      id: response.id,
      author: `${author.surName ?? ''}, ${author.givenName ?? ''}`,
      title: response.title,
      year: response.year,
    });
  }

  for (let reference of response.references) {
    articles = findArticlesOfAuthor(reference, authorId, articles);
  }

  return articles.sort((a1, a2) => a1.title.localeCompare(a2.title));
};

export const findArticlesOfSubject = (
  response: CitationsResponseT,
  subject: string,
  articles: SimpleArticleT[] = [],
): SimpleArticleT[] => {
  if (response.subjects.includes(subject)) {
    articles.push({
      id: response.id,
      subject,
      title: response.title,
      year: response.year,
    });
  }

  for (let reference of response.references) {
    articles = findArticlesOfSubject(reference, subject, articles);
  }

  return articles.sort((a1, a2) => a1.title.localeCompare(a2.title));
};

export const mapResponseToAuthorList = (
  response: CitationsResponseT,
  list: AuthorWithLevelT[] = [],
  level = 0,
): AuthorWithLevelT[] => {
  for (let author of response.authors) {
    const authorIndex = findIndex(propEq('authorId', author.authorId), list);
    if (authorIndex === -1) {
      list.push({
        ...author,
        citations: author.citations ? author.citations == 0 ? 1 : author.citations : 1,
        level,
      });
    }
  }

  for (let reference of response.references) {
    list = mapResponseToAuthorList(reference, list, level + 1);
  }

  return list;
};

export const mapResponseToCitations = (
  response: CitationsResponseT,
  minMax = [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER],
): number[] => {
  const citations = response.citations;
  if (citations < minMax[0]) minMax[0] = citations;
  if (citations > minMax[1]) minMax[1] = citations;

  for (let reference of response.references) {
    minMax = mapResponseToCitations(reference, minMax);
  }

  return minMax;
};

export const mapResponseToGraph = (response: CitationsResponseT, source = -1): CitationsGraphT => {
  let nodes: CitationsGraphT['nodes'] = [
    {
      id: response.id,
      title: response.title,
      level: response.level,
      citations: response.citations,
      year: response.year,
    },
  ];

  let links: CitationsGraphT['links'] = [];
  if (source != -1) {
    links.push(
      {
        source,
        target: response.id,
      },
    );
  }

  for (let reference of response.references) {
    const newElements = mapResponseToGraph(reference, response.id);
    nodes = nodes.concat(newElements.nodes);
    links = links.concat(newElements.links);
  }

  return {
    nodes: uniq(nodes),
    links: uniq(links),
  };
};

export const mapResponseToSubjects = (
  response: CitationsResponseT,
  subjects: SubjectBubbleT = {
    nodes: [],
  },
): SubjectBubbleT => {
  let { nodes } = subjects;
  const articleSubjects = response.subjects;

  for (let subject of articleSubjects) {
    const subjectIndex = nodes.findIndex((node) => node.subject === subject);
    if (subjectIndex === -1) {
      nodes.push({
        subject,
        count: 1,
      });
    } else {
      nodes = nodes.map(
        (node) => node.subject === subject 
          ? ({ ...node, count: node.count + 1 })
          : node,
      );
    }
  }

  let newSubjects = {
    nodes: nodes.sort((n1, n2) => n2.count - n1.count),
  };

  for (let reference of response.references) {
    newSubjects = mapResponseToSubjects(reference, newSubjects);
  }

  return newSubjects;
};

export const mapResponseToTreeMap = (
  response: CitationsResponseT,
  journalsTreeMap: TreeMapType = {
    name: 'Journals',
  },
) => {
  const journalTitles = map(prop('name'), propOr([], 'children', journalsTreeMap));
  const journalTitle = response.journal.title;

  const newArticleChild = {
    id: response.id,
    name: response.title,
    citations: response.citations,
  };
  
  let extendedJournalsChildren: TreeMapType[];
  if (includes(journalTitle, journalTitles)) {
    extendedJournalsChildren = map((journalMap: TreeMapType) => {
      if (journalMap.name === journalTitle) {
        return {
          name: journalMap.name,
          children: journalMap.children
            ? [...journalMap.children, newArticleChild]
            : [newArticleChild],
        };
      }

      return journalMap;
    }, journalsTreeMap.children);
  } else {
    const newJournalElement = {
      name: journalTitle,
      children: [newArticleChild],
    };

    extendedJournalsChildren = append(newJournalElement, journalsTreeMap.children);
  }

  let extendedJournalsTreeMap = {
    ...journalsTreeMap,
    children: extendedJournalsChildren,
  };

  for (let reference of response.references) {
    extendedJournalsTreeMap = mapResponseToTreeMap(reference, extendedJournalsTreeMap);
  }

  return extendedJournalsTreeMap;
};
