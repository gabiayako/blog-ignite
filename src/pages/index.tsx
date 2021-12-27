import { GetStaticProps } from 'next';
import Link from 'next/link';
import Prismic from '@prismicio/client';

import { FiCalendar, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';
import { formatDate } from '../utils';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  return (
    <div className={styles.main}>
      <Header />
      {postsPagination.results.map(
        ({
          data: { title, subtitle, author },
          uid,
          first_publication_date,
        }) => (
          <Link key={uid} href={`post/${uid}`}>
            <a>
              <h1>{title}</h1>
              <h3>{subtitle}</h3>
              <div className={styles.info}>
                <FiCalendar className={styles.icon} />
                <p>{formatDate(first_publication_date)}</p>
                <FiUser className={styles.icon} />
                <p>{author}</p>
              </div>
            </a>
          </Link>
        )
      )}
      {!!postsPagination.next_page && (
        <button type="button">Carregar mais posts</button>
      )}
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 20,
    }
  );

  const posts = postsResponse.results.map(post => ({
    uid: post?.uid,
    first_publication_date: post.first_publication_date,
    data: {
      title: post.data.title,
      subtitle: post.data.subtitle,
      author: post.data.author,
    },
  }));

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts,
      },
    },
  };
};
