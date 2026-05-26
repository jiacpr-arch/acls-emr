export interface AclsImage {
  src: string;
  alt?: string;
  caption?: string;
}

export interface AclsQA {
  q: string;
  a: string;
  images?: AclsImage[];
}

export interface AclsSection {
  heading?: string;
  body?: string;
  images?: AclsImage[];
  qa?: AclsQA[];
}

export interface AclsChapter {
  id: string;
  title: string;
  icon?: string;
  sections: AclsSection[];
}

export interface QaDeepImage {
  src: string;
  alt?: string;
  caption?: string;
}

export interface QaDeepItem {
  id: string;
  chapterId: string | null;
  question: string;
  answer: string;
  cover: QaDeepImage | null;
  infographics: QaDeepImage[];
}

export interface QaDeepData {
  page: { title: string; intro: string; coverImage: string | null };
  items: QaDeepItem[];
}
