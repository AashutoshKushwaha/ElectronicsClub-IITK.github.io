import React from 'react';
import './Articles.css';
import data from '../database/articles.json'; // Create a new JSON for articles

const ArticleCard = ({ title, description, imagePath, url }) => {
  return (
    <div className="article-card">
      <img src={require(`../database/${imagePath}`)} alt={title} />
      <h1>{title}</h1>
      <p>{description}</p>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="readBtn"
        >
          Read Article <i className="fa fa-long-arrow-right"></i>
        </a>
      ) : (
        <button className="readBtn" disabled>
          Coming Soon
        </button>
      )}
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

  // Sorted years
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
          <React.Fragment key={`${article.title}-${article.year}`}>
            <ArticleCard
              title={article.title}
              description={article.description}
              imagePath={article.imagePath}
              url={article.url}
            />
            {((index + 1) % 3 === 0) && <div style={{ flexBasis: '100%', height: '0' }}></div>}
          </React.Fragment>
        )) || <p>No articles available for {selectedYear}</p>}
      </div>
    </>
  );
}

export default Articles;
export { ArticleCard };
