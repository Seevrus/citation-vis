interface UniversityT {
  universityName: string;
  country: string;
  city: string;
}

export interface AuthorT {
  authorId: string;
  givenName: string;
  surName: string;
  citations: number;
  university: UniversityT[];
}

export interface AuthorWithLevelT extends AuthorT {
  level: number;
}

interface JournalT {
  title: string;
  publisher: string;
}

export interface CitationsRequestT {
  doi: string;
  depth?: number;
}

export interface CitationsResponseT {
  id: number;
  level: number;
  doi: string;
  scopusId: string;
  title: string;
  abstract: string;
  year: number;
  volume: string;
  issue: string;
  pageStart: number;
  pageEnd: number;
  citations: number;
  references: CitationsResponseT[];
  journal: JournalT;
  subjects: string[];
  authors: AuthorT[];
}

export interface CitationsErrorResponseT {
  outcome: 'failure';
  message: string;
}

export interface CitationsGraphNodeT {
  id: number;
  title: string;
  level: number;
  citations: number;
  year: number;
}

export interface CitationsGraphT {
  nodes: CitationsGraphNodeT[];
  links: {
    source: number;
    target: number;
  }[];
}

export interface SimpleArticleT {
  id: number;
  author?: string;
  subject?: string;
  title: string;
  year: number;
}

export interface SubjectBubbleT {
  nodes: {
    subject: string;
    count: number;
  }[];
}

export interface TreeMapType {
  name: string;
  citations?: number;
  children?: TreeMapType[];
}

export interface CitationsT {
  error?: string;
  response?: CitationsResponseT;
  graph?: CitationsGraphT;
  minMaxCitations?: number[];
  selectedArticleId?: number;
  treeMap?: TreeMapType;
  authorsList?: AuthorWithLevelT[];
  subjects?: SubjectBubbleT;
  articleList?: SimpleArticleT[];
}
