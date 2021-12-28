import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { getPrismicClient } from '../../services/prismic';

import styles from './post.module.scss';
import Header from '../../components/Header';
import Comments from '../../components/Comments';
import { formatDate, formatDateAndHour } from '../../utils';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
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

interface NeighborPost {
  slug: string;
  title: string;
}

interface PostProps {
  post: Post;
  nextPost: NeighborPost | null;
  previousPost: NeighborPost | null;
}

const getReadingTime = (body: string): number => {
  const words = body.split(' ').length;
  return Math.ceil(words / 200);
};

export default function Post({ post, previousPost, nextPost }: PostProps) {
  const {
    first_publication_date,
    data: { title, banner, author, content },
  } = post;

  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  const readingTime = getReadingTime(
    content.map(({ body }) => RichText.asText(body)).join(' ')
  );

  const showEditText =
    post.first_publication_date !== post.last_publication_date;

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
        <FiClock className={styles.icon} />
        <p>{`${readingTime} min`}</p>
      </div>
      {showEditText && (
        <div className={styles.edited}>
          <p>{`* editado em ${formatDateAndHour(
            post.last_publication_date
          )}`}</p>
        </div>
      )}
      <div className={styles.content}>
        {content.map(({ heading, body }) => (
          <>
            <h2>{heading}</h2>
            <p>{RichText.asText(body)}</p>
          </>
        ))}
      </div>
      <div className={styles.divider} />
      <div className={styles.neighborPosts}>
        {previousPost ? (
          <Link href={previousPost.slug}>
            <div className={styles.previousPost}>
              <a>{previousPost.title}</a>
              <p>Post anterior</p>
            </div>
          </Link>
        ) : (
          <div />
        )}
        {nextPost && (
          <Link href={nextPost.slug}>
            <div className={styles.nextPost}>
              <a>{nextPost.title}</a>
              <p>Próximo post</p>
            </div>
          </Link>
        )}
      </div>
      <Comments />
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
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

  const allPostsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts'),
  ]);
  const allPosts = allPostsResponse.results.map(post => ({
    slug: post?.uid,
    title: post?.data.title,
  }));

  const response = await prismic.getByUID('posts', String(slug), {});
  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    data: {
      subtitle: response.data.subtitle,
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(c => ({
        heading: c.heading,
        body: c.body,
      })),
    },
  };

  const postIndex = allPosts.findIndex(p => p.slug === post.uid);

  const nextPost =
    postIndex + 1 < allPosts.length ? allPosts[postIndex + 1] : null;
  const previousPost = postIndex - 1 >= 0 ? allPosts[postIndex - 1] : null;

  return {
    props: {
      post,
      previousPost,
      nextPost,
    },
  };
};
