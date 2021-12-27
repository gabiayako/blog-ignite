import React from 'react';
import { useRouter } from 'next/router';
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';
import Image from 'next/image';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from '../../components/Header';
import { formatDate } from '../../utils';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const {
    first_publication_date,
    data: { title, banner, author, content },
  } = post;

  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <div className={styles.container}>
      <Header />
      <img className={styles.cover} src={banner.url} alt="cover" />
      <h1>{title}</h1>
      <div className={styles.info}>
        <FiCalendar className={styles.icon} />
        <p>{formatDate(first_publication_date)}</p>
        <FiUser className={styles.icon} />
        <p>{author}</p>
      </div>
      <div className={styles.content}>
        {content.map(({ heading, body }) => (
          <>
            <h2>{heading}</h2>
            <p>{body}</p>
          </>
        ))}
      </div>
    </div>
  );
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 2,
    }
  );

  const postsSlugs = posts.results.map(post => post?.uid);
  return {
    paths: postsSlugs.map(slug => ({ params: { slug: String(slug) } })),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});
  const post = {
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(c => ({
        heading: c.heading,
        body: RichText.asText(c.body),
      })),
    },
  };
  return {
    props: { post },
  };
};
