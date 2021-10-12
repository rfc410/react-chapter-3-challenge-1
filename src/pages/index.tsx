import { useEffect, useState } from 'react';
import { GetStaticProps } from 'next';
import Link from 'next/link'

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { FiCalendar, FiUser } from "react-icons/fi";

const Prismic = require('@prismicio/client')

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';

import styles from './home.module.scss';

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
  const [posts, setPosts] = useState<PostPagination>({ next_page: null, results: [] })

  useEffect(() => {
    setPosts(postsPagination)
  }, [postsPagination])

  return (
    <main className={styles.contentContainer}>
      <img src="/logo.svg" alt="logo" />
      <div className={styles.posts}>
        {posts.results.map((post) => (
          <Link href={`/post/${post.uid}`} key={post.uid}>
            <a>
              <strong>{post.data.title}</strong>
              <p>{post.data.subtitle}</p>
              <div className={styles.postFooter}>
                <div>
                  <FiCalendar className={styles.postFooterIcon} />
                  <time>
                    {format(
                      new Date(post.first_publication_date),
                      'dd LLL y',
                      { locale: ptBR }
                    )}
                  </time>
                </div>
                <div>
                  <FiUser className={styles.postFooterIcon} />
                  <span>{post.data.author}</span>
                </div>
              </div>
            </a>
          </Link>
        ))}
      </div>

      {posts.next_page &&(
        <button
          className={styles.btnLoadMore}
          type="button"
          onClick={() => {
            fetch(posts.next_page)
              .then(response => response.json())
              .then(({ next_page, results }) => {
                setPosts({
                  next_page,
                  results: results.map((post) => {
                    return {
                      uid: post.uid,
                      first_publication_date: post.first_publication_date,
                      data: {
                        author: post.data.author,
                        subtitle: post.data.subtitle,
                        title: post.data.title
                      }
                    }
                  })
                })
              })
          }}
        >
          Carregar mais posts
        </button>
      )}
    </main>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts'),
    {
      pageSize: 20
    }
  );

  const { next_page, results } = postsResponse
  
  const posts = results.map((post) => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        author: post.data.author,
        subtitle: post.data.subtitle,
        title: post.data.title
      }
    }
  })

  return {
    props: {
      postsPagination: {
        next_page,
        results: posts
      }
    },
    revalidate: 60
  }
};
