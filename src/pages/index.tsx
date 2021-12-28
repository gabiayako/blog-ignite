import { useState } from 'react';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import Prismic from '@prismicio/client';

import { FiCalendar, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';

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
  preview: boolean;
  postsPagination: PostPagination;
}

export default function Home({ preview, postsPagination }: HomeProps) {
  const [posts, setPosts] = useState(postsPagination.results);

  const handleButtonClick = () => {
    fetch(postsPagination.next_page)
      .then(res => res.json())
      .then(nextPagePosts => {
        setPosts(oldPosts => [...oldPosts, ...nextPagePosts.results]);
      })
      .catch(err => {
        console.log(err);
      });
  };

  return (
    <div className={styles.main}>
      <Header />
      {posts.map(
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
        <button type="button" onClick={handleButtonClick}>
          Carregar mais posts
        </button>
      )}
      {preview && (
        <aside>
          <Link href="/api/exit-preview">
            <a>Sair do modo Preview</a>
          </Link>
        </aside>
      )}
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 20,
      ref: previewData?.ref ?? null,
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
      preview,
    },
  };
};
