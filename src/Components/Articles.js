import React from 'react';
import { Link } from 'react-router-dom';
import './Articles.css';
import data from '../database/articles.json';

const ArticleCard = ({ id, title, description, imagePath }) => {
  return (
    <div className="article-card">
      <Link to={`/articles/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <img src={require(`../database/${imagePath}`)} alt={title} />
        <h1>{title}</h1>
        <p>{description}</p>
        <button className="readBtn">
          Read Article <i className="fa fa-long-arrow-right"></i>
        </button>
      </Link>
    </div>
  );
};

function Articles() {
  const [selectedYear, setSelectedYear] = React.useState('2025');
  const articlesByYear = {};

  // Group articles by year
  data.Articles.forEach((article) => {
    const year = article.year;
    if (!articlesByYear[year]) {
      articlesByYear[year] = [];
    }
    articlesByYear[year].push(article);
  });

  const sortedYears = Object.keys(articlesByYear).sort((a, b) => b.localeCompare(a));

  return (
    <>
      <h1 className="article-heading">Articles Archive</h1>
      <div className="article-tabs">
        {sortedYears.map((year) => (
          <button key={year} onClick={() => setSelectedYear(year)}>
            {year}
          </button>
        ))}
      </div>
      <div className="article-container">
        {articlesByYear[selectedYear]?.map((article, index) => (
          <React.Fragment key={article.id}>
            <ArticleCard
              id={article.id}
              title={article.title}
              description={article.description}
              imagePath={article.imagePath}
            />
            {((index + 1) % 3 === 0) && <div style={{ flexBasis: '100%', height: '0' }}></div>}
          </React.Fragment>
        )) || <p>No articles available for {selectedYear}</p>}
      </div>
    </>
  );
}

export default Articles;
