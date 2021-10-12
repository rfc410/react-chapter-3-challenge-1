import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from "react-icons/fi";
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../../services/prismic';

import Header from '../../components/Header';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

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
  const router = useRouter()

  if (router.isFallback) {
    return <span>Carregando...</span>
  }

  const minutesToRead = Math.ceil(
    post.data.content.reduce((wordsCount, section) => {
      const wordsInHeading = section.heading.split(/\s+/).length
      const wordsInBody = section.body.reduce(
        (wordsInBodyCount, paragraph) => {
          return wordsInBodyCount + paragraph.text.split(/\s+/).length
        },
        0
      )
      return wordsCount + wordsInHeading + wordsInBody
    }, 0) / 200
  )

  return (
    <>
      <Header />
      <img
        className={styles.postImage}
        src={post.data.banner.url}
        alt="Post banner."
      />
      <div className={commonStyles.container}>
        <header className={styles.postHeader}>
          <h1>{post.data.title}</h1>
          <div className={styles.postHeaderDetails}>
            <div>
              <FiCalendar className={styles.postHeaderDetailsIcon} />
              <time>
                {format(
                  new Date(post.first_publication_date),
                  'dd LLL y',
                  { locale: ptBR }
                )}
              </time>
            </div>

            <div>
              <FiUser className={styles.postHeaderDetailsIcon} />
              <span>{post.data.author}</span>
            </div>

            <div>
              <FiClock className={styles.postHeaderDetailsIcon} />
              <span>{minutesToRead} min</span>
            </div>
          </div>
        </header>

        <section className={styles.postContent}>
          {post.data.content.map((section, index) => (
            <div key={index}>
              <h2>{section.heading}</h2>
              {section.body.map(
                (paragraph, index) => <p key={index}>{paragraph.text}</p>
              )}
            </div>
          ))}
        </section>
      </div>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts'),
    {
      pageSize: 20
    }
  );

  const paths = posts.results.map((post) => {
    return { params: { slug: post.uid } }
  })

  return {
    fallback: true,
    paths
  }
};

export const getStaticProps: GetStaticProps = async context => {
  const prismic = getPrismicClient();

  const response = await prismic.getByUID('posts', String(context.params.slug), {});

  const post = {
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url
      },
      author: response.data.author,
      content: response.data.content,
      subtitle: response.data.subtitle
    },
    uid: response.uid
  }

  return {
    props: {
      post
    },
    revalidate: 60
  }
};
